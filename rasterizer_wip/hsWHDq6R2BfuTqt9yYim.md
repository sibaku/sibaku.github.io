<!--
author:   sibaku

email:    

version:  0.0.1

language: en

script: https://sibaku.github.io/rasterizer_wip/jsmatrix_no_module.js
        https://sibaku.github.io/rasterizer_wip/src/defines.js
        https://sibaku.github.io/rasterizer_wip/src/common.js

comment:  Basic rasterizer

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

# Introduction

This course aims to give a practical explanation about the basics of computer graphics.

We will start by drawing a line on the screen.
Afterwards, we will handle displaying triangles.
Just seeing some shapes is a bit boring, so we will put some colors on our triangles.
From there on, we take aim at creating 3D images and showing them on the 2D screen.
Finally, textures, shading and blending can be applied to our scenes.

All the theory will be followed up by a basic implementation, that you can try to do yourself in your browser!

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
script: https://sibaku.github.io/rasterizer_wip/lib/two.min.js
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

* add: Add two matrices/vectors
* sub: Subtract a matrix/vector from another one
* mult: Multiply two matrices
* scale: Scale a matrix/vector by a scalar
* dot: The dot product between two vectors
* cross: The cross product between two 3D vectors
* abs: Computes the element-wise absolute value of a matrix/vector

* cwiseMix: Compute the element-wise minimum of two matrices/vectors
* cwiseMax: Codmpute the element-wise maximum of two matrices/vectors
* cwiseMult: Compute the element-wise multiplication of two matrices/vectors
* subvec: Get a view of a part of a vector, so it can match dimensions with other operations
* diag: Get a view of the diagonal of a matrix. Behaves just like a vector
* block: Get a view of a part of a matrix, so it can match dimensions with other operations, such as multiplication or filling
* transpose: Get a view of the transpose of a matrix
* insert: Fills a matrix with the values of another one. Can be combined with views
* fill: Fills a matrix with a scalar value. Can be combined with views
* copy: Copy the given matrix/vector

* v32: Factory functions for float vectors
* m32: Factory functions for float matrices

Additionaly, as it is commonly used, we defined some helper functions for the common 2D, 3D and 4D vectors:

* vec2
* vec3
* vec4

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
The full code for each section is also accessible and will be linked at the end, so you can pick and choose what you are interested to do yourself.

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
The game is a game of chance and might not seem like much, when you see the description, but you will be surprised what can arise from something so simple!

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

To avoid spoiling you, the solution with code can be seen in the next section.

<!-- data-readOnly="false" data-showGutter="false" -->
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

    // TODO 
    // update the point p

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

### Solution

If you run the following script, you can see the solution to the previous section.

You can adjust parameters or run it multiple times to see how the randomness affects the result.

<!-- data-readOnly="false" data-showGutter="false" -->
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
    const container = document.getElementById('sierpinski_points_1');
    container.innerHTML = "";
    const canvas = document.createElement('canvas');
    
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    @input(0)

    imageToCtx(img,ctx);

    "LIA: stop"
</script>

<div id="sierpinski_points_1"></div>
@mutate.remover(sierpinski_points_1)

You are seeing the famous Sierpinski triangle! 
When plotted, this looks like four triangles cut out of a larger one... repeatedly.
The wonderful thing is, that the randomness doesn't really affect the result.
Sure, the exact point that you see are slightly different, but the overall shape will not change!
And if you use enough points, you won't be able to see a difference anymore!

## 01: Drawing a line
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/01_drawing_lines/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
``` js

const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{

    const attributes = {};

    const vertices = [];

    const num = 100;
    const r = 0.35 * Math.min(img.w,img.h);
    
    for(let i = 0; i < num; i++)
    {
        const x = r*Math.cos(Math.PI*2 * i/ (num-1));
        const y = r*Math.sin(Math.PI*2 * i/ (num-1));

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
    const container = document.getElementById('draw_lines_container_0');
    container.innerHTML = "";
    const canvas = document.createElement('canvas');
    
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
     // Import
    const Rasterizer = r01.Rasterizer;
    const Pipeline = r01.Pipeline;
    const Framebuffer = r01.Framebuffer;

    @input0

    const raster = new Rasterizer();

    const render = () => {
        img.fill(vec4(0,0,0,1));

        for(let i = 0; i < geoms.length;i++)
        {
            raster.draw(pipeline,geoms[i]);
        }

        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

    };

    render();

    "LIA: stop"
</script>

<div id="draw_lines_container_0"></div>
@mutate.remover(draw_lines_container_0)

## 02: Clipping lines
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/02_clipping_lines/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
``` js

