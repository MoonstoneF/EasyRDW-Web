// // 生成随机多边形
// function generateRandomPolygon(center, sides, radius) {
//     const points = [];
//     const angleStep = (Math.PI * 2) / sides;
//     for (let i = 0; i < sides; i++) {
//         const angle = i * angleStep;
//         const x = center[0] + Math.cos(angle) * radius * (0.8 + Math.random() * 0.4); // 随机偏移
//         const y = center[1] + Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
//         points.push([x, y]);
//     }
//     return points;
// }

// // 渲染环境函数
// function updateView() {
//     const physCanvas = document.getElementById('physCanvas');
//     const physCtx = physCanvas.getContext('2d');
//     const virtCanvas = document.getElementById('virtCanvas');
//     const virtCtx = virtCanvas.getContext('2d');

//     // 清空画布
//     physCtx.clearRect(0, 0, physCanvas.width, physCanvas.height);
//     virtCtx.clearRect(0, 0, virtCanvas.width, virtCanvas.height);

//     // 绘制物理空间和虚拟空间的边界
//     drawPolygon(physCtx, config.border_phys, 'white');
//     drawPolygon(virtCtx, config.border_virt, 'white');

//     // 绘制物理空间障碍物（随机多边形）
//     config.obstacles_phys.forEach(obstacle => {
//         const polygon = generateRandomPolygon(obstacle, 5, 15);  // 5边形, 半径15
//         physCtx.fillStyle = 'red';
//         drawPolygon(physCtx, polygon, 'red');
//     });

//     // 绘制虚拟空间障碍物（随机多边形）
//     config.obstacles_virt.forEach(obstacle => {
//         const polygon = generateRandomPolygon(obstacle, 6, 12);  // 6边形, 半径12
//         virtCtx.fillStyle = 'purple';
//         drawPolygon(virtCtx, polygon, 'purple');
//     });

//     // 绘制POI
//     config.poi.forEach(point => {
//         virtCtx.fillStyle = 'yellow';
//         virtCtx.beginPath();
//         virtCtx.arc(point[0], point[1], 5, 0, Math.PI * 2);
//         virtCtx.fill();
//     });

//     // 绘制用户
//     drawUser(physCtx, config.initial_user_phys, config.path_phys);
//     drawUser(virtCtx, config.initial_user_virt, config.path_virt);
// }

// // 绘制多边形函数（用于边界和障碍物）
// function drawPolygon(ctx, points, color) {
//     ctx.beginPath();
//     ctx.moveTo(points[0][0], points[0][1]);
//     points.forEach(point => ctx.lineTo(point[0], point[1]));
//     ctx.closePath();
//     ctx.fillStyle = color;
//     ctx.fill();
// }

// // Draw the user on the canvas as an arrow
// function drawUser(ctx, user, path) {
//     // Draw path
//     ctx.beginPath();
//     ctx.moveTo(path[0].x, path[0].y);
//     path.forEach(point => ctx.lineTo(point.x, point.y));
//     ctx.stroke();

//     // Draw the user as an arrow
//     ctx.save(); // Save the current canvas state
//     ctx.translate(user.x, user.y); // Move to the user's position
//     ctx.rotate(user.angle + Math.PI / 2); // Rotate the canvas to the user's angle

//     // Draw arrow shape
//     ctx.beginPath();
//     ctx.moveTo(0, -20); // Arrow tip
//     ctx.lineTo(-10, 10); // Left wing
//     ctx.lineTo(0, 0);    // Center
//     ctx.lineTo(10, 10);  // Right wing
//     ctx.closePath();
//     ctx.fillStyle = 'blue';
//     ctx.fill();
//     ctx.restore(); // Restore the canvas state
// }

// 配置环境选择按钮
document.getElementById('environment1').addEventListener('click', function () {
    config = {
        border_phys: [
            { x: 50, y: 50 },
            { x: 250, y: 50 },
            { x: 250, y: 250 },
            { x: 50, y: 250 }
        ],
        border_virt: [
            { x: 30, y: 30 },
            { x: 270, y: 30 },
            { x: 270, y: 270 },
            { x: 30, y: 270 }
        ],
        obstacles_phys: [
            [
                { x: 40, y: 40 },
                { x: 40, y: 80 },
                { x: 80, y: 80 },
                { x: 80, y: 40 }
            ],
            [
                { x: 120, y: 120 },
                { x: 120, y: 160 },
                { x: 160, y: 160 },
                { x: 160, y: 120 }
            ]
        ],
        obstacles_virt: [
            [
                { x: 50, y: 70 },
                { x: 50, y: 110 },
                { x: 90, y: 110 },
                { x: 90, y: 70 }
            ],
            [
                { x: 180, y: 180 },
                { x: 180, y: 220 },
                { x: 220, y: 220 },
                { x: 220, y: 180 }
            ]
        ],
        poi: [
            { x: 100, y: 100 },
            { x: 250, y: 180 }
        ],
        initial_user_phys: { x: 100, y: 100, angle: 0, v: 0, w: 0 },
        initial_user_virt: { x: 150, y: 150, angle: 0, v: 0, w: 0 },
        walk_speed: 2,
        turn_speed: 0.1,
    };

    updateView();
});

