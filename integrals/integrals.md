<!--
author:   sibaku

email:    

version:  0.0.1

language: en

narrator: US English Female

script: https://cdn.plot.ly/plotly-2.12.1.min.js
        https://cdn.rawgit.com/davidedc/Algebrite/master/dist/algebrite.bundle-for-browser.js

comment: Basic introduction into integrals
-->

# Introduction

Integrals are found in many different applications. 

A very common one is finding the distance traveled while moving with a varying velocity, which can also be described as finding the length of some path that you moved on. You might unknowingly encounter this in many games. If a camera in a cutscene or an NPC patrolling an area need to move at a certain speed along a designer specified path, you need to calculate the length of it first.

You can find the area of complicated shapes with integrals, which uses the classic notion of area under a graph.

Probability theory uses integrals for defining various kinds of events and combinations of events.

In computer graphics we can define the interaction of light and surfaces with integrals.

Many applications go farther than the basic notation and examples we will see in the following sections, but are fundamentally the same.

We won't do any overly formal or perfect proofs in this document, there are other documents for that. Instead we will try to find some kind of understanding of the notation and words commonly used.

# Area under a curve

The first time you will encounter integrals is probably when trying to find the area under a graph defined by some function $\operatorname{f}$. We will also use this approach, as it is pretty intuitive.

## Basic idea

Let's start with a very simple function: $\operatorname{f}(x) = 1$, which is a horizontal line, that looks as follows:

<div id="id_0" style="width:100%;height:50%;"></div>

<script>

let expr = Algebrite.run(`1`);

const div = document.getElementById('id_0');

const xmin = 0;
const xmax = 2;
const xdelta = xmax - xmin;
const n = 100;

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


let layout = {
    title: 'A constant function',
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

Now, how would we calculate the area under that graph between $0$ and $2$? That area looks like a rectangle, so why not use that. The area of a rectangle is just width times height. Height is given by $\operatorname{f}$, in this case just $1$. The width is the $x$-range of the regions, so $2-0=2$,  giving us an area of $2*1=2$.

<div id="id_1" style="width:100%;height:50%;"></div>

<script>

let expr = Algebrite.run(`1`);

const div = document.getElementById('id_1');

const xmin = 0;
const xmax = 2;
const xdelta = xmax - xmin;
const xcenter = (xmax + xmin) * 0.5;
const n = 100;

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
        visible: true,
        fill: 'tozeroy',

    }
);

const text_trace = {

  x: [xcenter],

  y: [parseFloat(Algebrite.run(`eval(${expr},x,${xcenter})`))/2],

  mode: 'text',

  name: '',

  text: ['1*2 = 2'],
  showlegend  :false,

  textposition: 'center',

  type: 'scatter',
      textfont : {
        size: 20
    }
};

data.push(text_trace);

let layout = {
    title: 'A constant function',
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

Now let's look at a slightly more complicated function $\operatorname{f}(x) = 2x$ in the same region.

<div id="id_2" style="width:100%;height:50%;"></div>

<script>

let expr = Algebrite.run(`2x`);

const div = document.getElementById('id_2');

const xmin = 0;
const xmax = 2;
const xdelta = xmax - xmin;
const xcenter = (xmax + xmin) * 0.5;
const n = 100;

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
        visible: true,

    }
);


let layout = {
    title: 'A linear function',
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

We can of course again use a rectangle, but this won't give us the exact area in this case due to the non horizontal line. We can still try to approximate the area. But how to choose the height? Well, there are infinite choices. Let's stick with two simple choices: Use the function value at the left or right side, so $\operatorname{f}(0)$ and $\operatorname{f}(2)$.

<div id="id_3" style="width:100%;height:50%;"></div>

<script>

let expr = Algebrite.run(`2x`);

const div = document.getElementById('id_3');

const xmin = 0;
const xmax = 2;
const xdelta = xmax - xmin;
const xcenter = (xmax + xmin) * 0.5;
const n = 100;

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
        visible: true,

    }
);

{
    const left_sum = Algebrite.run(`eval(${expr},x,${xmin})`);
    const yis = [];
    for (let i = 0; i < n; i++) {
    const y = parseFloat(Algebrite.run(`eval(${left_sum},x,${xs[i]})`));
    yis.push(y);
    }
    data.push(
        {
            x: xs,
            y: yis,
            mode: 'lines',
            name: 'Left rectangle',
            visible: true,
            fill: "tozeroy"

        }
    );
}


