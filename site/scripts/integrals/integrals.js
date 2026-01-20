
import {
    makeContainer,
    makeTextField,
    makeUpdateSlider,
    makeCanvas,
    makeTextInput,
    applyProps
} from "../lib/commonHtmlHelper.js";

function example1(containerId) {

    const container = document.getElementById(containerId);

    let expr = Algebrite.run(`1`);

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
        title: {
            text: 'A constant function',
            font: {
                size: 12
            },
        },
        xaxis: {
            title: {
                text: 'x',
            },
        },
        yaxis: {

            title: {
                text: 'y',
            },
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },

    };
    Plotly.newPlot(container, data, layout);
}


function example2(containerId) {

    const container = document.getElementById(containerId);

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

        y: [parseFloat(Algebrite.run(`eval(${expr},x,${xcenter})`)) / 2],

        mode: 'text',

        name: '',

        text: ['1*2 = 2'],
        showlegend: false,

        textposition: 'center',

        type: 'scatter',
        textfont: {
            size: 20
        }
    };

    data.push(text_trace);

    let layout = {
        title: {
            text: 'A constant function',
            font: {
                size: 12
            },
        },
        xaxis: {
            title: {
                text: 'x',
            },

        },
        yaxis: {

            title: {
                text: 'y',
            },
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },

    };
    Plotly.newPlot(container, data, layout);
}

function example3(containerId) {

    const container = document.getElementById(containerId);
    let expr = Algebrite.run(`2x`);

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
        title: {
            text: 'A linear function',
            font: {
                size: 12
            },
        },
        xaxis: {
            title: {
                text: 'x',
            },

        },
        yaxis: {

            title: {
                text: 'y',
            },
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },

    };
    Plotly.newPlot(container, data, layout);
}

function example4(containerId) {

    const container = document.getElementById(containerId);
    let expr = Algebrite.run(`2x`);


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
        title: {
            text: 'A linear function',
            font: {
                size: 12
            },
        },
        xaxis: {
            title: {
                text: 'x',
            },

        },
        yaxis: {

            title: {
                text: 'y',
            },
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },

    };
    Plotly.newPlot(container, data, layout);
}

function example5(containerId) {

    const container = document.getElementById(containerId);

    let expr = Algebrite.run(`2x`);

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

    data.push({
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
    for (let j = 0; j < num_segments; j++) {
        const lval = parseFloat(Algebrite.run(`float((${j}/${num_segments}) * (${xdelta}) + (${xmin}))`));
        const rval = parseFloat(Algebrite.run(`float(((${j}+1)/${num_segments}) * (${xdelta}) + (${xmin}))`));
        const cval = (rval + lval) * 0.5;
        {
            const left_sum = Algebrite.run(`eval(${expr},x,${lval})`);
            const yis = [];
            const xis = [];
            for (let i = 0; i < 2; i++) {
                const xv = lval + i * (rval - lval);
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
                    showlegend: false,

                }
            );
            const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${left_sum})`));
            total_area_left += area;
            const text_trace = {
                x: [cval],
                y: [parseFloat(left_sum) / 2],
                mode: 'text',
                name: '',
                text: [`${area}`],
                showlegend: false,
                textposition: 'center',
                type: 'scatter',
                textfont: {
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
                const xv = lval + i * (rval - lval);
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
                    showlegend: false,

                }
            );

            const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${right_sum})`));
            total_area_right += area;
            const text_trace = {
                x: [cval],
                y: [parseFloat(right_sum) / 2],
                mode: 'text',
                name: '',
                text: [`${area}`],
                showlegend: false,
                textposition: 'center',
                type: 'scatter',
                textfont: {
                    size: 20
                },
                xaxis: "x2",
                yaxis: "y2",
            };
            data.push(text_trace);
        }

    }


    let layout = {
        title: {
            text: `Toal area left : ${total_area_left}, Toal area right : ${total_area_right}`,
            font: {
                size: 12
            },
        },
        xaxis: {
            title: {
                text: 'x',
            },
            domain: [0, 0.45]
        },
        yaxis: {

            title: {
                text: 'y',
            },
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },

        yaxis2: {
            anchor: "x2",
            title: {
                text: 'y',
            },
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },
        xaxis2: {
            title: {
                text: 'x',
            },
            domain: [0.55, 1]
        }

    };
    Plotly.newPlot(container, data, layout);
}

