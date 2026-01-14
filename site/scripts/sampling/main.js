import {
    HemisphereHistogram
} from "./hemisphereHistogram.js";
import {
    PolarHistogram
} from "./polarHistogram.js";
import * as jsm from "../lib/jsmatrix.js"

import {
    Geometry,
    Material,
    Renderable,
    Sampler,
    Shader,
    Texture,
    TextureSampler
} from "./gl.js";


const vf32 = jsm.VecF32;

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
const state = {};

function run() {

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
    state.polar = polar;

    const button = document.querySelector("button");

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.transform(1, 0, 0, -1, 0, canvas.height)

    state.canvas = canvas;
    state.ctx = ctx;
    state.colors = colors;

    button.onclick = () => {
        // button.disabled = true;
        addAndDraw();
    }

    const canvas3D = document.getElementById("canvas3D");
    /**
     * @type {WebGL2RenderingContext}
     */
    const gl = canvas3D.getContext("webgl2");

    const button3d = document.querySelector("#run3d");
    const buttonSwitchLines = document.querySelector("#enableLines");
    const buttonSampling = document.querySelector("#switchSample");

    const prog = new Shader(gl, {
        vertex: vertexShaderSource,
        fragment: fragmentShaderSource
    });
    if (!prog.compile()) {
        prog.printError();
    }

    const mat = new Material(prog);

    const hemiHisto = new HemisphereHistogram({
        innerMinTheta: 1 * Math.PI / 180.0,
        resolutionPhi: 10,
        resolutionTheta: 10,
    });
    GlState.mat = mat;

    GlState.gl = gl;
    GlState.updatables = [];

    GlState.geom2 = Geometry.createHemisphere(gl, 20, 60, 1);
    GlState.renderable = new Renderable(mat, GlState.geom2);


    const r2 = new Renderable(new Material(Shader.getNormalColor(gl), {
        "u_color": [1, 0, 0, 1],
        "u_drawLocalSpace": 1
    }),
        Geometry.createSphere(gl, 21, 31, 1),
        jsm.MatF32.id(4)
    )

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    GlState.updatables.push((t, dt) => {
        // r2.setLocal(
        //     jsm.mult(
        //         jsm.translation(jsm.VecF32.from([0, Math.sin(t), 0])),
        //         jsm.axisAngle4(jsm.VecF32.from([1, 1, 1]), t * 0.5))
        // );

        r2.setLocal(jsm.axisAngle4(jsm.VecF32.from([1, 0, 0]), t * 2.5));
    });

    const r3 = new Renderable(null, null,
        //  jsm.mult(jsm.translation(jsm.VecF32.from([1.5, 0.75, 0])), jsm.scaling(jsm.VecF32.from([0.3, 0.3, 0.3])))
        jsm.mult(jsm.translation(jsm.VecF32.from([0, 1.75, 0])), jsm.scaling(jsm.VecF32.from([0.3, 0.3, 0.3])))

    );

    r3.setParent(GlState.renderable);
    r2.setParent(r3);
    GlState.time = 0;
    GlState.timeStamp = performance.now();
    GlState.tex = new Texture(gl, {
        width: hemiHisto.resolutionPhi,
        height: hemiHisto.resolutionTheta,
        internalFormat: gl.R8,
    });
    GlState.hemiHistogram = hemiHisto;

    GlState.lineThickness = 0.0035;

    {
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

        GlState.colorMap = new TextureSampler(ctex, new Sampler(gl, {
            TEXTURE_MIN_FILTER: gl.LINEAR,
            TEXTURE_MAG_FILTER: gl.LINEAR
        }));

    }

    {
        for (let i = 0; i < 100000; i++) {
            // const theta = Math.PI * 0.5 * Math.random();
            // const phi = 2 * Math.PI * Math.random();
            // const [theta, phi] = uniform_angular_hemisphere();
            // const [theta, phi] = uniform_hemisphere();
            // const [theta, phi] = pow_cos_hemisphere_sector(deg2Rad(10), deg2Rad(68), deg2Rad(10), deg2Rad(120), 4);
            // const [theta, phi] = cos_hemisphere();

            let theta;
            let phi;
            const r = Math.random();
            if (r < 1 / 4) {
                [theta, phi] = uniform_hemisphere();
            } else if (r < 9 / 10) {
                [theta, phi] = cos_hemisphere();
            } else {
                [theta, phi] = pow_cos_hemisphere_sector(deg2Rad(10), deg2Rad(68), deg2Rad(10), deg2Rad(120), 4);
            }
            hemiHisto.add(theta, phi);
        }

        const {
            texData,
            innerData
        } = hemiHisto.fillArray(null);
        GlState.innerData = innerData;
        GlState.tex.upload({
            width: hemiHisto.resolutionPhi,
            height: hemiHisto.resolutionTheta,
            internalFormat: gl.R8,
            srcFormat: gl.RED,
            pixel: texData
        });

        GlState.linearTex = new TextureSampler(GlState.tex, new Sampler(gl, {
            TEXTURE_WRAP_S: gl.REPEAT
        }))
        GlState.nearestTex = new TextureSampler(GlState.tex, new Sampler(gl, {
            TEXTURE_WRAP_S: gl.REPEAT,
            TEXTURE_MAG_FILTER: gl.NEAREST,
            TEXTURE_MIN_FILTER: gl.NEAREST
        }));
        GlState.running = false;
        GlState.filterLinear = false;
        GlState.drawLines = true;

        button3d.onclick = () => {
            GlState.running = !GlState.running;
        }

        buttonSampling.onclick = () => {
            GlState.filterLinear = !GlState.filterLinear;
        }

        buttonSwitchLines.onclick = () => {
            GlState.drawLines = !GlState.drawLines;
        }
    }

    if (false) {
        let idx = 0;
        const w = 64;
        const h = 64;
        const data = new Uint8Array(w * h * 3);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                data[idx + 0] = 255 * ((x + y) % 2);
                data[idx + 1] = 255 * ((x + y) % 2);
                data[idx + 2] = 255 * ((x + y) % 2);
                idx += 3;
            }
        }

        GlState.tex.create({
            width: w,
            height: h,
            internalFormat: gl.RGB,
            srcFormat: gl.RGB,
            pixel: data
        })
    }

    drawGl();
}

