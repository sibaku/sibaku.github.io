// constants for the blend equation and function
// in this example, we will only implement a subset, the others work analogous
// you can have a look at the full source to see all constants and cases
const BlendEquation = { ADD: 1 };
const BlendFunction = {
  ZERO: 1,
  ONE: 2,
  SRC_ALPHA: 7,
  ONE_MINUS_SRC_ALPHA: 8
};


function compute_center(vertices) {
  // *******************************
  // TODO
  // *******************************
  // compute the center of all vertices
  // the center is the average value of all vertices
  // vertices is an array containing the points
  const total = vec4(0,0,0,0);

  return total;
}

function create_render_list(objects, pipeline) {
  const opaque = [];
  const transparent = [];

  // split up opaque and transparent objects
  for(let i = 0; i < objects.length;i++) {
      const gi = objects[i];
      if(gi.material && gi.material.transparent) {
        // we compute the center for the transparent objects
        const center = compute_center(gi.geometry.attributes[Attribute.VERTEX]);

        transparent.push({obj: gi, center});
      } else {
          opaque.push(gi);
      }
  }

  // *******************************
  // TODO
  // *******************************
  // compute the view space z of each transparent object
  // the model matrix is stored as a field local_to_world in each object
  const V = pipeline.uniform_data.V;

  // *******************************
  // TODO
  // *******************************
  // sort the transparent objects by z
  // as the z are negative, we need to sort from small to large to get backgroud to foreground order

  return {opaque, transparent};
}

function render(pipeline, rasterizer, objects) {
  // clear color buffers
  for(let key in pipeline.framebuffer.color_buffers) {
    pipeline.framebuffer.color_buffers[key].fill(vec4(0,0,0,1));
  }

  // clear depth buffer
  pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

  const {opaque, transparent} =  create_render_list(objects, pipeline);
  // draw opaque objects normally
  for(let i = 0; i < opaque.length;i++) {
    const gi = opaque[i];
    pipeline.uniform_data.M = gi.local_to_world;
    pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
    pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
    pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
    pipeline.uniform_data.material = gi.material;

    rasterizer.draw(pipeline,gi.geometry);
  }

  // enable alpha blended transparency
  pipeline.blend_options.enabled = true;
  pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
  pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

  // we only want depth tested, but the transparent objects should not be able to cover other transparent objects, so we disable depth writing
  pipeline.depth_options.enable_depth_write = false;

  // go through transparent objects and draw them
  for(let i = 0; i < transparent.length;i++) {
      const gi = transparent[i].obj;
      pipeline.uniform_data.M = gi.local_to_world;
      pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
      pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
      pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
      pipeline.uniform_data.material = gi.material;

      rasterizer.draw(pipeline, gi.geometry);
  }

  // restore the default options after finishing the transparent objects
  pipeline.depth_options.enable_depth_write = true;
  pipeline.blend_options.enabled = false;

}