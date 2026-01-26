const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

const raster = new RasterizerTutorial();

// the lines that we want to clip with
// each entry is defined by two points that define a line in 2D
const lines = [
  [vec2(0,0), vec2(img.w,img.h*0.6)],
  [vec2(img.w,img.h * 0.8),vec2(0,img.h*0.7)],
  [vec2(50,img.h),vec2(img.w * 0.3,0)],
];

// computes the plane equation given two 2d vectors
function compute_plane(p0, p1) {
  const d = sub(p1, p0);
  // 2d normal
  const n = vec2(-d.at(1),d.at(0));
  // z is 0
  return vec4(n.at(0),n.at(1), 0, -dot(p0,n));
}

// add the clip planes
for(let i =0; i < lines.length;i++) {
  pipeline.clip_planes.push(compute_plane(lines[i][0],lines[i][1]));
}


img.fill(vec4(0,0,0,1));


for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);