function uniform_hemisphere() {

    const u_1 = Math.random();
    const u_2 = Math.random();

    // Math.acos(u_1) is also valid
    const theta = Math.acos(1.0 - u_1);
    const phi = u_2 * 2.0 * Math.PI;

    return [theta, phi]
}

function uniform_angular_hemisphere() {


    const u_1 = Math.random();
    const u_2 = Math.random();

    const theta = u_1 * Math.PI / 2.0;
    const phi = u_2 * 2.0 * Math.PI;

    return [theta, phi]
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
            Math.cos(theta_min), n + 1) -
        u_1 * (Math.pow(Math.cos(theta_min), n + 1) -
            Math.pow(Math.cos(theta_max), n + 1)),
        1.0 / (n + 1)
    ));
    const phi = u_2 * (phi_max - phi_min);

    return [theta, phi];
}

function deg2Rad(deg) {
    return deg * Math.PI / 180;
}


const GlState = {

};


function drawGl() {

    const {
        gl,
        geom,
        renderable,
        geom2,
        timeStamp,
        tex,
        colorMap,
        hemiHistogram,
        lineThickness,
        innerData,

        drawLines,
        filterLinear,
    } = GlState;
    let {
        time
    } = GlState;



    const now = performance.now();
    const dt = (now - timeStamp) / 1000.0;
    if (GlState.running) {
        time += dt;
    }

    GlState.timeStamp = now;
    GlState.time = time;

    for (const u of GlState.updatables) {
        u(time, dt);
    }
    const near = 0.01;
    const far = 10.0;
    // Define a view matrix
    // As with OpenGL we use y as the up vector
    const V = jsm.lookAt(vf32.from([3, 1.65, 0]), vf32.from([0, 1.25, 0]), vf32.from([0, 1, 0]));
    // Define a perspective projection
    const P = jsm.perspective(jsm.deg2rad(70), canvas.width / canvas.height, near, far);
    const M = jsm.axisAngle4(vf32.from([0, 1, 0]), time * Math.PI * 2 / 10);
    // No model matrix here, so model matrix is just Projection * View
    const MVP = jsm.mult(jsm.mult(P, V), M);


    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    const {
        material: mat
    } = renderable;

    renderable.setLocal(M);

    mat.setPropertyByName("M", M._data);
    Material.setGlobalPropertyByName("V", V._data);
    Material.setGlobalPropertyByName("P", P._data);
    Material.setGlobalPropertyByName("VP", jsm.mult(P, V)._data);

    if (filterLinear) {
        mat.setPropertyByName("tex", GlState.linearTex);

    } else {
        mat.setPropertyByName("tex", GlState.nearestTex);

    }

    mat.setPropertyByName("colorMap", colorMap);

    mat.setPropertyByName("u_resTheta", hemiHistogram.resolutionTheta);
    mat.setPropertyByName("u_resPhi", hemiHistogram.resolutionPhi);
    mat.setPropertyByName("lineThickness", drawLines ? lineThickness : 0);
    mat.setPropertyByName("thetaMin", hemiHistogram.innerMinTheta);
    mat.setPropertyByName("innerData", innerData);


    // mat.bind();

    // Bind the attribute/buffer set we want.
    // gl.bindVertexArray(geom.vao);

    // // Draw the line
    // var primitiveType = gl.TRIANGLES;
    // var offset = 0;
    // var count = 2;
    // gl.drawElements(primitiveType, geom.num, gl.UNSIGNED_SHORT, offset, 0);

    // geom2.draw();

    renderable.render();

    window.requestAnimationFrame(drawGl);
}

