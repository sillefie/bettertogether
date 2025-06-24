const socket = new WebSocket(`ws://${location.host}/ws/display`);

const screenContainer = document.getElementById("screen-container");
const questionEl = document.getElementById("question-text");
const feedbackEl = document.getElementById("feedback");
const barStefanie = document.getElementById("bar-stefanie");
const barMathieu = document.getElementById("bar-mathieu");
const winnerEl = document.getElementById("winner-name");
const aiImage = document.getElementById("ai-image");
const aiImageContainer = document.getElementById("ai-image-container");

function resetDisplay() {
  questionEl.textContent = "";
  feedbackEl.textContent = "";
  winnerEl.textContent = "";
  barStefanie.style.width = "0%";
  barMathieu.style.width = "0%";
  aiImageContainer.style.display = "none";
  aiImage.src = "";
}

function showBars(stefCount, mathCount) {
  const total = stefCount + mathCount;
  const stefPct = total ? (stefCount / total) * 100 : 0;
  const mathPct = total ? (mathCount / total) * 100 : 0;
  barStefanie.style.width = `${stefPct}%`;
  barMathieu.style.width = `${mathPct}%`;
}

socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "screen") {
    resetDisplay();
  }

  if (msg.type === "question") {
    resetDisplay();
    questionEl.textContent = msg.text;
  }

  if (msg.type === "match_result") {
    resetDisplay();
    winnerEl.textContent = msg.name;
    feedbackEl.style.backgroundColor = "#c3eecb";
    feedbackEl.textContent = `Wauw! ${msg.name} en ${msg.name === "Stefanie" ? "Mathieu" : "Stefanie"} denken er net hetzelfde over`;
  }

  if (msg.type === "mismatch_warning") {
    resetDisplay();
    feedbackEl.style.backgroundColor = "#f3c6c6";
    feedbackEl.textContent = "Oh nee … Stefanie & Mathieu hebben niet hetzelfde geantwoord … dat kunnen we niet zo laten … ";
  }

  if (msg.type === "ai_image") {
    aiImage.src = msg.image;
    aiImageContainer.style.display = "block";
    setTimeout(() => {
      aiImageContainer.style.display = "none";
      feedbackEl.style.backgroundColor = "#f3c6c6";
      feedbackEl.textContent = "Oh oow, heb je dat gezien?";
    }, 3000);
  }

  if (msg.type === "ai_image_repeat") {
    aiImageContainer.style.display = "block";
    setTimeout(() => {
      aiImageContainer.style.display = "none";
      feedbackEl.style.backgroundColor = "#f3c6c6";
      feedbackEl.textContent = "Oh oow, heb je dat gezien?";
    }, 3000);
  }

  if (msg.type === "ai_image_none") {
    resetDisplay();
    feedbackEl.style.backgroundColor = "#f3c6c6";
    feedbackEl.textContent = "Oh nee … Stefanie & Mathieu hebben niet hetzelfde geantwoord … maar … chanceke, we hebben niks anders meer uitgestoken ??.";
  }

  if (msg.type === "audience_result") {
    resetDisplay();
    winnerEl.textContent = msg.winner;
    showBars(msg.stefanie, msg.mathieu);

    const sameVote = msg.same_vote;
    const diff = Math.abs(msg.stefanie - msg.mathieu);

    if (sameVote) {
      if (diff > 20) {
        feedbackEl.textContent = "Amaai, iedereen hier kent jullie door en door.";
      } else {
        feedbackEl.textContent = "Jullie vrienden denken er min of meer hetzelfde over dan jullie, maar toch niet helemaal eeeh ;)";
      }
    } else {
      if (diff > 20) {
        feedbackEl.textContent = "Eeeeeuhm, iedereen hier denkt er precies wel anders over ?";
      } else {
        feedbackEl.textContent = "Jullie vrienden denken er min of meer hetzelfde over dan jullie, maar toch niet helemaal eeeh ;)";
      }
    }
  }
});