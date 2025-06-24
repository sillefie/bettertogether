
const socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/public`);

const nameInput = document.getElementById("name-input");
const startButton = document.getElementById("start-button");
const welcomeText = document.getElementById("welcome-text");
const voteButtons = document.getElementById("vote-buttons");
const stefanieBtn = document.getElementById("vote-stefanie");
const mathieuBtn = document.getElementById("vote-mathieu");
const questionText = document.getElementById("question-text");
const feedbackEl = document.getElementById("vote-feedback");
const timerEl = document.getElementById("timer");

let name = "";
let currentQuestion = "";

function showTimer(seconds) {
  let remaining = seconds;
  timerEl.textContent = `${remaining}s`;
  timerEl.style.display = "block";
  const interval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(interval);
      timerEl.style.display = "none";
      voteButtons.style.display = "none";
    } else {
      timerEl.textContent = `${remaining}s`;
    }
  }, 1000);
}

startButton.addEventListener("click", () => {
  name = nameInput.value.trim();
  if (name) {
    nameInput.style.display = "none";
    startButton.style.display = "none";
    welcomeText.textContent = "Welkom! We starten zo meteen.";
  }
});

stefanieBtn.addEventListener("click", () => {
  if (!name) return;
  socket.send(JSON.stringify({ type: "vote", name: name, vote: "Stefanie" }));
  voteButtons.style.display = "none";
  feedbackEl.textContent = "Wacht op resultaten...";
});

mathieuBtn.addEventListener("click", () => {
  if (!name) return;
  socket.send(JSON.stringify({ type: "vote", name: name, vote: "Mathieu" }));
  voteButtons.style.display = "none";
  feedbackEl.textContent = "Wacht op resultaten...";
});

socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "set_screen") {
    feedbackEl.textContent = "";
    questionText.textContent = "";
    voteButtons.style.display = "none";
    timerEl.style.display = "none";
    if (msg.screen === "start" || msg.screen === "intro" || msg.screen === "rules" || msg.screen === "qr") {
      welcomeText.textContent = "Welkom! We starten zo meteen.";
      if (name) {
        nameInput.style.display = "none";
        startButton.style.display = "none";
      } else {
        nameInput.style.display = "inline-block";
        startButton.style.display = "inline-block";
      }
    }
  }

  if (msg.type === "start_question") {
    if (!name) return;
    currentQuestion = msg.question;
    questionText.textContent = currentQuestion;
    voteButtons.style.display = "block";
    feedbackEl.textContent = "";
    showTimer(12);
  }

  if (msg.type === "match_result") {
    if (!name || !msg.votes) return;
    const vote = msg.votes[name];
    const same = vote === msg.winner;
    questionText.textContent = msg.winner;
    feedbackEl.textContent = same
      ? "Yes! Je voelt dit koppel perfect aan."
      : "Oeps, Stefanie en Mathieu denken er precies anders over ;)";
  }

  if (msg.type === "audience_result") {
    if (!name || !msg.votes) return;
    const vote = msg.votes[name];
    const stef = Object.values(msg.votes).filter(v => v === "Stefanie").length;
    const math = Object.values(msg.votes).filter(v => v === "Mathieu").length;
    const same = vote && vote === (stef > math ? "Stefanie" : "Mathieu");
    questionText.textContent = stef > math ? "Stefanie" : "Mathieu";
    feedbackEl.textContent = same
      ? "Yes! Je voelt dit koppel perfect aan. 🥰"
      : "Oeps, Stefanie en Mathieu denken er precies anders over. 🤭";
  }

  if (msg.type === "mismatch") {
    feedbackEl.textContent = "Oh nee … Stefanie & Mathieu hebben niet hetzelfde geantwoord … dan gebeuren er rare dingen, kijk maar mee op het grote scherm 🙈";
  }
});
