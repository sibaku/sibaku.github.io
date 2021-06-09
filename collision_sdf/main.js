import * as jm from "./lib/jsmatrix.js";
import { VecF32 as v32, MatF32 as m32 } from "./lib/jsmatrix.js";

function rot2d(a) {
    const ca = Math.cos(a);
    const sa = Math.sin(a);

    const R = m32.from([ca, sa, -sa, ca], 2, 2);
    return R;
}

function cross2D(a, b) {
    return a.at(0) * b.at(1) - a.at(1) * b.at(0);
}

function crossVec2D(a) {
    return v32.from([-a.at(1), a.at(0)]);
}

class Primitive {
    constructor({ pos = v32.zeros(2), angle = 0.0, vel = v32.zeros(2), angVel = 0.0, inertia = 1.0, mass = 1.0 }) {
        this.pos = pos;
        this.angle = angle;
        this.vel = vel;
        this.angVel = angVel;
        this.inertia = inertia;
        this.mass = mass;
        this.invInertia = inertia === 0.0 ? 0.0 : 1 / inertia;
        this.invMass = mass === 0.0 ? 0.0 : 1 / mass;
    }

    setMass(mass) {
        this.mass = mass;
        this.invMass = mass === 0.0 ? 0.0 : 1 / mass;

    }

    setInertia(inertia) {
        this.inertia = inertia;
        this.invInertia = inertia === 0.0 ? 0.0 : 1 / inertia;

    }

    bounds() {
        return [v32.zeros(2), v32.zeros(2)];
    }
    worldBounds() {
        const [center, halfsize] = this.bounds();
        const R = rot2d(this.angle);
        const centerNew = jm.add(jm.mult(R, center), this.pos);
        jm.abs(R, R);
        const halfSizeNew = jm.mult(R, halfsize);

        return [centerNew, halfSizeNew];

    }

    sdf(p) {
        return Infinity;
    }

    sdfWorld(p) {
        const R = rot2d(-this.angle);
        const pl = jm.mult(R, jm.sub(p, this.pos));

        return this.sdf(pl);
    }

    draw(ctx) {

    }

    drawWorld(ctx) {

        ctx.save();
        const R = rot2d(this.angle);
        ctx.transform(R.at(0, 0), R.at(1, 0), R.at(0, 1), R.at(1, 1), this.pos.at(0), this.pos.at(1));
        this.draw(ctx);
        ctx.restore();

    }

}

class Circle extends Primitive {
    constructor({ pos = v32.zeros(2), radius = 1, angle = 0.0, vel = v32.zeros(2),
        angVel = 0.0, mass = 1.0 }) {
        const inertia = mass / 4 * radius * radius;
        super({ pos, angle, vel, angVel, inertia, mass });
        this.radius = radius;
    }

    sdf(p) {
        return jm.norm(p) - this.radius;
    }

    bounds() {
        return [v32.zeros(2), v32.from([this.radius, this.radius])];
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.moveTo(0, 0);
        ctx.lineTo(this.radius, 0);
        ctx.stroke();
    }
}

class Rectangle extends Primitive {
    constructor({ pos = v32.zeros(2), halfSize = v32.from([1, 1]),
        angle = 0.0, vel = v32.zeros(2), angVel = 0.0, mass = 1.0 }) {

        const inertia = 1 / 12 * mass * (jm.norm2Squared(jm.scale(halfSize, 2)));
        super({ pos, angle, vel, angVel, inertia, mass });
        this.halfSize = halfSize;
    }

    sdf(p) {

        const d = jm.sub(jm.abs(p), this.halfSize);
        return Math.min(jm.max(d), 0.0) + jm.norm(jm.cwiseMax(d, jm.setZero(jm.similar(d))));
    }

    bounds() {
        return [v32.zeros(2), this.halfSize];
    }

    draw(ctx) {
        const bmin = jm.sub(this.pos, this.halfSize);
        const hx = this.halfSize.at(0);
        const hy = this.halfSize.at(1);
        ctx.strokeRect(-hx, -hy, 2 * hx, 2 * hy);

    }
}

class Plane extends Primitive {
    constructor({ pos = v32.zeros(2), n = v32.from([0, -1]),
        angle = 0.0, vel = v32.zeros(2), angVel = 0.0 }) {

        super({ pos, angle, vel, angVel, inertia: 0.0, mass: 0.0 });
        this.n = n;
    }

