
function indexCanvas(x, y, w, h) {
    y = h - 1 - y;
    return 4 * (x + y * w);
}

class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = new Int32Array(width * height);
    }
    static new(width, height) {
        return new Map(width, height);
    }
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    index(x, y) {
        return x + y * this.width;
    }
    at(x, y) {
        return this.grid[this.index(x, y)];
    }
    atIndex(idx) {
        return this.grid[idx];
    }

    set(val, x, y) {
        this.grid[this.index(x, y)] = val;
    }

    setIndex(val, idx) {
        this.grid[idx] = val;
    }
}

function normalize({ x, y }) {
    const l = Math.sqrt(x * x + y * y);
    return { x: x / l, y: y / l };
}
function deg2Rad(deg) {
    return deg * Math.PI / 180;
}


const colorMap = [
    { r: 255, g: 255, b: 255 },
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 255, g: 255, b: 0 },
    { r: 255, g: 0, b: 255 },
    { r: 0, g: 255, b: 255 },
]
class Cam {
    constructor(values = {}) {
        const { pos = { x: 0, y: 0 }, dir = { x: 1, y: 0 }, fov = deg2Rad(90), near = 1 } = values;
        this.pos =
            pos;
        this.dir = normalize(dir);
        this.fov = fov;
        this.near = near;
    }

    static new() {
        return new Cam(...arguments);
    }

    rotate(alpha) {
        const ca = Math.cos(alpha);
        const sa = Math.sin(alpha);

        const { x, y } = this.dir;

        this.dir = { x: (x * ca - y * sa), y: (x * sa + y * ca) };
    }

    move(t) {
        const { x, y } = this.pos;
        const { x: dx, y: dy } = this.dir;

        this.pos = { x: x + t * dx, y: y + t * dy };
    }

    planeLine() {
        const w = Math.tan(this.fov / 2) * this.near * 0.5;
        const { x: dx, y: dy } = this.dir;
        const { x, y } = this.pos;
        const lx = -dy;
        const ly = dx;

        const cx = x + this.near * dx;
        const cy = y + this.near * dy;
        const leftX = cx + lx * w;
        const leftY = cy + ly * w;

        const rightX = cx - lx * w;
        const rightY = cy - ly * w;

        return { l0: { x: leftX, y: leftY }, l1: { x: rightX, y: rightY } };
    }
}

/**
 * 
 * @param {Map} m 
 * @param {Number} p 
 */
function randomizeMap(m, p = 0.25) {
    const w = m.width;
    const h = m.height;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const r = Math.random();
            if (r > p) {
                m.set(0, x, y);
                continue;
            }
            const num = Math.min(Math.floor(Math.random() * colorMap.length), colorMap.length - 1);

            m.set(num, x, y);
        }
    }

    return m;
}

function forEach2D(obj, f) {
    const w = obj.width;
    const h = obj.height;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            f(obj, x, y);
        }
    }
}

function toGrid(x, y) {
    return [Math.floor(x), Math.floor(y)];
}

function isInside(x, y, width, height) {
    return x >= 0 && x < width && y >= 0 && y < height;
}

const INSIDE = 0;
const SIDE_X = 1;
const SIDE_Y = 2;

function dda(x0, y0, vx, vy, f) {
    let [x, y] = toGrid(x0, y0);

    const tDeltaX = Math.abs(1 / vx);
    const tDeltaY = Math.abs(1 / vy);

    let tMaxX;
    let tMaxY;
    let stepX;
    let stepY;

    // initial values
    if (vx < 0) {
        stepX = -1;
        tMaxX = (x0 - x) * tDeltaX;
    }
    else {
        stepX = 1;
        tMaxX = (x + 1 - x0) * tDeltaX;
    }

    if (vy < 0) {
        stepY = -1;
        tMaxY = (y0 - y) * tDeltaY;
    }
    else {
        stepY = 1;
        tMaxY = (y + 1.0 - y0) * tDeltaY;
    }

    let side = INSIDE;
    while (f(x, y, side)) {
        if (tMaxX < tMaxY) {
            side = SIDE_X;
            tMaxX = tMaxX + tDeltaX;
            x = x + stepX;
        } else {
            side = SIDE_Y;
            tMaxY = tMaxY + tDeltaY;
            y = y + stepY;
        }
    }

    // t value for closest hit
    const dist = side === INSIDE ? 0 : side === SIDE_X ?
        (x - x0 + Math.floor((1 - stepX) / 2)) / vx
        :
        (y - y0 + Math.floor((1 - stepY) / 2)) / vy
        ;

    return {
        p: { x, y },
        dist,
        side
    }
}

