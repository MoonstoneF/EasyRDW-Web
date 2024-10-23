const canvas = document.getElementById('userCanvas');
const ctx = canvas.getContext('2d');

let user = { x: 50, y: 50, angle: 0, velocity: 0 };  // Initial user state
let user_trajectory = [{ x: 400, y: 400 }, { x: 200, y: 250 }]

// Draw the user on the canvas
function drawUser() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw trajectory
    // TODO: limit number of points remembered
    user_trajectory.push({ x: user.x, y: user.y });
    ctx.beginPath();
    for (let index = 1; index < user_trajectory.length; index++) {
        const pre = user_trajectory[index - 1];
        const cur = user_trajectory[index];
        ctx.moveTo(pre.x, pre.y);
        ctx.lineTo(cur.x, cur.y);
        ctx.stroke();
    }
    ctx.closePath();

    // Draw the user
    ctx.beginPath();
    ctx.arc(user.x, user.y, 20, 0, Math.PI * 2);
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

drawUser();