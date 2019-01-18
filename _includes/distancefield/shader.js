var gl; // A global variable for the WebGL context

var shaderProgram;
var fragmentShader;
var vertexShader;
function initShaders() {
    if (shaderProgram)
        gl.deleteProgram(shaderProgram);
    if (fragmentShader)
        gl.deleteShader(fragmentShader);
    if (vertexShader)
        gl.deleteShader(vertexShader);

    fragmentShader = getShader(gl, fs, gl.FRAGMENT_SHADER);
    vertexShader = getShader(gl, vs, gl.VERTEX_SHADER);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);


    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
}

function updateCode()
{
    fs = fsHeader;
    var codeResult = generateCode(op, "p");
    var code = codeResult.code;

    dynamic = codeResult.timeDependant;
    fs += codeResult.proto;
    fs += code;
    fs += fsBody;
}

//var op = new opSubtraction(new Sphere(0, 0, 0.5, 1), new Sphere(1, 0, 0, 1));

//var op = new opSubtraction(new Mandelbulb(), new MengerSponge());
//var op = new opSubtraction(new Sphere(0,0,0,1),new Mandelbulb());
//var op = new opSubtraction(new Sphere(0,0,0,1),new MengerSponge());
//var op = new opFlip(new opTwist(new opFlip(new opTwist(new Box(0,0,0,4,1,0.5),0.1),"yzx"),40),"xzy");
var op = new opTwist(new MengerSponge(), 1);
var op = new opUnion(new opPlaneRepitition(new Box(1, 5, 1), "xz", 10, 10), new Plane(0, -1, 0, 1));
var opTower1 =
        new opSmoothUnion(
                new opSmoothUnion(
                        new Box(1, 3, 1),
                        new opTranslate(
                                new opScale(
                                        new Torus(1, 0.5, 1)
                                        , 1.2, 0.2, 1)
                                , 0, 3, 0)
                        )
                , new opTranslate(
                        new opScale(
                                new Torus(1, 0.5, 1)
                                , 1.2, 0.2, 1
                                )
                        , 0, 2.5, 0
                        )

                );
var opTower2 = new opSubtraction(new opTranslate(new Sphere(1.1), 0, 0, 0), opTower1);
opTower2 = new opSubtraction(new opTranslate(new Sphere(0.5), -1, 1.5, 1), opTower2);
opTower2 = new opSubtraction(new opTranslate(new Sphere(0.5), -1, 1.5, -1), opTower2);
opTower2 = new opSubtraction(new opTranslate(new Sphere(0.5), 1, 1.5, 1), opTower2);
opTower2 = new opSubtraction(new opTranslate(new Sphere(0.5), 1, 1.5, -1), opTower2);
//opTower2 = new opTwist(opTower2,1);
opTower2 = new opPlaneRepitition(opTower2, "xz", 10, 10);
opTower2 = new opUnion(opTower2, new opTranslate(new Box(1000, 0.1, 1000), 0, -1.5, 0));
var op = opTower2;
op = new opScale(op, 0.2);
//var op = new opSubtraction(new Sphere(0,0,0,1),new Mandelbulb());
//var op = new opSubtraction(new Sphere(1, 0, 1, 1), new opIntersection(
//        new opSmoothUnion(new Sphere(0, 0, 0, 1), new Sphere(-1, 0, 0, 1)),
//        new MengerSponge()));
////var op = new opSmoothUnion(new Sphere(0, 0, 0, 1), new Sphere(-1, 0, 0, 1));
////var op =  new Torus(0,-1,0,1,0.5,1);
var op = new opScale(
        new opFlip(new Mandelbulb(), "zxy"), 1.5);
op = new opSmoothUnion(
        op
        , new MengerSponge());
op =
        new opSubtraction(new Sphere(-1, 1, 0.5, 1), op);
op = new opSmoothUnion(op, new opScale(new Sierpinski(), 1.2));


op = new InfiniteField();
//op = new opScale(new Mandelbox(),0.1);
//op = new opTwist(new MengerSponge(),10);

op = new opPlaneRepitition(new Box(), "xz", 10, 10);
updateCode();
function getShader(gl, source, type) {
    console.log("Type: " + type);
    console.log("Source:");
    var l = source.match(/[^\r\n]+/g);
    for (var i = 0; i < l.length; i++)
    {
        console.log((i + 1) + ": " + l[i]);
    }


    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initWebGL(canvas) {
    gl = null;

    try {
        // Try to grab the standard context. If it fails, fallback to experimental.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch (e) {
    }

    // If we don't have a GL context, give up now
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }

    return gl;
}

