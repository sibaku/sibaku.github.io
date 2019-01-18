var functionals = {};
functionals.epsilon = 1E-15;

function plus(f, g) {

    if (isNumber(f)) {
        f = scalar(f);
    }

    if (isNumber(g)) {
        g = scalar(g);
    }

    if (f === zero) {
        return g;
    } else if (g === zero) {
        return f;
    } else if (f.scalar === true && g.scalar === true) {
        // Combine scalars
        var h = scalar(f(0) + g(0));
        return h;
    } else {
        var plusFunc = function (x) {
            var ret = f(x) + g(x);
            var gx = g(x);

            return ret;
        };

        plusFunc.derive = function () {
            return plus(f.derive(), g.derive());
        };

        plusFunc.toString = function () {
            return "(" + f + " + " + g + ")";
        };
        return plusFunc;
    }

}

function scalar(val) {

    if (val === 0 || Math.abs(val) < functionals.epsilon) {
        return zero;
    } else if (val === 1) {
        return one;
    }

    var cf = function (x) {
        if (!isNumber(val)) {
            console.log("NOT " + typeof val);
        }
        return val;
    };
    cf.derive = function () {
        return zero;
    };
    cf.toString = function () {
        return val + "";
    };
    cf.scalar = true;
    return cf;
}

function sub(f, g) {

    if (isNumber(f)) {
        f = scalar(f);
    }
    if (isNumber(g)) {
        g = scalar(g);
    }

    if (f === zero) {
        return mult(scalar(-1), g);
    } else if (g === zero) {
        return f;
    } else if (f.scalar === true && g.scalar === true) {
        // Combine scalars
        var h = scalar(f(0) - g(0));
        return h;
    }

    var sf = function (x) {
        return f(x) - g(x);
    };

    sf.derive = function () {

        return sub(f.derive(), g.derive());
    };
    sf.toString = function () {
        return "(" + f + "-" + g + ")";
    };
    return sf;

}

function divide(f, g) {

    if (isNumber(f)) {
        f = scalar(f);
    }
    if (isNumber(g)) {
        g = scalar(g);
    }
    if (f === zero) {
        return zero;
    } else if (g === one) {
        return f;
    } else if (f.scalar === true && g.scalar === true) {
        // Combine scalars
        var h = scalar(f(0) / g(0));
        return h;
    }
    var df = function (x) {
        return f(x) / g(x);
    };

    df.derive = function () {
        var n1 = mult(f.derive(), g);
        var n2 = mult(f, g.derive());

        var n = sub(n1, n2);
        return divide(n, pow(g, 2));
    };
    df.toString = function () {
        return "(" + f + "/" + g + ")";
    };
    return df;

}

function divideSafe(f, g, zeroCase) {

    if (isNumber(f)) {
        f = scalar(f);
    }
    if (isNumber(g)) {
        g = scalar(g);
    }
    if (isNumber(zeroCase)) {
        zeroCase = scalar(zeroCase);
    }
    if (f === zero) {
        return zero;
    } else if (g === one) {
        return f;
    } else if (f.scalar === true && g.scalar === true) {
        // Combine scalars
        var h = scalar(f(0) / g(0));
        return h;
    }

    if (g === zero) {
        return zeroCase;
    }
    var df = function (x) {
        var gx = g(x);
        if (gx !== 0)
            return f(x) / gx;

        return zeroCase;

    };

    df.derive = function () {
        var n1 = mult(f.derive(), g);
        var n2 = mult(f, g.derive());

        var n = sub(n1, n2);
        return divideSafe(n, pow(g, 2), zeroCase);
    };
    df.toString = function () {
        return "(" + f + "/" + g + ")";
    };
    return df;

}

function zero(x) {
    return 0;
}
zero.derive = function () {
    return zero;
};
zero.toString = function () {
    return "0";
};
zero.scalar = true;
function one(x) {
    return 1;
}
one.derive = function () {
    return zero;
};
one.toString = function () {
    return "1";
};
one.scalar = true;

function sin(f) {

    f = f ? f : id;

    if (isNumber(f)) {
        f = scalar(f);
    }

    if (f.scalar === true) {
        // Combine scalars
        var h = scalar(Math.sin(f(0)));
        return h;
    }
    var s = function (x) {
        return Math.sin(f(x));
    };
    s.derive = function () {
        return mult(cos(f), f.derive());
    };
    s.toString = function () {
        return "sin(" + f + ")";
    };

    return s;
}

function cos(f) {
    f = f ? f : id;

    if (isNumber(f)) {
        f = scalar(f);
    }

    if (f.scalar === true) {
        // Combine scalars
        var h = scalar(Math.cos(f(0)));
        return h;
    }
    var c = function (x) {
        return Math.cos(f(x));
    };
    c.derive = function () {
        var f1 = mult(scalar(-1), sin(f));
        return mult(f1, f.derive());
    };
    c.toString = function () {
        return "cos(" + f + ")";
    };

    return c;
}

function mult(f, g) {

    if (isNumber(f)) {
        f = scalar(f);
    }
    if (isNumber(g)) {
        g = scalar(g);
    }

    if (f.scalar === true && g.scalar === true) {
        return scalar(f(0) * g(0));
    }
    if (f === zero || g === zero) {
        return zero;
    } else if (f === one) {
        return g;
    } else if (g === one) {
        return f;
    }
    var mf = function (x) {
        return f(x) * g(x);
    };

    mf.derive = function () {
        var f1 = mult(f.derive(), g);
        var f2 = mult(g.derive(), f);
        return plus(f1, f2);
    };
    mf.toString = function () {
        return f + " * " + g;
    };
    // mf.derive = function(x){
    // return f.derive()(x)*g(x) + g.derive()(x)*f(x);
    // }


    return mf;
}

