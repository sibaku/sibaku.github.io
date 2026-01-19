import * as alg from "../bundles/algeobra.bundle.min.js";

import * as jsm from "../bundles/jsmatrix.bundle.min.js"

import renderMathInElement from "../extern/katex/contrib/auto-render.mjs";


import {
    makeSlider,
    makeContainer,
    makeTextField,
    makeUpdateSlider,
    makeCheckboxNoLabel,
    makeOptions,
    makeHeadline,
    makeCanvas,
    makeSpan,
} from "../lib/commonHtmlHelper.js";


const format = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
});
function toLtx(a) {
    const f = x => x === undefined ? "\\_" : typeof (x) === 'number' ? format.format(x) : x;
    // const f = x => typeof(x);
    const mstr = jsm.map(a, f, jsm.MatAny.uninitialized(a.rows(), a.cols()));

    const rows = jsm.rowreduce(mstr, x => jsm.toArray(x).join(" & "), jsm.MatAny.uninitialized(a.rows(), 1));

    return '\\begin{pmatrix}' + jsm.toArray(rows).join("\\\\") + '\\end{pmatrix}';

};

function addLabel(scene, obj, text, { props = {}, offset = null } = {}) {
    if (!offset) {
        offset = { x: 0.0, y: -0.25 };
    }
    const ov = scene.get(obj).value;
    if (ov.type === alg.TYPE_POINT) {
        const refv = scene.add(new alg.DefVector({ ...offset }), alg.DefVector.fromRefVector({ ref: obj }), { invisible: true });
        const ref = scene.add(new alg.DefPoint(), alg.DefPoint.fromPointOrVector(refv), { invisible: true });
        const t = text != null ? (text instanceof Function ? text : () => text) : "";
        return scene.add(new alg.DefText({ text: t }), alg.DefText.fromObjectRef({ obj, ref }), props);
    } else if (ov.type === alg.TYPE_VECTOR) {
        return scene.add(new alg.DefFunc((deps, params) => {
            const { obj } = deps;
            const { offset } = params;
            const midx = obj.ref.x + 0.5 * obj.x;
            const midy = obj.ref.y + 0.5 * obj.y;

            const n = alg.Vec2.normalizeIfNotZero(alg.Vec2.normal2D(obj));

            let o = alg.Vec2.add(alg.Vec2.vec2(midx, midy), alg.Vec2.scale(n, offset.y));
            o = alg.Vec2.add(o, alg.Vec2.scale(alg.Vec2.normalizeIfNotZero(obj), offset.x));
            let t = text;
            if (t instanceof Function) {
                t = t(obj);
            }
            return alg.makeText({ text: t, ref: { x: o.x, y: o.y } });
        }), alg.DefFunc.from({ obj }, { offset }), props);
    } else if (ov.type === alg.TYPE_LINE) {
        return scene.add(new alg.DefFunc((deps, params) => {
            const { obj } = deps;
            const { offset } = params;
            const midx = (obj.p0.x + obj.p1.x) * 0.5;
            const midy = (obj.p0.y + obj.p1.y) * 0.5;
            const dir = alg.Vec2.sub(obj.p1, obj.p0);

            const n = alg.Vec2.normalizeIfNotZero(alg.Vec2.normal2D(dir));

            let o = alg.Vec2.add(alg.Vec2.vec2(midx, midy), alg.Vec2.scale(n, offset.y));
            o = alg.Vec2.add(o, alg.Vec2.scale(alg.Vec2.normalizeIfNotZero(dir), offset.x));
            let t = text;
            if (t instanceof Function) {
                t = t(obj);
            }
            return alg.makeText({ text: t, ref: { x: o.x, y: o.y } });
        }), alg.DefFunc.from({ obj }, { offset }), props);
    }
}

const manipPointStyle = {
    r: 8, fillStyle: "rgb(128,128,128)",
};


function distance(containerId) {

    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);

    // get some fields for easier writing 
    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;

    // in this demo we will define three coordinate systems relative to each other in different ways.
    // one is defined by draggable points, one by sliders and another one spins around
    // a vector is then defined locally in one of these systems and can be decomposed with respect to all others

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: 0, y0: 0, x1: 4, y1: 4, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.8,
        },
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // z-values
    const pointZ = -1;

    const basePoint = scene.add(new DefPoint(2, 2), EMPTY_INFO, { style: manipPointStyle });
    const rad = scene.add(new DefNumber(1), EMPTY_INFO);

    addLabel(scene, basePoint, "c", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });

    const testPoint = scene.add(new DefPoint(3, 3), EMPTY_INFO, { style: manipPointStyle });

    addLabel(scene, testPoint, "p", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });

    const vec0 = scene.add(new DefVector(), DefVector.fromPoints(basePoint, testPoint), {});

    // display radius perpendicular to vector

    const n0 = scene.add(new DefNormalVector({ normalize: true }), DefNormalVector.fromVector({ v: vec0, ref: basePoint }), { invisible });
    const nr0 = scene.add(new alg.DefVectorOps(), alg.DefVectorOps.fromTransform(n0, {
        scale: rad
    }), { invisible });
    const lineR = scene.add(new DefLine(), DefLine.fromVector(nr0), {
        style: {
            strokeStyle: "rgb(0,0,0)",
            lineStyle: {
                lineWidth: 2,
            }
        }
    });

    const lineCenter = scene.add(new DefMidPoint(), DefMidPoint.fromObject(lineR), { invisible });
    const lineText = scene.add(new DefText({ text: "r" }), DefText.fromObjectRef({ ref: lineCenter }), {
        style: {
            fillStyle: "rgb(0,0,0)",
            strokeStyle: "rgb(255,255,255)",
            textStyle: {
                font: "30px sans-serif",
            },
            outline: {
                lineWidth: 3,
            },

        }
    });


    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        [basePoint, testPoint], 40);

    const inside = scene.add(new DefBoolean(), DefBoolean.fromPredicate((deps) => {
        const [basePoint, testPoint, rad] = deps;
        const r = rad.value;
        const a = jsm.VecF32.from([basePoint.x, basePoint.y]);
        const b = jsm.VecF32.from([testPoint.x, testPoint.y]);
        const ab = jsm.sub(b, a);
        const ab2 = jsm.dot(ab, ab);
        return ab2 < r * r;
    }, [basePoint, testPoint, rad]));

    const outside = scene.add(new DefBoolean(), DefBoolean.fromNot(inside));


    const baseCircle = scene.add(new DefArc(), DefArc.fromValues({
        r: rad, center: basePoint
    }), { invisible });

    const baseCircleIn = scene.add(new DefConditional(), DefConditional.fromCondition(baseCircle, inside), {
        z: 2,
        style: {
            fillStyle: "#DB073D77",
        }
    });
    const baseCircleOut = scene.add(new DefConditional(), DefConditional.fromCondition(baseCircle, outside), {
        z: 2,

        style: {
            fillStyle: "#07485B77",
        }
    });
    const calcContainer = makeContainer();

    let updateId = null;

    const updateCalcs = () => {
        const av = scene.get(basePoint).value;
        const bv = scene.get(testPoint).value;
        const r = scene.get(rad).value.value;

        const a = jsm.VecF32.from([av.x, av.y]);
        const b = jsm.VecF32.from([bv.x, bv.y]);

        const ab = jsm.sub(b, a);
        const ab2 = jsm.dot(ab, ab);

        calcContainer.innerHTML = "";
        const text = `
        Center point: $ \\mathbf{c} = ${toLtx(a)}$ $\\\\$
        Test point: $ \\mathbf{p} = ${toLtx(b)}$ $\\\\$
        Radius and squared radius: $ r = ${format.format(r)}, r^2 = ${format.format(r * r)}$ $\\\\$
        Difference vector $\\mathbf{d} = \\mathbf{p} - \\mathbf{c} $ $\\\\$
        Squared length of $\\mathbf{d}$$: $$|\\mathbf{d}|^2 = \\mathbf{d} \\cdot \\mathbf{d} $ $\\\\$
        Test length: $|\\mathbf{c}|^2  < r^2  \\Rightarrow ${format.format(ab2)} < ${format.format(r * r)} \\Rightarrow $ Point is ${ab2 < r * r ? "inside" : "outside"} $\\\\$
        `;
        calcContainer.textContent = text;

        renderMathInElement(calcContainer, {
            throwOnError: false,
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\begin{equation}", right: "\\end{equation}", display: true },
                { left: "\\begin{align}", right: "\\end{align}", display: true },
                { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
                { left: "\\begin{gather}", right: "\\end{gather}", display: true },
                { left: "\\begin{CD}", right: "\\end{CD}", display: true },
                { left: "\\[", right: "\\]", display: true }
            ],
        });

        updateId = null;

    };



    const radSlider = makeUpdateSlider(r => {
        scene.update(rad, new DefNumber(r));
    }, 0.0, Math.PI, scene.get(rad).value.value);


    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
        if (updateId === null) {
            updateId = setTimeout(() => updateCalcs(), 1000.0 / 30.0);

        }
    });

    const options = makeContainer(makeContainer(makeTextField("r:"), radSlider));
    container.appendChild(makeContainer(makeTextField("Options", "b"), options));
    container.appendChild(makeContainer(makeTextField("Calculations", "b"), calcContainer));

    updateCalcs();


}

