<!--
author:   sibaku

email:    

version:  0.0.1

language: en

script: https://sibaku.github.io/rasterizer_wip/lib/jsmatrix_no_module.js
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

Below you can see the solution.
You can adjust parameters or run it multiple times to see how the randomness affects the result.

<!-- data-readOnly="false" data-showGutter="false" -->
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


### Drawing some lines
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/01_drawing_lines/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
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

<!-- data-readOnly="false" data-showGutter="false" -->
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

        // the final fragment coordinate
        const frag_coord = vec4(px.at(0), px.at(1), 0.0, 1.0);
        // run  fragment shader with data

        // buffer for colors
        const output_colors = {};

        output_colors[0] = vec4(1, 0, 0, 1);

        this.write_fragment(pipeline, frag_coord, output_colors);

    }
}
```
<!-- data-readOnly="false" data-showGutter="false" -->
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

<div id="draw_some_lines_container_0"></div>
@mutate.remover(draw_some_lines_container_0)

The following hidden code shows the solution:

<!-- data-readOnly="false" data-showGutter="false" -->
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
<!-- data-readOnly="false" data-showGutter="false" -->
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

<div id="draw_all_lines_container_1"></div>
@mutate.remover(draw_all_lines_container_1)


You should be able to see some red lines in the right half of a circle. 
The left half is missing.
If you look closely, some of the lines have gaps, which doesn't look that nice.

In the next section, we will fix these issues, but feel free to think about what is causing them and how to solve this!

### Drawing all lines
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/01_drawing_lines/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

In the last section, we had a problem with only lines going from left to right being drawn, some lines having gaps and vertical lines not even being being defined.

We will start with the first issue, as it is the easiest to solve.

We basically just think about how the line looks on the screen.
Does it look different, if we go from $\mathbf{b}$ to $\mathbf{a}$ instead of the original order of $\mathbf{a}$ to $\mathbf{b}$?

This will of course still be the same line, if we draw it!
So we can just switch $$\mathbf{a}$ and $\mathbf{a}$, if the line goes from right to left!

Try it out below!

<!-- data-readOnly="false" data-showGutter="false" -->
``` js
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
<!-- data-readOnly="false" data-showGutter="false" -->
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
Now draw another line with $alpha$, but this time with respect to the $y$-axis.

When you look at them both, those line basically look the same, just mirrored along the diagonal!
You could also flip over your piece of paper and rotate it, such that the $y$-axis now points in the $x$-direction. Then $x$-will point to the old $y$.

We use this knowledge to swap the $x$ and $y$ coordinates, if $|m|>1$. 
In matrix terms, this is just like transposing the image.
$|m|$ will be greater than $1$, when the absolute change in $y$ is greater than the one in $x$.

Using this criterion instead of the value of $m$ also allows us to handle vertical lines!
If we used $m$, we might encounter a division by zero or some other issues beforehand, depending on our language of choice.

Switching out the $x$ and $y$ coordinates does change how the line would like, in contrast to the left-right flip.
To counter that, we just have to remember, if we switched and switch back when we specify the pixel coordinate to write to.

Keep in mind to do the left-right switch after the transposition, as the line might go from left to right when looked at from the $y$ direction!

Try it out! Below this codeblock, you can find the (hidden) final code, that you can expand to look at. 
But you can also run it without looking at it to see the expected result.

<!-- data-readOnly="false" data-showGutter="false" -->
``` js
class RasterizerTutorial extends Rasterizer
{
    rasterize_line(pipeline, p0, p1)
    {
      
            // use integer coordinates
            let x0 = Math.floor(p0.at(0));
            let y0 = Math.floor(p0.at(1));

            let x1 = Math.floor(p1.at(0));
            let y1 = Math.floor(p1.at(1));

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
<!-- data-readOnly="false" data-showGutter="false" -->
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

<div id="draw_all_lines_container_1"></div>
@mutate.remover(draw_all_lines_container_1)


**The final result:**

<!-- data-readOnly="false" data-showGutter="false" -->
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
<!-- data-readOnly="false" data-showGutter="false" -->
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


[^1]: Robert F. Sproull and Ivan E. Sutherland. 1968. A clipping divider. In Proceedings of the December 9-11, 1968, fall joint computer conference, part I (AFIPS '68 (Fall, part I)). Association for Computing Machinery, New York, NY, USA, 765–775. https://doi.org/10.1145/1476589.1476687

### Region codes
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/02_clipping_lines/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
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


<!-- data-readOnly="true" data-showGutter="false" -->
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
<!-- data-readOnly="false" data-showGutter="false" -->
```js
function region_code(x, y, minx, miny, maxx, maxy) {

    let result = 0;

    // compute the actual code

    return result;
}
```
``` js -fillImage.js
const img = Image.zeroF32(300, 300, 4);


