<!--

author:   sibaku
language: en

version:  1.0.0

script:     https://sibaku.github.io/importance_sampling/three.min.js
            https://sibaku.github.io/importance_sampling/OrbitControls.js
            https://sibaku.github.io/importance_sampling/util.js

@onload
// onload scope doesn't seem to put stuff in the global scope...
window.user_data = {};
// base path to be used in javascript
window.user_data.resource_base = "https://sibaku.github.io/importance_sampling/";
@end

@mutate.remover
<script>
// This is a hack to remove added elements from a container, when it was dynamically created
// A mutation ovserver checks, whether the id was changed and if so, removes the inner parts

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


@three.project: @three.project_(@uid)

@three.project_
<script>
@three.base_(@0)

"LIA: stop"
</script>

<div id="three-@0"></div>
@mutate.remover(three-@0)

@end

@three.base_

let div = window.document.getElementById('three-@0')

div.innerHTML = ""

const renderer = new THREE.WebGLRenderer( { antialias: true } );

div.appendChild( renderer.domElement );

try {
    let input = [
    `@'input(0)`,
    `@'input(1)`,
    `@'input(2)`,
    `@'input(3)`,
    `@'input(4)`,
    `@'input(5)`,
    `@'input(6)`,
    `@'input(7)`,
    `@'input(8)`,
    `@'input(9)`,
    ]

    for(let i=1; i<input.length; i++) {
    if (input[i].startsWith(input[0])) {
        input[i] = ""
    }
    }

    eval(input.join("\n"))
} catch (e) {
    console.error(e)
}


// handle stop-button events
send.handle("stop", e => { env.remove() })

@end

@three.default_hemisphere_cloud: @three.default_hemisphere_cloud_(@uid)

@three.default_hemisphere_cloud_
<script>

let div = window.document.getElementById('three-cloud-@0')
if(div.renderer)
{
    div.renderer.setAnimationLoop(null);
    div.renderer.resetState();
    div.renderer.dispose();
    div.renderer = null;

}
div.innerHTML = ""

const renderer = new THREE.WebGLRenderer( { antialias: true } );

div.appendChild( renderer.domElement );
const points = {};
points.xyz = [];
try {
    let input = [
    `@'input(0)`,
    `@'input(1)`,
    `@'input(2)`,
    `@'input(3)`,
    `@'input(4)`,
    `@'input(5)`,
    `@'input(6)`,
    `@'input(7)`,
    `@'input(8)`,
    `@'input(9)`,
    ]

    for(let i=1; i<input.length; i++) {
    if (input[i].startsWith(input[0])) {
        input[i] = ""
    }
    }
    eval(input.join("\n"))
} catch (e) {
    console.error(e.message)
}


// handle stop-button events
send.handle("stop", e => { env.remove() })


function animation( time ) {

    controls.update();

	renderer.render( scene, camera );

}

const w = window.innerWidth / 2.0;
const h = window.innerHeight / 2.0;
renderer.setSize( w, h );


const camera = new THREE.PerspectiveCamera( 70, w / h, 0.01, 10 );
camera.position.z = 1.5;
camera.position.x = 1.5;
camera.position.y = 1;
camera.lookAt(0,0.5,0);

const controls = new THREE.OrbitControls( camera, renderer.domElement );

const scene = new THREE.Scene();

const sprite = new THREE.TextureLoader().load(window.user_data.resource_base + 'disc.png' );
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.xyz, 3));
scene.add(
    new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            size: 0.5,
            color: 0x00afaf,
            map: sprite,
            transparent : true,
            alphaTest : 0.5
        })));

renderer.setAnimationLoop( animation );
div.renderer = renderer;
"LIA: stop"
</script>

<div id="three-cloud-@0"></div>
@mutate.remover(three-cloud-@0)

@end



@three.default_hemisphere_cloud_2D: @three.default_hemisphere_cloud_2D_(@uid)

@three.default_hemisphere_cloud_2D_
<script>

let div = window.document.getElementById('three-cloud-2d-@0')
if(div.renderer)
{
    div.renderer.setAnimationLoop(null);
    div.renderer.resetState();
    div.renderer.dispose();
    div.renderer = null;

}
div.innerHTML = ""

const renderer = new THREE.WebGLRenderer( { antialias: true } );

div.appendChild( renderer.domElement );
const points = {};
points.xy = [];
try {
    let input = [
    `@'input(0)`,
    `@'input(1)`,
    `@'input(2)`,
    `@'input(3)`,
    `@'input(4)`,
    `@'input(5)`,
    `@'input(6)`,
    `@'input(7)`,
    `@'input(8)`,
    `@'input(9)`,
    ]

    for(let i=1; i<input.length; i++) {
    if (input[i].startsWith(input[0])) {
        input[i] = ""
    }
    }
    eval(input.join("\n"))
} catch (e) {
    console.error(e.message)
}


// handle stop-button events
send.handle("stop", e => { env.remove() })


function animation( time ) {

	renderer.render( scene, camera );
}

const w = window.innerWidth / 2.0;
const h = window.innerHeight / 2.0;
renderer.setSize( w, h );

// Ortho camera doesn't work as well with PointsMaterial...
const camera = new THREE.PerspectiveCamera( 70, w / h, 0.01, 10 );
camera.position.z = 1.5;
camera.position.x = 0.0;
camera.position.y = 0.0;
camera.lookAt(0.0,0.0,0.0);

const scene = new THREE.Scene();

const sprite = new THREE.TextureLoader().load(window.user_data.resource_base + 'disc.png' );

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.xy, 2));

const mesh = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            size: 0.05,
            color: 0x00afaf,
            map: sprite,
            transparent : true,
            alphaTest : 0.5
        }));
mesh.frustumCulled = false;
scene.add(mesh);

renderer.setAnimationLoop( animation );
div.renderer = renderer;



"LIA: stop"
</script>

<div id="three-cloud-2d-@0"></div>
@mutate.remover(three-cloud-2d-@0)

@end




-->

# Introduction

This document is meant as both a quick reference as well as documentation of a few sampling techniques that can be used in path tracing. It mostly came about because I found it hard to find such a reference or the derivations themselves.

This is of course not every kind of sampling technique (for example, no stratified sampling) or distribution, just a few, but maybe someone else can use it as well.

Each Sampling method will have the algorithm and probability density functions listed first and afterwards a derivation. So if you are just looking up how to implement it, you can find it below the images. The images (for the 3D directions) show a heatmap hemisphere corresponding to a number of samples chosen with the showcased method. The heatmap values correspond to number of points per area. Regions with high values will receive more samples than regions with low values.