    sdf(p) {

        const d = jm.dot(p, this.n);
        return d;
    }

    bounds() {
        return [v32.zeros(2), v32.from([10000, 10000])];
    }

    draw(ctx) {
        const dir = crossVec2D(this.n);
        const a = jm.scale(dir, -10000);
        const b = jm.scale(dir, 10000);

        ctx.beginPath();
        ctx.moveTo(a.at(0), a.at(1));
        ctx.lineTo(b.at(0), b.at(1));
        ctx.stroke();

    }
}

function combineBounds(ba, bb) {

}

class Combination extends Primitive {
    constructor({ pos = v32.zeros(2), primitives = [], angle = 0.0, vel = v32.zeros(2),
        angVel = 0.0, mass = 1.0, sampleRes = 10 }) {

        super({ pos, angle, vel, angVel, inertia: 0, mass });
        this.primitives = primitives;
        const inertia = this.computeInertia(sampleRes);
        this.setInertia(inertia);
    }

    computeInertia(sampleRes) {
        // very basic...

        const [c, s] = this.bounds();
        const cmin = jm.sub(c, s);
        const delta = jm.scale(s, 2);

        const dx = delta.at(0) / sampleRes;
        const dy = delta.at(1) / sampleRes;
        const areaElement = dx * dy;
        const halfDiag = jm.norm(v32.from([dx, dy])) / 2.0;

        let count = 0;
        let sum = 0.0;

        for (let y = 0; y < sampleRes; y++) {
            for (let x = 0; x < sampleRes; x++) {
                const p = jm.add(
                    cmin, jm.cwiseMult(delta, v32.from([(x + 0.5) / sampleRes, (y + 0.5) / sampleRes])));
                const d = this.sdf(p);
                if (d < halfDiag) {
                    count++;
                    const p0 = jm.add(
                        cmin, jm.cwiseMult(delta, v32.from([(x) / sampleRes, (y) / sampleRes])));
                    const p1 = jm.add(
                        cmin, jm.cwiseMult(delta, v32.from([(x + 1) / sampleRes, (y + 1) / sampleRes])));
                    const x0 = p0.at(0);
                    const x1 = p1.at(0);
                    const y0 = p0.at(1);
                    const y1 = p1.at(1);

                    const localI = ((Math.pow(x0, 3) - Math.pow(x1, 3)) * (y0 - y1) + (x0 - x1) * (Math.pow(y0, 3) - Math.pow(y1, 3))) / 3;
                    sum += localI;
                }
            }
        }

        // constant density
        const rho = this.mass / (count * areaElement);
        return rho * sum;
    }

    sdf(p) {
        let d = Infinity;
        for (let i = 0; i < this.primitives.length; i++) {
            d = Math.min(d, this.primitives[i].sdfWorld(p));
        }
        return d;
    }

    bounds() {
        let cmin = v32.from([Infinity, Infinity]);
        let cmax = v32.from([-Infinity, -Infinity]);

        const prims = this.primitives;
        for (let i = 0; i < prims.length; i++) {
            const [ca, sa] = prims[i].worldBounds();
            const bmin = jm.sub(ca, sa);
            const bmax = jm.add(ca, sa);

            jm.cwiseMin(cmin, bmin, cmin);
            jm.cwiseMax(cmax, bmax, cmax);
        }

        const c = jm.scale(jm.add(cmax, cmin), 0.5);
        const s = jm.scale(jm.sub(cmax, cmin), 0.5);
        return [c, s];
    }

    draw(ctx) {

        for (let i = 0; i < this.primitives.length; i++) {
            this.primitives[i].drawWorld(ctx);
        }
    }
}

function grad(prim, p, eps = 1E-1) {
    const hx = v32.from([eps, 0]);
    const hy = v32.from([0, eps]);

    const dx = prim.sdfWorld(jm.add(p, hx)) - prim.sdfWorld(jm.sub(p, hx));
    const dy = prim.sdfWorld(jm.add(p, hy)) - prim.sdfWorld(jm.sub(p, hy));

    return jm.normalize(v32.from([dx, dy]));
}

