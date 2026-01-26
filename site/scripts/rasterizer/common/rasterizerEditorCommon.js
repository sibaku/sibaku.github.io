import { MatF32, VecF32 } from "../../bundles/jsmatrix.bundle.min.js";
import * as jsm from "../../bundles/jsmatrix.bundle.min.js";
import * as common from "./common.js";
import * as defines from "./defines.js";

async function getTextFromUrl(url) {

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    return response.text();

}

function scriptHeader(appContext) {
    return `
    const defineModule = await import("${appContext.basePath}scripts/rasterizer/common/defines.js");
    const jsm = await import("${appContext.basePath}scripts/bundles/jsmatrix.bundle.min.js");

    const commonModule = await import("${appContext.basePath}scripts/rasterizer/common/common.js");

    const {
        vec2,
        vec3,
        vec4,
        mix,
        ceil,
        floor,
        isAny,
        idiv,
        to_int,
        reflect,
        clamp,
        toLatex,
    } = defineModule;


    const {
        dot,
        cross,
        add,
        sub,
        mult,
        scale,
        abs,
        subvec,
        diag,
        block,
        transpose,
        fill,
        insert,
        copy,
        hvec,
        normalize,

        cwiseMin,
        cwiseMax,
        cwiseMult,
        VecF32: v32,
        MatF32: m32
    } = jsm;

    const {
        Wrapping,
        Interpolation,
        PixelImage,
        imageToCtx,
        mod,
        mirror,
        wrap_clamp,
        wrap_repeat,
        wrap_mirrored_repeat,
        wrap_mirrored_clamp_to_edge,
        wrap,
        fract,
        sample,
    } = commonModule;
`;
}

const autoCompleteDummies = [
    { jsm },
    window,
    common,
    defines,
    {
        v32: VecF32,
        m32: MatF32,
    },
];




export {
    scriptHeader,
    autoCompleteDummies,
    getTextFromUrl,
}