const img = PixelImage.zeroF32(300,300,4);

const raster = new Rasterizer();

const renderables = [];

// plane geometry that we can reuse!
const plane = create_plane_geometry_xy();
const line = {
  attributes : {
    [Attribute.VERTEX]: [vec4(-1,0,0,1), vec4(1,0,0,1)]
  },
  topology: Topology.LINES
};

{
  const renderable = Renderable.new(plane, {
    local_transform : transform({pos : vec3(2.0 * img.w / 7.0, img.h / 2.0, 0.0), scale : vec3(img.w / 7.0,img.w / 7.0,img.w / 7.0)}),
    material : {
      color : vec4(1,0,0,1),
    }
  });
  renderables.push(renderable);
}

{
  const renderable = Renderable.new(plane, {
    local_transform : transform({pos : vec3(3.0 * img.w / 7.0, img.h / 3.0, 0.0), scale : vec3(img.w / 7.0,img.w / 8.0,0.0)}),
    material : {
      color : vec4(0,1,0,1),
    }
  });
  renderables.push(renderable);
}

// non-uniform scaling and rotation
{
  const renderable = Renderable.new(plane, {
    local_transform : transform({
      pos : vec3(img.w* 0.75, img.h *0.75, 0.0), scale : vec3(img.w *0.15,img.h*0.2,0.0),
      rot: jsm.axisAngle4(vec3(0,0,1),jsm.deg2rad(37.0))}),
    material : {
      color : vec4(1,0.5,1,1),
    }
  });
  renderables.push(renderable);
}

{
  const renderable = Renderable.new(line, {
    local_transform: transform({
      pos: vec3(img.w * 0.6, img.h *0.75, 0),
      scale : vec3(img.w/4,0,0)
    }),
    material : {
      color : vec4(0,1,1,1)
    }
  });
  renderables.push(renderable);
}