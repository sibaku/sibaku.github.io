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
const r11 = await import("${appContext.basePath}scripts/rasterizer/11_culling/rasterizer.js");
const geomUtils = await import("${appContext.basePath}scripts/rasterizer/common/geometry_utils.js");

const {
    Attribute,
    Topology,
    Rasterizer,
    Pipeline,
    Framebuffer,
    BlendEquation,
    BlendFunction,
    AttributeInterpolation,
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

async function makeDemoPlayground(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/playground/editorContent0/editorShaders.js`);
    const script1 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/playground/editorContent0/editorRendering.js`);
    const script2 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/playground/editorContent0/editorScene.js`);

    const scriptOutput = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/playground/editorContent0/editorOutput.js`);

    const hiddenIncludes = makehHiddenIncludes(appContext);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: hiddenIncludes.trim(), name: "preScript.js", show: false }),
            new FileSource({ initialText: script0.trim(), name: "shaders.js" }),
            new FileSource({ initialText: script1.trim(), name: "rendering.js" }),
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
    makeDemoPlayground,
};