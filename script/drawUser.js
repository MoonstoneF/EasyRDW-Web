// Misc
const MAX_PATH_LEN = 1000;
const delta_t = 0.02;
let scale_phys = 2;
let scale_virt = 1.5;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Environments
const canvas_phys = document.getElementById('physCanvas');
const canvas_virt = document.getElementById('virtCanvas');
let border_phys = [{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 0 }, { x: 100, y: 100 }];
let border_virt = [{ x: 0, y: 0 }, { x: 0, y: 200 }, { x: 200, y: 0 }, { x: 200, y: 200 }];
let obstacles_phys = [
    [{ x: 20, y: 20 }, { x: 20, y: 40 }, { x: 40, y: 40 }, { x: 40, y: 20 }],
    [{ x: 60, y: 60 }, { x: 60, y: 80 }, { x: 80, y: 80 }, { x: 80, y: 60 }]
];
let obstacles_virt = []

// User position and path in both environemnts
let initial_user_phys = { x: 50, y: 50, angle: 0, v: 0, w: 0 };  // Initial user state
let initial_user_virt = { x: 50, y: 50, angle: 0, v: 0, w: 0 };
let user_phys = { x: initial_user_phys.x, y: initial_user_phys.y, angle: initial_user_phys.angle, v: initial_user_phys.v, w: initial_user_phys.w };
let user_virt = { x: initial_user_virt.x, y: initial_user_virt.y, angle: initial_user_virt.angle, v: initial_user_virt.v, w: initial_user_virt.w };
let path_phys = [{ x: user_phys.x, y: user_phys.y }];
let path_virt = [{ x: user_virt.x, y: user_virt.y }];

// User config
let poi = [{ x: 50, y: 150 }, { x: 150, y: 150 }, { x: 150, y: 50 }, { x: 50, y: 50 }]
let poi_index = 0;
let is_rotating = false;
let walk_speed = 1;    // pixel/frame
let turn_speed = 0.1;   // radius/frame

// User log info
// TODO: Log more user info
let need_reset = false;
let reset_counter = 0;
let distance_phys = 0;
let distance_virt = 0;

// ---------------------------- Draw functions ----------------------------

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
    }
    ctx.stroke();

    // Draw the user
    ctx.save(); // Save the current canvas state
    ctx.translate(user.x, user.y); // Move to the arrow's position
    ctx.rotate(user.angle + Math.PI / 2); // Rotate the canvas to the angle

    // Draw the arrow
    ctx.beginPath();
    ctx.moveTo(0, -20); // Move to the tip of the arrow
    ctx.lineTo(-10, 10); // Left side of the arrow
    ctx.lineTo(0, 0);
    ctx.lineTo(10, 10); // Right side of the arrow
    ctx.closePath();
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.restore(); // Restore the canvas state
}

