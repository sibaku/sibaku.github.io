/* eslint-disable no-unused-vars */
/* global jsm, v32, m32, vec2, vec3, vec4 */
/* global subvec, copy */
/* global add, sub, mult, scale, cwiseMin, cwiseMax, dot, isAny, floor, ceil, abs, cwiseMult, clamp */
/* global to_int */


const dot = jsm.dot;
const cross = jsm.cross;
const add = jsm.add;
const sub = jsm.sub;
const mult = jsm.mult;
const scale = jsm.scale;
const abs = jsm.abs;
const subvec = jsm.subvec;
const diag = jsm.diag;
const block = jsm.block;
const transpose = jsm.transpose;
const fill = jsm.fill;
const insert = jsm.insert;
const copy = jsm.copy;

const cwiseMin = jsm.cwiseMin;
const cwiseMax = jsm.cwiseMax;
const cwiseMult = jsm.cwiseMult;

const v32 = jsm.VecF32;
const m32 = jsm.MatF32;

function vec2(x = 0, y = 0) {
    return v32.from([x, y]);
}

function vec3(x = 0, y = 0, z = 0) {
    return v32.from([x, y, z]);
}
function vec4(x = 0, y = 0, z = 0, w = 0) {
    return v32.from([x, y, z, w]);
}

const mix = (a, b, t) => add(scale(a, 1.0 - t), scale(b, t));
const ceil = (a, out) => jsm.map(a, (v, row, col) => Math.ceil(v), out);
const floor = (a, out) => jsm.map(a, (v, row, col) => Math.floor(v), out);
const isAny = (a, b, cmp) => jsm.reduce(jsm.map(a, (v, row, col) => cmp(v, b.at(row, col))),
    (acc, v) => acc || v, false
);


function idiv(a, b) { return Math.trunc(a / b); }

function to_int(x) { return Math.trunc(x); }

function reflect(i, n) {
    // I - 2.0 * dot(N, I) * N. 
    const d = jsm.dot(i, n);
    const r = jsm.scale(n, 2 * d);
    jsm.sub(i, r, r);
    return r;
}

function clamp(x, lower, upper) {
    return Math.min(Math.max(x, lower), upper);
}

function toLatex(m, { maxDecimals = 3 } = {}) {



    // find maximum length per col
    const dots = "...";
    const trim_decimals = s => {

        const pointIdx = s.indexOf('.');
        if (pointIdx < 0) {
            return s;
        }

        const numDecimals = s.length - pointIdx;

        if (numDecimals < maxDecimals) {
            return s;
        }


        s = s.substring(0, pointIdx + 1 + maxDecimals) + dots;

        return s;
    };

    if (typeof (m) === "number") {
        return trim_decimals(String(m));
    }

    if (typeof (m) === "string") {
        return m;
    }

    // else assume m is a matrix


    // convert to string
    const mstr = jsm.map(m, x => x.toString(), jsm.MatAny.uninitialized(m.rows(), m.cols()));
    jsm.map(mstr, x => trim_decimals(x), mstr);
    const rows = jsm.rowreduce(mstr, x => jsm.toArray(x).join(" & "), jsm.MatAny.uninitialized(m.rows(), 1));
    return "\\begin{pmatrix}" + jsm.toArray(rows).join("\\\\") + "\\end{pmatrix}";
}

