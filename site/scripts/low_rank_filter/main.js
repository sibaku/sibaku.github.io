import * as jsm from "../lib/jsmatrix.js"

function toLatex(m, { maxDecimals = 3 } = {}) {
    // convert to string
    const mstr = jsm.map(m, x => x.toString(), jsm.MatAny.uninitialized(m.rows(), m.cols()));

    // find maximum length per col
    const dots = "...";
    const trim_decimals = s => {

        const pointIdx = s.indexOf('.');
        if (pointIdx < 0) {
            return s;
        }

        const numDecimals = s.length - pointIdx;

        if (numDecimals < maxDecimals) {
            return s;
        }


        s = s.substring(0, pointIdx + 1 + maxDecimals) + dots;

        return s;
    };
    jsm.map(mstr, x => trim_decimals(x), mstr);
    const rows = jsm.rowreduce(mstr, x => jsm.toArray(x).join(" & "), jsm.MatAny.uninitialized(m.rows(), 1));
    return "\\begin{pmatrix}" + jsm.toArray(rows).join("\\\\") + "\\end{pmatrix}";
}


function matToHeatmapArray(q) {
    return jsm.toArray(jsm.rowreduce(q, (row, i) => jsm.toArray(row), jsm.MatAny.uninitialized(q.rows(), 1)));

}


function reconstruct(svd, maxRank) {
    const m = svd.U.rows();
    // since V will be 
    const n = svd.Vt.cols();
    const M = jsm.MatF32.zeros(m, n);

    for (let i = 0; i < maxRank; i++) {
        const si = svd.S.at(i);
        let ui = jsm.col(svd.U, i);
        ui = jsm.scale(ui, si);
        const vi = jsm.transpose(jsm.col(svd.V, i));

        jsm.add(M, jsm.mult(ui, vi), M);
    }

    return M;
}

function generateRandom(n, { min = 0, max = 1 } = {}) {
    const r = jsm.MatF32.rand(n, n);

    const d = max - min;

    return jsm.map(r, (v) => v * d + min, r);

}

function generateGaussian(n, sigma = 1.0) {
    const M = jsm.VecF32.uninitialized(n);


    jsm.map(M, (value, row, col) => {

        const t = ((row + 0.5) / n - 0.5) * 3.0;
        const v = 1.0 / (sigma * Math.sqrt(2.0 * Math.PI)) * Math.exp(-0.5 * t * t / (sigma * sigma));

        return v;
    }, M);

    return jsm.mult(M, jsm.transpose(M));
}

function generateDoG(n, sigma0 = 0.5, sigma1 = 1.0) {
    const M = jsm.MatF32.uninitialized(n, n);


    jsm.map(M, (value, row, col) => {

        const x = ((row + 0.5) / n - 0.5) * 3.0;
        const y = ((col + 0.5) / n - 0.5) * 3.0;
        const v1 = 1.0 / (sigma0 * sigma0 * 2.0 * Math.PI) * Math.exp(-0.5 * (x * x + y * y) / (sigma0 * sigma0));
        const v2 = 1.0 / (sigma1 * sigma1 * 2.0 * Math.PI) * Math.exp(-0.5 * (x * x + y * y) / (sigma1 * sigma1));

        return v1 - v2;
    }, M);

    return M;
}


function generateRectangle(rectsize, border) {
    const n = rectsize + 2 * border;
    const M = jsm.MatF32.zeros(n, n);

    const bl = jsm.block(M, border, border, rectsize, rectsize);
    jsm.fill(bl, 1.0);
    return M;
}

function generateCircle(n, rmax) {
    const M = jsm.MatF32.uninitialized(n, n);

    const rmax2 = rmax * rmax;

    jsm.map(M, (value, row, col) => {
        const x = ((row + 0.5) / n - 0.5) * 2.0;
        const y = ((col + 0.5) / n - 0.5) * 2.0;

        const r2 = x * x + y * y;

        return r2 < rmax2 ? 1.0 : 0.0;

    }, M);
    return M;
}

