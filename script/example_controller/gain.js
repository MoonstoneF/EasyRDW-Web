MIN_CUR_GAIN_R = 7.5;

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
    const trans_gain = 1;
    const rot_gain = 1;
    const cur_gain = MIN_CUR_GAIN_R * rot_dir;
    return { trans_gain, rot_gain, cur_gain };
}