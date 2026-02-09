"use strict";

// non production code

// simple class to hold id data
class Field {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.num = width * height;
        this.data = new Uint32Array(this.num);
        this.changeListeners = [];
    }

    addChangeListener(callback) {
        this.changeListeners.push(callback);
    }

    removeChangeListener(callback) {
        for (let i = 0; i < this.changeListeners.length; i++) {
            if (this.changeListeners[i] == callback) {
                this.changeListeners.splice(i, 1);
                return;
            }
        }
    }

    forEach(callback) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                callback(this, x, y);
            }
        }
    }

    set(value, x, y) {
        let idx = x + y * this.width;
        const old = this.data[idx];
        this.data[idx] = value;

        for (let i = 0; i < this.changeListeners.length; i++) {
            this.changeListeners[i](this, value, x, y, old);
        }
    }

    at(x, y) {
        let idx = x + y * this.width;
        return this.data[idx];
    }
}

// simple class to hold image information that will be drawn
// usually we wouldn't do the extra effort to draw in pixels per cell, but instead resample with a nearest neighbor filter... but canvas doesn't reliably support that

class Background {
    constructor(field, { pixelsPerCell = 10, colorMap = [{ r: 255, g: 255, b: 255, a: 255 }, { r: 0, g: 0, b: 0, a: 255 }] } = {}) {
        this.imageData = new ImageData(field.width * pixelsPerCell, field.height * pixelsPerCell);
        this.pixels = this.imageData.data;

        this.width = this.imageData.width;
        this.height = this.imageData.height;

        this.pixelsPerCell = pixelsPerCell;
        this.colorMap = colorMap;
        this.field = field;

        this.updater = (m, value, x, y) => {
            this.#updateField(m, value, x, y);
        };

        field.addChangeListener(this.updater);

        for (let y = 0; y < field.height; y++) {
            for (let x = 0; x < field.width; x++) {
                this.updater(field, field.at(x, y), x, y);
            }
        }
    }

    destroy() {
        this.field.removeChangeListener(this.updater);
    }

    getColor(value) {
        const cIdx = value % this.colorMap.length;
        return this.colorMap[cIdx];
    }

    #updateField(m, value, x, y) {
        const col = this.getColor(value);

        x = x * this.pixelsPerCell;
        y = y * this.pixelsPerCell;

        for (let j = 0; j < this.pixelsPerCell; j++) {
            for (let i = 0; i < this.pixelsPerCell; i++) {
                let xc = x + i;
                let yc = y + j;

                const idx = (xc + yc * this.imageData.width) * 4;

                this.pixels[idx + 0] = col.r;
                this.pixels[idx + 1] = col.g;
                this.pixels[idx + 2] = col.b;
                this.pixels[idx + 3] = col.a;
            }
        }
    }
}

function cellToPixel(bg, x, y) {
    return {
        x: x * bg.pixelsPerCell,
        y: y * bg.pixelsPerCell
    };
}

function toByte(val) {
    return Math.floor(Math.max(0, Math.min(val, 255)));
}


function intersectCircleRectangle(cx, cy, r, rx, ry, w, h) {
    // closest point on rect
    const closestX = Math.max(rx, Math.min(rx + w, cx));
    const closestY = Math.max(ry, Math.min(ry + h, cy));


    let dx = cx - closestX;
    let dy = cy - closestY;

    const d2 = dx * dx + dy * dy;

    if (d2 > r * r) {
        return null;
    }

    // outside
    // inside will just be 0 and we don't handle it here
    if (d2 > 0.0) {
        const d = Math.sqrt(d2);
        dx /= d;
        dy /= d;
    }


    return { x: closestX, y: closestY, n: { x: dx, y: dy }, nd2: d2 };

}


function updateVelocities(players, dt) {
    for (let p of players) {
        p.pos.x += p.v.x * dt;
        p.pos.y += p.v.y * dt;
    }
}

