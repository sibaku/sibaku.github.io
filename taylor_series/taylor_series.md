<!--
author:   sibaku

email:    

version:  0.0.1

language: en

narrator: US English Female

script: https://cdn.plot.ly/plotly-2.12.1.min.js
        https://cdn.rawgit.com/davidedc/Algebrite/master/dist/algebrite.bundle-for-browser.js

comment:  A short introduction for Taylor Series
-->

# Taylor Series

We will now have a look at how to approximate a function, given that we know its derivatives at a point. 
Note that we will not cover topics such as the existance of such an approximation or whether it actually converges to the function itself.

To understand the following, you only need to have some basic knowledge of functions and how to calculate derivatives.

For now consider just some normal function $f(x)$ that we can keep differentiating. 
While this function is nice, for various reasons we might try to find a different expression to represent it.
Maybe for some theoretical reason or maybe just to compute it in a different way.

One important class of functions are polynomials, the sums of different powers of $x$ with a coefficient for each entry. It looks like this:

$$
\operatorname{p}(x) = a_0 + a_1 x + a_2 x^2 + a_3 x^3 + \dots
$$

As a quick reminder, the derivative of the term $ax^k$ is $akx^{k-1}$, e.g. $(2x^4)' = 8x^3$.
The derivative of a sum is just the sum of the derivatives of each term.
This allows us to easily derive polynomials.

You probably remember from math classes, that the value of the first derivative at a point will give you the slope of the tangent touching the function at that point.
That is, a linear function that, if you look very closely at the point, will roughly coincide with the original function in that small region.
Higher derivatives are pretty similar, just that they don't correspond to a line, but represent the curving around of the function.
The higher the derivative, the more precise the type of wiggling it describes.

As an example, look at a quadratic polynomial $\operatorname{p}(x) = a_0 + a_1 x + a_2x^2$.
When we take the second derivatige we get the following:

$$
    \begin{align*}
    \operatorname{p}(x) &= a_0 + a_1 x + a_2x^2 \\
    \operatorname{p}(x)' &= a_1 + 2a_2x \\
    \operatorname{p}(x)'' &= 2a_2 
    \end{align*}
$$

We got (with a factor of $2$) the coefficient of the quadratic term, which regulates how the parabola of a quadratic function looks like.

The basic idea is, that we want our function $\operatorname{f}$ to agree with the value of $\operatorname{p}$ at a certain point.
But we also want all of their derivatives at that point to agree! 
That way they "wiggle" the same way and thus should probably look the same in a region around that point.

How can we encode that in math?

First, let's choose an easy point to evaluate: $x=0$. 

Now $\operatorname{f}$ and $\operatorname{p}$ should have the same value at $x=0$:

$$
    \begin{align*}
    \operatorname{f}(0) &= \operatorname{p}(0) \\
    &= a_0 + a_1 0 + a_2 0^2 + a_3 0^3 + \dots \\
    &= a_0
    \end{align*}
$$

All the terms with $x$ vanish at $0$! This leaves only the first coefficient.
And with that, we know that we should choose $a_0 = \operatorname{f}(0)$.

Let's look at a function, say $e^x$. The value at $0$ is $1$, so we have a horizontal line at $y=1$, which is the polynomial with degree zero: $\operatorname{p}(x) = 1$:

<div id="id_0" style="width:100%;height:50%;"></div>

<script>

let expr = Algebrite.run(`exp(x)`);

const k = 1;

let derivatives = [expr];
for (let i = 1; i < k; i++) {
    derivatives.push(Algebrite.run(`d(${derivatives[i - 1]},x)`));
}

let taylor = [];

for (let i = 0; i < k; i++) {
    const last_expr = i > 0 ? `+ (${taylor[i - 1]})` : "";
    taylor.push(Algebrite.run(`eval(${derivatives[i]},x,0)/(${i}!) * x^${i} ${last_expr}`))
}
let dexpr = Algebrite.run(`d(${expr},x)`);

const div = document.getElementById('id_0');

const xmin = 0;
const xmax = 4;
const xdelta = xmax - xmin;
const n = 1000;

const xs = [];
for (let i = 0; i < n; i++) {
    xs.push(i / (n - 1) * xdelta);
}
let data = [];

// base function
const ys = [];
let ymin = Infinity;
let ymax = -Infinity;
for (let i = 0; i < n; i++) {
    const y = parseFloat(Algebrite.run(`eval(${expr},x,${xs[i]})`));
    ymin = Math.min(ymin, y);
    ymax = Math.max(ymax, y);
    ys.push(y);
}
const ycenter = (ymax + ymin) * 0.5;
const yrad = (ymax - ymin) * 0.5;