function log(f) {

    if (isNumber(f)) {
        f = scalar(f);
    }

    if (f === one) {
        return zero;
    }
    if (f.scalar === true) {
        // Combine scalars
        var h = scalar(Math.log(f(0)));
        return h;
    }
    var lf = function (x) {
        return Math.log(f(x));
    };

    lf.derive = function () {
        return divide(f.derive(), f);
    };

    lf.toString = function () {
        return "ln(" + f + ")";
    };
    return lf;
}

function midpoint(f, a, b, n) {
    var h = (b - a) / n;

    var sum = 0;

    for (var i = 0; i < n; i++) {

        var xi1 = a + i * h;
        var xi2 = xi1 + h;

        sum += f((xi1 + xi2) / 2);

    }

    sum = h * sum;

    return sum;

}

function trap(f, a, b, n) {

    var h = (b - a) / n;

    var sum = 0;

    for (var i = 0; i < n; i++) {

        var xi1 = a + i * h;
        var xi2 = xi1 + h;

        sum += f(xi1) + f(xi2);

    }

    sum = h * sum / 2;

    return sum;
}
function simpson(f, a, b, n) {

    var h = (b - a) / n;

    var sum = 0;

    for (var i = 0; i < n; i++) {

        var xi1 = a + i * h;
        var xi2 = xi1 + h;

        sum += f(xi1) + f(xi2) + 4 * f((xi1 + xi2) / 2);

    }

    sum = h * sum / 6;

    return sum;

}

function taylorIntegrator(f, a, b, n) {
    var poly = taylor(f, n, 0, 0);

    var upper = poly(b);
    var lower = poly(a);

    return upper - lower;

}

function sqrt(f) {

    if (isNumber(f)) {
        f = scalar(f);
    }

    if (f.scalar === true) {
        // Combine scalars
        var h = scalar(Math.sqrt(f(0)));
        return h;
    }
    if (f === zero) {
        return zero;
    }
    if (f === one) {
        return one;
    }
    var sf = function (x) {
        return Math.sqrt(f(x));
    };
    sf.derive = function () {
        var d = mult(scalar(2), sqrt(f));
        return divide(f.derive(), d);
    };

    sf.toString = function () {
        return "sqrt(" + f + ")";
    };

    return sf;
}
function isNumber(s) {
    return typeof s === 'number' ? true
            : typeof s === 'string' ? (s.trim() === '' ? false : !isNaN(s))
            : (typeof s).match(/object|function/) ? false
            : !isNaN(s);
}
var sampleSize = 1000;
function pow(f, g) {

    if (isNumber(f)) {
        f = scalar(f);
    }
    if (isNumber(g)) {
        g = scalar(g);
    }

    if (f.scalar === true && g.scalar === true) {
        // Combine scalars
        var h = scalar(Math.pow(f(0), g(0)));
        return h;
    }
    if (g === zero) {
        return scalar(1);
    } else if (f === zero) {
        return zero;
    } else {
        var pf = function (x) {
            return Math.pow(f(x), g(x));

        };

        pf.derive = function () {
            var factor1 = pow(f, sub(g, scalar(1)));
            var summand1 = mult(f.derive(), g);
            var summand2 = mult(mult(log(f), f), g.derive());
            var factor2 = plus(summand1, summand2);

            return mult(factor1, factor2);
        };
        pf.toString = function () {
            return f + " ^ " + g;
        };

        return pf;
    }
    // pf.derive = function(x){
    // return exp*Math.pow(f(x),exp-1)*f.derive()(x);
    // }

}

function project(base, f) {

    var r = [];
    for (var i = 0; i < base.length; i++) {
        var b = base[i];
        r.push(simpson(mult(b, f), 0, 1, sampleSize));

    }

    return r;

}

function exp(f) {

    if (isNumber(f)) {
        f = scalar(f);
    }

    if (f === zero) {
        return one;
    } else if (f === one) {
        return scalar(Math.E);
    }

    if (f.scalar === true) {
        // Combine scalars
        var h = scalar(Math.exp(f(0)));
        return h;
    }
    var ef = function (x) {
        return Math.exp(f(x));
    };

    ef.derive = function () {
        return mult(exp(f), f.derive());
    };

    ef.toString = function () {
        return "exp(" + f + ")";
    };
    return ef;

}

function neg(f) {

    if (isNumber(f)) {
        f = scalar(f);
    }

    if (f === zero) {
        return one;
    }
    ;

    if (f.scalar) {
        return scalar(-f(0));
    }

    var nf = function (x) {
        return -f(x);
    };
    nf.derive = function () {
        return neg(f.derive());
    };
    nf.toString = function () {
        return "-(" + f + ")";
    };
    return nf;
}

function approximate(base, f) {
    var coords = project(base, f);
    var g = zero;
    for (var i = 0; i < coords.length; i++) {
        g = plus(g, mult(scalar(coords[i]), base[i]));
    }

    return g;
}
function grahmSchmidt(generator) {
    var r = [];

    for (var i = 0; i < generator.length; i++) {

        var g = generator[i];

        var coords = project(r, g);
        for (var j = 0; j < r.length; j++) {
            var c = coords[j];
            var b = r[j];

            var bm = mult(scalar(c), b);
            g = sub(g, bm);
        }

        // normalize
        var abs = project([g], g)[0];

        g = mult(sqrt(scalar(1 / abs)), g);
        r.push(g);

    }

    return r;

}