function cone(containerId) {
    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);

    // get some fields for easier writing 
    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;

    // in this demo we will define three coordinate systems relative to each other in different ways.
    // one is defined by draggable points, one by sliders and another one spins around
    // a vector is then defined locally in one of these systems and can be decomposed with respect to all others

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: 0, y0: 0, x1: 4, y1: 4, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.8,
        },
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // z-values
    const pointZ = -1;

    const basePoint = scene.add(new DefPoint(2, 2), EMPTY_INFO, { style: manipPointStyle });
    addLabel(scene, basePoint, "c", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });

    const dirPoint = scene.add(new DefPoint(3, 3), EMPTY_INFO, { style: manipPointStyle });

    const angle = scene.add(new DefNumber(alg.deg2rad(45)));
    const angleNeg = scene.add(new DefNumber(), DefNumber.fromFunc(x => -x, angle));
    const dir = scene.add(new DefVector(), DefVector.fromPoints(basePoint, dirPoint));

    addLabel(scene, dir, "v", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        },
        offset: {
            x: 0,
            y: 0,
        }
    })

    // edge points
    const d0 = scene.add(new alg.DefVectorOps(), alg.DefVectorOps.fromTransform(dir, { alpha: angle }), { invisible });
    const d1 = scene.add(new alg.DefVectorOps(), alg.DefVectorOps.fromTransform(dir, { alpha: angleNeg }), { invisible });

    const p0 = scene.add(new DefPoint(), DefPoint.fromPointOrVector(d0), { invisible });
    const p1 = scene.add(new DefPoint(), DefPoint.fromPointOrVector(d1), { invisible });
    const testPoint = scene.add(new DefPoint(4, 3), EMPTY_INFO, { style: manipPointStyle });
    addLabel(scene, testPoint, "p", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });

    const vec0 = scene.add(new DefVector(), DefVector.fromPoints(basePoint, testPoint), {});

    addLabel(scene, vec0, "d", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        },
        offset: {
            x: 0,
            y: 0,
        }
    })

    const aDirD0 = scene.add(new alg.DefAngle(), alg.DefAngle.fromVectorsOrLines(dir, d0), {
        style: {
            r: 60,
            arc: {
                showDirection: false,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
            },
        }
    });
    const aDirT = scene.add(new alg.DefAngle(), alg.DefAngle.fromVectorsOrLines(dir, vec0, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 30,
            arc: {
                showDirection: false,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
            },
        }
    });

    // display radius perpendicular to vector

    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        [basePoint, dirPoint, testPoint], 40);

    const inside = scene.add(new DefBoolean(), DefBoolean.fromPredicate((deps) => {
        const [basePoint, dirPoint, testPoint, angle] = deps;
        const center = jsm.VecF32.from([basePoint.x, basePoint.y]);
        const endpoint = jsm.VecF32.from([dirPoint.x, dirPoint.y]);
        const test = jsm.VecF32.from([testPoint.x, testPoint.y]);
        const v = jsm.sub(endpoint, center);
        const r2 = jsm.norm2Squared(v);
        const w = jsm.sub(test, center);
        const s2 = jsm.dot(w, w);

        const dot = jsm.dot(v, w);
        const cangle = Math.cos(angle.value);
        const cDir = dot / jsm.norm(w) / jsm.norm(v);


        return s2 < r2 && cDir > cangle;
    }, [basePoint, dirPoint, testPoint, angle]));

    const outside = scene.add(new DefBoolean(), DefBoolean.fromNot(inside));


    const baseCircle = scene.add(new DefArc(), DefArc.fromCenterAndPoints(basePoint, p1, p0), { invisible });

    const baseCircleIn = scene.add(new DefConditional(), DefConditional.fromCondition(baseCircle, inside), {
        z: 2,
        style: {
            fillStyle: "#DB073D77",
            closeArc: true,
        }
    });
    const baseCircleOut = scene.add(new DefConditional(), DefConditional.fromCondition(baseCircle, outside), {
        z: 2,

        style: {
            fillStyle: "#07485B77",
            closeArc: true,

        }
    });
    const calcContainer = makeContainer();

    let updateId = null;

    const updateCalcs = () => {
        const bp = scene.get(basePoint).value;
        const dp = scene.get(dirPoint).value;
        const tp = scene.get(testPoint).value;

        const a = scene.get(angle).value.value;


        const center = jsm.VecF32.from([bp.x, bp.y]);
        const endpoint = jsm.VecF32.from([dp.x, dp.y]);
        const test = jsm.VecF32.from([tp.x, tp.y]);
        const v = jsm.sub(endpoint, center);
        const r2 = jsm.norm2Squared(v);
        const w = jsm.sub(test, center);
        const s2 = jsm.dot(w, w);

        const dot = jsm.dot(v, w);
        const cangle = Math.cos(a);
        const cDir = dot / jsm.norm(w) / jsm.norm(v);
        // const r = scene.get(rad).value.value;

        // const a = jsm.VecF32.from([av.x, av.y]);
        // const b = jsm.VecF32.from([bv.x, bv.y]);

        // const ab = jsm.sub(b, a);
        // const ab2 = jsm.dot(ab, ab);

        const fmt = x => format.format(x);
        calcContainer.innerHTML = "";
        const text = `
        Center point: $ \\mathbf{c} = ${toLtx(center)}$ $\\\\$
        Dir: $ \\mathbf{v} = ${toLtx(v)}$ $\\\\$
        Test point: $ \\mathbf{p} = ${toLtx(test)}$ $\\\\$
        Test dir: $\\mathbf{d} = \\mathbf{p} - \\mathbf{c} = ${toLtx(w)}$ $\\\\$
        Test length: $|\\mathbf{d}|^2  < |\\mathbf{v}|^2  \\Rightarrow ${fmt(s2)} < ${fmt(r2)} \\Rightarrow $ Point is ${s2 < r2 ? "maybe inside" : "outside"} $\\\\$
        Angle: $ \\alpha = ${fmt(alg.rad2deg(a))}^\\circ, \\cos(\\alpha) = ${fmt(Math.cos(a))} $ $\\\\$
        Cosine of angle $\\beta$ between $\\mathbf{v}$ and $\\mathbf{d}$: $\\cos(\\beta) = \\frac{\\mathbf{v} \\cdot \\mathbf{d}}{|\\mathbf{v}| |\\mathbf{d}|} = ${fmt(cDir)}$ $\\\\$
        $\\cos(\\beta) > \\cos(\\alpha) \\Rightarrow ${fmt(cDir)} > ${fmt(cangle)} \\Rightarrow$ Point is  ${cDir > cangle ? "maybe inside" : "outside"} $\\\\$
        Combining length and angle results: Point is ${s2 < r2 && cDir > cangle ? "inside" : "outside"} $\\\\$
        `;
        calcContainer.textContent = text;

        renderMathInElement(calcContainer, {
            throwOnError: false,
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\begin{equation}", right: "\\end{equation}", display: true },
                { left: "\\begin{align}", right: "\\end{align}", display: true },
                { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
                { left: "\\begin{gather}", right: "\\end{gather}", display: true },
                { left: "\\begin{CD}", right: "\\end{CD}", display: true },
                { left: "\\[", right: "\\]", display: true }
            ],
        });

        updateId = null;

    };


    const angleSlider = makeUpdateSlider(r => {
        scene.update(angle, new DefNumber(r));
    }, 0.0, Math.PI - 1E-5, scene.get(angle).value.value);


    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
        if (updateId === null) {
            updateId = setTimeout(() => updateCalcs(), 1000.0 / 30.0);
        }
    });

    const options = makeContainer(makeContainer(makeTextField("Angle:"), angleSlider));
    container.appendChild(makeContainer(makeTextField("Options", "b"), options));
    container.appendChild(makeContainer(makeTextField("Calculations", "b"), calcContainer));

    updateCalcs();
}