function iterateIntersection(p, primA, primB, { n = 20 }) {

    for (let i = 0; i < n; i++) {
        const da = primA.sdfWorld(p);
        const db = primB.sdfWorld(p);
        // intersection
        const d = Math.max(da, db);

        let g;
        if (da >= db) {
            g = grad(primA, p);
        } else {
            g = grad(primB, p);
        }

        p = jm.add(p, jm.scale(g, -d));

    }

    const da = primA.sdfWorld(p);
    const db = primB.sdfWorld(p);
    // intersection
    const d = Math.max(da, db);


    let g;
    if (da >= db) {
        g = grad(primA, p);
    } else {
        g = grad(primB, p);
    }
    return { intersectDist: d, unionDist: Math.min(da, db), p, g };
}


function drawPoints(ctx, points, filters) {

    for (let i = 0; i < points.cols(); i++) {
        if (filters && !filters.at(i)) {
            continue;
        }
        const pi = jm.col(points, i);
        ctx.beginPath();

        ctx.arc(pi.at(0), pi.at(1), 2, 0, 2 * Math.PI);
        ctx.fill();

    }

}

function drawConnections(ctx, pointInitial, pointsAfter, filters) {
    ctx.beginPath();

    for (let i = 0; i < pointInitial.cols(); i++) {
        if (filters && !filters.at(i)) {
            continue;
        }
        const pi = jm.col(pointInitial, i);
        const qi = jm.col(pointsAfter, i);
        ctx.moveTo(pi.at(0), pi.at(1));
        ctx.lineTo(qi.at(0), qi.at(1));
    }

    ctx.stroke();
}

function drawGrads(ctx, points, grads, { scale = 1 }, filters) {
    ctx.beginPath();

    for (let i = 0; i < points.cols(); i++) {
        if (filters && !filters.at(i)) {
            continue;
        }
        const pi = jm.col(points, i);
        const qi = jm.add(pi, jm.scale(jm.col(grads, i), scale));
        ctx.moveTo(pi.at(0), pi.at(1));
        ctx.lineTo(qi.at(0), qi.at(1));
    }

    ctx.stroke();
}

function intersectBounds(ca, sa, cb, sb) {
    const mina = jm.sub(ca, sa);
    const maxa = jm.add(ca, sa);

    const minb = jm.sub(cb, sb);
    const maxb = jm.add(cb, sb);

    const minc = jm.cwiseMax(mina, minb);
    const maxc = jm.cwiseMin(maxa, maxb);
    return [minc, maxc];
}

function intersectPrimBounds(pa, pb) {
    const [ca, sa] = pa.worldBounds();
    const [cb, sb] = pb.worldBounds();
    return intersectBounds(ca, sa, cb, sb);
}

function handlePair(ctx, primA, primB, {
    drawInterBounds,
    drawInitPoints,
    drawFinalPoints,
    drawConnection,
    drawGrad,
}) {
    // const smin = v32.from([100, 100]);
    // const smax = v32.from([500, 500]);

    if (primA.mass === 0.0 && primB.mass === 0.0) {
        return [];
    }
    const [smin, smax] = intersectPrimBounds(primA, primB);
    const sdelta = jm.sub(smax, smin);

    if (jm.reduce(sdelta, (accum, v) => {
        return accum || v < 0
    }, false)) {
        return [];
    }

    if (drawInterBounds) {

        drawBounds(ctx, smin, sdelta, { strokeStyle: "rgb(0,0,255)" });
    }

    let pN = 5;
    let pM = 5;
    let pointsInitial = m32.rand(2, pN * pM);
    jm.colwise(pointsInitial, (col, j) => {
        jm.insert(col, jm.add(smin, jm.cwiseMult(col, sdelta)));
    });

    for (let i = 0; i < pN; i++) {
        for (let j = 0; j < pM; j++) {
            const p = jm.add(smin, jm.cwiseMult(sdelta, v32.from([(i) / (pN - 1), (j) / (pM - 1)])));
            let idx = i + pN * j;
            jm.insert(jm.col(pointsInitial, idx), p);
        }
    }

    if (drawInitPoints) {
        ctx.save();
        drawPoints(ctx, pointsInitial);
        ctx.restore();
    }

    let pointsAfter = jm.similar(pointsInitial);
    let grads = jm.similar(pointsInitial);
    let distances = jm.similar(pointsInitial);

    const collisions = [];
    jm.colwise(pointsInitial, (col, j) => {
        const { intersectDist, unionDist, p, g } =
            iterateIntersection(col, primA, primB, {});
        jm.insert(jm.col(pointsAfter, j), p);
        jm.insert(jm.col(grads, j), g);
        jm.insert(jm.col(distances, j), v32.from([intersectDist, unionDist]));
        if (intersectDist <= 1) {
            // collision
            collisions.push(new Collision(primA, primB, p, grad(primB, p), unionDist));
        }
    });

    let filter = jm.copy(jm.transpose(jm.colreduce(distances, (col) => {
        return col.at(0) <= 1;
    }, jm.transpose(jm.VecAny.uninitialized(distances.cols())))));

    if (drawFinalPoints) {
        ctx.save();
        ctx.fillStyle = "rgb(255,0,0)";
        drawPoints(ctx, pointsAfter, filter);
        ctx.restore();
    }

    if (drawConnection) {
        drawConnections(ctx, pointsInitial, pointsAfter, filter);
    }


    if (drawGrad) {
        ctx.save();
        ctx.strokeStyle = "rgb(0,255,0)";

        drawGrads(ctx, pointsAfter, grads, { scale: 40 }, filter);
        ctx.restore();
    }


    return collisions;

}

