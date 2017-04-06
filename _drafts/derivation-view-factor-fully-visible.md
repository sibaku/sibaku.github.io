---
layout: post
title:  "View factor derivation - Fully visible disk with oriented area element in normal direction from center"
categories: computer-graphics
tags: [cg, computer-graphics, view-factor, radiosity, graphics]
---

One method for computing diffuse global illumination is radiosity (<a href="https://en.wikipedia.org/wiki/Radiosity_(computer_graphics))" target="_blank">Radiosity</a>). The solution to the illumination problem is gained by bouncing light around all the surfaces in a scene until nothing changes anymore. To do this, one has to consider how much of the light arriving at one surface will be sent to another one. The proportion of the total light exchange is called view factor (sometimes form factor or configuration factor).

I just had to deal with a related problem, not radiosity, where I had to more or less compute the view factor of a differential surface patch (a point on a surface) and a disk. The point is located along the disk's normal, but rotated somewhat. This post will deal with the case, that disk is fully visible. You can find this and many other formulas at <a href="http://www.thermalradiation.net/" target="_blank">http://www.thermalradiation.net/</a>, even with references on where they are from. Sadly, when I looked up the sources for the specific formulas, they were horribly described and nearly unreadable imho.
So I plan to do a more
