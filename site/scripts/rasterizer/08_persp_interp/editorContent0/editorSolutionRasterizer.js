const AttributeInterpolation = {
  LINEAR: 0,
  PERSPECTIVE_CORRECTED: 1
};

class RasterizerTutorial extends Rasterizer {
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
    // *******************************
    // interpolate the triangle attributes accordint to the perspective correction
    // we pass in the inverse w coordinates directly
    // *******************************
    // As before, due to missing operator overloading, we will have to implement the formula twice, once for numbers and once for vectors/matrices
    // *******************************

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
    // *******************************
    // interpolate the line attributes accordint to the perspective correction
    // we pass in the inverse w coordinates directly
    // *******************************
    // As before, due to missing operator overloading, we will have to implement the formula twice, once for numbers and once for vectors/matrices
    // *******************************

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
   * Rasterize a line
   * @param {AbstractMat} a 
   * @param {AbstractMat} b 
   * @param {Object<Number|AbstractMat>} data_a 
   * @param {Object<Number|AbstractMat>} data_b 
   */
  rasterize_line(pipeline, a, b,
    data_a = {}, data_b = {}) {
    // clip
    const clipped = this.clip_screen(a, b, vec2(pipeline.viewport.x, pipeline.viewport.y), vec2(pipeline.viewport.x + pipeline.viewport.w - 1, pipeline.viewport.y + pipeline.viewport.h - 1));
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
        // *******************************
        // We choose either linear or perspective interpolation, depending on the setting
        // *******************************
        if (pipeline.attribute_interpolation === AttributeInterpolation.LINEAR) {
          data[i] = this.interpolate_line(data_a[i], data_b[i], t);
        } else {
          data[i] = this.interpolate_line_perspective(data_a[i], data_b[i],
            a.at(3), b.at(3), t);
        }
        // *******************************
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
        program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

      if (do_write_fragment) {
        this.write_fragment(pipeline, frag_coord, output_colors);
      }

      y += m;
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
  rasterize_triangle(pipeline, v0, v1, v2,
    data_v0 = {}, data_v1 = {}, data_v2 = {}) {
    // compute triangle screen bounds
    let points = [v0, v1, v2];
    let [bmin, bmax] = this.compute_screen_bounds(points);
    // pixel coordinates of bounds
    let ibmin = floor(bmin);
    let ibmax = ceil(bmax);

    const viewport = pipeline.viewport;

    const viewport_max = vec2(viewport.x + viewport.w - 1, viewport.y + viewport.h - 1);
    const viewport_min = vec2(viewport.x, viewport.y);
    // clamp bounds so they lie inside the image region
    cwiseMax(ibmin, viewport_min, ibmin);
    cwiseMin(ibmax, viewport_max, ibmax);

    // handle case where its fully outside
    if (isAny(ibmin, viewport_max, (a, b) => a > b) ||
      isAny(ibmax, viewport_min, (a, b) => a < b)) {
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

        let v = this.signed_tri_area_doubled(v2, v0, p);
        v /= area_tri;
        if (v + epsilon < 0.0) {
          continue;
        }

        let w = this.signed_tri_area_doubled(v0, v1, p);
        w /= area_tri;
        if (w + epsilon < 0.0) {
          continue;
        }

        let u = 1.0 - v - w;
        if (u + epsilon < 0.0) {
          continue;
        }

        const b = v32.from([u, v, w]);

        // interpolate values
        for (let i in data) {
          // *******************************
          // We choose either linear or perspective interpolation, depending on the setting
          // *******************************
          if (pipeline.attribute_interpolation == AttributeInterpolation.LINEAR) {
            data[i] = this.interpolate_triangle(data_v0[i], data_v1[i], data_v2[i], b);
          } else {
            data[i] = this.interpolate_triangle_perspective(
              data_v0[i], data_v1[i], data_v2[i], v0.at(3), v1.at(3), v2.at(3), b);
          }
          // *******************************
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
          program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

        if (do_write_fragment) {
          this.write_fragment(pipeline, frag_coord, output_colors);
        }
      }
    }
  }
}