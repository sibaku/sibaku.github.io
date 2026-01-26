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

function makeSVGButton(scene, diagram, container, { bg = alg.NO_BACKGROUND_CONFIG } = {}) {


    const but = document.createElement("button");
    but.innerText = "Save to SVG";
    but.onclick = () => {
        const { x0, y0, x1, y1, flipY } = diagram.coordinateMapper;
        const output = new alg.SvgPathOutput(diagram.output.width, diagram.output.width / diagram.output.height);
        const diagSVG = new alg.DiagramCanvas({ x0, y0, x1, y1, flipY, canvas: output });

        alg.drawSceneToDiagram(scene, diagSVG, { bg });
        const d = output.document;

        const contentType = "image/svg+xml;charset=utf-8";
        const blob = new Blob([d], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "diagram.svg");
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
    }

    container.appendChild(makeContainer(but));
    return but;

}



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

    const diagram = new alg.DiagramCanvas({ x0: -2, y0: -2, x1: 2, y1: 2, flipY: true, canvas });

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
        const a = Math.PI * 0.25;
        const ov = scene.get(origin);
        scene.update(handlePoint, new DefPoint(ov.value.x + Math.cos(a), ov.value.y + Math.sin(a)));
    }
    const circlePoint = scene.add(new DefClosestPoint(), DefClosestPoint.fromObject(handlePoint, circle), {
        style: {
            r: 6,
        }
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


    const yperp = scene.add(new DefParallelLine(), DefParallelLine.fromVectorsOrLineRef({ v: yAxis, ref: interCircleX }), {
        style: {
            strokeStyle: "rgba(0,0,0,0.1)",
        },
    });
    const xperp = scene.add(new DefParallelLine(), DefParallelLine.fromVectorsOrLineRef({ v: xAxis, ref: interCircleY }), {
        style: {
            strokeStyle: "rgba(0,0,0,0.1)",
        },
    });

    const intersectTan = scene.add(new DefIntersection(), DefIntersection.fromObjects(circleLine, yperp, { takeIndex: 0 }), {
        invisible
    });
    const intersectCot = scene.add(new DefIntersection(), DefIntersection.fromObjects(circleLine, xperp, { takeIndex: 0 }), {
        invisible
    });

    const tanProj = scene.add(new DefClosestPoint(), DefClosestPoint.fromObject(intersectTan, xAxis), { invisible });
    const cotProj = scene.add(new DefClosestPoint(), DefClosestPoint.fromObject(intersectCot, yAxis), { invisible });
    const tanLine = scene.add(new DefLine(), DefLine.fromPoints(tanProj, intersectTan),
        {
            style: {
                strokeStyle: "rgb(0,255,0)",
                lineStyle: {
                    lineWidth: 2,
                },
            }
        });
    const cotLine = scene.add(new DefLine(), DefLine.fromPoints(cotProj, intersectCot),
        {
            style: {
                strokeStyle: "rgb(0,255,255)",
                lineStyle: {
                    lineWidth: 2,
                },
            }
        });

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

    const circPointOnTanLine = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(circlePoint, yperp),
        { invisible });

    // flip along x, if tan point is below
    const tanPointFlip = scene.add(
        new DefFunc(info => {
            const { p, ref, orig } = info;
            const result = axisFlip(p, ref, orig, "y");
            return makePoint({ x: result.x, y: result.y });
        }), DefFunc.from({ p: circPointOnTanLine, ref: intersectTan, orig: origin }),
        {
            invisible
        });

    const circPointOnCotLine = scene.add(new DefClosestPoint(),
        DefClosestPoint.fromObject(circlePoint, xperp),
        { invisible });
    // flip along x, if tan point is below
    const cotPointFlip = scene.add(
        new DefFunc(info => {
            const { p, ref, orig } = info;
            const result = axisFlip(p, ref, orig, "x");
            return makePoint({ x: result.x, y: result.y });
        }), DefFunc.from({ p: circPointOnCotLine, ref: intersectCot, orig: origin }),
        {
            invisible
        });

    const tanMidPoint = scene.add(new DefMidPoint(), DefMidPoint.fromPoints(tanProj, tanPointFlip), {
        invisible
    });
    const cotMidPoint = scene.add(new DefMidPoint(), DefMidPoint.fromPoints(cotProj, cotPointFlip), {
        invisible
    });

    const textTan = scene.add(new DefText({ text: "tan" }),
        DefText.fromObjectRef({ ref: tanMidPoint }),
        {
            style: {
                fillStyle: "rgb(0,255,0)",
                strokeStyle: "rgba(0,0,0,0)",
                offset: { x: 0.2, y: 0 },
                textStyle: {
                    font: "20px bold sans-serif",
                },
            }
        });

    const textCot = scene.add(new DefText({ text: "cot" }),
        DefText.fromObjectRef({ ref: cotMidPoint }),
        {
            style: {
                fillStyle: "rgb(0,255,255)",
                strokeStyle: "rgba(0,0,0,0)",
                offset: { x: 0, y: 0.2 },
                textStyle: {
                    font: "20px bold sans-serif",
                },
            }
        });




    const manip = alg.PointManipulator.createForPointsAndHandles(scene, diagram.coordinateMapper, canvas, [[circlePoint, handlePoint]], 40);


    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}

