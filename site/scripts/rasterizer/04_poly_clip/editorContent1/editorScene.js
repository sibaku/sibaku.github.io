const w = 300;
const h = 300;
const img = PixelImage.zeroF32(w, h, 4);

// input polygon points
// all lie in z = 0
const points = [
  vec4(20, 20, 0.0, 1.0),
  vec4(w - 10, 40, 0.0, 1.0),
  vec4(40, h - 20, 0.0, 1.0),
];

// the lines that we want to clip with
// each entry is defined by two points that define a line in 2D
const lines = [
  [vec2(0,0), vec2(w,h*0.6)],
  [vec2(w,h * 0.8),vec2(0,h*0.7)],
  [vec2(50,h),vec2(w * 0.3,0)],
];

// computes the plane equation given two 2d vectors
function compute_plane(p0, p1) {
  const d = sub(p1, p0);
  // 2d normal
  const n = vec2(-d.at(1),d.at(0));
  // z is 0
  return vec4(n.at(0),n.at(1), 0, -dot(p0,n));
}


const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;

// add the clip planes
for(let i =0; i < lines.length;i++) {
  pipeline.clip_planes.push(compute_plane(lines[i][0],lines[i][1]));
}

// we will try to draw a similar image to the one in the last step!
// for that, we change the state during the drawing operation

// the full example code already includes clipping lines with the same planes, we need to split them up
// we currently use only one object in each of them, but we could add multiple, so we use the same setup as in other examples
const geoms_tri = [];
const geoms_lines = [];

{
  const attributes = {};
  attributes[Attribute.VERTEX] = points;

  const geom = {
      attributes,
      topology: Topology.TRIANGLES
  };

  geoms_tri.push(geom);
}

{
  const attributes = {};

  // generate lines
  const line_vertices = [];

  for(let i = 0; i < lines.length;i++) {
    const [p0,p1] = lines[i];
    // create points far enough to cover the screen
    const l = w + h;
    const center = scale(add(p0,p1),0.5);
    const v = jsm.normalize(jsm.fromTo(p0,p1));
    const start = add(center, scale(v,-0.5*l));
    const end = add(center, scale(v,0.5*l));
    // put them into a vec4
    line_vertices.push(vec4(start.at(0),start.at(1),0,1));
    line_vertices.push(vec4(end.at(0),end.at(1),0,1));
  }
  attributes[Attribute.VERTEX] = line_vertices;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms_lines.push(geom);
}