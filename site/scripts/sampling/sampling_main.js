import {
    PolarHistogram
} from "./polarHistogram.js";


function uniform_circle() {

    const u_1 = Math.random();
    const u_2 = Math.random();

    const r = Math.sqrt(u_1);
    const alpha = u_2 * 2.0 * Math.PI;

    return [r, alpha];
}

function uniform_radial_circle() {

    const u_1 = Math.random();
    const u_2 = Math.random();

    const r = u_1;
    const alpha = u_2 * 2.0 * Math.PI;

    return [r, alpha];
}

function createUniformDisk(containerId) {
    create2DSamplerInterface(containerId, uniform_circle);
}

function createEqualAngularDisk(containerId) {
    create2DSamplerInterface(containerId, uniform_radial_circle);
}


function col(r, g, b, a = 1) {
    return {
        r,
        g,
        b,
        a
    };
}

function rgb255(r, g, b, a = 1) {
    return {
        r: r / 255,
        g: g / 255,
        b: b / 255,
        a
    };
}

const genId = (() => {
    let id = 0;
    return () => {
        let i = id;
        id++;
        return i;
    }
})();
function createCheckbox(labelText, checked) {
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    // checkbox.name = label;
    checkbox.value = "value";
    let id = genId();
    checkbox.id = id;
    checkbox.checked = checked;

    const label = document.createElement('label')
    label.htmlFor = id;
    label.appendChild(document.createTextNode(labelText));

    return [checkbox, label];

}

function createDiv(children = null) {
    const div = document.createElement("div");
    if (children !== null) {
        for (let c of children) {
            div.appendChild(c);
        }
    }
    return div;
}

function createElement(tag, children = null) {
    const div = document.createElement(tag);
    if (children !== null) {
        for (let c of children) {
            div.appendChild(c);
        }
    }
    return div;
}
function create2DSamplerInterface(containerId, samplingFunction) {
    const container = document.querySelector(`#${containerId}`);
    console.log("Setup:", container);

    const innerContainer = document.createElement("div");
    innerContainer.classList.add("sample");

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;

    canvas.classList.add("sampleCanvas");

    innerContainer.appendChild(canvas);
    container.appendChild(innerContainer);

    const ctx = canvas.getContext("2d");

    ctx.transform(1, 0, 0, -1, 0, canvas.height)


    const colors = [
        col(0.001462, 0.000466, 0.013866, 1.0),
        col(0.33992925000000007, 0.06175875, 0.42919975, 1.0),
        col(0.732796, 0.21433249999999998, 0.33205300000000004, 1.0),
        col(0.9774245, 0.5526217499999999, 0.03802025, 1.0),
        col(0.988362, 0.998364, 0.644924, 1.0)
    ];

    const polar = new PolarHistogram({
        innerBucketRadius: 0.00,
        resolutionAngle: 30,
        resolutionRadius: 10,
    });

    const state = {
        polar,
        canvas,
        ctx,
        colors,

    };
    // state.polar = polar;


    const button = document.createElement("button");
    button.innerText = "Add samples";


    const numField = document.createElement("input");
    numField.type = "number";
    numField.value = 100000;

    const totalEls = createElement("div", [document.createTextNode("Total samples: 0")]);
    const updateTotal = () => {
        totalEls.innerHTML = '';
        totalEls.append(document.createTextNode(`Total samples: ${state.polar.total}`));
    };

    const [checkAnimate, labelAnimate] = createCheckbox("Animate", true);


    const buttonReset = document.createElement("button");
    buttonReset.innerText = "Reset";
    buttonReset.onclick = () => {
        state.polar = new PolarHistogram({
            innerBucketRadius: 0.00,
            resolutionAngle: 30,
            resolutionRadius: 10,
        });
        addAndDraw(state, 0, null);
        updateTotal();

    };
    addAndDraw(state, 100000, samplingFunction, false);
    updateTotal();

    button.onclick = () => {
        let val = parseInt(numField.value);
        if (isNaN(val)) {
            numField.value = 100000;
            return;
        }
        val = Math.max(1, val);
        numField.value = val;
        button.disabled = true;

        addAndDraw(state, val, samplingFunction, checkAnimate.checked, {
            finished: () => {
                button.disabled = false;
                updateTotal();
            },
            update: updateTotal,
        });
    };

    innerContainer.append(totalEls);

    const controls = document.createElement("div");
    controls.classList.add("controls");

    controls.append(numField);
    controls.appendChild(button);
    controls.appendChild(createElement("span", [checkAnimate, labelAnimate]));
    controls.appendChild(createElement("span", [buttonReset]));



    innerContainer.appendChild(controls);

}


