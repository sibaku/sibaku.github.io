class RasterizerTutorial extends Rasterizer {
  rasterize_line(pipeline, p0, p1) {
    // use integer coordinates
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

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

    // compute the change in x and y
    const dx = x1 - x0;
    const dy = y1 - y0;

    // starting y value
    let y = y0;

    // slope
    let m = dy / dx;

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

      // update y value with slope
      y += m;
    }
  }
}