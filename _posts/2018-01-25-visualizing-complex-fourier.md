---
layout: post
title:  "Visualizing a complex fourier series"
categories: other
tags: [javascript,coding]
---

I recently saw a GIF of epycycles tracing out a drawing. So I made something like that myself. Below you can find a simple script, where you can draw a curve and afterwards it will be drawn by a number of circles. Each circle has a stick attached from the midpoint to the boundary. If it is the last circle, we attach a pen there, otherwise another circle with the same setup. We now rotate each of the circles with different speeds. The result will be another curve trying to recreate the one you have drawn. The more circles you use, the more both curves will equal each other. You can set the number of circles and the time it takes for one round.

{% include fourierEpycycles.html%}

This whole thing is based on fourier series. I will keep the description short for now. If there would be some interest for more, I may expand upon it. In the meantime, the Wikipedia entry linked below and the one on complex numbers probably cover everything. If you have seen them before, you have probably seen a visualization for real functions, where you stack different frequencies and amplitudes of sine and cosine waves on top of each other. The script above just shows you the case for a complex valued function (https://en.wikipedia.org/wiki/Fourier_series#Complex-valued_functions). While complex numbers sound hard, they are not that hard to understand in principle. Basically we need addition and multiplication. While complex numbers are usually written in the form $$ a + bi$$, wher $$i $$ is the imaginary unit, we can just think about a 2D space, a piece of paper with an $$ x $$ and $$ y $$ axis. $$ a $$ is just the $$ x $$ coordinate and $$ b $$ the $$ y $$ coordinate. We can then draw an arrow to that position from the origin. Adding two complex numbers is just drawing the second arrow starting from the end of the first one and then connecting the origin with the end of the second one. We can also represent such an arrow by its length and the angle with the $$x$$ axis. With that we can say how to multiply two numbers. It is just the lengths multiplied and the angles added. The fourier series in the Wikipedia link is just a sum of different complex numbers. Each of these consists of a coefficient $$ c_n$$, which has a length and an angle. The second part in each summand is (setting the Interval $$P$$ to $$1$$) $$ e^{2\pi i n x} $$. Without going too much into detail, this one always has a length of $$1$$. So multiplying $$c_n$$ by it just has the effect of rotating $$c_n$$. By varying $$x$$ we can trace out a full circle that way. That is the one being drawn! 

So we draw each circle with the radius given by the length of $$ c_n $$ and the attached stick with an angle given by the added angles of $$c_n$$ and the one coming from $$e^{2\pi i n x}$$. And that is what you see above :)

The first frequency does not do much, it actually is just the center point. Afterwards you will see the first circle with a size comparable to your drawn curve. More circles will slowly help to get closer to the real shape.

