const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');


for(let i=0; i < rectangles.length; i++) {
  const ri = rectangles[i];
  draw_rect(pipeline, ri.x0, ri.y0, ri.w, ri.h, ri.color);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);