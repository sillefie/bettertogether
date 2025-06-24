const socket = new WebSocket(`wss://${location.host}/ws/admin`);

const questionSelect = document.getElementById("question_select");
const votesList = document.getElementById("votes_list");
const screenStatus = document.getElementById("screen_status");
let currentQuestions = [];

socket.addEventListener("open", () => {
    console.log("✅ Verbonden met server");

    // Vraag meteen de vragenlijst op
    socket.send(JSON.stringify({ command: "get_questions" }));
});

socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "screen") {
        screenStatus.textContent = data.screen;
    }

    if (data.type === "votes") {
        updateVotes(data.votes);
    }

    if (data.type === "questions") {
        currentQuestions = data.questions;
        questionSelect.innerHTML = "";
        data.questions.forEach((q, idx) => {
            const option = document.createElement("option");
            option.value = idx;
            option.textContent = q;
            questionSelect.appendChild(option);
        });
    }
});


function sendCommand(command, extra = {}) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ command, ...extra }));
    } else {
        console.warn("⚠️ WebSocket niet open");
    }
}

function setScreen(screenName) {
    sendCommand("set_screen", { screen: screenName });
}

function startQuestion() {
    const idx = questionSelect.value;
    sendCommand("set_question", { idx: parseInt(idx) });
}

function sendMatchResult(name) {
    const idx = questionSelect.value;
    sendCommand("match_result", { idx: parseInt(idx), name });
}

function sendMismatch() {
    const idx = questionSelect.value;
    sendCommand("mismatch_warning", { idx: parseInt(idx) });
}

function showAudienceResult() {
    sendCommand("audience_result");
}

function showAiImage() {
    sendCommand("show_ai");
}

function repeatAiImage() {
    sendCommand("repeat_ai");
}

function hideAiImage() {
    sendCommand("hide_ai");
}

function endQuiz() {
    sendCommand("end_quiz");
}

function requestVotes() {
    sendCommand("get_votes");
}

// ---- Stemmen updaten ----

function updateVotes(votes) {
    votesList.innerHTML = "";
    for (const [name, vote] of Object.entries(votes)) {
        const li = document.createElement("li");
        li.textContent = `${name}: ${vote}`;
        votesList.appendChild(li);
    }
}

document.getElementById("match-stefanie").addEventListener("click", () => {
  socket.send(JSON.stringify({ command: "match", winner: "Stefanie" }));
});

document.getElementById("match-mathieu").addEventListener("click", () => {
  socket.send(JSON.stringify({ command: "match", winner: "Mathieu" }));
});

document.getElementById("no-match").addEventListener("click", () => {
  socket.send(JSON.stringify({ command: "no_match" }));
});
