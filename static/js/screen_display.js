
const socket = new WebSocket(`wss://${location.host}/ws/display`);

window.socket = socket; // voor inline gebruik

socket.onopen = () => {
    console.log('Display websocket connected');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    switch(data.screen) {
        case 'start':
            document.getElementById('screen_start').style.display = 'block';
            break;
        case 'intro':
            document.getElementById('screen_intro').style.display = 'block';
            const introAudio = document.getElementById('intro_audio');
            introAudio.play().catch(e => console.warn('Audio play failed', e));
            break;
        case 'uitleg':
            document.getElementById('screen_uitleg').style.display = 'block';
            const rulesVideo = document.getElementById('rules_video');
            rulesVideo.play().catch(e => console.warn('Video play failed', e));
            break;
        case 'qr':
            document.getElementById('screen_qr').style.display = 'block';
            break;
        case 'vote':
            document.getElementById('screen_vote').style.display = 'block';
            if(data.question) {
                document.getElementById('question_text').textContent = data.question;
            }
            break;
        case 'feedback':
            document.getElementById('screen_feedback').style.display = 'block';
            if(data.feedback_text) {
                document.getElementById('feedback_text').textContent = data.feedback_text;
            }
            // Stem balken updates hier als nodig
            break;
        default:
            console.warn('Onbekend scherm:', data.screen);
    }
};
