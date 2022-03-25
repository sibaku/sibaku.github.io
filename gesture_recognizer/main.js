import * as m from './jsmatrix.js';
import {
    VecF32,
    MatF32,
    VecF64,
    MatF64
} from "./jsmatrix.js";


import { VecF32 as v32 } from './jsmatrix.js';


const v2 = (x, y) => v32.from([x, y]);

let canvas = null;
let ctx = null;

/**
 * 
 * @param {AbstractMat} points 
 * @param {Number} dim 
 */
function center_points(points, dim = 0, normalize = false, min_extent = 0.0) {

    const row = m.row(points, dim);
    const dmin = m.min(row);
    const dmax = m.max(row);

    const dhalf_size = 0.5 * (dmax - dmin);
    const dcenter = dmin + dhalf_size;

    const scale = normalize && dhalf_size > min_extent ? 1.0 / dhalf_size : 1.0;
    m.colwise(row, (col, j) => {
        row.set((col.at(0) - dcenter) * scale, 0, j);
    });

    return { center: dcenter, scale: dhalf_size };
}

/**
 * 
 * @param {AbstractMat} points 
 */
function resample_points(points, res = 64) {
    let sum = 0.0;

    let n = points.cols();

    const l = [];
    l.push(0);
    for (let i = 1; i < n; i++) {
        const p0 = m.col(points, i - 1);
        const p1 = m.col(points, i);

        sum += m.norm(m.fromTo(p0, p1));
        l.push(sum);
    }
    const num_segments = res - 1;
    const dt = sum / num_segments;
    let uidx = 0;

    const result = m.similar(points, 2, res);
    for (let i = 0; i < res - 1; i++) {
        const t = dt * i;

        // update uidx
        while (t >= l[uidx + 1]) {
            uidx++;
        }
        const tl = l[uidx];
        const tr = l[uidx + 1];

        const alpha = (t - tl) / (tr - tl);

        // interpolate from points around
        const pa = m.add(
            m.scale(m.col(points, uidx), 1.0 - alpha),
            m.scale(m.col(points, uidx + 1), alpha)
        );

        m.insert(m.col(result, i), pa);
    }
    // insert last point
    m.insert(m.col(result, res - 1), m.col(points, n - 1));

    return result;
}

function rotate_indicative_angle(points) {
    const p0 = m.col(points, 0);

    const center = m.rowreduce(points, (row, i) => {
        return m.sum(row) / row.cols();
    });

    const dif = m.fromTo(center, p0);
    const alpha = Math.atan2(dif.at(1), dif.at(0));

    const M = rot2(-alpha);
    return {
        rotated_points:
            m.mult(M, points),
        angle: alpha
    };
}

function vectorize(points) {
    const n = points.cols();
    const r = VecF32.uninitialized(2 * n);

    m.colwise(points, (col, j) => {
        r.set(col.at(0), 2 * j);
        r.set(col.at(0), 2 * j + 1);
    });

    return r;
}

function similarity(vt, vg) {
    const n = vt.cols();

    let vtvg = 0.0;
    let norm2_vt = 0.0;
    let norm2_vg = 0.0;

    for (let i = 0; i < n; i++) {
        vtvg += m.dot(m.col(vt, i), m.col(vg, i));
        norm2_vt += m.norm2Squared(m.col(vt, i));
        norm2_vg += m.norm2Squared(m.col(vg, i));
    }

    let val = vtvg / (Math.sqrt(norm2_vt) * Math.sqrt(norm2_vg));
    val = Math.max(-1, Math.min(1, val));
    return 1.0 / Math.acos(val);
}

function calc_optimal_angle(vt, vg) {
    let a = 0.0;
    let b = 0.0;

    const n = vt.cols();
    for (let i = 0; i < n; i++) {
        const vti = m.col(vt, i);
        const vgi = m.col(vg, i);
        a += m.dot(vti, vgi);

        b += vti.at(0) * vgi.at(1) - vti.at(1) * vgi.at(0);
    }

    return Math.atan2(b, a);
}

class Template {
    constructor(name, { normalize = false, res = 64, fix_angle = false } = {}) {
        this.name = name;
        this.options = {};
        this.options.normalize = normalize;
        this.options.res = res;
        this.fix_angle = fix_angle;
        this.centroids = [];
        this.patterns = [];
        this.scales = [];
        this.resampled_patterns = [];
        this.resampled_angles = [];
        this.pattern_vector = [];
    }

