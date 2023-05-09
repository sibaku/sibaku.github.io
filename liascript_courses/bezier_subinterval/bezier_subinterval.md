<!--
author: sibaku

version:  0.0.1

language: en

attribute: [Sibaku github.io](https://sibaku.github.io/)
    by sibaku (he/him) ([twitter](https://twitter.com/sibaku1), [mastodon](https://mas.to/@sibaku), [cohost](https://cohost.org/sibaku))
    is licensed under [MIT](https://opensource.org/licenses/MIT)

-->

# Introduction

Recently I made a small demo, where I wanted to specify a subinterval of a Bézier curve and then create a new curve for that subinterval.

A JSFiddle demonstration can be found here: https://jsfiddle.net/zf0dv7nh/

??[Demo](https://jsfiddle.net/zf0dv7nh/show)

The next section shows the algorithm and afterwards you can see the derivation of everything.

It turns out, that it is pretty easy to that, just requiring a small modification of the common de Casteljau algorithm. At the same time, it is really hard to actually find the complete derivation on why it works. Most sources I have found only show parts of it, where the missing parts are "obvious". Others are very nice in theory, but are a bit more complicated.

One example is the very nice generalization by DeRose [^1]. There, a de Casteljau-like algorithm is presented for an arbitrary reparametrization described in Bernstein polynomial form.

Another example is the more abstract technique called blossoming. You can read more about it here [^2]. While this is very interesting and can capture a lot of effects, it also requires additional theory and notation.

This document contains all derivations to arrive at the algorithm and just needs the knowledge you would commonly have, when being introduced to Bèzier curves.

[^1]: Tony D. DeRose. 1988. Composing Bézier simplexes. ACM Trans. Graph. 7, 3 (July 1988), 198–221. https://doi.org/10.1145/44479.44482

[^2]: Ramshaw, L. 1987. Blossoming: A connect-the-dots approach to splines. Palo Alto: Digital Equipment Corporation. https://www.hpl.hp.com/techreports/Compaq-DEC/SRC-RR-19.html?jumpid=reg_r1002_zaen

# Algorithm

Given is a Bézier curve with $n+1$ control points $\mathbf{p}_i$ with $i=0,\dots,n$.

We want to create the control points for a new curve corresponding to the parameter range $[t_l, t_u]$ of the original curve.

For that, we will use the well documented de Casteljau algorithm. A quick explanation and code can be found at Wikipedia (https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm), but it is very easy to find code in many languages.

Here is a basic JavaScript code snippet:

```js
function deCasteljau(points, t) {
  // copy the points to a new array
  points = [...points];
  const n = points.length - 1;

  for (let j = 1; j <= n; j++) {
    for (let i = 0; i <= n - j; i++) {
    // lerp computes a linear interpolation and depends on the point type
    // mathematically it is just: lerp(a,b,t) = (1-t)a + tb
    points[i] = lerp(points[i], points[i + 1], t);
    }
  }
  // the resulting point is at index 0
  return points[0];
}
```

Here is a description, below is JavaScript pseudo code.

1. Split the curve given by the points $\mathbf{p}_i$ to the left to get the range $[0,t_u]$. For that, insert the first point of the curve into an array. Then run the de Casteljau algorithm with the parameter $t_u$ and after each step append the first point to the array. So the last point will be the resulting point for $\mathbf{p}(t_u)$. We call these new points $\mathbf{q}_i$
2. Split the resulting subcurve from step **(1)** defined by the $\mathbf{q}_i$ to the right to get the range $[t_l,t_u]$. For that, insert the last point of the curve into an array. Then run the de Casteljau algorithm with the parameter $\frac{t_l}{t_u}$ and after each step append the last point to the array. So the last point will be the resulting point for $\mathbf{q}(\frac{t_l}{t_u})$. We call these new points $\mathbf{r}_i$. This is the result. **NOTE:** As there is one point less after each step, the last point at step $j$ has the index $n-j$, assuming a $0$-based index

So splitting a curve comes down to performing the de Casteljau algorithm two times. Here, we will show a JavaScript version of the modified de Casteljau algorithm, that compiles the control points for the left and right splits together. This can of course be optimized, but works.

```js
function subdivideBezierControlPoints(points, t) {
  // copy the points to a new array
  points = [...points];

  // arrays could be preallocated
  // we initially add the first point for the left and last point to the right
  const left = [points[0]];
  const right = [points[points.length - 1]];

  const n = points.length - 1;

  for (let j = 1; j <= n; j++) {
    for (let i = 0; i <= n - j; i++) {
      points[i] = lerp(points[i], points[i + 1], t);
    }
    // add the first and last point after each step to left and right respectively
    left.push(points[0]);
    right.push(points[n - j]);
  }

  // the right interval has to be reversed
  // the reverse call can be avoided by preallocating the array and writing points from back to front
  return { left, right: right.reverse() };
}
```

The final split code in JavaScript pseudo code:

```js
function subintervalBezierControlPoints(points, tl, tu) {
  // divide for upper t to the left
  ({ left: points } = subdivideBezierControlPoints(points, tu));
  // reparametrize lower t
  let t = tl / tu;
  // divide to the right of reparametrized tl
  ({ right: points } = subdivideBezierControlPoints(points, t));

  return points;
}
```

# Derivation

This section will derive all the necessary parts of the algorithm. The order is generally such, that the later steps use the previous ones.

Here is an overview:

1. Show the symmetry of Bernstein polynomials
2. Use (1) to show, that the control points of a reversed Bézier curve are the original points in opposite order
3. Show that a formula for a scaled parameter in the Bernstein polynomials is valid
4. Show the validity of an explicit formula for all the points generated during the de Casteljau algorithm
5. Show how we can compute the control points of a Bézier curve that covers the interval $[0,t_u]$ of a given curve using (3) and (4)
6. Use (2) and (5) to show how to compute the control points of a Bézier curve that covers the interval $[t_l,1]$
7. When we first split a curve at $[0,t_u]$, we use (3) to show that we can use the splitting parameter $\frac{t_l}{t_u}$ to split the subcurve to the right, such that the resulting curve will be the subcurve for $[t_l,t_u]$ of the original curve

## Bernstein polynomial symmetry

The symmetry property of Bernstein polynomial is as follows:

$$
    \operatorname{B}_i^n(t) = \operatorname{B}_{n-i}^n(1-t)
$$

This is usually proven, but since it is used here a few times, we will show it as well, as it can be shown pretty quickly.

$$
 \operatorname{B}_{n-i}^n(1-t) \\
 = \binom{n}{n-i}(1-t)^{n-i}(1-(1-t))^{n-(n-i)} \\
  = \binom{n}{n-i}(1-t)^{n-i}t^{i} \\
$$

With the symmetry of the binomial coefficient $\binom{n}{i} = \binom{n}{n-i}$, we immediately arrive at the result.

$$
\binom{n}{n-i}(1-t)^{n-i}t^{i} \\
= \binom{n}{i}(1-t)^{n-i}t^{i} \\
= \binom{n}{i}t^{i}(1-t)^{n-i} \\
= \operatorname{B}_{i}^n(t)
$$

## Reversing a Bézier curve

We can reverse a Bézier curve, by reversing the order of the control points.

The control points $\mathbf{q}_i$ of a reversed curve can be written as:

$$
    \mathbf{q}_i = \mathbf{p}_{n-i}
$$

For the proof, we use a new curve parameter $s=1-t, s\in[0,1]$.

So for $s=0$ we get $t=1$ and for $s=1$ we get $t=0$. So this new parameter traverses the curve from back to front. 

We start by replacing the index by the substitution $j=n-i \Rightarrow i =n-j$, so we just reverse the order, which leaves the range unchanged.

$$
\mathbf{p}(t) = \sum_{i=0}^n \mathbf{p}_i\operatorname{B}_i^n(t) \\
=  \sum_{j=0}^n \mathbf{p}_{n-j}\operatorname{B}_{n-j}^n(t) \\ 
$$

We use the Bernstein symmetry.

$$
\sum_{j=0}^n \mathbf{p}_{n-j}\operatorname{B}_{n-j}^n(t) \\ 
= \sum_{j=0}^n \mathbf{p}_{n-j}\operatorname{B}_{j}^n(1-t) \\ 
= \sum_{j=0}^n \mathbf{p}_{n-j}\operatorname{B}_{j}^n(s) \\ 
= \sum_{j=0}^n \mathbf{q}_{j}\operatorname{B}_{j}^n(s) \\ 
$$

By renaming $j$ back to $i$ we get the initially stated property.

## The scaling property for Bernstein polynomials

The scaling property of a Bernstein polynomial can be expressed the following way:

$$
\operatorname{B}_i^n(ct) = \sum_{k=i}^n \operatorname{B}_i^k(c) \operatorname{B}_k^n(t)
$$

Additionally, since $\operatorname{B}_i^k = 0$, if $k<i$, the loop range can be extended to $0,\dots,n$, as all the additional terms will just evaluate to zero.

$$
\operatorname{B}_i^n(ct) = \sum_{k=0}^n \operatorname{B}_i^k(c) \operatorname{B}_k^n(t)
$$


We will now derive this expression in detail.

First of, let us start from the left hand side and expand it.

$$
\operatorname{B}_i^n(ct) = \binom{n}{i}(ct)^i (1-ct)^{n-i}\\
= \binom{n}{i}c^i t^i (1-ct)^{n-i}
$$

A neat trick, that I saw mentioned in the paper *The Bernstein polynomial basis: A centennial retrospective* by Rida T. Farouki: Replace $1-ct$ with the equal expression $1 - t + t - ct = (1-t) + (1-c)t$

Given the next step, this is a quite nice way to split up the $ct$ term in the brackets and have the new terms resemble the $1-x$ form.

We will use the well known binomial formula to write out the $(1-ct)^{n-1}$ term.

$$
    (x+y)^n = \sum_{k=0}^{n} x^{n-k}y^k
$$

With that we can proceed and multiply out and sort all the resulting factors.
$$
\operatorname{B}_i^n(ct) = \binom{n}{i}c^i t^i (1-ct)^{n-i} \\
 = \binom{n}{i}c^i t^i ((1-t) + (1-c)t)^{n-i} \\
= \binom{n}{i}c^i t^i \sum_{k=0}^{n-i}\binom{n-i}{k}(1-t)^{n-i-k}((1-c)t)^k \\
= \binom{n}{i}c^i t^i \sum_{k=0}^{n-i}\binom{n-i}{k}(1-t)^{n-i-k} (1-c)^k t^k \\
=  \sum_{k=0}^{n-i} \binom{n}{i} \binom{n-i}{k} c^i t^i (1-t)^{n-i-k} (1-c)^k t^k \\
=  \sum_{k=0}^{n-i} \binom{n}{i} \binom{n-i}{k} c^i  (1-c)^k t^i t^k (1-t)^{n-i-k}  \\
=  \sum_{k=0}^{n-i} \binom{n}{i} \binom{n-i}{k} c^i  (1-c)^k t^{i+k} (1-t)^{n-i-k}  \\
=  \sum_{k=0}^{n-i} \binom{n}{i} \binom{n-i}{k} c^i  (1-c)^k t^{i+k} (1-t)^{n-(i+k)}  \\
$$

In the last line, we already have a form very similar to a Bernstein polynomial!

First, we will introduce a summation variable change: 

$$
    u = i + k
$$

From this, we have $k = u -i$. We also need to change the summation limits. The lower limit first:

$$
  k = 0 \\
  u - i = 0 \\
  u = i
$$

So the lower limit is $i$. As for the upper limit:

$$
    k = n-i \\
    u-i = n-i \\
    u = n
$$

So the upper limit is $n$. Putting this all in the previous result gives:

$$
\sum_{k=0}^{n-i} \binom{n}{i} \binom{n-i}{k} c^i  (1-c)^k t^{i+k} (1-t)^{n-(i+k)}  \\
= \sum_{u=i}^{n} \binom{n}{i} \binom{n-i}{u-i} c^i  (1-c)^{u-i} t^{i+u-i} (1-t)^{n-u}  \\
= \sum_{u=i}^{n} \binom{n}{i} \binom{n-i}{u-i} c^i  (1-c)^{u-i} t^{u} (1-t)^{n-u}  \\
$$

These pairs of factors already look like Bernstein polynomials, but the binomial coefficients seem a bit off. So next we will use a binomial coefficient identity, which you can for example find here: [Wikipedia](https://en.wikipedia.org/wiki/Binomial_coefficient#Identities_involving_binomial_coefficients).

$$
    \binom{n}{h}\binom{n-h}{k} = \binom{n}{h+k}\binom{h+k}{h}
$$

Setting $h=i$ and $k=u-i$ in this, we get:

$$
  \binom{n}{i}\binom{n-i}{u-i} = \binom{n}{i+u-i}\binom{i+u-i}{i} \\
\binom{n}{i} \binom{n-i}{u-i} = \binom{n}{u} \binom{u}{i}
$$

Putting this back in:

$$
\sum_{u=i}^{n} \binom{n}{i} \binom{n-i}{u-i} c^i  (1-c)^{u-i} t^{u} (1-t)^{n-u}  \\
= \sum_{u=i}^{n} \binom{n}{u} \binom{u}{i} c^i  (1-c)^{u-i} t^{u} (1-t)^{n-u} \\
= \sum_{u=i}^{n} \binom{u}{i} c^i  (1-c)^{u-i} \binom{n}{u}  t^{u} (1-t)^{n-u} \\
= \sum_{u=i}^{n}\operatorname{B}_i^u(c)\operatorname{B}_u^n(t) \\
= \sum_{k=i}^{n}\operatorname{B}_i^k(c)\operatorname{B}_k^n(t)
$$

In the last step, we just renamed the summation variable from $u$ to $k$. With this,we have arrived, at the final expression of the scaling of the dependent variable! This can now be expressed by a sum of Bernstein polynomials in the scaling and $t$ parameter respectively.

## Expression for de Casteljau points

The de Casteljau algorithm produces new points after each step. Each step has one less point compared to the last. In general, the $i$-th point in the $r$-th step of the de Casteljau algorithm $\mathbf{p}_i^r$ is given by the recurrence relation:

$$
    \mathbf{p}_i^0 = \mathbf{p}_i \\
    \mathbf{p}_i^r(t) = (1-t) \mathbf{p}_i^{r-1}(t) + t \mathbf{p}_{i+1}^{r-1}(t) \\
    i = 1, \dots, n-r
$$

We can also give an explicit formula for this:

$$
\mathbf{p}_i^r(t) = \sum_{j=0}^r\mathbf{p}_{i+j}\operatorname{B}_{j}^{r}(t)
$$

We can prove this by induction over $r$.

First the base case for $r=0$.

$$
\mathbf{p}_i^0 = \sum_{j=0}^{0}\mathbf{p}_{i+j}\operatorname{B}_{j}^{0}(t) \\
= \mathbf{p}_{i}\operatorname{B}_{0}^{0}(t) \\
= \mathbf{p}_{i}\binom{0}{0}t^0(1-t)^0\\
= \mathbf{p}_{i}
$$

For the induction step, we consider the formula to hold for all $r$ and verify the formula for $r+1$.

$$
\mathbf{p}_i^{r+1}(t) = (1-t)\mathbf{p}_i^{r}(t) + t\mathbf{p}_{i+1}^{r}(t) \\
= (1-t) \sum_{j=0}^r\mathbf{p}_{i+j}\operatorname{B}_{j}^{r}(t) + t \sum_{j=0}^r\mathbf{p}_{i+1+j}\operatorname{B}_{j}^{r}(t) \\
=  \sum_{j=0}^r(1-t)\mathbf{p}_{i+j}\operatorname{B}_{j}^{r}(t) +  \sum_{j=0}^rt\mathbf{p}_{i+1+j}\operatorname{B}_{j}^{r}(t) \\
=  \sum_{j=0}^{r}(1-t)\mathbf{p}_{i+j}\operatorname{B}_{j}^{r}(t) +  \sum_{j=1}^{r+1} t \mathbf{p}_{i+j}\operatorname{B}_{j-1}^{r}(t)
$$

In the last step, we adjusted the index of the second sum, so the $\mathbf{p}_{i+j}$ indices of both sums match. You can easily verify that the actual summation terms are unchanged by checking the first and last indices of the sum (this is just an index subsitution $k=j+1$ and renaming back to $j$ again at afterwards).

Both sums have different index ranges. The first one ends one too early and the second one starts one too late. So we will just add these indices and then subtract the thusly introduced term. We could also split off the terms that are not shared by both, but that is a bit more wordy, so we choose the first version.

$$
\sum_{j=0}^{r}(1-t)\mathbf{p}_{i+j}\operatorname{B}_{j}^{r}(t) +  \sum_{j=1}^{r+1} t \mathbf{p}_{i+j}\operatorname{B}_{j-1}^{r}(t) \\
= \sum_{j=0}^{r+1}(1-t)\mathbf{p}_{i+j}\operatorname{B}_{j}^{r}(t)  - (1-t)\mathbf{p}_{i+r+1}\operatorname{B}_{r+1}^{r}(t)  \\ 
+  \sum_{j=0}^{r+1} t \mathbf{p}_{i+j}\operatorname{B}_{j-1}^{r}(t) - t \mathbf{p}_{i}\operatorname{B}_{-1}^{r}(t)\\
$$

Now there is a nice thing, in that by definition $\operatorname{B}_i^n$ is $0$, if $i <0$ or $i> n$ (this is basically the shorthand for considering these summation terms manually). So we the terms we added are $0$ and thus we subtract $0$.

$$
\sum_{j=0}^{r+1}(1-t)\mathbf{p}_{i+j}\operatorname{B}_{j}^{r}(t)  - (1-t)\mathbf{p}_{i+r+1}\operatorname{B}_{r+1}^{r}(t)  \\ 
+  \sum_{j=0}^{r+1} t \mathbf{p}_{i+j}\operatorname{B}_{j-1}^{r}(t) - t \mathbf{p}_{i}\operatorname{B}_{-1}^{r}(t)\\
= \sum_{j=0}^{r+1}(1-t)\mathbf{p}_{i+j}\operatorname{B}_{j}^{r}(t) +  \sum_{j=0}^{r+1} t \mathbf{p}_{i+j}\operatorname{B}_{j-1}^{r}(t) \\
= \sum_{j=0}^{r+1}((1-t) \mathbf{p}_{i+j}\operatorname{B}_{j}^{r}(t) +  t \mathbf{p}_{i+j}\operatorname{B}_{j-1}^{r}(t)) \\
= \sum_{j=0}^{r+1}\mathbf{p}_{i+j}((1-t) \operatorname{B}_{j}^{r}(t) +  t \operatorname{B}_{j-1}^{r}(t)) \\
$$

The Bernstein polynomials too have their recurrence relation $\operatorname{B}_{i}^{n}(t) = (1-t)\operatorname{B}_{i}^{n-1}(t) + t \operatorname{B}_{i-1}^{n-1}(t)$. That way, the last line nicely reduces to the final result, proving the equivalence.

$$ 
\sum_{j=0}^{r+1}\mathbf{p}_{i+j}((1-t) \operatorname{B}_{j}^{r}(t) +  t \operatorname{B}_{j-1}^{r}(t)) \\
= \sum_{j=0}^{r+1}\mathbf{p}_{i+j}\operatorname{B}_{j}^{r+1}(t)
$$

## Splitting a curve at a parameter to the left

For a given Bézier curve with control points $\mathbf{p}_i$ we can generate a new curve with the same degree that covers the parameter interval $[0,t_u]$ of the original curve, with $t_u \in [0,1]$.

The control points of the new curve are given by the first points of the de Casteljau algorithm in each step:

$$
    \mathbf{q}_i = \mathbf{p}_0^i(t_u)
$$

The curve is then computed as:

$$
    \mathbf{q}(s) = \sum_{i=0}^n \mathbf{q}_i\operatorname{B}_i^n(s)\\
    s \in [0,1]
$$

We will now show, that this gives us the original curve in $[0,t_u]$.

As $s$ should start ($s=0$) at the original curve at $t=0$ and end ($s=1$) at $t=t_u$, they are related by a simple scaling:

$$
    s = \frac{t}{t_u}
$$

We will plug that in and see what comes out
$$
    \mathbf{q}(s) = \sum_{i=0}^n \mathbf{q}_i\operatorname{B}_i^n(s)\\
    = \sum_{i=0}^n \mathbf{q}_i\operatorname{B}_i^n(\frac{t}{t_u})\\
    = \sum_{i=0}^n \mathbf{p}_0^i(t_u)\operatorname{B}_i^n(\frac{t}{t_u})\\
        = \sum_{i=0}^n \sum_{j=0}^i\mathbf{p}_{j}\operatorname{B}_{j}^{i}(t_u)\operatorname{B}_i^n(\frac{t}{t_u})\\
$$

From this, you can already see the structure of the scaling property of the Bernstein polynomials, but it isn't in the right shape yet.

First, we will use a trick, to make the sums independent of each other, thus allowing the order to be switched around. This makes once again use of the property, that $\operatorname{B}_i^n$ is $0$, if $i > n$. Thus we can expand the inner sum to go to $n$ instead of $i$, since $\operatorname{B}_j^i(t_u)$ will be $0$.

$$
\sum_{i=0}^n \sum_{j=0}^i\mathbf{p}_{j}\operatorname{B}_{j}^{i}(t_u)\operatorname{B}_i^n(\frac{t}{t_u})\\
= \sum_{i=0}^n \sum_{j=0}^n\mathbf{p}_{j}\operatorname{B}_{j}^{i}(t_u)\operatorname{B}_i^n(\frac{t}{t_u})\\
=  \sum_{j=0}^n\sum_{i=0}^n\mathbf{p}_{j}\operatorname{B}_{j}^{i}(t_u)\operatorname{B}_i^n(\frac{t}{t_u})\\
=  \sum_{j=0}^n \mathbf{p}_{j} \sum_{i=0}^n\operatorname{B}_{j}^{i}(t_u)\operatorname{B}_i^n(\frac{t}{t_u})\\
$$

The inner sum is now exactly the expression for the scaled Bernstein polynomial:

$$
\operatorname{B}_i^n(ct) = \sum_{k=0}^n \operatorname{B}_i^k(c) \operatorname{B}_k^n(t)
$$

So we finally get the final result, that is, evaluating the new curve with the $s$ parameter results in the corresponding $t$ point on the original curve.

$$
\sum_{j=0}^n \mathbf{p}_{j} \sum_{i=0}^n\operatorname{B}_{j}^{i}(t_u)\operatorname{B}_i^n(\frac{t}{t_u})\\
= \sum_{j=0}^n \mathbf{p}_{j} \operatorname{B}_j^n(t)
$$

## Splitting a curve at a parameter to the right

For a given Bézier curve with control points $\mathbf{p}_i$ we can generate a new curve with the same degree that covers the parameter interval $[t_l,1]$ of the original curve, with $t_l \in [0,1]$.

The control points of the new curve are given by the last points of the de Casteljau algorithm in each step in reverse:

$$
    \mathbf{q}_i = \mathbf{p}_i^{n-i}(t_l)
$$

The curve is then computed as:

$$
    \mathbf{q}(s) = \sum_{i=0}^n \mathbf{q}_i\operatorname{B}_i^n(s)\\
    s \in [0,1]
$$

We will now show, that this gives us the original curve in $[t_l,1]$.

We will show this with our already found properties. First, we will reduce this problem to splitting the curve to the left. For that, we start by reversing the curve, so we start from the end. From before, we know that this curve can be described by reversing the control points. So our reversed curve is:

$$
    \mathbf{r}(t) = \sum_i^n \mathbf{r}_i \operatorname{B}_i^n(t)\\
    \mathbf{r}_i = \mathbf{p}_{n-i}
$$

Since we reversed the curve, the split point $t_l$ is now located at $1-t_l$. So we can use our previous properties to get the subcurve from $0$ to $1-t_l$ of the reversed curve, which is the original curve from $1$ to $t_l$ by construction. The split curve is designated by $\mathbf{r}_{1-t_l}$.

$$
\mathbf{r}_{1-t_l}(t) =  \sum_{i=0}^n \mathbf{r}_{0}^{i}(1-t_l) \operatorname{B}_i^n(t)\\
= \sum_{i=0}^{n}\sum_{j=0}^{i}\mathbf{r}_j
\operatorname{B}_{j}^{i}(1-t_l) \operatorname{B}_{i}^{n}(t)$$

We use the symmetry of $\operatorname{B}$

$$
\sum_{i=0}^{n}\sum_{j=0}^{i}\mathbf{r}_j
\operatorname{B}_{j}^{i}(1-t_l) \operatorname{B}_{i}^{n}(t) \\
= \sum_{i=0}^{n}\sum_{j=0}^{i}\mathbf{r}_j
\operatorname{B}_{i-j}^{i}(t_l) \operatorname{B}_{i}^{n}(t)
$$

Insert the definition of $\mathbf{r}_j$.

$$
\sum_{i=0}^{n}\sum_{j=0}^{i}\mathbf{r}_j
\operatorname{B}_{i-j}^{i}(t_l) \operatorname{B}_{i}^{n}(t)\\
= \sum_{i=0}^{n}\sum_{j=0}^{i}\mathbf{p}_{n-j}
\operatorname{B}_{i-j}^{i}(t_l) \operatorname{B}_{i}^{n}(t)
$$

We start by replacing the outer index $i$ with $k$ to reverse the order, so $i = n-k \Rightarrow k = n-i$. This leaves the loop range the same.

$$
\sum_{k=0}^{n}\sum_{j=0}^{n-k}\mathbf{p}_{n-j}
\operatorname{B}_{n-k-j}^{n-k}(t_l) \operatorname{B}_{n-k}^{n}(t)
$$

Next, we will replace $j$ in the inner loop with $r$ in a way to get to the same index form as from the de Casteljau point definition.

For that we use 

$$
    n- j = k + r \\
    j = n - k - r \\
    r = n - j - k
$$

For that substitution, we can find the $r$ values for the loop ranges $j=0$ and $j=n-k$, by just plugging in the expression for $j$.


$$
\sum_{k=0}^{n}\sum_{j=0}^{n-k}\mathbf{p}_{n-j}
\operatorname{B}_{n-k-j}^{n-k}(t_l) \operatorname{B}_{n-k}^{n}(t) \\
= \sum_{k=0}^{n}\sum_{r=0}^{n-k}\mathbf{p}_{k+r}
\operatorname{B}_{n-k-(n-k-r)}^{n-k}(t_l) \operatorname{B}_{n-k}^{n}(t) \\ 
= \sum_{k=0}^{n}\sum_{r=0}^{n-k}\mathbf{p}_{k+r}
\operatorname{B}_{r}^{n-k}(t_l) \operatorname{B}_{n-k}^{n}(t) 
$$

The inner part is now just the definition of a de Casteljau point.

$$
\sum_{k=0}^{n}\sum_{r=0}^{n-k}\mathbf{p}_{k+r}
\operatorname{B}_{r}^{n-k}(t_l) \operatorname{B}_{n-k}^{n}(t) \\
= \sum_{k=0}^{n} \mathbf{p}_{k}^{n-k}(t_l) \operatorname{B}_{n-k}^{n}(t) 
$$

This curve by construction starts at the original endpoint and ends in the split point. The last thing we will do is reverse this curve again, so we start at the split point and end in the end. Reversal is done with the usual parameter substitution $t=1-s$ and using the symmetry of the Bernstein polynomials again.

$$
\mathbf{r}_{1-t_l}(t) = \sum_{k=0}^{n} \mathbf{p}_{k}^{n-k}(t_l) \operatorname{B}_{n-k}^{n}(t)\\
\mathbf{r}_{1-t_l}(1-s) = \sum_{k=0}^{n} \mathbf{p}_{k}^{n-k}(t_l) \operatorname{B}_{n-k}^{n}(1-s) \\
= \sum_{k=0}^{n} \mathbf{p}_{k}^{n-k}(t_l) \operatorname{B}_{k}^{n}(s) \\
= \sum_{k=0}^{n} \mathbf{q}_{k} \operatorname{B}_{k}^{n}(s)
$$

With this we have arrived at the expression for the new control points for the curve from $t_l$ to $1$.

## Parameter in subinterval

When splitting a curve in one defined only in the parameter range $[t_l, t_u] \subseteq [0,1]$ we first split the curve to the left to get $[0,t_u]$. Next we split this subcurve again to the right. As this second split occurs in the already split curve, we can't just use $t_l$ as the split point, since that is defined in the original curve. 

The second split is done with the parameter $\frac{t_l}{t_u}$.

We have already shown this in the section about splitting to the left. 

The split curve $\mathbf{q}(s)$ is given by:

$$
    \mathbf{q}(s) = \sum_{i=0}^n \mathbf{q}_i\operatorname{B}_i^n(s)\\
    \mathbf{q}_i = \mathbf{p}_0^i(t_u)\\
    s \in [0,1] \\

$$

We showed, that for  $s = \frac{t}{t_u}$, $\mathbf{q}(s)$ evaluates to $\sum_{j=0}^n \mathbf{p}_{j} \operatorname{B}_j^n(t) = \mathbf{p}(t)$.

Therefore $\mathbf{q}(\frac{t_l}{t_u}) = \mathbf{p}(t_l)$.