data.push(
    {
        x: xs,
        y: ys,
        mode: 'lines',
        name: expr,
        visible: true

    }
);

for (let j = 0; j < k; j++) {
    const yis = [];

    for (let i = 0; i < n; i++) {
        const y = parseFloat(Algebrite.run(`eval(${taylor[j]},x,${xs[i]})`));
        yis.push(y);
    }
    data.push(
        {
            x: xs,
            y: yis,
            mode: 'lines',
            name: `Taylor Degree: ${j}`,
            visible: true
        }
    );
}

let layout = {
    title: 'Approximation of a e^x with a Taylor polynomial of degree 0',
    xaxis: {
        title: 'x',

    },
    yaxis: {

        title: 'y',
        autorange: false,
        range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
    },

};
Plotly.newPlot(div, data, layout);

"LIA: stop"
</script>

Let's go further. Let the first derivatives agree as well. First let's compute the first derivative of $\operatorname{p}$.

$$
    \begin{align*}
    \operatorname{p}'(x) &= (a_0 + a_1 x + a_2 x^2 + a_3 x^3 + a_4x^4 \dots)'\\
    &= a_1 + 2a_2 x + 3a_3 x^2 + 4a_4x^3 \dots
    \end{align*}
$$

Then add our condition:
$$
    \begin{align*}
    \operatorname{f}'(0) &= \operatorname{p}'(0) \\
    &=a_1 + 2a_2 0 + 3a_3 0^2 + 4a_40^3 + \dots \\
    &= a_1
    \end{align*}
$$

As before, we are only left with one non-zero term: $a_1 = \operatorname{f}'(0)$.

We can look at the previous example and note the nice property, that $(e^x)' = e^x$. So we have $a_1 = e^0 = 1$. And with that a polynomial of degree $1$ with $\operatorname{p}(x) = 1 + x$

<div id="id_1" style="width:100%;height:50%;"></div>

<script>

let expr = Algebrite.run(`exp(x)`);

const k = 2;

let derivatives = [expr];
for (let i = 1; i < k; i++) {
    derivatives.push(Algebrite.run(`d(${derivatives[i - 1]},x)`));
}

let taylor = [];

for (let i = 0; i < k; i++) {
    const last_expr = i > 0 ? `+ (${taylor[i - 1]})` : "";
    taylor.push(Algebrite.run(`eval(${derivatives[i]},x,0)/(${i}!) * x^${i} ${last_expr}`))
}
let dexpr = Algebrite.run(`d(${expr},x)`);

const div = document.getElementById('id_1');

const xmin = 0;
const xmax = 4;
const xdelta = xmax - xmin;
const n = 1000;

const xs = [];
for (let i = 0; i < n; i++) {
    xs.push(i / (n - 1) * xdelta);
}
let data = [];

// base function
const ys = [];
let ymin = Infinity;
let ymax = -Infinity;
for (let i = 0; i < n; i++) {
    const y = parseFloat(Algebrite.run(`eval(${expr},x,${xs[i]})`));
    ymin = Math.min(ymin, y);
    ymax = Math.max(ymax, y);
    ys.push(y);
}
const ycenter = (ymax + ymin) * 0.5;
const yrad = (ymax - ymin) * 0.5;


data.push(
    {
        x: xs,
        y: ys,
        mode: 'lines',
        name: expr,
        visible: true

    }
);

for (let j = 0; j < k; j++) {
    const yis = [];

    for (let i = 0; i < n; i++) {
        const y = parseFloat(Algebrite.run(`eval(${taylor[j]},x,${xs[i]})`));
        yis.push(y);
    }
    data.push(
        {
            x: xs,
            y: yis,
            mode: 'lines',
            name: `Taylor Degree: ${j}`,
            visible: true
        }
    );
}

let layout = {
    title: 'Approximation of a e^x with a Taylor polynomial of degree 1',
    xaxis: {
        title: 'x',

    },
    yaxis: {

        title: 'y',
        autorange: false,
        range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
    },

};
Plotly.newPlot(div, data, layout);

"LIA: stop"
</script>

We will do one last step before the general version. Do a second derivative, that is derive the first derivative again.

