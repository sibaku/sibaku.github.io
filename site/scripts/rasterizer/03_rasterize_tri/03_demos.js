import { autoCompleteDummies, scriptHeader } from "../common/rasterizerEditorCommon.js";

import { makeJsEditor, FileSource } from "../../lib/editorCommon.js";

import { getTextFromUrl } from "../common/rasterizerEditorCommon.js";

import * as alg from "../../bundles/algeobra.bundle.min.js";

import * as jsm from "../../bundles/jsmatrix.bundle.min.js"

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
} from "../../lib/commonHtmlHelper.js";

function populateWithCanvas(document, container) {
    let canvas = document.getElementById("outputCanvas");
    if (canvas === null) {
        canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        canvas.id = "outputCanvas";
        container.appendChild(canvas);
    }
}

function makehHiddenIncludes(appContext) {
    return `
const r03 = await import("${appContext.basePath}scripts/rasterizer/03_rasterize_tri/rasterizer.js");
const geomUtils = await import("${appContext.basePath}scripts/rasterizer/common/geometry_utils.js");

const {
    Rasterizer,
    Pipeline,
    Framebuffer,
    Attribute,
    Topology,
} = r03;

const {
    transform,
    compute_geometry_bounds,
    Renderable,
    create_cube_geometry,
    create_plane_geometry,
    create_plane_geometry_xy,
} = geomUtils;

    `;
}