function updatePrimitive(prim, dt) {
    prim.pos = jm.add(prim.pos, jm.scale(prim.vel, dt));
    prim.angle = prim.angle + dt * prim.angVel;
}

function applyImpulse(prim, p, impulse) {
    const r = jm.fromTo(prim.pos, p);
    prim.vel = jm.add(prim.vel, jm.scale(impulse, prim.invMass));
    prim.angVel += prim.invInertia * cross2D(r, impulse);
}


function computeImpulse(c) {
    const { primA, primB, p, n, d } = c;
    const ra = jm.fromTo(primA.pos, p);
    const rb = jm.fromTo(primB.pos, p);

    const raPerp = crossVec2D(ra);
    const rbPerp = crossVec2D(rb);
    const va = jm.add(primA.vel, jm.scale(raPerp, primA.angVel));
    const vb = jm.add(primB.vel, jm.scale(rbPerp, primB.angVel));

    const vRel = jm.sub(va, vb);

    const vn = jm.dot(vRel, n);

    if (vn >= 0.0) {
        // seperating
        return 0.0;
    }

    const e = 0.5;

    const invM = primA.invMass + primB.invMass;
    const invI = Math.pow(cross2D(ra, n), 2) * primA.invInertia + Math.pow(cross2D(rb, n), 2) * primB.invInertia;


    const j = -(1 + e) * vn / (invM + invI);

    return j;



}
function drawBoundsPrim(ctx, prim, { strokeStyle = "rgb(128,0,0)" }) {

    const [center, halfSize] = prim.worldBounds();
    const bmin = jm.sub(center, halfSize);
    drawBounds(ctx, bmin, jm.scale(halfSize, 2), { strokeStyle });
}

function drawBounds(ctx, bmin, size, { strokeStyle = "rgb(128,0,0)" }) {
    ctx.save();
    ctx.strokeStyle = strokeStyle;

    ctx.strokeRect(bmin.at(0), bmin.at(1), size.at(0), size.at(1));
    ctx.restore();
}

function drawVelocity(ctx, prim, { scale = 1, strokeStyle = "rgb(128,0,128)" }) {
    ctx.save();
    ctx.strokeStyle = strokeStyle;

    const p0 = prim.pos;
    const p1 = jm.add(p0, jm.scale(prim.vel, scale));
    ctx.beginPath();
    ctx.arc(p0.at(0), p0.at(1), 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p0.at(0), p0.at(1));
    ctx.lineTo(p1.at(0), p1.at(1));
    ctx.stroke();
    ctx.restore();
}
class Collision {
    constructor(primA, primB, p, n, d) {
        this.primA = primA;
        this.primB = primB;
        this.p = p;
        this.n = n;
        this.d = d;
        this.impulse = 0.0;
    }


    applyImpulse(j) {
        const J = jm.scale(this.n, j);

        applyImpulse(this.primA, this.p, J);
        applyImpulse(this.primB, this.p, jm.neg(J));
    }
}