function handleCollisions(players, field) {
    for (let p of players) {

        // check around player location
        const cx = Math.floor(p.pos.x);
        const cy = Math.floor(p.pos.y);

        const r = Math.max(1, Math.ceil(p.r));

        const cols = [];
        for (let j = -r; j <= r; j++) {
            for (let i = -r; i <= r; i++) {

                // check if we are inside the field and the index is different to the player index
                const rx = cx + i;
                const ry = cy + j;
                if (rx < 0 || rx >= field.width || ry < 0 || ry >= field.height) {
                    continue;
                }

                if (field.at(rx, ry) === p.idx) {
                    continue;
                }
                const col = intersectCircleRectangle(p.pos.x, p.pos.y, p.r, cx + i, cy + j, 1, 1);
                if (col === null) {
                    continue;
                }

                if (col.nd2 === 0.0) {
                    continue;
                }
                cols.push({ p: { x: rx, y: ry }, col });
            }
        }

        for (let c of cols) {

            const n = c.col.n;
            // if moving away, we don't care
            const vDotN = p.v.x * n.x + p.v.y * n.y;
            if (vDotN >= 0.0) {
                continue;
            }

            // else do a simple reflection
            // incoming d, then reflection is: r = d - 2*(dot(n,d))*n

            // here, d = v
            const rx = p.v.x - 2 * vDotN * n.x;
            const ry = p.v.y - 2 * vDotN * n.y;

            p.v.x = rx;
            p.v.y = ry;

            field.set(p.idx, c.p.x, c.p.y);
        }

        // simple bounds
        if (p.pos.x + p.r >= field.width && p.v.x > 0.0) {
            p.v.x = -p.v.x;
        }
        if (p.pos.x - p.r < 0.0 && p.v.x < 0.0) {
            p.v.x = -p.v.x;
        }
        if (p.pos.y + p.r >= field.height && p.v.y > 0.0) {
            p.v.y = -p.v.y;
        }
        if (p.pos.y - p.r < 0.0 && p.v.y < 0.0) {
            p.v.y = -p.v.y;
        }
    }

    for (let p of players) {

        // check around player location
        const cx = Math.floor(p.pos.x);
        const cy = Math.floor(p.pos.y);

        // if inside -> flip
        // this could happen if a ball is directly next to a collision
        if (cx >= 0 && cx < field.width && cy >= 0 && cy < field.height && field.at(cx, cy) != p.idx) {
            field.set(p.idx, cx, cy);
        }
    }

}
function rgb(r, g, b, a = 255) {
    return { r: r, g: g, b: b, a };
}

class Scoreboard {
    constructor(field) {
        this.field = field;
        this.scores = {};
        this.changeListeners = [];

        field.forEach((m, x, y) => {
            const idx = m.at(x, y);
            const cur = this.scores[idx] ?? 0;
            this.scores[idx] = cur + 1;
        });

        this.updater = (map, value, x, y, old) => {
            this.#updateField(map, value, x, y, old);
        };

        field.addChangeListener(this.updater);
    }

    addChangeListener(callback) {
        this.changeListeners.push(callback);
    }

    removeChangeListener(callback) {
        for (let i = 0; i < this.changeListeners.length; i++) {
            if (this.changeListeners[i] == callback) {
                this.changeListeners.splice(i, 1);
                return;
            }
        }
    }

    destroy() {
        this.field.removeChangeListener(this.updater);
    }

    #updateField(map, value, x, y, old) {
        this.scores[old] = this.scores[old] - 1;
        this.scores[value] = this.scores[value] + 1;

        for (let i = 0; i < this.changeListeners.length; i++) {
            this.changeListeners[i](this.scores, [old, value]);
        }

    }
}

function randomizeField(field, numPlayers) {
    field.forEach((m, x, y) => {
        m.set(Math.floor(Math.random() * numPlayers), x, y);
    });
}

