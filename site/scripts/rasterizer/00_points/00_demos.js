import { autoCompleteDummies, scriptHeader } from "../common/rasterizerEditorCommon.js";

import { makeJsEditor, FileSource } from "../../lib/editorCommon.js";

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
async function makeDemo00(containerId, appContext) {


    const script1 = `
const img = PixelImage.zeroUI8C(300,300,4);

// define the three points p_0, p_1 and p_2 in an array
const points = [
  vec2(10,10),
  vec2(img.w - 10, 30),
  vec2(img.w/3, img.h - 10)
];

// how often do we repeat the process?
const n = 5000;

// start with p = p_0
let p = points[0];

// repeat
for(let i = 0; i < n; i++)
{
  // *******************************
  // TODO 
  // *******************************
  // update the point p

  // set the x,y coordinate given by the new point to white
  // important: coordinates are integers, so we floor the coordinates when accessing the image
  img.set(vec4(1,1,1,1),Math.floor(p.at(0)), Math.floor(p.at(1)));
}
`;

    const scriptOutput = `

const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

imageToCtx(img,ctx);
`;
    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: script1.trim(), name: "script.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 0,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}


async function makeDemo00Solution(containerId, appContext) {


    const script1 = `
const img = PixelImage.zeroUI8C(300,300,4);

// define the three points p_0, p_1 and p_2 in an array
const points = [
  vec2(10,10),
  vec2(img.w - 10, 30),
  vec2(img.w/3, img.h - 10)
];

// how often do we repeat the process?
const n = 5000;

// start with p = p_0
let p = points[0];

// repeat
for(let i = 0; i < n; i++)
{
    // choose a random point
    // generate random number between 0 and 1 (exclusive)
    // scale random number so it is between 0 an points.length 
    // floor the result to be an integer to use for the array access

    const idx = Math.floor(Math.random()*points.length);
    const pi = points[idx];
    // find mid point between current point and chosen one
    // this is the formula 1//2 * (p + p_i)
    p = scale(add(p,pi),0.5);

    // set the x,y coordinate given by the new point to white
    // important: coordinates are integers, so we floor the coordinates when accessing the image
    img.set(vec4(1,1,1,1),Math.floor(p.at(0)), Math.floor(p.at(1)));
}
`;

    const scriptOutput = `

const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

imageToCtx(img,ctx);
`;
    await makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: script1.trim(), name: "script.js" }),
            new FileSource({ initialText: scriptOutput.trim(), name: "output.js", editable: false }),
        ],
        openFileIndex: 0,
        populateOutputContainerBeforeRun: populateWithCanvas,
        autocompleteObjects: autoCompleteDummies,
        runHeaderCode: scriptHeader,
        enableContent: true,
    });
}


export {
    makeDemo00,
    makeDemo00Solution,
}