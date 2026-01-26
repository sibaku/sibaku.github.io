class RasterizerTutorial extends Rasterizer {
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

          // *******************************
          // TODO
          // *******************************
          // compute interpolation paramter along line
          // this is the projection of the pixel center on the line
          let t = 0.0;
          // clamp the value to [0,1], as our line is in pixels and we sample the center
          // we might get (very small) issues

          // interpolate values
          for (let i in data) {
            data[i] = this.interpolate_line(data_a[i], data_b[i], t);
          }

          // the final fragment coordinate
          const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
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
}