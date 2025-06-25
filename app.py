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
    save_state(state)

public_clients = {}
admin_clients = []

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
    try:
        while True:
            data = await ws.receive_json()
            cmd = data.get("command")
            if cmd == "set_screen":
                state["screen"] = data["screen"]
                save_state(state)
                await broadcast(public_clients.values(), {"type": "screen", "screen": state["screen"]})
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
                await broadcast(public_clients.values(), {"type": "feedback", "result": "correct"})
            elif cmd in ["same_answer_stefanie", "same_answer_mathieu"]:
                winning_name = "Stefanie" if cmd == "same_answer_stefanie" else "Mathieu"
                votes = state["votes"]
                votes_stefanie = sum(1 for v in votes.values() if v == "Stefanie")
                votes_mathieu = sum(1 for v in votes.values() if v == "Mathieu")
                total_votes = len(votes)
                # Bereken hoe hard publiek verschilt
                diff_votes = abs(votes_stefanie - votes_mathieu)
                diff_percentage = (diff_votes / total_votes) * 100 if total_votes > 0 else 0
                # Werd er door meerderheid van publiek hetzelfde gestemd als koppel?
                publiek_zelfde = (
                    (votes_stefanie > votes_mathieu and winning_name == "Stefanie") or
                    (votes_mathieu > votes_stefanie and winning_name == "Mathieu")
                )
                await broadcast(public_clients.values(),{
                    "type": "feedback",
                    "result": "same",
                    "winning_name": winning_name,
                    "votes_stefanie": votes_stefanie,
                    "votes_mathieu": votes_mathieu,
                    "votes_total": total_votes,
                    "diff_public_vs_couple": diff_percentage,
                    "public_agreement": publiek_zelfde,
                    "votes": votes,
                })
            elif cmd == "different_answer":
                available = [f"img/ai{i}.jpg" for i in range(1, 6) if f"img/ai{i}.jpg" not in state["used_ai"]]
                if not available:
                    available = [f"img/ai{i}.jpg" for i in range(1, 6)]
                    state["used_ai"] = []
                chosen = random.choice(available)
                state["used_ai"].append(chosen)
                save_state(state)
                await broadcast(public_clients.values(), {"type": "feedback", "result": "wrong", "image": chosen})
            elif cmd == "show_photo":
                # stuur een show_photo-event naar alle schermen
                await broadcast(display_clients.values(), {
                    "type": "show_photo",
                    "image": state["last_ai"]
                })

            elif cmd == "repeat_photo":
                # herhaal dezelfde foto
                await broadcast(display_clients.values(), {
                    "type": "show_photo",
                    "image": state["last_ai"]
                })
            elif cmd == "end_quiz":
                counts = {}
                for name in state["votes"]:
                    vote = state["votes"][name]
                    counts[vote] = counts.get(vote, 0) + 1
                top10 = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:10]
                await broadcast(public_clients.values(), {"type": "scoreboard", "ranking": top10})
    except WebSocketDisconnect:
        admin_clients.remove(ws)