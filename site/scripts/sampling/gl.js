
import * as jsm from "../lib/jsmatrix.js"


class Sampler {
    constructor(gl, {
        TEXTURE_COMPARE_FUNC = gl.ALWAYS,
        TEXTURE_COMPARE_MODE = gl.NONE,
        TEXTURE_MAG_FILTER = gl.LINEAR,
        TEXTURE_MAX_LOD = 1000,
        TEXTURE_MIN_FILTER = gl.LINEAR,
        TEXTURE_MIN_LOD = 0,
        TEXTURE_WRAP_R = gl.CLAMP_TO_EDGE,
        TEXTURE_WRAP_S = gl.CLAMP_TO_EDGE,
        TEXTURE_WRAP_T = gl.CLAMP_TO_EDGE,
    } = {}) {
        /**
         * @type {WebGL2RenderingContext}
         */
        this.gl = gl;
        this.handle = gl.createSampler();

        this.setParameteri(gl.TEXTURE_COMPARE_FUNC, TEXTURE_COMPARE_FUNC);
        this.setParameteri(gl.TEXTURE_COMPARE_MODE, TEXTURE_COMPARE_MODE);

        this.setParameteri(gl.TEXTURE_MAG_FILTER, TEXTURE_MAG_FILTER);
        this.setParameteri(gl.TEXTURE_MIN_FILTER, TEXTURE_MIN_FILTER);

        this.setParameterf(gl.TEXTURE_MAX_LOD, TEXTURE_MAX_LOD);
        this.setParameterf(gl.TEXTURE_MIN_LOD, TEXTURE_MIN_LOD);

        this.setParameteri(gl.TEXTURE_WRAP_R, TEXTURE_WRAP_R);
        this.setParameteri(gl.TEXTURE_WRAP_S, TEXTURE_WRAP_S);
        this.setParameteri(gl.TEXTURE_WRAP_T, TEXTURE_WRAP_T);
    }

    isValid() {
        return this.handle != null;
    }
    delete() {
        this.gl.deleteSampler(this.handle);
        this.handle = null;
    }

    bind(unit = 0) {
        this.gl.bindSampler(unit, this.handle);
    }

    unbind(unit) {
        this.gl.bindSampler(unit, null);
    }

    /**
     * 
     * @param {GLenum} pname 
     * @param {GLint} param 
     */
    setParameteri(pname, param) {
        this.gl.samplerParameteri(this.handle, pname, param);
    }
    /**
  * 
  * @param {GLenum} pname 
  * @param {GLfloat} param 
  */
    setParameterf(pname, param) {
        this.gl.samplerParameterf(this.handle, pname, param);

    }

    /**
     * 
     * @param {GLenum} pname 
     * @returns {GLenum | GLfloat}
     */
    getParameter(pname) {
        return this.gl.getSamplerParameter(this.handle, pname);
    }
}

class Texture {

    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl, {
        internalFormat = gl.RGBA,
        width = 1,
        height = 1,
        border = 0,
        minFilter = gl.NEAREST,
        magFilter = gl.NEAREST,
        wrapS = gl.CLAMP_TO_EDGE,
        wrapT = gl.CLAMP_TO_EDGE,
    } = {}) {
        /**
       * @type {WebGL2RenderingContext}
       */
        this.gl = gl;
        this.handle = null;

        this.border = border;
        this.internalFormat = internalFormat;
        this.minFilter = minFilter;
        this.magFilter = magFilter;

        this.wrapS = wrapS;
        this.wrapT = wrapT;


        this.resize(width, height);
    }

    resize(width, height, levels = 1) {
        if (this.width === width && this.height === height) {
            return;
        }
        if (this.isValid()) {
            this.delete();
        }
        const { gl } = this;

        this.handle = gl.createTexture();

        this.width = width;
        this.height = height;


        if (levels < 0) {
            // compute levels
            levels = Math.floor(Math.log2(Math.max(width, height))) + 1;
        }

        gl.bindTexture(gl.TEXTURE_2D, this.handle);

        gl.texStorage2D(gl.TEXTURE_2D, levels, this.internalFormat, width, height);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);

        gl.bindTexture(gl.TEXTURE_2D, null);


    }

    isValid() {
        return this.handle != null;
    }

    bind(unit = 0) {
        const { gl } = this;
        gl.activeTexture(gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
        gl.activeTexture(gl.TEXTURE0);
    }

    unbind(unit = 0) {
        const { gl } = this;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE0);

    }
    delete() {
        this.gl.deleteTexture(this.handle);
        this.handle = null;
    }
    upload({
        level = 0,
        width = 1,
        height = 1,
        xoffset = 0,
        yoffset = 0,
        srcFormat = this.gl.RGBA,
        srcType = this.gl.UNSIGNED_BYTE,
        pixel = new Uint8Array([255, 0, 255, 255]),


    } = {}) {
        const { gl, handle } = this;
        this.bind();
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        gl.texSubImage2D(gl.TEXTURE_2D, level, xoffset, yoffset, width, height, srcFormat, srcType, pixel);


        return this;
    }
}

