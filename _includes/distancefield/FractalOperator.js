

var id = (
        function ()
        {
            var i = 0;
            return function () {
                return i++;
            };
        })();

function addDecimalPoints(s)
{
    var numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    var inNumber = false;
    var foundDecimal = false;
    var r = "";
    for (var i = 0; i < s.length; i++)
    {
        var c = s[i];

        var isNum = numbers.indexOf(c) >= 0;


        // Finished number -> started next part
        if (!isNum && inNumber && foundDecimal)
        {
            inNumber = false;
            foundDecimal = false;
        } else if (!isNum && inNumber)
        {

            if (c !== ".")
            {
                r += ".";

                inNumber = false;
            }
            else
            {
                foundDecimal = true;
            }

        } else if (isNum)
        {
            inNumber = true;
        }

        r += c;
    }
    if (inNumber && !foundDecimal)
    {
        r += ".";
    }

    return r;
}
;
function Parameter(name, type, defaultValue, description)
{
    this.name = name;
    this.type = type;
    this.defaultValue = defaultValue;
    this.description = description;
}

function Documentation()
{
    this.description = "";
    this.name = "";
    this.params = [];
    this.paramNames = {};
}

Documentation.prototype.getParam = function (name)
{
    return this.paramNames[name];
};
Documentation.prototype.addParameter = function (param)
{
    var old = this.paramNames[param.name];
    this.params.push(param);
    this.paramNames[param.name] = param;
    return old;
};

function DistanceFieldObject() {
}

DistanceFieldObject.prototype.auxName = function ()
{
    return this.name();
};
DistanceFieldObject.prototype.arity = function ()
{
    return this.arity;
};
DistanceFieldObject.prototype.getPrototypes = function ()
{
    return [];
};
DistanceFieldObject.getDoc = function ()
{
    return new Documentation();
};
function DistanceOperator() {
}
DistanceOperator.prototype = new DistanceFieldObject();

function DistanceEstimator() {
}
DistanceEstimator.prototype = new DistanceFieldObject();

function DomainOperator() {
}
DomainOperator.prototype = new DistanceFieldObject();

function DistanceDeformation() {
}
DistanceDeformation.prototype = new DistanceFieldObject();

function DomainDeformation() {
}
DomainDeformation.prototype = new DistanceFieldObject();


function opIntersection(primitive1, primitive2)
{
    this.p1 = primitive1;
    this.p2 = primitive2;

    this.children = [primitive1, primitive2];

    this.arity = 2;
}

opIntersection.arity = 2;
opIntersection.prototype = new DistanceOperator();
opIntersection.prototype.toExpression = function (variable)
{
    return "max(" + this.p1.toExpression(variable) + "," + this.p2.toExpression(variable) + ")";
};
opIntersection.prototype.name = function ()
{
    return "opIntersection";
};
function opUnion(primitive1, primitive2)
{
    this.p1 = primitive1;
    this.p2 = primitive2;
    this.children = [primitive1, primitive2];
    this.arity = 2;

}
opUnion.arity = 2;
opUnion.prototype = new DistanceOperator();
opUnion.prototype.toExpression = function (variable)
{
    return "min(" + this.p1.toExpression(variable) + "," + this.p2.toExpression(variable) + ")";
};

opUnion.prototype.name = function ()
{
    return "opUnion";
};

function opSubtraction(primitive1, primitive2)
{
    this.p1 = primitive1;
    this.p2 = primitive2;
    this.children = [primitive1, primitive2];
    this.arity = 2;

}
opSubtraction.arity = 2;
opSubtraction.prototype = new DistanceOperator();

opSubtraction.prototype.toExpression = function (variable)
{
    return "max(-" + this.p1.toExpression(variable) + "," + this.p2.toExpression(variable) + ")";
};

opSubtraction.prototype.name = function ()
{
    return "opSubtraction";
};

function opSmoothUnion(primitive1, primitive2, k)
{
    this.p1 = primitive1;
    this.p2 = primitive2;
    this.k = k ? k : 0.1;
    this.children = [primitive1, primitive2];
    this.arity = 2;

}
opSmoothUnion.arity = 2;
opSmoothUnion.prototype = new DistanceOperator();

opSmoothUnion.prototype.toExpression = function (variable)
{
    return "osm_smooth_min(" + this.p1.toExpression(variable)
            + "," + this.p2.toExpression(variable) + "," + this.k.toFixed(6) + ")";
};
opSmoothUnion.prototype.getAux = function ()
{
    var s = "";
    s += "float osm_smooth_min(float a, float b, float k)    \n";
    s += "{                                                  \n";
    s += "	 float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 ); \n";
    s += "	 return mix( b, a, h ) - k*h*(1.0-h);          \n";
    s += "}\n";
    return s;
};
opSmoothUnion.prototype.getPrototypes = function ()
{
    return ["float osm_smooth_min(float a, float b, float k);"];
};

opSmoothUnion.prototype.name = function ()
{
    return "opSmoothUnion";
};

function opTwist(primitive, factor)
{
    this.p1 = primitive;
    this.factor = factor ? factor : 1.0;

    this.lip = Math.sqrt(4 + Math.pow(Math.PI / this.factor, 2));
    this.children = [primitive];
    this.arity = 2;
}
opTwist.arity = 2;
opTwist.prototype = new DomainDeformation();
opTwist.prototype.toExpression = function (variable)
{
    return "0.1*" + this.p1.toExpression("op_twist(" + variable + ")*10.0");
};
opTwist.prototype.getAux = function ()
{
    var s = "";
    s += "vec3 op_twist(vec3 p)    \n";
    s += "{                                                  \n";
    s += "float c =cos(p.y*" + this.factor.toFixed(6) + ");       \n";
    s += "float s = sin(p.y*" + this.factor.toFixed(6) + ");   \n";
    s += "mat2  m = mat2(c,s,-s,c);  \n";
    s += "vec2  pp = m*p.xz;  \n";
    s += "vec3  q = vec3(pp.x,p.y,pp.y);\n";
    s += "return q;\n";
    s += "}\n";
    return s;
};
opTwist.prototype.name = function ()
{
    return "opTwist";
};
opTwist.prototype.getPrototypes = function ()
{
    return ["vec3 op_twist(vec3 p);"];
};


function opScale(primitive, fx, fy, fz)
{
    this.p1 = primitive;
    fx = "" + fx;
    fy = "" + fy;
    fz = "" + fz;
    this.fx = sfl.simplify(sfl.fromString(fx));
    this.timeDependant = sfl.isFunctionOf(this.fx, "t");

    this.fy = sfl.simplify(sfl.fromString(fy));
    this.timeDependant = sfl.isFunctionOf(this.fy, "t") | this.timeDependant;

    this.fz = sfl.simplify(sfl.fromString(fz));
    this.timeDependant = sfl.isFunctionOf(this.fz, "t") | this.timeDependant;

    this.children = [primitive];
    this.arity = 2;
    this.id = id();
}
opScale.arity = 2;

opScale.prototype = new DomainOperator();
opScale.prototype.toExpression = function (variable)
{
//    return this.p1.toExpression("(" + variable + ")/vec3(" + this.fx.toFixed(6)
//            + "," + this.fy.toFixed(6) + "," + this.fz.toFixed(6) + ")") + "*" + this.min.toFixed(6);
    return "DEScalePoint" + this.id + "(" + variable + ")";
};

