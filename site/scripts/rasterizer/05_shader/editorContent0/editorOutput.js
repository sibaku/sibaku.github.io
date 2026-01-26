const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);