function fillBuffer({ cam = Cam.new(), map, buffer }) {
    const w = map.width;
    const h = map.height;
    const data = buffer.data;
    forEach2D(map, (id, x, y) => {
        const idx = map.index(x, y);

        const didx = indexCanvas(x, y, w, h);
        const val = map.atIndex(idx) * 255;
        data[didx] = val;
        data[didx + 1] = val;
        data[didx + 2] = val;
        data[didx + 3] = 255;
    });

    const n = w;

    const { l0, l1 } = cam.planeLine();
    const dlx = l1.x - l0.x;
    const dly = l1.y - l0.y;
    const { x: px, y: py } = cam.pos;
    for (let a = 0; a < n; a++) {

        const a0 = (a + 0.5) / n;
        const x0 = l0.x + dlx * a0;
        const y0 = l0.y + dly * a0;
        const dx = x0 - px;
        const dy = y0 - py;

        const { p: final, dist } = dda(x0, y0, dx, dy, (x, y, side) => {
            if (!isInside(x, y, w, h)) {
                return false;
            }
            const idx = map.index(x, y);

            if (map.atIndex(idx) > 0) {
                return false;
            }
            const didx = indexCanvas(x, y, w, h);
            data[didx] = 255;
            data[didx + 1] = 0;
            data[didx + 2] = 0;
            data[didx + 3] = 255;
            return true;
        });

        if (isInside(final.x, final.y, w, h)) {
            const { x: px, y: py } = final
            const idx = map.index(px, py);
            const didx = indexCanvas(px, py, w, h);
            data[didx] = 0;
            data[didx + 1] = 255 * (1 - dist / Math.max(w, h));
            data[didx + 2] = 0;
            data[didx + 3] = 255;
        }
    }

}

function flipY(y, h) {
    return h - 1 - y;
}

function fill3D({ cam = Cam.new(), map, buffer }) {
    const w = map.width;
    const h = map.height;
    const data = buffer.data;
    forEach2D(map, (id, x, y) => {
        const idx = map.index(x, y);

        const didx = indexCanvas(x, y, w, h);
        data[didx] = 0;
        data[didx + 1] = 0;
        data[didx + 2] = 0;
        data[didx + 3] = 255;
    });


    const { l0, l1 } = cam.planeLine();
    const dlx = l1.x - l0.x;
    const dly = l1.y - l0.y;
    const { x: px, y: py } = cam.pos;

    for (let a = 0; a < w; a++) {

        const a0 = (a + 0.5) / w;
        const x0 = l0.x + dlx * a0;
        const y0 = l0.y + dly * a0;
        const dx = x0 - px;
        const dy = y0 - py;

        const d = normalize({ x: dx, y: dy });
        const { p: final, dist, side } = dda(x0, y0, d.x, d.y, (x, y, side) => {
            if (!isInside(x, y, w, h)) {
                return false;
            }
            const idx = map.index(x, y);

            if (map.atIndex(idx) > 0) {
                return false;
            }
            return true;
        });

        if (!isInside(final.x, final.y, w, h)) {

            continue;
        }

        // projection of closest point onto direction
        const depth = dist + (d.x * cam.dir.x + d.y * cam.dir.y);

        const lineHeight = Math.floor(h / depth);


        const lineStart = Math.floor(Math.max(0, h / 2 - lineHeight / 2));
        const lineEnd = Math.floor(Math.min(h - 1, h / 2 + lineHeight / 2));
        const val = map.at(final.x, final.y);

        let color = colorMap[val - 1];


        if (side === SIDE_Y) {
            color = {
                r: color.r / 2,
                g: color.g / 2,
                b: color.b / 2
            };
        }

        for (let i = lineStart; i < lineEnd; i++) {

            const didx = indexCanvas(a, i, w, h);

            data[didx] = color.r;
            data[didx + 1] = color.g;
            data[didx + 2] = color.b;
        }



    }

}

window.onload = () => {
    const canvas = document.getElementById("canvas");
    const map = Map.new(150, 150);
    const offCanvas = document.createElement("canvas");
    offCanvas.width = map.width;
    offCanvas.height = map.height;
    const offCtx = offCanvas.getContext("2d");


    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const imageData = new ImageData(map.width, map.height);

    const cam = Cam.new({ pos: { x: 50, y: 50 }, fov: deg2Rad(90) });

    const moveSpeed = 5;
    const rotateSpeed = Math.PI * 2 / 5;

    let keymap = {};
    window.addEventListener("keydown", evt => {
        keymap[evt.code] = true;
    });

    window.addEventListener("keyup", evt => {
        keymap[evt.code] = false;

    });

    window.addEventListener("blur", evt => {
        keymap = {};

    });

    let last = performance.now();
    randomizeMap(map, 0.08);

    const loop = () => {

        const cur = performance.now();
        const delta = cur - last;

        const dt = delta / 1000;

        if (keymap["KeyW"]) {
            cam.move(dt * moveSpeed);
        }
        if (keymap["KeyS"]) {
            cam.move(-dt * moveSpeed);
        }

        if (keymap["KeyA"]) {
            cam.rotate(dt * rotateSpeed);
        }

        if (keymap["KeyD"]) {
            cam.rotate(-dt * rotateSpeed);
        }
        last = cur;
        fill3D({
            cam,
            map,
            buffer: imageData
        });

        offCtx.putImageData(imageData, 0, 0);

        ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);

        requestAnimationFrame(loop);
    };

    loop();
};