const vertexShaderSource = `#version 300 es
     
    // an attribute is an input (in) to a vertex shader.
    // It will receive data from a buffer
    layout(location = 0) in vec4 a_position;
    layout(location = 1) in vec2 a_uv;
    layout(location = 2) in vec3 a_normal;

    out vec2 uv;
    out vec3 normal;
    out vec3 pos;

    uniform mat4 VP; 
    uniform mat4 M; 
     
    // all shaders have a main function
    void main() {
        mat4 MVP = VP * M;
      // gl_Position is a special variable a vertex shader
      // is responsible for setting
      gl_Position = MVP*a_position;
      uv = a_uv;
      normal = a_normal;
      pos = a_position.xyz;
    }
    `;

const fragmentShaderSource = `#version 300 es
     
    // fragment shaders don't have a default precision so we need
    // to pick one. highp is a good default. It means "high precision"
    precision highp float;
     
    in vec2 uv;
    in vec3 normal;
    in vec3 pos;
#define M_PI 3.1415926538
    // we need to declare an output for the fragment shader
    out vec4 outColor;

     uniform int u_resTheta;
     uniform int u_resPhi ;
    uniform float lineThickness ;

    uniform float thetaMin;
    uniform float innerData;

    uniform sampler2D tex;
    uniform sampler2D colorMap;

    
    uniform struct {
        vec2 a;
        float b;
    } abcd[3];

    uniform vec2 efgh[4];

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

        // float u = (phi / M_PI + 1.0) * 0.5;
        // float v = theta / (0.5 *M_PI);

        vec2 du = distPhi(phi, theta, u_resPhi);
        vec2 dv = distTheta(theta, phi, u_resTheta);

        float u = du.x;
        float v = dv.x;

        // float d = pow(6.0*dv,4.0);
        float d = du.y;

        if(theta > thetaMin){
            d = min(d, dv.y);
        }else{
            d = 1.0;    
        }
        // float d = distThetaTest(theta, phi, u_resTheta);
        // float d = float(v < 0.95);

        vec3 color = vec3(1,1,1);
        color = vec4(abcd[0].a+efgh[0],abcd[1].a+efgh[3]).xyz;
        color = vec3(1,1,1);
        float density = innerData;
        if(theta > thetaMin){
            density = texture(tex, vec2(u,v)).x;
        }

        
        color = texture(colorMap, vec2(density,0.0)).xyz;
        //color = vec3(density);
        float s = smoothstep(lineThickness*0.5, lineThickness*1.5, d);
        if(d < lineThickness){
            // color = vec3(0.0);
            color *= s;
        }

        // color = vec3(s);



      // Just set the output to a constant reddish-purple
    //   outColor = vec4(abs(normal), 1);
      outColor = vec4(u,v,0, 1);
    //   outColor = vec4(vec3(fract(v*5.0),0.0,0.0), 1);
      outColor = vec4(color, 1);
        // outColor = vec4(vec3(d,0.0,0.0),1.0);
    //   outColor = vec4(vec3(v > 0.9,0.0,0.0), 1);
        // outColor = vec4(abcd[0].a * efgh[0], abcd[1].a+efgh[3]);

    }
    `;

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

function addAndDraw() {
    const {
        polar,
        canvas,
        ctx,
        colors
    } = state;
    const els = polar.total;

    // const toAdd = Math.max(1, Math.floor(els / 2));
    // const toAdd = 1;
    const toAdd = Math.round(Math.pow(Math.max(1, getBaseLog(10, els)), 2.5)) + 5 * Math.round(Math.pow(Math.max(1, getBaseLog(100, els)), 6.5));

    // console.log(toAdd);
    const pixelSize = 200;
    const pixelCenter = {
        x: Math.floor(canvas.width / 2),
        y: Math.floor(canvas.height / 2)
    };
    const points = [];
    const alphaMin = 0.25 * Math.PI;
    const alphaMax = 1.75 * Math.PI;
    const alphaDelta = alphaMax - alphaMin;

    const radiusMin = 0.3;
    const radiusMax = 1;
    const radiusDelta = radiusMax - radiusMin;
    for (let i = 0; i < toAdd; i++) {
        const alpha = Math.random() * alphaDelta + alphaMin;
        const r = Math.sqrt((radiusMax * radiusMax - radiusMin * radiusMin) * Math.random() + radiusMin * radiusMin);
        // const r = Math.random() * radiusDelta + radiusMin;
        polar.insertSample(alpha, r);
        const x = Math.cos(alpha) * r * pixelSize + pixelCenter.x;
        const y = Math.sin(alpha) * r * pixelSize + pixelCenter.y;
        points.push({
            x,
            y
        });
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // ctx.fillStyle = "rgb(255,0,0)";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);


    ctx.restore();
    polar.draw(ctx, {
        pixelSize,
        pixelCenter,
        gridLineSize: 0.5,
        colorMap: colors,
        gridLinesAngle: true,
        gridLinesRadius: true,
    });



    if (els < 500000) {
        // ctx.fillStyle = polar.colorToFillStyle(col(67.8 / 255.0, 84.7 / 255.0, 90.2 / 255));
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
        // window.requestAnimationFrame(addAndDraw);
        setTimeout(addAndDraw, 50);
    }
}

document.body.onload = run;