In general I tried to include every step in the derivation so hopefully it is easy enough to follow.

You can run and all the presented code and change parameters as you like, such as the number of sampled points. In 3D views, you can move around with your mouse. 

## Common helper functions

These are the two functions used to convert from spherical/polar to carthesian coordinates:

``` js
function spherical_to_cart(theta, phi, r = 1.0) {
    const st = Math.sin(theta);
    const ct = Math.cos(theta);
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);

    const x = r * st * sp;
    const y = r * ct;
    const z = r * st * cp;
    
    return [x, y, z];

}

function polar_to_cart(r, alpha) {
    const sa = Math.sin(alpha);
    const ca = Math.cos(alpha);

    const x = r * ca;
    const y = r * sa;

    return [x, y];

}
```

# Inverse Transform Sampling

The following sections will explore some ways to sample points/directions used for the Monte Carlo integration.
The recipe for calculating the sampling formulas is called inverse transform sampling (there are, of course, other methods)

1. Generate a uniform random number in the interval $[0,1]$
2. Find the cumulative distribution function (CDF) $P$ of the desired distribution $p$
3. Calculate $v=P^{-1}(u)$. $v$ will be distributed with $p$

Since we usually need two-dimensional values, we have to modify it a bit

1. Generate two uniform random numbers $u_1, u_2$ in the interval $[0,1]$
2. The probability density function $p$ is dependent on $x_1, x2$, so $p(x_1,x_2)$

   1. Calculate the marginal distribution $p_{x_1}(x1)= \int_{\Omega_2}p(x1,x2)dx_2$
   2. Calculate the conditional probability distribution of $x_2$ with respect to $x_1$ with the Bayes theorem: $p(x2\vert x1)=p(x_1,x_2)p_{x_1}(x_1)$
   
3. Calculate the CDFs $P_{x_1}(x_1)$ and $P{x_2}(x_2)$.
4. Calculate $v_1=P_{x_1}^{-1}(u_1)$ and $v_2=P_{x_2}^{-1}(u_2)$ . $v_1$ and $v_2$ will have the desired distribution

