// predefined canvas for output
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

// create new rasterizer
const raster = new RasterizerTutorial();

// initially fill image with black
img.fill(vec4(0,0,0,1));

// try drawing the lines, there might be an error...
try{
  for(let i = 0; i < geoms.length;i++) {
    raster.draw(pipeline,geoms[i]);
  }
} catch(e) {
  output.error("Error");
  output.error(e);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);