const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
    raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);