class RasterizerTutorial extends Rasterizer {
  /**
   * @brief Linearly interpolate three values on a triangle
   *
   * @param {AbstractMat | Number} a The first value
   * @param {AbstractMat | Number} b The second value
   * @param {AbstractMat | Number} c The third value
   * @param {AbstractMat} barycentric The barycentric weights for each value
   * @return The interpolated value
   */
  interpolate_triangle(a, b, c, barycentric) {
    // Differentiate between numbers and vectors due to missing operator overload
    // we simplify here and assume b to be the same type as a
    if (typeof (a) === 'number') {
      // *******************************
      // TODO
      // *******************************
      // compute the barycentric interpolation for a number
      return a;
    } else {
      // Otherwise assume the parameters to be vectors/matrices

      // Note that we could be more efficient by using temporary vectors in 
      // which the add/scale operations are stored in. This form is chosen 
      // to be the direct translation of the number version

      // *******************************
      // TODO
      // *******************************
      // compute the barycentric interpolation for a matrix
      return a;
    }
  }
}