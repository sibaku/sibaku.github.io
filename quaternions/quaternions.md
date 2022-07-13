<!--
author:   sibaku

email:    

version:  0.0.1

language: en


script: https://sibaku.github.io/quaternions/src/two.min.js
        https://sibaku.github.io/quaternions/src/three.js

comment:  A short introduction to rotation quaternions

attribute: [Sibaku github.io](https://sibaku.github.io/)
    by [sibaku](https://twitter.com/sibaku1)
    is licensed under [MIT](https://opensource.org/licenses/MIT)

@mutate.remover
<script>
// This is a hack to remove added elements from a container, when it was dynamically created
// A mutation observer checks, whether the id was changed and if so, removes the inner parts

let container = window.document.getElementById('@0')


// based on the example at https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
const config = { attributes: true };

const callback = (mutationsList, observer) => {
    for(const mutation of mutationsList) {
        if (mutation.type === 'attributes') {
            if(mutation.attributeName === 'id')
            {
                // remove inner
                container.innerHTML = "";
                // remove observer afterwards
                observer.disconnect();

            }
        }
    }
    
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(container, config);


</script>
@end

-->

# Quaternions

This is a short introduction to quaternions. 
When people, especially in computer graphics, talk about them, they usually don't actually mean "quaternions".
They mean "normalized quaternions". 
These are a special subset of the complete set of objects that are the quaternions that have a deep relationship to rotations and orientations.

This introduction will follow that nomenclature and use quaternion as a shorthand for the special case.
There are many different ways to approach the topic of what quaternions "represent".
Many of them can be very interesting, but might also require advanced mathematical tools to even parse the explanation ("The unit quaternions are isomorphic to the special unitary group $SU(2)$ and are a double cover for the 3D rotation group $SO(3)$". Everything clear?).

In the following, we will go the very pragmatic way of taking the calculation rules of rotating points with quaternions and see what falls out and what that tells us about what a quaternion represents.

Spoilers: A quaternion represents a rotation with some angle around an axis.

We will also have a look at quaternions in relation to Euler angles and what the very important use case for them is.

## Prerequisites

We will mostly need basic vector algebra, e.g. vector addition/subtraction, dot products, cross products. Some trigonometry is also useful, mostly how $\sin$ and $\cos$ relate to each other on a circle.

## Some rules for calculating with quaternions

In general, quaternions are a vector space with $4$ components. That means, you can do the usual addition and subtraction and scaling with a number with quaternions, just like with $2$D or $3$D vectors. 
For describing rotations, we don't actually need these operations.
Instead, we use the additional properties of quaternions: They can be thought of as numbers!
That is, you can also multiply and divide quaternions, just like normal numbers. Actually, if you are familiar with complex numbers, quaternions are an extension of those, but with three complex entries instead of one.
But for those two operations to work, they have to be defined in a special way that also has a consequence.

There are different ways to write down a quaternion. We will use the notation without the maybe more esoteric looking multiple complex/imaginary numbers and instead write it out with common vector algebra. They are equivalent, just different representations.

We will name a quaternion either $\mathbf{p}$ or $\mathbf{q}$ (we won't need more than two at once).
Each quaternion is composed of two parts, a scalar part (a number) and a vector part.

$$
\begin{align*}
    \mathbf{p} &= (a,\mathbf{b}) \\
    \mathbf{q} &= (c,\mathbf{d})
\end{align*}
$$

Here, $a$ and $c$ are the scalar and $\mathbf{a}$ and $\mathbf{d}$ the vector parts, where each vector part has $3$ components.

Just as a quick aside, here is how we define addition and subtraction that way

$$
\begin{align*}
    \mathbf{p} + \mathbf{q} &= (a + c,\mathbf{b} + \mathbf{d}) \\
    \mathbf{p} - \mathbf{q} &= (a - c,\mathbf{b} - \mathbf{d})
\end{align*}
$$

As said before, both are vectors and thus we can add or subtract each component.

Now, the multiplication does look a bit more complicated, but it is just composed of a few basic vector operations:

$$
    \mathbf{p}\mathbf{q} = (ac - \mathbf{b}\cdot\mathbf{d}, a\mathbf{d} + c\mathbf{b} + \mathbf{b}\times \mathbf{d})
$$

One important thing you might see from this: There is a cross product inside that formula.
The cross product is anti-commutative, so $\mathbf{x}\times \mathbf{y} = - \mathbf{y}\times \mathbf{x}$.
As a consequence, the vector part of the multiplication will in general be different if you switch around the the order in the product: $\mathbf{p}\mathbf{q} \neq \mathbf{q}\mathbf{p}$. 
This is important, a property you also see with matrix multiplication.
And this is also related to the fact, that the order, in which you rotate things matters.

The multiplication by some number is very easy though:

$$
\begin{align*}
    x\mathbf{p} &= \mathbf{p} x \\
    &= (xa, x\mathbf{b})
\end{align*}
$$

An important operation is called *conjugation*. 
It consists of flipping the vector part and we write it with a small bar over the quaternion.

$$
    \overline{\mathbf{p}} = (a, -\mathbf{b})
$$

With that, we can also define the squared length of a quaternion, written as $||\mathbf{p}||^2$. The length is then just:

$$
    ||\mathbf{p}|| = \sqrt{||\mathbf{p}||^2}
$$

Writing down $||\mathbf{p}||^2$ is a bit easier though. First we compute $\mathbf{p}\overline{\mathbf{p}}$. Keep in mind, that the cross product of a vector with a multiple of itself is always the zero vector $\mathbf{0}$.

$$
\begin{align*}
    \mathbf{p}\overline{\mathbf{p}}\\
    &= (a,\mathbf{b})(a,-\mathbf{b}) \\
    &= (a^2 - \mathbf{b}\cdot(-\mathbf{b}), a(-\mathbf{b}) + a\mathbf{b} + \underbrace{\mathbf{b}\times (-\mathbf{b})}_{=\mathbf{0}}) \\
    &= (a^2 + \mathbf{b}\cdot\mathbf{b}, -a\mathbf{b} + a\mathbf{b}) \\
    &= (a^2 + ||\mathbf{b}||^2, \mathbf{0}) \\
    &= \overline{\mathbf{p}}\mathbf{p}
\end{align*}
$$

We can see that the vector part is zero, and the scalar part has the squared length of the vector part and the squared scalar. So we can just use this scalar part as the squared length of the quaternion!
This is actually exactly the same, as if we would have regarded the quaternion as a normal vector and applied the dot product to it $\mathbf{p}\cdot\mathbf{p} = ||\mathbf{p}||^2$.

Normalized quaternions are just those quaternions with length $1$. So we can actually produce a normalized quaternion by dividing by its length:

$$
    \mathbf{p}_{\text{normalized}} = \frac{1}{||\mathbf{p}||}\mathbf{p}
$$

As said in the introduction, we will assume all quaternions to be normalized, unless stated otherwise.

## Writing out the rotation formula

When looking up quaternion rotation, you will come across the following formula for computing the rotation of a point $\mathbf{v}$ with a quaternion $\mathbf{q}$:

$$
    (0, \mathbf{v}') = \mathbf{q}(0,\mathbf{v})\overline{\mathbf{q}}
$$

Here, the point to rotate is put in the vector part of a quaternion and the transformed point $\mathbf{v}'$ is then found in the vector part of the multiplication result.

We will now compute this product explicitly and try to find some interpretation of the result.

We will start from the right.

$$
\begin{align*}
    (0,\mathbf{v})\overline{\mathbf{q}} &= (0,\mathbf{v})(a, -\mathbf{b}) \\
    &= (0a - (\mathbf{v}\cdot(-\mathbf{b})), 0(-\mathbf{b}) + a\mathbf{v} + \mathbf{v}\times (-\mathbf{b})) \\
    &= (\mathbf{v}\cdot\mathbf{b}, a\mathbf{v} - \mathbf{v}\times \mathbf{b})
\end{align*}
$$

From there, we will compute the second multiplication. 

$$
\begin{align*}
\mathbf{q}(0,\mathbf{v})\overline{\mathbf{q}} &= \mathbf{q}(\mathbf{v}\cdot\mathbf{b}, a\mathbf{v} - \mathbf{v}\times \mathbf{b}) \\
&= (a,\mathbf{b})(\mathbf{v}\cdot\mathbf{b}, a\mathbf{v} - \mathbf{v}\times \mathbf{b})
\end{align*}
$$

To keep things a bit cleaner, we will start with the scalar part. Keep in mind, that the dot product of a vector with a cross product involving said vector will always be $0$, as the cross product by definition produces a vector perpendicular to the inputs.

$$
\begin{align*}
    a\mathbf{v}\cdot\mathbf{b} - \mathbf{b}\cdot(a\mathbf{v} - \mathbf{v}\times \mathbf{b}) &= a\mathbf{v}\cdot\mathbf{b} - a\mathbf{b}\cdot \mathbf{v} + \mathbf{b} \cdot (\mathbf{v}\times \mathbf{b})\\
    &= \underbrace{a\mathbf{v}\cdot\mathbf{b} - a\mathbf{v}\cdot \mathbf{b}}_{=0} + \underbrace{\mathbf{b} \cdot (\mathbf{v}\times \mathbf{b})}_{=0}\\
    &= 0
\end{align*}
$$

So the scalar part works out to $0$, as it should from the stated formula. 
Now on to the vector part. This will get a bit cluttered, but each step will only do a minimal change, so hopefully it is easy enough to follow. One maybe not obvious manipulation in the following is the use of the vector triple product. 
The one we will use is of of the following form:

$$
    \mathbf{a}\times(\mathbf{b}\times \mathbf{c}) = (\mathbf{a}\cdot\mathbf{c})\mathbf{b} - (\mathbf{a}\cdot\mathbf{b})\mathbf{c}
$$

Now on to the actual calculation.

$$
\begin{align*}
    a(a\mathbf{v} - \mathbf{v}\times \mathbf{b}) + (\mathbf{v}\cdot\mathbf{b})\mathbf{b} + \mathbf{b}\times (a\mathbf{v} - \mathbf{v}\times \mathbf{b}) \\
    &= a^2\mathbf{v} - a(\mathbf{v}\times \mathbf{b}) + (\mathbf{v}\cdot\mathbf{b})\mathbf{b} + \mathbf{b}\times (a\mathbf{v}) - 
     \mathbf{b}\times (\mathbf{v}\times \mathbf{b}) \\
    &= a^2\mathbf{v} - a(\mathbf{v}\times \mathbf{b}) + (\mathbf{v}\cdot\mathbf{b})\mathbf{b} - a(\mathbf{v}\times \mathbf{b}) - 
     \mathbf{b}\times (\mathbf{v}\times \mathbf{b}) \\
     &= a^2\mathbf{v} - 2a(\mathbf{v}\times \mathbf{b}) + (\mathbf{v}\cdot\mathbf{b})\mathbf{b} - 
     \mathbf{b}\times (\mathbf{v}\times \mathbf{b}) \\
    &= a^2\mathbf{v} - 2a(\mathbf{v}\times \mathbf{b}) + (\mathbf{v}\cdot\mathbf{b})\mathbf{b} - (\mathbf{v}(\mathbf{b}\cdot\mathbf{b}) - \mathbf{b}(\mathbf{b}\cdot\mathbf{v})) \\
    &=   a^2\mathbf{v} - 2a(\mathbf{v}\times \mathbf{b}) + (\mathbf{v}\cdot\mathbf{b})\mathbf{b} - \mathbf{v}(\mathbf{b}\cdot\mathbf{b}) + \mathbf{b}(\mathbf{b}\cdot\mathbf{v}) \\
    &=   a^2\mathbf{v} - 2a(\mathbf{v}\times \mathbf{b}) + (\mathbf{v}\cdot\mathbf{b})\mathbf{b} - \mathbf{v}(\mathbf{b}\cdot\mathbf{b}) + (\mathbf{v}\cdot\mathbf{b})\mathbf{b} \\
    &=   a^2\mathbf{v} - 2a(\mathbf{v}\times \mathbf{b}) + 2(\mathbf{v}\cdot\mathbf{b})\mathbf{b} - \mathbf{v}(\mathbf{b}\cdot\mathbf{b})  \\
    &=   a^2\mathbf{v} - \mathbf{v}(\mathbf{b}\cdot\mathbf{b}) -  2a(\mathbf{v}\times \mathbf{b}) + 2(\mathbf{v}\cdot\mathbf{b})\mathbf{b} 
\end{align*}
$$

We will now use a little trick that is basically the same, as when you replace a $2$D vector by its polar form. Since our quaternion is normalized, we have:

$$
\begin{align*}
    ||\mathbf{q}||^2 &= a^2 + ||\mathbf{b}||^2 \\
    &= 1
\end{align*}
$$

Something like this might look familiar from trigonometry: $\sin^2\alpha + \cos^2\alpha = 1$.
So we could replace both of the terms on the right with sine and cosine. But since $\mathbf{b}$ is a vector, we will use some unit vector $\mathbf{n}$, with $||\mathbf{n}||^2 = 1$.

$$
\begin{align*}
    \mathbf{q} &= (\cos\alpha, \sin\alpha \mathbf{n}) \\
    ||\mathbf{q}||^2 &= \cos^2\alpha + ||\sin\alpha \mathbf{n}||^2 \\
    &= \cos^2\alpha + \sin^2\alpha||\mathbf{n}||^2 \\
    &= \cos^2\alpha + \sin^2\alpha \\
    &= 1
\end{align*}
$$

We can plug this in for $a$ and $\mathbf{b}$. Also, while some of these expressions may seem unrelated at first, there are actually a few important trigonometric identities related to double angles hidden:

1. $\cos(2\alpha) = \cos^2\alpha - \sin^2\alpha$
2. $\sin(2\alpha) = 2\sin\alpha\cos\alpha$
3. $2\sin^2\alpha = 1- \cos(2\alpha)$


$$ 
\begin{align*}
a^2\mathbf{v} - \mathbf{v}(\mathbf{b}\cdot\mathbf{b}) -  2a(\mathbf{v}\times \mathbf{b}) + 2(\mathbf{v}\cdot\mathbf{b})\mathbf{b}  &\\
&= \cos^2\alpha\mathbf{v} - \mathbf{v}((\sin\alpha \mathbf{n})\cdot(\sin\alpha \mathbf{n})) -  2\cos\alpha(\mathbf{v}\times (\sin\alpha \mathbf{n})) + 2(\mathbf{v}\cdot(\sin\alpha \mathbf{n}))\sin\alpha \mathbf{n}  \\
&= \cos^2\alpha\mathbf{v} - \sin^2\alpha\mathbf{v}( \mathbf{n}\cdot\mathbf{n}) -  2\cos\alpha\sin\alpha(\mathbf{v}\times \mathbf{n}) + 2\sin^2\alpha(\mathbf{v}\cdot \mathbf{n})\mathbf{n} \\
&= \cos^2\alpha\mathbf{v} - \sin^2\alpha\mathbf{v}-  2\cos\alpha\sin\alpha(\mathbf{v}\times \mathbf{n}) + 2\sin^2\alpha(\mathbf{v}\cdot \mathbf{n})\mathbf{n} \\
&= (\cos^2\alpha- \sin^2\alpha)\mathbf{v}-  2\cos\alpha\sin\alpha(\mathbf{v}\times \mathbf{n}) + 2\sin^2\alpha(\mathbf{v}\cdot \mathbf{n})\mathbf{n} \\
&= \cos(2\alpha)\mathbf{v}-  \sin(2\alpha)(\mathbf{v}\times \mathbf{n}) + (1 - \cos(2\alpha))(\mathbf{v}\cdot \mathbf{n})\mathbf{n} \\
&= \cos(2\alpha)\mathbf{v}-  \sin(2\alpha)(\mathbf{v}\times \mathbf{n}) + (\mathbf{v}\cdot \mathbf{n})\mathbf{n}  - \cos(2\alpha)(\mathbf{v}\cdot \mathbf{n})\mathbf{n} \\
&= \cos(2\alpha)(\mathbf{v}- (\mathbf{v}\cdot \mathbf{n})\mathbf{n} ) - \sin(2\alpha)(\mathbf{v}\times \mathbf{n}) + (\mathbf{v}\cdot \mathbf{n})\mathbf{n}
\end{align*}
$$

To make things a bit easier to write, let's replace $2\alpha$ with some new variable $\theta$ and $(\mathbf{v}\cdot \mathbf{n})\mathbf{n}$ with $\mathbf{r}$.

$$
\cos(2\alpha)(\mathbf{v}- (\mathbf{v}\cdot \mathbf{n})\mathbf{n} ) - \sin(2\alpha)(\mathbf{v}\times \mathbf{n}) + (\mathbf{v}\cdot \mathbf{n})\mathbf{n} = \cos\theta(\mathbf{v}- \mathbf{r} ) - \sin\theta(\mathbf{v}\times \mathbf{n}) + \mathbf{r} \\
=\mathbf{r} + \cos\theta(\mathbf{v}- \mathbf{r} ) - \sin\theta(\mathbf{v}\times \mathbf{n}) \\
= \mathbf{r} + \cos\theta(\mathbf{v}- \mathbf{r} ) + \sin\theta(\mathbf{n}\times \mathbf{v})
$$

These last few steps were just to make everything look a bit nicer.

As a last step, we will think about the angle. We inserted some random angle $\alpha$ for the sine and cosine terms. Turns out, when we compute everything, those $\alpha$ turn into $2\alpha$. To resolve that, we just put in $\theta = 2\alpha$. 
So how about putting this in the beginning and defining a quaternion, where we put in the $\theta$ and the normalized vector $\mathbf{n}$ such that the final result comes out. We have $\alpha = \frac{\theta}{2}$ and just plug them into the definition of our quaternion.

$$
    \mathbf{q}(\theta,\mathbf{n}) = (\cos\frac{\theta}{2},\sin\frac{\theta}{2}\mathbf{n})
$$

We will use that from here on as the definition of $\mathbf{q}$ and then also see the meaning of both of these parameters.

We arrived at something! But, what does it mean? We can now interpret these terms and they turn out to have a pretty intuitive meaning!

We will do that in the next section.

## Interpreting the result of the rotation formula

In the last section we found the following:
Given a point $\mathbf{v}$, that we convert to a quaternion as $(0,\mathbf{v})$ and a quaternion defined by $\mathbf{q}(\theta,\mathbf{n}) = (\cos\frac{\theta}{2},\sin\frac{\theta}{2}\mathbf{n})$, when we apply the rotation formula, we get

$$
    \mathbf{q}(\theta,\mathbf{n})(0,\mathbf{v})\overline{\mathbf{q}(\theta,\mathbf{n})} = (0,\mathbf{r} + \cos\theta(\mathbf{v}- \mathbf{r} ) + \sin\theta(\mathbf{n}\times \mathbf{v}))
$$

The vector part of the result is our transformed point. We defined:

$$
    \mathbf{r} = (\mathbf{v}\cdot \mathbf{n})\mathbf{n}
$$

We will now examine the resulting expression.

For that, let us start with the term $\cos\theta(\mathbf{v}- \mathbf{r} ) + \sin\theta(\mathbf{n}\times \mathbf{v})$.

If we simplify that a bit for now, we can write it as:

$$
\cos\theta \mathbf{x} + \sin\theta \mathbf{y}
$$

If we use the usual $\mathbf{x}$ and $\mathbf{y}$ axes, this is just the equation of a circle! The parameter $\theta$ is the angle around it. If $\theta = 0$, this results in $\mathbf{x}$, for $\theta = \frac{\pi}{2}$ ($90^{\circ}$) we get $\mathbf{y}$.

<div id="container_0" width="300" height="300"></div>
@mutate.remover(container_0)

<script>

const container = document.getElementById("container_0");
container.innerHTML = '';
const two = new Two({
    width: 300,
    height: 300,
  autostart: true
}).appendTo(container);

let alpha = 0.0;

function update(frameCount, timeDelta)
{
    alpha += timeDelta/1000.0 * 2.0*Math.PI / 10;
    while(alpha > 2.0*Math.PI)
    {
        alpha -=  2.0*Math.PI;
    }
    two.clear();
    const cx = two.width / 2.0;
    const cy = two.height / 2.0;

    const rx = two.width / 2.0;
    const ry = two.height /2.0;

    const cr = Math.min(rx,ry)*0.8;

    const angleRadius = 0.45*cr;
    const angle = two.makeArcSegment(cx,cy,0,angleRadius,-alpha,0);
    angle.fill = 'rgba(128,128,128,0.25)'

    const angleText = two.makeText("\u03B8",cx + Math.cos(alpha/2.0)*angleRadius*0.5,cy- Math.sin(alpha/2.0)*angleRadius*0.5);
    angleText.alignment = 'left';
    angleText.size= 20;
    angleText.fill = 'rgb(0,0,0)';


    const circle = two.makeCircle(cx,cy,cr);
    circle.noFill();
    const x_axis = two.makeArrow(cx-0.9*rx, cy, cx+0.9*rx, cy);
    const y_axis = two.makeArrow(cx, cy+0.9*ry, cx, cy-0.9*ry);
    const x_text = two.makeText("x",cx + 0.9*cx ,cy + 20 );
    x_text.alignment =  'left';
    x_text.size= 20;
    x_text.fill = 'rgb(0,0,0)';

    const y_text = two.makeText("y",cx +10 ,cy - 0.9*cy );
    y_text.alignment =  'left';
    y_text.size= 20;
    y_text.fill = 'rgb(0,0,0)';

    const vx = Math.cos(alpha)*cr;
    const vy = Math.sin(alpha)*cr;

    const vec = two.makeArrow(cx, cy, cx + vx, cy - vy);
    vec.linewidth = 2;

    const psin = two.makeLine(cx + vx, cy, cx + vx, cy- vy);
    psin.linewidth=4;
    psin.stroke = 'rgb(255,0,0)';
    const pcos = two.makeLine(cx , cy, cx + vx, cy);
    pcos.linewidth=4;
    pcos.stroke = 'rgb(0,0,255)';



    const sinText = two.makeText("sin",cx + vx + Math.sign(vx)*5,cy- 0.5*vy );
    sinText.alignment =  Math.sign(vx) > 0 ? 'left' : 'right';
    sinText.size= 20;
    sinText.fill = 'rgb(255,0,0)';

    const cosText = two.makeText("cos",cx + 0.5*vx ,  cy+Math.sign(vy)*25 );
    cosText.alignment = 'left';
    cosText.baseline = 'top';
    cosText.size= 20;
    cosText.fill = 'rgb(0,0,255)';

}

two.bind('update', update);

"LIA: stop"
</script>

But for this to be a circle, we need to have two conditions:

1. The axes have to be perpendicular, otherwise the circle is skewed.
2. The axes need to have the same length, otherwise the circle will be an ellipse. The radius of the circle will be the length of the axes.

We can just check these two conditions.
The first one is actually easy. We have:

$$
    \begin{align*}
    \mathbf{x} &= \mathbf{v} - \mathbf{r}\\
   & = \mathbf{v} - (\mathbf{v}\cdot \mathbf{n})\mathbf{n}\\
    \mathbf{y} &= \mathbf{n} \times \mathbf{v}
    \end{align*}

$$

As $ \mathbf{n} \times \mathbf{v}$ is perpendicular to both $ \mathbf{n}$ and $\mathbf{v}$ by the definition of the cross product, the first condition is fulfilled.

Now on to check the second condition. Let's compute the lengths of both axes, or we could compute the squared lengths, since they are simpler. For $\mathbf{x}$ we will use $||\mathbf{x}||^2 = \mathbf{x}\cdot \mathbf{x}$. 
Additionally, we will use the dot product definition of $\mathbf{x}\cdot\mathbf{y} = ||\mathbf{x}|| ||\mathbf{y}||\cos\beta$, where $\beta$ is the angle between both vectors.

$$
    \begin{align*}
    ||\mathbf{x}||^2 &= \mathbf{x}\cdot \mathbf{x} \\
    &= (\mathbf{v} - (\mathbf{v}\cdot \mathbf{n})\mathbf{n}) \cdot (\mathbf{v} - (\mathbf{v}\cdot \mathbf{n})\mathbf{n}) \\
    &= \mathbf{v}\cdot \mathbf{v} - \mathbf{v} \cdot (\mathbf{v}\cdot \mathbf{n})\mathbf{n} - (\mathbf{v}\cdot \mathbf{n})\mathbf{n}\cdot \mathbf{v} + (\mathbf{v}\cdot \mathbf{n})\mathbf{n}\cdot(\mathbf{v}\cdot \mathbf{n})\mathbf{n} \\
   & = ||\mathbf{v}||^2 - (\mathbf{v}\cdot \mathbf{n})(\mathbf{v} \cdot \mathbf{n}) - (\mathbf{v}\cdot \mathbf{n})(\mathbf{v}\cdot \mathbf{n}) + (\mathbf{v}\cdot \mathbf{n})^2(\mathbf{n}\cdot\mathbf{n}) \\
    &= ||\mathbf{v}||^2 - 2(\mathbf{v}\cdot \mathbf{n})^2 + (\mathbf{v}\cdot \mathbf{n})^2||\mathbf{n}||^2 \\
    &= ||\mathbf{v}||^2 - 2(\mathbf{v}\cdot \mathbf{n})^2 + (\mathbf{v}\cdot \mathbf{n})^2 \\
    &= ||\mathbf{v}||^2 - (\mathbf{v}\cdot \mathbf{n})^2 \\
    &= ||\mathbf{v}||^2 - ||\mathbf{v}||^2||\mathbf{n}||^2\cos^2\beta \\
    &= ||\mathbf{v}||^2 - ||\mathbf{v}||^2\cos^2\beta \\
    &= ||\mathbf{v}||^2(1 - \cos^2\beta) \\
    &= ||\mathbf{v}||^2\sin^2\beta
    \end{align*}

$$

The last step followed from $\sin^2\beta + \cos^2\beta = 1 \Rightarrow \sin^2\beta = 1 - \cos^2\beta$.

$\beta$ is the angle between $\mathbf{n}$ and $\mathbf{v}$.

$\mathbf{y}$ is easier, as there is a simple formula for the length of a cross product.

$$
    \begin{align*}
    ||\mathbf{y}||^2 &= ||\mathbf{n} \times \mathbf{v}||^2 \\
    &= ||\mathbf{n}||^2||\mathbf{v}||^2\sin^2\beta \\
    &= ||\mathbf{v}||^2\sin^2\beta
    \end{align*}

$$

Both axes have the same length: $||\mathbf{v}||\sin\beta$.

Therefore, we have verified, that the angle $\theta$ describes a circular motion!

The next step is to find out what the relationship between the vectors $\mathbf{n}$, $\mathbf{r}$,$\mathbf{n} \times \mathbf{v}$ and $\mathbf{v} - \mathbf{r}$ is.

We start with $\mathbf{r} = (\mathbf{v}\cdot \mathbf{n})\mathbf{n}$. 

The first term is $(\mathbf{v}\cdot \mathbf{n})$. This is just the projection of the vector $\mathbf{v}$ onto the $\mathbf{n}$, since $\mathbf{n}$ is normalized. That means "How much of $\mathbf{v}$ points into the direction $\mathbf{n}$". 
If we multiply that length by $\mathbf{n}$, we get the vector, with length $\mathbf{v}\cdot \mathbf{n}$ pointing into the direction of $\mathbf{n}$. The length can also be described as $\mathbf{v}\cdot \mathbf{n} = ||\mathbf{v}||\cos\beta$, where $\beta$ is the same angle as before.


<div id="container_1" width="300" height="300"></div>
@mutate.remover(container_1)

<script>

const container = document.getElementById("container_1");
container.innerHTML = '';
const two = new Two({
    width: 300,
    height: 300,
  autostart: true
}).appendTo(container);

let alpha = 0.0;

function update(frameCount, timeDelta)
{
    alpha += timeDelta/1000.0 * 2.0*Math.PI / 10;
    while(alpha > 2.0*Math.PI)
    {
        alpha -=  2.0*Math.PI;
    }
    two.clear();
    const cx = two.width / 2.0;
    const cy = two.height / 2.0;

    const rx = two.width / 2.0;
    const ry = two.height /2.0;

    const cr = Math.min(rx,ry)*0.8;
    
    const vecScale = 0.75*cr * (1.0 + 0.35*Math.cos(alpha*3));
    const vx = Math.cos(alpha)*vecScale;
    const vy = Math.sin(alpha)*vecScale;


    const vec = two.makeArrow(cx, cy, cx + vx, cy + vy);
    vec.linewidth = 2;
    vec.stroke = 'rgb(0,0,255)';

    const vText = two.makeText("v",cx + 1.2*vx, cy + 1.2*vy);
    vText.alignment = 'left';
    vText.size= 20;
    vText.fill = 'rgb(0,0,255)';


  

    const axisV = [0,-1];
    const axisScale = cr*0.75;
    const axisx = axisV[0] *axisScale;
    const axisy =  axisV[1]*axisScale;
    const axis = two.makeArrow(cx, cy, cx + axisx, cy + axisy);
    axis.linewidth = 4;

    const vecText = two.makeText("n",cx + axisx + 10, cy + axisy);
    vecText.alignment = 'left';
    vecText.size= 20;
    vecText.fill = 'rgb(0,0,0)';

    // projection
    const axis_length = Math.sqrt(axisx*axisx + axisy*axisy);
    const nx = axisx / axis_length;
    const ny = axisy / axis_length;

    const proj = nx * vx + ny*vy;

    const px = nx * proj;
    const py = ny * proj;
    const pv = two.makeArrow(cx, cy, cx + px, cy + py);
    pv.linewidth = 2;
    pv.stroke = 'rgb(255,0,0)';

    const pText = two.makeText("n(n\u00B7v)",cx + 0.5*px + 10, cy + 0.5*py);
    pText.alignment = 'left';
    pText.size= 20;
    pText.fill = 'rgb(255,0,0)';
    // pText.stroke = 'rgb(255,255,255)';


    const angle_between = (x1,y1, x2,y2) => {
        const dot = x1*x2 + y1*y2;   
        const det = x1*y2 - y1*x2; 
        return Math.atan2(det, dot);
    };

    const dx = vx - px;
    const dy = vy - py;
    const dv = two.makeLine(cx + px, cy +py, cx + px + dx, cy + py + dy);
    dv.dashes = [5, 5];


    const ca = angle_between(1,0,nx,ny);
    const cb = angle_between(nx,ny,vx,vy);
    const angle = two.makeArcSegment(cx,cy,0,0.5*axisScale,ca, ca +cb);
    angle.fill = 'rgba(128,128,128,0.25)'


    const cax = Math.cos(ca + 0.5*cb)*0.25*axisScale;
    const cay = Math.sin(ca + 0.5*cb)*0.25*axisScale;
    const cav = two.makeLine(cx + cax, cy + cay, cx - 2.0*cax, cy -2.0*cay);

    const caText = two.makeText("\u03B2",cx - 2.2*cax, cy -2.2*cay);
    caText.alignment = 'left';
    caText.size= 20;
    caText.fill = 'rgb(0,0,0)';
}

two.bind('update', update);

"LIA: stop"
</script>

The  vector $\mathbf{v} - \mathbf{r}$ is the vector pointing from $\mathbf{r}$ to $\mathbf{v}$. Since $\mathbf{r}$ is the projection of $\mathbf{v}$ onto $\mathbf{n}$, we have that $\mathbf{v} - \mathbf{r}$ is perpendicular to $\mathbf{n}$!

We can also check if that is true, by computing the dot product. If they are perpendicular, the dot product is $0$.

$$
    \begin{align*}
    \mathbf{n}\cdot(\mathbf{v} - \mathbf{r}) &=  \mathbf{n}\cdot \mathbf{v} -  \mathbf{n}\cdot \mathbf{r} \\
    &= \mathbf{n}\cdot \mathbf{v} - \mathbf{n}\cdot(\mathbf{v}\cdot \mathbf{n})\mathbf{n} \\
    &=  \mathbf{n}\cdot \mathbf{v} - (\mathbf{v}\cdot \mathbf{n})\mathbf{n}\cdot\mathbf{n} \\
    &=  \mathbf{n}\cdot \mathbf{v} - (\mathbf{v}\cdot \mathbf{n})\\
    &= 0
    \end{align*}
$$

With our previous observation, $\mathbf{v} - \mathbf{r}$ is just our circle's $\mathbf{x}$ axis. We already checked, that the $\mathbf{y}$ axis $\mathbf{n}\times\mathbf{v}$ is perpendicular to both $\mathbf{x}$ and $\mathbf{n}$. 

So both axes are actually perpendicular to $\mathbf{n}$! This means, that the circle, in which the rotation happens, spins around the axis $\mathbf{n}$!

By definition, we have:

$$
    \mathbf{v} = \mathbf{r} + \mathbf{x}
$$

So we move from the origin to the projection of $\mathbf{v}$ onto $\mathbf{n}$ and from there along the $\mathbf{x}$ axis to arrive at $\mathbf{v}$ itself. If we plug in the $\theta = 0$, this is exactly what our formula produces!

The $\mathbf{r}$ part does not change for any value of $\theta$. And since the movement occurs around $\mathbf{n}$ in a circle, the distance to $\mathbf{n}$ of the spinning point does not change either.

If we take the two components $\mathbf{r}$ and $\cos\theta(\mathbf{v}- \mathbf{r} ) + \sin\theta(\mathbf{n}\times \mathbf{v})$, we can compute the (squared) length of the resulting vector by a basic Pythagoras.

$$
\begin{align*}
    ||\mathbf{r} + \cos\theta(\mathbf{v}- \mathbf{r} ) + \sin\theta(\mathbf{n}\times \mathbf{v})||^2 &= ||\mathbf{r}||^2 + ||\cos\theta(\mathbf{v}- \mathbf{r} ) + \sin\theta(\mathbf{n}\times \mathbf{v})||^2 \\
    &= ||\mathbf{v}||^2\cos^2\beta + ||\mathbf{v}||^2\sin^2\beta \\
    &= ||\mathbf{v}||^2(\cos^2\beta + \sin^2\beta) \\
    &= ||\mathbf{v}||^2
\end{align*}
$$

So the final vector will always have the same length as the original vector $\mathbf{v}$! 

So with all of this, the final conclusion:

A quaternion $\mathbf{q}(\theta,\mathbf{n})$ describes a rotation of a point around a normalized axis $\mathbf{n}$ going through the origin with an angle $\theta$.

The following shows the full $3$D setup. In yellow, we have the rotation axis (scaled, since conceptually the length doesn't really matter, just the axis direction). The red point, to which the red arrow points is then rotated with some angle around the axis. The result is the blue point. This rotation happens in the plane perpendicular to the axis, represented by the circular arcs between the red and the blue points. The red line above the array corresponds to the vector $\mathbf{v} - \mathbf{r}$.

<div id="container_2" width="300" height="300"></div>
@mutate.remover(container_2)

<script>


    const container = document.getElementById("container_2");
    const w = 300;
    const h = 300;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, w/h, 0.1, 1000 );
    camera.position.set(2,0.5,2);
    camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
    const renderer = new THREE.WebGLRenderer();

    const angle_between = (x1,y1, x2,y2) => {
        const dot = x1*x2 + y1*y2;   
        const det = x1*y2 - y1*x2; 
        return Math.atan2(det, dot);
    };

    renderer.setSize( w,h );

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );

   

    const quatAxis = new THREE.Vector3( 0, 1, 0 );
    const quatAngle = Math.PI / 2;
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle( quatAxis, quatAngle);

    const quaternionYToAxis = new THREE.Quaternion();
    quaternionYToAxis.setFromUnitVectors( new THREE.Vector3( 0, 0, 1 ), quatAxis );

    const v =new THREE.Vector3( 1, 0.25, 1 );

    const n = quatAxis.clone().normalize();

    const vproj = n.dot(v);

    const rotateX = new THREE.Vector3( 1, 0, 0 );
    rotateX.sub(n.clone().multiplyScalar(n.dot(rotateX)));

    const projV = v.clone();
    projV.sub(n.clone().multiplyScalar(n.dot(projV)));

    const projVLength = projV.length();
    const quaternionXToAxis = new THREE.Quaternion();
    quaternionXToAxis.setFromUnitVectors( rotateX.clone().normalize(), projV.clone().normalize() );

    const vr = v.clone().applyQuaternion( quaternion );
    {
        // start rotation axis
        const points = [new THREE.Vector3( 0, 0, 0 ), projV.clone()];

        const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const line = new THREE.Line( geometry, material );
        line.position.copy( n.clone().multiplyScalar(vproj));

        scene.add( line );
    }

     {
        // end rotation axis
        const projVr = vr.clone();
        projVr.sub(n.clone().multiplyScalar(n.dot(projVr)));
        const points = [new THREE.Vector3( 0, 0, 0 ), projVr.clone()];

        const material = new THREE.LineBasicMaterial( { color : 0x0000ff } );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const line = new THREE.Line( geometry, material );
        line.position.copy( n.clone().multiplyScalar(vproj));

        scene.add( line );
    }
    {
        const points = [];

        for(let i = 1; i<=3; i++)
        {
            const t = i/3;
            const curve = new THREE.EllipseCurve(
                0, 0,             // ax, aY
                projVLength*t, projVLength*t,            // xRadius, yRadius
                0, quatAngle, // aStartAngle, aEndAngle
                false             // aClockwise
            );
            const cpoints = curve.getPoints( 50 );

            for(let j = 0; j < cpoints.length-1; j++)
            {
                points.push(cpoints[j]);
                points.push(cpoints[j+1]);
            }

        }

       

        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const material = new THREE.LineBasicMaterial( { color : 0xffffff } );

        const line = new THREE.LineSegments( geometry, material );
        line.setRotationFromQuaternion(quaternionXToAxis.clone().multiply(quaternionYToAxis));
        line.position.copy( n.clone().multiplyScalar(vproj));

        scene.add( line );

    }

    {
        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL( 0.6, 1, 0.6 );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 50, 0 );
        scene.add( hemiLight );
    }
    {  
        const from = new THREE.Vector3( 0, 0, 0 );
        const to = new THREE.Vector3( v.x,v.y,v.z );
        const direction = to.clone().sub(from);
        const length = direction.length();
        const arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xff0000 );
        scene.add( arrowHelper );
    }

     {  
        const from = new THREE.Vector3( 0, 0, 0 );
        const to = new THREE.Vector3( quaternion.x,quaternion.y,quaternion.z );
        const direction = to.clone().sub(from);
        const length = direction.length();
        const arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, 1, 0xffff00, 0.3,0.3*0.3 );
        scene.add( arrowHelper );
    }

    {

            const geometry = new THREE.SphereGeometry( 0.1, 32, 16 );
            const material = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
            const sphere = new THREE.Mesh( geometry, material );
            sphere.position.copy(v);
            scene.add( sphere );
    }

    {

            const geometry = new THREE.SphereGeometry( 0.1, 32, 16 );
            const material = new THREE.MeshStandardMaterial( { color: 0x0000ff } );
            const sphere = new THREE.Mesh( geometry, material );
            sphere.position.copy(vr);
            scene.add( sphere );
    }


    container.innerHTML = '';
    container.appendChild( renderer.domElement );


    let cangle = 0.0;
    function animate() {
        requestAnimationFrame( animate );
        const camR = 2.25;
        camera.position.set(camR*Math.cos(cangle),1.2,camR*Math.sin(cangle));
        cangle += 0.01;
        camera.lookAt(new THREE.Vector3( 0, 0, 0 ) );
        renderer.render( scene, camera );
    }
    animate();
    "LIA: stop"
</script>

While there are details, such as the quaternion values being computed with $\frac{\theta}{2}$ instead of $\theta$, we are just concerned with the quaternion doing some action to a given point according to the rotation formula $\mathbf{q}(0,\mathbf{v})\overline{\mathbf{q}}$. This action is the important part and is what we arrived at from the formulas.

Now you may ask, how one comes up with such a formula in the first place? As stated in the beginning, we aren't really concerned with the whys in this document. We rather go the pragmatic way of taking what's there and seeing what it does. We can just think about this as some neat calculation trick. Like, we could start from the endpoint and go back from there to the beginning. In the same way, as we can think about $3$D translation matrices being $4\times 4$, since that falls out if we just write down $\mathbf{v} + \mathbf{t}$ and write down the coefficients into a matrix. We could start from some higher point of view about affine spaces, but from the purely practical point of view, there might not be a difference.

In the next section we will briefly check out the main reason that quaternions are useful: Interpolating rotations.

## Interpolating orientations

There are some arguments about when to use quaternions and discussions about ease of use and computational complexity, which we are not going into right now.
Quaternions are definitely the way to go in one very important aspect: Interpolating orientations/rotations.
This is something that comes up in many different scenarios. Orientation and rotation will be used interchangeably here. Basically the orientation is how some object is rotated in the world, so they basically mean the same here.

In computer graphics and animation, you can think about a camera looking around or an object smoothly rotating from one position into another.
This section will just show you the results, as this is a larger topic to tackle, but hopefully you can see the issues that is being solved.
You are probably familiar with Euler angles. In tools like Unity or Blender and many more, you usually manipulate the rotation of an object by setting three values: The rotation around the $x$-axis, the rotation around the $y$-axis and the rotation around the $z$-axis. 
These three rotations are then applied in some order.
If you have wiggled around with these values with some kind of slider, you might have seen some weird behavior with values suddenly jumping around. 

This is, like the interpolation problem, related to the structure of these $3$ values and how they are related to their corresponding rotations. You might have heard the name "Gimbal Lock" before, which is another similar problem, where two axes become interlocked, because one rotation in the sequence rotated them on top of each other. While annoying, if you just had to deal with this for singular orientations, it wouldn't actually be a problem.
Now, this whole topic of the structure of these parameters has a huge consequence: When you try to go from one orientation to another, the path through the space of all rotations might not be a smooth one. In practical terms, there might be sudden shifts along the way.

Interpolation for Euler angles just means interpolating each angle separately. 
For a linear interpolation with an interpolation parameter $t\in[0,1]$, starting angle $\alpha_{\text{start}}$ and ending angle $\alpha_{\text{end}}$, we linearly interpolate with the following formula:

$$
    \alpha(t) = (1-t)\alpha_{\text{start}} + t\alpha_{\text{end}}
$$

If you are not familiar with the formula, you might know the name "lerp" (**l**inear int**erp**olation, ...). For $t=0$ you get the starting value and for $t=1$ the ending one.

It turns out, quaternions have a pretty nice structure for these kinds of problems. And you can actually find a nice and smooth path between two different orientations! 

The interpolation used for quaternions is pretty similar.

$$
    \mathbf{q}(t) = \frac{\sin((1-t)\theta)}{\sin\theta}\mathbf{q}_{\text{start}} + \frac{\sin(t\theta)}{\sin\theta}\mathbf{q}_{\text{end}}
$$

Here, $\theta$ is the angle between both quaternions, which can be gained from the dot product with $\mathbf{q}_{\text{start}} \cdot \mathbf{q}_{\text{end}} = \cos\theta$.

The following little animation shows an arrow's orientation being interpolated.
After the first one, you will get random rotations, so they might not always be so extreme.
In general, the effect should be fairly consistent though.

On the **left** side, we see the **Euler** angle approach, on the **right** side the **quaternion** one. While they have the same beginning and end, the Euler version doesn't go the direct way from one to the other. Instead, it will often make a whole weird loop or take a really long way. Imagine that is your camera, it will make you sick! The quaternion version just moves with a constant speed directly between both orientations.

<div id="container_3"></div>
@mutate.remover(container_3)

<script>


    const container = document.getElementById("container_3");
    const w = 600;
    const h = 300;
    const scene = new THREE.Scene();
    const sceneQuat = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera( 75, 0.5*w/h, 0.1, 1000 );
    camera.position.set(2,0.5,2);
    camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
    const renderer = new THREE.WebGLRenderer();
    renderer.autoClear = false;

    const angle_between = (x1,y1, x2,y2) => {
        const dot = x1*x2 + y1*y2;   
        const det = x1*y2 - y1*x2; 
        return Math.atan2(det, dot);
    };

    renderer.setSize( w,h );
    const group = new THREE.Group();

    // let euler_0 = new THREE.Vector3(0,0,0);
    let euler_0 = new THREE.Vector3(0.8396365404838484,0.6023047424800141,0.014073591015462112);
    // let euler_1 = new THREE.Vector3(1.5*Math.PI,Math.PI,Math.PI/2.0);
    let euler_1 = new THREE.Vector3(5.092555486524211,1.8995954663581927,3.721368347198473);

    let q0 = new THREE.Quaternion();
    q0.setFromEuler((new THREE.Euler()).setFromVector3(euler_0));
    let q1 = new THREE.Quaternion();
    q1.setFromEuler((new THREE.Euler()).setFromVector3(euler_1));

    {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        cube.scale.set(0.25,1,0.25);
        group.add(cube);

    }

    {
        const geometry = new THREE.ConeGeometry( 0.5, 0.5, 4 );
        const material = new THREE.MeshStandardMaterial( {color: 0xffff00} );
        const cone = new THREE.Mesh( geometry, material );
        cone.position.set(0,0.5,0);
        group.add( cone );
    }
    scene.add( group );
    const groupQuat = group.clone();
    sceneQuat.add(groupQuat);

    let lineEuler = null;
    let lineQuat = null;

    function create_paths(){
        // create path
    {
        const points = [];

        const initial = new THREE.Vector3(0.0,0.75,0.0);
        const num = 100;
        for(let i = 0; i<num; i++)
        {
            const t = i/(num-1);

            const euler = new THREE.Vector3();
            euler.lerpVectors(euler_0,euler_1,t);
            const quaternion = new THREE.Quaternion();
            quaternion.setFromEuler((new THREE.Euler()).setFromVector3(euler));
           
            const p = initial.clone();
            p.applyQuaternion( quaternion );
            points.push(p);
        }

       

        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const material = new THREE.LineBasicMaterial( { color : 0xffffff } );

        const line = new THREE.Line( geometry, material );

        if(lineEuler !==null)
        {
            lineEuler.removeFromParent();
            lineEuler.geometry.dispose();
        }
        lineEuler = line;
        scene.add( lineEuler );
    }

    {
        const points = [];

        const initial = new THREE.Vector3(0.0,0.75,0.0);
        const num = 100;
        for(let i = 0; i<num; i++)
        {
            const t = i/(num-1);

            const quaternion = new THREE.Quaternion();
            quaternion.slerpQuaternions(q0,q1,t);
            const p = initial.clone();
            p.applyQuaternion( quaternion );
            points.push(p);
        }

       

        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const material = new THREE.LineBasicMaterial( { color : 0xffffff } );

        const line = new THREE.Line( geometry, material );
        if(lineQuat !== null)
        {
            lineQuat.removeFromParent();
            lineQuat.geometry.dispose();

        }
        lineQuat = line;
        sceneQuat.add( lineQuat );
    }

    }
    

    create_paths();

  {
        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL( 0.6, 1, 0.6 );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 50, 0 );
        scene.add( hemiLight );
        sceneQuat.add( hemiLight.clone() );
    }

    container.innerHTML = '';
    container.appendChild( renderer.domElement );


    let cangle = 0.0;
    let time = 0.0;

    const durationRotate = 1.0;
    const durationStay = 2.0;

    function animate() {
        
        time+=0.005;
    
        if(time < durationRotate)
        {
            const t = time / durationRotate;
            const euler = new THREE.Vector3();
            euler.lerpVectors(euler_0,euler_1,t);
            group.setRotationFromEuler((new THREE.Euler()).setFromVector3(euler));

            const quaternion = new THREE.Quaternion();
            quaternion.slerpQuaternions(q0,q1,t);
            groupQuat.setRotationFromQuaternion(quaternion);

        }else if(time > durationRotate + durationStay)
        {
            euler_0 = new THREE.Vector3().random().multiplyScalar(2.0*Math.PI);
            euler_1 = new THREE.Vector3().random().multiplyScalar(2.0*Math.PI);

            q0 = new THREE.Quaternion();
            q0.setFromEuler((new THREE.Euler()).setFromVector3(euler_0));
            q1 = new THREE.Quaternion();
            q1.setFromEuler((new THREE.Euler()).setFromVector3(euler_1));
            create_paths();
            time = 0.0;

        }
     

        requestAnimationFrame( animate );
        const camR = 2.25;
        camera.position.set(camR*Math.cos(cangle),1.2,camR*Math.sin(cangle));
        // cangle += 0.01;
        camera.lookAt(new THREE.Vector3( 0, 0, 0 ) );
        renderer.clear();
        renderer.setViewport( 0, 0, w/2, h );
        renderer.render( scene, camera );
        renderer.setViewport( w/2, 0, w/2, h );
        renderer.render( sceneQuat, camera );
    }
    animate();
    "LIA: stop"
</script>