const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{

    const attributes = {};

    const vertices = [];

    const num = 100;
    const r = 1.75 * Math.max(img.w,img.h);
    
    for(let i = 0; i < num; i++)
    {
        const x = r*Math.cos(Math.PI*2 * i/ (num-1));
        const y = r*Math.sin(Math.PI*2 * i/ (num-1));

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

    @input0

    const raster = new Rasterizer();

    const render = () => {
        img.fill(vec4(0,0,0,1));

        for(let i = 0; i < geoms.length;i++)
        {
            raster.draw(pipeline,geoms[i]);
        }

        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

    };

    render();

    "LIA: stop"
</script>

<div id="clip_lines_container_0"></div>
@mutate.remover(clip_lines_container_0)

## 03: Draw a triangle
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/03_rasterize_tri/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
``` js

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

    @input0

    const raster = new Rasterizer();

    const render = () => {
        img.fill(vec4(0,0,0,1));

        for(let i = 0; i < geoms.length;i++)
        {
            raster.draw(pipeline,geoms[i]);
        }

        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

    };

    render();

    "LIA: stop"
</script>

<div id="draw_tri_container_0"></div>
@mutate.remover(draw_tri_container_0)

## 04: Clip polygons
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/04_poly_clip/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
``` js

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

pipeline.clip_planes.push(vec4(-1,1,0,img.w/2));

const fb = Framebuffer.new();
fb.color_buffers[0] = img;

pipeline.framebuffer = fb;


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

    @input0

    const raster = new Rasterizer();

    const render = () => {
        img.fill(vec4(0,0,0,1));

        for(let i = 0; i < geoms.length;i++)
        {
            raster.draw(pipeline,geoms[i]);
        }

        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

    };

    render();

    "LIA: stop"
</script>

<div id="poly_clip_container_0"></div>
@mutate.remover(poly_clip_container_0)

## 05: Shaders
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/05_shader/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
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
        const geom = create_plane_geometry_xy();
        const renderable = Renderable.new(geom, {
            local_transform : transform({pos : vec3(2.0 * img.w / 7.0, img.h / 2.0, 0.0), scale : vec3(img.w / 7.0,img.w / 7.0,img.w / 7.0)}),
            material : {
                color : vec4(1,0,0,1),
            }
        });
        geoms.push(renderable);
    }

        {
        const geom = create_plane_geometry_xy();
        const renderable = Renderable.new(geom, {
            local_transform : transform({pos : vec3(3.0 * img.w / 7.0, img.h / 3.0, 0.0), scale : vec3(img.w / 7.0,img.w / 8.0,0.0)}),
            material : {
                color : vec4(0,1,0,1),
            }
        });
        geoms.push(renderable);
    }

    const pipeline = new Pipeline();
    pipeline.viewport.w = img.w;
    pipeline.viewport.h = img.h;


    pipeline.uniform_data.M = jsm.MatF32.id(4,4);
    pipeline.uniform_data.tex = checkerboard;

    const program = {
        vertex_shader : {
            run : (attributes, uniforms) => {

                return mult(uniforms.M,attributes[Attribute.VERTEX]);}
        },
        fragment_shader : {
            run : (frag_coord, data, uniforms, output_colors) => {
         
                let color = uniforms.material.color;
              
                output_colors[0] = color;
                
                return true;}
        }
    };

    pipeline.program = program;

    const fb = Framebuffer.new();
    fb.color_buffers[0] = img;

    pipeline.framebuffer = fb;

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

    @input0

    let t = 0.0;


    const raster = new Rasterizer();

    const render = () => {
        img.fill(vec4(0,0,0,1));



        const R = jsm.axisAngle4(vec3(0,1,0),t);
        t+=0.01;
        for(let i = 0; i < geoms.length;i++)
        {
            const gi = geoms[i];
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline,gi.geometry);
        }

        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

    };

    render();

    "LIA: stop"
</script>

<div id="shader_container_0"></div>
@mutate.remover(shader_container_0)

## 06: Interpolate attributes
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/06_attrib_interp/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
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

    const pipeline = new Pipeline();
    pipeline.viewport.w = img.w;
    pipeline.viewport.h = img.h;

    pipeline.uniform_data.M = jsm.MatF32.id(4,4);
    pipeline.uniform_data.tex = checkerboard;

    const program = {
        vertex_shader : {
            run : (attributes, uniforms, outputs) => {
                outputs["uv"] = attributes[Attribute.UV];
             
                return mult(uniforms.M,attributes[Attribute.VERTEX]);}
        },
        fragment_shader : {
            run : (frag_coord, data,uniforms, output_colors) => {
                const uv = data["uv"];
          
                let color = uniforms.material.color;

                if(uniforms.material.tex)
                {
                    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);

                }
              
                output_colors[0] = color;
                
                return true;}
        }
    };

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

    @input0

    let t = 0.0;


    const raster = new Rasterizer();

    const render = () => {
        img.fill(vec4(0,0,0,1));



        const R = jsm.axisAngle4(vec3(0,1,0),t);
        t+=0.01;
        for(let i = 0; i < geoms.length;i++)
        {
            const gi = geoms[i];
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline,gi.geometry);
        }

        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

    };

    render();

    "LIA: stop"
