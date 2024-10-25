// Misc
let MAX_PATH_LEN = 100;

// User position and path in both environemnts
let user_phys = { x: 50, y: 50, angle: 0, velocity: 0 };  // Initial user state
let user_virt = { x: 50, y: 50, angle: 0, velocity: 0 };
let path_phys = [{ x: user_phys.x, y: user_phys.y }];
let path_virt = [{ x: user_virt.x, y: user_virt.y }];

// Canvas for both environments
const canvas_phys = document.getElementById('physCanvas');
const canvas_virt = document.getElementById('virtCanvas');

// TODO: Draw environment per user input
function drawEnvironment(canvas, border, obstacle_list) {
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

// Draw the user on the canvas
function drawUser(canvas, user, path) {
    console.log("drawUser");

    // Clear the canvas
    ctx = canvas.getContext('2d');

    // TODO: Draw environment and obstacles

    // Draw path
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let index = 1; index < path.length; index++) {
        const pre = path[index - 1];
        const cur = path[index];
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

// -------------------------- WebSocket -----------------------------

// Set up WebSocket connection to local Python server
const ws = new WebSocket('ws://localhost:8765');  // Connect to the local Python program

// WS Protocol
function sendStartMsg() {
    // TODO: Get configuration from user input fields

    // Compose start message
    const start_msg =
    {
        type: "start",
        physical: {
            height: 100,
            width: 100,
            border: [(0, 0), (0, 100), (100, 0), (100, 100)],
            obstacle_list: [
                [(20, 20), (20, 40), (40, 40), (40, 20)],
                [(60, 60), (60, 80), (80, 80), (80, 60)]
            ]
        },
        virtual: {
            height: 200,
            width: 200,
            border: [(0, 0), (0, 400), (400, 0), (400, 400)],
            obstacle_list: []
        }

    }

    // Send start message
    ws.send(JSON.stringify(start_msg))
}

function sendRunMsg() {
    // TODO: need_reset detection
    let need_reset = false;

    const run_msg = {
        type: "running",
        physical: {
            user_x: user_phys.x,
            user_y: user_phys.y,
            user_direction: user_phys.angle
        },
        virtual: {
            user_x: user_virt.x,
            user_y: user_virt.y,
            user_direction: user_virt.angle
        },
        user_v: user_virt.velocity,
        delta_t: 0.02,
        need_reset: need_reset
    }
}

ws.onopen = () => {
    console.log('WebSocket connection opened');

    // Send simulation start message and setup info
    sendStartMsg();
};

ws.onmessage = (event) => {
    msg = JSON.parse(event.data);

    switch (msg.type) {
        case "start":
            // Start simulation, send first frame
            sendRunMsg();
            break;

        case "running":
            // Receive new user physical position
            user_phys = { x: msg.user_x, y: msg.user_y, angle: msg.user_direction }
            if (path_phys.push({ x: user_phys.x, y: user_phys.y }) > MAX_PATH_LEN)
                path_phys.shift();  // Update physical path
            drawUser(canvas_phys, user_phys, path_phys);

            // TODO: New user virtual position
            // Rotate/walk towards next poi with configured speed

            if (path_virt.push({ x: user_virt.x, y: user_virt.y }) > MAX_PATH_LEN)
                path_virt.shift();  // Update virtual path
            drawUser(canvas_virt, user_virt, path_virt);

            // Send next frame
            sendRunMsg();
            break;

        case "end":
            // end simulation
            ws.close(1, "End of simulation");
            break;

    }

};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

// Test when no socket
drawUser(canvas_phys, user_phys, path_phys);