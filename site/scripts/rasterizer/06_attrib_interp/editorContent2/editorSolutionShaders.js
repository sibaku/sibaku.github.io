const vertex_shader = (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  
  return mult(uniforms.M,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  let color = uniforms.material.color;

  if(uniforms.material.tex) {
    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);
  }
  
  output_colors[0] = color;
  
  return true;
};