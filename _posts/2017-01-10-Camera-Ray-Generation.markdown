---
layout: post
title:  "Camera ray from projection and view matrix"
categories: cg computer-graphics ray-tracing tracing graphics
---

You may come into the situation, that you need to generate rays through a pixel. This could be for clicking on the screen to select an object or for a ray tracing application.
There are of course other articles about this, but I feel they overcomplicate it. Here, I want to show a pretty simple way to generate rays, given a projection and a view matrix typically used in OpenGL and other Frameworks/APIs. I won't go into the details of these matrices, as they are covered in detail in many places, such as http://www.songho.ca/opengl/gl_projectionmatrix.html

If you are only interested in the code, here is a glsl example:
{% highlight glsl %}
// This assumes the pixel position px to be in [0,1], 
// which can be done by (x+0.5)/w or (y+0.5)/h to sample pixel centers
vec3 createRay(vec2 px, mat4 PInv, mat4 VInv)
{
	 
	// convert pixel to NDS
	// [0,1] -> [-1,1]
	vec2 pxNDS = px*2. - 1.;

	// choose an arbitrary point in the viewing volume
	// z = -1 equals a point on the near plane, i.e. the screen
	vec3 pointNDS = vec3(pxNDS, -1.);

	// as this is in homogenous space, add the last homogenous coordinate
	vec4 pointNDSH = vec4(pointNDS, 1.0);
	// transform by inverse projection to get the point in view space
	vec4 dirEye = PInv * pointNDSH;

	// since the camera is at the origin in view space by definition,
	// the current point is already the correct direction (dir(0,P) = P - 0 = P
	// as a direction, an infinite point, the homogenous component becomes 0
	// the scaling done by the w-division is not of interest, as the direction
	// in xyz will stay the same and we can just normalize it later
	dirEye.w = 0.;

	// compute world ray direction by multiplying the inverse view matrix
	vec3 dirWorld = (VInv * dirEye).xyz;

	// now normalize direction
	return normalize(dirWorld); 
}

{% endhighlight %}

The basic idea is very simple. We reverse the transformation pipeline. We usually want our rays to be in world-space, so that's why we need the view matrix. Just as a reminder:

View matrix $$\mathbf{V}$$ - Transforms world coordinates to view coordinates

Projection matrix $$\mathbf{P}$$ - Transforms view coordinates to clip coordinates

Division by the homogenous coordinate brings us from clip space to normalized device coordinates (NDC). The projection matrix encodes a viewing frustum, a truncated pyramid, with a near plane and a far plane. The frustum will be transformed in a cube $$[-1,1]^3$$ after division by the homogenous coordinate. The near plane (all values with $$z$$ equal to $$-n$$) will be mapped to $$-1$$, while the far plane is mapped to $$1$$.

We start with a point in NDC on the near plane (it could be somewhere else though). So we already know the $$z$$-coordinate: $$-1$$.
Next are the $$xy$$-coordinates. NDC starts at the bottom left and goes from $$-1$$ to $$1$$ and represents your screen. If your screen coordinate system also starts on the bottom left, we can work directly with the coordinates, otherwise we need to invert the $$y$$-axis as $$y =  h - y_{inverted}$$, where $$h$$ is the screen's height.

$$\begin{pmatrix} x & y \end{pmatrix}$$ lies in $$[0,w-1]\times[0,h-1]$$, where $$w$$ is the screen's width. First we transform this to be in $$[0,1]$$. You probably want to sample the pixel centers, so we add $$0.5$$ and divide by $$w$$ and $$h$$ respectively.


$$x_{\text{screen}} = (x+0.5)/w $$

$$y_{\text{screen}} = (y+0.5)/h $$ or $$ y_{\text{screen}} = (h-y+0.5)/h $$ for top left screens.


Next we change to NDC.


$$x_{\text{NDC}} = x_{\text{screen}}*2 -1 $$

$$y_{\text{NCD}} = y_{\text{screen}}*2 -1 $$


Both values are now in $$[-1,1]$$. Our 3D point in NDC is then


$$ \mathbf{p}_{\text{NDC}} = \begin{pmatrix} x_{\text{NDC}} \\ y_{\text{NDC}} \\ -1 \end{pmatrix}$$


Next we make the point homogenous by adding a $$1$$ as the last coordinate.


$$ \mathbf{\hat{p}}_{\text{NDC}} = \begin{pmatrix} x_{\text{NDC}} \\ y_{\text{NDC}} \\ -1 \\ 1 \end{pmatrix}$$


I use the hat to symbolize homogenous points.
Next we go to view space. For that we use the inverse projection matrix.


$$ \mathbf{\hat{p}}_{\text{View}} = \mathbf{P}^{-1}\mathbf{p}_{\text{NDC}} $$


The result is a homogenous point in view space located on the near plane. Now for the two important things. First: In view space, the camera lies at the origin. We are interested in the direction from the camera to the point we just computed. Since the camera is in the origin, the line through the point is just written as $$ t * \mathbf{p}_{\text{View}} $$ with $$ t $$ being all real values. Now the second important thing: Division by the homogenous coordinate to get the real 3D point won't change the direction of the $$x,y,z$$ ray through the origin. So the $$xyz$$ coordinates of $$ \mathbf{\hat{p}}_{\text{View}}$$ already represent the direction we care about.

If you really need view space directions, you can stop here and use the first three entries of  $$ \mathbf{\hat{p}}_{\text{View}}$$ and normalize them.

To get world space directions, we have to transform from view to world space with the inverse view matrix. Since we are only interested in the direction, not a concrete point, we set the homogenous part of  $$ \mathbf{\hat{p}}_{\text{View}}$$ to zero.

 $$ \mathbf{\hat{q}}_{\text{View}} = \begin{pmatrix} \mathbf{\hat{p}}_{\text{View},x} \\ \mathbf{\hat{p}}_{\text{View},y} \\ \mathbf{\hat{p}}_{\text{View},z} \\ 0 \end{pmatrix}$$
 
 
 Then the transformation:
 
 
 $$\mathbf{\hat{q}}_{\text{World}}  = \mathbf{V}^{-1}\mathbf{\hat{q}}_{\text{View}} $$
 
 
 The first three components now describe our world ray, so we just normalize them and are finished.
 
 $$\mathbf{v}_{\text{World}} = \begin{pmatrix} \mathbf{\hat{q}}_{\text{World},x} \\ \mathbf{\hat{q}}_{\text{World},y} \\ \mathbf{\hat{q}}_{\text{World},z} \end{pmatrix} $$
 
 
 $$ \mathbf{v}_{\text{World}}' = \frac{\mathbf{v}_{\text{World}}}{\lVert \mathbf{v}_{\text{World}} \rVert} $$
 
