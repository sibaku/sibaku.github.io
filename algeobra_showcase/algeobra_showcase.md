<!--
author: sibaku

version:  0.0.1

language: en

script: ./algeobra_showcase/src/demoShowcase.js
link: ./algeobra_showcase/customStyle.css

comment:  Showcase for the algeobra library

attribute: [Sibaku github.io](https://sibaku.github.io/)
    by sibaku (he/him) ([twitter](https://twitter.com/sibaku1), [mastodon](https://mas.to/@sibaku), [cohost](https://cohost.org/sibaku))
    is licensed under [MIT](https://opensource.org/licenses/MIT)

@mutate.remover
<script>
// This is a hack to remove added elements from a container, when it was dynamically created
// A mutation observer checks, whether the id was changed and if so, removes the inner parts

let container = window.document.getElementById('@0')

if(container){
    // based on the example at https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    const config = { attributes: true, subtree: true, childList : true};
    const callback = (mutationsList, observer) => {

        for(const mutation of mutationsList) {

            // check for changes to the child list
            if (mutation.type === 'childList') {

                for (const rn of mutation.removedNodes) {
                    if (rn === container) {
                        container.replaceChildren();
                        observer.disconnect();
                        return;
                    }
                }
            }

            if(mutation.target !== container){
                continue;
            }
            if (mutation.type === 'attributes') {
                if(mutation.attributeName === 'id')
                {
                    // remove inner
                    container.replaceChildren();
                    // remove observer afterwards
                    observer.disconnect();
                    return;

                }
            }
        }
        
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(document.body, config);
}

</script>
@end

@algeobra.demo
<div id="@0" width="300" height="300">
<canvas id="@0-canvas" width = "400" height = "400"></canvas>
</div>
<script>
    const container = document.getElementById("@0");
    const canvas = document.getElementById("@0-canvas");
    canvas.classList.add("demoCanvas");

    // TODO Maybe remove, only for editing, as devserver doesn't seem to work correctly with script loading order
    
    let num = 0;
    const maxTry = 20;
    const tryRun = () => {
        if(typeof @1 !== "undefined")
        {
            @1(container,canvas);
        }else 
        {
            console.log("try again");
            num++;
            if(num < maxTry){
                setTimeout(tryRun, 100);
            }
        }
    };
    
    tryRun();
</script>

@mutate.remover(@0)
@end
-->

# Introduction

This is a selection of some demos to showcase some of the capabilities of the **algeobra** library. 
The name is a homage to the wonderful **GeoGebra** which this library is not a substitute for. **algeobra** aims to give you an easy to include and customize alternative to the 2D geometry functionality found in tools such as GeoGebra, but for use in JavaScript. That means, all demos can be created in Code and combined with various other tools.
For example, you can build simple interfaces such as sliders with the provided geometry itself or just use the usual HTML based interaction. 
A basic canvas visualization is included, together with tools for moving points with the mouse or touches, but you could just write your own output, for example to create an SVG.
Custom object types can also be added, as the base system is independent of actual types. For example, you could add graphs or images as objects that can be attached to others.

The following are not full notes, proofs or write-ups. Demos are accompanied by a short description and sometimes example text to see the way the library could be used to enhance explanations.

All demos have some kind of dynamic or interactive component to them. Usually you can grab the bigger highlighted points or adjust some sliders or checkboxes.
Diagrams don't need to be that way though and you can just make static scenes that showcase what you try to illustrate.

Mobile interaction should also work, but might be a bit finnicky.

The library is currently being finished up for its initial version and will then be accessible vie Github.

# Vectors

We can define a vector $\mathbf{v}$ as a collection of numbers, where each number specifies a displacement along the corresponding axis. If we take the usual $x$ and $y$ axes in 2D,  we can write $\mathbf{v}$ as:

$$
    \mathbf{v} = \begin{pmatrix} v_x \\ v_y \end{pmatrix}
$$

This specifies a displacement of $v_x$ units along the $x$ axis and $v_y$ units along the $y$ axis. Negative values indicate moving in the opposite direction. 
As it is a displacement, a vector is not bound to any point in space and can exist anywhere. If we draw a vector into a coordinate system, it is just a representation of that vector. Every other representation would be the same, as long as the vector components agree.

A vector has a length and direction.

The length $||\mathbf{v}||$ can be found by applying the pythagorean theorem to the components of the vector.

$$
    ||\mathbf{v}|| = \sqrt{v_x^2 + v_y^2}
    ||\mathbf{v}||^2 = v_x^2 + v_y^2 
$$

Here, the components form the sides of a right triangle, where the vector itself is the hypotenuse.

The following interactive diagram shows how the (squared) corresponds to the pythagorean theorem. You can see and check, that the values are equal.
You can move around the vector via its start and endpoint.

@algeobra.demo(@uid,demoLength)

Vectors can be multiplied by a number $s$. This scales the vector by that amount, where once again negative values mean, that the resulting vector will point in the opposite direction. Scaling means, that $||s\mathbf{v}|| = |s|  ||\mathbf{v}||$, so the length is multiplied by the absolute value of the scaling factor.

To calculate the scaling, just multiply each component by the factor:

$$
\begin{align*}
    s\mathbf{v} &= s \begin{pmatrix}v_x \\ v_y\end{pmatrix} \\
                &= \begin{pmatrix} sv_x \\ sv_y\end{pmatrix} \\
    ||s\mathbf{v}|| &=   \sqrt{(sv_x)^2 + (sv_y)^2} \\
                    &=   \sqrt{s^2 v_x^2 + s^2 v_y^2} \\
                    &=   s\sqrt{v_x^2 + v_y^2} \\
                    &=   s ||\mathbf{v}||
\end{align*}
$$

We can see the effect of scaling below, where a vector, that you can adjust yourself, is multiplied by a varying factor in the range $[-2,2]$. 
The color red signifies a positive sign and blue a negative one.

@algeobra.demo(@uid,demoScale)

We can add two vectors $\mathbf{u}$ and $\mathbf{v}$ geometrically ba placing $\mathbf{v}$ at the tip of $\mathbf{u}$. The resulting vector is the vector from the start of $\mathbf{u}$ to the tip of $\mathbf{v}$.

To compute this, we just add the components of both vectors.

$$
\begin{align*}
    \mathbf{u}+ \mathbf{v} &= \begin{pmatrix} u_x \\ u_y \end{pmatrix} + \begin{pmatrix} v_x \\ v_y \end{pmatrix}  \\
    &= \begin{pmatrix} u_x + v_x\\ u_y + v_y \end{pmatrix}
\end{align*}
$$

Additionally, addition is commutative, so $\mathbf{u} + \mathbf{v} = \mathbf{v} + \mathbf{u}$, which can be seen from the definition above.

We can also see that geometrically. The below demo showcases vector addition and also visualizes flipping the order of the addition.

@algeobra.demo(@uid,demoAddition)

Vectors can't in general be multiplied by each other two get another vector like you can do with numbers. There are different kinds of products. One of those is the so called dot product. It takes two vectors and produces a number (a scalar, which is why it is also called scalar product).

You can calculate it in two ways:

$$
\begin{align*}
\mathbf{u} \cdot \mathbf{v} &= u_x v_x + u_y v_y \\
&= ||\mathbf{u}|| ||\mathbf{v}|| \cos\alpha
\end{align*}
$$

$\alpha$ is the shortest angle between both vectors. Geometrically the dot product can geometrically be found as shown in the demo below. First you project one vector onto another. That means, you drop the vector perpendicularly onto the other one. This gives you a line segment. Then you rotate down the vector you projected onto by $90^\circ$. This gives you a rectangle with the projected segment. The area of that segment is the value of the dot product. It is considered negative, if the projected line segment points away from the vector it was projected unto.

While it is obvious from the formulas, this geometric insight makes it a bit hard to see: The dot product is commutative as well, so $\mathbf{u}\cdot \mathbf{v} = \mathbf{v} \cdot \mathbf{u}$. In the diagram below you can see that it indeed doesn't matter which vector is projected onto which, the result will be equal.

When at the diagram below and interacting with it and its options, try to guess the following, if you are not already familiar with it:

* What part of the formula is the projected segment?
* When does the dot product become positive, negative or zero?
* What happens when one or both of the vectors is normalized (the length is one)? You can activate normalization directly in the options

@algeobra.demo(@uid,demoDot)

From the demo and the questions before, you might have guessed, that the projected segment equals either $||\mathbf{u}|| \cos\alpha$ or $||\mathbf{v}|| \cos\alpha$, depending on which vector is projected onto which. 

You may recognize the image as the same one you will see when drawing the geometric construction of the trigonometric functions!
You can see those below. Move around the angle with your mouse!

@algeobra.demo(@uid,demoTrig)

For the trigonometric functions, the circle has a radius of one. If it had a different radius, the triangle sides would also be scaled by that radius, as increasing the radius just enlarges the image. Then $\cos \alpha$ would become $r \cos \alpha$. In the dot product, this radius would just be the length of the vector that is projected, so either $||\mathbf{u}|| $ or $||\mathbf{v}||$.

From the diagram and similar triangles, you can also see, that $\tan$ is just $\frac{\sin}{\cos}$, as it is the same triangle, but scaled, so that the $x$ side has length 1. Similarly you can see the relationship of the sine and cosine ot the cotangent.

# Geometry

The following interactive diagram shows the inscribed angle theorem. The central angle of an inscribed angle is twice the inscribed angle. 
The diagram shows you the values of the corresponding angles (rounded, so the values might sometimes be off by one digit) so you can check yourself!

Move around to points to see how it is always true. Just be careful if you move the point $\mathbf{P}$ outside of the others. Then the angle gets larger than $180^\circ$ and you have to wrap around the values when they get larger than $360^\circ$.

@algeobra.demo(@uid,demoInscribedAngle)

The incircle of a triangle can be found by first finding the intersection of the angle bisectors. That is the center. Put a perpendicular line to one of the sides through that center and find the intersection with that side. That gives you a point on the circle and with that a radius for the incircle.

The outcircle of a triangle can be found by finding the intersection of the perpendicular lines through the side centers. That will give you the center. With that center, draw a circle with a radius determined by the distance of the triangle vertices to that center.

You can see and play around with those in the following diagram.

@algeobra.demo(@uid,demoTriangleCircles)

A Bézier curve can be constructed from its control points by a simple geometric process:

1. Choose a parameter $t$. This parameter in $[0,1]$ specifies, which point on the curve is constructed
2. If there is only one point, that is the final point
3. For each point and its successor, interpolate the points with $t$. For that, you can draw a line between them. Subdivide this line with a ratio $t : (1-t)$. That is the sought after point
4. Start again at step 2

The following demo shows that construction for a cubic curve with four control points, which is also known as the De Castlejau's algorithm.

@algeobra.demo(@uid,demoDeCastlejau)

A tangent is a line/direction that touches a curve at a point. It "follows" the direction of the curve. 
For circles, there are multiple types of tangents that we can construct. The following shows three types:

1. Tangents to a circle that meet in a specified point
2. Tangents to a circle that are also tangent to another circle without intersecting in the middle (outer tangents)
3. Tangents to a circle that are also tangent to another circle with intersecting in the middle (inner tangents)

In the diagram you can move around the full circle from which all other tangents spread out. The other circles are not closed, so only the tangents that actually touch the arc segment exist. An ellipse is also included for the first tangent case.

@algeobra.demo(@uid,demoArcTangents)

Following the last example, another type of tangent is defined by "following" a point alongside. A parametric curve is a function $\mathbf{p}(t) = \begin{pmatrix}x(t) \\ y(t) \end{pmatrix}$ that computes a point for a given parameter $t$. If we are moving along that point, we can look at the change in positions from one time to another. For infinitesimal changes, this is just the component-wise derivative. This new vector is the tangent vector.

In 2D we can additionally construct a normal vector to that tangent, that is unique up to a scaling factor either via the geometric properties of the curve (in a circle, the radius vector is normal to the curve) or by just applying the following formula, that computes a normal to every 2D vector:

$$
    \operatorname{normal}(\mathbf{u}) = \begin{pmatrix} -u_y \\ u_x\end{pmatrix}
$$

You can easily see that this is normal to $\mathbf{u}$: $\mathbf{u} \cdot \operatorname{normal}(\mathbf{u}) = -u_x u_y + u_y u_x = 0  $.

This also gives the pretty natural result $\begin{pmatrix} 0 \\ 1\end{pmatrix}$ for the vector $\begin{pmatrix} 1 \\ 0\end{pmatrix}$, so it produces the $y$ axis from the $x$ axis. Of course, scaling this with an arbitrary factor (also negative values) will still satisfy the normal condition.

The following demo shows various parametric curves (lines, line segments, Bézier curves, arcs, ellipses, ... ) with tangent and normal vectors at a moving point. You can adjust the lengths of these vectors in the options below.

@algeobra.demo(@uid,demoCurveTangentNormals)

# Application

This section is about applying the algeobra library to slightly more complex examples.

FYI: The next demo might load for a bit, don't worry.


## Simple lens

The first example shows a simple lens model with some example light rays being emitted from a point. 
The lens is modeled by two two circles a certain distance apart with different radii. You can adjust those in the demo.

The circles are intersected, which results in no, one or two intersection points. We then construct an arc from each circle between these intersection points. This results in the lens surface.

The rays are intersected with the surface. At the intersection, normals are constructed and the ray is refracted according to the index of refraction of the lens $\eta$ ("eta"), which you can also adjust.

The direction of the middle ray is controlled by moving the green-ish dot around.

@algeobra.demo(@uid,demoLens)

## Ground detection

If you want to make platformer game, it is important to know where your ground is, so you can move around. Depending on the geometry and engine you use, you might not have access to exact ground information. One common approach seems to be using ray casts. You shoot a few rays to the ground or your moving direction to see if there is anything.

The following example shows an illustration of how one could use these raycasts to find an approximation to the underlying surface. You can move around the "player", here represented by a few sample points which shoot rays downwards.

A few different things are calculated, which could all be useful in some way:

* Maximal slope line (dashed)
* Closest two points segment (red)
* Convex hull of all points (blue polygon with green outline)

@algeobra.demo(@uid,demoDetectGround)