function example6(containerId) {

    const container = document.getElementById(containerId);


    let expr = Algebrite.run(`2x`);

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

    data.push({
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
    for (let j = 0; j < num_segments; j++) {
        const lval = parseFloat(Algebrite.run(`float((${j}/${num_segments}) * (${xdelta}) + (${xmin}))`));
        const rval = parseFloat(Algebrite.run(`float(((${j}+1)/${num_segments}) * (${xdelta}) + (${xmin}))`));
        const cval = (rval + lval) * 0.5;


        {
            const left_sum = Algebrite.run(`eval(${expr},x,${lval})`);
            const yis = [];
            const xis = [];
            for (let i = 0; i < 2; i++) {
                const xv = lval + i * (rval - lval);
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
                    showlegend: false,

                }
            );
            const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${left_sum})`));
            total_area_left += area;
            const text_trace = {
                x: [cval],
                y: [parseFloat(left_sum) / 2],
                mode: 'text',
                name: '',
                text: [`${area}`],
                showlegend: false,
                textposition: 'center',
                type: 'scatter',
                textfont: {
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
                const xv = lval + i * (rval - lval);
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
                    showlegend: false,

                }
            );

            const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${right_sum})`));
            total_area_right += area;
            const text_trace = {
                x: [cval],
                y: [parseFloat(right_sum) / 2],
                mode: 'text',
                name: '',
                text: [`${area}`],
                showlegend: false,
                textposition: 'center',
                type: 'scatter',
                textfont: {
                    size: 20
                },
                xaxis: "x2",
                yaxis: "y2",
            };
            data.push(text_trace);
        }

    }


    let layout = {
        title: {
            text: `Toal area left : ${total_area_left}, Toal area right : ${total_area_right}`,
            font: {
                size: 12
            },
        },
        xaxis: {
            title: {
                text: 'x',
            },
            domain: [0, 0.45]
        },
        yaxis: {

            title: {
                text: 'y',
            },
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },

        yaxis2: {
            anchor: "x2",
            title: {
                text: 'y',
            },
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },
        xaxis2: {
            title: {
                text: 'x',
            },
            domain: [0.55, 1]
        }

    };
    Plotly.newPlot(container, data, layout);
}
function example7(containerId) {

    const container = document.getElementById(containerId);
    let expr = Algebrite.run(`2x`);

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

    data.push({
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
    for (let j = 0; j < num_segments; j++) {
        const lval = parseFloat(Algebrite.run(`float((${j}/${num_segments}) * (${xdelta}) + (${xmin}))`));
        const rval = parseFloat(Algebrite.run(`float(((${j}+1)/${num_segments}) * (${xdelta}) + (${xmin}))`));
        const cval = (rval + lval) * 0.5;


        {
            const left_sum = Algebrite.run(`eval(${expr},x,${lval})`);
            const yis = [];
            const xis = [];
            for (let i = 0; i < 2; i++) {
                const xv = lval + i * (rval - lval);
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
                    showlegend: false,

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
                const xv = lval + i * (rval - lval);
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
                    showlegend: false,

                }
            );

            const area = parseFloat(Algebrite.run(`(${rval} - ${lval}) * (${right_sum})`));
            total_area_right += area;

        }

    }


    let layout = {
        title: `Toal area left : ${total_area_left}, Toal area right : ${total_area_right}<br>Number of rectangles: ${num_segments}`,
        title: {
            text: `Toal area left : ${total_area_left}, Toal area right : ${total_area_right}<br>Number of rectangles: ${num_segments}`,
            font: {
                size: 12
            },
        },
        xaxis: {
            title: {
                text: 'x',
            },
            domain: [0, 0.45]
        },
        yaxis: {

            title: {
                text: 'y',
            },
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },

        yaxis2: {
            anchor: "x2",
            title: {
                text: 'y',
            },
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },
        xaxis2: {
            title: {
                text: 'x',
            },
            domain: [0.55, 1]
        }

    };
    Plotly.newPlot(container, data, layout);
}

export {
    example1,
    example2,
    example3,
    example4,
    example5,
    example6,
    example7,
}