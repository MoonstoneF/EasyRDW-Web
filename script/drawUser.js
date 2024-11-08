// Misc
const MAX_PATH_LEN = 1000;
const delta_t = 0.02;
const px_per_meter = 5 / 200;
let scale_phys = 1;
let scale_virt = 1;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const canvas_phys = document.getElementById('physCanvas');
const canvas_virt = document.getElementById('virtCanvas');

// ---------------------------- Config ---------------------------

let config = {
    // Environments
    border_phys: [{ x: 0, y: 0 }, { x: 0, y: 200 }, { x: 200, y: 0 }, { x: 200, y: 200 }],
    border_virt: [{ x: 0, y: 0 }, { x: 0, y: 400 }, { x: 400, y: 0 }, { x: 400, y: 400 }],
    obstacles_phys: [
        [{ x: 40, y: 40 }, { x: 40, y: 80 }, { x: 80, y: 80 }, { x: 80, y: 40 }],
        [{ x: 120, y: 120 }, { x: 120, y: 160 }, { x: 160, y: 160 }, { x: 160, y: 120 }]
    ],
    obstacles_virt: [],

    // User config
    poi: [{ x: 100, y: 300 }, { x: 300, y: 300 }, { x: 300, y: 100 }, { x: 100, y: 100 }],
    walk_speed: 2,    // pixel/frame
    turn_speed: 0.1,   // radius/frame

    // User position and path in both environemnts
    initial_user_phys: { x: 100, y: 100, angle: 0, v: 0, w: 0 },  // Initial user state
    initial_user_virt: { x: 100, y: 100, angle: 0, v: 0, w: 0 },
}

// --------------------------------- Inner Variables --------------------------

// 状态机
const SimState = {
    before_start: 0,
    running: 1,
    paused: 2,
    finnished: 3,
}
let state = SimState.before_start;

let poi_index = 0;
let is_rotating = false;
let in_pause_msg = {};
let need_reset = false;

let user_phys = { x: config.initial_user_phys.x, y: config.initial_user_phys.y, angle: config.initial_user_phys.angle, v: config.initial_user_phys.v, w: config.initial_user_phys.w };
let user_virt = { x: config.initial_user_phys.x, y: config.initial_user_phys.y, angle: config.initial_user_phys.angle, v: config.initial_user_phys.v, w: config.initial_user_phys.w };
let path_phys = [{ x: user_phys.x, y: user_phys.y }];
let path_virt = [{ x: user_virt.x, y: user_virt.y }];

// User log info
let reset_cnt = 0;
let distance_phys = 0;
let distance_virt = 0;

function init() {
    state = SimState.before_start;

    poi_index = 0;
    is_rotating = false;
    in_pause_msg = {};
    need_reset = false;

    user_phys = { x: config.initial_user_phys.x, y: config.initial_user_phys.y, angle: config.initial_user_phys.angle, v: config.initial_user_phys.v, w: config.initial_user_phys.w };
    user_virt = { x: config.initial_user_phys.x, y: config.initial_user_phys.y, angle: config.initial_user_phys.angle, v: config.initial_user_phys.v, w: config.initial_user_phys.w };
    path_phys = [{ x: user_phys.x, y: user_phys.y }];
    path_virt = [{ x: user_virt.x, y: user_virt.y }];

    // User log info
    reset_cnt = 0;
    distance_phys = 0;
    distance_virt = 0;
}

// ---------------------------- Pixel-meter conversion ----------------------

function convertCoordsToPixels(coords) {
    return coords.map(point => ({
        x: point.x / px_per_meter,
        y: point.y / px_per_meter
    }));
}

function convertPixelsToCoords(pixels) {
    return pixels.map(point => ({
        x: point.x * px_per_meter,
        y: point.y * px_per_meter
    }));
}

