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

function vectorize(points) {
    const n = points.cols();
    const r = VecF32.uninitialized(2 * n);

    m.colwise(points, (col, j) => {
        r.set(col.at(0), 2 * j);
        r.set(col.at(1), 2 * j + 1);
    });

    return r;
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
    ctx.arc(pt.at(0), pt.at(1), 5, 0, 2.0 * Math.PI);
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

function scale2(v) {
    const S = MatF32.id(2, 2);
    m.insert(m.diag(S), v);
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


function createOffsetShapes(shape) {
    let newShapes = [];

    const n = shape.cols();
    for (let offset = 1; offset < n; offset++) {
        let newShape = m.similar(shape);

        for (let i = 0; i < n; i++) {
            let idx = (offset + i) % n;
            m.insert(m.col(newShape, i), m.col(shape, idx));
        }
        newShapes.push(newShape);
    }

    return newShapes;
}

function reverseShape(shape) {
    let newShape = m.similar(shape);
    const n = shape.cols();
    for (let i = 0; i < n; i++) {
        let idx = (n - i) % n;
        m.insert(m.col(newShape, i), m.col(shape, idx));
    }

    return newShape;
}

function centerShape(shape) {
    const bmin = m.rowreduce(shape, (row, i) => {
        return m.min(row);
    });

    const bmax = m.rowreduce(shape, (row, i) => {
        return m.max(row);
    });

    const center = m.scale(m.add(bmax, bmin), 0.5);
    const bdelta = m.sub(bmax, bmin);

    const T = translation2(m.neg(center));


    const centeredShape = m.similar(shape);
    m.insert(centeredShape, m.block(m.mult(T, m.PaddedView.new(shape, 3, shape.cols(), 1, 1)), 0, 0, 2));

    return m.copy(centeredShape);
}


function normalizeShape(shape) {
    const bmin = m.rowreduce(shape, (row, i) => {
        return m.min(row);
    });

    const bmax = m.rowreduce(shape, (row, i) => {
        return m.max(row);
    });

    const center = m.scale(m.add(bmax, bmin), 0.5);
    const bdelta = m.sub(bmax, bmin);
    const normScale = m.max(bdelta) * 0.5;

    const T = m.mult(
        scale(v2(1.0 / normScale, 1.0 / normScale)),
        translation2(m.neg(center))
    );

    const scaledShape = m.similar(shape);
    m.insert(scaledShape, m.block(m.mult(T, m.PaddedView.new(shape, 3, shape.cols(), 1, 1)), 0, 0, 2));

    return m.copy(scaledShape);
}

const shapes = [];

class Shape {
    constructor(name, baseShape,
        { closeShape = false, makeOffsets = false, makeReverse = false,
            minAspect = 1.0, maxAspect = 1.0,
            minScale = 1.0, maxScale = 1,
            minAngle = 0.0, maxAngle = 0.0 } = {}) {
        this.name = name;

        const scaledShape = normalizeShape(baseShape);
        this.baseShapes = [scaledShape];

        if (makeOffsets) {
            const offsets = createOffsetShapes(this.baseShapes[0]);
            for (let i = 0; i < offsets.length; i++) {
                this.baseShapes.push(offsets[i]);
            }
        }

        if (makeReverse) {
            const n = this.baseShapes.length;
            for (let i = 0; i < n; i++) {
                this.baseShapes.push(reverseShape(this.baseShapes[i]));
            }
        }
        if (closeShape) {
            for (let i = 0; i < this.baseShapes.length; i++) {
                const si = this.baseShapes[i];
                let closed = m.similar(si, si.rows(), si.cols() + 1);
                m.insert(m.block(closed, 0, 0, si.rows(), si.cols()), si);
                m.insert(m.col(closed, si.cols()), m.col(si, 0));
                this.baseShapes[i] = closed;
            }
        }



        this.minAspect = minAspect;
        this.maxAspect = maxAspect;

        this.minScale = minScale;
        this.maxScale = maxScale;

        this.minAngle = minAngle;
        this.maxAngle = maxAngle;


        this.examples = [];
    }

    createVariation() {
        const s = Math.random() * (this.maxScale - this.minScale) + this.minScale;
        const a = Math.random() * (this.maxAngle - this.minAngle) + this.minAngle;
        const aspect = Math.random() * (this.maxAspect - this.minAspect) + this.minAspect;

        const sidx = Math.floor(Math.random() * this.baseShapes.length);

        let sx = s;
        let sy = s / aspect;
        // make sure all values are at most 1
        if (sy > 1.0) {
            sx /= sy;
            sy = 1.0;
        }
        const T = m.mult(
            rot2(a),
            scale2(v2(sx, sy))
        );

        return {
            shape: m.mult(T, this.baseShapes[sidx]),
            scale: v2(sx, sy),
            angle: a,
            aspect
        };
    }
};


let State = {
    currentTemplateIdx: 0,
    currentShape: null,
    mouse_points: [],
    down: false,
};


function drawTemplate(shape) {
    let w = canvas.width;
    let h = canvas.height;

    let s = Math.min(w, h) * 0.5 * 0.45;

    const center = v2(w / 2, h / 2);
    const T = m.mult(
        translation2(center),
        scale(v2(s, s))
    );

    let pt = m.mult(T, m.PaddedView.new(shape, 3, shape.cols(), 1, 1));
    ctx.save();
    let p = m.col(pt, 0);
    let n = pt.cols();
    pt = m.block(pt, 0, 0, 2, pt.cols());


    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgb(128,128,128)";
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

    {
        ctx.save();
        let p0 = m.col(pt, 0);
        let p1 = m.col(pt, 1);

        let d = m.fromTo(p0, p1);
        let dl = m.norm(d);
        const minLength = 60;
        if (dl < minLength) {
            d = m.scale(m.normalize(d), minLength);
            dl = minLength;
        }
        p1 = m.add(p0, d);
        const n = v2(-d.at(1), d.at(0));
        m.scale(n, 0.1, n);
        if (m.norm(n) < 10) {
            m.scale(n, 10 / m.norm(n), n);
        }

        ctx.lineWidth = 4;
        ctx.fillStyle = "rgba(255,32,32)";
        ctx.strokeStyle = "rgba(255,32,32)";
        ctx.beginPath();
        ctx.moveTo(p0.at(0), p0.at(1));
        ctx.lineTo(p1.at(0), p1.at(1));
        ctx.stroke();

        const arrowStart = m.add(p0, m.scale(d, 0.7));

        ctx.beginPath();
        ctx.moveTo(arrowStart.at(0), arrowStart.at(1));

        let pa = m.add(arrowStart, n);
        ctx.lineTo(pa.at(0), pa.at(1));
        ctx.lineTo(p1.at(0), p1.at(1));
        pa = m.sub(arrowStart, n);
        ctx.lineTo(pa.at(0), pa.at(1));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }


    ctx.restore();

}

document.body.onload = () => {

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    // ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
    ctx.canvas.style.touchAction = "none";

    const res = 64;

    shapes.push(new Shape("Rectangle", MatF32.fromCols([
        v2(0, 0),
        v2(1, 0),
        v2(1, 1),
        v2(0, 1),
    ]), {
        closeShape: true, makeOffsets: true, makeReverse: true,
        minAspect: 1 / 5, maxAspect: 5,
        minAngle: 0.0, maxAngle: 0.0,
        minScale: 0.4, maxScale: 1.0,

    }));

    shapes.push(new Shape("Triangle", MatF32.fromCols([
        v2(0, 0),
        v2(2, 0),
        v2(1, 1),

    ]), {
        closeShape: true, makeOffsets: true, makeReverse: true,
        minAspect: 1 / 2, maxAspect: 2,
        minAngle: 0.0, maxAngle: 2.0 * Math.PI,
        minScale: 0.4, maxScale: 1.0,

    }));




    shapes.push(new Shape("Line", MatF32.fromCols([
        v2(0, 0),
        v2(1, 0),
    ]), {
        makeOffsets: true,
        minAngle: 0.0, maxAngle: 2.0 * Math.PI,
        minScale: 0.4, maxScale: 1.0,
    }));


    const cpoints = [];

    {
        const r = 64;
        for (let i = 0; i < r - 1; i++) {
            const t = 2.0 * Math.PI * i / (r - 1);
            cpoints.push(v2(
                Math.cos(t),
                Math.sin(t)
            ));
        }
    }

    shapes.push(new Shape("Circle", MatF32.fromCols(cpoints),
        {
            closeShape: true, makeReverse: true,
            minAngle: 0.0, maxAngle: 2.0 * Math.PI,
            minScale: 0.1, maxScale: 1.0,
        }));

    State.currentTemplateIdx = 0;
    State.currentShape = shapes[State.currentTemplateIdx].createVariation();

    const resetMouse = () => {
        State.mouse_points = [];
        State.down = false;
    };

    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();

        return v2(evt.clientX - rect.left, evt.clientY - rect.top);
    };


    const drawState = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawTemplate(State.currentShape.shape);

        if (State.mouse_points.length > 1) {
            ctx.save();
            ctx.lineWidth = 4;
            ctx.strokeStyle = "rgb(0,0,255)";
            const g = MatF32.fromCols(State.mouse_points);
            ctx.fillStyle = "rgb(0,0,255)";
            draw_points(g, ctx);

            ctx.restore();
        }

    };
    const beginStroke = (pos) => {
        State.mouse_points = [];
        State.down = true;
        State.mouse_points.push(pos);

        drawState();
    };

    const addToStroke = (pos) => {
        if (!State.down) {
            return;
        }
        State.mouse_points.push(pos);
        const g = MatF32.fromCols(State.mouse_points);

        drawState();

    };

    const closeStroke = (pos) => {
        State.down = false;

        State.mouse_points.push(pos);

        const g = MatF32.fromCols(State.mouse_points);


        drawState();



        {
            const max = m.max(g);
            const g2 = m.scale(g, 1.0 / max);
            const v = [];
            m.colwise(g2, (col, j) => {
                v.push(g2.at(0));
                v.push(g2.at(1));
            });
        }


        ctx.restore();
    };
    const mousedown = (e) => {
        beginStroke(getMousePos(canvas, e));
    };
    const mousemove = (e) => {

        addToStroke(getMousePos(canvas, e));
    };

    const mouseup = (e) => {
        closeStroke(getMousePos(canvas, e));
    };

    let lastPos = null;
    const touchdown = (e) => {
        lastPos = getMousePos(canvas, e.touches[0]);
        beginStroke(getMousePos(canvas, e.touches[0]));
    };
    const touchmove = (e) => {
        lastPos = getMousePos(canvas, e.touches[0]);
        addToStroke(getMousePos(canvas, e.touches[0]));

    };
    const touchup = (e) => {

        closeStroke(lastPos);
        lastPos = null;

    };

    canvas.addEventListener('mousedown', mousedown, false);
    canvas.addEventListener('mousemove', mousemove, false);
    canvas.addEventListener('mouseup', mouseup, false);

    canvas.addEventListener('touchstart', touchdown, false);
    canvas.addEventListener('touchmove', touchmove, false);
    canvas.addEventListener('touchend', touchup, false);


    drawState();

    const selectShape = document.getElementById("selectShape")
    for (let i = 0; i < shapes.length; i++) {
        const si = shapes[i];
        const option = new Option(si.name, i);
        // add it to the list
        selectShape.add(option, undefined);
    }
    selectShape.value = State.currentTemplateIdx;

    selectShape.onchange = e => {

        State.currentTemplateIdx = parseInt(e.target.value);
        State.currentShape = shapes[State.currentTemplateIdx].createVariation();
        resetMouse();

        drawState();
    };

    const resetTemplate = document.getElementById("resetTemplate");
    resetTemplate.onclick = () => {
        State.currentShape = shapes[State.currentTemplateIdx].createVariation();
        resetMouse();
        drawState();
    };

    const clearStroke = document.getElementById("clearStroke");
    clearStroke.onclick = () => {
        resetMouse();
        drawState();
    };

    const addButton = document.getElementById("addPattern");
    addButton.onclick = () => {
        if (State.mouse_points.length < 10) {
            return;
        }

        // restore base shape
        const a = State.currentShape.angle;
        const s = State.currentShape.scale;
        const aspect = State.currentShape.aspect;

        const T = m.mult(
            scale2(v2(1.0 / s.at(0), 1.0 / s.at(1))),
            rot2(-a)
        );

        let points = MatF32.fromCols(State.mouse_points);
        points = centerShape(points);
        points = m.mult(T, points);
        points = normalizeShape(points);

        const v = vectorize(points);
        shapes[State.currentTemplateIdx].examples.push(v);
        State.currentShape = shapes[State.currentTemplateIdx].createVariation();
        resetMouse();
        drawState();


        // DEBUG: Transforms the drawn shape into base orientation/scale
        // {
        //     let w = canvas.width;
        //     let h = canvas.height;

        //     let s = Math.min(w, h) * 0.5 * 0.2;

        //     const center = v2(w / 2, h / 2);
        //     const T2 = m.mult(
        //         translation2(center),
        //         scale(v2(s, s))
        //     );

        //     let pt = m.mult(T2, m.PaddedView.new(points, 3, points.cols(), 1, 1));
        //     ctx.save();
        //     pt = m.block(pt, 0, 0, 2, pt.cols());

        //     ctx.save();
        //     ctx.lineWidth = 4;
        //     ctx.strokeStyle = "rgb(0,0,255)";
        //     ctx.fillStyle = "rgb(0,0,255)";
        //     draw_points(pt, ctx);
        // }


        ctx.restore();

    };

    const downloadTxt = (filename, text) => {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    };

    const dlButton = document.getElementById("download");
    dlButton.onclick = () => {

        let result = "";
        for (let i = 0; i < shapes.length; i++) {
            const si = shapes[i];
            if (si.examples.length == 0) {
                continue;
            }
            result += "------------\n" + si.name + "\n------------\n";
            for (let j = 0; j < si.examples.length; j++) {
                result += m.toString(m.transpose(si.examples[j])) + "\n";
            }
            result += ";\n";
        }
        downloadTxt("stroke_database.txt", result);
    };

};