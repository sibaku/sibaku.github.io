const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');


const raster = new Rasterizer();

render(pipeline, raster, geoms);
imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);