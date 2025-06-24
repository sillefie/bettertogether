
const socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/display`);

const screenContainer = document.getElementById("screen-container");
const questionEl = document.getElementById("question-text");
const feedbackEl = document.getElementById("feedback");
const barStefanie = document.getElementById("bar-stefanie");
const barMathieu = document.getElementById("bar-mathieu");
const winnerEl = document.getElementById("winner-name");
const aiImage = document.getElementById("ai-image");
const aiImageContainer = document.getElementById("ai-image-container");
const audioPlayer = document.getElementById("audio-player");

function resetDisplay() {
  questionEl.textContent = "";
  feedbackEl.textContent = "";
  winnerEl.textContent = "";
  barStefanie.style.width = "0%";
  barMathieu.style.width = "0%";
  aiImageContainer.style.display = "none";
  aiImage.src = "";
  screenContainer.className = "";
}

socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "set_screen") {
    resetDisplay();
    if (msg.screen === "start") {
      screenContainer.className = "start";
    } else if (msg.screen === "intro") {
      screenContainer.className = "intro";
      audioPlayer.src = "audio/intro.mp3";
      audioPlayer.play();
    } else if (msg.screen === "rules") {
      screenContainer.className = "rules";
      audioPlayer.src = "audio/rules.mp4";
      audioPlayer.play();
    } else if (msg.screen === "qr") {
      screenContainer.className = "qr";
    }
  }

  if (msg.type === "start_question") {
    resetDisplay();
    screenContainer.className = "question";
    questionEl.textContent = msg.question;
    startTimer(12);
  }

  if (msg.type === "match_result") {
    resetDisplay();
    screenContainer.className = "match";
    winnerEl.textContent = msg.winner;
    const votes = msg.votes || {};
    const stef = Object.values(votes).filter(v => v === "Stefanie").length;
    const math = Object.values(votes).filter(v => v === "Mathieu").length;
    const total = stef + math;
    const publiekMatch = votes && Object.values(votes).every(v => v === msg.winner);
    const verschil = Math.abs(stef - math);
    if (publiekMatch) {
      feedbackEl.textContent = verschil > 20
        ? "Amaai, iedereen hier kent jullie door en door."
        : "Jullie vrienden denken er min of meer hetzelfde over dan jullie, maar toch niet helemaal eeeh ;)";
    } else {
      feedbackEl.textContent = verschil > 20
        ? "Eeeeeuhm, iedereen hier denkt er precies wel anders over 😄."
        : "Jullie vrienden denken er min of meer hetzelfde over dan jullie, maar toch niet helemaal eeeh ;)";
    }
  }

  if (msg.type === "audience_result") {
    resetDisplay();
    screenContainer.className = "result";
    const votes = msg.votes || {};
    const stef = Object.values(votes).filter(v => v === "Stefanie").length;
    const math = Object.values(votes).filter(v => v === "Mathieu").length;
    const total = stef + math;
    const publiekMatch = stef === 0 || math === 0;
    const verschil = Math.abs(stef - math);
    winnerEl.textContent = stef > math ? "Stefanie" : "Mathieu";
    barStefanie.style.width = total ? (stef / total) * 100 + "%" : "0%";
    barMathieu.style.width = total ? (math / total) * 100 + "%" : "0%";

    if (publiekMatch) {
      feedbackEl.textContent = verschil > 20
        ? "Amaai, iedereen hier kent jullie door en door."
        : "Jullie vrienden denken er min of meer hetzelfde over dan jullie, maar toch niet helemaal eeeh ;)";
    } else {
      feedbackEl.textContent = verschil > 20
        ? "Eeeeeuhm, iedereen hier denkt er precies wel anders over 😄."
        : "Jullie vrienden denken er min of meer hetzelfde over dan jullie, maar toch niet helemaal eeeh ;)";
    }
  }

  if (msg.type === "mismatch") {
    resetDisplay();
    screenContainer.className = "mismatch";
    feedbackEl.textContent = "Oh nee … Stefanie & Mathieu hebben niet hetzelfde geantwoord … dat kunnen we niet zo laten …";
  }

  if (msg.type === "ai") {
    aiImage.src = "img/" + msg.image;
    aiImageContainer.style.display = "block";
    setTimeout(() => {
      aiImageContainer.style.display = "none";
      feedbackEl.textContent = "oh oow … heb je dat gezien?";
    }, 3000);
  }

  if (msg.type === "ai_done") {
    resetDisplay();
    feedbackEl.textContent = "Oh nee … Stefanie & Mathieu hebben niet hetzelfde geantwoord … maar … chanceke, we hebben niks anders meer uitgestoken 🤣😅.";
  }

  if (msg.type === "hide_ai") {
    aiImageContainer.style.display = "none";
    feedbackEl.textContent = "Oh nee … Stefanie & Mathieu hebben niet hetzelfde geantwoord … dat kunnen we niet zo laten …";
  }
});

function startTimer(seconds) {
  // placeholder voor visuele timer als gewenst
}
