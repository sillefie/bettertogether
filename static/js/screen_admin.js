const socket = new WebSocket(`wss://${location.host}/ws/admin`);

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "screen") {
        document.getElementById("screen_status").textContent = data.screen;
    }

    if (data.type === "votes") {
        const votes = data.votes;
        const list = document.getElementById("votes_list");
        list.innerHTML = "";
        Object.entries(votes).forEach(([name, answer]) => {
            const li = document.createElement("li");
            li.textContent = `${name}: ${answer}`;
            list.appendChild(li);
        });
    }
};

function setScreen(screenName) {
    socket.send(JSON.stringify({ command: "set_screen", screen: screenName }));
}

function sendQuestion(index) {
    socket.send(JSON.stringify({ command: "set_question", idx: index }));
}

function confirmSame() {
    socket.send(JSON.stringify({ command: "same_answer" }));
}

function confirmDifferent() {
    socket.send(JSON.stringify({ command: "different_answer" }));
}

function endQuiz() {
    socket.send(JSON.stringify({ command: "end_quiz" }));
}
