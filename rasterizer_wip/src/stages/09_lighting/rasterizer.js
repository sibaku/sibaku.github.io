/* global jsm, v32, m32, vec2, vec3, vec4 */
/* global subvec, copy */
/* global add, sub, mult, scale, cwiseMin, cwiseMax, dot, isAny, floor, ceil, abs, cwiseMult, clamp */
/* global to_int */

// liascript imports are not scoped, so we scope ourselves...
(() => {
    /**
     * Simple framebuffer class that holds color and depth buffers
     */
    class Framebuffer {
        constructor() {
            this.color_buffers = {};
            this.depth_buffer = null;
        }

        static new() {
            return new Framebuffer();
        }
    }

    const AttributeInterpolation = { LINEAR: 0, PERSPECTIVE_CORRECTED: 1 };

    const Attribute = {
        VERTEX: 0,
        NORMAL: 1,
        UV: 2
    };

    const Topology = {
        LINES: 0,
        TRIANGLES: 1
    };



    const SCREEN_CODE_LEFT = 1;
    const SCREEN_CODE_RIGHT = 2;
    const SCREEN_CODE_TOP = 4;
    const SCREEN_CODE_BOTTOM = 8;

    class Rasterizer {
        /**
         * Computes the minimum and maximum coordinates of an array of points
         * @param {Array<AbstractMat>} points The input points
         * @returns [bmin,bmax]
         */
        compute_bounds(points) {
            // compute triangle screen bounds
            let bmin = vec2(Infinity, Infinity);
            let bmax = vec2(-Infinity, -Infinity);

            // go through all points and find minimum and maximum values
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                const p2 = vec2(p.at(0), p.at(1));
                cwiseMin(bmin, p2, bmin);
                cwiseMax(bmax, p2, bmax);
            }

            return [bmin, bmax];
        }

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
            // https://en.at(3)ikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm
            let code0 = this.region_code(a.at(0), a.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));
            let code1 = this.region_code(b.at(0), b.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));

            let accept = false;

            let x = 0.0;
            let y = 0.0;
            while (true) {
                if ((code0 | code1) === 0) {
                    // bitwise OR is 0: both points inside window; trivially accept and
                    // exit loop
                    accept = true;
                    break;
                }

                if ((code0 & code1) > 0) {
                    // bitwise AND is not 0: both points share an outside zone (LEFT,
                    // RIGHT, TOP, or BOTTOM), so both must be outside window; exit loop
                    // (accept is false)
                    break;
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

            if (!accept) {
                return [];
            }

            return [a, b];
        }

        /**
         * Computes twice the signed area of a given 2D triangle.
         * The triangle is assumed to be defined anti-clockwise
         * @param {AbstractMat} v0 The first 2D point
         * @param {AbstractMat} v1 The second 2D point
         * @param {AbstractMat} v2 The third 2D point
         * @returns Twice the signed area
         */
        signed_tri_area_doubled(v0, v1, v2) {
            return (v1.at(0) - v0.at(0)) * (v2.at(1) - v0.at(1)) - (v1.at(1) - v0.at(1)) * (v2.at(0) - v0.at(0));
        }


        /**
         * @brief Linearly interpolate two values
         *
         * @param a The first value
         * @param b The second value
         * @param t The interpolation parameter in [0,1]
         * @return The interpolated value
         */
        interpolate_line(a, b, t) {
            // Differentiate between numbers and vectors due to missing operator overload
            // we simplify here and assume b to be the same type as a
            if (typeof (a) === 'number') {
                return (1.0 - t) * a + t * b;
            } else {
                // Otherwise assume the parameters to be vectors/matrices
                return add(scale(a, (1.0 - t)), scale(b, t));
            }
        }

        /**
         * @brief Linearly interpolate two values with perspective correction
         *
         * @param a The first value
         * @param b The second value
         * @param inv_wa 1/w at the first point
         * @param inv_wb 1/w at the second point
         * @param t The interpolation parameter window space
         * @return The interpolated value
         */
        interpolate_line_perspective(a, b, inv_wa,
            inv_wb, t) {
            // Differentiate between numbers and vectors due to missing operator overload
            // we simplify here and assume b to be the same type as a
            if (typeof (a) === 'number') {
                return ((1.0 - t) * inv_wa * a + t * inv_wb * b) /
                    ((1.0 - t) * inv_wa + t * inv_wb);
            }
            else {
                // Otherwise assume the parameters to be vectors/matrices
                const divisor = ((1.0 - t) * inv_wa + t * inv_wb);

                return scale(add(scale(a, (1.0 - t) * inv_wa), scale(b, t * inv_wb)), 1.0 / divisor);
            }

        }

        /**
         * @brief Linearly interpolate three values on a triangle
         *
         * @param {AbstractMat | Number} a The first value
         * @param {AbstractMat | Number} b The second value
         * @param {AbstractMat | Number} c The third value
         * @param {AbstractMat} barycentric The barycentric weights for each value
         * @return The interpolated value
         */
        interpolate_triangle(a, b, c,
            barycentric) {
            // Differentiate between numbers and vectors due to missing operator overload
            // we simplify here and assume b to be the same type as a
            if (typeof (a) === 'number') {
                return a * barycentric.at(0) + b * barycentric.at(1) + c * barycentric.at(2);
            }
            else {
                // Otherwise assume the parameters to be vectors/matrices

                // Note that we could be more efficient by using temporary vectors in 
                // which the add/scale operations are stored in. This form is chosen 
                // to be the direct translation of the number version
                return add(scale(a, barycentric.at(0)),
                    add(scale(b, barycentric.at(1)), scale(c, barycentric.at(2))));

            }
        }

        /**
         * @brief Linearly interpolate three values on a triangle with perspective
         * correction
         *
         * @param a The first value
         * @param b The second value
         * @param c The third value
         * @param inv_wa 1/w at the first point
         * @param inv_wb 1/w at the second point
         * @param inv_wc 1/w at the third point
         * @param barycentric The barycentric weights in window space
         * @return The interpolated value
         */
        interpolate_triangle_perspective(a, b, c,
            inv_wa, inv_wb, inv_wc,
            barycentric) {

            // Differentiate between numbers and vectors due to missing operator overload
            // we simplify here and assume b to be the same type as a
            if (typeof (a) === 'number') {
                return (a * inv_wa * barycentric.at(0) + b * inv_wb * barycentric.at(1) +
                    c * inv_wc * barycentric.at(2)) /
                    (inv_wa * barycentric.at(0) + inv_wb * barycentric.at(1) +
                        inv_wc * barycentric.at(2));
            }
            else {
                // Otherwise assume the parameters to be vectors/matrices

                const divisor = inv_wa * barycentric.at(0) + inv_wb * barycentric.at(1) +
                    inv_wc * barycentric.at(2);

                // Note that we could be more efficient by using temporary vectors in 
                // which the add/scale operations are stored in. This form is chosen 
                // to be the direct translation of the number version
                return scale(add(scale(a, inv_wa * barycentric.at(0)), add(scale(b, inv_wb * barycentric.at(1)),
                    scale(c, inv_wc * barycentric.at(2)))), 1.0 / divisor);
            }


        }


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
            // clip
            const clipped = this.clip_screen(a, b, vec2(0, 0), vec2(pipeline.viewport.w - 1, pipeline.viewport.h - 1));
            if (clipped.length === 0) {
                return;
            }

            const program = pipeline.program;

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
            const a2d = copy(subvec(a, 0, 2));
            const b2d = copy(subvec(b, 0, 2));

            const ldelta = sub(b2d, a2d);

            // precompute this value, since we will use it later
            const ldelta2 = dot(ldelta, ldelta);

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

                // compute interpolation paramter along line
                // this is the projection of the pixel center on the line
                let t = ldelta2 !== 0.0 ? dot(sub(px, a2d), ldelta) / ldelta2 : 0.0;
                // as we are dealing with pixels and not the line itself -> clamp just
                // to be sure
                t = Math.max(0.0, Math.min(1.0, t));

                // interpolate values
                for (let i in data) {

                    if (pipeline.attribute_interpolation === AttributeInterpolation.LINEAR) {
                        data[i] = this.interpolate_line(data_a[i], data_b[i], t);
                    } else {
                        data[i] = this.interpolate_line_perspective(data_a[i], data_b[i],
                            a.at(3), b.at(3), t);
                    }
                }

                // depth values (after perspective division!) can be linearly
                // interpolated
                const frag_z = this.interpolate_line(a.at(2), b.at(2), t);
                // w contains 1/w before perspective division which can also be linearly
                // interpolated
                const frag_w = this.interpolate_line(a.at(3), b.at(3), t);
                // the final fragment coordinate
                const frag_coord = vec4(px.at(0), px.at(1), frag_z, frag_w);
                // run  fragment shader with data

                // buffer for colors
                const output_colors = {};


                const do_write_fragment =
                    program.fragment_shader.run(frag_coord, data, pipeline.uniform_data, output_colors);

                if (do_write_fragment) {
                    this.write_fragment(pipeline, frag_coord, output_colors);
                }

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
            const clipped = this.clip_screen(a, b, vec2(0, 0), vec2(pipeline.viewport.w - 1, pipeline.viewport.h - 1));
            if (clipped.length === 0) {
                return;
            }

            const program = pipeline.program;

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
            const a2d = copy(subvec(a, 0, 2));
            const b2d = copy(subvec(b, 0, 2));

            const ldelta = sub(b2d, a2d);

            // precompute this value, since we will use it later
            const ldelta2 = dot(ldelta, ldelta);

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

                // compute interpolation paramter along line
                // this is the projection of the pixel center on the line
                let t = ldelta2 !== 0.0 ? dot(sub(px, a2d), ldelta) / ldelta2 : 0.0;
                // as we are dealing with pixels and not the line itself -> clamp just
                // to be sure
                t = Math.max(0.0, Math.min(1.0, t));

                // interpolate values
                for (let i in data) {

                    if (pipeline.attribute_interpolation === AttributeInterpolation.LINEAR) {
                        data[i] = this.interpolate_line(data_a[i], data_b[i], t);
                    } else {
                        data[i] = this.interpolate_line_perspective(data_a[i], data_b[i],
                            a.at(3), b.at(3), t);
                    }
                }

                // depth values (after perspective division!) can be linearly
                // interpolated
                const frag_z = this.interpolate_line(a.at(2), b.at(2), t);
                // w contains 1/w before perspective division which can also be linearly
                // interpolated
                const frag_w = this.interpolate_line(a.at(3), b.at(3), t);
                // the final fragment coordinate
                const frag_coord = vec4(px.at(0), px.at(1), frag_z, frag_w);
                // run  fragment shader with data

                // buffer for colors
                const output_colors = {};


                const do_write_fragment =
                    program.fragment_shader.run(frag_coord, data, pipeline.uniform_data, output_colors);

                if (do_write_fragment) {
                    this.write_fragment(pipeline, frag_coord, output_colors);
                }

                if (D > 0) {
                    y += yIncr;
                    D = D - 2 * dx;
                }

                D = D + 2 * dy;
            }


        }


        /**
         * 
         * @param {Pipeline} pipeline The pipeline to use
         * @param {AbstractMat} v0 The first vertex
         * @param {AbstractMat} v1 The second vertex
         * @param {AbstractMat} v2 The third vertex
         * @param {Object<Number|AbstractMat>} data_v0 The attributes for the first vertex
         * @param {Object<Number|AbstractMat>} data_v1 The attributes for the second vertex
         * @param {Object<Number|AbstractMat>} data_v2 The attributes for the third vertex
         * @returns 
         */
        rasterize_triangle(pipeline, v0, v1,
            v2,
            data_v0 = {},
            data_v1 = {}, data_v2 = {}) {
                
           // compute triangle screen bounds
            let points = [v0, v1, v2];
            let [bmin, bmax] = this.compute_bounds(points);

            // pixel coordinates of bounds
            let ibmin = floor(bmin);
            let ibmax = ceil(bmax);

            const size = vec2(pipeline.viewport.w, pipeline.viewport.h);
            const size_upper = vec2(pipeline.viewport.w - 1, pipeline.viewport.h - 1);

            // clamp bounds so they lie inside the image region
            // TODO size()
            cwiseMax(ibmin, vec2(0, 0), ibmin);
            cwiseMin(ibmax, size_upper, ibmax);

            // handle case where its fully outside
            if (isAny(ibmin, size, (a, b) => a >= b) ||
                isAny(ibmax, vec2(0, 0), (a, b) => a < b)) {
                return;
            }

            // interpolated data buffer
            const data = {};

            // gather attributes
            for (let i in data_v0) {
                if (!data_v1[i] || !data_v2[i]) {
                    continue;
                }
                data[i] = null;
            }
            // buffer for colors

            const program = pipeline.program;

            // compute the double triangle area only once
            const area_tri = this.signed_tri_area_doubled(v0, v1, v2);

            // check if any the triangle has zero area with some epsilon, if so, don't rasterize
            const epsilon = 1E-8;
         if (Math.abs(area_tri) < epsilon) {
                return;
            }

            // check all pixels in screen bounding box
            for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
                for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
                    // sample point in center of pixel
                    const p = add(vec2(x, y), vec2(0.5, 0.5));

                    let av1 = this.signed_tri_area_doubled(v2, v0, p);
                    av1 /= area_tri;
                    if (av1 + epsilon < 0.0) {
                        continue;
                    }

                    let av2 = this.signed_tri_area_doubled(v0, v1, p);
                    av2 /= area_tri;
                    if (av2 + epsilon < 0.0) {
                        continue;
                    }

                    if (av1 + av2 - epsilon > 1.0) {
                        continue;
                    }

                    const b = v32.from([1.0 - av1 - av2, av1, av2]);

                    // use this for a fun effect
                    //            b = glm::vec3(1.0, 0.0, 0.0);

                    // interpolate values
                    for (let i in data) {
                        if (pipeline.attribute_interpolation == AttributeInterpolation.LINEAR) {
                            data[i] = this.interpolate_triangle(data_v0[i], data_v1[i],
                                data_v2[i], b);
                        } else {
                            data[i] = this.interpolate_triangle_perspective(
                                data_v0[i], data_v1[i], data_v2[i], v0.at(3), v1.at(3), v2.at(3),
                                b);
                        }
                    }
                    // depth values (after perspective division!) can be linearly
                    // interpolated
                    const frag_z = this.interpolate_triangle(v0.at(2), v1.at(2), v2.at(2), b);
                    // w contains 1/w before perspective division which can also be
                    // linearly
                    // interpolated
                    const frag_w = this.interpolate_triangle(v0.at(3), v1.at(3), v2.at(3), b);
                    // run  fragment shader with data
                    const frag_coord = vec4(x, y, frag_z, frag_w);
                    // run  fragment shader with data
                    const output_colors = {};

                    const do_write_fragment =
                        program.fragment_shader.run(frag_coord, data, pipeline.uniform_data, output_colors);

                    if (do_write_fragment) {
                        this.write_fragment(pipeline, frag_coord, output_colors);
                    }
                }
            }
        }

        /**
         * Computes the viewport transform for a given point and viewport
         * @param {AbstractMat} p The point
         * @param {Object} viewport The viewport
         * @returns The transformed point
         */
        viewport_transform(p, viewport) {
            p = copy(p);
            // perspective division
            // store 1/w in last component

            const w = p.at(3);
            for (let j = 0; j < 3; j++) {
                p.set(p.at(j) / w, j);
            }

            p.set(1.0 / w, 3);

            // viewport transform
            p.set(viewport.w / 2.0 * p.at(0) + viewport.w / 2.0 + viewport.x, 0);
            p.set(viewport.h / 2.0 * p.at(1) + viewport.h / 2.0 + viewport.y, 1);
            p.set(0.5 * (p.at(2) + 1.0), 2);

            return p;
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
            // prepare points and data for clipping
            let points = [v0, v1];
            let attribs = [attribs_v0, attribs_v1];
            // clip line
            [points, attribs] = this.clip_line(points, attribs, pipeline.clip_planes);

            for (let i = 0; i < points.length; i++) {

                points[i] = this.viewport_transform(points[i], pipeline.viewport);

            }

            // finally rasterize line
            if (points.length === 2) {
                this.rasterize_line(pipeline, points[0], points[1], attribs[0], attribs[1]);
            }
        }

        /**
         * Processes a single triangle
         * @param {Pipeline} pipeline The pipeline to use
         * @param {AbstractMat} v0 The first vertex
         * @param {AbstractMat} v1 The second vertex
         * @param {AbstractMat} v2 The third vertex
         * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
         * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
         * @param {Object<Number|AbstractMat>} attribs_v2 The attributes of the third vertex
         */
        process_triangle(pipeline, v0, v1, v2,
            attribs_v0 = {}, attribs_v1 = {}, attribs_v2 = {}) {

            // prepare points and data for clipping
            let points = [v0, v1, v2];
            let attribs = [attribs_v0, attribs_v1, attribs_v2];
            // clip polygon
            [points, attribs] = this.clip_polygon(points, attribs, pipeline.clip_planes);

            for (let i = 0; i < points.length; i++) {
                points[i] = this.viewport_transform(points[i], pipeline.viewport);
            }

            // triangulate polygon (clipping the triangle may result in non triangles
            // polygons) and rasterize
            for (let i = 0; i + 2 < points.length; i++) {

                this.rasterize_triangle(pipeline, points[0], points[i + 1], points[i + 2], attribs[0],
                    attribs[i + 1], attribs[i + 2]);
            }
        }



        /**
         * Draw the given geometry
         * @param {Pipeline} pipeline The pipeline to use
         * @param {Object} geom Geometry object specifying all information
         */
        draw(pipeline, geom) {

            // no vertex shader
            if (!pipeline.program) {
                return;
            }
            const program = pipeline.program;
            // no vertices
            // we could also take a parameter specifying the number of vertices to be
            // drawn and not rely on vertex data
            if (!geom.attributes[Attribute.VERTEX]) {
                return;
            }

            const vertices = geom.attributes[Attribute.VERTEX];
            const n = vertices.length;
            // process vertices
            const transformed_points = new Array(n);
            // Buffer variable to prevent having to create a new map for each vertex, as
            // they share the same attributes
            let vertex_attributes = [];
            // storage for vertex outputs
            // each vertex has a number of outputs, that are filled by the vertex shader
            const vertex_outputs = new Array(
                n);
            for (let i = 0; i < n; i++) {
                vertex_outputs[i] = {};
            }

            for (let i = 0; i < n; i++) {
                // copy attributes in buffer
                for (const [key, values] of Object.entries(geom.attributes)) {
                    vertex_attributes[key] = values[i];
                }

                // call vertex shader
                transformed_points[i] =
                    program.vertex_shader.run(vertex_attributes, pipeline.uniform_data, vertex_outputs[i]);
            }

            // go through objects
            if (geom.topology === Topology.LINES) {
                // handles lines
                // handle two vertices per step
                for (let i = 0; i < n; i += 2) {
                    this.process_line(pipeline, transformed_points[i], transformed_points[i + 1],
                        vertex_outputs[i], vertex_outputs[i + 1]);
                }
            } else if (geom.topology === Topology.TRIANGLES) {
                // handle triangles

                // handle three vertices per step
                for (let i = 0; i < n; i += 3) {
                    this.process_triangle(pipeline, transformed_points[i], transformed_points[i + 1],
                        transformed_points[i + 2], vertex_outputs[i],
                        vertex_outputs[i + 1], vertex_outputs[i + 2]);
                }
            }
        }

        /**
         * Clips a polygon against the given clip-planes
         * @param {Array<AbstractMat>} points The input points
         * @param {Array<Object>} attribs The attributes per point
         * @param {Array<AbstractMat>} planes The clipping planes
         * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
         */
        clip_polygon(points,
            attribs,
            planes) {

            // Implementation of the Sutherland-Hodgman algorithm
            for (let pi = 0; pi < planes.length; pi++) {

                const pl = planes[pi];
                const output = [];
                const output_block = [];
                const size = points.length;
                for (let i = 0; i < size; i++) {

                    const cur = points[i];
                    const ip = (i - 1 + points.length) % points.length;
                    const prev = points[ip];

                    // compute distance
                    const dc = dot(pl, cur);
                    const dp = dot(pl, prev);

                    // cur inside
                    if (dc >= 0.0) {
                        // prev outside
                        if (dp < 0.0) {
                            // intersect prev -> cur

                            const t = dot(pl, prev) / (dot(pl, sub(prev, cur)));
                            const p = add(prev, scale(sub(cur, prev), t));

                            // interpolate attributes
                            const p_attribs = {};

                            for (let k in attribs[i]) {
                                p_attribs[k] =
                                    this.interpolate_line(attribs[ip][k], attribs[i][k], t);
                            }
                            output.push(p);
                            output_block.push(p_attribs);
                        }

                        output.push(cur);
                        output_block.push(attribs[i]);
                    } else if (dp >= 0.0) {
                        // cur outside, prev inside
                        // intersect prev->cur
                        // intersect in homogeneous space

                        const t = dot(pl, prev) / (dot(pl, sub(prev, cur)));

                        const p = add(prev, scale(sub(cur, prev), t));

                        // interpolate attributes
                        const p_attribs = {};

                        for (let k in attribs[i]) {
                            p_attribs[k] =
                                this.interpolate_line(attribs[ip][k], attribs[i][k], t);
                        }
                        output.push(p);
                        output_block.push(p_attribs);
                    }
                }

                points = output;
                attribs = output_block;
            }
            return [points, attribs];
        }


        /**
         * Clips a line against the given clip-planes
         * @param {Array<AbstractMat>} points The input points
         * @param {Array<Object>} attribs The attributes per point
         * @param {Array<AbstractMat>} planes The clipping planes
         * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
         */
        clip_line(points,
            attribs, planes) {

            // successive clipping at each plane
            // clpping a line at a plane is more or less one step of the
            // Sutherland-Hodgman algorithm, but without the polygon wrap-around
            for (let pi = 0; pi < planes.length; pi++) {
                const pl = planes[pi];
                if (points.length === 0) {
                    return;
                }

                const output = [];
                const output_block = [];

                // same algorithm as polygon... just without the looping around
                const i = 1;
                const ip = 0;

                const cur = points[i];
                const prev = points[ip];
                // compute projective distance

                const dc = dot(pl, cur);
                const dp = dot(pl, prev);

                // cur inside
                if (dc >= 0.0) {
                    // prev outside
                    if (dp < 0.0) {
                        // intersect prev -> cur

                        const t = dot(pl, prev) / (dot(pl, sub(prev, cur)));
                        const p = add(prev, scale(sub(cur, prev), t));

                        // interpolate attributes
                        const p_attribs = {};

                        for (let k in attribs[i]) {
                            p_attribs[k] =
                                this.interpolate_line(attribs[ip][k], attribs[i][k], t);
                        }
                        output.push(p);
                        output_block.push(p_attribs);
                        output.push(cur);
                        output_block.push(attribs[i]);
                    } else {
                        // both inside
                        output.push(prev);
                        output_block.push(attribs[ip]);
                        output.push(cur);
                        output_block.push(attribs[i]);
                    }

                } else if (dp >= 0.0) {
                    // cur outside, prev inside
                    // intersect prev->cur
                    // intersect in homogeneous space

                    const t = dot(pl, prev) / (dot(pl, sub(prev, cur)));
                    const p = add(prev, scale(sub(cur, prev), t));

                    // interpolate attributes
                    const p_attribs = {};

                    for (let k in attribs[i]) {
                        p_attribs[k] =
                            this.interpolate_line(attribs[ip][k], attribs[i][k], t);
                    }
                    output.push(prev);
                    output_block.push(attribs[ip]);
                    output.push(p);
                    output_block.push(p_attribs);
                }

                points = output;
                attribs = output_block;
            }
            return [points, attribs];
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

            const depth_options = pipeline.depth_options;

            const depth = pipeline.framebuffer.depth_buffer;
            // depth test
            if (depth_options.enable_depth_test &&
                !!depth &&
                frag_coord.at(2) > depth.at(px.at(0), px.at(1)).at(0)) {
                return;
            }

            if (depth_options.enable_depth_write &&
                !!depth) {
                depth.set(v32.from([frag_coord.at(2)]), px.at(0), px.at(1));
            }

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


    function create_depth_options({
        enable_depth_test = false,
        enable_depth_write = true
    } = {}) {
        return {
            enable_depth_test,
            enable_depth_write
        };
    }

    class Pipeline {
        constructor({
            viewport = {
                x: 0,
                y: 0,
                w: 0,
                h: 0
            },
            depth_options = create_depth_options(),
            framebuffer = Framebuffer.new(),
            attribute_interpolation = AttributeInterpolation.PERSPECTIVE_CORRECTED,
            clip_planes = [
                // Near plane -> required to avoid zero-divisions and reflections.
                // Other clip planes are optional
                vec4(0.0, 0.0, 1.0, 1.0),
                // Far plane
                // vec4(0.0, 0.0, - 1.0, 1.0),
            ],
            uniform_data = {}
        } = {}) {

            this.viewport = viewport;

            this.depth_options = depth_options;

            this.framebuffer = framebuffer;

            this.attribute_interpolation = attribute_interpolation;

            this.clip_planes = clip_planes;

            this.uniform_data = uniform_data;
        }
    }

    const module = {};
    module.Rasterizer = Rasterizer;
    module.Pipeline = Pipeline;
    module.Framebuffer = Framebuffer;

    module.AttributeInterpolation = AttributeInterpolation;


    // just a hacky "module" for liascript section import
    // this seems cleaner in the user code than having different names everywhere...
    window["r09"] = module;

})(); // End scope