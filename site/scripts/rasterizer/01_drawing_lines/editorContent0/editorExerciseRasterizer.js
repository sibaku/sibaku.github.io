class RasterizerTutorial extends Rasterizer {
  rasterize_line(pipeline, p0, p1) {

    // use integer coordinates.
    // we could also do that later with this algorithm...
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    let px = vec2(x0, y0);

    // *******************************
    // TODO
    // *******************************
    // implement the line drawing
    // use the  code below, that writes a pixel for each pixel produced for the line in the loop that you will write

    // here is the pseudocode from above
    // 1. Compute m = (b_y - a_y) / (b_x - a_x)
    // 2. Start at the first point (x,y)=(a_x,a_y)
    // 3. Move from x to b_x to the right (increment x)
    //     1. Put a pixel where you currently are (x,y). This needs to be converted to integer values
    //     2. Increase y by m


    // move px to pixel center, not strictly necessary, but we do it here, as usually in frameworks such as OpenGL, the pixel is in the center of the rectangle around it
    add(px, vec2(0.5, 0.5), px);

    // the final pixel coordinate, it is called frag_coord (fragment coordinate) for a reason that will be explained later. 
    const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);

    // buffer for colors
    const output_colors = {};
    output_colors[0] = vec4(1, 0, 0, 1);
    this.write_fragment(pipeline, frag_coord, output_colors);
  }
}