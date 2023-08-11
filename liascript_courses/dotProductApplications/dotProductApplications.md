<!--
author: sibaku

version:  0.0.1

language: en

attribute: [Sibaku github.io](https://sibaku.github.io/)
    by sibaku (he/him) ([twitter](https://twitter.com/sibaku1), [mastodon](https://mas.to/@sibaku), [cohost](https://cohost.org/sibaku))
    is licensed under [MIT](https://opensource.org/licenses/MIT)

script: https://cdn.jsdelivr.net/gh/sibaku/sibaku.github.io/liascript_courses/dotProductApplications/demoDotProduct.js

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
        if(typeof demoScripts !== "undefined" && typeof demoScripts.@1 !== "undefined")
        {
            demoScripts.@1(container,canvas);
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

# Applications of the dot product

@algeobra.demo(@uid,demoDot)


## Introduction

I have seen a few people without a background in math or computer science struggling with writing code for game scripts. While having comprehensive understanding of math isn't needed, I feel that grasping the basic concepts can spare you a lot of problems. 

This small course aims to show you some basic operations of the dot product that might be usable in a game development context. Each section  will contain some explanations, interactive diagrams and formulas to give you all you need get started. Additionally, I will try to list problems, that can be solved with the given operation.

Generally, all the diagrams can be manipulated in some way by dragging the marked points to show you visually and with calculations what is happening.

The two basic geometric properties associated with the dot product are **distances** and **angles**, which makes it usable in many contexts.

## Basics

Before we start with the actual applications, let's just recap the basics.

We will write vectors in bold face like $\mathbf{a},\mathbf{b}, \mathbf{u},\mathbf{v}$. We will use only 2D vectors here, but all the formulas work in any dimension (3,4, ...), as aside from computing the value of the dot product itself, we won't need any coordinates. We will write coordinates of a vector in a normal font with the coordinate as a subscript to the vector name. For example, the x-coordinate of $\mathbf{a}$ is written as $a_x$.


In the following, we only have to deal with one angle, the angle between two vectors. We will write it, if needed, as $\alpha$ (alpha). The angle between two vectors is the smallest angle between them, which is $0 [rad] = 0^\circ$ when they coincide and $2\pi [rad] = 360^\circ$ when they point in opposite directions. You can see this below.

@algeobra.demo(@uid,angleBasic)

When writing out angles, we will generally use degrees here, as many may not be that familiar with radians, but I highly advise you to get comfortable with radians, as it is the unit that math functions work with.



The *dot product* will be written with a dot between two vectors. So the dot product of $\mathbf{a}$ and $\mathbf{b}$ is $\mathbf{a}\cdot \mathbf{b}$

There are two equivalent definitions of the dot product:

$$
\begin{align*}
    \mathbf{a}\cdot \mathbf{b} &= a_x b_x + a_y b_y \\
    &= |\mathbf{a}| |\mathbf{b}| \cos\alpha
\end{align*}
$$

(For higher dimensions, you would just add more terms for the appropriate coordinate in the sum)

Here, $|\cdot|$ denotes the length of a vector (we don't use $||\cdot||$ to make it easier to read). This is computed as the square root of the sum of all squared components of a vector, so for 2D it is (Pythagoras!):

$$
    |\mathbf{a}|= \sqrt{a_x^2 + a_y^2}
$$

You can think about the two definitions as follows:

$a_x b_x + a_y b_y$ is used to "mechanically" compute the value of the dot product, as we only need to know vector coordinates. It is more of a helper function.

$|\mathbf{a}| |\mathbf{b}| \cos\alpha$ is used when we want to think about the **geometric meaning** of the dot product.

From this, we can already gather a few computation rules already.

Since $|\mathbf{a}| |\mathbf{b}| = |\mathbf{b}| |\mathbf{a}|$, the order of the vectors doesn't matter.

$$
\mathbf{a}\cdot \mathbf{b} = \mathbf{b}\cdot \mathbf{a}
$$

This is called the commutative property.

It is a bit tedious, but from the first definition, we can see that:

$$
\mathbf{a}\cdot (s\mathbf{b} + \mathbf{c}) = s(\mathbf{a}\cdot\mathbf{b}) + \mathbf{a}\cdot \mathbf{c} 
$$

We will quickly verify this with a 1D vector (only x-coordinates), but you can try to prove it yourself by adding y or z or any number of coordinates.

$ \mathbf{a}\cdot (s\mathbf{b} + \mathbf{c})  = a_x (s b_x + c_x) = s a_x b_x + a_x c_x = s(\mathbf{a}\cdot\mathbf{b}) + \mathbf{a}\cdot \mathbf{c} $


As a quick reminder, here is a visualization of one way to define the cosine (and sine) of an angle:

@algeobra.demo(@uid,demoTrig)

If we imagine a unit circle (circle with radius 1) and choose the point on the circle corresponding to the angle $\alpha$, then the x-coordinate of that point is the cosine and the y-coordinate is the sine of that angle. 

We will see a very similar image in the different operations again.

That is basically all we really need here, so let's get started with the applications.

If you are curious, the full geometry of the dot product can be seen in the following diagram. The dot product can be visualized as the area spanned by the projection of one vector onto another (covered [here](#8)) and the length of that other vector. When either or both vectors have length 1, you can find some useful special cases!

@algeobra.demo(@uid,demoDot)


## Angle/Cosine of angle between two vectors

<!-- style="background-color: #b5e7a0;"-->
<div>
**Applications**

- Checking, how close one viewing direction is to another one
- Compute $\cos$ terms in lighting calculations, such as Phong shading
- As this is a very basic property, it is used in many of the following operations as well
</div>

<!-- style="background-color: #ffef96;"-->
<div>
**Procedure** - Find the angle/cosine of the angle between $\mathbf{a}$ and $\mathbf{b}$

1. Compute the length of both vectors: $|\mathbf{a}|, |\mathbf{b}|$
2. Compute the dot product: $\mathbf{a}\cdot \mathbf{b}$
3. The cosine of the angle is: $\cos{\alpha} = \frac{\mathbf{a}\cdot \mathbf{b}}{|\mathbf{a}| |\mathbf{b}|}$
4. (**OPTIONAL**) The angle is: $\alpha = \operatorname{acos}(\cos{\alpha})$
</div>

Our goal is to find the shortest angle between two vectors. Though, in many cases, we don't actually need the angle itself, as the cosine is enough. For example, we want to check, whether the angle is smaller than some maximum angle $\alpha_{\text{max}}$. We can instead just use $\cos{\alpha_{\text{max}}}$ for comparisons. The cosine starts at its highest value at $0^\circ$ and decreases until the highest angle $180^\circ$. So if we want to express $\alpha < \alpha_{\text{max}}$, we can instead use $\cos{\alpha} > \cos{\alpha_{\text{max}}}$. The diagram will make the shape of the cosine with respect to the angle a bit clearer.

As this operation is very general, it is part of many others. Thus the most direct applications listed above are comparing directions and just computing cosine terms directly, as they come up a lot in shading calculations.

@algeobra.demo(@uid,angle)

---

**Derivation**

Since we have $\mathbf{a}\cdot \mathbf{b} = |\mathbf{a}| |\mathbf{b}|\cos{\alpha}$, we can get the cosine by dividing through the equation.

$$
\begin{align*}
\mathbf{a}\cdot \mathbf{b} &= |\mathbf{a}| |\mathbf{b}|\cos{\alpha} \\
 \frac{\mathbf{a}\cdot \mathbf{b}}{|\mathbf{a}| |\mathbf{b}|} &= \cos{\alpha}
\end{align*}
$$

## Length of a vector

<!-- style="background-color: #b5e7a0;"-->
<div>
**Applications**

- Checking, how close one point is to another
- Checking, which vector is larger than another
</div>

<!-- style="background-color: #ffef96;"-->
<div>
**Procedure** - Find the (squared) length of a vector $\mathbf{a}$

1. Compute the dot product: $\mathbf{a}\cdot \mathbf{a}$
2. The squared length is equal to the value of step 1: $|\mathbf{a}|^2 = \mathbf{a}\cdot \mathbf{a}$
3. (**OPTIONAL**) The length is: $|\mathbf{a}| = \sqrt{|\mathbf{a}|^2} = \sqrt{\mathbf{a}\cdot \mathbf{a}}$
</div>

We already know, how to compute the length of a vector, but when multiplying a vector by itself, we get the squared length, which is in many cases all we need. For example, if you want to check, whether a vector's length is smaller than some value $r \geq 0$. You can express this as $|\mathbf{a}| < r$ ($\leq$ is also possible) As both sides of this inequality are greater than zero, we are allowed to apply a square operation on both sides. Thus we have:

$$
\begin{align*}
|\mathbf{a}| &< r  \\
|\mathbf{a}|^2 < r^2 \\
\mathbf{a}\cdot\mathbf{a} < r^2
\end{align*}
$$

This allows you to skip a whole square root operation, which today isn't much, but if you do it a lot it might still cost some computation power.

One obvious application, is checking whether a point is less than a certain radius away from another point. For example, if you want to check, whether a player is in the influence area of some item that has a specified radius. Let the player be at position $\mathbf{p}$, the item at $\mathbf{q}$ and the radius be $r$. Then we can apply the above.

Let $\mathbf{a} = \mathbf{p} - \mathbf{q}$ be the vector from the item to the player. If $\mathbf{a}\cdot\mathbf{a} < r^2$, then the player is influenced by the item, otherwise not.

You can see this in the diagram below.

@algeobra.demo(@uid,distance)

---

**Derivation**

We know that the length of a vector $\mathbf{a}$ is computed as $|\mathbf{a}| = \sqrt{a_x^2 + a_y^2}$.

The dot product $\mathbf{a} \cdot \mathbf{a}$ is:

$$
\begin{align*}
\mathbf{a} \cdot \mathbf{a} &= a_x a_x + a_y a_y \\
&= a_x^2 + a_y^2 \\
&= |\mathbf{a}|^2
\end{align*}
$$

For other dimensions, this is the same. For example in 3D, we have $|\mathbf{a}| = \sqrt{a_x^2 + a_y^2 + a_z^2}$. In the dot product, the z-term is added as well, so the result will be the same.

Actually, in some math contexts, the length is just defined via the dot product!

## Check, if a vector lies in a cone

<!-- style="background-color: #b5e7a0;"-->
<div>
**Applications**

- Checking, whether a player is in the vision cone of an enemy
- Checking, if a spotlight shines in a specified direction
</div>

<!-- style="background-color: #ffef96;"-->
<div>
**Procedure** - Check, whether a vector $\mathbf{a}$ lies in a cone with direction $\mathbf{v}$, maximum opening angle $\alpha_{\text{max}}$ and radius $r$.

If your cone does not have a maximum radius, you can skip step 1).

1. Compute the squared distance of $\mathbf{a}$: $|\mathbf{a}|^2= \mathbf{a}\cdot \mathbf{a}$

    1. If $|\mathbf{a}|^2 > r$ $\Rightarrow$, vector is outside 
    2. Otherwise, it is inside the radius. We also need to check the angle

2. Compute the cosine of the angle $\alpha$ between $\mathbf{a}$ and $\mathbf{v}$: $ \cos{\alpha} = \frac{\mathbf{a}\cdot \mathbf{v}}{|\mathbf{a}| |\mathbf{v}|}$
3. Compute $\cos{\alpha_{\text{max}}}$ (can be precomputed, if it doesn't constantly changed)

    1. If $\cos{\alpha} < \cos{\alpha_{\text{max}}}$, vector is outside
    2. Otherwise, it is inside the angular constraint
4. If either the distance or angular constraint said, the vector is outside, it is outside. Otherwise it is inside (you can early return at step 1.1)

</div>

This operation is basically just a combination of the [distance check](#5) and the cosine [angle calculation](#4). As mentioned in the latter, instead of checking $\alpha < \alpha_{\text{max}}$, we can instead use $\cos{\alpha} > \cos{\alpha_{\text{max}}}$.

Let's say, we have our player character at position $\mathbf{p}$ and the enemy at $\mathbf{q}$. The enemy is looking in a direction $\mathbf{v}$, has a field of vision (half angle) of $\alpha_{\text{max}}$ and can see $r$ units far. The vector $\mathbf{a}$ from the enemy to the player is $\mathbf{a} = \mathbf{p} - \mathbf{q}$. Using this and the above procedure above, we can determine, whether the enemy can spot us!

You can see this scenario in the diagram below.

@algeobra.demo(@uid,cone)

---

**Derivation**

This is a consequence of the previous entries [distance check](#5) and [angle calculation](#4).

## Checking, if two vectors point into the same half space

<!-- style="background-color: #b5e7a0;"-->
<div>
**Applications**

- Checking, whether two objects are moving towards/away from each other 

  - Compute the relative position of both objects $\mathbf{a} = \mathbf{p}_0 - \mathbf{p}_1$

  - Compute the relative velocity of both objects (movement direction): $\mathbf{b} = \mathbf{v}_0 - \mathbf{v}_1$

  - If $\mathbf{a} \cdot \mathbf{b} > 0$, then the objects are moving away from each other, otherwise they are moving towards each other 
- Checking, whether an object is in front of a wall

  - Take the normal $\mathbf{n}$ describing the direction of the wall and a point $\mathbf{w}$ on the wall

  - Compute the vector $\mathbf{a}$ from $\mathbf{w}$ to the object position $\mathbf{p}$: $\mathbf{a} = \mathbf{p} - \mathbf{w}$

  - If $\mathbf{a} \cdot \mathbf{n} > 0$, then the object is in front of the wall, otherwise it is behind
- Check, whether the light shines on the back or front side of a surface
</div>

<!-- style="background-color: #ffef96;"-->
<div>
**Procedure** - Check, whether a vector $\mathbf{a}$ points in the same or opposite half space of $\mathbf{b}$ (and vice versa)

1. Compute the dot product $ \mathbf{a}\cdot \mathbf{b}$

    1. If $\mathbf{a}\cdot \mathbf{b} > 0$ $\Rightarrow$ both vectors point into the same half space
    2. If $\mathbf{a}\cdot \mathbf{b} < 0$ $\Rightarrow$ both vectors point into opposite half spaces
    2. Otherwise ($\mathbf{a}\cdot \mathbf{b} = 0$ ) $\Rightarrow$ both vectors are perpendicular to each other 

</div>

A vector can divide space into points pointing in the same half space, the opposite one or being perpendicular. In 2D, this means, this division line can be visualized as a line perpendicular to the vector. In 3D it is a plane and in higher dimensions it is a hyperplane.

Intuitively you can think about a compass. Let's take **north** as our vector direction. Then **north-east** and **north-west** point into the same half space (**north** itself of course also points in the same one). **east** and **west** are perpendicular. **south**, **south-east** and **south-west** all point in the opposite half-space.

We can also formulate this with angles. If the angle between two vectors is less than $90^\circ$, they point in the same half space. If the angle is exactly $90^\circ$, they are perpendicular. Otherwise (the angle is greater than $90^\circ$), they point in opposite half spaces.

The above procedure is very efficient, as it only requires a single dot product.

You can see this in the diagram below:

@algeobra.demo(@uid,side)

---

**Derivation**

If you have a look at the diagram in the [angle section](#4), you can check out the ranges of the cosine for the angles between the vectors. Importantly, these angles are only in the range $[0^\circ,180^\circ]$.

For $\alpha \in [0^\circ, 90^\circ)$, we see that $\cos(\alpha) > 0$. For $\alpha = 90^\circ$,$\cos(\alpha) = 0$ and for the rest $\cos(\alpha) < 0$.

So to determine, which half-spaces the vectors point into, we just need to check the sign of the cosine.

The dot product is $\mathbf{a} \cdot \mathbf{b} = |\mathbf{a}| |\mathbf{b}| \cos\alpha$. But $ |\mathbf{a}|$ and $|\mathbf{b}|$ are both zero or positive, so they have no influence on the sign of the dot product! That means, we don't need to divide by the vector lengths to get the sign of the cosine and we can skip that computation.

## Projection of one vector onto another

<!-- style="background-color: #b5e7a0;"-->
<div>
**Applications**

- A player in 2D moves along a slanted terrain, whose ground is defined by a direction. Which part of the player's movement direction points in the ground direction
- For a simple racing game you define the track by different line segments and want to show the player position on a mini map. The player is not exactly on that line! How far along the closest line segment is the player? This is the projection of the player position on the line segment!
</div>

<!-- style="background-color: #ffef96;"-->
<div>
**Procedure** - Project a vector $\mathbf{a}$ onto a vector $\mathbf{b}$

1. Compute the dot product $ \mathbf{a}\cdot \mathbf{b}$
2. The projection $a_{\mathbf{b}}$ is: $a_{\mathbf{b}} = \frac{ \mathbf{a}\cdot \mathbf{b}}{|\mathbf{b}|} = \mathbf{a}\cdot \frac{\mathbf{b}}{|\mathbf{b}|}$

    - **Note:** If $\mathbf{b}$ is normalized ($|\mathbf{b}| = 1$), then you can skip the division. Sometimes, you know the length beforehand, for example, if you enforce it via code or generate it via special means.
</div>

Projecting a vector $\mathbf{a}$ onto another vector $\mathbf{b}$ means: How much of $\mathbf{a}$ points into the direction of $\mathbf{b}$. 
In other words. We draw a line perpendicular to $\mathbf{b}$ that goes through the tip of $\mathbf{a}$. Where that line intersects $\mathbf{b}$ is the tip of the projection of $\mathbf{a}$. Like the shadow of $\mathbf{a}$ onto $\mathbf{b}$.

Let's say you have a line segment between two points $\mathbf{p}_1$ and $\mathbf{p}_0$. The vector between them is $\mathbf{b} = \mathbf{q}_1 - \mathbf{q}_0$. This could be a segment of a racing game track. The player is at position $\mathbf{p}$. How far along the way from $\mathbf{q}_0$ to $\mathbf{q}_1$ is the player? This is the projection! You can compute the vector $\mathbf{b} = \mathbf{p} - \mathbf{q}_0$ (so both $\mathbf{a}$ and $\mathbf{b}$ have the same reference point). With this, the above procedure gives us the projection.

@algeobra.demo(@uid,project)

---

**Derivation**

We can think about the definition of the cosine in the unit circle again, as seen in the [basics](#3)

Now, let's say we are not in the unit circle, but instead one with radius $r$. What happens to the coordinate? Well, the circle will basically look the same, but it is scaled with a factor of $r$! The coordinates are, of course, scaled as well, so the x-coordinate is $r\cos\alpha$ instead of $\cos\alpha$.

The x-coordinate is just the circle point projected onto the x-axis.

Now, let's say our vector $\mathbf{b}$ corresponds to the x-axis and $\mathbf{a}$ to the vector to the circle point. The angle of that point is the angle between the two vectors. The radius $r$ is just the length of $\mathbf{a}$: $|\mathbf{a}|$.

Plugging that into the scaled circle x-coordinate results in: $r\cos\alpha =|\mathbf{a}|\cos\alpha $. This is just the dot product divided by $|\mathbf{b}|$! 

Thus our projection $a_{\mathbf{b}}$ of $\mathbf{a}$ onto $\mathbf{b}$ is:

$$
\begin{align*}
a_{\mathbf{b}} &= |\mathbf{a}|\cos\alpha \\
                &= \frac{\mathbf{a} \cdot \mathbf{b}}{\mathbf{b}}\\
                 \mathbf{a}\cdot \frac{\mathbf{b}}{|\mathbf{b}|}
\end{align*}
$$

The last line results from $|\mathbf{b}||$ just being a number, so we can move it into the dot product due to its property of linearity.

Additionally, this means, the projection of a vector onto a normalized vector is just the dot product!

We can see this in action in the following diagram.

@algeobra.demo(@uid,projectUnitLength)



## Decomposing a vector with respect to another

<!-- style="background-color: #b5e7a0;"-->
<div>
**Applications**

- While moving on a surface, determine the movement vector on the surface plane and the part pointing outside of it
- Constrain something to only walk along a line or plane
</div>

<!-- style="background-color: #ffef96;"-->
<div>
**Procedure** - Decompose a vector $\mathbf{a}$ with respect to $\mathbf{b}$ into a vector parallel to $\mathbf{b}$ ($\mathbf{a}_{\mathbf{b}}$) and one perpendicular to $\mathbf{b}$ ($\mathbf{a}_{\mathbf{b}}^\perp)$, such that $ \mathbf{a} = \mathbf{a}_{\mathbf{b}} + \mathbf{a}_{\mathbf{b}}^\perp$

1. Compute the dot product $ \mathbf{a}\cdot \mathbf{b}$
2. Compute the projection vector $\mathbf{a}_{\mathbf{b}}$ of $\mathbf{a}$ onto $\mathbf{b}$: $\mathbf{a}_{\mathbf{b}} = \frac{ \mathbf{a}\cdot \mathbf{b}}{|\mathbf{b}|^2} \mathbf{b}$ 
3. Compute the perpendicular projection vector $\mathbf{a}_{\mathbf{b}}^\perp$: $ \mathbf{a}_{\mathbf{b}}^\perp=\mathbf{a} - \mathbf{a}_{\mathbf{b}} $
</div>

In the previous section, we found th projection of a vector $\mathbf{a}$ onto another vector $\mathbf{b}$. This is just an extension to that. Instead of just computing the length of the projection, we also want the vector corresponding to it, so a vector with the length of the projection pointing in the same direction as $\mathbf{b}$. And from the previous diagram, there is another vector: The perpendicular part from the tip of the projection to the tip of $\mathbf{a}$.

How can this be useful? First of all, having the direction in addition to the length allows you to show the projection itself.
Let's say you have a spaceship game, where the ship can move in all directions. Let's say you fly to the right and there is a vertical wall. If you keep going in the same direction, the wall will block you so you don't move at all. But if the wall is angled, you will expect to keep moving, but maybe not with the same speed, since you are still partially pressing into the wall. And maybe you want to bounce your player a bit away from the wall when they ram into it. You could handle all the specific wall angles, or you could decompose the vector into the part pointing along the wall normal and the other one being in the wall plane. Movement is then only the part in the wall plane and the bounce happens in the direction of the normal. This is of course a simple scenario, but an actual implementation can be very similar to this (and a physics based solution is also very similar)!

You can see the decomposition in the diagram below:

@algeobra.demo(@uid,decompose)

---

**Derivation**

From the previous [section](#8), we know how to compute the projection of a vector onto another (which is a signed length). $a_{\mathbf{b}} = \frac{\mathbf{a} \cdot \mathbf{b}}{\mathbf{b}}$

To get a vector with that length pointing in the same direction as $\mathbf{b}$, we just need to normalize $\mathbf{b}$ and multiply it with the length of the projection.

$$
\begin{align*}
\mathbf{a}_{\mathbf{b}} &= a_{\mathbf{b}} \frac{\mathbf{b}}{|\mathbf{b}|} \\
&=   \frac{\mathbf{a} \cdot \mathbf{b}}{|\mathbf{b}|} \frac{\mathbf{b}}{|\mathbf{b}|} \\
&=  \frac{\mathbf{a} \cdot \mathbf{b}}{|\mathbf{b}|^2} \mathbf{b}
\end{align*}
$$

We then compute the perpendicular part as described in the procedure: $ \mathbf{a}_{\mathbf{b}}^\perp=\mathbf{a} - \mathbf{a}_{\mathbf{b}}$.

As $\mathbf{a}_{\mathbf{b}}$ was constructed to point into the same direction as $\mathbf{b}$, we know they are parallel. But we also need to show, that $\mathbf{a}_{\mathbf{b}}^\perp$ really is perpendicular to $\mathbf{b}$.

For that we use the dot product rule from the section about [half spaces](#7). The dot product must be zero.

$$
\begin{align*}
\mathbf{a}_{\mathbf{b}}^\perp \cdot \mathbf{b} &= (\mathbf{a} - \mathbf{a}_{\mathbf{b}} ) \cdot \mathbf{b}\\
&= \mathbf{a}\cdot \mathbf{b} - \mathbf{a}_{\mathbf{b}}  \cdot \mathbf{b}\\
&= \mathbf{a}\cdot \mathbf{b} - \frac{\mathbf{a} \cdot \mathbf{b}}{|\mathbf{b}|^2} \mathbf{b}  \cdot \mathbf{b}\\
&= \mathbf{a}\cdot \mathbf{b} - \frac{\mathbf{a} \cdot \mathbf{b}}{|\mathbf{b}|^2} |\mathbf{b}|^2\\
&= \mathbf{a}\cdot \mathbf{b} - \mathbf{a} \cdot \mathbf{b}\\
&= 0
\end{align*}
$$

Thus, $\mathbf{a}_{\mathbf{b}}^\perp $ really is perpendicular to $\mathbf{b}$!

Just as a formality, we show, that we can reconstruct $\mathbf{a}$ from its decomposition:

$$
\begin{align*}
\mathbf{a}_{\mathbf{b}} + \mathbf{a}_{\mathbf{b}}^\perp &= \mathbf{a}_{\mathbf{b}} + \mathbf{a} - \mathbf{a}_{\mathbf{b}} \\
&= \mathbf{a}
\end{align*}
$$