opScale.prototype.name = function ()
{
    return "opScale";
};
opScale.prototype.auxName = function ()
{
    return "opScale" + this.id;
};
opScale.prototype.getAux = function ()
{
    var s = "";
    s += "float DEScalePoint" + this.id + "(vec3 p)\n";
    s += "{\n";
    s += "float x = p.x;\n";
    s += "float y = p.y;\n";
    s += "float z = p.z;\n";
    if (this.timeDependant)
        s += "float t = time;\n";

    s += "float fx = " + addDecimalPoints(this.fx.toString()) + ";\n";
    s += "float fy = " + addDecimalPoints(this.fy.toString()) + ";\n";
    s += "float fz = " + addDecimalPoints(this.fz.toString()) + ";\n";
    s += "float minimumf = min(min(fx,fy),fz);\n";
    s += "return " + this.p1.toExpression("p/vec3(fx,fy,fz)") + "*minimumf;\n";
    s += "}\n";
    return s;
};
opScale.prototype.getPrototypes = function ()
{
    return ["float DEScalePoint" + this.id + "(vec3 p);"];
};



function opMirror(primitive, nx,ny,nz,d)
{
    this.p1 = primitive;
   
    this.n = vec3.fromValues(nx,ny,nz);
    var length = vec3.length(this.n);
    vec3.normalize(this.n,this.n);
    this.d = d/length;
    
    this.children = [primitive];
    this.arity = 5;
    this.id = id();
}
opMirror.arity = 5;

opMirror.prototype = new DomainOperator();
opMirror.prototype.toExpression = function (variable)
{
//    return this.p1.toExpression("(" + variable + ")/vec3(" + this.fx.toFixed(6)
//            + "," + this.fy.toFixed(6) + "," + this.fz.toFixed(6) + ")") + "*" + this.min.toFixed(6);
    return "DEMirrorPoint" + this.id + "(" + variable + ")";
};

opMirror.prototype.name = function ()
{
    return "opMirror";
};
opMirror.prototype.auxName = function ()
{
    return "opMirror" + this.id ;
};
opMirror.prototype.getAux = function ()
{
    var s = "";
    s += "float DEMirrorPoint" + this.id  + "(vec3 p)\n";
    s += "{\n";
    s += " vec3 n = vec3("+addDecimalPoints(this.n[0] + "")+
            ","+addDecimalPoints(this.n[1] + "")+
            ","+addDecimalPoints(this.n[2] + "")+" );\n";
    s += "float d = dot(n,p) + (" + addDecimalPoints(this.d +"")+ ");\n";
    s += "vec3 p2 = p - 2.*d*n;\n";
    s += "float de = " + this.p1.toExpression("p") + ";\n";
    s += "float de2 = " + this.p1.toExpression("p2") + ";\n";
//    s += "return max(de,de - 2.*d);\n";
    s += "return min(de,de2);\n";
    s += "}\n";
    return s;
};
opMirror.prototype.getPrototypes = function ()
{
    return ["float DEMirrorPoint" + this.id  + "(vec3 p);"];
};










function opTranslate(primitive, fx, fy, fz)
{
    this.p1 = primitive;
    fx = fx + "";
    fy = fy + "";
    fz = fz + "";
    this.fx = sfl.simplify(sfl.fromString(fx));
    this.timeDependant = sfl.isFunctionOf(this.fx, "t");

    this.fy = sfl.simplify(sfl.fromString(fy));
    this.timeDependant = sfl.isFunctionOf(this.fy, "t") | this.timeDependant;

    this.fz = sfl.simplify(sfl.fromString(fz));
    this.timeDependant = sfl.isFunctionOf(this.fz, "t") | this.timeDependant;


    this.children = [primitive];
    this.arity = 4;
    this.id = id();
}
opTranslate.arity = 4;

opTranslate.prototype = new DomainOperator();
opTranslate.prototype.toExpression = function (variable)
{
    return this.p1.toExpression(variable + "- opTranslatePoint" + this.id + "(" + variable + ")");
};
opTranslate.prototype.auxName = function ()
{
    return "opTranslate" + this.id;
};

opTranslate.prototype.getAux = function ()
{
    var s = "";

    s += "vec3 opTranslatePoint" + this.id + "(vec3 p)\n";
    s += "{\n";
    s += "float x = p.x;\n";
    s += "float y = p.y;\n";
    s += "float z = p.z;\n";
    if (this.timeDependant)
        s += "float t = time;\n";
    s += "return vec3(" + addDecimalPoints(this.fx.toString()) + ",\n"
            + addDecimalPoints(this.fy.toString()) + ",\n"
            + addDecimalPoints(this.fz.toString()) + ");\n";
    s += "}\n";
    return s;
};
opTranslate.prototype.getPrototypes = function ()
{
    return ["vec3 opTranslatePoint" + this.id + "(vec3 p);"];
};

opTranslate.prototype.name = function ()
{
    return "opTranslate";
};




function opRotate(primitive, rx, ry, rz, angle)
{
    this.p1 = primitive;
    this.rx = rx !== undefined ? rx : 0.0;
    this.ry = ry !== undefined ? ry : 0.0;
    this.rz = rz !== undefined ? rz : 0.0;
    this.angle = sfl.simplify(sfl.fromString(angle));

    this.timeDependant = sfl.isFunctionOf(this.angle, "t");
    this.axis = vec3.normalize(vec3.create(), vec3.fromValues(this.rx, this.ry, this.rz));
    this.children = [primitive];
    this.arity = 5;
    this.id = id();

}
opRotate.arity = 4;

opRotate.prototype = new DomainOperator();

opRotate.prototype.getAux = function ()
{

    var s = "";
    s += "vec3 opRotatePoint" + this.id + "(vec3 p)\n";
    s += "{\n";

    if (this.timeDependant)
        s += "float t = time;\n";
    s += "float angle = " + addDecimalPoints(this.angle.toString()) + ";\n";
    s += "float c = cos(angle);\n";
    s += "float s = sin(angle);\n";
    s += "float cinv = 1.-c;\n";
    s += "float x =" + this.axis[0].toFixed(6) + ";\n";
    s += "float y =" + this.axis[1].toFixed(6) + ";\n";
    s += "float z =" + this.axis[2].toFixed(6) + ";\n";

    // Transposed (inverted)
//    s+= "mat3 R = mat3(vec3(t*x*x+c,t*x*y +z*s,t*x*z-y*s),\n\
//                vec3(t*x*y -z*s,t*y*y +c,t*y*z+x*s),\n\
//                vec3(t*x*z+y*s,t*y*z - x*s,t*z*z +c));\n";

    s += "mat3 R = mat3(vec3(cinv*x*x+c,cinv*x*y -z*s,cinv*x*z+y*s),\n\
                vec3(cinv*x*y +z*s,cinv*y*y +c,cinv*y*z - x*s),\n\
                vec3(cinv*x*z-y*s,cinv*y*z+x*s,cinv*z*z +c));\n";
    s += "return R*p;\n";
    s += "}\n";

    return s;
};
opRotate.prototype.getPrototypes = function ()
{
    return ["vec3 opRotatePoint" + this.id + "(vec3 p);"];
};

opRotate.prototype.toExpression = function (variable)
{
    return this.p1.toExpression("opRotatePoint" + this.id + "(" + variable + ")");
};

