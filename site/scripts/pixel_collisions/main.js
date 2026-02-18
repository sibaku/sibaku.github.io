//---------------------------------
// Notes:
// The following isn't highly optimized, but hopefully easy to read for that reason
// There won't be full library-grade documentation, but there will be comments explaining the code, where it might not be clear what is meant
//
// Notes on filters:
// All the operations on grids/images will be constrained to inside the image region. Be aware, that in general image processing, there are various ways to handle this
//---------------------------------

//---------------------------------
// Basic vector functions
// All 2D vectors are represented by a simple array [x,y]
//---------------------------------

// dot product
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}

function vadd(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function vsub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}

// scales a vector by scalar (a number)
function vscale(a, s) {
    return [a[0] * s, a[1] * s];
}

// applies the floor operation to each vector component
function vfloor(a) {
    return [Math.floor(a[0]), Math.floor(a[1])];
}
// applies the ceil operation to each vector component

function vceil(a) {
    return [Math.ceil(a[0]), Math.ceil(a[1])];
}

// computes the squared length
function len2(a) {
    return a[0] * a[0] + a[1] * a[1];
}

// computes the length
function len(a) {
    return Math.sqrt(len2(a));
}

// normalizes a vector (vector divided by its length)
// AS A CONVENTION TO MAKE THINGS EASIER HERE: If the vector is approximately zero, the zero vectors is returned
function normalize(a) {
    const l2 = len2(a);
    // checks if its approximately zero: 1E-7 is a shorthand for 0.0000001
    if (l2 < 1E-7) {
        return [0, 0];
    }
    return vscale(a, 1 / Math.sqrt(l2));
}

// reflect a vector along a normal
// you can find this formula at various places, for example here: https://www.sunshine2k.de/articles/coding/vectorreflection/vectorreflection.html
function reflect(i, n) {
    // r = i - 2(dot(i,n))n
    return vsub(i, vscale(n, 2 * dot(i, n)));
}

// maps a value x in the range [0,1] to the range [a,b], that is 0 is mapped to a and 1 is mapped to b
function linMap(x, a, b) {
    return x * (b - a) + a;
}

// maps a value x in [a,b] to the range [0,1], that is a is mapped to 0 and b is mapped to 1
function invLinMap(x, a, b) {
    return (x - a) / (b - a);
}

// generate a random number in the range [a,b)
function linRand(a, b) {
    return Math.random() * (b - a) + a;
}

// Simple class to hold the data for a ball: position and velocity
class Ball {
    pos = [0, 0];
    vel = [0, 0];

    constructor(pos = [0, 0], vel = [0, 0]) {
        this.pos = pos;
        this.vel = vel;
    }

}

// State of the tool
// mostly only holds data, other functions operate on it
class State {
    // width of grid
    w = 0;
    // height of grid
    h = 0;
    // will hold the binary grid values
    grid = null;
    // will hold the normals
    normals = null;

    // current balls
    balls = [];

    // simple gravity, in units of the grid
    // javascript canvas has y pointing downward. To not do coordinate transforms, we just go with that, so gravity is positive in y, meaning down
    gravity = [0, 10];
    // current simulation time
    time = 0;
    // scale of simulation
    timeScale = 1;

    // filters for x and y direction to compute normals
    filters = [
        Filter.sharrX(),
        Filter.sharrY(),
    ]

    // creates a state with a given size
    constructor(w, h) {
        this.w = w;
        this.h = h;

        // grids are layed out linearly in memory in a rowwise order
        // so the first row with w entries are all entries [x,0] with x = 0,..., w-1.
        // afterwards the second row starts
        // we use binary, so unsigned 8 bit is fine
        this.grid = new Uint8Array(w * h);
        // normals can point in any direction, so here we use floats
        // each normal has two components, which are stored next to each other
        this.normals = new Float32Array(2 * w * h);
    }

    // get the binary grid value
    value(x, y) {
        return this.grid[x + y * this.w];
    }
    // set the binary grid value
    setValue(x, y, v) {
        // compute the linear index from 2D x,y
        this.grid[x + y * this.w] = v;
        return this;
    }

