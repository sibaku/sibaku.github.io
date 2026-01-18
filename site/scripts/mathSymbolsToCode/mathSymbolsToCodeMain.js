import { makeJsEditor, FileSource, themes, createCodeEditor, createEditorState } from "../lib/editorCommon.js";

function makeExampleSummation(containerId, appContext) {
    const scriptDemoJs = `
// here we define the function f and the minimum/maximum index startI/n

function f(i){
    // just return the number itself, so we sum the first n numbers
    return i;
}
// define the maximum index
const startI = 1;
const n = 10;
`;

    const scriptSummationJs = `
// You can change the function f in the Demo.js tab!

// this will contain the result in the end
let sum = 0;
// go from startI to n
// ATTENTION! The last index is n, so we use <= instead of <
for(let i = startI; i <= n; i++){
    // the i-th entry, here given as a function
    sum += f(i);
    // subscripts are also commonly associated with arrays, so the i-th element is just the i-th entry of some array like the following line:
    // sum += f[i];
}

output.log(\`The sum of all f_i from \${startI} to \${n} is: \${sum}\`);
output.log(\`The entries f_i:\`);
[...new Array(n - startI + 1).keys()].map(i => (i + startI) + ": " + (i + startI)).forEach(x => output.log(x));
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: scriptSummationJs.trim(), name: "Summation.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}

function makeExampleProduct(containerId, appContext) {
    const scriptDemoJs = `
// here we define the function f and the minimum/maximum index startI/n

function f(i){
    // just return the number itself, so we multiply the first n numbers, which is called the factorial
    return i;
}
// define the maximum index
const startI = 1;
const n = 6;
`;

    const scriptProductJs = `
// You can change the function f in the Demo.js tab!

// this will contain the result in the end
let product = 1;
// go from startI to n
// ATTENTION! The last index is n, so we use <= instead of <
for(let i = startI; i <= n; i++){
    // the i-th entry, here given as a function
    product *= f(i);
    // subscripts are also commonly associated with arrays, so the i-th element is just the i-th entry of some array like the following line:
    // sum *= f[i];
}
output.log(\`The product of all f_i from \${startI} to \${n} is: \${product}\`);
output.log(\`The entries f_i:\`);
[...new Array(n - startI + 1).keys()].map(i => (i + startI) + ": " + (i + startI)).forEach(x => output.log(x));
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: scriptProductJs.trim(), name: "Product.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}


function makeExampleSetSummation(containerId, appContext) {
    const scriptDemoJs = `
// define the set S and the function f

// here we use a set, but other containers can be used the same
const S = new Set([1,3,5,7,9]);

function f(x){
    // compute x^2, so the sum of squared terms
    return x * x;
}
output.log("Compute the sum of the first 5 odd squared integers");
`;

    const scriptJs = `
// You can change the function f in the Demo.js tab!

// this will contain the result in the end
let sum = 0;
// go over all elements stored in S
for(const x of S){
    // x is an element, add the result of applying f to x to the sum
    sum += f(x);
}
output.log(\`The sum of all f_i is: \${sum}\`);
output.log("The entries of S");
S.forEach(x => output.log(x));
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "SummationSet.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}

function makeExampleIndexSetSummation(containerId, appContext) {
    const scriptDemoJs = `
// define the index set I, the element vector x and the function f

// here we use a set, but other containers can be used in the same way
const I = new Set([0,1,2,3,4,5]);

// the vector can contain duplicates
const x = [1,5,10,10,5,1];

function f(x){
    return x;
}
output.log("Compute the sum of the 6-th row of pascal's triangle");
`;

    const scriptJs = `
// You can change the function f in the Demo.js tab!

// this will contain the result in the end
let sum = 0;
// go over all indices stored in I
for(const i of I){
    // i is an index corresponding to some element x. Usually, you would store these in some array-like structure, which addresses elements by their index, like in this example
    sum += f(x[i]);
}
output.log(\`The sum of all f_i is: \${sum}\`);
output.log("The entries of I");
I.forEach(x => output.log(x));
output.log("The entries of x");
x.forEach((x,i) => output.log(\`\${i}: \${x}\`));
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "SummationIndexSet.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}


function makeExampleNestedSummation(containerId, appContext) {
    const scriptDemoJs = `
// define f and ranges
function f(i,j){
    return i*j;
}

const startI = 1;
const n = 2;

const startJ = 1;
const m = 3;

output.log("f(i,j) = i*j");
`;

    const scriptJs = `
// You can change the function f in the Demo.js tab!

// this will contain the result in the end
let sum = 0;
// go from startI to n for the first/outer loop
// ATTENTION! The last index is n, so we use <= instead of <
for(let i = startI; i <= n; i++) {
    // go from 0 to m for the second/inner loop
    // ATTENTION! The last index is m, so we use <= instead of <
    for(let j = startJ; j <= m; j++) {
        // the entry (i,j), here given as a function
        sum += f(i,j);
        // subscripts are also commonly associated with arrays. In this case, this would be a 2D array. Then the element (i,j) in a 2D array f would look like the following:
        // sum += f[i][j];
        // in some languages, 2D arrays exist as well, in which case it would be f[i,j]
    }
}
output.log(\`The sum of all f_{i,j} from i = \${startI} to \${n}, j = \${startJ} to \${m} is: \${sum}\`);
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "SummationNested.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}

function makeExampleDecoupledNestedSummation(containerId, appContext) {
    const scriptDemoJs = `
// define f and ranges
function f(i){
    return i;
}

function g(j){
    return j*j;
}

const startI = 1;
const n = 2;

const startJ = 1;
const m = 2;

output.log("f(i) = i, g(j) = j*j");
`;

    const scriptJs = `
// You can change the function f in the Demo.js tab!

// this will contain the result in the end
let sum = 0;
// go from startI to n for the first/outer loop
// ATTENTION! The last index is n, so we use <= instead of <
for(let i = startI; i <= n; i++) {
    // since f_i is independent of j, we can compute the value here. This allows us to not compute the same value j-times
    const fi = f(i);
    // in array notation
    // const fi = f[i];
    
    // this is the sum of the inner loop
    var sumG = 0;

    // go from startJ to m for the second/inner loop
    // ATTENTION! The last index is m, so we use <= instead of <
    for(let j = startJ; j <= m; j++) {
        // the inner entry is independent of f
        sumG += g(j);
        // in array notation
        // sumG += g[j];
    }
    // apply f_i to the sum of the inner loop, that is the entry to add to the outer sum
    sum += fi * sumG;
}
output.log(\`The sum of all (i,j) entries with f_i, g_j from i = \${startI} to \${n}, j = \${startJ} to \${m} is: \${sum}\`);
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "SummationNestedDecoupled.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}


function makeExampleConditionalSummation(containerId, appContext) {
    const scriptDemoJs = `
// define f, the range and the predicate p
function f(i){
    return i;
}

function p(i){
    // only even numbers
    return i % 2 == 0;
}

const startI = 1;
const n = 10;

output.log("f(i) = i, p(i) = isEven(i)");
`;

    const scriptJs = `
// You can change the function f in the Demo.js tab!

// this will contain the result in the end
let sum = 0;
// go from startI to n
// ATTENTION! The last index is n, so we use <= instead of <
for(let i = startI; i <= n; i++) {
    // check, if the condition p holds. If not, skip this index
    if(!p(i)) {
        continue;
    }
    // the i-th entry, here given as a function
    sum += f(i);
    // subscripts are also commonly associated with arrays, so the i-th element is just the i-th entry of some array like the following line:
    // sum += f[i];
}
output.log(\`The sum of all f_i from \${startI} to \${n} is: \${sum}\`);
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "SummationConditional.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}


function makeExampleUnion(containerId, appContext) {
    const scriptDemoJs = `
// here we define f and the ranges

// f is a function here, but we will just take the index and look in an array
const sets = [
    new Set([1,2,3]),
    new Set([1,4]),
    new Set([1,2,3,5]),
    new Set([2,5,9]),
    new Set([13]),
];

// iteration term, depending on the implementation, we could just use the array directly
function f(i){
    return sets[i];
}

// ranges
const startI = 0;
const n = sets.length - 1;

output.log("All sets:");
sets.forEach(s => output.log(\`{\${Array.from(s).join(", ")}}\`));
output.log();
`;
    const setOperationJs = `
function union(a,b){
    // depending on your browser, the Set class might have a union method. If not, this is a simple replacement

    // new empty set
    // set takes care of ignoring duplicates
    let result = new Set();

    // add all entries of a
    for (const v of a) {
        result.add(v);
    }
    // add all entries of b
    for (const v of b) {
        result.add(v);
    }

    return result;
}
`;

    const scriptJs = `
let v = new Set();

for(let i = startI; i <= n; i++){
    // union is defined in SetOperation.js
    v = union(v,f(i));
}

output.log(\`The union of all sets for i = \${startI} to \${n}: {\${Array.from(v).join(", ")}}\`);
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: setOperationJs.trim(), name: "SetOperations.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "Union.js" }),
        ],
        openFileIndex: 2,
        autocompleteObjects: [],
        enableContent: false,
    });
}


function makeExampleIntersection(containerId, appContext) {
    const scriptDemoJs = `
// here we define f and the ranges

// f is a function here, but we will just take the index and look in an array
const sets = [
    new Set([1,2,3]),
    new Set([1,7,2]),
    new Set([1,2,3,5]),
    new Set([2,1,9]),
    new Set([1,2,28,17,13]),
];

// iteration term, depending on the implementation, we could just use the array directly
function f(i){
    return sets[i];
}

// ranges
const startI = 0;
const n = sets.length - 1;

output.log("All sets:");
sets.forEach(s => output.log(\`{\${Array.from(s).join(", ")}}\`));
output.log();
`;
    const setOperationJs = `
function intersection(a,b){
    // depending on your browser, the Set class might have a intersection method. If not, this is a simple replacement
    // new empty set
    let result = new Set();

    // the intersection is at most as big as the smaller set, since elements must be contained in both. So we make a always the smaller one
    if(a.size > b.size){
        // destructuring swap
        [a, b] = [b, a];
    }

    // add all entries of a, if they are also in b
    for (const v of a) {
        if(b.has(v)){
            result.add(v);
        }
    }

    return result;
}
`;

    const scriptJs = `
// we handle this one a bit special
if(n - startI < 0){
    // handle special case -> set of all possible values
}else{
    // use first value as input
    let v = new Set(f(startI))

    // we start one after the first, as we already included that one
    for(let i = startI+1; i <= n; i++){
        v = intersection(v,f(i));
    }

    output.log(\`The intersection of all sets for i = \${startI} to \${n}: {\${Array.from(v).join(", ")}}\`);
}
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: setOperationJs.trim(), name: "SetOperations.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "Intersection.js" }),
        ],
        openFileIndex: 2,
        autocompleteObjects: [],
        enableContent: false,
    });
}

function makeExampleCases(containerId, appContext) {
    const scriptDemoJs = `
// code for the above example
function f(x){
    if(x <= 0){
        return 0;
    } else if (x < 1){
        return x;
    } else {
        return 1;
    }
}
`;

    const scriptJs = `
// compute the function for a few values
const xv = [-2, -1, 0, 0.5, 1, 2];

output.log("Apply function:");
xv.forEach(x=> output.log(\`f(\${x}) = \${f(x)}\`));
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "Cases.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}


function makeExampleCompose(containerId, appContext) {
    const scriptDemoJs = `
function compose(f,g,x){
    // Note, depending on your language, you can't just pass a function as a parameter. In that case, you must follow the conventions of that language, for example using interfaces
    return g(f(x));
}
`;

    const scriptJs = `
// define functions and apply
function f(x){
    return 2*x + 1;
}

function g(x){
    return x*x;
}

// compute the function for a few values
const xv = [-2, -1, 0, 1, 2];

output.log("f(x) = 2x + 1");
output.log("g(x) = x*x");

output.log("Apply function:");
xv.forEach(x=> output.log(\`f(\${x}) = \${f(x)}, h(\${x}) = f(g(\${x})) = \${compose(f,g,x)}\`));
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "Compose.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}

function makeExampleComposeNewFunc(containerId, appContext) {
    const scriptDemoJs = `
function compose(f,g){
    // Note, depending on your language, you can't just pass a function as a parameter. In that case, you must follow the conventions of that language, for example using interfaces
    return x => g(f(x));
}
`;

    const scriptJs = `
// define functions and apply
function f(x){
    return 2*x + 1;
}

function g(x){
    return x*x;
}

const h = compose(f,g);

// compute the function for a few values
const xv = [-2, -1, 0, 1, 2];

output.log("f(x) = 2x + 1");
output.log("g(x) = x*x");

output.log("Apply function:");
xv.forEach(x=> output.log(\`f(\${x}) = \${f(x)}, h(\${x}) = f(g(\${x})) = \${h(x)}\`));
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "Demo.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "Compose.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}
function makeExampleIn(containerId, appContext) {
    const scriptDemoJs = `
// Implementation of the in operator for sets made up of object keys:
function inObject(element, objSet){
    return element in objSet;
}
// Implementation of the in operator for sets made up of array elements
function inArray(element, arr){
    return arr.includes(element);
    // or using the indexOf function
    // return arr.indexOf(element) >= 0;
}
// Implementation of the in operator for the Set class
function inSet(element, set){
    return set.has(element);
}
`;

    const scriptJs = `
// set up the same set in different structures
const arraySet = [1,3,42];
const set = new Set(arraySet);

const objSet = {};
for(const k of arraySet){
    objSet[k] = true;
}

// values to test, one inside and one not

output.log(\`Object set: \${JSON.stringify(objSet)}\`);
output.log(\`Array set: [\${arraySet.join(", ")}]\`);
output.log(\`Set: [\${[...set.keys()].join(", ")}]\`);


const test = [42,5];

for(const t of test){
    output.log(\`Value \${t} in object: \${inObject(t,objSet)}\`);
    output.log(\`Value \${t} in array: \${inArray(t,arraySet)}\`);
    output.log(\`Value \${t} in set: \${inSet(t,set)}\`);
}
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptDemoJs.trim(), name: "In.js" }),
            new FileSource({ initialText: scriptJs.trim(), name: "Script.js" }),
        ],
        openFileIndex: 1,
        autocompleteObjects: [],
        enableContent: false,
    });
}

function makeExampleFactorial(containerId, appContext) {

    const scriptJs = `
function factorial(n){
    // you could add a check, if n < 0 and then throw an error here
    // code is the same as if we were to apply the product iteration
    let f = 1;
    // we could also just start with i = 2, since 1 does not change f
    for(let i= 1; i <= n; i++){
        f *= i;
    }

    return f;
}

for(let i = 0; i < 10; i++){
    output.log(\`\${i}! = \${factorial(i)}\`);
}
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptJs.trim(), name: "Factorial.js" }),
        ],
        openFileIndex: 0,
        autocompleteObjects: [],
        enableContent: false,
    });
}

function makeExampleBinomial(containerId, appContext) {

    const scriptJs = `
function binom(n,k){
    if(k > n){
        // there are 0 ways to choose more items than there are
        return 0;
    }
    let p = 1.0;
    if(k > n-k){
        // switch n with n-k if the latter is smaller
        k = n-k;
    }
    // apply the product formula
    for(let i = 1; i <= k; i++){
        // multiply first to avoid non-integer division
        // javascript doesn't strictly have integers, but in general this might be useful
        p *= n + 1 - i;
        p /= i;
    }
    return p;
}

const n = 10;
output.log(\`Display all binomial coefficients up to n = \${n}\`);
output.log("Each line i will show the binomial coefficients i over k");

for(let i = 0; i <= n; i++){
    const b = [];
    for(let k = 0; k <= i; k++){
        b.push(binom(i,k));
    }
    output.log(\`\${i}: \${b.join(" ")}\`);
}
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptJs.trim(), name: "Binomial.js" }),
        ],
        openFileIndex: 0,
        autocompleteObjects: [],
        enableContent: false,
    });
}

function makeExampleDerivative(containerId, appContext) {

    const scriptJs = `
function derivative(f, x, h=1E-7){
    return (f(x + h) - f(x)) / h;
}

let x = 10;
output.log(\`Compute the derivative of f(x) = 10x at x = \${x} (the numerical derivative is exact for linear and constant functions, aside from numerical precision)\`);

const fLinear = x => 10*x;
// actual derivative: f'(x) = 10
const dfLinearDxCorrect = x => 10;
output.log(\`Correct derivative: \${dfLinearDxCorrect(x)}\`);
output.log(\`Estimated derivative: \${derivative(fLinear,x)}\`);

x = 5;
output.log(\`Compute the derivative of f(x) = sin(x) at x = \${x}\`);

// actual derivative: f'(x) = cos(x)
const dSinDxCorrect = Math.cos;
output.log(\`Correct derivative: \${dSinDxCorrect(x)}\`);
output.log(\`Estimated derivative: \${derivative(Math.sin,x)}\`);
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptJs.trim(), name: "Derivative.js" }),
        ],
        openFileIndex: 0,
        autocompleteObjects: [],
        enableContent: false,
    });
}


function makeExamplePartialDerivative(containerId, appContext) {

    const scriptJs = `
function partialDerivative(f, x, index, h=1E-7){
    // calculate f(x)
    const fx = f(x);
    // cache the current value in the vector
    const currentXi = x[index];
    // calculate f(x_1, ..., x_i + h, ... x_n)
    x[index] += h;
    const fxh = f(x);
    // restore old x, this might not be needed depending on the situation
    x[index] = currentXi;
    return (fxh - fx) / h;
}

// the point where to evaluate
let x = [2,4];
// the function to compute
// in math, indices usually start at 1, but in code mostly at 0
// here we number the variables starting at 0
// x -> x[0], y -> x[1]
let f = x => x[0] + 2*x[1] + x[0]*x[1];
let dfdx0 = x => 1 + x[1];
let dfdx1 = x => 2 + x[0];

output.log(\`Compute the derivative of f(x,y) = x + 2y + x*y at x = (\${x.join(", ")})\`);
output.log(\`Correct df/dx: \${dfdx0(x)}\`);
output.log(\`Estimated df/dx: \${partialDerivative(f,x, 0)}\`);
output.log(\`Correct df/dy: \${dfdx1(x)}\`);
output.log(\`Estimated df/dy: \${partialDerivative(f,x, 1)}\`);
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptJs.trim(), name: "PartialDerivative.js" }),
        ],
        openFileIndex: 0,
        autocompleteObjects: [],
        enableContent: false,
    });
}

function makeExampleGradient(containerId, appContext) {

    const scriptJs = `
function gradient(f, x, h=1E-7){
    // create the gradient vector with the length of x
    const n = x.length;
    const g = Array(n);

    // in our simple version, we only need to compute f(x) once
    const fx = f(x);
    // generate the values the same way as in the previous section
    for(let i = 0; i < n; i++){
    // cache the current value in the vector
        const currentXi = x[i];
        // calculate f(x_1, ..., x_i + h, ... x_n)
        x[i] += h;
        const fxh = f(x);
        // restore old x
        x[i] = currentXi;
        // set gradient value
        g[i] = (fxh - fx) / h;
    }
    return g;
}

// the point where to evaluate
let x = [2,4];
// the function to compute
// in math, indices usually start at 1, but in code mostly at 0
// here we number the variables starting at 0
// x -> x[0], y -> x[1]
let f = x => x[0] + 2*x[1] + x[0]*x[1];
let dfdx0 = x => 1 + x[1];
let dfdx1 = x => 2 + x[0];
// the gradient is the vector of partial derivatives
const gradF = x => [dfdx0(x), dfdx1(x)];

output.log(\`Compute the gradient of f(x,y) = x + 2y + x*y at x = (\${x.join(", ")})\`);
output.log(\`Correct gradient: (\${gradF(x).join(", ")})\`);
output.log(\`Estimated gradient: (\${gradient(f,x).join(", ")})\`);
`;
    makeJsEditor(containerId, appContext, {
        files: [
            new FileSource({ initialText: scriptJs.trim(), name: "Gradient.js" }),
        ],
        openFileIndex: 0,
        autocompleteObjects: [],
        enableContent: false,
    });
}


export {
    makeExampleSummation,
    makeExampleProduct,
    makeExampleSetSummation,
    makeExampleIndexSetSummation,
    makeExampleNestedSummation,
    makeExampleDecoupledNestedSummation,
    makeExampleConditionalSummation,
    makeExampleUnion,
    makeExampleIntersection,
    makeExampleCases,
    makeExampleCompose,
    makeExampleComposeNewFunc,
    makeExampleIn,
    makeExampleFactorial,
    makeExampleBinomial,
    makeExampleDerivative,
    makeExamplePartialDerivative,
    makeExampleGradient,
};