const socket = new WebSocket(`wss://${location.host}/ws/public`);

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "screen") {
        showScreen(data.screen);
    }

    if (data.type === "question") {
        document.getElementById("question_text").textContent = data.text;
    }

    if (data.type === "feedback") {
        const feedback = document.getElementById("feedback");
        if (data.result === "correct") {
            feedback.textContent = "✓ Jullie antwoordden hetzelfde!";
            feedback.style.color = "green";
        } else {
            feedback.innerHTML = `<img src="${data.image}" alt="AI Fout">`;
        }
    }

    if (data.type === "scoreboard") {
        const list = document.getElementById("ranking");
        list.innerHTML = "";
        data.ranking.forEach(([name, score]) => {
            const li = document.createElement("li");
            li.textContent = `${name}: ${score}`;
            list.appendChild(li);
        });
    }
};

function showScreen(name) {
    document.querySelectorAll(".screen").forEach(el => el.style.display = "none");
    const s = document.getElementById(`screen_${name}`);
    if (s) s.style.display = "block";
}
