const img = PixelImage.zeroF32(300, 300, 4);

const geoms = [];

{
  const attributes = {};
  attributes[Attribute.VERTEX] = [
    vec4(10, 10, 0.0, 1.0),
    vec4(img.w - 10, 10, 0.0, 1.0),
    vec4(20, img.h / 2, 0.0, 1.0),

  ];

  const geom = {
    attributes,
    topology: Topology.TRIANGLES
  };

  geoms.push(geom);
}

{
  const attributes = {};
  attributes[Attribute.VERTEX] = [
    vec4(10, img.h - 10, 0.0, 1.0),
    vec4(img.w - 10, img.h/ 2.0, 0.0, 1.0),
  ];

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(geom);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;