(see for example: https://www.slac.stanford.edu/slac/sass/talks/MonteCarloSASS.pdf)

# Sampling 2D

To start of, we sample a 2D circle/disc.

## Uniform Disc

One way to sample points in a disc is to generate a random number between $0$ and $r$ for the radius and another one for the angle in $[0,2]$. The points won’t be uniformly distributed like that, since the area of segments on the inside is different from that of the outside. The sampling will look something like this:

<!-- data-readOnly="true" data-showGutter="false" -->
``` js
function uniform_angular_circle(){

    const u_1 = Math.random();
    const u_2 = Math.random();
    
    const r = u_1;
    const alpha = u_2 * 2.0 * Math.PI;

    return [r,alpha];
}
```
``` js
const N = 1000;
for(let i = 0; i < N; i++)
{
    const [r,alpha] = uniform_angular_circle();
    const [x,y] = polar_to_cart(r,alpha);

    points.xy.push(x, y);
}
```
@three.default_hemisphere_cloud_2D


The points are focused in the center!
With uniform area sampling it looks like the following:


<!-- data-readOnly="true" data-showGutter="false" -->
``` js
function uniform_circle(){

    const u_1 = Math.random();
    const u_2 = Math.random();
    
    const r = Math.sqrt(u_1);
    const alpha = u_2 * 2.0 * Math.PI;

    return [r,alpha];
}
```
``` js
const N = 1000;
for(let i = 0; i < N; i++)
{
    const [r,alpha] = uniform_circle();
    const [x,y] = polar_to_cart(r,alpha);

    points.xy.push(x, y);
}
```
@three.default_hemisphere_cloud_2D

### Algorithm:

Generate points uniformly distributed over the area of a disk with radius $R$

1. Choose uniform numbers $u_1, u_2$ in $[0,1]$
2. Calculate $r = \sqrt{u_1}R$
3. Calculate $\alpha = 2\pi u_2$

Optionally convert to cartesian coordinates with:

$$
\begin{align*}
    x &= r\cos\alpha \\
    y &= r\sin\alpha
\end{align*}
$$

### PDF Used In Monte Carlo Integration

$$ 
\begin{align*}
    p(\alpha) &= \frac{1}{\pi R^2} \\
    p(r,\alpha) &= \frac{r}{\pi R^2}
\end{align*}
$$

### Derivation:

We want our distribution to be uniform in area over the disk. We will therefore integrate over the entire area $A$.

The probability distribution function (pdf) has to integrate to $1$ over the complete region. Since we want it to be uniform, it will just be some constant for each area element => $p(a)=c$

$$\int_{A}p(a)da = \int_{A}cda = c \int_{A}da = 1$$

_The easy way_:

We know that the area of a disc is $\pi R^2$.

$$c \int_{A}da = 1 \Rightarrow c\pi R^2 = 1 \Rightarrow c = \frac{1}{\pi R^2}$$

_The complicated way_:

An area element $da$ can be decomposed as $da=dxdy$ (the very small area is just a rectangle).
We then define a mapping from polar to cartesian coordinates:

$$x = r\cos\alpha = f_x(r, \alpha)\frac{\partial f_x(r, \alpha)}{\partial r}$$

$$y = r\sin\alpha = f_y(r, \alpha)$$

To do a coordinate transformation we have to find the determinant of the Jacobian of this transformation.

$$\begin{aligned}
J &= \begin{pmatrix} \frac{\partial f_x(r, \alpha)}{\partial r}& \frac{\partial f_x(r, \alpha)}{\partial \alpha} \\ \frac{\partial f_y(r, \alpha)}{\partial r} & \frac{\partial f_y(r, \alpha)}{\partial \alpha} \end{pmatrix} \\
&= \begin{pmatrix} \cos\alpha & -r\sin\alpha \\ \sin\alpha & r\cos\alpha \end{pmatrix} \end{aligned}$$

The determinant is thus:

$$\det{J} = r\cos\alpha \cos\alpha - (-r\sin\alpha \sin\alpha) = r\cos^2\alpha + r\sin^2\alpha = r(\cos^2\alpha + \sin^2\alpha) = r$$

Computing the integral from before:

$$\begin{aligned}
    c \int_{A}da &= c \int_{A}dxdy \\
    &= c \int_0^{R}\int_0^{2\pi} rdrd\alpha \\
    &= c \int_0^{R}rdr\int_0^{2\pi} d\alpha \\
    &= c \int_0^{R}rdr [\alpha]_0^{2\pi} \\
    &= c \int_0^{R}rdr  \\
    &= 2 c \pi \int_0^{R}rdr \\
    &= 2 c \pi [\frac{r^2}{2}]_0^R \\
    &= c\pi R^2 \end{aligned}$$

Setting this result equal to $1$ and solving for $c$ will give the desired result

#### Marginal And Conditional Densities:

We have $p(a)=\frac{1}{\pi R^2}$. With the transformation from the last step we get $p(r,\alpha)=\frac{r}{\pi R^2}$ (Transform into polar angles by adding the factor $r$)

First the marginal density:

$$\begin{aligned}
p_r(r) &= \int_0^{2\pi} p(r,\alpha)d\alpha\\
    &= \int_0^{2\pi} \frac{r}{\pi R^2}d\alpha \\
    &= \frac{r}{\pi R^2}\int_0^{2\pi} d\alpha \\
    &= \frac{r}{\pi R^2} 2\pi \\
    &= \frac{2r}{R^2}
\end{aligned}$$

The conditional probability:

$$p(\alpha \vert  r) = \frac{p(r,\alpha)}{p_r(r)} = \frac{rR^2}{\pi R^2 2r} = \frac{1}{2\pi}$$

#### Compute CDFs

$$P_r(r) = \int_0^r p_r(r')dr' = \int_0^r \frac{2r'}{R^2}dr' = \frac{2}{R^2}[\frac{r^2}{2}]_0^r = \frac{r^2}{R^2}$$

$$P(\alpha \vert  r) = \int_0^\alpha p(\alpha' \vert  r)d\alpha' = \int_0^\alpha \frac{1}{2\pi}d\alpha' = \frac{\alpha}{2\pi}$$

#### Invert CDFs

$$\begin{aligned}
u_1 &= P_r(r) \\
    &= \frac{r^2}{R^2} \\
u_1 R^2 &= r^2 \\
\sqrt{u_1R^2} &= r \\
\sqrt{u_1}R &= r
\end{aligned}$$

$$\begin{aligned}
u_2 &= P(\alpha \vert  r) \\
    &= \frac{\alpha}{2\pi} \\
2\pi u_2 &= \alpha
\end{aligned}$$

# Sampling Hemisphere Directions

The following sections cover different related methods to sample (weighted) hemisphere regions.

## Uniform Unit Hemisphere

Sampling of points uniformly on the hemisphere.
As with the disk, just randomly choosing two angles won’t give the desired result

<!-- data-readOnly="true" data-showGutter="false" -->
``` js
function uniform_angular_hemisphere(){


    const u_1 = Math.random();
    const u_2 = Math.random();

    const theta = u_1 * Math.PI / 2.0;
    const phi = u_2 * 2.0 * Math.PI;

    return [theta,phi]
}
```
``` js
const N = 1000;
for(let i = 0; i < N; i++)
{
    const [theta,phi] = uniform_angular_hemisphere();
    const [x,y,z] = spherical_to_cart(theta,phi);

    points.xyz.push(x, y, z);
}
```
@three.default_hemisphere_cloud



Now the result with a uniform area sampling of the upper hemisphere

<!-- data-readOnly="true" data-showGutter="false" -->
``` js
function uniform_hemisphere(){

    const u_1 = Math.random();
    const u_2 = Math.random();

    // Math.acos(u_1) is also valid
    const theta = Math.acos(1.0 - u_1);
    const phi = u_2 * 2.0 * Math.PI;

    return [theta,phi]
}
```
``` js
const N = 1000;
for(let i = 0; i < N; i++)
{
    const [theta,phi] = uniform_hemisphere();
    const [x,y,z] = spherical_to_cart(theta,phi);

    points.xyz.push(x, y, z);
}
```
@three.default_hemisphere_cloud



### Algorithm

Generate uniform points on the hemisphere

1. Choose uniform numbers $u_1, u_2$ in $[0,1]$
2. Calculate $\theta = \cos^{-1}(1-u_1)$ or  $\theta = \cos^{-1}(u_1)$
3. Calculate $\phi = 2\pi u_2$

Optionally convert to cartesian coordinates with:

$$
\begin{align*}
    x &= \sin\theta\cos\phi\\
    y &= \sin\theta\sin\phi \\
    z &= \cos\theta
\end{align*}
$$

### PDF Used In Monte Carlo Integration

$$p(\omega) = \frac{1}{2\pi}$$

$$p(\theta, \phi) = \frac{1}{2\pi}\sin\theta$$

### Derivation

This is a special case of the general form discussed in the next section, but is shown as an example in more detail.

We want the pdf to be uniform over the unit hemisphere, so it will just be some constant for each solid angle $$\Rightarrow p(\omega) = c$$

$$\int_\Omega p(\omega)d\omega = \int_\Omega c d\omega = c \int_\Omega d\omega = 1$$

_The easy way_:

We know that the solid angle of the hemisphere is $2\pi$ . In general, for uniform sampling the pdf is just $\frac{1}{\operatorname{Vol}(\Omega)}$ , where  $\operatorname{Vol}$ is the volume of the sample space.

$$c\int_\Omega d\omega \Rightarrow c2\pi = 1 \Rightarrow c = \frac{1}{2\pi}$$


_The complicated way_:

$$\begin{aligned}
\int_\Omega p(\omega)d\omega &= \int_0^{\frac{\pi}{2}}\int_0^{2\pi}c\sin\theta d\theta d\phi \\
&= c 2\pi \int_0^{\frac{\pi}{2}}\sin\theta d\theta \\
&= c2\pi [-\cos\theta]_0^{\frac{\pi}{2}} \\
&= c2\pi (\cos 0 - \cos\frac{\pi}{2}) \\
&= c2\pi
\end{aligned}$$

Therefore $c2\pi = 1 \Rightarrow c = \frac{1}{2\pi}$

To convert to the angular representation, we have to add (The factor can be found similarly to the $r$ factor of the disk)

$$p(\omega) = p(\theta,\phi)\sin\theta$$


#### Marginal And Conditional Densities:

$$p_\theta(\theta) = \int_0^{2\pi} p(\theta,\phi)\sin\theta d\phi = \int_0^{2\pi}\frac{1}{2\pi}\sin\theta d\phi = \frac{1}{2\pi}\sin\theta * 2\pi = \sin\theta$$

$$p(\phi \vert  \theta) = \frac{p(\theta,\phi)}{p_\theta(\theta)} = \frac{\sin\theta}{2\pi\sin\theta} = \frac{1}{2\pi}$$

#### Compute CDFs

$$P_\theta(\theta) = \int_0^\theta \sin\theta' d\theta' = [-\cos(\theta')]_0^\theta = \cos 0 - \cos\theta = 1 - \cos\theta$$

$$P(\phi \vert  \theta) = \int_0^\phi p(\phi' \vert  \theta)d\phi' = \int_0^\phi \frac{1}{2\pi}d\phi' = \frac{\phi}{2\pi}$$

#### Invert CDFs

$$u_1 = P_\theta(\theta) = 1 - \cos\theta \Rightarrow \cos\theta = 1 - u_1 \Rightarrow \theta = \cos^{-1}(1- u_1)$$

$$u_2 = P(\phi \vert  \theta) = \frac{\phi}{\theta} \Rightarrow 2\pi u_2 = \phi$$

## Power Cosine Weighted Hemisphere Sector

The following distrbution is chosen, since it includes some other cases (uniform cap, uniform hemisphere, cosine weighted hemisphere, …). Can be used to account for the $\cos$ factor in the rendering equation or for something like the phong model.

The probability of each sample is weighted by its cosine with the normal. Samples are chosen from only a part of the hemisphere, defined by minimum and maximum angles.

Check out the result here:


<!-- data-readOnly="true" data-showGutter="false" -->
``` js
function pow_cos_hemisphere_sector(theta_min,theta_max,phi_min,phi_max,n){

    const u_1 = Math.random();
    const u_2 = Math.random();

    let theta = Math.acos(Math.pow(
        Math.pow(
            Math.cos(theta_min),n+1) 
                - u_1*(Math.pow(Math.cos(theta_min),n+1) 
                - Math.pow(Math.cos(theta_max),n+1)),
        1.0/(n+1)
    ));
    const phi = u_2*(phi_max - phi_min);

    return [theta,phi];
}
```
``` js
const N = 1000;
const theta_min = 0.0;
const theta_max = Math.PI / 2.0;
const phi_min = 0.0;
const phi_max = 2.0 * Math.PI;
const n = 8;
for(let i = 0; i < N; i++)
{
    const [theta,phi] = pow_cos_hemisphere_sector(theta_min, theta_max, phi_min, phi_max,n);
    const [x,y,z] = spherical_to_cart(theta,phi);

    points.xyz.push(x, y, z);
}
```
@three.default_hemisphere_cloud


### Algorithm

Generate points weighted by a power cosine with power $n$ on the sphere sector defined by the angles $\theta_{min}, \theta_{max}, \phi_{min}, \phi_{max}$

1. Choose uniform numbers $u_1, u_2$ in $[0,1]$
2. Calculate $ \theta = \cos^{-1}(\sqrt[n+1]{\cos^{n+1}\theta_{min} - u_1(cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max})} )$
3. Calculate $\phi = u_2(\phi_{max} - \phi_{min})$

Optionally convert to cartesian coordinates with:

$$ x = \sin\theta\cos\phi$$

$$ y = \sin\theta\sin\phi$$

$$ z = \cos\theta$$

### PDF Used In Monte Carlo Integration

$$p(\omega) = \frac{n+1}{(\cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max})({\phi_{max}} - {\phi_{min}}) }\cos^n\theta$$

$$ p(\theta,\phi) = \frac{n+1}{(\cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max})({\phi_{max}} - {\phi_{min}})}\cos^n\theta\sin\theta$$

### Derivation

Each direction should be weighted by a power $n$ of the cosine of the direction’s polar angle, therefore it is proportional to $\cos^n\theta \Rightarrow p(\omega) = c\cos^n\theta$

$$\int_{\Omega_r} p(\omega)d\omega = \int_{\Omega_r} c \cos^n\theta d\omega = c\int_{\Omega_r} \cos^n\theta d\omega = 1$$

Here $\Omega_r$ is the ring of the sphere, which is specified by a minimum and maximum angles $\theta_{min}, \theta_{max}, \phi_{min}, \phi_{max}$ 



#### Normalization factor

$$c\int_{\Omega_r} \cos^n\theta d\omega = c\int_{\theta_{min}}^{\theta_{max}}\int_{\phi_{min}}^{\phi_{max}} \cos^n\theta\sin\theta d\theta d\phi = c({\phi_{max}} - {\phi_{min}})\int_{\theta_{min}}^{\theta_{max}}\cos^n\theta\sin\theta d\theta$$

We evaluate the integral on the right using partial integration and denoting the integral itself as $I$

$$\begin{aligned}
I &= \int_{\theta_{min}}^{\theta_{max}}\cos^n\theta\sin\theta d\theta \\
&= [\cos^n\theta (-\cos\theta)]_{\theta_{min}}^{\theta_{max}} - \int_{\theta_{min}}^{\theta_{max}}-n\cos^{n-1}\theta\sin\theta (-\cos\theta)d\theta \\
&= [-\cos^{n+1}\theta]_{\theta_{min}}^{\theta_{max}} -n\int_{\theta_{min}}^{\theta_{max}}\cos^n\sin\theta d\theta \\
&= \cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max} - nI \\
I + nI &= \cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max} \\
I &= \frac{\cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max}}{n+1} \\
I &= \frac{d}{n+1}
\end{aligned}$$

In the last line, we just introduced a new variable to make writing easier.

Putting this in the first equation:

$$c({\phi_{max}} - {\phi_{min}})\int_{\theta_{min}}^{\theta_{max}} \cos^n\theta\sin\theta d\theta = c({\phi_{max}} - {\phi_{min}})\frac{d}{n+1} = 1 \Rightarrow c = \frac{n+1}{d({\phi_{max}} - {\phi_{min}})} $$

This results in:

$$p(\omega) = \frac{n+1}{d({\phi_{max}} - {\phi_{min}}) }\cos^n\theta \Rightarrow p(\theta,\phi) = \frac{n+1}{d({\phi_{max}} - {\phi_{min}})}\cos^n\theta\sin\theta$$

#### Marginal And Conditional Densities:

$$p_\theta(\theta) = \int_{\phi_{min}}^{\phi_{max}}p(\theta,\phi) d\phi = \int_{\phi_{min}}^{\phi_{max}}\frac{n+1}{d({\phi_{max}} - {\phi_{min}})}\cos^n\theta\sin\theta d\phi = \frac{n+1}{d({\phi_{max}} - {\phi_{min}})}\cos^n\theta\sin\theta ({\phi_{max}} - {\phi_{min}}) = \frac{n+1}{d}\cos^n\theta\sin\theta$$

$$p(\phi \vert  \theta) = \frac{p(\theta,\phi)}{p_\theta(\theta)} = \frac{(n+1)\cos^n\theta\sin\theta d}{d({\phi_{max}} - {\phi_{min}}) (n+1)\cos^n\theta\sin\theta}= \frac{1}{\phi_{max} - \phi_{min} }$$

#### Compute CDFs

$$P_\theta(\theta) = \int_{\theta_{min}}^{\theta}\frac{n+1}{d}\cos^n\theta'\sin\theta'd\theta' = \frac{n+1}{d}\int_{\theta_{min}}^{\theta}\cos^n\theta'\sin\theta'd\theta'$$

We already integrated the integral expression before, so we can use that

$$\frac{n+1}{d}\int_{\theta_{min}}^{\theta}\cos^n\theta'\sin\theta'd\theta' = \frac{n+1}{d}\frac{\cos^{n+1}\theta_{min} - \cos^{n+1}\theta}{n+1} = \frac{\cos^{n+1}\theta_{min} - \cos^{n+1}\theta}{\cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max}}$$

$$P(\phi \vert  \theta) = \int_{\phi_{min}}^{\phi}p(\phi ' \vert  \theta)d\phi' = \int_{\phi_{min}}^{\phi} \frac{1}{\phi_{max} - \phi_{min} }d\phi' =\frac{\phi}{\phi_{max} - \phi_{min}}$$

#### Invert CDFs

$$\begin{aligned}
    u_1 &= P_\theta(\theta)\\
    &= \frac{\cos^{n+1}\theta_{min} - \cos^{n+1}\theta}{\cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max}} \\
    u_1(cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max}) &= \cos^{n+1}\theta_{min} - \cos^{n+1}\theta \\
    \cos^{n+1}\theta &= \cos^{n+1}\theta_{min} - u_1(cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max}) \\
    \cos\theta &= \sqrt[n+1]{\cos^{n+1}\theta_{min} - u_1(cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max})} \\
    \theta &= \cos^{-1}(\sqrt[n+1]{\cos^{n+1}\theta_{min} - u_1(cos^{n+1}\theta_{min} - \cos^{n+1}\theta_{max})} )
