from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import uuid
from state import state, reset_votes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.mount("/audio", StaticFiles(directory="static/audio"), name="audio")
app.mount("/css", StaticFiles(directory="static/css"), name="css")
app.mount("/img", StaticFiles(directory="static/img"), name="img")
app.mount("/js", StaticFiles(directory="static/js"), name="js")

@app.get("/")
async def get_public():
    return FileResponse("static/screen_public.html")

@app.get("/admin")
async def get_admin():
    return FileResponse("static/screen_admin.html")

@app.get("/display")
async def get_display():
    return FileResponse("static/screen_display.html")

public_clients = {}
admin_clients = []
display_clients = []

async def broadcast(targets, message):
    for ws in targets:
        try:
            await ws.send_json(message)
        except:
            pass

@app.websocket("/ws/public")
async def websocket_public(ws: WebSocket):
    await ws.accept()
    uid = str(uuid.uuid4())
    public_clients[uid] = ws
    await ws.send_json({"type": "screen", "screen": state.get("screen", "start")})
    try:
        while True:
            data = await ws.receive_json()
            if data.get("type") == "register":
                name = data["name"].strip()
                if name:
                    state["players"][uid] = name
            elif data.get("vote"):
                vote = data["vote"]
                name = state["players"].get(uid, f"anon{len(state['players'])}")
                if name not in state["votes"]:
                    state["votes"][name] = vote
                    await broadcast(admin_clients, {"type": "votes", "votes": state["votes"]})
    except WebSocketDisconnect:
        public_clients.pop(uid, None)
        state["players"].pop(uid, None)

@app.websocket("/ws/admin")
async def websocket_admin(ws: WebSocket):
    await ws.accept()
    admin_clients.append(ws)
    await ws.send_json({"type": "screen", "screen": state.get("screen", "start")})
    try:
        while True:
            data = await ws.receive_json()
            cmd = data.get("command")
            if cmd == "set_screen":
                state["screen"] = data["screen"]
                await broadcast(public_clients.values(), {"type": "screen", "screen": state["screen"]})
                await broadcast(display_clients, {"type": "screen", "screen": state["screen"]})
            elif cmd == "set_question":
                idx = int(data["idx"])
                if 0 <= idx < len(state["questions"]):
                    state["question_idx"] = idx
                    reset_votes()
                    await broadcast(public_clients.values(), {
                        "type": "question",
                        "idx": idx,
                        "text": state["questions"][idx]
                    })
                    await broadcast(admin_clients, {"type": "votes", "votes": state["votes"]})
            elif cmd == "same_answer":
                correct_name = data.get("name")
                for uid, ws in public_clients.items():
                    player_name = state["players"].get(uid, "")
                    voted = state["votes"].get(player_name)
                    is_correct = (voted == correct_name)
                    msg = {
                        "type": "match_result",
                        "name": correct_name,
                        "correct": is_correct
                    }
                    await ws.send_json(msg)
            elif cmd == "different_answer":
                await broadcast(public_clients.values(), {
                    "type": "mismatch_warning"
                })
            elif cmd == "feedback":
                await broadcast(display_clients, data["payload"])
    except WebSocketDisconnect:
        admin_clients.remove(ws)

@app.websocket("/ws/display")
async def websocket_display(ws: WebSocket):
    await ws.accept()
    display_clients.append(ws)
    await ws.send_json({"type": "screen", "screen": state.get("screen", "start")})
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        display_clients.remove(ws)