function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

function addAndDraw(state, toAdd, sampler, animate, { finished = null, update = null } = {}) {
    const {
        polar,
        canvas,
        ctx,
        colors
    } = state;
    const els = polar.total;


    // console.log(toAdd);
    const pixelSize = Math.floor(Math.min(canvas.width, canvas.height) / 2.1);
    const pixelCenter = {
        x: Math.floor(canvas.width / 2),
        y: Math.floor(canvas.height / 2)
    };


    if (!animate) {
        for (let i = 0; i < toAdd; i++) {
            const [r, alpha] = sampler();
            polar.insertSample(alpha, r);

        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        polar.draw(ctx, {
            pixelSize,
            pixelCenter,
            gridLineSize: 0.5,
            colorMap: colors,
            gridLinesAngle: true,
            gridLinesRadius: true,
        });
        ctx.restore();

        if (finished !== null) {
            finished();
        }
    } else {
        let current = 0;

        const updateStep = () => {


            const nextStep = Math.round(Math.pow(Math.max(1, getBaseLog(10, current)), 2.5)) + 5 * Math.round(Math.pow(Math.max(1, getBaseLog(100, current)), 6.5));

            const upper = Math.min(toAdd, current + nextStep);
            const points = [];

            for (let i = current; i < upper; i++) {
                const [r, alpha] = sampler();
                polar.insertSample(alpha, r);
                const x = Math.cos(alpha) * r * pixelSize + pixelCenter.x;
                const y = Math.sin(alpha) * r * pixelSize + pixelCenter.y;
                points.push({
                    x,
                    y
                });

            }
            current = upper;

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            polar.draw(ctx, {
                pixelSize,
                pixelCenter,
                gridLineSize: 0.5,
                colorMap: colors,
                gridLinesAngle: true,
                gridLinesRadius: true,
            });
            ctx.restore();
            if (current >= toAdd) {
                if (finished !== null) {
                    finished();
                }
                return;
            }
            ctx.save();
            ctx.fillStyle = polar.colorToFillStyle(col(2.8748524982802337e-6, 0.7421939373016357, 1.0));
            // ctx.fillStyle = polar.colorToFillStyle(rgb255(67.8, 90.2, 73.3));
            // ctx.fillStyle = "rgb(8,255,10)";

            for (let i = 0; i < points.length; i++) {
                const {
                    x,
                    y
                } = points[i];
                ctx.beginPath();

                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fill();
                // ctx.stroke();

            }
            ctx.restore();

            if (update !== null) {
                update();
            }

            setTimeout(updateStep, 50);

        };
        updateStep();
    }






    // if (els < 500000) {
    //     // ctx.fillStyle = polar.colorToFillStyle(col(67.8 / 255.0, 84.7 / 255.0, 90.2 / 255));
    //     ctx.fillStyle = polar.colorToFillStyle(col(2.8748524982802337e-6, 0.7421939373016357, 1.0));
    //     // ctx.fillStyle = polar.colorToFillStyle(rgb255(67.8, 90.2, 73.3));
    //     // ctx.fillStyle = "rgb(8,255,10)";

    //     for (let i = 0; i < points.length; i++) {
    //         const {
    //             x,
    //             y
    //         } = points[i];
    //         ctx.beginPath();

    //         ctx.arc(x, y, 2, 0, 2 * Math.PI);
    //         ctx.fill();
    //         // ctx.stroke();

    //     }
    //     // window.requestAnimationFrame(addAndDraw);
    //     setTimeout(addAndDraw, 50);
    // }
}





export { createUniformDisk, createEqualAngularDisk }

window['sampling_main'] = {
    createUniformDisk
};

