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
      document.getElementById("start").style.display = "none";
      document.getElementById("waiting").style.display = "none";
    } else {
      document.getElementById("question").style.display = "none";
    }
  } else if (msg.type === "question") {
    document.getElementById("questionText").innerText = msg.text;
    document.getElementById("question").style.display = "";
    document.getElementById("start").style.display = "none";
    document.getElementById("waiting").style.display = "none";
 }
};