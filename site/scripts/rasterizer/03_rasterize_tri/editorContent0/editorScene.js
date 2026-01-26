// output image
const img = PixelImage.zeroF32(300, 300, 4);

// set the viewport to the full image
const viewport = {x: 0, y:0, w : img.w, h : img.h};

// fill triangle 1
{
  // define 3 points
  const v0 = vec4(-10,-40,0,1);
  const v1 = vec4(100,40,0,1);
  const v2 = vec4(120,400,0,1);
  fill_triangle_area(v0,v1,v2,img,viewport);
}


// fill triangle 2
{
  // define 3 points
  const v0 = vec4(200,40,0,1);
  const v1 = vec4(260,50,0,1);
  const v2 = vec4(230,200,0,1);
  fill_triangle_area(v0,v1,v2,img,viewport);
}