{
    const right_sum = Algebrite.run(`eval(${expr},x,${xmax})`);
    const yis = [];
    for (let i = 0; i < n; i++) {
    const y = parseFloat(Algebrite.run(`eval(${right_sum},x,${xs[i]})`));
    yis.push(y);
    }
    data.push(
        {
            x: xs,
            y: yis,
            mode: 'lines',
            name: 'Right rectangle',
            visible: true,
            fill: "tozeroy"

        }
    );
}

let layout = {
    title: 'A linear function',
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

Obviously, the left rectangle has an area of $0$, since $2*0 = 0$, so it shows up as just a line. The right rectangle then has an area with $2*2 * 2 = 4 * 2 = 8$. Now we can actually compute the area ourselves, since the shape is just right-angled triangle! For that, the formula is just half the height times the base, so $\frac{2*2*2}{2} = 4$. This of course makes sense, as it is exactly half of the right rectangle. but we can also see, that the solutions lies between our two approximations.

How to do better? Well, how about we keep using rectangles, since they are really easy to calculate, but we use more of them. Let's start by using two rectangles, one for each half of the region. The following will show the left and right rectangles on a plot left and right respectively. Each rectangle will display its area in the middle.

<div id="id_4" style="width:100%;height:50%;"></div> 

<script>

let expr = Algebrite.run(`2x`);

const div = document.getElementById('id_4');

const xmin = 0;
const xmax = 2;
const xdelta = xmax - xmin;
const xcenter = (xmax + xmin) * 0.5;
const n = 100;

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
        visible: true,
        xaxis: "x",
        yaxis: "y",

    }
);

data.push( {
        x: xs,
        y: ys,
        mode: 'lines',
        name: expr,
        visible: true,
        xaxis: "x2",
        yaxis: "y2",

    });

const num_segments = 2;

let total_area_left = 0.0;
let total_area_right = 0.0;
for(let j = 0; j < num_segments;j++)
{
    const lval = parseFloat(Algebrite.run(`float((${j}/${num_segments}) * (${xdelta}) + (${xmin}))`));
    const rval = parseFloat(Algebrite.run(`float(((${j}+1)/${num_segments}) * (${xdelta}) + (${xmin}))`));
    const cval = (rval + lval) * 0.5;
    {
        const left_sum = Algebrite.run(`eval(${expr},x,${lval})`);
        const yis = [];
        const xis = [];
        for (let i = 0; i < 2; i++) {
            const xv =lval + i  *(rval - lval);
            xis.push(xv);
            const y = parseFloat(Algebrite.run(`eval(${left_sum},x,${xv})`));
            yis.push(y);
        }
        data.push(
            {
                x: xis,
                y: yis,
                mode: 'lines',
                name: `Left rectangle ${j}`,
                visible: true,
                fill: "tozeroy",
                xaxis: "x",
                yaxis: "y",
                showlegend  :false,

            }
        );
        const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${left_sum})`));
        total_area_left += area;    
        const text_trace = {
            x: [cval],
            y: [parseFloat(left_sum)/2],
            mode: 'text',
            name: '',
            text: [`${area}`],
            showlegend  :false,
            textposition: 'center',
            type: 'scatter',
                textfont : {
                    size: 20
                },
            xaxis: "x",
            yaxis: "y",
            };
        data.push(text_trace);
    }

    {
        const right_sum = Algebrite.run(`eval(${expr},x,${rval})`);
        const yis = [];
        const xis = [];
        for (let i = 0; i < 2; i++) {
            const xv =lval + i  *(rval - lval);
            xis.push(xv);
            const y = parseFloat(Algebrite.run(`eval(${right_sum},x,${xv})`));
            yis.push(y);
        }
        data.push(
            {
                x: xis,
                y: yis,
                mode: 'lines',
                name: `Right rectangle ${j}`,
                visible: true,
                fill: "tozeroy",
                xaxis: "x2",
                yaxis: "y2",
                showlegend  :false,

            }
        );

        const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${right_sum})`));
        total_area_right += area;
            const text_trace = {
                x: [cval],
                y: [parseFloat(right_sum)/2],
                mode: 'text',
                name: '',
                text: [`${area}`],
                showlegend  :false,
                textposition: 'center',
                type: 'scatter',
                    textfont : {
                        size: 20
                    },
                xaxis: "x2",
                yaxis: "y2",
                };
            data.push(text_trace);
    }

}