function side(containerId) {
    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);
    // get some fields for easier writing 
    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;

    // in this demo we will define three coordinate systems relative to each other in different ways.
    // one is defined by draggable points, one by sliders and another one spins around
    // a vector is then defined locally in one of these systems and can be decomposed with respect to all others

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: 0, y0: 0, x1: 4, y1: 4, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.8,
        },
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // z-values
    const pointZ = -1;

    const basePoint = scene.add(new DefPoint(1, 1), EMPTY_INFO, { style: manipPointStyle });
    const dirPoint = scene.add(new DefPoint(3, 3), EMPTY_INFO, { style: manipPointStyle });

    const dir = scene.add(new DefVector(), DefVector.fromPoints(basePoint, dirPoint), { invisible });

    const testPoint = scene.add(new DefPoint(4, 2), EMPTY_INFO, { style: manipPointStyle });

    const vec0 = scene.add(new DefVector(), DefVector.fromPoints(basePoint, testPoint), { invisible });

    const switchOr = scene.add(new DefBoolean(false));
    const switchOrNeg = scene.add(new DefBoolean(), DefBoolean.fromNot(switchOr));
    const v0 = scene.add(new DefConditional(), DefConditional.fromEitherOr(vec0, dir, switchOr));
    const v1 = scene.add(new DefConditional(), DefConditional.fromEitherOr(vec0, dir, switchOrNeg), { invisible });


    addLabel(scene, v0, "a", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });
    addLabel(scene, v1, "b", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });
    const perp = scene.add(new alg.DefPerpendicularLine(), alg.DefPerpendicularLine.fromVectorsOrLine({ v: v0 }));

    const aDirT = scene.add(new alg.DefAngle(), alg.DefAngle.fromVectorsOrLines(v0, v1, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 40,
            arc: {
                showDirection: false,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
            },
            text: {
                textStyle: {
                    font: "15px sans-serif",
                },
            }
        }
    });

    // display radius perpendicular to vector

    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        [basePoint, dirPoint, testPoint], 40);

    const inside = scene.add(new DefBoolean(), DefBoolean.fromPredicate((deps) => {
        const [v0, v1] = deps;
        return v0.x * v1.x + v0.y * v1.y > 0;
    }, [v0, v1]));

    const outside = scene.add(new DefBoolean(), DefBoolean.fromNot(inside));

    const v1In = scene.add(new DefConditional(), DefConditional.fromCondition(v1, inside), {
        style: {
            shaft: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgb(255,0,0)",
            },
            arrow: {
                fillStyle: "rgb(255,0,0)",
                strokeStyle: "rgb(255,0,0)",
            }
        }
    });
    const v1Out = scene.add(new DefConditional(), DefConditional.fromCondition(v1, outside), {
        style: {
            shaft: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgb(0,0,255)",
            },
            arrow: {
                fillStyle: "rgb(0,0,255)",
                strokeStyle: "rgb(0,0,255)",
            }
        }
    });
    const calcContainer = makeContainer();

    let updateId = null;

    const updateCalcs = () => {
        const a = scene.get(v0).value;
        const b = scene.get(v1).value;
        const av = jsm.VecF32.from([a.x, a.y]);
        const bv = jsm.VecF32.from([b.x, b.y]);

        const dot = jsm.dot(av, bv);

        // const a = scene.get(angle).value.value;


        // const center = jsm.VecF32.from([bp.x, bp.y]);
        // const endpoint = jsm.VecF32.from([dp.x, dp.y]);
        // const test = jsm.VecF32.from([tp.x, tp.y]);
        // const v = jsm.sub(endpoint, center);
        // const r2 = jsm.norm2Squared(v);
        // const w = jsm.sub(test, center);
        // const s2 = jsm.dot(w, w);

        // const dot = jsm.dot(v, w);
        // const cangle = Math.cos(a);
        // const cDir = dot / jsm.norm(w) / jsm.norm(v);
        // // const r = scene.get(rad).value.value;

        // // const a = jsm.VecF32.from([av.x, av.y]);
        // // const b = jsm.VecF32.from([bv.x, bv.y]);

        // // const ab = jsm.sub(b, a);
        // // const ab2 = jsm.dot(ab, ab);

        const fmt = x => format.format(x);
        calcContainer.innerHTML = "";
        const text = `
        First vector: $ \\mathbf{a} = ${toLtx(av)}$ $\\\\$
        Second vector: $ \\mathbf{b} = ${toLtx(bv)}$ $\\\\$
        Dot product: $ \\mathbf{a} \\cdot \\mathbf{b} = ${fmt(dot)} $  $\\\\$
        Interpret result: Dot product is $${dot < 0 ? "\\color{blue}\\text{negative}" : "\\color{red}\\text{positive}"}$ $\\Rightarrow$ $\\mathbf{b}$ points into the $${dot < 0 ? "\\color{blue}\\text{opposite}" : "\\color{red}\\text{same}"}$  halfspace as $\\mathbf{a}$ $\\\\$
        `;
        calcContainer.textContent = text;

        renderMathInElement(calcContainer, {
            throwOnError: false,
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\begin{equation}", right: "\\end{equation}", display: true },
                { left: "\\begin{align}", right: "\\end{align}", display: true },
                { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
                { left: "\\begin{gather}", right: "\\end{gather}", display: true },
                { left: "\\begin{CD}", right: "\\end{CD}", display: true },
                { left: "\\[", right: "\\]", display: true }
            ],
        });

        updateId = null;

    };




    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
        if (updateId === null) {
            updateId = setTimeout(() => updateCalcs(), 1000.0 / 30.0);
        }
    });

    const check = makeCheckboxNoLabel(scene.get(switchOr).value.value);
    check.oninput = () => {
        scene.set(switchOr, new DefBoolean(check.checked));
    };
    const options = makeContainer(makeTextField("Switch order:"), check);
    container.appendChild(makeContainer(makeTextField("Options", "b"), options));
    container.appendChild(makeContainer(makeTextField("Calculations", "b"), calcContainer));



    updateCalcs();

}

function project(containerId) {
    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);
    // get some fields for easier writing 
    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;

    // in this demo we will define three coordinate systems relative to each other in different ways.
    // one is defined by draggable points, one by sliders and another one spins around
    // a vector is then defined locally in one of these systems and can be decomposed with respect to all others

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: 0, y0: 0, x1: 5, y1: 5, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.8,
        },
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // z-values
    const pointZ = -1;

    const basePoint = scene.add(new DefPoint(1, 1), EMPTY_INFO, { style: manipPointStyle });
    const dirPoint = scene.add(new DefPoint(4, 2), EMPTY_INFO, { style: manipPointStyle });

    const dir = scene.add(new DefVector(), DefVector.fromPoints(basePoint, dirPoint), {});

    const line = scene.add(new DefLine({ leftOpen: true, rightOpen: true }), DefLine.fromVector(dir), {
        z: 2,
        style: {
            strokeStyle: "rgb(0,0,0,0.5)",
            lineStyle: {
                lineWidth: 1.0,
                lineDash: [2, 5],
            },
        }
    });

    const testPoint = scene.add(new DefPoint(3, 4), EMPTY_INFO, { style: manipPointStyle });

    const vec0 = scene.add(new DefVector(), DefVector.fromPoints(basePoint, testPoint), {});

    addLabel(scene, dir, "b", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });
    addLabel(scene, vec0, "a", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });
    const perp = scene.add(new alg.DefPerpendicularLine(), alg.DefPerpendicularLine.fromVectorsOrLine({ v: dir, ref: testPoint }), { invisible });

    const inter = scene.add(new alg.DefIntersection(), alg.DefIntersection.fromObjects(line, perp, { takeIndex: 0 }), { invisible });

    const makeOffsetPoint = (v, p, dist, props = {}) => scene.add(new DefFunc((deps, params) => {
        const { v, p } = deps;
        const { dist } = params;

        const n = Vec2.normalizeIfNotZero(Vec2.normal2D(v));
        const pn = Vec2.add(p, Vec2.scale(n, dist));
        return makePoint(pn);

    }), DefFunc.from({ v, p }, { dist }), props);

    const p0 = makeOffsetPoint(dir, basePoint, -0.4, { invisible });
    const p1 = makeOffsetPoint(dir, inter, -0.4, { invisible });

    const lineB0 = scene.add(new DefLine(), DefLine.fromPoints(basePoint, p0), {
        strokeStyle: "rgb(0,0,0)",
        lineStyle: {
            lineWidth: 1.0,
            lineDash: [2, 2],
        },
    });
    const lineTI = scene.add(new DefLine(), DefLine.fromPoints(testPoint, inter), {
        strokeStyle: "rgb(0,0,0)",
        lineStyle: {
            lineWidth: 1.0,
            lineDash: [2, 2],
        },
    });
    const lineI1 = scene.add(new DefLine(), DefLine.fromPoints(inter, p1), {
        strokeStyle: "rgb(0,0,0)",
        lineStyle: {
            lineWidth: 1.0,
            lineDash: [2, 2],
        },
    });
    // vis distance
    const distStyle = {
        shaft: {
            fillStyle: "rgb(255,0,0)",
            strokeStyle: "rgb(255,0,0)",
            lineStyle: {
                lineWidth: 1.0,
                lineDash: [2, 2],
            },
        },
        arrow: {
            length: 0.1,
            width: 0.01,
            sizeRelative: true,
            fillStyle: "rgb(255,0,0)",
            strokeStyle: "rgb(255,0,0)",
        }
    };

    const v01 = scene.add(new DefVector(), DefVector.fromPoints(p0, p1), { style: distStyle });
    const v10 = scene.add(new DefVector(), DefVector.fromPoints(p1, p0), { style: distStyle });




    addLabel(scene, v01, x => `${format.format(Vec2.len(x))}`, {
        props: {
            z: -1,
            style: {
                fillStyle: "rgb(255,0,0)",
                strokeStyle: "rgba(255,255,255,255)",
                textStyle: {
                    font: "20px sans-serif",
                    textAlign: "center",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 8.0,
                },
            }
        }, offset: { x: 0, y: 0 }
    });

    const aDirT = scene.add(new alg.DefAngle(), alg.DefAngle.fromVectorsOrLines(dir, vec0, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 40,
            arc: {
                showDirection: false,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
            },
            text: {
                textStyle: {
                    font: "15px sans-serif",
                },
            }
        }
    });

    // display radius perpendicular to vector

    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        [basePoint, dirPoint, testPoint], 40);



    const calcContainer = makeContainer();

    let updateId = null;

    const updateCalcs = () => {
        const a = scene.get(vec0).value;
        const b = scene.get(dir).value;
        const av = jsm.VecF32.from([a.x, a.y]);
        const bv = jsm.VecF32.from([b.x, b.y]);

        const dot = jsm.dot(av, bv);
        const proj = dot / jsm.norm2(bv);

        // // const a = scene.get(angle).value.value;


        // // const center = jsm.VecF32.from([bp.x, bp.y]);
        // // const endpoint = jsm.VecF32.from([dp.x, dp.y]);
        // // const test = jsm.VecF32.from([tp.x, tp.y]);
        // // const v = jsm.sub(endpoint, center);
        // // const r2 = jsm.norm2Squared(v);
        // // const w = jsm.sub(test, center);
        // // const s2 = jsm.dot(w, w);

        // // const dot = jsm.dot(v, w);
        // // const cangle = Math.cos(a);
        // // const cDir = dot / jsm.norm(w) / jsm.norm(v);
        // // // const r = scene.get(rad).value.value;

        // // // const a = jsm.VecF32.from([av.x, av.y]);
        // // // const b = jsm.VecF32.from([bv.x, bv.y]);

        // // // const ab = jsm.sub(b, a);
        // // // const ab2 = jsm.dot(ab, ab);

        const fmt = x => format.format(x);
        calcContainer.innerHTML = "";
        const text = `
        Vector to be projected: $ \\mathbf{a} = ${toLtx(av)}$ $\\\\$
        Vector to project onto: $ \\mathbf{b} = ${toLtx(bv)}$ $\\\\$
        Dot product: $ \\mathbf{a} \\cdot \\mathbf{b} = ${fmt(dot)} $  $\\\\$
        Length of $ \\mathbf{b}$: $ |\\mathbf{b}| = ${fmt(jsm.norm2(bv))}$ $\\\\$
        Projection $\\color{red} a_{\\mathbf{b}}$ of $\\mathbf{a}$ onto $\\mathbf{b}$: $\\color{red}a_{\\mathbf{b}} =\\frac{\\mathbf{a} \\cdot \\mathbf{b}}{|\\mathbf{b}|} = ${fmt(proj)} $ $\\\\$
        `;
        calcContainer.textContent = text;

        renderMathInElement(calcContainer, {
            throwOnError: false,
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\begin{equation}", right: "\\end{equation}", display: true },
                { left: "\\begin{align}", right: "\\end{align}", display: true },
                { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
                { left: "\\begin{gather}", right: "\\end{gather}", display: true },
                { left: "\\begin{CD}", right: "\\end{CD}", display: true },
                { left: "\\[", right: "\\]", display: true }
            ],
        });

        updateId = null;

    };




    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
        if (updateId === null) {
            updateId = setTimeout(() => updateCalcs(), 1000.0 / 30.0);
        }
    });

    // const options = makeContainer();
    // container.appendChild(makeContainer(makeTextField("Options", "b"), options));
    container.appendChild(makeContainer(makeTextField("Calculations", "b"), calcContainer));



    updateCalcs();
}