function convertConfigToPixels(configData) {
    let convertedConfig = {};
    convertedConfig.border_phys = convertCoordsToPixels(configData.border_phys);
    convertedConfig.border_virt = convertCoordsToPixels(configData.border_virt);
    convertedConfig.obstacles_phys = configData.obstacles_phys.map(obstacle =>
        convertCoordsToPixels(obstacle)
    );
    convertedConfig.obstacles_virt = configData.obstacles_virt.map(obstacle =>
        convertCoordsToPixels(obstacle)
    );

    convertedConfig.poi = convertCoordsToPixels(configData.poi);

    convertedConfig.initial_user_phys = convertCoordsToPixels([configData.initial_user_phys])[0];
    console.log(convertedConfig.initial_user_phys);

    convertedConfig.initial_user_phys.angle = configData.initial_user_phys.angle;
    convertedConfig.initial_user_phys.v = configData.initial_user_phys.v * (delta_t / px_per_meter);
    convertedConfig.initial_user_phys.w = configData.initial_user_phys.w * (delta_t);

    convertedConfig.initial_user_virt = convertCoordsToPixels([configData.initial_user_virt])[0];
    convertedConfig.initial_user_virt.angle = configData.initial_user_virt.angle;
    convertedConfig.initial_user_virt.v = configData.initial_user_virt.v * (delta_t / px_per_meter);
    convertedConfig.initial_user_virt.w = configData.initial_user_virt.w * (delta_t);

    convertedConfig.walk_speed = configData.walk_speed * (delta_t / px_per_meter);
    convertedConfig.turn_speed = configData.turn_speed * (delta_t);

    return convertedConfig;
}

function convertConfigToCoords(configData) {
    let convertedConfig = {};
    convertedConfig.border_phys = convertPixelsToCoords(configData.border_phys);
    convertedConfig.border_virt = convertPixelsToCoords(configData.border_virt);
    convertedConfig.obstacles_phys = configData.obstacles_phys.map(obstacle =>
        convertPixelsToCoords(obstacle)
    );
    convertedConfig.obstacles_virt = configData.obstacles_virt.map(obstacle =>
        convertPixelsToCoords(obstacle)
    );

    convertedConfig.poi = convertPixelsToCoords(configData.poi);

    convertedConfig.initial_user_phys = convertPixelsToCoords([configData.initial_user_phys])[0];
    convertedConfig.initial_user_phys.angle = configData.initial_user_phys.angle;
    convertedConfig.initial_user_phys.v = configData.initial_user_phys.v / (delta_t / px_per_meter);
    convertedConfig.initial_user_phys.w = configData.initial_user_phys.w / (delta_t);

    convertedConfig.initial_user_virt = convertPixelsToCoords([configData.initial_user_virt])[0];
    convertedConfig.initial_user_virt.angle = configData.initial_user_virt.angle;
    convertedConfig.initial_user_virt.v = configData.initial_user_virt.v / (delta_t / px_per_meter);
    convertedConfig.initial_user_virt.w = configData.initial_user_virt.w / (delta_t);

    convertedConfig.walk_speed = configData.walk_speed / (delta_t / px_per_meter);
    convertedConfig.turn_speed = configData.turn_speed / (delta_t);

    return convertedConfig;
}

function loadConfig() {
    const savedConfig = localStorage.getItem('config');
    if (savedConfig) {
        config = JSON.parse(savedConfig); // Parse the JSON string back into an object
        updateView();
    }
}

// Function to save user configuration to localStorage
function saveConfig() {
    localStorage.setItem('config', JSON.stringify(config)); // Convert the object to a JSON string
}

// Load user configuration when the page loads
window.onload = loadConfig;

// ---------------------------- Draw functions ----------------------------