function fillUpColorMap(map, numPlayers) {
    while (map.length < numPlayers) {
        map.push(rgb(Math.random() * 256, Math.random() * 256, Math.random() * 256));
    }
}


function resetCanvas(canvas, aspect, width) {

    canvas.width = width;
    canvas.height = canvas.width / aspect;
}

function createField(fieldWidth, fieldHeight, numPlayers, colorMap, colorMapPlayer, state, preferredSize, maxPixelsPerCell) {

    for (const k of Object.keys(state)) {
        const o = state[k];
        if (o && o.destroy) {
            o.destroy();
        }
    }

    let field = new Field(fieldWidth, fieldHeight);

    randomizeField(field, numPlayers);

    fillUpColorMap(colorMap, numPlayers);
    fillUpColorMap(colorMapPlayer, numPlayers);

    let pixelsPerCell = Math.max(1, Math.min(maxPixelsPerCell, Math.max(preferredSize / fieldWidth, preferredSize / fieldHeight)));
    pixelsPerCell = Math.floor(pixelsPerCell);
    // pixelsPerCell = 10;
    let bg = new Background(field, { colorMap, pixelsPerCell });

    let indexMaps = {};

    field.forEach((m, x, y) => {
        const val = m.at(x, y);
        const elements = indexMaps[val] ?? [];
        indexMaps[val] = elements;

        elements.push({ x, y });
    });

    let players = createPlayers(indexMaps);

    state.field = field;
    state.bg = bg;
    state.players = players;
    return state;
}

function createPlayers(indexMaps) {
    const players = [];
    for (const [idx, positions] of Object.entries(indexMaps)) {
        const n = positions.length;

        const mid = Math.floor(n / 2);
        const pMid = positions[mid];

        const p = {
            idx: parseInt(idx),
            r: 0.4,
            v: { x: 0, y: 0 },
            pos: { x: pMid.x + 0.5, y: pMid.y + 0.5 }
        };

        players.push(p);
    }
    // generate velocities
    for (let p of players) {
        let vx = Math.random() - 0.5;
        let vy = Math.random() - 0.5;

        let v = Math.sqrt(vx * vx + vy * vy);
        vx /= v;
        vy /= v;

        p.v = { x: vx, y: vy };
    }

    return players;
}

class ScoreboardUI {
    constructor(scoreboard, colorMap, container) {
        this.scoreboard = scoreboard;
        container.innerHTML = "";
        const ul = document.createElement('ul');
        this.elements = {};
        this.values = [];
        this.ul = ul;
        for (const [k, v] of Object.entries(scoreboard.scores)) {
            const li = document.createElement('li');

            const square = document.createElement('span');
            square.classList.add('square');
            let idx = parseInt(k);
            const col = colorMap[idx % colorMap.length];

            square.style.backgroundColor = `rgba(${toByte(col.r)},${toByte(col.g)}, ${toByte(col.b)},${Math.min(1.0, col.a / 255)})`;

            li.append(square);

            const text = document.createElement('span');
            text.innerText = `: ${v}`;

            li.append(text);
            ul.append(li);
            this.elements[k] = this.values.length;
            this.values.push({
                li, square, text, val: v
            });
        }

        this.update = (scores, changed) => {

            for (const c of changed) {
                const el = this.values[this.elements[c]];
                el.text.innerText = `: ${scores[c]}`;
                el.val = scores[c];
            }

            // this would need some flashing warning...
            // this.values.sort((a, b) => b.val - a.val);

            // this.values.forEach(v => this.ul.append(v.li));
        }

        this.update(this.scoreboard.scores, Object.keys(this.scoreboard.scores));
        container.append(ul);


        scoreboard.addChangeListener(this.update);
    }

