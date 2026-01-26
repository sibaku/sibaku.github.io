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
const r01 = await import("${appContext.basePath}scripts/rasterizer/01_drawing_lines/rasterizer.js");
const geomUtils = await import("${appContext.basePath}scripts/rasterizer/common/geometry_utils.js");

const {
    Rasterizer,
    Pipeline,
    Framebuffer,   
    Attribute,
    Topology,
} = r01;

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

async function makeDemo010Solution(containerId, appContext) {


    const scriptRasterizer = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent0/editorSolutionRasterizer.js`);

    const sceneJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent0/editorScene.js`);

    const scriptOutput = `

const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
  raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

`;
    const hiddenIncludes = makehHiddenIncludes(appContext);
    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptRasterizer.trim(), name: "rasterizer.js" }),
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


async function makeDemo010(containerId, appContext) {

    const scriptRasterizer = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent0/editorExerciseRasterizer.js`);

    const sceneJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent0/editorScene.js`);

    const scriptOutput = `
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
  raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

`;
    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptRasterizer.trim(), name: "rasterizer.js" }),
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


async function makeDemo011Solution(containerId, appContext) {


    const scriptRasterizer = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent1/editorSolutionRasterizer.js`);

    const sceneJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent1/editorScene.js`);

    const scriptOutput = `

const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
  raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

`;
    const hiddenIncludes = makehHiddenIncludes(appContext);
    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptRasterizer.trim(), name: "rasterizer.js" }),
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


async function makeDemo011(containerId, appContext) {

    const scriptRasterizer = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent1/editorExerciseRasterizer.js`);

    const sceneJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent1/editorScene.js`);

    const scriptOutput = `
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
    raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

`;
    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptRasterizer.trim(), name: "rasterizer.js" }),
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

async function makeDemo012Solution(containerId, appContext) {


    const scriptRasterizer = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent2/editorSolutionRasterizer.js`);

    const sceneJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent2/editorScene.js`);

    const scriptOutput = `

const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
  raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

`;
    const hiddenIncludes = makehHiddenIncludes(appContext);
    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptRasterizer.trim(), name: "rasterizer.js" }),
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


async function makeDemo012(containerId, appContext) {

    const scriptRasterizer = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent2/editorExerciseRasterizer.js`);

    const sceneJs = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/01_drawing_lines/editorContent2/editorScene.js`);

    const scriptOutput = `
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
    raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

`;
    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: scriptRasterizer.trim(), name: "rasterizer.js" }),
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
    makeDemo010,
    makeDemo010Solution,
    makeDemo011,
    makeDemo011Solution,
    makeDemo012,
    makeDemo012Solution,
}