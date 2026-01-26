function region_code(x, y, minx, miny, maxx, maxy) {
  let result = 0;

  // Binary operators work by converting from/to a 32 bit integer
  if (x < minx) {
      result = result | SCREEN_CODE_LEFT;
  } else if (x > maxx) {
      result = result | SCREEN_CODE_RIGHT;
  }
  if (y < miny) {
      result = result | SCREEN_CODE_BOTTOM;
  } else if (y > maxy) {
      result = result | SCREEN_CODE_TOP;
  }
  return result;
}