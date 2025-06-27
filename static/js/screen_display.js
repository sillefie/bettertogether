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
      if (img) img.style.display = "none";

      // 1) Same‐flow
      if (data.result === "same") {
        document.body.classList.remove("feedback-wrong");
        if (img) img.style.display = "none";

        const winner = data.winning_name;
        const total = data.votes_total;
        const votes_stefanie = data.votes_stefanie;
        const votes_mathieu = data.votes_mathieu;
        const percent_stefanie = total > 0 ? Math.round((votes_stefanie / total) * 100) : 0;
        const percent_mathieu = total > 0 ? Math.round((votes_mathieu / total) * 100) : 0;
        const diff = Math.abs(votes_stefanie - votes_mathieu);
        const same_vote = (votes_stefanie === votes_mathieu);

        let nuance = "";

        if (same_vote) {
            // Publiek stemde gelijk
            if (diff > 20) {
              nuance = `<p><strong>EN</strong> Amaai, iedereen hier kent jullie door en door.</p>`;
            } else {
              nuance = `<p><strong>EN</strong> Jullie vrienden denken er min of meer zelfde over dan jullie, maar toch niet helemaal eeeh ;)</p>`;
            }
          } else {
            // Publiek stemde anders
            if (diff > 20) {
              nuance = `<p><strong>MAAR</strong> eeeeeuhm, iedereen hier denkt er precies wel anders over 😅</p>`;
            } else {
              nuance = `<p><strong>MAAR</strong> Jullie vrienden denken er min of meer zelfde over dan jullie, maar toch niet helemaal eeeh ;)</p>`;
            }
        }
        feedback.innerHTML = `
        <h1>Wauw! Jullie denken er net hetzelfde over 🤍:<br>${winner}</h1>
        <div class="bar-container">
          <div class="vote-bar stefanie" style="width:${percent_stefanie}%">Stefanie: ${percent_stefanie}%</div>
          <div class="vote-bar mathieu" style="width:${percent_mathieu}%">Mathieu: ${percent_mathieu}%</div>
        </div>
        ${nuance}
        `
        ;
        console.log("Stefanie:", data.votes_stefanie, "Mathieu:", data.votes_mathieu);
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
    if (data.type === "votes") {
      const feedback = document.getElementById("screen_feedback");
      if (feedback) feedback.innerHTML = "";
      const img = document.getElementById("ai_img");
      if (img) img.style.display = "none";
    }
    if (data.type === "screen") {
      showScreen(data.screen);
    }
    if (data.type === "question") {
        document.getElementById("question_text").textContent = data.text;
        showScreen("vote");
      /* reset alles van de vorige vraag */
      const feedback = document.getElementById("screen_feedback");
      if (feedback) feedback.innerHTML = "";

      const aiImg = document.getElementById("ai_img");
      if (aiImg) aiImg.style.display = "none";

      /* zet ook lokale teller‐variabelen op nul, zodat
         de volgende feedback nooit oude percentages toont */
      lastVotesStefanie = 0;
      lastVotesMathieu = 0;
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