// Misc
let MAX_PATH_LEN = 100;

// Environments
const canvas_phys = document.getElementById('physCanvas');
const canvas_virt = document.getElementById('virtCanvas');
let border_phys = [{ x: 0, y: 0 }, { x: 0, y: 500 }, { x: 500, y: 0 }, { x: 500, y: 500 }];
let border_virt = [{ x: 0, y: 0 }, { x: 0, y: 600 }, { x: 600, y: 0 }, { x: 600, y: 600 }];
let obstacles_phys = [
    [{ x: 100, y: 100 }, { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 100 }],
    [{ x: 300, y: 300 }, { x: 300, y: 400 }, { x: 400, y: 400 }, { x: 400, y: 300 }]
];
let obstacles_virt = []

// User position and path in both environemnts
let user_phys = { x: 50, y: 50, angle: 0, velocity: 0 };  // Initial user state
let user_virt = { x: 50, y: 50, angle: 0, velocity: 0 };
let path_phys = [{ x: user_phys.x, y: user_phys.y }];   // TODO: Log more user info
let path_virt = [{ x: user_virt.x, y: user_virt.y }];

function drawPolygon(ctx, points) {
    // Find min max to get center
    // Sort from top to bottom
    points.sort((a, b) => a.y - b.y);

    // Get center y
    const cy = (points[0].y + points[points.length - 1].y) / 2;

    // Sort from right to left
    points.sort((a, b) => b.x - a.x);

    // Get center x
    const cx = (points[0].x + points[points.length - 1].x) / 2;

    // Center point
    const center = { x: cx, y: cy };

    // Starting angle used to reference other angles
    var startAng;
    points.forEach(point => {
        var ang = Math.atan2(point.y - center.y, point.x - center.x);
        if (!startAng) { startAng = ang }
        else {
            if (ang < startAng) {  // ensure that all points are clockwise of the start point
                ang += Math.PI * 2;
            }
        }
        point.angle = ang; // add the angle to the point
    });

    // Sort clockwise;
    points.sort((a, b) => a.angle - b.angle);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
}

// Draw environment
function drawEnvironment(ctx, border, obstacles) {
    // Draw border
    ctx.fillStyle = "aquamarine"
    drawPolygon(ctx, border);
    ctx.stroke();

    // Draw obstacles
    ctx.fillStyle = "red"
    for (let i = 0; i < obstacles.length; i++) {
        drawPolygon(ctx, obstacles[i]);
        ctx.fill();
    }
}

// Draw the user on the canvas
function drawUser(ctx, user, path) {
    // Draw path
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();
    }

    // Draw the user
    ctx.beginPath();
    ctx.arc(user.x, user.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
}

function drawPhys() {
    ctx = canvas_phys.getContext('2d');
    ctx.clearRect(0, 0, canvas_phys.width, canvas_phys.height);

    drawEnvironment(ctx, border_phys, obstacles_phys);
    drawUser(ctx, user_phys, path_phys);
}

function drawVirt() {
    ctx = canvas_virt.getContext('2d');
    ctx.clearRect(0, 0, canvas_virt.width, canvas_virt.height);

    drawEnvironment(ctx, border_virt, obstacles_virt);
    drawUser(ctx, user_phys, path_phys);
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
            border: border_phys,
            obstacle_list: obstacles_phys,
        },
        virtual: {
            height: 200,
            width: 200,
            border: border_virt,
            obstacle_list: obstacles_virt,
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
            drawPhys();

            // TODO: New user virtual position
            // Rotate/walk towards next poi with configured speed

            if (path_virt.push({ x: user_virt.x, y: user_virt.y }) > MAX_PATH_LEN)
                path_virt.shift();  // Update virtual path
            drawVirt();

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
drawPhys();
drawVirt();