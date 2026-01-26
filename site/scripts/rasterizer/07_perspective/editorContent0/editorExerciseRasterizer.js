class RasterizerTutorial extends Rasterizer {
  /**
   * Computes the viewport transform for a given point and viewport
   * @param {AbstractMat} p The point
   * @param {Object} viewport The viewport
   * @returns The transformed point
   */
  viewport_transform(p, viewport) {
    p = copy(p);
    
    // *******************************
    // TODO
    // *******************************

    // perspective division

    // Divide each component of p by the last one (w)
    // store 1/w in last component, as it will be needed later

    // *******************************
    // TODO
    // *******************************

    // viewport transform

    // apply the viewport transform
    // The viewport parameter contains the fields x,y for the viewport origin and w,h for the width and height

    // transform the point [-1,1]^3 into [x,y,0] x [x + w, y + h, 1]

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

    // *******************************
    // Adding the viewport transform
    // *******************************
    for (let i = 0; i < points.length; i++) {
      points[i] = this.viewport_transform(points[i], pipeline.viewport);
    }
    // *******************************

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

    // *******************************
    // Adding the viewport transform
    // *******************************
    for (let i = 0; i < points.length; i++) {
      points[i] = this.viewport_transform(points[i], pipeline.viewport);
    }
    // *******************************
    
    // triangulate polygon (clipping the triangle may result in non triangles
    // polygons) and rasterize
    for (let i = 0; i + 2 < points.length; i++) {
      this.rasterize_triangle(pipeline, points[0], points[i + 1], points[i + 2], attribs[0],
        attribs[i + 1], attribs[i + 2]);
    }
  }
}