\end{aligned}$$

$$\begin{aligned}
    u_2 &= P(\phi \vert  \theta) \\
    &= \frac{\phi}{\phi_{max} - \phi_{min}}\\
    \phi &= u_2(\phi_{max} - \phi_{min})
\end{aligned}$$

## Power Cosine Weighted Hemisphere Cap

The probability of each sample is weighted by a power of its cosine with the normal. Samples are chosen from a cap of the hemisphere, defined by a maximum elevation angle.

Here is the result:

<!-- data-readOnly="true" data-showGutter="false" -->
``` js
function pow_cos_hemisphere_cap(theta_max,n){

    const u_1 = Math.random();
    const u_2 = Math.random();

    const theta = Math.acos(Math.pow(
        1.0 - u_1 * (1.0 - Math.pow(Math.cos(theta_max),n+1)), 
        1.0/(n+1)
    ));
    const phi = u_2 * 2.0 * Math.PI;

    return [theta,phi];
}
```
``` js
const N = 1000;

const theta_max = Math.PI / 4.0;
const n = 32;

for(let i = 0; i < N; i++)
{
    const [theta,phi] = pow_cos_hemisphere_cap(theta_max, n);
    const [x,y,z] = spherical_to_cart(theta,phi);

    points.xyz.push(x, y, z);
}
```
@three.default_hemisphere_cloud


