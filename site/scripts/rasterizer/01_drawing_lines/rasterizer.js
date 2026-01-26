import {
    vec2,
    vec4,
    floor,
} from "../common/defines.js"


import {
    add,
    subvec,

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


class Rasterizer {

    /**
     * Rasterize a line
     * @param {AbstractMat} a 
     * @param {AbstractMat} b 
     * @param {Object<Number|AbstractMat>} data_a 
     * @param {Object<Number|AbstractMat>} data_b 
     */
    rasterize_line(pipeline, a, b,
        data_a = {},
        data_b = {}) {

        // Bresenham/midpoint line drawing algorithm
        // operates on pixels
        const p0 = a;
        const p1 = b;

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

        // Bresenham/midpoint line drawing algorithm
        // operates on pixels
        const p0 = a;
        const p1 = b;

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
        framebuffer = Framebuffer.new(),
    } = {}) {
        this.framebuffer = framebuffer;
    }
}

export {
    Rasterizer,
    Pipeline,
    Framebuffer,
    Attribute,
    Topology,
}