</script>

<div id="attrib_interp_container_0"></div>
@mutate.remover(attrib_interp_container_0)

## 07: Perspective and depth
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/07_perspective/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
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

 

    const pipeline = new Pipeline();
    pipeline.viewport.w = img.w;
    pipeline.viewport.h = img.h;

    pipeline.uniform_data.M = jsm.MatF32.id(4,4);
    pipeline.uniform_data.tex = checkerboard;

    const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
    let V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));

    const program = {
        vertex_shader : {
            run : (attributes, uniforms, outputs) => {
                outputs["uv"] = attributes[Attribute.UV];
                outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
                outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);
                return mult(uniforms.MVP,attributes[Attribute.VERTEX]);}
        },
        fragment_shader : {
            run : (frag_coord, data,uniforms, output_colors) => {
                const uv = data["uv"];
                const n = jsm.normalize(data["n_v"]);
                const p = data["p_v"];
                let color = uniforms.material.color;
                
                if(uniforms.material.tex)
                {
                    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);

                }
              
                output_colors[0] = color;
                
                return true;}
        }
    };

    pipeline.program = program;

    const fb = Framebuffer.new();
    fb.color_buffers[0] = img;
    fb.depth_buffer = Image.zero(img.w,img.h,1);

    pipeline.framebuffer = fb;

    pipeline.depth_options.enable_depth_test = true;


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

    @input0

    let t = 0.0;


    const raster = new Rasterizer();

    const render = () => {
        img.fill(vec4(0,0,0,1));
        pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

        V = mult(V,jsm.axisAngle4(vec3(0,1,0),0.01));
        const VP = mult(P,V);
        pipeline.uniform_data.V = V;
        pipeline.uniform_data.P = P;
        pipeline.uniform_data.VP = VP;

        const R = jsm.axisAngle4(vec3(0,1,0),t);
        t+=0.01;
        for(let i = 0; i < geoms.length;i++)
        {
            const gi = geoms[i];
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
            pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
            pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline,gi.geometry);
        }

        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

    };

    render();

    "LIA: stop"
</script>

<div id="perspective_container_0"></div>
@mutate.remover(perspective_container_0)

## 08: Perspective-corrected interpolation
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/08_persp_interp/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
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

 

    const pipeline = new Pipeline();
    pipeline.viewport.w = img.w;
    pipeline.viewport.h = img.h;

    pipeline.uniform_data.M = jsm.MatF32.id(4,4);
    pipeline.uniform_data.tex = checkerboard;

    const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
    let V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));

    const program = {
        vertex_shader : {
            run : (attributes, uniforms, outputs) => {
                outputs["uv"] = attributes[Attribute.UV];
                outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
                outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);
                return mult(uniforms.MVP,attributes[Attribute.VERTEX]);}
        },
        fragment_shader : {
            run : (frag_coord, data,uniforms, output_colors) => {
                const uv = data["uv"];
                const n = jsm.normalize(data["n_v"]);
                const p = data["p_v"];
                let color = uniforms.material.color;
                
                if(uniforms.material.tex)
                {
                    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);

                }
              
                output_colors[0] = color;
                
                return true;}
        }
    };

    pipeline.program = program;

    const fb = Framebuffer.new();
    fb.color_buffers[0] = img;
    fb.depth_buffer = Image.zero(img.w,img.h,1);

    pipeline.framebuffer = fb;

    pipeline.depth_options.enable_depth_test = true;


