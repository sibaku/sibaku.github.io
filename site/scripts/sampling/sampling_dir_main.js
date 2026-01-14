import { HemisphereHistogram } from "./hemisphereHistogram.js";
import * as jsm from "../lib/jsmatrix.js"
import { Shader, Mesh, Renderable, Texture, TextureSampler, Material, Geometry, Sampler } from "./gl.js";

import { makeCanvas, makeCheckbox, makeContainer, makeElement, makeSlider, makeSpan, makeTextField, makeUpdateSlider } from "../lib/commonHtmlHelper.js";

const vf32 = jsm.VecF32;


function pow_cos_hemisphere_cap(theta_max, n) {

    const u_1 = Math.random();
    const u_2 = Math.random();

    const theta = Math.acos(Math.pow(
        1.0 - u_1 * (1.0 - Math.pow(Math.cos(theta_max), n + 1)),
        1.0 / (n + 1)
    ));
    const phi = u_2 * 2.0 * Math.PI;

    return [theta, phi];
}

function cos_hemisphere() {

    const u_1 = Math.random();
    const u_2 = Math.random();

    // Math.sqrt(u_1) works the same way
    const theta = Math.acos(Math.sqrt(1.0 - u_1));
    const phi = u_2 * 2.0 * Math.PI;

    return [theta, phi];
}

function pow_cos_hemisphere_sector(theta_min, theta_max, phi_min, phi_max, n) {

    const u_1 = Math.random();
    const u_2 = Math.random();

    let theta = Math.acos(Math.pow(
        Math.pow(
            Math.cos(theta_min), n + 1)
        - u_1 * (Math.pow(Math.cos(theta_min), n + 1)
            - Math.pow(Math.cos(theta_max), n + 1)),
        1.0 / (n + 1)
    ));
    const phi = u_2 * (phi_max - phi_min);

    return [theta, phi];
}

function beckmann_width_to_phong(a) {
    return 2.0 / (a * a) - 2.0;
}

