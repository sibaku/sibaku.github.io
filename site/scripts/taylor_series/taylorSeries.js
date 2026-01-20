
import {
    makeContainer,
    makeTextField,
    makeUpdateSlider,
    makeCanvas,
    makeTextInput,
    applyProps
} from "../lib/commonHtmlHelper.js";


function runExp1(containerId) {
    const container = document.getElementById(containerId);
    runFunction(container, `exp(x)`, 1);

}


function runExp2(containerId) {
    const container = document.getElementById(containerId);
    runFunction(container, `exp(x)`, 2);

}

function runExp3(containerId) {
    const container = document.getElementById(containerId);
    runFunction(container, `exp(x)`, 3);

}

function runFunction(container, funcString, terms, hideLower = false) {
    let expr = Algebrite.run(funcString);
    container.innerHTML = "";

    if (typeof expr === "string") {
        const idx = expr.toLowerCase().indexOf("stop: ");

        if (idx >= 0) {
            container.append(makeContainer(makeTextField(`Could not parse function string: ${expr.substring(idx + 6)}`)));
            return;

        }
    }

    const k = terms;

    let derivatives = [expr];
    for (let i = 1; i < k; i++) {
        derivatives.push(Algebrite.run(`d(${derivatives[i - 1]},x)`));
    }

    let taylor = [];

    for (let i = 0; i < k; i++) {
        const last_expr = i > 0 ? `+ (${taylor[i - 1]})` : "";
        taylor.push(Algebrite.run(`eval(${derivatives[i]},x,0)/(${i}!) * x^${i} ${last_expr}`))
    }


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
        if(isNaN(y)){
            continue;
        }
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
                visible: hideLower ? (j === (k - 1) ? true : "legendonly") : true,
            }
        );
    }

    let layout = {
        title: {
            text: `Taylor Approximation of ${funcString} with max degree ${k - 1}`,
            font: {
                size: 12
            },
        },
        xaxis: {
            title: 'x',

        },
        yaxis: {

            title: 'y',
            autorange: false,
            range: [ycenter - 2 * yrad, ycenter + 2 * yrad]
        },

    };
    Plotly.newPlot(container, data, layout);
}


function generalFunction(containerId) {
    const container = document.getElementById(containerId);

    const input = applyProps(makeTextInput("2sin(x) + cos(x^2)", "Type in your function f(x)"), {
        minLength: 0,
        maxLength: 100,
        size: 50
    });
    const inputLabel = makeTextField("f(x) = ");

    const funcContainer = makeContainer(inputLabel, input);

    const degreeInput = document.createElement("input");
    degreeInput.type = "number";
    degreeInput.value = 5;
    degreeInput.min = 0;

    const degreeInputLabel = makeTextField("Maximum degree");

    const optionsContainer = makeContainer(degreeInputLabel, degreeInput);

    const runButton = document.createElement("button");
    runButton.innerText = "Compute";

    const runContainer = makeContainer(runButton);

    const outputContainer = makeContainer();


    container.append(funcContainer, optionsContainer, runContainer, outputContainer);

    runButton.onclick = () => {
        const degree = parseInt(degreeInput.value);
        runFunction(outputContainer, input.value, degree + 1, true);
    };

}


export {
    runExp1,
    runExp2,
    runExp3,
    generalFunction,
}