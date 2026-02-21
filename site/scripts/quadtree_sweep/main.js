
import {
    vadd,
    vsub,
    vscale,
    vfloor,
    vmin,
    vmax,
    len2,
    normalize,
} from "./simple_vector.js"

import {
    AABB,
    intersectAABB,
    sweepAABB,
    QuadNode,
    createQuadtree,
    intersectQuadtrees,
    sweepQuadtrees,
    drawQuadtree,
    drawQuadtreeBounds,
} from "./collisions.js"

import {
    Grid,
    setValues,
    drawGrid,
    FREESPACE,
    OBSTACLE,
} from "./grid.js";



// current input state
// we only use it for mouse state here
class InputState {
    lastMousePos = [-1, -1];
    mousePos = [-1, -1];
    mouseDown = false;
    first = false;
}

// helper for mouse events on a canvas
class StateMouseEvent {
    event;
    inputState;
    constructor(event, inputState) {
        this.event = event;
        this.inputState = inputState;
    }
}



// state variables
const MODE_INTERSECT = 0;
const MODE_SWEEP = 1;

const OBJECTS_RECTANGLES = 0;
const OBJECTS_RECTANGLE_QUADTREE = 1;
const OBJECTS_QUADTREES = 2;


class DrawObjectUpdateEvent {
    source;
    updateBounds;
}


// colors for the different objects
const COLOR_OBJ_A = {
    fillStyle: "rgba(255, 0, 123, 1)",
    strokeStyle: "rgba(0,0,0,0)",
};

const COLOR_OBJ_B = {
    fillStyle: "rgba(0,255,255,1)",
    strokeStyle: "rgba(0,0,0,0)",
};

const COLOR_OBJ_TARGET = {
    fillStyle: "rgba(0,255,0,0.5)",
    strokeStyle: "rgba(0,0,0,0)",
};
const COLOR_OBJ_BLOCKED = {
    fillStyle: "rgba(0,0,255,0.5)",
    strokeStyle: "rgba(0,0,0,0)",
};

const COLOR_POINT = {
    fillStyle: "rgba(131, 131, 131, 1)",
    strokeStyle: "rgba(0,0,0,1)",
};

const COLOR_ARROW = {
    fillStyle: "rgba(131, 131, 131, 1)",
    strokeStyle: "rgba(0,0,0,1)",
};

const COLOR_COLLISION = {
    fillStyle: "rgba(255, 196, 0, 1)",
    strokeStyle: "rgba(0,0,0,1)",
};

// sizes of drawing primitives
const POINT_RADIUS = 4;
const ARROW_LEN = 10;
const ARROW_WIDTH = 10;

// scaling of grids for the canvas
const canvasScale = 5;
const drawCanvasScale = 8;


