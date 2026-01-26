/**
 * Computes twice the signed area of a given 2D triangle.
 * The triangle is assumed to be defined anti-clockwise
 * @param {AbstractMat} v0 The first 2D point
 * @param {AbstractMat} v1 The second 2D point
 * @param {AbstractMat} v2 The third 2D point
 * @returns Twice the signed area
 */
function signed_tri_area_doubled(v0, v1, v2) {
  // *******************************
  // TODO
  // *******************************
  // compute twice the summed area of the triangle using the edge function
  return 0.0;
}

/**
 * Computes the minimum and maximum coordinates of an array of points
 * @param {Array<AbstractMat>} points The input points
 * @returns [bmin,bmax]
*/
function compute_screen_bounds(points) {
  // compute triangle screen bounds
  let bmin = vec2(Infinity, Infinity);
  let bmax = vec2(-Infinity, -Infinity);

  // go through all points and find minimum and maximum values
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const p2 = vec2(p.at(0), p.at(1));
    cwiseMin(bmin, p2, bmin);
    cwiseMax(bmax, p2, bmax);
  }

  return [bmin, bmax];
}

function fill_triangle_area(v0,v1,v2, img, viewport) {
  const points = [v0,v1,v2];

  const [bmin,bmax] = compute_screen_bounds(points);

  // pixel coordinates of bounds
  let ibmin = floor(bmin);
  let ibmax = ceil(bmax);

  const viewport_max = vec2(viewport.x + viewport.w-1, viewport.y + viewport.h-1);
  const viewport_min = vec2(viewport.x, viewport.y);
  // clamp bounds so they lie inside the image region
  cwiseMax(ibmin, viewport_min, ibmin);
  cwiseMin(ibmax, viewport_max, ibmax);

  // handle case where its fully outside
  if (isAny(ibmin, viewport_max, (a, b) => a > b) ||
      isAny(ibmax, viewport_min, (a, b) => a < b)) {
    return;
  }

  // *******************************
  // TODO
  // *******************************
  // compute the double triangle area only once

  // *******************************
  // TODO
  // *******************************
  // check if any the triangle has zero area with some epsilon, if so, don't rasterize

  for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
    for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
      // sample point in center of pixel
      const p = add(vec2(x, y), vec2(0.5, 0.5));

      // *******************************
      // TODO
      // *******************************
      // compute barycentric coordinates
      // if any is negative -> continue

      img.set(vec4(1,0,0,1),x,y);
    }
  }
}