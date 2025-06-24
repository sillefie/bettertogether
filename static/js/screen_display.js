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

        if (data.result === "correct") {
            feedback.textContent = "✓ Jullie antwoordden hetzelfde!";
            feedback.style.color = "green";
            img.style.display = "none";
        } else {
            feedback.textContent = "😅 Verschillende antwoorden!";
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