opRotate.prototype.name = function ()
{
    return "opRotate";
};
opRotate.prototype.auxName = function ()
{
    return this.name() + this.id;
};


function Sphere(radius)
{
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.r = radius;
    this.arity = 2;

}
Sphere.arity = 2;
Sphere.prototype = new DistanceEstimator();

Sphere.prototype.getAux = function ()
{
    var s = "";
    s += "float DE_Sphere(vec3 p,vec3 origin,float r)\n";
    s += "{\n";
    s += "return length(p-origin)-r;\n";
    s += "}\n";

    return s;
};
Sphere.prototype.toExpression = function (variable)
{
    return "DE_Sphere(" + variable + ",vec3(" + this.x.toFixed(6) + "," + this.y.toFixed(6) + "," + this.z.toFixed(6) + ")," + this.r.toFixed(6) + ")";
};

Sphere.prototype.name = function ()
{
    return "Sphere";
};
Sphere.prototype.getPrototypes = function ()
{
    return ["float DE_Sphere(vec3 p,vec3 origin,float r);"];
};


function InfiniteField()
{
    this.arity = 0;

}
InfiniteField.arity = 0;
InfiniteField.prototype = new DistanceEstimator();


InfiniteField.prototype.toExpression = function (variable)
{
    return "100000.0";
};

InfiniteField.prototype.name = function ()
{
    return "InfiniteField";
};


function Box(w, h, d)
{
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = w !== undefined ? w : 1;
    this.h = h !== undefined ? h : 1;
    this.d = d !== undefined ? d : 1;
    this.arity = 3;

}
Box.arity = 3;
Box.prototype = new DistanceEstimator();

Box.prototype.getAux = function ()
{
    var s = "";
    s += "float DE_Box(vec3 p,vec3 o,vec3 b)\n";
    s += "{\n";
    s += " vec3 d = abs(p-o) - b;\n";
    s += "return min(max(d.x,max(d.y,d.z)),0.0) +length(max(d,0.0));\n";
    s += "}\n";

    return s;
};
Box.prototype.getPrototypes = function ()
{
    return ["float DE_Box(vec3 p,vec3 o,vec3 b);"];
};
Box.prototype.toExpression = function (variable)
{
    return "DE_Box(" + variable + ",vec3(" + this.x.toFixed(6) + "," + this.y.toFixed(6) + "," + this.z.toFixed(6) + "),"
            + "vec3(" + this.w.toFixed(6) + "," + this.h.toFixed(6) + "," + this.d.toFixed(6) + "))";
};

Box.prototype.name = function ()
{
    return "Box";
};


function CappedCylinder(r, h)
{

    this.r = r !== undefined ? r : 1;
    this.h = h !== undefined ? h : 1;
    this.arity = 2;

}
CappedCylinder.arity = 2;
CappedCylinder.prototype = new DistanceEstimator();

CappedCylinder.prototype.getAux = function ()
{
    var s = "";
    s += "float DE_CappedCylinder(vec3 p,vec2 h)\n";
    s += "{\n";
    s += "  vec2 d = abs(vec2(length(p.xz),p.y)) - h;\n";
    s += "return min(max(d.x,d.y),0.0) + length(max(d,0.0));\n";
    s += "}\n";

    return s;
};
CappedCylinder.prototype.getPrototypes = function ()
{
    return ["float DE_CappedCylinder(vec3 p,vec2 h);"];
};
CappedCylinder.prototype.toExpression = function (variable)
{
    return "DE_CappedCylinder(" + variable + ",vec2(" + this.r.toFixed(6) + "," + this.h.toFixed(6) + "))";
};

CappedCylinder.prototype.name = function ()
{
    return "CappedCylinder";
};

function MengerSponge(iterations)
{
    this.iterations = iterations ? iterations : 8;
    this.arity = 1;
}
MengerSponge.arity = 1;
MengerSponge.prototype = new DistanceEstimator();

MengerSponge.prototype.getAux = function ()
{

    var s = "";
    s += "float DE_Sponge(vec3 p)\n";
    s += "{\n";
    s += "const int iters=" + this.iterations + ";\n";
    s += "float t;\n";
    s += "for(int n=0;n<iters;n++){\n";
    s += "p = abs(p);\n";
    s += "if(p.x<p.y)p.xy = p.yx;\n";
    s += "if(p.y<p.z)p.yz = p.zy;\n";
    s += "if(p.x<p.y)p.xy = p.yx;\n";
    s += "p= p*3.0 - 2.0;\n";
    s += "if(p.z<-1.0)p.z+=2.0;\n";
    s += "}\n";
    s += "return (length(p)-1.5)*pow(3.0,-float(iters));\n";
    s += "}\n";

    return s;
};
MengerSponge.prototype.getPrototypes = function ()
{
    return ["float DE_Sponge(vec3 p);"];
};
MengerSponge.prototype.toExpression = function (variable)
{
    return "DE_Sponge(" + variable + ")";
};

MengerSponge.prototype.name = function ()
{
    return "MengerSponge";
};

function Plane(nx, ny, nz, d)
{

    this.nx = nx;
    this.ny = ny;
    this.nz = nz;
    this.d = d;
    this.arity = 4;

}
Plane.arity = 4;
Plane.prototype = new DistanceEstimator();
Plane.prototype.toExpression = function (variable)
{
    return "dot(" + variable + ",vec3(" + this.nx.toFixed(6)
            + "," + this.ny.toFixed(6) + "," + this.nz.toFixed(6) + ")) + " + this.d.toFixed(6);
};

Plane.prototype.name = function ()
{
    return "Plane";
};


function Torus(t1, t2)
{
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.tOut = t2 ? t2 : 2;
    this.tIn = t1 ? t1 : 1;

    this.arity = 2;
}
Torus.arity = 2;
Torus.prototype = new DistanceEstimator();
Torus.prototype.getAux = function ()
{

    s = "";
    s += "float DE_Torus(vec3 p,vec3 o,vec2 t)\n";
    s += "{\n";
    s += "p = p - o;\n";
    s += " vec2 q =  vec2(length(p.xz)-t.x,p.y);\n";
    s += "  return length(q)-t.y;\n";
    s += "}\n";
    return s;
};
Torus.prototype.getPrototypes = function ()
{
    return ["float DE_Torus(vec3 p,vec3 o,vec2 t);"];
};
Torus.prototype.toExpression = function (variable)
{
    var s = "DE_Torus(";
    s += variable + ",";
    s += "vec3(" + this.x.toFixed(6) + "," + this.y.toFixed(6) + "," + this.z.toFixed(6) + "),";
    s += "vec2(" + this.tOut.toFixed(6) + "," + this.tIn.toFixed(6) + "))";
    return s;
//    return "DE_Torus(" + variable + ",vec3("+this.x.toFixed(6) , ","+this.y.toFixed(6),+","+this.z.toFixed(6)
//            +"),vec2(" + this.tOut.toFixed(6) + "," + this.tIn.toFixed(6) + "))";
};
Torus.prototype.name = function ()
{
    return "Torus";
};



