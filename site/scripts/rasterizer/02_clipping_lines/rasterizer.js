import {
    vec2,
    vec4,
    floor,
} from "../common/defines.js"


import {
    add,
    subvec,

    cwiseMin,
    cwiseMax,

    VecF32 as v32,
    MatF32 as m32,
} from "../../bundles/jsmatrix.bundle.min.js";


const Attribute = {
    VERTEX: 0,
};
const Topology = {
    LINES: 0,
};

/**
 * Simple framebuffer class that holds color and depth buffers
 */
class Framebuffer {
    constructor() {
        this.color_buffers = {};
    }

    static new() {
        return new Framebuffer();
    }
}

// bitflags for viewport clipping
const SCREEN_CODE_LEFT = 1;
const SCREEN_CODE_RIGHT = 2;
const SCREEN_CODE_TOP = 4;
const SCREEN_CODE_BOTTOM = 8;

class Rasterizer {

    /**
     * @brief Cohen-Sutherland region code for given point
     *
     * @param x The x coordinate
     * @param y The y coordinate
     * @param minx The bound's minimum x value
     * @param miny The bound's minimum y value
     * @param maxx The bound's maximum x value
     * @param maxy The bound's maximum y value
     * @return The region code for the given point
     */
    region_code(x, y, minx, miny, maxx,
        maxy) {

        let result = 0;
        // Binary operators work by converting from/to a 32 bit integer
        if (x < minx) {
            result = result | SCREEN_CODE_LEFT;
        } else if (x > maxx) {
            result = result | SCREEN_CODE_RIGHT;
        }
        if (y < miny) {
            result = result | SCREEN_CODE_BOTTOM;
        } else if (y > maxy) {
            result = result | SCREEN_CODE_TOP;
        }
        return result;
    }