function generateStar(n, innerSize, outerSize, num) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = n;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, n, n);

    const outer = 0.5 * outerSize * n;
    const inner = 0.5 * innerSize * n;

    ctx.fillStyle = "rgb(255,255,255)";
    ctx.save();
    ctx.beginPath();
    ctx.translate(n / 2, n / 2);
    ctx.moveTo(0, 0 - outer);
    for (var i = 0; i < num; i++) {
        ctx.rotate(Math.PI / num);
        ctx.lineTo(0, 0 - inner);
        ctx.rotate(Math.PI / num);
        ctx.lineTo(0, 0 - outer);
    }


    ctx.closePath();
    ctx.fill();

    ctx.restore();

    const data = ctx.getImageData(0, 0, n, n).data;

    const M = jsm.MatF32.uninitialized(n, n);
    jsm.map(M, (value, row, col) => {
        const idx = (row + n * col) * 4;
        return data[idx];
    }, M);
    return M;
}

function generateRidgeDetect() {
    const data = [
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1
    ];

    return jsm.MatF32.from(data, 3, 3);
}


function generatePlotState(q) {
    const hm = jsm.toArray(jsm.rowreduce(q, (row, i) => jsm.toArray(row), jsm.MatAny.uninitialized(q.rows(), 1)));

    const trace1 = {
        z: hm,
        type: 'heatmap',
        name: "Input",
        colorscale: 'Viridis',
        colorbar: { x: 0.45, y: 0.77, len: 0.45 },
        domain: { row: 0, column: 0 }
    };

    const svd = jsm.computeSVD(q);

    const singularValues = jsm.toArray(svd.S);
    var trace2 = {
        y: singularValues,
        mode: 'lines',
        name: "Singular values",
        xaxis: 'x2',
        yaxis: 'y2',
        domain: { row: 0, column: 1 }
    };




    const state = {};
    state.q = q;
    state.svd = svd;
    state.qHeatmap = trace1;
    state.singularValuePlot = trace2;
    state.currentMaxRank = 1;
    state.approximations = [];
    state.approximationsPlots = [];
    state.difPlots = [];

    {
        const m = svd.U.rows();
        // since V will be 
        const n = svd.Vt.cols();
        let M = jsm.MatF32.zeros(m, n);

        for (let i = 0; i < svd.S.rows(); i++) {
            const si = svd.S.at(i);
            let ui = jsm.col(svd.U, i);
            ui = jsm.scale(ui, si);
            const vi = jsm.transpose(jsm.col(svd.V, i));

            M = jsm.add(M, jsm.mult(ui, vi));
            state.approximations.push(M);

            const hmApprox = jsm.toArray(jsm.rowreduce(M, (row, i) => jsm.toArray(row), jsm.MatAny.uninitialized(M.rows(), 1)));

            const traceApprox = {
                z: hmApprox,
                type: 'heatmap',
                name: "Reconstruction",
                xaxis: 'x3',
                yaxis: 'y3',
                colorscale: 'Viridis',
                colorbar: { x: 0.45, y: 0.23, len: 0.45 },
                domain: { row: 1, column: 0 }
            };

            state.approximationsPlots.push(traceApprox);
            const dif = jsm.abs(jsm.sub(M, q));

            const hmDif = jsm.toArray(jsm.rowreduce(dif, (row, i) => jsm.toArray(row), jsm.MatAny.uninitialized(dif.rows(), 1)));
            const traceDif = {
                z: hmDif,
                type: 'heatmap',
                name: "Error",
                xaxis: 'x4',
                yaxis: 'y4',
                colorscale: 'oxy',
                colorbar: { x: 1.0, y: 0.23, len: 0.45 },
                domain: { row: 1, column: 1 }

            };

            state.difPlots.push(traceDif);

        }



    }



    return state;
}