function sample_phong_normal(a) {

    return pow_cos_hemisphere_cap(Math.PI / 2.0, a + 1);
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

function uniform_angular_hemisphere() {


    const u_1 = Math.random();
    const u_2 = Math.random();

    const theta = u_1 * Math.PI / 2.0;
    const phi = u_2 * 2.0 * Math.PI;

    return [theta, phi]
}

function uniform_hemisphere() {

    const u_1 = Math.random();
    const u_2 = Math.random();

    // Math.acos(u_1) is also valid
    const theta = Math.acos(1.0 - u_1);
    const phi = u_2 * 2.0 * Math.PI;

    return [theta, phi]
}

function sample_beckmann(a) {

    const u_1 = Math.random();
    const u_2 = Math.random();

    // Math.log(u_1) works the same way
    const theta = Math.atan(Math.sqrt(-a * a * Math.log(1.0 - u_1)));
    const phi = u_2 * 2.0 * Math.PI;

    return [theta, phi];
}

function sample_ggx(a) {

    const u_1 = Math.random();
    const u_2 = Math.random();

    // (u_1) works the same way as (1.0 - u_1)
    const theta = Math.atan(Math.sqrt(a * a * u_1 / (1.0 - u_1)));
    const phi = u_2 * 2.0 * Math.PI;

    return [theta, phi];
}

function makeLabeledSlider(label, cb, min = 0, max = 1, value = min, steps = 100, initialUpdate = true) {

    const valLabel = makeTextField(value.toLocaleString("en-US", { maximumFractionDigits: 3, minimumFractionDigits: 0 }));

    const l = makeSpan(makeTextField(`${label}:`));

    const slider = makeUpdateSlider((val, s) => {
        valLabel.textContent = val.toLocaleString("en-US", { maximumFractionDigits: 3, minimumFractionDigits: 0 });

        if (cb !== null && cb !== undefined) {
            cb(val, s)
        }
    }, min, max, value, steps, initialUpdate);


    return makeContainer(l, slider, valLabel);
}

function createCosineWeightedHemisphere(containerId) {
    createDirSamplerInterface(containerId, cos_hemisphere);
}

function createUniformdHemisphere(containerId) {
    createDirSamplerInterface(containerId, uniform_hemisphere);
}

function createAngulardHemisphere(containerId) {
    createDirSamplerInterface(containerId, uniform_angular_hemisphere);
}




function createPowCosHemisphereCap(containerId) {


    let thetaMax = Math.PI * 0.5;
    let n = 2;
    const { controlsContainer, state } = createDirSamplerInterface(containerId, () => pow_cos_hemisphere_cap(thetaMax, n));


    const thetaSlider = makeLabeledSlider("Theta", (val) => {
        thetaMax = val;
    }, 0, Math.PI * 0.5, thetaMax, 180, true);

    const nInput = makeElement("input");
    nInput.type = "number";
    nInput.value = n;
    nInput.min = 0;



    nInput.addEventListener('change', function () {
        let val = parseInt(nInput.value);
        if (isNaN(val)) {
            nInput.value = 2;
            val = 2;
        }

        n = val;

    });

    controlsContainer.append(makeContainer(
        // makeContainer(makeTextField("Theta: "), thetaSlider),
        makeElement("h4",makeTextField("Parameters: ")),
        thetaSlider,
        makeContainer(makeTextField("n: "), nInput),

    ));

}

function createPhongNormal(containerId) {


    let a = 0.5;
    const { controlsContainer, state } = createDirSamplerInterface(containerId, () => sample_phong_normal(a));


    const aSlider = makeLabeledSlider("a", (val) => {
        a = val;
    }, 0, 10, a, 100, true);



    controlsContainer.append(makeContainer(
        makeElement("h4",makeTextField("Parameters: ")),

        aSlider,
    ));

}

function createBeckmanNormal(containerId) {


    let a = 0.5;
    const { controlsContainer, state } = createDirSamplerInterface(containerId, () => sample_beckmann(a));


    const aSlider = makeLabeledSlider("a", (val) => {
        a = val;
    }, 0, 1, a, 100, true);



    controlsContainer.append(makeContainer(
        makeElement("h4",makeTextField("Parameters: ")),

        aSlider,
    ));

}


function createGGXNormal(containerId) {


    let a = 0.5;
    const { controlsContainer, state } = createDirSamplerInterface(containerId, () => sample_ggx(a));


    const aSlider = makeLabeledSlider("a", (val) => {
        a = val;
    }, 0, 1, a, 100, true);



    controlsContainer.append(makeContainer(
        makeElement("h4",makeTextField("Parameters: ")),

        aSlider,
    ));

}



function createPowCosHemisphereSector(containerId) {


    let thetaMin = 0;
    let thetaMax = Math.PI * 0.5;
    let phiMin = 0;
    let phiMax = Math.PI * 2;
    let n = 2;
    const { controlsContainer, state } = createDirSamplerInterface(containerId, () => pow_cos_hemisphere_sector(thetaMin, thetaMax, phiMin, phiMax, n));


    const thetaMaxSlider = makeLabeledSlider("Theta max", (val) => {
        thetaMax = val;
        thetaMax = Math.max(thetaMin, thetaMax);
        return thetaMax;
    }, 0, Math.PI * 0.5, thetaMax, 180, true);

    const thetaMinSlider = makeLabeledSlider("Theta min", (val) => {
        thetaMin = val;
        thetaMin = Math.min(thetaMin, thetaMax);
        return thetaMin;
    }, 0, Math.PI * 0.5, thetaMin, 180, true);

    const phiMaxSlider = makeLabeledSlider("Phi max", (val) => {
        phiMax = val;
        phiMax = Math.max(phiMin, phiMax);
        return phiMax;
    }, 0, Math.PI * 2, phiMax, 360, true);

    const phiMinSlider = makeLabeledSlider("Phi min", (val) => {
        phiMin = val;
        phiMin = Math.min(phiMin, phiMax);
        return phiMin;
    }, 0, Math.PI * 2, phiMin, 360, true);

    const nInput = makeElement("input");
    nInput.type = "number";
    nInput.value = n;
    nInput.min = 0;



    nInput.addEventListener('change', function () {
        let val = parseInt(nInput.value);
        if (isNaN(val)) {
            nInput.value = 2;
            val = 2;
        }

        n = val;

    });

    controlsContainer.append(makeContainer(
        makeElement("h4",makeTextField("Parameters: ")),
        thetaMinSlider,
        thetaMaxSlider,
        phiMinSlider,
        phiMaxSlider,
        makeContainer(makeTextField("n: "), nInput),

    ));

}

function createDirSamplerInterface(containerId, samplingFunction) {
    const container = document.querySelector(`#${containerId}`);
    console.log("Setup:", container);

    const innerContainer = document.createElement("div");
    innerContainer.classList.add("sample");

    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;

    canvas.classList.add("sampleCanvas");

    innerContainer.appendChild(canvas);
    container.appendChild(innerContainer);

    const gl = canvas.getContext("webgl2");

    const state = {
    };




    const prog = new Shader(gl, {
        vertex: vertexShaderSource,
        fragment: fragmentShaderSource
    });
    if (!prog.compile()) {
        prog.printError();
    }

    const mat = new Material(prog);

    const innerMinTheta = 1 * Math.PI / 180.0;
    const resolutionPhi = 24;
    const resolutionTheta = 10;

    const hemiHisto = new HemisphereHistogram({
        innerMinTheta,
        resolutionPhi,
        resolutionTheta,
    });
    state.mat = mat;


    state.gl = gl;
    state.updatables = [];


    state.geom2 = Geometry.createHemisphere(gl, 20, 60, 1);
    state.renderable = new Renderable(mat, state.geom2);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);


    state.updatables.push((t, dt) => {
        const angle = state.baseRotation + t * 2 * Math.PI / 10;

        state.renderable.setLocal(jsm.axisAngle4(jsm.VecF32.from([0, 1, 0]), angle));

    });

    state.time = 0;
    state.timeStamp = performance.now();
    state.tex = new Texture(gl, {
        width: hemiHisto.resolutionPhi,
        height: hemiHisto.resolutionTheta,
        internalFormat: gl.R8,
    });
    state.hemiHistogram = hemiHisto;



    {

        const colors = [
            col(0.001462, 0.000466, 0.013866, 1.0),
            col(0.33992925000000007, 0.06175875, 0.42919975, 1.0),
            col(0.732796, 0.21433249999999998, 0.33205300000000004, 1.0),
            col(0.9774245, 0.5526217499999999, 0.03802025, 1.0),
            col(0.988362, 0.998364, 0.644924, 1.0)
        ];

        const data = new Uint8Array(colors.length * 3);

        const ctex = new Texture(gl, {
            width: colors.length,
            height: 1,
            internalFormat: gl.RGB8,
        });

        for (let i = 0; i < colors.length; i++) {

            data[3 * i + 0] = Math.max(0, Math.min(255, Math.floor(255 * colors[i].r)));
            data[3 * i + 1] = Math.max(0, Math.min(255, Math.floor(255 * colors[i].g)));
            data[3 * i + 2] = Math.max(0, Math.min(255, Math.floor(255 * colors[i].b)));
        }
        ctex.upload({
            width: colors.length,
            height: 1,
            internalFormat: gl.RGB,
            srcFormat: gl.RGB,
            pixel: data
        });

        state.colorMap = new TextureSampler(ctex, new Sampler(gl, {
            TEXTURE_MIN_FILTER: gl.LINEAR,
            TEXTURE_MAG_FILTER: gl.LINEAR
        }));



    }


    const updateColorMap = () => {
        const { hemiHistogram } = state;


        const {
            texData,
            innerData
        } = hemiHistogram.fillArray(null);
        state.innerData = innerData;
        state.tex.upload({
            width: hemiHisto.resolutionPhi,
            height: hemiHisto.resolutionTheta,
            internalFormat: gl.R8,
            srcFormat: gl.RED,
            pixel: texData
        });

        state.linearTex = new TextureSampler(state.tex, new Sampler(gl, {
            TEXTURE_WRAP_S: gl.REPEAT
        }))
        state.nearestTex = new TextureSampler(state.tex, new Sampler(gl, {
            TEXTURE_WRAP_S: gl.REPEAT,
            TEXTURE_MAG_FILTER: gl.NEAREST,
            TEXTURE_MIN_FILTER: gl.NEAREST
        }));
    };




    state.baseRotation = 0;

    state.lineThickness = 0.0035;


    state.canvas = canvas;
    state.gl = gl;


    state.drawLines = true;
    state.running = false;


    const button = makeElement("button");
    button.innerText = "Add samples";




    const numField = makeElement("input");
    numField.type = "number";
    numField.value = 100000;

    const totalEls = makeContainer(makeTextField("Total samples: 0"));
    const updateTotal = () => {
        totalEls.innerHTML = '';
        totalEls.append(makeTextField(`Total samples: ${state.hemiHistogram.total}`));
    };

    const [checkAnimate, labelAnimate] = makeCheckbox("Rotate", state.running);

    checkAnimate.addEventListener('change', () => {
        state.running = checkAnimate.checked;
    });


    const buttonReset = makeElement("button");
    buttonReset.innerText = "Reset";
    buttonReset.onclick = () => {

        const hemiHisto = new HemisphereHistogram({
            innerMinTheta,
            resolutionPhi,
            resolutionTheta,
        });
        state.hemiHistogram = hemiHisto;
        updateColorMap();
        updateTotal();

    };

    button.onclick = () => {
        let val = parseInt(numField.value);
        if (isNaN(val)) {
            numField.value = 100000;
            return;
        }
        val = Math.max(1, val);
        numField.value = val;
        button.disabled = true;
        const { hemiHistogram } = state;
        for (let i = 0; i < val; i++) {

            const [theta, phi] = samplingFunction();
            hemiHistogram.add(theta, phi);
        }

        updateColorMap();
        updateTotal();

        button.disabled = false;
    };

    {
        const { hemiHistogram } = state;
        for (let i = 0; i < 100000; i++) {

            const [theta, phi] = samplingFunction();
            hemiHistogram.add(theta, phi);
        }

        updateColorMap();
        updateTotal();
    }


    innerContainer.append(totalEls);

    const controls = makeContainer();
    controls.classList.add("controls");

    const [drawGridInput, drawGridLabel] = makeCheckbox("Display grid", true);
    const [linearInput, linearLabel] = makeCheckbox("Linearly interpolate", false);
    const thickSlider = makeLabeledSlider("Line thickness", (val) => {
        state.lineThickness = val;
    }, 0, 0.05, 0.01, 100, true);
    const baseRotSlider = makeLabeledSlider("Base rotation", (val) => {
        state.baseRotation = val;
    }, 0, 2 * Math.PI, state.baseRotation, 360, true);

    drawGridInput.addEventListener('change', () => {
        state.drawLines = drawGridInput.checked;
    });

    linearInput.addEventListener('change', () => {
        if (linearInput.checkValidity) {
            state.renderable.material.setPropertyByName("tex", state.linearTex);

        } else {
            state.renderable.material.setPropertyByName("tex", state.nearestTex);

        }
    });

    controls.append(numField);
    controls.appendChild(button);
    controls.appendChild(makeContainer(checkAnimate, labelAnimate));
    controls.appendChild(makeContainer(buttonReset));
    controls.appendChild(makeContainer(linearInput, linearLabel));
    controls.append(
        makeContainer(drawGridInput, drawGridLabel),
        thickSlider,
        baseRotSlider,
    );


    innerContainer.appendChild(controls);

    drawGl(state);

    return {
        controlsContainer: controls,
        state,
    };
}