```
<script>
    const container = document.getElementById('persp_attrib_container_0');
    container.innerHTML = "";
    const canvas = document.createElement('canvas');
    
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
  
    // Import
    const Rasterizer = r08.Rasterizer;
    const Pipeline = r08.Pipeline;
    const Framebuffer = r08.Framebuffer;

    const AttributeInterpolation = r08.AttributeInterpolation;

    @input0

    let t = 0.0;


    const raster = new Rasterizer();

    const render = () => {
        img.fill(vec4(0,0,0,1));
        pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

        V = mult(V,jsm.axisAngle4(vec3(0,1,0),0.01));
        const VP = mult(P,V);
        pipeline.uniform_data.V = V;
        pipeline.uniform_data.P = P;
        pipeline.uniform_data.VP = VP;

        const R = jsm.axisAngle4(vec3(0,1,0),t);
        t+=0.01;
        for(let i = 0; i < geoms.length;i++)
        {
            const gi = geoms[i];
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
            pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
            pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline,gi.geometry);
        }

        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

    };

    render();

    "LIA: stop"
</script>

<div id="persp_attrib_container_0"></div>
@mutate.remover(persp_attrib_container_0)

## 09: Application: Turn on the light
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/09_lighting/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
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

     {
        const geom = create_plane_geometry();
        const renderable = Renderable.new(geom, {
            local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
            material : {
                color : vec4(0.1,0.85,0.5,0.75),
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

 

    const pipeline = new Pipeline();
    pipeline.viewport.w = img.w;
    pipeline.viewport.h = img.h;

    pipeline.uniform_data.M = jsm.MatF32.id(4,4);
    pipeline.uniform_data.tex = checkerboard;

    const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
    let V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));

    const program = {
        vertex_shader : {
            run : (attributes, uniforms, outputs) => {
                outputs["uv"] = attributes[Attribute.UV];
                outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
                outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);
                return mult(uniforms.MVP,attributes[Attribute.VERTEX]);}
        },
        fragment_shader : {
            run : (frag_coord, data,uniforms, output_colors) => {
                const uv = data["uv"];
                const n = jsm.normalize(data["n_v"]);
                const p = data["p_v"];
                let color = uniforms.material.color;
                
                if(uniforms.material.tex)
                {
                    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);

                    // color = sample(uniforms.      material.tex,uv);
                }
                const l = mult(uniforms.V,vec4(-1.5,2,-2.7,1));  

                const L = jsm.normalize(jsm.fromTo( p,jsm.subvec(l,0,3)));

                const R = reflect(jsm.neg(L),n);
                const V = jsm.normalize(jsm.neg(p));

                const diff = clamp(dot(L,n),0,1);
                const spec = Math.pow(clamp(dot(R,V),0,1),16) * (diff > 0 ? 1 : 0);

                const result = jsm.copy(color);
                jsm.scale(result,diff,result);
                jsm.add(result, vec4(spec,spec,spec,1),result);

                if(uniforms.material.emission)
                {
                    add(result,uniforms.material.emission,result);
                }
                result.set(color.at(3),3);
                // output_colors[0] = vec4(t,t,t,1.0);
                // output_colors[0] = data["color"];
                // output_colors[0] = vec4(diff,diff,diff,1);
                output_colors[0] = result;
                
                return true;}
        }
    };

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

    @input0

    let t = 0.0;


    const raster = new Rasterizer();

    const render = () => {
        img.fill(vec4(0,0,0,1));
        pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

        V = mult(V,jsm.axisAngle4(vec3(0,1,0),0.01));
        const VP = mult(P,V);
        pipeline.uniform_data.V = V;
        pipeline.uniform_data.P = P;
        pipeline.uniform_data.VP = VP;

        const R = jsm.axisAngle4(vec3(0,1,0),t);
        t+=0.01;
        for(let i = 0; i < geoms.length;i++)
        {
            const gi = geoms[i];
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
            pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
            pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline,gi.geometry);
        }

        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

    };

    render();

    "LIA: stop"
</script>

<div id="lighting_container_0"></div>
@mutate.remover(lighting_container_0)

## 10: Blending
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/10_blending/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
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

     {
        const geom = create_plane_geometry();
        const renderable = Renderable.new(geom, {
            local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
            material : {
                color : vec4(0.1,0.85,0.5,0.75),
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

 

    const pipeline = new Pipeline();
    pipeline.viewport.w = img.w;
    pipeline.viewport.h = img.h;

    pipeline.uniform_data.M = jsm.MatF32.id(4,4);
    pipeline.uniform_data.tex = checkerboard;

    const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
    let V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));

    const program = {
        vertex_shader : {
            run : (attributes, uniforms, outputs) => {
                outputs["uv"] = attributes[Attribute.UV];
                outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
                outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);
                return mult(uniforms.MVP,attributes[Attribute.VERTEX]);}
        },
        fragment_shader : {
            run : (frag_coord, data,uniforms, output_colors) => {
                const uv = data["uv"];
                const n = jsm.normalize(data["n_v"]);
                const p = data["p_v"];
                let color = uniforms.material.color;
                
                if(uniforms.material.tex)
                {
                    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);

                    // color = sample(uniforms.      material.tex,uv);
                }
                const l = mult(uniforms.V,vec4(-1.5,2,-2.7,1));  

                const L = jsm.normalize(jsm.fromTo( p,jsm.subvec(l,0,3)));

                const R = reflect(jsm.neg(L),n);
                const V = jsm.normalize(jsm.neg(p));

                const diff = clamp(dot(L,n),0,1);
                const spec = Math.pow(clamp(dot(R,V),0,1),16) * (diff > 0 ? 1 : 0);

                const result = jsm.copy(color);
                jsm.scale(result,diff,result);
                jsm.add(result, vec4(spec,spec,spec,1),result);

                if(uniforms.material.emission)
                {
                    add(result,uniforms.material.emission,result);
                }
                result.set(color.at(3),3);
                // output_colors[0] = vec4(t,t,t,1.0);
                // output_colors[0] = data["color"];
                // output_colors[0] = vec4(diff,diff,diff,1);
                output_colors[0] = result;
                
                return true;}
        }
    };

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

    @input0

    let t = 0.0;

    const opaque = [];
    const transparent = [];

    const raster = new Rasterizer();


    for(let i = 0; i < geoms.length;i++)
    {
        const gi = geoms[i];
        if(gi.material && gi.material.transparent)
        {
            const {bmin,bmax,center,half_size} = compute_geometry_bounds(gi.geometry.attributes[Attribute.VERTEX]);

            transparent.push({obj: gi, center});
        }
        else
        {
            opaque.push(gi);
        }
    }
    const render = () => {
        img.fill(vec4(0,0,0,1));
        pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

        V = mult(V,jsm.axisAngle4(vec3(0,1,0),0.01));
        const VP = mult(P,V);
        pipeline.uniform_data.V = V;
        pipeline.uniform_data.P = P;
        pipeline.uniform_data.VP = VP;

        // compute view z
        transparent.forEach(currentValue => {
            const res = mult(V,mult(currentValue.obj.local_to_world, currentValue.center));
            currentValue.z = res.at(2);
        });

        transparent.sort((a,b) => a.z - b.z);



        const R = jsm.axisAngle4(vec3(0,1,0),t);
        t+=0.01;
        for(let i = 0; i < opaque.length;i++)
        {
            const gi = opaque[i];
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
            pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
            pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline,gi.geometry);
        }

        pipeline.blend_options.enabled = true;
        pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
        pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

        pipeline.depth_options.enable_depth_write = false;

        for(let i = 0; i < transparent.length;i++)
        {
            const gi = transparent[i].obj;
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
            pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
            pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline, gi.geometry);
        }

        pipeline.depth_options.enable_depth_write = true;

        pipeline.blend_options.enabled = false;

        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);

    };

    render();

    "LIA: stop"
</script>

<div id="blending_container_0"></div>
@mutate.remover(blending_container_0)


## 11: Culling
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/11_culling/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
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

     {
        const geom = create_plane_geometry();
        const renderable = Renderable.new(geom, {
            local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
            material : {
                color : vec4(0.1,0.85,0.5,0.75),
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

 

    const pipeline = new r11.Pipeline();
    pipeline.viewport.w = img.w;
    pipeline.viewport.h = img.h;

    pipeline.uniform_data.M = jsm.MatF32.id(4,4);
    pipeline.uniform_data.tex = checkerboard;

    const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
    let V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));

    const program = {
        vertex_shader : {
            run : (attributes, uniforms, outputs) => {
                outputs["uv"] = attributes[Attribute.UV];
                outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
                outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);
                return mult(uniforms.MVP,attributes[Attribute.VERTEX]);}
        },
        fragment_shader : {
            run : (frag_coord, data,uniforms, output_colors) => {
                const uv = data["uv"];
                const n = jsm.normalize(data["n_v"]);
                const p = data["p_v"];
                let color = uniforms.material.color;
                
                if(uniforms.material.tex)
                {
                    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);

                    // color = sample(uniforms.      material.tex,uv);
                }
                const l = mult(uniforms.V,vec4(-1.5,2,-2.7,1));  

                const L = jsm.normalize(jsm.fromTo( p,jsm.subvec(l,0,3)));

                const R = reflect(jsm.neg(L),n);
                const V = jsm.normalize(jsm.neg(p));

                const diff = clamp(dot(L,n),0,1);
                const spec = Math.pow(clamp(dot(R,V),0,1),16) * (diff > 0 ? 1 : 0);

                const result = jsm.copy(color);
                jsm.scale(result,diff,result);
                jsm.add(result, vec4(spec,spec,spec,1),result);

                if(uniforms.material.emission)
                {
                    add(result,uniforms.material.emission,result);
                }
                result.set(color.at(3),3);
                // output_colors[0] = vec4(t,t,t,1.0);
                // output_colors[0] = data["color"];
                // output_colors[0] = vec4(diff,diff,diff,1);
                output_colors[0] = result;
                
                return true;}
        }
    };

    pipeline.program = program;

    const fb = r11.Framebuffer.new();
    fb.color_buffers[0] = img;
    fb.depth_buffer = Image.zero(img.w,img.h,1);

    pipeline.framebuffer = fb;

    pipeline.depth_options.enable_depth_test = true;


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

    
    @input0

    let t = 0.0;

    const opaque = [];
    const transparent = [];

    const raster = new Rasterizer();


    for(let i = 0; i < geoms.length;i++)
    {
        const gi = geoms[i];
        if(gi.material && gi.material.transparent)
        {
            const {bmin,bmax,center,half_size} = compute_geometry_bounds(gi.geometry.attributes[Attribute.VERTEX]);

            transparent.push({obj: gi, center});
        }
        else
        {
            opaque.push(gi);
        }
    }
    const render = () => {
        img.fill(vec4(0,0,0,1));
        pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

        V = mult(V,jsm.axisAngle4(vec3(0,1,0),0.01));
        const VP = mult(P,V);
        pipeline.uniform_data.V = V;
        pipeline.uniform_data.P = P;
        pipeline.uniform_data.VP = VP;

        // compute view z
        transparent.forEach(currentValue => {
            const res = mult(V,mult(currentValue.obj.local_to_world, currentValue.center));
            currentValue.z = res.at(2);
        });

        transparent.sort((a,b) => a.z - b.z);



        const R = jsm.axisAngle4(vec3(0,1,0),t);
        t+=0.01;
        for(let i = 0; i < opaque.length;i++)
        {
            const gi = opaque[i];
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
            pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
            pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline,gi.geometry);
        }

        pipeline.blend_options.enabled = true;
        pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
        pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

        pipeline.depth_options.enable_depth_write = false;


        pipeline.culling_options.enabled =  true;

        for(let i = 0; i < transparent.length;i++)
        {
            const gi = transparent[i].obj;
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
            pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
            pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline, gi.geometry);
        }

        pipeline.culling_options.enabled=  false;

        pipeline.depth_options.enable_depth_write = true;

        pipeline.blend_options.enabled = false;

        // imageToCtx(pipeline.framebuffer.depth_buffer,ctx);
        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);


        // requestAnimationFrame(render);

    };

    render();

    "LIA: stop"
</script>

<div id="culling_container_0" width="300" height="300"></div>
@mutate.remover(culling_container_0)

## Bonus

# Test
<!--
script: https://sibaku.github.io/rasterizer_wip/src/test.js
-->

<!-- data-readOnly="false" data-showGutter="false" -->
``` js
class B extends A
{
	a() {
		console.log("A new");
	}
}
```
<script>
    @input(0)

    const b = new B();
    b.a();
    b.b();
</script>


# Final
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/final/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

Test

<script>

console.log(jsm.toString(v32.rand(4)));
console.log(jsm.toString(vec4(1,2,3,4)));

"LIA: stop"
</script>


Test put image data



<!-- data-readOnly="false" data-showGutter="false" -->
``` js
    
    const img = Image.zeroUI8C(300,300,4);

    img.forEach((x,y,img) => {
        const v = v32.rand(3);
        img.set(v,x,y);

    });