function updateUI({ container, containerData, slider, input, sliderDescription }, state) {
    // Low rank approx

    const data = [state.qHeatmap, state.singularValuePlot, state.approximationsPlots[state.currentMaxRank - 1], state.difPlots[state.currentMaxRank - 1]];

    const layout = {

        grid: { rows: 2, columns: 2, pattern: 'independent' },
        aspectratio: {
            x: 1,
            y: 1,
            z: 1
        },
        aspectmode: 'data',
        yaxis: {
            scaleanchor: "x"
        },
        yaxis3: {
            scaleanchor: "x3"
        },
        yaxis4: {
            scaleanchor: "x4"
        },
        subplot_titles: ["a", "b", "c", "d"],
        annotations: [
            {
                text: "Input",
                showarrow: false,
                x: 0,
                xref: "x domain",
                y: 1.2,
                yref: "y domain"
            },
            {
                text: "Singular values",
                showarrow: false,
                x: 0,
                xref: "x2 domain",
                y: 1.1,
                yref: "y2 domain"
            },
            {
                text: "Reconstruction",
                showarrow: false,
                x: 0,
                xref: "x3 domain",
                y: 1.2,
                yref: "y3 domain"
            },
            {
                text: "Error",
                showarrow: false,
                x: 0,
                xref: "x4 domain",
                y: 1.2,
                yref: "y4 domain"
            },
        ]

    };


    Plotly.newPlot(containerData, {
        data, layout,
    });

    slider.max = `${state.svd.S.rows()}`;
    sliderDescription.textContent = `Set maximum reconstruction rank. Current rank: ${state.currentMaxRank}`;
}


const createContainer = (els, type = "div") => {
    const e = [...els];

    const c = document.createElement(type);

    for (let i = 0; i < e.length; i++) {
        c.appendChild(e[i]);
    }

    return c;
}


function makeUserInterfaceApprox(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const containerInput = document.createElement("div");

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "1";
    slider.max = "1";
    slider.value = "1";

    const uiComponent = {};
    uiComponent.container = container;
    uiComponent.containerData = containerInput;
    uiComponent.slider = slider;

    const sliderDescription = document.createElement("span");
    sliderDescription.style.cssText = "font-weight: bold;";
    // sliderDescription.tagName = "slider_description";
    const containerInter = createContainer(
        [
            sliderDescription,
            slider
        ]
    );
    uiComponent.sliderDescription = sliderDescription;
    uiComponent.input = containerInter;
    container.appendChild(containerInput);
    container.appendChild(containerInter);


    let state = generatePlotState(generateRandom(11, { min: -4, max: 4 }));

    let context = {};
    context.state = state;
    context.uiComponent = uiComponent;

    updateUI(uiComponent, state);
    slider.oninput = function () {
        context.state.currentMaxRank = parseInt(slider.value);

        updateUI(context.uiComponent, context.state);

    };

    const selectInput = document.createElement("select");

    const options = [];

    options.push({
        text: "Random",
        f: () => {
            return generateRandom(11, { min: -4, max: 4 });
        }
    });
    options.push({
        text: "Gaussian",
        f: () => {
            return generateGaussian(15);
        }
    });
    options.push({
        text: "DoG",
        f: () => {
            return generateDoG(15, 0.4, 0.6);
        }
    });
    options.push({
        text: "Rectangle",
        f: () => {
            return generateRectangle(15, 5);
        }
    });

    options.push({
        text: "Circle",
        f: () => {
            return generateCircle(41, 0.75);
        }
    });
    options.push({
        text: "Star",
        f: () => {
            return generateStar(40, 0.25, 0.9, 4);
        }
    });
    options.push({
        text: "Ridge",
        f: () => {
            return generateRidgeDetect();
        }
    });

    for (let i = 0; i < options.length; i++) {
        const option = document.createElement("option");
        option.text = options[i].text;
        option.value = i;
        selectInput.appendChild(option);
    }

    selectInput.onchange = (e) => {
        const opt = e.target.value;
        slider.value = "1";

        const idx = parseInt(opt);

        const M = options[idx].f();
        context.state = generatePlotState(M);
        updateUI(context.uiComponent, context.state);

    };


    containerInter.appendChild(
        createContainer([
            document.createTextNode("Input: "),
            selectInput
        ])
    );

}


function imgToMat(imgData) {
    const m = imgData.width;
    const n = imgData.height;

    const data = imgData.data;

    const result = {
        r: jsm.MatF32.uninitialized(m, n),
        g: jsm.MatF32.uninitialized(m, n),
        b: jsm.MatF32.uninitialized(m, n),
    };

    for (let j = 0; j < n; j++) {
        for (let i = 0; i < m; i++) {
            const idx = (i + j * m) * 4;

            result.r.set(data[idx + 0], i, j);
            result.g.set(data[idx + 1], i, j);
            result.b.set(data[idx + 2], i, j);
        }
    }

    return result;
}

