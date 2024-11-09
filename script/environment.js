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
//     drawUser(physCtx, config.user_phys, config.path_phys);
//     drawUser(virtCtx, config.user_virt, config.path_virt);
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
    // 设置环境1的配置数据
    config.border_phys = [[50, 50], [250, 50], [250, 250], [50, 250]];
    config.border_virt = [[30, 30], [270, 30], [270, 270], [30, 270]];
    config.obstacles_phys = [[60, 60], [150, 150], [200, 100]];
    config.obstacles_virt = [[50, 70], [180, 180], [220, 90]];
    config.poi = [[100, 100], [200, 200]];
    config.initial_user_phys = { x: 100, y: 100, angle: 0, v: 0, w: 0 };
    config.initial_user_virt = { x: 150, y: 150, angle: 0, v: 0, w: 0 };

    // 渲染环境
    updateView();
});

document.getElementById('environment2').addEventListener('click', function () {
    config.border_phys = [[20, 20], [280, 20], [280, 280], [20, 280]];
    config.border_virt = [[40, 40], [260, 40], [260, 260], [40, 260]];
    config.obstacles_phys = [[80, 80], [160, 160], [240, 100]];
    config.obstacles_virt = [[70, 100], [150, 150], [230, 110]];
    config.poi = [[120, 120], [210, 210]];
    config.initial_user_phys = { x: 90, y: 90, angle: 0, v: 0, w: 0 };
    config.initial_user_virt = { x: 140, y: 140, angle: 0, v: 0, w: 0 };

    updateView();
});

document.getElementById('environment3').addEventListener('click', function () {
    config.border_phys = [[10, 10], [290, 10], [290, 290], [10, 290]];
    config.border_virt = [[60, 60], [240, 60], [240, 240], [60, 240]];
    config.obstacles_phys = [[50, 150], [150, 50], [200, 200]];
    config.obstacles_virt = [[80, 80], [190, 190], [110, 130]];
    config.poi = [[60, 200], [190, 60], [100, 100]];
    config.initial_user_phys = { x: 50, y: 200, angle: 0, v: 0, w: 0 };
    config.initial_user_virt = { x: 190, y: 60, angle: 0, v: 0, w: 0 };

    updateView();
});

document.getElementById('environment4').addEventListener('click', function () {
    config.border_phys = [[30, 30], [270, 30], [270, 270], [30, 270]];
    config.border_virt = [[20, 20], [280, 20], [280, 280], [20, 280]];
    config.obstacles_phys = [[100, 100], [200, 50], [150, 200]];
    config.obstacles_virt = [[120, 120], [160, 160], [210, 100]];
    config.poi = [[130, 130], [180, 180]];
    config.initial_user_phys = { x: 100, y: 50, angle: 0, v: 0, w: 0 };
    config.initial_user_virt = { x: 160, y: 60, angle: 0, v: 0, w: 0 };

    updateView();
});

document.getElementById('environment5').addEventListener('click', function () {
    config.border_phys = [[40, 40], [260, 40], [260, 260], [40, 260]];
    config.border_virt = [[50, 50], [250, 50], [250, 250], [50, 250]];
    config.obstacles_phys = [[75, 75], [225, 150], [125, 225]];
    config.obstacles_virt = [[65, 95], [135, 195], [225, 105]];
    config.poi = [[160, 160], [200, 100]];
    config.initial_user_phys = { x: 90, y: 120, angle: 0, v: 0, w: 0 };
    config.initial_user_virt = { x: 130, y: 160, angle: 0, v: 0, w: 0 };

    updateView();
});