    // get a normal
    normal(x, y) {
        // compute the linear index from 2D x,y
        // we must also scale it by two, since each normal has two components
        const idx = 2 * (x + y * this.w);
        const normals = this.normals;

        return [normals[idx + 0], normals[idx + 1]];
    }

    // set a normal
    setNormal(x, y, n) {
        // compute the linear index from 2D x,y
        // we must also scale it by two, since each normal has two components
        const idx = 2 * (x + y * this.w);
        const normals = this.normals;
        normals[idx + 0] = n[0];
        normals[idx + 1] = n[1];
        return this;
    }

    addBall(b) {
        this.balls.push(b);
    }
    clearBalls() {
        this.balls = [];
    }

    removeBall(b) {
        const idx = this.balls.findIndex(b);
        if (idx < 0) {
            this.balls.splice(idx, 1);
        }
    }
}

// updates the simulation with a delta time (time since last update)
function updateSim(state, dt) {
    // scale the delta time
    dt = dt * state.timeScale;
    state.time += dt;

    const { balls, gravity } = state;

    // no balls to simulate, return
    if (balls.length < 1) {
        return false;
    }

    // simple implicit euler integration
    for (let i = 0; i < balls.length; i++) {
        const bi = balls[i];
        // new velocity due to acceleration. Here, acceleration is only due to gravity
        bi.vel = vadd(bi.vel, vscale(gravity, dt));
        // update position based on velocity
        bi.pos = vadd(bi.pos, vscale(bi.vel, dt));
    }

    // simple collision
    // we only check the center, not the full shape
    for (let i = 0; i < balls.length; i++) {
        const bi = balls[i];
        // this is the ball's position in integer grid coordinates
        // the balls can move continuously through the grid, but our entries are at integer positions only
        const pg = vfloor(bi.pos);

        // get the value of our binary grid in the cell we are at
        const v = state.value(pg[0], pg[1]);

        // no obstacle, we can continue
        if (v === 0) {
            continue;
        }
        // get the normal at the position
        const n = state.normal(pg[0], pg[1]);

        // "how much does the velocity point in the normal direction"
        const d = dot(bi.vel, n);
        // velocity and normal point in the same half space -> the ball is moving away from the boundary -> no collision
        if (d > 0) {
            continue;
        }

        // we could also take the pixel center and the normal to define a plane to compute the ball intersection with that plane instead of just using the binary grid, but for simplicity, we won't do that here

        // reflect velocity along the normal
        // very simple handling that always produces a perfect reflection
        // can easily augmented with something like the restitution coefficient
        const r = reflect(bi.vel, n);
        // "simulates" energy loss due to the collision
        // just a bit of a hack to reduce bouncing a bit
        bi.vel = vscale(r, 0.75);

        // simple push back
        // basically, we put a circle around the grid pixel center
        // we push the ball in the normal direction with a value proportional to its distance to the pixel center
        const center = [pg[0] + 0.5, pg[1] + 0.5];
        const rel = vsub(bi.pos, center);
        // we don't move to full amount as that would look a bit jiggly, instead we remove only a part of the intersection
        // if the ball keeps intersecting, this will keep triggering, preventing the ball from falling
        const pushBack = 0.01 * len(rel);
        bi.pos = vadd(bi.pos, vscale(n, pushBack));

    }

    // remove balls that are outside
    // we iterate from the back so we can safely remove entries in the array
    for (let i = balls.length - 1; i >= 0; i--) {
        const bi = balls[i];

        const [x, y] = bi.pos;

        // check if outside
        if (x < 0 || y < 0 || x >= state.w || y >= state.h) {
            balls.splice(i, 1);
        }
    }
    return true;
}

