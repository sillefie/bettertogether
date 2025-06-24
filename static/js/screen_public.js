const socket = new WebSocket(`ws://${location.host}/ws/public`);

const questionText = document.getElementById("question-text");
const timerEl = document.getElementById("timer");
const voteFeedback = document.getElementById("vote-feedback");
const nameInput = document.getElementById("name-input");
const startButton = document.getElementById("start-button");
const voteButtons = document.getElementById("vote-buttons");
const stefanieBtn = document.getElementById("vote-stefanie");
const mathieuBtn = document.getElementById("vote-mathieu");

let name = "";
let currentScreen = "";

function showTimer(seconds) {
  let remaining = seconds;
  timerEl.textContent = `${remaining}s`;
  timerEl.style.display = "block";
  const interval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(interval);
      timerEl.style.display = "none";
    } else {
      timerEl.textContent = `${remaining}s`;
    }
  }, 1000);
}

socket.addEventListener("open", () => {
  console.log("Verbonden met server");
});

socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "screen") {
    currentScreen = msg.screen;
    updateScreen(msg.screen);
  }

  if (msg.type === "question") {
    questionText.textContent = msg.text;
    voteFeedback.textContent = "";
    voteButtons.style.display = "flex";
    showTimer(12);
  }

  if (msg.type === "match_result") {
    voteButtons.style.display = "none";
    questionText.textContent = msg.name;
    if (msg.correct) {
      voteFeedback.textContent = "Yes! Je voelt dit koppel perfect aan.";
    } else {
      voteFeedback.textContent = "Oeps, Stefanie en Mathieu denken er precies anders over.";
    }
  }

  if (msg.type === "mismatch_warning") {
    voteButtons.style.display = "none";
    voteFeedback.textContent = "Oh nee … Stefanie & Mathieu hebben niet hetzelfde geantwoord … dan gebeuren er rare dingen, kijk maar mee op het grote scherm";
  }
});

function updateScreen(screen) {
  if (["start", "intro", "rules", "qr"].includes(screen)) {
    voteFeedback.textContent = "";
    voteButtons.style.display = "none";
    questionText.textContent = "Welkom! We starten zo meteen.";
  }
}

startButton.addEventListener("click", () => {
  const val = nameInput.value.trim();
  if (val !== "") {
    name = val;
    nameInput.style.display = "none";
    startButton.style.display = "none";
    socket.send(JSON.stringify({ type: "register", name }));
  }
});

stefanieBtn.addEventListener("click", () => {
  if (name !== "") {
    socket.send(JSON.stringify({ vote: "Stefanie" }));
    voteButtons.style.display = "none";
    voteFeedback.textContent = "Wachten op de resultaten...";
  }
});

mathieuBtn.addEventListener("click", () => {
  if (name !== "") {
    socket.send(JSON.stringify({ vote: "Mathieu" }));
    voteButtons.style.display = "none";
    voteFeedback.textContent = "Wachten op de resultaten...";
  }
});