class TextureSampler {
    /**
     *  
     * @param {Texture} texture 
     * @param {Sampler} sampler 
     */
    constructor(texture, sampler) {
        this.texture = texture;
        this.sampler = sampler;
    }


    bind(unit = 0) {
        this.texture.bind(unit);
        this.sampler.bind(unit);
    }

    unbind(unit = 0) {
        this.texture.unbind(unit);
        this.sampler.unbind(unit);
    }

}

function compileShader(gl, shader, source) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);


}

class Shader {

    static defaults = {
        float: 0.0,
        int: 0,
        uint: 0,
        vec2: new Float32Array([0, 0]),
        vec3: new Float32Array([0, 0, 0]),
        vec4: new Float32Array([0, 0, 0, 1]),

        ivec2: new Int32Array([0, 0]),
        ivec3: new Int32Array([0, 0, 0]),
        ivec4: new Int32Array([0, 0, 0, 1]),

        uvec2: new Uint32Array([0, 0]),
        uvec3: new Uint32Array([0, 0, 0]),
        uvec4: new Uint32Array([0, 0, 0, 1]),

        mat2: new Float32Array([1, 0, 0, 1]),
        mat3: new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1]),
        mat4: new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]),
        sampler: 0,
    };

    static getDefaultValue(gl, type) {
        const { defaults } = Shader;
        switch (type) {
            case gl.FLOAT:
                return defaults.float;
            case gl.FLOAT_VEC2:
                return defaults.vec2;
            case gl.FLOAT_VEC3:
                return defaults.vec3;
            case gl.FLOAT_VEC4:
                return defaults.vec4;
            case gl.INT:
                return defaults.int;
            case gl.INT_VEC2:
                return defaults.ivec2;
            case gl.INT_VEC3:
                return defaults.ivec3;
            case gl.INT_VEC4:
                return defaults.ivec4;
            case gl.UNSIGNED_INT:
                return defaults.uint;
            case gl.UNSIGNED_INT_VEC2:
                return defaults.uvec2;
            case gl.UNSIGNED_INT_VEC3:
                return defaults.uvec3;
            case gl.UNSIGNED_INT_VEC4:
                return defaults.uvec4;
            case gl.FLOAT_MAT2:
                return defaults.mat2;
            case gl.FLOAT_MAT3:
                return defaults.mat3;
            case gl.FLOAT_MAT4:
                return defaults.mat4;
            case gl.SAMPLER_2D:
            case gl.SAMPLER_3D:
            case gl.SAMPLER_2D_SHADOW:
            case gl.SAMPLER_2D_ARRAY:
            case gl.SAMPLER_2D_ARRAY_SHADOW:
            case gl.SAMPLER_CUBE_SHADOW:
            case gl.INT_SAMPLER_2D:
            case gl.INT_SAMPLER_3D:
            case gl.INT_SAMPLER_CUBE:
            case gl.INT_SAMPLER_2D_ARRAY:
            case gl.UNSIGNED_INT_SAMPLER_2D:
            case gl.UNSIGNED_INT_SAMPLER_3D:
            case gl.UNSIGNED_INT_SAMPLER_CUBE:
            case gl.UNSIGNED_INT_SAMPLER_2D_ARRAY:
                return defaults.sampler;

            default:
                break;
        }
    }

    uniformNames = new Map();
    uniforms = [];

    constructor(gl, { vertex, fragment }) {
        /**
        * @type {WebGL2RenderingContext}
        */
        this.gl = gl;
        this.vertex = vertex;
        this.fragment = fragment;
        this.handle = null;
        this.error = null;
    }

    compile() {
        const { gl } = this;
        const vs = gl.createShader(gl.VERTEX_SHADER);
        const fs = gl.createShader(gl.FRAGMENT_SHADER);

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);

        compileShader(gl, vs, this.vertex);
        compileShader(gl, fs, this.fragment);

        gl.linkProgram(program);

        gl.deleteShader(vs);
        gl.deleteShader(fs);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = {
                success: false,
                programErrorLog: gl.getProgramInfoLog(program),
                vertexErrorLog: gl.getShaderInfoLog(vs),
                fragmentErrorLog: gl.getShaderInfoLog(fs),
            };

            this.error = error;

            gl.deleteProgram(program);

            return false;
        }

        this.handle = program;

        // generate meta data
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; ++i) {
            const info = gl.getActiveUniform(program, i);
            const { name, type, size } = info;
            if (name.startsWith("gl_") || name.startsWith("webgl_")) {
                continue;
            }

            if (size === 1) {
                const location = gl.getUniformLocation(program, name);
                this.uniforms.push({
                    info: {
                        type,
                        name,
                        size
                    }, location, globalId: -1
                });
                // console.log("name:", info.name, "type:", info.type, "size:", info.size, "location: ", location);

            } else {
                // array for basic types
                const fidx = name.indexOf("[0]");
                if (fidx < 0) {
                    // error 
                    continue;
                }

                const s0 = name.substring(0, fidx + 1);
                const s1 = name.substring(fidx + 3 - 1);

                for (let j = 0; j < size; j++) {
                    const namej = s0 + j + s1;
                    const location = gl.getUniformLocation(program, name);
                    this.uniforms.push({
                        info: {
                            type,
                            namej,
                            size
                        },
                        location,
                    });
                    console.log("name:", namej, "type:", info.type, "size:", info.size, "location: ", location);

                }
            }

        }

        return true;

    }

    printError() {
        const { error } = this;

        if (error === null || error.success) {
            console.log("Shader compilation: Success");
            return;
        }

        const lines = source.split("\n").map((x, i) => `${i}: ${x}`);
        console.log(lines.join("\n"));

        console.log(
            `Program errors:\n
${error.programErrorLog}\n
Vertex errors:\n
${error.vertexErrorLog.split("\n").map((x, i) => `${i}: ${x}`)}\n
Fragment errors:\n
${error.fragmentErrorLog.split("\n").map((x, i) => `${i}: ${x}`)}\n
`);
    }

    valid() {
        return this.handle != null;
    }

    delete() {
        this.gl.deleteProgram(this.handle);

    }

    bind() {
        this.gl.useProgram(this.handle);
    }

    unbind() {
        this.gl.useProgram(null);
    }

    static getUniformColorShader(gl) {
        const vs =
            `#version 300 es
     
    layout(location = ${Attribute.VERTEX}) in vec4 a_position;

    uniform mat4 VP; 
    uniform mat4 M; 
     
    // all shaders have a main function
    void main() {
    mat4 MVP = VP * M;
     
      gl_Position = MVP*a_position;
    }
        `;
        const fs = `#version 300 es
    precision highp float;
   
     uniform vec4 u_color;

    out vec4 outColor;

    void main() {
      outColor = u_color;
    }
    `;

        const prog = new Shader(gl, { vertex: vs, fragment: fs });

        prog.compile();

        return prog;
    }

    static getNormalColor(gl) {
        const vs =
            `#version 300 es
     
            layout(location = ${Attribute.VERTEX}) in vec4 a_position;
            layout(location = ${Attribute.NORMAL}) in vec3 a_normal;
    uniform mat4 VP; 
    uniform mat4 M; 
    uniform mat4 V; 
     
    out vec3 N_world;
    out vec3 N_local;
    void main() {
    mat4 MVP = VP * M;
        mat3 normalMatrix = transpose(inverse(mat3(V*M)));

        N_local = a_normal;
        N_world = normalMatrix * a_normal;
      gl_Position = MVP*a_position;
    }
        `;
        const fs = `#version 300 es
    precision highp float;
   
    in vec3 N_world;
    in vec3 N_local;
     uniform int u_drawLocalSpace;
    
    out vec4 outColor;

    void main() {
        if(u_drawLocalSpace == 1){
            outColor = vec4(normalize(N_local)*0.5 + 0.5,1.0);
        } else {
            outColor = vec4(normalize(N_world)*0.5 + 0.5,1.0);
        }
    }
    `;

        const prog = new Shader(gl, { vertex: vs, fragment: fs });

        prog.compile();

        return prog;
    }

}


