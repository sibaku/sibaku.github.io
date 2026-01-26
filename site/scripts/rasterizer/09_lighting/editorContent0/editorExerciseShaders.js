const vertex_shader =  (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];

  // *******************************
  // TODO
  // *******************************
  // transform vertex into view space
  // the homogeneous coordinate stays the same, so we can just extract the 3D vector

  // *******************************
  // TODO
  // *******************************
  // transform the normal by the transposed inverse
  outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);

  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  // material data
  let mat_diffuse = uniforms.material.color;
  const mat_specular = uniforms.material.specular;
  const shininess = uniforms.material.shininess;

  // we tint the texture by the given color
  // we could also just replace it instead
  if(uniforms.material.tex) {
    mat_diffuse = cwiseMult(sample(uniforms.material.tex,uv),mat_diffuse);
  }

  // lights is an array
  // each light has the fields {p_w,p_v,color}
  // p_w: world position, p_v: view space position, color: the light color
  const lights = uniforms.lights;

  // use this to accumulate the final color
  const final_color = vec4(0,0,0,0);

  // *******************************
  // TODO
  // *******************************
  // get the position and normal
  // be sure to normalize the interpolated normal

  // *******************************
  // TODO
  // *******************************
  // go through lights
  // compute the phong lighting model
  // add to final color

  // optional emission
  if(uniforms.material.emission) {
    add(final_color,uniforms.material.emission,final_color);
  }
  // we will use the diffuse alpha as the final alpha
  final_color.set(mat_diffuse.at(3),3);

  output_colors[0] = final_color;

  return true;
};