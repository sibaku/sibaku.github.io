const img = PixelImage.zeroF32(300,100,4);

// calculate a color gradient!
const colora = vec4(1,0,0,1);
const colorb = vec4(0,0.5,1,1);

// we will just go along the x axis and fill the y values with the same 
// this is just so we can see something
for(let x = 0; x < img.w; x++) {
  const t = x / (img.w - 1);
  const val = interpolate_line(colora,colorb,t);
  for(let y = 0; y < img.h;y++) {
    img.set(val,x,y);
  }
}

// also interpolate values between numbers just to check
const values = [];
const min = 0;
const max = 10;
const num = 11;
for(let i = 0; i < num; i++) {
  let t = i / (num -1);

  const v = interpolate_line(min,max,t);
  values.push(v);
}

// write out results
output.log(`The ${num} values between ${min} and ${max} are: ${values.join(",")}`);