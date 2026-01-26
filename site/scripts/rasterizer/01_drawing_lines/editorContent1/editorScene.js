// this is the output
const img = PixelImage.zeroF32(300, 300, 4);

// a list of objects, that we call geometries
const geoms = [];

{
  // this will be a bit different later, but for now this will just contain endpoints of lines

  const attributes = {};

  // the data for lines
  // we can put many lines into one object
  // our convention is: Each two consecutive points (vertices) define a line's start and endpoint
  const vertices = [];

  // create lines in a circle
  const num = 20;
  const r = 0.35 * Math.min(img.w, img.h);

  for (let i = 0; i < num; i++) {
    const x = r * Math.cos(Math.PI * 2 * i / num);
    const y = r * Math.sin(Math.PI * 2 * i / num);

    vertices.push(vec4(img.w / 2, img.h / 2, 0.0, 1.0));
    vertices.push(vec4(img.w / 2 + x, img.h / 2 + y, 0.0, 1.0));
  }

  // assign the vertices to the vertex attribute
  attributes[Attribute.VERTEX] = vertices;

  // a geometry is a combination of attributes and object type (topology)
  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(geom);
}

// the state of our processing
// for now, this will just be the output image
const pipeline = new Pipeline();

// we have one output, the image created at the top
const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;