const bmin = vec2(60,60);
const bmax = vec2(240,240);

for(let y = 0; y < img.h; y++)
{
    for(let x = 0; x < img.w; x++)
    {
        const code =  region_code(x, y, bmin.at(0), bmin.at(1), bmax.at(0),bmax.at(1));

        let color = vec4(0,0,0,1);

        // we could also use a switch case in this case, since we use actual equalities
        if(code === (SCREEN_CODE_LEFT | SCREEN_CODE_TOP))
        {
            color = ctl;
        }
        else if(code === (SCREEN_CODE_TOP))
        {
            color = ctm;
        }
        else if(code === (SCREEN_CODE_RIGHT | SCREEN_CODE_TOP))
        {
            color = ctr;
        }
        else if(code === (SCREEN_CODE_LEFT))
        {
            color = cml;
        }
        else if(code === (SCREEN_CODE_RIGHT))
        {
            color = cmr;
        }
        else if(code === (SCREEN_CODE_LEFT | SCREEN_CODE_BOTTOM))
        {
            color = cbl;
        }
        else if(code === (SCREEN_CODE_BOTTOM))
        {
            color = cbm;
        }
        else if(code === (SCREEN_CODE_RIGHT | SCREEN_CODE_BOTTOM))
        {
            color = cbr;
        }else
        {
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


You should see the image you get from running the code below (contains the solution).


<!-- data-readOnly="true" data-showGutter="false" -->
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
<!-- data-readOnly="false" data-showGutter="false" -->
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

for(let y = 0; y < img.h; y++)
{
    for(let x = 0; x < img.w; x++)
    {
        const code =  region_code(x, y, bmin.at(0), bmin.at(1), bmax.at(0),bmax.at(1));

        let color = vec4(0,0,0,1);

        // we could also use a switch case in this case, since we use actual equalities
        if(code === (SCREEN_CODE_LEFT | SCREEN_CODE_TOP))
        {
            color = ctl;
        }
        else if(code === (SCREEN_CODE_TOP))
        {
            color = ctm;
        }
        else if(code === (SCREEN_CODE_RIGHT | SCREEN_CODE_TOP))
        {
            color = ctr;
        }
        else if(code === (SCREEN_CODE_LEFT))
        {
            color = cml;
        }
        else if(code === (SCREEN_CODE_RIGHT))
        {
            color = cmr;
        }
        else if(code === (SCREEN_CODE_LEFT | SCREEN_CODE_BOTTOM))
        {
            color = cbl;
        }
        else if(code === (SCREEN_CODE_BOTTOM))
        {
            color = cbm;
        }
        else if(code === (SCREEN_CODE_RIGHT | SCREEN_CODE_BOTTOM))
        {
            color = cbr;
        }else
        {
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
script: https://sibaku.github.io/rasterizer_wip/src/stages/02_clipping_lines/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
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


<!-- data-readOnly="true" data-showGutter="false" -->
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

        // TODO Implement the loop
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
<!-- data-readOnly="false" data-showGutter="false" -->
``` js -scene.js

const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{

    const attributes = {};

    const vertices = [];

    const num = 100;
    const r = 1.75 * Math.max(img.w,img.h);
    
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

The following shows the solution. 
You can run it to check your result.

<!-- data-readOnly="true" data-showGutter="false" -->
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
<!-- data-readOnly="false" data-showGutter="false" -->
``` js -scene.js

const img = Image.zeroF32(300, 300, 4);

const geoms = [];

{

    const attributes = {};

    const vertices = [];

    const num = 100;
    const r = 1.75 * Math.max(img.w,img.h);
    
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

<div id="clip_lines_container_1"></div>
@mutate.remover(clip_lines_container_1)

## 03: Draw a triangle

In this section, we will finally move on from lines to get to triangles, probably the most important shape in computer graphics.

There are a lot of variants on how to rasterize triangles, from different ways on how to determine the pixels to parallelization. We will use a very simple approach, that is nethertheless a good basis to understand more complicated algorithms. It is more or less the one presented in a very early paper by Juan Pineda [^1].

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

<!-- data-readOnly="false" data-showGutter="false" -->
``` js
/**
 * Computes the minimum and maximum coordinates of an array of points
 * @param {Array<AbstractMat>} points The input points
 * @returns [bmin,bmax]
*/
function compute_screen_bounds(points) {
    // compute triangle screen bounds
    let bmin = vec2(Infinity, Infinity);
    let bmax = vec2(-Infinity, -Infinity);

    
    // TODO

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
    
    // TODO
    // clamp bounds so they lie inside the image region

    // TODO
    // handle case where its fully outside

    // TODO
    // iterate over the bounded region

}
```
<!-- data-readOnly="false" data-showGutter="false" -->
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

Here is the solution:

<!-- data-readOnly="false" data-showGutter="false" -->
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
<!-- data-readOnly="false" data-showGutter="false" -->
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

<!-- data-readOnly="false" data-showGutter="false" -->
``` js 
/**
 * Computes twice the signed area of a given 2D triangle.
 * The triangle is assumed to be defined anti-clockwise
 * @param {AbstractMat} v0 The first 2D point
 * @param {AbstractMat} v1 The second 2D point
 * @param {AbstractMat} v2 The third 2D point
 * @returns Twice the signed area
 */
function signed_tri_area_doubled(v0, v1, v2) {
    // TODO 
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

    // TODO
    // compute the double triangle area only once

    // TODO
    // check if any the triangle has zero area with some epsilon, if so, don't rasterize


    for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
        for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {

            // sample point in center of pixel
            const p = add(vec2(x, y), vec2(0.5, 0.5));

            // TODO
            // compute barycentric coordinates
            // if any is negative -> continue

            img.set(vec4(1,0,0,1),x,y);
        }
    }
}
```
<!-- data-readOnly="false" data-showGutter="false" -->
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



<!-- data-readOnly="false" data-showGutter="false" -->
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
    // TODO 
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

    // TODO
    // compute the double triangle area only once
    const area_tri = signed_tri_area_doubled(v0, v1, v2);

    // TODO
    // check if any the triangle has zero area with some epsilon, if so, don't rasterize
    const epsilon = 1E-8;
    if (Math.abs(area_tri) < epsilon) {
        return;
    }
    for (let y = ibmin.at(1); y <= ibmax.at(1); y++) {
        for (let x = ibmin.at(0); x <= ibmax.at(0); x++) {

            // sample point in center of pixel
            const p = add(vec2(x, y), vec2(0.5, 0.5));

            // TODO
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
<!-- data-readOnly="false" data-showGutter="false" -->
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
script: https://sibaku.github.io/rasterizer_wip/src/stages/03_rasterize_tri/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

This last step is more of a formality. 
We can now rasterize triangles! 
The only thing missing is putting this together with the rest of the pipeline.

As this does not really involve anything complicated, we will just look at the relevant code.
The functions for computing the edge functions and the triangle rasterization of the last steps are integrated into the rasterizer as `signed_tri_area_doubled` and `rasterize_triangle`, the only actual change being writing out a color with the `write_fragment` method instead of directly setting the pixel.

Otherwise, we extend the `draw` method, so it will go through a list of triangles and calls a precessing method `process_triangle` for each of them. The `process_triangle` itself will just call our new `rasterize_triangle` method for now.

<!-- data-readOnly="false" data-showGutter="false" -->
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
    rasterize_triangle(pipeline, v0, v1,
        v2) {

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
<!-- data-readOnly="false" data-showGutter="false" -->
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
<!--
script: https://sibaku.github.io/rasterizer_wip/src/stages/04_poly_clip/rasterizer.js
        https://sibaku.github.io/rasterizer_wip/src/geometry_utils.js
-->

This section will cover clipping polygons at arbitrary planes (lines work pretty much the same way).
While this isn't needed immediately, it fits best here, since we already did simple clipping with a line.
We will implement it in a way, that is very generic and can be used without change (aside from one part, as we will later add more data) even in 3D (and beyond). 
We will later on need at least one clipping plane for the full 3D rasterization to work without special cases, so it will be nice to have this already sorted out.


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

    @input(0)

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