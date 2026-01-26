/**
 * Computes the minimum and maximum coordinates of an array of points
 * @param {Array<AbstractMat>} points The input points
 * @returns [bmin,bmax]
*/
function compute_screen_bounds(points) {
  // compute triangle screen bounds
  let bmin = vec2(Infinity, Infinity);
  let bmax = vec2(-Infinity, -Infinity);

  // *******************************
  // TODO
  // *******************************

  // Go through all the points and find the minimum and maximum x and y coordinates

  return [bmin, bmax];
}

// Helper function to test our algorithm
function fill_triangle_area(v0,v1,v2, img, viewport) {
  const points = [v0,v1,v2];

  const [bmin,bmax] = compute_screen_bounds(points);

  // pixel coordinates of bounds
  let ibmin = floor(bmin);
  let ibmax = ceil(bmax);

  // extent of the viewport
  // it starts at viewport.xy and has a width and height
  const viewport_max = vec2(viewport.x + viewport.w-1, viewport.y + viewport.h-1);
  const viewport_min = vec2(viewport.x, viewport.y);

  // *******************************
  // TODO
  // *******************************
  // clamp bounds so they lie inside the image region

  // *******************************
  // TODO
  // *******************************
  // handle case where its fully outside

  // *******************************
  // TODO
  // *******************************
  // iterate over the bounded region
}