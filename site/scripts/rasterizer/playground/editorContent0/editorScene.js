const img = PixelImage.zeroF32(300,300,4);

const geoms = [];

const checkerboard = PixelImage.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = PixelImage.random(16,16);

// fill alpha with random values (with a function to make the differences sharper)
// glsl smoothstep
const smoothstep= (edge0, edge1, x) => {
    const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0.0), 1.0);
    return t * t * (3.0 - 2.0 * t);
};
let blurry_alpha_tex = PixelImage.zero(32,32);

{ 
    blurry_alpha_tex.apply((x,y) => {
    const v = Math.min(Math.pow(smoothstep(0.2,0.7,Math.random()),1/32),1.0);
    return vec4(1,1,1,v);
  });
  // simple filter
  const temp = PixelImage.zero(blurry_alpha_tex.w,blurry_alpha_tex.h);

  const filter = [1,4,6,4,1];
  let total = 0;
  for(let i = 0; i < filter.length;i++){
    total += filter[i];
  }
  const {w,h} = blurry_alpha_tex;
  const fr = Math.floor(filter.length/2);
  temp.apply((x,y) => {
    // x dir very simple
    let s = 0;
    for(let i = -fr; i <= fr; i++) {
      // clamp 
      const xi = Math.min(Math.max(x +i,0),w-1);
      s+= blurry_alpha_tex.at(xi,y).at(3) * filter[i + fr];
    }
    return vec4(1,1,1,s/total);
  });

  blurry_alpha_tex.apply((x,y) => {
    // y dir very simple
    let s = 0;
    for(let i = -fr; i <= fr; i++) {
      // clamp 
      const yi = Math.min(Math.max(y +i,0),h-1);
      s+= temp.at(x,yi).at(3) * filter[i + fr];
    }
    return vec4(1,1,1,s/total);
  });

}

// *******************************
// Simple helper function to populate a material with some default values
// *******************************
const phong_material = (props = {}) => {
  const {color = vec4(1,1,1,1),specular = vec4(1,1,1,1), shininess = 16, ...rest} = props;
  return {
    color, specular, shininess, ...rest
  };
};
// floor
{
	const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(0,-1.0,0), 
    	scale : vec3(2.0,2.0,2.0)}
    	),
    material : phong_material({
      color : vec4(0.8,0.8,0.8,1),
    })
  });
  geoms.push(renderable);
}

// left wall
{
	const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(0,1.0,-2), 
    	scale : vec3(2.0,2.0,2.0),
    	rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(90)),
    }),
    material : phong_material({
      color : vec4(0.9,0.1,0.1,1),
    })
  });
  geoms.push(renderable);
}

// right wall
{
	const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(0,1.0,2), 
    	scale : vec3(2.0,2.0,2.0),
    	rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-90)),
    }),
    material : phong_material({
      color : vec4(0.1,0.9,0.1,1),
    })
  });
  geoms.push(renderable);
}

// back wall
{
	const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(1,1.0,0), 
    	scale : vec3(2.0,2.0,2.0),
    	rot: jsm.axisAngle4(vec3(0,0,1),jsm.deg2rad(90)),
    }),
    material : phong_material({
      color : vec4(0.1,0.1,0.9,1),
    })
  });
  geoms.push(renderable);
}

// frosted glass
{
	const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(-1.5,1.1,0), 
    	scale : vec3(0.75,0.25,0.5),
    	rot: jsm.axisAngle4(vec3(0,0,1),jsm.deg2rad(37)),
    }),
    material : phong_material({
      color : vec4(0.9,0.6,0.9,1),
      tex: blurry_alpha_tex,
      transparent: true,
      tex_sampler: {
        interpolation_mode: Interpolation.LINEAR,
      }
    })
  });
  geoms.push(renderable);
}


// checkerboard cube
{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(-1.75,0,-1),
      scale : vec3(0.2,0.5,0.2),
    }),
    material : phong_material({
      color : vec4(0.9,0.9,0.9,1),
      tex: checkerboard
    })
  });
  geoms.push(renderable);
}

// checkerboard cube 2
{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
	    pos : vec3(0.5,2,0),
      scale : vec3(0.1,2,1),
    }),
    material : phong_material({
      color : vec4(0.9,0.9,0.9,1),
      tex: checkerboard
    })
  });
  geoms.push(renderable);
}

// rand cube
{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(-1.75,0,1),
      scale : vec3(0.2,0.5,0.2),
    }),
    material : phong_material({
      color : vec4(0.9,0.9,0.9,1),
      tex: rand_tex
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
const V = jsm.lookAt(vec3(-2.5,1,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

const lights = [];
lights.push({p_w:vec3(-2.5,2,0), color : vec3(0.7,0.7,0.7)});
lights.push({p_w:vec3(1,3,0), color : vec3(0.2,0.2,0.9)});
lights.push({p_w:vec3(0,1,0), color : vec3(0.1,0.1,0.1)});

// transform light world positions into view space
for(let i = 0; i < lights.length;i++) {
  const li = lights[i];
  li.p_v = copy(subvec(mult(V,hvec(li.p_w)),0,3));
}

// put into uniforms
pipeline.uniform_data.lights = lights;

const program = {vertex_shader, fragment_shader};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;
fb.depth_buffer = PixelImage.zero(img.w,img.h,1);

pipeline.framebuffer = fb;

pipeline.depth_options.enable_depth_test = true;

// *******************************
// enable culling
// *******************************
pipeline.culling_options.enabled = true;
// default value, but set it anyways
pipeline.culling_options.cull_face = Culling.BACK;
// *******************************