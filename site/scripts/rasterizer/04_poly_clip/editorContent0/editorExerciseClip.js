/**
 * Clips a polygon against the given clip-planes
 * @param {Array<AbstractMat>} points The input points
 * @param {Array<AbstractMat>} planes The clipping planes
 * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
 */
function clip_polygon(points, planes) {
  // Implementation of the Sutherland-Hodgman algorithm
  for (let pi = 0; pi < planes.length; pi++) {
    // go through all clip planes
    const pl = planes[pi];

    // empty output, will replace the input variable
    const output = [];

    const size = points.length;

    // *******************************
    // TODO
    // *******************************
    // iterate over the edges, starting with the last one
    
    // *******************************
    // TODO
    // *******************************
    // Compute distances
    // handle cases and place result in output

    // the cases:
    // Both points outside? -> Nothing to do, continue
    // Both points inside? -> Append endpoint of edge to output
    // Startpoint inside, endpoint outside? -> Append intersection to output
    // Startpoint outside, endpoint inside? -> Append intersection and then the endpoint to output
    
    // replace points with the result of the current step
    points = output;
  }
  return points;
}