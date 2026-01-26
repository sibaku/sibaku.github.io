class RasterizerTutorial extends Rasterizer {
  /**
   * Computes the minimum and maximum coordinates of an array of points
   * @param {Array<AbstractMat>} points The input points
   * @returns [bmin,bmax]
   */
  compute_screen_bounds(points) {
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

  /**
   * Computes twice the signed area of a given 2D triangle.
   * The triangle is assumed to be defined anti-clockwise
   * @param {AbstractMat} v0 The first 2D point
   * @param {AbstractMat} v1 The second 2D point
   * @param {AbstractMat} v2 The third 2D point
   * @returns Twice the signed area
   */
  signed_tri_area_doubled(v0, v1, v2) {
    return (v1.at(0) - v0.at(0)) * (v2.at(1) - v0.at(1)) - (v1.at(1) - v0.at(1)) * (v2.at(0) - v0.at(0));
  }

  /**
   * 
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   * @returns 
   */
  rasterize_triangle(pipeline, v0, v1, v2) {
    // compute triangle screen bounds
    let points = [v0, v1, v2];
    let [bmin, bmax] = this.compute_screen_bounds(points);

    // pixel coordinates of bounds
    let ibmin = floor(bmin);
    let ibmax = ceil(bmax);

    const viewport = pipeline.viewport;

    const viewport_max = vec2(viewport.x + viewport.w - 1, viewport.y + viewport.h - 1);
    const viewport_min = vec2(viewport.x, viewport.y);
    // clamp bounds so they lie inside the image region
    cwiseMax(ibmin, viewport_min, ibmin);
    cwiseMin(ibmax, viewport_max, ibmax);

    // handle case where its fully outside
    if (isAny(ibmin, viewport_max, (a, b) => a > b) ||
        isAny(ibmax, viewport_min, (a, b) => a < b)) {
      return;
    }

    // compute the double triangle area only once
    const area_tri = this.signed_tri_area_doubled(v0, v1, v2);

    // check if any the triangle has zero area with some epsilon, if so, don't rasterize
    const epsilon = 1E-8;
    if (Math.abs(area_tri) < epsilon) {
      return;
    }

    // check all pixels in screen bounding box
    for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
      for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
        // sample point in center of pixel
        const p = add(vec2(x, y), vec2(0.5, 0.5));

        let v = this.signed_tri_area_doubled(v2, v0, p);
        v /= area_tri;
        if (v + epsilon < 0.0) {
          continue;
        }

        let w = this.signed_tri_area_doubled(v0, v1, p);
        w /= area_tri;
        if (w + epsilon < 0.0) {
          continue;
        }

        let u = 1.0 - v - w;
        if(u + epsilon < 0.0)
        {
          continue;
        }

        // run  fragment shader with data
        const frag_coord = vec4(x, y, 0.0, 1.0);
        // run  fragment shader with data
        const output_colors = {};
        // write color data
        output_colors[0] = vec4(1, 1, 1, 1);

        this.write_fragment(pipeline, frag_coord, output_colors);
      }
    }
  }

  /**
   * Processes a single triangle
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   */
  process_triangle(pipeline, v0, v1, v2) {
    this.rasterize_triangle(pipeline, v0, v1, v2);
  }

  /**
   * Draw the given geometry
   * @param {Pipeline} pipeline The pipeline to use
   * @param {Object} geom Geometry object specifying all information
   */
  draw(pipeline, geom) {
    // no vertices
    // we could also take a parameter specifying the number of vertices to be
    // drawn and not rely on vertex data
    if (!geom.attributes[Attribute.VERTEX]) {
        return;
    }

    const vertices = geom.attributes[Attribute.VERTEX];
    const n = vertices.length;

    // go through objects
    if (geom.topology === Topology.LINES) {
      // handles lines
      // handle two vertices per step
      for (let i = 0; i < n; i += 2) {
        this.process_line(pipeline, vertices[i], vertices[i + 1]);
      }
    } else if (geom.topology === Topology.TRIANGLES) {
      // handle triangles
      // handle three vertices per step
      for (let i = 0; i < n; i += 3) {
        this.process_triangle(pipeline, vertices[i], vertices[i + 1],
              vertices[i + 2]);
      }
    }
  }
}