function projectUnitLength(containerId) {
    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);

    // get some fields for easier writing 
    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;

    // in this demo we will define three coordinate systems relative to each other in different ways.
    // one is defined by draggable points, one by sliders and another one spins around
    // a vector is then defined locally in one of these systems and can be decomposed with respect to all others

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: 0, y0: 0, x1: 4, y1: 4, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.8,
        },
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // z-values
    const pointZ = -1;

    const basePoint = scene.add(new DefPoint(1, 1), EMPTY_INFO, { style: manipPointStyle });
    const dirPoint = scene.add(new DefPoint(5, 1), EMPTY_INFO, { style: manipPointStyle });

    const dir = scene.add(new DefVector({ normalize: true }), DefVector.fromPoints(basePoint, dirPoint), {});

    const line = scene.add(new DefLine({ leftOpen: true, rightOpen: true }), DefLine.fromVector(dir), {
        z: 2,
        style: {
            strokeStyle: "rgb(0,0,0,0.5)",
            lineStyle: {
                lineWidth: 2.0,
                lineDash: [2, 5],
            },
        }
    });

    const testPoint = scene.add(new DefPoint(4, 3), EMPTY_INFO, { style: manipPointStyle });

    const vec0 = scene.add(new DefVector(), DefVector.fromPoints(basePoint, testPoint), {});

    addLabel(scene, vec0, "a", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });
    addLabel(scene, dir, "b", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });

    const projPoint = scene.add(new DefFunc(deps => {
        const { dir, vec0 } = deps;

        const p = Vec2.add(dir.ref, Vec2.scale(dir, Vec2.dot(dir, vec0)));
        return makePoint(p);
    }), DefFunc.from({ dir, vec0 }), { invisible });


    const cosline = scene.add(new DefLine(), DefLine.fromPoints(basePoint, projPoint), {
        z: 2,
        style: {

            strokeStyle: "rgb(255,0,0)",
            lineStyle: {
                lineWidth: 2.0,
            },
        }
    });
    addLabel(scene, cosline, "|a| cos(\u0251)", {
        props: {
            z: -1,
            style: {
                fillStyle: "rgb(255,0,0)",
                strokeStyle: "rgba(255,255,255,255)",
                textStyle: {
                    font: "20px sans-serif",
                    textAlign: "center",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 8.0,
                },
            }
        },
    });

    const perpLine = scene.add(new DefLine(), DefLine.fromPoints(projPoint, testPoint));

    const ang = scene.add(new alg.DefAngle(), alg.DefAngle.fromPoints(basePoint, projPoint, testPoint, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 40,
            arc: {
                showDirection: false,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
            },
            text: {
                textStyle: {
                    font: "15px sans-serif",
                },
            }
        }
    });

    const makeOffsetPoint = (v, p, dist, props = {}) => scene.add(new DefFunc((deps, params) => {
        const { v, p } = deps;
        const { dist } = params;

        const n = Vec2.normalizeIfNotZero(Vec2.normal2D(v));
        const pn = Vec2.add(p, Vec2.scale(n, dist));
        return makePoint(pn);

    }), DefFunc.from({ v, p }, { dist }), props);



    const aDirT = scene.add(new alg.DefAngle(), alg.DefAngle.fromVectorsOrLines(dir, vec0, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 40,
            arc: {
                showDirection: false,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
            },
            text: {
                textStyle: {
                    font: "15px sans-serif",
                },
            }
        }
    });

    // display radius perpendicular to vector

    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        [basePoint, dirPoint, testPoint], 40);



    const calcContainer = makeContainer();

    let updateId = null;

    const updateCalcs = () => {
        const a = scene.get(vec0).value;
        const b = scene.get(dir).value;
        const av = jsm.VecF32.from([a.x, a.y]);
        const bv = jsm.VecF32.from([b.x, b.y]);

        const dot = jsm.dot(av, bv);
        const proj = dot / jsm.norm2(bv);

        // // const a = scene.get(angle).value.value;


        // // const center = jsm.VecF32.from([bp.x, bp.y]);
        // // const endpoint = jsm.VecF32.from([dp.x, dp.y]);
        // // const test = jsm.VecF32.from([tp.x, tp.y]);
        // // const v = jsm.sub(endpoint, center);
        // // const r2 = jsm.norm2Squared(v);
        // // const w = jsm.sub(test, center);
        // // const s2 = jsm.dot(w, w);

        // // const dot = jsm.dot(v, w);
        // // const cangle = Math.cos(a);
        // // const cDir = dot / jsm.norm(w) / jsm.norm(v);
        // // // const r = scene.get(rad).value.value;

        // // // const a = jsm.VecF32.from([av.x, av.y]);
        // // // const b = jsm.VecF32.from([bv.x, bv.y]);

        // // // const ab = jsm.sub(b, a);
        // // // const ab2 = jsm.dot(ab, ab);

        const fmt = x => format.format(x);
        calcContainer.innerHTML = "";
        const text = `
        Vector to be projected: $ \\mathbf{a} = ${toLtx(av)}$ $\\\\$
        Vector to project onto: $ \\mathbf{b} = ${toLtx(bv)}$ $\\\\$
        Dot product: $ \\mathbf{a} \\cdot \\mathbf{b} = ${fmt(dot)} $  $\\\\$
        Length of $ \\mathbf{b}$: $ |\\mathbf{b}| = ${fmt(jsm.norm2(bv))}$ $\\\\$
        Projection $\\color{red} a_{\\mathbf{b}}$ of $\\mathbf{a}$ onto $\\mathbf{b}$: $\\color{red} a_{\\mathbf{b}} =\\frac{\\mathbf{a} \\cdot \\mathbf{b}}{|\\mathbf{b}|} = \\mathbf{a} \\cdot \\mathbf{b} = ${fmt(proj)} $ $\\\\$
        `;
        calcContainer.textContent = text;

        renderMathInElement(calcContainer, {
            throwOnError: false,
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\begin{equation}", right: "\\end{equation}", display: true },
                { left: "\\begin{align}", right: "\\end{align}", display: true },
                { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
                { left: "\\begin{gather}", right: "\\end{gather}", display: true },
                { left: "\\begin{CD}", right: "\\end{CD}", display: true },
                { left: "\\[", right: "\\]", display: true }
            ],
        });

        updateId = null;

    };




    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
        if (updateId === null) {
            updateId = setTimeout(() => updateCalcs(), 1000.0 / 30.0);
        }
    });

    // const options = makeContainer();
    // container.appendChild(makeContainer(makeTextField("Options", "b"), options));
    container.appendChild(makeContainer(makeTextField("Calculations", "b"), calcContainer));



    updateCalcs();
    
}

