const socket = new WebSocket(`wss://${location.host}/ws/public`);
/* ----------------------------------------------------------
   Basissjabloon feedback bewaren zodat we het kunnen resetten
   ---------------------------------------------------------- */
const feedbackContainer      = document.getElementById("screen_feedback");
const feedbackTemplateHTML   = feedbackContainer.innerHTML;   // bevat <h1><h2>� + <img id="ai_img">

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
    console.log("DATA:", data);
    if (data.type === "show_photo") {
      showScreen("feedback");
      setTimeout(() => {
        const feedback = document.getElementById("screen_feedback");
        const aiImg = document.getElementById("ai_img");
        if (!aiImg || !feedback) return;
        feedback.innerHTML = feedbackTemplateHTML;
        const refreshedImg = document.getElementById("ai_img");
        if (refreshedImg) {
          refreshedImg.src = "/" + data.image;
          refreshedImg.style.display = "block";
        }

        setTimeout(() => {
          aiImg.style.display = "none";
          const h1 = document.getElementById("feedback");
          h1.textContent = "oh oow ... heb je dat gezien?";
        }, 2000);
      }, 100);
      return;
    }
    if (data.type === "hide_photo") {
        showScreen("feedback");
        const aiImg = document.getElementById("ai_img");
        aiImg.style.display = "none";
        const h1 = document.getElementById("feedback");
        h1.textContent = "oh oow ... heb je dat gezien?";
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
        //const diff = Math.abs(votes_stefanie - votes_mathieu);
        //const same_vote = (votes_stefanie === votes_mathieu);
        const diff = Math.abs((votes_stefanie / total) * 100 - (votes_mathieu / total) * 100);
        const same_vote = (Math.round((votes_stefanie / total) * 100) === Math.round((votes_mathieu / total) * 100));

        let nuance = "";
        feedback.innerHTML = feedbackTemplateHTML;

        const h1 = document.getElementById("feedback");
        if (h1) h1.innerHTML = `Wauw!<br>Stefanie & Mathieu denken er net hetzelfde over U+1F970<br>=> ${winner}`;

        // stemmenbalken en nuance
        const answerSTEM = document.getElementById("answerSTEM");
        if (answerSTEM) {
          answerSTEM.innerHTML = `
            <div class="bar-container">
              <div class="vote-bar stefanie" style="width:${percent_stefanie}%">
                Stefanie: ${percent_stefanie}%
              </div>
              <div class="vote-bar mathieu" style="width:${percent_mathieu}%">
                Mathieu: ${percent_mathieu}%
              </div>
            </div>`;
        }
        //const answerCrowd = document.getElementById("answerCrowd");
        //if (answerCrowd) answerCrowd.innerHTML = nuance;

      }
      // 2) Wrong‐flow: start met het pure rode scherm
      else if (data.result === "wrong") {
        document.body.classList.add("feedback-wrong");
        if (img) img.style.display = "none";

        const total = data.votes_total;
        const votes_stefanie = data.votes_stefanie;
        const votes_mathieu = data.votes_mathieu;
        const percent_stefanie = total > 0 ? Math.round((votes_stefanie / total) * 100) : 0;
        const percent_mathieu = total > 0 ? Math.round((votes_mathieu / total) * 100) : 0;
        const diff = Math.abs((votes_stefanie / total) * 100 - (votes_mathieu / total) * 100);
        const same_vote = (Math.round((votes_stefanie / total) * 100) === Math.round((votes_mathieu / total) * 100));

        feedback.innerHTML = feedbackTemplateHTML;
        const h1 = document.getElementById("feedback");
        h1.textContent = "Oh nee ... Stefanie & Mathieu hebben niet hetzelfde geantwoord ... dat kunnen we niet zo laten ...";

        // stemmenbalken en nuance
        const answerSTEM = document.getElementById("answerSTEM");
        if (answerSTEM) {
          answerSTEM.innerHTML = `
            <div class="bar-container">
              <div class="vote-bar stefanie" style="width:${percent_stefanie}%">
                Stefanie: ${percent_stefanie}%
              </div>
              <div class="vote-bar mathieu" style="width:${percent_mathieu}%">
                Mathieu: ${percent_mathieu}%
              </div>
            </div>`;
        }
        //const answerCrowd = document.getElementById("answerCrowd");
        //if (answerCrowd) answerCrowd.innerHTML = nuance;        
      } 
      // 2) Wrong‐flow: start met het pure rode scherm - NO AI
      else if (data.result === "wrong_ai") {
        document.body.classList.add("feedback-wrong");
        if (img) img.style.display = "none";

        const total = data.votes_total;
        const votes_stefanie = data.votes_stefanie;
        const votes_mathieu = data.votes_mathieu;
        const percent_stefanie = total > 0 ? Math.round((votes_stefanie / total) * 100) : 0;
        const percent_mathieu = total > 0 ? Math.round((votes_mathieu / total) * 100) : 0;
        const diff = Math.abs((votes_stefanie / total) * 100 - (votes_mathieu / total) * 100);
        const same_vote = (Math.round((votes_stefanie / total) * 100) === Math.round((votes_mathieu / total) * 100));

        feedback.innerHTML = feedbackTemplateHTML;
        const h1 = document.getElementById("feedback");
        h1.textContent = `Oh nee ... Stefanie & Mathieu hebben niet hetzelfde geantwoord ...<br><br>maar ... chanceke, we hebben niks anders meer uitgestoken.`; /* � */

        // stemmenbalken en nuance
        const answerSTEM = document.getElementById("answerSTEM");
        if (answerSTEM) {
          answerSTEM.innerHTML = `
            <div class="bar-container">
              <div class="vote-bar stefanie" style="width:${percent_stefanie}%">
                Stefanie: ${percent_stefanie}%
              </div>
              <div class="vote-bar mathieu" style="width:${percent_mathieu}%">
                Mathieu: ${percent_mathieu}%
              </div>
            </div>`;
        }
      } 
      // 3) Fallback (zou niet mogen gebeuren)
      else {
        console.warn("Onbekend feedback-result:", data.result);
      }
    }
    if (data.type === "votes") {
        document.body.classList.remove("feedback-wrong");
        const feedback = document.getElementById("screen_feedback");
      if (feedback) feedback.innerHTML = feedbackTemplateHTML;
      const img = document.getElementById("ai_img");
      if (img) img.style.display = "none";
    }
    if (data.type === "screen") {
      showScreen(data.screen);
    }
    if (data.type === "question") {
        document.body.classList.remove("feedback-wrong");
        document.getElementById("question_text").textContent = data.text;
        showScreen("vote");
      /* reset alles van de vorige vraag */
      const feedback = document.getElementById("screen_feedback");
      if (feedback) feedback.innerHTML = feedbackTemplateHTML;

      const aiImg = document.getElementById("ai_img");
      if (aiImg) aiImg.style.display = "none";

      /* zet ook lokale teller‐variabelen op nul, zodat
         de volgende feedback nooit oude percentages toont */
      lastVotesStefanie = 0;
      lastVotesMathieu = 0;
    }    
};

function showScreen(name) {
    document.querySelectorAll(".screen").forEach(el => el.style.display = "none");
    const s = document.getElementById(`screen_${name}`);
    if (s) s.style.display = "block";
}