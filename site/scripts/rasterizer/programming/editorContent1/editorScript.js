// Most comments are written out as output text so you will know, which outputs are for what

// helper functions

// LaTeX is a powerful typesetting tool. You can use the full subset provided by the katex library here, but you don't need to know any specifics. Here, we will define some helpers to abstract it away. The math just looks nicer!

// there are also two premade functions that convert latex formulas to html elements

// renderLatex : renders inline
// renderLatexBlock: renders as a block (aligned in the middle) 

// latex helper functions
const bold_name = (name) => `\\mathbf{${name}}`
// creates text formatting
const text = (str) => `\\text{${str}}`
// write a name with a right hand side
const formula = (name, rightHandSide,) => {
    const s = (name ? name + " = " : "") + rightHandSide
    return s;
};

// output math and render, this is just for making writing easier
// you could combine the renderLatex method with others to create special html elements
const output_math = (str) => output.html(renderLatex(str));

output.log("Random 4D vector");
const a = v32.rand(4);

output_math(formula(bold_name("a"), toLatex(a)));

// you can configure the toLatex function to specify maximum decimals, the default is 3
output_math(formula(bold_name("a"), toLatex(a, { maxDecimals: 6 })));

// you can also just write normal text
output.log(`a = \n${jsm.toString(a)}`);

// or as an array
output.log(`a = [${jsm.toArray(a).join(", ")}]`);


output.log("Change the coordinate 0 to 10")
a.set(10, 0),
    output_math(formula(bold_name("a"), toLatex(a)));

output.log("Create a subvector view of size 2 starting from the second coordinate (index 1)");
const a2 = subvec(a, 1, 2);
output_math(formula(bold_name("a_2"), toLatex(a2)));

output.log("Set coordinate of view and show values of original vector");
a2.set(0, 0);
a2.set(1, 1);
output_math(formula(bold_name("a"), toLatex(a)));

output.log("Access an element of the vector");
output_math(formula("a_x", a.at(0)));

output.log("Create a 3D vector from values");
const b = vec3(1, 2, 3);
// alternatively, use the jsmatrix factory method
// const b = v32.from([1,2,3]);
output_math(formula(bold_name("b"), toLatex(b)));

const x = vec3(1, 0, 0);

const c = vec3(1, 1, 0);

output.log("Compute dot product of x and c");
output_math(formula(text("dot"), dot(x, c)));

output.log("Compute cross product of x and c");
output_math(formula(text("cross"), toLatex(cross(x, c))));


output.log("Random matrix");

const A = m32.rand(2, 2);

output_math(formula(bold_name("A"), toLatex(A)));

output.log("get diagonal -> this is a view and points to the data of A")
const a_diag = diag(A);
output_math(formula(bold_name("A_{d}"), toLatex(a_diag)));

output.log("Fill diagonal with a vector of the correct size")
insert(a_diag, vec2(1, 2));

// show changes
output_math(formula(bold_name("A"), toLatex(A)));


output.log("Set the cross diagonal terms");
A.set(3, 1, 0);
A.set(4, 0, 1);

// show changes
output_math(formula(bold_name("A"), toLatex(A)));

output.log("Multiply A with a vector (1,2)");
output_math(toLatex(mult(A, vec2(1, 2))));

output.log("Multiply two vectors (1,2,3) and(4,5,6) componentwise");

output_math(toLatex(cwiseMult(vec3(1,2,3), vec3(4,5,6))));