function getBoundingBox(polygon) {
    // Initialize min and max coordinates
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Iterate through each vertex of the polygon
    polygon.forEach(vertex => {
        if (vertex.x < minX) {
            minX = vertex.x; // Update minX
        }
        if (vertex.y < minY) {
            minY = vertex.y; // Update minY
        }
        if (vertex.x > maxX) {
            maxX = vertex.x; // Update maxX
        }
        if (vertex.y > maxY) {
            maxY = vertex.y; // Update maxY
        }
    });

    // Return the bounding box as an object
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

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
    points.forEach(point => {
        delete point.angle;
    });

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
    ctx.fillStyle = "white";
    drawPolygon(ctx, border);
    ctx.stroke();
    ctx.fill();

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
    bbox = getBoundingBox(config.border_phys);
    canvas_phys.width = bbox.width + 2;
    canvas_phys.height = bbox.height + 2;

    ctx = canvas_phys.getContext('2d');
    ctx.clearRect(0, 0, canvas_phys.width, canvas_phys.height);

    // Apply Scale
    // ctx.scale(scale_phys, scale_phys);

    ctx.save();
    ctx.translate(1, 1);

    drawEnvironment(ctx, config.border_phys, config.obstacles_phys);
    drawUser(ctx, user_phys, path_phys);

    ctx.restore();
}

function drawVirt() {
    bbox = getBoundingBox(config.border_virt);
    canvas_virt.width = bbox.width + 2;
    canvas_virt.height = bbox.height + 2;

    ctx = canvas_virt.getContext('2d');
    ctx.clearRect(0, 0, canvas_virt.width, canvas_virt.height);

    // Apply Scale
    // ctx.scale(scale_virt, scale_virt);
    ctx.save();
    ctx.translate(1, 1);

    drawEnvironment(ctx, config.border_virt, config.obstacles_virt);
    drawUser(ctx, user_virt, path_virt);

    ctx.restore();

}

// Function to update the HTML with variable values
function writeText() {
    document.getElementById('virtualPosition').textContent =
        `x: ${(user_virt.x * px_per_meter).toFixed(2)} m, y: ${(user_virt.y * px_per_meter).toFixed(2)} m, angle: ${user_virt.angle.toFixed(2)}`;
    document.getElementById('physicalPosition').textContent =
        `x: ${(user_phys.x * px_per_meter).toFixed(2)} m, y: ${(user_phys.y * px_per_meter).toFixed(2)} m, angle: ${user_phys.angle.toFixed(2)}`;
    document.getElementById('virtualDistance').textContent = distance_virt.toFixed(2) + ' m';
    document.getElementById('physicalDistance').textContent = distance_phys.toFixed(2) + ' m';
    document.getElementById('totalResets').textContent = reset_cnt;
}

function updateView() {
    drawVirt();
    drawPhys();
    writeText();
}

// Test when no socket
// updateView();


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

function checkCollisions(walkerPosition, border, obstacles) {
    if (!pointInPolygon(walkerPosition, border)) {
        console.log("Collide with border", walkerPosition, border);

        return true;
    }
    for (const obstacle of obstacles) {
        if (pointInPolygon(walkerPosition, obstacle)) {
            console.log("Collide with obstacle");

            return true; // Collision detected
        }
    }
    return false; // No collisions
}


