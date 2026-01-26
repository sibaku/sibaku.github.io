class RasterizerTutorial extends Rasterizer {

  /**
   * Efficiently clip a line against the screen
   * @param {AbstractMat} a The start point
   * @param {AbstractMat} b The endpoint
   * @param {AbstractMat} bmin The minimum screen coordinates
   * @param {AbstractMat} bmax The maximum screen coordinate
   * @returns Array<AbstractMat> The clipped points. Might be empty, if the whole line was clipped
   */
  clip_screen(a, b, bmin, bmax) {
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

  rasterize_line(pipeline, a, b) {

    // call our new clipping code!
    // we use the screen coordinates that are given by the pipeline
    const clipped = this.clip_screen(a, b, vec2(pipeline.viewport.x, pipeline.viewport.y), vec2(pipeline.viewport.x + pipeline.viewport.w - 1, pipeline.viewport.y + pipeline.viewport.h - 1));
    if (clipped.length === 0) {
      return;
    }

    // use the clipped points as input for the previous routine
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
}