### Algorithm

Generate points weighted by a power cosine with power $n$ on the sphere cap defined by the maximum elevation angle $\theta_{max}$

1. Choose uniform numbers $u_1, u_2$ in $[0,1]$
2. Calculate $\theta = \cos^{-1}(\sqrt[n+1]{1 - u_1(1- \cos^{n+1}\theta_{max})} )$
3. Calculate $\phi = 2\pi u_2$

Optionally convert to cartesian coordinates with:

$$x = \sin\theta\cos\phi$$

$$y = \sin\theta\sin\phi$$

$$z = \cos\theta$$

### PDF Used In Monte Carlo Integration

$$p(\omega) = \frac{n+1}{2\pi(1 - \cos^{n+1}\theta_{max}) }\cos^n\theta$$

$$p(\theta,\phi) = \frac{n+1}{2\pi(1 - \cos^{n+1}\theta_{max}) }\cos^n\theta\sin\theta$$

### Derivation

This is a special case of the power cosine weighted hemisphere sector with $\phi_{min}=0, \phi_{max}=2\pi, \theta_{min} = 0$

## Cosine Weighted Hemisphere

The probability of each sample is weighted by its cosine with the normal. 

Here is the result:

<!-- data-readOnly="true" data-showGutter="false" -->
``` js
function cos_hemisphere(){

    const u_1 = Math.random();
    const u_2 = Math.random();
    
    // Math.sqrt(u_1) works the same way
    const theta = Math.acos(Math.sqrt(1.0 - u_1));
    const phi = u_2 * 2.0 * Math.PI;

    return [theta,phi];
}
```
``` js
const N = 1000;

for(let i = 0; i < N; i++)
{
    const [theta,phi] = cos_hemisphere();
    const [x,y,z] = spherical_to_cart(theta,phi);

    points.xyz.push(x, y, z);
}
```
@three.default_hemisphere_cloud


### Algorithm

Generate points weighted by the cosine hemisphere.

1. Choose uniform numbers $u_1, u_2$ in $[0,1]$
2. Calculate $\theta = \cos^{-1}(\sqrt{1 - u_1} )$
3. Calculate $\phi = 2\pi u_2$

Optionally convert to cartesian coordinates with:

$$x = \sin\theta\cos\phi$$

$$y = \sin\theta\sin\phi$$

$$z = \cos\theta$$

### PDF Used In Monte Carlo Integration

$$p(\omega) = \frac{1}{\pi}\cos\theta$$

$$p(\theta,\phi) = \frac{1}{\pi}\cos\theta\sin\theta$$

### Derivation

This is a special case of the power cosine weighted hemisphere cap with $\theta_{max} = \frac{\pi}{2}, n = 1$

# Sampling Distribution Of Normals

The following algorithms and derivations are for the three commonly used distribution of normal functions for microfacet BRDFs: Beckmann, Phong and Trowbridge–Reitz/GGX.

