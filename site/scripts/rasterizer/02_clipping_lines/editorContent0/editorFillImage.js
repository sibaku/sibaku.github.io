// this is the output
const img = PixelImage.zeroF32(300, 300, 4);

// minimum (bottom left) and maximum (top right) of our region
const bmin = vec2(60,60);
const bmax = vec2(240,240);

// iterate over each pixel
for(let y = 0; y < img.h; y++) {
  for(let x = 0; x < img.w; x++) {
    // compute the region code
    const code =  region_code(x, y, bmin.at(0), bmin.at(1), bmax.at(0),bmax.at(1));

    let color = vec4(0,0,0,1);

    // we could also use a switch case in this case, since we use actual equalities
    // this will just give a different color to the different regions
    if(code === (SCREEN_CODE_LEFT | SCREEN_CODE_TOP)) {
        color = ctl;
    }
    else if(code === (SCREEN_CODE_TOP)) {
        color = ctm;
    }
    else if(code === (SCREEN_CODE_RIGHT | SCREEN_CODE_TOP)) {
        color = ctr;
    }
    else if(code === (SCREEN_CODE_LEFT)) {
        color = cml;
    }
    else if(code === (SCREEN_CODE_RIGHT)) {
        color = cmr;
    }
    else if(code === (SCREEN_CODE_LEFT | SCREEN_CODE_BOTTOM)) {
        color = cbl;
    }
    else if(code === (SCREEN_CODE_BOTTOM)) {
        color = cbm;
    }
    else if(code === (SCREEN_CODE_RIGHT | SCREEN_CODE_BOTTOM)) {
        color = cbr;
    }else {
        // otherwise point is inside
        color = cmm;
    }

    img.set(color,x,y);
  }
}