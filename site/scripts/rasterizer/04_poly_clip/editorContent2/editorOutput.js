const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

// draw the clipped triangle first
for(let i = 0; i < geoms_tri.length;i++) {
  raster.draw(pipeline,geoms_tri[i]);
}
// reset the clip planes and render the lines
// depending on the implementation, we might just put it all together,
// as lying on the clip plane counts as being inside, so the lines wouldnt be clipped.
// But there might be some numerical inaccuracies, so better to do it this way
pipeline.clip_planes = [];
for(let i = 0; i < geoms_lines.length;i++) {
  raster.draw(pipeline,geoms_lines[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);