// draw the balls
function drawBalls(state, ctx, options) {
    const { balls } = state;

    ctx.save();
    ctx.fillStyle = "rgba(255, 4, 217, 1)";
    ctx.strokeStyle = "rgb(50,50,50)";

    const { scale } = options;
    const sh = 0.45 * scale;

    for (let i = 0; i < balls.length; i++) {
        const bi = balls[i];

        const p = vscale(bi.pos, scale);
        ctx.beginPath();
        ctx.arc(p[0], p[1], sh, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();
}

// set values in the grid around a given position with a radius
function setValues(state, x, y, v, r = 1) {

    // compute the valid range of our drawing rectangle
    // we make sure it doesn't go below 0 or past the width/height
    const xmin = Math.max(x - r, 0);
    const ymin = Math.max(y - r, 0);

    const xmax = Math.min(x + r, state.w - 1);
    const ymax = Math.min(y + r, state.h - 1);

    const g = state.grid;
    // iterate through the rectangle and set values in the grid
    for (let yp = ymin; yp <= ymax; yp++) {
        for (let xp = xmin; xp <= xmax; xp++) {
            state.setValue(xp, yp, v);
        }
    }
}

// compute the normals of a all grid pixels in a given region
// we do it this way, so we can update only the region around a drawing operation and not recompute the whole grid
function computeNormals(state, x0, y0, wn, hn) {

    const { w, h, normals } = state;

    // compute the valid range of our rectangle
    // we make sure it doesn't go below 0 or past the width/height
    const xmin = Math.max(x0, 0);
    const ymin = Math.max(y0, 0);

    const xmax = Math.min(x0 + wn, w - 1);
    const ymax = Math.min(y0 + hn, h - 1);


    // go through and set pixels
    for (let y = ymin; y <= ymax; y++) {
        for (let x = xmin; x <= xmax; x++) {
            const n = computeNormal(state, x, y);
            state.setNormal(x, y, n);
        }
    }
}

// simple filter class to switch between different gradient computation methods
class Filter {
    // filter radius in x
    rx = 0;
    // filter radius in y
    ry = 0;
    // filter width = 2*rx + 1
    w = 0;
    // filter height = 2*ry + 1
    h = 0;

    // filter data in row-major layout (same as the grid)
    data = null;

    constructor(rx, ry, data) {
        this.rx = rx;
        this.ry = ry;
        this.data = data;

        this.w = 2 * rx + 1;
        this.h = 2 * ry + 1;
    }

    // get the filter weight at a a position x (from range [0,w-1]) and y (from range [0,h-1])
    weight(x, y) {
        return this.data[x + y * this.w];
    }

    // get the filter weight for simmetric indices, with the central value having coordinats (i,j) = (0,0)
    weightSymmetricIndex(i, j) {
        const x = i + this.rx;
        const y = j + this.ry;
        return this.weight(x, y);
    }

    // create Sobel filter for x direction
    static sobelX() {
        return new Filter(1, 1, [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ]);
    }

    // create Sobel filter for y direction
    static sobelY() {
        return new Filter(1, 1, [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ]);
    }

    // create Sharr filter for x direction
    static sharrX() {
        return new Filter(1, 1, [
            -47, 0, 47,
            -162, 0, 162,
            -47, 0, 47,
        ]);
    }
    // create Sharr filter for y direction
    static sharrY() {
        return new Filter(1, 1, [
            -47, -162, -47,
            0, 0, 0,
            47, 162, 47
        ]);
    }
    // create basic 1D filter for x direction
    static derivX() {
        return new Filter(1, 0, [-1, 0, 1]);
    }
    // create basic 1D filter for y direction
    static derivY() {
        return new Filter(0, 1, [-1, 0, 1]);
    }
}

// computes the filter value at position (x,y) for the given data
function computeFilter(data, dw, dh, filter, x, y) {
    const { rx, ry } = filter;

    // compute the valid range of our filter rectangle
    // we make sure it doesn't go below 0 or past the width/height
    const xmin = Math.max(x - rx, 0);
    const ymin = Math.max(y - ry, 0);

    const xmax = Math.min(x + rx, dw - 1);
    const ymax = Math.min(y + ry, dh - 1);

    // accumulate the filter values
    let sum = 0;

    for (let yp = ymin; yp <= ymax; yp++) {
        // this is the index in the filter
        // since we clipped the filter region to inside the grid, we comput the filter index as current position - unclipped starting position.
        // if the filter rectangle is fully in the grid, then (xmin,ymin) is the unclipped starting position, so (xi,yi) will start at (0,0) as expected
        // this won't change in the inner loop, so we take it outside
        const yi = yp - (y - ry);
        for (let xp = xmin; xp <= xmax; xp++) {
            // we access the data, we could also just have passed the state and used the accessor
            const v = data[xp + dw * yp];
            // same as above with yi
            const xi = xp - (x - rx);

            // each value in the rectangle is weighted by the corresponding filter value
            sum += filter.weight(xi, yi) * v;
        }
    }

    return sum;

}

// computes the normal at a position
function computeNormal(state, x, y) {
    const { w, h, grid } = state;

    // we apply the gradient filters for the x and then the y direction
    // this is just a technical detail, but in our grid we use 0 for free and 1 for obstacles
    // the gradient points in the direction of greatest change, thus it will point "towards" the obstacle
    // this is easily fixed by just flipping around the values (= negating both coordinates)
    // if we used 1 for free and 0 for obstacles, we could just use the values
    let sumX = -computeFilter(grid, w, h, state.filters[0], x, y);
    let sumY = -computeFilter(grid, w, h, state.filters[1], x, y);

    // all non-boundary pixels will have 0 for both sumX and sumY

    // return the normalized gradient, which is our boundary normal
    // ATTENTION: PER OUR CONVENTION, AN APPROXIMATELY ZERO VECTOR WILL BE SET TO ZERO. Therefore non-boundary regions will just be zero
    return normalize([sumX, sumY]);

}

// draw the grid
function drawGrid(state, ctx, scale) {
    ctx.save();

    for (let y = 0; y < state.h; y++) {
        for (let x = 0; x < state.w; x++) {
            const v = state.value(x, y);
            if (v === 0) {
                continue;
            }

            const x0 = x * scale;
            const y0 = y * scale;

            ctx.fillRect(x0, y0, scale, scale);
        }
    }

    ctx.restore();
}

// helper to get the mouse position inside an element
function getMousePos(event, element) {
    const rect = element.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    return [mouseX, mouseY];
}

// options for what to draw
class DrawOptions {
    drawGrid = true;
    drawNormalDirections = true;
    normalSubsample = 2;
    drawBalls = true;
    scale = 10;
    drawSize = 0;

    constructor({
        drawGrid = true,
        drawNormalDirections = true,
        normalSubsample = 1,
        scale = 10,
        drawBalls = true,
        drawSize = 0,
    } = {}) {
        this.drawGrid = drawGrid;
        this.drawNormalDirections = drawNormalDirections;
        this.normalSubsample = normalSubsample;
        this.scale = scale;
        this.drawBalls = drawBalls;
        this.drawSize = drawSize;
    }
}

// draw normals as a small circle with a line sticking out
function drawNormals(state, ctx, scale, normalSubsample) {
    ctx.save();
    ctx.strokeStyle = "rgba(159, 159, 220, 1)";
    ctx.fillStyle = "rgb(178,178,178)";
    const sh = 0.5 * scale;

    for (let y = 0; y < state.h; y += normalSubsample) {
        for (let x = 0; x < state.w; x += normalSubsample) {
            const n = state.normal(x, y);
            const l2 = len2(n);
            if (l2 < 1E-7) {
                continue;
            }

            const x0 = x * scale;
            const y0 = y * scale;

            const cx = x0 + sh;
            const cy = y0 + sh;

            ctx.beginPath();
            ctx.arc(cx, cy, 0.25 * sh, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + sh * n[0], cy + sh * n[1]);
            ctx.stroke();

        }
    }

    ctx.restore();
}

// draw all things depending on the drawing options
function drawAll(state, ctx, options, input) {
    const { canvas } = ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (options.drawGrid) {
        drawGrid(state, ctx, options.scale);
    }

    if (options.drawNormalDirections) {
        drawNormals(state, ctx, options.scale, options.normalSubsample)
    }

    if (options.drawBalls) {
        drawBalls(state, ctx, options);
    }


    const mpos = input.mousePos;
    // grid pos
    const posGrid = vfloor(vscale(mpos, 1 / options.scale));

    if (posGrid[0] >= 0 && posGrid[1] >= 0 && posGrid[0] < state.w && posGrid[1] < state.h) {
        // outline
        const r = state.drawSize;
        const w = 2 * r + 1;
        const x0 = (posGrid[0] - r) * options.scale;
        const y0 = (posGrid[1] - r) * options.scale;

        ctx.save();
        ctx.strokeStyle = "rgb(255,20,20)";
        ctx.strokeWidth = 2;
        ctx.strokeRect(x0, y0, w * options.scale, w * options.scale);
        ctx.restore();
    }

}

// current input state
// we only use it for mouse state here
class InputState {
    mousePos = [-1, -1];
    mouseDown = false;
}

// fomatter to display numbers as string with specified precision
const numFormatter = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 2 });