// Walk simulation
function walk() {
    if (poi_index >= config.poi.length) {
        return false;
    }

    // Rotate/walk towards next poi with configured speed
    const target_poi = config.poi[poi_index];
    const target_direction = {
        x: target_poi.x - user_virt.x,
        y: target_poi.y - user_virt.y
    };

    const target_distance = Math.sqrt(target_direction.x ** 2 + target_direction.y ** 2);
    const target_angle = Math.atan2(target_direction.y, target_direction.x); // Angle to the target

    // Check if the walker is rotating or moving
    if (is_rotating) {
        // Rotate towards the target angle
        user_virt.w = config.turn_speed;
        if (Math.abs(user_virt.angle - target_angle) < Math.PI)
            if (user_virt.angle < target_angle) {
                user_virt.angle += config.turn_speed;
            }
            else {
                user_virt.angle -= config.turn_speed;
            }
        else {
            if (user_virt.angle < target_angle) {
                user_virt.angle -= config.turn_speed;
                if (user_virt.angle < - Math.PI) {
                    user_virt.angle += 2 * Math.PI;
                }
            }
            else {
                user_virt.angle += config.turn_speed;
                if (user_virt.angle > Math.PI) {
                    user_virt.angle -= 2 * Math.PI;
                }
            }
        }

        // Turned to target angle
        if (Math.abs(user_virt.angle - target_angle) < config.turn_speed) {
            user_virt.angle = target_angle; // Snap to the target angle
            user_virt.v = config.walk_speed;    // Start walking
            user_virt.w = 0;
            is_rotating = false; // Stop rotating
            // console.log(`Finished rotating towards POI: ${JSON.stringify(target_poi)}`);
        }
    }
    // Not rotating
    else {
        // Move towards next target POI
        if (target_distance > config.walk_speed) {
            const normalizedDirection = {
                x: target_direction.x / target_distance,
                y: target_direction.y / target_distance
            };

            distance_virt += Math.sqrt(normalizedDirection.x ** 2 + normalizedDirection.y ** 2) * config.walk_speed;

            user_virt.x += normalizedDirection.x * config.walk_speed;
            user_virt.y += normalizedDirection.y * config.walk_speed;
            user_virt.angle = target_angle;
            user_virt.v = config.walk_speed;
            user_virt.w = 0;
        }
        else {
            distance_virt += Math.sqrt((target_poi.x - user_virt.x) ** 2 + (target_poi.y - user_virt.y) ** 2);

            // Move to the target POI
            console.log(`Arrived at POI: ${JSON.stringify(target_poi)}, angle: ${user_virt.angle}, target angle: ${target_angle}`);

            user_virt.x = target_poi.x;
            user_virt.y = target_poi.y;
            user_virt.v = 0;
            user_virt.w = config.turn_speed;
            is_rotating = true; // Start rotating towards the next POI

            poi_index++;
        }
    }
    return true;
}

// -------------------------------- WebSocket ------------------------------

// Buttons

function WSStart() {
    if (state == SimState.before_start) {
        sendStartMsg();
        state = SimState.running;
    }
}

function WSPause() {
    if (state == SimState.running) {
        state = SimState.paused;
    }
    else if (state == SimState.paused) {
        state = SimState.running;
        ws.send(JSON.stringify(in_pause_msg));
    }
}

function WSReset() {
    if (state == SimState.running || state == SimState.paused || state == SimState.finnished) {
        if (state != SimState.finnished) {
            sendEndMsg();
        }
        init();
        updateView();
    }
}



let ws_time = 0;
let all_time = 0;

// Set up WebSocket connection to local Python server
const ws = new WebSocket('ws://localhost:8765');  // Connect to the local Python program

// WS Protocol
function StartMsg() {
    // Compose start message
    bbox_phys = getBoundingBox(config.border_phys);
    bbox_virt = getBoundingBox(config.border_virt);
    return {
        type: "start",
        physical: {
            height: bbox_phys.height,
            width: bbox_phys.width,
            border: config.border_phys,
            obstacle_list: config.obstacles_phys,
        },
        virtual: {
            height: bbox_virt.height,
            width: bbox_virt.width,
            border: config.border_virt,
            obstacle_list: config.obstacles_virt,
        }
    };
}

