const img = PixelImage.zeroF32(300,300,4);

const geoms = [];

const checkerboard = PixelImage.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = PixelImage.random(128,128);

{
  const geom = create_plane_geometry_xy();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(2.0 * img.w / 7.0, img.h / 2.0, 0.0), scale : vec3(img.w / 7.0,img.w / 7.0,img.w / 7.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : rand_tex,
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_plane_geometry_xy();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(4.0 * img.w / 7.0, img.h / 2.0, 0.0), scale : vec3(img.w / 7.0,img.w / 7.0,img.w / 7.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : checkerboard,
    }
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const program = { vertex_shader, fragment_shader };

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;