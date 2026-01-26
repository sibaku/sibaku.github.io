class RasterizerTutorial extends Rasterizer {
  /**
   * Clips a line against the given clip-planes
   * @param {Array<AbstractMat>} points The input points
   * @param {Array<AbstractMat>} planes The clipping planes
   * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
   */
  clip_line(points, planes) {
    // successive clipping at each plane
    // clpping a line at a plane is more or less one step of the
    // Sutherland-Hodgman algorithm, but without the polygon wrap-around
    for (let pi = 0; pi < planes.length; pi++) {
        const pl = planes[pi];
        if (points.length === 0) {
          return [];
        }

        // simplified sutherland-hodgman
        const p0 = points[0];
        const p1 = points[1];
        // compute projective distance

        const d0 = dot(pl, p0);
        const d1 = dot(pl, p1);

        // the four cases
        // the actual implementation will combine them a bit, as there is a bit of overlap

        if (d1 < 0.0 && d0 < 0.0) {
          // case 1 - both outside -> finished
          return [];
        }
        else if (d1 >= 0.0 && d0 >= 0.0) {
          // case 2 - both inside -> continue with the next plane
          continue;
        }
        else if (d0 >= 0.0 && d1 < 0.0) {
          // case 3 - start inside, end outside
          // compute intersection
          const t = d0 / (d0 - d1);
          const p = add(p0, scale(sub(p1, p0), t));

          //  return startpoint and intersection
          // In this case we will just replace the points and continue with the next plane;
          points = [p0, p];
          continue;
        } else {
          // case 4 - start outside, end inside
          // compute intersection
          const t = d0 / (d0 - d1);
          const p = add(p0, scale(sub(p1, p0), t));

          // return intersection and endpoint
          points = [p, p1];

          continue;
        }
    }

    return points;
  }

  /**
   * Processes a single line
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   */
  process_line(pipeline, v0, v1) {
    // prepare points and data for clipping
    let points = [v0, v1];
    // clip line
    points = this.clip_line(points, pipeline.clip_planes);

    // finally rasterize line
    if (points.length === 2) {
      this.rasterize_line(pipeline, points[0], points[1]);
    }
  }
}