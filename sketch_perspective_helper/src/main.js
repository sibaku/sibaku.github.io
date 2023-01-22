import * as jm from '@jsmatrix';
import {
    VecF32 as v32,
    MatF32 as m32,
    add, sub, mult, neg, dot, transpose, cross, scale, cwiseMult, hvec, col,
} from '@jsmatrix';


function vec2(x = 0, y = 0) {
    return v32.from([x, y]);
}
function vec3(x = 0, y = 0, z = 0) {
    return v32.from([x, y, z]);
}
function vec4(x = 0, y = 0, z = 0, w = 0) {
    return v32.from([x, y, z, w]);
}

const POINTS = 0;
const LINES = 1;
const POLYGON = 2;

function createPlaneCorners({
    c = vec3(),
    v0 = vec3(1, 0, 0),
    v1 = vec3(0, 0, 1),
    s = 1.0,
} = {}) {
    v0 = scale(v0, s / 2);
    v1 = scale(v1, s / 2);

    const p0 = add(add(c, neg(v0)), neg(v1));
    const p1 = add(add(c, v0), neg(v1));
    const p2 = add(add(c, v0), v1);
    const p3 = add(add(c, neg(v0)), v1);

    return [p0, p1, p2, p3];
}

function createGrid({
    c = vec3(),
    v0 = vec3(1, 0, 0),
    v1 = vec3(0, 0, 1),
    s = 1.0,
    res = 4,
} = {}) {

    const pmin = add(add(c, neg(scale(v0, s / 2))), neg(scale(v1, s / 2)));

    v0 = scale(v0, s);
    v1 = scale(v1, s);
    const lines = [];

    for (let i = 0; i <= res; i++) {
        const u = i / res;
        const p0 = add(pmin, scale(v0, u));
        const p1 = add(p0, v1);
        lines.push(jm.copy(hvec(p0)), jm.copy(hvec(p1)));
    }

    for (let j = 0; j <= res; j++) {
        const v = j / res;
        const p0 = add(pmin, scale(v1, v));
        const p1 = add(p0, v0);
        lines.push(jm.copy(hvec(p0)), jm.copy(hvec(p1)));

    }

    return {
        topology: LINES,
        points: m32.fromCols(lines)
    };
}


function numberString(n, maxDecimals = 16) {
    let s = "" + n;
    let idx = s.indexOf(".");
    if (idx >= 0) {
        const maxIndex = Math.min(s.length, idx + maxDecimals);
        s = s.substring(0, maxIndex);
    }

    return s;
}

function isAtInfinity(v, eps = 1E-7) {
    return Math.abs(v.at(v.rows() - 1)) < eps;
}


function clipInfiniteLine(p, d, planes, {
    tmin = -Infinity,
    tmax = Infinity
} = {}) {

    for (let i = 0; i < planes.length; i++) {
        const nv = dot(planes[i].n, d);
        if (Math.abs(nv) < 1E-15) {
            // parallel
            continue;
        }
        const t = - (planes[i].b + dot(planes[i].n, p)) / nv;
        if (nv < 0) {
            // incoming
            tmin = Math.max(tmin, t);
        } else {
            tmax = Math.min(tmax, t);
        }

    }

    if (tmax < tmin) {
        // outside of the screen
        return [];
    }

    // compute clipped points
    const a0 = add(p, scale(d, tmin));
    const a1 = add(p, scale(d, tmax));

    return [a0, a1];
}

function computeVanishingLineEquation({
    v0 = vec3(1, 0, 0),
    v1 = vec3(0, 0, 1),
    VP
}) {
    const v0h = jm.mult(VP, jm.hvec(v0, 0));
    const v1h = jm.mult(VP, jm.hvec(v1, 0));


    // compute homogeneous line equation on plane
    // first extract "2d" homogeneous points

    const v0h2 = vec3(v0h.at(0), v0h.at(1), v0h.at(3));
    const v1h2 = vec3(v1h.at(0), v1h.at(1), v1h.at(3));

    const line = cross(v0h2, v1h2);

    // normal of the line
    const n = vec2(line.at(0), line.at(1));

    // intersect with 
    // convert to viewspace

    const p0 = scale(n, -line.at(2) / jm.norm2Squared(n));
    const d0 = vec2(n.at(1), -n.at(0));

    // clip line at screen so it is always visible
    const planes = [
        { n: vec2(-1, 0), b: -1 },
        { n: vec2(1, 0), b: -1 },
        { n: vec2(0, 1), b: -1 },
        { n: vec2(0, -1), b: -1 },
    ];

    const res = clipInfiniteLine(p0, d0, planes);

    return res.map(x => {
        return vec4(x.at(0), x.at(1), 1, 1)
    });
}