    destroy() {
        this.scoreboard.removeChangeListener(this.update);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function main() {
    const canvasOutput = document.getElementById('canvas');
    const ctxOutput = canvasOutput.getContext('2d');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scoreContainer = document.getElementById('scoreboard');


    const restartButton = document.getElementById('restartButton');
    const numPlayersInput = document.getElementById('numPlayers');
    const fieldWidthInput = document.getElementById('fieldWidth');
    const fieldHeightInput = document.getElementById('fieldHeight');

    const speedSlider = document.getElementById('speedRange');
    const speedText = document.getElementById('speedText');

    let speedSliderMax = parseInt(speedSlider.max);
    let speedSliderMin = parseInt(speedSlider.min);
    let speedSliderDelta = speedSliderMax - speedSliderMin;

    // manual color palette
    // const colorMap = [
    //     // #c967c1
    //     rgb(201, 103, 193),
    //     // #6fc663
    //     rgb(111, 198, 99),
    //     // #df446c
    //     rgb(223, 68, 108),
    //     // #d96a2c
    //     rgb(217, 106, 44),
    //     // #776cde
    //     rgb(119, 108, 222),
    //     // #b1d43a
    //     rgb(177, 212, 58),
    //     // #d63db6
    //     rgb(214, 61, 182),
    //     // #b444e7
    //     rgb(180, 68, 231),

    // ];

    // const colorMapPlayer = [
    //     rgb(112, 40, 106),
    //     rgb(48, 109, 40),
    //     rgb(124, 21, 48),
    //     rgb(111, 52, 20),
    //     rgb(40, 30, 135),
    //     rgb(91, 111, 24),
    //     rgb(114, 24, 95),
    //     rgb(96, 17, 132),
    // ];

    function simpleColorLightenDarken(col) {
        const max = Math.max(col.r, col.g, col.b);
        let f = 1.0;
        let a = 0.0;
        if (max > 128) {
            // darken
            f = 0.85;
            a = -64;

        }
        else {
            // lighten
            f = 1.15;
            a = 64;

        }
        const c = {
            r: col.r * f + a,
            g: col.g * f + a,
            b: col.b * f + a,
            a: col.a
        };

        c.r = Math.max(0, Math.min(c.r));
        c.b = Math.max(0, Math.min(c.b));
        c.b = Math.max(0, Math.min(c.b));
        return c;
    }

    // good to differentiate large palette
    const colorMapBase = [
        rgb(0, 0, 0),
        rgb(1, 0, 103),
        rgb(213, 255, 0),
        rgb(255, 0, 86),
        rgb(158, 0, 142),
        rgb(14, 76, 161),
        rgb(255, 229, 2),
        rgb(0, 95, 57),
        rgb(0, 255, 0),
        rgb(149, 0, 58),
        rgb(255, 147, 126),
        rgb(164, 36, 0),
        rgb(0, 21, 68),
        rgb(145, 208, 203),
        rgb(98, 14, 0),
        rgb(107, 104, 130),
        rgb(0, 0, 255),
        rgb(0, 125, 181),
        rgb(106, 130, 108),
        rgb(0, 174, 126),
        rgb(194, 140, 159),
        rgb(190, 153, 112),
        rgb(0, 143, 156),
        rgb(95, 173, 78),
        rgb(255, 0, 0),
        rgb(255, 0, 246),
        rgb(255, 2, 157),
        rgb(104, 61, 59),
        rgb(255, 116, 163),
        rgb(150, 138, 232),
        rgb(152, 255, 82),
        rgb(167, 87, 64),
        rgb(1, 255, 254),
        rgb(255, 238, 232),
        rgb(254, 137, 0),
        rgb(189, 198, 255),
        rgb(1, 208, 255),
        rgb(187, 136, 0),
        rgb(117, 68, 177),
        rgb(165, 255, 210),
        rgb(255, 166, 254),
        rgb(119, 77, 0),
        rgb(122, 71, 130),
        rgb(38, 52, 0),
        rgb(0, 71, 84),
        rgb(67, 0, 44),
        rgb(181, 0, 255),
        rgb(255, 177, 103),
        rgb(255, 219, 102),
        rgb(144, 251, 146),
        rgb(126, 45, 210),
        rgb(189, 211, 147),
        rgb(229, 111, 254),
        rgb(222, 255, 116),
        rgb(0, 255, 120),
        rgb(0, 155, 255),
        rgb(0, 100, 1),
        rgb(0, 118, 255),
        rgb(133, 169, 0),
        rgb(0, 185, 23),
        rgb(120, 130, 49),
        rgb(0, 255, 198),
        rgb(255, 110, 65),
        rgb(232, 94, 190),
    ];


    const speedScale = 10;
    const getSpeed = () => {
        return parseInt(speedSlider.value - speedSliderMin) / speedSliderDelta;
    };

    speedSlider.value = 1 / speedScale * speedSliderDelta + speedSliderMin;
    let speed = getSpeed();

    speedSlider.oninput = () => {
        speed = getSpeed() * speedScale;
        speedText.innerText = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(
            speed);

    };

    speedSlider.oninput();


    let numPlayers = 3;
    let fieldWidth = 15;
    let fieldHeight = 15;

    const state = {
        field: null,
        bg: null,
        players: null,
        scoreboard: null,
        scoreboardUI: null,
        colorMap: null,
        colorMapPlayer: null

    };


    fieldWidthInput.value = fieldWidth;
    fieldHeightInput.value = fieldHeight;
    numPlayersInput.value = numPlayers;


    restartButton.onclick = () => {
        fieldWidth = parseInt(fieldWidthInput.value);
        fieldHeight = parseInt(fieldHeightInput.value);
        numPlayers = parseInt(numPlayersInput.value);

        const colorMap = colorMapBase.concat();
        shuffleArray(colorMap);
        const colorMapPlayer = colorMap.map(c => simpleColorLightenDarken(c));

        state.colorMap = colorMap;
        state.colorMapPlayer = colorMapPlayer;
        createField(fieldWidth, fieldHeight, numPlayers, colorMap, colorMapPlayer, state, 600, 60);

        state.scoreboard = new Scoreboard(state.field);
        state.scoreboardUI = new ScoreboardUI(state.scoreboard, colorMap, scoreContainer);

        canvas.width = state.bg.width;
        canvas.height = state.bg.height;

        resetCanvas(canvasOutput, canvas.width / canvas.height, 600);
    }

    restartButton.onclick();

    let start;

    canvasOutput.imageSmoothingEnabled = false;
    function update(lastTime) {
        if (start === undefined) {
            start = lastTime;
        }
        const elapsed = lastTime - start;

        const dt = Math.min(elapsed * 1000, 1.0 / 30.0);
        start = lastTime;

        const { players, field, bg, colorMap, colorMapPlayer } = state;

        updateVelocities(players, dt * speed);
        handleCollisions(players, field);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(bg.imageData, 0, 0);


        ctxOutput.drawImage(canvas, 0, 0, canvasOutput.width, canvasOutput.height);

        for (let p of players) {

            const px = cellToPixel(bg, p.pos.x, p.pos.y);
            px.x = (px.x / bg.width) * canvasOutput.width;
            px.y = (px.y / bg.height) * canvasOutput.height;
            const col = colorMapPlayer[p.idx % colorMapPlayer.length];
            ctxOutput.save();
            const style = `rgba(${toByte(col.r)},${toByte(col.g)}, ${toByte(col.b)},${Math.min(1.0, col.a / 255)})`;
            ctxOutput.fillStyle = style;
            ctxOutput.beginPath();
            ctxOutput.arc(px.x, px.y, p.r * bg.pixelsPerCell * (canvasOutput.width / canvas.width), 0, 2.0 * Math.PI);
            ctxOutput.closePath();
            ctxOutput.fill();
            ctxOutput.restore();
        }

        window.requestAnimationFrame(update);
    }

    window.requestAnimationFrame(update);


}


export {
    main
};