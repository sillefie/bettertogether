const socket = new WebSocket(`wss://${location.host}/ws/public`);

let currentScreen = null;

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "screen") {
        currentScreen = data.screen;
        showScreen(data.screen);
    }

    if (data.type === "question") {
        document.getElementById("question_text").textContent = data.text;
        document.getElementById("vote_buttons").style.display = "block";
    }

    if (data.type === "feedback") {
        const feedback = document.getElementById("feedback");
        if (data.result === "correct") {
            feedback.textContent = "✓ Jullie waren het eens!";
            feedback.style.color = "green";
        } else {
            feedback.innerHTML = `<img src="${data.image}" alt="AI Fout">`;
        }
        document.getElementById("vote_buttons").style.display = "none";
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

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(el => el.style.display = "none");
    const active = document.getElementById(`screen_${screen}`);
    if (active) active.style.display = "block";
}

function registerName() {
    const name = document.getElementById("name_input").value.trim();
    if (name) {
        socket.send(JSON.stringify({ type: "register", name }));
        document.getElementById("name_form").style.display = "none";
    }
}

function vote(choice) {
    socket.send(JSON.stringify({ vote: choice }));
}