let layout = {
    title: `Toal area left : ${total_area_left}, Toal area right : ${total_area_right}`,
    xaxis: {
        title: 'x',
        domain: [0, 0.45]
    },
    yaxis: {

        title: 'y',
        autorange: false,
        range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
    },

    yaxis2: { 
            anchor: "x2",
            title: 'y',
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad] 
            },
    xaxis2: { 
        title: 'x',
        domain: [0.55, 1] }

};
Plotly.newPlot(div, data, layout);

"LIA: stop"
</script>

Both values are already closer to the correct value than they were before! But why stop there? We could also use, $5$ segments (or many more). Let's have a look at $5$.

<div id="id_5" style="width:100%;height:50%;"></div> 


<script>

let expr = Algebrite.run(`2x`);

const div = document.getElementById('id_5');

const xmin = 0;
const xmax = 2;
const xdelta = xmax - xmin;
const xcenter = (xmax + xmin) * 0.5;
const n = 100;

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
        visible: true,
        xaxis: "x",
        yaxis: "y",

    }
);

data.push( {
        x: xs,
        y: ys,
        mode: 'lines',
        name: expr,
        visible: true,
        xaxis: "x2",
        yaxis: "y2",

    });

const num_segments = 5;

let total_area_left = 0.0;
let total_area_right = 0.0;
for(let j = 0; j < num_segments;j++)
{
    const lval = parseFloat(Algebrite.run(`float((${j}/${num_segments}) * (${xdelta}) + (${xmin}))`));
    const rval = parseFloat(Algebrite.run(`float(((${j}+1)/${num_segments}) * (${xdelta}) + (${xmin}))`));
    const cval = (rval + lval) * 0.5;


    {
        const left_sum = Algebrite.run(`eval(${expr},x,${lval})`);
        const yis = [];
        const xis = [];
        for (let i = 0; i < 2; i++) {
            const xv =lval + i  *(rval - lval);
            xis.push(xv);
            const y = parseFloat(Algebrite.run(`eval(${left_sum},x,${xv})`));
            yis.push(y);
        }

        data.push(
            {
                x: xis,
                y: yis,
                mode: 'lines',
                name: `Left rectangle ${j}`,
                visible: true,
                fill: "tozeroy",
                xaxis: "x",
                yaxis: "y",
                showlegend  :false,

            }
        );
        const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${left_sum})`));
        total_area_left += area;    
        const text_trace = {
            x: [cval],
            y: [parseFloat(left_sum)/2],
            mode: 'text',
            name: '',
            text: [`${area}`],
            showlegend  :false,
            textposition: 'center',
            type: 'scatter',
                textfont : {
                    size: 20
                },
            xaxis: "x",
            yaxis: "y",
            };
        data.push(text_trace);
    }

    {
        const right_sum = Algebrite.run(`eval(${expr},x,${rval})`);
        const yis = [];
        const xis = [];
        for (let i = 0; i < 2; i++) {
            const xv =lval + i  *(rval - lval);
            xis.push(xv);
            const y = parseFloat(Algebrite.run(`eval(${right_sum},x,${xv})`));
            yis.push(y);
        }
        data.push(
            {
                x: xis,
                y: yis,
                mode: 'lines',
                name: `Right rectangle ${j}`,
                visible: true,
                fill: "tozeroy",
                xaxis: "x2",
                yaxis: "y2",
                showlegend  :false,

            }
        );

        const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${right_sum})`));
        total_area_right += area;
            const text_trace = {
                x: [cval],
                y: [parseFloat(right_sum)/2],
                mode: 'text',
                name: '',
                text: [`${area}`],
                showlegend  :false,
                textposition: 'center',
                type: 'scatter',
                    textfont : {
                        size: 20
                    },
                xaxis: "x2",
                yaxis: "y2",
                };
            data.push(text_trace);
    }

}


