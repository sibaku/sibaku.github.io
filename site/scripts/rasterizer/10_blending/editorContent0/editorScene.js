const img = PixelImage.zeroF32(300,300,4);
img.fill(vec4(0,0,0,1));

// *******************************
// this is a simplified version of our rasterizer write_fragment method
// here we just blend the colors, the full version just uses some more conditionals
// *******************************
const write_fragment = (pipeline, px, color) => {
  const blend_options = pipeline.blend_options;
  const frames = pipeline.framebuffer.color_buffers;

  // we only have one frame here
  const frame = frames[0];

  const blended_color = blend_colors(
    color, frame.at(px.at(0), px.at(1)), blend_options.constant_color,
    blend_options.source_function,
    blend_options.destination_function,
    blend_options.blend_equation);

  frame.set(blended_color, px.at(0), px.at(1));
};

// simple function to draw a rectangle
const draw_rect = (pipeline, x0,y0, w,h, color) => {
  // we assume here, that all values are correct
  for(let y = 0; y < h; y++) {
    for(let x = 0; x < w; x++) {
      const px = vec2(x0 + x, y0 + y);
      write_fragment(pipeline,px,color);
    }
  }
};
// our simplified pipeline
const pipeline = new Pipeline();

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;

// set the appropriate blend options
pipeline.blend_options.enabled = true;
pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

const rectangles = []
// some rectangles with different colors and alpha values
rectangles.push({x0:10,y0:10,w:100,h:100, color: vec4(1,0,0,0.5)});
rectangles.push({x0:80,y0:20,w:100,h:100, color: vec4(0,1,0,0.5)});
rectangles.push({x0:70,y0:60,w:40,h:200, color: vec4(0,0,1,0.75)});
rectangles.push({x0:20,y0:240,w:200,h:20, color: vec4(1,1,1,1)});
rectangles.push({x0:20,y0:200,w:200,h:20, color: vec4(1,1,1,0.75)});
rectangles.push({x0:20,y0:160,w:200,h:20, color: vec4(1,1,1,0.5)});
rectangles.push({x0:20,y0:120,w:200,h:20, color: vec4(1,1,1,0.25)});
rectangles.push({x0:20,y0:80,w:200,h:20, color: vec4(1,1,1,0.15)});