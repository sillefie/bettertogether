const socket = new WebSocket(`wss://${location.host}/ws/public`);

window.addEventListener("load", () => {
  introAudio.play().then(() => {
    introAudio.pause();
    introAudio.currentTime = 0;
  }).catch(() => {});

  rulesAudio.play().then(() => {
    rulesAudio.pause();
    rulesAudio.currentTime = 0;
  }).catch(() => {});
});
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "show_photo") {
        const img      = document.getElementById("ai_img");
        const feedback = document.getElementById("screen_feedback");
        img.src = "/" + data.image;
        img.style.display = "block";
        feedback.innerHTML = "";
        setTimeout(() => {
          img.style.display   = "none";
          feedback.textContent = "oh oow … heb je dat gezien?";
        }, 3000);
        return;
      }    
    if (data.type === "feedback") {
      const img      = document.getElementById("ai_img");
      const feedback = document.getElementById("screen_feedback");
      img.style.display = "none";

      // 1) Same‐flow
      if (data.result === "same") {
        document.body.classList.remove("feedback-wrong");
        img.style.display = "none";
        const winner = data.winning_name;
        const total = data.votes_total;
        const percent = total > 0
      ? Math.round((Math.max(data.votes_stefanie, data.votes_mathieu) / total) * 100)
      : 0;

        feedback.innerHTML =
      `<h1>${winner}!</h1>` +
      `<div class="green-bar" style="width:${percent}%">${percent}%</div>`;
      }
      // 2) Wrong‐flow: start met het pure rode scherm
      else if (data.result === "wrong") {
        document.body.classList.add("feedback-wrong");
        feedback.innerHTML =
          `<h1>Oh nee … Stefanie & Mathieu hebben niet hetzelfde geantwoord … dat kunnen we niet zo laten …</h1>`;
      } 
      // 3) Fallback (zou niet mogen gebeuren)
      else {
        console.warn("Onbekend feedback-result:", data.result);
      }
    }
    if (data.type === "screen") {
      showScreen(data.screen);
    }
    if (data.type === "question") {
        document.getElementById("question_text").textContent = data.text;
        showScreen("vote");
    }    
    if (data.type === "scoreboard") {
        const list = document.getElementById("ranking");
        list.innerHTML = "";
        data.ranking.forEach(([name, score]) => {
            const li = document.createElement("li");
            li.textContent = `${name}: ${score}`;
            list.appendChild(li);
        });
        showScreen("scoreboard");
    }
};

function showScreen(name) {
    document.querySelectorAll(".screen").forEach(el => el.style.display = "none");
    const s = document.getElementById(`screen_${name}`);
    if (s) s.style.display = "block";
}