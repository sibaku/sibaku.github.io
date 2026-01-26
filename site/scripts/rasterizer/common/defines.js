import * as jsm from "../../bundles/jsmatrix.bundle.min.js";

const {
    add,
    scale,

    VecF32: v32,
} = jsm;


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
    const format = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals
    });


    if (typeof (m) === "number") {
        return format.format(m);
    }

    if (typeof (m) === "string") {
        return m;
    }
    // else assume m is a matrix

    // convert to string
    const mstr = jsm.map(m, x => x.toString(), jsm.MatAny.uninitialized(m.rows(), m.cols()));
    jsm.map(mstr, x => format.format(x), mstr);
    const rows = jsm.rowreduce(mstr, x => jsm.toArray(x).join(" & "), jsm.MatAny.uninitialized(m.rows(), 1));
    return "\\begin{pmatrix}" + jsm.toArray(rows).join("\\\\") + "\\end{pmatrix}";
}

export {
    vec2,
    vec3,
    vec4,
    mix,
    ceil,
    floor,
    isAny,
    idiv,
    to_int,
    reflect,
    clamp,
    toLatex,
}