function RunMsg() {
    return {
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
}

function EndMsg() {
    return {
        type: "end",
    };
}

function sendStartMsg() {
    ws.send(JSON.stringify(StartMsg()));
}

function sendRunMsg() {
    if (state == SimState.running) {
        ws.send(JSON.stringify(RunMsg()));
    }
    else if (state == SimState.paused) {
        in_pause_msg = RunMsg();
    }
}

function sendEndMsg() {
    ws.send(JSON.stringify(EndMsg()));
}

ws.onopen = () => {
    console.log('WebSocket connection opened');
    all_time = performance.now();
    updateView();
};

ws.onmessage = async (event) => {
    if (state == SimState.before_start) {
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
                reset_cnt++;
                console.log("Reset: ", reset_cnt);

                need_reset = false;
            }
            else {
                // Calc distance
                distance_phys += Math.sqrt((msg.user_x - user_phys.x) ** 2 + (msg.user_y - user_phys.y) ** 2);

                // Reset detection
                need_reset = checkCollisions({ x: msg.user_x, y: msg.user_y }, config.border_phys, config.obstacles_phys);
            }

            // Accept this frame
            if (!need_reset) {
                // Update user physcial position
                user_phys = { x: msg.user_x, y: msg.user_y, angle: msg.user_direction }
                // Update path
                if (path_phys.push({ x: user_phys.x, y: user_phys.y }) > MAX_PATH_LEN)
                    path_phys.shift();
                if (path_virt.push({ x: user_virt.x, y: user_virt.y }) > MAX_PATH_LEN)
                    path_virt.shift();

                updateView();

                // New user virtual position for next frame
                if (!walk()) {
                    // Finish simulation
                    sendEndMsg();
                    state = SimState.finnished;
                    break;
                }
            }

            // Sleep
            await sleep(delta_t * 1000);

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


// ---------------------------- Online loop ----------------------------

// Buttons

function OLStart() {
    if (state == SimState.before_start) {
        state = SimState.running;
        loopWithUploadFile()
    }
}

function OLPause() {
    if (state == SimState.running) {
        state = SimState.paused;
    }
    else if (state == SimState.paused) {
        state = SimState.running;
    }
}

function OLReset() {
    if (state == SimState.running || state == SimState.paused || state == SimState.finnished) {
        init();
        updateView();
    }
}

async function loopWithUploadFile() {
    let user_phys_new = { x: user_phys.x, y: user_phys.y, angle: user_phys.angle };
    let has_reset = false;
    updateView();

    while (1) {
        // Check state
        while (state == SimState.paused) {
            // paused: do nothing
            await sleep(200);
        }
        if (state == SimState.before_start || state == SimState.finnished) {
            // reset: end loop
            break;
        }

        // TODO: Get new user physical with user uploaded functions
        if (need_reset) {
            user_phys_new = update_reset({ ...user_phys }, getBoundingBox(config.border_phys), delta_t);
            reset_cnt++;
            console.log("Reset: ", reset_cnt);
            need_reset = false;
        }
        else {
            user_phys_new = update_user({ ...user_phys }, getBoundingBox(config.border_phys), delta_t);

            // TODO: gain
            // if (universal)
            //     user_phys_new, has_reset = update_user(user_phys, config.border_phys, config.obstacles_phys, delta_t)
            // else {
            //     trans_gain, rot_gain, cur_gain_r = calc_gain(user_phys, config.border_phys, config.obstacles_phys, delta_t)
            //     user_phys_new = calc_move_with_gain(user_phys, trans_gain, rot_gain, cur_gain_r, delta_t)
            // }

            // Calc distance
            distance_phys += Math.sqrt((user_phys_new.x - user_phys.x) ** 2 + (user_phys_new.y - user_phys.y) ** 2);

            // Reset detection
            need_reset = checkCollisions({ x: user_phys_new.x, y: user_phys_new.y }, config.border_phys, config.obstacles_phys);
        }

        // Accept this frame
        if (!need_reset) {
            // Update user physcial position
            user_phys = { x: user_phys_new.x, y: user_phys_new.y, angle: user_phys_new.angle, v: user_virt.v, w: user_virt.w }
            // Update path
            if (path_phys.push({ x: user_phys.x, y: user_phys.y }) > MAX_PATH_LEN)
                path_phys.shift();
            if (path_virt.push({ x: user_virt.x, y: user_virt.y }) > MAX_PATH_LEN)
                path_virt.shift();

            updateView();

            // New user virtual position for next frame
            if (!walk()) {
                // Finish simulation
                state = SimState.finnished;
                break;
            }
        }
        // Sleep
        await sleep(delta_t * 1000);
    }
}