function demoAddition(containerId) {

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
    const diagram = new alg.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });
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
    const pointZ = 0;
    const baseArrowZ = 2;
    const flippedArrowZ = 2;
    const fullArrowZ = 1;

    const pointStyle = { r: 8, fillStyle: "rgb(128,128,128)" };
    const arrowStart = scene.add(new alg.DefPoint(-2, -2), alg.EMPTY_INFO, { z: pointZ, style: pointStyle });
    const p1 = scene.add(new alg.DefPoint(1, 0), alg.EMPTY_INFO, { z: pointZ, style: pointStyle });
    const p2 = scene.add(new alg.DefPoint(2, 2), alg.EMPTY_INFO, { z: pointZ, style: pointStyle });

    const v0 = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(arrowStart, p1), {
        z: baseArrowZ,
        style: {
            shaft: {
                strokeStyle: "rgb(255,0,0)",
                lineStyle: {
                    lineWidth: 2,
                },
            },
            arrow: {
                strokeStyle: "rgb(255,0,0)",
                fillStyle: "rgb(255,0,0)",
            },
        }
    });
    const v1 = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(p1, p2), {
        z: baseArrowZ,
        style: {
            shaft: {
                strokeStyle: "rgb(0,0,255)",
                lineStyle: {
                    lineWidth: 2,
                },
            },
            arrow: {
                strokeStyle: "rgb(0,0,255)",
                fillStyle: "rgb(0,0,255)",
            },
        }
    });

    const vs1 = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(arrowStart, p2), {
        z: fullArrowZ,
        style: {
            shaft: {

            },
            arrow: {
                width: 0.025,
            },
        }
    });

    // optional order switching
    const enableOrderSwitch = scene.add(new alg.DefBoolean(true));
    const arrowStartOrder = scene.add(new alg.DefConditional(), alg.DefConditional.fromCondition(arrowStart, enableOrderSwitch), {
        invisible
    });

    // vectors in different orders
    const u0 = scene.add(new alg.DefVector(), alg.DefVector.fromRefVector({ ref: arrowStartOrder, v: v1 }), {
        z: flippedArrowZ,
        style: {
            shaft: {
                strokeStyle: "rgba(0,0,255,0.5)",
                lineStyle: {
                    lineWidth: 2,
                },
            },
            arrow: {
                strokeStyle: "rgba(0,0,255,0.5)",
                fillStyle: "rgba(0,0,255,0.5)",
            },
        }
    });
    const u0p = scene.add(new alg.DefPoint(), alg.DefPoint.fromPointOrVector(u0), {
        z: pointZ,
        invisible,
    });
    const u1 = scene.add(new alg.DefVector(), alg.DefVector.fromRefVector({ ref: u0p, v: v0 }), {
        z: flippedArrowZ,
        style: {
            shaft: {
                strokeStyle: "rgba(255,0,0,0.5)",
                lineStyle: {
                    lineWidth: 2,
                },
            },
            arrow: {
                strokeStyle: "rgba(255,0,0,0.5)",
                fillStyle: "rgba(255,0,0,0.5)",
            },
        }
    });


    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas, [arrowStart, p1, p2], 40);


    // Simple HTML interface
    const checkDisplayReverse = makeCheckboxNoLabel(scene.get(enableOrderSwitch).value.value);
    checkDisplayReverse.onchange = e => {
        scene.update(enableOrderSwitch, new alg.DefBoolean(checkDisplayReverse.checked));
    };
    container.appendChild(makeContainer(makeTextField("Show reverse order:"), checkDisplayReverse));
    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });
}

