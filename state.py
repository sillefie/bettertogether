import json
import os

STATE_FILE = "state.json"

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            raw = json.load(f)
            return {
                "screen": raw.get("screen", "intro"),
                "question_idx": raw.get("question_idx", -1),
                "players": raw.get("players", {}),
                "votes": raw.get("votes", {}),
                "used_ai": raw.get("used_ai", [])
            }
    else:
        return {
            "screen": "intro",
            "question_idx": -1,
            "players": {},
            "votes": {},
            "used_ai": []
        }

def save_state(state):
    data = {
        "screen": state.get("screen", "intro"),
        "question_idx": state.get("question_idx", -1),
        "players": state.get("players", {}),
        "votes": state.get("votes", {}),
        "used_ai": state.get("used_ai", [])
    }
    with open(STATE_FILE, "w") as f:
        json.dump(data, f)