// main function
function run() {

    //---------------------------------
    // html elements
    //---------------------------------
    const container = document.getElementById("demoContainer");

    const canvas = document.getElementById("canvas");

    const checkRunning = document.getElementById("running");
    const checkEraser = document.getElementById("eraser");

    const sliderSpeed = document.getElementById("speed");
    const labelSpeed = document.getElementById("simSpeedLabel");

    const sliderSize = document.getElementById("size");
    const labelSize = document.getElementById("sizeLabel");

    const buttonSpawnBall = document.getElementById("spawnBall");
    const buttonClearBalls = document.getElementById("clearBalls");
    const buttonClearGrid = document.getElementById("clearGrid");


    const checkDrawGrid = document.getElementById("drawGrid");
    const checkDrawNormals = document.getElementById("drawNormals");
    const checkDrawBalls = document.getElementById("drawBalls");

    const selectFilter = document.getElementById("selectFilter");


    //---------------------------------
    // create data and connect to html controls
    //---------------------------------

    // how much to grid is scaled to display
    // each grid cell will take up scale pixels on the canvas
    const scale = 15;

    const state = new State(40, 40);
    state.addBall(new Ball([10, 1]));
    state.addBall(new Ball([15, 1]));
    state.addBall(new Ball([20, 1]));

    // intially compute all normals, not stricly necessary, but if we add some default fields above, the normals will be here
    computeNormals(state, 0, 0, state.w, state.h);

    // we resize the canvas so it fits the scaled grid
    canvas.width = state.w * scale;
    canvas.height = state.h * scale;

    // for drawing
    const ctx = canvas.getContext("2d");

    const input = new InputState();

    // used to determine, if the canvas needs to be redrawn
    let needsDrawUpdate = true;

    const options = new DrawOptions({
        scale,
    });

    //---------------------------------
    // mouse interaction
    //---------------------------------

    // sets values around the canvas pixel size in the grid
    const brush = (posCanvas) => {
        const posGrid = vfloor(vscale(posCanvas, 1 / options.scale));

        setValues(state, posGrid[0], posGrid[1], checkEraser.checked ? 0 : 1, state.drawSize);

        const ur = state.drawSize + 1;
        computeNormals(state, posGrid[0] - ur, posGrid[1] - ur, 2 * ur + 1, 2 * ur + 1);

        needsDrawUpdate = true;

    };

    canvas.addEventListener("mousemove", (e) => {
        const pos = getMousePos(e, canvas);
        input.mousePos = pos;

        if (input.mouseDown) {
            brush(pos);

        }

        needsDrawUpdate = true;

    });

    canvas.addEventListener("mousedown", (e) => {
        // don't do anything on right click
        if (e.button === 2) {
            return;
        }
        input.mouseDown = true;
        const pos = getMousePos(e, canvas);
        brush(pos);


    });
    canvas.addEventListener("mouseup", (e) => {
        input.mouseDown = false;

    });


    //---------------------------------
    // button and other ui interactions
    //---------------------------------

    buttonClearBalls.onclick = () => {
        state.clearBalls();
        needsDrawUpdate = true;
    };
    buttonSpawnBall.onclick = () => {
        // spawn a random ball at the top
        state.addBall(new Ball([linRand(2, state.w - 2), 1], [linRand(-10, 10), linRand(0, 4)]));
        needsDrawUpdate = true;
    };
    buttonClearGrid.onclick = () => {
        // reset all values in the grid and then update all normals
        for (let i = 0; i < state.grid.length; i++) {
            state.grid[i] = 0;
        }
        computeNormals(state, 0, 0, state.w, state.h);

        needsDrawUpdate = true;
    };

    sliderSpeed.oninput = () => {
        const v = parseFloat(sliderSpeed.value);

        const v01 = invLinMap(v, 0, 100);
        const speed = linMap(v01, 0, 2);
        state.timeScale = speed;
        labelSpeed.innerText = numFormatter.format(speed);
    };

    sliderSpeed.oninput();

    sliderSize.oninput = () => {
        const v = parseInt(sliderSize.value);
        state.drawSize = v;
        labelSize.innerText = v;
        needsDrawUpdate = true;
    };

    sliderSize.oninput();

    checkDrawGrid.onchange = () => {
        options.drawGrid = checkDrawGrid.checked;
        needsDrawUpdate = true;
    };

    checkDrawNormals.onchange = () => {
        options.drawNormalDirections = checkDrawNormals.checked;
        needsDrawUpdate = true;

    };
    checkDrawBalls.onchange = () => {
        options.drawBalls = checkDrawBalls.checked;
        needsDrawUpdate = true;
    };


    // generate list of current filters
    const filterList = [
        {
            name: "Sharr",
            filters: [
                Filter.sharrX(),
                Filter.sharrY(),
            ]
        },
        {
            name: "Sobel",
            filters: [
                Filter.sobelX(),
                Filter.sobelY(),
            ]
        },
        {
            name: "Basic Central",
            filters: [
                Filter.derivX(),
                Filter.derivY(),
            ]
        },
        {
            name: "Basic right",
            filters: [
                new Filter(1, 0, [0, -1, 1]),
                new Filter(0, 1, [0, -1, 1]),
            ]
        },
        {
            name: "Basic left",
            filters: [
                new Filter(1, 0, [-1, 1, 0]),
                new Filter(0, 1, [-1, 1, 0]),
            ]
        },
    ];

    for (let i = 0; i < filterList.length; i++) {
        const fi = filterList[i];
        const opt = document.createElement("option");
        opt.name = fi.name;
        opt.value = i;
        opt.innerText = fi.name;
        selectFilter.append(opt);
    }

    selectFilter.selectedIndex = 0;

    selectFilter.onchange = () => {
        // when a filter is changed, we must update all normals with this filter
        state.filters = filterList[selectFilter.selectedIndex].filters;
        computeNormals(state, 0, 0, state.w, state.h);
        needsDrawUpdate = true;
    };

    checkRunning.checked = false;
    checkEraser.checked = false;

    checkDrawGrid.checked = true;
    checkDrawNormals.checked = true;
    checkDrawBalls.checked = true;

    // shortcuts
    document.addEventListener("keydown", e => {
        if (e.key === "e") {
            checkEraser.checked = !checkEraser.checked;
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


    //---------------------------------
    // update simulation and draw
    //---------------------------------

    let lastTick = performance.now();
    const update = () => {
        const now = performance.now();
        const delta = (now - lastTick) / 1000;
        lastTick = now

        // only update, if it's running
        if (checkRunning.checked) {
            // if balls have been updated, we also need a draw update
            needsDrawUpdate |= updateSim(state, Math.min(delta, 1 / 240));
        }

        // nothing to change -> try again later
        if (!needsDrawUpdate) {
            window.requestAnimationFrame(update);
            return;
        }

        drawAll(state, ctx, options, input);

        needsDrawUpdate = false;

        window.requestAnimationFrame(update);
    };

    update();

}

window.addEventListener("load", run);