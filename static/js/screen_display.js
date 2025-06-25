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
      const img = document.getElementById("ai_img");
      const feedback = document.getElementById("screen_feedback");
      img.src = data.image;
      img.style.display = "block";
      feedback.innerHTML = "";
      setTimeout(() => {
        img.style.display = "none";
        feedback.innerHTML = "oh oow … heb je dat gezien?";
      }, 3000);
      return;
    }
    if (data.type === "feedback") {
      const img      = document.getElementById("ai_img");
      const feedback = document.getElementById("screen_feedback");
      img.style.display = "none";

      if (data.result === "same") {
        feedback.innerHTML =
          `<h1>${data.winner}!</h1>` +
          `<div class="green-bar" style="width:${data.percent}%">${data.percent}%</div>`;
      } else {
        feedback.innerHTML =
          `<h1>Oh nee … Stefanie & Mathieu hebben niet hetzelfde geantwoord … dan gebeuren er rare dingen, kijk maar mee op het grote scherm 🙈</h1>`;
      }
    }
    
    if (data.type === "screen") {
      showScreen(data.screen);
    }
    if (data.type === "question") {
        document.getElementById("question_text").textContent = data.text;
        showScreen("vote");
    }
    
    if (data.type === "feedback") {
        const feedback = document.getElementById("feedback");
        const img = document.getElementById("ai_img");
        const voteList = document.getElementById("live_votes");

        // reset
        feedback.innerHTML = "";
        img.style.display = "none";

        if (data.result === "same") {
            // Titel
            const title = `<h1 style="font-size: 48px;">${data.winning_name} denkt hetzelfde!</h1>`;

            // Groene balk
            const pctStefanie = (data.votes_stefanie / data.votes_total) * 100;
            const pctMathieu = (data.votes_mathieu / data.votes_total) * 100;
            const greenBar = `
              <div style="background: #d4edda; height: 40px; margin: 20px 0; display: flex;">
                <div style="width:${pctStefanie}%; background-color:#5cb85c;"></div>
                <div style="width:${pctMathieu}%; background-color:#4cae4c;"></div>
              </div>`;

            // MAAR of EN + tekst
            const conjunction = data.public_agreement ? "EN" : "MAAR";
            let nuance = "";

            if (data.diff_public_vs_couple > 20) {
                nuance = data.public_agreement
                  ? "Amaai, iedereen hier kent jullie door en door."
                  : "eeeeeuhm, iedereen hier denkt er precies wel anders over ?.";
            } else {
                nuance = "Jullie vrienden denken er min of meer hetzelfde over, maar toch niet helemaal eeeh ;)";
            }
            const text = `<p style="font-size: 24px;"><strong>${conjunction}</strong><br>${nuance}</p>`;
            feedback.innerHTML = `${title}${greenBar}${text}`;
        } else {
            feedback.textContent = "? Verschillende antwoorden!";
            img.src = "/" + data.image;
            img.style.display = "block";
        }
        voteList.innerHTML = "";
        if (data.votes) {
            Object.entries(data.votes).forEach(([name, vote]) => {
                const li = document.createElement("li");
                li.textContent = `${name}: ${vote}`;
                voteList.appendChild(li);
            });
        }
        showScreen("feedback");
    }
    /** if (data.result === "crowdsame") {
        if (data.result === "over20") {
            answerCrowd.textContent = "Amaai, iedereen hier kent jullie door en door ?.";
        } else {
            answerCrowd.textContent = "Iedereen denkt er min of meer zelfde over dan jullie, maar toch niet helemaal eeeh ?";
        }
            feedback.style.color = "black";
            img.style.display = "none";
    }
    if (data.result === "crowddiff") {
        if (data.result === "over20") {
            answerCrowd.textContent = "Eeeeeuhm, iedereen denkt er precies wel anders over ?.";
        } else {
            answerCrowd.textContent = "Iedereen denkt er min of meer zelfde over dan jullie, maar toch niet helemaal eeeh ?";
        }
            feedback.style.color = "black";
            img.style.display = "none";
    } **/
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