function parseFunction(input) {
    console.log(input);
    input = input.replace(/ /g, '').replace("pi", "" + Math.PI).replace("e", "" + Math.E);

    var lbl = input.indexOf("(");
    var lbr = input.length;

    var variables = {x: 1, y: 1, z: 1};
    // No functions
    if (lbl < 0) {
        // Find operator
        var index = -1;
        var opIndex = -1;
        for (var i = 0; i < binaryOperators.length; i++) {
            opIndex = input.indexOf(binaryOperators[i]);
            if (opIndex >= 0) {
                index = i;
                break;
            }
        }

        if (opIndex >= 0) {
            var block1 = input.substring(0, opIndex);
            var block2 = input.substring(opIndex + 1);

            var o1,
                    o2;
            if (block1 in variables) {
                o1 = id;
            } else {
                o1 = parseFloat(block1);
            }
            if (block2 in variables) {
                o2 = id;
            } else {
                o2 = parseFloat(block2);
            }

            return global[binaryOperatorFunctions[index]](o1, o2);

        } else {

            if (input in variables) {
                return id;
            } else {
                return scalar(parseFloat(input));
            }
        }

    }
    if (lbl >= 0) {

        var level = 1;
        var i = lbl + 1;
        for (; i < input.length; i++) {
            if (input.charAt(i) === '(') {
                level++;
            } else if (input.charAt(i) === ')') {
                level--;

                if (level === 0) {
                    lbr = i;
                    break;
                }
            }
        }
        if (lbr === input.length) {
            console.log("Error");

        }
    } else {
        lbl = -1;
        lbr = input.length;
    }

    var block1 = input.substring(lbl + 1, lbr);
    console.log(block1);

    // function
    if (lbl > 0) {
        var operator = input.substring(0, lbl);
        console.log(operator);

        if (unaryFunctions.indexOf(operator) >= 0) {
            console.log("unary: " + operator);
            return global[operator](parseFunction(block1));
        } else if (binaryFunctions.indexOf(operator) >= 0) {
            console.log("binary: " + operator);
            var comma = block1.indexOf(",");
            if (comma >= 0) {
                var innerBlock1 = block1.substring(0, comma);
                var innerBlock2 = block1.substring(comma + 1);
                console.log("Comma: " + innerBlock1);
                console.log("Comma: " + innerBlock2);
                return global[operator](parseFunction(innerBlock1), parseFunction(innerBlock2));
            }
        }
    } else {
        var rightSide = input.substring(lbr + 1);
        var rbl = rightSide.indexOf("(");
        var rbr = rightSide.length;
        if (rbl >= 0) {

            var level = 1;
            var i = rbl + 1;
            for (; i < rightSide.length; i++) {
                if (rightSide.charAt(i) === '(') {
                    level++;
                } else if (rightSide.charAt(i) === ')') {
                    level--;

                    if (level === 0) {
                        rbr = i;
                        break;
                    }
                }
            }
            if (rbr === rightSide.length) {
                console.log("Error");

            }
        } else {
            rbl = -1;
            rbr = rightSide.length;
        }

        var block2 = rightSide.substring(rbl + 1, rbr);
        console.log(block2);

        var operator = rightSide.substring(0, rbl);
        console.log("operator: " + operator);
        var opIndex = binaryOperators.indexOf(operator);
        if (opIndex >= 0) {

            return global[binaryOperatorFunctions[opIndex]](parseFunction(block1), parseFunction(block2));
        }

    }

}

function shuntingYard(input) {

    var stack = [];
    var output = [];
    var buffer = "";
    input = input.replace(/ /g, '').replace("pi", "" + Math.PI).replace("exp", "blargh").replace("e", "" + Math.E).replace("blargh", "exp");

    var variables = {x: 1, y: 1, z: 1,t:1};
    if (input.length < 1) {
        return [0];
    }
    var last = input.charAt(0);
    var unaryMinus = "m";
    // Replace unary minus
    for (var i = 0; i < input.length; i++) {
        var c = input.charAt(i);

        if (i === 0 && c === "-") {
            input = unaryMinus + input.substring(1);
            last = unaryMinus;
        } else if (c === "-" && (last === "(" || operatorPrecedence[last])) {
            input = input.substring(0, i) + unaryMinus + input.substring(i + 1);
            last = unaryMinus;
        } else {

            last = c;
        }
    }
    while (input.length > 0) {
        var c = input.charAt(0);
        var operator = operatorPrecedence[c];
        // consume number
        //zero special
        if (numbers.indexOf(c) >= 0) {
            var buffer = c;
            for (var j = 1; j < input.length; j++) {
                var c2 = input.charAt(j);

                if (numbers.indexOf(c2) >= 0 || c2 === ".") {
                    buffer += c2;
                } else {
                    break;
                }

            }

            output.push(parseFloat(buffer));

            input = input.substring(j);
        } else if (c in variables) {
            output.push(c);
            input = input.substring(1);
        } else if (c === "(") {
            stack.push("(");
            input = input.substring(1);
        } else if (c === ")") {

            var s = stack.pop();
            while (s !== "(") {
                output.push(s);

                if (stack.length === 0) {
                    // console.log("Mismatched parantheses");
                    return "Mismatched parantheses";
                }
                s = stack.pop();
            }

            if (stack.length > 0) {
                if (functions.indexOf(stack[stack.length - 1]) >= 0) {

                    output.push(stack[stack.length - 1]);
                    stack.pop();
                }
            }
            input = input.substring(1);

        } else if (operatorPrecedence[c]) {
            var ass1 = operatorPrecedence[c].associativity;
            var pre1 = operatorPrecedence[c].precedence;

            if (stack.length > 0) {
                while (stack.length > 0) {
                    var op = stack.pop();
                    if (!operatorPrecedence[op]) {
                        stack.push(op);
                        break;
                    }
                    var ass2 = operatorPrecedence[op].associativity;
                    var pre2 = operatorPrecedence[op].precedence;
                    if ((ass1 === "Left" && pre1 <= pre2) || pre1 < pre2) {

                        output.push(op);
                    } else {
                        // Push back non operator
                        stack.push(op);
                        break;
                    }
                }

            }
            stack.push(c);
            input = input.substring(1);
        } else if (letters.indexOf(c) >= 0) {
            var buffer = c;

            for (var j = 1; j < input.length; j++) {
                if (functions.indexOf(buffer) >= 0) {
                    break;
                }
                var c2 = input.charAt(j);

                buffer += c2;

            }
            if (functions.indexOf(buffer) < 0) {

                // console.log("Wrong function symbol: " + buffer);
                return "Wrong function symbol: " + buffer;
            }
            stack.push(buffer);
            input = input.substring(j);

        } else if (c === ",") {
            while (stack.length > 0) {

                var s = stack.pop();
                if (s === "(") {
                    stack.push(s);
                    break;
                }
                output.push(s);

            }

            if (stack.length === 0 && s !== "(") {

                // console.log("Mismatched parenthesis");
                return "Mismatched parenthesis";
            }
            input = input.substring(1);
        }
    }
    while (stack.length > 0) {
        var c = stack.pop();
        if (c === "(" || c === ")") {
            console.log("Mismatched paranthesis");
            return "Mismatched paranthesis";
        }

        output.push(c);
    }

    return output;
}

