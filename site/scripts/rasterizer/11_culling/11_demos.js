import { autoCompleteDummies, scriptHeader } from "../common/rasterizerEditorCommon.js";

import { makeJsEditor, FileSource } from "../../lib/editorCommon.js";

import { getTextFromUrl } from "../common/rasterizerEditorCommon.js";

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
    return `const r11 = await import("${appContext.basePath}scripts/rasterizer/11_culling/rasterizer.js");
const geomUtils = await import("${appContext.basePath}scripts/rasterizer/common/geometry_utils.js");

const {
    Rasterizer,
    Pipeline,
    Framebuffer,
    Attribute,
    Topology,
    AttributeInterpolation,
    BlendEquation,
    BlendFunction,
    Culling,
    create_depth_options,
    create_blend_options,
    create_culling_options,
} = r11;

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


async function makeDemo11Solution(containerId, appContext) {


    const scriptRasterizer = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/11_culling/editorContent/editorSolutionRasterizer.js`);

    const shadersJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/11_culling/editorContent/editorShader.js`);


    const renderingJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/11_culling/editorContent/editorRendering.js`);

    const sceneJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/11_culling/editorContent/editorScene.js`);

    const scriptOutput = `

const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

render(pipeline, raster, geoms);
imageToCtx(pipeline.framebuffer.color_buffers[0], ctx);

`;
    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptRasterizer.trim(), name: "rasterizer.js" }),
            new FileSource({ initialText: shadersJs.trim(), name: "shaders.js" }),
            new FileSource({ initialText: renderingJs.trim(), name: "rendering.js" }),
            new FileSource({ initialText: sceneJs.trim(), name: "scene.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 1,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}


async function makeDemo11(containerId, appContext) {

    const scriptRasterizer = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/11_culling/editorContent/editorExerciseRasterizer.js`);

    const shadersJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/11_culling/editorContent/editorShader.js`);


    const renderingJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/11_culling/editorContent/editorRendering.js`);

    const sceneJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/11_culling/editorContent/editorScene.js`);

    const scriptOutput = `

const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

render(pipeline, raster, geoms);
imageToCtx(pipeline.framebuffer.color_buffers[0], ctx);

`;
    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptRasterizer.trim(), name: "rasterizer.js" }),
            new FileSource({ initialText: shadersJs.trim(), name: "shaders.js" }),
            new FileSource({ initialText: renderingJs.trim(), name: "rendering.js" }),
            new FileSource({ initialText: sceneJs.trim(), name: "scene.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 1,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}


export {
    makeDemo11,
    makeDemo11Solution,
}