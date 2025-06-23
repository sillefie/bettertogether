const socket = new WebSocket(`wss://${location.host}/ws/public`);

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
        const title = document.getElementById("result_title");
        const content = document.getElementById("result_content");
        const img = document.getElementById("ai_img");
        const voteList = document.getElementById("vote_counts");

        title.textContent = "Resultaat van Stefanie & Mathieu";
        voteList.innerHTML = "";
        content.innerHTML = "";

        if (data.result === "correct") {
            content.innerHTML = "✓ Jullie antwoordden hetzelfde!";
            content.style.color = "green";
            img.style.display = "none";
        } else {
            content.innerHTML = "😅 Verschillende antwoorden!";
            img.src = "/" + data.image;
            img.style.display = "block";
        }

        if (data.votes) {
            for (const [person, count] of Object.entries(data.votes)) {
                const li = document.createElement("li");
                li.textContent = `${person}: ${count}`;
                voteList.appendChild(li);
            }
        }

        showScreen("feedback");
    }
};

function showScreen(name) {
    document.querySelectorAll(".screen").forEach(el => el.style.display = "none");
    const s = document.getElementById(`screen_${name}`);
    if (s) s.style.display = "block";
}