function fromRPN(s) {

    var stack = [];
    for (var i = 0; i < s.length; i++) {
        var v = s[i];
        var bno = binaryOperators[v];
        if (isNumber(v)) {
            stack.push(scalar(v));
            continue;
        } else if (binaryOperators.indexOf(v) >= 0) {
            var v2 = stack.pop();
            var v1 = stack.pop();

            var index = binaryOperators.indexOf(v);
            stack.push(global[binaryOperatorFunctions[index]](v1, v2));
        } else if (binaryFunctions.indexOf(v) >= 0) {

            var v2 = stack.pop();
            var v1 = stack.pop();
            stack.push(global[binaryFunctions[v]](v1, v2));
        } else if (unaryFunctions.indexOf(v) >= 0) {
            var v1 = stack.pop();
            stack.push(global[unaryFunctions[unaryFunctions.indexOf(v)]](v1));
        } else if (v === "x") {
            stack.push(id);
        } else if (unaryOperators.indexOf(v) >= 0) {
            var v1 = stack.pop();
            stack.push(global[unaryOperatorFunctions[unaryOperators.indexOf(v)]](v1));
        }

    }

    return stack.pop();
}
var functions = ["sin", "cos", "tan", "pow", "exp", "log", "sqrt"];
var operatorPrecedence = {
    "^": {
        precedence: 4,
        associativity: "Right"
    },
    "*": {
        precedence: 3,
        associativity: "Left"
    },
    "/": {
        precedence: 3,
        associativity: "Left"
    },
    "+": {
        precedence: 2,
        associativity: "Left"
    },
    "-": {
        precedence: 2,
        associativity: "Left"
    },
    "m": {
        precedence: 4,
        associativity: "Right"
    }

};
var numbersFirstLetter = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
var numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
var global = window;
var unaryFunctions = ["sin", "cos", "tan", "exp", "log", "sqrt"];
var binaryFunctions = ["pow"];
var binaryOperators = ["+", "*", "/", "^", "-"];
var binaryOperatorFunctions = ["plus", "mult", "divide", "pow", "sub"];
var unaryOperators = ["m"];
var unaryOperatorFunctions = ["neg"];
function taylor(f, degree, expansionPoint, initial) {
    var d = degree;
    var a = expansionPoint;
    var s;
    var curF;
    if (typeof initial !== "undefined") {
        s = initial;
        curF = f;

    } else {
        s = f(a);
        curF = f.derive();
    }

    var fac = 1;

    var taylor = scalar(s);
    for (var i = 1; i <= degree; i++) {

        fac *= i;
        var factor1 = pow(sub(id, a), i);
        var factor2 = curF(a) / fac;
        taylor = plus(taylor, mult(factor1, factor2));

        curF = curF.derive();
    }

    return taylor;

}

function measureBase(base) {
    for (var i = 0; i < base.length; i++) {
        for (var j = 0; j < base.length; j++) {

            console.log(i + "," + j + " = " + simpson(mult(base[i], base[j]), 0, 1, sampleSize).toFixed(4));
        }

    }
}

function piecewiseFunction(intervals, funcs, outside) {

    var i = intervals;
    var f = funcs;
    if (isNumber(outside)) {
        outside = scalar(outside);
    }

    if (f.scalar === true) {
        // Combine scalars
        var h = scalar(Math.sqrt(f(0)));
        return h;
    }

    var pf = function (x) {
        var fa;
        if (x < i[0])
        {
            return outside(x);
        }
        for (var j = 1; j < i.length; j++)
        {
            if (x < i[j])
            {
                return funcs[j - 1](x);
            }
        }

        return outside(x);
    };
    pf.derive = function () {
        var fd = [];
        for (var j = 0; j < i.length; j++)
        {
            fd.push(i[j].derive());

        }

        return piecewiseFunction(i, fd, outside);
    };

    pf.toString = function () {
        var s = "";
        for (var j = 0; j < i.length - 1; j++)
        {
            s += i[j] + " <= x <= " + i[j + 1] + ": " + f[j] + " \n";


        }
        return  s;
    };

    return pf;
}
function id(x) {
    return x;
}
id.derive = function () {

    return scalar(1);
};
id.toString = function () {
    return "x";
};