var quadVertexBuffer;
var camPos = [0, -0.5, 2];
var step = 0.1;
var changed = true;
var Rq = quat.create();
function initBuffer()
{
    quadVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
    var vertices = [
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    quadVertexBuffer.itemSize = 3;
    quadVertexBuffer.numItems = 6;
}

window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

var drawTime;
var dynamic = false;
function draw()
{

    if (changed || dynamic)
    {
        changed = false;
        var curTime = Date.now();
        var sysTime = (curTime - drawTime) / 1000.;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, quadVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        var uni = gl.getUniformLocation(shaderProgram, "camPos");
        gl.uniform3fv(uni, cam.pos);

        gl.uniform1f(gl.getUniformLocation(shaderProgram, "time"), sysTime);

        var oc = vec3.create();
        var ob = vec3.create();
        var r = parseFloat($('#objectR').val());
        var g = parseFloat($('#objectG').val());
        var b = parseFloat($('#objectB').val());

        if (isNaN(r) || isNaN(g) || isNaN(b))
            oc = objectColor;
        else
        {
            oc[0] = Math.max(0, Math.min(1, r / 255));
            oc[1] = Math.max(0, Math.min(1, g / 255));
            oc[2] = Math.max(0, Math.min(1, b / 255));
        }

        r = parseFloat($('#backgroundR').val());
        g = parseFloat($('#backgroundG').val());
        b = parseFloat($('#backgroundB').val());

        if (isNaN(r) || isNaN(g) || isNaN(b))
            ob = backgroundColor;
        else
        {
            ob[0] = Math.max(0, Math.min(1, r / 255));
            ob[1] = Math.max(0, Math.min(1, g / 255));
            ob[2] = Math.max(0, Math.min(1, b / 255));
        }

        var lx = parseFloat($('#lightX').val());
        var ly = parseFloat($('#lightY').val());
        var lz = parseFloat($('#lightZ').val());

        if (isNaN(lx) || isNaN(ly) || isNaN(lz))
            ob = backgroundColor;
        else
        {
            lightDirection[0] = lx;
            lightDirection[1] = ly;
            lightDirection[2] = lz;
        }

        gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lightDirection_in"), lightDirection);

        var doLighting = $('#doLightingBox').prop('checked');
        doLighting = doLighting ? 1. : 0;
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "doLighting"), doLighting);
        var doSpecular = $('#doSpecularBox').prop('checked');
        doSpecular = doSpecular ? 1. : 0;
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "doSpecular"), doSpecular);


        gl.uniform3fv(gl.getUniformLocation(shaderProgram, "objectColor_in"), oc);
        gl.uniform3fv(gl.getUniformLocation(shaderProgram, "backgroundColor_in"), ob);
        
        var screenR = vec2.fromValues(canvas.width, canvas.height);
        
        gl.viewport(0,0,screenR[0],screenR[1]);
        var aspect = canvas.width/canvas.height;
        cam.aspect = aspect;
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, "screen"), screenR);

        var m = mat3.fromQuat(mat3.create(), Rq);

        var r = quat.rotationTo(quat.create(), vec3.fromValues(0, 0, -1), cam.dir);

        var m = mat3.fromQuat(mat3.create(), r);

        uni = gl.getUniformLocation(shaderProgram, "R");

        gl.uniformMatrix3fv(uni, false, m);
        var V = cam.view();
        var P = cam.projection();
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "V"), false, V);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "P"), false, P);
        var PInv = mat4.invert(mat4.create(), P);
        var VInv = mat4.invert(mat4.create(), V);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "VInv"), false, VInv);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "PInv"), false, PInv);

        gl.drawArrays(gl.TRIANGLES, 0, quadVertexBuffer.numItems);



    }
    requestAnimFrame(draw);
}

function dirFromAngle(theta, phi)
{
    return vec3.fromValues(Math.sin(phi) * Math.sin(theta), Math.cos(theta), Math.cos(phi) * Math.sin(theta));
}

function anglesFromDir(dir)
{
    return [Math.acos(dir[1] / vec3.length(dir)), Math.atan2(dir[0], dir[2])];
}
function Camera(pos, dir)
{
    this.pos = pos ? pos : vec3.fromValues(0, 0, 0);
    this.dir = dir ? dir : vec3.fromValues(0, 0, -1);
    var angles = anglesFromDir(this.dir);
    this.theta = angles[0];
    this.phi = angles[1];
    var testVec = dirFromAngle(angles[0], angles[1]);
    this.up = vec3.fromValues(0, 1, 0);
    this.lookAt = vec3.add(vec3.create(), this.pos, this.dir);
    this.orientation = quat.create();
    this.right = vec3.cross(vec3.create(), this.dir, this.up);
    vec3.normalize(this.right, this.right);
}