Note, that all the sampling algorithms are for the microfacet normal, which is used to reflect the incoming ray to get the outgoing direction. Because of that, all probabilities have to be scaled by $$\frac{1}{4\omega_o \cdot \omega_h} = \frac{1}{4\omega_i \cdot \omega_h} $$ to account for the change of measure between the sampled normal (half vector) and incoming direction.

I used the distribution formulas given in Walter et al. (Microfacet Models for Refraction through Rough Surfaces), though I did change the notation a bit to make it easier to write. Hopefully there won't be any confusion. The characteristic functions for the hemisphere check are not included, as they are not that relevant for the sampling, though you should be careful to include them in an implementation that needs to compute the probability densities for arbitrary directions.

Note, that these distributions of normales are normalized, such that:

$$\int_\Omega \operatorname{D}(\omega)\cos\theta d\omega= 1$$

This means, the PDF is $$\operatorname{D}(\omega)\cos\theta$$

## Beckmann Distribution

The normals of the microfacets are distributed according to the Beckmann distribution:

$$\begin{aligned}
    \operatorname{D}(\omega) &= \frac{1}{\pi a_b^2\cos^4\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}}\\
    \operatorname{D}(\theta,\phi) &= \frac{\sin\theta}{\pi a_b^2\cos^4\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}}
\end{aligned}$$
 
Here is the result:

<!-- data-readOnly="true" data-showGutter="false" -->
``` js
function sample_beckmann(a){

    const u_1 = Math.random();
    const u_2 = Math.random();
    
    // Math.log(u_1) works the same way
    const theta = Math.atan(Math.sqrt(-a * a * Math.log(1.0 - u_1)));
    const phi = u_2 * 2.0 * Math.PI;

    return [theta,phi];
}
```
``` js
const N = 1000;

const a = 0.5;

for(let i = 0; i < N; i++)
{
    const [theta,phi] = sample_beckmann(a);
    const [x,y,z] = spherical_to_cart(theta,phi);

    points.xyz.push(x, y, z);
}
```
@three.default_hemisphere_cloud


### Algorithm

Sample microfacet normal according to the Beckmann distribution:

1. Choose uniform numbers $u_1, u_2$ in $[0,1]$
2. Calculate $\theta = \tan^{-1}( \sqrt{-a_b^2\log (1-u_1)})$ or $\theta = \tan^{-1}( \sqrt{-a_b^2\log (u_1)})$ 
3. Calculate $\phi = 2\pi u_2$

Optionally convert to cartesian coordinates with:

$$x = \sin\theta\cos\phi$$

$$y = \sin\theta\sin\phi$$

$$z = \cos\theta$$

### PDF Used In Monte Carlo Integration

$$p_m(\omega) = \frac{\cos\theta}{\pi a_b^2\cos^4\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}} = \frac{1}{\pi a_b^2\cos^3\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}} $$

$$p_m(\theta,\phi) = \frac{\cos\theta\sin\theta}{\pi a_b^2\cos^4\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}} =  \frac{\tan\theta}{\pi a_b^2\cos^2\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}}$$



### Derivation

Due to normalization, the densities are given as follows:

$$\begin{aligned}
    p(\omega) &= D(\omega)\cos\theta\\
    p(\theta,\phi) &= p(\omega)\sin\theta\\
    &= \frac{\sin\theta\cos\theta}{\pi a_b^2\cos^4\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}} \\
    &= \frac{\tan\theta}{\pi a_b^2\cos^2\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}}
\end{aligned}$$

#### Marginal And Conditional Densities:

$$\begin{aligned}
    p_\theta(\theta) &= \int_0^{2\pi}p(\theta,\phi)d\phi \\
    &=\int_0^{2\pi}\frac{\tan\theta}{\pi a_b^2\cos^2\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}} d\phi \\
    &= 2\pi\frac{\tan\theta}{\pi a_b^2\cos^2\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}} \\
    &= 2\frac{\tan\theta}{ a_b^2\cos^2\theta}\exp{\frac{-\tan^{2}\theta}{a_b^2}} \\
    &= 2\pi p(\theta, \phi)
\end{aligned}$$


$$p(\phi \vert  \theta) = \frac{p(\theta,\phi)}{p_\theta(\theta)} = \frac{p(\theta,\phi)}{2\pi p(\theta,\phi)} = \frac{1}{2\pi}$$

#### Compute CDFs

