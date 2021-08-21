---
layout: post
title:  "Chain, Product and Quotient rules for Gradient, Jacobian and Hessian"
categories: maths
tags: [maths, derivative, gradient, hessian]
visible: 1
---

## Chain, Product And Quotient Rules

I recently remade my GLSL automatic differentiation library ([GitHub repository](https://github.com/sibaku/glsl-autodiff)) to include some more functions. Turns out I didn't write down the Jacobians and Hessians in the vector/matrix form that I need. Also turns out that I could not find them anywhere on the internet! So I had to redo them and decided to write them down this time, just in case... maybe someone else might be interested in them.

The next [section](#summary) will summarize the results. [Derivations](#derivations) can be found below. Derivatives are taken with respect to $$x$$, though I will leave out the $$()$$ parameter brackets, if they are not needed to make things clear. Gradients ($$\nabla$$), Jacobians ($$J$$) and Hessians ($$H$$) will apply to the object on the right. Brackets are used, if any of them apply to multiple terms.

If you find an error, feel free to tell me.

## Summary

### Chain Rules

Derivative rules for compositions of functions $$(f \circ g)(x) = f(g(x))$$

#### Gradient Chain Rule

Scalar form

$$ \begin{aligned}
  f &: \mathbb{R} \rightarrow \mathbb{R} \\
  g &: \mathbb{R}^n \rightarrow \mathbb{R}  \\
\end{aligned} $$

$$ \nabla f(g) = f'\nabla g$$

Multi parameter form

$$ \begin{aligned}
  f &: \mathbb{R}^k \rightarrow \mathbb{R} \\
  g &: \mathbb{R}^n \rightarrow \mathbb{R}^k  \\
\end{aligned} $$

$$ \nabla f(g) = (Jg)^T\nabla f$$

[Derivation](#derivation-gradient-chain-rule)

#### Jacobian Chain Rule

$$ \begin{aligned}
  f &: \mathbb{R}^m \rightarrow \mathbb{R}^k \\
  g &: \mathbb{R}^n \rightarrow \mathbb{R}^m
\end{aligned} $$

$$ \begin{aligned}
    J({f \circ g}) &\in \mathbb{R}^{k \times n} \\
    J({f \circ g}) &= \underbrace{J{f}}_{\in \mathbb{R}^{k\times m}}\underbrace{Jg}_{\in \mathbb{R}^{m \times n}}
\end{aligned} $$

[Derivation](#derivation-jacobian-chain-rule)

#### Hessian Chain Rule

Scalar form

$$ \begin{aligned}
  f &: \mathbb{R} \rightarrow \mathbb{R} \\
  g &: \mathbb{R}^n \rightarrow \mathbb{R}
\end{aligned} $$

$$ \begin{aligned}
    H({f\circ g}) & \in \mathbb{R}^{n \times n} \\
   H({f\circ g}) &= f''\nabla g \nabla^T g + f'Hg
\end{aligned} $$

Multi argument form

$$ \begin{aligned}
  f &: \mathbb{R}^k \rightarrow \mathbb{R} \\
  g &: \mathbb{R}^n \rightarrow \mathbb{R}^k
\end{aligned} $$

$$ \begin{aligned}
    H({f\circ g}) & \in \mathbb{R}^{n \times n} \\
   H({f\circ g}) &= (Jg)^HfJg + \sum_{j=1}^k\frac{\partial f}{\partial x^j}Hg_j
\end{aligned} $$

[Derivation](#derivation-hessian-chain-rule)

### Product Rules

Derivative rules for the product of two functions

#### Gradient Product Rule

$$ \begin{aligned}
  f &: \mathbb{R}^n \rightarrow \mathbb{R} \\
  g &: \mathbb{R}^n \rightarrow \mathbb{R}  \\
\end{aligned} $$

$$ \begin{aligned}
    \nabla (fg) & \in \mathbb{R}^n \\
    \nabla (fg) &= g\nabla f + f\nabla g
\end{aligned}$$

[Derivation](#derivation-gradient-product-rule)

#### Jacobian Product Rules

Scalar factor

$$ \begin{aligned}
  a &: \mathbb{R}^m \rightarrow \mathbb{R} \\
  b &: \mathbb{R}^m \rightarrow \mathbb{R}^n  \\
\end{aligned} $$

$$ \begin{aligned}
    J({ab}) &\in \mathbb{R}^{n \times m} \\
    J({ab}) &= aJb + b\nabla^Ta
\end{aligned}$$

Matrix factor using Einstein notation (easier to write/read)(<https://en.wikipedia.org/wiki/Einstein_notation>).

$$ \begin{aligned}
  A &: \mathbb{R}^m \rightarrow \mathbb{R}^{k\times n} \\
  b &: \mathbb{R}^m \rightarrow \mathbb{R}^n  \\
\end{aligned} $$

$$ \begin{aligned}
    J({Ab}) &\in \mathbb{k\times m} \\
    (J({Ab}))_{i,k} &= b_j\frac{\partial a_{i,j}}{\partial x^k} +a_{i,j}(Jb)_{j,k}
\end{aligned}$$

[Derivation](#derivation-jacobian-product-rule)

#### Hessian Product Rule

$$ \begin{aligned}
    f &: \mathbb{R}^n \rightarrow \mathbb{R} \\
    g &: \mathbb{R}^n \rightarrow \mathbb{R} \\
\end{aligned}$$

$$\begin{aligned}
    H({fg}) & \in \mathbb{R}^{n\times n} \\
    H({fg}) &= fHg + gHf + \nabla g \nabla^T f + \nabla f \nabla^T g
\end{aligned}$$

[Derivation](#derivation-hessian-product-rule)

### Quotient Rules

Derivative rules for the quotient of two functions

#### Gradient Quotient Rule

$$ \begin{aligned}
    f &: \mathbb{R}^n \rightarrow \mathbb{R} \\
    g &: \mathbb{R}^n \rightarrow \mathbb{R} \\
\end{aligned}$$

$$ \begin{aligned}
    \nabla\frac{f}{g} &\in \mathbb{R}^n \\
    \nabla\frac{f}{g} &= \frac{g\nabla f - f\nabla g}{g^2}
\end{aligned}$$

[Derivation](#derivation-gradient-quotient-rule)

#### Hessian Quotient Rule

$$ \begin{aligned}
    f &: \mathbb{R}^n \rightarrow \mathbb{R} \\
    g &: \mathbb{R}^n \rightarrow \mathbb{R} \\
\end{aligned}$$

$$ \begin{aligned}
    H{\frac{f}{g}} &\in \mathbb{R}^{n\times n} \\
    H{\frac{f}{g}} &= \frac{2f\nabla g \nabla^T g}{g^3} - \frac{fHg + \nabla g \nabla^T f + \nabla f\nabla^T g}{g^2}  + \frac{Hf}{g}
\end{aligned}$$

[Derivation](#derivation-hessian-quotient-rule)

## Derivations

Here you can find the derivations for the previously stated rules

### Derivation Gradient Chain Rule

Scalar form:

This is listed in most places, but I put it in because it is used in the other derivations. It is easy to check by looking at a partial derivative and using the usual one dimensional chain rule.

$$ \begin{aligned}
    \frac{\partial f(g)}{\partial x^i} &= f'\frac{\partial g}{\partial x^i}
\end{aligned}$$

These are exactly the entries of the gradient.

Multi parameter form:

Can be seen from index notation as well or as a special case of the Jacobian Chain Rule, when $$ k=1$$ and using $$ \nabla f = (Jf)^T$$ for a scalar function.

### Derivation Gradient Product Rule

This is listed in most places, but I put it in because it is used in the other derivations. It is easy to check by looking at a partial derivative and using the usual one dimensional product rule.

$$ \begin{aligned}
    \frac{\partial fg}{\partial x^i} &= g\frac{\partial f}{\partial x^i} + f\frac{\partial g}{\partial x^i}
\end{aligned}$$

These are exactly the entries of the gradient.

### Derivation Gradient Quotient Rule

Use the product and chain rule for gradients.

$$ \begin{aligned}
    \frac{f}{g} &= fg^{-1} \\
    &= fq
\end{aligned}$$

Derivatives of $$q$$

$$ \begin{aligned}
q(g) &= g^{-1}\\
    q' &= -\frac{1}{g^2}\\
    q'' &= \frac{2}{g^3}
\end{aligned}$$

Gradient:

$$ \begin{aligned}
    \nabla\frac{f}{g} &= \nabla (fq(g)) \\
    &= q(g)\nabla f + f\nabla q(g) \\
    &= q(g)\nabla f + f (q(g)'\nabla g) \\
    &= \frac{1}{g} \nabla f - \frac{f}{g^2}\nabla g \\
    &= \frac{g\nabla f - f\nabla g}{g^2}
\end{aligned}$$

### Derivation Jacobian Chain Rule

This is listed in most places, but I put it in because it is used in the other derivations. You can check the partial and total derivatives.

In index notation:

$$\begin{aligned}
    (Jf(g))_{i,k} &= \frac{\partial f(g)_i}{\partial x^k} \\
    &= \frac{\partial f(g)_i}{\partial g_j}\frac{\partial g_j}{\partial x^k} \\
    &= (Jf(g))_{i,j}(Jg)_{j,k}
\end{aligned}$$

Which is the same as the matrix notation.

### Derivation Jacobian Product Rule

The elements of $$A$$ are $$a_{i,j}$$ and the elements of $$b$$ are $$b_i$$. The matrix product is then just $$c_i = a_{i,j}b_j$$. The Jacobian elements are $$J(c)_{i,k} = \frac{\partial c_i}{\partial x^k}$$.

$$ \begin{aligned}
    J(c)_{i,k} &= \frac{\partial c_i}{\partial x^k} \\
    &= \frac{\partial a_{i,j}b_j}{\partial x^k} \\
    &= b_j\frac{\partial a_{i,j}}{\partial x^k} + a_{i,j}\frac{\partial b_j}{\partial x^k}\\
    &= b_j\frac{\partial a_{i,j}}{\partial x^k} +a_{i,j}J(b)_{j,k}
\end{aligned} $$

A scalar function $$a$$ can be represented as a scaled identity matrix $$a_{i,j}= a\delta_i^j$$ leading to

$$ \begin{aligned}
    J(c)_{i,k} &=   b_j\frac{\partial a\delta_i^j}{\partial x^k} +a\delta_i^jJ(b)_{j,k} \\
    &= b_i\frac{\partial a}{\partial x^k} + aJ(b)_{i,k}
\end{aligned}$$

Or back in matrix notation:

$$ J({ab}) = aJb + b\nabla^Ta$$

### Derivation Hessian Chain rule

Scalar form

$$ \begin{aligned}
    Hf(g) &= J\nabla f(g)\\
    \nabla f(g) &= f'\nabla g
\end{aligned}$$

From the Jacobian product rule it follows that:

$$ \begin{aligned}
    H{f(g)} &= J({f' \nabla g}) \\
    &= f'J{\nabla g} + \nabla g\nabla^T(f')\\
    &= f'Hg + \nabla g\nabla^T(f') \\
    &=  f'Hg + \nabla g f''\nabla^Tg \\
    &= f'Hg + f'' \nabla g \nabla^Tg
\end{aligned}$$

Multi parameter form

Using index notation:

$$\begin{aligned}
    (Hf(g))_{i,k} &= \frac{\partial^2f(g)}{\partial x^k \partial x^i}\\
    &=\frac{\partial}{\partial x^k} (\frac{\partial f}{\partial g^j}\frac{\partial g_j}{\partial x^i}) \\
    &= \frac{\partial g_j}{\partial x^i}\frac{\partial}{\partial x^k}(\frac{\partial f}{\partial g^j})  + \frac{\partial f}{\partial g^j}\frac{\partial}{\partial x^k}(\frac{\partial g_j}{\partial x^i}) \\
    &= \frac{\partial g_j}{\partial x^i}\frac{\partial^2 f}{\partial g^m \partial g^j}\frac{\partial g_m}{\partial x^k} + \frac{\partial f}{\partial g^j}\frac{\partial^2 g_j}{\partial x^k \partial x^i}
\end{aligned}$$

Identify definitions of Jacobians and Hessians.

$$\begin{aligned}
    (Hf(g))_{i,k} &= \frac{\partial g_j}{\partial x^i}\frac{\partial^2 f}{\partial g^m \partial g^j}\frac{\partial g_m}{\partial x^k} + \frac{\partial f}{\partial g^j}\frac{\partial^2 g_j}{\partial x^k \partial x^i} \\
    &= (Jg)_{j,i}(Hf)_{j,m}(Jg)_{m,k} + \frac{\partial f}{\partial g^j}(Hg_j)_{i,k}
\end{aligned}$$

Switch indices of the first expression with the transpose to get matrix product index notation

$$\begin{aligned}
    (Hf(g))_{i,k} &= (Jg)_{j,i}(Hf)_{j,m}(Jg)_{m,k} + \frac{\partial f}{\partial g^j}(Hg_j)_{i,k} \\
    &=(Jg)^T_{i,j}(Hf)_{j,m}(Jg)_{m,k} + \frac{\partial f}{\partial g^j}(Hg_j)_{i,k}
\end{aligned}$$

Write in matrix notation and plug in that there are $$k$$ functions $$g_j$$

$$\begin{aligned}
    Hf(g) &= (Jg)^THfJg + \sum_{j=1}^kHg_j
\end{aligned}$$

### Derivation Hessian Product Rule

Apply the gradient product rule and the additive property of derivatives.

$$ \begin{aligned}
    H({fg}) &= J{\nabla(fg)} \\
    \nabla(fg) &= f\nabla g + g\nabla f\\
    J({f\nabla g + g\nabla f}) &=J({f\nabla g}) + J({g\nabla f})
\end{aligned}$$

Differentiating both Jacobians with the Jacobian product rule.

$$ \begin{aligned}
    J({f\nabla g}) &=  fJ{\nabla g} + \nabla g\nabla^Tf \\
    &= fHg + \nabla g\nabla^Tf\\
    J({g\nabla f}) &=   gHf+ \nabla f\nabla^Tg
\end{aligned}$$

Putting these together gives the final result

$$ \begin{aligned}
     H({fg}) &= J({f\nabla g}) + J({g\nabla f})\\
     &= fHg + \nabla g\nabla^Tf + gHf+ \nabla f\nabla^Tg\\
     &= fHg + gHf + \nabla g \nabla^T f + \nabla f \nabla^T g
\end{aligned}$$

### Derivation Hessian Quotient Rule

Start similar to the product rule, but use $$q(g) = \frac{1}{g}$$. The derivatives of $$q$$ are listed in the gradient quotient rule derivation.

$$ \begin{aligned}
    H{\frac{f}{g}} &= H({fq}) \\
    &= J({f\nabla q}) + J({q\nabla f})
\end{aligned}$$

The first term:
$$ \begin{aligned}
    J({f\nabla q}) &= fJ{\nabla q} + \nabla q\nabla^Tf\\
    &= fHq+ \nabla q\nabla^Tf
\end{aligned}$$

Compute $$\nabla q$$ with the gradient chain rule

$$ \begin{aligned}
    \nabla q(g) &= q'\nabla g \\
    &= -\frac{\nabla g}{g^2}
\end{aligned}$$

Use the hessian chain rule

$$ \begin{aligned}
    Hq &= q''\nabla g \nabla^T g + q'Hg \\
    &= \frac{2\nabla g \nabla^T g}{g^3} - \frac{Hg}{g^2}
\end{aligned}$$

The second term

$$ \begin{aligned}
    J({q\nabla f}) &= qHf+ \nabla f\nabla^Tq \\
    &= \frac{Hf}{g} - \frac{\nabla f \nabla^T g}{g^2}
\end{aligned}$$

Putting things together:

$$ \begin{aligned}
    H{\frac{f}{g}} &= J({f\nabla q}) + J({q\nabla f}) \\
    &= fHq+ \nabla q\nabla^Tf + \frac{Hf}{g} - \frac{\nabla f \nabla^T g}{g^2} \\
    &= f (\frac{2\nabla g \nabla^T g}{g^3} - \frac{Hg}{g^2}) - \frac{\nabla g \nabla^T f}{g^2} + \frac{Hf}{g} - \frac{\nabla f \nabla^T g}{g^2}\\
    &= \frac{2f\nabla g \nabla^T g}{g^3} - \frac{fHg}{g^2} - \frac{\nabla g \nabla^T f}{g^2} + \frac{Hf}{g} - \frac{\nabla f \nabla^T g}{g^2}\\
    &= \frac{2f\nabla g \nabla^T g}{g^3} - \frac{fHg + \nabla g \nabla^T f + \nabla f \nabla^T g}{g^2} + \frac{Hf}{g}
\end{aligned}$$