document.getElementById('environment2').addEventListener('click', function () {
    config = {
        border_phys: [
            { x: 20, y: 20 },
            { x: 280, y: 20 },
            { x: 280, y: 280 },
            { x: 20, y: 280 }
        ],
        border_virt: [
            { x: 40, y: 40 },
            { x: 260, y: 40 },
            { x: 260, y: 260 },
            { x: 40, y: 260 }
        ],
        obstacles_phys: [
            [
                { x: 80, y: 80 },
                { x: 80, y: 120 },
                { x: 120, y: 120 },
                { x: 120, y: 80 }
            ],
            [
                { x: 160, y: 160 },
                { x: 160, y: 200 },
                { x: 200, y: 200 },
                { x: 200, y: 160 }
            ]
        ],
        obstacles_virt: [
            [
                { x: 70, y: 100 },
                { x: 70, y: 140 },
                { x: 110, y: 140 },
                { x: 110, y: 100 }
            ],
            [
                { x: 150, y: 150 },
                { x: 150, y: 190 },
                { x: 190, y: 190 },
                { x: 190, y: 150 }
            ]
        ],
        poi: [
            { x: 120, y: 120 },
            { x: 130, y: 210 }
        ],
        initial_user_phys: { x: 90, y: 90, angle: 0, v: 0, w: 0 },
        initial_user_virt: { x: 140, y: 140, angle: 0, v: 0, w: 0 },
        walk_speed: 2,
        turn_speed: 0.1,
    };

    updateView();
});

document.getElementById('environment3').addEventListener('click', function () {
    config = {
        border_phys: [
            { x: 10, y: 10 },
            { x: 290, y: 10 },
            { x: 290, y: 290 },
            { x: 10, y: 290 }
        ],
        border_virt: [
            { x: 60, y: 60 },
            { x: 240, y: 60 },
            { x: 240, y: 240 },
            { x: 60, y: 240 }
        ],
        obstacles_phys: [
            [
                { x: 50, y: 150 },
                { x: 50, y: 190 },
                { x: 90, y: 190 },
                { x: 90, y: 150 }
            ],
            [
                { x: 150, y: 50 },
                { x: 150, y: 90 },
                { x: 190, y: 90 },
                { x: 190, y: 50 }
            ]
        ],
        obstacles_virt: [
            [
                { x: 80, y: 80 },
                { x: 80, y: 120 },
                { x: 120, y: 120 },
                { x: 120, y: 80 }
            ],
            [
                { x: 190, y: 190 },
                { x: 190, y: 230 },
                { x: 230, y: 230 },
                { x: 230, y: 190 }
            ]
        ],
        poi: [
            { x: 60, y: 200 },
            { x: 190, y: 60 },
            { x: 150, y: 100 }
        ],
        initial_user_phys: { x: 50, y: 200, angle: 0, v: 0, w: 0 },
        initial_user_virt: { x: 190, y: 60, angle: 0, v: 0, w: 0 },
        walk_speed: 2,
        turn_speed: 0.1,
    };

    updateView();
});

document.getElementById('environment4').addEventListener('click', function () {
    config = {
        border_phys: [
            { x: 30, y: 30 },
            { x: 270, y: 30 },
            { x: 270, y: 270 },
            { x: 30, y: 270 }
        ],
        border_virt: [
            { x: 20, y: 20 },
            { x: 280, y: 20 },
            { x: 280, y: 280 },
            { x: 20, y: 280 }
        ],
        obstacles_phys: [
            [
                { x: 100, y: 100 },
                { x: 100, y: 140 },
                { x: 140, y: 140 },
                { x: 140, y: 100 }
            ],
            [
                { x: 200, y: 50 },
                { x: 200, y: 90 },
                { x: 240, y: 90 },
                { x: 240, y: 50 }
            ]
        ],
        obstacles_virt: [
            [
                { x: 120, y: 120 },
                { x: 120, y: 160 },
                { x: 160, y: 160 },
                { x: 160, y: 120 }
            ],
            [
                { x: 160, y: 160 },
                { x: 160, y: 200 },
                { x: 200, y: 200 },
                { x: 200, y: 160 }
            ]
        ],
        poi: [
            { x: 100, y: 100 },
            { x: 100, y: 200 }
        ],
        initial_user_phys: { x: 100, y: 50, angle: 0, v: 0, w: 0 },
        initial_user_virt: { x: 160, y: 60, angle: 0, v: 0, w: 0 },
        walk_speed: 2,
        turn_speed: 0.1,
    };

    updateView();
});

document.getElementById('environment5').addEventListener('click', function () {
    config = {
        border_phys: [
            { x: 40, y: 40 },
            { x: 260, y: 40 },
            { x: 260, y: 260 },
            { x: 40, y: 260 }
        ],
        border_virt: [
            { x: 50, y: 50 },
            { x: 250, y: 50 },
            { x: 250, y: 250 },
            { x: 50, y: 250 }
        ],
        obstacles_phys: [
            [
                { x: 75, y: 75 },
                { x: 75, y: 115 },
                { x: 115, y: 115 },
                { x: 115, y: 75 }
            ],
            [
                { x: 225, y: 150 },
                { x: 225, y: 190 },
                { x: 265, y: 190 },
                { x: 265, y: 150 }
            ]
        ],
        obstacles_virt: [
            [
                { x: 65, y: 95 },
                { x: 65, y: 135 },
                { x: 105, y: 135 },
                { x: 105, y: 95 }
            ],
            [
                { x: 135, y: 195 },
                { x: 135, y: 235 },
                { x: 175, y: 235 },
                { x: 175, y: 195 }
            ]
        ],
        poi: [
            { x: 160, y: 160 },
            { x: 200, y: 100 }
        ],
        initial_user_phys: { x: 90, y: 120, angle: 0, v: 0, w: 0 },
        initial_user_virt: { x: 130, y: 160, angle: 0, v: 0, w: 0 },
        walk_speed: 2,
        turn_speed: 0.1,
    };

    updateView();
});