```
<script>
    const container = document.getElementById('container_1');
    container.innerHTML = "";
    const canvas = document.createElement('canvas');
    
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    @input0

    imageToCtx(img,ctx);

    "LIA: stop"
</script>

<div id="container_1" width="300" height="300"></div>
@mutate.remover(container_1)


<!-- data-readOnly="false" data-showGutter="false" -->
``` js
    
    const img = Image.zeroF32(300,300,3);

    
    const geoms = [];

    {
        const vertices = [];
        const colors = [];
        const uvs = [];

        // vertices.push(vec4(-0.5,-0.5,0.0,1.0));
        // vertices.push(vec4(0.5,-0.5,0.0,1.0));

        const num = 10;
        const r = 0.75;
        for(let i = 0; i < num; i++)
        {
            const x = r*Math.cos(Math.PI*2 * i/ (num-1));
            const y = r*Math.sin(Math.PI*2 * i/ (num-1));

            vertices.push(vec4(0.0,0.0,0.0,1.0));
            vertices.push(vec4(x,y,0.0,1.0));

            colors.push(vec4(1.0,0.0,1.0,1.0));
            colors.push(vec4(0.0,1.0,0.0,1.0));

            uvs.push(vec2(0.0,0.0));
            uvs.push(vec2(1.0,0.0));
        }

        // vertices.push(vec4(0.0,0.0,0.0,1.0));
        // vertices.push(vec4(-1.2,1.2,0.0,1.0));

        // colors.push(vec4(1.0,0.0,1.0,1.0));
        // colors.push(vec4(0.0,1.0,0.0,1.0));

        // ts.push(0.0);
        // ts.push(1.0);
        // vertices.push(vec4(0.0,0.5,0.0,1.0));

        const attributes = {};
        attributes[Attribute.VERTEX] = vertices;
        attributes["color"] = colors;
        attributes["uv"] = uvs;
        const geom = {
            attributes,
            topology: Topology.LINES
        };

        geoms.push(geom);
    }

    {
        const vertices = [];
        const colors = [];
        const uvs = [];

        vertices.push(vec4(0,-0.75,0,1));
        vertices.push(vec4(0.75,-0.75,0,1));
        vertices.push(vec4(0.75,-0,0,1));

        colors.push(vec4(1.0,0.0,0.0,1.0));
        colors.push(vec4(0.0,1.0,0.0,1.0));
        colors.push(vec4(0.0,0.0,1.0,1.0));

        uvs.push(vec2(0.0,0.0));
        uvs.push(vec2(1.0,0.0));
        uvs.push(vec2(1.0,1.0));
        
        
        const attributes = {};
        attributes[Attribute.VERTEX] = vertices;
        attributes["color"] = colors;
        attributes["uv"] = uvs;
        const geom = {
            attributes,
            topology: Topology.TRIANGLES
        };

        geoms.push(geom);
    }

     {
        const vertices = [];
        const colors = [];
        const uvs = [];

        vertices.push(vec4(-0.25,-0.75,0.5,1));
        vertices.push(vec4(0.5,-0.75,0.5,1));
        vertices.push(vec4(0.5,-0,0.5,1));

        colors.push(vec4(0.0,1.0,1.0,1.0));
        colors.push(vec4(0.0,1.0,0.0,1.0));
        colors.push(vec4(1.0,0.0,1.0,1.0));

        uvs.push(vec2(0.0,0.0));
        uvs.push(vec2(1.0,0.0));
        uvs.push(vec2(1.0,1.0));
        
        
        const attributes = {};
        attributes[Attribute.VERTEX] = vertices;
        attributes["color"] = colors;
        attributes["uv"] = uvs;
        const geom = {
            attributes,
            topology: Topology.TRIANGLES
        };

        geoms.push(geom);
    }

    const checkerboard = Image.zero(9,9);
    checkerboard.apply((x,y) => {
        const v = (x+y) % 2 === 0? 1 : 0;
        return vec4(v,v,v,1);
    });

    const pipeline = new Pipeline();
    pipeline.viewport.w = img.w;
    pipeline.viewport.h = img.h;

    pipeline.uniform_data.M = jsm.MatF32.id(4,4);
    pipeline.uniform_data.tex = checkerboard;

    const program = {
        vertex_shader : {
            run : (attributes, uniforms, outputs) => {
                outputs["color"] = attributes["color"];
                outputs["uv"] = attributes["uv"];
                return mult(uniforms.M,attributes[Attribute.VERTEX]);}
        },
        fragment_shader : {
            run : (frag_coord, data,uniforms, output_colors) => {
                const uv = data["uv"];
                // output_colors[0] = vec4(t,t,t,1.0);
                // output_colors[0] = data["color"];
                output_colors[0] = sample(uniforms.tex,uv);
                
                return true;}
        }
    };

    pipeline.program = program;

    const fb = Framebuffer.new();
    fb.color_buffers[0] = img;
    fb.depth_buffer = Image.zero(img.w,img.h,1);

    pipeline.framebuffer = fb;

    pipeline.depth_options.enable_depth_test = true;

    const raster = new RasterizerFinal();

    for(let i = 0; i < geoms.length;i++)
    {
        raster.draw(pipeline,geoms[i]);
    }


