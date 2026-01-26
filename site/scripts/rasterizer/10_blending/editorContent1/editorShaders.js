const vertex_shader =  (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  // transform vertex into view space
  // the homogeneous coordinate stays the same, so we can just extract the 3D vector
  outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
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

  const final_color = vec4(0,0,0,0);

  const lights = uniforms.lights;

  const n = jsm.normalize(data["n_v"]);
  const p = data["p_v"];

  // go through lights
  for(let i = 0; i < lights.length;i++) {
    // compute the lighting model and add it to the final color
    const li = lights[i];

    const L = normalize(jsm.fromTo( p, li.p_v));

    const R = reflect(jsm.neg(L),n);
    const V = normalize(jsm.neg(p));

    const diff = clamp(dot(L,n),0,1);
    const spec = Math.pow(clamp(dot(R,V),0,1),shininess) * (diff > 0 ? 1 : 0);

    
    add(final_color, cwiseMult(scale(mat_diffuse,diff), li.color),final_color);
    add(final_color, cwiseMult(scale(mat_specular,spec), li.color),final_color);
  }

  // optional emission
  if(uniforms.material.emission) {
    add(final_color,uniforms.material.emission,final_color);
  }
  // we will use the diffuse alpha as the final alpha
  final_color.set(mat_diffuse.at(3),3);

  output_colors[0] = final_color;

  return true;
};