function demoScale(containerId) {

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

    const diagram = new alg.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });

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
    const pointZ = 0;
    const baseArrowZ = 2;
    const scaledArrowZ = 1;
    const pointStyle = { r: 8, fillStyle: "rgb(128,128,128)" };
    const arrowStart = scene.add(new alg.DefPoint(0, 0), EMPTY_INFO, { z: pointZ, style: pointStyle, });


    const arrowEnd = scene.add(new alg.DefPoint(1, 1), EMPTY_INFO, { z: pointZ, style: pointStyle });
    const v0 = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(arrowStart, arrowEnd), {
        z: baseArrowZ,
        style: {
            shaft: {
                lineStyle: {
                    lineWidth: 4,
                }
            },
        }
    });

    const scaleV0 = scene.add(new alg.DefNumber(1));

    const addScaledVector = dep => {
        const { v, ref, scale } = dep;
        const p = Vec2.add(ref, Vec2.scale(v, scale.value));
        return alg.makePoint(p);
    };
    const lineV0 = scene.add(new alg.DefFunc(addScaledVector), alg.DefFunc.from({ ref: arrowStart, v: v0, scale: scaleV0 }), {
        invisible
    });
    const posStyle = {
        shaft: {
            strokeStyle: "red",
            lineStyle: {
                lineWidth: 2,
            },
        },
        arrow: {
            strokeStyle: "red",
            fillStyle: "red",
        },
    };
    const negStyle = {
        shaft: {
            strokeStyle: "blue",
            lineStyle: {
                lineWidth: 2,
            },
        },
        arrow: {
            strokeStyle: "blue",
            fillStyle: "blue",
        },
    }
    const vecScaled = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(arrowStart, lineV0), {
        z: scaledArrowZ,
        style: alg.createFromTemplate(posStyle)
    });


    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {
        if (e.index === scaleV0) {
            const s = scene.get(e.index).value.value;
            if (s < 0) {
                scene.updateProperties(vecScaled, { style: negStyle });
            } else {
                scene.updateProperties(vecScaled, { style: posStyle });
            }
        }
    });

    const normv0 = scene.add(new alg.DefNormalVector({ normalize: true }), alg.DefNormalVector.fromVector({ v: v0, ref: arrowStart }), { invisible });
    const textOffset = scene.add(new alg.DefNumber(-0.5));
    const textOffsetPoint = scene.add(new alg.DefFunc(addScaledVector), alg.DefFunc.from({ ref: arrowStart, v: normv0, scale: textOffset }), { invisible });

    const format = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    });
    const scaleText = scene.add(new alg.DefText({
        text: s => {
            return `Scale: ${format.format(s.value)}`;
        }
    }), alg.DefText.fromObjectRef({ obj: scaleV0, ref: textOffsetPoint }),
        {
            style: {
                textStyle: {
                    font: "20px sans-serif",
                },
            }
        });

    let time = 0;
    let lastTime = new Date().getTime();
    const update = () => {
        let curTime = new Date().getTime();
        const delta = (curTime - lastTime) / 1000;
        lastTime = curTime;
        time += delta / 5;
        scene.update(scaleV0, new alg.DefNumber(2 * Math.cos(2.0 * Math.PI * time)));

        window.requestAnimationFrame(update);

    };

    update();
    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas, [arrowStart, arrowEnd], 40);


    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });
}
function demoLength(containerId) {
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

    const diagram = new alg.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });

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
    const pointZ = 0;
    const textZ = 0;
    const baseArrowZ = 2;
    const arrowZ = 1;
    const pointStyle = { r: 8, fillStyle: "rgb(128,128,128)" };
    const arrowStart = scene.add(new alg.DefPoint(-1, -1), EMPTY_INFO, { z: pointZ, style: pointStyle, });
    const arrowEnd = scene.add(new alg.DefPoint(1, 1), EMPTY_INFO, { z: pointZ, style: pointStyle });

    const v0 = scene.add(new alg.DefVector(), alg.DefVector.fromPoints(arrowStart, arrowEnd),
        {
            z: arrowZ,
            style: {
                shaft: {
                    lineStyle: {
                        lineWidth: 4,
                    }
                }
            }
        });

    const vX = scene.add(new alg.DefVector({ x: 1, y: 0 }), EMPTY_INFO, { invisible });

    const xAxis = scene.add(new alg.DefLine({ leftOpen: true, rightOpen: true }), alg.DefLine.fromPointVector(arrowStart, vX), { invisible });

    const endYAxis = scene.add(new alg.DefPerpendicularLine(), alg.DefPerpendicularLine.fromVectorsOrLine({ v: vX, ref: arrowEnd }), { invisible });
    const projX = scene.add(new alg.DefIntersection(), alg.DefIntersection.fromObjects(xAxis, endYAxis, { takeIndex: 0 }), { invisible });

    const xline = scene.add(new alg.DefLine(), alg.DefLine.fromPoints(arrowStart, projX), {
        z: baseArrowZ,
        style: {
            strokeStyle: "red",
            lineStyle: {
                lineWidth: 4,
            }
        }
    });

    const yline = scene.add(new alg.DefLine(), alg.DefLine.fromPoints(projX, arrowEnd), {
        z: baseArrowZ,
        style: {
            strokeStyle: "blue",
            lineStyle: {
                lineWidth: 4,
            }
        }
    });

    const midC = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromObject(v0), { invisible });
    const midA = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromObject(xline), { invisible });
    const midB = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromObject(yline), { invisible });

    const midTri = scene.add(new alg.DefMidPoint(), alg.DefMidPoint.fromPoints(arrowStart, projX, arrowEnd), { invisible });

    const outwardsNormal = new alg.DefFunc(deps => {
        const { p0, p1, nref, ref } = deps;

        const v0 = Vec2.sub(p1, p0);
        let n0 = Vec2.normal2D(v0);

        const d = Vec2.sub(p0, nref);

        const dot = Vec2.dot(d, n0);
        if (dot < 0) {
            n0 = Vec2.scale(n0, -1);
        }
        n0 = Vec2.normalizeIfNotZero(n0);
        return alg.makeVector({ x: n0.x, y: n0.y, ref });
    });

    const nC = scene.add(outwardsNormal, alg.DefFunc.from({ p0: arrowStart, p1: arrowEnd, nref: midTri, ref: midC }), { invisible });
    const nA = scene.add(outwardsNormal, alg.DefFunc.from({ p0: arrowStart, p1: projX, nref: midTri, ref: midA }), { invisible });
    const nB = scene.add(outwardsNormal, alg.DefFunc.from({ p0: projX, p1: arrowEnd, nref: midTri, ref: midB }), { invisible });

    const scaledVector = new alg.DefFunc(deps => {
        const v = deps[0];
        return alg.makePoint(Vec2.add(v.ref, Vec2.scale(v, 0.4)));
    });

    const textOffC = scene.add(scaledVector, alg.DefFunc.from([nC]), { invisible });
    const textOffA = scene.add(scaledVector, alg.DefFunc.from([nA]), { invisible });
    const textOffB = scene.add(scaledVector, alg.DefFunc.from([nB]), { invisible });

    const angle = scene.add(new alg.DefAngle(), alg.DefAngle.fromPoints(arrowStart, projX, arrowEnd, alg.DefAngle.USE_SMALLER_ANGLE), {
        style: {
            r: 30,
            arc: {
                showDirection: false,
            },
            text: {
                textStyle: {
                    font: "15px sans-serif",
                }
            },
        }
    });

    const format = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    });

    const namedLength = (name) => {
        return s => `${name} ${format.format(s.value)}`;
    };

    const lenC = scene.add(new alg.DefLengthSquared(), alg.DefLengthSquared.fromPoints(arrowStart, arrowEnd));
    const lenA = scene.add(new alg.DefLengthSquared(), alg.DefLengthSquared.fromPoints(arrowStart, projX));
    const lenB = scene.add(new alg.DefLengthSquared(), alg.DefLengthSquared.fromPoints(projX, arrowEnd));

    const textC = scene.add(new alg.DefText({ text: namedLength("|c|\u00B2 = ") }), alg.DefText.fromObjectRef({ obj: lenC, ref: textOffC }), {
        z: textZ,
        style: {
            strokeStyle: "rgb(255,255,255)",
            textStyle: {
                font: "bold 15px sans-serif",
            },
            outline: {
                lineWidth: 6,
            }
        }
    });


    const textA = scene.add(new alg.DefText({ text: namedLength("|a|\u00B2 = ") }), alg.DefText.fromObjectRef({ obj: lenA, ref: textOffA }), {
        z: textZ,
        style: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "red",
            textStyle: {
                font: "bold 15px sans-serif",
            },
            outline: {
                lineWidth: 6,
            }
        }
    });


    const textB = scene.add(new alg.DefText({ text: namedLength("|b|\u00B2 = ") }), alg.DefText.fromObjectRef({ obj: lenB, ref: textOffB }), {
        z: textZ,
        style: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "blue",
            textStyle: {
                font: "bold 15px sans-serif",
            },
            outline: {
                lineWidth: 6,
            }
        }
    });

    const a2b2 = scene.add(new alg.DefFunc(dep => alg.makeNumber(dep[0].value + dep[1].value)), alg.DefFunc.from([lenA, lenB]));
    const textA2B2 = scene.add(new alg.DefText({ text: namedLength("|a|\u00B2 + |b|\u00B2 = "), ref: { x: -0.5, y: 2.5 } }),
        alg.DefText.fromObjectRef({ obj: a2b2 }), {
        z: textZ,
        style: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "black",
            textStyle: {
                font: "bold 20px sans-serif",
                textAlign: "end",
            },
            outline: {
                lineWidth: 6,
            }
        }
    });
    const textC2 = scene.add(new alg.DefText({ text: namedLength("|c|\u00B2 = "), ref: { x: -0.5, y: 2 } }),
        alg.DefText.fromObjectRef({ obj: lenC }), {
        z: textZ,
        style: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "black",
            textStyle: {
                font: "bold 20px sans-serif",
                textAlign: "end",
            },
            outline: {
                lineWidth: 6,
            }
        }
    });

    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas, [arrowStart, arrowEnd], 40);


    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });

}


export {
    demoTrig,
    demoAddition,
    demoScale,
    demoLength,
}