function drawGl(state) {

    const {
        gl,
        renderable,
        timeStamp,
        colorMap,
        hemiHistogram,
        lineThickness,
        innerData,

        drawLines,
        canvas,

    } = state;
    let {
        time
    } = state;



    const now = performance.now();
    let dt = (now - timeStamp) / 1000.0;
    if (!state.running) {
        dt = 0.0;
    }

    time += dt;
    state.timeStamp = now;
    state.time = time;

    for (const u of state.updatables) {
        u(time, dt);
    }

    const near = 0.01;
    const far = 10.0;
    // Define a view matrix
    // As with OpenGL we use y as the up vector
    const V = jsm.lookAt(vf32.from([3, 2.75, 0]), vf32.from([0, 0.75, 0]), vf32.from([0, 1, 0]));
    // Define a perspective projection
    const P = jsm.perspective(jsm.deg2rad(70), canvas.width / canvas.height, near, far);


    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    const {
        material: mat
    } = renderable;


    Material.setGlobalPropertyByName("V", V._data);
    Material.setGlobalPropertyByName("P", P._data);
    Material.setGlobalPropertyByName("VP", jsm.mult(P, V)._data);


    mat.setPropertyByName("colorMap", colorMap);

    mat.setPropertyByName("u_resTheta", hemiHistogram.resolutionTheta);
    mat.setPropertyByName("u_resPhi", hemiHistogram.resolutionPhi);
    mat.setPropertyByName("lineThickness", drawLines ? lineThickness : 0);
    mat.setPropertyByName("thetaMin", hemiHistogram.innerMinTheta);
    mat.setPropertyByName("innerData", innerData);


    renderable.render();

    window.requestAnimationFrame(() => drawGl(state));
}



