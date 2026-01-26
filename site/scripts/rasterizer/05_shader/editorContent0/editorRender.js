img.fill(vec4(0,0,0,1));

for(let i = 0; i < renderables.length;i++) {
  const gi = renderables[i];
  // put the transformation in the uniform data
  pipeline.uniform_data.M = gi.local_to_world;
  // put the material in the uniform data
  pipeline.uniform_data.material = gi.material;

  // draw
  raster.draw(pipeline,gi.geometry);
}