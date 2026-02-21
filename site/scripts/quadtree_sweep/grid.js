
// the values for free space and obstacle to be put in the grid
const FREESPACE = 0;
const OBSTACLE = 1;

// the grid containing the obstacle data, initially free
class Grid {
    // width of grid
    w = 0;
    // height of grid
    h = 0;
    // will hold the binary grid values
    data = null;


    // creates a state with a given size
    constructor(w, h) {
        this.w = w;
        this.h = h;

        // grids are layed out linearly in memory in a rowwise order
        // so the first row with w entries are all entries [x,0] with x = 0,..., w-1.
        // afterwards the second row starts
        // we use binary, so unsigned 8 bit is fine
        this.data = new Uint8Array(w * h);
    }

    // get the binary grid value
    value(x, y) {
        return this.data[x + y * this.w];
    }
    // set the binary grid value
    setValue(x, y, v) {
        // compute the linear index from 2D x,y
        this.data[x + y * this.w] = v;
        return this;
    }
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

// draw the grid
function drawGrid(grid, ctx, offset, scale) {
    ctx.save();

    for (let y = 0; y < grid.h; y++) {
        for (let x = 0; x < grid.w; x++) {
            const v = grid.value(x, y);
            if (v === FREESPACE) {
                continue;
            }

            const x0 = (offset[0] + x) * scale;
            const y0 = (offset[1] + y) * scale;

            ctx.fillRect(x0, y0, scale, scale);
        }
    }

    ctx.restore();
}


export {
    Grid,
    setValues,
    drawGrid,
    FREESPACE,
    OBSTACLE,
}