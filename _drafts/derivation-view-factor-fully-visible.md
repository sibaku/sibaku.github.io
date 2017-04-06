---
layout: post
title:  "View factor derivation - Fully visible disk with oriented area element in normal direction from center"
categories: computer-graphics
tags: [cg, computer-graphics, view-factor, radiosity, graphics]
---

One method for computing diffuse global illumination is radiosity (<a href="https://en.wikipedia.org/wiki/Radiosity_(computer_graphics))" target="_blank">Radiosity</a>). The solution to the illumination problem is gained by bouncing light around all the surfaces in a scene until nothing changes anymore. To do this, one has to consider how much of the light arriving at one surface will be sent to another one. The proportion of the total light exchange is called view factor (sometimes form factor or configuration factor).

I just had to deal with a related problem, not radiosity, where I had to more or less compute the view factor of a differential surface patch (a point on a surface) and a disk. The point is located along the disk's normal, but rotated somewhat. This post will deal with the case, that disk is fully visible. You can find this and many other formulas at <a href="http://www.thermalradiation.net/" target="_blank">http://www.thermalradiation.net/</a>, even with references on where they are from. Sadly, when I looked up the sources for the specific formulas, they were horribly described and nearly unreadable imho.
So I plan to do a (hopefully) more easily understood derivation.

The quantity we want to compute is as follows:

$$F_{dA_1,A_2} = \int_{A_2}\frac{\cos\beta_1 \cos\beta_2 dA_2}{\pi r^2}$$

We have a differential area $$dA_1$$ and an area $$A_2$$. We now integrate over $$A_2$$, and for every differential area $$dA_2$$ on it, we connect it to $$dA_1$$. The length of that connection is $$r$$, the angle with the normal of $$dA_1$$ is $$\cos\beta_1$$ and the angle with the normal of $$dA_2$$ is $$\cos\beta_2$$.
There are various ways to deal with that problem depending on the geometry involved. One way can be found in a paper by Sparrow ("A new and Simpler Formulation for Radiative Angle Factors",1963). The key insight is, that Stoke's theorem can be used to compute that area integral, meaning you can transform the integral over the area into one over the surface's contour. The result is the following:

$$ \begin{align} F_{dA_1,A_2} &= l_1\oint_C \frac{(z_2-z_1)dy_2 - (y_2-y_1)dz_2}{2\pi r^2} \\ m_1\oint_C \frac{(x_2-x_1)dz_2 - (z_2-z_1)dx_2}{2\pi r^2} \\ n_1\oint_C \frac{(y_2-y_1)dx_2 - (x_2-x_1)dy_2}{2\pi r^2} \end{align}$$

$$l_1, m_1, n_1$$ are the components of $$dA_1$$'s normal expressed in a given coordinate system with the $$\mathbf{x}, \mathbf{y}, \mathbf{z}$$ axes. Or, as worded in the paper, they are the directional cosines, the cosines of the angle between the normal and each axis (or in other words, their dot product). The $$\oint_C$$ notation means, that we need a closed boundary curve, meaning we end where we start. The other values are the coordinates, their index representing which surface they belong to. Since we only go over the surface $$A_2$$, only those coordinates vary. $$r^2$$ is the squared distance between two points, so it can be computed as:

$$ r^2 = (x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2 $$

We can now get to our problem. First, let's sketch the setup:
