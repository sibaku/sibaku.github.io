/* global jsm, v32, m32, vec2, vec3, vec4 */
/* global subvec, copy */
/* global add, sub, mult, scale, cwiseMin, cwiseMax, dot, isAny, floor, ceil, abs, cwiseMult, clamp */
/* global to_int */


const Wrapping = {
    /**
     * Clamp to the edge of the image

     */
    CLAMP_TO_EDGE: 0,
    /**
     * Periodically repeat the image in all directions
     */
    REPEAT: 1,
    /**
     * Periodically repeat the image in all directions. Mirrored on the
     * negative side
     */
    MIRRORED_REPEAT: 2,
    /**
     * Clamp ot the edge of the image, but mirror it once on the negative
     * side
     */
    MIRRORED_CLAMP_TO_EDGE: 3
};


const Interpolation = {
    /**
     * Nearest neighbor interpolation
     */
    NEAREST: 0,
    /**
     * Bilinear interpolation
     *
     */
    LINEAR: 1
};

class Image {
    constructor(data, w, h, comp) {
        this.data = data;
        this.w = w;
        this.h = h;
        this.comp = comp;
    }

    static new(data, w, h, comp) {
        return new Image(data, w, h, comp);
    }

    at(x, y) {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) {
            throw `Trying to access element at (${x},${y}) in image with size (${this.w}, ${this.h})`;
        }
        const v = v32.zeros(this.comp);
        const idx = (x + this.w * y) * this.comp;
        for (let i = 0; i < this.comp; i++) {
            v.set(this.data[idx + i], i);
        }
        return v;
    }

    set(val, x, y) {
        const c = Math.min(this.comp, val.rows());
        const idx = (x + this.w * y) * this.comp;
        for (let i = 0; i < c; i++) {
            this.data[idx + i] = val.at(i);
        }
        return this;
    }

    fill(val, default_value = 0.0) {
        const c = Math.min(this.comp, val.rows());

        const data = this.data;
        const comp = this.comp;
        for (let i = 0; i < data.length; i += comp) {
            for (let j = 0; j < c; j++) {
                this.data[i + j] = val.at(j);
            }
            for (let j = c; j < comp; j++) {
                this.data[i + j] = default_value;

            }
        }
    }

    apply(f) {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                this.set(f(x, y, this.at(x, y)), x, y);
            }
        }
        return this;
    }

    forEach(f) {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                f(x, y, this);
            }
        }
        return this;
    }

    static random(w, h, c = 4) {
        const n = w * h * c;
        const data = new Float32Array(n);

        const img = Image.new(data, w, h, c);
        img.forEach((x, y, img) => {
            img.set(v32.rand(c), x, y);
        });

        return img;
    }


    static zero(w, h, c = 4, type = Float32Array) {
        const n = w * h * c;
        const data = new type(n);
        for (let i = 0; i < n; i++) {
            data[i] = 0;
        }

        return Image.new(data, w, h, c);
    }

    static zeroF32(w, h, c = 4) {
        return Image.zero(w, h, c, Float32Array);
    }

    static zeroF64(w, h, c = 4) {
        return Image.zero(w, h, c, Float64Array);

    }

    static zeroUI8(w, h, c = 4) {
        return Image.zero(w, h, c, Uint8Array);

    }

    static zeroUI8C(w, h, c = 4) {
        return Image.zero(w, h, c, Uint8ClampedArray);

    }
}

function imageToCtx(img, ctx, { resize = true, flip_y = true, discard_alpha = true } = {}) {
    const imgData = ctx.createImageData(img.w, img.h);

    const maxComponents = Math.min(discard_alpha ? 3 : 4, img.comp);
    const defaultEntries = vec4(0, 0, 0, 1);
    // image with 4 channels


    for (let j = 0; j < img.h; j++) {
        for (let i = 0; i < img.w; i++) {
            const jf = flip_y ? img.h - 1 - j : j;
            const idxOut = (i + jf * img.w) * 4;
            const idxIn = (i + j * img.w) * img.comp;
            for (let c = 0; c < maxComponents; c++) {
                imgData.data[idxOut + c] = img.data[idxIn + c] * 255.0;
            }
            for (let c = maxComponents; c < 4; c++) {
                imgData.data[idxOut + c] = defaultEntries.at(c) * 255.0;
            }
        }
    }

    if (resize) {
        ctx.canvas.width = img.w;
        ctx.canvas.height = img.h;
    }

    ctx.putImageData(imgData, 0, 0);
}



function mod(x, y) {
    return x - y * to_int(Math.floor(x / y));
}
function mirror(a) { return a >= 0.0 ? a : -(1.0 + a); }


function wrap_clamp(x, w) { return clamp(x, 0, w - 1); }

function wrap_repeat(x, w) { return mod(x, w); }

function wrap_mirrored_repeat(x, w) {
    return (w - 1) - mirror(mod(x, 2 * w) - w);
}

function wrap_mirrored_clamp_to_edge(x, w) {
    return clamp(mirror(x), 0, w - 1);
}

function wrap(x, w, wrap_type) {
    switch (wrap_type) {
        case Wrapping.CLAMP_TO_EDGE:
            return wrap_clamp(x, w);
        case Wrapping.REPEAT:
            return wrap_repeat(x, w);
        case Wrapping.MIRRORED_REPEAT:
            return wrap_mirrored_repeat(x, w);
        case Wrapping.MIRRORED_CLAMP_TO_EDGE:
            return wrap_mirrored_clamp_to_edge(x, w);
        default:
            return 0;
    }
}

function fract(x) {
    return x - Math.floor(x);
}



function sample(img, uv, { interpolation_mode = Interpolation.NEAREST, wrap_s = Wrapping.CLAMP_TO_EDGE, wrap_t = Wrapping.CLAMP_TO_EDGE } = {}) {
    const w = img.w;
    const h = img.h;
    const pxf = cwiseMult(uv, vec2(w, h));

    if (interpolation_mode === Interpolation.NEAREST) {
        pxf.set(wrap(pxf.at(0), w, wrap_s), 0);
        pxf.set(wrap(pxf.at(1), h, wrap_t), 1);
        const ipx = floor(pxf);
        return img.at(ipx.at(0), ipx.at(1));
    } else {
        // bilinear interpolation
        // adapted from OpenGL specification

        const i0 = wrap(to_int(Math.floor(pxf.at(0) - 0.5)), w,
            wrap_s);
        const j0 = wrap(to_int(Math.floor(pxf.at(1) - 0.5)), h,
            wrap_t);

        const i1 = wrap(to_int(Math.floor(pxf.at(0) - 0.5)) + 1, w,
            wrap_s);
        const j1 = wrap(to_int(Math.floor(pxf.at(1) - 0.5)) + 1, h,
            wrap_t);

        const v00 = img.at(Math.floor(i0), Math.floor(j0));
        const v10 = img.at(Math.floor(i1), Math.floor(j0));
        const v01 = img.at(Math.floor(i0), Math.floor(j1));
        const v11 = img.at(Math.floor(i1), Math.floor(j1));

        const params = vec2(fract(pxf.at(0) - 0.5), fract(pxf.at(1) - 0.5));
        const alpha = params.at(0);
        const beta = params.at(1);

        return add(
            scale(v00, (1.0 - alpha) * (1.0 - beta), v00)
            ,
            add(
                scale(v10, alpha * (1.0 - beta), v10),
                add(
                    scale(v01, (1.0 - alpha) * beta, v01),
                    scale(v11, alpha * beta, v11))));
    }

}