function undef(x) {

}
undef.derive = undef;
undef.toString = function () {
    return "undefined";
};




/****************************************
 * 
 * 
 * New functions
 * 
 * 
 */

var sfl = {};

sfl.isConstant = function (f)
{
    var stack = [f];

    while (stack.length !== 0)
    {
        var n = stack.pop();
        if (n instanceof sfl.id)
        {
            return false;
        }
        else if (n.children)
        {
            for (var c in n.children)
            {
                stack.push(n.children[c]);
            }
        }
    }

    return true;
};

sfl.isConstantPartial = function (f, variable)
{
    var stack = [f];

    while (stack.length !== 0)
    {
        var n = stack.pop();
        if (n instanceof sfl.id)
        {
            if (n.variable === variable)
                return false;
        }
        else if (n.children)
        {
            for (var c in n.children)
            {
                stack.push(n.children[c]);
            }
        }
    }

    return true;
};

sfl.partialFunction = function (f, constVariables)
{
    var fn = f.copy();
    var stack = [fn];

    while (stack.length !== 0)
    {
        var n = stack.pop();
        if (n.children)
        {
            for (var i = 0; i < n.children.length; i++)
            {
                var c = n.children[i];
                if (c instanceof sfl.id)
                {
                    // Replace variables by constants
                    if (c.variable in constVariables)
                    {
                        n.children[i] = new sfl.constant(constVariables[c.variable]);
                    }
                } else
                {
                    stack.push(c);
                }

            }
        }
    }

    return fn;
};

sfl.getVariables = function (f)
{
    var stack = [f];
    var variables = {};
    while (stack.length !== 0)
    {
        var n = stack.pop();
        if (n instanceof sfl.id)
        {
            variables[n.variable] = true;
        }
        else if (n.children)
        {
            for (var c in n.children)
            {
                stack.push(n.children[c]);
            }
        }
    }

    return variables;
};

sfl.isFunctionOf = function (f, variable)
{
    return variable in sfl.getVariables(f);
};
sfl.isZero = function (f)
{
    return sfl.isConstant(f) && f.eval() === 0;
};
sfl.isOne = function (f)
{
    return sfl.isConstant(f) && f.eval() === 1;
};
sfl.simplifyConst = function (f)
{
    var fn = f.copy();
    if (sfl.isConstant(fn))
        return new sfl.constant(fn.eval());
    var stack = [fn];

    while (stack.length !== 0)
    {
        var n = stack.pop();
        if (n.children)
        {
            for (var i = 0; i < n.children.length; i++)
            {
                var c = n.children[i];
                // Eval const values
                if (sfl.isConstant(c))
                {

                    n.children[i] = new sfl.constant(c.eval());

                } else
                {
                    stack.push(c);
                }

            }
        }
    }

    return fn;

};

sfl.simplify = function (f)
{
    var fc = sfl.simplifyConst(f);


    var simplifyBaseFunc = function (f)
    {
        if (f instanceof sfl.add)
        {
            if (sfl.isZero(f.children[0]) && sfl.isZero(f.children[1]))
            {
                return new sfl.constant(0);
            }
            else if (sfl.isZero(f.children[0]))
            {
                return f.children[1].copy();
            }
            else if (sfl.isZero(f.children[1]))
            {
                return f.children[0].copy();
            }
            else
            {

                return f;
            }
        } else if (f instanceof sfl.sub)
        {
            if (sfl.isZero(f.children[0]) && sfl.isZero(f.children[1]))
            {
                return new sfl.constant(0);
            }
            else if (sfl.isZero(f.children[0]))
            {
                return new sfl.mult(new sfl.constant(-1), f.children[1].copy());
            }
            else if (sfl.isZero(f.children[1]))
            {
                return f.children[0].copy();
            }
            else
            {

                return f;
            }
        }
        else if (f instanceof sfl.mult)
        {
            if (sfl.isZero(f.children[0]) || sfl.isZero(f.children[1]))
            {
                return new sfl.constant(0);
            }
            else if (sfl.isOne(f.children[0]))
            {
                return f.children[1].copy();
            }
            else if (sfl.isOne(f.children[1]))
            {
                return f.children[0].copy();
            }
            else
            {

                return f;
            }
        }
        else if (f instanceof sfl.div)
        {
            if (sfl.isZero(f.children[0]))
            {
                return new sfl.constant(0);
            }
            else if (sfl.isOne(f.children[1]))
            {
                return f.children[0].copy();
            }
            else
            {

                return f;
            }
        }
        else if (f instanceof sfl.pow)
        {
            if (sfl.isZero(f.children[1]))
            {
                return new sfl.constant(1);
            }
            else if (sfl.isZero(f.children[0]))
            {
                return new sfl.constant(0);
            } else if (sfl.isOne(f.children[1]))
            {
                return f.children[0].copy();
            }
        }

        return f;
    };

    var stack = [simplifyBaseFunc(fc)];
    var objects = [];
    while (stack.length !== 0)
    {
        var n = stack.pop();
        objects.push(n);
        if (n.children)
        {
            for (var i = 0; i < n.children.length; i++)
            {
                var c = n.children[i];
                c.info = {index: i, parent: n};

                stack.push(c);

            }
        }
    }

    objects.reverse();
    for (var i = 0; i < objects.length; i++)
    {
        var c = objects[i];
        var cs = simplifyBaseFunc(objects[i]);
        if (c.info)
        {
            c.info.parent.children[c.info.index] = cs;
        } else
        {
            fc = cs;
        }

    }




    return sfl.simplifyConst(fc);

};