    /**
     * 
     * @param {AbstractMat} points A 2xn matrix containing all points in its columns
     */
    add_pattern(points) {
        let p = m.copy(points);


        const centroid = [];
        const scales = [];
        let center;
        let scale;
        ({ center, scale } = center_points(p, 0, this.options.normalize));
        centroid.push(center);
        scales.push(scale);

        ({ center, scale } = center_points(p, 1, this.options.normalize));
        centroid.push(center);
        scales.push(scale);


        if (this.fix_angle) {
            this.patterns.push(p);

        } else {

            const { rotated_points, angle } = rotate_indicative_angle(p);
            // this.patterns.push(p);
            this.patterns.push(rotated_points);
        }


        this.centroids.push(v32.from(centroid));
        this.scales.push(v32.from(scales));



        let pr = resample_points(p, this.options.res);
        if (this.fix_angle) {
            this.resampled_patterns.push(pr);
            this.resampled_angles.push(0.0);
        } else {
            const { rotated_points, angle } = rotate_indicative_angle(pr);
            this.resampled_patterns.push(rotated_points);
            this.resampled_angles.push(angle);
        }


        this.pattern_vector.push(vectorize(pr));
    }


};


function find_minimum(templates, gestures, gestures_unrotated) {
    let min_idx = -1;
    let min_dist = -Infinity;
    let theta_min = 0;
    let pattern = null;
    let pattern_angle = 0;
    for (let i = 0; i < templates.length; i++) {
        const ti = templates[i];

        const gidx = ti.normalize ? 0 : 1;

        const gesture = gestures[gidx];
        const gesture_unrotated = gestures_unrotated[gidx];
        for (let j = 0; j < ti.resampled_patterns.length; j++) {
            let pj = ti.resampled_patterns[j];

            let theta = 0.0;
            let d = 0.0;
            let angle = 0.0;
            let comp = gesture;
            if (!ti.fix_angle) {
                theta = calc_optimal_angle(pj, gesture);
                const R = rot2(theta);
                pj = m.mult(R, pj);
                angle = ti.resampled_angles[j];
            } else {
                comp = gesture_unrotated;
                let theta_fix = calc_optimal_angle(pj, gesture);
                theta_fix = Math.min(2.0 * Math.PI / 36.0, Math.max(-2.0 * Math.PI / 36.0, theta_fix));
                const R = rot2(theta_fix);
                pj = m.mult(R, pj);
            }
            d = similarity(pj, comp);



            if (d > min_dist) {
                min_dist = d;
                min_idx = i;
                theta_min = theta;
                pattern = ti.patterns[j];
                pattern_angle = angle;
            }

        }
    }

    return { min_idx, min_dist, theta_min, pattern, pattern_angle };
}



function draw_points(points, ctx, M = MatF32.id(3, 3)) {
    const n = points.cols();

    if (n < 2) {
        return;
    }

    const pt = m.mult(M, m.PaddedView.new(points, 3, n, 1, 1));

    ctx.save();
    let p = m.col(pt, 0);

    ctx.beginPath();
    ctx.arc(pt.at(0), pt.at(1), 10, 0, 2.0 * Math.PI);
    ctx.fill();
    ctx.beginPath();

    ctx.moveTo(p.at(0), p.at(1));

    for (let i = 1; i < n; i++) {
        p = m.col(pt, i);

        ctx.lineTo(p.at(0), p.at(1));

    }
    ctx.stroke();


    ctx.restore();
}

function update() {

    const cur = Date.now();
    let dt = cur - lastTime;
    lastTime = cur;

    window.requestAnimationFrame(update);

}

function translation2(v) {
    const T = MatF32.id(3, 3);
    m.insert(m.subvec(m.col(T, 2), 0, 2), v);

    return T;
}

function scale(v) {
    const S = MatF32.id(3, 3);
    m.insert(m.subvec(m.diag(S), 0, 2), v);
    return S;

}

function rot2(alpha) {
    const R = MatF32.id(2, 2);
    const ca = Math.cos(alpha);
    const sa = Math.sin(alpha);
    R.set(ca, 0, 0);
    R.set(ca, 1, 1);

    R.set(sa, 1, 0);
    R.set(-sa, 0, 1);
    return R;
}

function rot3(alpha) {
    const R = MatF32.id(3, 3);
    const ca = Math.cos(alpha);
    const sa = Math.sin(alpha);
    R.set(ca, 0, 0);
    R.set(ca, 1, 1);

    R.set(sa, 1, 0);
    R.set(-sa, 0, 1);
    return R;
}


const templates = []



