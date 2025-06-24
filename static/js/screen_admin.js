const socket = new WebSocket(`ws://${location.host}/ws/admin`);

const questionSelect = document.getElementById("question-select");
const votesList = document.getElementById("votes-list");

let currentQuestions = [];

socket.addEventListener("open", () => {
  console.log("Verbonden met server");
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

function setScreen(screen) {
  socket.send(JSON.stringify({ type: "set_screen", screen }));
  if (screen === "question") {
    requestVotes();
  }
}

function startQuestion() {
  const idx = questionSelect.value;
  socket.send(JSON.stringify({ type: "start_question", index: idx }));
}

function sendMatchResult(name) {
  const idx = questionSelect.value;
  socket.send(JSON.stringify({ type: "match_result", index: idx, name }));
}

function sendMismatch() {
  const idx = questionSelect.value;
  socket.send(JSON.stringify({ type: "mismatch_warning", index: idx }));
}

function showAiImage() {
  socket.send(JSON.stringify({ type: "show_ai" }));
}

function repeatAiImage() {
  socket.send(JSON.stringify({ type: "repeat_ai" }));
}

function hideAiImage() {
  socket.send(JSON.stringify({ type: "hide_ai" }));
}

function requestVotes() {
  socket.send(JSON.stringify({ type: "get_votes" }));
}

function updateVotes(votes) {
  votesList.innerHTML = "";
  for (const [name, vote] of Object.entries(votes)) {
    const li = document.createElement("li");
    li.textContent = `${name}: ${vote}`;
    votesList.appendChild(li);
  }
}
