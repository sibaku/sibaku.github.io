const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');

canvas.width = w;
canvas.height = h;

// flip canvas
ctx.setTransform(1,0,0,-1,0,canvas.height);

ctx.save();
ctx.fillStyle = "rgb(0,0,0)";
ctx.fillRect(0,0,w,h);
ctx.restore();

ctx.save();
ctx.fillStyle = "rgb(64,64,64)";
ctx.strokeStyle = "rgba(0,0,0,0)";
draw_polygon(points,ctx);
ctx.restore();

ctx.save();
ctx.fillStyle = "rgb(255,255,255)";
ctx.strokeStyle = "rgba(34, 14, 14, 0)";
draw_polygon(points_clipped,ctx);
ctx.restore();

ctx.save();
ctx.strokeStyle = "rgb(255,0,0)";

for(let i = 0; i < lines.length;i++) {
  draw_plane(lines[i][0],lines[i][1]);
}

ctx.restore();