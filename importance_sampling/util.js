function spherical_to_cart(theta, phi, r = 1.0) {
    const st = Math.sin(theta);
    const ct = Math.cos(theta);
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);

    const x = r * st * sp;
    const y = r * ct;
    const z = r * st * cp;

    return [x, y, z];

}

function polar_to_cart(r, alpha) {
    const sa = Math.sin(alpha);
    const ca = Math.cos(alpha);

    const x = r * ca;
    const y = r * sa;

    return [x, y];

}