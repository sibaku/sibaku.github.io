import * as alg from "../bundles/algeobra.bundle.min.js";


import {
    makeContainer,
    makeTextField,
    makeUpdateSlider,
    makeCanvas,
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


function demoInverseTransformSampling(containerId) {

    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);

    const { EMPTY_INFO, EMPTY, Vec2 } = alg;

    const scene = new alg.GeometryScene();
    const diagram = new alg.DiagramCanvas({ x0: -0.25, y0: -0.1, x1: 3, y1: 1.5, flipY: true, canvas });
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


    const makeIntTable = (f, a, b, steps = 100) => {
        const values = [];

        let sum = 0.0;
        const dt = (b - a) / (steps - 1);
        values.push(sum);
        for (let i = 1; i < steps; i++) {
            const t = a + i * dt;
            const v = f(t);
            sum += v * dt;
            values.push(sum);
        }

        // normalize
        for (let i = 0; i < values.length; i++) {
            values[i] /= sum;
        }

        return {
            f,
            values,
            a, b,
            sum,
        };
    };

    const sample = (table, t) => {
        const { values, a, b } = table;
        const idxF = values.length * (t - a) / (b - a);
        let idx = Math.floor(idxF);
        const s = idxF - idx;
        let idxN = idx + 1;

        idx = Math.max(0, Math.min(values.length - 1, idx));
        idxN = Math.max(0, Math.min(values.length - 1, idxN));

        const v0 = values[idx];
        const v1 = values[idxN];

        const v = (1 - s) * v0 + s * v1;
        return v;
    };

    const funcs = [
        { f: x => 0.5 * Math.sin(x * (2.0 * Math.PI) / 1.5) + 0.5, a: 0, b: 3, name: "sin" },
        { f: x => 1, a: 0, b: 3, name: "uniform" },
        { f: x => 0.1 * Math.exp(-Math.pow(x - 0.75, 2) / (0.05)) + 0.1 * Math.exp(-Math.pow(x - 2.25, 2) / (0.05)), a: 0, b: 3, name: "bimodal" },
        { f: x => Math.exp(x), a: 0, b: 3, name: "exp" },
        { f: x => { const y = 10 * (x - 1.5); return 0.3 + Math.sin(y) / (y + 0.00001) }, a: 0, b: 3, name: "sinc" },
    ];

    const fIdx = scene.add(new alg.DefNumber(0));

    const f = scene.add(new alg.DefFunc((deps) => (funcs[deps.fIdx.value])), alg.DefFunc.from({ fIdx }), {});
    const normalized = scene.add(new alg.DefFunc(deps => {
        const { f } = deps;
        const table = makeIntTable(f.f, f.a, f.b);
        return table;
    }), alg.DefFunc.from({ f }), {});
    const fPoints = scene.add(new alg.DefFunc(
        deps => {
            const { f } = deps;
            const points = [];
            const n = 100;
            for (let i = 0; i < n; i++) {
                const x = i / (n - 1) * (f.b - f.a) + f.a;
                const y = f.f(x) / f.sum;
                points.push(alg.makePoint({ x, y }));
            }

            return points;
        }
    ), alg.DefFunc.from({ f: normalized }), { invisible });

    const intPoints = scene.add(new alg.DefFunc(deps => {
        const { f } = deps;
        const points = [];
        const n = 100;
        for (let i = 0; i < n; i++) {
            const x = i / (n - 1) * (f.b - f.a) + f.a;
            const y = sample(f, x);
            points.push(alg.makePoint({ x, y }));
        }

        return points;
    }), alg.DefFunc.from({ f: normalized }), { invisible });

    const fBez = scene.add(new alg.DefBezierSpline(), alg.DefBezierSpline.fromCatmullRom(fPoints), {
        style: {
            strokeStyle: "rgb(57,162,117)",
            lineStyle: {
                lineWidth: 2,
            },
        }
    });
    const fIntBez = scene.add(new alg.DefBezierSpline(), alg.DefBezierSpline.fromCatmullRom(intPoints), {
        style: {
            strokeStyle: "blue",
            lineStyle: {
                lineWidth: 4,
            },
        }
    });

    const n = scene.add(new alg.DefNumber(20), EMPTY_INFO, {});

    const uniformSamplePoints = scene.add(new alg.DefFunc(deps => {
        const { n } = deps;
        const points = [];
        const min = 1E-4;
        const max = 1 - min;
        const d = max - min;
        for (let i = 0; i < n.value; i++) {
            const y = i / (n.value - 1) * d + min;
            points.push(alg.makePoint({ x: 0, y }));
        }
        return points;
    }), alg.DefFunc.from({ n }), {});

    const interPoints = scene.add(new alg.DefFunc(deps => {
        const { pts, b } = deps;

        const inter = new alg.DefIntersection();
        return pts.map(p => {
            const line = alg.makeLine({ p0: p, p1: Vec2.add(p, Vec2.vec2(1, 0)), rightOpen: true });
            const result = inter.compute(alg.DefIntersection.fromObjects(line, b));
            return result && result.length > 0 ? result[0] : EMPTY;
        });
    }), alg.DefFunc.from({ pts: uniformSamplePoints, b: fIntBez }), {
        style: {
            radius: 10,
            fillStyle: "rgba(255,0,0,0.5)",
        }
    });


    const interProj = scene.add(new alg.DefFunc(deps => {
        const { pts } = deps;
        return pts.map(v => alg.makePoint({ x: v.x, y: 0 }));
    }), alg.DefFunc.from({ pts: interPoints }), {});

    const makeLines = new alg.DefFunc(deps => {
        const { ptsA, ptsB } = deps;
        const n = ptsA.length;

        const lines = [];
        for (let i = 0; i < n; i++) {
            const a = ptsA[i];
            const b = ptsB[i];
            if (alg.isParamEmpty(a) || alg.isParamEmpty(b)) {
                continue;
            }
            lines.push(alg.makeLine({ p0: a, p1: b }));
        }

        return lines;
    });

    const textF = scene.add(new alg.DefText({ text: "PDF", ref: { x: 0.15, y: 1.25 } }), alg.DefText.fromObjectRef({}), {
        style: {
            fillStyle: "rgb(57,162,117)",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                font: "20px sans-serif",
            },
        }
    });
    const textC = scene.add(new alg.DefText({ text: "CDF", ref: { x: 0.15, y: 1.05 } }), alg.DefText.fromObjectRef({}), {
        style: {
            fillStyle: "blue",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                font: "20px sans-serif",
            },
        }
    });
    const lineProps = {
        style: {
            strokeStyle: "rgba(64,64,64,0.5)",
            lineStyle: {
                lineWidth: 2.0,
                lineDash: [2, 4],
            },
        }
    };
    const xLines = scene.add(makeLines, alg.DefFunc.from({ ptsA: uniformSamplePoints, ptsB: interPoints }), lineProps);
    const yLines = scene.add(makeLines, alg.DefFunc.from({ ptsA: interPoints, ptsB: interProj }), lineProps);
    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas, [], 40);

    const minN = 3;
    const maxN = 50;
    const sliderText = makeTextField("");
    const sliderN = makeUpdateSlider((val, slider) => {
        const num = Math.round(val);
        scene.update(n, new alg.DefNumber(num));
        sliderText.textContent = `(${num})`;
    }, minN, maxN, scene.get(n).value.value, maxN - minN + 1, true);

    const fOpts = document.createElement("select");
    funcs.forEach(f => {
        fOpts.add(new Option(f.name, f.name));
    });
    fOpts.onchange = () => {
        scene.update(fIdx, new alg.DefNumber(fOpts.selectedIndex));
    };
    fOpts.onchange();
    const options = makeContainer(makeContainer(makeTextField("#Samples:"), sliderN, sliderText),
        makeContainer(makeTextField("Select function:"), fOpts));

    container.appendChild(options);

    makeSVGButton(scene, diagram, container, { bg: diagPainter.bg });
}

export { demoInverseTransformSampling }