function isSampler(gl, type) {
    switch (type) {
        case gl.SAMPLER_2D:
        case gl.SAMPLER_3D:
        case gl.SAMPLER_2D_SHADOW:
        case gl.SAMPLER_2D_ARRAY:
        case gl.SAMPLER_2D_ARRAY_SHADOW:
        case gl.SAMPLER_CUBE_SHADOW:
        case gl.INT_SAMPLER_2D:
        case gl.INT_SAMPLER_3D:
        case gl.INT_SAMPLER_CUBE:
        case gl.INT_SAMPLER_2D_ARRAY:
        case gl.UNSIGNED_INT_SAMPLER_2D:
        case gl.UNSIGNED_INT_SAMPLER_3D:
        case gl.UNSIGNED_INT_SAMPLER_CUBE:
        case gl.UNSIGNED_INT_SAMPLER_2D_ARRAY:
            return true;

        default:
            return false;
    }
}
/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {*} type 
 */
function getUniformSetter(gl, type) {
    switch (type) {
        case gl.FLOAT:
            return (location, value) => gl.uniform1f(location, value);
        case gl.FLOAT_VEC2:
            return (location, value) => gl.uniform2fv(location, value);
        case gl.FLOAT_VEC3:
            return (location, value) => gl.uniform3fv(location, value);
        case gl.FLOAT_VEC4:
            return (location, value) => gl.uniform4fv(location, value);
        case gl.INT:
            return (location, value) => gl.uniform1i(location, value);
        case gl.INT_VEC2:
            return (location, value) => gl.uniform2iv(location, value);
        case gl.INT_VEC3:
            return (location, value) => gl.uniform3iv(location, value);
        case gl.INT_VEC4:
            return (location, value) => gl.uniform4iv(location, value);
        case gl.UNSIGNED_INT:
            return (location, value) => gl.uniform1ui(location, value);
        case gl.UNSIGNED_INT_VEC2:
            return (location, value) => gl.uniform2uiv(location, value);
        case gl.UNSIGNED_INT_VEC3:
            return (location, value) => gl.uniform3uiv(location, value);
        case gl.UNSIGNED_INT_VEC4:
            return (location, value) => gl.uniform4uiv(location, value);
        case gl.FLOAT_MAT2:
            return (location, value) => gl.uniformMatrix2fv(location, false, value);
        case gl.FLOAT_MAT3:
            return (location, value) => gl.uniformMatrix3fv(location, false, value);
        case gl.FLOAT_MAT4:
            return (location, value) => gl.uniformMatrix4fv(location, false, value);
        case gl.SAMPLER_2D:
        case gl.SAMPLER_3D:
        case gl.SAMPLER_2D_SHADOW:
        case gl.SAMPLER_2D_ARRAY:
        case gl.SAMPLER_2D_ARRAY_SHADOW:
        case gl.SAMPLER_CUBE_SHADOW:
        case gl.INT_SAMPLER_2D:
        case gl.INT_SAMPLER_3D:
        case gl.INT_SAMPLER_CUBE:
        case gl.INT_SAMPLER_2D_ARRAY:
        case gl.UNSIGNED_INT_SAMPLER_2D:
        case gl.UNSIGNED_INT_SAMPLER_3D:
        case gl.UNSIGNED_INT_SAMPLER_CUBE:
        case gl.UNSIGNED_INT_SAMPLER_2D_ARRAY:
            return (location, value) => gl.uniform1i(location, value);

        default:
            throw `Type ${type} not supported`;
    }
}


