<!--
author: sibaku

version:  0.0.1

language: en

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

This document details the basic operations that arise when dealing with different coordinate systems. We will look at the special case of orthogonal and unit-length basis vectors with a translation, as this is a very useful subset of coordinate transforms.

More general versions with scaling, or non-orthogonal basis vectors can be derived in a very similar way, though they require a bit more care and lose some nice properties.


# Coordinate systems and transforms

A coordinate system $C_i$ can be described by its origin $\mathbf{o}_i$ and a set of $n$ basis vectors $\mathbf{x}_{i,j}, j=1,\dots, n$.

We require, that the basis vectors have a length of $1$ and are perpendicular to each other. This can be expressed with the dot product as:

$$
    \mathbf{x}_{i,j} \cdot \mathbf{x}_{i,k} = \begin{cases} 1 & \text{, if j = k}\\ 0 & \text{, else}\end{cases} \\
    = \delta_j^k
$$

(The second line is the so called Kronecker delta and is just a shorthand for the brackets above)

We imagine a point $\mathbf{p}$. This is a fixed point "in the world". In the coordinate system $C_i$ can be described by its coordinates in that system $p_{i,j}$, where the index $(i,j)$ corresponds to the associated basis vector $\mathbf{x}_{i,j}$. Geometrically, we move to the origin of $C_i$ and then continue to move $p_{i,j}$ units in the direction $\mathbf{x}_{i,j}$ for each $\mathbf{x}_{i,j}$. This can be written as:

$$
    \mathbf{p} = p_{i,1}\mathbf{x}_{i,1} + \dots + p_{i,n}\mathbf{x}_{i,n} + \mathbf{o}_i
$$

This can be written in matrix notation with each $\mathbf{x}_{i,j}$ being a column and the coordinates $p_{i,j}$ forming a column vector $\mathbf{p}_i$.

$$
\begin{align*}
 \mathbf{p} &= p_{i,1}\mathbf{x}_{i,1} + \dots + p_{i,n}\mathbf{x}_{i,n} + \mathbf{o}_i \\
 &= \begin{pmatrix}
        \mathbf{x}_{i,1} & \dots & \mathbf{x}_{i,n}
    \end{pmatrix} \begin{pmatrix}
        p_{i,1} \\
        \vdots \\
        p_{i,n}
     \end{pmatrix} + \mathbf{o}_i \\
     &= \mathbf{R} \mathbf{p}_i + \mathbf{o}_i
\end{align*} 
$$

As the base vectors are normalized and orthogonal, the matrix $\mathbf{R}$ is a rotation matrix, which has the nice property, that $\mathbf{R}^{-1} = \mathbf{R}^T$.
To actually calculate this, we will need to introduce some arbitrary coordinate system, in which we can express the $\mathbf{x}_{i,j}$ and $\mathbf{o}_i$. We will call this system $C_0$ or "world".  As there is no absolute coordinate frame, any choice is valid, for example we can just use the common $\mathbf{x}, \mathbf{y}, \dots$ axes. **Note:** This can be made more abstract, but if you just want to write some code or calculate by hand, we don't need it and you can find it in many other places.

With that, we define a **Transform**. This isn't actually much different from the coordinate frame. From the last equations, we can see the base idea: A transform takes a coordinate vector defined in one coordinate system (start) and gives us the vector coordinates in the system in which the $\mathbf{x}_{i,j}$ are defined in (target). 
We define a transform as the structure $\mathbf{T}_t^s = \{\mathbf{R}_t^s, \mathbf{t}_t^s\}$ with the following semantics:

Given a coordinates in the start system $C_s$, we can compute the coordinates in the target System $C_t$ with $\mathbf{T}_t^s$ according to:

$$
\begin{align*}
   \mathbf{p}_t &= \mathbf{T}_t^s(\mathbf{p}_s) \\
   &= \mathbf{R}_t^s \mathbf{p}_s + \mathbf{t}_t^s
\end{align*}
$$

So a transform is a combination of a rotation and a translation of the coordinates. Writing the upper and lower indices in this way allows us to quickly check, if we made a mistake, as multiplying a matrix will always have a matching upper index with the lower one of the coordinates. The translation $ \mathbf{t}_t^s$ represents the origin of $C_s$ expressed in $C_t$.

In fields like computer graphics, this is often combined into a single matrix (with higher dimension to allow for translation), as it allows for very easy concatenations of different operations by the usual matrix multiplication. We will not use that here, but the formulas can be easily converted.

In the next sections, we will see the useful formulas to work with transforms. The sections include proofs, but you can skip them if you are not interested.


## Defining a transform based on two coordinate systems

We are given a start coordinate system $C_s$ and a target $C_t$. The transform that transforms point coordinates from $C_s$ to $C_t$ according to $ \mathbf{p}_t = \mathbf{R}_t^s \mathbf{p}_s + \mathbf{t}_t^s$ is given by:

$$
\begin{align*}
    \mathbf{R}_t^s &= \begin{pmatrix}\mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T\end{pmatrix} \begin{pmatrix}\mathbf{x}_{s,1} & \dots & \mathbf{x}_{s,n}\end{pmatrix} \\
    \mathbf{t}_t^s &= \begin{pmatrix}\mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T\end{pmatrix} (\mathbf{o}_s - \mathbf{o}_t)
\end{align*}
$$

**Important:** The basis vector and origin coordinates of the two coordinate systems must be expressed in the same system. As stated before, this is arbitrary. One could for example express both systems as seen from $C_s$. This would lead to the simplification: $\begin{pmatrix}\mathbf{x}_{s,1} & \dots & \mathbf{x}_{s,n}\end{pmatrix} = \mathbf{I}_n$ ($\mathbf{I}_n$ is the identity matrix) and $\mathbf{o}_s= \mathbf{0}$.

This **special case** leads to:

$$
\begin{align*}
    \mathbf{R}_t^s &= \begin{pmatrix}\mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T\end{pmatrix} \\
    \mathbf{t}_t^s &= \begin{pmatrix}\mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T\end{pmatrix} (-\mathbf{o}_t)\\
    &= -\mathbf{R}_t^s\mathbf{o}_t
\end{align*}
$$

This is a common formula found for example in the camera coordinate system transform in computer graphics. First you move to the center ($-\mathbf{o}_t$) and then you project onto the camera  axes. As a matrix product this is:

$$
\begin{align*}
    \underbrace{\mathbf{R}_{C_t}}_{\text{Rotation}}\underbrace{\mathbf{T}(-\mathbf{o}_t)}_{\text{Translation}} &=
    \left(\begin{array}{c|c}
    \mathbf{x}_{t,1}^T & 0 \\
    \vdots & \vdots \\
    \mathbf{x}_{t,n}^T & 0 \\\hline
    \mathbf{0}^T & 1
    \end{array}\right)  \left(\begin{array}{c|c}
    \mathbf{I}_n & -\mathbf{o}_t \\\hline
    \mathbf{0}^T & 1
    \end{array}\right) \\
     &=
    \left(\begin{array}{c|c}
    \mathbf{R}_{t}^s & 0 \\\hline
    \mathbf{0}^T & 1
    \end{array}\right)  \left(\begin{array}{c|c}
    \mathbf{I}_n & -\mathbf{o}_t \\\hline
    \mathbf{0}^T & 1
    \end{array}\right)\\
     &=
    \left(\begin{array}{c|c}
    \mathbf{R}_{t}^s & -\mathbf{R}_{t}^s\mathbf{o}_t \\\hline
    \mathbf{0}^T & 1
    \end{array}\right) 
\end{align*}
$$
### Proof 

We can describe the point $\mathbf{p}$ using our two coordinate systems $C_s$ and $C_t$. From before we know how to express a point with local coordinates:

$$
\begin{align*}
\mathbf{p} &= \begin{pmatrix}
        \mathbf{x}_{s,1} & \dots & \mathbf{x}_{s,n}
    \end{pmatrix} \mathbf{p}_s + \mathbf{o}_s \\
\mathbf{p} &= \begin{pmatrix}
        \mathbf{x}_{t,1} & \dots & \mathbf{x}_{t,n}
    \end{pmatrix} \mathbf{p}_t  + \mathbf{o}_t \\
\end{align*}
$$

Just to restate: The point itself does not change, we just use different coordinates appropriate for each system. We can equate both equations and then solve for $\mathbf{p}_t$, which will leave us with a transform expression.