$$P_\theta(\theta) = \int_{0}^{\theta}2\frac{\tan\theta'}{ a_b^2\cos^2\theta'}\exp{\frac{-\tan^{2}\theta'}{a_b^2}}d\theta'$$

To solve this integral, we change variables and introduce $u = \tan\theta'$. That gives us $du = (\tan\theta')'d\theta' = \frac{1}{\cos^2\theta'}d\theta'$. Solving for $du$ (with the usual slight abuse of notation): $d\theta' = \cos^2\theta' du$.

As we will resubstitute later, for now let's disregard the limits:

$$\begin{aligned}
P_\theta(\theta) &= \int 2\frac{\tan\theta'}{ a_b^2\cos^2\theta'}\exp{(\frac{-\tan^{2}\theta'}{a_b^2})} d\theta' \\
&= \frac{2}{a_b^2} \int \frac{u}{ \cos^2\theta'}\exp{(\frac{-u^{2}}{a_b^2})}\cos^2\theta' du\\
&=   \frac{2}{a_b^2} \int u\exp{(\frac{-u^{2}}{a_b^2})} du
\end{aligned}$$

The integral can now be solved by basic means by considering the derivative of the exponential.

$$\begin{aligned}
P_\theta(\theta) &= \frac{2}{a_b^2} \int u\exp{(\frac{-u^{2}}{a_b^2})} du\\
&= \frac{2}{a_b^2} [-\frac{1}{2}a_b^2\exp(\frac{-u^2}{a_b^2})] \\
&= -[\exp(\frac{-u^2}{a_b^2})]
\end{aligned}$$

Resubstituting $u = \tan\theta'$:

$$\begin{aligned}
P_\theta(\theta) &= \frac{2}{a_b^2} \int u\exp{(\frac{-u^{2}}{a_b^2})} du\\
&= -[\exp(\frac{-\tan^2\theta'}{a_b^2})]_0^{\theta}\\
&= -(\exp(\frac{-\tan^2\theta}{a_b^2}) - \exp(\frac{-\tan^20}{a_b^2}) ) \\
&= -(\exp(\frac{-\tan^2\theta}{a_b^2}) - 1 ) \\
&= 1- \exp(\frac{-\tan^2\theta}{a_b^2})
\end{aligned}$$

$$P(\phi \vert  \theta) = \int_{0}^{\phi}p(\phi ' \vert  \theta)d\phi' = \int_{0}^{\phi} \frac{1}{2\pi }d\phi' =\frac{\phi}{2\pi}$$

#### Invert CDFs

$$\begin{aligned}
    u_1 &= P_\theta(\theta)\\
    &= 1- \exp(\frac{-\tan^2\theta}{a_b^2}) \\
    u_1 - 1 &=- \exp(\frac{-\tan^2\theta}{a_b^2}) \\
    1- u_1 &= \exp(\frac{-\tan^2\theta}{a_b^2}) \\
    \log (1-u_1) &= \frac{-\tan^2\theta}{a_b^2} \\
    -a_b^2\log (1-u_1)&= \tan^2\theta \\
    \sqrt{-a_b^2\log (1-u_1)}&= \tan\theta \\
    \tan^{-1}( \sqrt{-a_b^2\log (1-u_1)}) &= \theta\\
    \theta &=\tan^{-1}( \sqrt{-a_b^2\log (1-u_1)})
\end{aligned}$$

Since $u_1$ is uniformly distributed in $[0,1]$, so is $1-u_1$, so we can use either of them for the generation.

$$\begin{aligned}
    u_2 &= P(\phi \vert  \theta) \\
    &= \frac{\phi}{2\pi}\\
    \phi &= u_22\pi
\end{aligned}$$


## Phong Distribution

The normals of the microfacets are distributed according to the Phong Distribution:

$$\begin{aligned}
    \operatorname{D}(\omega) &= \frac{a_p +2}{2\pi}\cos^{a_p}\theta\\
    \operatorname{D}(\theta,\phi) &= \frac{a_p +2}{2\pi}\cos^{a_p}\theta\sin\theta
\end{aligned}$$

Walter et al. recommend a relation between the Beckmann $a_b$ and the phong $a_p$:

$$\begin{aligned}
    a_p &= 2a_b^{-2} - 2
\end{aligned}$$

Here is the result:


<!-- data-readOnly="true" data-showGutter="false" -->
``` js
function pow_cos_hemisphere_cap(theta_max,n){

    const u_1 = Math.random();
    const u_2 = Math.random();

    const theta = Math.acos(Math.pow(
        1.0 - u_1 * (1.0 - Math.pow(Math.cos(theta_max),n+1)), 
        1.0/(n+1)));
    const phi = u_2 * 2.0 * Math.PI;

    return [theta,phi];
}

function beckmann_width_to_phong(a) {
    return 2.0 / (a*a) - 2.0;
}

function sample_phong_normal(a) {

    return pow_cos_hemisphere_cap(Math.PI / 2.0, a + 1);
}
```
``` js
const N = 1000;

const a = beckmann_width_to_phong(0.5);

for(let i = 0; i < N; i++)
{
    const [theta,phi] = sample_phong_normal(a);
    const [x,y,z] = spherical_to_cart(theta,phi);

    points.xyz.push(x, y, z);
}
```
@three.default_hemisphere_cloud

### Algorithm

Sample microfacet normal according to the Phong distribution:

1. Choose uniform numbers $u_1, u_2$ in $[0,1]$
2. Calculate $\theta = \cos^{-1}(\sqrt[a_p+2]{1 - u_1} )$ or  $\theta = \cos^{-1}(\sqrt[a_p+2]{u_1} )$
3. Calculate $\phi = 2\pi u_2$

Optionally convert to cartesian coordinates with:

$$x = \sin\theta\cos\phi$$

$$y = \sin\theta\sin\phi$$

$$z = \cos\theta$$

### PDF Used In Monte Carlo Integration

$$p_m(\omega) =  \frac{a_p +2}{2\pi}\cos^{a_p}\theta\cos\theta = \frac{a_p +2}{2\pi}\cos^{a_p+1}\theta$$

$$p_m(\theta,\phi) = \frac{a_p +2}{2\pi}\cos^{a_p}\theta\cos\theta\sin\theta = \frac{a_p +2}{2\pi}\cos^{a_p +1}\theta\sin\theta$$



### Derivation

This distribution is just a special case of the power cosine hemisphere cap above, but with $$\theta_{max}=\frac{\pi}{2}, n = a_p+1$$

$$p(\omega) = \frac{n+1}{2\pi(1 - \cos^{n+1}\theta_{max}) }\cos^n\theta = \frac{n+1}{2\pi }\cos^n\theta=\frac{a_p+2}{2\pi }\cos^{a_p + 1}\theta$$

The formula given by Walter et al. comes from replacing $1-u_1$ by $u_1$, since both are uniformly distributed within $[0,1]$.


## Trowbridge–Reitz / GGX Distribution

The normals of the microfacets are distributed according to the Trowbridge–Reitz / GGX distribution:

$$\begin{aligned}
    \operatorname{D}(\omega) &= \frac{a_g^2}{\pi\cos^4\theta (a_g^2 + \tan^2\theta)^2}\\
    \operatorname{D}(\theta,\phi) &= \frac{a_g^2}{\pi\cos^4\theta (a_g^2 + \tan^2\theta)^2}\sin\theta
\end{aligned}$$

Here is the result:

<!-- data-readOnly="true" data-showGutter="false" -->
``` js

function sample_ggx(a) {
    
    const u_1 = Math.random();
    const u_2 = Math.random();
    
    // (u_1) works the same way as (1.0 - u_1)
    const theta = Math.atan(Math.sqrt(a * a * u_1 / (1.0 - u_1)));
    const phi = u_2 * 2.0 * Math.PI;

    return [theta,phi];
}
```
``` js
const N = 1000;

const a = 0.5;

for(let i = 0; i < N; i++)
{
    const [theta,phi] = sample_ggx(a);
    const [x,y,z] = spherical_to_cart(theta,phi);

    points.xyz.push(x, y, z);
}
```
@three.default_hemisphere_cloud

### Algorithm

Sample microfacet normal according to the Trowbridge–Reitz / GGX distribution:

1. Choose uniform numbers $u_1, u_2$ in $[0,1]$
2. Calculate $\theta = \tan^{-1}(\frac{a_g\sqrt{u_1}}{\sqrt{1- u_1}})$
3. Calculate $\phi = 2\pi u_2$

Optionally convert to cartesian coordinates with:

$$x = \sin\theta\cos\phi$$

$$y = \sin\theta\sin\phi$$

$$z = \cos\theta$$

### PDF Used In Monte Carlo Integration

$$p_m(\omega) = \frac{a_g^2\cos\theta}{\pi\cos^4\theta (a_g^2 + \tan^2\theta)^2} = \frac{a_g^2}{\pi\cos^3\theta (a_g^2 + \tan^2\theta)^2}  $$

$$p_m(\theta,\phi) = \frac{a_g^2\cos\theta\sin\theta}{\pi\cos^4\theta (a_g^2 + \tan^2\theta)^2}= \frac{a_g^2\tan\theta}{\pi\cos^2\theta (a_g^2 + \tan^2\theta)^2} $$

### Derivation

Due to normalization, the densities are given as follows:

$$\begin{aligned}
    p(\omega) &= D(\omega)\cos\theta\\
    p(\theta,\phi) &= p(\omega)\sin\theta\\
    &= \frac{a_g^2\cos\theta\sin\theta}{\pi\cos^4\theta (a_g^2 + \tan^2\theta)^2}\\
    &= \frac{a_g^2\tan\theta}{\pi\cos^2\theta (a_g^2 + \tan^2\theta)^2}
\end{aligned}$$

#### Marginal And Conditional Densities:

$$\begin{aligned}
    p_\theta(\theta) &= \int_0^{2\pi}p(\theta,\phi)d\phi \\
    &=\int_0^{2\pi}\frac{a_g^2\tan\theta}{\pi\cos^2\theta (a_g^2 + \tan^2\theta)^2} d\phi \\
    &= 2\pi\frac{a_g^2\tan\theta}{\pi\cos^2\theta (a_g^2 + \tan^2\theta)^2}\\
    &= 2a_g^2\frac{\tan\theta}{\cos^2\theta (a_g^2 + \tan^2\theta)^2}\\
    &= 2\pi p(\theta, \phi)
\end{aligned}$$


$$p(\phi \vert  \theta) = \frac{p(\theta,\phi)}{p_\theta(\theta)} = \frac{p(\theta,\phi)}{2\pi p(\theta,\phi)} = \frac{1}{2\pi}$$

#### Compute CDFs

$$P_\theta(\theta) = \int_{0}^{\theta}2a_g^2\frac{\tan\theta'}{\cos^2\theta' (a_g^2 + \tan^2\theta')^2}d\theta'$$

To solve this integral, we change variables and introduce $u = \tan\theta'$. That gives us $du = (\tan\theta')'d\theta' = \frac{1}{\cos^2\theta'}d\theta'$. Solving for $d\theta'$ (with the usual slight abuse of notation): $d\theta' = \cos^2\theta' du$.

As we will resubstitute later, for now let's disregard the limits:

$$\begin{aligned}
P_\theta(\theta) &= \int 2a_g^2\frac{\tan\theta'}{\cos^2\theta' (a_g^2 + \tan^2\theta')^2}d\theta' \\
&= 2a_g^2 \int \frac{u}{\cos^2\theta' (a_g^2 + u^2)^2}\cos^2\theta'du\\
&= 2a_g^2 \int \frac{u}{(a_g^2 + u^2)^2} du\\
\end{aligned}$$

We will do a second substitution: $v = a_g^2 + u^2$. That gives us $dv = (a_g^2 +u^2)'du = 2udu$. Solving for $du$: $du = \frac{dv}{2u}$ 

$$\begin{aligned}
2a_g^2 \int \frac{u}{(a_g^2 + u^2)^2} du &= 2a_g^2 \int \frac{u}{v^2} \frac{dv}{2u} \\
&= a_g^2 \int \frac{1}{v^2} dv
\end{aligned}$$

This can be easily solved:

$$\begin{aligned}
a_g^2 \int \frac{1}{v^2} dv \\
&= a_g^2 [-\frac{1}{v}] \\
&= -a_g^2 [\frac{1}{v}]
\end{aligned}$$

Resubstituting $v = a_g^2 + u^2$:

$$\begin{aligned}
-a_g^2 [\frac{1}{v}] &= -a_g^2 [\frac{1}{a_g^2 + u^2}]
\end{aligned}$$


Resubstituting $u = \tan\theta'$:

$$\begin{aligned}
P_\theta(\theta) &= -a_g^2 [\frac{1}{a_g^2 + u^2}]\\
&=   -a_g^2 [\frac{1}{a_g^2 + \tan^2\theta'}]_0^{\theta}\\
&=  -a_g^2  (\frac{1}{a_g^2 + \tan^2\theta} - \frac{1}{a_g^2 + \tan^20})\\
&=  -a_g^2  (\frac{1}{a_g^2 + \tan^2\theta} - \frac{1}{a_g^2})\\
&= 1 - \frac{a_g^2}{a_g^2 + \tan^2\theta}
\end{aligned}$$

$$P(\phi \vert  \theta) = \int_{0}^{\phi}p(\phi ' \vert  \theta)d\phi' = \int_{0}^{\phi} \frac{1}{2\pi}d\phi' =\frac{\phi}{2\pi}$$

#### Invert CDFs

$$\begin{aligned}
    u_1 &= P_\theta(\theta)\\
    &= 1 - \frac{a_g^2}{a_g^2 + \tan^2\theta} \\
    u_1 - 1&=- \frac{a_g^2}{a_g^2 + \tan^2\theta} \\
    1- u_1 &= \frac{a_g^2}{a_g^2 + \tan^2\theta} \\
    a_g^2 + \tan^2\theta &= \frac{a_g^2}{1- u_1} \\
    \tan^2\theta &= \frac{a_g^2}{1- u_1} -a_g^2 \\
    \tan\theta &= \sqrt{\frac{a_g^2}{1- u_1} -a_g^2}\\
    \theta &= \tan^{-1}(\sqrt{\frac{a_g^2}{1- u_1} -a_g^2}) \\
    &= \tan^{-1}(\sqrt{\frac{a_g^2 - a_g^2(1-u_1)}{1- u_1}}) \\
    &= \tan^{-1}(\sqrt{\frac{a_g^2- a_g^2+ a_g^2u_1}{1- u_1}}) \\
    &= \tan^{-1}(\sqrt{\frac{a_g^2u_1}{1- u_1}}) \\
    &=  \tan^{-1}(\frac{a_g\sqrt{u_1}}{\sqrt{1- u_1}})
\end{aligned}$$

Here the last line is the formulation found in Walter et al.

$$\begin{aligned}
    u_2 &= P(\phi \vert  \theta) \\
    &= \frac{\phi}{2\pi}\\
    \phi &= u_22\pi
\end{aligned}$$