function Mandelbulb(power, iterations)
{
    this.bailout = 4;
    this.iterations = iterations !== undefined ? iterations : 20;
    this.power = power !== undefined ? power : 7;
    this.arity = 2;
}
Mandelbulb.arity = 2;
Mandelbulb.prototype = new DistanceEstimator();
Mandelbulb.prototype.toExpression = function (variable)
{
    return "DE_Mandelbulb(" + variable + ")";
};
Mandelbulb.prototype.getPrototypes = function ()
{
    return ["float DE_Mandelbulb(vec3 pos);"];
};
Mandelbulb.prototype.name = function ()
{
    return "Mandelbulb";
};

Mandelbulb.prototype.getAux = function ()
{
    s = "";
    s += "float DE_Mandelbulb(vec3 pos) {                                                       \n";
    s += "	vec3 z = pos;                                                                     \n";
    s += "	float dr = 1.0;                                                                   \n";
    s += "	float r = 0.0;                                                                    \n";
    s += " const int Iterations =" + this.iterations + ";\n";
    s += " const float Bailout =" + this.bailout.toFixed(8) + ";\n";
    s += " const float Power =" + this.power.toFixed(8) + ";\n";
    s += "	for (int i = 0; i < Iterations ; i++) {                                           \n";
    s += "		r = length(z);                                                                \n";
    s += "		if (r>Bailout) break;                                                         \n";
    s += "		                                                                              \n";
    s += "		// convert to polar coordinates                                               \n";
    s += "		float theta = acos(z.z/r);                                                    \n";
    s += "		float phi = atan(z.y,z.x);                                                    \n";
    s += "		dr =  pow( r, Power-1.0)*Power*dr + 1.0;                                      \n";
    s += "		                                                                              \n";
    s += "		// scale and rotate the point                                                 \n";
    s += "		float zr = pow( r,Power);                                                     \n";
    s += "		theta = theta*Power;                                                          \n";
    s += "		phi = phi*Power;                                                              \n";
    s += "		                                                                              \n";
    s += "		// convert back to cartesian coordinates                                      \n";
    s += "		z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));            \n";
    s += "		z+=pos;                                                                       \n";
    s += "	}                                                                                 \n";
    s += "	return 0.5*log(r)*r/dr;                                                           \n";
    s += "}                                                                                     \n";
    return s;
};




function Sierpinski(iterations)
{
    this.bailout = 4;
    this.iterations = iterations !== undefined ? iterations : 10;
    this.arity = 2;
}
Sierpinski.arity = 2;
Sierpinski.prototype = new DistanceEstimator();
Sierpinski.prototype.toExpression = function (variable)
{
    return "DE_Sierpinski(" + variable + ")";
};

Sierpinski.prototype.name = function ()
{
    return "Sierpinski";
};

Sierpinski.prototype.getAux = function ()
{
    s = "";
    s += "//scale=2                                                                                                                                                 \n";
    s += "//bailout=1000                                                                                                                                            \n";
    s += "float DE_Sierpinski(vec3 p){                                                                                                                                      \n";
    s += "	                                                                                                                                                      \n";
    s += "	const float bailout = 10.0;                                                                                                                         \n";
    s += "	const int iterations = " + Math.floor(this.iterations) + ";                                                                                                                            \n";
    s += "	const float scale = 2.0;                                                                                                                              \n";
    s += "	int n = 0;                                                                                                                                            \n";
    s += "	float r=dot(p,p);                                                                                                                                     \n";
    s += "	for(int i=0;i<iterations;i++){                                                                                                                        \n";
    s += "		if(r > bailout)                                                                                                                                   \n";
    s += "			break;                                                                                                                                        \n";
    s += "		//Folding... These are some of the symmetry planes of the tetrahedron                                                                             \n";
    s += "		if(p.x+p.y<0.0)                                                                                                                                         \n";
    s += "		{                                                                                                                                                 \n";
    s += "			p.xy = -p.yx;                                                                                                                                 \n";
    s += "			//x1=-y;y=-x;x=x1;                                                                                                                            \n";
    s += "		}                                                                                                                                                 \n";
    s += "		if(p.x+p.z<0.0)                                                                                                                                         \n";
    s += "		{                                                                                                                                                 \n";
    s += "			p.xz = -p.zx;                                                                                                                                 \n";
    s += "			//x1=-z;z=-x;x=x1;                                                                                                                            \n";
    s += "		}                                                                                                                                                 \n";
    s += "		if(p.y+p.z<0.0)                                                                                                                                         \n";
    s += "		{                                                                                                                                                 \n";
    s += "			p.yz = -p.zy;                                                                                                                                 \n";
    s += "			//y1=-z;z=-y;y=y1;                                                                                                                            \n";
    s += "		}                                                                                                                                                 \n";
    s += "                                                                                                                                                          \n";
    s += "		p = scale*p - (scale-1.0);                                                                                                                        \n";
    s += "		//x=scale*x-(scale-1);//equivalent to: x=scale*(x-cx); where cx=(scale-1)/scale;                                                                  \n";
    s += "		//y=scale*y-(scale-1);                                                                                                                            \n";
    s += "		//z=scale*z-(scale-1);                                                                                                                            \n";
    s += "		r=dot(p,p);                                                                                                                                       \n";
    s += "		n++;                                                                                                                                              \n";
    s += "	                                                                                                                                                      \n";
    s += "	                                                                                                                                                      \n";
    s += "	}                                                                                                                                                     \n";
    s += "	return (sqrt(r)-2.0)*pow(scale,float(-n));//the estimated distance                                                                                    \n";
    s += "}                                                                                                                                                         \n";
    return s;
};
Sierpinski.prototype.getPrototypes = function ()
{
    return ["float DE_Sierpinski(vec3 p);"];
};



function opRepitition(primitive, cx, cy, cz)
{

    cx = "" + cx;
    cy = "" + cy;
    cz = "" + cz;
    this.cx = sfl.simplify(sfl.fromString(cx));
    this.timeDependant = sfl.isFunctionOf(this.cx, "t");

    this.cy = sfl.simplify(sfl.fromString(cy));
    this.timeDependant = sfl.isFunctionOf(this.cy, "t") | this.timeDependant;

    this.cz = sfl.simplify(sfl.fromString(cz));
    this.timeDependant = sfl.isFunctionOf(this.cz, "t") | this.timeDependant;

    this.p1 = primitive;
    this.children = [primitive];
    this.arity = 4;
    this.id = id();
}
opRepitition.arity = 4;
opRepitition.prototype = new DomainOperator();

opRepitition.prototype.toExpression = function (variable)
{


    return this.p1.toExpression("opRepititionTransform" + this.id + "(" +
            variable + ")");
};
opRepitition.prototype.auxName = function ()
{
    return "opRepitition" + this.id;
};
opRepitition.prototype.getAux = function ()
{
    var s = "";
    s += "vec3 opRepititionTransform" + this.id + "(vec3 p)\n";
    s += "{\n";
    if (this.timeDependant)
        s += "float t = time;\n";
    s += "vec3 c = vec3(" + addDecimalPoints(this.cx.toString()) + ",\n";
    s += "\t " + addDecimalPoints(this.cy.toString()) + ",\n";
    s += "\t " + addDecimalPoints(this.cz.toString()) + ");\n";

    s += "return p - c*floor(p/c)-0.5*c;\n";
    s += "}\n";
    return s;
};
opRepitition.prototype.getPrototypes = function ()
{
    return ["vec3 opRepititionTransform" + this.id + "(vec3 p);"];
};

