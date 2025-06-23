from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

state = {
    "current_screen": "start",
    "votes": {},
    "result": {},
    "couple_result": {},
    "names": ["Stefanie", "Mathieu"]
}

@app.get("/admin")
async def admin():
    return HTMLResponse(open("static/screen_admin.html").read())

@app.get("/public")
async def public():
    return HTMLResponse(open("static/screen_public.html").read())

@app.get("/display")
async def display():
    return HTMLResponse(open("static/screen_display.html").read())

@app.get("/state")
async def get_state():
    return JSONResponse(state)

@app.post("/command")
async def post_command(request: Request):
    try:
        data = await request.json()
        cmd = data.get("cmd")

        if cmd == "set_screen":
            state["current_screen"] = data.get("screen", "start")
        elif cmd == "reset_votes":
            state["votes"] = {}
        elif cmd == "reset_result":
            state["result"] = {}
        elif cmd == "reset_all":
            state["votes"] = {}
            state["result"] = {}
            state["couple_result"] = {}
            state["current_screen"] = "start"
        elif cmd == "set_result":
            state["result"] = data.get("result", {})
        elif cmd == "set_couple_result":
            state["couple_result"] = data.get("couple_result", {})
        elif cmd == "vote":
            player = data.get("player")
            answer = data.get("answer")
            if player:
                state["votes"][player] = answer
        else:
            return JSONResponse({"error": "Unknown command"}, status_code=400)

        return JSONResponse({"status": "ok"})

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