let layout = {
    title: `Toal area left : ${total_area_left}, Toal area right : ${total_area_right}`,
    xaxis: {
        title: 'x',
        domain: [0, 0.45]
    },
    yaxis: {

        title: 'y',
        autorange: false,
        range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
    },

    yaxis2: { 
            anchor: "x2",
            title: 'y',
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad] 
            },
    xaxis2: { 
        title: 'x',
        domain: [0.55, 1] }

};
Plotly.newPlot(div, data, layout);

"LIA: stop"
</script>

This got us even close to the actual value! We also see that the left rectangles, which are too small, slowly go up in total size, while the right angles, which are too large, slowly go down.

Let's do it one last time, but without the individual areas and see how this works out with a lot more subrectangles.


<div id="id_6" style="width:100%;height:50%;"></div> 


<script>

let expr = Algebrite.run(`2x`);

const div = document.getElementById('id_6');

const xmin = 0;
const xmax = 2;
const xdelta = xmax - xmin;
const xcenter = (xmax + xmin) * 0.5;
const n = 100;

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
        visible: true,
        xaxis: "x",
        yaxis: "y",

    }
);

data.push( {
        x: xs,
        y: ys,
        mode: 'lines',
        name: expr,
        visible: true,
        xaxis: "x2",
        yaxis: "y2",

    });

const num_segments = 400;

let total_area_left = 0.0;
let total_area_right = 0.0;
for(let j = 0; j < num_segments;j++)
{
    const lval = parseFloat(Algebrite.run(`float((${j}/${num_segments}) * (${xdelta}) + (${xmin}))`));
    const rval = parseFloat(Algebrite.run(`float(((${j}+1)/${num_segments}) * (${xdelta}) + (${xmin}))`));
    const cval = (rval + lval) * 0.5;


    {
        const left_sum = Algebrite.run(`eval(${expr},x,${lval})`);
        const yis = [];
        const xis = [];
        for (let i = 0; i < 2; i++) {
            const xv =lval + i  *(rval - lval);
            xis.push(xv);
            const y = parseFloat(Algebrite.run(`eval(${left_sum},x,${xv})`));
            yis.push(y);
        }

        data.push(
            {
                x: xis,
                y: yis,
                mode: 'lines',
                name: `Left rectangle ${j}`,
                visible: true,
                fill: "tozeroy",
                xaxis: "x",
                yaxis: "y",
                showlegend  :false,

            }
        );
        const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${left_sum})`));
        total_area_left += area;    
       
    }

    {
        const right_sum = Algebrite.run(`eval(${expr},x,${rval})`);
        const yis = [];
        const xis = [];
        for (let i = 0; i < 2; i++) {
            const xv =lval + i  *(rval - lval);
            xis.push(xv);
            const y = parseFloat(Algebrite.run(`eval(${right_sum},x,${xv})`));
            yis.push(y);
        }
        data.push(
            {
                x: xis,
                y: yis,
                mode: 'lines',
                name: `Right rectangle ${j}`,
                visible: true,
                fill: "tozeroy",
                xaxis: "x2",
                yaxis: "y2",
                showlegend  :false,

            }
        );

        const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${right_sum})`));
        total_area_right += area;
          
    }

}


let layout = {
    title: `Toal area left : ${total_area_left}, Toal area right : ${total_area_right}<br>Number of rectangles: ${num_segments}`,
    xaxis: {
        title: 'x',
        domain: [0, 0.45]
    },
    yaxis: {

        title: 'y',
        autorange: false,
        range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
    },

    yaxis2: { 
            anchor: "x2",
            title: 'y',
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad] 
            },
    xaxis2: { 
        title: 'x',
        domain: [0.55, 1] }

};
Plotly.newPlot(div, data, layout);

"LIA: stop"
</script>

Nice! Very very close to the actual value!

We will continue in the next section to write this notion down with some maths.

## Defining what the integral is

In the last sections, we have seen how we can approach computing the area under a curve by just drawing a bunch of easy to calculate rectangles along the function.

In this section we will write it down nicely and cover the notation you might come across when you look up integrals, which might seem intimidating.

We start by defining an interval in which we want to find the area of the function, denoted by $[a,b]$. $a$ is the lower starting $x$-value, $b$ is the upper ending $x$-value. Since we are planning to make a bunch of rectangles, let's use a name for the number of those rectangles: $n$.

