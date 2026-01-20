import * as alg from "../bundles/algeobra.bundle.min.js";



import {
    makeContainer,
    makeTextField,
    makeUpdateSlider,
    makeCanvas,
} from "../lib/commonHtmlHelper.js";

function bezierSegment(containerId) {

    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);

    // get some fields for easier writing 
    const {
        EMPTY_INFO,
        DefPoint,
        DefBezier,
        DefLineStrip,
        DefNumber,
        DefChainApply,
        DefFunc,
        DefText,
        Vec2,
        makeNumber,
        objectToString,
    } = alg;

    // in this demo we will showcase the mapping of a parameter interval of a bezier curve
    // this is to illustrate how the length of the curve and the parameter interval don't have a simple correspondence

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: -2, y0: -2, x1: 5, y1: 5, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we don't draw a background
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.8,
        },
    });


    // properties for the points
    const pointProps = {
        z: -1,
        style: {
            r: 6,
            fillStyle: "gray",
        }
    };

    // our controllable bezier points
    const p0 = scene.add(new DefPoint(-1, -1), EMPTY_INFO, pointProps);
    const p1 = scene.add(new DefPoint(2, -1), EMPTY_INFO, pointProps);
    const p2 = scene.add(new DefPoint(3, 1), EMPTY_INFO, pointProps);
    const p3 = scene.add(new DefPoint(1, 2), EMPTY_INFO, pointProps);

    const points = [p0, p1, p2, p3];

    const pointLabels = points.map((p, i) => scene.add(
        new DefText({ text: `${i}` }),
        DefText.fromObjectRef({ ref: p }),
        {
            style: {
                offset: {
                    x: 0,
                    y: -0.3,
                }
            }
        }
    ));


    // we will visualize the order of the control points with a line strip
    const ls = scene.add(new DefLineStrip(), DefLineStrip.fromPoints(points), {
        z: 10,
        style: {
            strokeStyle: "rgba(128,128,128,0.5)",
            lineStyle: {
                lineDash: [4],
                lineWidth: 2,
            },
        }
    });

    // we want the user to be able to move these points
    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        points, 40);

    // the full curve
    const bez = scene.add(new DefBezier(), DefBezier.fromPoints(points));

    // the range of the sub curve
    const t0 = scene.add(new DefNumber(0.5));
    const t1 = scene.add(new DefNumber(0.9));

    // we will  compute the sub curve control points and put them in a Bezier curve
    // we will chain a function and a bezier definition
    const subCurve = scene.add(new alg.DefChainApply(
        new DefFunc(deps => {
            const { bez, t0, t1 } = deps;
            let bp = bez.points;
            const t0v = t0.value;
            const t1v = t1.value;

            const points = alg.subintervalBezierControlPoints(bp, t0v, t1v);
            return DefBezier.fromPointArray(points.map(p => alg.makePoint(p)));
        }),
        new DefBezier(),
    ), DefFunc.from({ bez, t0, t1 }), {
        style: {
            strokeStyle: "red",
            lineStyle:
            {
                lineWidth: 6,
            }
        }
    });

    // properties for the points indicating the start and end of the chosen segment
    const segmentPointProps = {
        z: pointProps.z + 1,
        style: {
            fillStyle: "black",
        }
    };
    const bp0 = scene.add(new alg.DefCurvePoint(), alg.DefCurvePoint.fromCurve({ obj: bez, t: t0 }), segmentPointProps);
    const bp1 = scene.add(new alg.DefCurvePoint(), alg.DefCurvePoint.fromCurve({ obj: bez, t: t1 }), segmentPointProps);

    // helper function to approximate the length of a bezier curve
    // this is impossible to compute exactly for basically all bezier curves, so we get a "good enough" value
    const arcLength = (points) => {
        // arbitrary epsilon value here
        const segments = alg.subdivideBezierAdaptive(points, 0.01);
        // the subdivision will create a line strip, such that each segment does not differ more than the epsilon value from the actual curve
        let len = 0;
        // just sum the lengths of all segments
        for (let i = 0; i < segments.length - 1; i++) {
            const li = Vec2.len(Vec2.sub(segments[i + 1], segments[i]));
            len += li;
        }

        return len;
    };

    // formatting for numbers
    const format = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

    // compute the length of the full curve
    const bezLen = scene.add(new DefFunc(deps => makeNumber(arcLength(deps.curve.points))), DefFunc.from({ curve: bez }));
    // compute the length of the sub curve
    const subLen = scene.add(new DefFunc(deps => makeNumber(arcLength(deps.curve.points))), DefFunc.from({ curve: subCurve }));

    // the ratio of full length to sub length
    const lenRatio = scene.add(new DefNumber(), DefNumber.fromFunc((x, y) => x / y, [subLen, bezLen]));
    // the ratio of the sub curve in parameter space
    const paramRatio = scene.add(new DefNumber(), DefNumber.fromFunc((t0, t1) => t1 - t0, [t0, t1]));

    // properties of display text
    const textProps = {
        style: {
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                font: "15px sans-serif",
            }
        }
    };

    // display some text
    const txtLen = scene.add(new DefText({
        text: s => {
            return `Bézier curve length: ${objectToString(s)}`;
        }, ref: { x: 2, y: 4 }
    }), DefText.fromObjectRef({ obj: bezLen }), textProps);

    const txtLenRatio = scene.add(new DefText({
        text: s => {
            return `Length ratio sub curve: ${objectToString(s)}`;
        }, ref: { x: 2, y: 3 }
    }), DefText.fromObjectRef({ obj: lenRatio }), textProps);

    const txtParamRatio = scene.add(new DefText({
        text: s => {
            return `Length parameter range: ${objectToString(s)}`;
        }, ref: { x: 2, y: 2 }
    }), DefText.fromObjectRef({ obj: paramRatio }), textProps);


    // a very simple ui to specify the sub curve range
    let sliderT0;
    let sliderT1;
    let t0SliderText = makeTextField("");
    let t1SliderText = makeTextField("");

    sliderT0 = makeUpdateSlider(v => {
        let vt1 = sliderT1.mappedValue;
        v = Math.min(v, vt1);
        sliderT0.mappedValue = v;
        t0SliderText.textContent = format.format(v);
        scene.update(t0, new DefNumber(v));
    }, 0, 1, scene.get(t0).value.value, 101, false);
    sliderT1 = makeUpdateSlider(v => {
        let vt0 = sliderT0.mappedValue;
        v = Math.max(v, vt0);
        sliderT1.mappedValue = v;
        t1SliderText.textContent = format.format(v);
        scene.update(t1, new DefNumber(v));
    }, 0, 1, scene.get(t1).value.value, 101, false);

    // this is just to update the display text
    sliderT0.oninput();
    sliderT1.oninput();

    container.appendChild(makeContainer(makeTextField("t0:"), sliderT0, t0SliderText));
    container.appendChild(makeContainer(makeTextField("t1:"), sliderT1, t1SliderText));
}


export {bezierSegment}