/****
 * 
 * @param {Number} value The value the constant has
 */
sfl.constant = function (value)
{
    this.value = value;
};
sfl.constant.prototype.copy = function ()
{
    return new sfl.constant(this.value);
};
sfl.constant.prototype.eval = function (input)
{
    return this.value;
};

sfl.constant.prototype.toString = function ()
{
    return "" + this.value;
};

sfl.constant.prototype.derivePartial = function (variable)
{
    return new sfl.constant(0);
};

/**
 * 
 * @param {type} variable
 * @returns {undefined}
 */
sfl.id = function (variable)
{
    this.variable = variable ? variable : "x";
};
sfl.id.prototype.copy = function ()
{
    return new sfl.id(this.variable);
};

sfl.id.prototype.eval = function (input)
{
    if (this.variable in input)
    {
        return input[this.variable];
    }
};
sfl.id.prototype.toString = function ()
{
    return this.variable;
};
sfl.id.prototype.derivePartial = function (variable)
{
    if (variable === this.variable)
        return new sfl.constant(1);

    return new sfl.constant(0);
};

/******************************************************
 * 
 * @param {type} f
 * @param {type} g
 * @returns {undefined}
 */
sfl.add = function (f, g)
{

    this.children = [f, g];
};

sfl.add.prototype.copy = function ()
{
    return new sfl.add(this.children[0].copy(), this.children[1].copy());
};

sfl.add.prototype.eval = function (input)
{
    return this.children[0].eval(input) + this.children[1].eval(input);
};

sfl.add.prototype.toString = function ()
{
    return "(" + this.children[0].toString() + " + " + this.children[1].toString() + ")";
};
sfl.add.prototype.derivePartial = function (variable)
{

    var f = this.children[0];
    var g = this.children[1];

    var fd, gd;
    fd = sfl.isFunctionOf(f, variable);
    gd = sfl.isFunctionOf(g, variable);

    // Both functions not of variable
    if (!fd && !gd)
    {
        return new sfl.constant(0);
    }
    else if (!fd)
    {
        return g.derivePartial(variable);
    }
    else if (!gd)
    {
        return f.derivePartial(variable);
    }
    return new sfl.add(f.derivePartial(variable), g.derivePartial(variable));
};
/*******************************************************************
 * 
 * @param {type} f
 * @param {type} g
 * @returns {undefined}
 */
sfl.sub = function (f, g)
{
    this.children = [f, g];
};
sfl.sub.prototype.copy = function ()
{
    return new sfl.sub(this.children[0].copy(), this.children[1].copy());
};
sfl.sub.prototype.eval = function (input)
{
    return this.children[0].eval(input) - this.children[1].eval(input);
};
sfl.sub.prototype.toString = function ()
{
    return "(" + this.children[0].toString() + " - " + this.children[1].toString() + ")";
};
sfl.sub.prototype.derivePartial = function (variable)
{

    var f = this.children[0];
    var g = this.children[1];

    var fd, gd;
    fd = sfl.isFunctionOf(f, variable);
    gd = sfl.isFunctionOf(g, variable);

    // Both functions not of variable
    if (!fd && !gd)
    {
        return new sfl.constant(0);
    }
    else if (!fd)
    {
        return new sfl.mult(new sfl.constant(-1), g.derivePartial(variable));
    }
    else if (!gd)
    {
        return f.derivePartial(variable);
    }
    return new sfl.sub(this.children[0].derivePartial(variable), this.children[1].derivePartial(variable));
};

/***********************************************************
 * 
 * @param {type} f
 * @param {type} g
 * @returns {undefined}
 */
sfl.mult = function (f, g)
{
    this.children = [f, g];
};
sfl.mult.prototype.copy = function ()
{
    return new sfl.mult(this.children[0].copy(), this.children[1].copy());
};
sfl.mult.prototype.eval = function (input)
{
    return this.children[0].eval(input) * this.children[1].eval(input);
};

sfl.mult.prototype.toString = function ()
{
    return "(" + this.children[0].toString() + " * " + this.children[1].toString() + ")";
};
sfl.mult.prototype.derivePartial = function (variable)
{

    var f = this.children[0];
    var g = this.children[1];

    var fd, gd;
    fd = sfl.isFunctionOf(f, variable);
    gd = sfl.isFunctionOf(g, variable);

    // Both functions not of variable
    if (!fd && !gd)
    {
        return new sfl.constant(0);
    }
    else if (!fd)
    {
        return new sfl.mult(f, g.derivePartial(variable));
    }
    else if (!gd)
    {
        return new sfl.mult(f.derivePartial(variable), g);
    }


    var left = new sfl.mult(this.children[0].derivePartial(variable), this.children[1]);
    var right = new sfl.mult(this.children[0], this.children[1].derivePartial(variable));

    return new sfl.add(left, right);
};

/***********************************************************
 * 
 * @param {type} f
 * @param {type} g
 * @returns {undefined}
 */
sfl.div = function (f, g)
{
    this.children = [f, g];
};
sfl.div.prototype.copy = function ()
{
    return new sfl.div(this.children[0].copy(), this.children[1].copy());
};
sfl.div.prototype.eval = function (input)
{
    return this.children[0].eval(input) / this.children[1].eval(input);
};

