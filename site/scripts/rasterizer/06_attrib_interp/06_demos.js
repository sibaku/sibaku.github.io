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
const r06 = await import("${appContext.basePath}scripts/rasterizer/06_attrib_interp/rasterizer.js");
const geomUtils = await import("${appContext.basePath}scripts/rasterizer/common/geometry_utils.js");

const {
    Rasterizer,
    Pipeline,
    Framebuffer,
    Attribute,
    Topology,
} = r06;

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

async function makeDemo060(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent0/editorExerciseInterpolate.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent0/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent0/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "interpolate.js" }),
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

async function makeDemo060Solution(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent0/editorSolutionInterpolate.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent0/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent0/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "interpolate.js" }),
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


async function makeDemo061(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent1/editorExerciseRasterizer.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent1/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent1/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "interpolate.js" }),
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

async function makeDemo061Solution(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent1/editorSolutionRasterizer.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent1/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent1/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "interpolate.js" }),
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


async function makeDemo062(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent2/editorExerciseRasterizer.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent2/editorExerciseShaders.js`);

    const script2 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent2/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent2/editorOutput.js`);

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

async function makeDemo062Solution(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent2/editorSolutionRasterizer.js`);

    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent2/editorSolutionShaders.js`);

    const script2 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent2/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/06_attrib_interp/editorContent2/editorOutput.js`);

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
    makeDemo060,
    makeDemo060Solution,
    makeDemo061,
    makeDemo061Solution,
    makeDemo062,
    makeDemo062Solution,
};