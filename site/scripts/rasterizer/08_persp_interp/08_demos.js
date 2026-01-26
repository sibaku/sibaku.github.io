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
    return `
const r08 = await import("${appContext.basePath}scripts/rasterizer/08_persp_interp/rasterizer.js");
const geomUtils = await import("${appContext.basePath}scripts/rasterizer/common/geometry_utils.js");

const {
    Rasterizer,
    Pipeline,
    Framebuffer,
    Attribute,
    Topology,
    create_depth_options,
} = r08;

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


async function makeDemo080(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/08_persp_interp/editorContent0/editorExerciseRasterizer.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/08_persp_interp/editorContent0/editorShaders.js`);

    const script2 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/08_persp_interp/editorContent0/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/08_persp_interp/editorContent0/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "rasterizer.js" }),
            new FileSource({ initialText: script1.trim(), name: "shaders.js" }),
            new FileSource({ initialText: script2.trim(), name: "scene.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 1,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}

async function makeDemo080Solution(containerId, appContext) {

   const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/08_persp_interp/editorContent0/editorSolutionRasterizer.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/08_persp_interp/editorContent0/editorShaders.js`);

    const script2 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/08_persp_interp/editorContent0/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/08_persp_interp/editorContent0/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "rasterizer.js" }),
            new FileSource({ initialText: script1.trim(), name: "shaders.js" }),
            new FileSource({ initialText: script2.trim(), name: "scene.js" }),
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
    makeDemo080,
    makeDemo080Solution,
};