function angleSubWindow(container) {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    container.appendChild(canvas);

    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: -0.5, y0: -1.5, x1: Math.PI + 0.5, y1: 2.5, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.45,
        },
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    const n = 40;
    const cosPoints = scene.add(new alg.DefFunc(deps => {
        const points = [];
        for (let i = 0; i < n; i++) {
            const ox = (i / (n - 1)) * Math.PI;
            const x = (i / (n - 1)) * Math.PI;
            const c = Math.cos(x);
            points.push(makePoint({ x: ox, y: c }));
        }
        return points;
    }), alg.DefFunc.from({}), { invisible: true });
    const spline = scene.add(new alg.DefBezierSpline(), alg.DefBezierSpline.fromCatmullRom(cosPoints), {
        style: {
            lineStyle: {
                lineWidth: 2,
            },
        }
    });

    const angle = scene.add(new DefNumber(0));

    const angleLine = scene.add(new DefFunc(deps => {
        const { angle } = deps;
        const a = angle.value;

        const p0 = Vec2.vec2(a, 0);
        const p1 = Vec2.vec2(a, Math.cos(a));

        return makeLine({ p0, p1 });
    }), DefFunc.from({ angle }), {
        style: {
            strokeStyle: "rgb(255,0,0)",
            lineStyle: {
                lineWidth: 2.0,
            },
        }
    });

    const angleText = scene.add(new DefText({
        text: x => {
            return `cos(${format.format(alg.rad2deg(x.value))}°) = ${format.format(Math.cos(x.value))}`;
        }, ref: { x: 0.5, y: 1.5 }
    }), DefText.fromObjectRef({ obj: angle }), {
        style: {
            fillStyle: "rgb(255,0,0)",
            strokeStyle: "rgba(255,0,0,0)",
            textStyle: {
                font: "20px sans-serif",
            },
        }
    });

    const subangles = [0, 45, 90, 135, 180];
    for (let a of subangles) {
        const ai = a;
        const an = alg.deg2rad(a);
        const line = scene.add(new DefFunc(deps => {
            const p0 = Vec2.vec2(an, 0);
            const p1 = Vec2.vec2(an, Math.cos(an));
            return makeLine({ p0, p1 });
        }), DefFunc.from({}), {
            z: 2,
            style: {
                strokeStyle: "rgba(0,0,0,0.5)",
                lineStyle: {
                    lineWidth: 2.0,
                    lineDash: [2, 2],
                },
            }
        });
        const text = scene.add(new DefFunc(deps => {
            const y = Math.cos(an);
            const sig = y < 0 ? -1 : 1;
            const offset = sig * 0.25;

            return alg.makeText({
                text: `${format.format(a)}°`, ref: {
                    x: an, y: y + offset
                }
            })
        }), DefFunc.from({}), {
            z: 2,
            style: {
                strokeStyle: "rgba(0,0,0,0)",
                fillStyle: "rgb(0,0,0)",
                textStyle: {
                    font: "15px sans-serif",
                    textAlign: "center",
                },
            }
        });

    }

    const changeAngle = (a) => {
        scene.update(angle, new DefNumber(a));
    };

    
    return {
        changeAngle
    };
}

function angle(containerId) {
    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);

    // get some fields for easier writing 
    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;

    // in this demo we will define three coordinate systems relative to each other in different ways.
    // one is defined by draggable points, one by sliders and another one spins around
    // a vector is then defined locally in one of these systems and can be decomposed with respect to all others

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: 0, y0: 0, x1: 4, y1: 4, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.45,
        },
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // z-values
    const pointZ = -1;

    const basePoint = scene.add(new DefPoint(1, 1), EMPTY_INFO, { style: manipPointStyle });
    const dirPoint = scene.add(new DefPoint(3, 2), EMPTY_INFO, { style: manipPointStyle });

    const dir = scene.add(new DefVector(), DefVector.fromPoints(basePoint, dirPoint), {});
    const testPoint = scene.add(new DefPoint(1.5, 3), EMPTY_INFO, { style: manipPointStyle });

    const vec0 = scene.add(new DefVector(), DefVector.fromPoints(basePoint, testPoint), {});

    addLabel(scene, dir, "a", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });
    addLabel(scene, vec0, "b", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });


    // addLabel(scene, v01, x => `pᵥ=${format.format(Vec2.len(x))}`, {
    //     props: {
    //         z: -1,
    //         style: {
    //             fillStyle: "rgb(0,0,0)",
    //             strokeStyle: "rgba(255,255,255,255)",
    //             textStyle: {
    //                 font: "20px sans-serif",
    //                 textAlign: "center",
    //                 textBaseline: "alphabetic",
    //                 direction: "inherit",
    //                 fontKerning: "auto",
    //             },
    //             outline: {
    //                 lineWidth: 8.0,
    //             },
    //         }
    //     }, offset: { x: 0, y: 0 }
    // });

    const aDirT = scene.add(new alg.DefAngle(), alg.DefAngle.fromVectorsOrLines(dir, vec0, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 40,
            arc: {
                showDirection: false,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
            },
            text: {
                textStyle: {
                    font: "15px sans-serif",
                },
            }
        }
    });

    // display radius perpendicular to vector

    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        [basePoint, dirPoint, testPoint], 40);



    const calcContainer = makeContainer();

    let updateId = null;

    const updateCalcs = () => {
        const a = scene.get(dir).value;
        const b = scene.get(vec0).value;
        const av = jsm.VecF32.from([a.x, a.y]);
        const bv = jsm.VecF32.from([b.x, b.y]);

        const dot = jsm.dot(av, bv);
        const proj = dot / jsm.norm2(av) / jsm.norm2(bv);

        // // const a = scene.get(angle).value.value;

        const fmt = x => format.format(x);
        calcContainer.textContent = "";
        const text = `
        First vector: $ \\mathbf{a} = ${toLtx(av)}$ $\\\\$
        Second vector: $ \\mathbf{b} = ${toLtx(bv)}$ $\\\\$
        Dot product: $ \\mathbf{a} \\cdot \\mathbf{b} = ${fmt(dot)} $  $\\\\$
        Length of $ \\mathbf{a}$: $ | \\mathbf{a}| = ${fmt(jsm.norm2(av))}$ $\\\\$
        Length of $ \\mathbf{b}$: $ | \\mathbf{b}| = ${fmt(jsm.norm2(bv))}$ $\\\\$
        Cosine of angle $\\alpha$: $\\cos(\\alpha) = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{| \\mathbf{a}| |\\mathbf{b}|} = ${fmt(proj)}$ $\\\\$
        Angle: $\\alpha = \\operatorname{acos}(\\cos(\\alpha)) = ${fmt(Math.acos(proj))} =  ${fmt(alg.rad2deg(Math.acos(proj)))}°$
        `;
        calcContainer.textContent = text;

        renderMathInElement(calcContainer, {
            throwOnError: false,
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\begin{equation}", right: "\\end{equation}", display: true },
                { left: "\\begin{align}", right: "\\end{align}", display: true },
                { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
                { left: "\\begin{gather}", right: "\\end{gather}", display: true },
                { left: "\\begin{CD}", right: "\\end{CD}", display: true },
                { left: "\\[", right: "\\]", display: true }
            ],
        });

        updateId = null;

    };




    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
        if (updateId === null) {
            updateId = setTimeout(() => updateCalcs(), 1000.0 / 30.0);
        }
    });

    const callbacks = angleSubWindow(canvas.parentElement);

    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
        if (e.index === aDirT) {
            callbacks.changeAngle(scene.get(e.index).value.value);
        }
    });
    callbacks.changeAngle(scene.get(aDirT).value.value);



    // const options = makeContainer();
    // container.appendChild(makeContainer(makeTextField("Options", "b"), options));
    container.appendChild(makeContainer(makeTextField("Calculations", "b"), calcContainer));




    updateCalcs();
    
}

function angleBasic(containerId) {

    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);
    // get some fields for easier writing 
    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;

    // in this demo we will define three coordinate systems relative to each other in different ways.
    // one is defined by draggable points, one by sliders and another one spins around
    // a vector is then defined locally in one of these systems and can be decomposed with respect to all others

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: 0, y0: 0, x1: 4, y1: 4, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.85,
        },
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // z-values
    const pointZ = -1;

    const basePoint = scene.add(new DefPoint(1, 1), EMPTY_INFO, { style: manipPointStyle });
    const dirPoint = scene.add(new DefPoint(3, 2), EMPTY_INFO, { style: manipPointStyle });

    const dir = scene.add(new DefVector(), DefVector.fromPoints(basePoint, dirPoint), {});
    const testPoint = scene.add(new DefPoint(1.5, 3), EMPTY_INFO, { style: manipPointStyle });

    const vec0 = scene.add(new DefVector(), DefVector.fromPoints(basePoint, testPoint), {});

    addLabel(scene, dir, "a", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });
    addLabel(scene, vec0, "b", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });


    // addLabel(scene, v01, x => `pᵥ=${format.format(Vec2.len(x))}`, {
    //     props: {
    //         z: -1,
    //         style: {
    //             fillStyle: "rgb(0,0,0)",
    //             strokeStyle: "rgba(255,255,255,255)",
    //             textStyle: {
    //                 font: "20px sans-serif",
    //                 textAlign: "center",
    //                 textBaseline: "alphabetic",
    //                 direction: "inherit",
    //                 fontKerning: "auto",
    //             },
    //             outline: {
    //                 lineWidth: 8.0,
    //             },
    //         }
    //     }, offset: { x: 0, y: 0 }
    // });

    const aDirT = scene.add(new alg.DefAngle(), alg.DefAngle.fromVectorsOrLines(dir, vec0, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 40,
            arc: {
                showDirection: false,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
            },
            text: {
                textStyle: {
                    font: "15px sans-serif",
                },
            }
        }
    });

    // display radius perpendicular to vector

    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        [basePoint, dirPoint, testPoint], 40);
        
}


