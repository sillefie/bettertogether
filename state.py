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



def add_vote(player_name, choice):
    state = load_state()
    if player_name not in state["players"]:
        return False  # speler moet eerst geregistreerd zijn
    state["votes"][player_name] = choice
    save_state(state)
    return True

def get_vote_summary():
    state = load_state()
    votes = state["votes"].values()
    tally = {"Stefanie": 0, "Mathieu": 0}
    for vote in votes:
        if vote in tally:
            tally[vote] += 1
    difference = abs(tally["Stefanie"] - tally["Mathieu"])
    if tally["Stefanie"] > tally["Mathieu"]:
        majority = "Stefanie"
    elif tally["Mathieu"] > tally["Stefanie"]:
        majority = "Mathieu"
    else:
        majority = "equal"
    return {
        "tally": tally,
        "difference": difference,
        "majority": majority
    }

def reset_votes():
    state = load_state()
    state["votes"] = {}
    save_state(state)



import random

def get_next_ai_image():
    state = load_state()
    all_images = ["ai1.jpg", "ai2.jpg", "ai3.jpg", "ai4.jpg", "ai5.jpg"]
    unused = [img for img in all_images if img not in state["used_ai"]]
    if not unused:
        return None  # alles gebruikt
    next_img = random.choice(unused)
    state["used_ai"].append(next_img)
    save_state(state)
    return next_img

def reset_ai_images():
    state = load_state()
    state["used_ai"] = []
    save_state(state)