sfl.div.prototype.toString = function ()
{
    return "(" + this.children[0].toString() + " / " + this.children[1].toString() + ")";
};
sfl.div.prototype.derivePartial = function (variable)
{

    var f = this.children[0];
    var g = this.children[1];

    var fd, gd;
    fd = sfl.isFunctionOf(f, variable);
    gd = sfl.isFunctionOf(g, variable);

    // Both functions not of variable
    var num;
    if (!fd && !gd)
    {
        return new sfl.constant(0);
    }
    else if (!fd)
    {
        num = new sfl.mult(new sfl.constant(-1), new sfl.mult(f, g.derivePartial(variable)));
    }
    else if (!gd)
    {
        num = new sfl.mult(f.derivePartial(variable), g);
    }
    else
    {
        var left = new sfl.mult(f.derivePartial(variable), g);
        var right = new sfl.mult(f, g.derivePartial(variable));
        num = new sfl.sub(left, right);
    }



    return new sfl.div(num, new sfl.mult(this.children[1], this.children[1]));
};

/*************************************************************
 * 
 * @param {type} f
 * @returns {undefined}
 */
sfl.sqrt = function (f)
{
    this.children = [f];
};
sfl.sqrt.prototype.copy = function ()
{
    return new sfl.sqrt(this.children[0].copy());
};
sfl.sqrt.prototype.eval = function (input)
{

    return Math.sqrt(this.children[0].eval(input));

};

sfl.sqrt.prototype.toString = function ()
{
    return "sqrt(" + this.children[0].toString() + ")";
};
sfl.sqrt.prototype.derivePartial = function (variable)
{
    var f = this.children[0];
    if (!sfl.isFunctionOf(f, variable))
    {
        return new sfl.constant(0);
    }
    var num = this.children[0].derivePartial(variable);
    var denom = new sfl.mult(new sfl.constant(2), new sfl.sqrt(this.children[0]));
    return new sfl.div(num, denom);
};


/*******************************************************
 * 
 * @param {type} f
 * @param {type} g
 * @returns {undefined}
 */
sfl.pow = function (f, g)
{
    this.children = [f, g];
};
sfl.pow.prototype.copy = function ()
{
    return new sfl.pow(this.children[0].copy(), this.children[1].copy());
};

sfl.pow.prototype.eval = function (input)
{
    return Math.pow(this.children[0].eval(input), this.children[1].eval(input));
};
sfl.pow.prototype.toString = function ()
{
    return "pow(" + this.children[0].toString() + "," + this.children[1].toString() + ")";
};
sfl.pow.prototype.derivePartial = function (variable)
{

    var f = this.children[0];
    var g = this.children[1];

    var fd, gd;
    if (!sfl.isFunctionOf(f, variable))
    {
        fd = new sfl.constant(0);
    }
    else
    {
        fd = f.derivePartial(variable);
    }
    if (!sfl.isFunctionOf(g, variable))
    {
        gd = new sfl.constant(0);
    }
    else
    {
        gd = g.derivePartial(variable);
    }
    var f1 = new sfl.pow(f, new sfl.sub(g, new sfl.constant(1)));

    var f21 = new sfl.mult(g, fd);
    var f22 = new sfl.mult(f, new sfl.mult(new sfl.log(f), gd));

    return new sfl.mult(f1, new sfl.add(f21, f22));
};


/******************************************************
 * 
 * @param {type} f
 * @returns {undefined}
 */
sfl.exp = function (f)
{
    this.children = [f];
};
sfl.exp.prototype.copy = function ()
{
    return new sfl.exp(this.children[0].copy());
};
sfl.exp.prototype.eval = function (input)
{
    return Math.exp(this.children[0].eval(input));
};
sfl.exp.prototype.toString = function ()
{
    return "exp(" + this.children[0].toString() + ")";
};
sfl.exp.prototype.derivePartial = function (variable)
{
    var f = this.children[0];
    if (!sfl.isFunctionOf(f, variable))
    {
        return new sfl.constant(0);
    }
    return new sfl.mult(new sfl.exp(f), f.derivePartial(variable));
};

/******************************************************
 * 
 * @param {type} f
 * @returns {undefined}
 */
sfl.log = function (f)
{
    this.children = [f];
};
sfl.log.prototype.copy = function ()
{
    return new sfl.log(this.children[0].copy());
};
sfl.log.prototype.eval = function (input)
{
    return Math.log(this.children[0].eval(input));
};
sfl.log.prototype.toString = function ()
{
    return "log(" + this.children[0].toString() + ")";
};
sfl.log.prototype.derivePartial = function (variable)
{
    var f = this.children[0];
    if (!sfl.isFunctionOf(f, variable))
    {
        return new sfl.constant(0);
    }
    return new sfl.div(f.derivePartial(variable), f);
};
/***************************************************
 * 
 * @param {type} f
 * @returns {undefined}
 */
sfl.sin = function (f)
{
    this.children = [f];
};
sfl.sin.prototype.copy = function ()
{
    return new sfl.sin(this.children[0].copy());
};
sfl.sin.prototype.eval = function (input)
{
    return Math.sin(this.children[0].eval(input));
};
sfl.sin.prototype.toString = function ()
{
    return "sin(" + this.children[0].toString() + ")";
};
sfl.sin.prototype.derivePartial = function (variable)
{
    var f = this.children[0];
    if (!sfl.isFunctionOf(f, variable))
    {
        return new sfl.constant(0);
    }
    return new sfl.mult(new sfl.cos(f), f.derivePartial(variable));
};