document.body.onload = () => {

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    // ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
    ctx.canvas.style.touchAction = "none";

    const res = 32;



    const t0 = new Template("triangle", { res: res, normalize: true });

    t0.add_pattern(MatF32.fromCols([
        v2(0, 0),
        v2(2, 0),
        v2(1, 1),
        v2(0, 0),

    ]));
    t0.add_pattern(MatF32.fromCols([
        v2(2, 0),
        v2(1, 1),
        v2(0, 0),
        v2(2, 0),

    ]));
    t0.add_pattern(MatF32.fromCols([
        v2(1, 1),
        v2(0, 0),
        v2(2, 0),
        v2(1, 1),

    ]));
    t0.add_pattern(MatF32.fromCols([
        v2(0, 0),
        v2(1, 1),
        v2(2, 0),
        v2(0, 0),

    ]));
    t0.add_pattern(MatF32.fromCols([
        v2(1, 1),
        v2(2, 0),
        v2(0, 0),
        v2(1, 1),

    ]));
    t0.add_pattern(MatF32.fromCols([
        v2(2, 0),
        v2(0, 0),
        v2(1, 1),
        v2(2, 0),


    ]));
    templates.push(t0);


    const t1 = new Template("rect", { res: res, normalize: true, fix_angle: true });

    t1.add_pattern(MatF32.fromCols([
        v2(0, 0),
        v2(1, 0),
        v2(1, 1),
        v2(0, 1),
        v2(0, 0),

    ]));

    t1.add_pattern(MatF32.fromCols([

        v2(1, 0),
        v2(1, 1),
        v2(0, 1),
        v2(0, 0),
        v2(1, 0),

    ]));
    t1.add_pattern(MatF32.fromCols([

        v2(1, 1),
        v2(0, 1),
        v2(0, 0),
        v2(1, 0),
        v2(1, 1),

    ]));

    t1.add_pattern(MatF32.fromCols([

        v2(0, 1),
        v2(0, 0),
        v2(1, 0),
        v2(1, 1),
        v2(0, 1),

    ]));

    t1.add_pattern(MatF32.fromCols([
        v2(0, 0),
        v2(0, 1),
        v2(1, 1),
        v2(1, 0),
        v2(0, 0),

    ]));
    t1.add_pattern(MatF32.fromCols([

        v2(0, 1),
        v2(1, 1),
        v2(1, 0),
        v2(0, 0),
        v2(0, 1),


    ]));
    t1.add_pattern(MatF32.fromCols([

        v2(1, 1),
        v2(1, 0),
        v2(0, 0),
        v2(0, 1),
        v2(1, 1),

    ]));
    t1.add_pattern(MatF32.fromCols([

        v2(1, 0),
        v2(0, 0),
        v2(0, 1),
        v2(1, 1),
        v2(1, 0),

    ]));
    templates.push(t1);


    const t2 = new Template("line", { res: res, normalize: false });

    t2.add_pattern(MatF32.fromCols([
        v2(0, 0),
        v2(1, 0),

    ]));
    t2.add_pattern(MatF32.fromCols([
        v2(1, 0),
        v2(0, 0),

    ]));
    templates.push(t2);


    const t3 = new Template("circle", { res: res, normalize: true });

    {
        const cpoints = [];
        const r = 128;
        for (let i = 0; i < r; i++) {
            const t = 2.0 * Math.PI * i / (r - 1);
            cpoints.push(v2(
                Math.cos(t),
                Math.sin(t)
            ));
        }
        t3.add_pattern(MatF32.fromCols(cpoints));
    }
    {
        const cpoints = [];
        const r = 128;
        for (let i = 0; i < r; i++) {
            const t = -2.0 * Math.PI * i / (r - 1);
            cpoints.push(v2(
                Math.cos(t),
                Math.sin(t)
            ));
        }
        t3.add_pattern(MatF32.fromCols(cpoints));

    }
    templates.push(t3);



    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();

        return v2(evt.clientX - rect.left, evt.clientY - rect.top);
    }

    let state = {};
    state.mouse_points = [];
    state.down = false;
    const mousedown = (e) => {
        state.mouse_points = [];
        state.down = true;
        state.mouse_points.push(getMousePos(canvas, e));
    };
    const mousemove = (e) => {
        if (!state.down) {
            return;
        }
        state.mouse_points.push(getMousePos(canvas, e));

        const g = MatF32.fromCols(state.mouse_points);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.strokeStyle = "rgb(255,0,0)";
        draw_points(g, ctx);

        ctx.restore();
    };

    const mouseup = (e) => {
        state.down = false;

        state.mouse_points.push(getMousePos(canvas, e));

        const g = MatF32.fromCols(state.mouse_points);


        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.strokeStyle = "rgb(255,0,0)";
        ctx.lineWidth = 2;
        draw_points(g, ctx);


        let params = [false, true];

        let gs = [];
        let gs_unrotated = [];
        let gs_orig = [];
        let gs_angles = [];
        let gs_centroids = [];
        let gs_scales = [];

        for (let i = 0; i < params.length; i++) {
            const pi = params[i];
            const gi = m.copy(g);
            const centroid = [];
            const scales = [];
            let center;
            let scale;
            ({ center, scale } = center_points(gi, 0, pi));
            centroid.push(center);
            scales.push(scale);

            ({ center, scale } = center_points(gi, 1, pi));
            centroid.push(center);
            scales.push(scale);


            {
                const { rotated_points, angle } = rotate_indicative_angle(gi);
                gs_orig.push(rotated_points);

            }
            let gr = resample_points(gi, res);
            const { rotated_points, angle } = rotate_indicative_angle(gr);

            gs_unrotated.push(gr);
            gs.push(rotated_points);
            gs_angles.push(angle);
            gs_centroids.push(v32.from(centroid));
            gs_scales.push(v32.from(scales));
        }


        let gr = gs[0];

        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.lineWidth = 1;

        // draw_points(gr, ctx,
        //     m.mult(
        //         translation2(gs_centroids[0]),
        //         rot3(gs_angles[0])
        //     )
        // );

        ctx.strokeStyle = "rgb(128,128,0)";
        ctx.lineWidth = 1;
        // draw_points(gr, ctx,
        //     m.mult(
        //         translation2(gs_centroids[0]),
        //         rot3(0)
        //     )
        // );
        const { min_idx, min_dist, theta_min, pattern, pattern_angle } = find_minimum(templates, gs, gs_unrotated);

        console.log("Found shape: " + templates[min_idx].name);


        const MR = rot3(gs_angles[0]);

        const compare_geom = templates[min_idx].fix_angle ? gs_unrotated[0] : gs[0];

        const pattern_local = m.mult(rot2(pattern_angle), pattern);
        // ctx.strokeStyle = "rgb(0,128,255)";
        // ctx.lineWidth = 4;
        // draw_points(pattern_local, ctx,
        //     m.mult(
        //         translation2(gs_centroids[0]),
        //         scale(v2(50, 50))
        //     )
        // );

        const bmin_pattern = m.rowreduce(pattern_local, (row, i) => {
            return m.min(row);
        });
        const bmax_pattern = m.rowreduce(pattern_local, (row, i) => {
            return m.max(row);
        });


        const g_local = m.mult(rot2(pattern_angle), compare_geom);

        // ctx.strokeStyle = "rgb(65,0,128)";
        // ctx.lineWidth = 2;
        // draw_points(gs_orig[0], ctx,
        //     translation2(gs_centroids[0])

        // );

        // ctx.strokeStyle = "rgb(255,0,128)";
        // ctx.lineWidth = 6;
        // draw_points(g_local, ctx,
        //     translation2(gs_centroids[0])

        // );
        const bmin_g = m.rowreduce(g_local, (row, i) => {
            return m.min(row);
        });
        const bmax_g = m.rowreduce(g_local, (row, i) => {
            return m.max(row);
        });

        let sx = 1.0;
        let sy = 1.0;

        const bdelta_p = m.sub(bmax_pattern, bmin_pattern);
        const bdelta_g = m.sub(bmax_g, bmin_g);
        if (bdelta_p.at(0) > 0.0) {
            sx = bdelta_g.at(0) / bdelta_p.at(0);
        }
        if (bdelta_p.at(1) > 0.0) {
            sy = bdelta_g.at(1) / bdelta_p.at(1);
        }

        let local_angle = 0.0;
        if (!templates[min_idx].fix_angle) {
            local_angle = gs_angles[0];
        }
        // transform and draw
        // const MRT = rot3(theta_min);
        const MRT = rot3(theta_min - pattern_angle + local_angle);
        // const MR = rot3(0.0);
        const MS = scale(v2(sx, sy));
        // const MS = scale(v2(50, 50));
        const MT = translation2(gs_centroids[0]);

        // const M = m.mult(
        //     MT, m.mult(
        //         MRT,
        //         m.mult(
        //             MR, MS
        //         )
        //     )
        // );
        const M = m.mult(
            MT, m.mult(
                MRT, MS

            )
        );

        const pt = m.mult(M, m.PaddedView.new(pattern_local, 3, pattern.cols(), 1, 1));


        ctx.strokeStyle = "rgb(0,0,255)";
        ctx.lineWidth = 8;

        draw_points(pt, ctx);


        ctx.restore();

    };
    canvas.addEventListener('mousedown', mousedown, false);

    canvas.addEventListener('mousemove', mousemove, false);

    canvas.addEventListener('mouseup', mouseup, false);

    // draw_points(t0.resampled_patterns[0], ctx);
    // update();



};