class MaterialProperty {
    value;
    index;
}
class Material {


    static globalProperties = new Map();
    static globalVersion = 0;


    static setGlobalPropertyByName(name, value) {

        let prop = Material.globalProperties.get(name);
        if (prop === undefined) {
            prop = { value };
            Material.globalProperties.set(name, prop);
        } else {
            prop.value = value;
        }

        Material.globalVersion++;
    }

    shader = null;
    properties = new Map();
    activeProperties = new Array();
    currentVersion = -1;
    constructor(shader, properties = null) {
        this.setShader(shader);
        this.currentVersion = Material.globalVersion - 1;

        if (properties !== null) {
            if (properties instanceof Map) {

                for (const [k, v] of properties) {
                    this.setPropertyByName(k, v);
                }
            } else {
                for (const [k, v] of Object.entries(properties)) {
                    this.setPropertyByName(k, v);
                }
            }
        }
    }

    setPropertyByName(name, value) {
        const id = this.getPropertyId(name);

        if (id >= 0) {
            this.setProperty(id, value);
        } else {
            this.properties.set(name,
                {
                    index: -1,
                    value,
                    default: false,
                });
        }
    }

    setProperty(id, value) {
        const { prop } = this.activeProperties[id];
        prop.value = value;
        prop.default = false;
    }