class Penetration {
    constructor(primA, primB, dir, depth) {
        this.primA = primA;
        this.primB = primB;
        this.dir = dir;
        this.depth = depth;
    }

    resolve(epsilon = 0.25) {
        if (this.primA.invMass === 0.0 && this.primB.invMass) {
            return;
        }
        const invsum = 1 / (this.primA.invMass + this.primB.invMass);

        const factor = this.depth * epsilon * invsum;

        jm.add(this.primA.pos, jm.scale(this.dir, factor * this.primA.invMass), this.primA.pos);
        jm.add(this.primB.pos, jm.scale(this.dir, -factor * this.primB.invMass), this.primB.pos);
    }
}
document.body.onload = () => {

    const canvas = document.getElementById('canvas');
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');


    const primitives = [];


    primitives.push(new Circle({ radius: 40, pos: v32.from([200, 200]) }));
    primitives.push(new Circle({ radius: 70, pos: v32.from([280, 200]) }));
    primitives.push(new Circle({ radius: 70, pos: v32.from([480, 200]) }));
    primitives.push(new Rectangle(
        {
            halfSize: v32.from([100, 150]), pos: v32.from([700, 300]),
            angle: jm.deg2rad(45), angVel: jm.deg2rad(10),
            mass: 50
        }));
    primitives.push(new Rectangle(
        {
            halfSize: v32.from([50, 50]), pos: v32.from([200, 400]),
            vel: v32.from([10, -40]), angVel: jm.deg2rad(10)
        }));

    primitives.push(new Rectangle(
        {
            halfSize: v32.from([canvas.width, 10]), pos: v32.from([0, canvas.height - 20]),
            mass: 0.0, inertia: 0
        }));

    primitives.push(new Rectangle(
        {
            halfSize: v32.from([10, canvas.height]), pos: v32.from([20, 0]),
            mass: 0.0, inertia: 0
        }));
    primitives.push(new Rectangle(
        {
            halfSize: v32.from([10, canvas.height]), pos: v32.from([canvas.width - 20, 0]),
            mass: 0.0, inertia: 0
        }));
    // primitives.push(new Plane(
    //     {
    //         n: v32.from([0, 1]),
    //         pos: v32.from([0, 20])
    //     }
    // ));

    // primitives.push(new Plane(
    //     {
    //         n: v32.from([0, -1]),
    //         pos: v32.from([0, canvas.height - 200])
    //     }
    // ));

    // primitives.push(new Plane(
    //     {
    //         n: v32.from([1, 0]),
    //         pos: v32.from([20, 0])
    //     }
    // ));

    // primitives.push(new Plane(
    //     {
    //         n: v32.from([-1, 0]),
    //         pos: v32.from([canvas.width - 20, 0])
    //     }
    // ));

    primitives.push(new Combination({
        pos: v32.from([200, 500]),
        primitives: [
            new Circle({ radius: 50 }),
            new Circle({
                pos: v32.from([60, 10]),
                radius: 40
            })
        ]
    }))
    // applyImpulse(primitives[3], v32.from([720, 200]), v32.from([-50.1, 10.1]));


    const options = document.getElementById('options');
    const group = (elements) => {
        const div = document.createElement('div');
        for (let i = 0; i < elements.length; i++) {
            div.appendChild(elements[i]);
        }
        return div;
    };

    const checkbox = (name, label, checked) => {
        const c = document.createElement('input');
        c.type = "checkbox";
        c.name = name;
        c.value = name;
        c.id = name;
        c.checked = checked;

        const l = document.createElement('label')
        l.htmlFor = name;
        l.appendChild(document.createTextNode(label));
        return [c, l];

    };

    const [checkDrawBounds, labelBounds] = checkbox("Bounds", "Draw bounds", true);
    document.body.appendChild(group([checkDrawBounds, labelBounds]));

    const [checkInterDrawBounds, labelInterBounds] = checkbox("InterBounds", "Draw intersection bounds", false);
    document.body.appendChild(group([checkInterDrawBounds, labelInterBounds]));


    const [checkDrawPointsInit, labelDrawPointsInit] = checkbox("InitPoints", "Draw initial points", false);
    document.body.appendChild(group([checkDrawPointsInit, labelDrawPointsInit]));


    const [checkDrawPointsAfter, labelDrawPointsAfter] = checkbox("AfterPoints", "Draw final points", true);
    document.body.appendChild(group([checkDrawPointsAfter, labelDrawPointsAfter]));

    const [checkDrawConnection, labelDrawConnection] = checkbox("Connection", "Draw point connection", false);
    document.body.appendChild(group([checkDrawConnection, labelDrawConnection]));

    const [checkDrawGradient, labelDrawGradient] = checkbox("Grad", "Draw collision gradient", true);
    document.body.appendChild(group([checkDrawGradient, labelDrawGradient]));

    const [checkDrawVelocity, labelDrawVelocity] = checkbox("Velocity", "Draw velocity", true);
    document.body.appendChild(group([checkDrawVelocity, labelDrawVelocity]));


    let timeDivisor = 30;
    const inputTimeDivisor = document.createElement("input");
    inputTimeDivisor.setAttribute("type", "number");
    inputTimeDivisor.value = timeDivisor;
    inputTimeDivisor.min = 1;
    inputTimeDivisor.max = 240;

    const updateTimeButton = document.createElement("input");
    updateTimeButton.type = "button";
    updateTimeButton.value = "Update time divisor";

    updateTimeButton.onclick = () => {
        const val = parseInt(inputTimeDivisor.value);
        if (isNaN(val)) {
            inputTimeDivisor.value = timeDivisor;
            return;
        }
        timeDivisor = inputTimeDivisor.value;
    };
    document.body.appendChild(group(
        [
            document.createTextNode("Timestep is calculated as 1/divisor: "),
            inputTimeDivisor,
            updateTimeButton
        ]
    ));

    const update = () => {
        const dt = 1 / timeDivisor;

        const drawBounds = checkDrawBounds.checked;
        const drawInterBounds = checkInterDrawBounds.checked;
        const drawInitPoints = checkDrawPointsInit.checked;
        const drawFinalPoints = checkDrawPointsAfter.checked;
        const drawConnection = checkDrawConnection.checked;
        const drawGrad = checkDrawGradient.checked;
        const drawVel = checkDrawVelocity.checked;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < primitives.length; i++) {
            const transform = ctx.getTransform();
            primitives[i].drawWorld(ctx);
            ctx.setTransform(transform);

            if (drawBounds) {
                drawBoundsPrim(ctx, primitives[i], {});
            }

            if (drawVel) {
                drawVelocity(ctx, primitives[i], {});
            }
            ctx.setTransform(transform);


        }
        const collisions = [];
        const penetrations = [];
        for (let i = 0; i < primitives.length; i++) {
            for (let j = i + 1; j < primitives.length; j++) {
                const c = handlePair(ctx, primitives[i], primitives[j], {
                    drawInterBounds,
                    drawInitPoints,
                    drawFinalPoints,
                    drawConnection,
                    drawGrad,
                });
                // find average direction and max seperation
                let minSep = Infinity;
                let dir = v32.zeros(2);

                for (let k = 0; k < c.length; k++) {
                    const ck = c[k];
                    minSep = Math.min(minSep, ck.d);
                    jm.add(dir, ck.n, dir);
                }

                if (minSep < 0 && jm.norm2Squared(dir) > 1E-1) {
                    penetrations.push(new Penetration(primitives[i], primitives[j], jm.normalize(dir), -minSep));
                }

                collisions.push(...c);
            }
        }

        const g = v32.from([0, 9.81]);
        for (let i = 0; i < primitives.length; i++) {
            if (primitives[i].mass > 0) {
                jm.add(primitives[i].vel, jm.scale(g, dt), primitives[i].vel);
            }
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < collisions.length; j++) {

                const c = collisions[j];

                const oldImpulse = c.impulse;
                let delta = computeImpulse(c);

                c.impulse += delta;
                c.impulse = Math.max(0.0, c.impulse);
                delta = c.impulse - oldImpulse;
                c.applyImpulse(delta);
            }
        }
        for (let i = 0; i < penetrations.length; i++) {
            penetrations[i].resolve(0.95);
        }
        for (let i = 0; i < primitives.length; i++) {
            updatePrimitive(primitives[i], 1 / 120);
        }

        requestAnimationFrame(update);
    };

    update();

};