Camera.prototype.update = function ()
{
    var dir = vec3.sub(vec3.create(), this.lookAt, this.pos);
    vec3.normalize(dir, dir);
    var axis = vec3.cross(vec3.create(), dir, this.up);

    var pitch = quat.setAxisAngle(quat.create(), axis, this.theta);
    var heading = quat.setAxisAngle(quat.create(), this.up, this.phi);



    this.dir = dir;
};
Camera.prototype.moveForward = function (step)
{
    vec3.scaleAndAdd(this.pos, this.pos, this.dir, step);
};
Camera.prototype.moveBackward = function (step)
{
    vec3.scaleAndAdd(this.pos, this.pos, this.dir, -step);
};
Camera.prototype.panLeft = function (step)
{
    vec3.scaleAndAdd(this.pos, this.pos, this.right, -step);
};
Camera.prototype.panRight = function (step)
{
    vec3.scaleAndAdd(this.pos, this.pos, this.right, step);
};
Camera.prototype.moveUp = function (step)
{
    vec3.scaleAndAdd(this.pos, this.pos, this.up, step);
};
Camera.prototype.moveDown = function (step)
{
    vec3.scaleAndAdd(this.pos, this.pos, this.up, -step);
};
Camera.prototype.rotateRight = function (angle)
{
    this.phi -= angle;

    if (this.phi < 0 || this.phi > 2 * Math.PI)
    {
        console.log("nyah");
    }
    var normalize = Math.floor(this.phi / Math.PI / 2);
    console.log(normalize);
    this.phi = this.phi - normalize * Math.PI * 2;

    this.dir = dirFromAngle(this.theta, this.phi);
    this.right = vec3.cross(vec3.create(), this.dir, this.up);
    vec3.normalize(this.right, this.right);
};
Camera.prototype.rotateLeft = function (angle)
{
    this.rotateRight(-angle);
};

Camera.prototype.rotateUp = function (angle)
{

    this.theta -= angle;

    this.theta = Math.min(Math.PI - 0.1, Math.max(0.1, this.theta));
    this.dir = dirFromAngle(this.theta, this.phi);
    this.right = vec3.cross(vec3.create(), this.dir, this.up);
    vec3.normalize(this.right, this.right);
    console.log(this.dir);
    console.log(this.right);
    console.log(vec3.length(this.dir));
    console.log(vec3.length(this.right));
};
Camera.prototype.rotateDown = function (angle)
{
    this.rotateUp(-angle);
};
Camera.prototype.viewMatrix = function ()
{

    return mat4.lookAt(mat4.create(), this.pos, vec3.add(vec3.create(), this.pos, this.dir), this.up);
};
var cam = new Camera(vec3.fromValues(0, 0, 5));
cam = new Cam();
cam.speed = 2;
var keyW, keyA, keyS, keyD, keyR, keyF;

var lastTime = 0;

//var objectColor = vec3.fromValues(0.9,0.3,0.2);
//var backgroundColor = vec3.fromValues(0.5,0.6,0.7);
var objectColor = vec3.fromValues(0.3, 0.9, 0.2);
var backgroundColor = vec3.fromValues(0.5, 0.6, 0.7);
var lightDirection = vec3.fromValues(0.0, 0.5, 1.0);

function updateKeys()
{
    var currentTime = Date.now();
    var delta = currentTime - lastTime;
    lastTime = currentTime;
    delta = delta / 1000.;


    if (buildInterfaceShowing || showingHelpDialog)
    {
        keyW = false;
        keyA = false;
        keyS = false;
        keyD = false;
        keyR = false;
        keyF = false;
        return;
    }

    if (!keyW && !keyA && !keyS && !keyD && !keyR && !keyF)
        return;
    var forward = 0;
    var sideward = 0;
    var upward = 0;
    if (keyW)
        forward += 1;
    if (keyS)
        forward -= 1;
    if (keyA)
        sideward -= 1;
    if (keyD)
        sideward += 1;
    if (keyR)
        upward += 1;
    if (keyF)
        upward -= 1;

    forward *= delta;
    sideward *= delta;
    upward *= delta;

    cam.moveForward(forward);
    cam.panRight(sideward);
    cam.moveUp(upward);

    changed = true;



}
function keyCallback(e)
{
    var code = e.which;
    var ch = String.fromCharCode(code);


    console.log(code);
    console.log(ch);
    if (code === 87) { //w
//        camPos[2] -= step;
//        cam.moveForward(step);
    } else if (code === 83) { //down key
//        camPos[2] += step;
//        cam.moveBackward(step);

    } else if (code === 65)
    {
//        camPos[0] -= step;
//        cam.panLeft(step);
    }
    else if (code === 68)
    {
        camPos[0] += step;
//        cam.panRight(step);
    }
    else if (code === 82)
    {
//        camPos[1] += step;
//        cam.moveUp(step);
    }
    else if (code === 70)
    {
//        camPos[1] -= step;
//        cam.moveDown(step);
    }
    else if (code === 189 || code === 173)
    {
//        console.log(step);
//        step = step / 2;
    } else if (code === 187 || code === 171)
    {
//        console.log(step);
//        step = step * 2;
    } else if (code === 81)
    {
//        console.log("q");
//        quat.rotateY(Rq, quat.copy(quat.create(), Rq), 1.0 / (2 * Math.PI));
//        cam.rotateLeft(1.0 / (2 * Math.PI));
//        console.log(vec3.str(cam.dir));
//        console.log(vec3.str(cam.right));
//        cam.fromMouse(-1, 0);
    }
    else if (code === 69)
    {
//        quat.rotateY(Rq, quat.copy(quat.create(), Rq), -1.0 / (2 * Math.PI));
//        cam.rotateRight(1.0 / (2 * Math.PI));
//        cam.fromMouse(1, 0);
    } else if (code === 84)
    {
//        quat.rotateY(Rq, quat.copy(quat.create(), Rq), -1.0 / (2 * Math.PI));
//        cam.rotateUp(1.0 / (2 * Math.PI));
//        cam.fromMouse(0, -1);
    } else if (code === 71)
    {
//        quat.rotateY(Rq, quat.copy(quat.create(), Rq), -1.0 / (2 * Math.PI));
//        cam.rotateDown(1.0 / (2 * Math.PI));
//        cam.fromMouse(0, 1);
    }
    else if (code === 90)
    {
        cam = new Cam();
        cam.speed = 2;
    }

    changed = true;
}