opRepitition.prototype.name = function ()
{
    return "opRepitition";
};

function opPlaneRepitition(primitive, plane, c1, c2)
{
    c1 = "" + c1;
    c2 = "" + c2;
    this.c1 = sfl.simplify(sfl.fromString(c1));
    this.timeDependant = sfl.isFunctionOf(this.c1, "t");

    this.c2 = sfl.simplify(sfl.fromString(c2));
    this.timeDependant = sfl.isFunctionOf(this.c2, "t") | this.timeDependant;


    this.plane = plane ? plane : "xz";
    this.p1 = primitive;
    this.children = [primitive];
    this.arity = 4;
    this.id = id();
}
opPlaneRepitition.arity = 4;
opPlaneRepitition.prototype = new DomainOperator();

opPlaneRepitition.prototype.toExpression = function (variable)
{


    return this.p1.toExpression("opPlaneRepititionT" + this.id + "(" +
            variable + ")");
    
};

opPlaneRepitition.prototype.getAux = function ()
{
    var s = "";
    s += "vec3 opPlaneRepititionT" + this.id + "(vec3 p)\n";
    s += "{\n";
    if (this.timeDependant)
        s += "float t = time;\n";
    
    s += "vec2 c = vec2(" + addDecimalPoints(this.c1.toString()) + "," + addDecimalPoints(this.c2.toString()) + ");\n";
    s += "vec2 rep = p." + this.plane + " -c*floor(p." + this.plane + "/c)-0.5*c;\n";
    s += "p." + this.plane + " = rep;\n";
    s += "return p;\n";
    s += "}\n";
    return s;
};
opPlaneRepitition.prototype.getPrototypes = function ()
{
    return ["vec3 opPlaneRepititionT" + this.id + "(vec3 p);"];
};
opPlaneRepitition.prototype.name = function ()
{
    return "opPlaneRepitition";
};
opPlaneRepitition.prototype.auxName = function ()
{
    return "opPlaneRepitition" + this.id;
};

function opInvert(primitive)
{
    this.p1 = primitive;
    this.children = [primitive];
    this.arity = 1;
}
opInvert.arity = 1;
opInvert.prototype = new DomainOperator();

opInvert.prototype.toExpression = function (variable)
{


    return "-" + this.p1.toExpression(variable);
};

opInvert.prototype.name = function ()
{
    return "opInvert";
};

function opFlip(primitive, axes)
{
    this.p1 = primitive;
    this.children = [primitive];
    this.a = axes ? axes : "xyz";
    this.arity = 2;
}
opFlip.arity = 2;
opFlip.prototype = new DomainOperator();

opFlip.prototype.toExpression = function (variable)
{


    return this.p1.toExpression(variable + "." + this.a);
};

opFlip.prototype.name = function ()
{
    return "opFlip";
};


function createOpCombineFunc(op)
{

}
function opCombineFunction(op)
{
    this.children = [];
    this.arity = 0;

    var aux = {};
    var stack = [];
    stack.push(op);
    var timeDependant = false;
    var prototypes = {};
    while (stack.length > 0)
    {
        var x = stack.pop();
        timeDependant = timeDependant | x.timeDependant ? true : false;
        var pt = x.getPrototypes();
        for (var i in pt)
        {
            prototypes[pt[i]] = true;
        }
        if (x.getAux)
        {
            aux[x.auxName()] = x.getAux();
        }
        if (x.children)
        {
            for (var i = 0; i < x.children.length; i++)
            {
                stack.push(x.children[i]);
            }
        }
    }

    this.aux = aux;
    this.op = op;
    this.prototypes = prototypes;
    this.id = id();
    this.timeDependant = timeDependant;

}
opCombineFunction.arity = 0;
opCombineFunction.prototype = new DistanceEstimator();
opCombineFunction.prototype.toExpression = function (variable)
{
    return this.op.toExpression(variable);
};

opCombineFunction.prototype.getPrototypes = function ()
{
    var result = [];
    for (var i in this.prototypes)
    {
        result.push(i);
    }

    return result;
};
opCombineFunction.prototype.name = function ()
{
    return "Combinator";
};
opCombineFunction.prototype.auxName = function ()
{
    return "Combinator" + this.id;
};

opCombineFunction.prototype.getAux = function ()
{
//    var result = ""; 
//  for(var i in this.aux)
//  {
//      result += this.aux[i] + "\n";
//  }
//  
//  return result;
    return this.aux;
};
function generateCode(op, variable)
{
    var aux = {};
    var stack = [];
    variable = variable ? variable : "p";
    stack.push(op);
    var timeDependant = false;
    var prototypes = {};
    while (stack.length > 0)
    {
        var x = stack.pop();
        timeDependant = timeDependant | x.timeDependant ? true : false;
        var pt = x.getPrototypes();
        for (var i in pt)
        {
            prototypes[pt[i]] = true;
        }
        if (x.getAux)
        {
            var auxx = x.getAux();
            if ((typeof auxx) !== "string")
            {
                for (var i in auxx)
                {
                    aux[i] = auxx[i];
                }
            } else
            {

                aux[x.auxName()] = x.getAux();
            }
        }
        if (x.children)
        {
            for (var i = 0; i < x.children.length; i++)
            {
                stack.push(x.children[i]);
            }
        }
    }

    var s = "";
    for (var k in aux)
    {
        s += aux[k] + "\n";
    }

    s += "float DE(vec3 p)\n";
    s += "{\n";
    s += "return " + op.toExpression(variable) + ";\n";
    s += "}\n\n";

    var proto = "";
    for (var i in prototypes)
    {
        proto += i + "\n";
    }

    return {code: s, proto: proto, timeDependant: timeDependant};

}




function Mandelbox(iterations,folding,minRadius,fixedRadius)
{
    this.bailout = 4;
    this.iterations = iterations? iterations: 12;
    this.folding = folding? folding:4;
    this.minRadius = minRadius? minRadius : 1;
    this.fixedRadius = fixedRadius? fixedRadius : 40;
    this.arity = 0;
}
Mandelbox.arity = 0;
Mandelbox.prototype = new DistanceEstimator();
Mandelbox.prototype.toExpression = function (variable)
{
    return "DE_Mandelbox(" + variable + ")";
};

Mandelbox.prototype.name = function ()
{
    return "Mandelbox";
};

