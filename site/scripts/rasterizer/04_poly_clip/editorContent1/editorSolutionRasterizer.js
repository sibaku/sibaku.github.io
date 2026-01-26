class RasterizerTutorial extends Rasterizer {

  /**
   * Processes a single triangle
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   */
  process_triangle(pipeline, v0, v1, v2) {
    // prepare points and data for clipping
    let points = [v0, v1, v2];
    // clip polygon
    points = this.clip_polygon(points, pipeline.clip_planes);

    // triangulate polygon (clipping the triangle may result in non triangles
    // polygons) and rasterize
    for (let i = 0; i + 2 < points.length; i++) {
      this.rasterize_triangle(pipeline, points[0], points[i + 1], points[i + 2]);
    }
  }
}