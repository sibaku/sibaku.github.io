const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

img.fill(vec4(0, 0, 0, 1));

for (let i = 0; i < geoms.length; i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP, pipeline.uniform_data.M);
  pipeline.uniform_data.MV = mult(pipeline.uniform_data.V, pipeline.uniform_data.M);
  pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV), 0, 0, 3, 3));
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline, gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0], ctx);