    getPropertyId(name) {
        const prop = this.properties.get(name);
        return prop === undefined ? -1 : prop.index;
    }

    setShader(shader) {
        this.shader = shader;
        const { gl } = shader;
        if (shader === null) {
            return;
        }
        const {
            activeProperties,
            properties
        } = this;

        activeProperties.length = 0;

        for (const u of shader.uniforms) {
            const { name } = u.info;
            if (!properties.has(name)) {
                // default
                properties.set(name,
                    {
                        index: -1,
                        value: Shader.getDefaultValue(gl, u.info.type),
                        default: true,
                    });

            }

            const idx = activeProperties.length;
            const prop = properties.get(name);
            prop.index = idx;

            activeProperties.push({
                prop: prop,
                uniform: u,
                isSampler: isSampler(gl, u.info.type),
                setter: getUniformSetter(gl, u.info.type),
                globalProp: null
            });
        }

    }

    bind() {
        const { shader, activeProperties } = this;
        const { gl } = shader;
        // TODO global

        if (this.currentVersion < Material.globalVersion) {
            for (let i = 0; i < activeProperties.length; i++) {
                const pi = activeProperties[i];
                const { name } = pi.uniform.info;
                const gprop = Material.globalProperties.get(name);
                if (gprop !== undefined) {
                    pi.globalProp = gprop;
                } else {
                    pi.globalProp = null;
                }
            }

            this.currentVersion = Material.globalVersion;
        }

        shader.bind();
        let textureUnit = -1;




        for (let i = 0; i < activeProperties.length; i++) {

            const pi = activeProperties[i];
            const { prop } = pi;
            if (pi.isSampler) {
                let currentUnit = prop.value;

                if (prop.default && pi.globalProp != null) {

                    currentUnit = pi.globalProp.value;
                }

                if (Number.isInteger(currentUnit)) {
                    // integer -> assume texture unit
                    textureUnit = Math.max(textureUnit, currentUnit)
                }
            } else {
                if (prop.default && pi.globalProp != null) {

                    pi.setter(pi.uniform.location, pi.globalProp.value);
                } else {
                    pi.setter(pi.uniform.location, prop.value);
                }
            }
        }

        // go through textures
        textureUnit += 1;
        for (let i = 0; i < activeProperties.length; i++) {

            const pi = activeProperties[i];

            if (!pi.isSampler) {
                continue;
            }
            const { prop } = pi;
            let currentTexture = pi.prop.value;

            if (prop.default && pi.globalProp != null) {

                currentTexture = pi.globalProp.value;
            }
            if (Number.isInteger(currentTexture)) {
                // integer -> assume texture unit
                pi.setter(pi.uniform.location, currentTexture);


            } else {
                // assume texture
                currentTexture.bind(textureUnit);
                pi.setter(pi.uniform.location, textureUnit);

                textureUnit++;
            }

        }
    }

    clone() {
        const copy = new Material(this.shader);

        for (const [k, v] of this.properties) {
            copy.setPropertyByName(k, v.value);
        }
    }


}


class Attribute {
    static get VERTEX() { return 0; }
    static get UV() { return 1; }
    static get NORMAL() { return 2; }
    static get TANGENT() { return 3; }
    static get COLOR() { return 4; }

}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {TypedArray} array 
 * @returns 
 */
function typedArrayoGlType(gl, array) {
    if (array instanceof Int32Array) {
        return gl.INT;
    } else if (array instanceof Int16Array) {
        return gl.SHORT;
    } else if (array instanceof Int8Array) {
        return gl.BYTE;
    } else if (array instanceof Uint32Array) {
        return gl.UNSIGNED_INT;
    } else if (array instanceof Uint16Array) {
        return gl.UNSIGNED_SHORT;
    } else if (array instanceof Uint8Array) {
        return gl.UNSIGNED_BYTE;
    } else if (array instanceof Float32Array) {
        return gl.FLOAT;
    }

    throw new "Unsupported type for array";
}
class Mesh {

