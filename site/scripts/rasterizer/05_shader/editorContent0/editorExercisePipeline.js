const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

// this will be overwritten by the renderloop
pipeline.uniform_data.M = jsm.MatF32.id(4,4);

const program = {
  vertex_shader : (attributes, uniforms) => {
    // *******************************
    // TODO
    // *******************************
    // transform vertex
    return attributes[Attribute.VERTEX];
  },
  fragment_shader : (frag_coord, data, uniforms, output_colors) => {
    // *******************************
    // TODO
    // *******************************
    // write out material color
    output_colors[0] = vec4(1.0,1.0,1.0,1.0);
    return true;
  }
};

// add the program to the pipeline
pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;