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
const r02 = await import("${appContext.basePath}scripts/rasterizer/02_clipping_lines/rasterizer.js");
const geomUtils = await import("${appContext.basePath}scripts/rasterizer/common/geometry_utils.js");

const {
    Rasterizer,
    Pipeline,
    Framebuffer,    
    Attribute,
    Topology,
} = r02;

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


async function makeDemo020Solution(containerId, appContext) {


    const scriptDefines = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent0/editorDefines.js`);

    const script = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent0/editorSolutionRegionCode.js`);

    const fillImage = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent0/editorFillImage.js`);

    const scriptOutput = `
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

imageToCtx(img,ctx);

`;
    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptDefines.trim(), name: "defines.js" }),
            new FileSource({ initialText: script.trim(), name: "regionCode.js" }),
            new FileSource({ initialText: fillImage.trim(), name: "fillImage.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 2,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}


async function makeDemo020(containerId, appContext) {

    const scriptDefines = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent0/editorDefines.js`);

    const script = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent0/editorExerciseRegionCode.js`);

    const fillImage = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent0/editorFillImage.js`);

    const scriptOutput = `
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

imageToCtx(img,ctx);

`;
    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptDefines.trim(), name: "defines.js" }),
            new FileSource({ initialText: script.trim(), name: "regionCode.js" }),
            new FileSource({ initialText: fillImage.trim(), name: "fillImage.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 2,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}


async function makeDemo021Solution(containerId, appContext) {

    const scriptDefines = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent1/editorDefines.js`);

    const script = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent1/editorSolutionRasterizer.js`);

    const scene = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent1/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent1/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptDefines.trim(), name: "defines.js" }),
            new FileSource({ initialText: script.trim(), name: "rasterizer.js" }),
            new FileSource({ initialText: scene.trim(), name: "scene.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 2,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}


async function makeDemo021(containerId, appContext) {

    const scriptDefines = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent1/editorDefines.js`);

    const script = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent1/editorExerciseRasterizer.js`);

    const scene = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent1/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/02_clipping_lines/editorContent1/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptDefines.trim(), name: "defines.js" }),
            new FileSource({ initialText: script.trim(), name: "rasterizer.js" }),
            new FileSource({ initialText: scene.trim(), name: "scene.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 2,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}




export {
    makeDemo020,
    makeDemo020Solution,
    makeDemo021,
    makeDemo021Solution,
}