function decompose(containerId) {
    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);

    // get some fields for easier writing 
    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;

    // in this demo we will define three coordinate systems relative to each other in different ways.
    // one is defined by draggable points, one by sliders and another one spins around
    // a vector is then defined locally in one of these systems and can be decomposed with respect to all others

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: 0, y0: 0, x1: 4, y1: 4, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.8,
        },
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // z-values
    const pointZ = -1;

    const basePoint = scene.add(new DefPoint(1, 1), EMPTY_INFO, { style: manipPointStyle });
    const dirPoint = scene.add(new DefPoint(2, 3), EMPTY_INFO, { style: manipPointStyle });

    const u = scene.add(new DefVector(), DefVector.fromPoints(basePoint, dirPoint), {});

    const testPoint = scene.add(new DefPoint(4, 2), EMPTY_INFO, { style: manipPointStyle });

    const v = scene.add(new DefVector(), DefVector.fromPoints(basePoint, testPoint), {});



    const switchOrder = scene.add(new DefBoolean(false));
    const notSwitchOrder = scene.add(new DefBoolean(), DefBoolean.fromNot(switchOrder));

    const a = scene.add(new DefConditional(), DefConditional.fromEitherOr(v, u, switchOrder));
    const b = scene.add(new DefConditional(), DefConditional.fromEitherOr(v, u, notSwitchOrder));

    addLabel(scene, a, "a", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });
    addLabel(scene, b, "b", {
        props: {
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "bold 20px sans-serif",
                    textAlign: "start",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    });


    const ab = scene.add(new DefFunc(deps => {
        const { a, b } = deps;
        const dot = Vec2.dot(a, b);
        const projA = dot / Vec2.len2(b);

        const v = Vec2.scale(b, projA);
        return alg.makeVector({ ...v, ref: a.ref });
    }), DefFunc.from({ a, b }), {
        z: 2,
        style: {
            shaft: {
                fillStyle: "rgb(0,0,255)",
                strokeStyle: "rgb(0,0,255)",
                lineStyle: {
                    lineWidth: 2.0,
                },
            },
            arrow: {
                fillStyle: "rgb(0,0,255)",
                strokeStyle: "rgb(0,0,255)",
            }
        }
    });

    const abTip = scene.add(new DefPoint(), DefPoint.fromPointOrVector(ab), { invisible });
    const abnorm = scene.add(new DefFunc(deps => {
        const { ab, a, abTip } = deps;
        const n = Vec2.sub(a, ab);
        return alg.makeVector({ ...n, ref: abTip });
    }), DefFunc.from({ ab, a, abTip }), {
        z: 2,
        style: {
            shaft: {
                fillStyle: "rgb(255,0,0)",
                strokeStyle: "rgb(255,0,0)",
                lineStyle: {
                    lineWidth: 2.0,
                },
            },
            arrow: {
                fillStyle: "rgb(255,0,0)",
                strokeStyle: "rgb(255,0,0)",
            }
        }
    });

    const rightAngle = scene.add(new alg.DefAngle(), alg.DefAngle.fromVectorsOrLines(ab, abnorm, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 20,
            arc: {
                showDirection: false,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
            },
            text: {
                textStyle: {
                    font: "15px sans-serif",
                },
            }
        }
    });
    // addLabel(scene, v01, x => `pᵥ=${format.format(Vec2.len(x))}`, {
    //     props: {
    //         z: -1,
    //         style: {
    //             fillStyle: "rgb(0,0,0)",
    //             strokeStyle: "rgba(255,255,255,255)",
    //             textStyle: {
    //                 font: "20px sans-serif",
    //                 textAlign: "center",
    //                 textBaseline: "alphabetic",
    //                 direction: "inherit",
    //                 fontKerning: "auto",
    //             },
    //             outline: {
    //                 lineWidth: 8.0,
    //             },
    //         }
    //     }, offset: { x: 0, y: 0 }
    // });

    const aDirT = scene.add(new alg.DefAngle(), alg.DefAngle.fromVectorsOrLines(u, v, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 40,
            arc: {
                showDirection: false,
                fillStyle: "rgba(255,0,0,0.25)",
                strokeStyle: "rgb(0,0,0)",
            },
            text: {
                textStyle: {
                    font: "15px sans-serif",
                },
            }
        }
    });

    // display radius perpendicular to vector

    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        [basePoint, dirPoint, testPoint], 40);



    const calcContainer = makeContainer();

    let updateId = null;

    const updateCalcs = () => {
        const u = scene.get(a).value;
        const v = scene.get(b).value;
        const av = jsm.VecF32.from([u.x, u.y]);
        const bv = jsm.VecF32.from([v.x, v.y]);

        const dot = jsm.dot(av, bv);
        const proj = dot / jsm.norm2(bv);

        const ab = jsm.scale(bv, proj / jsm.norm2(bv));
        const abp = jsm.sub(av, ab);
        // // const a = scene.get(angle).value.value;


        // // const center = jsm.VecF32.from([bp.x, bp.y]);
        // // const endpoint = jsm.VecF32.from([dp.x, dp.y]);
        // // const test = jsm.VecF32.from([tp.x, tp.y]);
        // // const v = jsm.sub(endpoint, center);
        // // const r2 = jsm.norm2Squared(v);
        // // const w = jsm.sub(test, center);
        // // const s2 = jsm.dot(w, w);

        // // const dot = jsm.dot(v, w);
        // // const cangle = Math.cos(a);
        // // const cDir = dot / jsm.norm(w) / jsm.norm(v);
        // // // const r = scene.get(rad).value.value;

        // // // const a = jsm.VecF32.from([av.x, av.y]);
        // // // const b = jsm.VecF32.from([bv.x, bv.y]);

        // // // const ab = jsm.sub(b, a);
        // // // const ab2 = jsm.dot(ab, ab);

        const fmt = x => format.format(x);
        calcContainer.innerHTML = "";
        const text = `
        Vector to be projected: $ \\mathbf{a} = ${toLtx(av)}$ $\\\\$
        Vector to be project onto: $ \\mathbf{b} = ${toLtx(bv)}$ $\\\\$
        Dot product: $ \\mathbf{a} \\cdot \\mathbf{b} = ${fmt(dot)} $  $\\\\$
        Length of $ \\mathbf{a}$: $ |\\mathbf{a}| = ${fmt(jsm.norm2(av))}$ $\\\\$
        Length of $ \\mathbf{b}$: $ |\\mathbf{b}| = ${fmt(jsm.norm2(bv))}$ $\\\\$
        Projection $a_b$ of $\\mathbf{a}$ onto $\\mathbf{b}$: $a_b =\\frac{\\mathbf{a} \\cdot \\mathbf{b}}{|\\mathbf{b}|} = ${fmt(proj)} $ $\\\\$
        Vector $\\color{blue}\\mathbb{a}_b$ with length $a_b$ pointing in $\\mathbb{b}$: $\\color{blue}\\mathbb{a}_b = \\frac{\\mathbf{b}}{|\\mathbf{b}|} a_b = \\mathbf{b}\\frac{\\mathbf{a} \\cdot \\mathbf{b}}{|\\mathbf{b}|^2} = ${toLtx(ab)}$  $\\\\$
        Perpendicular vector $\\color{red}\\mathbb{a}_b^{\\perp}$: $\\color{red}\\mathbb{a}_b^{\\perp} = \\mathbf{a} - \\mathbb{a}_b = ${toLtx(abp)}$  $\\\\$
        `;
        calcContainer.textContent = text;

        renderMathInElement(calcContainer, {
            throwOnError: false,
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\begin{equation}", right: "\\end{equation}", display: true },
                { left: "\\begin{align}", right: "\\end{align}", display: true },
                { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
                { left: "\\begin{gather}", right: "\\end{gather}", display: true },
                { left: "\\begin{CD}", right: "\\end{CD}", display: true },
                { left: "\\[", right: "\\]", display: true }
            ],
        });

        updateId = null;

    };




    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
        if (updateId === null) {
            updateId = setTimeout(() => updateCalcs(), 1000.0 / 30.0);
        }
    });

    const checkOrder = makeCheckboxNoLabel(scene.get(switchOrder).value.value);
    checkOrder.oninput = () => {
        scene.update(switchOrder, new DefBoolean(checkOrder.checked));
    };
    const options = makeContainer(makeTextField("Switch order:"), checkOrder);
    container.appendChild(makeContainer(makeTextField("Options", "b"), options));
    container.appendChild(makeContainer(makeTextField("Calculations", "b"), calcContainer));



    updateCalcs();
    
}