$$
\begin{align*}
\begin{pmatrix}
        \mathbf{x}_{s,1} & \dots & \mathbf{x}_{s,n}
    \end{pmatrix} \mathbf{p}_s + \mathbf{o}_s &= \begin{pmatrix}
        \mathbf{x}_{t,1} & \dots & \mathbf{x}_{t,n}
    \end{pmatrix} \mathbf{p}_t  + \mathbf{o}_t \\
    \begin{pmatrix}
        \mathbf{x}_{s,1} & \dots & \mathbf{x}_{s,n}
    \end{pmatrix} \mathbf{p}_s + \mathbf{o}_s - \mathbf{o}_t&= \begin{pmatrix}
        \mathbf{x}_{t,1} & \dots & \mathbf{x}_{t,n}
    \end{pmatrix} \mathbf{p}_t  \\
         \begin{pmatrix}
        \mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T
    \end{pmatrix}\begin{pmatrix}
        \mathbf{x}_{s,1} & \dots & \mathbf{x}_{s,n}
    \end{pmatrix} \mathbf{p}_s +  \begin{pmatrix}
        \mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T
    \end{pmatrix}(\mathbf{o}_s - \mathbf{o}_t)&= \begin{pmatrix}
        \mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T
    \end{pmatrix} \begin{pmatrix}
        \mathbf{x}_{t,1} & \dots & \mathbf{x}_{t,n}
    \end{pmatrix} \mathbf{p}_t  \\
      \begin{pmatrix}
        \mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T
    \end{pmatrix}\begin{pmatrix}
        \mathbf{x}_{s,1} & \dots & \mathbf{x}_{s,n}
    \end{pmatrix} \mathbf{p}_s +  \begin{pmatrix}
        \mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T
    \end{pmatrix}(\mathbf{o}_s - \mathbf{o}_t)&= \mathbf{I}_n \mathbf{p}_t  \\
    \underbrace{
          \begin{pmatrix}
        \mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T
    \end{pmatrix}\begin{pmatrix}
        \mathbf{x}_{s,1} & \dots & \mathbf{x}_{s,n}
    \end{pmatrix}}_{\mathbf{R}_t^s} \mathbf{p}_s +  \underbrace{\begin{pmatrix}
        \mathbf{x}_{t,1}^T \\ \vdots \\ \mathbf{x}_{t,n}^T
    \end{pmatrix}(\mathbf{o}_s - \mathbf{o}_t)}_{\mathbf{t}_t^s} &= \mathbf{p}_t  \\
     \mathbf{R}_t^s \mathbf{p}_s + \mathbf{t}_t^s &= \mathbf{p}_t
\end{align*}
$$

The identity matrix comes from the fact, that $\mathbf{x}_{i,j} \cdot \mathbf{x}_{i,k} = \delta_j^k$ or alternatively, that the matrix formed by the basis vectors is a rotation matrix, with the transpose being its inverse.

## Inverse of a transform

The inverse $\mathbf{T}_s^t$ of a given transform $\mathbf{T}_t^s$ is given by:

$$
\begin{align*}
\mathbf{R}_s^t &= (\mathbf{R}_t^s)^T \\
\mathbf{t}_s^t &= -(\mathbf{R}_t^s)^T\mathbf{t}_t^s \\
&= -\mathbf{R}_s^t\mathbf{t}_t^s
\end{align*}
$$

The transform transforms a point from $C_t$ to $C_s$.

### Proof

We start from the transformation equation: $ \mathbf{p}_t = \mathbf{R}_t^s \mathbf{p}_s + \mathbf{t}_t^s$.
We just have to solve for $\mathbf{p}_s$.

$$
\begin{align*}
\mathbf{p}_t &= \mathbf{R}_t^s \mathbf{p}_s + \mathbf{t}_t^s \\
\mathbf{p}_t - \mathbf{t}_t^s &= \mathbf{R}_t^s \mathbf{p}_s  \\
(\mathbf{R}_t^s)^T\mathbf{p}_t - \mathbf{t}_t^s &= (\mathbf{R}_t^s)^T\mathbf{R}_t^s \mathbf{p}_s  \\
\underbrace{(\mathbf{R}_t^s)^T}_{\mathbf{R}_s^t}\mathbf{p}_t \underbrace{- (\mathbf{R}_t^s)^T\mathbf{t}_t^s}_{\mathbf{t}_s^t} &= \mathbf{p}_s  \\
\mathbf{R}_s^t \mathbf{p}_t + \mathbf{t}_s^t&= \mathbf{p}_s  
\end{align*}
$$

## Composing two transforms

We can compose a transform $\mathbf{T}_m^s$ (from $s$ to $m$) and another transform $\mathbf{T}_t^m$ (from $m$ to $t$) to get $\mathbf{T}_t^s$ (from $s$ to $t$) as follows:

$$
\begin{align*}
\mathbf{R}_t^s &= \mathbf{R}_t^m\mathbf{R}_m^s \\
\mathbf{t}_t^s &= \mathbf{R}_t^m\mathbf{t}_m^s +  \mathbf{t}_t^m
\end{align*}
$$

### Proof

For the proof, we just successively apply both transforms.

$$
\begin{align*}
    \mathbf{p}_m &= \mathbf{T}_m^s (\mathbf{p}_s)\\
    \mathbf{p}_t &= \mathbf{T}_t^m(\mathbf{p}_m) \\
     &=  \mathbf{T}_t^m(\mathbf{T}_m^s (\mathbf{p}_s)) \\
     &=  \mathbf{T}_t^m(\mathbf{R}_m^s \mathbf{p}_s + \mathbf{t}_m^s ) \\
     &=  \mathbf{R}_t^m(\mathbf{R}_m^s \mathbf{p}_s + \mathbf{t}_m^s ) +  \mathbf{t}_t^m  \\
     &=  \underbrace{\mathbf{R}_t^m\mathbf{R}_m^s}_{\mathbf{R}_t^s} \mathbf{p}_s + \underbrace{\mathbf{R}_t^m\mathbf{t}_m^s +  \mathbf{t}_t^m}_{\mathbf{t}_t^s}  \\
     &= \mathbf{R}_t^s\mathbf{p}_s  + \mathbf{t}_t^s