Mandelbox.prototype.getAux = function ()
{
    s = "";
    s += "void sphereFold(inout vec3 z, inout float dz) {                            \n";
    s += "	float r2 = dot(z,z);                                                   \n";
    s += "      const float minRadius2 = " + this.minRadius.toFixed(6) + ";\n";
    s += "      const float fixedRadius2 = " + this.fixedRadius.toFixed(6) + ";\n";
    s += "	if (r2<minRadius2) {                                                   \n";
    s += "		// linear inner scaling                                            \n";
    s += "		float temp = (fixedRadius2/minRadius2);                            \n";
    s += "		z *= temp;                                                         \n";
    s += "		dz*= temp;                                                         \n";
    s += "	} else if (r2<fixedRadius2) {                                          \n";
    s += "		// this is the actual sphere inversion                             \n";
    s += "		float temp =(fixedRadius2/r2);                                     \n";
    s += "		z *= temp;                                                         \n";
    s += "		dz*= temp;                                                         \n";
    s += "	}                                                                      \n";
    s += "}                                                                          \n";
    s += "                                                                           \n";
    s += "void boxFold(inout vec3 z, inout float dz) {                               \n";
    s += "      const float foldingLimit =" + this.folding.toFixed(6) + ";\n";
    s += "	z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z;                   \n";
    s += "}                                                                          \n";
    s += "                                                                           \n";
    s += "float DE_Mandelbox(vec3 z)                                                 \n";
    s += "{                                                                          \n";
    s += "	vec3 offset = z;                                                       \n";
    s += "	float dr = 1.0;                                                        \n";
    s += "      const float Scale = -1.5;\n";
    s += "      const int Iterations = " + this.iterations + ";\n";
    s += "	for (int n = 0; n < Iterations; n++) {                                 \n";
    s += "		boxFold(z,dr);       // Reflect                                    \n";
    s += "		sphereFold(z,dr);    // Sphere Inversion                           \n";
    s += " 		                                                                   \n";
    s += "                z=Scale*z + offset;  // Scale & Translate                  \n";
    s += "                dr = dr*abs(Scale)+1.0;                                    \n";
    s += "	}                                                                      \n";
    s += "	float r = length(z);                                                   \n";
    s += "	return r/abs(dr);                                                      \n";
    s += "}                                                                                                                                                                                                                                    \n";
    return s;
};

Mandelbox.prototype.getPrototypes = function ()
{
    return ["void sphereFold(inout vec3 z, inout float dz);",
        "void boxFold(inout vec3 z, inout float dz);",
        "float DE_Mandelbox(vec3 z);"
    ];
};

function Quadric(a, b, c, d, e, f, g, h, i, j)
{
    this.parameters = [a, b, c, d, e, f, g, h, i, j];
    this.arity = 10;
}
Quadric.arity = 10;
Quadric.prototype = new DistanceEstimator();
Quadric.prototype.toExpression = function (variable)
{
    return "DE_Quadric(" + variable + ")";
};

Quadric.prototype.name = function ()
{
    return "Quadric";
};

Quadric.prototype.getAux = function ()
{

    var x = this.parameters;

    var a = x[0];
    var b = x[1];
    var c = x[2];
    var d = x[3];
    var e = x[4];
    var f = x[5];
    var g = x[6];
    var h = x[7];
    var i = x[8];
    var j = x[9];

    var s = "";
    s += "float DE_Quadric(vec3 p){                                                                                                                                      \n";
    s += "	                                                                                                                                                      \n";
    s += "float x = p.x;\n";
    s += "float y = p.y;\n";
    s += "float z = p.z;\n";
    // Value f(x)
    s += "float val = " + a + "*x*x+" + b + "*x*y+" + c + "*x*z+" + d + "*y*y+" + e + "*y*z+" + f + "*z*z+";
    s += g + "*x+" + h + "*y+" + i + "*z+" + j + ";\n";
    // Gradient
    s += "vec3 grad = vec3(" + a + "*2.*x+" + b + "*y+" + c + "*z+" + g + ",\n";
    s += "\t" + b + "*x+" + d + "*2.*y+" + e + "*z+" + h + ",\n";
    s += "\t" + c + "*x+" + e + "*y+" + f + "*2.*z+" + i + ");\n";
    s += "float gv = length(grad);\n";
    s += "float vv = abs(val);\n";
    s += "return vv/gv;\n";
    s += "}\n";

    return s;
};
Quadric.prototype.getPrototypes = function ()
{
    return ["float DE_Quadric(vec3 p);"];
};



function ImplicitSurface(surfaceFunc)
{
    this.sf = surfaceFunc;
    this.arity = 1;
    this.id = id();
    this.func = sfl.simplify(sfl.fromString(this.sf));

    this.timeDependant = sfl.isFunctionOf(this.func, "t");
}
ImplicitSurface.arity = 10;
ImplicitSurface.prototype = new DistanceEstimator();
ImplicitSurface.prototype.toExpression = function (variable)
{
    return "DE_ImplicitSurface" + this.id + "(" + variable + ")";
};

