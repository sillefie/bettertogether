from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import random
import uuid
from state import load_state, save_state

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

questions = [
    "Wie heeft de gekste familie?",
    "Wie zou er het best voor een zwijn kunnen zorgen?",
    "Wie heeft er als eerste ‘ik zie je graag’ gezegd?",
    "Wie geeft er het meeste geld uit?",
    "Wie is de meeste creatieve?",
    "Wie zou het snelst uit zijn comfort zone gaan om de ander te verrassen?",
    "Wie heeft als eerste voorgesteld om seks te hebben op een openbare plaats?",
    "Van wie hebben de kinderen de meeste eigenschappen?",
    "Wie heeft de ander verleid?",
    "Wie doet er het meest aan ‘dirty talk’ in de slaapkamer?",
    "Wie van de twee lijkt het meest op zijn/haar respectievelijke vader/moeder?",
    "Wie doet de ander het meeste lachen?"
]

state = load_state()

def reset_votes():
    state["votes"] = {}
    state["players"] = {}
    save_state(state)

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
    await ws.send_json({"type": "screen", "screen": state["screen"]})
    try:
        while True:
            data = await ws.receive_json()
            if data.get("type") == "register":
                name = data["name"].strip()
                if name:
                    state["players"][uid] = name
                    save_state(state)
            elif data.get("vote"):
                vote = data["vote"]
                name = state["players"].get(uid, f"anon{len(state['players'])}")
                if name not in state["votes"]:
                    state["votes"][name] = vote
                    save_state(state)
                    await broadcast(admin_clients, {"type": "votes", "votes": state["votes"]})
    except WebSocketDisconnect:
        public_clients.pop(uid, None)
        state["players"].pop(uid, None)
        save_state(state)

@app.websocket("/ws/admin")
async def websocket_admin(ws: WebSocket):
    await ws.accept()
    admin_clients.append(ws)
    await ws.send_json({"type": "screen", "screen": state["screen"]})
    await ws.send_json({"type": "questions", "questions": questions})
    try:
        while True:
            data = await ws.receive_json()
            cmd = data.get("command")
            if cmd == "set_screen":
                state["screen"] = data["screen"]
                save_state(state)
                await broadcast(public_clients.values(), {"type": "screen", "screen": state["screen"]})
                await broadcast(display_clients, {"type": "screen", "screen": state["screen"]})
            elif cmd == "set_question":
                idx = int(data["idx"])
                if 0 <= idx < len(questions):
                    state["question_idx"] = idx
                    reset_votes()
                    save_state(state)
                    await broadcast(public_clients.values(), {
                        "type": "question",
                        "idx": idx,
                        "text": questions[idx]
                    })
                    await broadcast(admin_clients, {"type": "votes", "votes": state["votes"]})
            elif cmd == "same_answer":
                result = data.get("result")
                correct_name = data.get("name")
                for uid, client_ws in public_clients.items():
                    player_name = state["players"].get(uid, "")
                    voted = state["votes"].get(player_name)
                    is_correct = (voted == correct_name)
                    msg = {
                        "type": "match_result",
                        "name": correct_name,
                        "correct": is_correct
                    }
                    await client_ws.send_json(msg)
            elif cmd == "different_answer":
                await broadcast(public_clients.values(), {
                    "type": "mismatch_warning"
                })
            elif cmd == "feedback":
                await broadcast(display_clients, data["payload"])
    except WebSocketDisconnect:
        if ws in admin_clients:
            admin_clients.remove(ws)

@app.websocket("/ws/display")
async def websocket_display(ws: WebSocket):
    await ws.accept()
    display_clients.append(ws)
    await ws.send_json({"type": "screen", "screen": state["screen"]})
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        if ws in display_clients:
            display_clients.remove(ws)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)


@app.websocket("/ws/admin")
async def websocket_admin(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            if data.get("command") == "get_questions":
                await websocket.send_text(json.dumps({
                    "type": "questions",
                    "questions": [
                        "Wie is het vaakst te laat?",
                        "Wie kookt er beter?",
                        "Wie kan er beter met geld om?",
                        "Wie heeft de grootste schoenenverzameling?"
                    ]
                }))
    except WebSocketDisconnect:
        pass


ai_images = ["ai1.jpg", "ai2.jpg", "ai3.jpg", "ai4.jpg", "ai5.jpg"]
used_ai = []

current_votes = []
current_question = ""

@app.websocket("/ws/admin")
async def websocket_admin(websocket: WebSocket):
    await websocket.accept()
    try:
        global current_votes, current_question, used_ai
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)

            if data.get("command") == "get_questions":
                await websocket.send_text(json.dumps({
                    "type": "questions",
                    "questions": [
                        "Wie is het vaakst te laat?",
                        "Wie kookt er beter?",
                        "Wie kan er beter met geld om?",
                        "Wie heeft de grootste schoenenverzameling?"
                    ]
                }))

            elif data.get("command") == "start_question":
                current_question = data.get("question", "")
                current_votes = []
                await websocket.send_text(json.dumps({
                    "type": "screen",
                    "screen": "question",
                    "question": current_question
                }))

            elif data.get("command") == "vote":
                name = data.get("name")
                vote = data.get("vote")
                if name and vote:
                    current_votes.append({"name": name, "vote": vote})
                    await websocket.send_text(json.dumps({
                        "type": "votes",
                        "votes": current_votes
                    }))

            elif data.get("command") == "match":
                await websocket.send_text(json.dumps({
                    "type": "match",
                    "result": "same"
                }))

            elif data.get("command") == "no_match":
                if len(used_ai) == len(ai_images):
                    await websocket.send_text(json.dumps({
                        "type": "ai_done"
                    }))
                else:
                    for img in ai_images:
                        if img not in used_ai:
                            used_ai.append(img)
                            await websocket.send_text(json.dumps({
                                "type": "ai_image",
                                "image": img
                            }))
                            break
    except WebSocketDisconnect:
        pass
