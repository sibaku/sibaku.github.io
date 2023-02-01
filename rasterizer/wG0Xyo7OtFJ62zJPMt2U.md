<!--
author: sibaku

version:  0.0.1

language: en

script: ./rasterizer/lib/jsmatrix_no_module.js
        ./rasterizer/src/defines.js
        ./rasterizer/src/common.js

comment:  Rasterization fundamentals

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
}

</script>
@end
-->

# Introduction

This course aims to give a practical explanation about the basics of computer graphics.

We will start by drawing a line on the screen.
Afterwards, we will handle displaying triangles.
Just seeing some shapes is a bit boring, so we will put some colors on our triangles.
From there on, we take aim at creating 3D images and showing them on the 2D screen.
Finally, textures, shading and blending can be applied to our scenes.

All the theory will be followed up by a basic implementation, that you can try to do yourself in your browser!

You can also just look at the theory and the solutions if you like. You are free to engage with it in any way you like.

Just to give you an impression, this is our beginning:

![An image showing lines in a circle](./rasterizer/img/beginning.png)

In the end, we will be able to draw something like this (aesthetic sense arguable):

![A 3D scene with different textured and illuminated objects](./rasterizer/img/playground.png)

There are of course other resources, like the excellent [scratchapixel](https://www.scratchapixel.com/lessons/3d-basic-rendering/rasterization-practical-implementation/overview-rasterization-algorithm.html), but I do think that there is an advantage to being able to have everything, theory and implementation in one package. Setting up a nice programming environment has a lot of advantages by itself, but it also represents an additional hurdle to get started and manage the code progress.

With that out of the way, I hope you have fun!

# Prerequisites

This section will cover the basics of what you will need to know to understand the theory and practical implementation. 
You won't need highly advanced mathematics or programming skills to get by.

Higher level insight might give you some additional explanation or way to think about certain aspects, but in most cases, some basic maths and a more mechanical approach to working with mathematical expressions is more than enough.

For example, while it certainly helps to know matrix algebra with concepts such as range, bases, rank and so on, for most cases in here it will be enough to know how to calculate a matrix product.

## Maths

This section will  give you a brief overview of the general mathematics that you need to know.

Each subsection will start with a quick TL;DR section that is a mixture of questions (if it would be a bit more to type) and short statements.
If you know all of those, you can skip the section, as it will just be a recap with some basic explanations of those topics.

### Trigonometry
<!--
script: ./rasterizer/lib/two.min.js
        https://cdn.plot.ly/plotly-2.12.1.min.js
-->

<!-- style="background-color: #E6E6E3;"-->
> **TL;DR - What should you know?**
>
> * Angles are specified in radians. An angle in degrees $\alpha$ is related to one in radians $b$ as $\frac{\alpha}{360^\circ} = \frac{b}{2\pi}$
> * In a unit circle, how do you draw/read the sine and cosine of an angle $\alpha$?
> * What is $\sin^2(\alpha) + \cos^2(\alpha)$?
> * Where do sine and cosine take on special values ($1,0,-1$)?
> * Where are the sine and cosine positive and negative?

Knowing sine and cosine is important in all kinds of contexts.
For a lot of applications related to geometry, you will most likely only need two pieces of information:

* In a triangle with a right-angle, where do you find the sine and cosine?
* How do they look as a graph (where are some special values located)?


The easiest thing to keep in mind is thinking about a circle with radius $1$.
Choose some angle $\alpha$ (alpha). 
Draw a line which has that angle counter-clockwise from the $x$-axis through the origin $\mathbf{O}$.
The line meets the circle in a point $\mathbf{P}$.
Draw a straight line through $\mathbf{P}$ parallel to the $y$-axis, which will intersect the $x$-axis in a point $\mathbf{Q}$.
You now have a right triangle $\Delta \mathbf{O}\mathbf{Q}\mathbf{P} $, where the right angle occurs at the point $\mathbf{Q}$.

The sine $\sin$ is just the $y$-segment from $\mathbf{Q}$ to $\mathbf{P}$.
It is positive, if the line goes up and negative if it goes down.

The cosine $\cos$ is just the $x$-segment from $\mathbf{O}$ to $\mathbf{Q}$.
It is positive, if the line goes right and negative if it goes left.

The segment from $\mathbf{O}$ to $\mathbf{P}$ is called the hypotenuse and its length is equal to the circle radius, which is $1$ in our case.

Below you can see an animation without the points, as they aren't really necessary. 
The angle $\alpha$ varies, showing you how it relates to the different values of $\sin$ and $\cos$.

<div id="sec_trig_container_0" width="300" height="300"></div>
@mutate.remover(sec_trig_container_0)

<script>

const container = document.getElementById("sec_trig_container_0");
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

    const angleText = two.makeText("\u03B1",cx + Math.cos(alpha/2.0)*angleRadius*0.5,cy- Math.sin(alpha/2.0)*angleRadius*0.5);
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

If the circle didn't have radius $r=1$, but instead just some $r$, the whole triangle would look exactly the same, but scaled.
So the side lengths would become $r\sin(\alpha)$ and $r\cos(\alpha)$.

From the Pythagorean theorem, we know that the sum of the squared shorter sides of a right triangle is equal to the squared length of the longer hypotenuse. 
Since we have a right triangle and used a unit circle with $r=1$, we have the important property:

$$
    \sin^2(\alpha) + \cos^2(\alpha) = 1
$$

This comes up quite often, so it is important to memorize.

Another important thing to remember, is that in general, angles are specified in radians, not degrees, so it is good to get familiar with it.
Radians measure the length of an arc segment on the unit circle, that is covered by an angle.
If you can't remember how to switch between them, here is a simple way to remember it.
Degrees and radians are proportional to each other.
The circumference of the unit circle is $2\pi$.
A circle has $360^\circ$.
Dividing both angles by their respective full circle will yield the same ratio (a half circle is a half circle).
With that we can relate an angle in degree $\alpha$ and in radians $b$ as:

$$
\begin{align*}
\frac{\alpha}{360^\circ} &= \frac{b}{2\pi} \\
\alpha  &= 360^\circ\frac{b}{2\pi} \\
        &= 180^\circ \frac{b}{\pi} \\
b       &= \frac{2\pi\alpha}{360^\circ}\\
        &= \frac{\pi\alpha}{180^\circ}
\end{align*}
$$

From the animation above, you can deduce a number of special angle-number pairs, which are good to know:

$$
\begin{align*}
\sin(0^\circ)   &= \sin(0) = 0\\
\cos(0^\circ)   &= \cos(0) = 1\\
\sin(90^\circ)  &= \sin(\frac{\pi}{2}) = 1\\
\cos(90^\circ)  &= \cos(\frac{\pi}{2}) = 0 \\
\sin(180^\circ)  &= \sin(\pi) = 0\\
\cos(180^\circ)  &= \cos(\pi) = -1 \\
\sin(270^\circ)  &= \sin(\frac{3\pi}{2}) = -1\\
\cos(270^\circ)  &= \cos(\frac{3\pi}{2}) = 0 \\       
\end{align*}
$$

The diagonal angles ($45^\circ, 135^\circ, 225^\circ, 315^\circ$) also have a trick to remember them.
In those cases the right triangle is symmetric and so the $\sin$ and $\cos$ sides must have the same length, let's call it $l$.
We have $\sin^2 + \cos^2 = 1 \Rightarrow l^2 + l^2 = 2l^2 = 1 \Rightarrow l = \sqrt(\frac{1}{2})$.
You just have to add a negative sign to this length, whenever the sine goes downward or the cosine left.

With this knowledge, you can already solve a lot of problems without computing any values.
Just for completeness sake, let us look at the plots of both functions.

<div id="sec_trig_container_1" width="300" height="300"></div>
@mutate.remover(sec_trig_container_1)

<script>

const x = [];
const n = 1000;
for(let i = 0; i < n; i++)
{
    x.push(i/(n -1) * 2.0 * Math.PI);
}
const ysin = x.map(a => Math.sin(a));
const ycos = x.map(a => Math.cos(a));

const trace1 = {
  x,
  y: ysin,
  mode: 'lines',
  name: 'sin'
};


const trace2 = {
  x,
  y: ycos,
  mode: 'lines',
  name: 'cos'
};

Plotly.newPlot('sec_trig_container_1', [trace1, trace2]);

"LIA: stop"
</script>

Having this graph roughly in the back of your mind, you can make some decent guesses at values for quick estimations.

You might also notice, that both graphs look very similar. 
That is because they are! Sine and cosine are actually the same graph, just offset a bit.

Next up are vectors!

### Vectors

<!-- style="background-color: #E6E6E3;"-->
> **TL;DR - What should you know?**
>
> * Vectors have direction and length, but no position
> * How do you add/subtract vectors?
> * How do you scale a vector by some factor $s$?
> * How do you compute the length of a vector?
> * How do you compute the dot product of two vectors (2 ways)?
> * The dot product is commutative $\mathbf{a}\cdot\mathbf{b} = \mathbf{b}\cdot\mathbf{a}$
> * The dot product is bilinear: $\mathbf{a} \cdot (s \mathbf{b} + t \mathbf{c}) = s(\mathbf{a}\cdot \mathbf{b}) + t (\mathbf{a}\cdot \mathbf{c}) $
> * What orientations of two vectors with respect to each other result in what dot product values (positive, negative, zero)?
> * What is the range of the dot product for two unit vectors (length $1$)?
> * What is the cross product and how to calculate it?
> * What is the length of the result of the cross product?
> * The cross product is anti-commutative $\mathbf{a}\times\mathbf{b} = -\mathbf{b}\times\mathbf{a}$
> * The cross product is bilinear: $\mathbf{a} \times (s \mathbf{b} + t \mathbf{c}) = s(\mathbf{a}\times \mathbf{b}) + t (\mathbf{a}\times \mathbf{c}) $
> * The cross product with a multiple of itself is the zero vector. $\mathbf{a}\times (s\mathbf{a}) = \mathbf{0}$

A vector consists of just two properties: A direction and a length.

Usually, they are represented by an arrow. Note the "represented", as vectors do not have a position and any arrow you draw is just as good as another one with the same direction and length somewhere else.

In the following, vectors are written as small bold letters, for example the vector $\mathbf{a}$.

You can add two vectors $\mathbf{a}$ and $\mathbf{b}$ by drawing $\mathbf{a}$ and then $\mathbf{b}$ starting from $\mathbf{a}$'s tip. 
The result is the connection from the start of $\mathbf{a}$ to the tip of $\mathbf{b}$.
You can also draw $\mathbf{b}$ first to arrive at the same conclusion.
So vector addition is commutative: $\mathbf{a} + \mathbf{b} = \mathbf{b} + \mathbf{a}$.

Subtraction is basically the same as subtraction.
For $\mathbf{a} - \mathbf{b}$, you do an addition but with $\mathbf{b}$ inverted.
So $-\mathbf{a}$ means flip around a vector.

You can scale a vector by some factor $s$, by drawing it $s$ times longer.

Now, you don't usually calculate anything by drawing arrows. 
Instead, you will pin down a coordinate system and associate a vector with the coordinates that represent it in that system.

We will write the components of the vector as subscripts, either as numbers denoting their index or as their name, whichever is more convenient.
For example, the three components of a 3D vector $\mathbf{a}$ are $a_x, a_y, a_z$ or $a_1,a_2,a_3$.

Vectors will be written as column vectors, that is they are written in a column:

$$
    \mathbf{a} = \begin{pmatrix} a_1 \\ a_2 \\ a_3 \end{pmatrix}
$$

Addition and subtraction is straightforward: Add or subtract the corresponding coordinates of each vector representation.
Scaling is computed, by multiplying each coordinate with the scaling factor.

The length of a 2D vector, denoted by vertical lines left and right $||.||$ can be computed by the Pythagorean theorem: The vector $\mathbf{a}$ is the hypotenuse of a triangle with sides $a_x$ and $a_y$. 

$$
    ||\mathbf{a}|| = \sqrt{a_x^2 + a_y^2}
$$

For vectors in higher dimensions, you can just apply Pythagoras multiple times and get the general formula:

$$
    ||\mathbf{a}|| = \sqrt{a_1^2 + a_2^2 + \dots + a_n^2}
$$

A vector with length $1$ is called a unit vector or a *normalized* vector.

Now one thing that is missing is multiplication and division for vectors.
The reason for that is that there is no definition that satisfies all properties of what we want multiplication or division to do.

There are two operations, that at least have the name product: The *dot product* and the *cross product*.

Both and especially the dot product are incredibly important operations.

Let's start with the dot product.

The dot product $\cdot$ is defined in two ways:

$$
\begin{align*}
    \mathbf{a} \cdot \mathbf{b} &= a_1b_1 + a_2b_2 + + \dots + a_nb_n\\
                                &= ||\mathbf{a}|| ||\mathbf{b}|| \cos \alpha
\end{align*}
$$

$\alpha$ is the (smallest) angles between the two vectors.

You can try out to show that these are equivalent by drawing two vectors in 2D and fiddling around with geometry, it is a bit tedious but gets you to there.

You can think about the first version as something you use to calculate the value of the dot product and the second one to do some reasoning about angles (exceptions obviously apply).

From the definitions you can immediately see (by just plugging in) two important properties:

$$
\begin{align*}
    (\mathbf{a} \cdot \mathbf{b}) &= (\mathbf{b} \cdot \mathbf{a})\\
    \mathbf{a} \cdot (\mathbf{b} + \mathbf{c})  &= \mathbf{a}\cdot \mathbf{b} + \mathbf{a}\cdot \mathbf{c}
\end{align*}
$$

To understand the main interpretation, just assume for a moment, that $||\mathbf{a}||= || \mathbf{b}|| = 1$, so we have two unit vectors.
Then we have $\mathbf{a}\cdot \mathbf{b} = ||\mathbf{a}|| ||\mathbf{b}||\cos\alpha = \cos\alpha$.

From the [trigonometry](#trigonometry) section, we already know the geometric interpretation of $\cos\alpha$, which we can use here.
Choose either $\mathbf{a}$ or $\mathbf{b}$ as the $x$-axis and the other one as the triangle hypotenuse. Then the dot product is just tip of that hypotenuse dropped orthogonally onto the $x$-axis vector! Which one you choose doesn't matter, since you can switch the order in the dot product.

Now let's say that only vector $\mathbf{b}$ is a unit vector. Then $\mathbf{a} \cdot \mathbf{b} = ||\mathbf{a}|| \cos\alpha$. 
This corresponds to scaling the hypotenuse (the radius of the circle)!
The number $||\mathbf{a}|| \cos\alpha$ tells you, how much of $\mathbf{a}$ points into the direction of $\mathbf{b}$.

This is also called a projection and is the nice meaning of the dot product.

From this interpretation and the cosine formula we also get two important kinds of values of the dot product:

* $\mathbf{a}\cdot \mathbf{b} > 0 \Rightarrow \alpha < 90^\circ$
* $\mathbf{a}\cdot \mathbf{b} = 0 \Rightarrow \alpha = 90^\circ$
* $\mathbf{a}\cdot \mathbf{b} < 0 \Rightarrow \alpha > 90^\circ$

Especially the second property is important, as it means, that two perpendicular vectors have a dot product of $0$.

The cross product $\times$ is the second kind of product and contrary to the dot product, it results in a vector.

The vector $\mathbf{a} \times \mathbf{b}$ results in a vector that is perpendicular to both $\mathbf{a}$ and $\mathbf{b}$.
Importantly, it obeys the right-hand rule.
If you align your index finger with $\mathbf{a}$ and your middle finger with $\mathbf{b}$, then $\mathbf{a}\times \mathbf{b}$ points in the direction of your thumb.

The usual coordinate system works pretty nicely with it. Just take the sequence $xyz$ and start at any point. Cross that base vector with the next and you get the following one (you start from the beginning after $z$): $\mathbf{x} \times \mathbf{y} = \mathbf{z}$, $\mathbf{y} \times \mathbf{z} = \mathbf{x}$ and $\mathbf{z} \times \mathbf{x} = \mathbf{y}$.

You compute it as:

$$
    \mathbf{a} \times \mathbf{b} = \begin{pmatrix} a_2b_3 - a_3b_2\\ a_3b_1 - a_1b_3\\ a_1b_2 - a_2b_1\end{pmatrix}
$$

Similar to the dot product, since there are only subtractions and multiplications, you can factor out scalar values and distribute the product:

$$
\begin{align*}
    \mathbf{a} \times (s\mathbf{b} ) &= (s\mathbf{a}) \times \mathbf{b} \\
    &= s(\mathbf{a} \times \mathbf{b} ) \\
    \mathbf{a}  \times (\mathbf{b} + \mathbf{c}  )  &= \mathbf{a} \times \mathbf{b}  + \mathbf{a} \times \mathbf{c} 
\end{align*}
$$

Another important property is:

$$
    ||\mathbf{a} \times \mathbf{b}|| = ||\mathbf{a}|| ||\mathbf{b}|| \sin \alpha
$$

This is similar to the dot product! 
It corresponds to the area of the parallelogram spanned by the two vectors.

The cross product is anti-commutative, that means

$$
\mathbf{a} \times \mathbf{b} = - \mathbf{b} \times \mathbf{a}
$$

We can use that to compute the value of any vector with a multiple of itself:  $\mathbf{a} \times (s\mathbf{a}) = s(\mathbf{a} \times \mathbf{a}) = -s(\mathbf{a} \times \mathbf{a})$

That last part comes from exchanging the order in the cross product, which in this case just looks the same but still adds the $-$.
The only way, a vector (or number) is equal to itself negated is, when it is zero.
That means:

$$
\mathbf{a} \times (s\mathbf{b}) =  \mathbf{0} 
$$

One last word about vectors and points. 
Vectors don't have a position, but points are just that position.
We can "convert" a point to a vector by specifying its position vector.
This vector points from the origin to the point.

That is why mostly it won't really matter if we are talking about points or vectors.
There are some differences though, which will come up for example when considering translations.

With that, we covered the most important parts for now of vectors.

### Matrices

<!-- style="background-color: #E6E6E3;"-->
> **TL;DR - What should you know?**
>
> * Matrices are specified by their number of rows and columns
> * Vectors are matrices with one column
> * How do you add/subtract matrices?
> * How do you scale a matrix by some factor $s$?
> * How do you multiply two matrices?
> * What is a transposed matrix?
> * What is the identity matrix?
> * What is a matrix inverse?

For matrices, we just go over a few points.

A bit more intuition about parts of matrices will be added later, but for our purposes, it is enough to consider them just a tool to write down equations succinctly.

A matrix is a table of values. 
Matrices will be written capitalized in bold-face, for example $\mathbf{A}$.

A matrix has two dimensions, the number of rows and the number of cols.
The number of rows is specified first.

The following is an example of a $3\times 2$ matrix:

$$
    \mathbf{A} = \begin{pmatrix}a_{11} & a_{12} \\ a_{21} & a_{22} \\ a_{31} & a_{32}\end{pmatrix}
$$

You can also usually see the following way of writing: $\mathbf{A}\in \mathbb{R}^{m\times n}$.
This just means: "The matrix $\mathbf{A}$ is an element of the space of matrices of size $m\times n$ with real numbers as entries$.

And a vector is just a matrix with one column!

You can *transpose* a matrix. This just means, you mirror the matrix at its diagonal. 
You can also just remember, that a matrix element $a_{ij}$ gets put at the position $a_{ji}$ (so the diagonal stays the same).
The number of rows and columns is also swapped out by this operations.

The transpose of a matrix $\mathbf{A}$ is written as $\mathbf{A}^T$.

There are some additional ways to write a matrix, which sometimes make the intent clearer.
Instead of specifying every single element, we could make a matrix out of a number of columns (each is a vector!):

$$
    \mathbf{A} = \begin{pmatrix} \mathbf{a}_1 & \dots & \mathbf{a}_n\end{pmatrix}
$$

Similarly, we could write down the rows. 
To still use vectors, we need to convert a column to a row, which is what the transpose operation does.

$$
    \mathbf{A} = \begin{pmatrix} \mathbf{a}_1^T \\ \vdots \\ \mathbf{a}_m^T\end{pmatrix}
$$

Addition and subtraction are performed element-wise. 
It makes sense then, that both matrices have to be the same size for that.

Multiplication is slightly more involved, but for now we will just write down one easy to remember version to write it.

First, a multiplication from the left side of a matrix $\mathbf{A}$ with a vector $\mathbf{b}$:

$$
\begin{align*}
\mathbf{A}\mathbf{b} &= \begin{pmatrix}\mathbf{a}_1^T \\ \vdots \\ \mathbf{a}_m^T\end{pmatrix}\mathbf{b} \\
&= \begin{pmatrix}\mathbf{a}_1 \cdot \mathbf{b} \\ \vdots \\ \mathbf{a}_m \cdot \mathbf{b}\end{pmatrix}
\end{align*}
$$

The result will be a vector with $m$ rows. For the dot products to make sense, $\mathbf{A}$ needs to have $n$ columns, where $n$ is the size of the vector.

With that, you can also calculate the product of two matrices, by just thinking about the right matrix as a number of columns.

$$
\begin{align*}
\mathbf{A}\mathbf{B} &= \begin{pmatrix}\mathbf{a}_1^T \\ \vdots \\ \mathbf{a}_m^T\end{pmatrix} \begin{pmatrix}\mathbf{b}_1 & \dots \\ \mathbf{b}_n\end{pmatrix} \\
&= \begin{pmatrix}\mathbf{A}\mathbf{b}_1 & \dots & \mathbf{A} \mathbf{b}_n\end{pmatrix}\\
&= \begin{pmatrix}\mathbf{a}_1 \cdot \mathbf{b}_1 & \dots & \mathbf{a}_1 \cdot \mathbf{b}_n \\ \vdots& & \vdots \\ \mathbf{a}_m \cdot \mathbf{b}_1 &\dots & \mathbf{a}_m \cdot \mathbf{b}_n \end{pmatrix}
\end{align*}
$$

For this to work, the columns of the first matrix need to match the rows of the second. A $m\times p$ matrix times a $p \times n$ matrix results in a $m\times n$ matrix.

This means, that not every matrix can be multiplied with any other one.
This also means, we can't in general switch the order of multiplications. 
Even if the dimensions match, in general the following holds:

$$
    \mathbf{A}\mathbf{B} \neq \mathbf{B}\mathbf{A}
$$

This will be important when transforming objects in space.

One special matrix is the so called identity matrix.
We will write it as $\mathbf{I}_n$.
This matrix is square and has dimension $n$, so it is a $n \times n$ matrix.
If the dimension doesn't matter, we just write $\mathbf{I}$.

It has $1$s on the diagonal and $0$s everywhere else.

If the dimensions match, the identity matrix leaves any matrix unmodified (like multiplying by $1$):

$$
    \mathbf{I}\mathbf{A} = \mathbf{A}\mathbf{I} = \mathbf{A}
$$

With numbers, we can write $a \frac{1}{a} = 1$.
We say that $\frac{1}{a}$ is the inverse of $a$ which when multiplied makes it $1$.

For matrices we have something similar and it is also called inverse. When multiplied with a matrix, it results in the identity matrix. We write the inverse of $\mathbf{A}$ as $\mathbf{A}^{-1}$.

$$
    \mathbf{A}\mathbf{A}^{-1} = \mathbf{A}^{-1}\mathbf{A} = \mathbf{I}
$$

For this to be defined properly, it only exists for square matrices.
And similar to numbers, where $0$ does not have an inverse, there are matrices that do not have an inverse.

We don't need to consider the specifics here.

This concludes our very brief overview of the necessary information about matrices.

## Programming

This section will give you an overview of the way the programming is handled in this course.

### JSMatrix

We will be dealing with lots of vectors and matrices. 
This course uses the JSMatrix library (https://github.com/sibaku/jsmatrix) for all vector and matrix operations.

While probably not the fastest library, it should be decently feature complete, with some advanced features like matrix decompositions.
Additionally it is designed to provide lots of ways to access and work with elements of matrices and vectors, such as non-copy transpose, block-views, reductions and more.

Documentation can be found at the linked repository.

All functions are accessible under the variable `jsm`.

Since Javascript sadly does not have operator overloading, math operations such as $+$ have to be computed using functions, in this case `jsm.add`.

To make things slightly easier, a number of common functions are already provided at a global scope.
Here is a list of those:

* `add`: Add two matrices/vectors
* `sub`: Subtract a matrix/vector from another one
* `mult`: Multiply two matrices
* `scale`: Scale a matrix/vector by a scalar
* `dot`: The dot product between two vectors
* `cross`: The cross product between two 3D vectors
* `abs`: Computes the element-wise absolute value of a matrix/vector
* `normalize`: Divides a vector by it's length

* `cwiseMix`: Compute the element-wise minimum of two matrices/vectors
* `cwiseMax`: Codmpute the element-wise maximum of two matrices/vectors
* `cwiseMult`: Compute the element-wise multiplication of two matrices/vectors
* `subvec`: Get a view of a part of a vector, so it can match dimensions with other operations
* `diag`: Get a view of the diagonal of a matrix. Behaves just like a vector
* `block`: Get a view of a part of a matrix, so it can match dimensions with other operations, such as multiplication or filling
* `transpose`: Get a view of the transpose of a matrix
* `insert`: Fills a matrix with the values of another one. Can be combined with views
* `fill`: Fills a matrix with a scalar value. Can be combined with views
* `copy`: Copy the given matrix/vector
* `hvec`: Creates a view into the given vector with an additional constant coordinate (default = 1)

* `v32`: Factory functions for float vectors
* `m32`: Factory functions for float matrices

Additionaly, as it is commonly used, we defined some helper functions for the common 2D, 3D and 4D vectors:

* `vec2(x,y)`: This is just a shorthand for `v32.from([x,y])`
* `vec3(x,y,z)`: This is just a shorthand for `v32.from([x,y,z])`
* `vec4(x,y,z,w)`: This is just a shorthand for `v32.from([x,y,z,w])`
* `mix(a, b, t)`: Computes a linear interpolation with the parameter `t` for the vectors/matrices `a` and `b`
* `ceil(a, out)`: Computes the per component ceil function and stores the result in `out`
* `floor(a, out)`: Computes the per component floor function and stores the result in `out`
* `isAny(a, b, cmp)`: Does a element-wise comparison of `a` and `b`. Returns `true`, if any of those comparisons where `true`, `false`otherwise. `cmp` is any function `cmp(elem_a, elem_b) => {true|false}`

You can try out these functions or any others below to get a feeling. 
The code section contains example code, but you can change it as you like.
Just click the run button to execute.
In this example, you can use the helper function `write_maths(value, name = "")` to print out a block that nicely formats given vectors and matrices.
Additionally `write(str)` can be used to print out a value.

``` js
// Most comments are written out as output text so you will know, which outputs are for what

write("Random 4D vector");
const a = v32.rand(4);

write_maths(a,bold_name("a"));

write("Change the coordinate 0 to 10")
a.set(10,0)
write_maths(a,bold_name("a"));

write("Create a subvector view of size 2 starting from the second coordinate (index 1)")
const a2 = subvec(a,1,2);
write_maths(a2,bold_name("a_2"));

write("Set coordinate of view and show values of original vector");
a2.set(0,0);
a2.set(1,1);
write_maths(a,bold_name("a"));

write("Access an element of the vector");
write_maths(a.at(0),"a_x");

write("Create a 3D vector from values");
const b = vec3(1,2,3);
// alternatively, use the jsmatrix factory method
// const b = v32.from([1,2,3]);
write_maths(b,bold_name("b"));

const x = vec3(1,0,0);

const c = vec3(1,1,0);

write("Compute dot product of x and c");
write_maths(dot(x,c), text("dot"));

write("Compute cross product of x and c");
write_maths(cross(x,c), text("cross"));


write("Random matrix");

const A = m32.rand(2,2);

write_maths(A, bold_name("A"));

write("get diagonal -> this is a view and points to the data of A")
const a_diag = diag(A);
write_maths(a_diag, bold_name("A_{d}"));

write("Fill diagonal with a vector of the correct size")
insert(a_diag,vec2(1,2));

// show changes
write_maths(A, bold_name("A"));

write("Set the cross diagonal terms");
A.set(3,1,0);
A.set(4,0,1);

// show changes
write_maths(A, bold_name("A"));

write("Multiply A with a vector (1,2)");
write_maths(mult(A,vec2(1,2)));

```
<script>

const bold_name = (name) => `\\mathbf{${name}}`
const text = (str) => `\\text{${str}}`
const formula = (str,name) => {
    const s = (name ? name + " = ": "" ) +  toLatex(str)
    return s;
};
const write_maths = (str, name) => console.html(`<lia-formula formula="${formula(str,name)}"  displayMode="true"></lia-formula>`);

const write = (str) => console.html(str);

@input

"LIA: stop"
</script>

### The project itself

Each of the following sections will contain some explanations and some code blocks that you will be able to edit.
In these code blocks you will implement some small exercises which put the theory into practice.
That way you can also immediately see the results.
One solution is shown either in following subsections that expand upon these implemented parts or in the full solution to the section.
The full code for each section is also accessible and will be linked at the beginning of each section, so you can pick and choose what you are interested to do yourself.

Some helper functions can be seen here, they are a bit more on the disorderly side though:

* [geometry utilities](./rasterizer/src/geometry_utils.js)
* [common](./rasterizer/src/common.js)
* [defines](./rasterizer/src/defines.js)

The JSMatrix library follows the usual javascript convention of camel case ("camelCase"). The rasterizer code uses snake case. "snake_case") as it aids readability better (and the code was originally written in C++ where that convention was used...).
As no one else will see your code if you don't want to, feel free to use whatever you like.

The algorithms and code is not meant as high performance code, but it aims to be decently short, readable and easy to use.
These metrics are of course subjective, but an effort was made...

Unless you clear your cache, code that you have written will stay in your browser's memory, even if you close it.
For any code block, you can go through previous versions to restore them or see changes.

Now, with all the preambles out of the way, let's get to the actual topic: How can we convert objects onto the screen?


# Rasterizer

## 00: Getting started - Drawing points

To get things started we will start by playing a game and putting points on a canvas. 
It is a game of chance and might not seem like much when you see the description, but you will be surprised what can arise from something so simple!

### Getting lost in a triangle

Our game can be described pretty quickly.

We specify three fixed points $\mathbf{p}_0,\mathbf{p}_1,\mathbf{p}_2$ in the plane.

We also choose one additional point $\mathbf{p}$.

Where this point is doesn't really matter, so let's just say $\mathbf{p} = \mathbf{p}_0$.

Now we repeat the following process:

* Choose one of the fixed points randomly. Let's call this chosen point with index $i$ $\mathbf{p}_i$.
* Replace $\mathbf{p}$ with $\frac{1}{2}(\mathbf{p} + \mathbf{p}_i)$
* Put a color on your pixel at position $\mathbf{p}$

In the following script, you have to implement the update procedure described above.

The picture will appear below the script.

What do you think will be the result?

You can scroll below to the next code block to run it and see if your result looks similar!
To avoid code spoilers, the final code is hidden, but you can just click on it to reveal it.

**Exercise:**

* Implement the process described above

  * Choose one of the `points` randomly and call it $\mathbf{p}_i$
  * Replace $\mathbf{p}$ with $\frac{1}{2}(\mathbf{p} + \mathbf{p}_i)$

<!-- data-readOnly="false"-->
``` js
const img = Image.zeroUI8C(300,300,4);

// define the three points p_0, p_1 and p_2 in an array
const points = [
  vec2(10,10),
  vec2(img.w - 10, 30),
  vec2(img.w/3, img.h - 10)
];

// how often do we repeat the process?
const n = 5000;

// start with p = p_0
let p = points[0];

// repeat
for(let i = 0; i < n; i++)
{
  // *******************************
  // TODO 
  // *******************************
  // update the point p

  // set the x,y coordinate given by the new point to white
  // important: coordinates are integers, so we floor the coordinates when accessing the image
  img.set(vec4(1,1,1,1),Math.floor(p.at(0)), Math.floor(p.at(1)));
}
```
<script>
    const container = document.getElementById('draw_points_0');
    container.innerHTML = "";
    const canvas = document.createElement('canvas');
    
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    @input(0)

    imageToCtx(img,ctx);

    "LIA: stop"
</script>

<div id="draw_points_0"></div>
@mutate.remover(draw_points_0)

**Solution:**

You can adjust parameters or run it multiple times to see how the randomness affects the result.

<!-- data-readOnly="false"-->
``` js -solution.js
const img = Image.zeroUI8C(300,300,4);

// define the three points p_0, p_1 and p_2 in an array
const points = [
  vec2(10,10),
  vec2(img.w - 10, 30),
  vec2(img.w/3, img.h - 10)
];

// how often do we repeat the process?
const n = 5000;

// start with p = p_0
let p = points[0];

// repeat
for(let i = 0; i < n; i++)
{
    // choose a random point
    // generate random number between 0 and 1 (exclusive)
    // scale random number so it is between 0 an points.length 
    // floor the result to be an integer to use for the array access

    const idx = Math.floor(Math.random()*points.length);
    const pi = points[idx];
    // find mid point between current point and chosen one
    // this is the formula 1//2 * (p + p_i)
    p = scale(add(p,pi),0.5);

    // set the x,y coordinate given by the new point to white
    // important: coordinates are integers, so we floor the coordinates when accessing the image
    img.set(vec4(1,1,1,1),Math.floor(p.at(0)), Math.floor(p.at(1)));
}
```
<script>
    const container = document.getElementById('draw_points_1');
    container.innerHTML = "";
    const canvas = document.createElement('canvas');
    
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    @input(0)

    imageToCtx(img,ctx);

    "LIA: stop"
</script>

<div id="draw_points_1"></div>
@mutate.remover(draw_points_1)

You are seeing the famous Sierpinski triangle! 
When plotted, this looks like four triangles cut out of a larger one... repeatedly.
The wonderful thing is, that the randomness doesn't really affect the result.
Sure, the exact point that you see are slightly different, but the overall shape will not change!
And if you use enough points, you won't be able to see a difference anymore!

## 01: Drawing a line

After the introduction of putting some points on the canvas, we continue with the next primitive: Lines.

Lines are a basic building block of displaying information, so they might be drawn a lot.
That is why we want to implement this operation very efficiently.
With this course using JavaScript and trying to use easy to read code, we will only scratch the surface, but still get to the basic idea underlying many efficient line drawing algorithms.

You can find the full rasterization code here: [Rasterizer 01](./rasterizer/src/stages/01_drawing_lines/rasterizer.js)


### Drawing some lines
<!--
script: ./rasterizer/src/stages/01_drawing_lines/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

We start our journey with drawing a subset of all possible lines, as that makes the initial implementation a lot easier. We also use a very basic implementation, as it is easy to understand, but more advanced versions work very similar, so if you know this one, there will be a smaller barrier of understanding.

We start by characterizing a line as a function in 2D. For any given $x$ coordinate, we compute $y$ as:

$$
\begin{align*}
    y &= mx + b
    &= \operatorname{f}(x)
\end{align*}
$$

$b$ is the $y$-intercept, that is where the line intersects the $y$-axis. 
$m$ is the slope, how much the $y$ coordinate changes with respect to a change in $x$: $m=\frac{\Delta y}{\Delta x}$

When we have two points $\mathbf{a}$ and $\mathbf{b}$ the change in $x$ and $y$ is just the vector from $\mathbf{a}$ to $\mathbf{b}$.
Then we can find $m$ as:

$$
\begin{align*}
m &= \frac{\Delta y}{\Delta x}\\
&= \frac{b_y - a_y}{b_x - a_x}
\end{align*}
$$

From this, you can immediately see one issue. 

What lines are impossible to draw with that definition?

- [( )] Horizontal
- [(X)] Vertical
***********************************************************************

For vertical lines, the $x$ coordinate does not change. 
Thus the denominator will become $b_x - a_x = 0$.
As we can't divide by zero, this line can't be defined using a slope.
This will be handled later.

***********************************************************************

We already know two points on the line, $\mathbf{a}$ and $\mathbf{b}$.

The basic idea, that is found in many more efficient variants of the following algorithm is simply this: 
If we move a unit (a pixel) to the right ($x$-direction), how would $y$ change?

$$
\begin{align*}
\operatorname{f}(x+1) &= m(x +1) + b \\
&= mx + m + b \\
&= mx + b + m \\
&= \operatorname{f}(x) + m
\end{align*}
$$

So if we know the $y$ value at one point, we can compute the one right next to it by a simple addition.

Which brings us to our basic algorithm:

1. Compute $m = \frac{b_y - a_y}{b_x - a_x}$
2. Start at the first point ($x$,$y$)
3. Move from $a_x$ to $b_x$ to the right (increment $x$)

    1. Put a pixel where you currently are ($x$,$y$). This needs to be converted to integer values
    2. Increase $y$ by $m$

You may already see some issues, but let's implement it first below and see the result!

Below you can see the line drawing function with some basic setup.
In there you can implement the above procedure.
You can change the input scene if you like by changing the code in the *scene.js* box.
Currently, a number of lines are drawn in a circle, although this might not fully work yet...

**Exercise:**

* Implement the line drawing algorithm described above

<!-- data-readOnly="false"-->
``` js
class RasterizerTutorial extends Rasterizer {
  rasterize_line(pipeline, p0, p1) {

    // use integer coordinates.
    // we could also do that later with this algorithm...
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    let px = vec2(x0, y0);

    // *******************************
    // TODO
    // *******************************
    // implement the line drawing
    // use the  code below, that writes a pixel for each pixel produced for the line

    // the final fragment coordinate
    const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);

    // buffer for colors
    const output_colors = {};
    output_colors[0] = vec4(1, 0, 0, 1);
    this.write_fragment(pipeline, frag_coord, output_colors);
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{
  const attributes = {};
  const vertices = [];

  const num = 20;
  const r = 0.35 * Math.min(img.w,img.h);

  for(let i = 0; i < num; i++)
  {
    const x = r*Math.cos(Math.PI*2 * i/ num);
    const y = r*Math.sin(Math.PI*2 * i/ num);

    vertices.push(vec4(img.w / 2, img.h/2,0.0,1.0));
    vertices.push(vec4(img.w / 2 + x,img.h/2+y,0.0,1.0));
  }

  attributes[Attribute.VERTEX] = vertices;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(geom);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('draw_some_lines_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r01.Rasterizer;
const Pipeline = r01.Pipeline;
const Framebuffer = r01.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
  raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="draw_some_lines_container_0"></div>
@mutate.remover(draw_some_lines_container_0)

**Solution:**

<!-- data-readOnly="false"-->
``` js -solution.js
class RasterizerTutorial extends Rasterizer
{
  rasterize_line(pipeline, p0, p1)
  {
    
    // use integer coordinates
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    // compute the change in x and y
    const dx = x1 - x0;
    const dy = y1 - y0;

    // starting y value
    let y = y0;

    // slope
    let m = dy / dx;

    for (let x = x0; x <= x1; x++) {
      let px = vec2(x, y);

      // move px to pixel center
      add(px, vec2(0.5, 0.5), px);

      // the final fragment coordinate
      const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
      // run  fragment shader with data

      // buffer for colors
      const output_colors = {};

      output_colors[0] = vec4(1, 0, 0, 1);

      this.write_fragment(pipeline, frag_coord, output_colors);

      // update y value with slope
      y += m;
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{
  const attributes = {};

  const vertices = [];

  const num = 20;
  const r = 0.35 * Math.min(img.w,img.h);

  for(let i = 0; i < num; i++)
  {
    const x = r*Math.cos(Math.PI*2 * i/ num);
    const y = r*Math.sin(Math.PI*2 * i/ num);

    vertices.push(vec4(img.w / 2, img.h/2,0.0,1.0));
    vertices.push(vec4(img.w / 2 + x,img.h/2+y,0.0,1.0));
  }


  attributes[Attribute.VERTEX] = vertices;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(geom);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('draw_all_lines_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r01.Rasterizer;
const Pipeline = r01.Pipeline;
const Framebuffer = r01.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
  raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="draw_all_lines_container_1"></div>
@mutate.remover(draw_all_lines_container_1)


You should be able to see some red lines in the right half of a circle. 
The left half is missing.
If you look closely, some of the lines have gaps, which doesn't look that nice.

In the next section, we will fix these issues, but feel free to think about what is causing them and how to solve this!

### Drawing all lines
<!--
script: ./rasterizer/src/stages/01_drawing_lines/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

In the last section, we had a problem with only lines going from left to right being drawn, some lines having gaps and vertical lines not even being being defined.

We will start with the first issue, as it is the easiest to solve.

We basically just think about how the line looks on the screen.
Does it look different, if we go from $\mathbf{b}$ to $\mathbf{a}$ instead of the original order of $\mathbf{a}$ to $\mathbf{b}$?

This will of course still be the same line, if we draw it!
So we can just switch $\mathbf{a}$ and $\mathbf{b}$, if the line goes from right to left!

Try it out below!

**Exercise:**

* Switch the points $\mathbf{a}$ and $\mathbf{b}$, if the line goes from right to left

<!-- data-readOnly="false"-->
``` js
class RasterizerTutorial extends Rasterizer {
  rasterize_line(pipeline, p0, p1) {
    // use integer coordinates
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    // *******************************
    // TODO
    // *******************************
    // switch the points, if the line goes from right to left
    // how to check if that is the case?

    // compute the change in x and y
    const dx = x1 - x0;
    const dy = y1 - y0;

    // starting y value
    let y = y0;

    // slope
    let m = dy / dx;

    for (let x = x0; x <= x1; x++) {
      let px = vec2(x, y);

      // move px to pixel center
      add(px, vec2(0.5, 0.5), px);

      // the final fragment coordinate
      const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
      // run  fragment shader with data

      // buffer for colors
      const output_colors = {};

      output_colors[0] = vec4(1, 0, 0, 1);

      this.write_fragment(pipeline, frag_coord, output_colors);

      // update y value with slope
      y += m;
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{
  const attributes = {};

  const vertices = [];

  const num = 20;
  const r = 0.35 * Math.min(img.w,img.h);
  
  for(let i = 0; i < num; i++)
  {
    const x = r*Math.cos(Math.PI*2 * i/ num);
    const y = r*Math.sin(Math.PI*2 * i/ num);

    vertices.push(vec4(img.w / 2, img.h/2,0.0,1.0));
    vertices.push(vec4(img.w / 2 + x,img.h/2+y,0.0,1.0));
  }

  attributes[Attribute.VERTEX] = vertices;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(geom);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('draw_all_lines_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r01.Rasterizer;
const Pipeline = r01.Pipeline;
const Framebuffer = r01.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
    raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="draw_all_lines_container_0"></div>
@mutate.remover(draw_all_lines_container_0)

Your solution should now show lines on both sides of the middle.
You can see the result when you run the next code block without changing it.

Now that we have solved the first issue, we can solve both outstanding problems. 
As all lines going left are now flipped to the right, we only have to think about the right side.

Which lines do we still have an issue with?

- [(X)] $|m| > 1$
- [( )] $b < 0$
- [( )] $mx \neq y$
***********************************************************************

The slope $m$ determines how much $y$ changes when we move one $x$-unit to the right.
If $|m|$ is greater than 1, $y$ will change by more than one (pixel).
Thus, it happens, that the line "skips" a pixel in the vertical direction.

***********************************************************************

We can solve this issue in a similar way to the left-right flip.

Imagine we draw a line with an angle $\alpha < 45^\circ$ with respect to the $x$-axis.
Now draw another line with $\alpha$, but this time with respect to the $y$-axis.

When you look at them both, those line basically look the same, just mirrored along the diagonal!
You could also flip over your piece of paper and rotate it, such that the $y$-axis now points in the $x$-direction. Then $x$-will point to the old $y$.

We use this knowledge to swap the $x$ and $y$ coordinates, if $|m|>1$. 
In matrix terms, this is just like transposing the image.
$|m|$ will be greater than $1$, when the absolute change in $y$ is greater than the one in $x$.

Using this criterion instead of the value of $m$ also allows us to handle vertical lines!
If we used $m$, we might encounter a division by zero or some other issues beforehand, depending on our language of choice.

Switching out the $x$ and $y$ coordinates does change how the line would look, in contrast to the left-right flip.
To counter that, we just have to remember, if we switched and switch back when we specify the pixel coordinate to write to.

Keep in mind to do the left-right switch after the transposition, as the line might go from left to right when looked at from the $y$ direction!

Try it out! Below this codeblock, you can find the (hidden) final code, that you can expand to look at. 
But you can also run it without looking at it to see the expected result.


**Exercise:**

* Create a variable `transpose`, initially `false`
* Check, if we need to flip $x$ and $y$ ($|m| > 1$)

  * If we need to flip, set `transpose` to `true`
  * Flip the points $x$ and $y$ components

* In the drawing loop

  * If `transpose` is `true`, the pixel coordinate is $(y,x)$ instead of $(x,y)$

<!-- data-readOnly="false"-->
``` js
class RasterizerTutorial extends Rasterizer {
  rasterize_line(pipeline, p0, p1) {
    // use integer coordinates
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    // *******************************
    // TODO
    // *******************************
    // Check, when we need to transpose
    // Do we need to compute m and risk a division by 0? 
    // When is  |m|>1, depending on the x and y changes?

  
    // going from right to left -> flip first and second point
    // doesn't actually change the line, so no later inversion needed
    if (x1 < x0) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }

    // compute the change in x and y
    const dx = x1 - x0;
    const dy = y1 - y0;

    // starting y value
    let y = y0;

    // slope
    let m = dy / dx;

    for (let x = x0; x <= x1; x++) {
      let px = vec2(x, y);

      // move px to pixel center
      add(px, vec2(0.5, 0.5), px);

      // the final fragment coordinate
      const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
      // run  fragment shader with data

      // buffer for colors
      const output_colors = {};

      output_colors[0] = vec4(1, 0, 0, 1);

      this.write_fragment(pipeline, frag_coord, output_colors);

      // update y value with slope
      y += m;
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{
  const attributes = {};

  const vertices = [];

  const num = 20;
  const r = 0.35 * Math.min(img.w,img.h);
  
  for(let i = 0; i < num; i++)
  {
    const x = r*Math.cos(Math.PI*2 * i/ num);
    const y = r*Math.sin(Math.PI*2 * i/ num);

    vertices.push(vec4(img.w / 2, img.h/2,0.0,1.0));
    vertices.push(vec4(img.w / 2 + x,img.h/2+y,0.0,1.0));
  }

  attributes[Attribute.VERTEX] = vertices;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(geom);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('draw_all_lines_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r01.Rasterizer;
const Pipeline = r01.Pipeline;
const Framebuffer = r01.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
  raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);



"LIA: stop"
</script>

<div id="draw_all_lines_container_1"></div>
@mutate.remover(draw_all_lines_container_1)

**Solution:**

<!-- data-readOnly="false"-->
``` js -solution.js
class RasterizerTutorial extends Rasterizer {
  rasterize_line(pipeline, p0, p1) {
    // use integer coordinates
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    // slope > 1 -> flip x and y
    let transposed = false;
    if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
        transposed = true;
        [x0, y0] = [y0, x0];
        [x1, y1] = [y1, x1];
    }

    // going from right to left -> flip first and second point
    // doesn't actually change the line, so no later inversion needed
    if (x1 < x0) {
        [x0, x1] = [x1, x0];
        [y0, y1] = [y1, y0];
    }

    // compute the change in x and y
    const dx = x1 - x0;
    const dy = y1 - y0;

    // starting y value
    let y = y0;

    // slope
    let m = dy / dx;

    for (let x = x0; x <= x1; x++) {
      let px = vec2(x, y);

      // flip x and y for the actual coordinate if they were flipped before
      if (transposed) {
          px = vec2(y, x);
      }

      // move px to pixel center
      add(px, vec2(0.5, 0.5), px);

      // the final fragment coordinate
      const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
      // run  fragment shader with data

      // buffer for colors
      const output_colors = {};

      output_colors[0] = vec4(1, 0, 0, 1);

      this.write_fragment(pipeline, frag_coord, output_colors);

      // update y value with slope
      y += m;
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{
  const attributes = {};

  const vertices = [];

  const num = 20;
  const r = 0.35 * Math.min(img.w,img.h);
  
  for(let i = 0; i < num; i++)
  {
    const x = r*Math.cos(Math.PI*2 * i/ num);
    const y = r*Math.sin(Math.PI*2 * i/ num);

    vertices.push(vec4(img.w / 2, img.h/2,0.0,1.0));
    vertices.push(vec4(img.w / 2 + x,img.h/2+y,0.0,1.0));
  }

  attributes[Attribute.VERTEX] = vertices;

  const geom = {
      attributes,
      topology: Topology.LINES
  };

  geoms.push(geom);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('draw_all_lines_container_2');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r01.Rasterizer;
const Pipeline = r01.Pipeline;
const Framebuffer = r01.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
  raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="draw_all_lines_container_2"></div>
@mutate.remover(draw_all_lines_container_2)

### What else can we do?

With the knowledge of the previous algorithm, which is often called the **Digital Differential Analyzer (DDA) line drawing algorithm**, you basically know a whole bunch of similar ones, that can do more or are a bit smarter.
We will only mention a few improvements/ideas here (though the first one can be found in the course code...) and encourage you to have a look yourself!

First of all, one thing to notice is that we do a bunch of floating point operations. In JavaScript, this doesn't really matter, as only the *Number* type exist, which is a float.
Many other languages do have integers, which often are (and were) faster than floats. 
Even if its just a bit, this matters when you draw a lot of lines and pixels, so these kinds of micro optimizations make sense.
One of the best known examples of such an optimization is the **Bresenham line drawing algorithm**.

The Bresenham algorithm only considers the first octant (angles $0^\circ$ to $45^\circ$) and moves along $x$.
At each step it asks: "Is middle of the next pixel above or below the line?". If it is below, $y$ is increased by $1$, otherwise it stays the same.
The important part is, that by some rearranging and manipulation of terms, the computation of this check can be done completely using integers. 
Lines with different angles are handled the same way we did and in general the code looks nearly identical to our code, so it shouldn't be hard to implement the Bresenham algorithm.

One issue with our current version and especially Bresenham is, that lines look a bit jaggy and can only lie on integers.
A way to solve that is anti-aliasing. 
Ony way would be to just draw in a  higher resolution and downsample.
This is if course a lot of extra work.
A different idea is for example to adjust the brightness of our pixel writing depending on how close the line is to the center of a pixel.
If the line is on it, give it full brightness, if it is far away, let the color fade as well.

This is the basic idea of the anti-aliased line drawing algorithm by **Xiaolin Wu**. 
It is slightly more complicated, but only by a little and produces anti-aliased lines that don't look as pixelated.

Other algorithms and implementations (parallelism, vectorization,...) exist, with various pros and cons, but our current version (or the Bresenham version) is a reasonably fast and nice implementation!

## 02: Clipping lines

So far, we are able to draw any line that we want... with a caveat. 
What happens, if we specify a point of the line outside of the image?
In the current version, the script will just crash, since you will try to write values outside of the allowed range.
This section will solve that issue.

Clipping refers to the process of restricting our drawing operations to a certain region only and to "clip" away anything not in that region.

As screens or windows are generally rectangular and rectangles have nice geometric properties, it makes sense, that an efficient algorithm exists to clip lines with the screen.

A well-known algorithm for this is called the **Cohen–Sutherland algorithm** [^1], which we will implement.

We will split up the procedure into two parts:

1. Determine where a point lies with respect to a rectangle/the screen
2. Use the previous information to clip the line

You can find the full rasterization code here: [Rasterizer 02](./rasterizer/src/stages/02_clipping_lines/rasterizer.js)

[^1]: Robert F. Sproull and Ivan E. Sutherland. 1968. A clipping divider. In Proceedings of the December 9-11, 1968, fall joint computer conference, part I (AFIPS '68 (Fall, part I)). Association for Computing Machinery, New York, NY, USA, 765–775. https://doi.org/10.1145/1476589.1476687

### Region codes
<!--
script: ./rasterizer/src/stages/02_clipping_lines/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

In the first step for implementing the Cohen-Sutherland we will assign codes to points based on where they line with respect to a rectangle.
This information can then be used to check, if a line needs to be clipped.

There are 4 lines making up a rectangle and we use those for classification. 
We identify four regions around a rectangle, two mutually exclusive pairs:

1. Top and bottom
2. Left and right

These can of course be mixed, so a point could be above and to the left of a rectangle, but it can't be above and below at the same time.

We encode those four regions the following way:
We use 4 bits $b_3 b_2 b_1 b_0$.
A bit is set to $1$, if a point is in the corresponding region, and $0$ otherwise, where we arbitrarily use the following order:

0. Top
1. Bottom
2. Right
3. Left

A point to the bottom right would then be $0110$.

**What code do we get, when a point is inside the rectangle?**

    [[0000]]

This bit representation is useful, in that we can combine it with fast bit operations.
The bottom right point is just the logical *or* operation between *Bottom* ($0010$) and *Right* ($0100$), which is usually written with the $|$-operator: 

```
code = BOTTOM | RIGHT
```

We can check, if any of those bits is set ($=1$), by performing a logical *and* operation with a number containing $1$ at the bit positions we are interested in and checking the result, usually written with the $&$ operator.

This whole technique is called a bitmask or bitflags.

The operation to check, if all of the bits set in a variable *FLAGS* are set, you can use the following:

```
if((code & FLAGS) === FLAGS) {...}
```

*FLAGS* could for example just be *BOTTOM* or any combination of the four regions.

If we just interpret the bits as digits in a binary number, we can write them down in the decimal system as:

0. Top $= 0001 = 1_{10}$
1. Bottom $= 0010 = 2_{10}$
2. Right $= 0100 = 4_{10}$
3. Left $= 1000 = 8_{10}$

The actual values don't really matter though, the bits they use up just need to be disjoint.

**NOTE:** In JavaScript, all numbers are floating point numbers. The bitwise operations $|,&$ still work.
Internally, the variables are converted to 32-bit integers and the operations are applied.
This will introduce some additional overhead, but shouldn't really be noticeable in the grand scheme of things.

One way to specify a rectangle is to specify the lower left point and the top right one.
We can use that to very easily find the codes as follows:

```
code = 0;
if(point is smaller than x_min) {
    code = code | LEFT;
}
if(point is greater than x_max) {
    code = code | RIGHT;
}
if(point is smaller than y_min) {
    code = code | BOTTOM;
}
if(point is greater than y_max) {
    code = code | TOP;
}
```

We will implement this functionality below!

We specify a rectangle in the middle of the frame and color each of the 8 (including the overlaps) with a different color.

**Exercise:**

* Implement the region code determination from above

<!-- data-readOnly="true"-->
```js defines.js
const SCREEN_CODE_LEFT = 1;
const SCREEN_CODE_RIGHT = 2;
const SCREEN_CODE_TOP = 4;
const SCREEN_CODE_BOTTOM = 8;

// colors
const ctl = vec4(1,0,0,1);
const ctm = vec4(1,1,0,1);
const ctr = vec4(1,0,1,1);

const cml = vec4(0,1,1,1);
const cmm = vec4(1,1,1,1);
const cmr = vec4(0.5,0.5,1,1);

const cbl = vec4(0,0,0,1);
const cbm = vec4(0,1,0,1);
const cbr = vec4(0,0,1,1);
```
<!-- data-readOnly="false"-->
```js
function region_code(x, y, minx, miny, maxx, maxy) {
  let result = 0;

  // *******************************
  // TODO
  // *******************************
  // compute the actual code by checking the cases

  return result;
}
```
``` js -fillImage.js
const img = Image.zeroF32(300, 300, 4);

const bmin = vec2(60,60);
const bmax = vec2(240,240);

for(let y = 0; y < img.h; y++) {
  for(let x = 0; x < img.w; x++) {
    const code =  region_code(x, y, bmin.at(0), bmin.at(1), bmax.at(0),bmax.at(1));

    let color = vec4(0,0,0,1);

    // we could also use a switch case in this case, since we use actual equalities
    if(code === (SCREEN_CODE_LEFT | SCREEN_CODE_TOP)) {
        color = ctl;
    }
    else if(code === (SCREEN_CODE_TOP)) {
        color = ctm;
    }
    else if(code === (SCREEN_CODE_RIGHT | SCREEN_CODE_TOP)) {
        color = ctr;
    }
    else if(code === (SCREEN_CODE_LEFT)) {
        color = cml;
    }
    else if(code === (SCREEN_CODE_RIGHT)) {
        color = cmr;
    }
    else if(code === (SCREEN_CODE_LEFT | SCREEN_CODE_BOTTOM)) {
        color = cbl;
    }
    else if(code === (SCREEN_CODE_BOTTOM)) {
        color = cbm;
    }
    else if(code === (SCREEN_CODE_RIGHT | SCREEN_CODE_BOTTOM)) {
        color = cbr;
    }else {
        // otherwise point is inside
        color = cmm;
    }

    img.set(color,x,y);
  }
}
```
<script>
const container = document.getElementById('clip_lines_region_code_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');


@input(0)
@input(1)
@input(2)

imageToCtx(img,ctx);


"LIA: stop"
</script>

<div id="clip_lines_region_code_0"></div>
@mutate.remover(clip_lines_region_code_0)

**Solution:**

<!-- data-readOnly="true"-->
```js -defines.js
const SCREEN_CODE_LEFT = 1;
const SCREEN_CODE_RIGHT = 2;
const SCREEN_CODE_TOP = 4;
const SCREEN_CODE_BOTTOM = 8;

// colors
const ctl = vec4(1,0,0,1);
const ctm = vec4(1,1,0,1);
const ctr = vec4(1,0,1,1);

const cml = vec4(0,1,1,1);
const cmm = vec4(1,1,1,1);
const cmr = vec4(0.5,0.5,1,1);

const cbl = vec4(0,0,0,1);
const cbm = vec4(0,1,0,1);
const cbr = vec4(0,0,1,1);
```
<!-- data-readOnly="false"-->
```js -solution.js
function region_code(x, y, minx, miny, maxx, maxy) {
  let result = 0;

  // Binary operators work by converting from/to a 32 bit integer
  if (x < minx) {
      result = result | SCREEN_CODE_LEFT;
  } else if (x > maxx) {
      result = result | SCREEN_CODE_RIGHT;
  }
  if (y < miny) {
      result = result | SCREEN_CODE_BOTTOM;
  } else if (y > maxy) {
      result = result | SCREEN_CODE_TOP;
  }
  return result;
}
```
``` js -fillImage.js
const img = Image.zeroF32(300, 300, 4);

const bmin = vec2(60,60);
const bmax = vec2(240,240);

for(let y = 0; y < img.h; y++) {
  for(let x = 0; x < img.w; x++) {
    const code =  region_code(x, y, bmin.at(0), bmin.at(1), bmax.at(0),bmax.at(1));

    let color = vec4(0,0,0,1);

    // we could also use a switch case in this case, since we use actual equalities
    if(code === (SCREEN_CODE_LEFT | SCREEN_CODE_TOP)) {
        color = ctl;
    }
    else if(code === (SCREEN_CODE_TOP)) {
        color = ctm;
    }
    else if(code === (SCREEN_CODE_RIGHT | SCREEN_CODE_TOP)) {
        color = ctr;
    }
    else if(code === (SCREEN_CODE_LEFT)) {
        color = cml;
    }
    else if(code === (SCREEN_CODE_RIGHT)) {
        color = cmr;
    }
    else if(code === (SCREEN_CODE_LEFT | SCREEN_CODE_BOTTOM)) {
        color = cbl;
    }
    else if(code === (SCREEN_CODE_BOTTOM)) {
        color = cbm;
    }
    else if(code === (SCREEN_CODE_RIGHT | SCREEN_CODE_BOTTOM)) {
        color = cbr;
    }else {
        // otherwise point is inside
        color = cmm;
    }

    img.set(color,x,y);
  }
}
```
<script>
const container = document.getElementById('clip_lines_region_code_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

@input(0)
@input(1)
@input(2)

imageToCtx(img,ctx);

"LIA: stop"
</script>

<div id="clip_lines_region_code_1"></div>
@mutate.remover(clip_lines_region_code_1)

Next we will do the actual clipping by using our region code. 

### Clipping the lines at the screen
<!--
script: ./rasterizer/src/stages/02_clipping_lines/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

Now that we can efficiently check, where a point lies in relation to a rectangle (for example our screen), we can use that for clipping.

The basic idea is to use the codes of the line endpoints to quickly check if we need to clip the line.

There are three cases to consider, with the third having sub-cases:

1. The line is fully inside -> No clipping needed
2. The line is fully outside -> Line doesn't need to be drawn
3. Line crosses one of the four lines going through the rectangle sides

The first case happens when both points are inside the rectangle.
In this case, the region code of both points is $0000$.
So we can quickly compute the *or* operation of the codes of both endpoints.
This effectively "gathers" all $1$s that appear in the codes. 
If the result of that *or* is still $0$, the line is inside and we can return both points.

For the second case, we think about when we can be absolutely sure, that a line will be outside the rectangle.
Two objects do not intersect, if we can find a line that separates them (this is a case of the so called Separating Axis Theorem, SAT). 
We have information about four lines, the rectangle sides!
If a line is completely on the left, right, bottom or top, then it can't intersect the rectangle.
When you look at how the codes are constructed, we can very easily check for that!
If the line lines completely on one side, then both point codes will share a $1$ at the same location!
So we check for that case by combining both codes with *and* and then checking if the result is not zero.
If it is, the line is fully clipped and does not need to be drawn.

The third case is slightly more involved. At least one point of the line will be outside the rectangle and the line must cross at least one line. 
To make things easier, we just consider one of the points.
As $0$ corresponds to a point inside, we choose the larger code of the two, thus ensuring we have the point outside.
Then we get four cases again:

1. Point is at the top -> The clipped $y$-coordinate is the maximum $y$-coordinate. Calculate $x$.
2. Point is at the bottom -> The clipped $y$-coordinate is the minimum $y$-coordinate. Calculate $x$.
3. Point is to the right -> The clipped $x$-coordinate is the maximum $x$-coordinate. Calculate $y$.
4. Point is at the left -> The clipped $x$-coordinate is the minimum $x$-coordinate. Calculate $y$.

After we have resolved one of these cases, we replace the point corresponding to the greater code with the newly clipped coordinates.
Then we update that points region code and redo the loop.

When everything is clipped, the line will be fully inside and thus the loop terminates.

The last missing piece is how to compete the missing coordinate in these four cases.

We will show how to get the equation for the first case.
We have a line defined by the two endpoints $\mathbf{A}$ and $\mathbf{B}$.

We can write the line as

$$
\begin{align*}
    \mathbf{p}(t) &= \mathbf{A} + t(\mathbf{B} - \mathbf{A}) \\
    &= \begin{pmatrix}A_x \\ A_y \end{pmatrix} + t \begin{pmatrix}B_x - A_x \\ B_y - A_y\end{pmatrix}
\end{align*}
$$

$t$ describes where we are on the line and for $t\in [0,1]$, we have the segment between the two points (check by plugging $0$ and $1$ in).
From the equation, we see that the $x$ and $y$ coordinate moves with the same $t$ parameter, so if we have the one that gets us the $y_{\text{max}}$, the same one will give us the corresponding $x$-coordinate.
So let's find $t$:

$$
\begin{align*}
    y_{\text{max}} &= A_y + t (B_y - A_y) \\
    y_{\text{max}} - A_y &= t(B_y - A_y)  \\
    \frac{y_{\text{max}} - A_y}{B_y - A_y}  &= t
\end{align*}
$$

With that found, we can plug it back in to get the missing $x$-coordinate.

$$
\begin{align*}
    p_x &= A_x + t (B_x - A_x) \\
    &= A_x + \frac{y_{\text{max}} - A_y}{B_y - A_y} (B_x - A_x)  \\
    &= \frac{A_x(B_y - A_y) + (y_{\text{max}} - A_y)(B_x - A_x)}{B_y - A_y} \\
    &= \frac{A_x B_y - A_x A_y - A_y(B_x - A_x) +  y_{\text{max}}(B_x - A_x)}{B_y - A_y} \\
    &= \frac{A_x B_y - A_x A_y - A_y B_x + A_x A_y +  y_{\text{max}}(B_x - A_x)}{B_y - A_y} \\
    &= \frac{A_x B_y  - A_y B_x  +  y_{\text{max}}(B_x - A_x)}{B_y - A_y} \\
\end{align*}
$$

In the solution, the second line is chosen for the implementation, as it is a bit more understandable.
**Bonus:** If you know the formula for the normal of a 2D vector and the implicit equation defining a 2D line, you might express this in terms of $\mathbf{n}$ and $d$.

As the other cases work the same, just with minimum and maximum or $x$ and $y$ switched, we will only list the results for the 4 cases here:


1. Point is at the top -> $y = y_{\text{max}}, x = A_x + \frac{y_{\text{max}} - A_y}{B_y - A_y} (B_x - A_x)$
2. Point is at the bottom -> $y = y_{\text{min}}, x = A_x + \frac{y_{\text{min}} - A_y}{B_y - A_y} (B_x - A_x)$
3. Point is to the right -> $x = x_{\text{max}}, y = A_y + \frac{x_{\text{max}} - A_x}{B_x - A_x} (B_y - A_y)$
4. Point is at the left -> $x = x_{\text{min}}, y = A_y + \frac{x_{\text{min}} - A_x}{B_x - A_x} (B_y - A_y)$

Now, you can implement the full procedure below! 
The code includes previously written code, with small alterations to call the clipping in the actual rasterization of the line.

The solution can once again be seen hidden after that.

**Exercise:**

* Create a `while(true)` loop for the clipping and implement the cases

  * If the bitwise or (`|`) of both codes is `0`, both points are inside and we can return the points
  * If the bitwise and (`&`) of both codes is greater than `0`, both points are outside on the same side, so we can return an empty array `[]`
  * Choose the code, that is greater than the other:

    * Clip the point with the equations above, depending on which bit is set (we choose one at a time)
    * Replace the point corresponding to the code with the clipped point and recompute the code

<!-- data-readOnly="true"-->
```js -defines.js
const SCREEN_CODE_LEFT = 1;
const SCREEN_CODE_RIGHT = 2;
const SCREEN_CODE_TOP = 4;
const SCREEN_CODE_BOTTOM = 8;
```
```js
class RasterizerTutorial extends Rasterizer {

  /**
   * Efficiently clip a line against the screen
   * @param {AbstractMat} a The start point
   * @param {AbstractMat} b The endpoint
   * @param {AbstractMat} bmin The minimum screen coordinates
   * @param {AbstractMat} bmax The maximum screen coordinate
   * @returns Array<AbstractMat> The clipped points. Might be empty, if the whole line was clipped
  */
  clip_screen(a, b, bmin, bmax) {
    // this.region_code calls out previously defined method
    let code0 = this.region_code(a.at(0), a.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));
    let code1 = this.region_code(b.at(0), b.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));

    // *******************************
    // TODO
    // *******************************
    // implement the loop
    return [a,b];
  }


  rasterize_line(pipeline, a, b) {
    // call our new clipping code!
    // we use the screen coordinates that are given by the pipeline
    const clipped = this.clip_screen(a, b, vec2(pipeline.viewport.x, pipeline.viewport.y), vec2(pipeline.viewport.x + pipeline.viewport.w - 1, pipeline.viewport.y + pipeline.viewport.h - 1));
    if (clipped.length === 0) {
      return;
    }

    // use the clipped points as input for the previous routine
    const p0 = clipped[0];
    const p1 = clipped[1];

    // Bresenham works in integer coordinates
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    // Bresenham is only defined in the first 2D octant
    // To make it work for the others, we reorder things, so they are in that
    // first octant. In the end we have to undo some of that

    // slope > 1 -> flip x and y
    let transposed = false;
    if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
      transposed = true;
      [x0, y0] = [y0, x0];
      [x1, y1] = [y1, x1];
    }

    // going from right to left -> flip first and second point
    // doesn't actually change the line, so no later inversion needed
    if (x1 < x0) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }

    const dx = x1 - x0;
    const dy = Math.abs(y1 - y0);

    let y = y0;
    let m = dy / dx;
    if (y1 < y0) {
        m = -m;
    }

    for (let x = x0; x <= x1; x++) {
      let px = vec2(x, y);

      // flip x and y for the actual coordinate if they were flipped before
      if (transposed) {
          px = vec2(y, x);
      }

      // move px to pixel center
      add(px, vec2(0.5, 0.5), px);

      // the final fragment coordinate
      const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
      // run  fragment shader with data

      // buffer for colors
      const output_colors = {};

      output_colors[0] = vec4(1, 0, 0, 1);

      this.write_fragment(pipeline, frag_coord, output_colors);

      y += m;
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{
  const attributes = {};

  const vertices = [];

  const num = 100;
  const r = 1.75 * Math.max(img.w,img.h);
  
  for(let i = 0; i < num; i++) {
    const x = r*Math.cos(Math.PI*2 * i/ num);
    const y = r*Math.sin(Math.PI*2 * i/ num);

    vertices.push(vec4(img.w / 2, img.h/2,0.0,1.0));
    vertices.push(vec4(img.w / 2 + x,img.h/2+y,0.0,1.0));
  }


  attributes[Attribute.VERTEX] = vertices;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(geom);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('clip_lines_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r02.Rasterizer;
const Pipeline = r02.Pipeline;
const Framebuffer = r02.Framebuffer;

@input(0)
@input(1)
@input(2)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

try{
  for(let i = 0; i < geoms.length;i++) {
    raster.draw(pipeline,geoms[i]);
  }
} catch(e) {
  console.error("Error");
  console.error(e);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="clip_lines_container_0"></div>
@mutate.remover(clip_lines_container_0)

**Solution:**

You can run it to check your result.

<!-- data-readOnly="true"-->
```js -defines.js
const SCREEN_CODE_LEFT = 1;
const SCREEN_CODE_RIGHT = 2;
const SCREEN_CODE_TOP = 4;
const SCREEN_CODE_BOTTOM = 8;
```
```js -solution.js
class RasterizerTutorial extends Rasterizer {

  /**
   * Efficiently clip a line against the screen
   * @param {AbstractMat} a The start point
   * @param {AbstractMat} b The endpoint
   * @param {AbstractMat} bmin The minimum screen coordinates
   * @param {AbstractMat} bmax The maximum screen coordinate
   * @returns Array<AbstractMat> The clipped points. Might be empty, if the whole line was clipped
   */
  clip_screen(a, b, bmin, bmax) {
    let code0 = this.region_code(a.at(0), a.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));
    let code1 = this.region_code(b.at(0), b.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));

    let x = 0.0;
    let y = 0.0;
    while (true) {
      if ((code0 | code1) === 0) {
        // bitwise OR is 0: both points inside window; trivially accept and
        // exit loop
        return [a, b];
      }

      if ((code0 & code1) > 0) {
        // bitwise AND is not 0: both points share an outside zone (LEFT,
        // RIGHT, TOP, or BOTTOM), so both must be outside window; exit loop
        // (accept is false)
        return [];
      }

      // At least one endpoint is outside the clip rectangle; pick it.
      const outcodeOut = code1 > code0 ? code1 : code0;

      if ((outcodeOut & SCREEN_CODE_TOP) !== 0) { // point is above the clip window
        x = a.at(0) + (b.at(0) - a.at(0)) * (bmax.at(1) - a.at(1)) / (b.at(1) - a.at(1));
        y = bmax.at(1);
      } else if ((outcodeOut & SCREEN_CODE_BOTTOM) !== 0) { // point is below the clip window
        x = a.at(0) + (b.at(0) - a.at(0)) * (bmin.at(1) - a.at(1)) / (b.at(1) - a.at(1));
        y = bmin.at(1);
      } else if ((outcodeOut & SCREEN_CODE_RIGHT) !== 0) { // point is to the right of clip window
        y = a.at(1) + (b.at(1) - a.at(1)) * (bmax.at(0) - a.at(0)) / (b.at(0) - a.at(0));
        x = bmax.at(0);
      } else if ((outcodeOut & SCREEN_CODE_LEFT) !== 0) { // point is to the left of clip window
        y = a.at(1) + (b.at(1) - a.at(1)) * (bmin.at(0) - a.at(0)) / (b.at(0) - a.at(0));
        x = bmin.at(0);
      }

      // Now we move outside point to intersection point to clip
      // and get ready for next pass.
      if (outcodeOut === code0) {
        a.set(x, 0);
        a.set(y, 1);
        code0 = this.region_code(a.at(0), a.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));
      } else {
        b.set(x, 0);
        b.set(y, 1);
        code1 = this.region_code(b.at(0), b.at(1), bmin.at(0), bmin.at(1), bmax.at(0), bmax.at(1));
      }
    }

  }


  rasterize_line(pipeline, a, b) {

    // call our new clipping code!
    // we use the screen coordinates that are given by the pipeline
    const clipped = this.clip_screen(a, b, vec2(pipeline.viewport.x, pipeline.viewport.y), vec2(pipeline.viewport.x + pipeline.viewport.w - 1, pipeline.viewport.y + pipeline.viewport.h - 1));
    if (clipped.length === 0) {
      return;
    }

    // use the clipped points as input for the previous routine
    const p0 = clipped[0];
    const p1 = clipped[1];

    // Bresenham works in integer coordinates
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    // Bresenham is only defined in the first 2D octant
    // To make it work for the others, we reorder things, so they are in that
    // first octant. In the end we have to undo some of that

    // slope > 1 -> flip x and y
    let transposed = false;
    if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
      transposed = true;
      [x0, y0] = [y0, x0];
      [x1, y1] = [y1, x1];
    }

    // going from right to left -> flip first and second point
    // doesn't actually change the line, so no later inversion needed
    if (x1 < x0) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }

    const dx = x1 - x0;
    const dy = Math.abs(y1 - y0);

    let y = y0;
    let m = dy / dx;
    if (y1 < y0) {
      m = -m;
    }

    for (let x = x0; x <= x1; x++) {
      let px = vec2(x, y);

      // flip x and y for the actual coordinate if they were flipped before
      if (transposed) {
        px = vec2(y, x);
      }

      // move px to pixel center
      add(px, vec2(0.5, 0.5), px);

      // the final fragment coordinate
      const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
      // run  fragment shader with data

      // buffer for colors
      const output_colors = {};

      output_colors[0] = vec4(1, 0, 0, 1);

      this.write_fragment(pipeline, frag_coord, output_colors);

      y += m;
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{
  const attributes = {};

  const vertices = [];

  const num = 100;
  const r = 1.75 * Math.max(img.w,img.h);

  for(let i = 0; i < num; i++) {
    const x = r*Math.cos(Math.PI*2 * i/ num);
    const y = r*Math.sin(Math.PI*2 * i/ num);

    vertices.push(vec4(img.w / 2, img.h/2,0.0,1.0));
    vertices.push(vec4(img.w / 2 + x,img.h/2+y,0.0,1.0));
  }

  attributes[Attribute.VERTEX] = vertices;

  const geom = {
      attributes,
      topology: Topology.LINES
  };

  geoms.push(geom);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('clip_lines_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r02.Rasterizer;
const Pipeline = r02.Pipeline;
const Framebuffer = r02.Framebuffer;

@input(0)
@input(1)
@input(2)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++) {
  raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="clip_lines_container_1"></div>
@mutate.remover(clip_lines_container_1)

## 03: Draw a triangle

In this section, we will finally move on from lines to get to triangles, probably the most important shape in computer graphics.

There are a lot of variants on how to rasterize triangles, from different ways on how to determine the pixels to parallelization. We will use a very simple approach, that is nethertheless a good basis to understand more complicated algorithms. It is more or less the one presented in a very early paper by Juan Pineda [^1].

You can find the full rasterization code here: [Rasterizer 03](./rasterizer/src/stages/03_rasterize_tri/rasterizer.js)

[^1]: Juan Pineda. 1988. A parallel algorithm for polygon rasterization. In Proceedings of the 15th annual conference on Computer graphics and interactive techniques (SIGGRAPH '88). Association for Computing Machinery, New York, NY, USA, 17–20. https://doi.org/10.1145/54852.378457

### Defining our drawing area

We will start of by finding the area on the screen, where the triangle could possibly be.
The simplest such shape is a rectangle.

This rectangle consists of the minumum and maximum coordinates of the triangle.
These can be found by finding the minimum and maximum values per coordinate of all points making up the triangle.
To maybe reuse this, we will write a helper function, that computes these values for an array of points.

Additionally, we don't want to run into the same issue as with the lines: Going outside the image.
Luckily, when we have the minumum and maximum points, we can make sure that our rectangle is inside, with the following two conditions:

* Take the he minimum of the maximum point and the viewport maximum
* Take the maximum of the minimum point and the viewport minimum

The rectangle could be fully outside though.
It is fully outside, if either

* Any coordinate of the maximum point is smaller than the correspnding viewport origin
* Any coordinate of the minimum point is larger or equal to the viewport maximum

With this, we can implement iterating over all pixels that could potentially be covered by a triangle.
Below is the hidden solution, that you can run to check your solution.

**Exercise:**

* Compute the bounds of an array of points in `compute_screen_bounds`

  * Go through all points
  * The minimum is the minimum of all points (per coordinate)
  * The maximum is the maximum of all points (per coordinate)
  * You can do it by hand or use the `cwiseMin` and `cwiseMax` functions. Just be careful, that both inputs need to have the same size

* Handle all cases in the `fill_triangle_area` function

  * Use the viewport dimension and the computed triangle dimensions to handle the cases

    * Constrain the object bounds to the viewport as described above
    * If any of the minimum coordinates are greater than the maximum viewport or any of the maximum coordinates are less than zero, you can return, since the triangle is fully outside
    * Otherwise do a double loop through the triangle region and call `img.set(vec4(1,0,0,1),x,y);` for each of those points `x,y`.

<!-- data-readOnly="false"-->
``` js +draw.js
/**
 * Computes the minimum and maximum coordinates of an array of points
 * @param {Array<AbstractMat>} points The input points
 * @returns [bmin,bmax]
*/
function compute_screen_bounds(points) {
  // compute triangle screen bounds
  let bmin = vec2(Infinity, Infinity);
  let bmax = vec2(-Infinity, -Infinity);

  // *******************************
  // TODO
  // *******************************

  // Go through all the points and find the minimum and maximum x and y coordinates

  return [bmin, bmax];
}

// Helper function to test our algorithm
function fill_triangle_area(v0,v1,v2, img, viewport) {
  const points = [v0,v1,v2];

  const [bmin,bmax] = compute_screen_bounds(points);

  // pixel coordinates of bounds
  let ibmin = floor(bmin);
  let ibmax = ceil(bmax);

  // extent of the viewport
  // it starts at viewport.xy and has a width and height
  const viewport_max = vec2(viewport.x + viewport.w-1, viewport.y + viewport.h-1);
  const viewport_min = vec2(viewport.x, viewport.y);

  // *******************************
  // TODO
  // *******************************
  // clamp bounds so they lie inside the image region

  // *******************************
  // TODO
  // *******************************
  // handle case where its fully outside

  // *******************************
  // TODO
  // *******************************
  // iterate over the bounded region
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
// output image
const img = Image.zeroF32(300, 300, 4);

// set the viewport to the full image
const viewport = {x: 0, y:0, w : img.w, h : img.h};

// fill triangle 1
{
  // define 3 points
  const v0 = vec4(-10,-40,0,1);
  const v1 = vec4(100,40,0,1);
  const v2 = vec4(120,400,0,1);
  fill_triangle_area(v0,v1,v2,img,viewport);
}


// fill triangle 2
{
  // define 3 points
  const v0 = vec4(200,40,0,1);
  const v1 = vec4(260,50,0,1);
  const v2 = vec4(230,200,0,1);
  fill_triangle_area(v0,v1,v2,img,viewport);
}

```
<script>
const container = document.getElementById('draw_tri_bounds_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

@input(0)
@input(1)

imageToCtx(img,ctx);

"LIA: stop"
</script>

<div id="draw_tri_bounds_0"></div>
@mutate.remover(draw_tri_bounds_0)

**Solution:**

<!-- data-readOnly="false"-->
``` js -solution.js
/**
 * Computes the minimum and maximum coordinates of an array of points
 * @param {Array<AbstractMat>} points The input points
 * @returns [bmin,bmax]
*/
function compute_screen_bounds(points) {
  // compute triangle screen bounds
  let bmin = vec2(Infinity, Infinity);
  let bmax = vec2(-Infinity, -Infinity);

  // go through all points and find minimum and maximum values
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const p2 = vec2(p.at(0), p.at(1));
    cwiseMin(bmin, p2, bmin);
    cwiseMax(bmax, p2, bmax);
  }

  return [bmin, bmax];
}

function fill_triangle_area(v0,v1,v2, img, viewport) {
  const points = [v0,v1,v2];

  const [bmin,bmax] = compute_screen_bounds(points);

  // pixel coordinates of bounds
  let ibmin = floor(bmin);
  let ibmax = ceil(bmax);

  const viewport_max = vec2(viewport.x + viewport.w-1, viewport.y + viewport.h-1);
  const viewport_min = vec2(viewport.x, viewport.y);
  // clamp bounds so they lie inside the image region
  cwiseMax(ibmin, viewport_min, ibmin);
  cwiseMin(ibmax, viewport_max, ibmax);

  // handle case where its fully outside
  if (isAny(ibmin, viewport_max, (a, b) => a > b) ||
    isAny(ibmax, viewport_min, (a, b) => a < b)) {
    return;
  }

  for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
    for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
        img.set(vec4(1,0,0,1),x,y);
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
// output image
const img = Image.zeroF32(300, 300, 4);

// set the viewport to the full image
const viewport = {x: 0, y:0, w : img.w, h : img.h};

// fill triangle 1
{
  // define 3 points
  const v0 = vec4(-10,-40,0,1);
  const v1 = vec4(100,40,0,1);
  const v2 = vec4(120,400,0,1);
  fill_triangle_area(v0,v1,v2,img,viewport);
}


// fill triangle 2
{
  // define 3 points
  const v0 = vec4(200,40,0,1);
  const v1 = vec4(260,50,0,1);
  const v2 = vec4(230,200,0,1);
  fill_triangle_area(v0,v1,v2,img,viewport);
}
```
<script>
const container = document.getElementById('draw_tri_bounds_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

@input(0)
@input(1)

imageToCtx(img,ctx);

"LIA: stop"
</script>

<div id="draw_tri_bounds_1"></div>
@mutate.remover(draw_tri_bounds_1)

Now we have the area in which a triangle could potentially be.
How does that help us?
The basic idea is, that we will check every of the covered pixels to see if they are inside of the triangle.
We will see how to do that in the next section and put it all together after that.

### Is this point part of the triangle?

In the literature, you will often see the term **Edge function**.
This term is absolutely justified, but when we arrive at chapter [06](#06-interpolate-attributes), the values will have a pretty intuitive interpretation anyways, so why not start there directly?

This part has a bit more text than usual, so if your are only interested in what to implement, you can just skip to the end and see the final formulas.

We start with a simple 2D triangle, defined by three vertices $\mathbf{v}_0,\mathbf{v}_1,\mathbf{v}_2$.

While there is no "correct" way to order the vertices, in general we use a counter-clockwise order, although in the following, we will use a variant, that does not care for the order.

From the vertices, we define the two edges from the first vertex:

$$
\begin{align*}
\mathbf{e}_{01} &= \mathbf{v}_1 - \mathbf{v}_0 \\
\mathbf{e}_{02} &= \mathbf{v}_2 - \mathbf{v}_0 
\end{align*}
$$

From the properties of the cross product, we know, that $||\mathbf{a} \times \mathbf{b}||$ is the area of the parallelogram spanned by the two vectors or twice the area of the triangle subtended by them!
We will now use that fact for our case. 
Our vectors are in 2D though. To use them with the 3D cross product is pretty easy though!
Just add a third dimension and think of the vectors as lying in the $xy$-plane, with $z=0$.

$$
\begin{align*}
\mathbf{e}_{01} &= \begin{pmatrix}e_{01,x} \\ e_{01,y} \\ 0 \end{pmatrix}\\
\mathbf{e}_{02} &=\begin{pmatrix} e_{02,x} \\ e_{02,y} \\ 0 \end{pmatrix}
\end{align*}
$$

We also have:

$$
\mathbf{a} \times \mathbf{b} = \begin{pmatrix} a_y b_z - a_z b_y \\ a_z b_x - a_x b_z \\ a_x b_y - a_y b_x \end{pmatrix}
$$

If you look at the components, the resulting $x$ and $y$ terms all have a multiplication with a $z$ component of the inputs in them.
As in our case that coordinate is $0$, only the $z$ component will survive in $\mathbf{e}_{01} \times \mathbf{e}_{01}$.
To stay consistent with other resources, we will call this quantity $\operatorname{E}$.

$$
\begin{align*}
    \operatorname{E}(\mathbf{v}_0,\mathbf{v}_1,\mathbf{v}_2) &= (\mathbf{e}_{01} \times \mathbf{e}_{01})_z \\
    &= e_{01,x} e_{02,y} - e_{01,y} e_{02,x} \\
    &= (v_{1,x} - v_{0,x})(v_{2,y} - v_{0,y}) - (v_{1,y} - v_{0,y})(v_{2,x} - v_{0,x})
\end{align*}
$$

$||\mathbf{e}_{01} \times \mathbf{e}_{01}||$ gives us twice the area of the triangle, so $\operatorname{E}$ will give us that as well, since it is the only non-zero part of the cross product.
But it does have a sign!
This is important and is basically why it is often called edge function.
Here is a quick intution about this other way to think about it.

The normal of a vector $\mathbf{a}$ in 2D is just:

$$
    \mathbf{n}(\mathbf{a}) = \begin{pmatrix}-a_y \\ a_x\end{pmatrix}
$$

You can check that it is perpendicular to $\mathbf{a}$ with $\mathbf{n}(\mathbf{a}) \cdot \mathbf{a} = -a_y a_x + a_x a_y = 0 $.
There are of course infinitely more normals (all multiples). 
If we fix the length to be the same as the original vector, there will still be two: The one we chose and the inverted vector.
The one we chose is the usual one, as it corresponds to a rotation of $90^\circ$ in the positive mathematical direction (coutner clockwise).
You can check that for example, the equation will turn the $x$-axis into the $y$-axis, as one might expect.
The negative direction is also sometimes used, just make sure to be consistent!

Now from the properties of the dot product, when  $\mathbf{a} \cdot \mathbf{b}$ is positive, then both vectors point in the same half space, if it is negative they point in opposite ones.

Putting the 2D normal and this fact together we get:

$$
\begin{align*}
    \mathbf{n}(\mathbf{e}_{01}) & = \begin{pmatrix}-e_{01,y} \\ e_{01,x}\end{pmatrix} \\
    \mathbf{n}(\mathbf{e}_{01}) \cdot \mathbf{e}_{02} &= -e_{01,y} e_{01,x} + e_{01,x}e_{02,y} \\
    &= e_{01,x}e_{02,y}-e_{01,y} e_{01,x} \\
    &= \operatorname{E}(\mathbf{v}_0,\mathbf{v}_1,\mathbf{v}_2)
\end{align*}
$$

So we get a positive value, if $\mathbf{e}_{02}$ points above (the same direction as the normal) of $\mathbf{e}_{01}$ and a negative one otherwise.

Now, if we plug in a generic third point $\mathbf{p}$, instead of the third triangle vertex, we get:

$$
    \operatorname{E}(\mathbf{v}_0,\mathbf{v}_1,\mathbf{p}) =  (v_{1,x} - v_{0,x})(p_{y} - v_{0,y}) - (v_{1,y} - v_{0,y})(p_{x} - v_{0,x})
$$

This value will accordingly be positive, if $\mathbf{p}$ is above (inside) or below (outside) the triangle edge $\mathbf{n}(\mathbf{e}_{01})$. 

This is where we have the "Edge function" interpretation.
We can now define a triangle as all points, for which the three edge functions $\operatorname{E}(\mathbf{v}_0,\mathbf{v}_1,\mathbf{p}), \operatorname{E}(\mathbf{v}_1,\mathbf{v}_2,\mathbf{p}), \operatorname{E}(\mathbf{v}_2,\mathbf{v}_0,\mathbf{p})$ agree, that the point is inside (all have positive or zero value)!
We could implement the triangle rasterization with this alone, but just to keep later code smaller, we directly modify this.

With our original interpretation, $\operatorname{E}$ giving us twice the area of the triangle spanned by the parameters, we can still use the insight of the edge function.
The "area" will get a positive sign, if the triangle is counter-clockwise and a negative  sign otherwise!

The triangle area interpretation is nice, since it leads us to another very useful tool: Barycentric coordinates.

For a triangle, barycentric coordinates assign three coordinates $u,v,w$ to any point. Each weight corresponds to a point on the triangle and represent how much "influence" they have. The sum $u+v+w$ equals $1$, which means, that the "total weight" of the points will always be $1$, that is, we do not add or remove weight.

Now, how to compute barycentric coordinates? With our area interpretation, we are already nearly there. Think about a point $\mathbf{p}$ inside the triangle. Connect it to the three triangle points. Now you have three new triangles! Of course, if you sum their areas, we get the total area of the triangle. In other words, if we divide each of the subtriangle areas by the total area, those values sum to $1$. So we have already found the barycentric coordinates!

It makes sense, that the weight of a point is $1$ (the full weight) the point itself. We used the definition $ \operatorname{E}(\mathbf{v}_0,\mathbf{v}_1,\mathbf{p})$ with the third point being variable and the first two fixed. So it makes sense, that the triangle point that is not fixed is the one associated with the barycentric weight. So $ \operatorname{E}(\mathbf{v}_0,\mathbf{v}_1,\mathbf{p})$ is associated to the missing point $\mathbf{v}_2$. 
$\operatorname{E}$ gives twice the area for the subtriangles, as well as the full triangles.
In their ratio, the factor $2$ cancels out and thus corresponds to the ratio of the subtriangle to the triangle!

So we get the three barycentric weights:

$$
\begin{align*}
2A &=  \operatorname{E}(\mathbf{v}_0,\mathbf{v}_1,\mathbf{v}_2) \\
u = \operatorname{weight}(\mathbf{v}_0) &=  \frac{\operatorname{E}(\mathbf{v}_1,\mathbf{v}_2,\mathbf{p})}{2A}\\
v = \operatorname{weight}(\mathbf{v}_1) &=  \frac{\operatorname{E}(\mathbf{v}_2,\mathbf{v}_0,\mathbf{p})}{2A}\\
w = \operatorname{weight}(\mathbf{v}_2) &=  \frac{\operatorname{E}(\mathbf{v}_0,\mathbf{v}_1,\mathbf{p})}{2A}\\
\end{align*}
$$

Since the coordinates sum to $1$ you only need to calculate two of them, for example $v$ and $w$ and compute the third one as $1 - v - w$.

We only need to worry about one thing: A zero triangle area.
In that case, we would divide by $0$.
This is easy to handle though, if the area is zero, we just don't draw the triangle

The fun thing is, that this works, even if $\mathbf{p}$ is outside of the triangle!
In those cases, the sign of at least one of the subtriangles will get the opposite sign of the full triangle!
The remaining weights will become greater than $1$ to balance that out.
So just as with the edge functions, we can check, if any of the weights gets negative, if it does, then the point is outside of the triangle.
In contrast to the pure edge function, this works regardless of whether the triangle is clock or counter-clockwise (the division by the signed area takes care of that).

With all of that, we can finally calculate the barycentric weights for any point and decide if the point is part of the triangle.
For now, we will put this in the last bit of code.
In the next step, we will add this to the full rasterizer, as it needs just a bit of extra busywork, but it will nicely allow us to draw both any number of lines as well as triangles together!

Down below you can run the solution.

**Exercise:**

* Implement the `signed_tri_area_doubled` function according to $(v_{1,x} - v_{0,x})(v_{2,y} - v_{0,y}) - (v_{1,y} - v_{0,y})(v_{2,x} - v_{0,x})$

* Implement the containment test in `compute_screen_bounds`

  * Follow the instructions in code

<!-- data-readOnly="false"-->
``` js +draw.js
/**
 * Computes twice the signed area of a given 2D triangle.
 * The triangle is assumed to be defined anti-clockwise
 * @param {AbstractMat} v0 The first 2D point
 * @param {AbstractMat} v1 The second 2D point
 * @param {AbstractMat} v2 The third 2D point
 * @returns Twice the signed area
 */
function signed_tri_area_doubled(v0, v1, v2) {
  // *******************************
  // TODO
  // *******************************
  // compute twice the summed area of the triangle using the edge function
  return 0.0;
}

/**
 * Computes the minimum and maximum coordinates of an array of points
 * @param {Array<AbstractMat>} points The input points
 * @returns [bmin,bmax]
*/
function compute_screen_bounds(points) {
  // compute triangle screen bounds
  let bmin = vec2(Infinity, Infinity);
  let bmax = vec2(-Infinity, -Infinity);

  // go through all points and find minimum and maximum values
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const p2 = vec2(p.at(0), p.at(1));
    cwiseMin(bmin, p2, bmin);
    cwiseMax(bmax, p2, bmax);
  }

  return [bmin, bmax];
}

function fill_triangle_area(v0,v1,v2, img, viewport) {
  const points = [v0,v1,v2];

  const [bmin,bmax] = compute_screen_bounds(points);

  // pixel coordinates of bounds
  let ibmin = floor(bmin);
  let ibmax = ceil(bmax);

  const viewport_max = vec2(viewport.x + viewport.w-1, viewport.y + viewport.h-1);
  const viewport_min = vec2(viewport.x, viewport.y);
  // clamp bounds so they lie inside the image region
  cwiseMax(ibmin, viewport_min, ibmin);
  cwiseMin(ibmax, viewport_max, ibmax);

  // handle case where its fully outside
  if (isAny(ibmin, viewport_max, (a, b) => a > b) ||
      isAny(ibmax, viewport_min, (a, b) => a < b)) {
    return;
  }

  // *******************************
  // TODO
  // *******************************
  // compute the double triangle area only once

  // *******************************
  // TODO
  // *******************************
  // check if any the triangle has zero area with some epsilon, if so, don't rasterize

  for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
    for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
      // sample point in center of pixel
      const p = add(vec2(x, y), vec2(0.5, 0.5));

      // *******************************
      // TODO
      // *******************************
      // compute barycentric coordinates
      // if any is negative -> continue

      img.set(vec4(1,0,0,1),x,y);
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
// output image
const img = Image.zeroF32(300, 300, 4);

// set the viewport to the full image
const viewport = {x: 0, y:0, w : img.w, h : img.h};

// fill triangle 1
{
  // define 3 points
  const v0 = vec4(-10,-40,0,1);
  const v1 = vec4(100,40,0,1);
  const v2 = vec4(120,400,0,1);
  fill_triangle_area(v0,v1,v2,img,viewport);
}

// fill triangle 2
{
  // define 3 points
  const v0 = vec4(200,40,0,1);
  const v1 = vec4(260,50,0,1);
  const v2 = vec4(230,200,0,1);
  fill_triangle_area(v0,v1,v2,img,viewport);
}
```
<script>
const container = document.getElementById('draw_tri_bary_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

@input(0)
@input(1)

imageToCtx(img,ctx);

"LIA: stop"
</script>

<div id="draw_tri_bary_0"></div>
@mutate.remover(draw_tri_bary_0)

**Solution:**

<!-- data-readOnly="false"-->
``` js -solution.js
/**
 * Computes twice the signed area of a given 2D triangle.
 * The triangle is assumed to be defined anti-clockwise
 * @param {AbstractMat} v0 The first 2D point
 * @param {AbstractMat} v1 The second 2D point
 * @param {AbstractMat} v2 The third 2D point
 * @returns Twice the signed area
 */
function signed_tri_area_doubled(v0, v1, v2) {
  // compute twice the summed area of the triangle using the edge function
  return (v1.at(0) - v0.at(0)) * (v2.at(1) - v0.at(1)) - (v1.at(1) - v0.at(1)) * (v2.at(0) - v0.at(0));
}

/**
 * Computes the minimum and maximum coordinates of an array of points
 * @param {Array<AbstractMat>} points The input points
 * @returns [bmin,bmax]
*/
function compute_screen_bounds(points) {
  // compute triangle screen bounds
  let bmin = vec2(Infinity, Infinity);
  let bmax = vec2(-Infinity, -Infinity);

  // go through all points and find minimum and maximum values
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const p2 = vec2(p.at(0), p.at(1));
    cwiseMin(bmin, p2, bmin);
    cwiseMax(bmax, p2, bmax);
  }

  return [bmin, bmax];
}

function fill_triangle_area(v0,v1,v2, img, viewport) {
  const points = [v0,v1,v2];

  const [bmin,bmax] = compute_screen_bounds(points);


  // pixel coordinates of bounds
  let ibmin = floor(bmin);
  let ibmax = ceil(bmax);

  const viewport_max = vec2(viewport.x + viewport.w-1, viewport.y + viewport.h-1);
  const viewport_min = vec2(viewport.x, viewport.y);
  // clamp bounds so they lie inside the image region
  cwiseMax(ibmin, viewport_min, ibmin);
  cwiseMin(ibmax, viewport_max, ibmax);

  // handle case where its fully outside
  if (isAny(ibmin, viewport_max, (a, b) => a > b) ||
      isAny(ibmax, viewport_min, (a, b) => a < b)) {
    return;
  }

  // compute the double triangle area only once
  const area_tri = signed_tri_area_doubled(v0, v1, v2);

  // check if any the triangle has zero area with some epsilon, if so, don't rasterize
  const epsilon = 1E-8;
  if (Math.abs(area_tri) < epsilon) {
    return;
  }

  for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
    for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
      // sample point in center of pixel
      const p = add(vec2(x, y), vec2(0.5, 0.5));

      // compute barycentric coordinates
      // if any is negative -> continue

      let v = signed_tri_area_doubled(v2, v0, p);
      v /= area_tri;
      if (v + epsilon < 0.0) {
        continue;
      }

      let w = signed_tri_area_doubled(v0, v1, p);
      w /= area_tri;
      if (w + epsilon < 0.0) {
        continue;
      }

      let u = 1.0 - v - w;
      // we could also just compute u as 1
      if (u + epsilon < 0.0) {
        continue;
      }

      img.set(vec4(1,0,0,1),x,y);
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
// output image
const img = Image.zeroF32(300, 300, 4);

// set the viewport to the full image
const viewport = {x: 0, y:0, w : img.w, h : img.h};

// fill triangle 1
{
  // define 3 points
  const v0 = vec4(-10,-40,0,1);
  const v1 = vec4(100,40,0,1);
  const v2 = vec4(120,400,0,1);
  fill_triangle_area(v0,v1,v2,img,viewport);
}


// fill triangle 2
{
  // define 3 points
  const v0 = vec4(200,40,0,1);
  const v1 = vec4(260,50,0,1);
  const v2 = vec4(230,200,0,1);
  fill_triangle_area(v0,v1,v2,img,viewport);
}
```
<script>
const container = document.getElementById('draw_tri_bary_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

@input(0)
@input(1)

imageToCtx(img,ctx);

"LIA: stop"
</script>

<div id="draw_tri_bary_1"></div>
@mutate.remover(draw_tri_bary_1)


### Putting the triangle together
<!--
script: ./rasterizer/src/stages/03_rasterize_tri/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

This last step is more of a formality. 
We can now rasterize triangles! 
The only thing missing is putting this together with the rest of the pipeline.

As this does not really involve anything complicated, we will just look at the relevant code.
The functions for computing the edge functions and the triangle rasterization of the last steps are integrated into the rasterizer as `signed_tri_area_doubled` and `rasterize_triangle`, the only actual change being writing out a color with the `write_fragment` method instead of directly setting the pixel.

Otherwise, we extend the `draw` method, so it will go through a list of triangles and calls a precessing method `process_triangle` for each of them. The `process_triangle` itself will just call our new `rasterize_triangle` method for now.

<!-- data-readOnly="false"-->
``` js
class RasterizerTutorial extends Rasterizer {
  /**
   * Computes the minimum and maximum coordinates of an array of points
   * @param {Array<AbstractMat>} points The input points
   * @returns [bmin,bmax]
   */
  compute_screen_bounds(points) {
    // compute triangle screen bounds
    let bmin = vec2(Infinity, Infinity);
    let bmax = vec2(-Infinity, -Infinity);

    // go through all points and find minimum and maximum values
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const p2 = vec2(p.at(0), p.at(1));
      cwiseMin(bmin, p2, bmin);
      cwiseMax(bmax, p2, bmax);
    }

    return [bmin, bmax];
  }

  /**
   * Computes twice the signed area of a given 2D triangle.
   * The triangle is assumed to be defined anti-clockwise
   * @param {AbstractMat} v0 The first 2D point
   * @param {AbstractMat} v1 The second 2D point
   * @param {AbstractMat} v2 The third 2D point
   * @returns Twice the signed area
   */
  signed_tri_area_doubled(v0, v1, v2) {
    return (v1.at(0) - v0.at(0)) * (v2.at(1) - v0.at(1)) - (v1.at(1) - v0.at(1)) * (v2.at(0) - v0.at(0));
  }

  /**
   * 
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   * @returns 
   */
  rasterize_triangle(pipeline, v0, v1, v2) {
    // compute triangle screen bounds
    let points = [v0, v1, v2];
    let [bmin, bmax] = this.compute_screen_bounds(points);

    // pixel coordinates of bounds
    let ibmin = floor(bmin);
    let ibmax = ceil(bmax);

    const viewport = pipeline.viewport;

    const viewport_max = vec2(viewport.x + viewport.w - 1, viewport.y + viewport.h - 1);
    const viewport_min = vec2(viewport.x, viewport.y);
    // clamp bounds so they lie inside the image region
    cwiseMax(ibmin, viewport_min, ibmin);
    cwiseMin(ibmax, viewport_max, ibmax);

    // handle case where its fully outside
    if (isAny(ibmin, viewport_max, (a, b) => a > b) ||
        isAny(ibmax, viewport_min, (a, b) => a < b)) {
      return;
    }

    // compute the double triangle area only once
    const area_tri = this.signed_tri_area_doubled(v0, v1, v2);

    // check if any the triangle has zero area with some epsilon, if so, don't rasterize
    const epsilon = 1E-8;
    if (Math.abs(area_tri) < epsilon) {
      return;
    }

    // check all pixels in screen bounding box
    for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
      for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
        // sample point in center of pixel
        const p = add(vec2(x, y), vec2(0.5, 0.5));

        let v = this.signed_tri_area_doubled(v2, v0, p);
        v /= area_tri;
        if (v + epsilon < 0.0) {
          continue;
        }

        let w = this.signed_tri_area_doubled(v0, v1, p);
        w /= area_tri;
        if (w + epsilon < 0.0) {
          continue;
        }

        let u = 1.0 - v - w;
        if(u + epsilon < 0.0)
        {
          continue;
        }

        // run  fragment shader with data
        const frag_coord = vec4(x, y, 0.0, 1.0);
        // run  fragment shader with data
        const output_colors = {};
        // write color data
        output_colors[0] = vec4(1, 1, 1, 1);

        this.write_fragment(pipeline, frag_coord, output_colors);
      }
    }
  }

  /**
   * Processes a single triangle
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   */
  process_triangle(pipeline, v0, v1, v2) {
    this.rasterize_triangle(pipeline, v0, v1, v2);
  }

  /**
   * Draw the given geometry
   * @param {Pipeline} pipeline The pipeline to use
   * @param {Object} geom Geometry object specifying all information
   */
  draw(pipeline, geom) {
    // no vertices
    // we could also take a parameter specifying the number of vertices to be
    // drawn and not rely on vertex data
    if (!geom.attributes[Attribute.VERTEX]) {
        return;
    }

    const vertices = geom.attributes[Attribute.VERTEX];
    const n = vertices.length;

    // go through objects
    if (geom.topology === Topology.LINES) {
      // handles lines
      // handle two vertices per step
      for (let i = 0; i < n; i += 2) {
        this.process_line(pipeline, vertices[i], vertices[i + 1]);
      }
    } else if (geom.topology === Topology.TRIANGLES) {
      // handle triangles
      // handle three vertices per step
      for (let i = 0; i < n; i += 3) {
        this.process_triangle(pipeline, vertices[i], vertices[i + 1],
              vertices[i + 2]);
      }
    }
  }
}
```
<!-- data-readOnly="false"-->
```js -scene.js
const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{
  const attributes = {};
  attributes[Attribute.VERTEX] = [
    vec4(10, 10, 0.0, 1.0),
    vec4(img.w - 10, 10, 0.0, 1.0),
    vec4(20, img.h / 2, 0.0, 1.0),

  ];

  const geom = {
    attributes,
    topology: Topology.TRIANGLES
  };

  geoms.push(geom);
}

{
  const attributes = {};
  attributes[Attribute.VERTEX] = [
    vec4(10, img.h - 10, 0.0, 1.0),
    vec4(img.w - 10, img.h/ 2.0, 0.0, 1.0),
  ];

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(geom);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('draw_tri_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r03.Rasterizer;
const Pipeline = r03.Pipeline;
const Framebuffer = r03.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++)
{
    raster.draw(pipeline,geoms[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="draw_tri_container_0"></div>
@mutate.remover(draw_tri_container_0)

### What else can we do with triangle rasterization?

As you might expect, our algorithm isn't the fastest.
There are a lot of areas, that we could explore, some even mentioned in the initially mentioned early paper by Juan Pineda [^1], but a lot of other follow similar ideas.

Basically we should ask ourselves: Isn't it wasteful, to check every pixel in the triangle bounding rectangle, if it belongs inside of it?
The worst case would be a very thin triangle oriented along the diagonal of the screen.
In that case we would need to check the entire screen, but more or less only the diagonal would actaully contain any pixels that we care about.

So, how about some other approaches. 
We could rasterize the sides and then move from left to right.
We could go down the center line and procced left and right from that, as needed.
We could split the rectangle into subrectangles and process them independently.

As you can see, there are many ways to go about it just in that direction.

Another opportunity is the actual work of computation.
To keep the code simple, we basically just "optimized" calculating the total triangle area once, but we can do a lot more.
Very similarly to the line drawing algorithm, the edge functions can be computed incrementally.
If we replace $\mathbf{p}$ in the formula with a point $\mathbf{p} + \mathbf{q}$, we will see that $\operatorname{E}(\mathbf{v}_0,\mathbf{v}_1,\mathbf{p} + \mathbf{q}) =  \operatorname{E}(\mathbf{v}_0,\mathbf{v}_1,\mathbf{p}) + \operatorname{C}(\mathbf{q})$, where $\operatorname{C}(\mathbf{q})$ is some very easy to compete value based on constants of the triangle and $\mathbf{q}$ (**try it out!**).
So while the edge functions are not super computionally expensive, if we can replace the formula in each loop by just, for example, one addition and multiplication, we might save a lot when we also draw a lot of triangles/pixels.
There are of course other optimizations to do in that regard.

And of course, although not that great of an option in JavaScript, you could try to compute a lot of things in parallel.

Next up, we will implement a more general clipping routine, that can clip a triangle at an arbitrary plane.

[^1]: Juan Pineda. 1988. A parallel algorithm for polygon rasterization. In Proceedings of the 15th annual conference on Computer graphics and interactive techniques (SIGGRAPH '88). Association for Computing Machinery, New York, NY, USA, 17–20. https://doi.org/10.1145/54852.378457

## 04: Clip polygons

This section will cover clipping polygons at arbitrary planes (lines work pretty much the same way).
While this isn't needed immediately, it fits best here, since we already did simple clipping with a line.
We will implement it in a way, that is very generic and can be used without change (aside from one part, as we will later add more data) even in 3D (and beyond). 
We will later on need at least one clipping plane for the full 3D rasterization to work without special cases, so it will be nice to have this already sorted out.

You can find the full rasterization code here: [Rasterizer 04](./rasterizer/src/stages/04_poly_clip/rasterizer.js)

### Sutherland-Hodgman

We will implement the **Sutherland-Hodgman** polygon clipping algorithm [^1], as it is pretty intuitive and not too hard to implement.

First, we will define, what a clipping plane is.
This is basically the same concept as with the lines in the 2D case.
There are different ways to define a plane.
The first is with a normal $\mathbf{n}$ and a point $\mathbf{p}$.
We want to check, if a point $\mathbf{x}$ is part of the plane. 
To do that, we compute the vector between both points $\mathbf{x} - \mathbf{p}$ (*Note*: With this and following definitions, you can switch the order of vectors, which will change some signs along the way. Just be careful to be consistent, otherwise it doesn't matter).
The difference vector is part of the plane, so it has to be perpendicular to the plane normal.

$$
    \mathbf{n}\cdot(\mathbf{x} - \mathbf{p}) = 0
$$

Rearranging a bit we will go from this  vector equation to the scalar form:

$$
\begin{align*}
\mathbf{n}\cdot(\mathbf{x} - \mathbf{p}) &= 0\\
\mathbf{n}\cdot\mathbf{x}  \underbrace{-\mathbf{n}\cdot\mathbf{p}}_{d} &= 0\\
\mathbf{n}\cdot\mathbf{x} +d &= 0
\end{align*}
$$

If $\mathbf{n}$ is normalized, $d$ has the nice geometric meaning of being the signed distance of the origin to the plane.

So the function $\operatorname{d}(\mathbf{x}) = \mathbf{n}\cdot\mathbf{x} +d$ gives us the signed distance (scaled by the length of the normal) to the plane, with positive values meaning "$\mathbf{x}$ is in front" aand negative values meaning "$\mathbf{x}$ is in the back".

The function is also liner, which means, we can write the following:

$$
\operatorname{d}(\mathbf{x} + s\mathbf{y}) = \operatorname{d}(\mathbf{x}) + s\operatorname{d}(\mathbf{y}) 
$$

For clipping polygons, we only need two operations:

1. Check, if a point lies in front or to the back of a plane
2. Intersect a line with a plane

The first part is already covered with the sign of $\operatorname{d}$. 
We will now use the linearity of $\operatorname{d}$  to solve the second point.

The line between two points $\mathbf{A}$ and $\mathbf{B}$ is defined by:

$$
\begin{align*}
\mathbf{p}(t) &= \mathbf{A} + t (\mathbf{B} - \mathbf{A}) \\
&= \mathbf{A} + t\mathbf{v} \\
t &= \in[0,1]
\end{align*}
$$

The intersection of this line with the plane will be a point, that has a distance of zero to the plane.
We will just plug in the line and solve for the parameter.

$$
\begin{align*}
\operatorname{d}(\mathbf{p}(t)) &= 0 \\
\operatorname{d}(\mathbf{A} + t (\mathbf{B} - \mathbf{A})) &= 0\\
\operatorname{d}(\mathbf{A}) + t\operatorname{d}(\mathbf{B} - \mathbf{A}) &= 0\\
\operatorname{d}(\mathbf{A}) + t(\operatorname{d}(\mathbf{B}) - \operatorname{d}(\mathbf{A})) &= 0\\
\operatorname{d}(\mathbf{A}) + t(\operatorname{d}(\mathbf{B}) - \operatorname{d}(\mathbf{A})) &= 0\\
t(\operatorname{d}(\mathbf{B}) - \operatorname{d}(\mathbf{A})) &= -\operatorname{d}(\mathbf{A})\\
t &= -\frac{\operatorname{d}(\mathbf{A})}{\operatorname{d}(\mathbf{B}) - \operatorname{d}(\mathbf{A})}\\
t &= \frac{\operatorname{d}(\mathbf{A})}{\operatorname{d}(\mathbf{A}) - \operatorname{d}(\mathbf{B})}\\
\end{align*}
$$

One last part thaat we will do, to also be prepared for later, is writing our vectors in a specific way.
For now, you can just think about it as being a different notation.
We will also use think about 3D vectors in general now, not only 2D.

We will write a point $\mathbf{a} = \begin{pmatrix}a_x \\ a_y \\ a_z\end{pmatrix}$ as $\overline{\mathbf{a}} = \begin{pmatrix}a_x \\ a_y \\ a_z \\ 1\end{pmatrix}$.
So we will just add a fourth coordinate with a $1$ at the end.
Calculating a difference vector between to points $\overline{\mathbf{a}} - \overline{\mathbf{b}}$ then obviously results in a $0$ in the last place.

This makes writing $\operatorname{d}$ and defining the plane pretty easy:

$$
\begin{align*}
\operatorname{d}(\mathbf{x}) &= \mathbf{n}\cdot\mathbf{x} +d \\
&= \begin{pmatrix}x_x \\ x_y \\ x_z \\ 1\end{pmatrix} \cdot \begin{pmatrix}n_x \\ n_y \\ n_z\\ d \end{pmatrix} \\
&= \overline{\mathbf{x}} \cdot \mathbf{l}
\end{align*}
$$

So we can just write our plane values in a 4D vector and do a dot product to find $\operatorname{d}$. 
The definition of the line and calculating the intersection point with the computed $t$ value does not change when we augment our vectors.
We just treat our vectors as normal 4D vectors when doing any computations, such as addition or scaling.
This will come in very handy later.

Now on to finally compute the clipping (we already have the most important stuff down now).

We define a polygon by its indexed vertices $\mathbf{P}_0, \dots, \mathbf{P}_n$.
The edge $i$ is just the line from point $\mathbf{P}_i$ to $\mathbf{P}_{i+1}$, where we overlap the last index.
So the last edge is $\mathbf{P}_n$ to $\mathbf{P}_0$.

The reason we don't just work with triangles here, is that if we use multiple clipping planes, a triangle might become a quadriliteral or just some general polygon after multiple clippings.

The Sutherland-Hodgman algorithm works by producing a sequence of vertices that correspond to the clipped polygon.
If nothing needs to be clipped, the original polygon is produced, if it is fully clipped, you will get an empty list.

It works the following way:

1. Define an empty output array *points*

2. Iterate over all polygon edges, starting from the last one (from point $n$ to point $0$)

    1. Compute distances for both edge points

    2. Handle edge (4 cases)

        1. Both points outside? -> Nothing to do

        2. Both points inside? -> Append endpoint of edge to *points*

        3. Startpoint inside, endpoint outside? -> Append intersection to *points*

        4. Startpoint outside, endpoint inside? -> Append intersection and then the endpoint to *points*

3. Return *points* as result

As we are starting with the last edge, we only ever output the end of a line, as that ensures, that with no clipping, the first vertex of the result will be the first vertex of the input.
Notes for the 4 cases:

1. When both points are outside, that edge can be discarded. Cases 3 and 4 handle the case that the polygon goes out of the plane and comes back in at some point
2. When both points are inside, we do not need to clip. As the last edge in the point definitions is implicit, we output only the endpoint
3. The polygon edge will stop at the intersection, so we replace the actual endpoint (it is clipped) with the intersection
4. The edge comes back into the plane. Normally we would just put the endpoint there, but since we were outside before, the startpoint was clipped and couldn't have been added to the list before, so we need to add the intersection before the endpoint

Determining, where a point lines with respect to the clip plane is simply done by checking the signs of the distances, positive for inside, negative for outside.
Those distances can then also be used for the intersection calculation.

This took some effort, but we can now implement the steps of the algorithm ourselves!
For now, we will use the inbuilt Javascript rendering to visualize it, but in the next step, we will integrate it into our framework.
This will once again be just a bit of bookkeeping, as we need to do something to handle drawing polygons with our current triangle mechanism.

This implementation will take an array of clip planes and just walk through them to clip the results one after another.

You can check the result of the below this code segment.

**Exercise:**

* Implement the clipping algorithm described above in `clip_polygon`

  * Follow the instruction in the code

<!-- data-readOnly="true"-->
``` js -draw_func.js
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
```
<!-- data-readOnly="false"-->
``` js +clip.js
/**
 * Clips a polygon against the given clip-planes
 * @param {Array<AbstractMat>} points The input points
 * @param {Array<AbstractMat>} planes The clipping planes
 * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
 */
function clip_polygon(points, planes) {
  // Implementation of the Sutherland-Hodgman algorithm
  for (let pi = 0; pi < planes.length; pi++) {
    // go through all clip planes
    const pl = planes[pi];
    const output = [];

    const size = points.length;

    // *******************************
    // TODO
    // *******************************
    // iterate over the edges, starting with the last one

    // *******************************
    // TODO
    // *******************************
    // Compute distances
    // handle cases and place result in output
    
    // replace points with the result of the current step
    points = output;
  }
  return points;
}
```
```js -scene.js
const w = 300;
const h = 300;

// input polygon points
// all lie in z = 0
const points = [
  vec4(20, 20, 0.0, 1.0),
  vec4(w - 10, 40, 0.0, 1.0),
  vec4(40, h - 20, 0.0, 1.0),
];

// the lines that we want to clip with
// each entry is defined by two points that define a line in 2D
const lines = [
  [vec2(0,0), vec2(w,h*0.6)],
  [vec2(w,h * 0.8),vec2(0,h*0.7)],
  [vec2(50,h),vec2(w * 0.3,0)],
];

// computes the plane equation given two 2d vectors
function compute_plane(p0, p1) {
  const d = sub(p1, p0);
  // 2d normal
  const n = vec2(-d.at(1),d.at(0));
  // z is 0
  return vec4(n.at(0),n.at(1), 0, -dot(p0,n));
}

// simple helper to draw a line define by two points
function draw_plane(p0,p1) {
  ctx.save();

  const l = w + h;
  const center = scale(add(p0,p1),0.5);
  const v = jsm.normalize(jsm.fromTo(p0,p1));
  const start = add(center, scale(v,-0.5*l));
  const end = add(center, scale(v,0.5*l));

  ctx.beginPath();
  ctx.moveTo(start.at(0),start.at(1));
  ctx.lineTo(end.at(0),end.at(1));
  ctx.stroke();
  ctx.restore();
}

// the clip planes
const clip_planes = [];

for(let i =0; i < lines.length;i++) {
  clip_planes.push(compute_plane(lines[i][0],lines[i][1]));
}

const points_clipped = clip_polygon(points, clip_planes);
```
<script>
const container = document.getElementById('poly_clip_impl_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

@input(0)
@input(1)
@input(2)

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
ctx.strokeStyle = "rgba(0,0,0,0)";
draw_polygon(points_clipped,ctx);
ctx.restore();

ctx.save();
ctx.strokeStyle = "rgb(255,0,0)";

for(let i = 0; i < lines.length;i++) {
  draw_plane(lines[i][0],lines[i][1]);
}

ctx.restore();

"LIA: stop"
</script>

<div id="poly_clip_impl_0"></div>
@mutate.remover(poly_clip_impl_0)

**Solution:**

<!-- data-readOnly="true"-->
``` js -draw_func.js
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
```
<!-- data-readOnly="false"-->
``` js -solution.js
/**
 * Clips a polygon against the given clip-planes
 * @param {Array<AbstractMat>} points The input points
 * @param {Array<AbstractMat>} planes The clipping planes
 * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
 */
function clip_polygon(points, planes) {
  // Implementation of the Sutherland-Hodgman algorithm
  for (let pi = 0; pi < planes.length; pi++) {
    const pl = planes[pi];
    const output = [];

    const size = points.length;
    for (let i = 0; i < size; i++) {
      const cur = points[i];
      const ip = (i - 1 + points.length) % points.length;
      const prev = points[ip];

      // compute distance
      const dc = dot(pl, cur);
      const dp = dot(pl, prev);

      // the four cases
      // the actual implementation will combine them a bit, as there is a bit of overlap
      if(dp < 0.0 && dc < 0.0) {
        // case 1 - both outside
        continue;
      }
      else if(dp >= 0.0 && dc >= 0.0) {
        // case 2 - both inside
        output.push(cur);
      }
      else if(dp >= 0.0 && dc < 0.0) {
        // case 3 - start inside, end outside
        // compute intersection
        const t = dp / (dp - dc);
        const p = add(prev, scale(sub(cur, prev), t));

        output.push(p);
      }else {
        // case 4 - start outside, end inside
        // compute intersection
        const t = dp / (dp - dc);
        const p = add(prev, scale(sub(cur, prev), t));

        output.push(p);
        output.push(cur);
      }
    }
    // replace points with the result of the current step
    points = output;
  }
  return points;
}
```
```js -scene.js
const w = 300;
const h = 300;

// input polygon points
// all lie in z = 0
const points = [
  vec4(20, 20, 0.0, 1.0),
  vec4(w - 10, 40, 0.0, 1.0),
  vec4(40, h - 20, 0.0, 1.0),
];

// the lines that we want to clip with
// each entry is defined by two points that define a line in 2D
const lines = [
  [vec2(0,0), vec2(w,h*0.6)],
  [vec2(w,h * 0.8),vec2(0,h*0.7)],
  [vec2(50,h),vec2(w * 0.3,0)],
];

// computes the plane equation given two 2d vectors
function compute_plane(p0, p1) {
  const d = sub(p1, p0);
  // 2d normal
  const n = vec2(-d.at(1),d.at(0));
  // z is 0
  return vec4(n.at(0),n.at(1), 0, -dot(p0,n));
}

// simple helper to draw a line define by two points
function draw_plane(p0,p1) {
  ctx.save();

  const l = w + h;
  const center = scale(add(p0,p1),0.5);
  const v = jsm.normalize(jsm.fromTo(p0,p1));
  const start = add(center, scale(v,-0.5*l));
  const end = add(center, scale(v,0.5*l));

  ctx.beginPath();
  ctx.moveTo(start.at(0),start.at(1));
  ctx.lineTo(end.at(0),end.at(1));
  ctx.stroke();
  ctx.restore();
}

// the clip planes
const clip_planes = [];

for(let i =0; i < lines.length;i++) {
  clip_planes.push(compute_plane(lines[i][0],lines[i][1]));
}
const points_clipped = clip_polygon(points, clip_planes);
```
<script>
const container = document.getElementById('poly_clip_impl_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

@input(0)
@input(1)
@input(2)

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
ctx.strokeStyle = "rgba(0,0,0,0)";
draw_polygon(points_clipped,ctx);
ctx.restore();

ctx.save();
ctx.strokeStyle = "rgb(255,0,0)";

for(let i = 0; i < lines.length;i++) {
  draw_plane(lines[i][0],lines[i][1]);
}
ctx.restore();

"LIA: stop"
</script>

<div id="poly_clip_impl_1"></div>
@mutate.remover(poly_clip_impl_1)


[^1]: Ivan E. Sutherland and Gary W. Hodgman. 1974. Reentrant polygon clipping. Commun. ACM 17, 1 (Jan. 1974), 32–42. https://doi.org/10.1145/360767.360802

### Integrating the clipping
<!--
script: ./rasterizer/src/stages/04_poly_clip/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

We will now integrate the previous clipping into our framework.
There isn't actually much that we have to do, but we have to apply the clipping and also handle the output.
As we are only able to rasterize triangles, what can we do, when the clipping result is a general polygon?

The answer is actually simple: We decompose the polygon into multiple triangles! 
There might be algorithms to find the nicest decomposition, for example such that we avoid very thin triangles, but we can also do it simply.

We start with the first triangle with vertices $0,1,2$.
That way, we have basically "surrounded" the middle vertex, as the polygon line will just continue at the last vertex.
So the next triangle will skip the second vertex and start with the third, giving us the triangle $0,2,3$.

In general, the $i$-th triangle will have the indices $0,i+1,i+2$.

We will incorporate this into our `process_triangle` method, that finally gets something to do.
The `clip_polygon` function from the last section is already included as a member function of the rasterizer.
Clip planes are stored in the same format as before as an array in the `Pipeline` class, that holds all the state options.

Since we can't yet output different color per shape, our image will be a bit simpler than the one in the previous section, but we will get there in the next part!

Below that is the solution

**Exercise:**

* Decompose a clipped polygon into triangles in `process_triangle`

  * Follow the instructions in code

<!-- data-readOnly="false"-->
``` js
class RasterizerTutorial extends Rasterizer {
  /**
   * Processes a single triangle
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   */
  process_triangle(pipeline, v0, v1, v2) {
    // prepare points and data for clipping
    let points = [v0, v1, v2];
    // clip polygon
    points = this.clip_polygon(points, pipeline.clip_planes);

    // *******************************
    // TODO
    // *******************************
    // decompose the result from the clipping into a number of triangles
    // call the this.rasterize_triangle(p0,p1,p2) methd for each of those
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const w = 300;
const h = 300;
const img = Image.zeroF32(w, h, 4);

// input polygon points
// all lie in z = 0
const points = [
  vec4(20, 20, 0.0, 1.0),
  vec4(w - 10, 40, 0.0, 1.0),
  vec4(40, h - 20, 0.0, 1.0),
];

// the lines that we want to clip with
// each entry is defined by two points that define a line in 2D
const lines = [
  [vec2(0,0), vec2(w,h*0.6)],
  [vec2(w,h * 0.8),vec2(0,h*0.7)],
  [vec2(50,h),vec2(w * 0.3,0)],
];

// computes the plane equation given two 2d vectors
function compute_plane(p0, p1) {
  const d = sub(p1, p0);
  // 2d normal
  const n = vec2(-d.at(1),d.at(0));
  // z is 0
  return vec4(n.at(0),n.at(1), 0, -dot(p0,n));
}


const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;

// add the clip planes
for(let i =0; i < lines.length;i++) {
  pipeline.clip_planes.push(compute_plane(lines[i][0],lines[i][1]));
}

// we will try to draw a similar image to the one in the last step!
// for that, we change the state during the drawing operation

// the full example code already includes clipping lines with the same planes, we need to split them up
// we currently use only one object in each of them, but we could add multiple, so we use the same setup as in other examples
const geoms_tri = [];
const geoms_lines = [];

{
  const attributes = {};
  attributes[Attribute.VERTEX] = points;

  const geom = {
      attributes,
      topology: Topology.TRIANGLES
  };

  geoms_tri.push(geom);
}

{
  const attributes = {};

  // generate lines
  const line_vertices = [];

  for(let i = 0; i < lines.length;i++) {
    const [p0,p1] = lines[i];
    // create points far enough to cover the screen
    const l = w + h;
    const center = scale(add(p0,p1),0.5);
    const v = jsm.normalize(jsm.fromTo(p0,p1));
    const start = add(center, scale(v,-0.5*l));
    const end = add(center, scale(v,0.5*l));
    // put them into a vec4
    line_vertices.push(vec4(start.at(0),start.at(1),0,1));
    line_vertices.push(vec4(end.at(0),end.at(1),0,1));
  }
  attributes[Attribute.VERTEX] = line_vertices;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms_lines.push(geom);
}
```
<script>
const container = document.getElementById('poly_clip_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r04.Rasterizer;
const Pipeline = r04.Pipeline;
const Framebuffer = r04.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

// draw the clipped triangle first
for(let i = 0; i < geoms_tri.length;i++) {
  raster.draw(pipeline,geoms_tri[i]);
}
// reset the clip planes and render the lines
// depending on the implementation, we might just put it all together,
// as lying on the clip plane counts as being inside, so the lines wouldnt be clipped.
// But there might be some numerical inaccuracies, so better to do it this way
pipeline.clip_planes = [];
for(let i = 0; i < geoms_lines.length;i++) {
  raster.draw(pipeline,geoms_lines[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="poly_clip_container_0"></div>
@mutate.remover(poly_clip_container_0)

**Solution:**

<!-- data-readOnly="false"-->
``` js -solution.js
class RasterizerTutorial extends Rasterizer {

  /**
   * Processes a single triangle
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   */
  process_triangle(pipeline, v0, v1, v2) {
    // prepare points and data for clipping
    let points = [v0, v1, v2];
    // clip polygon
    points = this.clip_polygon(points, pipeline.clip_planes);

    // triangulate polygon (clipping the triangle may result in non triangles
    // polygons) and rasterize
    for (let i = 0; i + 2 < points.length; i++) {
      this.rasterize_triangle(pipeline, points[0], points[i + 1], points[i + 2]);
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const w = 300;
const h = 300;
const img = Image.zeroF32(w, h, 4);

// input polygon points
// all lie in z = 0
const points = [
  vec4(20, 20, 0.0, 1.0),
  vec4(w - 10, 40, 0.0, 1.0),
  vec4(40, h - 20, 0.0, 1.0),
];

// the lines that we want to clip with
// each entry is defined by two points that define a line in 2D
const lines = [
  [vec2(0,0), vec2(w,h*0.6)],
  [vec2(w,h * 0.8),vec2(0,h*0.7)],
  [vec2(50,h),vec2(w * 0.3,0)],
];

// computes the plane equation given two 2d vectors
function compute_plane(p0, p1) {
  const d = sub(p1, p0);
  // 2d normal
  const n = vec2(-d.at(1),d.at(0));
  // z is 0
  return vec4(n.at(0),n.at(1), 0, -dot(p0,n));
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;

// add the clip planes
for(let i =0; i < lines.length;i++) {
  pipeline.clip_planes.push(compute_plane(lines[i][0],lines[i][1]));
}

// we will try to draw a similar image to the one in the last step!
// for that, we change the state during the drawing operation

// the full example code already includes clipping lines with the same planes, we need to split them up
// we currently use only one object in each of them, but we could add multiple, so we use the same setup as in other examples
const geoms_tri = [];
const geoms_lines = [];

{
  const attributes = {};
  attributes[Attribute.VERTEX] = points;

  const geom = {
    attributes,
    topology: Topology.TRIANGLES
  };

  geoms_tri.push(geom);
}

{
  const attributes = {};

  // generate lines
  const line_vertices = [];

  for(let i = 0; i < lines.length;i++)  {
    const [p0,p1] = lines[i];
    // create points far enough to cover the screen
    const l = w + h;
    const center = scale(add(p0,p1),0.5);
    const v = jsm.normalize(jsm.fromTo(p0,p1));
    const start = add(center, scale(v,-0.5*l));
    const end = add(center, scale(v,0.5*l));
    // put them into a vec4
    line_vertices.push(vec4(start.at(0),start.at(1),0,1));
    line_vertices.push(vec4(end.at(0),end.at(1),0,1));
  }
  attributes[Attribute.VERTEX] = line_vertices;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms_lines.push(geom);
}
```
<script>
const container = document.getElementById('poly_clip_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r04.Rasterizer;
const Pipeline = r04.Pipeline;
const Framebuffer = r04.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

// draw the clipped triangle first
for(let i = 0; i < geoms_tri.length;i++) {
  raster.draw(pipeline,geoms_tri[i]);
}
// reset the clip planes and render the lines
// depending on the implementation, we might just put it all together,
// as lying on the clip plane counts as being inside, so the lines wouldnt be clipped.
// But there might be some numerical inaccuracies, so better to do it this way
pipeline.clip_planes = [];

for(let i = 0; i < geoms_lines.length;i++) {
  raster.draw(pipeline,geoms_lines[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="poly_clip_container_1"></div>
@mutate.remover(poly_clip_container_1)

### What about lines?
<!--
script: ./rasterizer/src/stages/04_poly_clip/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

Lines can (and must later on) also be clipped like triangles.

As you can probably expect, this works nearly the same way as with the polygons, its just simpler.

Basically, we do only one step of the Sutherland-Hodgman algorithm: The one line against the plane.
Since the polygons loop over, we can't use exactly the same algorithm, as that would reverse our lines or miss a vertex.

So we basically just do the 4 cases described in the Sutherland-Hodgman section, just adapted for only having two points as input:

1. Both points outside? -> return empty array
2. Both points inside? -> return original line
3. Startpoint inside, endpoint outside? -> return startpoint and intersection
4. Startpoint outside, endpoint inside? -> return intersection and endpoint

we also need to enhance the `process_line` method the same way as the `process_triangle` method, but it is even easier, since the clipping produces either an empty array or a new line, so we don't have to decompose the result into anything.
We just need to check, if we have to points and if so, call the `rasterize_line` method as before.

As this is more or less copy and paste from the more complicated triangle code, we will just show you the result here.
We added some additional lines gto the geometry that is clipped.

<!-- data-readOnly="false"-->
``` js -solution.js
class RasterizerTutorial extends Rasterizer {
  /**
   * Clips a line against the given clip-planes
   * @param {Array<AbstractMat>} points The input points
   * @param {Array<AbstractMat>} planes The clipping planes
   * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
   */
  clip_line(points, planes) {
    // successive clipping at each plane
    // clpping a line at a plane is more or less one step of the
    // Sutherland-Hodgman algorithm, but without the polygon wrap-around
    for (let pi = 0; pi < planes.length; pi++) {
        const pl = planes[pi];
        if (points.length === 0) {
          return [];
        }

        // simplified sutherland-hodgman
        const p0 = points[0];
        const p1 = points[1];
        // compute projective distance

        const d0 = dot(pl, p0);
        const d1 = dot(pl, p1);

        // the four cases
        // the actual implementation will combine them a bit, as there is a bit of overlap

        if (d1 < 0.0 && d0 < 0.0) {
          // case 1 - both outside -> finished
          return [];
        }
        else if (d1 >= 0.0 && d0 >= 0.0) {
          // case 2 - both inside -> continue with the next plane
          continue;
        }
        else if (d0 >= 0.0 && d1 < 0.0) {
          // case 3 - start inside, end outside
          // compute intersection
          const t = d0 / (d0 - d1);
          const p = add(p0, scale(sub(p1, p0), t));

          //  return startpoint and intersection
          // In this case we will just replace the points and continue with the next plane;
          points = [p0, p];
          continue;
        } else {
          // case 4 - start outside, end inside
          // compute intersection
          const t = d0 / (d0 - d1);
          const p = add(p0, scale(sub(p1, p0), t));

          // return intersection and endpoint
          points = [p, p1];

          continue;
        }
    }

    return points;
  }

  /**
   * Processes a single line
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   */
  process_line(pipeline, v0, v1) {
    // prepare points and data for clipping
    let points = [v0, v1];
    // clip line
    points = this.clip_line(points, pipeline.clip_planes);

    // finally rasterize line
    if (points.length === 2) {
      this.rasterize_line(pipeline, points[0], points[1]);
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const w = 300;
const h = 300;
const img = Image.zeroF32(w, h, 4);

// input polygon points
// all lie in z = 0
const points = [
  vec4(20, 20, 0.0, 1.0),
  vec4(w - 10, 40, 0.0, 1.0),
  vec4(40, h - 20, 0.0, 1.0),
];

// the lines that we want to clip with
// each entry is defined by two points that define a line in 2D
const lines = [
  [vec2(0,0), vec2(w,h*0.6)],
  [vec2(w,h * 0.8),vec2(0,h*0.7)],
  [vec2(50,h),vec2(w * 0.3,0)],
];

// computes the plane equation given two 2d vectors
function compute_plane(p0, p1) {
  const d = sub(p1, p0);
  // 2d normal
  const n = vec2(-d.at(1),d.at(0));
  // z is 0
  return vec4(n.at(0),n.at(1), 0, -dot(p0,n));
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;

// add the clip planes
for(let i =0; i < lines.length;i++) {
  pipeline.clip_planes.push(compute_plane(lines[i][0],lines[i][1]));
}

// we will try to draw a similar image to the one in the last step!
// for that, we change the state during the drawing operation

// the full example code already includes clipping lines with the same planes, we need to split them up
// we currently use only one object in each of them, but we could add multiple, so we use the same setup as in other examples
const geoms_tri = [];
const geoms_lines = [];

{
  const attributes = {};
  attributes[Attribute.VERTEX] = points;

  const geom = {
    attributes,
    topology: Topology.TRIANGLES
  };

  geoms_tri.push(geom);
}

{
  // add some additional lines that are clipped
  const attributes = {};
  attributes[Attribute.VERTEX] = 
  [
    vec4(10,h * 0.7,0,1), vec4(w-10, h*0.5,0,1),
    vec4(w * 0.4,h * 0.4,0,1), vec4(w*0.1, h*0.2,0,1),
    vec4(w * 0.8,h * 0.9,0,1), vec4(w*0.7, h*0.2,0,1),
  ];

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms_tri.push(geom);
}

{
  const attributes = {};

  // generate lines
  const line_vertices = [];

  for(let i = 0; i < lines.length;i++) {
    const [p0,p1] = lines[i];
    // create points far enough to cover the screen
    const l = w + h;
    const center = scale(add(p0,p1),0.5);
    const v = jsm.normalize(jsm.fromTo(p0,p1));
    const start = add(center, scale(v,-0.5*l));
    const end = add(center, scale(v,0.5*l));
    // put them into a vec4
    line_vertices.push(vec4(start.at(0),start.at(1),0,1));
    line_vertices.push(vec4(end.at(0),end.at(1),0,1));
  }
  attributes[Attribute.VERTEX] = line_vertices;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms_lines.push(geom);
}
```
<script>
const container = document.getElementById('poly_clip_line_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r04.Rasterizer;
const Pipeline = r04.Pipeline;
const Framebuffer = r04.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

// draw the clipped triangle first
for(let i = 0; i < geoms_tri.length;i++) {
  raster.draw(pipeline,geoms_tri[i]);
}
// reset the clip planes and render the lines
// depending on the implementation, we might just put it all together,
// as lying on the clip plane counts as being inside, so the lines wouldnt be clipped.
// But there might be some numerical inaccuracies, so better to do it this way
pipeline.clip_planes = [];
for(let i = 0; i < geoms_lines.length;i++) {
  raster.draw(pipeline,geoms_lines[i]);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="poly_clip_line_container_0"></div>
@mutate.remover(poly_clip_line_container_0)

The next section will be the beginning of some incredible flexibility! 
Even in the first step, we will be able to freely move objects on the screen and for example change their color!

## 05: Shaders

We can now draw lines and triangles wherever we want. 
It does feel a bit static though.
Both types of objects have a fixed color and it is a bit cumbersome to work with stuff.
For example, if we wanted to copy a triangle multiple times to multiple places, we have to manually recompute all the vertices and create new geometry.

We will now introduce two powerful operations into our rasterizer, that allow us to implement a large variety of effects with relative ease (although we are still missing some functionality to make it really shine).

These operations are called shaders and we will implement two types: **Vertex** shaders and **fragment** shaders.

Usually, you would write them in a specialized language, such as GLSL or HLSL

As adding the shader functionality won't require any interesting algorithms, we will just look at it and instead do little applied example afterwards: Parametrically positioning and coloring objects!

You can find the full rasterization code here: [Rasterizer 05](./rasterizer/src/stages/05_shader/rasterizer.js)

### Vertex shader

A vertex shader operates on vertices, specifically one vertex at a time, all independantly. 
This could for example allow us to easily parallelize the process.
In the next step, we will allow vertex shaders to output custom attributes,
which we will automatically interpolate and use as input for the next shader.

For now, the vertex shader has only one purpose: Determine the final vertex positions used in rasterization.

When we want to keep the same functionality that we hd before, the output of the vertex shader is just passing along the current vertex position.

How do we implement this?

In our `draw` operation, we create an array with the same length as the input vertex array.
We then call the vertex shader stored in the pipeline object for each vertex and store the result in the corresponding position in the new array.
Afterwards we just do what we have done before, just having replaced the old array with the new one.

One additional part will be passing data to our shader.
For now, this will be be just a constant block of data: **Uniform** variables.

This again does not require much engineering. 
We will put a field `uniform_data` into our `Pipeline` class and pass that as an argument to the vertex shader.

The shaders will also be a field in the `Pipeline` class called `program`.
This field is just an object with two fields, for the vertex and fragment shaders.

As we start with the vertex shader, here is how we define one that doesn't do anything:

``` js
// the program object to be stored in the pipeline
const program = {
  // the vertex shader is just a function taking attributes and uniforms
  vertex_shader : (attributes, uniforms) => {
          return attributes[Attribute.VERTEX]);
  }
};

...

// set the pipeline's current program
pipeline.program = program;

// contains data that is passed to all calls to the vertex_shader in a draw command
pipeline.uniform_data = ...
```

There will be an additional parameter for the vertex shader, so we can actually pass data along to the fragment shader, but this will require an interpolation mechanism that we will implement in the next section.

Here is the new draw member function with the vertex shader functionality added:

```js
/**
 * Draw the given geometry
 * @param {Pipeline} pipeline The pipeline to use
 * @param {Object} geom Geometry object specifying all information
 */
draw(pipeline, geom) {
  // no vertex shader
  if (!pipeline.program) {
    return;
  }
  const program = pipeline.program;
  // no vertices
  // we could also take a parameter specifying the number of vertices to be
  // drawn and not rely on vertex data
  if (!geom.attributes[Attribute.VERTEX]) {
    return;
  }

  const vertices = geom.attributes[Attribute.VERTEX];
  const n = vertices.length;
  // process vertices
  const transformed_points = new Array(n);
  // Buffer variable to prevent having to create a new map for each vertex, as
  // they share the same attributes
  let vertex_attributes = [];

  for (let i = 0; i < n; i++) {
    // copy attributes in buffer
    for (const [key, values] of Object.entries(geom.attributes)) {
      vertex_attributes[key] = values[i];
    }

    // call vertex shader
    transformed_points[i] =
        program.vertex_shader(vertex_attributes, pipeline.uniform_data);
  }

  // go through objects
  if (geom.topology === Topology.LINES) {
    // handles lines
    // handle two vertices per step
    for (let i = 0; i < n; i += 2) {
      this.process_line(pipeline, transformed_points[i], transformed_points[i + 1]);
    }
  } else if (geom.topology === Topology.TRIANGLES) {
    // handle triangles

    // handle three vertices per step
    for (let i = 0; i < n; i += 3) {
      this.process_triangle(pipeline, transformed_points[i], transformed_points[i + 1],
          transformed_points[i + 2]);
    }
  }
}
```

For convenience, we copy the attributes for each vertex into an object, so the shader can access it by its key.

If you compare this with the previous draw function, basically only the additional array appeared and we call the vertex shader with the appropriate data.

In the next step, we will define the fragment shader.

### Fragment shader

The fragment shader is called for each fragment that is produced by the rasterization, so after the vertex shader.
"Fragment" in this context means "information that will make up a pixel and is produced by the rasterization".
In our case, one fragment will produce one pixel, but you can extend it, as real implementations do and allow operations such as multisampling, where you produce multiple fragments to color a pixel.

The fragment shader will do two things:

1. Write a color into the output buffers. So far we only have one, but you can configure that to output multiple values!
2. Return `true`, if the fragment should be rendered and `false` otherwise. This simple addition allows us to skip rasterization for pixels, which we could use to cut out parts of an object.

We define this together with the vertex shader.
And start again with creating the same functionality as before, although this will be slightly different, as we hardcoded different colors for lines and triangles and this shader will produce the same (for now).

There is one additional parameter for the fragment shader, that we will ignore for now.
We could have ordered it differently or put parameters into a more dynamic parameter object, but we chose this to make the definition of the fragment shader agree with the one starting next section and to keep it simple.

```js
const program = {
  vertex_shader : (attributes, uniforms) => {
    return mult(uniforms.M,attributes[Attribute.VERTEX]);
  },
  /**
   *  @param {AbstractMat} frag_coord The coordinate of the fragment to be processed 
   *  @param {Object} data Interpolated date for the fragment (next section)
   *  @param {Object} uniforms Uniform data
   *  @param {Object} output_colors An object where the output colors are stored in fields corresponding to the output images
   */
  fragment_shader : (frag_coord, data, uniforms, output_colors) => {
    // write out a fixed color into the first output image
    output_colors[0] = vec4(1, 0, 0, 1);
    // return true means: rasterize this fragment
    return true;
  }
};
```

Including this is actually pretty simple.
Currently, our line and triangle rasterization contain a few lines to write the pixel color, only differing on the color used:

```js
// the current pixel writing portion for lines and triangles

...

// the final fragment coordinate
const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
// run  fragment shader with data

// buffer for colors
const output_colors = {};

// we currently hardcode one output color to be put into the one output image
output_colors[0] = vec4(1, 0, 0, 1);

this.write_fragment(pipeline, frag_coord, output_colors);

...
```

We now add the fragment shader, where we replaced the last two lines:

```js
...

 // the final fragment coordinate
const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
// run  fragment shader with data

// buffer for colors
const output_colors = {};

// call the fragment shader instead of setting a constant color
// the second "data" parameter is an empty array for now and will be added in the next section
const do_write_fragment =
    program.fragment_shader(frag_coord, {}, pipeline.uniform_data, output_colors);

// only write the fragment, if the shader says so
if (do_write_fragment) {
  this.write_fragment(pipeline, frag_coord, output_colors);
}

...
```

With these simple changes, we can already do a lot, which we will show in the next step.

### Writing our first shaders
<!--
script: ./rasterizer/src/stages/05_shader/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

Now that we have the shader mechanism ready, we will use it to make our drawing operations configurable.

We will also define a simple helper class that we can use going forward to simplify this process.
This course won't get into the details, but in general you will specify the way an object is positioned in the world using three paramters:

1. Position
2. Scale (in all 3 axes)
3. Orientation (Rotation)

The nice thing is, that you can specify them all using matrices!

The easiest to write is scale.

We define three scaling factors for the three axes $\mathbf{s} = \begin{pmatrix}s_x \\ s_y \\ s_z\end{pmatrix}$ and scaling a vector is just scaling each component $\begin{pmatrix}p_x \\ p_y \\ p_z\end{pmatrix} \rightarrow \begin{pmatrix}s_x p_x \\ s_y p_y \\ s_z p_z\end{pmatrix}$

We can also write that as a matrix multiplication

$$
\begin{align*}
\mathbf{S}(\mathbf{s}) &= \begin{pmatrix} s_x & 0 & 0 \\ 0 & s_y & 0\\ 0 & 0 & s_z \end{pmatrix} \\
\begin{pmatrix}s_x p_x \\ s_y p_y \\ s_z p_z\end{pmatrix} &= \mathbf{S}(\mathbf{s}) \mathbf{p}
\end{align*}
$$

Translating a point is done as a simple addition of the translation vector $\mathbf{t}$: $\mathbf{p} + \mathbf{t}$.
Due to some mathematical reasons (linear maps preserve zero but a translation move the origin), we can't represent a 3D translation with a $3\times 3$ matrix. 
Luckily, we already made some preparations during clipping to have a neat way to compute the clip plane distances and define the clip planes: Adding an extra $1$ at the end of the vector (for points).

We can then represent a translation the following way:

$$
\begin{align*}
\mathbf{T}(\mathbf{t}) &= \begin{pmatrix}1 & 0 & 0 & t_x \\ 0 & 1 & 0 & t_y \\ 0 & 0 & 1 & t_z \\ 0 & 0 &  0 & 1\end{pmatrix} \\
\mathbf{p} + \mathbf{t} &= \mathbf{T}(\mathbf{t})\begin{pmatrix}p_x \\ p_y \\ p_z \\1\end{pmatrix}
\end{align*}
$$

You can veryfiy this by computing the matrix product.

Rotations are a bit more complicated and there are different ways to define/parametrize them, for example [Euler angles](https://en.wikipedia.org/wiki/Euler_angles) or [axis-angle representations](https://en.wikipedia.org/wiki/Axis%E2%80%93angle_representation).

We will just use $\mathbf{R}$ for the rotation matrix.

Now the nice thing is, that we can chain together transformations by just multiplying the matrices to the left of the current matrix! 
This is very handy, as we can combine all transformations into one matrix and then apply that final transform by just multiplying by the combined matrix.

Usually, we will have the order $\mathbf{T}\mathbf{R}\mathbf{S}$.
This can get arbitrarily complex: $\mathbf{T}_n\mathbf{R}_n\mathbf{S}_n \dots \mathbf{T}_1\mathbf{R}_1\mathbf{S}_1$, where any of these matrices could be the identity.

One thing you might have noticed is that the dimensions do not match, since the translation is $4\times 4$, while the others are $3 \times 3$.
This is very easy to fix though: Just put the 3D matrices into the upper left part of a 4D identity matrix.

Luckily, in code we already have methods to compute these matrices:

```js
/**
 * Creates a 4x4 translation matrix for a given translation vector
 *
 * @param {AbstractMat} t - 3D translation vector
 * @returns {Mat} A translation matrix
 */
jsm.translation(t) 

/**
 * Creates a 4x4 scaling matrix for a given scaling vector.
 * This vector contains the scaling factors for each dimension
 *
 * @param {AbstractMat} s - 3D scaling vector
 * @returns {Mat} The scaling matrix
 */
jsm.scaling(s);

/**
 * Computes a 4x4 3D rotation matrix, which represents a rotaion around an axis
 *
 * @param {AbstractMat} axis - The axis to rotate around
 * @param {number} angle - The angle to rotate in rad
 * @returns {Mat} The rotation matrix
 */
jsm.axisAngle4(axis, angle);
```

We now define a function that makes defining a full transformation a bit easier:

```js
function transform({ 
  pos = vec3(0.0, 0.0, 0.0),
  scale = vec3(1.0, 1.0, 1.0),
  rot = jsm.MatF32.id(4, 4)
}) {
  return mult(
    jsm.translation(pos),
    mult(
      rot,
      jsm.scaling(scale)
  ));
}
```

This handles creating of matrices and multiplying the $\mathbf{T}\mathbf{R}\mathbf{S}$ matrix order for us.
The rotation is asked for directly, so you can use different method to compute them.

We now define a helper class that bundles geometry, a transformation and a material.
The material just contains any data that we want to use for specifying the appearance of an object and we just append it to the uniform when rendering.

```js
class Renderable {
  constructor(geometry, {
      local_transform = jsm.MatF32.id(4, 4),
      material = {}
  } = {}) {
    this.geometry = geometry;
    this.material = material;

    // this transforms a point from the local space into the world
    this.local_to_world = local_transform;
    // compute the inverse to transform back a point
    this.world_to_local = jsm.inv(local_transform);
  }

  static new() {
    return new Renderable(...arguments);
  }
}
```

You can do everything without these, of course, but it makes writing stuff a bit easier.

Now we want to put this all into action!

Below you can find the scene setup, where geometries are specified with a material that contains a color.
They are then rendered, and the transformation matrix, as well as the material per object is placed in the uniform object that is passed to the shaders.

Write the shaders, such that they transform the objects based on the transformation matrix `uniforms.M` and write out the color `uniforms.material.color`!

We also use a simple helper function `create_plane_geometry_xy` that just creates a geometry object for a rectangle in 2D with $xy$ coordinates in $[-1,1]^2$ and $z=0$.

As usual you can see the solution below.

**Exercise:**

* Go to the `vertex_shader`

  * Transform the vertex (already returned) by the model matrix `uniforms.M`

* Go to the `fragment_shader`

  * Write out the color given in `uniforms.material.color` instead of the currently fixed one

<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300,300,4);

const renderables = [];

// plane geometry that we can reuse!
const plane = create_plane_geometry_xy();
const line = {
  attributes : {
    [Attribute.VERTEX]: [vec4(-1,0,0,1), vec4(1,0,0,1)]
  },
  topology: Topology.LINES
};

{
  const renderable = Renderable.new(plane, {
    local_transform : transform({pos : vec3(2.0 * img.w / 7.0, img.h / 2.0, 0.0), scale : vec3(img.w / 7.0,img.w / 7.0,img.w / 7.0)}),
    material : {
      color : vec4(1,0,0,1),
    }
  });
  renderables.push(renderable);
}

{
  const renderable = Renderable.new(plane, {
    local_transform : transform({pos : vec3(3.0 * img.w / 7.0, img.h / 3.0, 0.0), scale : vec3(img.w / 7.0,img.w / 8.0,0.0)}),
    material : {
      color : vec4(0,1,0,1),
    }
  });
  renderables.push(renderable);
}

// non-uniform scaling and rotation
{
  const renderable = Renderable.new(plane, {
    local_transform : transform({
      pos : vec3(img.w* 0.75, img.h *0.75, 0.0), scale : vec3(img.w *0.15,img.h*0.2,0.0),
      rot: jsm.axisAngle4(vec3(0,0,1),jsm.deg2rad(37.0))}),
    material : {
      color : vec4(1,0.5,1,1),
    }
  });
  renderables.push(renderable);
}

{
  const renderable = Renderable.new(line, {
    local_transform: transform({
      pos: vec3(img.w * 0.6, img.h *0.75, 0),
      scale : vec3(img.w/4,0,0)
    }),
    material : {
      color : vec4(0,1,1,1)
    }
  });
  renderables.push(renderable);
}
```
```js +pipeline.js
const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

// this will be overwritten by the renderloop
pipeline.uniform_data.M = jsm.MatF32.id(4,4);

const program = {
  vertex_shader : (attributes, uniforms) => {
    // *******************************
    // TODO
    // *******************************
    // transform vertex
    return attributes[Attribute.VERTEX];
  },
  fragment_shader : (frag_coord, data, uniforms, output_colors) => {
    // *******************************
    // TODO
    // *******************************
    // write out material color
    output_colors[0] = vec4(1.0,1.0,1.0,1.0);
    return true;
  }
};

// add the program to the pipeline
pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
```js +renderloop.js
img.fill(vec4(0,0,0,1));

for(let i = 0; i < renderables.length;i++) {
  const gi = renderables[i];
  // put the transformation in the uniform data
  pipeline.uniform_data.M = gi.local_to_world;
  // put the material in the uniform data
  pipeline.uniform_data.material = gi.material;

  // draw
  raster.draw(pipeline,gi.geometry);
}
```
<script>
const container = document.getElementById('shader_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r05.Rasterizer;
const Pipeline = r05.Pipeline;
const Framebuffer = r05.Framebuffer;

const raster = new Rasterizer();
@input(0)
@input(1)
@input(2)

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="shader_container_0"></div>
@mutate.remover(shader_container_0)

**Solution:**

<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300,300,4);

const renderables = [];

// plane geometry that we can reuse!
const plane = create_plane_geometry_xy();
const line = {
  attributes : {
    [Attribute.VERTEX]: [vec4(-1,0,0,1), vec4(1,0,0,1)]
  },
  topology: Topology.LINES
};

{
  const renderable = Renderable.new(plane, {
    local_transform : transform({pos : vec3(2.0 * img.w / 7.0, img.h / 2.0, 0.0), scale : vec3(img.w / 7.0,img.w / 7.0,img.w / 7.0)}),
    material : {
      color : vec4(1,0,0,1),
    }
  });
  renderables.push(renderable);
}

{
  const renderable = Renderable.new(plane, {
    local_transform : transform({pos : vec3(3.0 * img.w / 7.0, img.h / 3.0, 0.0), scale : vec3(img.w / 7.0,img.w / 8.0,0.0)}),
    material : {
      color : vec4(0,1,0,1),
    }
  });
  renderables.push(renderable);
}

// non-uniform scaling and rotation
{
  const renderable = Renderable.new(plane, {
    local_transform : transform({
      pos : vec3(img.w* 0.75, img.h *0.75, 0.0), scale : vec3(img.w *0.15,img.h*0.2,0.0),
      rot: jsm.axisAngle4(vec3(0,0,1),jsm.deg2rad(37.0))}),
    material : {
      color : vec4(1,0.5,1,1),
    }
  });
  renderables.push(renderable);
}

{
  const renderable = Renderable.new(line, {
    local_transform: transform({
      pos: vec3(img.w * 0.6, img.h *0.75, 0),
      scale : vec3(img.w/4,0,0)
    }),
    material : {
      color : vec4(0,1,1,1)
    }
  });
  renderables.push(renderable);
}
```
```js -pipeline.js
const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

// this will be overwritten by the renderloop
pipeline.uniform_data.M = jsm.MatF32.id(4,4);

const program = {
  vertex_shader : (attributes, uniforms) => {
    return mult(uniforms.M,attributes[Attribute.VERTEX]);
  },
  fragment_shader : (frag_coord, data, uniforms, output_colors) => {
    let color = uniforms.material.color;
    
    output_colors[0] = color;
    
    return true;
  }
};

// add the program to the pipeline
pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
```js -renderloop.js
img.fill(vec4(0,0,0,1));

for(let i = 0; i < renderables.length;i++) {
  const gi = renderables[i];
  // put the transformation in the uniform data
  pipeline.uniform_data.M = gi.local_to_world;
  // put the material in the uniform data
  pipeline.uniform_data.material = gi.material;

  // draw
  raster.draw(pipeline,gi.geometry);
}
```
<script>
const container = document.getElementById('shader_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r05.Rasterizer;
const Pipeline = r05.Pipeline;
const Framebuffer = r05.Framebuffer;

const raster = new Rasterizer();
@input(0)
@input(1)
@input(2)


imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="shader_container_1"></div>
@mutate.remover(shader_container_1)

## 06: Interpolate attributes

We are now able to draw lines and triangles and customize how they look and where they appear on the screen with our new shaders.

So far we are kinda limited though, as we only have a mechanism for passing data to both shaders at once.
The fragment shader doesn't really get any information aside from the fragment coordinate and the uniform data.

But what if we wanted to dynamically compute the output color based on where we are on the line or triangle?
One of the simplest examples is specifying the color at the endpoints and then gradually coloring in the inbetween values with a mix of the endpoints.

The generic mechanism to achieve these kinds of things will be implemented in this section. 
We will start with lines and then move on to triangles, although for those we will see, that we already implemented most of it!

The main part of the work will be adding some additional data objects along the way, but nothing too complicated.

You can find the full rasterization code here: [Rasterizer 06](./rasterizer/src/stages/06_attrib_interp/rasterizer.js)

### Preparations

We will need to add the attribute data in a few places, though it will look mostly the same everywhere.
Basically, we want to keep it pretty flexible, but not make the code too complicated.
So we will just add add an additional parameter to the vertex shader.
This parameter will be called `output` and it is just an empty object. 

A vertex shader can then just add any field to that object.
These "output blocks" will be stored along with the transformed vertex positions an passed on to the rasterization, where they will be handled for the fragment shader.

The fragment shader previously had a `data` parameter, which was left empty. We will fill it now, as it will be the result of the attribute interpolation implemented in the next step.

As this setup is a choice for this framework (and very likely not the fastest), we will show you the new setup code, with some of the mostly unchanged part left out.
There is one part missing, namely the processing and clipping functions.
These will be changed in the next step as well.

```js
class Rasterizer {
  /**
   * Draw the given geometry
   * @param {Pipeline} pipeline The pipeline to use
   * @param {Object} geom Geometry object specifying all information
   */
  draw(pipeline, geom) {
    // no vertex shader
    if (!pipeline.program) {
      return;
    }
    const program = pipeline.program;
    // no vertices
    // we could also take a parameter specifying the number of vertices to be
    // drawn and not rely on vertex data
    if (!geom.attributes[Attribute.VERTEX]) {
      return;
    }

    const vertices = geom.attributes[Attribute.VERTEX];
    const n = vertices.length;
    // process vertices
    const transformed_points = new Array(n);
    // Buffer variable to prevent having to create a new map for each vertex, as
    // they share the same attributes
    let vertex_attributes = [];
    // storage for vertex outputs
    // each vertex has a number of outputs, that are filled by the vertex shader
    const vertex_outputs = new Array(n);

    for (let i = 0; i < n; i++) {
      vertex_outputs[i] = {};
    }

    for (let i = 0; i < n; i++) {
      // copy attributes in buffer
      for (const [key, values] of Object.entries(geom.attributes)) {
        vertex_attributes[key] = values[i];
      }
      // call vertex shader
      transformed_points[i] =
        program.vertex_shader(vertex_attributes, pipeline.uniform_data, vertex_outputs[i]);
    }

    // go through objects
    if (geom.topology === Topology.LINES) {
      // handles lines
      // handle two vertices per step
      for (let i = 0; i < n; i += 2) {
        this.process_line(pipeline, transformed_points[i], transformed_points[i + 1],
            vertex_outputs[i], vertex_outputs[i + 1]);
      }
    } else if (geom.topology === Topology.TRIANGLES) {
      // handle triangles
      // handle three vertices per step
      for (let i = 0; i < n; i += 3) {
        this.process_triangle(pipeline, transformed_points[i], transformed_points[i + 1],
          transformed_points[i + 2], vertex_outputs[i],
          vertex_outputs[i + 1], vertex_outputs[i + 2]);
      }
    }
  }

  /**
   * 
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   * @param {Object<Number|AbstractMat>} data_v0 The attributes for the first vertex
   * @param {Object<Number|AbstractMat>} data_v1 The attributes for the second vertex
   * @param {Object<Number|AbstractMat>} data_v2 The attributes for the third vertex
   * @returns 
   */
  rasterize_triangle(pipeline, v0, v1, v2,
    data_v0 = {}, data_v1 = {}, data_v2 = {}) {
    // compute triangle screen bounds
    let points = [v0, v1, v2];

    ...

    // interpolated data buffer
    const data = {};

    // gather attributes
    for (let i in data_v0) {
      if (!data_v1[i] || !data_v2[i]) {
        continue;
      }
      data[i] = null;
    }

    ...

    // check all pixels in screen bounding box
    for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
      for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
        ...

        // TODO
        // Interpolate the data and store it in the "data" variable

        ...

        const do_write_fragment =
            program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

        ...
      }
    }
  }

  /**
   * Rasterize a line
   * @param {AbstractMat} a 
   * @param {AbstractMat} b 
   * @param {Object<Number|AbstractMat>} data_a 
   * @param {Object<Number|AbstractMat>} data_b 
   */
  rasterize_line(pipeline, a, b,
    data_a = {}, data_b = {}) {
    ...

    // interpolated data buffer
    const data = {};

    // gather attributes
    for (let i in data_a) {
      if (!data_b[i]) {
        continue;
      }
      data[i] = null;
    }

    ...

    for (let x = x0; x <= x1; x++) {
      ...
      
      // TODO
      // Interpolate the data and store it in the "data" variable

      ...

      const do_write_fragment =
        program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

      ...
    }
  }
}
```

### Interpolate values on a line
<!--
script: ./rasterizer/src/stages/06_attrib_interp/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

We have defined a line between two points $\mathbf{A}$ and $\mathbf{B}$ as $\mathbf{P}(t) = \mathbf{A} + t(\mathbf{B} - \mathbf{A})$.

We can rewrite this as $(1-t)\mathbf{A} + t \mathbf{B}$.

As before, we get $\mathbf{A}$ for $t=0$ and $\mathbf{B}$ for $t=1$.
Every value of $t$ between $0$ and $1$ produces a point on the line between the two points.
That is why we call this **linear** interpolaton.

Now, we can just apply the same idea to not only the points but any kind of data on the line.
So let's say, we have a data attribute for each endpoint $d_{\mathbf{A}}$ and $d_{\mathbf{B}}$.
For the point $\mathbf{P}(t)$, we calculate the interpolated attribute $d_{\mathbf{P}(t)}$ as:

$$
    d_{\mathbf{P}(t)} = (1-t)d_{\mathbf{A}} + t d_{\mathbf{B}}
$$

As long as we can multiply the attribute with a scalar and add two attributes, the above formula is defined, especially for numbers and vectors/matrices!

In our system, we will allow attributes to be numbers and matrices (which includes vectors).

Let's implement this function and see how it looks like.
Due to the missing operator overloading, we will have to implement the formula twice, once for numbers and once for matrices.
Luckily, the formula is pretty short.

The solution is below to compare your result.

**Exercise:**

* Implement the interpolation formula in `interpolate_line`

<!-- data-readOnly="false"-->
``` js +interpolate.js
/**
 * @brief Linearly interpolate two values
 *
 * @param a The first value
 * @param b The second value
 * @param t The interpolation parameter in [0,1]
 * @return The interpolated value
 */
function interpolate_line(a, b, t) {
  // Differentiate between numbers and vectors due to missing operator overload
  // we simplify here and assume b to be the same type as a
  if (typeof (a) === 'number') {
    // *******************************
    // TODO
    // *******************************
    // return linear interpolation between the numbers
    return 0.0;
  } else {
    // *******************************
    // TODO
    // *******************************
    // return linear interpolation between the matrices
    return jsm.zeros(a.rows(),a.cols());
  }
}
```
<!-- data-readOnly="false"-->
``` js
const img = Image.zeroF32(300,100,4);

// calculate a color gradient!
const colora = vec4(1,0,0,1);
const colorb = vec4(0,0.5,1,1);

// we will just go along the x axis and fill the y values with the same 
// this is just so we can see something
for(let x = 0; x < img.w; x++) {
  const t = x / (img.w - 1);
  const val = interpolate_line(colora,colorb,t);
  for(let y = 0; y < img.h;y++) {
    img.set(val,x,y);
  }
}

// also interpolate values between numbers just to check
const values = [];
const min = 0;
const max = 10;
const num = 11;
for(let i = 0; i < num; i++) {
  let t = i / (num -1);

  const v = interpolate_line(min,max,t);
  values.push(v);
}

// write out results
console.log(`The ${num} values between ${min} and ${max} are: ${values.join(",")}`);
```
<script>
const container = document.getElementById('attrib_line_interp_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');


@input(0)
@input(1)

imageToCtx(img,ctx);

"LIA: stop"
</script>

<div id="attrib_line_interp_0"></div>
@mutate.remover(attrib_line_interp_0)

**Solution:**

<!-- data-readOnly="false"-->
``` js -interpolate.js
/**
 * @brief Linearly interpolate two values
 *
 * @param a The first value
 * @param b The second value
 * @param t The interpolation parameter in [0,1]
 * @return The interpolated value
 */
function interpolate_line(a, b, t) {
  // Differentiate between numbers and vectors due to missing operator overload
  // we simplify here and assume b to be the same type as a
  if (typeof (a) === 'number') {
    return (1.0 - t) * a + t * b;
  } else {
    // Otherwise assume the parameters to be vectors/matrices
    return add(scale(a, (1.0 - t)), scale(b, t));
  }
}
```
<!-- data-readOnly="false"-->
``` js -show_interpolation.js
const img = Image.zeroF32(300,100,4);

// calculate a color gradient!
const colora = vec4(1,0,0,1);
const colorb = vec4(0,0.5,1,1);

// we will just go along the x axis and fill the y values with the same 
// this is just so we can see something
for(let x = 0; x < img.w; x++) {
  const t = x / (img.w - 1);
  const val = interpolate_line(colora,colorb,t);
  for(let y = 0; y < img.h;y++) {
    img.set(val,x,y);
  }
}

// also interpolate values between numbers just to check
const values = [];
const min = 0;
const max = 10;
const num = 11;
for(let i = 0; i < num; i++) {
  let t = i / (num -1);

  const v = interpolate_line(min,max,t);
  values.push(v);
}

// write out results
console.log(`The ${num} values between ${min} and ${max} are: ${values.join(",")}`);
```
<script>
const container = document.getElementById('attrib_line_interp_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

@input(0)
@input(1)

imageToCtx(img,ctx);

"LIA: stop"
</script>

<div id="attrib_line_interp_1"></div>
@mutate.remover(attrib_line_interp_1)

Now, when rasterizing, we will just need to calculate the $t$ parameter for the current fragment and interpolate all attributes!
The interpolated values will then be passed to the fragment shader.

That is not the only place though.
We also need the line interpolation when clipping! 
When we cut away a part of a polygon edge or line, we need to get the attribute at that newly created vertex!

In that case we already know the $t$ value, since we computed it for the clipping, but how do we get it in general and during line rasterization?

The answer is projection!

For a point $\mathbf{P}$, we compute the vector from $\mathbf{A}$ to $\mathbf{P}$. 
We then compute its projection onto the line direction $\mathbf{B} - \mathbf{A}$.

The projection is given by the dot product with the normalized direciton vector: $(\mathbf{P} - \mathbf{A}) \cdot \frac{\mathbf{B}-\mathbf{A}}{||\mathbf{B}-\mathbf{A}||}$.

What we really want though are value between $0$ and $1$.
To get that, we simply divide by the length of the direction vector.

$$
\begin{align*}
t &= ((\mathbf{P} - \mathbf{A}) \cdot \frac{\mathbf{B}-\mathbf{A}}{||\mathbf{B}-\mathbf{A}||})\frac{1}{||\mathbf{B}-\mathbf{A}||} \\
&= (\mathbf{P} - \mathbf{A}) \cdot \frac{\mathbf{B}-\mathbf{A}}{||\mathbf{B}-\mathbf{A}||^2} \\
&=  \frac{(\mathbf{P} - \mathbf{A}) \cdot(\mathbf{B}-\mathbf{A})}{(\mathbf{B}-\mathbf{A})\cdot (\mathbf{B}-\mathbf{A})}
\end{align*}
$$

You can easily verify that you get $0$ and $1$ at the endpoints, by plugging them in.

Now the only thing left to do is to implement it.

We will start with lines and while we are at it also adjust the `process_line` and `clip_line` methods. 
As we already implemented the interpolation method, both of these don't require and special understanding and are shown with their implementation.

`clip_line` produces clipped attributes in addition to the clipped points.
We clip by finding the point on the line that intersects the line with a parameter $t\in[0,1]$.
That is exactly the linear interpolation, so we just call the `interpolate_line` method for each attribute, when we need to intersect a plane.
**Note:** We could also call the `interpolate_line` function to get the intersection itself!

As the code basically looks the same as before, we just add the attribute arrays and interpolation call,
we opted to just show this.

```js 
/**
 * Clips a line against the given clip-planes
 * @param {Array<AbstractMat>} points The input points
 * @param {Array<Object>} attribs The attributes per point
 * @param {Array<AbstractMat>} planes The clipping planes
 * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
 */
clip_line(points, planes, attribs) {
  // successive clipping at each plane
  // clpping a line at a plane is more or less one step of the
  // Sutherland-Hodgman algorithm, but without the polygon wrap-around
  for (let pi = 0; pi < planes.length; pi++) {
      const pl = planes[pi];
      if (points.length === 0) {
        return [[], []];
      }

      // simplified sutherland-hodgman
      const p0 = points[0];
      const p1 = points[1];
      // compute projective distance

      const d0 = dot(pl, p0);
      const d1 = dot(pl, p1);

      // the four cases
      // the actual implementation will combine them a bit, as there is a bit of overlap

      if (d1 < 0.0 && d0 < 0.0) {
        // case 1 - both outside -> finished
        return [[], []];
      }
      else if (d1 >= 0.0 && d0 >= 0.0) {
        // case 2 - both inside -> continue with the next plane
        continue;
      }
      else if (d0 >= 0.0 && d1 < 0.0) {
        // case 3 - start inside, end outside
        // compute intersection
        const t = d0 / (d0 - d1);
        const p = add(p0, scale(sub(p1, p0), t));

        //  return startpoint and intersection
        // In this case we will just replace the points and continue with the next plane;
        points = [p0, p];

        // interpolate attributes
        const p_attribs = {};

        for (let k in attribs[0]) {
          p_attribs[k] =
            this.interpolate_line(attribs[0][k], attribs[1][k], t);
        }
        attribs = [attribs[0], p_attribs];
        continue;
      } else {
        // case 4 - start outside, end inside
        // compute intersection
        const t = d0 / (d0 - d1);
        const p = add(p0, scale(sub(p1, p0), t));


        // return intersection and endpoint
        points = [p, p1];

        // interpolate attributes
        const p_attribs = {};

        for (let k in attribs[0]) {
          p_attribs[k] =
            this.interpolate_line(attribs[0][k], attribs[1][k], t);
        }
        attribs = [p_attribs, attribs[1]];
        continue;
      }
  }
  return [points, attribs];
}
```

The `process_line` is only changed such that it passes along the attributes and clipped attributes.

```js
/**
 * Processes a single line
 * @param {Pipeline} pipeline The pipeline to use
 * @param {AbstractMat} v0 The first vertex
 * @param {AbstractMat} v1 The second vertex
 * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
 * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
 */
process_line(pipeline, v0, v1,
  attribs_v0 = {},
  attribs_v1 = {}) {
  // prepare points and data for clipping
  let points = [v0, v1];
  let attribs = [attribs_v0, attribs_v1];
  // clip line
  [points, attribs] = this.clip_line(points, pipeline.clip_planes, attribs);

  // finally rasterize line
  if (points.length === 2) {
    this.rasterize_line(pipeline, points[0], points[1], attribs[0], attribs[1]);
  }
}
```

The only missing part of interest is computing the $t$ parameter for the rasterized line. 
We show lines in a circle with additional clipping planes.

The solutions is below.

**Exercise:**

* Go to the `rasterize_line` method

  * Compute the interpolation parameter according to $\frac{(\mathbf{P} - \mathbf{A}) \cdot(\mathbf{B}-\mathbf{A})}{(\mathbf{B}-\mathbf{A})\cdot (\mathbf{B}-\mathbf{A})} $

<!-- data-readOnly="false"-->
``` js +rasterizer.js
class RasterizerTutorial extends Rasterizer {
  /**
   * Rasterize a line
   * @param {AbstractMat} a 
   * @param {AbstractMat} b 
   * @param {Object<Number|AbstractMat>} data_a 
   * @param {Object<Number|AbstractMat>} data_b 
   */
  rasterize_line(pipeline, a, b,
      data_a = {}, data_b = {}) {
      // clip
      const clipped = this.clip_screen(a, b, vec2(pipeline.viewport.x, pipeline.viewport.y), vec2(pipeline.viewport.x + pipeline.viewport.w - 1, pipeline.viewport.y + pipeline.viewport.h - 1));
      if (clipped.length === 0) {
        return;
      }

      const program = pipeline.program;

      // interpolated data buffer
      const data = {};

      // gather attributes
      for (let i in data_a) {
        if (!data_b[i]) {
          continue;
        }
        data[i] = null;
      }

      // Bresenham/midpoint line drawing algorithm
      // operates on pixels
      const p0 = clipped[0];
      const p1 = clipped[1];
      
      // Bresenham works in integer coordinates
      let x0 = Math.floor(p0.at(0));
      let y0 = Math.floor(p0.at(1));

      let x1 = Math.floor(p1.at(0));
      let y1 = Math.floor(p1.at(1));

      // Bresenham is only defined in the first 2D octant
      // To make it work for the others, we reorder things, so they are in that
      // first octant. In the end we have to undo some of that

      // slope > 1 -> flip x and y
      let transposed = false;
      if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
        transposed = true;
        [x0, y0] = [y0, x0];
        [x1, y1] = [y1, x1];
      }

      // going from right to left -> flip first and second point
      // doesn't actually change the line, so no later inversion needed
      if (x1 < x0) {
        [x0, x1] = [x1, x0];
        [y0, y1] = [y1, y0];
      }

      const dx = x1 - x0;
      const dy = Math.abs(y1 - y0);

      let y = y0;
      let m = dy / dx;
      if (y1 < y0) {
        m = -m;
      }

      for (let x = x0; x <= x1; x++) {
          let px = vec2(x, y);

          // flip x and y for the actual coordinate if they were flipped before
          if (transposed) {
            px = vec2(y, x);
          }

          // move px to pixel center
          add(px, vec2(0.5, 0.5), px);

          // *******************************
          // TODO
          // *******************************
          // compute interpolation paramter along line
          // this is the projection of the pixel center on the line
          let t = 0.0;
          // clamp the value to [0,1], as our line is in pixels and we sample the center
          // we might get (very small) issues

          // interpolate values
          for (let i in data) {
            data[i] = this.interpolate_line(data_a[i], data_b[i], t);
          }

          // the final fragment coordinate
          const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
          // run  fragment shader with data

          // buffer for colors
          const output_colors = {};

          const do_write_fragment =
            program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

          if (do_write_fragment) {
            this.write_fragment(pipeline, frag_coord, output_colors);
          }

          y += m;
      }
  }
}
```
<!-- data-readOnly="false"-->
``` js
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

{
  const attributes = {};

  const vertices = [];
  const colors = [];

  const num = 180;
  const r = 0.45 * Math.min(img.w,img.h);

  for(let i = 0; i < num; i++) {
    const t = i/num;
    const x = r*Math.cos(Math.PI*2 * t);
    const y = r*Math.sin(Math.PI*2 * t);

    vertices.push(vec4(img.w / 2, img.h/2,0.0,1.0));
    vertices.push(vec4(img.w / 2 + x,img.h/2+y,0.0,1.0));

    // colors
    colors.push(vec4(0.25,0.25,0.25,1));
    colors.push(vec4((t*4.0) % 1.0,(t*2.0) % 1.0,(t*1.3) % 1.0,1));
  }

  attributes[Attribute.VERTEX] = vertices;

  // we could use any key
  attributes["color"] = colors;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(Renderable.new(geom));
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const program = {
  vertex_shader : (attributes, uniforms, outputs) => {
    outputs["color"] = attributes["color"];
    return mult(uniforms.M,attributes[Attribute.VERTEX]);
  },
  fragment_shader :  (frag_coord, data,uniforms, output_colors) => {
    let color =  data["color"]

    output_colors[0] = color;
    
    return true;
  }
};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('attrib_line_interp_2');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r06.Rasterizer;
const Pipeline = r06.Pipeline;
const Framebuffer = r06.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

// the lines that we want to clip with
// each entry is defined by two points that define a line in 2D
const lines = [
  [vec2(0,0), vec2(img.w,img.h*0.6)],
  [vec2(img.w,img.h * 0.8),vec2(0,img.h*0.7)],
  [vec2(50,img.h),vec2(img.w * 0.3,0)],
];

// computes the plane equation given two 2d vectors
function compute_plane(p0, p1) {
  const d = sub(p1, p0);
  // 2d normal
  const n = vec2(-d.at(1),d.at(0));
  // z is 0
  return vec4(n.at(0),n.at(1), 0, -dot(p0,n));
}

// add the clip planes
for(let i =0; i < lines.length;i++) {
  pipeline.clip_planes.push(compute_plane(lines[i][0],lines[i][1]));
}


img.fill(vec4(0,0,0,1));


for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="attrib_line_interp_2"></div>
@mutate.remover(attrib_line_interp_2)

**Solution:**

<!-- data-readOnly="false"-->
``` js -rasterizer.js
class RasterizerTutorial extends Rasterizer {
  /**
   * Rasterize a line
   * @param {AbstractMat} a 
   * @param {AbstractMat} b 
   * @param {Object<Number|AbstractMat>} data_a 
   * @param {Object<Number|AbstractMat>} data_b 
   */
  rasterize_line(pipeline, a, b,
    data_a = {}, data_b = {}) {
    // clip
    const clipped = this.clip_screen(a, b, vec2(pipeline.viewport.x, pipeline.viewport.y), vec2(pipeline.viewport.x + pipeline.viewport.w - 1, pipeline.viewport.y + pipeline.viewport.h - 1));
    if (clipped.length === 0) {
      return;
    }

    const program = pipeline.program;

    // interpolated data buffer
    const data = {};

    // gather attributes
    for (let i in data_a) {
      if (!data_b[i]) {
        continue;
      }
      data[i] = null;
    }



    // Bresenham/midpoint line drawing algorithm
    // operates on pixels
    const p0 = clipped[0];
    const p1 = clipped[1];
    const a2d = copy(subvec(a, 0, 2));
    const b2d = copy(subvec(b, 0, 2));

    const ldelta = sub(b2d, a2d);

    // precompute this value, since we will use it later
    const ldelta2 = dot(ldelta, ldelta);

    // Bresenham works in integer coordinates
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    // Bresenham is only defined in the first 2D octant
    // To make it work for the others, we reorder things, so they are in that
    // first octant. In the end we have to undo some of that

    // slope > 1 -> flip x and y
    let transposed = false;
    if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
      transposed = true;
      [x0, y0] = [y0, x0];
      [x1, y1] = [y1, x1];
    }

    // going from right to left -> flip first and second point
    // doesn't actually change the line, so no later inversion needed
    if (x1 < x0) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }

    const dx = x1 - x0;
    const dy = Math.abs(y1 - y0);

    let y = y0;
    let m = dy / dx;
    if (y1 < y0) {
      m = -m;
    }

    for (let x = x0; x <= x1; x++) {
        let px = vec2(x, y);

        // flip x and y for the actual coordinate if they were flipped before
        if (transposed) {
          px = vec2(y, x);
        }

        // move px to pixel center
        add(px, vec2(0.5, 0.5), px);

        // compute interpolation paramter along line
        // this is the projection of the pixel center on the line
        let t = ldelta2 !== 0.0 ? dot(sub(px, a2d), ldelta) / ldelta2 : 0.0;
        // as we are dealing with pixels and not the line itself -> clamp just
        // to be sure
        t = Math.max(0.0, Math.min(1.0, t));

        // interpolate values
        for (let i in data) {
          data[i] = this.interpolate_line(data_a[i], data_b[i], t);
        }

        // the final fragment coordinate
        const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
        // run  fragment shader with data

        // buffer for colors
        const output_colors = {};

        const do_write_fragment =
          program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

        if (do_write_fragment) {
          this.write_fragment(pipeline, frag_coord, output_colors);
        }

        y += m;
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -draw.js
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

{
  const attributes = {};

  const vertices = [];
  const colors = [];

  const num = 180;
  const r = 0.45 * Math.min(img.w,img.h);

  for(let i = 0; i < num; i++) {
    const t = i/num;
    const x = r*Math.cos(Math.PI*2 * t);
    const y = r*Math.sin(Math.PI*2 * t);

    vertices.push(vec4(img.w / 2, img.h/2,0.0,1.0));
    vertices.push(vec4(img.w / 2 + x,img.h/2+y,0.0,1.0));

    // colors
    colors.push(vec4(0.25,0.25,0.25,1));
    colors.push(vec4((t*4.0) % 1.0,(t*2.0) % 1.0,(t*1.3) % 1.0,1));
  }

  attributes[Attribute.VERTEX] = vertices;

  // we could use any key
  attributes["color"] = colors;

  const geom = {
    attributes,
    topology: Topology.LINES
  };

  geoms.push(Renderable.new(geom));
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const program = {
  vertex_shader : (attributes, uniforms, outputs) => {
    outputs["color"] = attributes["color"];
    return mult(uniforms.M,attributes[Attribute.VERTEX]);
  },
  fragment_shader :  (frag_coord, data,uniforms, output_colors) => {
    let color =  data["color"]

    output_colors[0] = color;
    
    return true;
  }
};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('attrib_line_interp_3');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r06.Rasterizer;
const Pipeline = r06.Pipeline;
const Framebuffer = r06.Framebuffer;

@input(0)
@input(1)

const raster = new RasterizerTutorial();

// the lines that we want to clip with
// each entry is defined by two points that define a line in 2D
const lines = [
  [vec2(0,0), vec2(img.w,img.h*0.6)],
  [vec2(img.w,img.h * 0.8),vec2(0,img.h*0.7)],
  [vec2(50,img.h),vec2(img.w * 0.3,0)],
];

// computes the plane equation given two 2d vectors
function compute_plane(p0, p1) {
  const d = sub(p1, p0);
  // 2d normal
  const n = vec2(-d.at(1),d.at(0));
  // z is 0
  return vec4(n.at(0),n.at(1), 0, -dot(p0,n));
}

// add the clip planes
for(let i =0; i < lines.length;i++) {
  pipeline.clip_planes.push(compute_plane(lines[i][0],lines[i][1]));
}

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="attrib_line_interp_3"></div>
@mutate.remover(attrib_line_interp_3)

### Interpolate values on a triangle
<!--
script: ./rasterizer/src/stages/06_attrib_interp/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

Now that we can pass attribtues to shaders for lines, we will extend this to triangles.

We start again with the clipping (`clip_polygon`) and processing (`process_triangle`).
These are basically exact equivalents to the line versions.

In `clip_polygon`, we add a block for the clipped attributes in addition to the positions.
As the clipping only involves the intersection with the polygon edges, this is exactly the same as with the lines.
In the code, the only difference is that we are in a loop over the edges and don't only have two points.

In `process_triangle` we incorporate the attributes and pass them to the rasterization along with the points when triangulating the clipped polygon.

As there isn't much new happening, you can look at the code below, but for brevity, it is folded in.

```js -clip_polygon
/**
 * Clips a polygon against the given clip-planes
 * @param {Array<AbstractMat>} points The input points
 * @param {Array<Object>} attribs The attributes per point
 * @param {Array<AbstractMat>} planes The clipping planes
 * @returns {[Array<AbstractMat>,Array<Object>]} The clipped points and interpolated attributes
 */
clip_polygon(points, planes, attribs) {
  // Implementation of the Sutherland-Hodgman algorithm
  for (let pi = 0; pi < planes.length; pi++) {
    const pl = planes[pi];
    const output = [];
    const output_block = [];
    const size = points.length;
    for (let i = 0; i < size; i++) {
      const cur = points[i];
      const ip = (i - 1 + points.length) % points.length;
      const prev = points[ip];

      // compute distance
      const dc = dot(pl, cur);
      const dp = dot(pl, prev);

      // cur inside
      if (dc >= 0.0) {
        // prev outside
        if (dp < 0.0) {
          // intersect prev -> cur

          const t = dp / (dp - dc);
          const p = add(prev, scale(sub(cur, prev), t));

          // interpolate attributes
          const p_attribs = {};

          for (let k in attribs[i]) {
            p_attribs[k] =
              this.interpolate_line(attribs[ip][k], attribs[i][k], t);
          }
          output.push(p);
          output_block.push(p_attribs);
        }

        output.push(cur);
        output_block.push(attribs[i]);
      } else if (dp >= 0.0) {
        // cur outside, prev inside
        // intersect prev->cur
        // intersect in homogeneous space

        const t = dp / (dp - dc);
        const p = add(prev, scale(sub(cur, prev), t));

        // interpolate attributes
        const p_attribs = {};

        for (let k in attribs[i]) {
          p_attribs[k] =
            this.interpolate_line(attribs[ip][k], attribs[i][k], t);
        }
        output.push(p);
        output_block.push(p_attribs);
      }
    }

    points = output;
    attribs = output_block;
  }
  return [points, attribs];
}
```
```js -process_triangle
/**
 * Processes a single triangle
 * @param {Pipeline} pipeline The pipeline to use
 * @param {AbstractMat} v0 The first vertex
 * @param {AbstractMat} v1 The second vertex
 * @param {AbstractMat} v2 The third vertex
 * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
 * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
 * @param {Object<Number|AbstractMat>} attribs_v2 The attributes of the third vertex
 */
process_triangle(pipeline, v0, v1, v2,
    attribs_v0 = {}, attribs_v1 = {}, attribs_v2 = {}) {
  // prepare points and data for clipping
  let points = [v0, v1, v2];
  let attribs = [attribs_v0, attribs_v1, attribs_v2];
  // clip polygon
  [points, attribs] = this.clip_polygon(points, pipeline.clip_planes, attribs);

  // triangulate polygon (clipping the triangle may result in non triangles
  // polygons) and rasterize
  for (let i = 0; i + 2 < points.length; i++) {
    this.rasterize_triangle(pipeline, points[0], points[i + 1], points[i + 2], attribs[0],
      attribs[i + 1], attribs[i + 2]);
  }
}
```

For the line rasterization, we had to calculate the interpolation parameter.
Now for triangles, we have three points, so the singular parameter doesn't cut it.

But we already have a very similar mechanism: Barycentric coordinates.
They do basically the same thing, being the weights of each vertex.
On an edge of the triangle, they are actually equivalent to the linear interpolation (one weight is $0$)!

So it makes sense, that we basically do the same thing with the barycentric coordinates as we did with the $t$ parameter.
So instead of interpolating attributes as $d_{\mathbf{P}(t)} = (1-t)d_{\mathbf{A}} + t d_{\mathbf{B}}$, we do the barycentric interpolation:

$$
     d_{\mathbf{P}(u,v,w)} = u d_{\mathbf{A}} + v d_{\mathbf{B}} + w d_{\mathbf{C}}
$$

And we already computed the barycentric coordinates to check if a point is part of the triangle.
So we will only implement a method `interpolate_triangle` that handles the interpolation, again for numbers and matrices seperately.

This will be called in the `rasterize_triangle` function, which looks basically the same as in the triangle rasterizer.
Before calling the fragment shader, an object is filled with interpolations of vertex shader output attributes using the already computed barycentric coordinates.
You can have a look at the changes here:

```js -rasterize_triangle
/**
 * 
 * @param {Pipeline} pipeline The pipeline to use
 * @param {AbstractMat} v0 The first vertex
 * @param {AbstractMat} v1 The second vertex
 * @param {AbstractMat} v2 The third vertex
 * @param {Object<Number|AbstractMat>} data_v0 The attributes for the first vertex
 * @param {Object<Number|AbstractMat>} data_v1 The attributes for the second vertex
 * @param {Object<Number|AbstractMat>} data_v2 The attributes for the third vertex
 * @returns 
 */
rasterize_triangle(pipeline, v0, v1, v2,
    data_v0 = {}, data_v1 = {}, data_v2 = {}) {
  // compute triangle screen bounds
  let points = [v0, v1, v2];
  let [bmin, bmax] = this.compute_screen_bounds(points);

  // pixel coordinates of bounds
  let ibmin = floor(bmin);
  let ibmax = ceil(bmax);

  const viewport = pipeline.viewport;

  const viewport_max = vec2(viewport.x + viewport.w - 1, viewport.y + viewport.h - 1);
  const viewport_min = vec2(viewport.x, viewport.y);
  // clamp bounds so they lie inside the image region
  cwiseMax(ibmin, viewport_min, ibmin);
  cwiseMin(ibmax, viewport_max, ibmax);

  // handle case where its fully outside
  if (isAny(ibmin, viewport_max, (a, b) => a > b) ||
      isAny(ibmax, viewport_min, (a, b) => a < b)) {
    return;
  }

  // interpolated data buffer
  const data = {};

  // gather attributes
  for (let i in data_v0) {
    if (!data_v1[i] || !data_v2[i]) {
      continue;
    }
    data[i] = null;
  }
  const program = pipeline.program;

  // compute the double triangle area only once
  const area_tri = this.signed_tri_area_doubled(v0, v1, v2);

  // check if any the triangle has zero area with some epsilon, if so, don't rasterize
  const epsilon = 1E-8;
  if (Math.abs(area_tri) < epsilon) {
    return;
  }

  // check all pixels in screen bounding box
  for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
    for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
      // sample point in center of pixel
      const p = add(vec2(x, y), vec2(0.5, 0.5));

      let v = this.signed_tri_area_doubled(v2, v0, p);
      v /= area_tri;
      if (v + epsilon < 0.0) {
        continue;
      }

      let w = this.signed_tri_area_doubled(v0, v1, p);
      w /= area_tri;
      if (w + epsilon < 0.0) {
        continue;
      }

      let u = 1.0 - v - w;
      if (u + epsilon < 0.0) {
        continue;
      }

      // barycentric coordinate
      const b = v32.from([u, v, w]);

      // interpolate values
      for (let i in data) {
        data[i] = this.interpolate_triangle(data_v0[i], data_v1[i],
            data_v2[i], b);
      }

      // run  fragment shader with data
      const frag_coord = vec4(x, y, 0.0, 1.0);
      // run  fragment shader with data
      const output_colors = {};

      const do_write_fragment =
          program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

      if (do_write_fragment) {
        this.write_fragment(pipeline, frag_coord, output_colors);
      }
    }
  }
}
```

Before we get to implementing the function, a few words about what you will see.

One of the most important use cases for the attribute interpolation on triangles are texture  coordinates.
Basically, you have an image, the texture, that you want to draw on top of a triangle.
To do that, you define for each vertex where that it would be on the image.
These coordinates are then interpolated and you can use them to look up the color in the image.

Generally, these image/texture coordinates are normalized in $[0,1]^2$, so they don't depend on resolution and we call them **uv** coordinates.

We have included a function to sample an image with these coordinates.

```js
/**
 * Samples an image at a given coordinate
 * @param {Image} img The image to be sampled
 * @param {Abstractmat} uv The uv coordinate in [0,1]^2
 * @param {Object} param Additional parameters
 * @returns AbstractMat The color at the requested position
 */
function sample(img, uv, { interpolation_mode = Interpolation.NEAREST, wrap_s = Wrapping.CLAMP_TO_EDGE, wrap_t = Wrapping.CLAMP_TO_EDGE } = {}) {...}
```

There are some additional parameters, to change how colors are interpolated and how edges are handled, but they don't matter too much for now.

We want to use that to put an image on our triangles!

For that we provide a field `tex` in the material of the objects and an attribute `uv` for the vertices.
We want our shaders to do the following:

1. Vertex shader

    1. Write the `uv` attribute into the output block
    2. Return the `Attribute.VERTEX` transformed by the `uniforms.M` matrix

2. Fragment shader

    1. Get the interpolated `uv` value from the `data` parameter
    2. If the material has a `tex` field, sample that texture with the `uv` coordinate and put that color into the output. Otherweise use the materials `color` field

We can now implement our first texture-mapped triangles!

As usual, the solution to cross-check is below.

**Exercise:**

* Implement the barycentric interpolation in `interpolate_triangle`
* Go to the `vertex_shader`

  * Store the `attributes[Attribute.UV]` with the name ´"uv"` in the outputs

* Go to the `fragment_shader`

  * Get the interpolated uv coordinate from `data`
  * If the material has a texture (`uniforms.material.tex`), multiply the color with the sampled texture

<!-- data-readOnly="false"-->
``` js +rasterizer
class RasterizerTutorial extends Rasterizer {
  /**
   * @brief Linearly interpolate three values on a triangle
   *
   * @param {AbstractMat | Number} a The first value
   * @param {AbstractMat | Number} b The second value
   * @param {AbstractMat | Number} c The third value
   * @param {AbstractMat} barycentric The barycentric weights for each value
   * @return The interpolated value
   */
  interpolate_triangle(a, b, c, barycentric) {
    // Differentiate between numbers and vectors due to missing operator overload
    // we simplify here and assume b to be the same type as a
    if (typeof (a) === 'number') {
      // *******************************
      // TODO
      // *******************************
      // compute the barycentric interpolation for a number
      return a;
    } else {
      // Otherwise assume the parameters to be vectors/matrices

      // Note that we could be more efficient by using temporary vectors in 
      // which the add/scale operations are stored in. This form is chosen 
      // to be the direct translation of the number version

      // *******************************
      // TODO
      // *******************************
      // compute the barycentric interpolation for a matrix
      return a;
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js +shaders
const vertex_shader = (attributes, uniforms, outputs) => {
  // *******************************
  // TODO
  // *******************************
  // store the "uv" attribute in the outputs so it gets interpolated

  // transform the vertices
  return mult(uniforms.M,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  let color = uniforms.material.color;

  // *******************************
  // TODO
  // *******************************
  // sample the texture stored in uniforms.materials.tex with the uv data, if the texture exists
  
  output_colors[0] = color;
  
  return true;
};
```
<!-- data-readOnly="false"-->
``` js -scene
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

{
  const geom = create_plane_geometry_xy();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(2.0 * img.w / 7.0, img.h / 2.0, 0.0), scale : vec3(img.w / 7.0,img.w / 7.0,img.w / 7.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : rand_tex,
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_plane_geometry_xy();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(4.0 * img.w / 7.0, img.h / 2.0, 0.0), scale : vec3(img.w / 7.0,img.w / 7.0,img.w / 7.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : checkerboard,
    }
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const program = { vertex_shader, fragment_shader };

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('attrib_interp_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r06.Rasterizer;
const Pipeline = r06.Pipeline;
const Framebuffer = r06.Framebuffer;

@input(0)
@input(1)
@input(2)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="attrib_interp_container_0"></div>
@mutate.remover(attrib_interp_container_0)

**Solution:**

<!-- data-readOnly="false"-->
``` js -rasterizer
class RasterizerTutorial extends Rasterizer {
  /**
   * @brief Linearly interpolate three values on a triangle
   *
   * @param {AbstractMat | Number} a The first value
   * @param {AbstractMat | Number} b The second value
   * @param {AbstractMat | Number} c The third value
   * @param {AbstractMat} barycentric The barycentric weights for each value
   * @return The interpolated value
   */
  interpolate_triangle(a, b, c, barycentric) {
    // Differentiate between numbers and vectors due to missing operator overload
    // we simplify here and assume b to be the same type as a
    if (typeof (a) === 'number') {
      return a * barycentric.at(0) + b * barycentric.at(1) + c * barycentric.at(2);
    }
    else {
      // Otherwise assume the parameters to be vectors/matrices

      // Note that we could be more efficient by using temporary vectors in 
      // which the add/scale operations are stored in. This form is chosen 
      // to be the direct translation of the number version
      return add(scale(a, barycentric.at(0)),
        add(scale(b, barycentric.at(1)), scale(c, barycentric.at(2))));
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -shaders
const vertex_shader = (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  
  return mult(uniforms.M,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  let color = uniforms.material.color;

  if(uniforms.material.tex) {
    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);
  }
  
  output_colors[0] = color;
  
  return true;
};
```
<!-- data-readOnly="false"-->
``` js -scene
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

{
  const geom = create_plane_geometry_xy();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(2.0 * img.w / 7.0, img.h / 2.0, 0.0), scale : vec3(img.w / 7.0,img.w / 7.0,img.w / 7.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : rand_tex,
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_plane_geometry_xy();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(4.0 * img.w / 7.0, img.h / 2.0, 0.0), scale : vec3(img.w / 7.0,img.w / 7.0,img.w / 7.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : checkerboard,
    }
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const program = { vertex_shader, fragment_shader };

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('attrib_interp_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r06.Rasterizer;
const Pipeline = r06.Pipeline;
const Framebuffer = r06.Framebuffer;

@input(0)
@input(1)
@input(2)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));


for(let i = 0; i < geoms.length;i++)
{
    const gi = geoms[i];
    pipeline.uniform_data.M = gi.local_to_world;
    pipeline.uniform_data.material = gi.material;

    raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="attrib_interp_container_1"></div>
@mutate.remover(attrib_interp_container_1)

## 07: Perspective and depth

In this section we will finally advance to the third dimension!

In order to do that we need to define how we describe our vision, the camera looking at a scene.

This includes placing the camera in the world and having it look somewhere, as well as a simplified model of how our eyes and real cameras work.

You can find the full rasterization code here: [Rasterizer 07](./rasterizer/src/stages/07_perspective/rasterizer.js)

### Defining the camera position

When displaying a 3D scene, we need to think about how such an image is formed.
The obvious model is our own vision, although having two eyes is a bit more complicated.
So we make it simpler and go for a camera, with a single image sensor.

The first thing we need to answer is, how to place the camera in the 3D world and how to describe that mathematically.

A common way to describe a camera is by specifying three values:

1. $\mathbf{A}$: The position of the camera in the world
2. $\mathbf{C}$: The point the camera is pointing towards ("looking at")
3. $\mathbf{u}$: The "up"-vector, which describes which direction is the "up" direction in our model. Usually, the $y$-axis is chosen

The basic idea is to compute the coordinates of each object vertex in the coordinate system described by our camera. 
This involves two steps.
The first step is to make our camera the new origin of the coordinates. This is actually pretty easy and we already covered the operation before: A translation by $-\mathbf{A}$: $\mathbf{T}(-\mathbf{A})$.
This will move $\mathbf{A}$ to the origin and everything else will move relative to that.

Now we need to compute the coordinates of the moved points. This might sound hard, but it is actually pretty intuitive.
Let's say you have a coordinage system drawn out on a sheet of paper.
You now place a point somewhere on that paper. How do you find the $x$ and $y$ coordinates?
You draw a line perpendicular to the axis such that it goes through the point. This line of course also intersects the axis you draw it perpendicular too. To get the coordinate, you measure how far away that intersection is from the origin.

This is exactly the projection of the position vector of the point onto the axis (you "drop the position straight down onto the axis")!
How do we calculate this projection?
If our axis vector has a length of $1$, you may recall that the length of the projection is exactly the dot product of the vector and the axis!

So, given that we know the camera axes $\mathbf{x}^w,\mathbf{y}^w,\mathbf{z}^w$ in world space (the camera is placed in the world), we can find the camera coordinates of a point also in the world system $\mathbf{p}^w$ as:

$$
\begin{align*}
\mathbf{p}^c_x &= \mathbf{p}^w \cdot \mathbf{x}^w \\
\mathbf{p}^c_y &= \mathbf{p}^w \cdot \mathbf{y}^w \\
\mathbf{p}^c_z &= \mathbf{p}^w \cdot \mathbf{z}^w 
\end{align*}
$$

Now, if you recall how matrix multiplication works, this can be simply written as:

$$
\begin{align*}
\mathbf{p}^c &= \begin{pmatrix}(\mathbf{x}^w)^T \\ (\mathbf{y}^w)^T \\ (\mathbf{z}^w)^T\end{pmatrix} \mathbf{p}^w \\
&= \mathbf{R_c} \mathbf{p}^w
\end{align*}
$$

**Note:** If our axes are normalized and perpendicular and form a right-handed system, the matrix $\mathbf{R}_c$ will be a rotation matrix, satisfying $\mathbf{R}_c \mathbf{R}_c^T = \mathbf{I}$.

Also recall that we used matrices to transform the coordinates of points before, even if it was in 2D.
To compose multiple such transformations we just used matrix multiplication and we will do it this time again, we just need to once again make a $4\times 4$ matrix from $\mathbf{R}_c$ by putting it in the upper left part of a $4\times 4$ identity matrix.
With that we define the **View matrix** $\mathbf{V}$ as:

$$
    \mathbf{V} = \mathbf{R}_c \mathbf{T}(-\mathbf{A})
$$

This matrix will transform a point in the world's coordinate system into one in the camera's system!

As this does not change per model, we can for example put that into the uniform data as a constant.

What is missing is how we can compute the $\mathbf{x}^w,\mathbf{y}^w,\mathbf{z}^w$ axes.

For that we think about how our screen coordinates should work.
We want the $x$-axis to point to the right and the $y$ axis to point up, such that we can align it with the screen where the origin is the lower left. 

**Note:** This is the convention used in the OpenGL API, but others, such as Vulkan, are different and might have the $y$ axis point down. This isn't a big issues, you just need to be careful what definition is used.

If we use the "right-up" definition and want to stay with a right handed coordinate system, the $z$ axis has to point "out" of the screen, so the other direction of our viewing direction.
And this is where we start.

The camera looks from $\mathbf{A}$ to the point $\mathbf{C}$, so the normalized view direction is $\frac{\mathbf{C}- \mathbf{A}}{||\mathbf{C}-\mathbf{A}||}$. As mentioned, the $z$-axis points in the other direction, thus have:

$$
\mathbf{z} = \frac{\mathbf{C}- \mathbf{A}}{||\mathbf{C}-\mathbf{A}||}
$$

Now we want to compute the "right" axis: $x$. For that we use the up direction $\mathbf{u}$. 
We can think about it as a first guess on where the final $y$-axis will be. 
To get $x$ from $y$ and $z$, you compute $\mathbf{y} \times \mathbf{z}$. Using our up vector instead and normalizing we get our second axis:

$$
\mathbf{x} = \frac{\mathbf{u} \times \mathbf{z}}{||\mathbf{u} \times \mathbf{z}||}
$$

By the properties of the cross product, $\mathbf{x}$ and $\mathbf{z}$ are perpendicular. 
We now get the final vector as another cross product:

$$
\mathbf{y} = \mathbf{z} \times \mathbf{x}   
$$

Note, that we don't need to normalize, as the length of the cross product will be $||\mathbf{z} || || \mathbf{x} || \sin\alpha = 1 * 1 * 1  = 1$, since both vectors are normalized and perpendicular.

With that, we have found everything we need to define the position and orientation of a camera using the **View matrix** $\mathbf{V}$. We call the coordinate system defined this way the **view space**.

You can program this yourself or use the following function in code:

```js
/**
 * Computes a 4x4 view matrix for 3D space
 *
 * @param {AbstractMat} eye - The camera center
 * @param {AbstractMat} center - The point to look at
 * @param {AbstractMat} up - The up vector
 * @returns {Mat} The view matrix
 */
jsm.lookAt(eye, center, up);

// Example
// The camera is located at (-0.5,0,0) and looks to the origin (0,0,0) with (0,1,0) being the world's up direction
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
```

Next up we define how the camera itself works and represents how we see perspective.

### Defining the camera lens

We want to have a way to model how our eyes or a camera see the world to form a 2D image and apply that to our points.
The issue is, that even a very basic camera with a single lens has a lot of effect that are time consuming to represent exactly, like distortion or diffraction effects.

The good news is that we can simplify the model a lot and still get convincing results! The model that we use is called the pinhole camera model and you might even have built the real world version before: A [Camera obscura](https://en.wikipedia.org/wiki/Camera_obscura).

Our pinhole model is only different to the camera obscura in that it is for one ideal and on the other hand has the image plane in front of it rather than the back.
This way the image is not flipped, which wouldn't be much of a problem, but we would need to handle it.

If we take a sideways view, with the $z$-axis going to the right, the $x$ or $y$-axis going up and the image plane being $n$ units away from the center, the projection of a pinhole camera can be computed by similar triangles as:

$$
\begin{align*}
x' &= \frac{nx}{z}\\
y' &= \frac{ny}{z}\\
\end{align*}
$$

![Visualization of the pinhole camera model](./rasterizer/img/perspective_2d.png)

The basic idea now is the following: We already have our vectors with an additional extra dimension, where we put a $1$ in for points.
How about we construct a matrix that puts a the $z$ coordinate there instead? 
Now, this violates our definition, that all points need to have a $1$ in th last coordinate.
We can easily resolve that by just dividing by the last coordinate, which will then become $1$!

**Note:** This is actually all part of the so called projective space $\mathbb{P}(\mathbb{R}^3)$, where the last coordinate is the homogeneous coordinate.

And this is also equivalent to the formulas above for $x$ and $y$.

The simplest matrix to achieve this is the following:

$$
\begin{align*}
\mathbf{P} &= \begin{pmatrix} n & 0 & 0 & 0 \\0 & n & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 1 & 0\end{pmatrix} \\
\mathbf{P}\mathbf{p} &= \begin{pmatrix} n & 0 & 0 & 0 \\0 & n & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 1 & 0\end{pmatrix}\begin{pmatrix} x \\ y \\ z \\ 1\end{pmatrix} \\
&= \begin{pmatrix} nx \\ ny \\ z \\ z\end{pmatrix} 
\\ &\hat{=} \begin{pmatrix} \frac{nx}{z} \\ \frac{ny}{z} \\ 1 \\ 1\end{pmatrix} 
\end{align*}
$$

Now this would also remove our current $z$ value, which we will be needing as well.
The solution is to transform the $z$ value as well, so our wanted visible range stays between two values, the *near* and *far* plane.
We must also negate the $z$ values, since by our construction, $z$ points outside of the screen, but in the pinhole model it points forward.

There are some additional parts to take care of, but for the rasterization it doesn't actually matter that much.
If you are interested, this site thoroughly goes through the parts in the matrix, that defines our pinhole camera: [Songho](https://www.songho.ca/opengl/gl_projectionmatrix_mathml.html).

A very natural way of parametrizing this kind of projection is by specifying the viewing angle together with the near and far plane.
This defines a symmetric frustum, a viewing pyramid.

We can construct the matrix ourselves or use a predefined function:

```js
/**
 * Computes a 4x4 perspective matrix given a field of view
 *
 * Note: This includes a z-coordinate flip
 *
 * @param {number} fov - The full field of view
 * @param {number} aspect - The aspect ratio width/height
 * @param {number} near - The near plane
 * @param {number} far - The far plane
 * @returns {Mat} The perspective matrix
 */
jsm.perspective(fov, aspect, near, far)

// Example
// create a 120 degree perspective matrix for the image with aspect ration img.w/img.h
// Set the near and far plane to some arbitrary values that fit your scene, here 0.1 and 100
const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
```

Importantly, the perspective matrix is designed in such a way, that the visible volume (left to right, bottom to top, near to far) is mapped to the cube in $[-1,1]^3$ after perspective division (dividing by the last coordinate).

Before this division, we refer to the coordinate system as **clip space**. After the division, we call it **normalized device coordinates** or **NDC** for short.

Now, we can even visualize what happens, when we apply the matrix and the perspective division! How to we get the effect of perspective? Basically, we squish together our viewing frustum into a cube. On the screen, this will then look just like the way line are distorted in perspective. 
It does look like this:

![Visualization of the perspective frustum transform](./rasterizer/img/perspective_transform.png)

### The viewport

So far, all vertices where defined in such a way, that they are directly put onto the screen with pixel coordinates, either directly in coordinates or with transforms.

This isn't the nicest way generally, even in the 2D case. For example, if our screen changes resolution, we have to redefine all the vertices or transforms.
With the definition of the perspective matrix and the visible volume we have a sensible way to specify points. We use an abstract drawing surface which is specified in the range $[-1,1]^2$. We then additionally specify a viewport, a region of our actual drawing surface (window, canvas, ...) and transform all vertices from $[-1,1]^2$ to $[x_0,y_0]\times[x_0+w,y_0+h]$.
That way, we can easily change resolutions and even draw subimages onto our drawing surface by specifying the viewport origin ($x_0,y_0$) and the size ($w,h$).
It isn't really necessary, but in like in OpenGL, we will transform the depth ($z$) values as well, but just from $[-1,1]$ to $[0,1]$.

Now these transformations aren't that complicated. Here is how to get the $x$ coordinate transform as a sequence of transformations: $[-1,1] * \frac{1}{2} \Rightarrow  [-\frac{1}{2},\frac{1}{2}] + \frac{1}{2} \Rightarrow [0,1] * w \Rightarrow [0,w] + x_0 \Rightarrow [x_0, x_0 + w]$.

The full transformations from normalized device coordinates (NDC) to window coordinates (W) are thus given by:

$$
x_W = (\frac{1}{2} x_{\text{NDC}} + \frac{1}{2})w + x_0 \\
y_W = (\frac{1}{2} y_{\text{NDC}} + \frac{1}{2})h + y_0 \\
z_W = \frac{1}{2} z_{\text{NDC}} + \frac{1}{2}
$$

You can put that transform in a matrix or just write out the equations. And with that we have defined our viewport!

### Displaying 3D data
<!--
script: ./rasterizer/src/stages/07_perspective/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

Now that we have a way to represent the orientation and position as well as to model a perspective camera, we can start to actually display some 3D data.

The shader side doesn't actually require much change, we can just define the view and projection matrices and augment the shader from the previous section to use those.

On the pipeline side,there are two important things we have to add, but luckily most of our work is already done!
First off, we need to add the perspective division and viewport transform. We will just put that in its own function and call that in the line and triangle processing functions.

The other change involves clipping. One issue of our pinhole camera model is, that if we have points behind our camera, they will be projected to the front, but mirrored! Additionally, there is an issue with points on the plane containing the camera, since those points will have $0$ as homogeneous coordinates, which will cause issues in our code. The solution is to clip all our primitives at the near plane of our clipping volume. That way, all problematic cases won't even arrive at the final rendering. But we have to make sure, to do the clipping before the perspective division for that to work. 

It might sound like a difficult problem to clip the lines and triangles with their 4D coordinates, but as it turns out, the way we implemented everything so far allows us to do that without any change! We just have to specify the appropriate clipping planes. Usually, the whole clipping volume is clipped, but only one is really necessary to prevent the problematic cases: The near plane.

So in NDC the camera looks into the $z$ direction. Therefore the normal of our plane is $\begin{pmatrix}0\\0\\1\end{pmatrix}$, pointing to the inside. The plane is located at $z=-1$, thus the distance is $-1$, but by our definition of planes from the section about clipping, we need to negate the distance. The plane is thus defined by the 4D vector $\begin{pmatrix}0\\0\\1\\1 \end{pmatrix}$. 

We don't work in 3D though, but in 4D before the perspective divide. But the plane definition $\operatorname{d}(\mathbf{p}(t)) = 0$ doesn't change when we multiply by a number, for example the $w$ coordinate of our points. So this plane still works for homogeneous vectors!

So there is nothing new to implement for the clipping, we just add this plane by default to the clip planes.

We will see though, that there is still something weird happening, but that is for the next section, so don't worry, if it looks weird, compare it with the solution given below!

(Actually there will be two weird things, but one is more pressing, so we handle it first).

**Exercise:**

1. Add the near clipping plane (**done**)
2. Implement a perspective divide/viewport transform function in `viewport_transform`

    1. Call the function in `process_line` and `process_triangle` after the clipping for each point

3. Define the 3D Scene

    1. Define a 3D shape. We can use the `create_cube_geometry()` to create the geometry (**done**)
    2. Define view and projection matrices to place our camera (**done**)
    3. Add view and projection to our vertex shader and use them

<!-- data-readOnly="false"-->
``` js +rasterizer
class RasterizerTutorial extends Rasterizer {
  /**
   * Computes the viewport transform for a given point and viewport
   * @param {AbstractMat} p The point
   * @param {Object} viewport The viewport
   * @returns The transformed point
   */
  viewport_transform(p, viewport) {
    p = copy(p);
    
    // *******************************
    // TODO
    // *******************************

    // perspective division

    // Divide each component of p by the last one (w)
    // store 1/w in last component, as it will be needed later

    // *******************************
    // TODO
    // *******************************

    // viewport transform

    // apply the viewport transform
    // The viewport parameter contains the fields x,y for the viewport origin and w,h for the width and height

    // transform the point [-1,1]^3 into [x,y,0] x [x + w, y + h, 1]

    return p;
  }
    /**
   * Processes a single line
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
   * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
   */
  process_line(pipeline, v0, v1,
      attribs_v0 = {}, attribs_v1 = {}) {
    // prepare points and data for clipping
    let points = [v0, v1];
    let attribs = [attribs_v0, attribs_v1];
    // clip line
    [points, attribs] = this.clip_line(points, pipeline.clip_planes, attribs);

    // *******************************
    // Adding the viewport transform
    // *******************************
    for (let i = 0; i < points.length; i++) {
      points[i] = this.viewport_transform(points[i], pipeline.viewport);
    }
    // *******************************

    // finally rasterize line
    if (points.length === 2) {
      this.rasterize_line(pipeline, points[0], points[1], attribs[0], attribs[1]);
    }
  }

  /**
   * Processes a single triangle
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
   * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
   * @param {Object<Number|AbstractMat>} attribs_v2 The attributes of the third vertex
   */
  process_triangle(pipeline, v0, v1, v2,
    attribs_v0 = {}, attribs_v1 = {}, attribs_v2 = {}) {

    // prepare points and data for clipping
    let points = [v0, v1, v2];
    let attribs = [attribs_v0, attribs_v1, attribs_v2];
    // clip polygon
    [points, attribs] = this.clip_polygon(points, pipeline.clip_planes, attribs);

    // *******************************
    // Adding the viewport transform
    // *******************************
    for (let i = 0; i < points.length; i++) {
      points[i] = this.viewport_transform(points[i], pipeline.viewport);
    }
    // *******************************
    
    // triangulate polygon (clipping the triangle may result in non triangles
    // polygons) and rasterize
    for (let i = 0; i + 2 < points.length; i++) {
      this.rasterize_triangle(pipeline, points[0], points[i + 1], points[i + 2], attribs[0],
        attribs[i + 1], attribs[i + 2]);
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js +shaders
const vertex_shader = (attributes, uniforms, outputs) => {
  // *******************************
  // TODO
  // *******************************
  
  outputs["uv"] = attributes[Attribute.UV];

  // multiply the input point in attributes[Attribute.VERTEX] with the model-view-projection (MVP) matrix
  // the MVP matrix is stored as MVP in uniforms
  return attributes[Attribute.VERTEX];
};

// basic fragment shader that applies a color and texture to an object
const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  let color = uniforms.material.color;

  if(uniforms.material.tex) {
    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);
  }

  output_colors[0] = color;
              
  return true;
};
```
``` js +scene
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
    rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,0,0,1),
      tex : checkerboard
    }
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

// *******************************
// perspective and view matrices
// *******************************
const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
// *******************************
// compute the view projection matrix beforehand
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;
// we will also precompute the MVP matrix per model, which is P * V * M, where M is the model matrix of each object
// this matrix will be stored as MVP in the uniform_data
// *******************************

const program = { vertex_shader, fragment_shader };

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('perspective_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r07.Rasterizer;
const Pipeline = r07.Pipeline;
const Framebuffer = r07.Framebuffer;

@input(0)
@input(1)
@input(2)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
  pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
  pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="perspective_container_0"></div>
@mutate.remover(perspective_container_0)

Now, if you look at your solution (and the one provided below), you might be slightly confused by what you are seeing.
There is obviously a 3D effect going on, but it seems the shapes of the cubes are weirdly overlapping itself and each other.
The issue is caused by our current process: We go through each object and write the result into the image. But that results in things being drawn last showing up in the front. What we actually want is seeing the object that is "in front" in 3D to show up on the image and those that it occludes not showing up.

This will be fixed in the next section.


**Solution:**

<!-- data-readOnly="false"-->
``` js -rasterizer
class RasterizerTutorial extends Rasterizer {
/**
 * Computes the viewport transform for a given point and viewport
 * @param {AbstractMat} p The point
 * @param {Object} viewport The viewport
 * @returns The transformed point
 */
  viewport_transform(p, viewport) {
    p = copy(p);
    // perspective division
    // store 1/w in last components
    const w = p.at(3);
    for (let j = 0; j < 3; j++) {
      p.set(p.at(j) / w, j);
    }

    p.set(1.0 / w, 3);

    // viewport transform
    p.set(viewport.w / 2.0 * p.at(0) + viewport.w / 2.0 + viewport.x, 0);
    p.set(viewport.h / 2.0 * p.at(1) + viewport.h / 2.0 + viewport.y, 1);
    p.set(0.5 * (p.at(2) + 1.0), 2);

    return p;
  }
    /**
   * Processes a single line
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
   * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
   */
  process_line(pipeline, v0, v1,
    attribs_v0 = {}, attribs_v1 = {}) {
    // prepare points and data for clipping
    let points = [v0, v1];
    let attribs = [attribs_v0, attribs_v1];
    // clip line
    [points, attribs] = this.clip_line(points, pipeline.clip_planes, attribs);

    for (let i = 0; i < points.length; i++) {
      points[i] = this.viewport_transform(points[i], pipeline.viewport);
    }

    // finally rasterize line
    if (points.length === 2) {
      this.rasterize_line(pipeline, points[0], points[1], attribs[0], attribs[1]);
    }
  }

  /**
   * Processes a single triangle
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
   * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
   * @param {Object<Number|AbstractMat>} attribs_v2 The attributes of the third vertex
   */
  process_triangle(pipeline, v0, v1, v2,
    attribs_v0 = {}, attribs_v1 = {}, attribs_v2 = {}) {

    // prepare points and data for clipping
    let points = [v0, v1, v2];
    let attribs = [attribs_v0, attribs_v1, attribs_v2];
    // clip polygon
    [points, attribs] = this.clip_polygon(points, pipeline.clip_planes, attribs);

    for (let i = 0; i < points.length; i++) {
      points[i] = this.viewport_transform(points[i], pipeline.viewport);
    }

    // triangulate polygon (clipping the triangle may result in non triangles
    // polygons) and rasterize
    for (let i = 0; i + 2 < points.length; i++) {
      this.rasterize_triangle(pipeline, points[0], points[i + 1], points[i + 2], attribs[0],
        attribs[i + 1], attribs[i + 2]);
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -shaders
const vertex_shader = (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  let color = uniforms.material.color;

  if(uniforms.material.tex) {
    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);
  }

  output_colors[0] = color;
              
  return true;
};
```
``` js -scene
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
    rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,0,0,1),
      tex : checkerboard
    }
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

const program = { vertex_shader, fragment_shader };

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('perspective_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r07.Rasterizer;
const Pipeline = r07.Pipeline;
const Framebuffer = r07.Framebuffer;

@input(0)
@input(1)
@input(2)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
  pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
  pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="perspective_container_1"></div>
@mutate.remover(perspective_container_1)

### Adding depth
<!--
script: ./rasterizer/src/stages/07_perspective/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

As seen in the last section, there is currently an issue with some parts of objects showing up despite being behind other objects. This problem of eliminating parts of objects hidden by others (*Hidden Surface Removal*) can be tackled in a variety of ways.

Object space methods will try to order the objects in a way, such that when drawing them in order, the correct ones are shown. This is basically what you will do when painting, drawing the backgrounds first and then going to the foreground, which is why this is called the painter's algorithm. We will come back to this for transparency. There are some issues with it, mainly that such an order does not always exist. Some advanced techniques try to solve this issue, but they are pretty complex.

In pixel-based rasterizers, a much simpler approach is taken. The screen has a fixed resolution and we are producing our primitives inside of that constraint. So it doesn't bring us an advantage to have a (mathematically) perfect drawing order, if we can't see it anyways. The only point of an opaque object that we see is the closest one to the camera.

As we are looking in the $z$ direction, we can measure the closeness by just that $z$ coordinate. In window coordinates, they are in the range $[0,1]$ (of course, without far plane clipping, the upper limit is actually infinite, but that is just a technicality).

The idea is now: Use an additional buffer next to the ones for colors with the same size as your screen. Initialize it with the maximum distance to the camera. When we want to put a fragment into a pixel, we check, if the fragment's depth (the $z$ coordinate) is less than the one stored in the buffer at that pixel. If not, we have already put something there, that is closer to the camera and so the fragment won't be drawn. Otherwise, we can overwrite the current pixel and put the fragment's depth into the buffer. We call this buffer the **Depth buffer** or **Z-Buffer**.

Our framebuffer, that stores the currently used writing output will now contain an additional field: The depth buffer.

```js
class Framebuffer {
  constructor() {
    this.color_buffers = {};
    this.depth_buffer = null;
  }
  static new() {
    return new Framebuffer();
  }
}
```

The depth buffer is initialized as `null`, since we will make it optional. Sometimes you don't need it.

Additionally, we add some options to our pipeline object.

```js
function create_depth_options({
      enable_depth_test = false,
      enable_depth_write = true
    } = {}) {
  return {
      enable_depth_test,
      enable_depth_write
  };
}

class Pipeline {
  ...
  constructor(...){
    ...
    this.depth_options = create_depth_options();
    ...
  }
  ...
}
```

These options are `enable_depth_test` and `enable_depth_write` and allow us a great range of flexibility. We only do the depth test, if `enable_depth_test` is `true`. And we only allow writing into the depth buffer, if `enable_depth_write` is `true`.

That setup allows us for example to use already computed depth values for further tests but not update those values. You will see the application in the section for transparency.

When setting up our pipeline, we will create an additional image with one component which we attach as the depth buffer. Our buffer uses float values, but it is common to use integers (24bit integers even!).

When clearing the image at the beginning, we also fill the depth buffer with the highest value that we allow.

You can now implement the depth test logic into the `write_fragment` method. The solution is below.

**Exercise:**

* Implement the depth test in `write_fragment`

  * Follow the instructions in code

<!-- data-readOnly="false"-->
``` js +rasterizer
class RasterizerTutorial extends Rasterizer {
  /**
   * Writes a number of output colors and depth to the pipeline's framebuffer.
   * Might apply depth test/write operations
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} frag_coord The fragment coordinate
   * @param {Object<AbstractMat>} colors A map containing the colors per output buffer
   */
  write_fragment(pipeline, frag_coord, colors) {
    const px = floor(subvec(frag_coord, 0, 2));

    // contains the fields enable_depth_test and enable_depth_write
    const depth_options = pipeline.depth_options;
    // the depth buffer image
    const depth = pipeline.framebuffer.depth_buffer;

    // *******************************
    // depth test
    // TODO
    // *******************************
    // First check, if the depth test is enabled if the depth image exists (!== null)
    // If both of these conditions are true, check if the fragments z coordinate is greater than the value store in the image at the pixel coordinates. If so, we can return, since the fragment is not visible
    // Attention: All images return vectors, even if they only have one component. So you will need to use .at(0) to access the buffer value
    // *******************************
    // TODO
    // *******************************
    // If we are still in the function, the depth test passed. If the depth write is enabled, we can now put the fragment's depth value into the depth buffer
    // Attention: As with the images .at function, .set expects a vector. You can create a 1D vector from the value v with v32.from([v])
    // *******************************

    const frames = pipeline.framebuffer.color_buffers;

    for (let i in colors) {
      const frame = frames[i];
      if (!frame) {
        continue;
      }

      frame.set(colors[i], px.at(0), px.at(1));
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -shaders
const vertex_shader = (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  let color = uniforms.material.color;

  if(uniforms.material.tex) {
    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);
  }

  output_colors[0] = color;
              
  return true;
};
```
``` js -scene
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
    rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,0,0,1),
      tex : checkerboard
    }
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

const program = { vertex_shader, fragment_shader };

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

// *******************************
// add a depth buffer and enable depth test
// *******************************
fb.depth_buffer = Image.zero(img.w,img.h,1);
// we will fill it here, since we are only drawing a single image
fb.depth_buffer.fill(vec4(1,1,1,1));

pipeline.depth_options.enable_depth_test = true;
// *******************************

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('perspective_container_2');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r07.Rasterizer;
const Pipeline = r07.Pipeline;
const Framebuffer = r07.Framebuffer;

@input(0)
@input(1)
@input(2)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));


for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
  pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
  pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="perspective_container_2"></div>
@mutate.remover(perspective_container_2)


**Solution:**

<!-- data-readOnly="false"-->
``` js -rasterizer
class RasterizerTutorial extends Rasterizer {
  /**
   * Writes a number of output colors and depth to the pipeline's framebuffer.
   * Might apply depth test/write operations
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} frag_coord The fragment coordinate
   * @param {Object<AbstractMat>} colors A map containing the colors per output buffer
   */
  write_fragment(pipeline, frag_coord, colors) {
    const px = floor(subvec(frag_coord, 0, 2));

    // contains the fields enable_depth_test and enable_depth_write
    const depth_options = pipeline.depth_options;
    // the depth buffer image
    const depth = pipeline.framebuffer.depth_buffer;

    // *******************************
    // depth test
    // *******************************
    // First check, if the depth test is enabled if the depth image exists (!== null)
    // If both of these conditions are true, check if the fragments z coordinate is greater than the value store in the image at the pixel coordinates. If so, we can return, since the fragment is not visible
    // Attention: All images return vectors, even if they only have one component. So you will need to use .at(0) to access the buffer value
    if (depth_options.enable_depth_test && !!depth &&
        frag_coord.at(2) > depth.at(px.at(0), px.at(1)).at(0)) {
      return;
    }
    // *******************************
    // If we are still in the function, the depth test passed. If the depth write is enabled, we can now put the fragment's depth value into the depth buffer
    // Attention: As with the images .at function, .set expects a vector. You can create a 1D vector from the value v with v32.from([v])
    if (depth_options.enable_depth_write &&
        !!depth) {
      depth.set(v32.from([frag_coord.at(2)]), px.at(0), px.at(1));
    }
    // *******************************

    const frames = pipeline.framebuffer.color_buffers;

    for (let i in colors) {
      const frame = frames[i];
      if (!frame) {
        continue;
      }

      frame.set(colors[i], px.at(0), px.at(1));
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -shaders
const vertex_shader = (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  let color = uniforms.material.color;

  if(uniforms.material.tex) {
    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);
  }

  output_colors[0] = color;
              
  return true;
};
```
``` js -scene
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
    rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,0,0,1),
      tex : checkerboard
    }
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

const program = { vertex_shader, fragment_shader };

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

// *******************************
// add a depth buffer and enable depth test
// *******************************
fb.depth_buffer = Image.zero(img.w,img.h,1);
// we will fill it here, since we are only drawing a single image
fb.depth_buffer.fill(vec4(1,1,1,1));

pipeline.depth_options.enable_depth_test = true;
// *******************************

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('perspective_container_3');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

  // Import
const Rasterizer = r07.Rasterizer;
const Pipeline = r07.Pipeline;
const Framebuffer = r07.Framebuffer;

@input(0)
@input(1)
@input(2)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));


for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
  pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
  pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="perspective_container_3"></div>
@mutate.remover(perspective_container_3)

We now have functioning 3D images! As mentioned before, there is still something kinda weird. If you look closely at the textures, they don't really seem to follow the perspective and have some weird distortions around the diagonal.

This is what we will fix in the next section.

## 08: Perspective-corrected interpolation

After our move to 3D, objects realistically change shape according to perspective rules and how we look at them.
If you look closely, there is an issue though with the interpolation, which is very apparent with an applied texture that has a reguar pattern, such as the checkerboard.
If you are into retro games, you might have seen a similar phenomenon with PS1 games, where the textures seem to wobble around depending on how you look at it.
The main reason is this: We are using the barycentric coordinates from the rasterized triangles to interpolate attributes.
This works fine in 2D, since the triangle on the screen is the same one that we specified (disregarding things like scaling and translation for now), but in the process of converting the 3D triangles to the 2D ones, the shapes get distorded.
Moving one unit across the 2D rasterized triangle now does not generally correspond to moving one unit on the 3D triangle.
But our attributes are supposed to vary linearly on the 3D triangle surface!
This is the problem, that this section will try to solve.

You can find the full rasterization code here: [Rasterizer 08](./rasterizer/src/stages/08_persp_interp/rasterizer.js)

### Getting back from 2D to 3D (indirectly)

To solve our problem, we will first look at what happens, if we project an interpolated point onto the screen. With that knowledge, we can try to get the other way around, since we mostly only have screen triangle information.

First some notation. We will keep track of the homogeneous coordinate seperately. The input primitive points will be called $\begin{pmatrix}\mathbf{a}_i \\ 1\end{pmatrix}$. We use an index so our formulas can work for any interpolation, so for $i=1,2$, we have a line and for $i=1,2,3$ we have a triangle. But you could also do polygons with more than three vertices!

The interpolation parameters are likewise indexed and called $s_i$. By definition, they should sum to $1$, so 
$$
\sum_i s_i = 1
$$

A point $\begin{pmatrix}\mathbf{b} \\ 1\end{pmatrix}$ on the line/triangle/... can be represented by an interpolation of the vertices:

$$
 \begin{pmatrix}\mathbf{b} \\ 1\end{pmatrix} = \sum_i s_i \begin{pmatrix}\mathbf{a}_i \\ 1\end{pmatrix}
$$

And if we have any data $d_i$ defined at the vertices, they use the same sets of parameters that are used for the point:

$$
 d_b = \sum_i s_i d_i
$$

We don't want to get caught up in too much details, so we will just use a general projection matrix specified by $\mathbf{P}$. This could also include other transformations, but we don't need to care about that now.

Now we turn to the screen space. We will just add a small $'$ to the names to specify that they are in screen space, so $\begin{pmatrix}\mathbf{a}_i' \\ 1\end{pmatrix}$ is the projection of $\begin{pmatrix}\mathbf{a}_i \\ 1\end{pmatrix}$ after the perspective division. But from before, we know that homogeneous pointsare the same when we multiply them by a scalar. Before the perspective divide, they will have a homogeneous component, which we will just call $w$ with a subscript describing the associated point. So we have for example:

$$
\begin{pmatrix}\mathbf{a}_i' \\ 1\end{pmatrix} = \begin{pmatrix}\mathbf{a}_i' w_{a,i} \\ w_{a,i}\end{pmatrix}
$$

Let us now calculate the projection of our point.

$$
\begin{align*}
\mathbf{P} \begin{pmatrix}\mathbf{b} \\ 1\end{pmatrix} &= \begin{pmatrix}\mathbf{b}' \\ 1\end{pmatrix} \\
 \mathbf{P} \sum_i s_i \begin{pmatrix}\mathbf{a}_i \\ 1\end{pmatrix}&= \begin{pmatrix}\mathbf{b}' w_b \\ w_b\end{pmatrix} \\
 \sum_i s_i \mathbf{P}\begin{pmatrix}\mathbf{a}_i \\ 1\end{pmatrix} &= \begin{pmatrix}\mathbf{b}' w_b \\ w_b\end{pmatrix} \\
 \sum_i s_i \begin{pmatrix}\mathbf{a}_i' \\ 1\end{pmatrix} &= \begin{pmatrix}\mathbf{b}' w_b \\ w_b\end{pmatrix} \\
 \sum_i s_i  \begin{pmatrix}\mathbf{a}_i' w_{a,i} \\ w_{a,i}\end{pmatrix} &= \begin{pmatrix}\mathbf{b}' w_b \\ w_b\end{pmatrix} \\
\end{align*}
$$

We will split that equation into the vector and the homogeneous part, and get our first intermediate results:

$$
\begin{align*}
 \sum_i s_i  \mathbf{a}_i' w_{a,i} &=\mathbf{b}' w_b  \\
 \sum_i \frac{s_i w_{a,i}}{w_b}  \mathbf{a}_i'  &=\mathbf{b}'   \\
\sum_i s_i' \mathbf{a}_i'  &=\mathbf{b}'   
\end{align*}
$$

$$
\begin{align*}
 \sum_i s_i  w_{a,i} &= w_b 
\end{align*}
$$

We found the screenspace interpolation parameters $s_i'$! During rasterization, these are computed, but we need the original parameters to interpolate the vertex data! For that we just start by inverting $s_i'$.

$$
\begin{align*}
 s_i' &= \frac{s_i w_{a,i}}{w_b}\\
 \frac{s_i' w_b}{w_{a,i}} &= s_i
\end{align*}
$$

From above, we also know the expression for $w_b$, but that contains the original interpolation parameters $s_i$ again. But we know, that they sum to $1$, which we can use to get a new expression for $w_b$.

$$
\begin{align*}
\sum_i  s_i &= 1\\
 \sum_i \frac{s_i' w_b}{w_{a,i}} &= 1 \\
 w_b\sum_i \frac{s_i' }{w_{a,i}} &= 1 \\
 w_b &= \frac{1}{\sum_i \frac{s_i' }{w_{a,i}}} \\
\end{align*}
$$

We can plug that back in and now have an expression that only depends on the screenspace interpolation parameters $s_i'$ and the homogeneous vertex coordinates!

$$
\begin{align*}
s_i &=  \frac{s_i' w_b}{w_{a,i}} \\
    &=  \frac{ \frac{s_i'}{w_{a,i}}}{\sum_i \frac{s_i' }{w_{a,i}}}
\end{align*}
$$

So basically, we divide the screenspace parameters by the corresponding homogeneous coordinates and normalize them by dividing each by the total sum. With that, we can correctly interpolate any kind of data on a perspectively distorted objects!

This result also allows us to find some additional interesting properties!

First of all, what happens, if we don't have a perspective matrix, but for example rotation, scaling or translation? In that case, all $w_{a,i} = 1$. With that and the property, that the parameters sum to $1$, the expression just becomes:

$$
\begin{align*}
s_i &=  \frac{ \frac{s_i'}{w_{a,i}}}{\sum_i \frac{s_i' }{w_{a,i}}}\\
    &= \frac{ s_i'}{\underbrace{\sum_i s_i'}_{=1}} \\
    &=  s_i'
\end{align*}
$$

So for affine transformations, we do not need to change the parameters at all!

One additional very important property concerns the depth, since we use it for the depth buffer. Turns out, that the projection operation allows for a very nice way to get the depth of the projected point. (**Note:** This is not the depth of the 3D point! You could of course use our interpolation formulat with the vertex $z$ coordinate, but a linear depth buffer will likely encounter some precision issues in regions that you don't want them in).

Let's see what happens, if we use the $z$ coordinate of our points after the perspective division. We can write this as $\frac{z_{a,i}}{w_{a,i}}$, since we divided by the last coordinate. $z_{a,i}$ is just the $z$ coordinate after multiplying by $\mathbf{P}$. We plug this into the screenspace interpolation:

$$
\begin{align*}
\sum_i s_i' \frac{z_{a,i}}{w_{a,i}} &= \sum_i \frac{s_i w_{a,i}}{w_b} \frac{z_{a,i}}{w_{a,i}} \\
 &= \sum_i \frac{s_i z_{a,i}}{w_b} \\
  &=  \frac{\sum_i s_i z_{a,i}}{w_b} \\
  &=  \frac{z_b}{w_b}
\end{align*}
$$

The last last line results from the fact, that the $z$ value of the interpolated point is just the linear combination from the multiplied vertex $z$s. But the last line is also exactly the $z$ coordinate of the interpolated point after the perspective division!

So we actually have to interpolate the $z$ values of the vertices after the perspective division with the screen space parameters, **not** the original ones!

With this we have everything we need! We can interpolate data on our lines and triangles and get the correct depth value for each fragment. While we interpolate the 3D values, we don't actually have to leave our rasterized world, but can just adjust the interpolation parameters to take into account the distortion.

Next up, we can put this into our code!

### Implementing the corrected interpolation
<!--
script: ./rasterizer/src/stages/08_persp_interp/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

For our implementation, let us explicitely write out the updated interpolation parameters for lines and triangles, as we only have these two primitives. First, let's restate the generic form.

$$
s_i =  \frac{ \frac{s_i'}{w_{a,i}}}{\sum_i \frac{s_i' }{w_{a,i}}}
$$

We will try to follow the same naming for the primitives as we have used when we first interpolated attributes. The line is defined by two points $\mathbf{A}$ and $\mathbf{B}$. We already have to code to compute the interpolation parameter in screenspace $t'$.

So the parameters are:

$$
\begin{align*}
    s_1' &= t' \\
    s_2' &= 1 - t' \\
    w &= \frac{t' }{w_{\mathbf{A}}} + \frac{1-t'}{w_{\mathbf{B}}} \\
    s_1 &= \frac{ \frac{t'}{w_{\mathbf{A}}}}{w} \\
    s_2 &= \frac{ \frac{1-t'}{w_{\mathbf{B}}}}{w}
\end{align*}
$$

So the overall interpolation formula for data $d_{\mathbf{A}}, d_{\mathbf{B}}$ is thus:

$$
\begin{align*}
    d &= s_1 d_{\mathbf{A}} + s_2 d_{\mathbf{B}} \\
    &= \frac{1}{\frac{t' }{w_{\mathbf{A}}} + \frac{1-t'}{w_{\mathbf{B}}}} (d_{\mathbf{A}} \frac{t'}{w_{\mathbf{A}}} + d_{\mathbf{B}}\frac{1-t'}{w_{\mathbf{B}}})
\end{align*}
$$

We do the same for the triangle with points $\mathbf{A}, \mathbf{B}, \mathbf{C}$ and the barycentric coordinates in screenspace $a',b', c'$.

$$
\begin{align*}
    s_1' &= a' \\
    s_2' &= b' \\
    s_2' &= c' \\
    w &= \frac{a' }{w_{\mathbf{A}}} + \frac{b'}{w_{\mathbf{B}}} + \frac{c'}{w_{\mathbf{C}}}\\
    s_1 &= \frac{ \frac{a'}{w_{\mathbf{A}}}}{w} \\
    s_2 &= \frac{ \frac{b'}{w_{\mathbf{B}}}}{w} \\
    s_3 &= \frac{ \frac{c'}{w_{\mathbf{B}}}}{w}
\end{align*}
$$

And the complete interpolation formula:

$$
\begin{align*}
    d &= s_1 d_{\mathbf{A}} + s_2 d_{\mathbf{B}} + s_3 d_{\mathbf{C}} \\
    &= \frac{1}{\frac{a' }{w_{\mathbf{A}}} + \frac{b'}{w_{\mathbf{B}}} + \frac{c'}{w_{\mathbf{C}}}} (d_{\mathbf{A}}\frac{a'}{w_{\mathbf{A}}} + d_{\mathbf{B}}\frac{b'}{w_{\mathbf{B}}} + d_{\mathbf{C}}\frac{c'}{w_{\mathbf{C}}})
\end{align*}
$$

Generally, shaders/graphic APIs will allow you to specify per attribute whether it will be interpolated according to the screen or corrected for perspective. For example, the `noperspective` qualifier will turn off perspective correction for shader outputs in GLSL. For simplicity, we will make this option a per rendercall operation and expose the interpolation behavior as a pipeline option.

```js
const AttributeInterpolation = { LINEAR: 0, PERSPECTIVE_CORRECTED: 1 };

class Pipeline {
  ...
  constructor(...) {
    ...
    this.attribute_interpolation =  AttributeInterpolation.PERSPECTIVE_CORRECTED;
    ...
  }
  ...
}
```

We will define the methods `interpolate_line_perspective` and `interpolate_triangle_perspective` which are the analogs of the interpolation methods we have created before, just with the correction. These are called in the `rasterize_line` `rasterize_triangle` methods depending on the value of `pipeline.attribute_interpolation`. Since this is just a simple condition, it is already implemented, but you can have a look at the change in the code.

The solution can be found below, as usual.

**Exercise:**

* Implement the perpective corrected line interpolation in `interpolate_line_perspective` according to $s_i =  \frac{ \frac{s_i'}{w_{a,i}}}{\sum_i \frac{s_i' }{w_{a,i}}}$
* Implement the perpective corrected triangle interpolation in `interpolate_triangle_perspective` according to $s_i =  \frac{ \frac{s_i'}{w_{a,i}}}{\sum_i \frac{s_i' }{w_{a,i}}}$

<!-- data-readOnly="false"-->
``` js +rasterizer
const AttributeInterpolation = { LINEAR: 0, PERSPECTIVE_CORRECTED: 1 };

class RasterizerTutorial extends Rasterizer {
  /**
   * @brief Linearly interpolate three values on a triangle with perspective
   * correction
   *
   * @param a The first value
   * @param b The second value
   * @param c The third value
   * @param inv_wa 1/w at the first point
   * @param inv_wb 1/w at the second point
   * @param inv_wc 1/w at the third point
   * @param barycentric The barycentric weights in window space
   * @return The interpolated value
   */
  interpolate_triangle_perspective(a, b, c,
      inv_wa, inv_wb, inv_wc,
      barycentric) {
      // *******************************
      // TODO
      // interpolate the triangle attributes accordint to the perspective correction
      // we pass in the inverse w coordinates directly
      // *******************************
      // As before, due to missing operator overloading, we will have to implement the formula twice, once for numbers and once for vectors/matrices
      // *******************************

      // placeholder -> return the first attribute
      return a;    
  }

  /**
   * @brief Linearly interpolate two values with perspective correction
   *
   * @param a The first value
   * @param b The second value
   * @param inv_wa 1/w at the first point
   * @param inv_wb 1/w at the second point
   * @param t The interpolation parameter window space
   * @return The interpolated value
   */
  interpolate_line_perspective(a, b, inv_wa,
      inv_wb, t) {
      // *******************************
      // TODO
      // interpolate the line attributes accordint to the perspective correction
      // we pass in the inverse w coordinates directly
      // *******************************
      // As before, due to missing operator overloading, we will have to implement the formula twice, once for numbers and once for vectors/matrices
      // *******************************

      // placeholder -> return the first attribute
      return a;
  }

  /**
   * Rasterize a line
   * @param {AbstractMat} a 
   * @param {AbstractMat} b 
   * @param {Object<Number|AbstractMat>} data_a 
   * @param {Object<Number|AbstractMat>} data_b 
   */
  rasterize_line(pipeline, a, b,
      data_a = {},
      data_b = {}) {
      // clip
      const clipped = this.clip_screen(a, b, vec2(pipeline.viewport.x, pipeline.viewport.y), vec2(pipeline.viewport.x + pipeline.viewport.w - 1, pipeline.viewport.y + pipeline.viewport.h - 1));
      if (clipped.length === 0) {
          return;
      }

      const program = pipeline.program;

      // interpolated data buffer
      const data = {};

      // gather attributes
      for (let i in data_a) {
          if (!data_b[i]) {
              continue;
          }
          data[i] = null;
      }

      // Bresenham/midpoint line drawing algorithm
      // operates on pixels
      const p0 = clipped[0];
      const p1 = clipped[1];
      const a2d = copy(subvec(a, 0, 2));
      const b2d = copy(subvec(b, 0, 2));

      const ldelta = sub(b2d, a2d);

      // precompute this value, since we will use it later
      const ldelta2 = dot(ldelta, ldelta);

      // Bresenham works in integer coordinates
      let x0 = Math.floor(p0.at(0));
      let y0 = Math.floor(p0.at(1));

      let x1 = Math.floor(p1.at(0));
      let y1 = Math.floor(p1.at(1));

      // Bresenham is only defined in the first 2D octant
      // To make it work for the others, we reorder things, so they are in that
      // first octant. In the end we have to undo some of that

      // slope > 1 -> flip x and y
      let transposed = false;
      if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
          transposed = true;
          [x0, y0] = [y0, x0];
          [x1, y1] = [y1, x1];
      }

      // going from right to left -> flip first and second point
      // doesn't actually change the line, so no later inversion needed
      if (x1 < x0) {
          [x0, x1] = [x1, x0];
          [y0, y1] = [y1, y0];
      }

      const dx = x1 - x0;
      const dy = Math.abs(y1 - y0);

      let y = y0;
      let m = dy / dx;
      if (y1 < y0) {
          m = -m;
      }

      for (let x = x0; x <= x1; x++) {
          let px = vec2(x, y);

          // flip x and y for the actual coordinate if they were flipped before
          if (transposed) {
              px = vec2(y, x);
          }

          // move px to pixel center
          add(px, vec2(0.5, 0.5), px);

          // compute interpolation paramter along line
          // this is the projection of the pixel center on the line
          let t = ldelta2 !== 0.0 ? dot(sub(px, a2d), ldelta) / ldelta2 : 0.0;
          // as we are dealing with pixels and not the line itself -> clamp just
          // to be sure
          t = Math.max(0.0, Math.min(1.0, t));

          // interpolate values
          for (let i in data) {

              // *******************************
              // We choose either linear or perspective interpolation, depending on the setting
              // *******************************
              if (pipeline.attribute_interpolation === AttributeInterpolation.LINEAR) {
                  data[i] = this.interpolate_line(data_a[i], data_b[i], t);
              } else {
                  data[i] = this.interpolate_line_perspective(data_a[i], data_b[i],
                      a.at(3), b.at(3), t);
              }
              // *******************************
          }

          // depth values (after perspective division!) can be linearly
          // interpolated
          const frag_z = this.interpolate_line(a.at(2), b.at(2), t);
          // w contains 1/w before perspective division which can also be linearly
          // interpolated
          const frag_w = this.interpolate_line(a.at(3), b.at(3), t);
          // the final fragment coordinate
          const frag_coord = vec4(px.at(0), px.at(1), frag_z, frag_w);
          // run  fragment shader with data

          // buffer for colors
          const output_colors = {};


          const do_write_fragment =
              program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

          if (do_write_fragment) {
              this.write_fragment(pipeline, frag_coord, output_colors);
          }

          y += m;

      }


  }

  /**
  * 
  * @param {Pipeline} pipeline The pipeline to use
  * @param {AbstractMat} v0 The first vertex
  * @param {AbstractMat} v1 The second vertex
  * @param {AbstractMat} v2 The third vertex
  * @param {Object<Number|AbstractMat>} data_v0 The attributes for the first vertex
  * @param {Object<Number|AbstractMat>} data_v1 The attributes for the second vertex
  * @param {Object<Number|AbstractMat>} data_v2 The attributes for the third vertex
  * @returns 
  */
  rasterize_triangle(pipeline, v0, v1, v2,
      data_v0 = {}, data_v1 = {}, data_v2 = {}) {
    // compute triangle screen bounds
    let points = [v0, v1, v2];
    let [bmin, bmax] = this.compute_screen_bounds(points);
    // pixel coordinates of bounds
    let ibmin = floor(bmin);
    let ibmax = ceil(bmax);

    const viewport = pipeline.viewport;

    const viewport_max = vec2(viewport.x + viewport.w - 1, viewport.y + viewport.h - 1);
    const viewport_min = vec2(viewport.x, viewport.y);
    // clamp bounds so they lie inside the image region
    cwiseMax(ibmin, viewport_min, ibmin);
    cwiseMin(ibmax, viewport_max, ibmax);

    // handle case where its fully outside
    if (isAny(ibmin, viewport_max, (a, b) => a > b) ||
        isAny(ibmax, viewport_min, (a, b) => a < b)) {
      return;
    }

    // interpolated data buffer
    const data = {};

    // gather attributes
    for (let i in data_v0) {
      if (!data_v1[i] || !data_v2[i]) {
        continue;
      }
      data[i] = null;
    }
    // buffer for colors

    const program = pipeline.program;

    // compute the double triangle area only once
    const area_tri = this.signed_tri_area_doubled(v0, v1, v2);

    // check if any the triangle has zero area with some epsilon, if so, don't rasterize
    const epsilon = 1E-8;
    if (Math.abs(area_tri) < epsilon) {
      return;
    }

    // check all pixels in screen bounding box
    for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
      for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
        // sample point in center of pixel
        const p = add(vec2(x, y), vec2(0.5, 0.5));

        let v = this.signed_tri_area_doubled(v2, v0, p);
        v /= area_tri;
        if (v + epsilon < 0.0) {
          continue;
        }

        let w = this.signed_tri_area_doubled(v0, v1, p);
        w /= area_tri;
        if (w + epsilon < 0.0) {
          continue;
        }

        let u = 1.0 - v - w;
        if (u + epsilon < 0.0) {
          continue;
        }

        const b = v32.from([u, v, w]);

        // interpolate values
        for (let i in data) {
          // *******************************
          // We choose either linear or perspective interpolation, depending on the setting
          // *******************************
          if (pipeline.attribute_interpolation == AttributeInterpolation.LINEAR) {
            data[i] = this.interpolate_triangle(data_v0[i], data_v1[i], data_v2[i], b);
          } else {
            data[i] = this.interpolate_triangle_perspective(
              data_v0[i], data_v1[i], data_v2[i], v0.at(3), v1.at(3), v2.at(3), b);
          }
          // *******************************
        }
        // depth values (after perspective division!) can be linearly
        // interpolated
        const frag_z = this.interpolate_triangle(v0.at(2), v1.at(2), v2.at(2), b);
        // w contains 1/w before perspective division which can also be
        // linearly
        // interpolated
        const frag_w = this.interpolate_triangle(v0.at(3), v1.at(3), v2.at(3), b);
        // run  fragment shader with data
        const frag_coord = vec4(x, y, frag_z, frag_w);
        // run  fragment shader with data
        const output_colors = {};

        const do_write_fragment =
            program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

        if (do_write_fragment) {
          this.write_fragment(pipeline, frag_coord, output_colors);
        }
      }
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -shaders
const vertex_shader = (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  let color = uniforms.material.color;

  if(uniforms.material.tex) {
    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);
  }

  output_colors[0] = color;
              
  return true;
};
```
``` js -scene
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
    rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,0,0,1),
      tex : checkerboard
    }
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

const program = { vertex_shader, fragment_shader };

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

fb.depth_buffer = Image.zero(img.w,img.h,1);
fb.depth_buffer.fill(vec4(1,1,1,1));

pipeline.depth_options.enable_depth_test = true;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('perspective_attrib_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r08.Rasterizer;
const Pipeline = r08.Pipeline;
const Framebuffer = r08.Framebuffer;

@input(0)
@input(1)
@input(2)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
  pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
  pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="perspective_attrib_container_0"></div>
@mutate.remover(perspective_attrib_container_0)


**Solution:**


<!-- data-readOnly="false"-->
``` js -rasterizer
const AttributeInterpolation = { LINEAR: 0, PERSPECTIVE_CORRECTED: 1 };

class RasterizerTutorial extends Rasterizer {
  /**
   * @brief Linearly interpolate three values on a triangle with perspective
   * correction
   *
   * @param a The first value
   * @param b The second value
   * @param c The third value
   * @param inv_wa 1/w at the first point
   * @param inv_wb 1/w at the second point
   * @param inv_wc 1/w at the third point
   * @param barycentric The barycentric weights in window space
   * @return The interpolated value
   */
  interpolate_triangle_perspective(a, b, c,
      inv_wa, inv_wb, inv_wc,
      barycentric) {
    // *******************************
    // interpolate the triangle attributes accordint to the perspective correction
    // we pass in the inverse w coordinates directly
    // *******************************
    // As before, due to missing operator overloading, we will have to implement the formula twice, once for numbers and once for vectors/matrices
    // *******************************

    // Differentiate between numbers and vectors due to missing operator overload
    // we simplify here and assume b to be the same type as a
    if (typeof (a) === 'number') {
      return (a * inv_wa * barycentric.at(0) + b * inv_wb * barycentric.at(1) +
        c * inv_wc * barycentric.at(2)) /
        (inv_wa * barycentric.at(0) + inv_wb * barycentric.at(1) +
            inv_wc * barycentric.at(2));
    }
    else {
      // Otherwise assume the parameters to be vectors/matrices

      const divisor = inv_wa * barycentric.at(0) + inv_wb * barycentric.at(1) +
        inv_wc * barycentric.at(2);

      // Note that we could be more efficient by using temporary vectors in 
      // which the add/scale operations are stored in. This form is chosen 
      // to be the direct translation of the number version
      return scale(add(scale(a, inv_wa * barycentric.at(0)), add(scale(b, inv_wb * barycentric.at(1)),
        scale(c, inv_wc * barycentric.at(2)))), 1.0 / divisor);
    }
  }

  /**
   * @brief Linearly interpolate two values with perspective correction
   *
   * @param a The first value
   * @param b The second value
   * @param inv_wa 1/w at the first point
   * @param inv_wb 1/w at the second point
   * @param t The interpolation parameter window space
   * @return The interpolated value
   */
  interpolate_line_perspective(a, b, inv_wa,
      inv_wb, t) {
    // *******************************
    // interpolate the line attributes accordint to the perspective correction
    // we pass in the inverse w coordinates directly
    // *******************************
    // As before, due to missing operator overloading, we will have to implement the formula twice, once for numbers and once for vectors/matrices
    // *******************************

    // Differentiate between numbers and vectors due to missing operator overload
    // we simplify here and assume b to be the same type as a
    if (typeof (a) === 'number') {
      return ((1.0 - t) * inv_wa * a + t * inv_wb * b) /
        ((1.0 - t) * inv_wa + t * inv_wb);
    }
    else {
      // Otherwise assume the parameters to be vectors/matrices
      const divisor = ((1.0 - t) * inv_wa + t * inv_wb);

      return scale(add(scale(a, (1.0 - t) * inv_wa), scale(b, t * inv_wb)), 1.0 / divisor);
    }
  }

  /**
   * Rasterize a line
   * @param {AbstractMat} a 
   * @param {AbstractMat} b 
   * @param {Object<Number|AbstractMat>} data_a 
   * @param {Object<Number|AbstractMat>} data_b 
   */
  rasterize_line(pipeline, a, b,
      data_a = {}, data_b = {}) {
    // clip
    const clipped = this.clip_screen(a, b, vec2(pipeline.viewport.x, pipeline.viewport.y), vec2(pipeline.viewport.x + pipeline.viewport.w - 1, pipeline.viewport.y + pipeline.viewport.h - 1));
    if (clipped.length === 0) {
      return;
    }

    const program = pipeline.program;

    // interpolated data buffer
    const data = {};

    // gather attributes
    for (let i in data_a) {
      if (!data_b[i]) {
        continue;
      }
      data[i] = null;
    }

    // Bresenham/midpoint line drawing algorithm
    // operates on pixels
    const p0 = clipped[0];
    const p1 = clipped[1];
    const a2d = copy(subvec(a, 0, 2));
    const b2d = copy(subvec(b, 0, 2));

    const ldelta = sub(b2d, a2d);

    // precompute this value, since we will use it later
    const ldelta2 = dot(ldelta, ldelta);

    // Bresenham works in integer coordinates
    let x0 = Math.floor(p0.at(0));
    let y0 = Math.floor(p0.at(1));

    let x1 = Math.floor(p1.at(0));
    let y1 = Math.floor(p1.at(1));

    // Bresenham is only defined in the first 2D octant
    // To make it work for the others, we reorder things, so they are in that
    // first octant. In the end we have to undo some of that

    // slope > 1 -> flip x and y
    let transposed = false;
    if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
      transposed = true;
      [x0, y0] = [y0, x0];
      [x1, y1] = [y1, x1];
    }

    // going from right to left -> flip first and second point
    // doesn't actually change the line, so no later inversion needed
    if (x1 < x0) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }

    const dx = x1 - x0;
    const dy = Math.abs(y1 - y0);

    let y = y0;
    let m = dy / dx;
    if (y1 < y0) {
      m = -m;
    }

    for (let x = x0; x <= x1; x++) {
      let px = vec2(x, y);

      // flip x and y for the actual coordinate if they were flipped before
      if (transposed) {
        px = vec2(y, x);
      }

      // move px to pixel center
      add(px, vec2(0.5, 0.5), px);

      // compute interpolation paramter along line
      // this is the projection of the pixel center on the line
      let t = ldelta2 !== 0.0 ? dot(sub(px, a2d), ldelta) / ldelta2 : 0.0;
      // as we are dealing with pixels and not the line itself -> clamp just
      // to be sure
      t = Math.max(0.0, Math.min(1.0, t));

      // interpolate values
      for (let i in data) {
        // *******************************
        // We choose either linear or perspective interpolation, depending on the setting
        // *******************************
        if (pipeline.attribute_interpolation === AttributeInterpolation.LINEAR) {
            data[i] = this.interpolate_line(data_a[i], data_b[i], t);
        } else {
            data[i] = this.interpolate_line_perspective(data_a[i], data_b[i],
                a.at(3), b.at(3), t);
        }
        // *******************************
      }

      // depth values (after perspective division!) can be linearly
      // interpolated
      const frag_z = this.interpolate_line(a.at(2), b.at(2), t);
      // w contains 1/w before perspective division which can also be linearly
      // interpolated
      const frag_w = this.interpolate_line(a.at(3), b.at(3), t);
      // the final fragment coordinate
      const frag_coord = vec4(px.at(0), px.at(1), frag_z, frag_w);
      // run  fragment shader with data

      // buffer for colors
      const output_colors = {};

      const do_write_fragment =
        program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

      if (do_write_fragment) {
        this.write_fragment(pipeline, frag_coord, output_colors);
      }

      y += m;
    }
  }

  /**
   * 
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   * @param {Object<Number|AbstractMat>} data_v0 The attributes for the first vertex
   * @param {Object<Number|AbstractMat>} data_v1 The attributes for the second vertex
   * @param {Object<Number|AbstractMat>} data_v2 The attributes for the third vertex
   * @returns 
   */
  rasterize_triangle(pipeline, v0, v1, v2,
      data_v0 = {}, data_v1 = {}, data_v2 = {}) {
    // compute triangle screen bounds
    let points = [v0, v1, v2];
    let [bmin, bmax] = this.compute_screen_bounds(points);
    // pixel coordinates of bounds
    let ibmin = floor(bmin);
    let ibmax = ceil(bmax);

    const viewport = pipeline.viewport;

    const viewport_max = vec2(viewport.x + viewport.w - 1, viewport.y + viewport.h - 1);
    const viewport_min = vec2(viewport.x, viewport.y);
    // clamp bounds so they lie inside the image region
    cwiseMax(ibmin, viewport_min, ibmin);
    cwiseMin(ibmax, viewport_max, ibmax);

    // handle case where its fully outside
    if (isAny(ibmin, viewport_max, (a, b) => a > b) ||
        isAny(ibmax, viewport_min, (a, b) => a < b)) {
      return;
    }

    // interpolated data buffer
    const data = {};

    // gather attributes
    for (let i in data_v0) {
      if (!data_v1[i] || !data_v2[i]) {
        continue;
      }
      data[i] = null;
    }
    // buffer for colors

    const program = pipeline.program;

    // compute the double triangle area only once
    const area_tri = this.signed_tri_area_doubled(v0, v1, v2);

    // check if any the triangle has zero area with some epsilon, if so, don't rasterize
    const epsilon = 1E-8;
    if (Math.abs(area_tri) < epsilon) {
      return;
    }

    // check all pixels in screen bounding box
    for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
      for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {
        // sample point in center of pixel
        const p = add(vec2(x, y), vec2(0.5, 0.5));

        let v = this.signed_tri_area_doubled(v2, v0, p);
        v /= area_tri;
        if (v + epsilon < 0.0) {
          continue;
        }

        let w = this.signed_tri_area_doubled(v0, v1, p);
        w /= area_tri;
        if (w + epsilon < 0.0) {
          continue;
        }

        let u = 1.0 - v - w;
        if (u + epsilon < 0.0) {
          continue;
        }

        const b = v32.from([u, v, w]);

        // interpolate values
        for (let i in data) {
          // *******************************
          // We choose either linear or perspective interpolation, depending on the setting
          // *******************************
          if (pipeline.attribute_interpolation == AttributeInterpolation.LINEAR) {
            data[i] = this.interpolate_triangle(data_v0[i], data_v1[i], data_v2[i], b);
          } else {
            data[i] = this.interpolate_triangle_perspective(
              data_v0[i], data_v1[i], data_v2[i], v0.at(3), v1.at(3), v2.at(3), b);
          }
          // *******************************
        }
        // depth values (after perspective division!) can be linearly
        // interpolated
        const frag_z = this.interpolate_triangle(v0.at(2), v1.at(2), v2.at(2), b);
        // w contains 1/w before perspective division which can also be
        // linearly
        // interpolated
        const frag_w = this.interpolate_triangle(v0.at(3), v1.at(3), v2.at(3), b);
        // run  fragment shader with data
        const frag_coord = vec4(x, y, frag_z, frag_w);
        // run  fragment shader with data
        const output_colors = {};

        const do_write_fragment =
          program.fragment_shader(frag_coord, data, pipeline.uniform_data, output_colors);

        if (do_write_fragment) {
          this.write_fragment(pipeline, frag_coord, output_colors);
        }
      }
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -shaders
const vertex_shader = (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  let color = uniforms.material.color;

  if(uniforms.material.tex) {
    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);
  }

  output_colors[0] = color;
              
  return true;
};
```
``` js -scene
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : {
      color : vec4(0.85,0.85,0.85,1),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
    rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    }
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : {
      color : vec4(1,0,0,1),
      tex : checkerboard
    }
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

const program = { vertex_shader, fragment_shader };

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

fb.depth_buffer = Image.zero(img.w,img.h,1);
fb.depth_buffer.fill(vec4(1,1,1,1));

pipeline.depth_options.enable_depth_test = true;

pipeline.framebuffer = fb;
```
<script>
const container = document.getElementById('perspective_attrib_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r08.Rasterizer;
const Pipeline = r08.Pipeline;
const Framebuffer = r08.Framebuffer;

@input(0)
@input(1)
@input(2)

const raster = new RasterizerTutorial();

img.fill(vec4(0,0,0,1));

for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
  pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
  pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="perspective_attrib_container_1"></div>
@mutate.remover(perspective_attrib_container_1)

With this, we have implemented a working 3D rasterizer, that can already display a wide variety of things! 

The next sections will show you some basic lighting and add the important feature of transparency.

## 09: Application: Turn on the light
<!--
script: ./rasterizer/src/stages/09_lighting/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

This will be a shorter section, as we will only breifly cover a small application that we can do to with our current system.

You can find the full rasterization code here: [Rasterizer 09](./rasterizer/src/stages/09_lighting/rasterizer.js)

While we can add colors to our objects via textures, attributes and uniforms, it looks a bit... flat. What makes games and other things not look like that (one of the reasons at least) is lighting. That is the interaction of light with the surfaces.

This is a really big topic, so we will only implement the basic, but time-tested lighting model by Bui Tuong Phong: The Phong reflection model. While it is today superseeded by more easier to configure or more realistic models, it is still a good introduction and gives the desired effects of lighting.

We will place a number $n_l$ of lights in our scene. The lights will be point lights, meaning they are infinitely small and shine in each direction with the same intensity. This is again a simplification, you can add more types of lights as you please.

Each light $i$ emits colored light $\mathbf{L}_i$, given as a 3D RGB vector. It is positioned at a position $\mathbf{p}_{l,i}$.

The surface is described by a material diffuse color $\mathbf{m}_d$ and a specular color $\mathbf{m}_s$. The diffuse color models how much light is reflected when light enters the object and gets reflected in all directions equally. This corresponds to the object color or the texture. The specular color models light reflecting from the surface itself. For non-metals, this color is generally white (meaning everything is reflected). Metals do produce reflection colors other than white, although the Phong model isn't very physically accurate. The values are in the range $[0,1]$ for all components. The diffuse and specular components should not sum to more than $1$, though as this model isn't physically accurate anyways, you can assign values relatively freely.

In the following we will assume that all vectors and points are in view-space. It doesn't actually matter, what coordinate system you use, but you have to be consistent, and view-space has at least one property that makes the formulas simpler.

We evaluate the Phong model at a point $\mathbf{p}$ on a surface. The surface at that point is described by its (interpolated) normal $\hat{\mathbf{n}}$. The $\hat{\cdot}$ symbolizes normalized vectors.

The light vector $\hat{\mathbf{l}}$ is the vector from the surface point to the light: 

$$
\hat{\mathbf{l}} = \frac{\mathbf{p}_{l,i} - \mathbf{p}}{||\mathbf{p}_{l,i} - \mathbf{p}||}
$$

The perfect reflection of the light $\hat{\mathbf{r}}$ is defined by the vector reflection formula:

$$
\hat{\mathbf{r}} =  -\hat{\mathbf{l}} - 2 (\hat{\mathbf{n}} \cdot (-\hat{\mathbf{l}})) \hat{\mathbf{n}}. 
$$

This function is already defined for you as `reflect(i, n)`, where the first input is the incidence vector, in this case $-\hat{\mathbf{l}}$.

Our own viewing direction is described by $\hat{\mathbf{v}}$ and points from the surface point to the camera position. Here we can see the reason for calculating all vectors in view space, since the camera position there is just the zero vector! So
**in view space** the view vector is:

$$
\hat{\mathbf{v}} = -\hat{\mathbf{p}}
$$

While lighting calculations are described here as vectors, they are not really vectors in the usual sense. You can add them, but also multiply them, which is done per component. This isn't really correct, but good enough. We will write this "color multiplication" with the symbol $\bigotimes$. In code you can get this componentwise multiplication with the `cwiseMult(a,b)` function, that takes vectors/matrices.

The diffuse component $\mathbf{L}_{d,i}$ of the Phong model just returns the amount of light falling onto a surface patch attenuated by the material color. This amount depends on the angle of the light direction and the normal (the surface). You can imagine a small flashlight. If you hold a light perpendicular to the surface (same direction as normal) all of the light will shine directly on the patch below. If you angle the light, the same brightness of the flashlight will be spread out over more area, thus decreasing the brightness at each fixed area surface patch. Geometrically, this can be described by the cosine of the angle between the normal and the light direction. It describes the "projected area" of a surface patch in the direction of the light. We don't actually need to compute a cosine though, since our vectors are normalized and so the dot product will give us the desired value:

$$
    \mathbf{L}_{d,i} = (\hat{\mathbf{n}}\cdot \hat{\mathbf{l}} ) (\mathbf{m}_d \bigotimes \mathbf{L}_i)
$$

**Attention:** Light is not supposed to "shine through", so we need to clamp the dot product to be non-negative. You just need to take the maximum of it with $0$.

The specular component $\mathbf{L}_{s,i}$ measures, how much we are looking into the ideal reflection $\hat{\mathbf{r}} $. For a perfect mirror, you only see the light reflected in that exact direction. The rougher a surface is, the more we see of that reflection even when not looking directly. This behaviour is controlled with a parameter $\alpha$, the "shininess".  The higher the value, the more mirror-like the surface becomes. The falloff is modelled by a cosine and the full formula looks like this:

$$
    \mathbf{L}_{s,i} =  (\hat{\mathbf{r}}\cdot \hat{\mathbf{v}} )^{\alpha} (\mathbf{m}_s\bigotimes \mathbf{L}_i)
$$

**Attention:** Just like the diffuse part, light is not supposed to "shine through", so we need to clamp the dot product to be non-negative. You just need to take the maximum of it with $0$. We generally also want to set this term to zero, if $\hat{\mathbf{n}}\cdot \hat{\mathbf{l}} $ is negative, since in that case, the light arrived from a backside.

In the real world, a lot of lighting is indirect, it bounces off other surfaces until it hits the one we actually see. This is very expensive to calculate, so we don't do it. The Phong model uses just a constant directionless "ambient light", that roughly models the average light from the surroundings. We will call it $\mathbf{L}_{a}$ and weigh it by the diffuse material.

If you want surfaces, that emit light (although not onto other surfaces), you can add an additional object value $\mathbf{L}_{e}$, though it isn't necessary.

With all of that, the final color $\mathbf{L}$ that we can write into the color buffer is:

$$
\begin{align*}
\mathbf{L} &= \mathbf{L}_{e} + \mathbf{m}_d \bigotimes \mathbf{L}_{a} + \sum_i^{n_l} \mathbf{L}_{d,i} + \mathbf{L}_{s,i} \\
&= \mathbf{L}_{e} +\mathbf{m}_d \bigotimes \mathbf{L}_{a} + \sum_i^{n_l} ((\hat{\mathbf{n}}\cdot \hat{\mathbf{l}} ) \mathbf{m}_d + (\hat{\mathbf{r}}\cdot \hat{\mathbf{v}} )^{\alpha} \mathbf{m}_s) \bigotimes \mathbf{L}_i \\
\end{align*}
$$

We can now implement the phong lighting model! Most of the work is done in the shaders, where the vertex shader forwards the needed information and the fragment shader computes the model.

There is one important thing about the normals though, since we are transforming them from the local model space to the view space. The normal is defined by a constant dot product relation: $\mathbf{u} \cdot \mathbf{n}$. Here is a short derivation, what $\mathbf{n}$ needs to be, if we were to transform the direction $\mathbf{u}$ by some transform $\mathbf{M}$, such that $\mathbf{u} \cdot \mathbf{n} = (\mathbf{M}\mathbf{u}) \cdot \mathbf{n}'$.

We use the relation between matrix multiplication and the dot product: $\mathbf{a} \cdot \mathbf{b} = \mathbf{a}^T\mathbf{b}$.

$$
\begin{align*}
\mathbf{u} \cdot \mathbf{n} &= \mathbf{u}^T \mathbf{n} \\
&= \mathbf{u}^T \mathbf{M}^T (\mathbf{M}^T)^{-1}\mathbf{n} \\
&= (\mathbf{u}^T \mathbf{M}^T) ((\mathbf{M}^T)^{-1}\mathbf{n}) \\
&= (\mathbf{M} \mathbf{u}) \cdot ((\mathbf{M}^T)^{-1}\mathbf{n}) \\
&= \mathbf{u}' \cdot \mathbf{n}' \\
\end{align*}
$$

So the normal transforms with the transposed inverse of the transformation matrix $(\mathbf{M}^T)^{-1} = (\mathbf{M}^{-1})^{T} = \mathbf{M}^{-T}$ for vectors. Since vectors and normals don't have translation, we only need the upper $3\times 3$ transformation matrix for this.

Also, from this we see, that for pure rotations, the normals transform like directions, since the transpose is equal to the inverse.

We will precompute the transpose inverse of the model view matrix and store it as `MV_ti` in the uniforms.

Lights are defined as uniforms and their positions are transformed into view space for easy use.

The solution is below.

**Exercise:**

* Vertex Shader

    * Transform the vertex from model space to view space using the MV uniform
    * Transform the normal from model space to view space using the MV_ti ($3\times 3$) transposed inverse MV matrix

* Fragment Shader

    * Normalize the attribute normal
    * Compute the Phong lighting model

<!-- data-readOnly="false"-->
``` js +shaders
const vertex_shader =  (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];

  // *******************************
  // TODO
  // *******************************
  // transform vertex into view space
  // the homogeneous coordinate stays the same, so we can just extract the 3D vector

  // *******************************
  // TODO
  // *******************************
  // transform the normal by the transposed inverse
  outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);

  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  // material data
  let mat_diffuse = uniforms.material.color;
  const mat_specular = uniforms.material.specular;
  const shininess = uniforms.material.shininess;

  // we tint the texture by the given color
  // we could also just replace it instead
  if(uniforms.material.tex) {
    mat_diffuse = cwiseMult(sample(uniforms.material.tex,uv),mat_diffuse);
  }

  // lights is an array
  // each light has the fields {p_w,p_v,color}
  // p_w: world position, p_v: view space position, color: the light color
  const lights = uniforms.lights;

  // use this to accumulate the final color
  const final_color = vec4(0,0,0,0);

  // *******************************
  // TODO
  // *******************************
  // get the position and normal
  // be sure to normalize the interpolated normal

  // *******************************
  // TODO
  // *******************************
  // go through lights
  // compute the phong lighting model
  // add to final color

  // optional emission
  if(uniforms.material.emission) {
    add(final_color,uniforms.material.emission,final_color);
  }
  // we will use the diffuse alpha as the final alpha
  final_color.set(mat_diffuse.at(3),3);

  output_colors[0] = final_color;

  return true;
};
```
<!-- data-readOnly="false"-->
``` js +scene.js
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});
const rand_tex = Image.random(128,128);

// *******************************
// Simple helper function to populate a material with some default values
// *******************************
const phong_material = (props = {}) => {
  const {color = vec4(1,1,1,1),specular = vec4(1,1,1,1), shininess = 16, ...rest} = props;
  return {
    color, specular, shininess, ...rest
  };
};

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,0,0,1),
      tex : checkerboard
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : phong_material({
      color : vec4(0.1,0.85,0.5,0.75),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
    rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    })
  });
  geoms.push(renderable);
}
// *******************************

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

// *******************************
// add lights
// *******************************

const lights = [];
lights.push({p_w:vec3(-1.5,2,-2.7), color : vec3(0.7,0.7,0.7)});
lights.push({p_w:vec3(-5,6,5), color : vec3(0.2,0.2,0.9)});

// transform light world positions into view space
for(let i = 0; i < lights.length;i++) {
  const li = lights[i];
  li.p_v = copy(subvec(mult(V,hvec(li.p_w)),0,3));
}

// put into uniforms
pipeline.uniform_data.lights = lights;
// *******************************

const program = {vertex_shader, fragment_shader};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;
fb.depth_buffer = Image.zero(img.w,img.h,1);

pipeline.framebuffer = fb;

pipeline.depth_options.enable_depth_test = true;
```
<script>
const container = document.getElementById('lighting_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r09.Rasterizer;
const Pipeline = r09.Pipeline;
const Framebuffer = r09.Framebuffer;

const AttributeInterpolation = r09.AttributeInterpolation;

@input(0)
@input(1)


const raster = new Rasterizer();

img.fill(vec4(0,0,0,1));
pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
  pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
  pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="lighting_container_0"></div>
@mutate.remover(lighting_container_0)

**Solution:**

<!-- data-readOnly="false"-->
``` js -shaders.js
const vertex_shader =  (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  // transform vertex into view space
  // the homogeneous coordinate stays the same, so we can just extract the 3D vector
  outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
  // transform the normal by the transposed inverse
  outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);

  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  // material data
  let mat_diffuse = uniforms.material.color;
  const mat_specular = uniforms.material.specular;
  const shininess = uniforms.material.shininess;

  // we tint the texture by the given color
  // we could also just replace it instead
  if(uniforms.material.tex) {
    mat_diffuse = cwiseMult(sample(uniforms.material.tex,uv),mat_diffuse);
  }

  const final_color = vec4(0,0,0,0);

  const lights = uniforms.lights;

  const n = jsm.normalize(data["n_v"]);
  const p = data["p_v"];

  // go through lights
  for(let i = 0; i < lights.length;i++) {
    // compute the lighting model and add it to the final color
    const li = lights[i];

    const L = normalize(jsm.fromTo( p, li.p_v));

    const R = reflect(jsm.neg(L),n);
    const V = normalize(jsm.neg(p));

    const diff = clamp(dot(L,n),0,1);
    const spec = Math.pow(clamp(dot(R,V),0,1),shininess) * (diff > 0 ? 1 : 0);

    
    add(final_color, cwiseMult(scale(mat_diffuse,diff), li.color),final_color);
    add(final_color, cwiseMult(scale(mat_specular,spec), li.color),final_color);
  }

  // optional emission
  if(uniforms.material.emission) {
    add(final_color,uniforms.material.emission,final_color);
  }
  // we will use the diffuse alpha as the final alpha
  final_color.set(mat_diffuse.at(3),3);

  output_colors[0] = final_color;

  return true;
};
```
<!-- data-readOnly="false"-->
``` js -scene.js
    
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});
const rand_tex = Image.random(128,128);

// *******************************
// Simple helper function to populate a material with some default values
// *******************************
const phong_material = (props = {}) => {
  const {color = vec4(1,1,1,1),specular = vec4(1,1,1,1), shininess = 16, ...rest} = props;
  return {
      color, specular, shininess, ...rest
  };
};

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,0,0,1),
      tex : checkerboard
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : phong_material({
      color : vec4(0.1,0.85,0.5,0.75),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
    rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    })
  });
  geoms.push(renderable);
}
// *******************************

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

// *******************************
// add lights
// *******************************

const lights = [];
lights.push({p_w:vec3(-1.5,2,-2.7), color : vec3(0.7,0.7,0.7)});
lights.push({p_w:vec3(-5,6,5), color : vec3(0.2,0.2,0.9)});

// transform light world positions into view space
for(let i = 0; i < lights.length;i++) {
  const li = lights[i];
  li.p_v = copy(subvec(mult(V,hvec(li.p_w)),0,3));
}

// put into uniforms
pipeline.uniform_data.lights = lights;
// *******************************

const program = {vertex_shader, fragment_shader};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;
fb.depth_buffer = Image.zero(img.w,img.h,1);

pipeline.framebuffer = fb;

pipeline.depth_options.enable_depth_test = true;
```
<script>
const container = document.getElementById('lighting_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r09.Rasterizer;
const Pipeline = r09.Pipeline;
const Framebuffer = r09.Framebuffer;

const AttributeInterpolation = r09.AttributeInterpolation;

@input(0)
@input(1)


const raster = new Rasterizer();

img.fill(vec4(0,0,0,1));
pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

for(let i = 0; i < geoms.length;i++) {
  const gi = geoms[i];
  pipeline.uniform_data.M = gi.local_to_world;
  pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
  pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
  pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
  pipeline.uniform_data.material = gi.material;

  raster.draw(pipeline,gi.geometry);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="lighting_container_1"></div>
@mutate.remover(lighting_container_1)

Now that we have lighting, we will come to the last part of this course: Blending.

## 10: Blending

So far, we have drawn opaque surfaces, that means you can't look through them. Many common objects are that we encounter, such as glass, are see-through.

To make drawing such objects possible, there are two areas that we have to consider:

1. How to combine transparent color with the current image
2. How to actually draw the transparent objects

You can find the full rasterization code here: [Rasterizer 10](./rasterizer/src/stages/10_blending/rasterizer.js)

### Blending operations
<!--
script: ./rasterizer/src/stages/10_blending/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

There are many different ways to blend colors. If you have used an image editor or drawing software before, you will have seen a large number of blending modes for your layers.

We will adopt the model used by OpenGL here and implement the commonly used mode for transparent objects. There are many different modes and you can find them in the full code for this section.

The bascic idea about transparency is, that we will use the fourth channel after RGB in the colors to signify opaqueness, usually called the alpha channel. If $\alpha = 1$, the object is fully opaque and if $\alpha = 0$, it is fully transparent.

The OpenGL model seems a bit complicated, but it boils down to the following: 

The color already in the buffer is the **destination color** $\mathbf{c}_d$. The color that is written by the fragment shader is the **source color** $\mathbf{c}_s$. Each color is weighted by some factor/weight $f_d, f_s$. Then both colors are combined using an operation $\operatorname{op}_{\text{blend}}$. The final color that is written into the buffer is then:

$$
  \mathbf{c}_d' = \operatorname{op}_{\text{blend}}(f_s\mathbf{c}_s,f_d\mathbf{c}_s)
$$

OpenGL (and we) will use a slight modification, in that we allow the weights to work per component. So as before, we use the componentwise multiplication $\bigotimes$.

$$
  \mathbf{c}_d' = \operatorname{op}_{\text{blend}}(\mathbf{f}_s\bigotimes\mathbf{c}_s,\mathbf{f}_d\bigotimes\mathbf{c}_s)
$$

When all components in the weight vectors $\mathbf{f}_s$ and $\mathbf{f}_d$ are equal, this corresponds to the scalar version above.

To get our fully opaque rendering, we can use the following settings: 

$$
\begin{align*}
\operatorname{op}_{\text{blend}} &= + \\
f_s &= 1 \\
f_d &= 0 \\
 \mathbf{c}_d' &= \operatorname{op}_{\text{blend}}(f_s\mathbf{c}_s,f_d\mathbf{c}_d) \\
 &= 1\mathbf{c}_s + 0\mathbf{c}_d \\
 &= \mathbf{c}_s
\end{align*}
$$

To get transparency we can think about what should happen depending on the alpha value. For now, we just think about drawing a new surface on top of existing ones. Transparency means, that we can see through this new object, so our weights should only be based on the alpha value of this new object, $\alpha_s$.

If the object is fully opaque, we only want to see its color. If it is fully transparent, we only want to see the destination. If it has a certain percentage of transparency, we expect the color to be an mix between both colors corresponding to that percentage. This sounds a lot like a linear interpolation between the two colors based on the $\alpha_s$!

$$
\begin{align*}
\operatorname{op}_{\text{blend}} &= + \\
f_s &= \alpha_s \\
f_d &= 1-\alpha_s \\
 \mathbf{c}_d' &= \operatorname{op}_{\text{blend}}(f_s\mathbf{c}_s,f_d\mathbf{c}_d) \\
 &= \alpha_s\mathbf{c}_s + (1-\alpha_s)\mathbf{c}_d
\end{align*}
$$

We will add a new settings object to our pipeline.

```js
function create_blend_options({
    enabled = false,
    source_function = BlendFunction.ONE,
    destination_function = BlendFunction.ZERO,
    blend_equation = BlendEquation.ADD,
    constant_color = vec4(1.0, 1.0, 1.0, 1.0)
  } = {}) {
    return {
      enabled,
      source_function,
      destination_function,
      blend_equation,
      constant_color
    };
}

class Pipeline {
  constructor(...) {
    ...
    this.blend_options = create_blend_options();
    ...
  }
}
```

Like with the depth test, we add a variable `enabled` to disable blending if we don't need it. As we are mostly drawing opaque objects, we don't need the extra processing per pixel generally.
The `constant_color` field corresponds to some of the blending modes defined for OpenGL, but we don't use it in the example code.

We will now implement a subset of the blending and see how it looks by just overlaying some rectangles on an image. The solution is below

**Exercise:**

* Implement the `get_blend_factor` function

  * The result is a vector
  * The four different factors are given in the constants of `BlendFunction`

* Implement the `blend_colors`function

  * Get the factors $\mathbf{f}_s$ and $\mathbf{f}_d$ with the `get_blend_factor` function
  * Use the approriate blend function $\operatorname{op}_{\text{blend}}$, depending on `blend_equation` (in the example, this can only be addition)
  * Compute $\mathbf{c}_d' = \operatorname{op}_{\text{blend}}(\mathbf{f}_s\bigotimes\mathbf{c}_s,\mathbf{f}_d\bigotimes\mathbf{c}_s)$

<!-- data-readOnly="false"-->
``` js +blending.js
// constants for the blend equation and function
// in this example, we will only implement a subset, the others work analogous
// you can have a look at the full source to see all constants and cases
const BlendEquation = { ADD: 1 };
const BlendFunction = {
  ZERO: 1,
  ONE: 2,
  SRC_ALPHA: 7,
  ONE_MINUS_SRC_ALPHA: 8
};

/**
 * @brief Get the blend factor for the given parameters
 *
 * @param source The source (fragment) color
 * @param destination The destination (frame) color
 * @param color_const A constant color
 * @param blend_function The blend function to be used
 * @return The blend factor
 */
function get_blend_factor({ source,
    destination,
    color_const = vec4(0.0, 0.0, 0.0, 0.0), blend_function }) {

  // *******************************
  // TODO
  // *******************************
  // compute the blend factor corresponding to the blend function
  // scalar values will just be vec4s with equal components

  return vec4(0.0, 0.0, 0.0, 0.0);
  
}
/**
 * Blends a source color into a destination according to the blending rules
 * @param {AbstractMat} source The source (input) color
 * @param {AbstractMat} destination The destination (current output) color
 * @param {AbstractMat} color_const A constant color
 * @param {Number} source_function The source factor function
 * @param {Number} destination_function The destination factor function
 * @param {Number} blend_equation The blending equation
 * @returns The blended  color
 */
function blend_colors(source, destination, color_const,
    source_function, destination_function, blend_equation) {
  // *******************************
  // TODO
  // *******************************
  // get the weight factors for source and destination

  // apply the blend formulat depending on the given blend_equation
  // blend_equation will be a constant in BlendEquation
   
  return vec4(0, 0, 0, 0);
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300,300,4);
img.fill(vec4(0,0,0,1));

// *******************************
// this is a simplified version of our rasterizer write_fragment method
// here we just blend the colors, the full version just uses some more conditionals
// *******************************
const write_fragment = (pipeline, px, color) => {
  const blend_options = pipeline.blend_options;
  const frames = pipeline.framebuffer.color_buffers;

  // we only have one frame here
  const frame = frames[0];

  const blended_color = blend_colors(
    color, frame.at(px.at(0), px.at(1)), blend_options.constant_color,
    blend_options.source_function,
    blend_options.destination_function,
    blend_options.blend_equation);

  frame.set(blended_color, px.at(0), px.at(1));
};

// simple function to draw a rectangle
const draw_rect = (pipeline, x0,y0, w,h, color) => {
  // we assume here, that all values are correct
  for(let y = 0; y < h; y++) {
    for(let x = 0; x < w; x++) {
      const px = vec2(x0 + x, y0 + y);
      write_fragment(pipeline,px,color);
    }
  }
};
// our simplified pipeline
const pipeline = new Pipeline();

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;

// set the appropriate blend options
pipeline.blend_options.enabled = true;
pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

const rectangles = []
// some rectangles with different colors and alpha values
rectangles.push({x0:10,y0:10,w:100,h:100, color: vec4(1,0,0,0.5)});
rectangles.push({x0:80,y0:20,w:100,h:100, color: vec4(0,1,0,0.5)});
rectangles.push({x0:70,y0:60,w:40,h:200, color: vec4(0,0,1,0.75)});
rectangles.push({x0:20,y0:240,w:200,h:20, color: vec4(1,1,1,1)});
rectangles.push({x0:20,y0:200,w:200,h:20, color: vec4(1,1,1,0.75)});
rectangles.push({x0:20,y0:160,w:200,h:20, color: vec4(1,1,1,0.5)});
rectangles.push({x0:20,y0:120,w:200,h:20, color: vec4(1,1,1,0.25)});
rectangles.push({x0:20,y0:80,w:200,h:20, color: vec4(1,1,1,0.15)});
```
<script>
const container = document.getElementById('blending_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

const Rasterizer = r10.Rasterizer;
const Pipeline = r10.Pipeline;
const Framebuffer = r10.Framebuffer;

// Import

@input(0)
@input(1)

for(let i=0; i < rectangles.length; i++) {
  const ri = rectangles[i];
  draw_rect(pipeline, ri.x0, ri.y0, ri.w, ri.h, ri.color);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="blending_container_0"></div>
@mutate.remover(blending_container_0)


**Solution:**

<!-- data-readOnly="false"-->
``` js -blending.js
// constants for the blend equation and function
// in this example, we will only implement a subset, the others work analogous
// you can have a look at the full source to see all constants and cases
const BlendEquation = { ADD: 1 };
const BlendFunction = {
  ZERO: 1,
  ONE: 2,
  SRC_ALPHA: 7,
  ONE_MINUS_SRC_ALPHA: 8
};

/**
 * @brief Get the blend factor for the given parameters
 *
 * @param source The source (fragment) color
 * @param destination The destination (frame) color
 * @param color_const A constant color
 * @param blend_function The blend function to be used
 * @return The blend factor
 */
function get_blend_factor({ source,
    destination,
    color_const = vec4(0.0, 0.0, 0.0, 0.0), blend_function }) {
    switch (blend_function) {
      case BlendFunction.ZERO:
        return vec4(0.0, 0.0, 0.0, 0.0);
      case BlendFunction.ONE:
        return vec4(1.0, 1.0, 1.0, 1.0);
      case BlendFunction.SRC_ALPHA:
        return vec4(source.at(3), source.at(3), source.at(3), source.at(3));
      case BlendFunction.ONE_MINUS_SRC_ALPHA:
        return sub(vec4(1.0, 1.0, 1.0, 1.0), vec4(source.at(3), source.at(3), source.at(3), source.at(3)));
      default:
        return vec4(0.0, 0.0, 0.0, 0.0);
    }
}
/**
 * Blends a source color into a destination according to the blending rules
 * @param {AbstractMat} source The source (input) color
 * @param {AbstractMat} destination The destination (current output) color
 * @param {AbstractMat} color_const A constant color
 * @param {Number} source_function The source factor function
 * @param {Number} destination_function The destination factor function
 * @param {Number} blend_equation The blending equation
 * @returns The blended  color
 */
function blend_colors(source, destination, color_const,
    source_function, destination_function, blend_equation) {
    const f_source = get_blend_factor( { 
        source, destination, color_const, 
        blend_function: source_function 
      });
    const f_dest = get_blend_factor( {
        source, destination, color_const,
        blend_function: destination_function
      });

    switch (blend_equation) {
      case BlendEquation.ADD:
        return add(cwiseMult(source, f_source), cwiseMult(destination, f_dest));
      default:
        return vec4(0, 0, 0, 0);
    }
}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300,300,4);
img.fill(vec4(0,0,0,1));

// *******************************
// this is a simplified version of our rasterizer write_fragment method
// here we just blend the colors, the full version just uses some more conditionals
// *******************************
const write_fragment = (pipeline, px, color) => {
  const blend_options = pipeline.blend_options;
  const frames = pipeline.framebuffer.color_buffers;

  // we only have one frame here
  const frame = frames[0];

  const blended_color = blend_colors(
    color, frame.at(px.at(0), px.at(1)), blend_options.constant_color,
    blend_options.source_function,
    blend_options.destination_function,
    blend_options.blend_equation);

  frame.set(blended_color, px.at(0), px.at(1));
};

// simple function to draw a rectangle
const draw_rect = (pipeline, x0,y0, w,h, color) => {
  // we assume here, that all values are correct
  for(let y = 0; y < h; y++) {
    for(let x = 0; x < w; x++) {
      const px = vec2(x0 + x, y0 + y);
      write_fragment(pipeline,px,color);
    }
  }
};
// our simplified pipeline
const pipeline = new Pipeline();

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;

// set the appropriate blend options
pipeline.blend_options.enabled = true;
pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

const rectangles = []
// some rectangles with different colors and alpha values
rectangles.push({x0:10,y0:10,w:100,h:100, color: vec4(1,0,0,0.5)});
rectangles.push({x0:80,y0:20,w:100,h:100, color: vec4(0,1,0,0.5)});
rectangles.push({x0:70,y0:60,w:40,h:200, color: vec4(0,0,1,0.75)});
rectangles.push({x0:20,y0:240,w:200,h:20, color: vec4(1,1,1,1)});
rectangles.push({x0:20,y0:200,w:200,h:20, color: vec4(1,1,1,0.75)});
rectangles.push({x0:20,y0:160,w:200,h:20, color: vec4(1,1,1,0.5)});
rectangles.push({x0:20,y0:120,w:200,h:20, color: vec4(1,1,1,0.25)});
rectangles.push({x0:20,y0:80,w:200,h:20, color: vec4(1,1,1,0.15)});
```
<script>
const container = document.getElementById('blending_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

const Rasterizer = r10.Rasterizer;
const Pipeline = r10.Pipeline;
const Framebuffer = r10.Framebuffer;

// Import

@input(0)
@input(1)

for(let i=0; i < rectangles.length; i++) {
  const ri = rectangles[i];
  draw_rect(pipeline, ri.x0, ri.y0, ri.w, ri.h, ri.color);
}

imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="blending_container_1"></div>
@mutate.remover(blending_container_1)


### Drawing transparent objects
<!--
script: ./rasterizer/src/stages/10_blending/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

We now have the necessary functions to compute the blending of colors with different parameters. 
The functions we implemented in the last part are included with all  cases in the current rasterizer.

For brevity, we will only have a quick look at the full `write_fragment` method with blending included.
The blending code is basically the same as the one from the last section. The main difference is that we support multiple output buffers.

```js
/**
 * Writes a number of output colors and depth to the pipeline's framebuffer.
 * Might apply depth test/write and blending operations
 * @param {Pipeline} pipeline The pipeline to use
 * @param {AbstractMat} frag_coord The fragment coordinate
 * @param {Object<AbstractMat>} colors A map containing the colors per output buffer
 */
write_fragment(pipeline, frag_coord, colors) {
  const px = floor(subvec(frag_coord, 0, 2));

  const depth_options = pipeline.depth_options;
  const blend_options = pipeline.blend_options;

  const depth = pipeline.framebuffer.depth_buffer;
  // depth test
  if (depth_options.enable_depth_test &&
      !!depth &&
      frag_coord.at(2) > depth.at(px.at(0), px.at(1)).at(0)) {
    return;
  }

  if (depth_options.enable_depth_write &&
      !!depth) {
    depth.set(v32.from([frag_coord.at(2)]), px.at(0), px.at(1));
  }

  const frames = pipeline.framebuffer.color_buffers;

  for (let i in colors) {
    const frame = frames[i];
    if (!frame) {
      continue;
    }
    if (blend_options.enabled) {
      const blended_color = this.blend_colors(
          colors[i], frame.at(px.at(0), px.at(1)), blend_options.constant_color,
          blend_options.source_function,
          blend_options.destination_function,
          blend_options.blend_equation);
      frame.set(blended_color, px.at(0), px.at(1));
    } else {
      frame.set(colors[i], px.at(0), px.at(1));
    }
  }
}
```

The last part to our basic transparency rendering is handling the drawing itself. This isn't part of the rasterizer itself, so we have to do it from the outside. Luckily, our rasterizer is able to do all the required operations (besides one).

As mentioned before, the way to draw transparent objects is to utilize the painter algorithm, that is we draw from the back to the front. Since we can look through transparent objects, we can't just use the depth buffer, since that would discard all objects behind the closest one. So the transparent objects will not write into the depth buffer.

But we also have opaque objects, which need the depth buffer. And these opaque objects may even occlude transparent ones. So what to do?

First, we draw all opaque objects as usual. This will result in an opaque image with a filled depth buffer. Then we disable writing to the depth buffer, but keeping the depth test activated. This makes it so, that occluded transparent objects stay occluded. After that we enable blending. Finally we draw the transparent objects from the back to the front.

How do we sort the transparent objects? The answer is: It depends. There are different ways to sort and all of them have some issues. In general, we won't ever be able to correctly sort objects without breaking them apart. 3 triangles can overlap each other in a circular fashion. Even two triangles can intersect each other, making a correct sorting impossible.

The simple solution, that works well enough in practice is: Just take the centers (or some other point) of each object and sort by how far those are to the camera. We won't even go down to the level of triangles.

How far to the camera can easily be determined by the $z$-value in camera space. So we can compute the center of geometry for each object (the mean of its vertices), transform it by the model view matrix and then sort by $z$. We just have to keep in mind, that the camera is looking in the negative $z$ direction, so the farther an object is away, the smaller ("more negative") $z$ will get.

Let us implement that! The floor plane and one cube are transparent now. Also, another transparent "glass" pane is put in the front, so you can really see the issue when running the unchanged exercise. Solution is below:

**Exercise:**

* Implement the `compute_center` function

  * Compute the center of the given vertex array (the average)

* Implement the missing parts in `create_render_list`

  * Compute the view space $z$ center coordinate and store it in the transparent list objects
  * Sort the transparent list from small to large

<!-- data-readOnly="false"-->
``` js -shaders.js
const vertex_shader =  (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  // transform vertex into view space
  // the homogeneous coordinate stays the same, so we can just extract the 3D vector
  outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
  // transform the normal by the transposed inverse
  outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);

  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  // material data
  let mat_diffuse = uniforms.material.color;
  const mat_specular = uniforms.material.specular;
  const shininess = uniforms.material.shininess;

  // we tint the texture by the given color
  // we could also just replace it instead
  if(uniforms.material.tex) {
    mat_diffuse = cwiseMult(sample(uniforms.material.tex,uv),mat_diffuse);
  }

  const final_color = vec4(0,0,0,0);

  const lights = uniforms.lights;

  const n = jsm.normalize(data["n_v"]);
  const p = data["p_v"];

  // go through lights
  for(let i = 0; i < lights.length;i++) {
    // compute the lighting model and add it to the final color
    const li = lights[i];

    const L = normalize(jsm.fromTo( p, li.p_v));

    const R = reflect(jsm.neg(L),n);
    const V = normalize(jsm.neg(p));

    const diff = clamp(dot(L,n),0,1);
    const spec = Math.pow(clamp(dot(R,V),0,1),shininess) * (diff > 0 ? 1 : 0);

    
    add(final_color, cwiseMult(scale(mat_diffuse,diff), li.color),final_color);
    add(final_color, cwiseMult(scale(mat_specular,spec), li.color),final_color);
  }

  // optional emission
  if(uniforms.material.emission) {
    add(final_color,uniforms.material.emission,final_color);
  }
  // we will use the diffuse alpha as the final alpha
  final_color.set(mat_diffuse.at(3),3);

  output_colors[0] = final_color;

  return true;
};
```
<!-- data-readOnly="false"-->
``` js +rendering.js
function compute_center(vertices) {
  // *******************************
  // TODO
  // *******************************
  // compute the center of all vertices
  // the center is the average value of all vertices
  // vertices is an array containing the points
  const total = vec4(0,0,0,0);

  return total;
}

function create_render_list(objects, pipeline) {
  const opaque = [];
  const transparent = [];

  // split up opaque and transparent objects
  for(let i = 0; i < objects.length;i++) {
      const gi = objects[i];
      if(gi.material && gi.material.transparent) {
        // we compute the center for the transparent objects
        const center = compute_center(gi.geometry.attributes[Attribute.VERTEX]);

        transparent.push({obj: gi, center});
      } else {
          opaque.push(gi);
      }
  }

  // *******************************
  // TODO
  // *******************************
  // compute the view space z of each transparent object
  // the model matrix is stored as a field local_to_world in each object
  const V = pipeline.uniform_data.V;

  // *******************************
  // TODO
  // *******************************
  // sort the transparent objects by z
  // as the z are negative, we need to sort from small to large to get backgroud to foreground order

  return {opaque, transparent};
}

function render(pipeline, rasterizer, objects) {
  // clear color buffers
  for(let key in pipeline.framebuffer.color_buffers) {
    pipeline.framebuffer.color_buffers[key].fill(vec4(0,0,0,1));
  }

  // clear depth buffer
  pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

  const {opaque, transparent} =  create_render_list(objects, pipeline);
  // draw opaque objects normally
  for(let i = 0; i < opaque.length;i++) {
    const gi = opaque[i];
    pipeline.uniform_data.M = gi.local_to_world;
    pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
    pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
    pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
    pipeline.uniform_data.material = gi.material;

    rasterizer.draw(pipeline,gi.geometry);
  }

  // enable alpha blended transparency
  pipeline.blend_options.enabled = true;
  pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
  pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

  // we only want depth tested, but the transparent objects should not be able to cover other transparent objects, so we disable depth writing
  pipeline.depth_options.enable_depth_write = false;

  // go through transparent objects and draw them
  for(let i = 0; i < transparent.length;i++) {
      const gi = transparent[i].obj;
      pipeline.uniform_data.M = gi.local_to_world;
      pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
      pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
      pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
      pipeline.uniform_data.material = gi.material;

      rasterizer.draw(pipeline, gi.geometry);
  }

  // restore the default options after finishing the transparent objects
  pipeline.depth_options.enable_depth_write = true;
  pipeline.blend_options.enabled = false;

}
```
<!-- data-readOnly="false"-->
``` js -scene.js
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

// *******************************
// Simple helper function to populate a material with some default values
// *******************************
const phong_material = (props = {}) => {
  const {color = vec4(1,1,1,1),specular = vec4(1,1,1,1), shininess = 16, ...rest} = props;
  return {
    color, specular, shininess, ...rest
  };
};

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos: vec3(-0.38,0.3, 0.3),
      scale : vec3(0.2,1.0,0.3),
      rot: mult(
        jsm.axisAngle4(vec3(0,0,1),jsm.deg2rad(90))
        ,jsm.axisAngle4(vec3(0,1,0),jsm.deg2rad(85))),
    }),
    material : phong_material({
      color : vec4(0.75,0.85,0.5,0.8),
      transparent : true,
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,0,0,1),
      tex : checkerboard
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : phong_material({
      color : vec4(0.1,0.85,0.5,0.75),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
      rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    })
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

// *******************************
// add lights
// *******************************
const lights = [];
lights.push({p_w:vec3(-1.5,2,-2.7), color : vec3(0.7,0.7,0.7)});
lights.push({p_w:vec3(-5,6,5), color : vec3(0.2,0.2,0.9)});

// transform light world positions into view space
for(let i = 0; i < lights.length;i++) {
  const li = lights[i];
  li.p_v = copy(subvec(mult(V,hvec(li.p_w)),0,3));
}

// put into uniforms
pipeline.uniform_data.lights = lights;
// *******************************

const program = {vertex_shader, fragment_shader};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;
fb.depth_buffer = Image.zero(img.w,img.h,1);

pipeline.framebuffer = fb;

pipeline.depth_options.enable_depth_test = true;
```
<script>
const container = document.getElementById('blending_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r10.Rasterizer;
const Pipeline = r10.Pipeline;
const Framebuffer = r10.Framebuffer;

const BlendEquation = r10.BlendEquation;
const BlendFunction = r10.BlendFunction;
const AttributeInterpolation = r10.AttributeInterpolation;

@input(0)
@input(2)
@input(1)

const raster = new Rasterizer();

render(pipeline, raster, geoms);
imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="blending_container_0"></div>
@mutate.remover(blending_container_0)

**Solution:**

<!-- data-readOnly="false"-->
``` js -shaders.js
const vertex_shader =  (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  // transform vertex into view space
  // the homogeneous coordinate stays the same, so we can just extract the 3D vector
  outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
  // transform the normal by the transposed inverse
  outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);

  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  // material data
  let mat_diffuse = uniforms.material.color;
  const mat_specular = uniforms.material.specular;
  const shininess = uniforms.material.shininess;

  // we tint the texture by the given color
  // we could also just replace it instead
  if(uniforms.material.tex) {
    mat_diffuse = cwiseMult(sample(uniforms.material.tex,uv),mat_diffuse);
  }

  const final_color = vec4(0,0,0,0);

  const lights = uniforms.lights;

  const n = jsm.normalize(data["n_v"]);
  const p = data["p_v"];

  // go through lights
  for(let i = 0; i < lights.length;i++) {
    // compute the lighting model and add it to the final color
    const li = lights[i];

    const L = normalize(jsm.fromTo( p, li.p_v));

    const R = reflect(jsm.neg(L),n);
    const V = normalize(jsm.neg(p));

    const diff = clamp(dot(L,n),0,1);
    const spec = Math.pow(clamp(dot(R,V),0,1),shininess) * (diff > 0 ? 1 : 0);

    
    add(final_color, cwiseMult(scale(mat_diffuse,diff), li.color),final_color);
    add(final_color, cwiseMult(scale(mat_specular,spec), li.color),final_color);
  }

  // optional emission
  if(uniforms.material.emission) {
    add(final_color,uniforms.material.emission,final_color);
  }
  // we will use the diffuse alpha as the final alpha
  final_color.set(mat_diffuse.at(3),3);

  output_colors[0] = final_color;

  return true;
};
```
<!-- data-readOnly="false"-->
``` js -rendering.js
function compute_center(vertices) {

  // *******************************
  // compute the center of all vertices
  // the center is the average value of all vertices
  // vertices is an array containing the points
  const total = vec4(0,0,0,0);

  for (let i = 0; i < vertices.length; i++) {
    const vi = vertices[i];
    // add and store in total
    add(total,vi,total);
  }

  return scale(total,1/vertices.length, total);
}

function create_render_list(objects, pipeline) {
  const opaque = [];
  const transparent = [];

  // split up opaque and transparent objects
  for(let i = 0; i < objects.length;i++) {
      const gi = objects[i];
      if(gi.material && gi.material.transparent) {
        // we compute the center for the transparent objects
        const center = compute_center(gi.geometry.attributes[Attribute.VERTEX]);

        transparent.push({obj: gi, center});
      } else {
        opaque.push(gi);
      }
  }

  // *******************************
  // compute the view space z of each transparent object
  // the model matrix is stored as a field local_to_world in each object
  const V = pipeline.uniform_data.V;
  transparent.forEach(currentValue => {
    // do we need to do the full matrix multiply to get z?
    const res = mult(V,mult(currentValue.obj.local_to_world, currentValue.center));
    currentValue.z = res.at(2);
  });

  // *******************************
  // sort the transparent objects by z
  // as the z are negative, we need to sort from small to large to get backgroud to foreground order
  transparent.sort((a,b) => a.z - b.z);

  return {opaque, transparent};
}

function render(pipeline, rasterizer, objects) {
  // clear color buffers
  for(let key in pipeline.framebuffer.color_buffers) {
    pipeline.framebuffer.color_buffers[key].fill(vec4(0,0,0,1));
  }

  // clear depth buffer
  pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

  const {opaque, transparent} =  create_render_list(objects, pipeline);
  // draw opaque objects normally
  for(let i = 0; i < opaque.length;i++) {
    const gi = opaque[i];
    pipeline.uniform_data.M = gi.local_to_world;
    pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
    pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
    pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
    pipeline.uniform_data.material = gi.material;

    rasterizer.draw(pipeline,gi.geometry);
  }

  // enable alpha blended transparency
  pipeline.blend_options.enabled = true;
  pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
  pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

  // we only want depth tested, but the transparent objects should not be able to cover other transparent objects, so we disable depth writing
  pipeline.depth_options.enable_depth_write = false;

  // go through transparent objects and draw them
  for(let i = 0; i < transparent.length;i++) {
      const gi = transparent[i].obj;
      pipeline.uniform_data.M = gi.local_to_world;
      pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
      pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
      pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
      pipeline.uniform_data.material = gi.material;

      rasterizer.draw(pipeline, gi.geometry);
  }

  // restore the default options after finishing the transparent objects
  pipeline.depth_options.enable_depth_write = true;
  pipeline.blend_options.enabled = false;
}
```
<!-- data-readOnly="false"-->
``` js -scene.js   
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

// *******************************
// Simple helper function to populate a material with some default values
// *******************************
const phong_material = (props = {}) => {
  const {color = vec4(1,1,1,1),specular = vec4(1,1,1,1), shininess = 16, ...rest} = props;
  return {
      color, specular, shininess, ...rest
  };
};

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos: vec3(-0.38,0.3, 0.3),
      scale : vec3(0.2,1.0,0.3),
      rot: mult(
        jsm.axisAngle4(vec3(0,0,1),jsm.deg2rad(90))
        ,jsm.axisAngle4(vec3(0,1,0),jsm.deg2rad(85))),
    }),
    material : phong_material({
      color : vec4(0.75,0.85,0.5,0.8),
      transparent : true,
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({scale : vec3(0.2,0.2,0.2),
    rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,0,0,1),
      tex : checkerboard
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : phong_material({
      color : vec4(0.1,0.85,0.5,0.75),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
      rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    })
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

// *******************************
// add lights
// *******************************
const lights = [];
lights.push({p_w:vec3(-1.5,2,-2.7), color : vec3(0.7,0.7,0.7)});
lights.push({p_w:vec3(-5,6,5), color : vec3(0.2,0.2,0.9)});

// transform light world positions into view space
for(let i = 0; i < lights.length;i++) {
  const li = lights[i];
  li.p_v = copy(subvec(mult(V,hvec(li.p_w)),0,3));
}

// put into uniforms
pipeline.uniform_data.lights = lights;
// *******************************

const program = {vertex_shader, fragment_shader};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;
fb.depth_buffer = Image.zero(img.w,img.h,1);

pipeline.framebuffer = fb;

pipeline.depth_options.enable_depth_test = true;
```
<script>
const container = document.getElementById('blending_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r10.Rasterizer;
const Pipeline = r10.Pipeline;
const Framebuffer = r10.Framebuffer;

const BlendEquation = r10.BlendEquation;
const BlendFunction = r10.BlendFunction;
const AttributeInterpolation = r10.AttributeInterpolation;

@input(0)
@input(2)
@input(1)

const raster = new Rasterizer();

render(pipeline, raster, geoms);
imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="blending_container_1"></div>
@mutate.remover(blending_container_1)

We can now draw transparent 3D objects together with opaque ones! The last issue that we cover may be hard to see. When we draw a single object, the order in which the triangles are drawin is dependent on the order in which they are specified in the vertex array. So we might actually get a similar effect as with different objects, but within one! Depending on how the triangles are sorted, this might display as weird and inconsistent color changes.

We could of course do the same with each triangle that we did with the objects, but this would be a lot of additional processing. Also, as mentioned before, intersections and overlaps will still be an issue. 

So we can't really solve this issue easily. But we can do something to mitigate the issue, which might also accelerate the drawing process a bit: Culling!

## 11: Culling

Culling is more or less exactly what the name says: We filter out some of the triangles that are drawn. Which ones? The basic idea is: we only see the front faces for opaque objects. And, assuming closed 3D objects, we first need to render the faces facing away from us (the back of the object) and then the ones facing towards us (the front of the object). This would mean rendering each transparent object twice, once for the back, once for the front. To avoid this additional computations, we could also just show the front for transparent objects. 

Discardig the triangles facing away from us is called **Backface Culling** and similarly discarding the ones facing us **Frontface Culling**

You can find the full rasterization code here: [Rasterizer 11](./rasterizer/src/stages/11_culling/rasterizer.js)

### Computing face directions
<!--
script: ./rasterizer/src/stages/11_culling/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

So, how do we determine, how a polygon (since after clipping, we potentially get polygons) is oriented? Let's label the points with their indices $\mathbf{p}_i$. We start with a triangle. If we define the vertices counter-clockwise, the normal computed as $\mathbf{n} = (\mathbf{p}_1 - \mathbf{p}_0) \times (\mathbf{p}_2 - \mathbf{p}_0)$ will point outside the screen. In a right hand system (our original view space), the $z$ axis also points outside. What we will do now, is compute the dot product of the normal with the $z$ axis. If that is positive, then the triangle is front-facing, otherwards back-facing. 

The nice thing is, that the dot product will just give us the $z$ component of the cross product. Let us write this out for two points:

$$
(\mathbf{p}_i \times \mathbf{p}_j)\cdot \mathbf{z} = x_i y_j - x_j y_i
$$

**Note:** Due to the property of the cross product, this is also twice the area of the screen triangle.

Next, we will rearrange the expression for the normal, but for later reasons, we will use three indices $i,j,k$, the ordered indices of the three triangle points.

$$
\begin{align*}
(\mathbf{p}_j - \mathbf{p}_i) \times (\mathbf{p}_k - \mathbf{p}_i) &= \mathbf{p}_j \times (\mathbf{p}_k - \mathbf{p}_i) - \mathbf{p}_i \times (\mathbf{p}_k - \mathbf{p}_i) \\
&= \mathbf{p}_j \times \mathbf{p}_k - \mathbf{p}_j \times \mathbf{p}_i - \mathbf{p}_i \times \mathbf{p}_k + \underbrace{\mathbf{p}_i \times \mathbf{p}_i }_{=\mathbf{0}} \\
&= \mathbf{p}_j \times \mathbf{p}_k - \mathbf{p}_j \times \mathbf{p}_i - \mathbf{p}_i \times \mathbf{p}_k \\
&= \mathbf{p}_j \times \mathbf{p}_k + \mathbf{p}_i \times \mathbf{p}_j + \mathbf{p}_k \times \mathbf{p}_i \\
&= \mathbf{p}_i \times \mathbf{p}_j + \mathbf{p}_j \times \mathbf{p}_k +  \mathbf{p}_k \times \mathbf{p}_i \\
&= \sum_{i=0}^{2}\mathbf{p}_i \times \mathbf{p}_{i\bigoplus 1}
\end{align*}
$$

In the last line, we have just noticed the index pattern and put it into a sum. In accordance to the OpenGL specificiation, we will use $\bigoplus$ to mean "addition with wrap-around". So for the triangle, the index $2 \bigoplus 1$ is $0$.

The dot product with $\mathbf{z}$ then gives us the nice formula:

$$
\begin{align*}
(\mathbf{p}_j - \mathbf{p}_i) \times (\mathbf{p}_k - \mathbf{p}_i) \cdot \mathbf{n} &= \sum_{i=0}^{2}x_i y_{i\bigoplus 1} - x_{i\bigoplus 1} y_i 
\end{align*}
$$

So, unlikely, but depending on the clipping planes, there might be some zero-triangles there, so to be robust, we will split up the polygon and add up the normal of all triangles. As we only care about the sign and therefore direction, we don't care about the length, so you can think about this like an average normal.

If we get a fourth point, we can make two triangles $(0,1,2)$ and $(0,2,3)$. Let's compute the normal (even if it is a bit tedious)!

$$
\begin{align*}
(\mathbf{p}_1 - \mathbf{p}_0) \times (\mathbf{p}_2 - \mathbf{p}_0)  + (\mathbf{p}_2 - \mathbf{p}_0) \times (\mathbf{p}_3 - \mathbf{p}_0)  &= \mathbf{p}_0 \times \mathbf{p}_1 + \mathbf{p}_1 \times \mathbf{p}_2 +  \mathbf{p}_2 \times \mathbf{p}_0 + \underbrace{\mathbf{p}_0 \times \mathbf{p}_2}_{= - \mathbf{p}_2 \times \mathbf{p}_0} + \mathbf{p}_2 \times \mathbf{p}_3 +  \mathbf{p}_3 \times \mathbf{p}_0 \\
&= \mathbf{p}_0 \times \mathbf{p}_1 + \mathbf{p}_1 \times \mathbf{p}_2 +  \mathbf{p}_2 \times \mathbf{p}_3 +  \mathbf{p}_3 \times \mathbf{p}_0 \\
&= \sum_{i=0}^{3}\mathbf{p}_i \times \mathbf{p}_{i\bigoplus 1}
\end{align*}
$$

So our formula stays exactly the same, since when adding a point, the duplicate line runs in another direction and cancels out!

In general we have for a polygon with $n$ vertices:

$$
\begin{align*}
\mathbf{n} &= \sum_{i=0}^{n-1}\mathbf{p}_i \times \mathbf{p}_{i\bigoplus 1} \\
\mathbf{n} \cdot \mathbf{z} &= \sum_{i=0}^{n-1}x_i y_{i\bigoplus 1} - x_{i\bigoplus 1} y_i 
\end{align*}
$$

As before, we want to make our culling adjustable, so we add some paramters to our pipeline:

```js
const Culling = {
  /** Cull front faces */
  FRONT: 0,
  /** Cull back faces */
  BACK: 1,
  /** Cull front and back faces */
  FRONT_AND_BACK: 2
};

function create_culling_options({ 
  enabled = false,
  cull_face = Culling.BACK
  } = {}) {
    return {
        enabled,
        cull_face
    };
}

class Pipeline {
  constructor(...) {
    ...
    this.culling_options = create_culling_options();
    ...
  }
  }
```

Now the only thing left to do is augmenting our `process_triangle` method to take into account the face direction! 
To illustrate the point, a simple routine was added after the definition of the objects in the scene, that randomly reorders faces. You can see the effect this has when running the unchanged exercise code.

The solution is below as always.

**Exercise:**

* Augment the `process_triangle` method to include culling

  * Culling will happen after the viewport projection 
  * Compute the face signifier for the polygon: $a = \sum_{i=0}^{n-1}x_i y_{i\bigoplus 1} - x_{i\bigoplus 1} y_i$

    * If $a>0$, the polygon is front facing
    * If culling is enabled, check if the face should be culled depending on the setting of `culling_options.cull_face` (can be either `Culling.BACK`, `Culling.FRONT` or `Culling.FRONT_AND_BACK`)
    * If the face should be culled, just return from the `process_triangle` method

<!-- data-readOnly="false" -->
``` js +rasterizer.js
class RasterizerTutorial extends Rasterizer {
  /**
   * Processes a single triangle
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
   * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
   * @param {Object<Number|AbstractMat>} attribs_v2 The attributes of the third vertex
   */
  process_triangle(pipeline, v0, v1, v2,
      attribs_v0 = {}, attribs_v1 = {}, attribs_v2 = {}) {

    // prepare points and data for clipping
    let points = [v0, v1, v2];
    let attribs = [attribs_v0, attribs_v1, attribs_v2];
    // clip polygon
    [points, attribs] = this.clip_polygon(points, pipeline.clip_planes, attribs);

    for (let i = 0; i < points.length; i++) {
      points[i] = this.viewport_transform(points[i], pipeline.viewport);
    }

    const culling_options = pipeline.culling_options;
    
    // culling
    if (culling_options.enabled) {
      let a = 0.0;
      // *******************************
      // TODO
      // *******************************
      // compute the face direction factor a

      // *******************************
      // TODO
      // *******************************
      // using a and the value of culling_options.cull_face, determine, if the face needs to be culled
    }
    // *******************************

    // triangulate polygon (clipping the triangle may result in non triangles
    // polygons) and rasterize
    for (let i = 0; i + 2 < points.length; i++) {
      this.rasterize_triangle(pipeline, points[0], points[i + 1], points[i + 2], attribs[0],
          attribs[i + 1], attribs[i + 2]);
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -shaders.js
const vertex_shader =  (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  // transform vertex into view space
  // the homogeneous coordinate stays the same, so we can just extract the 3D vector
  outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
  // transform the normal by the transposed inverse
  outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);

  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  // material data
  let mat_diffuse = uniforms.material.color;
  const mat_specular = uniforms.material.specular;
  const shininess = uniforms.material.shininess;

  // we tint the texture by the given color
  // we could also just replace it instead
  if(uniforms.material.tex) {
    mat_diffuse = cwiseMult(sample(uniforms.material.tex,uv),mat_diffuse);
  }

  const final_color = vec4(0,0,0,0);

  const lights = uniforms.lights;

  const n = jsm.normalize(data["n_v"]);
  const p = data["p_v"];

  // go through lights
  for(let i = 0; i < lights.length;i++) {
    // compute the lighting model and add it to the final color
    const li = lights[i];

    const L = normalize(jsm.fromTo( p, li.p_v));

    const R = reflect(jsm.neg(L),n);
    const V = normalize(jsm.neg(p));

    const diff = clamp(dot(L,n),0,1);
    const spec = Math.pow(clamp(dot(R,V),0,1),shininess) * (diff > 0 ? 1 : 0);

    
    add(final_color, cwiseMult(scale(mat_diffuse,diff), li.color),final_color);
    add(final_color, cwiseMult(scale(mat_specular,spec), li.color),final_color);
  }

  // optional emission
  if(uniforms.material.emission) {
    add(final_color,uniforms.material.emission,final_color);
  }
  // we will use the diffuse alpha as the final alpha
  final_color.set(mat_diffuse.at(3),3);

  output_colors[0] = final_color;

  return true;
};
```
<!-- data-readOnly="false"-->
``` js -rendering.js
function compute_center(vertices) {

  // *******************************
  // compute the center of all vertices
  // the center is the average value of all vertices
  // vertices is an array containing the points
  const total = vec4(0,0,0,0);

  for (let i = 0; i < vertices.length; i++) {
    const vi = vertices[i];
    // add and store in total
    add(total,vi,total);
  }

  return scale(total,1/vertices.length, total);
}

function create_render_list(objects, pipeline) {
  const opaque = [];
  const transparent = [];

  // split up opaque and transparent objects
  for(let i = 0; i < objects.length;i++) {
      const gi = objects[i];
      if(gi.material && gi.material.transparent) {
        // we compute the center for the transparent objects
        const center = compute_center(gi.geometry.attributes[Attribute.VERTEX]);

        transparent.push({obj: gi, center});
      } else {
          opaque.push(gi);
      }
  }

  // *******************************
  // compute the view space z of each transparent object
  // the model matrix is stored as a field local_to_world in each object
  const V = pipeline.uniform_data.V;
  transparent.forEach(currentValue => {
    // do we need to do the full matrix multiply to get z?
    const res = mult(V,mult(currentValue.obj.local_to_world, currentValue.center));
    currentValue.z = res.at(2);
  });

  // *******************************
  // sort the transparent objects by z
  // as the z are negative, we need to sort from small to large to get backgroud to foreground order
  transparent.sort((a,b) => a.z - b.z);

  return {opaque, transparent};
}

function render(pipeline, rasterizer, objects) {
  // clear color buffers
  for(let key in pipeline.framebuffer.color_buffers) {
    pipeline.framebuffer.color_buffers[key].fill(vec4(0,0,0,1));
  }

  // clear depth buffer
  pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

  const {opaque, transparent} =  create_render_list(objects, pipeline);
  // draw opaque objects normally
  for(let i = 0; i < opaque.length;i++) {
    const gi = opaque[i];
    pipeline.uniform_data.M = gi.local_to_world;
    pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
    pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
    pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
    pipeline.uniform_data.material = gi.material;

    rasterizer.draw(pipeline,gi.geometry);
  }

  // enable alpha blended transparency
  pipeline.blend_options.enabled = true;
  pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
  pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

  // we only want depth tested, but the transparent objects should not be able to cover other transparent objects, so we disable depth writing
  pipeline.depth_options.enable_depth_write = false;

  // go through transparent objects and draw them
  for(let i = 0; i < transparent.length;i++) {
      const gi = transparent[i].obj;
      pipeline.uniform_data.M = gi.local_to_world;
      pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
      pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
      pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
      pipeline.uniform_data.material = gi.material;

      rasterizer.draw(pipeline, gi.geometry);
  }

  // restore the default options after finishing the transparent objects
  pipeline.depth_options.enable_depth_write = true;
  pipeline.blend_options.enabled = false;

}
```
<!-- data-readOnly="false"-->
``` js -scene.js    
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

// *******************************
// Simple helper function to populate a material with some default values
// *******************************
const phong_material = (props = {}) => {
  const {color = vec4(1,1,1,1),specular = vec4(1,1,1,1), shininess = 16, ...rest} = props;
  return {
    color, specular, shininess, ...rest
  };
};

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      scale : vec3(0.2,0.2,0.2),
      rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,0,0,1),
      tex : checkerboard
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : phong_material({
      color : vec4(0.1,0.85,0.5,0.75),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
    rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    })
  });
  geoms.push(renderable);
}

// *******************************
// function to illustrate the issue: randomly scrambles polygon faces to change their drawing order
// *******************************
for(let i=0; i < geoms.length;i++) {
  const gi = geoms[i].geometry;

  // only scramble triangles
  if(gi.topology !== Topology.TRIANGLES) {
    continue;
  }

  const vertices = gi.attributes[Attribute.VERTEX];
  const n = vertices.length/3;

  // basic Fisher Yates shuffle
  for (let k = n-1; k >= 1; k--) {
    let j = Math.floor(Math.random()*(k+1));
    const idxk = 3*k;
    const idxj = 3*j;

    // exchange faces
    for(let a in gi.attributes) {
      const attrib = gi.attributes[a];
      [attrib[idxk + 0], attrib[idxj + 0]] = [attrib[idxj + 0], attrib[idxk + 0]];
      [attrib[idxk + 1], attrib[idxj + 1]] = [attrib[idxj + 1], attrib[idxk + 1]];
      [attrib[idxk + 2], attrib[idxj + 2]] = [attrib[idxj + 2], attrib[idxk + 2]];
    }

  }
}
// *******************************

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

const lights = [];
lights.push({p_w:vec3(-1.5,2,-2.7), color : vec3(0.7,0.7,0.7)});
lights.push({p_w:vec3(-5,6,5), color : vec3(0.2,0.2,0.9)});

// transform light world positions into view space
for(let i = 0; i < lights.length;i++) {
    const li = lights[i];
    li.p_v = copy(subvec(mult(V,hvec(li.p_w)),0,3));
}

// put into uniforms
pipeline.uniform_data.lights = lights;

const program = {vertex_shader, fragment_shader};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;
fb.depth_buffer = Image.zero(img.w,img.h,1);

pipeline.framebuffer = fb;

pipeline.depth_options.enable_depth_test = true;

// *******************************
// enable culling
// *******************************
pipeline.culling_options.enabled = true;
// default value, but set it anyways
pipeline.culling_options.cull_face = Culling.BACK;
// *******************************

```
<script>
const container = document.getElementById('culling_container_0');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r11.Rasterizer;
const Pipeline = r11.Pipeline;
const Framebuffer = r11.Framebuffer;

const BlendEquation = r11.BlendEquation;
const BlendFunction = r11.BlendFunction;
const AttributeInterpolation = r11.AttributeInterpolation;
const Culling = r11.Culling;

@input(0)
@input(1)
@input(2)
@input(3)

const raster = new RasterizerTutorial();

render(pipeline, raster, geoms);
imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="culling_container_0" width="300" height="300"></div>
@mutate.remover(culling_container_0)

**Solution:**

<!-- data-readOnly="false"-->
``` js -rasterizer.js
class RasterizerTutorial extends Rasterizer {
  /**
   * Processes a single triangle
   * @param {Pipeline} pipeline The pipeline to use
   * @param {AbstractMat} v0 The first vertex
   * @param {AbstractMat} v1 The second vertex
   * @param {AbstractMat} v2 The third vertex
   * @param {Object<Number|AbstractMat>} attribs_v0 The attributes of the first vertex
   * @param {Object<Number|AbstractMat>} attribs_v1 The attributes of the second vertex
   * @param {Object<Number|AbstractMat>} attribs_v2 The attributes of the third vertex
   */
  process_triangle(pipeline, v0, v1, v2,
      attribs_v0 = {}, attribs_v1 = {}, attribs_v2 = {}) {
    // prepare points and data for clipping
    let points = [v0, v1, v2];
    let attribs = [attribs_v0, attribs_v1, attribs_v2];
    // clip polygon
    [points, attribs] = this.clip_polygon(points, pipeline.clip_planes, attribs);

    for (let i = 0; i < points.length; i++) {
      points[i] = this.viewport_transform(points[i], pipeline.viewport);
    }

    // *******************************
    // culling
    // *******************************
    const culling_options = pipeline.culling_options;
    // determine signed area with 2d polygon winding (see GL specs. 14.8)
    
    // culling
    if (culling_options.enabled) {
      
      let a = 0.0;

      for (let i = 0; i < points.length; i++) {
        const p0 = points[i];
        const p1 = points[(i + 1) % points.length];
        a += p0.at(0) * p1.at(1) - p1.at(0) * p0.at(1);
      }
      const front_face = a > 0.0;

      // could be made easier
      if (front_face) {
        if (culling_options.cull_face == Culling.FRONT ||
                culling_options.cull_face == Culling.FRONT_AND_BACK) {
              // cull
              return;
        }
      } else {
        // backface
        if (culling_options.cull_face == Culling.BACK ||
            culling_options.cull_face == Culling.FRONT_AND_BACK) {
          // cull
          return;
        }
      }
    }
    // *******************************

    // triangulate polygon (clipping the triangle may result in non triangles
    // polygons) and rasterize
    for (let i = 0; i + 2 < points.length; i++) {
      this.rasterize_triangle(pipeline, points[0], points[i + 1], points[i + 2], attribs[0],
        attribs[i + 1], attribs[i + 2]);
    }
  }
}
```
<!-- data-readOnly="false"-->
``` js -shaders.js
const vertex_shader =  (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  // transform vertex into view space
  // the homogeneous coordinate stays the same, so we can just extract the 3D vector
  outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
  // transform the normal by the transposed inverse
  outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);

  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  // material data
  let mat_diffuse = uniforms.material.color;
  const mat_specular = uniforms.material.specular;
  const shininess = uniforms.material.shininess;

  // we tint the texture by the given color
  // we could also just replace it instead
  if(uniforms.material.tex) {
    mat_diffuse = cwiseMult(sample(uniforms.material.tex,uv),mat_diffuse);
  }

  const final_color = vec4(0,0,0,0);

  const lights = uniforms.lights;

  const n = jsm.normalize(data["n_v"]);
  const p = data["p_v"];

  // go through lights
  for(let i = 0; i < lights.length;i++) {
    // compute the lighting model and add it to the final color
    const li = lights[i];

    const L = normalize(jsm.fromTo( p, li.p_v));

    const R = reflect(jsm.neg(L),n);
    const V = normalize(jsm.neg(p));

    const diff = clamp(dot(L,n),0,1);
    const spec = Math.pow(clamp(dot(R,V),0,1),shininess) * (diff > 0 ? 1 : 0);

    
    add(final_color, cwiseMult(scale(mat_diffuse,diff), li.color),final_color);
    add(final_color, cwiseMult(scale(mat_specular,spec), li.color),final_color);
  }

  // optional emission
  if(uniforms.material.emission) {
    add(final_color,uniforms.material.emission,final_color);
  }
  // we will use the diffuse alpha as the final alpha
  final_color.set(mat_diffuse.at(3),3);

  output_colors[0] = final_color;

  return true;
};
```
<!-- data-readOnly="false"-->
``` js -rendering.js
function compute_center(vertices) {

  // *******************************
  // compute the center of all vertices
  // the center is the average value of all vertices
  // vertices is an array containing the points
  const total = vec4(0,0,0,0);

  for (let i = 0; i < vertices.length; i++) {
    const vi = vertices[i];
    // add and store in total
    add(total,vi,total);
  }

  return scale(total,1/vertices.length, total);
}

function create_render_list(objects, pipeline) {
  const opaque = [];
  const transparent = [];

  // split up opaque and transparent objects
  for(let i = 0; i < objects.length;i++) {
    const gi = objects[i];
    if(gi.material && gi.material.transparent) {
      // we compute the center for the transparent objects
      const center = compute_center(gi.geometry.attributes[Attribute.VERTEX]);

      transparent.push({obj: gi, center});
    } else {
      opaque.push(gi);
    }
  }

  // *******************************
  // compute the view space z of each transparent object
  // the model matrix is stored as a field local_to_world in each object
  const V = pipeline.uniform_data.V;
  transparent.forEach(currentValue => {
    // do we need to do the full matrix multiply to get z?
    const res = mult(V,mult(currentValue.obj.local_to_world, currentValue.center));
    currentValue.z = res.at(2);
  });

  // *******************************
  // sort the transparent objects by z
  // as the z are negative, we need to sort from small to large to get backgroud to foreground order
  transparent.sort((a,b) => a.z - b.z);

  return {opaque, transparent};
}

function render(pipeline, rasterizer, objects) {
  // clear color buffers
  for(let key in pipeline.framebuffer.color_buffers) {
    pipeline.framebuffer.color_buffers[key].fill(vec4(0,0,0,1));
  }

  // clear depth buffer
  pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

  const {opaque, transparent} =  create_render_list(objects, pipeline);
  // draw opaque objects normally
  for(let i = 0; i < opaque.length;i++) {
    const gi = opaque[i];
    pipeline.uniform_data.M = gi.local_to_world;
    pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
    pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
    pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
    pipeline.uniform_data.material = gi.material;

    rasterizer.draw(pipeline,gi.geometry);
  }

  // enable alpha blended transparency
  pipeline.blend_options.enabled = true;
  pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
  pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

  // we only want depth tested, but the transparent objects should not be able to cover other transparent objects, so we disable depth writing
  pipeline.depth_options.enable_depth_write = false;

  // go through transparent objects and draw them
  for(let i = 0; i < transparent.length;i++) {
    const gi = transparent[i].obj;
    pipeline.uniform_data.M = gi.local_to_world;
    pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
    pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
    pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
    pipeline.uniform_data.material = gi.material;

    rasterizer.draw(pipeline, gi.geometry);
  }

  // restore the default options after finishing the transparent objects
  pipeline.depth_options.enable_depth_write = true;
  pipeline.blend_options.enabled = false;

}
```
<!-- data-readOnly="false"-->
``` js -scene.js    
const img = Image.zeroF32(300,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(128,128);

// *******************************
// Simple helper function to populate a material with some default values
// *******************************
const phong_material = (props = {}) => {
  const {color = vec4(1,1,1,1),specular = vec4(1,1,1,1), shininess = 16, ...rest} = props;
  return {
    color, specular, shininess, ...rest
  };
};

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      scale : vec3(0.2,0.2,0.2),
      rot: jsm.axisAngle4(vec3(1,1,1),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,0,0,1),
      tex : checkerboard
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
    material : phong_material({
      color : vec4(0.1,0.85,0.5,0.75),
      tex : rand_tex,
      transparent : true,
      emission : vec4(0.3,0.3,0.3,0.0)
    })
  });
  geoms.push(renderable);
}

{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
      pos : vec3(-0.1,0.2, 0.15),
      scale : vec3(0.2,0.1,0.2),
      rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-37))}),
    material : phong_material({
      color : vec4(1,1,1,0.75),
      tex : checkerboard,
      transparent: true
    })
  });
  geoms.push(renderable);
}

// *******************************
// function to illustrate the issue: randomly scrambles polygon faces to change their drawing order
// *******************************
for(let i=0; i < geoms.length;i++) {
  const gi = geoms[i].geometry;

  // only scramble triangles
  if(gi.topology !== Topology.TRIANGLES) {
    continue;
  }

  const vertices = gi.attributes[Attribute.VERTEX];
  const n = vertices.length/3;

  for (let k = n-1; k >= 1; k--) {
    let j = Math.floor(Math.random()*(k+1));
    const idxk = 3*k;
    const idxj = 3*j;

    // exchange faces
    // basic Fisher Yates shuffle
    for(let a in gi.attributes) {
      const attrib = gi.attributes[a];
      [attrib[idxk + 0], attrib[idxj + 0]] = [attrib[idxj + 0], attrib[idxk + 0]];
      [attrib[idxk + 1], attrib[idxj + 1]] = [attrib[idxj + 1], attrib[idxk + 1]];
      [attrib[idxk + 2], attrib[idxj + 2]] = [attrib[idxj + 2], attrib[idxk + 2]];
    }
  }
}
// *******************************

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

const lights = [];
lights.push({p_w:vec3(-1.5,2,-2.7), color : vec3(0.7,0.7,0.7)});
lights.push({p_w:vec3(-5,6,5), color : vec3(0.2,0.2,0.9)});

// transform light world positions into view space
for(let i = 0; i < lights.length;i++) {
  const li = lights[i];
  li.p_v = copy(subvec(mult(V,hvec(li.p_w)),0,3));
}

// put into uniforms
pipeline.uniform_data.lights = lights;

const program = {vertex_shader, fragment_shader};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;
fb.depth_buffer = Image.zero(img.w,img.h,1);

pipeline.framebuffer = fb;

pipeline.depth_options.enable_depth_test = true;

// *******************************
// enable culling
// *******************************
pipeline.culling_options.enabled = true;
// default value, but set it anyways
pipeline.culling_options.cull_face = Culling.BACK;
// *******************************
```
<script>
const container = document.getElementById('culling_container_1');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r11.Rasterizer;
const Pipeline = r11.Pipeline;
const Framebuffer = r11.Framebuffer;

const BlendEquation = r11.BlendEquation;
const BlendFunction = r11.BlendFunction;
const AttributeInterpolation = r11.AttributeInterpolation;
const Culling = r11.Culling;


@input(0)
@input(1)
@input(2)
@input(3)

const raster = new RasterizerTutorial();

render(pipeline, raster, geoms);
imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="culling_container_1" width="300" height="300"></div>
@mutate.remover(culling_container_1)

## Closing remarks

Thank you for reading through this course. As stated before, this course was not meant to give you perfect insight into how GPUs currently work or what the best algorithms are. Rather, I think it is always good to have a basic understanding about how the stuff we takes for granted works (or can work) conceptually, even if the actual implementations are better or more complicated.

The code itself could probable be made better, faster and easier to read, but in general, I think the way it is worked decently well to slowly build up the system without getting too complicated.

If you have any questions or suggestions, feel free to contact me!

In general, you can try to make this faster and better. Or implement it in another language. Or just be content with having gained some knowledge.

Next you will find the final rasterizer, which in which you can try out any scene you want to implement!

### Playground
<!--
script: ./rasterizer/src/stages/11_culling/rasterizer.js
        ./rasterizer/src/geometry_utils.js
-->

The following is the basic setup for a simple renderer. You can customize whatever you like. As it is, textured objects can be displayed with lighting and transparency.

<!-- data-readOnly="false"-->
``` js -shaders.js
const vertex_shader =  (attributes, uniforms, outputs) => {
  outputs["uv"] = attributes[Attribute.UV];
  // transform vertex into view space
  // the homogeneous coordinate stays the same, so we can just extract the 3D vector
  outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
  // transform the normal by the transposed inverse
  outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);

  return mult(uniforms.MVP,attributes[Attribute.VERTEX]);
};

const fragment_shader =  (frag_coord, data,uniforms, output_colors) => {
  const uv = data["uv"];

  // material data
  let mat_diffuse = uniforms.material.color;
  const mat_specular = uniforms.material.specular;
  const shininess = uniforms.material.shininess;

  // we tint the texture by the given color
  // we could also just replace it instead
  if(uniforms.material.tex) {
    const {tex_sampler = {}} = uniforms.material;
    const {interpolation_mode = Interpolation.NEAREST, wrap_s = Wrapping.CLAMP_TO_EDGE, wrap_t = Wrapping.CLAMP_TO_EDGE} = tex_sampler;
    mat_diffuse = cwiseMult(sample(uniforms.material.tex,uv,{interpolation_mode, wrap_s, wrap_t}),mat_diffuse);
  }

  const final_color = vec4(0,0,0,0);

  const lights = uniforms.lights;

  const n = jsm.normalize(data["n_v"]);
  const p = data["p_v"];

  // go through lights
  for(let i = 0; i < lights.length;i++) {
    // compute the lighting model and add it to the final color
    const li = lights[i];

    const L = normalize(jsm.fromTo( p, li.p_v));

    const R = reflect(jsm.neg(L),n);
    const V = normalize(jsm.neg(p));

    const diff = clamp(dot(L,n),0,1);
    const spec = Math.pow(clamp(dot(R,V),0,1),shininess) * (diff > 0 ? 1 : 0);

    
    add(final_color, cwiseMult(scale(mat_diffuse,diff), li.color),final_color);
    add(final_color, cwiseMult(scale(mat_specular,spec), li.color),final_color);
  }

  // optional emission
  if(uniforms.material.emission) {
    add(final_color,uniforms.material.emission,final_color);
  }
  // we will use the diffuse alpha as the final alpha
  final_color.set(mat_diffuse.at(3),3);

  output_colors[0] = final_color;

  return true;
};
```
<!-- data-readOnly="false"-->
``` js -rendering.js
function compute_center(vertices) {

  // *******************************
  // compute the center of all vertices
  // the center is the average value of all vertices
  // vertices is an array containing the points
  const total = vec4(0,0,0,0);

  for (let i = 0; i < vertices.length; i++) {
    const vi = vertices[i];
    // add and store in total
    add(total,vi,total);
  }

  return scale(total,1/vertices.length, total);
}

function create_render_list(objects, pipeline) {
  const opaque = [];
  const transparent = [];

  // split up opaque and transparent objects
  for(let i = 0; i < objects.length;i++) {
    const gi = objects[i];
    if(gi.material && gi.material.transparent) {
      // we compute the center for the transparent objects
      const center = compute_center(gi.geometry.attributes[Attribute.VERTEX]);

      transparent.push({obj: gi, center});
    } else {
      opaque.push(gi);
    }
  }

  // *******************************
  // compute the view space z of each transparent object
  // the model matrix is stored as a field local_to_world in each object
  const V = pipeline.uniform_data.V;
  transparent.forEach(currentValue => {
    // do we need to do the full matrix multiply to get z?
    const res = mult(V,mult(currentValue.obj.local_to_world, currentValue.center));
    currentValue.z = res.at(2);
  });

  // *******************************
  // sort the transparent objects by z
  // as the z are negative, we need to sort from small to large to get backgroud to foreground order
  transparent.sort((a,b) => a.z - b.z);

  return {opaque, transparent};
}

function render(pipeline, rasterizer, objects) {
  // clear color buffers
  for(let key in pipeline.framebuffer.color_buffers) {
    pipeline.framebuffer.color_buffers[key].fill(vec4(0,0,0,1));
  }

  // clear depth buffer
  pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

  const {opaque, transparent} =  create_render_list(objects, pipeline);
  // draw opaque objects normally
  for(let i = 0; i < opaque.length;i++) {
    const gi = opaque[i];
    pipeline.uniform_data.M = gi.local_to_world;
    pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
    pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
    pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
    pipeline.uniform_data.material = gi.material;

    rasterizer.draw(pipeline,gi.geometry);
  }

  // enable alpha blended transparency
  pipeline.blend_options.enabled = true;
  pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
  pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

  // we only want depth tested, but the transparent objects should not be able to cover other transparent objects, so we disable depth writing
  pipeline.depth_options.enable_depth_write = false;

  // go through transparent objects and draw them
  for(let i = 0; i < transparent.length;i++) {
    const gi = transparent[i].obj;
    pipeline.uniform_data.M = gi.local_to_world;
    pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
    pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
    pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
    pipeline.uniform_data.material = gi.material;

    rasterizer.draw(pipeline, gi.geometry);
  }

  // restore the default options after finishing the transparent objects
  pipeline.depth_options.enable_depth_write = true;
  pipeline.blend_options.enabled = false;

}
```
<!-- data-readOnly="false"-->
``` js -scene.js    
const img = Image.zeroF32(400,300,4);

const geoms = [];

const checkerboard = Image.zero(9,9);
checkerboard.apply((x,y) => {
  const v = (x+y) % 2 === 0? 1 : 0;
  return vec4(v,v,v,1);
});

const rand_tex = Image.random(16,16);

// fill alpha with random values (with a function to make the differences sharper)
// glsl smoothstep
const smoothstep= (edge0, edge1, x) => {
    const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0.0), 1.0);
    return t * t * (3.0 - 2.0 * t);
};
let blurry_alpha_tex = Image.zero(32,32);

{ 
    blurry_alpha_tex.apply((x,y) => {
    const v = Math.min(Math.pow(smoothstep(0.2,0.7,Math.random()),1/32),1.0);
    return vec4(1,1,1,v);
  });
  // simple filter
  const temp = Image.zero(blurry_alpha_tex.w,blurry_alpha_tex.h);

  const filter = [1,4,6,4,1];
  let total = 0;
  for(let i = 0; i < filter.length;i++){
    total += filter[i];
  }
  const {w,h} = blurry_alpha_tex;
  const fr = Math.floor(filter.length/2);
  temp.apply((x,y) => {
    // x dir very simple
    let s = 0;
    for(let i = -fr; i <= fr; i++) {
      // clamp 
      const xi = Math.min(Math.max(x +i,0),w-1);
      s+= blurry_alpha_tex.at(xi,y).at(3) * filter[i + fr];
    }
    return vec4(1,1,1,s/total);
  });

  blurry_alpha_tex.apply((x,y) => {
    // y dir very simple
    let s = 0;
    for(let i = -fr; i <= fr; i++) {
      // clamp 
      const yi = Math.min(Math.max(y +i,0),h-1);
      s+= temp.at(x,yi).at(3) * filter[i + fr];
    }
    return vec4(1,1,1,s/total);
  });

}

// *******************************
// Simple helper function to populate a material with some default values
// *******************************
const phong_material = (props = {}) => {
  const {color = vec4(1,1,1,1),specular = vec4(1,1,1,1), shininess = 16, ...rest} = props;
  return {
    color, specular, shininess, ...rest
  };
};
// floor
{
	const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(0,-1.0,0), 
    	scale : vec3(2.0,2.0,2.0)}
    	),
    material : phong_material({
      color : vec4(0.8,0.8,0.8,1),
    })
  });
  geoms.push(renderable);
}

// left wall
{
	const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(0,1.0,-2), 
    	scale : vec3(2.0,2.0,2.0),
    	rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(90)),
    }),
    material : phong_material({
      color : vec4(0.9,0.1,0.1,1),
    })
  });
  geoms.push(renderable);
}

// right wall
{
	const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(0,1.0,2), 
    	scale : vec3(2.0,2.0,2.0),
    	rot: jsm.axisAngle4(vec3(1,0,0),jsm.deg2rad(-90)),
    }),
    material : phong_material({
      color : vec4(0.1,0.9,0.1,1),
    })
  });
  geoms.push(renderable);
}

// back wall
{
	const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(1,1.0,0), 
    	scale : vec3(2.0,2.0,2.0),
    	rot: jsm.axisAngle4(vec3(0,0,1),jsm.deg2rad(90)),
    }),
    material : phong_material({
      color : vec4(0.1,0.1,0.9,1),
    })
  });
  geoms.push(renderable);
}

// frosted glass
{
	const geom = create_plane_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(-1.5,1.1,0), 
    	scale : vec3(0.75,0.25,0.5),
    	rot: jsm.axisAngle4(vec3(0,0,1),jsm.deg2rad(37)),
    }),
    material : phong_material({
      color : vec4(0.9,0.6,0.9,1),
      tex: blurry_alpha_tex,
      transparent: true,
      tex_sampler: {
        interpolation_mode: Interpolation.LINEAR,
      }
    })
  });
  geoms.push(renderable);
}


// checkerboard cube
{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(-1.75,0,-1),
      scale : vec3(0.2,0.5,0.2),
    }),
    material : phong_material({
      color : vec4(0.9,0.9,0.9,1),
      tex: checkerboard
    })
  });
  geoms.push(renderable);
}

// checkerboard cube 2
{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
	    pos : vec3(0.5,2,0),
      scale : vec3(0.1,2,1),
    }),
    material : phong_material({
      color : vec4(0.9,0.9,0.9,1),
      tex: checkerboard
    })
  });
  geoms.push(renderable);
}

// rand cube
{
  const geom = create_cube_geometry();
  const renderable = Renderable.new(geom, {
    local_transform : transform({
    	pos : vec3(-1.75,0,1),
      scale : vec3(0.2,0.5,0.2),
    }),
    material : phong_material({
      color : vec4(0.9,0.9,0.9,1),
      tex: rand_tex
    })
  });
  geoms.push(renderable);
}

const pipeline = new Pipeline();
pipeline.viewport.w = img.w;
pipeline.viewport.h = img.h;

pipeline.uniform_data.M = jsm.MatF32.id(4,4);
pipeline.uniform_data.tex = checkerboard;

const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
const V = jsm.lookAt(vec3(-2.5,1,0), vec3(0,0,0), vec3(0,1,0));
const VP = mult(P,V);
pipeline.uniform_data.V = V;
pipeline.uniform_data.P = P;
pipeline.uniform_data.VP = VP;

const lights = [];
lights.push({p_w:vec3(-2.5,2,0), color : vec3(0.7,0.7,0.7)});
lights.push({p_w:vec3(1,3,0), color : vec3(0.2,0.2,0.9)});
lights.push({p_w:vec3(0,1,0), color : vec3(0.1,0.1,0.1)});

// transform light world positions into view space
for(let i = 0; i < lights.length;i++) {
  const li = lights[i];
  li.p_v = copy(subvec(mult(V,hvec(li.p_w)),0,3));
}

// put into uniforms
pipeline.uniform_data.lights = lights;

const program = {vertex_shader, fragment_shader};

pipeline.program = program;

const fb = Framebuffer.new();
fb.color_buffers[0] = img;
fb.depth_buffer = Image.zero(img.w,img.h,1);

pipeline.framebuffer = fb;

pipeline.depth_options.enable_depth_test = true;

// *******************************
// enable culling
// *******************************
pipeline.culling_options.enabled = true;
// default value, but set it anyways
pipeline.culling_options.cull_face = Culling.BACK;
// *******************************
```
<script>
const container = document.getElementById('playground_container');
container.innerHTML = "";
const canvas = document.createElement('canvas');

container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Import
const Rasterizer = r11.Rasterizer;
const Pipeline = r11.Pipeline;
const Framebuffer = r11.Framebuffer;

const BlendEquation = r11.BlendEquation;
const BlendFunction = r11.BlendFunction;
const AttributeInterpolation = r11.AttributeInterpolation;
const Culling = r11.Culling;


@input(0)
@input(1)
@input(2)

const raster = new Rasterizer();

render(pipeline, raster, geoms);
imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

"LIA: stop"
</script>

<div id="playground_container" width="300" height="300"></div>
@mutate.remover(playground_container)