ImplicitSurface.prototype.name = function ()
{
    return "ImplicitSurface";
};
ImplicitSurface.prototype.auxName = function ()
{
    return "ImplicitSurface" + this.id;
};
ImplicitSurface.prototype.getAux = function ()
{


    var f = "implicitSurface" + this.id;
    this.sf = addDecimalPoints(this.sf);

    // Assume continous differentiability
    var func = this.func;
    var fx = sfl.simplify(func.derivePartial("x"));
    var fy = sfl.simplify(func.derivePartial("y"));
    var fz = sfl.simplify(func.derivePartial("z"));

    var fxx = sfl.simplify(fx.derivePartial("x"));
    var fxy = sfl.simplify(fx.derivePartial("y"));
    var fxz = sfl.simplify(fx.derivePartial("z"));

    var fyy = sfl.simplify(fy.derivePartial("y"));
    var fyz = sfl.simplify(fy.derivePartial("z"));
    var fzz = sfl.simplify(fz.derivePartial("z"));



    console.log("F:");
    console.log(func.toString());
    console.log("Fx:");
    console.log(sfl.simplify(fx).toString());
    console.log("Fy:");
    console.log(sfl.simplify(fy).toString());
    console.log("Fz:");
    console.log(sfl.simplify(fz).toString());
    console.log("Fxx:");
    console.log(fxx.toString());
    console.log("Fyy:");
    console.log(fyy.toString());
    console.log("Fzz:");
    console.log(fzz.toString());
    console.log("Fxy:");
    console.log(fxy.toString());
    console.log("Fxz:");
    console.log(fxz.toString());
    console.log("Fyz:");
    console.log(fyz.toString());

    var fg = f + "Gradient";
    var fh = f + "Hessian";
    var fe = f + "Eigen";
    var s = "";
    s += "float " + f + "(vec3 p)\n";
    s += "{\n";
    s += "float x = p.x;\n";
    s += "float y = p.y;\n";
    s += "float z = p.z;\n";

    s += "float t = time;\n";
    s += "return " + addDecimalPoints(func.toString()) + ";\n";
    s += "}\n";

    var h = "mat3 " + fh + "(vec3 p)\n";
    h += "{\n";
    h += "float x = p.x;\n";
    h += "float y = p.y;\n";
    h += "float z = p.z;\n";
    h += "float t = time;\n";
    h += "float xx = " + addDecimalPoints(fxx.toString()) + ";";
    h += "float yy = " + addDecimalPoints(fyy.toString()) + ";";
    h += "float zz = " + addDecimalPoints(fzz.toString()) + ";";
    h += "float xy = " + addDecimalPoints(fxy.toString()) + ";";
    h += "float xz = " + addDecimalPoints(fxz.toString()) + ";";
    h += "float yz = " + addDecimalPoints(fyz.toString()) + ";";


    // Numerical hessian

//    h += "vec3 h = vec3(0.01,0.0,0.0);\n";
//    h += "float xx = -" + f + "(p+2.*h) + 16.*" + f + "(p+h)-30.*" + f + "(p)+16.*" + f + "(p-h)-" + f + "(p-2.*h);\n";
//    h += "xx /= 12.*h.x*h.x;\n";
//    h += "float yy = -" + f + "(p+2.*h.yxz) + 16.*" + f + "(p+h.yxz)-30.*" + f + "(p)+16.*" + f + "(p-h.yxz)-" + f + "(p-2.*h.yxz);\n";
//    h += "yy /= 12.*h.x*h.x;\n";
//    h += "float zz = -" + f + "(p+2.*h.zyx) + 16.*" + f + "(p+h.zyx)-30.*" + f + "(p)+16.*" + f + "(p-h.zyx)-" + f + "(p-2.*h.zyx);\n";
//    h += "zz /= 12.*h.x*h.x;\n";
//
//    h += "float xy = " + f + "(p+h.xyz + h.yxz)-" + f + "(p+h.xyz -h.yxz)-" + f + "(p-h.xyz+h.yxz)+" + f + "(p-h.xyz-h.yxz);";
//    h += "xy /= 4.*h.x*h.x;";
//
//    h += "float xz = " + f + "(p+h.xyz + h.zyx)-" + f + "(p+h.xyz -h.zyx)-" + f + "(p-h.xyz+h.zyx)+" + f + "(p-h.xyz-h.zyx);";
//    h += "xz /= 4.*h.x*h.x;";
//
//    h += "float yz = " + f + "(p+h.yxz + h.zyx)-" + f + "(p+h.yxz -h.zyx)-" + f + "(p-h.yxz+h.zyx)+" + f + "(p-h.yxz-h.zyx);";
//    h += "yz /= 4.*h.x*h.x;";

    h += "return mat3(vec3(xx,xy,xz),vec3(xy,yy,yz),vec3(xz,yz,zz));\n";
    h += "}\n";

    s += h;


    // Simple power method
    var eigen = "float " + fe + "(mat3 A)\n";
    eigen += "{\n";
    eigen += "vec3 ev = normalize(vec3(1.));\n";
    eigen += "ev = normalize(A*ev);\n";
    eigen += "ev = normalize(A*ev);\n";
    eigen += "ev = normalize(A*ev);\n";
    eigen += "ev = normalize(A*ev);\n";
    eigen += "vec3 evn = A*ev;\n";
    eigen += "return length(evn);\n";
//    eigen += "return dot(ev,evn)/dot(ev,ev);\n";
    eigen += "}\n";

    s += eigen;

    s += "vec3 " + fg + "(vec3 p)\n";
    s += "{\n";
    s += "float x = p.x;\n";
    s += "float y = p.y;\n";
    s += "float z = p.z;\n";

    s += "float t = time;\n";
    s += "return vec3(" + addDecimalPoints(fx.toString()) + ",\n";
    s += "\t" + addDecimalPoints(fy.toString()) + ",\n";
    s += "\t" + addDecimalPoints(fz.toString()) + ");\n";
    // Numerical gradient

//    s += "vec3 h = vec3(0.01,0.0,0.0);\n";
//    s += "return vec3(" + f + "(p+h.xyz)-" + f + "(p-h.xyz),\n";
//    s += "\t" + f + "(p+h.yxz)-" + f + "(p-h.yxz),\n";
//    s += "\t" + f + "(p+h.yzx)-" + f + "(p-h.yzx))/(2.0*h.x);\n";
//    s+= "return vec3(-"+f+"(p+2.*h.xyz)+8.*"+f+"(p+h.xyz)-8.*"+f+"(p - h.xyz)+ "+f+"(p-2.*h.xyz),\n";
//    s+= " \t-"+f+"(p+2.*h.yxz)+8.*"+f+"(p+h.yxz)-8.*"+f+"(p - h.yxz)+ "+f+"(p-2.*h.yxz),\n";
//    s+= " \t-"+f+"(p+2.*h.yzx)+8.*"+f+"(p+h.yzx)-8.*"+f+"(p - h.yzx)+ "+f+"(p-2.*h.yzx))/(12.*h.x);\n";

    s += "}\n";


    s += "float DE_ImplicitSurface" + this.id + "(vec3 p){                                                                                                                                      \n";
    s += "	                                                                                                                                                      \n";
    // Newer version uses hessian
    // Value f(x)
    s += "float val =" + f + "(p);\n";
    // Gradient
    s += "vec3 grad = " + fg + "(p);\n";
    s += "mat3 H = " + fh + "(p);\n";
    s += "float lambda = " + fe + "(H);\n";
    s += "float la = abs(lambda);\n";
    s += "float gv = length(grad);\n";
    s += "float vv = abs(val);\n";

    s += "float estimate = sqrt(vv/(la/2.) + dot(grad,grad)/(la*la)) - gv/la;\n";
//    s+= "return val/gv;\n";
    s += "return sign(val)*estimate;\n";

    // Older version
//    s += "float val ="+f+"(p);\n";
//    // Gradient
//    s+= "vec3 grad = "+ fg +"(p);\n";
//    s+= "float gv = length(grad);\n";
//    s+= "float vv = abs(val);\n";
//    s+= "return val/gv;\n";
//    s+= "return sign(val)*estimate;\n";
//    s+= "return val;\n";
    s += "}\n";

    return s;
};
ImplicitSurface.prototype.getPrototypes = function ()
{
    var f = "implicitSurface" + this.id;
    var fg = f + "Gradient";
    var fh = f + "Hessian";
    var fe = f + "Eigen";
    return ["float DE_ImplicitSurface" + this.id + "(vec3 p);",
        "vec3 " + fg + "(vec3 p);",
        "float " + fe + "(mat3 A);",
        "mat3 " + fh + "(vec3 p);",
        "float " + f + "(vec3 p);"
    ];
};

ImplicitSurface.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = 'Generic implicit surface defined by f(x,y,z) = 0, e.g. the sphere "x^2 + y^2 + z^2 -1". Additionaly, the function may contain functions of "t" (e.g. 4*t)';
    doc.name = "Implicit Surface";
    doc.addParameter(new Parameter("f", String, "pow(x-2.,2.)*pow(x+2.,2.)+pow(y-2.,2.)*pow(y+2.,2.)+pow(z-2.,2.)*pow(z+2.,2.)+3.*(x*x*y*y+x*x*z*z+y*y*z*z)+6.*x*y*z-10.*(x*x+y*y+z*z)+22.", "The surface function"));

    return doc;
};




Quadric.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "A quadric defined by 10 parameters (in Wikipedia order)";
    doc.name = "Quadric";
    doc.addParameter(new Parameter("a", String, "1.0", "a"));
    doc.addParameter(new Parameter("b", String, "0.0", "b"));
    doc.addParameter(new Parameter("c", String, "0.0", "c"));
    doc.addParameter(new Parameter("d", String, "1.0", "d"));
    doc.addParameter(new Parameter("e", String, "0.0", "e"));
    doc.addParameter(new Parameter("f", String, "1.0", "f"));
    doc.addParameter(new Parameter("g", String, "0.0", "g"));
    doc.addParameter(new Parameter("h", String, "0.0", "h"));
    doc.addParameter(new Parameter("i", String, "0.0", "i"));
    doc.addParameter(new Parameter("j", String, "-1.0", "j"));

    return doc;
};


Box.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "A simple box centered at the origin";
    doc.name = "Box";
    doc.addParameter(new Parameter("w", Number, 2, "Width"));
    doc.addParameter(new Parameter("h", Number, 2, "Height"));
    doc.addParameter(new Parameter("d", Number, 2, "Depth"));

    return doc;
};
CappedCylinder.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "A capped cylinder";
    doc.name = "Capped Cylinder";
    doc.addParameter(new Parameter("r", Number, 2, "Radius"));
    doc.addParameter(new Parameter("h", Number, 2, "Height"));

    return doc;
};


