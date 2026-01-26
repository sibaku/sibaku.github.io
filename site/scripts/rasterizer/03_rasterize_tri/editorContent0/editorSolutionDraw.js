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

  for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
    for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
        img.set(vec4(1,0,0,1),x,y);
    }
  }
}
