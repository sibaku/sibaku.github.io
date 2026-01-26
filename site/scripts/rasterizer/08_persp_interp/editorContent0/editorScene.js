const img = PixelImage.zeroF32(300,300,4);

const geoms = [];

const checkerboard = PixelImage.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = PixelImage.random(128,128);

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
    rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,0,0,1),
      tex : checkerboard
    }
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

const program = { vertex_shader, fragment_shader };

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

fb.depth_buffer = PixelImage.zero(img.w,img.h,1);
fb.depth_buffer.fill(vec4(1,1,1,1));

pipeline.depth_options.enable_depth_test = true;

pipeline.framebuffer = fb;