function matToImg({ r, g, b }) {
    const m = r.rows();
    const n = r.cols();

    const num = m * n * 4;

    const data = new Uint8ClampedArray(num);
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < m; i++) {
            const idx = (i + j * m) * 4;
            data[idx + 0] = r.at(i, j);
            data[idx + 1] = g.at(i, j);
            data[idx + 2] = b.at(i, j);
            data[idx + 3] = 255;
        }
    }

    const imgData = new ImageData(data, m, n);
    return imgData;
}

function applyFilter(img, filter, out = jsm.similar(img)) {
    const m = img.rows();
    const n = img.cols();

    const fm = filter.rows();
    const fn = filter.cols();

    if (fm % 2 === 0 || fn % 2 === 0) {
        console.log("Filter size must be odd");
        return img;
    }

    // starting values for filter
    const fm0 = -Math.floor(fm / 2);
    const fn0 = -Math.floor(fm / 2);

    const clamp = (a, min, max) => Math.min(max, Math.max(min, a));

    return jsm.map(img, (_, row, col) => {
        let sum = 0.0;
        for (let j = 0; j < fn; j++) {
            for (let i = 0; i < fm; i++) {
                const idxRow = clamp(row + fm0 + i, 0, m - 1);
                const idxCol = clamp(col + fn0 + j, 0, n - 1);

                const v = img.at(idxRow, idxCol);
                const fv = filter.at(i, j);
                sum += fv * v;
            }
        }
        return sum;
    }, out);

}

class Timer {
    start() {
        this.begin = new Date();
    }

    stop() {
        const end = new Date();

        let delta = end - this.begin;
        delta /= 1000;

        return delta;
    }

    static new() {
        return new Timer();
    }
}

function generateFilterState(img, filter) {

    const state = {};

    state.img = img;
    state.filter = filter;

    state.currentMaxRank = 1;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const mats = imgToMat(ctx.getImageData(0, 0, canvas.width, canvas.height));
    state.mats = mats;

    const timer = Timer.new();

    timer.start();
    const matsFiltered = {};
    matsFiltered.r = applyFilter(mats.r, filter);
    matsFiltered.g = applyFilter(mats.g, filter);
    matsFiltered.b = applyFilter(mats.b, filter);

    state.matsFiltered = matsFiltered;

    console.log(`Time 2D: ${timer.stop()}`);
    const result = {
        r: jsm.MatF32.zeros(mats.r.rows(), mats.r.cols()),
        g: jsm.MatF32.zeros(mats.g.rows(), mats.g.cols()),
        b: jsm.MatF32.zeros(mats.b.rows(), mats.b.cols())
    }
    const matsStages = [];

    timer.start();

    const filterSvd = jsm.computeSVD(filter);

    state.filterSvd = filterSvd;


    let maxIt = 0;

    for (let i = 0; i < filterSvd.S.rows(); i++) {
        if (filterSvd.S.at(i) < 1E-7) {
            break;
        }

        maxIt++;
    }

    let r0 = jsm.similar(mats.r);
    let g0 = jsm.similar(mats.g);
    let b0 = jsm.similar(mats.b);
    let r1 = jsm.similar(mats.r);
    let g1 = jsm.similar(mats.g);
    let b1 = jsm.similar(mats.b);
    for (let i = 0; i < maxIt; i++) {
        // x pass
        let filter1 = jsm.copy(jsm.transpose(jsm.col(filterSvd.V, i)));
        jsm.scale(filter1, Math.sqrt(filterSvd.S.at(i)), filter1);
        applyFilter(mats.r, filter1, r0);
        applyFilter(mats.g, filter1, g0);
        applyFilter(mats.b, filter1, b0);
        // y pass
        filter1 = jsm.copy(jsm.col(filterSvd.U, i));
        jsm.scale(filter1, Math.sqrt(filterSvd.S.at(i)), filter1);
        applyFilter(r0, filter1, r1);
        applyFilter(g0, filter1, g1);
        applyFilter(b0, filter1, b1);

        result.r = jsm.add(result.r, r1);
        result.g = jsm.add(result.g, g1);
        result.b = jsm.add(result.b, b1);

        matsStages.push({ r: result.r, g: result.g, b: result.b });

    }

    state.matsStages = matsStages;

    console.log(`Time 1D: ${timer.stop()}`);

    return state;
}