const vertexShaderSource = `#version 300 es
     
layout(location = 0) in vec4 a_position;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in vec3 a_normal;

out vec2 uv;
out vec3 normal;
out vec3 pos;

uniform mat4 VP; 
uniform mat4 M; 

void main() {
  mat4 MVP = VP * M;
  gl_Position = MVP*a_position;
  uv = a_uv;
  normal = a_normal;
  pos = a_position.xyz;
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;
  
in vec2 uv;
in vec3 normal;
in vec3 pos;

#define M_PI 3.1415926538

out vec4 outColor;

uniform int u_resTheta;
uniform int u_resPhi ;
uniform float lineThickness ;

uniform float thetaMin;
uniform float innerData;

uniform sampler2D tex;
uniform sampler2D colorMap;


float distGrid(float v, int res){
    float vg = v*float(res);

    float vmin = floor(vg);
    float vmax = vmin + 1.0;

    float d = vg - vmin;
    d = min(vmax-vg, d);

    return d;

}

float angularDist(float theta0, float phi0, float theta1, float phi1){

    float deltaPhi = phi0 - phi1;

    return acos(
        clamp(cos(theta0)*cos(theta1) + sin(theta0)*sin(theta1)*cos(deltaPhi),0.0,1.0)
    );


}
vec2 distTheta(float theta, float phi, int res){

    float v = (theta - thetaMin) / (0.5 *M_PI - thetaMin);
    float vg = v*float(res);

    float vmin = floor(vg);
    float vmax = vmin + 1.0;

    float theta0 = vmin / float(res) * (0.5 *M_PI - thetaMin) + thetaMin;
    float theta1 = vmax / float(res) * (0.5 *M_PI - thetaMin) + thetaMin;

    float d = abs(angularDist(theta,phi, theta0,phi));
    d = min( abs(
        angularDist(theta,phi, theta1,phi) 
        ),
        d);
    return vec2(v,d);

}



vec2 distPhi(float phi, float theta, int res){

    float v = phi / (2.0 * M_PI);
    float vg = v*float(res);

    float vmin = floor(vg);
    float vmax = vmin + 1.0;

    float phi0 = vmin / float(res) *  2.0* M_PI;
    float phi1 = vmax / float(res) * 2.0* M_PI;

    float d = abs(angularDist(theta, phi, theta, phi0));
    d = min(abs(angularDist(theta, phi, theta, phi1)),d);
    return vec2(v,d);
}
void main() {

    vec3 P = normalize(pos);
    float theta = acos(P.y);
    float phi = atan(P.x,P.z);

    phi = phi < 0.0 ? phi + 2.0* M_PI : phi;

    vec2 du = distPhi(phi, theta, u_resPhi);
    vec2 dv = distTheta(theta, phi, u_resTheta);

    float u = du.x;
    float v = dv.x;

    float d = du.y;

    if(theta > thetaMin){
        d = min(d, dv.y);
    }else{
        d = 1.0;    
    }

    vec3 color = vec3(1,1,1);
    
    float density = innerData;
    if(theta > thetaMin){
        density = texture(tex, vec2(u,v)).x;
    }

    
    color = texture(colorMap, vec2(density,0.0)).xyz;
    
    float s = smoothstep(lineThickness*0.5, lineThickness*1.5, d);
    if(d < lineThickness){
        color *= s;
    }


  outColor = vec4(color, 1);

}
    `;



export {
    createCosineWeightedHemisphere,
    createPowCosHemisphereCap,
    createPowCosHemisphereSector,
    createUniformdHemisphere,
    createAngulardHemisphere,
    createPhongNormal,
    createBeckmanNormal,
    createGGXNormal,
};