//---------------------------------
// Notes:
// The following isn't highly optimized, but hopefully easy to read for that reason
// There won't be full library-grade documentation, but there will be comments explaining the code, where it might not be clear what is meant
//---------------------------------

//---------------------------------
// Basic vector functions
// All 2D vectors are represented by a simple array [x,y]
//---------------------------------

// small value: 1E-7 is a shorthand for 0.0000001
const EPSILON = -1E7;


// dot product
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}

function vadd(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function vsub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}

// scales a vector by scalar (a number)
function vscale(a, s) {
    return [a[0] * s, a[1] * s];
}

// applies the floor operation to each vector component
function vfloor(a) {
    return [Math.floor(a[0]), Math.floor(a[1])];
}
// applies the ceil operation to each vector component

function vceil(a) {
    return [Math.ceil(a[0]), Math.ceil(a[1])];
}

// returns the componentwise min
function vmin(a, b) {
    return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
}
// returns the componentwise max
function vmax(a, b) {
    return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
}


// computes the squared length
function len2(a) {
    return a[0] * a[0] + a[1] * a[1];
}

// computes the length
function len(a) {
    return Math.sqrt(len2(a));
}

// normalizes a vector (vector divided by its length)
// AS A CONVENTION TO MAKE THINGS EASIER HERE: If the vector is approximately zero, the zero vectors is returned
function normalize(a) {
    const l2 = len2(a);
    // checks if its approximately zero
    if (l2 < EPSILON) {
        return [0, 0];
    }
    return vscale(a, 1 / Math.sqrt(l2));
}

// reflect a vector along a normal
// you can find this formula at various places, for example here: https://www.sunshine2k.de/articles/coding/vectorreflection/vectorreflection.html
function reflect(i, n) {
    // r = i - 2(dot(i,n))n
    return vsub(i, vscale(n, 2 * dot(i, n)));
}


export {
    dot,
    vadd,
    vsub,
    vscale,
    vfloor,
    vceil,
    vmin,
    vmax,
    len2,
    len,
    normalize,
    reflect,
    EPSILON,
}