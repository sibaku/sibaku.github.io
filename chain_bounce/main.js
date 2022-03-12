import * as m from './jsmatrix.js';
import {
    VecF32,
    MatF32,
    VecF64,
    MatF64
} from "./jsmatrix.js";


import { VecF32 as v32 } from './jsmatrix.js';


let canvas = null;
let ctx = null;


let chain = [];
let exact_chain = [];
let planes = [];


const d = v32.from([-1, 2]);

let lastTime = null;
const g = v32.from([0, -10]);

const orig = v32.from([400, 100]);
const r = 10;

const debug = false;
const show_numeric = false;
const show_exact = true;

class Plane {

    constructor(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;

        this.v = m.fromTo(p0, p1);
        this.n = m.normalize(v32.from([-this.v.at(1), this.v.at(0)]));
    }

    dist(p) {
        const r = m.fromTo(this.p0, p);
        return m.dot(r, this.n);
    }
};


function drawChain(chain) {
    ctx.save();
    for (let i = 0; i < chain.length; i++) {
        const ci = chain[i];
        ctx.beginPath();

        let col = ci.col;
        m.scale(col, 255, col);
        col = m.VecUI8Clamped.copy(col);
        let fs = `rgb(${col.at(0)},${col.at(1)},${col.at(2)})`;
        ctx.fillStyle = fs;
        ctx.arc(ci.p.at(0), ci.p.at(1), ci.r, 0, 2.0 * Math.PI);
        ctx.fill();

    }

    ctx.strokeStyle = "rgb(255,255,255)";
    ctx.beginPath();
    for (let i = 0; i < chain.length - 1; i++) {
        const ci = chain[i];
        const cip = chain[i + 1];
        ctx.moveTo(ci.p.at(0), ci.p.at(1));
        ctx.lineTo(cip.p.at(0), cip.p.at(1));
    }
    ctx.stroke();


    ctx.restore();
}

function drawPlanes(planes) {
    ctx.save();
    ctx.linewidth = 2;
    for (let i = 0; i < planes.length; i++) {
        const pi = planes[i];
        ctx.beginPath();

        ctx.strokeStyle = "rgb(255,255,255)";

        ctx.moveTo(pi.p0.at(0), pi.p0.at(1));
        ctx.lineTo(pi.p1.at(0), pi.p1.at(1));
        if (debug) {
            // debug normal
            const mid = m.add(pi.p0, m.scale(pi.v, 0.5));
            ctx.moveTo(mid.at(0), mid.at(1));
            m.add(mid, m.scale(pi.n, 100), mid);
            ctx.lineTo(mid.at(0), mid.at(1));
        }

        ctx.stroke();

    }
    ctx.restore();
}

function reflect(i, n) {
    return m.sub(i,
        m.scale(n, 2.0 * m.dot(n, i)));
}

function update() {

    const cur = Date.now();
    let dt = cur - lastTime;
    lastTime = cur;

    dt = Math.min(dt, 1.0 / 120.0);

    const substeps = 20;

    if (show_numeric) {
        for (let s = 0; s < substeps; s++) {
            for (let i = 0; i < chain.length; i++) {
                const ci = chain[i];
                m.add(ci.v, m.scale(g, dt), ci.v);
                m.add(ci.p, m.scale(ci.v, dt), ci.p);
            }

            // collision
            for (let i = 0; i < chain.length; i++) {
                const ci = chain[i];

                for (let j = 0; j < planes.length; j++) {
                    const pj = planes[j];

                    const d = pj.dist(ci.p);

                    if (d > ci.r) {
                        continue;
                    }

                    m.add(ci.p, m.scale(pj.n, ci.r - d), ci.p);

                    if (m.dot(ci.v, pj.n) >= 0.0) {
                        continue;
                    }

                    ci.v = reflect(ci.v, pj.n);
                }
            }
        }

    }


    // exact update
    if (show_exact) {
        for (let s = 0; s < substeps; s++) {
            for (let i = 0; i < exact_chain.length; i++) {

                const ci = exact_chain[i];
                ci.t += ci.dir * dt;
                if (ci.t > ci.t_max) {
                    ci.dir *= -1.0;
                    ci.t = 2.0 * ci.t_max - ci.t;
                }
                else if (ci.t < 0.0) {
                    ci.dir *= -1.0;
                    ci.t = -ci.t;
                }
            }
        }

        for (let i = 0; i < exact_chain.length; i++) {

            const ci = exact_chain[i];

            const dx = d.at(0);
            const dy = d.at(1);
            const gy = g.at(1);
            const h = ci.h;
            const rad = Math.sqrt(-gy * h / (dx * dx + 2.0 * dy * dy));
            const t = ci.t;
            ci.p = v32.from(
                [
                    2.0 * dx * dy * h / (dx * dx + 2.0 * dy * dy) + Math.sqrt(2) * dy * t * rad,
                    -Math.sqrt(2) * dx * t * rad + 2.0 * dy * dy * h / (dx * dx + 2.0 * dy * dy) + gy * t * t / 2.0
                ]
            );
            m.add(ci.p, orig, ci.p);
        }

    }


    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (show_numeric) {
        drawChain(chain);
    }
    if (show_exact) {
        drawChain(exact_chain);
    }
    drawPlanes(planes);
    window.requestAnimationFrame(update);

}




document.body.onload = () => {

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, -1, 0, canvas.height);


    for (let i = 0; i < 15; i++) {
        let h = 100 + i * 30;

        const dx = d.at(0);
        const dy = d.at(1);
        const gy = g.at(1);

        const rad = Math.sqrt(-gy * h / (dx * dx + 2.0 * dy * dy));
        const v_x = Math.sqrt(2) * dy * rad;
        const v_y = 0.0;
        const v = v32.from([v_x, -v_y]);
        console.log(m.toString(v));
        chain.push(
            {
                p: m.add(orig, v32.from([0, h])),
                v: v,
                r: 10,
                col: v32.from([1, 0, 0])
            }
        );
    }

    // exact
    for (let i = 0; i < 15; i++) {
        let h = 100 + i * 30;

        const dx = d.at(0);
        const dy = d.at(1);
        const gy = g.at(1);

        const rad = Math.sqrt(-gy * h / (dx * dx + 2.0 * dy * dy));
        const p0_x = 2.0 * dx * dy * h / (dx * dx + 2.0 * dy * dy);
        const p0_y = 2.0 * dy * dy * h / (dx * dx + 2.0 * dy * dy);

        const v0_x = Math.sqrt(2) * dy * rad;
        const v0_y = -Math.sqrt(2) * dx * rad;

        const t_vert = Math.sqrt(2) * dx * rad / gy;

        exact_chain.push(
            {
                p: m.add(orig, v32.from([0, h])),
                v0: v32.from([v0_x, v0_y]),
                p0: v32.from([p0_x, p0_y]),
                r: 9,
                col: v32.from([1, 0, 1]),
                t: t_vert,
                dir: 1.0,
                t_max: 2.0 * t_vert,
                h: h
            }
        );
    }


    const offset = v32.from([0, r]);
    const orig_offset = m.sub(orig, offset);
    planes.push(new Plane(
        m.add(orig_offset, m.scale(d, 500)),
        orig_offset
    )
    );

    const d_r = v32.from([-d.at(0), d.at(1)]);
    planes.push(new Plane(
        orig_offset,
        m.add(orig_offset, m.scale(d_r, 500))
    )
    );
    lastTime = Date.now();

    update();

};