function demoDot(containerId) {

    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);

    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;
    const scene = new alg.GeometryScene();

    const diagram = new alg.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });

    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });
    const invisible = true;

    const manipZ = 0;
    const vecZ = 1;
    const lineZ = 2;
    const textZ = 0;

    const p0 = scene.add(new alg.DefPoint(0, 0), EMPTY_INFO, { z: manipZ, style: manipPointStyle });
    const p1 = scene.add(new alg.DefPoint(2.5, 0), EMPTY_INFO, { z: manipZ, style: manipPointStyle });
    const p2 = scene.add(new alg.DefPoint(1, 1), EMPTY_INFO, { z: manipZ, style: manipPointStyle });

    const points = [p0, p1, p2];

    const enableProjU = scene.add(new alg.DefBoolean(true));
    const enableProjV = scene.add(new alg.DefBoolean(true));

    const pointsEU = points.map(p => scene.add(new alg.DefConditional(), alg.DefConditional.fromCondition(p, enableProjU), { invisible }));
    const pointsEV = points.map(p => scene.add(new alg.DefConditional(), alg.DefConditional.fromCondition(p, enableProjV), { invisible }));

    const normalizeU = scene.add(new alg.DefBoolean(false));
    const normalizeV = scene.add(new alg.DefBoolean(false));
    const u = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(points[0], points[1], normalizeU), {
        z: vecZ,
        style: {
            shaft: {
                lineStyle: {
                    lineWidth: 4,
                }
            }
        },
    });
    const v = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(points[0], points[2], normalizeV), {
        z: vecZ,
        style: {
            shaft: {
                lineStyle: {
                    lineWidth: 4,
                }
            }
        },
    });

    const vs = [u, v];
    const vsEU = vs.map(a => scene.add(new alg.DefConditional(), alg.DefConditional.fromCondition(a, enableProjU), { invisible }))
    const vsEV = vs.map(a => scene.add(new alg.DefConditional(), alg.DefConditional.fromCondition(a, enableProjV), { invisible }))

    const vecLineStyle = {
        lineStyle: {
            lineWidth: 2,
            lineDash: [5],
        },
    };

    const angle = scene.add(new alg.DefAngle(), alg.DefAngle.fromPoints(points[1], points[0], points[2], alg.DefAngle.USE_SMALLER_ANGLE), {
        z: textZ,
        style: {
            r: 40,
            arc: {
                showDirection: false,
            },
            text: {
                radius: 0.75,
                // transform: () => "\u03b1",
                strokeStyle: "rgb(255,255,255)",
                fillStyle: "black",
                textStyle: {
                    font: "bold 15px sans-serif",
                    textAlign: "center",
                },
                outline: {
                    lineWidth: 6,
                },
            },
        }
    });

    const projectionFromOneOntoOther = (a, b, pointsA, pointsB, conditionalA, names) => {

        const aEnd = scene.add(new alg.DefPoint(), alg.DefPoint.fromPointOrVector(a), { invisible });
        const bEnd = scene.add(new alg.DefPoint(), alg.DefPoint.fromPointOrVector(b), { invisible });
        const la = scene.add(new alg.DefLine({ leftOpen: true, rightOpen: true }), alg.DefLine.fromVector(a), {
            z: lineZ,
            style: vecLineStyle
        });

        const lpa = scene.add(new alg.DefPerpendicularLine(), alg.DefPerpendicularLine.fromVectorsOrLine({ v: la, ref: bEnd }), {
            z: lineZ,
            invisible,
        });

        const inter = scene.add(new alg.DefIntersection(), alg.DefIntersection.fromObjects(la, lpa, { takeIndex: 0 }), { invisible });

        const rightAngle = scene.add(new alg.DefAngle(), alg.DefAngle.fromPoints(pointsA[0], inter, bEnd, alg.DefAngle.USE_SMALLER_ANGLE), {
            z: lineZ + 1,
            style: {
                arc: {
                    showDirection: false,
                    fillStyle: "rgba(128,128,128,0.1)",
                },
                text: {
                    radius: 0.5,
                    transform: () => ".",
                    textStyle: {
                        font: "15px bold sans-serif",
                    },
                    textAlign: "center",
                    textBaseline: "middle",
                }
            }
        });

        const fallDownLine = scene.add(new alg.DefLine(), alg.DefLine.fromPoints(inter, bEnd), {
            z: lineZ,
            style: {
                strokeStyle: "rgb(128,128,128)",
                lineStyle: {
                    lineWidth: 2,
                    lineDash: [5],
                }
            }
        });

        const dotNum = scene.add(new alg.DefFunc(deps => {
            const { a, b } = deps;
            const dot = Vec2.dot(a, b);
            return alg.makeNumber(dot);
        }), alg.DefFunc.from({ a, b }));
        // we add two segments to account for whether the product is positive or negative
        const isNegative = scene.add(new alg.DefBoolean(), alg.DefBoolean.fromPredicate((deps) => {
            return deps[0].value < 0.0;
        }, [dotNum]));

        const isNotNegative = scene.add(new alg.DefBoolean(), alg.DefBoolean.fromNot(isNegative));

        const posSegmentProps = {
            z: vecZ,
            style: {
                strokeStyle: "rgb(255,0,0)",
                lineStyle: {
                    lineWidth: 2,
                },
            }
        };
        const negSegmentProps = {
            z: vecZ,
            style: {
                strokeStyle: "rgb(0,0,255)",
                lineStyle: {
                    lineWidth: 2,
                },
            }
        };
        const segment = scene.add(new alg.DefLine(), alg.DefLine.fromPoints(pointsA[0], inter), posSegmentProps);




        const lenA = scene.add(new alg.DefLength(), alg.DefLength.fromVectorOrLine(a));
        const lenInter = scene.add(new alg.DefLength(), alg.DefLength.fromPoints(pointsA[0], inter));

        const multDot = scene.add(
            new alg.DefFunc(deps => alg.makeNumber(deps[0].value * deps[1].value * (deps[2].value ? 1 : -1))),
            alg.DefFunc.from([lenA, lenInter, isNotNegative]));

        const downV = scene.add(new alg.DefVector({ normalize: true }), alg.DefVector.fromPoints(bEnd, inter), { invisible });

        const scaledDownV = scene.add(new alg.DefFunc(dep => alg.makeVector(Vec2.scale(dep[0], dep[1].value))), alg.DefFunc.from([downV, lenA]), { invisible });

        const downPointChain = new alg.DefChainApply(
            new alg.DefVector(),
            v => {
                return alg.DefPoint.fromPointOrVector(v);
            },
            new alg.DefPoint()
        );
        const downPoint0 = scene.add(downPointChain, alg.DefVector.fromRefVector({ v: scaledDownV, ref: pointsA[0] }), { invisible });
        const downPoint1 = scene.add(downPointChain, alg.DefVector.fromRefVector({ v: scaledDownV, ref: inter }), { invisible });



        const posPolyProps = {
            z: lineZ + 1,
            style: {
                strokeStyle: "rgb(255,0,0)",
                fillStyle: "rgba(255,0,0,0.25)",
            }
        };
        const negPolyProps = {
            z: lineZ + 1,
            style: {
                strokeStyle: "rgb(0,0,255)",
                fillStyle: "rgb(0,0,255,0.25)",
            }
        };


        const dotPoly = scene.add(new alg.DefPolygon(), alg.DefPolygon.fromPoints([pointsA[0], downPoint0, downPoint1, inter]), posPolyProps);
        const dotMid = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromPoints(pointsA[0], downPoint0, downPoint1, inter), { invisible });

        scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
            if (e.index === isNegative) {
                const val = scene.get(e.index).value.value;

                if (val) {
                    scene.setProperties(segment, negSegmentProps);
                    scene.setProperties(dotPoly, negPolyProps);
                } else {
                    scene.setProperties(segment, posSegmentProps);
                    scene.setProperties(dotPoly, posPolyProps);

                }
            }
        });



        const segmentMid = scene.add(new alg.DefInterpolate(0.75), alg.DefInterpolate.fromObjects(pointsA[0], inter), { invisible });

        const textCosV = scene.add(new alg.DefText({ text: `|${names[1]}|cos \u03b1` }), alg.DefText.fromObjectRef({ ref: segmentMid }), {
            invisible: true,
            z: textZ,
            style:
            {
                strokeStyle: "rgb(255,255,255)",
                fillStyle: "black",
                textStyle: {
                    font: "bold 15px sans-serif",
                    textAlign: "center",
                },
                outline: {
                    lineWidth: 6,
                }
            },
        });

        const leftMid = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromPoints(pointsA[0], downPoint0), { invisible });
        const botMid = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromPoints(downPoint0, downPoint1), { invisible });

        const arc0 = scene.add(new alg.DefArc(), alg.DefArc.fromCenterAndPoints(pointsA[0], downPoint0, aEnd, alg.DefAngle.USE_SMALLER_ANGLE), {
            z: lineZ,
            style: {
                strokeStyle: "rgba(0,0,0,0.75)",
                outline: {
                    lineDash: [10],
                }
            }
        });


        const textDot = scene.add(new alg.DefText(), alg.DefText.fromObjectRef({ obj: multDot, ref: dotMid }), {
            z: textZ - 1,
            style:
            {
                strokeStyle: "rgb(255,255,255)",
                fillStyle: "black",
                textStyle: {
                    font: "bold 15px sans-serif",
                    textAlign: "center",
                },
                outline: {
                    lineWidth: 6,
                }
            },
        });


        const textLenA = scene.add(new alg.DefText(), alg.DefText.fromObjectRef({ obj: lenA, ref: leftMid }), {
            z: textZ,
            style:
            {
                strokeStyle: "rgb(255,255,255)",
                fillStyle: "black",
                textStyle: {
                    font: "bold 10px sans-serif",
                    textAlign: "center",
                },
                outline: {
                    lineWidth: 6,
                }
            },
        });

        const textLenProj = scene.add(new alg.DefText(), alg.DefText.fromObjectRef({ obj: lenInter, ref: botMid }), {
            z: textZ,

            style:
            {
                strokeStyle: "rgb(255,255,255)",
                fillStyle: "black",
                textStyle: {
                    font: "bold 10px sans-serif",
                    textAlign: "center",
                },
                outline: {
                    lineWidth: 6,
                }
            },
        });
    };

    projectionFromOneOntoOther(vsEU[0], vsEU[1], [pointsEU[0], pointsEU[1]], [pointsEU[0], pointsEU[2]], enableProjU, ["u", "v"]);
    projectionFromOneOntoOther(vsEV[1], vsEV[0], [pointsEV[0], pointsEV[2]], [pointsEV[0], pointsEV[1]], enableProjV, ["v", "u"]);



    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas, [p0, p1, p2], 40);

    const options = makeContainer();

    const checkDisplayU = makeCheckboxNoLabel(scene.get(enableProjU).value.value);
    checkDisplayU.onchange = e => {
        scene.update(enableProjU, new alg.DefBoolean(checkDisplayU.checked));
    };
    options.appendChild(makeContainer(makeTextField("Display projection on u:"), checkDisplayU));

    const checkDisplayV = makeCheckboxNoLabel(scene.get(enableProjV).value.value);
    checkDisplayV.onchange = e => {
        scene.update(enableProjV, new alg.DefBoolean(checkDisplayV.checked));
    };
    options.appendChild(makeContainer(makeTextField("Display projection on v:"), checkDisplayV));

    const checkNormalizeU = makeCheckboxNoLabel(scene.get(normalizeU).value.value);
    checkNormalizeU.onchange = e => {
        scene.update(normalizeU, new alg.DefBoolean(checkNormalizeU.checked));
    };
    options.appendChild(makeContainer(makeTextField("Normalize u:"), checkNormalizeU));

    const checkNormalizeV = makeCheckboxNoLabel(scene.get(normalizeV).value.value);
    checkNormalizeV.onchange = e => {
        scene.update(normalizeV, new alg.DefBoolean(checkNormalizeV.checked));
    };
    options.appendChild(makeContainer(makeTextField("Normalize v:"), checkNormalizeV));

    container.appendChild(makeContainer(makeTextField("Options", "b"), options));

}