// main function
function run() {

    //---------------------------------
    // html elements
    //---------------------------------
    const canvas = document.getElementById("canvas");
    const canvasDrawTarget = document.getElementById("canvasDrawTarget");
    const canvasDrawObject = document.getElementById("canvasDrawObject");

    const checkEraser = document.getElementById("eraser");
    const checkShowLevels = document.getElementById("showLevels");

    const sliderSize = document.getElementById("size");
    const labelSize = document.getElementById("sizeLabel");

    const sliderTreeLevelA = document.getElementById("sliderLevelA");
    const labelTreeLevelA = document.getElementById("levelLabelA");

    const sliderTreeLevelB = document.getElementById("sliderLevelB");
    const labelTreeLevelB = document.getElementById("levelLabelB");


    const selectMode = document.getElementById("selectMode");
    const selectObjects = document.getElementById("selectObjects");


    //---------------------------------
    // create data and connect to html controls
    //---------------------------------

    // how much to grid is scaled to display


    // main grid
    // not really used, but one could add an additional "big" drawing for the environment
    // for now its just so we can reuse some code...
    const grid = new Grid(32 * 3, 64);


    // we resize the canvas so it fits the scaled grid
    canvas.width = grid.w * canvasScale;
    canvas.height = grid.h * canvasScale;

    // for drawing
    const ctx = canvas.getContext("2d");

    // the two objects that can be drawn
    const ctxA = canvasDrawTarget.getContext("2d");
    const ctxB = canvasDrawObject.getContext("2d");

    // draw state
    const drawOptions = {
        drawValue: OBSTACLE,
        drawSize: 0,
    }

    let drawQuadtreeLevels = false;


    // the grids and quadtrees for the two objects that can be drawn
    const gridA = new Grid(32, 32);
    const gridB = new Grid(32, 32);

    const maxSizeA = Math.max(gridA.w, gridA.h);
    const maxGridLevelA = Math.ceil(Math.log2(maxSizeA));

    const maxSizeB = Math.max(gridB.w, gridB.h);
    const maxGridLevelB = Math.ceil(Math.log2(maxSizeB));

    let quadA = null;
    let quadB = null;


    // state for the display

    let sceneMode = MODE_INTERSECT;
    let objectMode = OBJECTS_QUADTREES;


    // indices to handle mouse movement and such
    const OBJECT_A = 0;
    const OBJECT_B = 1;
    const OBJECT_TARGET = 2;

    // initial offsets for the objects
    let offsets = Array.from(Array(3));
    offsets[OBJECT_A] = [40, 30];
    offsets[OBJECT_B] = [16, 30];
    offsets[OBJECT_TARGET] = [80, 30];

    // with this we can disable mouse dragging of the positions
    // for example, intersect doesn't have a target
    const enabled = Array.from(Array(3));
    enabled[OBJECT_A] = true;
    enabled[OBJECT_B] = true;
    enabled[OBJECT_TARGET] = true;

    // the two base rectangles are defined here
    const rx = 3;
    const ry = 2;
    const r = [rx, ry];

    const bbb = new AABB(vsub(vscale(r, -1), [0.5, 0.5]), vadd(r, [0.5, 0.5]));
    const bba = new AABB([-2.5, -4.5], [2 + 0.5, 4 + 0.5]);

    // to make intent clear for transforming a center position to object 
    // grid starts at the top left
    const getOriginFromCenterGrid = (center, grid) => {
        return vsub(center, [grid.w * 0.5, grid.h * 0.5]);
    };
    // aabb has its origin at the center, so it aligns with the offset
    const getOriginFromCenterAABB = (center, aabb) => {
        return center;
    }

    // for changing the level of the quadtree
    let maxLevelA = -1;
    let maxLevelB = -1;
    const treeLevelLineWidth = 2;
    const drawTree = (tree, offset, maxLevel) => {
        drawQuadtree(tree, ctx, offset, canvasScale, maxLevel);
        if (drawQuadtreeLevels) {
            drawQuadtreeBounds(tree, ctx, offset, canvasScale, { lineWidth: treeLevelLineWidth });
        }
    };

    // update all
    const updateFullCanvas = () => {
        clearCanvas(ctx);

        const offsetA = offsets[OBJECT_A];
        const offsetB = offsets[OBJECT_B];
        const targetB = offsets[OBJECT_TARGET];

        // these are just the different states of which objects are used and how they interact
        if (sceneMode === MODE_SWEEP) {

            if (objectMode === OBJECTS_QUADTREES) {
                ctx.save();

                const origA = getOriginFromCenterGrid(offsetA, gridA);
                const origB = getOriginFromCenterGrid(offsetB, gridB);
                const origTarget = getOriginFromCenterGrid(targetB, gridB);

                const offsetBA = vsub(origB, origA);

                Object.assign(ctx, COLOR_OBJ_A);
                drawTree(quadA, origA, maxLevelA);
                Object.assign(ctx, COLOR_OBJ_B);
                drawTree(quadB, origB, maxLevelB);

                const centerA = offsetA;
                const centerB = offsetB;
                const centerTarget = targetB;



                Object.assign(ctx, COLOR_OBJ_TARGET);
                drawQuadtree(quadB, ctx, origTarget, canvasScale, maxLevelB);

                const { sweep: sweepResult, objects: sweepObjects } = sweepQuadtrees(quadA, quadB, offsetBA, vsub(origTarget, origB), {
                    maxLevelA,
                    maxLevelB,
                });

                const offSweep = sweepResult.move;

                Object.assign(ctx, COLOR_OBJ_BLOCKED);
                drawQuadtree(quadB, ctx, vadd(origB, offSweep), canvasScale, maxLevelB);

                if (sweepObjects !== null) {
                    Object.assign(ctx, COLOR_COLLISION);
                    const node = sweepObjects[0];
                    drawAABB(node.bounds, ctx, origA, canvasScale);

                }

                Object.assign(ctx, COLOR_POINT);
                drawPoint(centerA, POINT_RADIUS, ctx, canvasScale);
                drawPoint(centerB, POINT_RADIUS, ctx, canvasScale);
                drawPoint(centerTarget, POINT_RADIUS, ctx, canvasScale);

                Object.assign(ctx, COLOR_ARROW);
                drawArrow(centerB, centerTarget, ARROW_LEN, ARROW_WIDTH, ctx, canvasScale);

                ctx.restore();
            } else if (objectMode === OBJECTS_RECTANGLES) {

                const origA = getOriginFromCenterAABB(offsetA, bba);
                const origB = getOriginFromCenterAABB(offsetB, bbb);
                const origTarget = getOriginFromCenterAABB(targetB, bbb);


                const offsetBA = vsub(origB, origA);

                Object.assign(ctx, COLOR_OBJ_A);
                drawAABB(bba, ctx, origA, canvasScale);
                Object.assign(ctx, COLOR_OBJ_B);
                drawAABB(bbb, ctx, origB, canvasScale);

                Object.assign(ctx, COLOR_OBJ_TARGET);
                drawAABB(bbb, ctx, origTarget, canvasScale);



                const rayDir = vsub(origTarget, origB);
                const sweepResult = sweepAABB(bba, bbb, offsetBA, rayDir);

                ctx.save();

                Object.assign(ctx, COLOR_OBJ_BLOCKED);
                drawAABB(bbb, ctx, vadd(offsetB, sweepResult.move), canvasScale);

                ctx.restore();

                ctx.save();
                Object.assign(ctx, COLOR_POINT);
                drawPoint(offsetA, POINT_RADIUS, ctx, canvasScale);
                drawPoint(offsetB, POINT_RADIUS, ctx, canvasScale);
                drawPoint(targetB, POINT_RADIUS, ctx, canvasScale);

                Object.assign(ctx, COLOR_ARROW);
                drawArrow(offsetB, targetB, ARROW_LEN, ARROW_WIDTH, ctx, canvasScale);

                ctx.restore();

            }
            else if (objectMode === OBJECTS_RECTANGLE_QUADTREE) {
                ctx.save();

                const origA = getOriginFromCenterGrid(offsetA, gridA);
                const origB = getOriginFromCenterAABB(offsetB, bbb);
                const origTarget = getOriginFromCenterAABB(targetB, bbb);

                const offsetBA = vsub(origB, origA);

                Object.assign(ctx, COLOR_OBJ_A);
                drawTree(quadA, origA, maxLevelA);
                Object.assign(ctx, COLOR_OBJ_B);
                drawAABB(bbb, ctx, origB, canvasScale);
                Object.assign(ctx, COLOR_OBJ_TARGET);
                drawAABB(bbb, ctx, origTarget, canvasScale);


                const rayDir = vsub(origTarget, origB);

                // we encode the aabb as a quadtree node, makes it easier
                const testNode = new QuadNode();
                testNode.leaf = true;
                testNode.level = 0;
                testNode.bounds = bbb;




                const { sweep: sweepResult, objects: sweepObjects } = sweepQuadtrees(quadA, testNode, offsetBA, rayDir, {
                    maxLevelA,
                    maxLevelB: - 1,
                });

                const offSweep = sweepResult.move;

                Object.assign(ctx, COLOR_OBJ_BLOCKED);
                drawAABB(bbb, ctx, vadd(origB, offSweep), canvasScale);

                if (sweepObjects !== null) {
                    Object.assign(ctx, COLOR_COLLISION);
                    const node = sweepObjects[0];
                    drawAABB(node.bounds, ctx, origA, canvasScale);

                }


                Object.assign(ctx, COLOR_POINT);
                drawPoint(offsetA, POINT_RADIUS, ctx, canvasScale);
                drawPoint(offsetB, POINT_RADIUS, ctx, canvasScale);
                drawPoint(targetB, POINT_RADIUS, ctx, canvasScale);

                Object.assign(ctx, COLOR_ARROW);
                drawArrow(offsetB, targetB, ARROW_LEN, ARROW_WIDTH, ctx, canvasScale);

                ctx.restore();

            }
        } else if (sceneMode === MODE_INTERSECT) {
            if (objectMode === OBJECTS_QUADTREES) {
                ctx.save();

                const origA = getOriginFromCenterGrid(offsetA, gridA);
                const origB = getOriginFromCenterGrid(offsetB, gridB);

                const offsetBA = vsub(origB, origA);

                Object.assign(ctx, COLOR_OBJ_A);
                drawTree(quadA, origA, maxLevelA);

                Object.assign(ctx, COLOR_OBJ_B);
                drawTree(quadB, origB, maxLevelB);

                ctx.save();
                Object.assign(ctx, COLOR_POINT);
                drawPoint(offsetA, POINT_RADIUS, ctx, canvasScale);
                drawPoint(offsetB, POINT_RADIUS, ctx, canvasScale);

                ctx.restore();

                const intersections = intersectQuadtrees(quadA, quadB, offsetBA, {
                    maxLevelA,
                    maxLevelB,
                });

                Object.assign(ctx, COLOR_COLLISION);
                for (const i of intersections) {
                    const node = i[0];
                    drawAABB(node.bounds, ctx, origA, canvasScale);
                }
                ctx.restore();

            } else if (objectMode === OBJECTS_RECTANGLES) {
                ctx.save();

                const origA = getOriginFromCenterAABB(offsetA, bba);
                const origB = getOriginFromCenterAABB(offsetB, bbb);

                const offsetBA = vsub(origB, origA);

                const inter = intersectAABB(bba, bbb, offsetBA);

                Object.assign(ctx, COLOR_OBJ_A);
                drawAABB(bbb, ctx, origA, canvasScale);

                if (inter) {
                    Object.assign(ctx, COLOR_COLLISION);

                } else {
                    Object.assign(ctx, COLOR_OBJ_B);

                }
                drawAABB(bba, ctx, origB, canvasScale);


                Object.assign(ctx, COLOR_POINT);
                drawPoint(offsetA, POINT_RADIUS, ctx, canvasScale);
                drawPoint(offsetB, POINT_RADIUS, ctx, canvasScale);


                ctx.restore();


            } else if (objectMode === OBJECTS_RECTANGLE_QUADTREE) {
                ctx.save();

                const origA = getOriginFromCenterGrid(offsetA, gridA);
                const origB = getOriginFromCenterAABB(offsetB, bbb);

                const offsetBA = vsub(origB, origA);

                Object.assign(ctx, COLOR_OBJ_A);
                drawTree(quadA, origA, maxLevelA);
                Object.assign(ctx, COLOR_OBJ_B);
                drawAABB(bbb, ctx, origB, canvasScale);




                // we encode the aabb as a quadtree node, makes it easier
                const testNode = new QuadNode();
                testNode.leaf = true;
                testNode.level = 0;
                testNode.bounds = bbb;


                const intersections = intersectQuadtrees(quadA, testNode, offsetBA, {
                    maxLevelA,
                    maxLevelB: -1,
                });


                Object.assign(ctx, COLOR_COLLISION);
                for (const i of intersections) {
                    const node = i[0];
                    drawAABB(node.bounds, ctx, origA, canvasScale);
                }

                ctx.save();
                Object.assign(ctx, COLOR_POINT);
                drawPoint(offsetA, POINT_RADIUS, ctx, canvasScale);
                drawPoint(offsetB, POINT_RADIUS, ctx, canvasScale);

                ctx.restore();

                ctx.restore();
            }

        }
    };


    // dragging the offsets
    let selectedIndex = -1;
    addMouseEvents(canvas, (e) => {
        const { inputState } = e;

        const posGrid = vscale(inputState.mousePos, 1 / canvasScale);

        if (inputState.mouseDown && inputState.first) {
            let d2 = Infinity;
            let ic = -1;

            for (let i = 0; i < offsets.length; i++) {
                if (!enabled[i]) {
                    continue;
                }
                const d2i = len2(vsub(offsets[i], posGrid));
                if (d2i < d2) {
                    d2 = d2i;
                    ic = i;
                }
            }

            if (ic >= 0 && d2 < 15 * 15) {
                selectedIndex = ic;
            }
        }

        if (!inputState.mouseDown) {
            selectedIndex = -1;
        }
        if (selectedIndex >= 0) {
            offsets[selectedIndex] = posGrid;
        }

        updateFullCanvas();

    })

    setupDrawCanvas(ctxA, gridA, drawCanvasScale, drawOptions, () => {
        quadA = createQuadtree(gridA);
        updateFullCanvas();
    });
    setupDrawCanvas(ctxB, gridB, drawCanvasScale, drawOptions, () => {
        quadB = createQuadtree(gridB);
        updateFullCanvas();
    });

    //---------------------------------
    // button and other ui interactions
    //---------------------------------

    sliderSize.oninput = () => {
        const v = parseInt(sliderSize.value);
        drawOptions.drawSize = v;
        labelSize.innerText = v;
    };
    sliderSize.oninput();

    sliderTreeLevelA.max = maxGridLevelA;
    sliderTreeLevelA.value = maxGridLevelA;
    sliderTreeLevelA.oninput = () => {
        const v = parseInt(sliderTreeLevelA.value);
        maxLevelA = v;
        labelTreeLevelA.innerText = v;

        updateFullCanvas();
    };

    sliderTreeLevelB.max = maxGridLevelB;
    sliderTreeLevelB.value = maxGridLevelB;
    sliderTreeLevelB.oninput = () => {
        const v = parseInt(sliderTreeLevelB.value);
        maxLevelB = v;
        labelTreeLevelB.innerText = v;
        updateFullCanvas();
    };

    sliderTreeLevelA.oninput();
    sliderTreeLevelB.oninput();

    checkEraser.checked = false;

    checkEraser.onchange = () => {
        drawOptions.drawValue = checkEraser.checked ? FREESPACE : OBSTACLE;
    };


    checkShowLevels.checked = drawQuadtreeLevels;
    checkShowLevels.onchange = () => {
        drawQuadtreeLevels = checkShowLevels.checked;
        updateFullCanvas();
    };


    const modeList = [
        {
            name: "Sweep",
            value: MODE_SWEEP
        },
        {
            name: "Intersect",
            value: MODE_INTERSECT
        },
    ];

    const objectList = [
        {
            name: "Quadtrees",
            value: OBJECTS_QUADTREES
        },
        {
            name: "Rectangle + Quadtree",
            value: OBJECTS_RECTANGLE_QUADTREE
        },
        {
            name: "Rectangles",
            value: OBJECTS_RECTANGLES
        },
    ]

    selectMode.onchange = () => {
        sceneMode = parseInt(selectMode.options[selectMode.selectedIndex].value);

        enabled[OBJECT_TARGET] = sceneMode === MODE_SWEEP;
        updateFullCanvas();
    };

    selectObjects.onchange = () => {
        objectMode = parseInt(selectObjects.options[selectObjects.selectedIndex].value);

        updateFullCanvas();
    };


    for (let i = 0; i < modeList.length; i++) {
        const mi = modeList[i];

        const opt = document.createElement("option");
        opt.name = mi.name;
        opt.value = mi.value;
        opt.innerText = mi.name;
        selectMode.append(opt);
    }
    selectMode.selectedIndex = 0;
    selectMode.onchange();

    for (let i = 0; i < objectList.length; i++) {
        const oi = objectList[i];

        const opt = document.createElement("option");
        opt.name = oi.name;
        opt.value = oi.value;
        opt.innerText = oi.name;
        selectObjects.append(opt);
    }
    selectObjects.selectedIndex = 0;
    selectObjects.onchange();



    // shortcuts
    document.addEventListener("keydown", e => {
        if (e.key === "e") {
            checkEraser.checked = !checkEraser.checked;
            checkEraser.onchange();
        } else if (e.key === "r") {
            checkRunning.checked = !checkRunning.checked;
        } else if (e.key === "a") {
            let cur = parseInt(sliderSize.value);
            cur = Math.max(cur - 1, 0);
            sliderSize.value = cur;
            sliderSize.oninput();
        } else if (e.key === "s") {
            let cur = parseInt(sliderSize.value);
            cur = Math.min(cur + 1, parseInt(sliderSize.max));
            sliderSize.value = cur;
            sliderSize.oninput();
        }
    });



}

