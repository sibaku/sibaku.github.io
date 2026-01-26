const vertex_shader = (attributes, uniforms, outputs) => {
  // *******************************
  // TODO
  // *******************************
  
  outputs["uv"] = attributes[Attribute.UV];

  // multiply the input point in attributes[Attribute.VERTEX] with the model-view-projection (MVP) matrix
  // the MVP matrix is stored as MVP in uniforms
  return attributes[Attribute.VERTEX];
};

// basic fragment shader that applies a color and texture to an object
const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  let color = uniforms.material.color;

  if(uniforms.material.tex) {
    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);
  }

  output_colors[0] = color;
              
  return true;
};