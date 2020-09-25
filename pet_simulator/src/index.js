// THIS CODE IS TERRIBLE, LOOK AT IT AT YOUR OWN RISK

// Started as a small test how raycasting works and turned into this somehow...

function indexCanvas(x, y, w, h) {
    y = h - 1 - y;
    return 4 * (x + y * w);
}

// Fisher-Yates shuffle
function shuffle(a) {
    const n = a.length;
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        const temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
}


class Map {
    constructor(width, height, type = Int32Array) {
        this.width = width;
        this.height = height;
        this.grid = new type(width * height);
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

    isValid(pos) {
        const { x, y } = pos;
        const [rx, ry] = [Math.floor(x), Math.floor(y)];
        if (!isInside(rx, ry, this.width, this.height)) {
            return false;
        }

        const v = this.at(rx, ry);

        return v === 0;


    }
}

function normalize({ x, y }) {
    const l = Math.sqrt(x * x + y * y);
    return { x: x / l, y: y / l };
}
function deg2Rad(deg) {
    return deg * Math.PI / 180;
}



const imageMap = [];
const spriteMap = [];
const handMap = [];

class Cam {
    constructor(values = {}) {
        const { pos = { x: 0, y: 0 }, dir = { x: 1, y: 0 }, fov = deg2Rad(90), near = 1 } = values;
        this.pos =
            pos;
        this.dir = normalize(dir);
        this.fov = fov;
        this.near = near;
        this.planeHalfLength = Math.tan(this.fov / 2) * this.near * 0.5;
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

    move(t, checkPosition) {
        const { x, y } = this.pos;
        const { x: dx, y: dy } = this.dir;
        const newPos = { x: x + t * dx, y: y + t * dy };
        this.pos = checkPosition ? checkPosition(newPos) ? newPos : this.pos : newPos;
    }


    planeLine() {
        const w = this.planeHalfLength;
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

    const randTex = () => Math.min(Math.floor(Math.random() * imageMap.length), imageMap.length - 1) + 1;
    for (let x = 0; x < w; x++) {
        m.set(randTex(), x, 0);
        m.set(randTex(), x, h - 1);
    }
    for (let y = 1; y < h - 1; y++) {
        m.set(randTex(), 0, y);
        m.set(randTex(), w - 1, y);
    }

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const r = Math.random();
            if (r > p) {
                m.set(0, x, y);
                continue;
            }
            const num = randTex();
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


function fill3D({ cam = Cam.new(), map, buffer, ctx, sprites, zbuffer }) {
    const w = buffer.width;
    const h = buffer.height;
    const data = buffer.data;

    const aspect = w / h;

    const camW = cam.planeHalfLength;
    const camH = camW / aspect;
    const { l0, l1 } = cam.planeLine();
    const dlx = l1.x - l0.x;
    const dly = l1.y - l0.y;
    const { x: px, y: py } = cam.pos;
    const { x: camDirx, y: camDiry } = cam.dir;
    // compute sprite projections
    for (let i = 0; i < sprites.length; i++) {
        const s = sprites[i];
        const { pos: spritePos } = s;
        // relative position
        const rx = spritePos.x - px;
        const ry = spritePos.y - py;
        // get depth as projection onto direction
        const imgZ = rx * camDirx + ry * camDiry;
        // project onto 1d image plane by using right side normal
        const imgX = rx * camDiry - ry * camDirx;

        s.posRelative = { x: rx, y: ry };
        s.imgX = imgX;
        s.imgZ = imgZ;

    }

    sprites.sort((a, b) => b.imgZ - a.imgZ);


    for (let y = 0; y < h / 2; y++) {
        const yt = (Math.floor(h / 2) - y) / (h / 2);
        const dz = -yt * camH;

        const dx = l0.x - px;
        const dy = l0.y - py;
        const t = -0.5 / dz;

        const stepX = t * dlx / w;
        const stepY = t * dly / w;

        const fx = px + t * dx;
        const fy = py + t * dy;

        for (let x = 0; x < w; x++) {

            const xx = fx + (x + 0.5) * stepX;
            const yy = fy + (x + 0.5) * stepY;

            const mx = Math.floor(xx);
            const my = Math.floor(yy);

            const v = (Math.abs(mx) + Math.abs(my)) % 2;
            // floor
            const floorColor = Math.min(1, (v * 0.5 + 0.5) * 1.25) * 255
            const didx = indexCanvas(x, y, w, h);
            data[didx] = floorColor;
            data[didx + 1] = floorColor;
            data[didx + 2] = floorColor;
            data[didx + 3] = 255;

            // ceiling
            const didx2 = indexCanvas(x, h - 1 - y, w, h);
            data[didx2] = 135;
            data[didx2 + 1] = 206;
            data[didx2 + 2] = 253;
            data[didx2 + 3] = 255;
        }

    }

    ctx.putImageData(buffer, 0, 0);

    ctx.save();
    // for darkening
    // can be set once here, since the walls only use drawimage
    ctx.fillStyle = "rgba(0,0,0,0.4)";

    for (let a = 0; a < w; a++) {

        // initial depth value
        zbuffer[a] = Infinity;
        const a0 = (a + 0.5) / w;
        const x0 = l0.x + dlx * a0;
        const y0 = l0.y + dly * a0;
        const dx = x0 - px;
        const dy = y0 - py;

        const { p: final, dist, side } = dda(px, py, dx, dy, (x, y) => {
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
        const depth = dist * (dx * cam.dir.x + dy * cam.dir.y);

        zbuffer[a] = depth;
        const val = map.at(final.x, final.y);

        const img = imageMap[val - 1];
        const tx = side === SIDE_Y ? px + dist * dx : py + dist * dy;
        const txF = tx - Math.floor(tx);

        const texel = Math.floor(img.width * txF);
        const lineHeight = Math.floor(cam.near * h / depth / (2 * camH));
        const lineStart = Math.floor(h / 2 - lineHeight / 2);

        ctx.drawImage(img, texel, 0, 1, img.height, a, lineStart, 1, lineHeight);
        if (side === SIDE_Y) {
            ctx.fillRect(a, lineStart, 1, lineHeight);
        }
    }

    // draw sprites

    for (let i = 0; i < sprites.length; i++) {
        const s = sprites[i];

        // x value to screen
        const { imgX, imgZ } = s;

        if (imgZ < 0) {
            continue;
        }
        // map to screen with pinhole model
        const projX = imgX / imgZ * cam.near / camW;
        // if (Math.abs(projX) > 1) {
        //     continue;
        // }

        // const screenX = Math.min(w - 1, Math.max(0, Math.floor((projX * 0.5 + 0.5) * w)));
        // const sH = h / imgZ * s.scale.y;
        // const sW = h / imgZ * s.scale.x;

        // const leftX = Math.floor(screenX - sW / 2);
        // const rightX = Math.min(w - 1, leftX + sW);

        const screenX = Math.floor((projX * 0.5 + 0.5) * w);

        const maxSize = h / imgZ;
        const sH = Math.floor(maxSize * s.scale.y);
        const sW = Math.floor(maxSize * s.scale.x);

        let leftX = Math.floor(screenX - sW / 2);
        let rightX = leftX + sW;

        // check if sprite is inside
        if (leftX >= w || rightX < 0) {
            continue;
        }
        leftX = Math.max(0, leftX);
        rightX = Math.min(w, rightX);

        const yFloor = (h / 2) - maxSize / 2;
        const yCeil = yFloor + maxSize;
        const yDelta = yCeil - yFloor;

        const y = yFloor + yDelta * 0.5 * (1 + s.yOffset) - sH / 2;
        const yStart = Math.max(yFloor, y);
        const yEnd = Math.min(yCeil, y + sH);

        if (yStart > yCeil || yEnd < yFloor) {
            continue;
        }

        const tBeginY = (yStart - y) / sH;
        const tEndY = (yEnd - y) / sH;

        const tBeginX = (leftX - (screenX - sW / 2)) / sW;
        const tEndX = (rightX - (screenX - sW / 2)) / sW;

        const yH = yEnd - yStart;

        const spriteTex = spriteMap[s.texIndex];

        const texLeft = Math.floor(tBeginX * spriteTex.width);
        const texDeltaX = (tEndX - tBeginX) / (rightX - leftX) * spriteTex.width;

        const texBottom = Math.max(0,
            Math.floor(spriteTex.height - 1 - Math.min(spriteTex.height - 1, tEndY * spriteTex.height)));
        const texHeight = Math.min(spriteTex.height - 1, Math.floor((tEndY - tBeginY) * spriteTex.height));

        ctx.save();
        for (let xi = leftX; xi < rightX; xi++) {

            if (imgZ > zbuffer[xi]) {
                continue;
            }
            ctx.fillStyle = "rgba(255,255,0,1)";

            // ctx.fillRect(xi, h - 1 - yFloor, 1, yCeil - yStart);
            ctx.fillStyle = "rgba(0,255,0,0.3)";
            const tx0 = Math.min(spriteTex.width - 1, Math.floor(texLeft + (xi - leftX) * texDeltaX));
            ctx.drawImage(spriteTex,
                tx0, texBottom,
                1, texHeight,
                xi, h - 1 - yEnd,
                1, yH);
            // ctx.fillRect(xi, h - 1 - yEnd, 1, yH);
        }

        ctx.restore();

    }


    ctx.restore();
}


function drawHUD({ ctx, gameState }) {

    const size = 0.15;
    const { canvas } = ctx;
    const { width, height } = canvas;

    const textSize = Math.floor(width * size);
    const text = `Joy: ${gameState.joy}`;
    const xOffset = Math.max(1, 0.05 * width);
    const yOffset = Math.max(1, 0.01 * height);
    ctx.save();
    ctx.font = `${textSize}px Sans-serif`;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.strokeText(text, xOffset, yOffset + textSize);
    ctx.fillStyle = 'white';
    ctx.fillText(text, xOffset, yOffset + textSize);

    ctx.restore();
}

function findFree(map, x, y, radius = 1) {

    const results = [];
    for (let j = -radius; j <= radius; j++) {
        for (let i = -radius; i <= radius; i++) {
            if (i === 0 && j === 0) {
                continue;
            }
            const px = x + i;
            const py = y + j;
            const point = { x: px, y: py };
            if (map.isValid(point)) {
                results.push(point);
            }
        }
    }

    return results;
}
class WanderAround {
    constructor({ speed = 0.1, waitTime = 2 }) {
        this.speed = speed;
        this.waitTime = waitTime;
        this.currentWaitTime = 0;
        this.state = 0;
        this.nextPos = null;
        this.dir = null;
    }

    update({ dt, sprite, map }) {
        const { x, y } = sprite.pos;
        if (this.state === 0) {
            // choose next position
            const rx = Math.floor(x);
            const ry = Math.floor(y);
            const nextPositions = findFree(map, rx, ry, 1);
            if (nextPositions.length === 0) {
                this.state = -1;
                return;
            }
            const nextPos = nextPositions[Math.floor(Math.random() * nextPositions.length)];
            this.nextPos = { x: nextPos.x + 0.5, y: nextPos.y + 0.5 };
            this.dir = normalize({ x: this.nextPos.x - x, y: this.nextPos.y - y });
            this.state = 1;
        }
        else if (this.state === 1) {
            const { x: nextX, y: nextY } = this.nextPos;
            const { x: vx, y: vy } = this.dir;

            const dx = nextX - x;
            const dy = nextY - y;

            const dot = dx * vx + dy * vy;
            if (dot < 0) {
                // stepped over point
                this.state = 2;
            } else {
                sprite.pos = { x: x + vx * dt * this.speed, y: y + vy * dt * this.speed };
            }
        }
        else if (this.state === 2) {
            this.currentWaitTime += dt;
            if (this.currentWaitTime > this.waitTime) {
                this.currentWaitTime = 0;
                this.state = 0;
            }
        }

    }
}
class HeartAnimation {
    constructor({ target = null, maxTime = 5, speed = 0.2, amplitude = 0.5, finishedCallback }) {
        this.maxTime = maxTime;
        this.speed = speed;
        this.currentTime = 0;
        this.amplitude = amplitude;
        this.init = true;
        this.initPos = { x: 0, y: 0 };
        this.target = target;
        this.finishedCallback = finishedCallback;
    }
    update({ dt, sprite, cam }) {
        this.currentTime += dt;
        if (this.currentTime > this.maxTime) {
            if (this.finishedCallback) {
                this.finishedCallback();
            }
            return true;
        }
        if (this.init) {
            this.initPos = Object.assign({}, sprite.pos);

            this.init = false;
        }
        let { x, y } = this.initPos;

        x += Math.sin(this.currentTime * this.speed * 2 * Math.PI) * this.amplitude;
        // y += Math.sin(Math.PI + this.currentTime * this.speed * 2 * Math.PI) * this.amplitude;

        if (this.target) {
            x += this.target.pos.x;
            y += this.target.pos.y;
        }

        const { x: offsetx, y: offsety } = normalize({ x: cam.pos.x - x, y: cam.pos.y - y });
        x += offsetx * 0.3;
        y += offsety * 0.3;
        sprite.pos.x = x;
        sprite.pos.y = y;
        sprite.yOffset += dt * this.speed;
        return false;
    }
}

function calcTextsize(ctx, maxWidth, text) {
    ctx.save();
    ctx.font = "1px Sans-serif";
    let measure = ctx.measureText(text);
    ctx.restore();

    return Math.floor(maxWidth / measure.width);
}

function drawSplashScreen({ ctx, gameState }) {
    ctx.save();
    ctx.fillStyle = 'black';

    const { canvas } = ctx;
    const { width, height } = canvas;

    ctx.fillRect(0, 0, width, height);

    let text = 'Pet simulator';


    let yOffset = Math.max(1, 0.05 * height);

    const writeText = (text, maxSize) => {
        let textSize = calcTextsize(ctx, maxSize, text);
        ctx.font = `${textSize}px Sans-serif`;
        let xOffset = Math.max(1, 0.5 * width - maxSize / 2);
        yOffset = Math.max(1, yOffset + textSize);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(text, Math.floor(xOffset), Math.floor(yOffset));
        ctx.fillStyle = 'white';
        ctx.fillText(text, Math.floor(xOffset), Math.floor(yOffset));
    };

    writeText(text, 0.9 * width);
    writeText("---", 0.1 * width);

    const charsPerLine = 40;
    text = 'Press [Enter] to continue and pet';

    writeText(text, text.length / charsPerLine * width);
    writeText("---", 0.1 * width);
    text = 'Move with WASD or Arrows';
    writeText(text, text.length / charsPerLine * width);

    const padding = 2;

    const handSize = Math.min(
        Math.min(width, height) * 0.15, // default size
        Math.min(width, height) / handMap.length // in case of many hands
    );
    const boxSize = handSize + padding;


    const hCenter = width / 2;
    const hLeft = hCenter - 0.5 * handMap.length * boxSize;
    // draw hands

    for (let i = 0; i < handMap.length; i++) {
        ctx.drawImage(handMap[i],
            Math.floor(hLeft + boxSize * i + padding / 2),
            Math.floor(0.9 * height - boxSize + padding / 2),
            handSize, handSize);

    }
    // selection
    ctx.strokeStyle = 'white';
    const hi = gameState.handIndex;
    ctx.strokeRect(Math.floor(hLeft + boxSize * hi),
        Math.floor(0.9 * height - boxSize),
        boxSize, boxSize);


    ctx.restore();
}

function main() {
    const canvas = document.getElementById("canvas");
    const map = Map.new(60, 60);
    const offCanvas = document.createElement("canvas");
    offCanvas.width = 180;
    offCanvas.height = 180;
    const offCtx = offCanvas.getContext("2d");

    const zbuffer = new Float32Array(offCanvas.width);

    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const imageData = new ImageData(offCanvas.width, offCanvas.height);


    const textCanvas = document.createElement("canvas");
    const textSizeInterpolator = 0.6;
    textCanvas.width = Math.floor(offCanvas.width * (1 - textSizeInterpolator) + canvas.width * textSizeInterpolator);
    textCanvas.height = Math.floor(offCanvas.height * (1 - textSizeInterpolator) + canvas.height * textSizeInterpolator);

    const textCtx = textCanvas.getContext("2d");

    const cam = Cam.new({ pos: { x: 50, y: 50 }, fov: deg2Rad(90), near: 0.01 });

    const cosFovTarget = Math.cos(cam.fov / 4);
    const moveSpeed = 5;
    const rotateSpeed = Math.PI * 2 / 3;

    const checkPos = pos => {
        const { x, y } = pos;
        const [rx, ry] = [Math.floor(x), Math.floor(y)];
        if (!isInside(rx, ry, map.width, map.height)) {
            return false;
        }

        const v = map.at(rx, ry);

        return v === 0;
    }

    let keymap = {};
    // gathers all key asynchronous from render
    let keymapReceive = {};

    const KEY_UP = 0;
    const KEY_DOWN = 1;
    window.addEventListener("keydown", evt => {

        keymapReceive[evt.code] = KEY_DOWN;

    });

    window.addEventListener("keyup", evt => {
        keymapReceive[evt.code] = KEY_UP;

    });

    window.addEventListener("blur", () => {

        Object.keys(keymapReceive).forEach(key => keymapReceive[key] = KEY_UP);
    });

    randomizeMap(map, 0.1);

    const sprites = [];

    const TYPE_FRIEND = 1;

    const freeSpots = [];
    forEach2D(map, (m, x, y) => {
        if (m.at(x, y) === 0) {
            freeSpots.push({ x: x, y: y });
        }
    });

    {
        const idx = Math.floor(Math.random() * freeSpots.length);
        cam.pos = freeSpots[idx];
        freeSpots.splice(idx, 1);
    }

    const numFriends = 100;
    for (let i = 0; i < numFriends; i++) {
        const spriteNum = Math.floor(Math.random() * (spriteMap.length - 1)) + 1;


        const idx = Math.floor(Math.random() * freeSpots.length);

        const { x, y } = freeSpots[idx];
        freeSpots.splice(idx, 1);

        const sprite = spriteMap[spriteNum];
        const aspect = sprite.width / sprite.height;

        const sw = 0.75;
        const sh = sw / aspect;
        const ySquare = (1 - sw);
        sprites.push({
            texIndex: spriteNum,
            pos: { x, y },
            posRelative: { x: 0, y: 0 },
            scale: { x: sw, y: sh },
            yOffset: -ySquare - (1 - ySquare - sh),
            imgX: 0,
            imgZ: 0,
            type: TYPE_FRIEND,
            script: new WanderAround({})
        });
    }

    const STATE_WELCOME_SCREEN = 0;
    const STATE_WELCOME_SCREEN_SWITCH = 1;
    const STATE_WAITING = 2;
    const STATE_PETTING = 3;
    const gameState = {
        joy: 0,
        cooldown: 0,
        petTime: 0,
        petTarget: null,
        state: STATE_WELCOME_SCREEN,
        handIndex: (Math.floor(handMap.length / 2))
    };

    const MAX_COOLDOWN = 2;
    const MAX_PET_DISTANCE = 1.25;
    const MAX_PET_DISTANCE_2 = MAX_PET_DISTANCE * MAX_PET_DISTANCE;


    let last = performance.now();
    let time = 0;

    const loop = () => {

        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

        const cur = performance.now();
        const delta = cur - last;

        const dt = delta / 1000;
        time += dt;

        // update keys
        Object.keys(keymapReceive).forEach(key => {
            const val = keymapReceive[key];

            if (val === KEY_UP) {
                keymap[key] = 0;
            }
            else {
                if (!keymap[key]) {
                    keymap[key] = 0;
                }

                keymap[key] += 1;
            }

        }
        );

        if (gameState.state === STATE_WELCOME_SCREEN) {
            // draw splash screen

            drawSplashScreen({
                ctx: offCtx,
                keymap,
                dt, time,
                gameState
            });

            if (keymap["Enter"]) {
                gameState.state = STATE_WAITING;
            }
            if (keymap["ArrowRight"] === 1 || keymap["KeyD"] === 1) {
                gameState.handIndex = (gameState.handIndex + 1) % handMap.length;
            }
            if (keymap["ArrowLeft"] === 1 || keymap["KeyA"] === 1) {
                gameState.handIndex = (gameState.handIndex - 1 + handMap.length) % handMap.length;

            }
            ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(loop);
            return;
        }
        else if (gameState.state === STATE_WELCOME_SCREEN_SWITCH) {
            keymap = {};
            drawSplashScreen({
                ctx: textCanvas,
                keymap,
                dt, time,
                gameState
            });
            ctx.drawImage(textCanvas, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(loop);
            return;
        }


        let currentSpeed = moveSpeed;
        let currentRotSpeed = rotateSpeed;
        if (gameState.state === STATE_PETTING) {
            currentSpeed *= 0.25;
            currentRotSpeed *= 0.25;
        }
        if (keymap["KeyW"] || keymap["ArrowUp"]) {
            cam.move(dt * currentSpeed, checkPos);
        }
        if (keymap["KeyS"] || keymap["ArrowDown"]) {
            cam.move(-dt * currentSpeed, checkPos);
        }

        if (keymap["KeyA"] || keymap["ArrowLeft"]) {
            cam.rotate(dt * currentRotSpeed);
        }
        if (keymap["KeyD"] || keymap["ArrowRight"]) {
            cam.rotate(-dt * currentRotSpeed);
        }
        last = cur;


        if (gameState.state === STATE_PETTING) {
            gameState.cooldown = Math.max(0, gameState.cooldown - dt);
            gameState.petTime += dt;

            if (gameState.petTime > MAX_COOLDOWN) {
                // petting finished, gain joy
                gameState.joy += 1;
                // spawn hearts
                sprites.push({
                    texIndex: 0,
                    pos: { x: 0, y: 0 },
                    posRelative: { x: 0, y: 0 },
                    scale: { x: 0.2, y: 0.2 },
                    yOffset: 0.0,
                    imgX: 0,
                    imgZ: 0,
                    script: new HeartAnimation({
                        target: gameState.target,
                        amplitude: 0.2
                    })
                });

                gameState.state = STATE_WAITING;
                gameState.cooldown = MAX_COOLDOWN;
                gameState.petTime = 0;
                gameState.target = null;
            }
        }

        for (let i = sprites.length - 1; i >= 0; i--) {
            let s = sprites[i];
            if (!s.script) {
                continue;
            }

            const remove = s.script.update(
                {
                    dt, time,
                    sprite: s,
                    cam,
                    map
                }
            );

            if (remove) {
                sprites.splice(i, 1);
            }
        }


        fill3D({
            cam,
            map,
            buffer: imageData,
            ctx: offCtx,
            zbuffer,
            sprites,
            keymap
        });

        // pet after drawing because that calculates relative positions and sorts
        // perfect structuring
        if (keymap["Enter"]) {

            if (gameState.state === STATE_WAITING) {

                // go through sprites until a certain distance
                // sorted from the back, so go backwards
                for (let i = sprites.length - 1; i >= 0; i--) {
                    const s = sprites[i];

                    const z = s.imgZ;

                    if (s.type !== TYPE_FRIEND || z < 0) {
                        continue;
                    }

                    if (z > MAX_PET_DISTANCE) {
                        break;
                    }

                    const { x, y } = s.posRelative;

                    const l2 = x * x + y * y;
                    if (l2 > MAX_PET_DISTANCE_2) {
                        continue;
                    }

                    // pet only if in in target angle
                    const cosAlpha = (x * cam.dir.x + y * cam.dir.y) / l2;
                    if (cosAlpha > cosFovTarget) {

                        gameState.state = STATE_PETTING;
                        gameState.target = s;
                        break;
                    }

                }


            }

        }

        if (gameState.state === STATE_PETTING) {
            gameState.petTime += dt;
            const handSpeed = 2 * Math.PI / MAX_COOLDOWN * 2;
            const handTime = -gameState.petTime * handSpeed;
            const ctxh = offCtx;
            const c = ctxh.canvas;
            let mx = Math.floor(c.width / 2);
            let my = Math.floor(c.height / 2);


            let x = Math.floor(mx + Math.cos(handTime) * mx / 3);
            let y = Math.floor(my + Math.sin(handTime) * my / 3);

            let wh = Math.floor(mx / 3);
            let hh = Math.floor(my / 3);
            ctxh.drawImage(handMap[gameState.handIndex], x - Math.floor(wh / 2), y - Math.floor(hh / 2), wh, hh);
        }

        drawHUD({ ctx: textCtx, gameState });
        ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(textCanvas, 0, 0, canvas.width, canvas.height);

        requestAnimationFrame(loop);
    };

    loop();
}

window.onload = () => {


    const basePath = "pet_simulator/res/";
    const images = [
        "wood0.jpg", "wood1.jpg",
        "bricks0.jpg", "bricks1.jpg",
    ];


    const sprites = [
        "heart.png", "dog0.png", "dog1.png",
        "dog2.png", "dog3.png",
        "cat0.png", "cat1.png",
        "raccoon0.png", "raccoon1.png",
        "capybara0.png", "badger0.png"];

    const hands = ["hand_dark.png", "hand_medium_dark.png",
        "hand_medium.png", "hand_medium_light.png",
        "hand_yellow.png"];

    shuffle(hands);


    const inserter = (name, container) => {
        return new Promise((resolve) => {
            const img = new Image();
            container.push(img);
            img.onload = () => resolve();
            img.onerror = () => resolve();

            img.src = basePath + name;
        });
    };

    const promises = [];

    promises.push(...images.map(v => inserter(v, imageMap)));
    promises.push(...sprites.map(v => inserter(v, spriteMap)));
    promises.push(...hands.map(v => inserter(v, handMap)));

    Promise.all(promises).then(() => {
        main();
    });
};
