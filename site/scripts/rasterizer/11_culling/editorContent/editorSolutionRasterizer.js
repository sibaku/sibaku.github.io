class RasterizerTutorial extends Rasterizer {
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

    // *******************************
    // culling
    // *******************************
    const culling_options = pipeline.culling_options;
    // determine signed area with 2d polygon winding (see GL specs. 14.8)
    
    // culling
    if (culling_options.enabled) {
      
      let a = 0.0;

      for (let i = 0; i < points.length; i++) {
        const p0 = points[i];
        const p1 = points[(i + 1) % points.length];
        a += p0.at(0) * p1.at(1) - p1.at(0) * p0.at(1);
      }
      const front_face = a > 0.0;

      // could be made easier
      if (front_face) {
        if (culling_options.cull_face == Culling.FRONT ||
                culling_options.cull_face == Culling.FRONT_AND_BACK) {
              // cull
              return;
        }
      } else {
        // backface
        if (culling_options.cull_face == Culling.BACK ||
            culling_options.cull_face == Culling.FRONT_AND_BACK) {
          // cull
          return;
        }
      }
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