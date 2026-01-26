/**
 * Clips a polygon against the given clip-planes
 * @param {Array<AbstractMat>} points The input points
 * @param {Array<AbstractMat>} planes The clipping planes
 * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
 */
function clip_polygon(points, planes) {
  // Implementation of the Sutherland-Hodgman algorithm
  for (let pi = 0; pi < planes.length; pi++) {
    const pl = planes[pi];
    // empty output, will replace the input variable
    const output = [];

    const size = points.length;
    for (let i = 0; i < size; i++) {
      const cur = points[i];
      const ip = (i - 1 + points.length) % points.length;
      const prev = points[ip];

      // compute distance
      const dc = dot(pl, cur);
      const dp = dot(pl, prev);

      // the four cases
      if (dp < 0.0 && dc < 0.0) {
        // case 1 - both outside
        continue;
      }
      else if (dp >= 0.0 && dc >= 0.0) {
        // case 2 - both inside
        output.push(cur);
      }
      else if (dp >= 0.0 && dc < 0.0) {
        // case 3 - start inside, end outside
        // compute intersection
        const t = dp / (dp - dc);
        const p = add(prev, scale(sub(cur, prev), t));

        output.push(p);
      } else {
        // case 4 - start outside, end inside
        // compute intersection
        const t = dp / (dp - dc);
        const p = add(prev, scale(sub(cur, prev), t));

        output.push(p);
        output.push(cur);
      }
    }
    // replace points with the result of the current step
    points = output;
  }
  return points;
}