
const socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/admin`);


// Disable all control buttons until socket is open
const controlButtons = Array.from(document.querySelectorAll("button"));
controlButtons.forEach(btn => btn.disabled = true);

const questionSelect = document.getElementById("question-select");
const votesList = document.getElementById("votes-list");

let currentQuestions = [];

socket.addEventListener("open", () => {
  console.log("Verbonden met server");
  // Enable buttons now that socket is connected
  controlButtons.forEach(btn => btn.disabled = false);

  socket.send(JSON.stringify({ type: "get_questions" }));
});

socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "questions") {
    currentQuestions = msg.questions;
    questionSelect.innerHTML = "";
    msg.questions.forEach((q, idx) => {
      const option = document.createElement("option");
      option.value = idx;
      option.textContent = q;
      questionSelect.appendChild(option);
    });
  }

  if (msg.type === "votes") {
    updateVotes(msg.votes);
  }
});

function sendIfReady(message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.warn("WebSocket not open yet.");
  }
}

function setScreen(screen) {
  sendIfReady({ type: "set_screen", screen });
}

function startQuestion() {
  const idx = questionSelect.value;
  sendIfReady({ type: "start_question", index: idx });
}

function sendMatchResult(name) {
  const idx = questionSelect.value;
  sendIfReady({ type: "match_result", index: idx, name });
}

function sendMismatch() {
  const idx = questionSelect.value;
  sendIfReady({ type: "mismatch_warning", index: idx });
}

function showAiImage() {
  sendIfReady({ type: "show_ai" });
}

function repeatAiImage() {
  sendIfReady({ type: "repeat_ai" });
}

function hideAiImage() {
  sendIfReady({ type: "hide_ai" });
}

function requestVotes() {
  sendIfReady({ type: "get_votes" });
}

function showAudienceResult() {
  sendIfReady({ type: "audience_result" });
}

function updateVotes(votes) {
  votesList.innerHTML = "";
  for (const [name, vote] of Object.entries(votes)) {
    const li = document.createElement("li");
    li.textContent = `${name}: ${vote}`;
    votesList.appendChild(li);
  }
}