\end{align*}
$$

## Transforming points and vectors

The transform $\mathbf{T}_t^s$ transforms point coordinates from $C_s$ to $C_t$.

By definition, point coordinates are transformed as:

 $$
 \mathbf{p}_t = \mathbf{R}_t^s \mathbf{p}_s + \mathbf{t}_t^s
 $$

 Vectors $\mathbf{v}_s$ have no position in space and thus do not use the translation part.

 $$
 \mathbf{v}_t = \mathbf{R}_t^s \mathbf{v}_s
 $$

### Proof

The point formula is just the definition of the transform.

For the vector $\mathbf{v}_s$, we consider that it can be defined by two points $\mathbf{p}_s$ and $\mathbf{q}_s$ as $\mathbf{v}_s =\mathbf{p}_s  - \mathbf{q}_s$. In the $t$ coordinate system, the vector is of course still defined by the same points, but in $t$ coordinates ($\mathbf{p}_t, \mathbf{q}_t$). Sinde we know how points transform, we just plug it in.

$$
\begin{align*}
    \mathbf{v}_t &= \mathbf{p}_t - \mathbf{q}_t \\
    &= \mathbf{R}_t^s\mathbf{p}_s  + \mathbf{t}_t^s - (\mathbf{R}_t^s\mathbf{q}_s + \mathbf{t}_t^s) \\
    &= \mathbf{R}_t^s\mathbf{p}_s  + \mathbf{t}_t^s - \mathbf{R}_t^s\mathbf{q}_s - \mathbf{t}_t^s \\
    &= \mathbf{R}_t^s\mathbf{p}_s  - \mathbf{R}_t^s\mathbf{q}_s  \\
    &= \mathbf{R}_t^s (\mathbf{p}_s  - \mathbf{q}_s)  \\
    &= \mathbf{R}_t^s \mathbf{v}_s  \\
\end{align*}
$$

## Retrieving coordinate axes

We can get information about the start and target coordinate axes from the rotation matrix $\mathbf{R}_t^s$ of a transform.

The $i$-th column is the $i$-th basis vector of $s$ in coordinates of $t$.

The $i$-th row is the $i$-th basis vector of $t$ in coordinates of $s$.

### Proof

We start with the columns of $\mathbf{R}_t^s$ and denote them by $\mathbf{c}_i$, where $i$ is the column index.
The coordinate axes of $s$ are just the standard basis vectors with a $1$ at the index of the basis vector and $0$ everywhere else (so the "$\mathbf{x}$" basis vector $\mathbf{e}_{s,1}$ is just $\begin{pmatrix}1 \\ 0 \\ \vdots \\ 0 \end{pmatrix}$).

We can apply to transform to them according to vector rules:

$$
\begin{align*}
    \mathbf{R}_t^s \mathbf{e}_{s,i} &= \mathbf{c}_i
     &= \mathbf{e}_{t,i} 
\end{align*}
$$

Therefore the $i$-th column is the $i$-th basis vector of $s$ in coordinates of $t$.

Similarly, we know that the inverse rotation $\mathbf{R}_s^t$ is given by $(\mathbf{R}_t^s)^T$. We can do the same procedure as before, but this time in $t$ coordinates. Since the columns of $\mathbf{R}_s^t$ are the rows of $\mathbf{R}_t^s$, we will call the $i$-th column of $\mathbf{R}_s^t$ $\mathbf{r}_i$. Additionally, to avoid confusion, let the standard basis vectors in $t$ be called $\mathbf{d}_{t,i}$.

$$
\begin{align*}
    \mathbf{R}_s^t \mathbf{d}_{t,i} &= \mathbf{r}_i
     &= \mathbf{d}_{s,i} 
\end{align*}
$$

Therefore the $i$-th row of the rotation matrix of a transform is the $i$-th basis vector of $t$ in coordinates of $s$.

# Interactive demo
<!--
script: ./demoCoordinateSystems.js
-->

The following demo allows you to visually inspect the coordinate transform between two coordinate systems $C_0$ and $C_1$. You can move around the systems by dragging the gray dots. You can also move the black point $\mathbf{p}$.

The coordinates of $\mathbf{p}$ in the coordinate systems are displayed (can be disabled), so you can check the values.

Below, the full transformation with all formulas is computed, if you want to check those as well. When cross-checking with the image, just keep in mind that there might sometimes be a slight discrepancy in the decimals due to rounding.

@algeobra.demo(@uid,coordinateSystems)