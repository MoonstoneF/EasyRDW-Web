MIN_CUR_GAIN_R = 7.5;

function mapf_calc_f(width, height, pos) {
    const gamma = 2.5;
    const x_f = width * (Math.pow(pos[0], -gamma) - Math.pow(width - pos[0], -gamma));
    const y_f = height * (Math.pow(pos[1], -gamma) - Math.pow(height - pos[1], -gamma));
    return [x_f, y_f];
}

function calc_gain(user, physical_space, border, obstacles, delta) {
    const [x_f, y_f] = mapf_calc_f(physical_space.width, physical_space.height, [user.x, user.y]);
    const mapf_angle = Math.atan2(y_f, x_f);
    const rot_angle = (mapf_angle - user.direction) % (2 * Math.PI);
    let rot_dir = 0;
    if (rot_angle > Math.PI) {
        rot_dir = -1;
    } else {
        rot_dir = 1;
    }
    const trans_gain = 1.1;
    const rot_gain = 1;
    const cur_gain = MIN_CUR_GAIN_R * rot_dir;
    return { trans_gain, rot_gain, cur_gain };
}

function calc_move_with_gain(user, trans_gain, rot_gain, cur_gain, delta) {
    x = user.x;
    y = user.y;
    angle = user.angle;
    v = user.v;
    w = user.w;

    let trans = v / trans_gain;
    let rot = w / rot_gain;

    user.angle += rot + trans / cur_gain;
    user.angle %= 2 * Math.PI;
    user.x += trans * Math.cos(user.angle);
    user.y += trans * Math.sin(user.angle);

    return user;
}

function update_user(user, physical_space, border, obstacles, delta) {
    const { trans_gain, rot_gain, cur_gain } = calc_gain(user, physical_space, border, obstacles, delta);
    const new_user = calc_move_with_gain(user, trans_gain, rot_gain, cur_gain, delta);
    return new_user;
}

function update_reset(user, physical_space, border, obstacles, delta) {
    user.angle += Math.PI;
    user.angle %= 2 * Math.PI;
    return user;
}