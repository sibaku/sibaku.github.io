function draw_polygon(points, ctx) {
  // minimum 3 points
  if(points.length < 3) {
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].at(0),points[0].at(1));
  for(let i = 1; i < points.length; i++) {   
    const pi = points[i];
    ctx.lineTo(pi.at(0),pi.at(1));
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}