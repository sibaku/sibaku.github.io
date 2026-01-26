const vertex_shader = (attributes, uniforms, outputs) => {
  // *******************************
  // TODO
  // *******************************
  // store the "uv" attribute in the outputs so it gets interpolated

  // transform the vertices
  return mult(uniforms.M,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  let color = uniforms.material.color;

  // *******************************
  // TODO
  // *******************************
  // sample the texture stored in uniforms.materials.tex with the uv data, if the texture exists
  
  output_colors[0] = color;
  
  return true;
};