const w = 300;
const h = 300;

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

// simple helper to draw a line define by two points
function draw_plane(p0,p1) {
  ctx.save();

  const l = w + h;
  const center = scale(add(p0,p1),0.5);
  const v = jsm.normalize(jsm.fromTo(p0,p1));
  const start = add(center, scale(v,-0.5*l));
  const end = add(center, scale(v,0.5*l));

  ctx.beginPath();
  ctx.moveTo(start.at(0),start.at(1));
  ctx.lineTo(end.at(0),end.at(1));
  ctx.stroke();
  ctx.restore();
}

// the clip planes
const clip_planes = [];

for(let i =0; i < lines.length;i++) {
  clip_planes.push(compute_plane(lines[i][0],lines[i][1]));
}

const points_clipped = clip_polygon(points, clip_planes);