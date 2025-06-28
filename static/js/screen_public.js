let ws = new WebSocket("wss://" + location.host + "/ws/public");

let currentScreen = "intro";
function register() {
  const name = document.getElementById("nameInput").value.trim();

  if (!name) {
    alert("Vul eerst je naam in.");
    return;
  }

  localStorage.setItem("player_name", name); // ? ? DEZE MOEST ERBIJ

  ws.send(JSON.stringify({ type: "register", name: name }));
  document.getElementById("NaamInvullen").style.display = "none";
  document.getElementById("StartinginaSecond").style.display = "";
  currentScreen = "intro";
}



function vote(v) {
  ws.send(JSON.stringify({ type: "vote", vote: v }));v
  document.getElementById("intro").style.display = "none";
  document.getElementById("question").style.display = "none";
  document.getElementById("waiting").style.display = "";
}

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "screen") {
    if (msg.screen === "question") {
      document.getElementById("question").style.display = "";
      document.getElementById("intro").style.display = "none";
      document.getElementById("waiting").style.display = "none";
      document.getElementById("feedback").style.display = "none";
      document.getElementById("scoreboard").style.display = "none";
    } else {
      document.getElementById("question").style.display = "none";
    }
  } else if (msg.type === "question") {
    document.getElementById("questionText").innerText = msg.text;
    document.getElementById("question").style.display = "";
    document.getElementById("waiting").style.display = "none";
    document.getElementById("feedback").style.display = "none";
    document.getElementById("scoreboard").style.display = "none";
      document.getElementById("intro").style.display = "none";
 } else if (msg.type === "feedback") {
    document.getElementById("question").style.display = "none";
    document.getElementById("waiting").style.display = "none";
    document.getElementById("feedback").style.display = "";

    const playerName = localStorage.getItem("player_name");
    const playerVote = msg.votes?.[playerName];
    const coupleVote = msg.winning_name;

    const feedbackText = document.getElementById("feedbackText");
    feedbackText.innerText = "<h2>Bedankt om te stemmen!</h2><p>Wacht op het resultaat …</p>";
  } else if (msg.type === "scoreboard") {
      document.getElementById("intro").style.display = "none";
    document.getElementById("feedback").style.display = "none";
    document.getElementById("waiting").style.display = "none";
    document.getElementById("scoreboard").style.display = "";
    const list = document.getElementById("rankingList");
    list.innerHTML = "";
    msg.ranking.forEach(([name, score]) => {
      const li = document.createElement("li");
      li.textContent = '${name} - ${score}';
      list.appendChild(li);
    });
  }
};