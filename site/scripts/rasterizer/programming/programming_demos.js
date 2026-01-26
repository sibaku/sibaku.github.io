import { autoCompleteDummies, scriptHeader } from "../common/rasterizerEditorCommon.js";

import { makeJsEditor, FileSource } from "../../lib/editorCommon.js";

import { getTextFromUrl } from "../common/rasterizerEditorCommon.js";



async function makeJSMProgramming(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/programming/editorContent1/editorScript.js`);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: script0.trim(), name: "script.js" }),
        ],
        openFileIndex: 0,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: false,
    });
}


async function makeInitialProgramming(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/programming/editorContent0/editorScript.js`);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: script0.trim(), name: "script.js" }),
        ],
        openFileIndex: 0,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: false,
    });
}

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


async function makeImageProgramming(containerId, appContext) {

    const script0 = await getTextFromUrl(`${appContext.basePath}scripts/rasterizer/programming/editorContent2/editorScript.js`);

    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: script0.trim(), name: "script.js" }),
        ],
        openFileIndex: 0,
        autocompleteObjects: autoCompleteDummies,
        populateOutputContainerBeforeRun: populateWithCanvas,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}




export {
    makeJSMProgramming,
    makeInitialProgramming,
    makeImageProgramming,
};