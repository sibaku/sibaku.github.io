/**
 * @brief Linearly interpolate two values
 *
 * @param a The first value
 * @param b The second value
 * @param t The interpolation parameter in [0,1]
 * @return The interpolated value
 */
function interpolate_line(a, b, t) {
  // Differentiate between numbers and vectors due to missing operator overload
  // we simplify here and assume b to be the same type as a
  if (typeof (a) === 'number') {
    return (1.0 - t) * a + t * b;
  } else {
    // Otherwise assume the parameters to be vectors/matrices
    return add(scale(a, (1.0 - t)), scale(b, t));
  }
}