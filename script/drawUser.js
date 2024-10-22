const canvas = document.getElementById('userCanvas');
const ctx = canvas.getContext('2d');

let user = { x: 50, y: 50, angle: 0, velocity: 0 };  // Initial user state

// Draw the user on the canvas
function drawUser() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    ctx.beginPath();
    ctx.arc(user.x, user.y, 20, 0, Math.PI * 2);  // Draw the user
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
}

// Set up WebSocket connection to local Python server
const ws = new WebSocket('ws://localhost:8765');  // Connect to the local Python program

ws.onopen = () => {
    console.log('WebSocket connection opened');
};

// TODO: send message of current user position
// x, y, angle, velocity
// need_reset

// Receive new user position
ws.onmessage = (event) => {
    // Receive user state from the local Python program
    user = JSON.parse(event.data);
    drawUser();  // Draw the updated user position
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};