    /**
     * Efficiently clip a line against the screen
     * @param {AbstractMat} a The start point
     * @param {AbstractMat} b The endpoint
     * @param {AbstractMat} bmin The minimum screen coordinates
     * @param {AbstractMat} bmax The maximum screen coordinate
     * @returns Array<AbstractMat> The clipped points. Might be empty, if the whole line was clipped
     */
    clip_screen(a, b, bmin, bmax) {
        // adapted from
        // https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm
        let code0 = this.region_code(a.at(0), a.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));
        let code1 = this.region_code(b.at(0), b.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));

        let x = 0.0;
        let y = 0.0;
        while (true) {
            if ((code0 | code1) === 0) {
                // bitwise OR is 0: both points inside window; trivially accept and
                // exit loop
                return [a, b];
            }

            if ((code0 & code1) > 0) {
                // bitwise AND is not 0: both points share an outside zone (LEFT,
                // RIGHT, TOP, or BOTTOM), so both must be outside window; exit loop
                // (accept is false)
                return [];
            }

            // At least one endpoint is outside the clip rectangle; pick it.
            const outcodeOut = code1 > code0 ? code1 : code0;

            if ((outcodeOut & SCREEN_CODE_TOP) !== 0) { // point is above the clip window
                x = a.at(0) + (b.at(0) - a.at(0)) * (bmax.at(1) - a.at(1)) / (b.at(1) - a.at(1));
                y = bmax.at(1);
            } else if ((outcodeOut & SCREEN_CODE_BOTTOM) !== 0) { // point is below the clip window
                x = a.at(0) + (b.at(0) - a.at(0)) * (bmin.at(1) - a.at(1)) / (b.at(1) - a.at(1));
                y = bmin.at(1);
            } else if ((outcodeOut & SCREEN_CODE_RIGHT) !== 0) { // point is to the right of clip window
                y = a.at(1) + (b.at(1) - a.at(1)) * (bmax.at(0) - a.at(0)) / (b.at(0) - a.at(0));
                x = bmax.at(0);
            } else if ((outcodeOut & SCREEN_CODE_LEFT) !== 0) { // point is to the left of clip window
                y = a.at(1) + (b.at(1) - a.at(1)) * (bmin.at(0) - a.at(0)) / (b.at(0) - a.at(0));
                x = bmin.at(0);
            }

            // Now we move outside point to intersection point to clip
            // and get ready for next pass.
            if (outcodeOut === code0) {
                a.set(x, 0);
                a.set(y, 1);
                code0 = this.region_code(a.at(0), a.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));
            } else {
                b.set(x, 0);
                b.set(y, 1);
                code1 = this.region_code(b.at(0), b.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));
            }
        }

    }

    /**
     * Rasterize a line
     * @param {AbstractMat} a 
     * @param {AbstractMat} b
     */
    rasterize_line(pipeline, a, b) {
        // clip
        const clipped = this.clip_screen(a, b, vec2(pipeline.viewport.x, pipeline.viewport.y), vec2(pipeline.viewport.x + pipeline.viewport.w - 1, pipeline.viewport.y + pipeline.viewport.h - 1));
        if (clipped.length === 0) {
            return;
        }

        // Bresenham/midpoint line drawing algorithm
        // operates on pixels
        const p0 = clipped[0];
        const p1 = clipped[1];

        // Bresenham works in integer coordinates
        let x0 = Math.floor(p0.at(0));
        let y0 = Math.floor(p0.at(1));

        let x1 = Math.floor(p1.at(0));
        let y1 = Math.floor(p1.at(1));

        // Bresenham is only defined in the first 2D octant
        // To make it work for the others, we reorder things, so they are in that
        // first octant. In the end we have to undo some of that

        // slope > 1 -> flip x and y
        let transposed = false;
        if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
            transposed = true;
            [x0, y0] = [y0, x0];
            [x1, y1] = [y1, x1];
        }

        // going from right to left -> flip first and second point
        // doesn't actually change the line, so no later inversion needed
        if (x1 < x0) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x1 - x0;
        const dy = Math.abs(y1 - y0);

        let y = y0;
        let m = dy / dx;
        if (y1 < y0) {
            m = -m;
        }

        for (let x = x0; x <= x1; x++) {
            let px = vec2(x, y);

            // flip x and y for the actual coordinate if they were flipped before
            if (transposed) {
                px = vec2(y, x);
            }

            // move px to pixel center
            add(px, vec2(0.5, 0.5), px);

            // the final fragment coordinate
            const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
            // run  fragment shader with data

            // buffer for colors
            const output_colors = {};

            output_colors[0] = vec4(1, 0, 0, 1);

            this.write_fragment(pipeline, frag_coord, output_colors);


            y += m;

        }


    }

    /**
    * Rasterize a line with the bresenham algorithm
    * @param {AbstractMat} a 
    * @param {AbstractMat} b 
    * @param {Object<Number|AbstractMat>} data_a 
    * @param {Object<Number|AbstractMat>} data_b 
    */
    rasterize_line_bresenham(pipeline, a, b,
        data_a = {},
        data_b = {}) {
        // clip
        const clipped = this.clip_screen(a, b, vec2(pipeline.viewport.x, pipeline.viewport.y), vec2(pipeline.viewport.x + pipeline.viewport.w - 1, pipeline.viewport.y + pipeline.viewport.h - 1));
        if (clipped.length === 0) {
            return;
        }

        // interpolated data buffer
        const data = {};

        // gather attributes
        for (let i in data_a) {
            if (!data_b[i]) {
                continue;
            }
            data[i] = null;
        }

        // Bresenham/midpoint line drawing algorithm
        // operates on pixels
        const p0 = clipped[0];
        const p1 = clipped[1];

        // Bresenham works in integer coordinates
        let x0 = Math.floor(p0.at(0));
        let y0 = Math.floor(p0.at(1));

        let x1 = Math.floor(p1.at(0));
        let y1 = Math.floor(p1.at(1));

        // Bresenham is only defined in the first 2D octant
        // To make it work for the others, we reorder things, so they are in that
        // first octant. In the end we have to undo some of that

        // slope > 1 -> flip x and y
        let transposed = false;
        if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
            transposed = true;
            [x0, y0] = [y0, x0];
            [x1, y1] = [y1, x1];
        }

        // going from right to left -> flip first and second point
        // doesn't actually change the line, so no later inversion needed
        if (x1 < x0) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }
        let yIncr = 1;
        if (y1 < y0) {
            yIncr = -1;
        }
        const dx = x1 - x0;
        const dy = Math.abs(y1 - y0);

        let D = 2 * dy - dx;
        let y = y0;

        for (let x = x0; x <= x1; x++) {
            let px = vec2(x, y);

            // flip x and y for the actual coordinate if they were flipped before
            if (transposed) {
                px = vec2(y, x);
            }

            // move px to pixel center
            add(px, vec2(0.5, 0.5), px);

            // the final fragment coordinate
            const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
            // run  fragment shader with data

            // buffer for colors
            const output_colors = {};

            output_colors[0] = vec4(1, 0, 0, 1);


            this.write_fragment(pipeline, frag_coord, output_colors);


            if (D > 0) {
                y += yIncr;
                D = D - 2 * dx;
            }

            D = D + 2 * dy;
        }


    }

    /**
     * Processes a single line
     * @param {Pipeline} pipeline The pipeline to use
     * @param {AbstractMat} v0 The first vertex
     * @param {AbstractMat} v1 The second vertex
     * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
     * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
     */
    process_line(pipeline, v0, v1,
        attribs_v0 = {},
        attribs_v1 = {}) {

        this.rasterize_line(pipeline, v0, v1);

    }



    /**
     * Draw the given geometry
     * @param {Pipeline} pipeline The pipeline to use
     * @param {Object} geom Geometry object specifying all information
     */
    draw(pipeline, geom) {

        // no vertices
        // we could also take a parameter specifying the number of vertices to be
        // drawn and not rely on vertex data
        if (!geom.attributes[Attribute.VERTEX]) {
            return;
        }

        const vertices = geom.attributes[Attribute.VERTEX];
        const n = vertices.length;

        // go through objects
        if (geom.topology === Topology.LINES) {
            // handles lines
            // handle two vertices per step
            for (let i = 0; i < n; i += 2) {
                this.process_line(pipeline, vertices[i], vertices[i + 1]);
            }
        }
    }

    /**
     * Writes a number of output colors and depth to the pipeline's framebuffer.
     * Might apply depth test/write operations
     * @param {Pipeline} pipeline The pipeline to use
     * @param {AbstractMat} frag_coord The fragment coordinate
     * @param {Object<AbstractMat>} colors A map containing the colors per output buffer
     */
    write_fragment(pipeline, frag_coord, colors) {
        const px = floor(subvec(frag_coord, 0, 2));

        const frames = pipeline.framebuffer.color_buffers;

        for (let i in colors) {
            const frame = frames[i];
            if (!frame) {
                continue;
            }

            frame.set(colors[i], px.at(0), px.at(1));

        }
    }
}


class Pipeline {
    constructor({
        viewport = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        },
        framebuffer = Framebuffer.new(),
    } = {}) {
        this.viewport = viewport;
        this.framebuffer = framebuffer;
    }
}


export {
    Rasterizer,
    Pipeline,
    Framebuffer,
    Attribute,
    Topology,
};