function makeUserInterfaceFilter(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    let state = {};




    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const canvasFiltered = document.createElement("canvas");
    const ctxFiltered = canvasFiltered.getContext("2d");

    const canvasApproxFiltered = document.createElement("canvas");
    const ctxApproxFiltered = canvasApproxFiltered.getContext("2d");

    state.canvas = canvas;
    state.canvasFiltered = canvasFiltered;
    state.canvasApproxFiltered = canvasApproxFiltered;


    const imgContainer = createContainer([]);
    imgContainer.classList.add("filterLowRankContainer");
    imgContainer.classList
    {
        const header = document.createElement("div");
        header.classList.add("filterLowRankHeader");
        // header.style.cssText = "font-weight: bold;";
        header.innerHTML = "Input";
        const c = createContainer([header, canvas], "span");
        // c.style.cssText = "float:left;"
        c.classList.add("filterLowRankEntry");

        imgContainer.appendChild(c);
    }
    {
        const header = document.createElement("div");
        // header.style.cssText = "font-weight: bold;";
        header.classList.add("filterLowRankHeader");


        header.innerHTML = "2D Filter";
        const c = createContainer([header, canvasFiltered], "span");
        // c.style.cssText = "float:left;"
        c.classList.add("filterLowRankEntry");

        imgContainer.appendChild(c);
    }
    {
        const header = document.createElement("div");
        // header.style.cssText = "font-weight: bold;";
        header.classList.add("filterLowRankHeader");


        header.innerHTML = "Approximation";
        const c = createContainer([header, canvasApproxFiltered], "span");
        c.classList.add("filterLowRankEntry");


        imgContainer.appendChild(c);
    }

    container.appendChild(imgContainer);
    const baseImg = document.createElement("img");


    const containerInput = document.createElement("div");

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "1";
    slider.max = "1";
    slider.value = "1";



    const sliderDescription = document.createElement("span");
    sliderDescription.style.cssText = "font-weight: bold;";
    // sliderDescription.tagName = "slider_description";
    const containerInter = createContainer(
        [
            sliderDescription,
            slider
        ]
    );

    slider.oninput = function () {
        state.currentMaxRank = parseInt(slider.value);

        ctxApproxFiltered.putImageData(matToImg(state.matsStages[Math.min(state.matsStages.length, state.currentMaxRank) - 1]), 0, 0);
        sliderDescription.textContent = `Set maximum reconstruction rank. Current rank: ${state.currentMaxRank}`;
    };

    container.appendChild(containerInput);
    container.appendChild(containerInter);





    const selectInput = document.createElement("select");

    const options = [];

    options.push({
        text: "Random",
        f: () => {
            const g = jsm.MatF32.rand(5, 5);
            return jsm.scale(g, 1.0 / jsm.sum(jsm.abs(g)), g);


        }
    });
    options.push({
        text: "Gaussian",
        f: () => {
            const g = generateGaussian(11);
            return jsm.scale(g, 1.0 / jsm.sum(g), g);
        }
    });
    options.push({
        text: "DoG",
        f: () => {
            return generateDoG(11, 0.4, 0.6);
        }
    });
    options.push({
        text: "Rectangle",
        f: () => {
            const g = generateRectangle(11, 5);
            return jsm.scale(g, 1.0 / jsm.sum(g), g);
        }
    });

    options.push({
        text: "Circle",
        f: () => {
            const g = generateCircle(11, 0.75);
            return jsm.scale(g, 1.0 / jsm.sum(g), g);
        }
    });
    options.push({
        text: "Star",
        f: () => {
            const g = generateStar(11, 0.25, 0.9, 4);
            return jsm.scale(g, 1.0 / jsm.sum(g), g);

        }
    });

    options.push({
        text: "Star large (Warning: Slow)",
        f: () => {
            const g = generateStar(31, 0.45, 0.9, 4);
            return jsm.scale(g, 1.0 / jsm.sum(g), g);

        }
    });
    options.push({
        text: "Ridge",
        f: () => {
            return generateRidgeDetect();
        }
    });

    for (let i = 0; i < options.length; i++) {
        const option = document.createElement("option");
        option.text = options[i].text;
        option.value = i;
        selectInput.appendChild(option);
    }

    selectInput.onchange = (e) => {
        transparentDiv.style.cssText = "position:fixed;left:0;top:0;right:0;bottom:0;background: rgba(255,255,255,.5);z-index : 10;width:100%;height: 100%;"

        const opt = e.target.value;
        slider.value = "1";

        const idx = parseInt(opt);

        const filter = options[idx].f();

        setTimeout(() => {
            state = generateFilterState(baseImg, filter);

            sliderDescription.textContent = `Set maximum reconstruction rank. Current rank: ${state.currentMaxRank}`;
            slider.max = `${state.filterSvd.S.rows()}`;
            slider.value = `${state.currentMaxRank}`;

            ctx.putImageData(matToImg(state.mats), 0, 0);
            ctxFiltered.putImageData(matToImg(state.matsFiltered), 0, 0);

            ctxApproxFiltered.putImageData(matToImg(state.matsStages[Math.min(state.matsStages.length, state.currentMaxRank) - 1]), 0, 0);
            transparentDiv.style.cssText = "";

        }, 16);



    };


    containerInter.appendChild(
        createContainer([
            document.createTextNode("Filter: "),
            selectInput
        ])
    );


    const selectImage = document.createElement("select");

    const optionsImg = [];
    optionsImg.push({
        text: "Cat",
        src: App.resourcePath + "/cat_small.jpg"
    });
    optionsImg.push({
        text: "Pumpkin",
        src: App.resourcePath + "/pumpkins.jpg"

    });


    for (let i = 0; i < optionsImg.length; i++) {
        const option = document.createElement("option");
        option.text = optionsImg[i].text;
        option.value = i;
        selectImage.appendChild(option);
    }

    selectImage.onchange = (e) => {
        const opt = e.target.value;
        slider.value = "1";

        const idx = parseInt(opt);

        const filter = state.filter;


        baseImg.onload = () => {
            canvas.width = baseImg.width;
            canvas.height = baseImg.height;

            canvasFiltered.width = baseImg.width;
            canvasFiltered.height = baseImg.height;

            canvasApproxFiltered.width = baseImg.width;
            canvasApproxFiltered.height = baseImg.height;

            state = generateFilterState(baseImg, filter);

            sliderDescription.textContent = `Set maximum reconstruction rank. Current rank: ${state.currentMaxRank}`;
            slider.max = `${state.filterSvd.S.rows()}`;
            slider.value = `${state.currentMaxRank}`;

            ctx.putImageData(matToImg(state.mats), 0, 0);
            ctxFiltered.putImageData(matToImg(state.matsFiltered), 0, 0);

            ctxApproxFiltered.putImageData(matToImg(state.matsStages[Math.min(state.matsStages.length, state.currentMaxRank) - 1]), 0, 0);
            transparentDiv.style.cssText = "";
        };

        baseImg.src = optionsImg[idx].src;
        transparentDiv.style.cssText = "position:fixed;left:0;top:0;right:0;bottom:0;background: rgba(255,255,255,.5);z-index : 10;width:100%;height: 100%;"


    };
    containerInter.appendChild(
        createContainer([
            document.createTextNode("Input Image: "),
            selectImage
        ])
    );

    const transparentDiv = document.createElement("div");
    container.appendChild(transparentDiv);


    baseImg.onload = () => {
        canvas.width = baseImg.width;
        canvas.height = baseImg.height;

        canvasFiltered.width = baseImg.width;
        canvasFiltered.height = baseImg.height;

        canvasApproxFiltered.width = baseImg.width;
        canvasApproxFiltered.height = baseImg.height;

        const filter = options[0].f();

        state = generateFilterState(baseImg, filter);

        sliderDescription.textContent = `Set maximum reconstruction rank. Current rank: ${state.currentMaxRank}`;
        slider.max = `${state.filterSvd.S.rows()}`;
        slider.value = `${state.currentMaxRank}`;

        ctx.putImageData(matToImg(state.mats), 0, 0);
        ctxFiltered.putImageData(matToImg(state.matsFiltered), 0, 0);

        ctxApproxFiltered.putImageData(matToImg(state.matsStages[Math.min(state.matsStages.length, state.currentMaxRank) - 1]), 0, 0);
        transparentDiv.style.cssText = "";

        //
    };

    baseImg.src = optionsImg[0].src;
    transparentDiv.style.cssText = "position:fixed; left:0;top:0;right:0;bottom:0;background: rgba(255,255,255,.5);z-index : 10;width:100%;height: 100%;"

    console.log(baseImg.src);

}



