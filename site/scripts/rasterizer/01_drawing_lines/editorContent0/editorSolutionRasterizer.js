class RasterizerTutorial extends Rasterizer {
  rasterize_line(pipeline, p0, p1) {

    // use integer coordinates
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    // compute the change in x and y
    const dx = x1 - x0;
    const dy = y1 - y0;

    // starting y value
    let y = y0;

    // slope
    let m = dy / dx;

    for (let x = x0; x <= x1; x++) {
      let px = vec2(x, y);

      // move px to pixel center, not strictly necessary, but we do it here, as usually in frameworks such as OpenGL, the pixel is in the center of the rectangle around it
      add(px, vec2(0.5, 0.5), px);

      // the final pixel coordinate, it is called frag_coord (fragment coordinate) for a reason that will be explained later. 
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