async function makeDemo030Solution(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent0/editorSolutionDraw.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent0/editorScene.js`);


    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent0/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "draw.js" }),
            new FileSource({ initialText: script1.trim(), name: "scene.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 1,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}


async function makeDemo030(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent0/editorExerciseDraw.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent0/editorScene.js`);


    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent0/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "draw.js" }),
            new FileSource({ initialText: script1.trim(), name: "scene.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 1,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}



async function makeDemo031Solution(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent1/editorSolutionDraw.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent1/editorScene.js`);


    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent1/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "draw.js" }),
            new FileSource({ initialText: script1.trim(), name: "scene.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 1,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}


async function makeDemo031(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent1/editorExerciseDraw.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent1/editorScene.js`);


    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent1/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "draw.js" }),
            new FileSource({ initialText: script1.trim(), name: "scene.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 1,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}

async function makeDemo032(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent2/editorRasterizer.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent2/editorScene.js`);


    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/03_rasterize_tri/editorContent2/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "draw.js" }),
            new FileSource({ initialText: script1.trim(), name: "scene.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 1,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}


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


function makeDemoBary(containerId) {
    const canvas = makeCanvas(300, 300);
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
        DefPerpendicularLine,
        DefIntersection,
        DefPolygon,
        DefLength,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
        objectToString,

    } = alg;

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we don't really need a coordinate system or angles here, so flipping y doesn't matter
    const diagram = new alg.DiagramCanvas({ x0: -3, y0: -3, x1: 3, y1: 3, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we don't use a background
    // we also let the painter take care of resizing the canvas to fill out the screen and adjusting the diagram accordingly
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.NO_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width / 2,
            widthFactor: 0.8,
        }
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // this is the styling we want to apply to points tht we manipulate
    const manipulatorPointStyle = {
        r: 10,
        fillStyle: "rgba(128,128,128,0.5)",
    };
    // we add a z value for our points so they are always on top
    // everything starts at 0, so we could either place everything further up, or our points lower
    const pointZ = -1;


    const v0 = scene.add(new DefPoint(-2.3, -2.3), EMPTY_INFO, {
        z: pointZ,
        style: manipulatorPointStyle
    });
    const v1 = scene.add(new DefPoint(2, -2.3), EMPTY_INFO, {
        z: pointZ,
        style: manipulatorPointStyle
    });
    const v2 = scene.add(new DefPoint(-2.3, 2.3), EMPTY_INFO, {
        z: pointZ,
        style: manipulatorPointStyle
    });

    const p = scene.add(new DefPoint(-1.5, -1), EMPTY_INFO, {
        z: pointZ,
        style: manipulatorPointStyle
    });

    // we want the user to be able to move these points
    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        [v0, v1, v2, p], 40);


    const pointsTri = [v0, v1, v2];
    const points01p = [v0, v1, p];
    const points12p = [v1, v2, p];
    const points20p = [v2, v0, p];

    const tri = scene.add(new DefPolygon(), DefPolygon.fromPoints(pointsTri), {
        z: 1,
        style: {
            fillStyle: "rgba(0,0,0,0)",
            strokeStyle: "rgb(0,0,0)",
            lineStyle: {
                lineWidth: 4,
            }
        }
    });

    const edgeFunc = (v0, v1, v2) => {
        return (v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x);
    };

    const compEdgeFunc = info => {
        const { tri } = info;
        const { points } = tri;
        const e = edgeFunc(...points);
        return makeNumber(e);
    };


    const tri01 = scene.add(new DefPolygon(), DefPolygon.fromPoints(points01p), {
        z: 1,
        style: {
            fillStyle: "rgba(255,111,97,0.5)",
            strokeStyle: "rgba(255,111,97,0.75)",
            lineStyle: {
                lineWidth: 4,
            }
        }
    });



    const tri12 = scene.add(new DefPolygon(), DefPolygon.fromPoints(points12p), {
        z: 1,
        style: {
            fillStyle: "rgba(77,175,74,0.5)",
            strokeStyle: "rgba(77,175,74,0.75)",
            lineStyle: {
                lineWidth: 4,
            }
        }
    });
    const tri20 = scene.add(new DefPolygon(), DefPolygon.fromPoints(points20p), {
        z: 1,
        style: {
            fillStyle: "rgba(58,142,186,0.5)",
            strokeStyle: "rgba(58,142,186,0.75)",
            lineStyle: {
                lineWidth: 4,
            }
        }
    });

    const e012 = scene.add(new DefFunc(compEdgeFunc), DefFunc.from({ tri }));
    const e12p = scene.add(new DefFunc(compEdgeFunc), DefFunc.from({ tri: tri12 }));
    const e20p = scene.add(new DefFunc(compEdgeFunc), DefFunc.from({ tri: tri20 }));
    const e01p = scene.add(new DefFunc(compEdgeFunc), DefFunc.from({ tri: tri01 }));

    const normalizeEdge = (info) => {
        const { e012, e } = info;
        return makeNumber(e.value / e012.value);
    };

    const u = scene.add(new DefFunc(normalizeEdge), DefFunc.from({ e012, e: e12p }));
    const v = scene.add(new DefFunc(normalizeEdge), DefFunc.from({ e012, e: e20p }));
    const w = scene.add(new DefFunc(normalizeEdge), DefFunc.from({ e012, e: e01p }));

    const sum = scene.add(new DefFunc(info => {
        const { u, v, w } = info;
        return makeNumber(u.value + v.value + w.value);
    }), DefFunc.from({ u, v, w }));

    const makeVarText = name => {
        return obj => {
            return `${name} = ${objectToString(obj)}`;
        };
    };
    const text012 = scene.add(
        new DefText({ text: makeVarText("E(v0,v1,v2)"), ref: { x: 1.5, y: 2 } }),
        DefText.fromObjectRef({ obj: e012 }), {
        style: {
            fillStyle: "rgb(0,0,0)",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                textBaseline: "bottom",
                font: "15px bold sans-serif",
            }
        }
    });

    const textU = scene.add(
        new DefText({ text: makeVarText("u"), ref: { x: 1.5, y: 1.5 } }),
        DefText.fromObjectRef({ obj: u }), {
        style: {
            fillStyle: "rgb(77,175,74)",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                textBaseline: "bottom",
                font: "15px sans-serif",
            }
        }
    });

    const textV = scene.add(
        new DefText({ text: makeVarText("v"), ref: { x: 1.5, y: 1 } }),
        DefText.fromObjectRef({ obj: v }), {
        style: {
            fillStyle: "rgb(58,142,186)",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                textBaseline: "bottom",
                font: "15px sans-serif",
            }
        }
    });


    const textW = scene.add(
        new DefText({ text: makeVarText("w"), ref: { x: 1.5, y: 0.5 } }),
        DefText.fromObjectRef({ obj: w }), {
        style: {
            fillStyle: "rgb(255,111,97)",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                textBaseline: "bottom",
                font: "15px sans-serif",
            }
        }
    });

    const textSum = scene.add(
        new DefText({ text: makeVarText("u+v+w"), ref: { x: 1.5, y: 0 } }),
        DefText.fromObjectRef({ obj: sum }), {
        style: {
            fillStyle: "rgb(0,0,0)",
            strokeStyle: "rgba(0,0,0,0)",
            textStyle: {
                textBaseline: "bottom",
                font: "15px sans-serif",
            }
        }
    });






    const mid01 = scene.add(new DefMidPoint(), DefMidPoint.fromObject(tri01), {
        z: 1,
        invisible: true,
    });

    const mid12 = scene.add(new DefMidPoint(), DefMidPoint.fromObject(tri12), {
        z: 1,
        invisible: true,

    });


    const mid20 = scene.add(new DefMidPoint(), DefMidPoint.fromObject(tri20), {
        z: 1,
        invisible: true,
    });


    const labelProps = {
        props: {
            z: -2,
            style: {
                fillStyle: "rgb(0,0,0)",
                strokeStyle: "rgba(255,255,255,1)",
                radius: 1.5,
                textStyle: {
                    font: "15px sans-serif",
                    textAlign: "center",
                    textBaseline: "alphabetic",
                    direction: "inherit",
                    fontKerning: "auto",
                },
                outline: {
                    lineWidth: 4.0,
                },
            },
        }
    };

    const merge = (target, source) => Object.assign(Object.assign({}, target), source);

    addLabel(scene, mid01, "E(v0,v1,p)", merge(labelProps, {
        offset: {
            x: 0,
            y: 0,
        },
    }));
    addLabel(scene, mid12, "E(v1,v2,p)", merge(labelProps, {
        offset: {
            x: 0.5,
            y: 0,
        },
    }));
    addLabel(scene, mid20, "E(v2,v0,p)", merge(labelProps, {
        offset: {
            x: -0.5,
            y: 0,
        },
    }));

    addLabel(scene, v0, "v0", merge(labelProps, {
        offset: {
            x: 0,
            y: -0.5,
        },
    }));
    addLabel(scene, v1, "v1", merge(labelProps, {
        offset: {
            x: 0,
            y: -0.5,
        },
    }));


    addLabel(scene, v2, "v2", merge(labelProps, {
        offset: {
            x: 0,
            y: 0.4,
        },
    }));

    addLabel(scene, p, "p", merge(labelProps, {
        offset: {
            x: 0,
            y: -0.5,
        },
    }));


    // create text to display the lengths and attach it to the corresponding midpoints
    // we will add a white outline, so the text can be read easier
    // you can see an overview of all the styling options at algeobraCanvas -> styles.geo.text
    const textStyle = {
        strokeStyle: "rgb(255,255,255)",
        fillStyle: "rgb(0,0,0)",
        outline: {
            lineWidth: 6,
        },
        textStyle: {
            font: "15px bold sans-serif",
            textAlign: "center",
        }
    };
}

export {
    makeDemo030,
    makeDemo030Solution,
    makeDemo031,
    makeDemo031Solution,
    makeDemo032,
    makeDemoBary,
}