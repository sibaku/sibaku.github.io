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

    // *******************************
    // TODO
    // *******************************
    // decompose the result from the clipping into a number of triangles
    // call the this.rasterize_triangle(p0,p1,p2) methd for each of those
  }
}