    attrributes = new Map();

    index = null;

    vao = null;
    /**
     * @type {WebGL2RenderingContext}
     */
    gl;

    needsUpdate = false;

    activatedAttributes = [];

    geometryType;

    constructor(gl) {
        this.gl = gl;

        this.geometryType = gl.TRIANGLES;
    }


    bind() {
        this.gl.bindVertexArray(this.vao);
    }

    unbind() {
        this.gl.bindVertexArray(null);
    }

    draw() {
        const {
            geometryType,
            gl
        } = this;



        if (this.index !== null) {
            const num = this.index.numElements
            this.bind();
            gl.drawElements(geometryType, num, this.index.type, 0, 0);
            this.unbind();

        } else {
            const vertices = this.attrributes.get(Attribute.VERTEX);
            if (vertices === undefined) {
                console.warn("No vertices or index buffer bound");
                return;
            }
            const num = vertices.numElements;
            this.bind();
            gl.drawArrays(geometryType, 0, num);
            this.unbind();
        }





    }

    compile() {

        const {
            gl
        } = this;

        if (this.vao === null) {
            this.vao = gl.createVertexArray();
        }

        const { vao } = this;

        gl.bindVertexArray(vao);

        for (let i = 0; i < this.activatedAttributes.length; i++) {
            const { aidx, buffer } = this.activatedAttributes[i];

            gl.disableVertexAttribArray(aidx);
            gl.deleteBuffer(buffer);
        }

        this.activatedAttributes = [];

        if (this.index !== null) {
            if (this.index.buffer === null) {

                const buffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);

                gl.bufferData(
                    gl.ELEMENT_ARRAY_BUFFER,
                    this.index.data,
                    gl.STATIC_DRAW,
                );
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
                this.index.buffer = buffer;
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index.buffer);
        }

        for (const [aidx, attrib] of this.attrributes) {
            if (attrib.buffer === null) {

                const buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, attrib.data, gl.STATIC_DRAW);

                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                attrib.buffer = buffer;
            }

            gl.enableVertexAttribArray(aidx);
            gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
            gl.vertexAttribPointer(aidx, attrib.numComponents, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
            this.activatedAttributes.push({ aidx, buffer: attrib.buffer });
        }
        gl.bindVertexArray(null);

    }

    /**
     * 
     * @param {GLuint} index 
     * @param {TypedArray} data 
     */
    setAttribute(index, data, numComponents, createBufferImmediately = false, normalized = false, stride = 0, offset = 0) {

        const { gl } = this;
        const bytesPerElem = data.BYTES_PER_ELEMENT;
        const type = typedArrayoGlType(gl, data);

        let buffer = null;

        if (createBufferImmediately) {

            buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        this.setAttributeBuffer(index, buffer, data, data.length / numComponents, numComponents, type, normalized, stride, offset);
    }

    setIndices(data, createBufferImmediately = false) {
        const { gl } = this;

        let buffer = null;

        if (createBufferImmediately) {
            buffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);

            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                data,
                gl.STATIC_DRAW,
            );
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        this.setIndexBuffer(buffer, typedArrayoGlType(gl, data), data, data.length);

    }

    setIndexBuffer(buffer, type, data, numElements) {


        this.index = { buffer, type, data, numElements };
        this.needsUpdate = true;

    }



    setAttributeBuffer(index, buffer, data, numElements, numComponents, type, normalized = false, stride = 0, offset = 0) {

        let attrib = this.attrributes.get(index);
        if (attrib === undefined) {
            attrib = {
                buffer: null,
                data,
                numElements,
                numComponents,
                type,
                normalized,
                stride,
                offset
            };

            this.attrributes.set(index, attrib);
        }

        attrib.buffer = buffer;
        this.needsUpdate = true;
    }
}