function drawObject(object, ctx) {
    ctx.save();

    const { points, style = {} } = object;
    if (style.fillStyle) {
        ctx.fillStyle = style.fillStyle;
    }
    if (style.strokeStyle) {
        ctx.strokeStyle = style.strokeStyle;
    }

    const n = points.cols();
    if (object.topology === POINTS) {
        const { r = 5 } = style;
        for (let i = 0; i < n; i++) {
            const pi = jm.col(points, i);
            ctx.beginPath();
            ctx.arc(pi.at(0), pi.at(1), r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

        }
    } else if (object.topology === LINES && n > 1) {
        ctx.beginPath();
        for (let i = 0; i < n; i += 2) {
            const a = jm.col(points, i);
            const b = jm.col(points, i + 1);
            ctx.moveTo(a.at(0), a.at(1));
            ctx.lineTo(b.at(0), b.at(1));

        }
        ctx.stroke();
    }
    else if (object.topology === POLYGON && n > 2) {

        ctx.beginPath();
        ctx.moveTo(points.at(0, 0), points.at(1, 0));

        for (let i = 0; i < n; i++) {
            const pi = jm.col(points, i);
            ctx.lineTo(pi.at(0), pi.at(1));

        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();
}

/**
         * Clips a polygon against the given clip-planes
         * @param {Array<AbstractMat>} points The input points
         * @param {Array<AbstractMat>} planes The clipping planes
         * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
         */
function clip_polygon(points, planes) {

    // Implementation of the Sutherland-Hodgman algorithm
    for (let pi = 0; pi < planes.length; pi++) {

        const pl = planes[pi];
        const output = [];

        const size = points.length;
        for (let i = 0; i < size; i++) {

            const cur = points[i];
            const ip = (i - 1 + points.length) % points.length;
            const prev = points[ip];

            // compute distance
            const dc = dot(pl, cur);
            const dp = dot(pl, prev);

            // cur inside
            if (dc >= 0.0) {
                // prev outside
                if (dp < 0.0) {
                    // intersect prev -> cur

                    const t = dp / (dp - dc);
                    const p = add(prev, scale(sub(cur, prev), t));

                    output.push(p);
                }

                output.push(cur);
            } else if (dp >= 0.0) {
                // cur outside, prev inside
                // intersect prev->cur
                // intersect in homogeneous space

                const t = dp / (dp - dc);
                const p = add(prev, scale(sub(cur, prev), t));

                output.push(p);
            }
        }

        points = output;
    }
    return points;
}

/**
         * Clips a line against the given clip-planes
         * @param {Array<AbstractMat>} points The input points
         * @param {Array<AbstractMat>} planes The clipping planes
         * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
         */
function clip_line(points, planes) {

    // successive clipping at each plane
    // clpping a line at a plane is more or less one step of the
    // Sutherland-Hodgman algorithm, but without the polygon wrap-around
    for (let pi = 0; pi < planes.length; pi++) {
        const pl = planes[pi];
        if (points.length === 0) {
            return [];
        }

        // simplified sutherland-hodgman
        const p0 = points[0];
        const p1 = points[1];
        // compute projective distance

        const d0 = dot(pl, p0);
        const d1 = dot(pl, p1);

        // the four cases
        // the actual implementation will combine them a bit, as there is a bit of overlap

        if (d1 < 0.0 && d0 < 0.0) {
            // case 1 - both outside -> finished
            return [];
        }
        else if (d1 >= 0.0 && d0 >= 0.0) {
            // case 2 - both inside -> continue with the next plane
            continue;
        }
        else if (d0 >= 0.0 && d1 < 0.0) {
            // case 3 - start inside, end outside
            // compute intersection
            const t = d0 / (d0 - d1);
            const p = add(p0, scale(sub(p1, p0), t));

            //  return startpoint and intersection
            // In this case we will just replace the points and continue with the next plane;
            points = [p0, p];
            continue;
        } else {
            // case 4 - start outside, end inside
            // compute intersection
            const t = d0 / (d0 - d1);
            const p = add(p0, scale(sub(p1, p0), t));


            // return intersection and endpoint
            points = [p, p1];

            continue;
        }
    }
    return points;
}


/**
         * Clips a line against the given clip-planes
         * @param {Array<AbstractMat>} points The input points
         * @param {Array<AbstractMat>} planes The clipping planes
         * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
         */
function clip_point(points, planes) {

    // successive clipping at each plane
    // clpping a line at a plane is more or less one step of the
    // Sutherland-Hodgman algorithm, but without the polygon wrap-around
    for (let pi = 0; pi < planes.length; pi++) {
        const pl = planes[pi];
        if (points.length === 0) {
            return [];
        }

        // simplified sutherland-hodgman
        const p0 = points[0];
        // compute projective distance

        const d0 = dot(pl, p0);

        // the four cases
        // the actual implementation will combine them a bit, as there is a bit of overlap

        if (d0 < 0.0) {
            // case 1 - point outside -> finished
            return [];
        }

    }
    return points;
}

function clipObject(object, planes = [
    vec4(0.0, 0.0, 1.0, 1.0),
]) {
    const points = object.points;


    let pointArray = [];
    jm.colwise(points, (col, j) => {
        pointArray.push(jm.copy(col));
    });

    if (object.topology === POINTS) {
        let newPoints = [];
        for (let i = 0; i < pointArray.length; i++) {
            newPoints.push(...clip_point([pointArray[i]], planes));

        }
        pointArray = newPoints;
    }
    else if (object.topology === LINES) {
        let newLines = [];
        for (let i = 0; i < pointArray.length; i += 2) {
            newLines.push(...clip_line([pointArray[i], pointArray[i + 1]], planes));

        }
        pointArray = newLines;
    } else if (object.topology === POLYGON) {
        pointArray = clip_polygon(pointArray, planes);
    }

    if (pointArray.length === 0) {
        return null;
    }
    const result = Object.assign({}, object);

    result.points = m32.fromCols(pointArray);

    return result;

}

const state = {
    centerGridWorld: null,
    surroundGridsWorld: null,
    horizonLineNDC: null,
    centerGridCornerPointsWorld: null,
    gridVanishingPointsNDC: null,
    gridVanishingLinesNDC: null,
    gridVanishingLinesReverseNDC: null,
    cubeFaces: null,
    aspectW: 16,
    aspectH: 9,
    screenRatio: 0.6,
    objectPoint: vec4(0, 0, 0, 1),
    displayCube: true,
    displayGrid: true,
    subView: {
        display: true,
        left: 0.0,
        right: 1.0,
        bottom: 0.0,
        top: 1.0,
        aspectW: 16,
        aspectH: 9,
        scale: 1,
        offsetW: 0,
        offsetH: 0,

    },
    cubeParameters: {
        angle: 0,
        R: m32.id(4, 4),
        s: vec3(1, 1, 1),
        M: m32.id(4, 4),
        Mi: m32.id(4, 4),
    },
    view: {
        phi: 0, theta: 0, fov: 90, height: 4, distance: 10,
        V: m32.id(4, 4), P: m32.id(4, 4), VP: m32.id(4, 4), VPi: m32.id(4, 4),
        W: m32.id(4, 4), camPos: vec3(0, 0, 0)
    }

};

function transformObject(obj, M) {
    const result = Object.assign({}, obj);
    result.points = jm.mult(M, result.points);
    return result;
}

const computeVanishingPointsPoly = (points, M, {
    lineStyle = {

    },
    reverseLineStyle = {

    },
} = {}) => {
    const n = points.cols();
    const vanishingPoints = [];
    const vanishingLines = [];
    const reverseLines = [];

    for (let j = 0; j < n; j++) {
        const pj = jm.copy(col(points, j));
        const qj = jm.copy(col(points, (j + 1) % n));

        const vj = sub(qj, pj);


        const pjh = mult(M, pj);
        const vjh = mult(M, vj);

        if (isAtInfinity(pjh) || isAtInfinity(vjh) || pjh.at(3) < 0) {
            continue;
        }

        jm.homogenize(pjh);
        jm.homogenize(vjh);

        vanishingPoints.push(vjh);
        vanishingLines.push({
            points: m32.fromCols([pjh, vjh]),
            topology: LINES,
            style: lineStyle
        });


        // clip line at screen so it is always visible
        const planes = [
            { n: vec2(-1, 0), b: -1 },
            { n: vec2(1, 0), b: -1 },
            { n: vec2(0, 1), b: -1 },
            { n: vec2(0, -1), b: -1 },
        ];

        const res = clipInfiniteLine(jm.copy(jm.subvec(pjh, 0, 2)), jm.copy(jm.subvec(jm.fromTo(vjh, pjh), 0, 2)), planes, {
            tmin: 0
        });

        if (res.length === 2) {
            reverseLines.push({
                points: m32.fromCols(res.map(x => vec4(x.at(0), x.at(1), 1, 1))),
                topology: LINES,
                style: reverseLineStyle
            })
        }


    }
    return { vanishingPoints, vanishingLines, reverseLines };
};



function computeGridVanishingPointsLines(corners, v0, v1, {
    VP, camPos
}) {
    const van0 = mult(VP, hvec(v0, 0));
    const van1 = mult(VP, hvec(v1, 0));

    const { vanishingPoints, vanishingLines, reverseLines } = computeVanishingPointsPoly(m32.fromCols(corners.map(x => hvec(x))), VP, {
        reverseLineStyle: {
            strokeStyle: "rgba(0,0,0,0.25)"
        }
    });

    const { vanishingPoints: p2, vanishingLines: l2, reverseLines: r2 } =
        computeVanishingPointsPoly(m32.fromCols(corners.reverse().map(x => hvec(x))), VP, {
            reverseLineStyle: {
                strokeStyle: "rgba(0,0,0,0.25)"
            }
        });
    vanishingPoints.push(...p2);
    vanishingLines.push(...l2);
    reverseLines.push(...r2);
    return {
        gridVanishingPointsNDC: vanishingPoints, gridVanishingLinesNDC: vanishingLines, gridVanishingLinesReverseNDC: reverseLines
    };

    // const van = [van0, van1];
    // const gridVanishingPointsNDC = [];
    // const gridVanishingLinesNDC = [];
    // for (let i = 0; i < van.length; i++) {
    //     if (!isAtInfinity(van[i])) {
    //         jm.homogenize(van[i]);
    //         gridVanishingPointsNDC.push(van[i]);

    //         // find closest point
    //         const { col: index } = jm.argmin(jm.colreduce(m32.fromCols(corners), (col, j) => jm.norm2Squared(sub(col, camPos))));
    //         const startPoints = [
    //             mult(VP, hvec(corners[index])),
    //             mult(VP, hvec(corners[(index + corners.length - 1) % corners.length])),
    //             mult(VP, hvec(corners[(index + 1) % corners.length]))
    //         ];

    //         for (let j = 0; j < startPoints.length; j++) {
    //             const p0 = startPoints[j];
    //             if (!isAtInfinity(p0)) {
    //                 gridVanishingLinesNDC.push({
    //                     points: m32.fromCols([p0, van[i]]),
    //                     topology: LINES
    //                 })
    //             }
    //         }


    //     }
    // }

    // return { gridVanishingPointsNDC, gridVanishingLinesNDC };
}

function createSurroundingGrids({
    center = vec3(),
    v0 = vec3(1, 0, 0),
    v1 = vec3(0, 0, 1),
    s = 1.0,
    res = 4,
    alpha = 1,
    levels = 4,
} = {}) {
    const surroundGridsWorld = [];
    for (let i = 0; i < levels; i++) {

        alpha *= 0.5;
        const strokeStyle = `rgba(0,0,0,${alpha})`;
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                if (k === 0 && j === 0) {
                    continue;
                }

                const c = add(center, add(scale(v0, j * s), scale(v1, k * s)));
                let grid = createGrid({
                    c, v0, v1, s, res
                });
                // grid.points = jm.mult(VP, grid.points);
                grid.style = {
                    strokeStyle
                };
                // if (i === levels - 1)
                // objects.push(grid);
                surroundGridsWorld.push(grid);

            }
        }

        s *= 3;
        res *= 3 / 2;
    }

    return surroundGridsWorld;
}

const div = (children = []) => {
    const d = document.createElement("div");
    for (let i = 0; i < children.length; i++) {
        d.appendChild(children[i]);
    }
    return d;
};

const span = (children = []) => {
    const d = document.createElement("span");
    for (let i = 0; i < children.length; i++) {
        d.appendChild(children[i]);
    }
    return d;
};

const text = (s) => {
    const d = document.createElement("span");

    d.innerHTML = s;
    return d;
};
const slider = ({ min = 0, max = 1, value = 0, props = {} } = {}) => {
    const s = document.createElement("input");
    s.type = "range";
    for (let k in props) {
        s[k] = props[k];
    }
    s.min = min;
    s.max = max;
    s.value = value;



    return s;
}

const namedSlider = ({ min = 0, max = 1, value = 0,
    description = "", valueDisplay = x => x,
    oninput = null,
    props = {} }) => {

    const s = slider({ min, max, value, props });
    const val = text(valueDisplay(s.value));
    s.addEventListener("input", e => {
        let v = s.value;
        if (oninput) {
            const res = oninput(e, s);
            if (res !== undefined) {
                v = res;
            }
        }
        s.value = v;
        val.innerHTML = valueDisplay(v);
    });

    const update = (v) => {
        s.value = v;
        val.innerHTML = valueDisplay(v);
    };

    return [div([text(description), s, val]), update];
};

const ui = {

    container: null,
    canvas: null,
    options: null,
};


function gcd(x, y) {
    x = Math.floor(Math.abs(x));
    y = Math.floor(Math.abs(y));
    while (y !== 0) {
        const t = y;
        y = x % y;
        x = t;
    }
    return x;
}
function decimalToFraction(n, numDecimals = 3) {
    const denom = Math.pow(10, numDecimals);
    const num = Math.floor(n * denom);

    const divisor = gcd(denom, num);

    // Last floor only to prevent division errors
    return {
        num: Math.floor(num / divisor), denom: Math.floor(denom / divisor)
    }
}

function makeCubeFaces() {
    const min = 0;
    const max = 1;

    const blf = vec4(min, min, min, 1);
    const blb = vec4(min, min, max, 1);
    const brf = vec4(min, max, min, 1);
    const brb = vec4(min, max, max, 1);

    const tlf = vec4(max, min, min, 1);
    const tlb = vec4(max, min, max, 1);
    const trf = vec4(max, max, min, 1);
    const trb = vec4(max, max, max, 1);

    const front = m32.zeros(4, 4);
    jm.insert(jm.col(front, 0), blf);
    jm.insert(jm.col(front, 1), brf);
    jm.insert(jm.col(front, 2), trf);
    jm.insert(jm.col(front, 3), tlf);

    const top = m32.zeros(4, 4);
    jm.insert(jm.col(top, 0), tlf);
    jm.insert(jm.col(top, 1), trf);
    jm.insert(jm.col(top, 2), trb);
    jm.insert(jm.col(top, 3), tlb);

    const bottom = m32.zeros(4, 4);
    jm.insert(jm.col(bottom, 0), blf);
    jm.insert(jm.col(bottom, 1), blb);
    jm.insert(jm.col(bottom, 2), brb);
    jm.insert(jm.col(bottom, 3), brf);

    const left = m32.zeros(4, 4);
    jm.insert(jm.col(left, 0), blf);
    jm.insert(jm.col(left, 1), tlf);
    jm.insert(jm.col(left, 2), tlb);
    jm.insert(jm.col(left, 3), blb);

    const right = m32.zeros(4, 4);
    jm.insert(jm.col(right, 0), brf);
    jm.insert(jm.col(right, 1), brb);
    jm.insert(jm.col(right, 2), trb);
    jm.insert(jm.col(right, 3), trf);

    const back = m32.zeros(4, 4);
    jm.insert(jm.col(back, 0), blb);
    jm.insert(jm.col(back, 1), tlb);
    jm.insert(jm.col(back, 2), trb);
    jm.insert(jm.col(back, 3), brb);

    const faces = [
        {
            points: front,
            topology: POLYGON,
            style: {
                fillStyle: "rgb(255,0,0)",
            }
        },
        {
            points: top,
            topology: POLYGON,
            style: {
                fillStyle: "rgb(255,0,0)",
            }
        },
        {
            points: bottom,
            topology: POLYGON,
            style: {
                fillStyle: "rgb(255,0,0)",
            }
        },
        {
            points: left,
            topology: POLYGON,
            style: {
                fillStyle: "rgb(255,0,0)",
            }
        },
        {
            points: right,
            topology: POLYGON,
            style: {
                fillStyle: "rgb(255,0,0)",
            }
        },
        {
            points: back,
            topology: POLYGON,
            style: {
                fillStyle: "rgb(255,0,0)",
            }
        },
    ];


    // compute normals

    for (let i = 0; i < faces.length; i++) {
        const po = faces[i].points;

        const v0 = jm.copy(jm.subvec(jm.col(po, 0), 0, 3));
        const v1 = jm.copy(jm.subvec(jm.col(po, 1), 0, 3));
        const v2 = jm.copy(jm.subvec(jm.col(po, 3), 0, 3));

        const a = jm.fromTo(v0, v1);
        const b = jm.fromTo(v0, v2);

        const n = cross(a, b);

        faces[i].n = n;
        console.log(i + ": " + jm.toString(jm.transpose(n)));
    }
    const mid = (max + min) * 0.5;
    return {
        faces,
        center: vec3(mid, mid, mid),
    };

}

document.body.onload = () => {

    const container = document.getElementById("container");
    ui.container = container;

    const canvas = document.createElement("canvas");
    canvas.id = "viewport";
    ui.canvas = canvas;
    container.appendChild(canvas);

    const helperText = text("Use the options below to customize your view. You can place the cube anywhere on the ground by holding down a mouse button at that spot on the screen.");
    const helperDiv = div([helperText]);
    helperDiv.classList.add('box');
    container.appendChild(helperDiv);

    const updateCamVP = (state, {
        phi = state.view.phi, theta = state.view.theta,
        height = state.view.height, distance = state.view.distance,
        fov = state.view.fov } = {}) => {

        const rotPhi = jm.axisAngle(vec3(0, 1, 0), -phi);
        const dir = mult(
            jm.axisAngle(jm.col(rotPhi, 0), -theta),
            mult(
                rotPhi,
                vec3(0, 0, 1)
            )
        );
        state.view = {};

        state.view.camPos = vec3(0, height, -distance);

        const V = jm.lookAt(state.view.camPos, add(state.view.camPos, dir), vec3(0, 1, 0));
        state.view.V = V;
        state.view.P = jm.perspective(jm.deg2rad(fov), canvas.width / canvas.height, 0.01, 100);
        state.view.W = jm.viewport(0, 0, canvas.width, canvas.height, true);;

        state.view.fov = fov;
        state.view.phi = phi;
        state.view.theta = theta;

        state.view.height = height;
        state.view.distance = distance;

        const VP = jm.mult(state.view.P, state.view.V);
        const VPi = jm.inv(VP);
        state.view.VP = VP;
        state.view.VPi = VPi;

        const event = new Event('camChange');
        container.dispatchEvent(event);
    };


    {
        const optionContainer = div();

        const [sliderPhi, phiUpdate] = namedSlider({
            min: -90, max: 90, value: state.view.phi,
            description: "Cam horizontal angle:",
            valueDisplay: v => {
                return v + " [deg]";
            },
            oninput: (e, s) => {
                const val = Number.parseFloat(s.value);
                const phi = jm.deg2rad(val);

                updateCamVP(state, { phi });
            },
        });

        optionContainer.appendChild(sliderPhi);

        const [sliderTheta, thetaUpdate] = namedSlider({
            min: -85, max: 85, value: state.view.theta,
            description: "Cam vertical angle:",
            valueDisplay: v => {
                return v + " [deg]";
            },
            oninput: (e, s) => {
                const val = Number.parseFloat(s.value);
                const theta = jm.deg2rad(val);

                updateCamVP(state, { theta });
            },
        });

        optionContainer.appendChild(sliderTheta);

        const [sliderHeight, heightUpdate] = namedSlider({
            min: -40, max: 40, value: state.view.height, props: {
                step: 0.5
            },
            description: "Cam height:",
            oninput: (e, s) => {
                const val = Number.parseFloat(s.value);
                const height = val;

                updateCamVP(state, { height });
            },
        });

        optionContainer.appendChild(sliderHeight);

        const [sliderDistance, distanceUpdate] = namedSlider({
            min: 0, max: 40, value: state.view.distance, props: {
                step: 0.5
            },
            description: "Cam distance:",
            oninput: (e, s) => {
                const val = Number.parseFloat(s.value);
                const distance = val;

                updateCamVP(state, { distance });
            },
        });

        optionContainer.appendChild(sliderDistance);

        const [sliderFov, fovUpdate] = namedSlider({
            min: 1, max: 179, value: state.view.fov,
            description: "Cam FOV (field of view):",
            valueDisplay: v => {
                return v + " [deg]";
            },
            oninput: (e, s) => {
                const val = Number.parseFloat(s.value);

                updateCamVP(state, { fov: val });
            },
        });

        optionContainer.appendChild(sliderFov);


        let objectUi = {};
        // object sliders

        const objContainer = div();

        {

            {
                const checkBoxCube = document.createElement("input");
                checkBoxCube.type = "checkbox";
                checkBoxCube.checked = state.displayCube;
                checkBoxCube.onchange = (e) => {
                    state.displayCube = checkBoxCube.checked;
                    const event = new Event('updateObject');
                    container.dispatchEvent(event);
                };

                objContainer.appendChild(div([text("Display object:"), checkBoxCube]));
            }

            {
                const checkboxGrid = document.createElement("input");
                checkboxGrid.type = "checkbox";
                checkboxGrid.checked = state.displayGrid;
                checkboxGrid.onchange = (e) => {
                    state.displayGrid = checkboxGrid.checked;
                    const event = new Event('updateObject');
                    container.dispatchEvent(event);
                };

                objContainer.appendChild(div([text("Display grids:"), checkboxGrid]));
            }


            const [sliderAngle, angleUpdate] = namedSlider({
                min: 0, max: 359, value: jm.rad2deg(state.cubeParameters.angle), props: {
                    step: 1
                },
                description: "Object angle:",
                valueDisplay: v => {
                    return v + " [deg]";
                },
                oninput: (e, s) => {
                    const val = Number.parseFloat(s.value);

                    const angle = jm.deg2rad(val);
                    state.cubeParameters.angle = angle;
                    state.cubeParameters.R = jm.axisAngle4(vec3(0, 1, 0), angle);
                    const event = new Event('updateObject');
                    container.dispatchEvent(event);
                },
            });

            objContainer.appendChild(sliderAngle);


            const [sliderObjHeight, objHeightUpdate] = namedSlider({
                min: 0.5, max: 20, value: state.cubeParameters.s.at(1), props: {
                    step: 0.5
                },
                description: "Object height:",
                oninput: (e, s) => {
                    const val = Number.parseFloat(s.value);
                    const h = val

                    state.cubeParameters.s.set(h, 1);
                    const event = new Event('updateObject');
                    container.dispatchEvent(event);
                },
            });

            objContainer.appendChild(sliderObjHeight);

            const [sliderObjectWidth, objWidthUpdate] = namedSlider({
                min: 0.5, max: 20, value: state.cubeParameters.s.at(0), props: {
                    step: 0.5
                },
                description: "Object width:",
                oninput: (e, s) => {
                    const val = Number.parseFloat(s.value);
                    const h = val

                    state.cubeParameters.s.set(h, 0);
                    const event = new Event('updateObject');
                    container.dispatchEvent(event);
                },
            });

            objContainer.appendChild(sliderObjectWidth);

            const [sliderObjectDepth, objDepthUpdate] = namedSlider({
                min: 0.5, max: 20, value: state.cubeParameters.s.at(2), props: {
                    step: 0.5
                },
                description: "Object depth:",
                oninput: (e, s) => {
                    const val = Number.parseFloat(s.value);
                    const h = val

                    state.cubeParameters.s.set(h, 2);
                    const event = new Event('updateObject');
                    container.dispatchEvent(event);
                },
            });

            objContainer.appendChild(sliderObjectDepth);

            objectUi = {
                sliderAngle,
            };
        }

        const screenContainer = div();
        {
            const [sliderCanvasSize, canvasSizeUpdate] = namedSlider({
                min: 1, max: 10, value: state.screenRatio * 10, props: {

                },
                valueDisplay: v => v / 10,
                description: "Canvas relative size:",
                oninput: (e, s) => {
                    const val = Number.parseFloat(s.value);
                    state.screenRatio = val / 10;
                    resizeCanvas();
                },
            });

            screenContainer.appendChild(sliderCanvasSize);
            {
                const inputAspectW = document.createElement("input");
                inputAspectW.type = "number";
                inputAspectW.min = 1;
                inputAspectW.max = 4000;
                inputAspectW.inputMode = "numeric";
                inputAspectW.placeholder = "width";
                inputAspectW.value = state.aspectW;
                inputAspectW.oninput = (e) => {
                    const num = Number.parseInt(inputAspectW.value);
                    if (isNaN(num)) {
                        return;
                    }
                    if (num < 1) {
                        return;
                    }

                    state.aspectW = num;
                    resizeCanvas();
                };

                const inputAspectH = document.createElement("input");
                inputAspectH.type = "number";
                inputAspectH.min = 1;
                inputAspectH.max = 4000;
                inputAspectH.placeholder = "height";
                inputAspectH.value = state.aspectH;
                inputAspectH.oninput = (e) => {
                    const num = Number.parseInt(inputAspectH.value);
                    if (isNaN(num)) {
                        return;
                    }
                    if (num < 1) {
                        return;
                    }
                    state.aspectH = num;
                    resizeCanvas();
                };

                screenContainer.appendChild(div([text("Aspect ratio: "), inputAspectW, text("x"), inputAspectH]));



            }

            // subview
            {

                {
                    const checkboxSubvView = document.createElement("input");
                    checkboxSubvView.type = "checkbox";
                    checkboxSubvView.checked = state.subView.display;
                    checkboxSubvView.onchange = (e) => {
                        state.subView.display = checkboxSubvView.checked;
                        const event = new Event('updateOverlay');
                        container.dispatchEvent(event);
                    };

                    screenContainer.appendChild(div([text("Display sub view:"), checkboxSubvView]));
                }

                const updateAspect = () => {
                    const av = state.subView.aspectW / state.subView.aspectH;

                    const ws = state.subView.scale * canvas.width;
                    const hs = state.subView.scale * canvas.height;

                    const as = ws / hs;
                    let width;
                    let height;


                    if (as > av) {
                        height = hs;
                        width = height * av;
                    } else {
                        width = ws;
                        height = width / av;
                    }

                    state.subView.left = state.subView.offsetW;
                    state.subView.right = state.subView.offsetW + width / canvas.width;
                    state.subView.bottom = state.subView.offsetH;
                    state.subView.top = state.subView.offsetH + height / canvas.height;
                };
                {
                    const inputAspectW = document.createElement("input");
                    inputAspectW.type = "number";
                    inputAspectW.min = 1;
                    inputAspectW.max = 4000;
                    inputAspectW.inputMode = "numeric";
                    inputAspectW.placeholder = "width";
                    inputAspectW.value = state.subView.aspectW;
                    inputAspectW.oninput = (e) => {
                        const num = Number.parseInt(inputAspectW.value);
                        if (isNaN(num)) {
                            return;
                        }
                        if (num < 1) {
                            return;
                        }

                        state.subView.aspectW = num;
                        updateAspect();
                        let maxOffset = 1 - (state.subView.right - state.subView.left);
                        state.subView.offsetW = Math.min(maxOffset, state.subView.offsetW);

                        maxOffset = 1 - (state.subView.top - state.subView.bottom);
                        state.subView.offsetH = Math.min(maxOffset, state.subView.offsetH);
                        const event = new Event('updateOverlay');
                        container.dispatchEvent(event);

                        container.dispatchEvent(new Event('updateOffsetSliders'));
                    };

                    const inputAspectH = document.createElement("input");
                    inputAspectH.type = "number";
                    inputAspectH.min = 1;
                    inputAspectH.max = 4000;
                    inputAspectH.placeholder = "height";
                    inputAspectH.value = state.subView.aspectH;
                    inputAspectH.oninput = (e) => {
                        const num = Number.parseInt(inputAspectH.value);
                        if (isNaN(num)) {
                            return;
                        }
                        if (num < 1) {
                            return;
                        }
                        state.subView.aspectH = num;
                        updateAspect();
                        let maxOffset = 1 - (state.subView.right - state.subView.left);
                        state.subView.offsetW = Math.min(maxOffset, state.subView.offsetW);

                        maxOffset = 1 - (state.subView.top - state.subView.bottom);
                        state.subView.offsetH = Math.min(maxOffset, state.subView.offsetH);
                        const event = new Event('updateOverlay');
                        container.dispatchEvent(event);

                        container.dispatchEvent(new Event('updateOffsetSliders'));
                    };

                    screenContainer.appendChild(div([text("Sub view aspect ratio: "), inputAspectW, text("x"), inputAspectH]));

                }

                const [sliderSubViewScale, svScaleUpdate] = namedSlider({
                    min: 0, max: 100, value: state.subView.scale * 100, props: {

                    },
                    valueDisplay: v => v / 100,
                    description: "Sub view scale:",
                    oninput: (e, s) => {
                        const val = Number.parseFloat(s.value);
                        state.subView.scale = val / 100;

                        updateAspect();
                        let maxOffset = 1 - (state.subView.right - state.subView.left);
                        state.subView.offsetW = Math.min(maxOffset, state.subView.offsetW);

                        maxOffset = 1 - (state.subView.top - state.subView.bottom);
                        state.subView.offsetH = Math.min(maxOffset, state.subView.offsetH);

                        const event = new Event('updateOverlay');
                        container.dispatchEvent(event);

                        container.dispatchEvent(new Event('updateOffsetSliders'));

                        return state.subView.scale * 100;

                    },
                });
                screenContainer.appendChild(sliderSubViewScale);

                const [sliderSubViewLeft, svleftUpdate] = namedSlider({
                    min: 0, max: 100, value: state.subView.offsetW * 100, props: {
                        id: "subviewOffsetW",

                    },
                    valueDisplay: v => numberString(v / 100, 2),
                    description: "Sub view offset x:",
                    oninput: (e, s) => {
                        const val = Number.parseFloat(s.value);
                        state.subView.offsetW = val / 100;

                        const maxOffset = 1 - (state.subView.right - state.subView.left);
                        state.subView.offsetW = Math.min(maxOffset, state.subView.offsetW);

                        updateAspect();

                        const event = new Event('updateOverlay');
                        container.dispatchEvent(event);
                        return state.subView.offsetW * 100;

                    },
                });
                screenContainer.appendChild(sliderSubViewLeft);


                const [sliderSubViewRight, svRightUpdate] = namedSlider({
                    min: 0, max: 100, value: state.subView.offsetH * 100, props: {
                        id: "subviewOffsetH",
                    },
                    valueDisplay: v => numberString(v / 100, 2),
                    description: "Sub view offset y:",
                    oninput: (e, s) => {
                        const val = Number.parseFloat(s.value);
                        state.subView.offsetH = val / 100;

                        const maxOffset = 1 - (state.subView.top - state.subView.bottom);
                        state.subView.offsetH = Math.min(maxOffset, state.subView.offsetH);

                        updateAspect();

                        const event = new Event('updateOverlay');
                        container.dispatchEvent(event);
                        return state.subView.offsetH * 100;

                    },
                });
                screenContainer.appendChild(sliderSubViewRight);


                container.addEventListener('updateOffsetSliders', e => {

                    svleftUpdate(state.subView.offsetW * 100);
                    svRightUpdate(state.subView.offsetH * 100);
                });

                // const sliderSubviewLeft = namedSlider({
                //     min: 0, max: 100, value: state.subView.left * 100, props: {

                //     },
                //     valueDisplay: v => v / 100,
                //     description: "Sub view left:",
                //     oninput: (e, s) => {
                //         const val = Number.parseFloat(s.value);
                //         state.subView.left = val / 100;
                //         state.subView.left = Math.min(state.subView.left, state.subView.right);

                //         const event = new Event('updateOverlay');
                //         container.dispatchEvent(event);

                //         return state.subView.left * 100;
                //     },
                // });
                // screenContainer.appendChild(sliderSubviewLeft);


                // const sliderSubviewRight = namedSlider({
                //     min: 0, max: 100, value: state.subView.right * 100, props: {

                //     },
                //     valueDisplay: v => v / 100,
                //     description: "Sub view right:",
                //     oninput: (e, s) => {
                //         const val = Number.parseFloat(s.value);
                //         state.subView.right = val / 100;
                //         state.subView.right = Math.max(state.subView.left, state.subView.right);

                //         const event = new Event('updateOverlay');
                //         container.dispatchEvent(event);
                //         return state.subView.right * 100;

                //     },
                // });
                // screenContainer.appendChild(sliderSubviewRight);

                // const sliderSubviewBottom = namedSlider({
                //     min: 0, max: 100, value: state.subView.bottom * 100, props: {

                //     },
                //     valueDisplay: v => v / 100,
                //     description: "Sub view bottom:",
                //     oninput: (e, s) => {
                //         const val = Number.parseFloat(s.value);
                //         state.subView.bottom = val / 100;
                //         state.subView.bottom = Math.min(state.subView.bottom, state.subView.top);
                //         s.value = state.subView.bottom * 100;

                //         const event = new Event('updateOverlay');
                //         container.dispatchEvent(event);

                //         return state.subView.bottom * 100;
                //     },
                // });
                // screenContainer.appendChild(sliderSubviewBottom);

                // const sliderSubviewTop = namedSlider({
                //     min: 0, max: 100, value: state.subView.top * 100, props: {

                //     },
                //     valueDisplay: v => v / 100,
                //     description: "Sub view top:",
                //     oninput: (e, s) => {
                //         const val = Number.parseFloat(s.value);
                //         state.subView.top = val / 100;
                //         state.subView.top = Math.max(state.subView.bottom, state.subView.top);
                //         s.value = state.subView.top * 100;

                //         const event = new Event('updateOverlay');
                //         container.dispatchEvent(event);

                //         return state.subView.top * 100;
                //     },
                // });
                // screenContainer.appendChild(sliderSubviewTop);

                // const subViewAspect = text("");
                // screenContainer.appendChild(div([subViewAspect]));
                // // could do a more specific event, but its ok
                // container.addEventListener('updateOverlay', e => {
                //     const { left, right, top, bottom } = state.subView;

                //     const x0 = left * canvas.width;
                //     const x1 = right * canvas.width;

                //     // reverse y
                //     const y0 = bottom * canvas.height;
                //     const y1 = top * canvas.height;
                //     const w = x1 - x0;
                //     const h = y1 - y0;

                //     const { num, denom } = decimalToFraction(w / h, 1);
                //     subViewAspect.innerHTML = `${num}x${denom}`;
                // });

                // const event = new Event('updateOverlay');
                // container.dispatchEvent(event);

            }

        }

        ui.options = {
            optionContainer,
            sliderPhi,
            sliderTheta,
            objectUi
        };


        const options = div([optionContainer, objContainer, screenContainer]);
        options.classList.add('options');
        container.appendChild(options);

    }


    canvas.width = 1024;
    canvas.height = canvas.width / state.aspect;
    const ctx = canvas.getContext("2d");


    function resizeCanvas() {

        const av = state.aspectW / state.aspectH;

        const ws = state.screenRatio * document.documentElement.clientWidth;
        const hs = state.screenRatio * document.documentElement.clientHeight;

        const as = ws / hs;
        let width;
        let height;


        if (as > av) {
            height = hs;
            width = height * av;
        } else {
            width = ws;
            height = width / av;
        }

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = width;
        canvas.height = height;

        updateCamVP(state, {});

    };

    window.addEventListener('resize', resizeCanvas, false);


    const gv0 = vec3(1, 0, 0);
    const gv1 = vec3(0, 0, 1);

    let center = vec3(0, 0, 0);
    let s = 20;

    const corners = createPlaneCorners({ v0: gv0, v1: gv1, s });

    const cubeFaces = makeCubeFaces();
    state.cubeFaces = cubeFaces;


    const levels = 2;
    const res = 20;


    let alpha = 0.5;


    const grid = createGrid({ c: center, v0: gv0, v1: gv1, s, res: res });

    grid.style = {
        strokeStyle: `rgba(0,0,0,${alpha})`,
    };

    state.centerGridWorld = grid;

    // state.surroundGridsWorld = [];
    state.surroundGridsWorld = createSurroundingGrids({
        center, v0: gv0, v1: gv1, s, res: res / 2, alpha, levels
    });




    const updateViewChange = (state) => {

        const {
            camPos,
            V,
            P,
            VP,
            VPi,
            W
        } = state.view;
        let cornersH = corners.map(x => jm.copy(jm.hvec(x)));

        // grid side vanishing points and lines
        {
            const { gridVanishingPointsNDC, gridVanishingLinesNDC, gridVanishingLinesReverseNDC } = computeGridVanishingPointsLines(corners, gv0, gv1, state.view);
            state.gridVanishingPointsNDC = gridVanishingPointsNDC;
            state.gridVanishingLinesNDC = gridVanishingLinesNDC;
            state.gridVanishingLinesReverseNDC = gridVanishingLinesReverseNDC;
        }


        state.centerGridCornerPointsWorld = {
            points: m32.fromCols(cornersH),
            topology: POINTS,
        };


        const vanishingLine = computeVanishingLineEquation({
            VP
        });
        if (vanishingLine.length > 1) {
            const vline = {
                points: m32.fromCols(vanishingLine),
                topology: LINES,
                style: {
                    strokeStyle: "rgb(255,0,0)"
                }
            }
            state.horizonLineNDC = vline;
        } else {
            state.horizonLineNDC = null;

        }

        computeCubeVanishingPoints(state);


    }


    const computeCubeVanishingPoints = (state) => {
        // compute vanishing points


        let M = state.cubeParameters.M;
        if (state.objectPoint) {
            M = mult(jm.translation(jm.subvec(state.objectPoint, 0, 3)), M);
        }

        M = mult(state.view.VP, M);

        const vanishingPoints = [];
        const vanishingLines = [];
        const reverseLines = [];

        const { cubeFaces } = state;
        const faces = cubeFaces.faces;

        const vanishingColor = "rgb(0,0,255)";
        const vanishingColorReverse = "rgba(0,0,255,0.35)";
        for (let i = 0; i < faces.length; i++) {
            const ci = faces[i];
            const n = ci.points.cols();
            const { vanishingPoints: vp, vanishingLines: vl, reverseLines: rl } = computeVanishingPointsPoly(ci.points, M, {
                lineStyle: {
                    strokeStyle: vanishingColor
                },
                reverseLineStyle: {
                    strokeStyle: vanishingColorReverse
                }
            });
            vanishingPoints.push(...vp);
            vanishingLines.push(...vl);
            reverseLines.push(...rl);
            // for (let j = 0; j < n; j++) {
            //     const pj = jm.copy(col(ci.points, j));
            //     const qj = jm.copy(col(ci.points, (j + 1) % n));

            //     const vj = sub(qj, pj);


            //     const pjh = mult(M, pj);
            //     const vjh = mult(M, vj);

            //     if (isAtInfinity(pjh) || isAtInfinity(vjh) || pjh.at(3) < 0) {
            //         continue;
            //     }

            //     jm.homogenize(pjh);
            //     jm.homogenize(vjh);

            //     vanishingPoints.push(vjh);
            //     vanishingLines.push({
            //         points: m32.fromCols([pjh, vjh]),
            //         topology: LINES,
            //         style: {
            //             strokeStyle: vanishingColor
            //         }
            //     })
            // }

        }

        state.cubeVanishingPoints = vanishingPoints;
        state.cubeVanishingLines = vanishingLines;
        state.cubeReverseVanishingLines = reverseLines;
    };

    container.addEventListener('camChange', e => {

        updateViewChange(state);
        renderState(state);

    });
    container.addEventListener('updateOverlay', e => {

        renderState(state);

    });


    container.addEventListener('updateObject', e => {

        const { R, s } = state.cubeParameters;
        const S = jm.scaling(s);
        const scaledCenter = jm.subvec(mult(S, hvec(state.cubeFaces.center)), 0, 3);

        // const Rot = mult(
        //     jm.translation(scaledCenter),
        //     mult(
        //         R,
        //         jm.translation(neg(scaledCenter))
        //     ));
        const Rot = R;
        state.cubeParameters.M = mult(
            Rot,
            S);
        state.cubeParameters.Mi = jm.inv(state.cubeParameters.M);

        computeCubeVanishingPoints(state);
        renderState(state);

    });


    const handleMouseUpdate = e => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left; //x position within the element.
        const y = e.clientY - rect.top;  //y position within the element.

        const p0 = vec4(x, y, 0, 1);
        const p1 = vec4(x, y, 1, 1);

        const T = mult(state.view.W, state.view.VP);
        const Ti = jm.inv(T);

        const p0i = mult(Ti, p0);
        const p1i = mult(Ti, p1);

        jm.homogenize(p0i);
        jm.homogenize(p1i);

        const v = jm.copy(jm.subvec(sub(p1i, p0i), 0, 3));
        const p = jm.copy(jm.subvec(p0i, 0, 3));

        // floor plane has z = 0 and contains origin with normal [0,1,0];
        const n = vec3(0, 1, 0);

        const nv = dot(v, n);

        if (Math.abs(nv) < 1E-7) {
            // parallel
            // state.objectPoint = null;

            // const event = new Event('updateObject');
            // container.dispatchEvent(event);
            return;
        }

        const t = - dot(n, p) / nv;

        if (t < 0) {
            // behind camera
            // state.objectPoint = null;
            // const event = new Event('updateObject');
            // container.dispatchEvent(event);
            return;
        }

        const objPoint = add(p, scale(v, t));

        state.objectPoint = jm.copy(hvec(objPoint));

        const event = new Event('updateObject');
        container.dispatchEvent(event);

    }

    const mouseState = {
        down: false,
    }
    canvas.addEventListener("mousedown", (e) => {
        handleMouseUpdate(e);
        mouseState.down = true;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (mouseState.down) {
            handleMouseUpdate(e);
        }
    });
    canvas.addEventListener("mouseup", (e) => {

        mouseState.down = false;
    });


    const renderState = (state) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const {
            camPos,
            V,
            P,
            VP,
            VPi,
            W
        } = state.view;

        const obj = [];

        // handle grids
        if (state.displayGrid) {
            const grids = [state.centerGridWorld, ...state.surroundGridsWorld];
            for (let i = 0; i < grids.length; i++) {

                obj.push(transformObject(grids[i], VP));
            }

        }


        // horizon
        if (state.horizonLineNDC) {
            obj.push(state.horizonLineNDC);
        }

        if (state.displayGrid) {
            const van = state.gridVanishingPointsNDC;
            for (let i = 0; i < van.length; i++) {
                obj.push({ points: van[i], topology: POINTS });

            }
            // vanishing lines
            obj.push(...state.gridVanishingLinesReverseNDC);

            obj.push(...state.gridVanishingLinesNDC);
        }






        // cube
        if (state.displayCube) {
            if (state.objectPoint) {
                obj.push({
                    points: mult(VP, state.objectPoint),
                    topology: POINTS
                })
            }

            {
                const van = state.cubeVanishingPoints;
                for (let i = 0; i < van.length; i++) {
                    obj.push({
                        points: van[i], topology: POINTS, style: {
                            fillStyle: "rgb(0,0,255)"
                        }
                    });

                }
            }


            // vanishing lines
            obj.push(...state.cubeReverseVanishingLines);
            obj.push(...state.cubeVanishingLines);



            let M = state.cubeParameters.M;
            if (state.objectPoint) {
                M = mult(jm.translation(jm.subvec(state.objectPoint, 0, 3)), M);
            }

            M = mult(VP, M);
            let camLocal = camPos;
            if (state.objectPoint) {
                // move cam into local space
                camLocal = sub(camLocal, jm.subvec(state.objectPoint, 0, 3));
            }
            camLocal = jm.copy(jm.subvec(mult(state.cubeParameters.Mi, hvec(camLocal)), 0, 3));

            const faces = state.cubeFaces.faces;
            for (let i = 0; i < faces.length; i++) {
                const ci = faces[i];
                const ni = faces[i].n;
                const relv = jm.fromTo(jm.subvec(jm.col(ci.points, 0), 0, 3), camLocal);
                const dotvn = dot(ni, relv);
                if (dotvn < 0) {
                    continue;
                }
                obj.push(
                    transformObject(ci, M));
            }
        }

        for (let i = 0; i < obj.length; i++) {

            let oi = obj[i];
            oi = clipObject(oi);
            if (!oi) {
                continue;
            }
            jm.homogenize(oi.points);
            oi.points = jm.mult(W, oi.points);
            drawObject(oi, ctx);
        }

        // overlay
        if (state.subView.display) {
            const { left, right, bottom, top } = state.subView;

            const { width: w, height: h } = canvas;

            const x0 = left * w;
            const x1 = right * w;

            // reverse y
            const y0 = h - 1 - bottom * h;
            const y1 = h - 1 - top * h;

            const dx = (x1 - x0);
            const dy = (y0 - y1);

            // we also need to switch y0 and y1 for the ctx draw call

            ctx.save();
            ctx.strokeStyle = "rgb(64,64,64)";
            ctx.lineWidth = 2;
            ctx.strokeRect(x0, y1, dx, dy);

            // show midpoints
            const xm = x0 + 0.5 * dx;
            const ym = y1 + 0.5 * dy;

            const lw = Math.max(1, Math.min(8, w * 0.1));
            const lh = Math.max(1, Math.min(8, h * 0.1));


            ctx.beginPath();
            ctx.moveTo(x0 - lw, ym);
            ctx.lineTo(x0 + lw, ym);

            ctx.moveTo(x1 - lw, ym);
            ctx.lineTo(x1 + lw, ym);

            ctx.moveTo(xm, y0 - lh);
            ctx.lineTo(xm, y0 + lh);

            ctx.moveTo(xm, y1 - lh);
            ctx.lineTo(xm, y1 + lh);

            ctx.stroke();

            ctx.restore();


        }
    };


    resizeCanvas();


};