function drawPhys() {
    ctx = canvas_phys.getContext('2d');
    ctx.clearRect(0, 0, canvas_phys.width, canvas_phys.height);

    // Apply Scale
    ctx.scale(scale_phys, scale_phys);

    drawEnvironment(ctx, border_phys, obstacles_phys);
    drawUser(ctx, user_phys, path_phys);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawVirt() {
    ctx = canvas_virt.getContext('2d');
    ctx.clearRect(0, 0, canvas_virt.width, canvas_virt.height);

    // Apply Scale
    ctx.scale(scale_virt, scale_virt);

    drawEnvironment(ctx, border_virt, obstacles_virt);
    drawUser(ctx, user_virt, path_virt);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Test when no socket
// drawPhys();
// drawVirt();

// ------------------------------- Walk Simulation ----------------------------

// Reset detection
function pointInPolygon(point, vertices) {
    let inside = false;
    const n = vertices.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = vertices[i].x, yi = vertices[i].y;
        const xj = vertices[j].x, yj = vertices[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

function checkCollisions(walkerPosition, obstacles) {
    for (const obstacle of obstacles) {
        if (pointInPolygon(walkerPosition, obstacle)) {
            return true; // Collision detected
        }
    }
    return false; // No collisions
}


// Walk simulation
function walk() {
    if (poi_index >= poi.length) {
        return false;
    }

    // Rotate/walk towards next poi with configured speed
    const target_poi = poi[poi_index];
    const target_direction = {
        x: target_poi.x - user_virt.x,
        y: target_poi.y - user_virt.y
    };

    const target_distance = Math.sqrt(target_direction.x ** 2 + target_direction.y ** 2);
    const target_angle = Math.atan2(target_direction.y, target_direction.x); // Angle to the target

    // Check if the walker is rotating or moving
    if (is_rotating) {
        // Rotate towards the target angle
        user_virt.w = turn_speed;
        if (Math.abs(user_virt.angle - target_angle) < Math.PI)
            if (user_virt.angle < target_angle) {
                user_virt.angle += turn_speed;
            }
            else {
                user_virt.angle -= turn_speed;
            }
        else {
            if (user_virt.angle < target_angle) {
                user_virt.angle -= turn_speed;
                if (user_virt.angle < - Math.PI) {
                    user_virt.angle += 2 * Math.PI;
                }
            }
            else {
                user_virt.angle += turn_speed;
                if (user_virt.angle > Math.PI) {
                    user_virt.angle -= 2 * Math.PI;
                }
            }
        }

        // Turned to target angle
        if (Math.abs(user_virt.angle - target_angle) < turn_speed) {
            user_virt.angle = target_angle; // Snap to the target angle
            user_virt.v = walk_speed;    // Start walking
            user_virt.w = 0;
            is_rotating = false; // Stop rotating
            // console.log(`Finished rotating towards POI: ${JSON.stringify(target_poi)}`);
        }
    }
    // Not rotating
    else {
        // Move towards next target POI
        if (target_distance > walk_speed) {
            const normalizedDirection = {
                x: target_direction.x / target_distance,
                y: target_direction.y / target_distance
            };

            distance_virt += Math.sqrt(normalizedDirection.x ** 2 + normalizedDirection.y ** 2) * walk_speed;

            user_virt.x += normalizedDirection.x * walk_speed;
            user_virt.y += normalizedDirection.y * walk_speed;
            user_virt.angle = target_angle;
            user_virt.v = walk_speed;
            user_virt.w = 0;
        }
        else {
            distance_virt += Math.sqrt((target_poi.x - user_virt.x) ** 2 + (target_poi.y - user_virt.y) ** 2);

            // Move to the target POI
            user_virt.x = target_poi.x;
            user_virt.y = target_poi.y;
            user_virt.angle = target_angle;
            user_virt.v = 0;
            user_virt.w = turn_speed;
            is_rotating = true; // Start rotating towards the next POI

            console.log(`Arrived at POI: ${JSON.stringify(target_poi)}`);
            poi_index++;
        }
    }
    return true;
}

// ------------------------------ Buttons -------------------------------

function start() {
    if (!has_start) {
        sendStartMsg();
        has_start = true;
    }
}

function pause() {
    if (is_paused) {
        ws.send(JSON.stringify(in_pause_msg));
    }
    is_paused = !is_paused;
}

function reset() {
    sendEndMsg();
    has_start = false;
    user_phys = { x: initial_user_phys.x, y: initial_user_phys.y, angle: initial_user_phys.angle, v: initial_user_phys.v, w: initial_user_phys.w };
    user_virt = { x: initial_user_virt.x, y: initial_user_virt.y, angle: initial_user_virt.angle, v: initial_user_virt.v, w: initial_user_virt.w };
    is_paused = false;
    path_phys = [{ x: user_phys.x, y: user_phys.y }];
    path_virt = [{ x: user_virt.x, y: user_virt.y }];
    poi_index = 0;
    drawVirt();
    drawPhys();
}

function downloadData() {

}


// -------------------------------- WebSocket ------------------------------

let ws_time = 0;
let all_time = 0;
let has_start = false;
let is_paused = false;
let in_pause_msg = {};

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
    };

    // Send start message
    ws.send(JSON.stringify(start_msg));
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
        user_v: user_virt.v,
        user_w: user_virt.w,
        delta_t: delta_t,
        need_reset: need_reset
    };
    if (!is_paused) {
        ws.send(JSON.stringify(run_msg));
    } else {
        in_pause_msg = run_msg;
    }
}

function sendEndMsg() {
    const end_msg = {
        type: "end",
    };
    ws.send(JSON.stringify(end_msg));
}

ws.onopen = () => {
    console.log('WebSocket connection opened');
    all_time = performance.now();
    drawVirt();
    drawPhys();
    // Send simulation start message and setup info
    // sendStartMsg();
};

ws.onmessage = async (event) => {
    if (!has_start) {
        return;
    }
    let t1 = performance.now();

    msg = JSON.parse(event.data);
    // console.log("on message")

    switch (msg.type) {
        case "start":
            // Start simulation, send first frame
            sendRunMsg();
            break;

        case "running":
            // Up reset counter
            if (msg.reset) {
                reset_counter++;
                console.log("Reset: ", reset_counter);
            }
            // Calc distance
            distance_phys += Math.sqrt((msg.user_x - user_phys.x) ** 2 + (msg.user_y - user_phys.y) ** 2);
            // Update user physcial position
            user_phys = { x: msg.user_x, y: msg.user_y, angle: msg.user_direction }
            // Reset detection
            need_reset = checkCollisions(user_phys, obstacles_phys);

            // Accept this frame
            if (!need_reset) {
                if (path_phys.push({ x: user_phys.x, y: user_phys.y }) > MAX_PATH_LEN)
                    path_phys.shift();  // Update physical path
                drawPhys();

                // Draw user virtual position for this frame
                if (path_virt.push({ x: user_virt.x, y: user_virt.y }) > MAX_PATH_LEN)
                    path_virt.shift();  // Update virtual path
                drawVirt();

                // New user virtual position for next frame
                if (!walk()) {
                    // Finish simulation
                    sendEndMsg();
                    break;
                }
                // Sleep
                await sleep(delta_t * 1000);
            }

            // Send next frame
            sendRunMsg();
            break;

        case "end":
            // end simulation
            // ws.close();
            let all_time2 = performance.now();
            console.log("all: ", all_time2 - all_time, "walk and draw: ", ws_time, "rest: ", all_time2 - all_time - ws_time);
            break;
        // return;
    }
    let t2 = performance.now()
    ws_time += (t2 - t1);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');

};