class Geometry {
    static createHemisphere(gl, numTheta, numPhi, r) {
        const numElements = ((numTheta - 1) * (numPhi + 1) + 1);
        const vertices = new Float32Array(numElements * 4);
        const normals = new Float32Array(numElements * 3);
        const uvs = new Float32Array(numElements * 2);


        let idx = 0;
        vertices[4 * idx + 0] = 0;
        vertices[4 * idx + 1] = 1;
        vertices[4 * idx + 2] = 0;
        vertices[4 * idx + 3] = 1;

        normals[3 * idx + 0] = 0;
        normals[3 * idx + 1] = 1;
        normals[3 * idx + 2] = 0;

        uvs[2 * idx + 0] = 0;
        uvs[2 * idx + 1] = 0;

        idx++;

        for (let y = 1; y < numTheta; y++) {

            const uRel = y / (numTheta - 1);

            const theta = uRel * Math.PI * 0.5;

            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let x = 0; x <= numPhi; x++) {

                const vRel = x / numPhi;
                const phi = vRel * Math.PI * 2;

                const px = sinTheta * Math.sin(phi);
                const py = cosTheta;
                const pz = sinTheta * Math.cos(phi);

                vertices[4 * idx + 0] = r * px;
                vertices[4 * idx + 1] = r * py;
                vertices[4 * idx + 2] = r * pz;
                vertices[4 * idx + 3] = 1;

                normals[3 * idx + 0] = px;
                normals[3 * idx + 1] = py;
                normals[3 * idx + 2] = pz;


                uvs[2 * idx + 0] = uRel;
                uvs[2 * idx + 1] = vRel;

                idx++;

            }
        }

        // replace with fixed size, can't be bothered to calculate right now
        const indexArray = [];


        // top
        for (let x = 0; x < numPhi; x++) {
            // top index
            const vt = 0;
            const vl = 1 + x;
            const vr = 1 + x + 1;

            indexArray.push(vt, vl, vr);
        }

        // faces
        for (let y = 0; y < numTheta - 2; y++) {
            const rowT = 1 + y * (numPhi + 1);
            const rowB = 1 + (y + 1) * (numPhi + 1);
            for (let x = 0; x < numPhi; x++) {

                const vtl = rowT + x;
                const vtr = rowT + x + 1;
                const vbl = rowB + x;
                const vbr = rowB + x + 1;

                indexArray.push(vtl, vbl, vbr);
                indexArray.push(vtl, vbr, vtr);

            }
        }


        const indices = new Uint16Array(indexArray);


        const mesh = new Mesh(gl);

        mesh.setIndices(indices);
        mesh.setAttribute(Attribute.VERTEX, vertices, 4);
        mesh.setAttribute(Attribute.UV, uvs, 2);
        mesh.setAttribute(Attribute.NORMAL, normals, 3);
        mesh.compile();

        return mesh;
    }

    static createSphere(gl, numTheta, numPhi, r) {
        const numElements = ((numTheta - 1) * (numPhi + 1) + 2);
        const vertices = new Float32Array(numElements * 4);
        const normals = new Float32Array(numElements * 3);
        const uvs = new Float32Array(numElements * 2);


        let idx = 0;
        vertices[4 * idx + 0] = 0;
        vertices[4 * idx + 1] = 1;
        vertices[4 * idx + 2] = 0;
        vertices[4 * idx + 3] = 1;

        normals[3 * idx + 0] = 0;
        normals[3 * idx + 1] = 1;
        normals[3 * idx + 2] = 0;

        uvs[2 * idx + 0] = 0;
        uvs[2 * idx + 1] = 0;

        idx++;

        vertices[4 * idx + 0] = 0;
        vertices[4 * idx + 1] = -1;
        vertices[4 * idx + 2] = 0;
        vertices[4 * idx + 3] = 1;

        normals[3 * idx + 0] = 0;
        normals[3 * idx + 1] = -1;
        normals[3 * idx + 2] = 0;

        uvs[2 * idx + 0] = 0;
        uvs[2 * idx + 1] = 0;

        idx++;

        for (let y = 1; y < numTheta; y++) {

            const uRel = y / (numTheta );

            const theta = uRel * Math.PI;

            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let x = 0; x <= numPhi; x++) {

                const vRel = x / numPhi;
                const phi = vRel * Math.PI * 2;

                const px = sinTheta * Math.sin(phi);
                const py = cosTheta;
                const pz = sinTheta * Math.cos(phi);

                vertices[4 * idx + 0] = r * px;
                vertices[4 * idx + 1] = r * py;
                vertices[4 * idx + 2] = r * pz;
                vertices[4 * idx + 3] = 1;

                normals[3 * idx + 0] = px;
                normals[3 * idx + 1] = py;
                normals[3 * idx + 2] = pz;


                uvs[2 * idx + 0] = uRel;
                uvs[2 * idx + 1] = vRel;

                idx++;

            }
        }

        // replace with fixed size, can't be bothered to calculate right now
        const indexArray = [];


        // top
        for (let x = 0; x < numPhi; x++) {
            // top index
            const vt = 0;
            const vl = 2 + x;
            const vr = 2 + x + 1;

            indexArray.push(vt, vl, vr);
        }

        // bottom
        const lastRowIdx = 2 + (numTheta - 2) * (numPhi + 1);
        for (let x = 0; x < numPhi; x++) {
            // bottom index
            const vt = 1;
            const vl = lastRowIdx + x;
            const vr = lastRowIdx + x + 1;

            indexArray.push(vt, vr, vl);
        }


        // faces
        for (let y = 0; y < numTheta - 2; y++) {
            const rowT = 2 + y * (numPhi + 1);
            const rowB = 2 + (y + 1) * (numPhi + 1);
            for (let x = 0; x < numPhi; x++) {

                const vtl = rowT + x;
                const vtr = rowT + x + 1;
                const vbl = rowB + x;
                const vbr = rowB + x + 1;

                indexArray.push(vtl, vbl, vbr);
                indexArray.push(vtl, vbr, vtr);

            }
        }


        const indices = new Uint16Array(indexArray);


        const mesh = new Mesh(gl);

        mesh.setIndices(indices);
        mesh.setAttribute(Attribute.VERTEX, vertices, 4);
        mesh.setAttribute(Attribute.UV, uvs, 2);
        mesh.setAttribute(Attribute.NORMAL, normals, 3);
        mesh.compile();

        return mesh;
    }
}