function gaussianSVDExploreUpdate(container, state) {
    const M = generateGaussian(15, state.sigma);
    const svd = jsm.computeSVD(M);


    const u = jsm.scale(jsm.col(svd.U, 0), Math.sqrt(svd.S.at(0)));
    const v = jsm.scale(jsm.transpose(jsm.col(svd.V, 0)), Math.sqrt(svd.S.at(0)));

    const maxIdxU = jsm.argmax(jsm.abs(u));
    const maxIdxV = jsm.argmax(jsm.abs(v));



    if (u.at(maxIdxU.row, maxIdxU.col) < 0 && v.at(maxIdxV.row, maxIdxV.col) < 0) {
        // flip filter values if both are negative
        jsm.scale(u, -1, u);
        jsm.scale(v, -1, v);
    }

    const filter = state.showApproximation ? jsm.mult(u, v) : M;


    const combined = jsm.similar(M, M.rows() + 1, M.cols() + 1);

    jsm.insert(jsm.block(combined, 1, 1, M.rows(), M.cols()), filter);
    jsm.insert(jsm.block(combined, 1, 0, u.rows(), 1), u);
    jsm.insert(jsm.block(combined, 0, 1, 1, v.cols()), v);

    const traceM = {
        z: matToHeatmapArray(combined),
        type: 'heatmap',
        name: "Input",
        colorscale: 'Viridis',
        colorbar: null,
        domain: { row: 0, column: 0 }
    };



    const data = [traceM];

    const layout = {

        grid: { rows: 1, columns: 1, pattern: 'independent' },
        aspectratio: {
            x: 1,
            y: 1,
            z: 1
        },
        aspectmode: 'data',
        xaxis: {
            showgrid: false,
            zeroline: false,
            visible: false,
        },
        yaxis: {
            scaleanchor: "x",
            showgrid: false,
            zeroline: false,
            visible: false,
        },


    };

    if (!state.init) {
        Plotly.newPlot(container, {
            data, layout,
        });
        state.init = true;
    } else {
        Plotly.restyle(container,
            { z: [traceM.z] }, [0]);
    }

}

