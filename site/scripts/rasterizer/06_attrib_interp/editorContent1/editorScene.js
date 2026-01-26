const img = PixelImage.zeroF32(300,300,4);

const geoms = [];

{
  const attributes = {};

  const vertices = [];
  const colors = [];

  const num = 180;
  const r = 0.45 * Math.min(img.w,img.h);

  for(let i = 0; i < num; i++) {
    const t = i/num;
    const x = r*Math.cos(Math.PI*2 * t);
    const y = r*Math.sin(Math.PI*2 * t);

    vertices.push(vec4(img.w / 2, img.h/2,0.0,1.0));
    vertices.push(vec4(img.w / 2 + x,img.h/2+y,0.0,1.0));

    // colors
    colors.push(vec4(0.25,0.25,0.25,1));
    colors.push(vec4((t*4.0) % 1.0,(t*2.0) % 1.0,(t*1.3) % 1.0,1));
  }

  attributes[Attribute.VERTEX] = vertices;

  // we could use any key
  attributes["color"] = colors;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(Renderable.new(geom));
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
const program = {
  vertex_shader : (attributes, uniforms, outputs) => {
    outputs["color"] = attributes["color"];
    return mult(uniforms.M,attributes[Attribute.VERTEX]);
  },
  fragment_shader :  (frag_coord, data,uniforms, output_colors) => {
    let color =  data["color"]

    output_colors[0] = color;
    
    return true;
  }
};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;