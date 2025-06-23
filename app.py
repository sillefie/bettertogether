from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

STATE_FILE = "state.json"

def load_state():
    if not os.path.exists(STATE_FILE):
        with open(STATE_FILE, "w") as f:
            json.dump({
                "current_screen": "start",
                "question_index": 0,
                "results": [],
                "votes": [],
                "names": {},
            }, f)
    with open(STATE_FILE, "r") as f:
        return json.load(f)

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)

@app.get("/", response_class=HTMLResponse)
async def get_root():
    return FileResponse("static/public.html")

@app.get("/display", response_class=HTMLResponse)
async def get_display():
    return FileResponse("static/display.html")

@app.get("/admin", response_class=HTMLResponse)
async def get_admin():
    return FileResponse("static/admin.html")

@app.get("/state")
async def get_state():
    return load_state()

class NameData(BaseModel):
    id: str
    name: str

@app.post("/name")
async def post_name(data: NameData):
    state = load_state()
    state["names"][data.id] = data.name
    save_state(state)
    return {"status": "ok"}

class VoteData(BaseModel):
    id: str
    vote: str

@app.post("/vote")
async def post_vote(data: VoteData):
    state = load_state()
    existing_vote = next((v for v in state["votes"] if v["id"] == data.id and v["question"] == state["question_index"]), None)
    if not existing_vote:
        state["votes"].append({
            "id": data.id,
            "vote": data.vote,
            "question": state["question_index"]
        })
    save_state(state)
    return {"status": "ok"}

class AdminCommand(BaseModel):
    cmd: str
    value: str = ""

@app.post("/admin")
async def post_admin(data: AdminCommand):
    state = load_state()

    if data.cmd == "set_screen":
        state["current_screen"] = data.value
    elif data.cmd == "next_question":
        state["question_index"] += 1
    elif data.cmd == "record_result":
        state["results"].append(data.value)
    elif data.cmd == "reset":
        state = {
            "current_screen": "start",
            "question_index": 0,
            "results": [],
            "votes": [],
            "names": {},
        }
    save_state(state)
    return {"status": "ok"}