function gaussianSVDExplore(containerId) {
    const container = document.getElementById(containerId);

    container.innerHTML = "";

    const state = {};
    state.showApproximation = false;

    const containerPlot = document.createElement("div");
    const containerInput = document.createElement("div");

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0.1";
    slider.max = "1";
    slider.step = "0.01";
    slider.value = "1";


    const sliderDescription = document.createElement("span");
    sliderDescription.style.cssText = "font-weight: bold;";
    // sliderDescription.tagName = "slider_description";
    sliderDescription.textContent = "Adjust gaussian standard deviation";
    const containerInter = createContainer(
        [
            sliderDescription,
            slider
        ]
    );

    containerInput.appendChild(containerInter);


    const showApproximation = document.createElement('input');
    showApproximation.id = `checkbox_show_approximation`;
    showApproximation.type = 'checkbox';
    showApproximation.checked = state.showApproximation;

    const labelShowApproximation = document.createElement('label');
    labelShowApproximation.setAttribute('for', `checkbox_show_approximation`);
    labelShowApproximation.innerText = 'Show approximation';

    containerInput.appendChild(createContainer([showApproximation, labelShowApproximation]));

    container.appendChild(containerPlot);
    container.appendChild(containerInput);

    state.sigma = parseFloat(slider.value);
    slider.oninput = function () {
        const sigma = parseFloat(slider.value);
        state.sigma = sigma;
        gaussianSVDExploreUpdate(containerPlot, state);

    };

    showApproximation.onchange = () => {
        state.showApproximation = showApproximation.checked;
        const sigma = parseFloat(slider.value);

        gaussianSVDExploreUpdate(containerPlot, state);

    };
    slider.dispatchEvent(new Event("input"))
}

export {
    makeUserInterfaceFilter,
    gaussianSVDExplore,
    makeUserInterfaceApprox,
}