function demoTrig(containerId) {

    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);

    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefArc,
        DefLine,
        DefChainApply,
        DefIntersection,
        DefClosestPoint,
        DefAngle,
        DefParallelLine,
        DefPerpendicularLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;
    const scene = new alg.GeometryScene();

    const diagram = new alg.DiagramCanvas({ x0: -1.5, y0: -1.5, x1: 1.5, y1: 1.5, flipY: true, canvas });

    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    const invisible = true;

    const origin = scene.add(new DefPoint(0, 0), null, {});
    const xv = scene.add(new DefVector({ x: 1, y: 0 }), DefVector.fromRefVector({ ref: origin }),
        { invisible });

    const xp = scene.add(new DefPoint(), DefPoint.fromPointOrVector(xv), {
        invisible
    });
    const yv = scene.add(new DefVector({ x: 0, y: 1, ref: { x: 0, y: 1 } }),
        DefVector.fromRefVector({ ref: origin }),
        { invisible });
    const xAxis = scene.add(new DefLine({ leftOpen: true, rightOpen: true }), DefLine.fromVector(xv));
    const yAxis = scene.add(new DefLine({ leftOpen: true, rightOpen: true }), DefLine.fromVector(yv));

    const circle = scene.add(new DefArc({ r: 1 }), DefArc.fromValues({ center: origin }));


    const interCircleX = scene.add(
        new DefChainApply(new DefIntersection(), (v) => v[1]),
        DefIntersection.fromObjects(circle, xAxis),
        { invisible });
    const interCircleY = scene.add(
        new DefChainApply(new DefIntersection(), (v) => v[1]),
        DefIntersection.fromObjects(circle, yAxis),
        { invisible });

    const handlePoint = scene.add(new DefPoint(0, 0), EMPTY_INFO, {
        invisible
    });
    {
        const ov = scene.get(origin);
        scene.update(handlePoint, new DefPoint(ov.value.x + 1, ov.value.y));
    }
    const circlePoint = scene.add(new DefClosestPoint(), DefClosestPoint.fromObject(handlePoint, circle), {
        style: manipPointStyle
    });

    const circleVector = scene.add(new DefVector(), DefVector.fromPoints(origin, circlePoint));
    const circleLine = scene.add(new DefLine({ leftOpen: true, rightOpen: true }),
        DefLine.fromPoints(origin, circlePoint), {
        z: 2,
        style: {
            strokeStyle: "rgba(0,0,0,0.25)",
            lineStyle: {
                lineDash: [4],
            }
        }
    });

    const projX = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(circlePoint, xAxis),
        { invisible });
    const projY = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(circlePoint, yAxis),
        { invisible });

    const showProjX = scene.add(new DefLine(), DefLine.fromPoints(projX, circlePoint), {
        style: {
            lineStyle: {
                lineDash: [4]
            }
        }
    });
    const showProjY = scene.add(new DefLine(), DefLine.fromPoints(projY, circlePoint), {
        style: {
            lineStyle: {
                lineDash: [4]
            }
        }
    });


    const angle = scene.add(new DefAngle(), DefAngle.fromPoints(xp, origin, circlePoint),
        {
            style: {
                r: 40,
                text: {
                    radius: 0.35,
                    transform: (angle, isDeg) => {
                        return `\u{03B1}`;
                    },
                    textStyle: {
                        font: "20px bold sans-serif",
                    },
                }
            }
        });

    const cosSeg = scene.add(new DefLine(), DefLine.fromPoints(origin, projX), {
        style: {
            strokeStyle: "rgb(255,0,0)",
            lineStyle: {
                lineWidth: 2,
            }
        }
    });

    const sinSeg = scene.add(new DefLine(), DefLine.fromPoints(origin, projY), {
        style: {
            strokeStyle: "rgb(0,0,255)",
            lineStyle: {
                lineWidth: 2,
            }
        }
    });


    // const yperp = scene.add(new DefParallelLine(), DefParallelLine.fromVectorsOrLineRef({ v: yAxis, ref: interCircleX }), {
    //     style: {
    //         strokeStyle: "rgba(0,0,0,0.1)",
    //     },
    // });
    // const xperp = scene.add(new DefParallelLine(), DefParallelLine.fromVectorsOrLineRef({ v: xAxis, ref: interCircleY }), {
    //     style: {
    //         strokeStyle: "rgba(0,0,0,0.1)",
    //     },
    // });

    // const intersectTan = scene.add(new DefIntersection(), DefIntersection.fromObjects(circleLine, yperp, { takeIndex: 0 }), {
    //     invisible
    // });
    // const intersectCot = scene.add(new DefIntersection(), DefIntersection.fromObjects(circleLine, xperp, { takeIndex: 0 }), {
    //     invisible
    // });



    const cosMidPoint = scene.add(new DefMidPoint(), DefMidPoint.fromObject(cosSeg), {
        invisible
    });
    const sinMidPoint = scene.add(new DefMidPoint(), DefMidPoint.fromObject(sinSeg), {
        invisible
    });

    const textCos = scene.add(new DefText({ text: "cos" }),
        DefText.fromObjectRef({ ref: cosMidPoint }), {
        style: {
            fillStyle: "rgb(255,0,0)",
            strokeStyle: "rgba(0,0,0,0)",
            offset: { x: -0.2, y: -0.2 },
            textStyle: {
                font: "20px bold sans-serif",
            },
        }
    });

    const textSin = scene.add(new DefText({ text: "sin" }),
        DefText.fromObjectRef({ ref: sinMidPoint }), {
        style: {
            fillStyle: "rgb(0,0,255)",
            strokeStyle: "rgba(0,0,0,0)",
            offset: { x: -0.4, y: 0 },
            textStyle: {
                font: "20px bold sans-serif",
            },
        }
    });


    const axisFlip = (p, ref, orig, axis) => {
        const pdy = p[axis] - orig[axis];
        const rdy = ref[axis] - orig[axis];
        const result = { x: p.x, y: p.y };
        if (Math.sign(pdy) * Math.sign(rdy) < 0) {
            // relative to origin
            // move to center
            result[axis] -= orig[axis];
            // flip
            result[axis] *= -1;
            // move back
            result[axis] += orig[axis];
        }
        return result;
    }
    const manip = alg.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, canvas, [[circlePoint, handlePoint]], 40);
    
}

export {
    distance,
    cone,
    side,
    project,
    angle,
    angleBasic,
    decompose,
    demoDot,
    demoTrig,
    projectUnitLength,
}