Since we try to keep it easy, each rectangle will have the same width. The length of the total $x$ interval is $b-a$. Thus, the width of one rectangle is just $\frac{b-a}{n}$. We should also give this value a name:

$$\Delta x = \frac{b-a}{n}$$ 

This might be a first stumbling block, but don't worry! That symbol $\Delta$ is a greek letter and you pronounce it "delta", so $\Delta x$ is pronounced "delta x". This $\Delta$ symbol is commonly used in maths and physics to denote some kind of difference (**D**elta, **D**ifference). Here we also have a difference, though scaled a bit.

We will also need $x$-values, where we evaluate the function at to get the height of our rectangles. As we only use $x$-values at the beginning or the end of our rectangles, we should just find some expression for those. The easiest ones are the first and last one, those are just $x_0 = a$ (first) and $x_n = b$ (last). The subscript will become clearer in the next step. Now, what is the second value? It should be one rectangle width away from the first. We already defined the rectangle width as $\Delta x$!. So the second value is $x_1 = x_0 + \Delta x$. The third one then is one width further than the second one. $x_2 = x_1 + \Delta x$. We can also just put in the definition of $x_1$ into that last one: $x_2 = x_1 + \Delta x = x_0 + \Delta x + \Delta x = x_0 + 2\Delta x$.

You can probably guess the pattern from that. $x_3$ will be $x_0 + 3\Delta x$ and so on. If we use that subscript as a nice index for which point we are talking about, then we get this very simple formula:

$$x_i = x_0 + i\Delta x$$

This is consistent with the start of this. If we plug in $i=0$, we get $x_0$. If we plug in $i=n$ (and remember that $x_0 = a$), we get $x_0 + n\Delta x = a + n\frac{b-a}{n} = a + b - a = b = x_n$.

We can now define the area of one of our rectangles. Let's start with the first one again. We have to decide, whether to use the left or right rectangle. If we use the left, then we evaluate the function $\operatorname{f}$, that we want to integrate, at the left point. So the area will be $\operatorname{f}(x_0) * \Delta x$. The second rectangle will then use the second $x$-value, and its area is $\operatorname{f}(x_1) * \Delta x$. This will go on until the $n$-th rectangle. If you keep in mind, that we started counting at $0$  for our $x$ subscripts, the last rectangle will be $\operatorname{f}(x_{n-1}) * \Delta x$. In the following, let's skip the $*$ symbol, as it clutters up the notation, so we write $\operatorname{f}(x_0)\Delta x$ instead of $\operatorname{f}(x_0) * \Delta x$. Let us now add up all our areas to find the total area $A$!

$$ A = \operatorname{f}(x_0)\Delta x + \operatorname{f}(x_1)\Delta x + \operatorname{f}(x_2)\Delta x + \dots + \operatorname{f}(x_{n-1})\Delta x$$

As you can see, all the terms in the sum look basically the same. Each term looks like $\operatorname{f}(x_i)\Delta x$, where $i$ is some index. We basically just write down a list of values for $i$ and then add the corresponding term to the total. The values that $i$ takes are $1,2,3,\dots,n-1$. With this we introduce the next math notation you will come across very often. The summation symbol $\sum$ (Sigma). With that symbol, the above sum can be written compactly as:

$$
A = \sum_{i=0}^{n-1}\operatorname{f}(x_i)\Delta x
$$

Below the $\sum$, we write the name of the index variable, here $i$, and what its start index is, here $0$. On top of the $\sum$ we write what the final value of $i$ will be, here $n-1$. This then just means: Write down all integer values of $i$ between the starting and endvalue (inclusive), plug that value into the formula right of $\sum$ and add all the different values that are produced that way. Which is exactly what we have written down before. You can remember the connection of the symbol and sums as: **S**igma, **S**um.

We can also see how nice this notation is, when we now consider the right rectangles. They only differ, in that we start with not the first $x$-value, but the second one, namely $x_1$. We still have the same number of rectangles. As a consequence, the last rectangle will use the last $x$-value $x_n$, whereas the left rectangles used the second to last. As an exercise, you can verify the following, by writing it down for some $n$, for example $n=4$. The total area for the right rectangles can be written as:

$$
A = \sum_{i=1}^{n}\operatorname{f}(x_i)\Delta x
$$

Looks basically the same, just shifted by one!

Only one last step is missing to arrive at what the integral will be!

As we have seen in the last section, increasing $n$ will make our two sums become closer to the correct solution. What we want is for both of them to agree on the result. For that, we have to make it so small, that it won't matter anymore, if we choose the left or right side as the height. The higher the number of rectangles $n$, the smaller the width $\Delta x$. The idea is now to not just use a finite number of rectangles, but infinite ones. This is probably a bit hard to think about. From a practical point of view, think about how the $\Delta x$ will become smaller and smaller for very large numbers of $n$. Now if you had a really good microscope to look at the graph, at some point you probably couldn't differentiate between different rectangles anymore, as they were too small. If your function $\operatorname{f}$ is not some incredibly weird one, it shouldn't change that much in value anymore inside of that super small rectangular region, at least your microscope wouldn't be able to see anything. At that point, you wouldn't care about left or right rectangle, you would measure the same value for both.

In math, we have a tool to describe this process of "make a value go towards infinity and see what happens". It is called the "limit". We write the limit of an expresion $\text{expr}$ as $n$ goes to infinity as $\lim_{n\rightarrow \infty} \text{expr}$. Basically we check, if the expression will result in a nice value when considering an infinite value. Writing this down for our area $A$ (right rectangles), we have:

$$
A = \lim_{n\rightarrow \infty}(\sum_{i=1}^{n}\operatorname{f}(x_i)\Delta x)
$$

If that expression does make sense, we introduce a nice new formulation for that whole thing:

$$
\int_a^b\operatorname{f}(x)dx = \lim_{n\rightarrow \infty}(\sum_{i=1}^{n}\operatorname{f}(x_i)\Delta x)
$$

The $\Delta x$ basically becomes $dx$, the symbol students are always reminded about not to forget. The $d$ part her signals the process of going from the discrete fixed number of rectangles to infinite ones, each with a width that isn't really a number anymore. We often call this thing a "differential" value. Still, the $dx$ holds this concept of the width that we used before, while the $\operatorname{f}(x)$ part holds the concept of height, so we can't forget about either of them when writing down an integral.

Similarly to the analogy with the microscope, you can think about subdividing that $\sum$ symbol in smaller and smaller regions. At the beginning, it's just four lines. But if you keep refining it with more and more lines and smooth them out a bit, your $\sum$ symbol might look something like $\int$. It is basically just a smooth S, just as in **S**um and **S**igma. You can think about the $\int$ as the symbol that incapsulates the whole processing of splitting up the area in incredibly small parts and adding them.

Now, with those last few paragraphs you might be asking: What? How would we even compute an integral with infinities flying around? And you wouldn't be wrong. You can actually find results with that definition, but it is tedious and probably won't be getting you anywhere for anything non-trivial. These kinds of constructions are very important for creating certain construct and proving properties though.

Which is why in the next section we will go over the "common" way to compute an integral.

# Computing integrals

This section will cover actually computing integrals. First we will just give a brief overview of numerical methods, no details, just some keywords. Then we will go to antiderivatives and how they work.

## Numerical computation

From the previous sections, we basically already have one method of computing an integral, albeit not exactly in most cases. If we take the right hand side of the integral and remove the limit, but exchange the equality with an approximate equality, we have out first method:
$$
\begin{align*}
\int_a^b\operatorname{f}(x)dx &= \lim_{n\rightarrow \infty}(\sum_{i=1}^{n}\operatorname{f}(x_i)\Delta x) \\
&\approx \sum_{i=1}^{n}\operatorname{f}(x_i)\Delta x
\end{align*}
$$

We have to choose a number of segments and then just calculate the summation terms, as we did in the beginning. This is annoying to do by hand, so in most cases we will use a computer, which can calculate far higher number of segments in very short amounts of time. It is also straightforward, just requiring basic arithmetic and a loop.

Still, we might want to keep the number of segments as low as possible, for example if the function is very costly to evaluate. Other schemes exist to find better approximations, such as the trapezoidal or Simpson's rule.

A very different approach is to use stochastics. As mentioned in the introduction, integrals play a huge part in probability theory. The definition of the expected value of a function actually allows us to compute an approximation of an integral with random numbers! 

