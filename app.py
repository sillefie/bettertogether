from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.cors import CORSMiddleware
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="static")

state = {
    "current_screen": "start",
    "votes": [],
    "history": [],
    "ai_images": ["ai1.jpg", "ai2.jpg", "ai4.jpg"],
}

@app.get("/", response_class=HTMLResponse)
async def get_public(request: Request):
    return templates.TemplateResponse("screen_public.html", {"request": request})

@app.get("/admin", response_class=HTMLResponse)
async def get_admin(request: Request):
    return templates.TemplateResponse("screen_admin.html", {"request": request})

@app.get("/display", response_class=HTMLResponse)
async def get_display(request: Request):
    return templates.TemplateResponse("screen_display.html", {"request": request})

@app.post("/vote")
async def vote(answer: str = Form(...)):
    state["votes"].append(answer)
    return {"status": "ok"}

@app.get("/results")
async def results():
    stefanie = sum(1 for v in state["votes"] if v == "Stefanie")
    mathieu = sum(1 for v in state["votes"] if v == "Mathieu")
    return {"stefanie": stefanie, "mathieu": mathieu}

@app.post("/admin/cmd")
async def admin_cmd(cmd: str = Form(...)):
    if cmd == "reset_votes":
        state["votes"] = []
    elif cmd == "next_screen":
        state["current_screen"] = "intro"
    elif cmd == "to_rules":
        state["current_screen"] = "rules"
    elif cmd == "to_qr":
        state["current_screen"] = "qr"
    elif cmd.startswith("question:"):
        state["current_screen"] = cmd
        state["votes"] = []
    elif cmd == "back_to_start":
        state["current_screen"] = "start"
    elif cmd == "show_results":
        state["history"].append(state["votes"][:])
    elif cmd == "end_quiz":
        state["current_screen"] = "end"
    return {"status": "ok"}

@app.get("/admin/screen")
async def get_admin_screen():
    return {"screen": state["current_screen"]}

@app.get("/public/screen")
async def get_public_screen():
    return {"screen": state["current_screen"]}

@app.get("/public/waiting")
async def get_waiting():
    return {"status": "waiting"}

@app.get("/admin/votes")
async def get_vote_counts():
    stefanie = sum(1 for v in state["votes"] if v == "Stefanie")
    mathieu = sum(1 for v in state["votes"] if v == "Mathieu")
    return {"stefanie": stefanie, "mathieu": mathieu, "total": len(state["votes"])}

@app.get("/admin/aiimage")
async def get_ai_image():
    if not state["ai_images"]:
        return {"image": None}
    return {"image": state["ai_images"].pop(0)}