$$
    \begin{align*}
    \operatorname{p}''(x) &=  ( \operatorname{p}'(x))'\\
    &= (a_1 + 2a_2 x + 3a_3 x^2 + 4a_4x^3 \dots)'\\
    &= 2a_2 + 6a_3 x + 12a_4x^2 \dots
    \end{align*}
$$

The next step is basically the same as before, but has a slight difference:

$$
    \begin{align*}
    \operatorname{f}''(0) &= \operatorname{p}''(0) \\
    &=2a_2 + 6a_3 0 + 12a_4 0^2 \dots \\
    &= 2a_2 \\
    \frac{\operatorname{f}''(0)}{2} &= a_2
    \end{align*}
$$

This time, we have a factor of $\frac{1}{2}$!

Continuing with $e^x$ and that it stays the same under differentiation, we have $a_2 = \frac{e^0}{2} = \frac{1}{2}$. This gives us the quadratic polynomial $\operatorname{p}(x) = 1 + x + \frac{x^2}{2}$.

<div id="id_2" style="width:100%;height:50%;"></div>

<script>

let expr = Algebrite.run(`exp(x)`);

const k = 3;

let derivatives = [expr];
for (let i = 1; i < k; i++) {
    derivatives.push(Algebrite.run(`d(${derivatives[i - 1]},x)`));
}

let taylor = [];

for (let i = 0; i < k; i++) {
    const last_expr = i > 0 ? `+ (${taylor[i - 1]})` : "";
    taylor.push(Algebrite.run(`eval(${derivatives[i]},x,0)/(${i}!) * x^${i} ${last_expr}`))
}
let dexpr = Algebrite.run(`d(${expr},x)`);

const div = document.getElementById('id_2');

const xmin = 0;
const xmax = 4;
const xdelta = xmax - xmin;
const n = 1000;

const xs = [];
for (let i = 0; i < n; i++) {
    xs.push(i / (n - 1) * xdelta);
}
let data = [];

// base function
const ys = [];
let ymin = Infinity;
let ymax = -Infinity;
for (let i = 0; i < n; i++) {
    const y = parseFloat(Algebrite.run(`eval(${expr},x,${xs[i]})`));
    ymin = Math.min(ymin, y);
    ymax = Math.max(ymax, y);
    ys.push(y);
}
const ycenter = (ymax + ymin) * 0.5;
const yrad = (ymax - ymin) * 0.5;


data.push(
    {
        x: xs,
        y: ys,
        mode: 'lines',
        name: expr,
        visible: true

    }
);

for (let j = 0; j < k; j++) {
    const yis = [];

    for (let i = 0; i < n; i++) {
        const y = parseFloat(Algebrite.run(`eval(${taylor[j]},x,${xs[i]})`));
        yis.push(y);
    }
    data.push(
        {
            x: xs,
            y: yis,
            mode: 'lines',
            name: `Taylor Degree: ${j}`,
            visible: true
        }
    );
}

let layout = {
    title: 'Approximation of a e^x with a Taylor polynomial of degree 2',
    xaxis: {
        title: 'x',

    },
    yaxis: {

        title: 'y',
        autorange: false,
        range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
    },

};
Plotly.newPlot(div, data, layout);

"LIA: stop"
</script>

As you can see, the starts to look more like the actual function!

If we do the same thing for the third derivative, you can most likely see,
that the next factor will be $\frac{1}{6}$, since $6$ is the factor added from the repeated differentiation.

When we now think about some generic term in the sum, let's say it is the $n$-th one: $a_nx^n$. 
When will we get to the same point as with the previous examples, where only the coefficient will be left behind after putting in $ß$?

It will be after differentiation $n$ times, such that $x^n$ becomes $x^0 = 1$.

What kind of factor will that give us?

$$
    \begin{align*}
        (x^n)' &= nx^{n-1} \\
        (nx^{n-1})' &= (n-1)nx^{n-2} \\
        ((n-1)nx^{n-2})' &= (n-2)(n-1)nx^{n-3}\\
        \dots &
    \end{align*}
$$

From this you might already guess the pattern. 
The final factor before the coefficient will be the product of all numbers from $1$ up to $n$, so $1 * 2 * 3 *\dots * n$.
There is even a fancy math way to write this, called the factorial:

$$
 1* 2 * 3 *\dots * n = n!
$$

To make stuff work out nicely, we define $0! = 1$.

This works out with all previous examples. 

* $a_0$ needed $0$ derivatives, so the factor is $1 = 0!$
* $a_1$ needed $1$ derivative, so the factor is $1 = 1!$
* $a_2$ needed $2$ derivatives, so the factor is $2 = 1*2 = 2!$
* $a_3$ needed $3$ derivatives, so the factor is $6 = 1*2*3 = 3!$

To find the coefficient, we just have to divide by the factor in front of it!

With that we can actually write down the polynomial that agrees with our given function in all derivatives at $x=0$:

$$
    \begin{align*}

    \operatorname{p}(x) &= \operatorname{f}(0) + \operatorname{f}'(0)x + \frac{\operatorname{f}''(0)}{2}x^2+ \frac{\operatorname{f}'''(0)}{6}x^3 + \dots \\
    &= \frac{\operatorname{f}^{(0)}(0)}{0!}x^0 + \frac{\operatorname{f}^{(1)}(0)}{1!}x^1 + \frac{\operatorname{f}^{(2)}(0)}{2!}x^2 + \frac{\operatorname{f}^{(3)}(0)}{3!}x^3 + \dots
    \end{align*}

