<!--
author:   sibaku

email:    

version:  0.0.1

language: en

narrator: US English Female

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

Hopefully this was helpful in understanding Taylor series!