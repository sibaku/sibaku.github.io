class RasterizerTutorial extends Rasterizer {
/**
 * Computes the viewport transform for a given point and viewport
 * @param {AbstractMat} p The point
 * @param {Object} viewport The viewport
 * @returns The transformed point
 */
  viewport_transform(p, viewport) {
    p = copy(p);
    // perspective division
    // store 1/w in last components
    const w = p.at(3);
    for (let j = 0; j < 3; j++) {
      p.set(p.at(j) / w, j);
    }

    p.set(1.0 / w, 3);

    // viewport transform
    p.set(viewport.w / 2.0 * p.at(0) + viewport.w / 2.0 + viewport.x, 0);
    p.set(viewport.h / 2.0 * p.at(1) + viewport.h / 2.0 + viewport.y, 1);
    p.set(0.5 * (p.at(2) + 1.0), 2);

    return p;
  }
    /**
   * Processes a single line
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
   * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
   */
  process_line(pipeline, v0, v1,
    attribs_v0 = {}, attribs_v1 = {}) {
    // prepare points and data for clipping
    let points = [v0, v1];
    let attribs = [attribs_v0, attribs_v1];
    // clip line
    [points, attribs] = this.clip_line(points, pipeline.clip_planes, attribs);

    for (let i = 0; i < points.length; i++) {
      points[i] = this.viewport_transform(points[i], pipeline.viewport);
    }

    // finally rasterize line
    if (points.length === 2) {
      this.rasterize_line(pipeline, points[0], points[1], attribs[0], attribs[1]);
    }
  }

  /**
   * Processes a single triangle
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
   * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
   * @param {Object<Number|AbstractMat>} attribs_v2 The attributes of the third vertex
   */
  process_triangle(pipeline, v0, v1, v2,
    attribs_v0 = {}, attribs_v1 = {}, attribs_v2 = {}) {

    // prepare points and data for clipping
    let points = [v0, v1, v2];
    let attribs = [attribs_v0, attribs_v1, attribs_v2];
    // clip polygon
    [points, attribs] = this.clip_polygon(points, pipeline.clip_planes, attribs);

    for (let i = 0; i < points.length; i++) {
      points[i] = this.viewport_transform(points[i], pipeline.viewport);
    }

    // triangulate polygon (clipping the triangle may result in non triangles
    // polygons) and rasterize
    for (let i = 0; i + 2 < points.length; i++) {
      this.rasterize_triangle(pipeline, points[0], points[i + 1], points[i + 2], attribs[0],
        attribs[i + 1], attribs[i + 2]);
    }
  }
}