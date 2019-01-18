function Cam()
{
    this.up = vec3.fromValues(0, 1, 0);

    this.lookAt = vec3.fromValues(0, 0, -1);
    this.pos = vec3.fromValues(0, 0, 0);

    this.updateDir();
    this.aspect = 1.;
    this.far = 1000.;
    this.near = 0.01;
    this.fov = glMatrix.toRadian(60);
    this.sensitivity = glMatrix.toRadian(0.25);
    this.speed = 1.0;
}

Cam.prototype.setPosition = function (pos)
{
    this.pos = pos;
};

Cam.prototype.setLookAt = function (p)
{
    var delta = vec3.sub(vec3.create(), p, this.pos);
    vec3.normalize(delta, delta);
    vec3.add(this.lookAt, delta, this.pos);
};
Cam.prototype.updateDir = function ()
{
    this.dir = vec3.sub(vec3.create(), this.lookAt, this.pos);
    vec3.normalize(this.dir, this.dir);
};
Cam.prototype.fromMouse = function (dx, dy)
{
    if (dx === 0 && dy === 0)
        return;
    var delta = vec3.sub(vec3.create(), this.lookAt, this.pos);
    vec3.normalize(delta, delta);
    var cy = Math.PI * 0.5 - Math.acos(vec3.dot(this.up, delta));

    var anglex = -dx * this.sensitivity;
    var angley = -dy * this.sensitivity;

    var piht = Math.PI * 0.5 - 0.001;

   if (cy + angley > piht)
        angley = piht - cy;
    else if (cy + angley < -piht)
        angley = -piht - cy;

    var axis = vec3.cross(vec3.create(), delta, this.up);
    vec3.normalize(axis, axis);

    var yaxis = vec3.fromValues(axis[0], 0, axis[2]);
    vec3.normalize(yaxis, yaxis);
    var xaxis = vec3.fromValues(0, 1, 0);
    this.rotate(yaxis, angley);
    this.rotate(xaxis, anglex);

};
Cam.prototype.rotate = function (axis, angle)
{
    var rq = quat.setAxisAngle(quat.create(), axis, angle);
    var R = mat3.fromQuat(mat3.create(), rq);
    var delta = vec3.sub(vec3.create(), this.lookAt, this.pos);
    vec3.normalize(delta, delta);
    var mv = vec3.transformMat3(vec3.create(), delta, R);
    vec3.add(this.lookAt, this.pos, mv);

    this.updateDir();
};
Cam.prototype.panRight = function (d)
{
    var delta = vec3.sub(vec3.create(), this.lookAt, this.pos);
    var r = vec3.cross(vec3.create(), delta, this.up);
    vec3.normalize(r, r);
    vec3.scaleAndAdd(this.pos, this.pos, r, d * this.speed);
    vec3.scaleAndAdd(this.lookAt, this.lookAt, r, d * this.speed);

};

Cam.prototype.panLeft = function (d)
{
    this.panRight(-d);
};

Cam.prototype.moveForward = function (d)
{
    var delta = vec3.sub(vec3.create(), this.lookAt, this.pos);
    vec3.normalize(delta, delta);
    vec3.scaleAndAdd(this.pos, this.pos, delta, d * this.speed);
    vec3.scaleAndAdd(this.lookAt, this.lookAt, delta, d * this.speed);
};

Cam.prototype.moveBackward = function (d)
{
    this.moveForward(-d);
};

Cam.prototype.moveUp = function (d)
{
    vec3.scaleAndAdd(this.pos, this.pos, this.up, d * this.speed);
    vec3.scaleAndAdd(this.lookAt, this.lookAt, this.up, d * this.speed);
};

Cam.prototype.moveDown = function (d)
{
    this.moveUp(-d);
};

Cam.prototype.view = function ()
{

    var V = mat4.lookAt(mat4.create(), this.pos, this.lookAt, this.up);

    return V;
};

Cam.prototype.projection = function ()
{
    var P = mat4.perspective(mat4.create(), this.fov, this.aspect, this.near, this.far);
    return P;
};