import * as alg from "../bundles/algeobra.bundle.min.js";

import * as jsm from "../bundles/jsmatrix.bundle.min.js"

import renderMathInElement from "../extern/katex/contrib/auto-render.mjs";


import {
    makeSlider,
    makeContainer,
    makeTextField,
    makeUpdateSlider,
    makeCheckboxNoLabel,
    makeOptions,
    makeHeadline,
    makeCanvas,
    makeSpan,
} from "../lib/commonHtmlHelper.js";


function coordinateSystems(containerId) {

    const canvas = makeCanvas(400, 400);
    canvas.classList.add("tutCanvas");

    const container = document.getElementById(containerId);
    container.append(canvas);

    // get some fields for easier writing 
    const {
        DefPoint,
        DefVector,
        DefNumber,
        DefCoordSystem,
        DefCoordSystemOps,
        DefNormalVector,
        DefSelect,
        DefArray,
        DefFunc,
        DefBoolean,
        DefMidPoint,
        DefText,
        DefLine,
        fromPoints,
        makeNumber,
        makePoint,
        makeLine,
        DefConditional,
        EMPTY_INFO,
        TYPE_POINT,
        EMPTY,
        Vec2,
    } = alg;

    // in this demo we will define three coordinate systems relative to each other in different ways.
    // one is defined by draggable points, one by sliders and another one spins around
    // a vector is then defined locally in one of these systems and can be decomposed with respect to all others

    // create a new scene
    const scene = new alg.GeometryScene();

    // this is the diagram we will draw into
    // it is a predefined class to display a scene on a HTML canvas
    // we pass in the min/max corners of the coordinate system viewport that we want to see
    // we will flip y, as otherwise there might be some confusion when defining directions due to the canvas being a left-handed system
    const diagram = new alg.DiagramCanvas({ x0: -2, y0: -2, x1: 5, y1: 5, flipY: true, canvas });
    // this object will take care of drawing/redrawing our scene when anything changes
    // we draw a basic background, since we are drawing a funcion
    const diagPainter = new alg.DiagramPainter(scene, diagram, {
        bg: alg.BASIC_BACKGROUND_CONFIG,
        autoResize: {
            target: container,
            keepAspect: false,
            minWidth: canvas.width,
            widthFactor: 0.8,
        },
    });

    // you can set the "invisible" field in the properties of an object. The drawing operation will then not draw this object
    // that way, we can hide intermediate objects that are just used for construction
    // we use this variable, so we can very easily toggle showing these objects, which is useful for debugging
    const invisible = true;

    // z-values
    const pointZ = -1;

    const origin0 = scene.add(new DefPoint(0, 0), EMPTY_INFO, {
        z: pointZ,
        style: {
            r: 6,
            fillStyle: "gray",
        }
    });
    const p1 = scene.add(new DefPoint(1, 0), EMPTY_INFO, {
        z: pointZ,
        style: {
            r: 6,
            fillStyle: "gray",
        }
    });

    const u0 = scene.add(new DefVector({ normalize: true }), DefVector.fromPoints(origin0, p1), { invisible });

    const v0 = scene.add(new DefNormalVector(), DefNormalVector.fromVector({ v: u0 }), { invisible });
    // const v0 = scene.add(new DefVector({ normalize: true }), DefVector.fromPoints(origin0, p2), { invisible });

    // We will add a line segment underneath to show the relation of the points even with normalized vectors
    const lowerLineProps = {
        z: 2,
        style: {
            strokeStyle: "gray",
            lineStyle: {
                lineDash: [4],
            },
        }
    };
    const lineU = scene.add(new DefLine(), DefLine.fromPoints(origin0, p1), lowerLineProps);


    // helper to make coordinate system style
    // a coordinate system is composed of a point and two vectors and their style data is the same 
    // as the cooresponding primitives
    const makeCoordStyle = (colorU, colorV, lineWidth = 1) => {
        return {
            u: {
                shaft: {
                    fillStyle: colorU,
                    strokeStyle: colorU,
                    lineStyle: {
                        lineWidth,
                    },
                },
                arrow: {
                    fillStyle: colorU,
                    strokeStyle: colorU,
                    lineStyle: {
                        lineWidth,
                    },
                }
            },
            v: {
                shaft: {
                    fillStyle: colorV,
                    strokeStyle: colorV,
                    lineStyle: {
                        lineWidth,
                    },
                },
                arrow: {
                    fillStyle: colorV,
                    strokeStyle: colorV,
                    lineStyle: {
                        lineWidth,
                    },
                }
            },
        };
    };

    // first system defined by the origin point and the two vectors attached
    const c0 = scene.add(new DefCoordSystem(),
        DefCoordSystem.fromValues({ origin: origin0, u: u0, v: v0 }), {
        style: makeCoordStyle("#D81B60", "#1E88E5", 3),
    });




    const origin1 = scene.add(new DefPoint(2, 2), EMPTY_INFO, {
        z: pointZ,
        style: {
            r: 6,
            fillStyle: "gray",
        }
    });
    const q1 = scene.add(new DefPoint(3, 3), EMPTY_INFO, {
        z: pointZ,
        style: {
            r: 6,
            fillStyle: "gray",
        }
    });

    const x0 = scene.add(new DefVector({ normalize: true }), DefVector.fromPoints(origin1, q1), { invisible });
    const y0 = scene.add(new DefNormalVector(), DefNormalVector.fromVector({ v: x0 }), { invisible });


    const lineX = scene.add(new DefLine(), DefLine.fromPoints(origin1, q1), lowerLineProps);



    const worldPoint = scene.add(new DefPoint(-1, 3), EMPTY_INFO, {
        z: pointZ,
        style: {
            r: 6,
            fillStyle: "black",
        }
    });

    const wpointOffsetV = scene.add(new DefVector({ x: -0.2, y: -0.2 }), DefVector.fromRefVector({ ref: worldPoint }), { invisible });

    const wpOffset = scene.add(new DefPoint(), DefPoint.fromPointOrVector(wpointOffsetV), { invisible });
    const wpText = scene.add(new DefText({ text: "p" }), DefText.fromObjectRef({ ref: wpOffset }));
    const manip = alg.PointManipulator.createForPoints(scene, diagram.coordinateMapper, canvas,
        [origin0, p1, origin1, q1, worldPoint], 40);

    // first system defined by the origin point and the two vectors attached
    const c1 = scene.add(new DefCoordSystem(),
        DefCoordSystem.fromValues({ origin: origin1, u: x0, v: y0 }), {
        style: makeCoordStyle("#d29d00", "#004D40", 3),
    });

    const worldPInC0 = scene.add(new DefCoordSystemOps(), DefCoordSystemOps.fromToCoordinates(worldPoint, c0), { invisible });

    const worldPInC1 = scene.add(new DefCoordSystemOps(), DefCoordSystemOps.fromToCoordinates(worldPoint, c1), { invisible });

    const coordinateSystems = [c0, c1];
    const localPoints = [worldPInC0, worldPInC1]

    const textOffset0 = scene.add(new DefFunc(deps => {
        const { o, v } = deps;
        const p = Vec2.add(o, Vec2.scale(v, -0.5));
        return makePoint(p);
    }), DefFunc.from({ o: origin0, v: v0 }), { invisible });
    const textOffset1 = scene.add(new DefFunc(deps => {
        const { o, v } = deps;
        const p = Vec2.add(o, Vec2.scale(v, -0.5));
        return makePoint(p);
    }), DefFunc.from({ o: origin1, v: y0 }), { invisible });

    const origC0Text = scene.add(new DefText({ text: "A" }), DefText.fromObjectRef({ ref: textOffset0 }), {
        style: {
            textStyle: {
                font: "bold 20px sans-serif",
                textAlign: "start",
                textBaseline: "alphabetic",
                direction: "inherit",
                fontKerning: "auto",
            },
        },
    });
    const origC1Text = scene.add(new DefText({ text: "B" }), DefText.fromObjectRef({ ref: textOffset1 }), {
        style: {
            textStyle: {
                font: "bold 20px sans-serif",
                textAlign: "start",
                textBaseline: "alphabetic",
                direction: "inherit",
                fontKerning: "auto",
            },
        },
    }
    );
    const format = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
    });
    const projLines = (coordsIn, csIn, { styleU = {}, styleV = {}, textStyleU = {}, textStyleV = {} } = {}) => {
        const points = scene.add(new DefFunc(deps => {
            const { coords, cs } = deps;
            // helper function for brevity
            const va = p => DefCoordSystem.pointFromCoordSystem(p, cs);

            const tipLocal = coords;
            const tipW = va(tipLocal);

            // the coordinate points on the axes
            const tipUW = va(Vec2.vec2(tipLocal.x, 0));
            const tipVW = va(Vec2.vec2(0, tipLocal.y));


            return [tipUW, tipVW, tipW].map(x => makePoint(x));
        }), DefFunc.from({ coords: coordsIn, cs: csIn }), {
            invisible
        });


        const origin = scene.add(new DefSelect("origin"), DefSelect.fromObject(csIn,
            p => makePoint(p)), { invisible });
        const tipUW = scene.add(new DefSelect(0), DefSelect.fromObject(points), { invisible });
        const tipVW = scene.add(new DefSelect(1), DefSelect.fromObject(points), { invisible });
        const tipW = scene.add(new DefSelect(2), DefSelect.fromObject(points), { invisible });

        const lineU = scene.add(new DefLine(), DefLine.fromPoints(tipUW, tipW),
            {
                z: 2,
                style: styleV
            });
        const lineV = scene.add(new DefLine(), DefLine.fromPoints(tipVW, tipW),
            {
                z: 2,
                style: styleU
            });




        const underlines = [tipUW, tipVW].map(x => scene.add(
            new DefLine(),
            DefLine.fromPoints(origin, x), {
            z: 2,
            style: {
                strokeStyle: "rgb(128,128,128)",
                lineStyle: {
                    lineWidth: 2,
                    lineDash: [2],
                }
            }
        }));

        const midV = scene.add(new DefMidPoint(), DefMidPoint.fromPoints(tipUW, tipW), { invisible });
        const midU = scene.add(new DefMidPoint(), DefMidPoint.fromPoints(tipVW, tipW), { invisible });

        const lenX = scene.add(new DefSelect("x"), DefSelect.fromObject(coordsIn, x => makeNumber(x)));
        const lenY = scene.add(new DefSelect("y"), DefSelect.fromObject(coordsIn, x => makeNumber(x)));


        const textX = scene.add(new DefText(), DefText.fromObjectRef({
            obj: lenX,
            ref: midU
        }), {
            style: textStyleU
        });

        const textY = scene.add(new DefText(), DefText.fromObjectRef({
            obj: lenY,
            ref: midV
        }), {
            style: textStyleV
        });


    };

    const decomposeWrt = (p, coord, { show = null, styleU = {}, styleV = {}, textStyleU = {}, textStyleV = {} } = {}) => {
        const p_c = scene.add(new DefCoordSystemOps(),
            DefCoordSystemOps.fromToCoordinates(p, coord), { invisible });
        if (show) {
            coord = scene.add(new DefConditional(), DefConditional.fromCondition(coord, show), { invisible });
        }
        const lines = projLines(p_c, coord, {
            styleU, styleV,
            textStyleU, textStyleV,
        });
    };


    const decC0 = scene.add(new DefBoolean(true));
    const decC1 = scene.add(new DefBoolean(true));

    decomposeWrt(worldPoint, c0, {
        show: decC0,
        styleU: {
            strokeStyle: "#D81B60",
            lineStyle: {
                lineWidth: 2,
                // lineDash: [2],
            }
        },
        styleV: {
            strokeStyle: "#1E88E5",
            lineStyle: {
                lineWidth: 2,
                // lineDash: [2],
            }
        },
        textStyleU: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "#D81B60",
            outline: {
                lineWidth: 6,
            },
            textStyle: {
                font: "20px bold sans-serif",
                textAlign: "center",
            }
        },
        textStyleV: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "#1E88E5",
            outline: {
                lineWidth: 6,
            },
            textStyle: {
                font: "20px bold sans-serif",
                textAlign: "center",
            }
        },
    });

    decomposeWrt(worldPoint, c1, {
        show: decC1,
        styleU: {
            strokeStyle: "#d29d00",
            lineStyle: {
                lineWidth: 2,
                // lineDash: [2],
            }
        },
        styleV: {
            strokeStyle: "#004D40",
            lineStyle: {
                lineWidth: 2,
                // lineDash: [2],
            }
        },
        textStyleU: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "#d29d00",
            outline: {
                lineWidth: 6,
            },
            textStyle: {
                font: "20px bold sans-serif",
                textAlign: "center",
            }
        },
        textStyleV: {
            strokeStyle: "rgb(255,255,255)",
            fillStyle: "#004D40",
            outline: {
                lineWidth: 6,
            },
            textStyle: {
                font: "20px bold sans-serif",
                textAlign: "center",
            }
        },
    });

    const checkShowDec0 = makeCheckboxNoLabel(scene.get(decC0).value.value);
    checkShowDec0.oninput = () => {
        scene.update(decC0, new DefBoolean(checkShowDec0.checked));
    };
    const checkShowDec1 = makeCheckboxNoLabel(scene.get(decC1).value.value);
    checkShowDec1.oninput = () => {
        scene.update(decC1, new DefBoolean(checkShowDec1.checked));
    };

    const selectST = makeOptions(["From A to B", "From B to A"]);

    const options = makeContainer(
        makeContainer(makeTextField("Show A coordinates:"), checkShowDec0),
        makeContainer(makeTextField("Show B coordinates:"), checkShowDec1),
        makeContainer(makeTextField("Calculation direction:"), selectST)
    );

    const calcContainer = makeContainer();

    const relevantObjects = {
        [c0]: c0,
        [c1]: c1,
        [worldPoint]: worldPoint,
    };


    const toLtx = (a) => {
        const f = x => x === undefined ? "\\_" : typeof (x) === 'number' ? format.format(x) : x;
        // const f = x => typeof(x);
        const mstr = jsm.map(a, f, jsm.MatAny.uninitialized(a.rows(), a.cols()));

        const rows = jsm.rowreduce(mstr, x => jsm.toArray(x).join(" & "), jsm.MatAny.uninitialized(a.rows(), 1));

        return '\\begin{pmatrix}' + jsm.toArray(rows).join("\\\\") + '\\end{pmatrix}';

    };

    let startIdx = 0;
    let targetIdx = 1;

    const systemNames = ["A", "B"];

    const updateCalcs = () => {
        const c0v = scene.get(coordinateSystems[startIdx]).value;
        const c1v = scene.get(coordinateSystems[targetIdx]).value;

        const o0 = jsm.VecF32.from([c0v.origin.x, c0v.origin.y]);

        const o1 = jsm.VecF32.from([c1v.origin.x, c1v.origin.y]);

        const x0 = jsm.VecF32.from([c0v.u.x, c0v.u.y]);
        const y0 = jsm.VecF32.from([c0v.v.x, c0v.v.y]);

        const x1 = jsm.VecF32.from([c1v.u.x, c1v.u.y]);
        const y1 = jsm.VecF32.from([c1v.v.x, c1v.v.y]);

        const Ms = jsm.MatF32.uninitialized(2, 2);
        jsm.insert(jsm.col(Ms, 0), x0);
        jsm.insert(jsm.col(Ms, 1), y0);
        const Mt = jsm.MatF32.uninitialized(2, 2);
        jsm.insert(jsm.col(Mt, 0), x1);
        jsm.insert(jsm.col(Mt, 1), y1);

        const R_st = jsm.mult(jsm.transpose(Mt), Ms);

        const t_st = jsm.mult(jsm.transpose(Mt),
            jsm.sub(o0, o1))

        const pointLocalV = scene.get(localPoints[startIdx]).value;
        const pointLocal = jsm.VecF32.from([pointLocalV.x, pointLocalV.y]);

        const pointTarget = jsm.add(jsm.mult(R_st, pointLocal), t_st);

        let s = `${systemNames[startIdx]}`;
        let t = `${systemNames[targetIdx]}`;

        calcContainer.innerHTML = "";
        const text = `
        Start coordinate system $${s}$:
        $$\\mathbf{o}_{${s}} = ${toLtx(o0)}, \\mathbf{x}_{${s},1} = ${toLtx(x0)}, \\mathbf{x}_{${s},2} = ${toLtx(y0)} $$ 

        Target coordinate system $${t}$:
        $$\\mathbf{o}_{${t}} = ${toLtx(o1)}, \\mathbf{x}_{${t},1} = ${toLtx(x1)}, \\mathbf{x}_{${t},2} = ${toLtx(y1)} $$ 
        
        Transform $\\mathbf{T}_{${s}}^{${t}} = \\{\\mathbf{R}_{${s}}^{${t}}, \\mathbf{t}_{${s}\\rightarrow ${t}}^${t}\\}$ transforms points from $${s}$ to $${t}$. $\\\\$


        Calculate $\\mathbf{R}_{${s}}^{${t}}$:
        $$
            \\begin{align*}
            \\mathbf{R}_{${s}}^{${t}} &= \\begin{pmatrix} (\\mathbf{x}_{{${t}},1})^T \\\\ (\\mathbf{x}_{{${t}},2})^T
            \\end{pmatrix} \\begin{pmatrix} \\mathbf{x}_{${s},1} & \\mathbf{x}_{${s},2}
            \\end{pmatrix} \\\\
            &= ${toLtx(jsm.transpose(Mt))} ${toLtx(Ms)} \\\\
            &= ${toLtx(R_st)}
            \\end{align*}
        $$

        Calculate $\\mathbf{t}_{${s}\\rightarrow ${t}}^{${t}}$:
        $$
            \\begin{align*}
            \\mathbf{t}_{${s}\\rightarrow ${t}}^{${t}} &= \\begin{pmatrix} (\\mathbf{x}_{{${t}},1})^T \\\\ (\\mathbf{x}_{{${t}},2})^T
            \\end{pmatrix} (\\mathbf{o}_{${s}} - \\mathbf{o}_{${t}}) \\\\
            &= ${toLtx(jsm.transpose(Mt))}(${toLtx(o0)}-${toLtx(o1)}) \\\\
            &= ${toLtx(t_st)}
            \\end{align*}
        $$

        The point in the source system: $\\mathbf{p}^{${s}} = ${toLtx(pointLocal)}$. Compute the coordinates in target system.

        $$
            \\begin{align*}
            \\mathbf{p}^{${t}} &= \\mathbf{R}_{${s}}^{${t}} \\mathbf{p}^ {${s}} + \\mathbf{t}_{${s}\\rightarrow ${t}}^{${t}} \\\\
            &= ${toLtx(R_st)}${toLtx(pointLocal)} + ${toLtx(t_st)} \\\\
            &= ${toLtx(pointTarget)}
            \\end{align*}
        $$
        `;
        calcContainer.textContent = text;

        renderMathInElement(calcContainer, {
            throwOnError: false,
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\begin{equation}", right: "\\end{equation}", display: true },
                { left: "\\begin{align}", right: "\\end{align}", display: true },
                { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
                { left: "\\begin{gather}", right: "\\end{gather}", display: true },
                { left: "\\begin{CD}", right: "\\end{CD}", display: true },
                { left: "\\[", right: "\\]", display: true }
            ],
        });
    };

    selectST.oninput = (e) => {
        if (selectST.selectedIndex === 0) {
            startIdx = 0;
            targetIdx = 1;

        } else {
            startIdx = 1;
            targetIdx = 0;

        }
        updateCalcs();
    };

    updateCalcs();

    scene.registerCallback(alg.GeometryScene.EVENT_UPDATE, e => {

        const { index } = e;
        if (index in relevantObjects) {
            updateCalcs();
        }
    });

    container.appendChild(options);
    container.appendChild(calcContainer);
}



export {
    coordinateSystems,
}