```
<script>
    const container = document.getElementById('container_2');
    container.innerHTML = "";
    const canvas = document.createElement('canvas');
    
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    @input0

    let t = 0.0;

    const render = () => {
        img.fill(vec4(0,0,0,1));
        pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

        const R = jsm.axisAngle4(vec3(0,1,0),t);
        pipeline.uniform_data.M = R;
        t+=0.01;
        for(let i = 0; i < geoms.length;i++)
        {
            raster.draw(pipeline,geoms[i]);
        }

        // imageToCtx(pipeline.framebuffer.depth_buffer,ctx);
        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);


        // requestAnimationFrame(render);

    };

    render();

    "LIA: stop"
</script>

<div id="container_2" width="300" height="300"></div>
@mutate.remover(container_2)



<!-- data-readOnly="false" data-showGutter="false" -->
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

     {
        const geom = create_plane_geometry();
        const renderable = Renderable.new(geom, {
            local_transform : transform({pos : vec3(0,-0.05,0), scale : vec3(1.0,1.0,1.0)}),
            material : {
                color : vec4(0.1,0.85,0.5,0.75),
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

 

    const pipeline = new Pipeline();
    pipeline.viewport.w = img.w;
    pipeline.viewport.h = img.h;

    pipeline.uniform_data.M = jsm.MatF32.id(4,4);
    pipeline.uniform_data.tex = checkerboard;

    const P = jsm.perspective(jsm.deg2rad(120), img.w/img.h, 0.1, 100);
    let V = jsm.lookAt(vec3(-0.5,0,0), vec3(0,0,0), vec3(0,1,0));

    const program = {
        vertex_shader : {
            run : (attributes, uniforms, outputs) => {
                outputs["uv"] = attributes[Attribute.UV];
                outputs["p_v"] = jsm.copy(jsm.subvec(mult(uniforms.MV,attributes[Attribute.VERTEX]),0,3));
                outputs["n_v"] = mult(uniforms.MV_ti,attributes[Attribute.NORMAL]);
                return mult(uniforms.MVP,attributes[Attribute.VERTEX]);}
        },
        fragment_shader : {
            run : (frag_coord, data,uniforms, output_colors) => {
                const uv = data["uv"];
                const n = jsm.normalize(data["n_v"]);
                const p = data["p_v"];
                let color = uniforms.material.color;
                
                if(uniforms.material.tex)
                {
                    color = jsm.cwiseMult(sample(uniforms.material.tex,uv),color);

                    // color = sample(uniforms.      material.tex,uv);
                }
                const l = mult(uniforms.V,vec4(-1.5,2,-2.7,1));  

                const L = jsm.normalize(jsm.fromTo( p,jsm.subvec(l,0,3)));

                const R = reflect(jsm.neg(L),n);
                const V = jsm.normalize(jsm.neg(p));

                const diff = clamp(dot(L,n),0,1);
                const spec = Math.pow(clamp(dot(R,V),0,1),16) * (diff > 0 ? 1 : 0);

                const result = jsm.copy(color);
                jsm.scale(result,diff,result);
                jsm.add(result, vec4(spec,spec,spec,1),result);

                if(uniforms.material.emission)
                {
                    add(result,uniforms.material.emission,result);
                }
                result.set(color.at(3),3);
                // output_colors[0] = vec4(t,t,t,1.0);
                // output_colors[0] = data["color"];
                // output_colors[0] = vec4(diff,diff,diff,1);
                output_colors[0] = result;
                
                return true;}
        }
    };

    pipeline.program = program;

    const fb = Framebuffer.new();
    fb.color_buffers[0] = img;
    fb.depth_buffer = Image.zero(img.w,img.h,1);

    pipeline.framebuffer = fb;

    pipeline.depth_options.enable_depth_test = true;


```
<script>
    const container = document.getElementById('container_3');
    container.innerHTML = "";
    const canvas = document.createElement('canvas');
    
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    @input0

    let t = 0.0;

    const opaque = [];
    const transparent = [];

    const raster = new Rasterizer();


    for(let i = 0; i < geoms.length;i++)
    {
        const gi = geoms[i];
        if(gi.material && gi.material.transparent)
        {
            const {bmin,bmax,center,half_size} = compute_geometry_bounds(gi.geometry.attributes[Attribute.VERTEX]);

            transparent.push({obj: gi, center});
        }
        else
        {
            opaque.push(gi);
        }
    }
    const render = () => {
        img.fill(vec4(0,0,0,1));
        pipeline.framebuffer.depth_buffer.fill(vec4(1,1,1,1));

        V = mult(V,jsm.axisAngle4(vec3(0,1,0),0.01));
        const VP = mult(P,V);
        pipeline.uniform_data.V = V;
        pipeline.uniform_data.P = P;
        pipeline.uniform_data.VP = VP;

        // compute view z
        transparent.forEach(currentValue => {
            const res = mult(V,mult(currentValue.obj.local_to_world, currentValue.center));
            currentValue.z = res.at(2);
        });

        transparent.sort((a,b) => a.z - b.z);



        const R = jsm.axisAngle4(vec3(0,1,0),t);
        t+=0.01;
        for(let i = 0; i < opaque.length;i++)
        {
            const gi = opaque[i];
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
            pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
            pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline,gi.geometry);
        }

        pipeline.blend_options.enabled = true;
        pipeline.blend_options.source_function = BlendFunction.SRC_ALPHA;
        pipeline.blend_options.destination_function = BlendFunction.ONE_MINUS_SRC_ALPHA;

        pipeline.depth_options.enable_depth_write = false;


        pipeline.culling_options.enabled =  true;

        for(let i = 0; i < transparent.length;i++)
        {
            const gi = transparent[i].obj;
            pipeline.uniform_data.M = gi.local_to_world;
            pipeline.uniform_data.MVP = mult(pipeline.uniform_data.VP,pipeline.uniform_data.M);
            pipeline.uniform_data.MV = mult(pipeline.uniform_data.V,pipeline.uniform_data.M);
            pipeline.uniform_data.MV_ti = jsm.inv(jsm.block(jsm.transpose(pipeline.uniform_data.MV),0,0,3,3));
            pipeline.uniform_data.material = gi.material;

            raster.draw(pipeline, gi.geometry);
        }

        pipeline.culling_options.enabled=  false;

        pipeline.depth_options.enable_depth_write = true;

        pipeline.blend_options.enabled = false;

        // imageToCtx(pipeline.framebuffer.depth_buffer,ctx);
        imageToCtx(pipeline.framebuffer.color_buffers[0],ctx);


        // requestAnimationFrame(render);

    };

    render();

    "LIA: stop"
</script>

<div id="container_3" width="300" height="300"></div>
@mutate.remover(container_3)