## Antiderivatives

While not always possible, antiderivatives provide a very powerful way to compute integrals. The following will cover the basic idea on the second fundamental theorem of calculus, which allows us to directly write down integrals, that we know are derivatives of some other function. 

For now we will not cover other techniques, such as substitution.

### The fundamental theorem of calculus

The  fundamental theorem of calculus relates antiderivatives with integrals. As stated before, this is not a math textbook, so please consult one for the rigorous definitions of this all, such as the correct intervals which we technically need to be careful about.

First of, what is an antiderivative? Usually, it is just written with the upper case letter of the function to be considered. 

If the following statement is true, then $\operatorname{F}$ is an antiderivative for $\operatorname{f}$.

$$
    \operatorname{F}(t) = \int_a^t \operatorname{f}(x)dx
$$

And antiderivative means:

$$
    \operatorname{F}'(x) = \operatorname{f}(x)
$$

Now one cause of confusion might be the different variable name in the first statement, where we used $\operatorname{F}(t)$. This is basically just to distinguish different variables. The $x$ and $dx$ are basically placeholder names and stand for the different terms in our integral sum (just that the sum isn't discrete anymore). We could call them by any way we want. The $t$ in the first statement is the parameter of $\operatorname{F}$. It effects the upper bound of the integral. That basically just means: Only calculate the sum, until your $x$ value reaches $t$. In the second statement, we use the same variable $x$ since we actually mean the same position. In words: The rate of change at $x$ is just the value of $\operatorname{f}$ at $x$.

We want to see why that is true. But we can already think about why it intuitively makes sense:

The derivative measures the rate of change of a function. $\operatorname{F}(x)$ describes the area of the curve up until $x$. Now, what exactly causes $\operatorname{F}(x)$ to change? The function $\operatorname{f}$ of course. Similarly to when we walk. Let's say you have walked $1m$ up until time $t$. Now you walk with a speed of $2\frac{m}{s}$. If someone asked you what the rate of change was between time $t$ and $t+1s$. You would just check how far you have gotten in that time. After a second of movement, you have moved $2m$. And the rate of change was thus $2\frac{m}{s}$, your speed.

Continuing from our discussion from before, we can do a very non-rigorous "proof" to check how this works out. This should be roughly correct, but it is not in the details, please be aware of that.

So for simplicity, we will just use $t$ values located at one of our segment endpoints $x_i$ (inbetween is just a constant rectangle anyways). We might not have an exact expression for $\operatorname{F}$, but we have approximated the integral in the last section!

We will evaluate $\operatorname{F}$ at some segment point $x_j$, where $j$ is just some value between $1$ and $n$.

$$
\begin{align*}
    \operatorname{F}(x_j) &= \int_a^{x_j}\operatorname{f}(x)dx  \\
    &\approx \sum_{i=0}^{j-1}\operatorname{f}(x_i)\Delta x
\end{align*}
$$

So to get the integral up to the value $x_j$ we just don't use all the terms until $n$, but stop at $j-1$ instead for the left rectangles. The $-1$ is due to the same reason as before: We use the value left of our segment as height.

Now we try to differentiate $\operatorname{F}$, which might sound scarier than it is.

You may recall the secant approximation for the derivative, called the difference quotient:

$$
    \operatorname{F}'(x_j) \approx \frac{\operatorname{F}(x_j + \Delta x) - \operatorname{F}(x_j)}{\Delta x}
$$

We look a bit ahead of the point $x_j$, calculate the change from our current position $x_j$ and divide by the distance traveled between the two points,  to obtain the slope. As a further simplification, we use the same distance that we use in our rectangles $\Delta x$.

Now let's plug in our expression for $\operatorname{F}$!

$$
\begin{align*}
    \operatorname{F}'(x_j) &\approx \frac{\operatorname{F}(x_j + \Delta x) - \operatorname{F}(x_j)}{\Delta x} \\
    &\approx \frac{\sum_{i=0}^{j}\operatorname{f}(x_i)\Delta x - \sum_{i=1}^{j-1}\operatorname{f}(x_i)\Delta x}{\Delta x}
\end{align*}
$$

As we used $\Delta x$ as our distance, our approximation for $\operatorname{F}(x_j + \Delta x)$ can just walk one step farther than $j$, as you can see in the sum.

Now when you look at the two sums in the numerator, they are equal aside from the $+1$ on the top of the first $\sum$. So aside from the term for $j$, all other terms appear on the left and the right side. And since the right side is subtracted from the left, we are left with:

$$
\begin{align*}
    \operatorname{F}'(x_j) &\approx \frac{\operatorname{F}(x_j + \Delta x) - \operatorname{F}(x_j)}{\Delta x} \\
    &\approx \frac{\sum_{i=0}^{j}\operatorname{f}(x_i)\Delta x - \sum_{i=0}^{j-1}\operatorname{f}(x_i)\Delta x}{\Delta x} \\
    &= \frac{\operatorname{f}(x_{j})\Delta x}{\Delta x} \\
    &= \operatorname{f}(x_{j})
\end{align*}
$$

And with that we have arrived at what the fundamental theorem of calculus says: The derivative of the antiderivative is the function inside of the integral!

The important consequence is: If we know the derivative of a function, then that function is an antiderivative of the derivative! 

Derivatives are generally much easier than antiderivatives. With this property, we can find a lot of base antiderivatives with wich more complex ones can be constructed with other means. Neat!

One last thing to note here is another one of those parts, that you easily get points deducted for in tests!

Let's say you know an antiderivative $\operatorname{F}(x)$. Now we add some constant value $c$ to it: $\operatorname{F}(x) + c$. What happens, if we differentiate that?

$$
\begin{align*}
    (\operatorname{F}(x) + c)' &= \operatorname{F}'(x) + c' \\
    &= \operatorname{f}(x) + 0 \\
    &= \operatorname{f}(x)
\end{align*}
$$

As constants vanish under differentiation, there are actually infinitely many antiderivatives, each differing by some constant factor to all the others. Which is why you should write down the $+c$, when writing down antiderivatives.

Now how do we solve the problem, that our solution is not unique? Well, we actually know one correct value of $\operatorname{F}$, namely $\operatorname{F}(a) +c = \int_a^a \operatorname{f}(x)dx = 0$. This means, that the area from $a$ to $a$, a zero length interval is $0$. We can use that to nail down $c$:

$$ 
\begin{align*}
    \operatorname{F}(a) + c &= 0 \\
    c &= -\operatorname{F}(a)
\end{align*}
$$

And we can then compute the integral as 

$$
    \int_a^b \operatorname{f}(x)dx = \operatorname{F}(b) - \operatorname{F}(a)
$$


The second fundamental theorem of calculus, which states, that if $\operatorname{F}$ is an antiderivative of $\operatorname{f}$, then we have:

$$
    \int_a^b \operatorname{f}(x)dx = \operatorname{F}(b) - \operatorname{F}(a)
$$

results in the same expression, but starts from a general antiderivative.

We also use another shorthand notation: 

$$
\operatorname{F}(b) - \operatorname{F}(a) = [\operatorname{F}(x)]_a^b
$$

### Examples

Here are a few examples, that you will usually get taught alongside antiderivatives. Basically we calculate some derivatives and from that get some antiderivatives.

One of the first types of functions you will encounter are polynomials, which are luckily easy to differentiate. The derivative of $x^n$ is just $nx^{n-1}$. From this we try to go the other way around. Can we find a polynomial, that works just like this rule and results in $x^n$? Well, yes! $\frac{1}{n+1}x^{n+1}$. We can check the rule:

$$
\begin{align*}
(\frac{1}{n+1}x^{n+1})' &= (n+1)\frac{1}{n+1}x^n \\
&= x^n
\end{align*}
$$

This checks out and so we have:

$$
    \int_a^b x^n dx= [\frac{1}{n+1}x^{n+1}]_a^b
$$

Another common example is $e^x$, which is especially nice, since $(e^x)' = e^x$. So we also have:

$$
    \int_a^b e^xdx = [e^x]_a^b
$$

And as the last example, we have the sine and cosine functions, which derive into each other. We have:

$$
    \sin'(x) = \cos(x)\\
    \cos'(x) = -\sin(x)
$$

This results in the following two integrals:

$$
    \int_a^b \sin(x)dx = [-\cos(x)]_a^b\\
    \int_a^b \cos(x)dx = [\sin(x)]_a^b
$$