class Renderable {

    /**
     * @type {Array<Renderable>}
     */
    children = [];
    parent = null;
    previousTransformVersion = -1;
    transformVersion = 0;

    #localToWorld = jsm.MatF32.id(4);
    #worldToLocal = jsm.MatF32.id(4);

    #localTransform = jsm.MatF32.id(4);


    /**
     * @type {Material}
     */
    material = null;
    /**
     * @type {Mesh}
     */
    mesh = null;

    constructor(material, mesh, localTransform = jsm.MatF32.id(4)) {
        this.material = material;
        this.mesh = mesh;
        this.#localTransform = localTransform;
        this.updateTransform();
    }

    render() {
        if (this.material !== null) {
            this.material.setPropertyByName("M", this.localToWorld._data);
            this.material.bind();
        }

        if (this.mesh !== null) {
            this.mesh.draw();
        }

        for (const c of this.children) {
            c.render();
        }
    }

    get localToWorld() {

        this.updateTransform();

        return this.#localToWorld;
    }

    get worldToLocal() {
        this.updateTransform();

        return this.#worldToLocal;
    }


    setLocal(localTransform) {
        this.#localTransform = localTransform;
        this.#updateTransformVersion();
    }
    updateTransform() {
        if (this.transformVersion <= this.previousTransformVersion) {
            return;
        }

        let T = this.#localTransform;

        if (this.parent !== null) {
            T = jsm.mult(this.parent.localToWorld, T);
        }

        this.#localToWorld = T;
        this.#worldToLocal = jsm.inv(T);

        this.previousTransformVersion = this.transformVersion;

    }


    /**
     * 
     * @param {Renderable | null} parent 
     * @returns 
     */
    setParent(parent) {

        if (parent === this.parent) {
            return;
        }

        if (parent === this) {
            throw "Self reference not allowed";
        }

        // remove from old
        if (this.parent !== null) {
            const childIdx = this.parent.children.indexOf(this);
            // must be non-negative
            if (childIdx < 0) {
                throw "Error in child relation";
            }
            this.parent.children.splice(childIdx, 1);
            this.parent = null;
        }

        if (parent.children.indexOf(this) >= 0) {
            throw "Renderable already part of the children";
        }

        this.parent = parent;

        parent.children.push(this);

        this.#updateTransformVersion();
    }

    #updateTransformVersion() {
        this.transformVersion++;

        for (const c of this.children) {
            c.#updateTransformVersion();
        }
    }

}


export { Texture, Sampler, TextureSampler, Shader, Material, Attribute, Mesh, Geometry, Renderable }