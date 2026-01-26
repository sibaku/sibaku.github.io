// constants for the blend equation and function
// in this example, we will only implement a subset, the others work analogous
// you can have a look at the full source to see all constants and cases
const BlendEquation = { ADD: 1 };
const BlendFunction = {
  ZERO: 1,
  ONE: 2,
  SRC_ALPHA: 7,
  ONE_MINUS_SRC_ALPHA: 8
};

/**
 * @brief Get the blend factor for the given parameters
 *
 * @param source The source (fragment) color
 * @param destination The destination (frame) color
 * @param color_const A constant color
 * @param blend_function The blend function to be used
 * @return The blend factor
 */
function get_blend_factor({ source,
    destination,
    color_const = vec4(0.0, 0.0, 0.0, 0.0), blend_function }) {

  // *******************************
  // TODO
  // *******************************
  // compute the blend factor corresponding to the blend function
  // scalar values will just be vec4s with equal components

  return vec4(0.0, 0.0, 0.0, 0.0);
  
}
/**
 * Blends a source color into a destination according to the blending rules
 * @param {AbstractMat} source The source (input) color
 * @param {AbstractMat} destination The destination (current output) color
 * @param {AbstractMat} color_const A constant color
 * @param {Number} source_function The source factor function
 * @param {Number} destination_function The destination factor function
 * @param {Number} blend_equation The blending equation
 * @returns The blended  color
 */
function blend_colors(source, destination, color_const,
    source_function, destination_function, blend_equation) {
  // *******************************
  // TODO
  // *******************************
  // get the weight factors for source and destination

  // apply the blend formulat depending on the given blend_equation
  // blend_equation will be a constant in BlendEquation
   
  return vec4(0, 0, 0, 0);
}