/*************************************************
 * 
 * @param {type} f
 * @returns {undefined}
 */
sfl.cos = function (f)
{
    this.children = [f];
};
sfl.cos.prototype.copy = function ()
{
    return new sfl.cos(this.children[0].copy());
};
sfl.cos.prototype.eval = function (input)
{
    return Math.cos(this.children[0].eval(input));
};
sfl.cos.prototype.toString = function ()
{
    return "cos(" + this.children[0].toString() + ")";
};
sfl.cos.prototype.derivePartial = function (variable)
{
    var f = this.children[0];
    if (!sfl.isFunctionOf(f, variable))
    {
        return new sfl.constant(0);
    }
    return new sfl.mult(new sfl.constant(-1), new sfl.mult(new sfl.sin(f), f.derivePartial(variable)));
};


/*******************************************************
 * 
 * @param {type} f
 * @returns {undefined}
 */
sfl.tan = function (f)
{
    this.children = [f];
};
sfl.tan.prototype.copy = function ()
{
    return new sfl.tan(this.children[0].copy());
};
sfl.tan.prototype.eval = function (input)
{
    return Math.sin(this.children[0].eval(input));
};
sfl.tan.prototype.toString = function ()
{
    return "tan(" + this.children[0].toString() + ")";
};
sfl.tan.prototype.derivePartial = function (variable)
{
    var f = this.children[0];
    if (!sfl.isFunctionOf(f, variable))
    {
        return new sfl.constant(0);
    }

    var num = new sfl.mult(new sfl.constant(2), f.derivePartial(variable));
    var denom1 = new sfl.cos(new sfl.mult(new sfl.constant(2), f));
    var denom2 = new sfl.add(denom1, new sfl.constant(1));
    return new sfl.div(num, denom2);
};




/*************************************************
 * 
 * @param {type} s
 * @returns {undefined}
 */
sfl.fromString = function (s)
{
    var rpn = shuntingYard(s);
    return sfl.fromRPN(rpn);
};

/************************************************
 * 
 * @param {type} s
 * @returns {Object}
 */
sfl.fromRPN = function (s) {

    var stack = [];
    var unaryFunctions = ["sin", "cos", "tan", "exp", "log", "sqrt"];
    var binaryFunctions = ["pow"];
    var binaryOperators = ["+", "*", "/", "^", "-"];
    var binaryOperatorFunctions = ["add", "mult", "div", "pow", "sub"];
    var unaryOperators = ["m"];
    var unaryOperatorFunctions = ["neg"];
    var variables = ["x", "y", "z","t"];
    for (var i = 0; i < s.length; i++) {
        var v = s[i];
        var bno = binaryOperators[v];
        if (isNumber(v)) {
            stack.push(new sfl.constant(v));
            continue;
        } else if (binaryOperators.indexOf(v) >= 0) {
            var v2 = stack.pop();
            var v1 = stack.pop();

            var index = binaryOperators.indexOf(v);
            stack.push(new sfl[binaryOperatorFunctions[index]](v1, v2));
        } else if (binaryFunctions.indexOf(v) >= 0) {

            var v2 = stack.pop();
            var v1 = stack.pop();
            stack.push(new sfl[binaryFunctions[binaryFunctions.indexOf(v)]](v1, v2));
        } else if (unaryFunctions.indexOf(v) >= 0) {
            var v1 = stack.pop();
            stack.push(new sfl[unaryFunctions[unaryFunctions.indexOf(v)]](v1));
        } else if (variables.indexOf(v) >= 0) {
            stack.push(new sfl.id(v));
        } else if (v === "m") {
            var v1 = stack.pop();
            stack.push(new sfl.mult(new sfl.constant(-1), v1));
        }

    }

    return stack.pop();
};


/***************************************
 * 
 */
var constf = new sfl.constant(10);
var cosf = new sfl.cos(new sfl.id("x"));
var sinf = new sfl.sin(constf);

var tester = function (s) {
    var f = sfl.fromString(s);
    console.log("F:");
    console.log(f.toString());
    var fx = f.derivePartial("x");
    var fy = f.derivePartial("y");
    var fz = f.derivePartial("z");

    console.log("Fx:");
    console.log(fx.toString());
    console.log(sfl.simplify(fx).toString());
    console.log("Fy:");
    console.log(fy.toString());
    console.log(sfl.simplify(fy).toString());
    console.log("Fz:");
    console.log(fz.toString());
    console.log(sfl.simplify(fz).toString());


    console.log("Hessian");
    var fxx = fx.derivePartial("x");
    var fxy = fx.derivePartial("y");
    var fxz = fx.derivePartial("z");

    var fyy = fy.derivePartial("y");
    var fyz = fy.derivePartial("z");
    var fzz = fz.derivePartial("z");

    console.log("Fxx:");
    console.log(fxx.toString());
    console.log(sfl.simplify(fxx).toString());
    console.log("Fyy:");
    console.log(fyy.toString());
    console.log(sfl.simplify(fyy).toString());
    console.log("Fzz:");
    console.log(fzz.toString());
    console.log(sfl.simplify(fzz).toString());
    console.log("Fxy:");
    console.log(fxy.toString());
    console.log(sfl.simplify(fxy).toString());
    console.log("Fxz:");
    console.log(fxz.toString());
    console.log(sfl.simplify(fxz).toString());
    console.log("Fyz:");
    console.log(fyz.toString());
    console.log(sfl.simplify(fyz).toString());

};