window.addEventListener("load", run);

//---------------------------------
// Draw helpers
//---------------------------------
function clearCanvas(ctx) {
    ctx.save();
    // we fill instead of clear to make the colors shine through better
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
};

function drawAABB(aabb, ctx, offset, scale) {
    const x0 = (offset[0] + aabb.min[0]) * scale;
    const y0 = (offset[1] + aabb.min[1]) * scale;

    ctx.fillRect(x0, y0, aabb.delta[0] * scale, aabb.delta[1] * scale);
    ctx.strokeRect(x0, y0, aabb.delta[0] * scale, aabb.delta[1] * scale);
}

function drawPoint(pos, radius, ctx, scale) {
    ctx.beginPath();
    ctx.arc(pos[0] * scale, pos[1] * scale, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawLine(p0, p1, ctx, scale) {
    ctx.beginPath();
    ctx.moveTo(...vscale(p0, scale));
    ctx.lineTo(...vscale(p1, scale));
    ctx.stroke();
}

function drawArrow(p0, p1, lenPx, widthPx, ctx, scale) {
    ctx.beginPath();
    ctx.moveTo(...vscale(p0, scale));
    ctx.lineTo(...vscale(p1, scale));
    ctx.stroke();

    const d = normalize(vsub(p1, p0));
    const n = [-d[1], d[0]];
    const tip = vscale(p1, scale);
    // head
    const amid = vsub(tip, vscale(d, lenPx));

    const a0 = vadd(amid, vscale(n, widthPx));
    const a1 = vsub(amid, vscale(n, widthPx));

    ctx.beginPath();
    ctx.moveTo(...a0);
    ctx.lineTo(...tip);
    ctx.lineTo(...a1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

}


//---------------------------------
// Setup helpers
//---------------------------------
// helper to get the mouse position inside an element
function getMousePos(event, element) {
    const rect = element.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    return [mouseX, mouseY];
}


// simple helper to add mouse events for easy clicking to a canvas
function addMouseEvents(canvas, mouseCallback) {
    const input = new InputState();

    const mousemove = (e) => {
        const pos = getMousePos(e, canvas);

        input.lastMousePos = input.mousePos;
        input.mousePos = pos;
        input.first = false;

        mouseCallback(new StateMouseEvent(e, input));

    }

    const mousedown = (e) => {
        // don't do anything on right click
        if (e.button === 2) {
            return;
        }
        input.mouseDown = true;
        const pos = getMousePos(e, canvas);
        input.lastMousePos = input.mousePos;
        input.mousePos = pos;
        input.first = true;

        mouseCallback(new StateMouseEvent(e, input));

    }

    const mouseup = (e) => {
        input.mouseDown = false;
        input.lastMousePos = input.mousePos;
        input.mousePos = [-1, -1];
        input.first = false;

        mouseCallback(new StateMouseEvent(e, input));

    }

    const mouseleave = (e) => {
        input.mouseDown = false;
        input.lastMousePos = input.mousePos;
        input.mousePos = [-1, -1];
        input.first = false;

        mouseCallback(new StateMouseEvent(e, input));
    }

    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mouseleave", mouseleave);
}



function setupDrawCanvas(ctx, grid, gridScale, options, updateCallback) {

    const { canvas } = ctx;

    canvas.width = grid.w * gridScale;
    canvas.height = grid.h * gridScale;

    const updateCanvas = () => {
        ctx.save();
        drawGrid(grid, ctx, [0, 0], gridScale);
        ctx.restore();
    }

    clearCanvas(ctx);
    updateCanvas();

    const drawPen = (pos) => {
        if (pos[0] >= 0 && pos[1] >= 0 && pos[0] < grid.w && pos[1] < grid.h) {
            // outline
            const r = options.drawSize;
            const w = 2 * r + 1;
            const x0 = (pos[0] - r) * gridScale;
            const y0 = (pos[1] - r) * gridScale;

            ctx.save();
            ctx.strokeStyle = "rgb(255,20,20)";
            ctx.strokeWidth = 2;
            ctx.strokeRect(x0, y0, w * gridScale, w * gridScale);

            ctx.restore();
        }
    }

    const canvasCallback = (e) => {
        const { inputState } = e;
        const posGrid = vfloor(vscale(inputState.mousePos, 1 / gridScale));

        clearCanvas(ctx);
        if (inputState.mouseDown) {

            setValues(grid, posGrid[0], posGrid[1], options.drawValue, options.drawSize);

            const ur = grid.drawSize + 1;

            let bmin = [posGrid[0] - ur, posGrid[1] - ur];
            let bmax = [posGrid[0] + ur + 1, posGrid[1] + ur + 1];

            bmin = vmax(bmin, [0, 0]);
            bmax = vmin(bmax, [grid.w, grid.h]);

            const event = new DrawObjectUpdateEvent();
            event.source = grid;
            event.updateBounds = new AABB(bmin, bmax);
            updateCallback(event);

        }
        updateCanvas();

        drawPen(posGrid);
    };

    addMouseEvents(canvas, canvasCallback);
}

