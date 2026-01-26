const img = PixelImage.zeroF32(300,300,4);

const geoms = [];

const checkerboard = PixelImage.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = PixelImage.random(128,128);

// *******************************
// Simple helper function to populate a material with some default values
// *******************************
const phong_material = (props = {}) => {
  const {color = vec4(1,1,1,1),specular = vec4(1,1,1,1), shininess = 16, ...rest} = props;
  return {
    color, specular, shininess, ...rest
  };
};

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos: vec3(-0.38,0.3, 0.3),
      scale : vec3(0.2,1.0,0.3),
      rot: mult(
        jsm.axisAngle4(vec3(0,0,1),jsm.deg2rad(90))
        ,jsm.axisAngle4(vec3(0,1,0),jsm.deg2rad(85))),
    }),
    material : phong_material({
      color : vec4(0.75,0.85,0.5,0.8),
      transparent : true,
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,0,0,1),
      tex : checkerboard
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : phong_material({
      color : vec4(0.1,0.85,0.5,0.75),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    })
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
    material : phong_material({
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    })
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

// *******************************
// add lights
// *******************************
const lights = [];
lights.push({p_w:vec3(-1.5,2,-2.7), color : vec3(0.7,0.7,0.7)});
lights.push({p_w:vec3(-5,6,5), color : vec3(0.2,0.2,0.9)});

// transform light world positions into view space
for(let i = 0; i < lights.length;i++) {
  const li = lights[i];
  li.p_v = copy(subvec(mult(V,hvec(li.p_w)),0,3));
}

// put into uniforms
pipeline.uniform_data.lights = lights;
// *******************************

const program = {vertex_shader, fragment_shader};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;
fb.depth_buffer = PixelImage.zero(img.w,img.h,1);

pipeline.framebuffer = fb;

pipeline.depth_options.enable_depth_test = true;
