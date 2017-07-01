---
layout: post
title:  "Simple epicycle script for recreational coding"
categories: other
tags: [javascript,coding]
---

I saw a nice GIF of some line drawing with epicycles of stacked circles. Did a very simple Version for myself as a form of recreational coding. The images are soothing to me, even if I haven't found the greatest parameters yet. You can play around with it too, if you like. It's pretty simple. Just insert the values you want in the text field and hit the Button. The syntax is as follows:

[] needs to be outside

Inside you can put a number of circles, each one stacked on the last one. A circle is described by its radius (r) in pixels and its rotations per second (rps). A third value can place the 'pencil' of the last circle off its center and is a ratio (0 is the center, 1 is on the circle). Note: You have to write numbers, i.e. 1/7 won't work. If the circle should take N seconds to rotate around, the rps is 1/N. Each Circle can be written as

[r,rps,offset] You can omit values from the right, default values will be set.

In total, it looks like this:

[[r1,rps1,offset1],[r2,rps2,offset2],...,[rn,rpsn,offsetn]]

Example:
Two circles. The first one takes 10 seconds to rotate, and has a radius of 40 pixels. The second one takes 2 seconds and has a radius of 10 pixels. Its drawpoint is offset by 2 times its radius.

[[40,0.1],[10,0.5,2]]

{% include cycloidCanvas.html%}