function keydown(e)
{
    var code = e.which;
    var ch = String.fromCharCode(code);

    if (buildInterfaceShowing || showingHelpDialog)
    {
        return;
    }
    if (code === 87) { //w
        keyW = true;
    } else if (code === 83) { //down key
        keyS = true;

    } else if (code === 65)
    {
        keyA = true;
    }
    else if (code === 68)
    {
        keyD = true;
    }
    else if (code === 82)
    {
        keyR = true;
    }
    else if (code === 70)
    {
        keyF = true;
    }
    else if (code === 189 || code === 173)
    {
        console.log(step);
        cam.speed = cam.speed / 1.5;
        step = step / 1.5;
    } else if (code === 187 || code === 171)
    {
        console.log(step);
        step = step * 1.5;

        cam.speed = cam.speed * 2;
    }
    else if (code === 90)
    {

    }

}
function keyup(e)
{
    var code = e.which;
    var ch = String.fromCharCode(code);
    if (buildInterfaceShowing || showingHelpDialog)
    {
        return;
    }

    if (code === 87) { //w
        keyW = false;
    } else if (code === 83) { //down key
        keyS = false;

    } else if (code === 65)
    {
        keyA = false;
    }
    else if (code === 68)
    {
        keyD = false;
    }
    else if (code === 82)
    {
        keyR = false;
    }
    else if (code === 70)
    {
        keyF = false;
    }
    else if (code === 90)
    {
        // z key
        cam = new Cam();
        cam.speed = 2;
        changed = true;
    }
}
var canvas;

var mousePos = vec2.fromValues(0, 0);
var mouseActive = false;
function mousedown(e)
{
    mouseActive = true;
    var parentOffset = $(this).offset();
    //or $(this).offset(); if you really just want the current element's offset
    var relX = e.pageX - parentOffset.left;
    var relY = e.pageY - parentOffset.top;
    mousePos[0] = relX;
    mousePos[1] = relY;
}
function mouseup(e)
{
    mouseActive = false;
}

function mousemove(e)
{
    if (!mouseActive)
        return;
    var parentOffset = $(this).offset();
    //or $(this).offset(); if you really just want the current element's offset
    var relX = e.pageX - parentOffset.left;
    var relY = e.pageY - parentOffset.top;

    var pos = vec2.fromValues(relX, relY);
    var delta = vec2.sub(vec2.create(), pos, mousePos);

    cam.fromMouse(delta[0], delta[1]);

    mousePos = pos;
    changed = true;


}
function mouseleave(e)
{
    mousePos = vec2.fromValues(0, 0);
    mouseActive = false;
}
function start() {
    canvas = document.getElementById("glcanvas");
    $(window).keydown(keydown);
    $(window).keyup(keyup);
    $(canvas).mousedown(mousedown);
    $(canvas).mouseup(mouseup);
    $(canvas).mousemove(mousemove);
    $(canvas).mouseleave(mouseleave);
    lastTime = Date.now();
    window.setInterval(updateKeys, 10);

    gl = initWebGL(canvas);      // Initialize the GL context


    // Only continue if WebGL is available and working
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
        gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
    }

    initBuffer();
    initShaders();

//  gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
//    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, quadVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
//    
//     gl.drawArrays(gl.TRIANGLES, 0, quadVertexBuffer.numItems);
    drawTime = Date.now();
    draw();

}