$$

Here, the notation $\operatorname{f}^{(n)}$ means the $n$-th derivative. 

We can also see, that it looks very regular! The degree of the derivative corresponds to the power of $x$ and the factorial!

We can write this down even more compact by using another math notation: The sum formula.

$$
\operatorname{p}(x) = \sum_{i=0}^{\infty}\frac{\operatorname{f}^{(i)}(0)}{i!}x^i
$$

This just means, that we will use a number $i$ as a placeholder for all integers starting from $0$ (that is the $i=0$ part) and never stopping, so going to infinity (that is the top $\infty$).
Each of these $i$ will then be put into the formula to the right and the result of that is added to the whole. 
So if you set $i=0$ you get the first term in the formula from before. If you set $i=1$, you get the second one and so on. 
The $\sum$ symbol is just a greek Sigma, basically just an "S" for "sum.

While that might look scary at first, I hope you have seen what it means and that it isn't that it looks worse than it actually is!

This is more or less the formula you will find in a textbook, although there the more general form, where you don't need to start at $x=0$ is used, the idea is exactly the same though.

You can type in any function that you like in the following little input box using standard math notation. If you then click on the small execute symbol below, you can scroll through approximations with increasing numbers of terms. If you feel more adventurous, you can open the second entry box to change parameters of the calculations.

```
sin(x)
```
```javascript -Config.js
// The number of terms in the approximation, will be at least 1
// For very high values, this might take a bit to compute
let k = 11;
// The minimum x coordinate of the computed region
const xmin = 0;
// The maximum x coordinate of the computed region
const xmax = 2.0*Math.PI;
```
<script>

@input(1)


// The number of points to be sampled, 
const n = 1000;

k = Math.max(1,k);
let expr = Algebrite.run(`@'input(0)`);


let derivatives = [expr];
for (let i = 1; i < k; i++) {
    derivatives.push(Algebrite.run(`d(${derivatives[i - 1]},x)`));
}

let taylor = [];

for (let i = 0; i < k; i++) {
    const last_expr = i > 0 ? `+ (${taylor[i - 1]})` : "";
    taylor.push(Algebrite.run(`eval(${derivatives[i]},x,0)/(${i}!) * x^${i} ${last_expr}`))
}
let dexpr = Algebrite.run(`d(${expr},x)`);

const div = document.getElementById('full_id');


const xdelta = xmax - xmin;

const xs = [];
for (let i = 0; i < n; i++) {
    xs.push(i / (n - 1) * xdelta);
}

let data = [];

// base function
const ys = [];
let ymin = Infinity;
let ymax = -Infinity;
for (let i = 0; i < n; i++) {
    const y = parseFloat(Algebrite.run(`eval(${expr},x,${xs[i]})`));
    ymin = Math.min(ymin, y);
    ymax = Math.max(ymax, y);
    ys.push(y);
}
const ycenter = (ymax + ymin) * 0.5;
const yrad = (ymax - ymin) * 0.5;


data.push(
    {
        x: xs,
        y: ys,
        mode: 'lines',
        name: expr,
        visible: true

    }
);

for (let j = 0; j < k; j++) {
    const yis = [];

    for (let i = 0; i < n; i++) {
        const y = parseFloat(Algebrite.run(`eval(${taylor[j]},x,${xs[i]})`));
        yis.push(y);
    }
    data.push(
        {
            x: xs,
            y: yis,
            mode: 'lines',
            name: `Taylor Degree: ${j}`,
           visible: (j===0)

        }
    );
}

const steps = [];
for (let j = 0; j < k; j++) {
    const visibilities = [true];
    for (let i = 0; i < k; i++) {
        visibilities.push(false);
    }

    visibilities[j + 1] = true;

    steps.push({

        label: j,

        method: 'restyle',

        args: ['visible', visibilities]

    });
}
let layout = {
    title: 'Approximation of a function with a Taylor polynomial',
    xaxis: {
        title: 'x',

    },
    yaxis: {

        title: 'y',
        autorange: false,
        range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
    },
    sliders: [{

        pad: { t: 50 },
        active:0,
        currentvalue: {
            xanchor: 'left',
            prefix: 'Maximum degree: ',

            font: {
                color: '#888',
                size: 20
            }

        },
        steps
    }]

};
Plotly.newPlot(div, data, layout);
"LIA: stop"
</script>

<div id="full_id" style="width:100%;height:50%;"></div>