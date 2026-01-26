class RasterizerTutorial extends Rasterizer {
  /**
   * Writes a number of output colors and depth to the pipeline's framebuffer.
   * Might apply depth test/write operations
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} frag_coord The fragment coordinate
   * @param {Object<AbstractMat>} colors A map containing the colors per output buffer
   */
  write_fragment(pipeline, frag_coord, colors) {
    const px = floor(subvec(frag_coord, 0, 2));

    // contains the fields enable_depth_test and enable_depth_write
    const depth_options = pipeline.depth_options;
    // the depth buffer image
    const depth = pipeline.framebuffer.depth_buffer;

    // *******************************
    // depth test
    // *******************************
    // First check, if the depth test is enabled if the depth image exists (!== null)
    // If both of these conditions are true, check if the fragments z coordinate is greater than the value store in the image at the pixel coordinates. If so, we can return, since the fragment is not visible
    // Attention: All images return vectors, even if they only have one component. So you will need to use .at(0) to access the buffer value
    if (depth_options.enable_depth_test && !!depth &&
        frag_coord.at(2) > depth.at(px.at(0), px.at(1)).at(0)) {
      return;
    }
    // *******************************
    // If we are still in the function, the depth test passed. If the depth write is enabled, we can now put the fragment's depth value into the depth buffer
    // Attention: As with the images .at function, .set expects a vector. You can create a 1D vector from the value v with v32.from([v])
    if (depth_options.enable_depth_write &&
        !!depth) {
      depth.set(v32.from([frag_coord.at(2)]), px.at(0), px.at(1));
    }
    // *******************************

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