opMirror.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = 'Mirrors the input around the plane given by a normal and a distance. The distance should be negated';
    doc.name = "Mirror";
    doc.addParameter(new Parameter("primitive", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("nx", Number, "0", "Normal x-component"));
    doc.addParameter(new Parameter("ny", Number, "1", "Normal x-component"));
    doc.addParameter(new Parameter("nz", Number, "0", "Normal x-component"));
    doc.addParameter(new Parameter("d", Number, "0", "Negative distance"));

    return doc;
};

opScale.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = 'Scales the input. You may use functions of "t" (e.g. 4*t)';
    doc.name = "Scale";
    doc.addParameter(new Parameter("primitive", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("fx", String, "1", "x-scale"));
    doc.addParameter(new Parameter("fy", String, "1", "y-scale"));
    doc.addParameter(new Parameter("fz", String, "1", "z-scale"));

    return doc;
};
opRotate.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = 'Rotates the input around an axis. You may use functions of "t" (e.g. 4*t) for the angle';
    doc.name = "Rotate";
    doc.addParameter(new Parameter("primitive", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("x", Number, 1, "x component of axis"));
    doc.addParameter(new Parameter("y", Number, 1, "y component of axis"));
    doc.addParameter(new Parameter("z", Number, 1, "z component of axis"));
    doc.addParameter(new Parameter("angle", String, 1, "formula to calculate the angle"));

    return doc;
};

opTranslate.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = 'Translates the input. You may use functions of "t" (e.g. 4*t)';
    doc.name = "Translate";
    doc.addParameter(new Parameter("primitive", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("tx", String, "0", "x-translation"));
    doc.addParameter(new Parameter("ty", String, "0", "y-translation"));
    doc.addParameter(new Parameter("tz", String, "0", "z-translation"));

    return doc;
};


opUnion.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "Union of two inputs";
    doc.name = "Union";
    doc.addParameter(new Parameter("primitive1", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("primitive2", DistanceFieldObject, null, "Primitive"));

    return doc;
};

opSmoothUnion.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "Smooth union of two inputs";
    doc.name = "Smooth union";
    doc.addParameter(new Parameter("primitive1", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("primitive2", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("k", Number, 0.1, "Smoothing factor"));
    return doc;
};

opIntersection.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "Intersection of two inputs";
    doc.name = "Intersection";
    doc.addParameter(new Parameter("primitive1", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("primitive2", DistanceFieldObject, null, "Primitive"));

    return doc;
};

opSubtraction.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "Subtracts the first from the second input";
    doc.name = "Subtraction";
    doc.addParameter(new Parameter("primitive1", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("primitive2", DistanceFieldObject, null, "Primitive"));

    return doc;
};

Sphere.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "A simple sphere";
    doc.name = "Sphere";
    doc.addParameter(new Parameter("r", Number, 1, "Radius"));

    return doc;
};

MengerSponge.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "A Menger Sponge";
    doc.name = "Menger Sponge";
    doc.addParameter(new Parameter("iterations", Number, 8, "Iterations"));

    return doc;
};

Mandelbulb.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "A Mandelbulb";
    doc.name = "Mandelbulb";
    doc.addParameter(new Parameter("power", Number, 7, "Iterations"));
    doc.addParameter(new Parameter("iterations", Number, 20, "Iterations"));

    return doc;
};

Mandelbox.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "A Mandelbox";
    doc.name = "Mandelbox";

    doc.addParameter(new Parameter("iterations", Number, 20, "Iterations"));
    doc.addParameter(new Parameter("folding", Number, 4, "Folding"));
    doc.addParameter(new Parameter("min radius", Number, 2, "Min-radius"));
    doc.addParameter(new Parameter("fixed radius", Number, 35, "Fixed radius"));
    
    return doc;
};
opPlaneRepitition.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = 'Repeat an object in either the xz,xy or yz plane. You may use functions of "t" (e.g. 4*t)';
    doc.name = "Repitition2D";
    doc.addParameter(new Parameter("primitive", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("plane", String, "xz", "The plane in which the object will be repeated"));
    doc.addParameter(new Parameter("distance first direction", String, 1, "The distance between two objects in the first direction"));
    doc.addParameter(new Parameter("distance second direction", String, 1, "The distance between two objects in the second direction"));

    return doc;
};

opRepitition.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = 'Repeat an object in space. You may use functions of "t" (e.g. 4*t)';
    doc.name = "Repitition3D";
    doc.addParameter(new Parameter("primitive", DistanceFieldObject, null, "Primitive"));
    doc.addParameter(new Parameter("distance first direction", String, "1", "The distance between two objects in the first direction"));
    doc.addParameter(new Parameter("distance second direction", String, "1", "The distance between two objects in the second direction"));
    doc.addParameter(new Parameter("distance third direction", String, "1", "The distance between two objects in the third direction"));

    return doc;
};

Sierpinski.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "A Sierpinski tetrahedron";
    doc.name = "Sierpinski tetrahedron";
    doc.addParameter(new Parameter("iterations", Number, 10, "Iterations"));

    return doc;
};

Torus.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "A simple Torus";
    doc.name = "Torus";
    doc.addParameter(new Parameter("r1", Number, 1, "Radius"));
    doc.addParameter(new Parameter("r2", Number, 2, "Radius"));

    return doc;
};

opCombineFunction.getDoc = function ()
{
    var doc = new Documentation();
    doc.description = "Wrapper for a function";
    doc.name = "Combine Wrapper";

    return doc;
};


$(document).ready(function ()
{
    nodeFuncs['Box'] = Box;
    nodeFuncs['Capped Cylinder'] = CappedCylinder;
    nodeFuncs['Union'] = opUnion;
    nodeFuncs['Smooth Union'] = opSmoothUnion;
    nodeFuncs['Translate'] = opTranslate;
    nodeFuncs['Scale'] = opScale;
    nodeFuncs['Mirror'] = opMirror;
    nodeFuncs['Intersection'] = opIntersection;
    nodeFuncs['Subtraction'] = opSubtraction;
    nodeFuncs['Sphere'] = Sphere;
    nodeFuncs['Menger Sponge'] = MengerSponge;
    nodeFuncs['Mandelbulb'] = Mandelbulb;
    nodeFuncs['Mandelbox'] = Mandelbox;
    nodeFuncs['Torus'] = Torus;
    nodeFuncs['Sierpinski Tetrahedron'] = Sierpinski;
    nodeFuncs['Repitition2D'] = opPlaneRepitition;
    nodeFuncs['Repitition3D'] = opRepitition;
    nodeFuncs['Rotate'] = opRotate;
    nodeFuncs['Quadric'] = Quadric;
    nodeFuncs['Implicit Surface'] = ImplicitSurface;
});




var op = new opRepitition((new opIntersection(new Sphere(0, 0, 0, 1), new Sphere(1, 0, 0, 1))), 4., 4., 4.);

console.log(op.toExpression("p"));

console.log("Block:");
console.log(generateCode(op, "p"));
console.log("\n\n");


//console.log(shuntingYard("opScale(Box(0,0,0),1)"));