/// <reference types="@webgpu/types" />
// LICENSE
// In addition to the below MIT license, any form of AI training is prohibited
// Copyright (c) 2026 sibaku
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// code in here was produced without a planning just to test things out, so don't expect any clean software engineering.
// Refactoring/optimization is possible, but for a short demo this was enough
// cheers!
class GpuEnvironment {
    constructor(gpu, adapter, device, canvas, context) {
        this.gpu = gpu;
        this.adapter = adapter;
        this.device = device;
        this.canvas = canvas;
        this.context = context;
    }
}
const common_wgsl_funcs = /* wgsl */ `
    fn worldToVP(bmin : vec2f, bmax: vec2f, pWorld: vec2f)  -> vec2f {
      let delta = bmax - bmin;

      let pVP = (pWorld - bmin) / delta * 2.0 - vec2f(1.0,1.0);
      return pVP;
    }
`;
const common_wgsl_data = /* wgsl */ `
 struct Vertex {
      position: vec2f,
      velocity: vec2f,
      radius : f32,
      speed : f32,
    };

`;
const common_wgsl_objects = /* wgsl */ `
struct Circle {
  center : vec2f,
  radius : f32,
  inside : f32,
};

struct Rectangle {
  center: vec2f,
  halfSize: vec2f,
  angle: f32,
  inside : f32,
}

fn rot_2d(p:vec2f, a : f32) -> vec2f{
  let ca = cos(a);
  let sa = sin(a);

  return vec2f(
    p.x * ca - p.y *sa,
    p.x * sa + p.y * ca
  );
}

fn sdf_circ(c : Circle, p : vec2f) -> f32{
   let d01 = p - c.center;
    let d = (length(d01) - c.radius) * c.inside;
    return d;
}

fn sdf_circ_normal(c: Circle, p: vec2f) -> vec2f{
  let d01 = p - c.center;
  let innerNormal = normalize(d01) * c.inside;

  return innerNormal;
}

// adapted from https://iquilezles.org/articles/distfunctions2d/
fn sdf_rect(rect : Rectangle, p: vec2f) -> f32
{ 
    let pl = rot_2d(p - rect.center, - rect.angle);
    let d = abs(pl)-rect.halfSize;
    return (length(max(d,vec2f(0.0))) + min(max(d.x,d.y),0.0) )* rect.inside;
}


fn sdf_rect_normal(rect : Rectangle, p: vec2f) -> vec2f{
  // sorry, no smart version, just the simple one
  let eps = vec2f(1E-5,0.0);

  let dr0 = sdf_rect(rect, p + eps.xy);
  let dl0 = sdf_rect(rect, p - eps.xy);

  let d0r = sdf_rect(rect, p + eps.yx);
  let d0l = sdf_rect(rect, p - eps.yx);

  let n = normalize(vec2f(dr0 - dl0, d0r - d0l));

  return n;
}

@group(1) @binding(0) var<storage, read> circles: array<Circle>;
@group(1) @binding(1) var<storage, read> rectangles: array<Rectangle>;
@group(1) @binding(2) var<storage, read> shape_sizes: array<i32>;
`;
const common_obj_layout_descriptor = [
    {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        buffer: {
            type: "read-only-storage",
        },
    },
    {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        buffer: {
            type: "read-only-storage",
        },
    },
    {
        binding: 2,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        buffer: {
            type: "read-only-storage",
        },
    },
];
class BaseBufferWrapper {
    constructor(device, elementByteSize, numElements, usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST) {
        this.device = device;
        this.numElements = numElements;
        this.elementByteSize = elementByteSize;
        // all values are 4 bytes (32 bit) minumum
        this.elementSize = elementByteSize / 4;
        const [buffer, backingBuffer] = reserveBuffers(device, elementByteSize * numElements, usage);
        this.gpuBuffer = buffer;
        this.backingBuffer = backingBuffer;
        this.viewF32 = new Float32Array(this.backingBuffer);
        this.viewI32 = new Int32Array(this.backingBuffer);
        this.usage = usage;
    }
    upload(bufferOffset, dataOffset, size) {
        bufferOffset = bufferOffset !== undefined ? bufferOffset : 0;
        this.device.queue.writeBuffer(this.gpuBuffer, bufferOffset, this.backingBuffer, dataOffset, size);
    }
    setInt(index, value) {
        this.viewI32[index] = value;
    }
    setElementInt(elementIndex, memberOffset, value) {
        this.viewI32[elementIndex * this.elementSize + memberOffset] = value;
    }
    setFloat(index, value) {
        this.viewF32[index] = value;
    }
    setElementFloat(elementIndex, memberOffset, value) {
        this.viewF32[elementIndex * this.elementSize + memberOffset] = value;
    }
}
class VertexBuffer extends BaseBufferWrapper {
    constructor(device, numElements) {
        const byteSize = 4 * 2 + // position
            4 * 2 + // velocity
            4 + // radius
            4 // speed
        ;
        super(device, byteSize, numElements);
    }
    setPosition(element, x, y) {
        this.setElementFloat(element, 0, x);
        this.setElementFloat(element, 1, y);
    }
    setVelocity(element, x, y) {
        this.setElementFloat(element, 2, x);
        this.setElementFloat(element, 3, y);
        this.setElementFloat(element, 5, Math.sqrt(x * x + y * y));
    }
    setRadius(element, r) {
        this.setElementFloat(element, 4, r);
    }
}
class ViewportBuffer extends BaseBufferWrapper {
    constructor(device) {
        const byteSize = 4 * 2 + // bmin
            4 * 2 // bmax
        ;
        super(device, byteSize, 1, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
    }
    setBmin(x, y) {
        this.setFloat(0, x);
        this.setFloat(1, y);
    }
    setBmax(x, y) {
        this.setFloat(2, x);
        this.setFloat(3, y);
    }
}
class UniformStateBuffer extends BaseBufferWrapper {
    constructor(device) {
        const byteSize = 4 + // time 
            4 + // dt
            4 + // num_points
            4 // radius
        ;
        super(device, byteSize, 1, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
    }
    setTime(time) {
        this.setFloat(0, time);
    }
    setDt(dt) {
        this.setFloat(1, dt);
    }
    setNumPoints(numPoints) {
        this.setInt(2, numPoints);
    }
    setRadius(radius) {
        this.setFloat(3, radius);
    }
}
class CircleBuffer extends BaseBufferWrapper {
    constructor(device, numElements) {
        const byteSize = 4 * 2 + // center 
            4 + // radius
            4 // inside
        ;
        super(device, byteSize, numElements);
    }
    setCenter(element, x, y) {
        this.setElementFloat(element, 0, x);
        this.setElementFloat(element, 1, y);
    }
    setRadius(element, r) {
        this.setElementFloat(element, 2, r);
    }
    setInside(element, inside) {
        this.setElementFloat(element, 3, inside);
    }
}
class RectBuffer extends BaseBufferWrapper {
    constructor(device, numElements) {
        const byteSize = 4 * 2 + // center 
            4 * 2 + // halfSize
            4 + // angle
            4 // inside
        ;
        super(device, byteSize, numElements);
    }
    setCenter(element, x, y) {
        this.setElementFloat(element, 0, x);
        this.setElementFloat(element, 1, y);
    }
    setHalfSize(element, x, y) {
        this.setElementFloat(element, 2, x);
        this.setElementFloat(element, 3, y);
    }
    setAngle(element, a) {
        this.setElementFloat(element, 4, a);
    }
    setInside(element, inside) {
        this.setElementFloat(element, 5, inside);
    }
}
function reserveBuffers(device, byteSize, usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST) {
    const buffer = device.createBuffer({
        size: byteSize,
        usage,
    });
    const backingBuffer = new ArrayBuffer(byteSize);
    return [buffer, backingBuffer];
}
function reserveCircleBuffers(device, elements) {
    const byteSize = 4 * 2 + // center
        4 + // radius
        4 // padding
    ;
}
function sampleCircleOutline(device, numPoints, center = { x: 0.0, y: 0.0 }, radius = 0.5, velocity = { x: 1.0, y: 0.0 }, thicknessFactor = 0.1) {
    const vertexBuffer = new VertexBuffer(device, numPoints);
    const circ = 2.0 * Math.PI * radius;
    // due to rendering min size, using exact area for particles will not nicely fill the space...
    const elR = radius * thicknessFactor;
    for (let i = 0; i < numPoints; i++) {
        const alpha = i / numPoints * Math.PI * 2;
        vertexBuffer.setPosition(i, center.x + Math.cos(alpha) * radius, center.y + Math.sin(alpha) * radius);
        vertexBuffer.setVelocity(i, velocity.x, velocity.y);
        vertexBuffer.setRadius(i, elR);
    }
    vertexBuffer.upload();
    return vertexBuffer;
}
function sampleCircle(device, numPoints, center = { x: 0.0, y: 0.0 }, radius = 0.5, velocity = { x: 1.0, y: 0.0 }, areaScale = 0.1) {
    const vertexBuffer = new VertexBuffer(device, numPoints);
    const circArea = Math.PI * radius * radius;
    const uniformDisk = (ua, ur) => {
        const r = Math.sqrt(ur);
        const alpha = ua * 2.0 * Math.PI;
        const sa = Math.sin(alpha);
        const ca = Math.cos(alpha);
        const x = r * ca;
        const y = r * sa;
        return [x, y];
    };
    // due to rendering min size, using exact area for particles will not nicely fill the space...
    const elR = radius * areaScale;
    const num = Math.ceil(Math.sqrt(numPoints));
    let idx = 0;
    for (let r = 0; r < num; r++) {
        for (let a = 0; a < num; a++) {
            const ur = r / num;
            const ua = a / num;
            const [x, y] = uniformDisk(ua, ur);
            vertexBuffer.setPosition(idx, radius * x, radius * y);
            vertexBuffer.setVelocity(idx, velocity.x, velocity.y);
            vertexBuffer.setRadius(idx, elR);
            idx++;
        }
    }
    vertexBuffer.upload();
    return vertexBuffer;
}
function sampleBox(device, numPoints, center = { x: 0.0, y: 0.0 }, halfSize = { x: 0.5, y: 0.5 }, velocity = { x: 1.0, y: 0.0 }, areaScale = 0.1) {
    const vertexBuffer = new VertexBuffer(device, numPoints);
    const boxArea = halfSize.x * halfSize.y * 2 * 2;
    const bmin = {
        x: center.x - halfSize.x,
        y: center.y - halfSize.y,
    };
    const point = (uw, uh) => {
        const x = bmin.x + uw * halfSize.x * 2;
        const y = bmin.y + uh * halfSize.y * 2;
        return [x, y];
    };
    // due to rendering min size, using exact area for particles will not nicely fill the space...
    const elR = Math.max(halfSize.x, halfSize.y) * 2 * areaScale;
    const num = Math.ceil(Math.sqrt(numPoints));
    let idx = 0;
    for (let h = 0; h < num; h++) {
        for (let w = 0; w < num; w++) {
            const uh = h / num;
            const uw = w / num;
            const [x, y] = point(uw, uh);
            vertexBuffer.setPosition(idx, x, y);
            vertexBuffer.setVelocity(idx, velocity.x, velocity.y);
            vertexBuffer.setRadius(idx, elR);
            idx++;
        }
    }
    vertexBuffer.upload();
    return vertexBuffer;
}
class State {
    constructor(env) {
        this.frame = 0;
        this.timeScale = 1.0;
        this.running = false;
        this.offscreen = null;
        this.textures = [];
        this.samplers = [];
        this.currentTextureIndex = 0;
        this.offscreenSize = { w: 0, h: 0 };
        this.textureFormat = 'rgba16float';
        this.offscreenFormat = 'rgba8unorm';
        this.numPoints = 100000;
        this.env = env;
        this.time = 0.0;
        this.timestampLast = performance.now();
        this.dt = 0.0;
        this.composeParams = new ComposeParamsBuffer(env.device);
        this.composeParams.upload();
        const MAX_CAPACITY = 100;
        this.geometryBuffers = {
            circles: new CapacityBuffer(new CircleBuffer(env.device, MAX_CAPACITY)),
            rects: new CapacityBuffer(new RectBuffer(env.device, MAX_CAPACITY)),
        };
        this.geometrySizesBuffer = new BaseBufferWrapper(env.device, 4, 2);
        this.updateObstacles(new Set([O_BIG_CIRCLE]));
        const uniformStateBuffer = new UniformStateBuffer(env.device);
        uniformStateBuffer.setTime(0.0);
        uniformStateBuffer.setDt(0.0);
        uniformStateBuffer.setNumPoints(this.numPoints);
        uniformStateBuffer.setRadius(1.0);
        uniformStateBuffer.upload();
        this.uniformStateBuffer = uniformStateBuffer;
        const viewportBuffer = new ViewportBuffer(env.device);
        viewportBuffer.setBmin(-1.0, -1.0);
        viewportBuffer.setBmax(1.0, 1.0);
        viewportBuffer.upload();
        this.viewportBuffer = viewportBuffer;
        this.viridis = createGradientMap(env.device, [
            [253, 231, 37, 255],
            [94, 201, 98, 255],
            [33, 145, 140, 255],
            [59, 82, 139, 255],
            [68, 1, 84, 255]
        ]);
        this.plasma = createGradientMap(env.device, [
            [240, 249, 33, 255],
            [248, 149, 64, 255],
            [204, 71, 120, 255],
            [126, 3, 168, 255],
            [13, 8, 135, 255]
        ]);
        this.drawShaderBindGroupLayout = env.device.createBindGroupLayout({
            label: "draw shader layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "read-only-storage",
                    },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform"
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform"
                    }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
            ],
        });
        const commonObjLayout = env.device.createBindGroupLayout({
            label: "common object layout",
            entries: common_obj_layout_descriptor
        });
        this.commonObjLayout = commonObjLayout;
        this.computePipeline = createComputePass(this, commonObjLayout);
        this.composePipeline = createScreenCompose(this);
        this.screenPipeline = createScreenTexPass(this);
        this.obstaclePipeline = createObstacleRenderPass(this, commonObjLayout);
        this.initPoints({
            type: "circleOutline",
            center: { x: 0.0, y: 0.0 },
            radius: 0.1,
            velocity: { x: 0.75, y: 0.0 },
            thicknessFactor: 0.1,
            numPoints: this.numPoints,
        });
    }
    initPoints(options) {
        if (this.vertexBuffer) {
            this.vertexBuffer.gpuBuffer.destroy();
        }
        if (options.type === "circle") {
            this.vertexBuffer = sampleCircle(this.env.device, this.numPoints, options.center, options.radius, options.velocity, options.areaScale);
            this.numPoints = this.vertexBuffer.numElements;
        }
        else if (options.type === "circleOutline") {
            this.numPoints = options.numPoints;
            this.vertexBuffer = sampleCircleOutline(this.env.device, this.numPoints, options.center, options.radius, options.velocity, options.thicknessFactor);
        }
        else if (options.type === "box") {
            this.vertexBuffer = sampleBox(this.env.device, this.numPoints, options.center, options.halfSize, options.velocity, options.areaScale);
        }
        this.drawShaderBindGroup = this.env.device.createBindGroup({
            label: "draw shader bind group",
            layout: this.drawShaderBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.vertexBuffer.gpuBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.uniformStateBuffer.gpuBuffer,
                    },
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.viewportBuffer.gpuBuffer,
                    },
                },
                {
                    binding: 3,
                    resource: this.viridis[0].createView(),
                },
                {
                    binding: 4,
                    resource: this.viridis[1],
                },
            ],
        });
        this.computeBindGroup = this.env.device.createBindGroup({
            label: "compute bind group",
            layout: this.computePipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.vertexBuffer.gpuBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.uniformStateBuffer.gpuBuffer,
                    },
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.viewportBuffer.gpuBuffer,
                    },
                },
            ],
        });
    }
    nextFrame() {
        this.frame += 1;
    }
    updateObstacles(activatedObstacles) {
        for (let [k, v] of Object.entries(this.geometryBuffers)) {
            v.size = 0;
        }
        // always include screen
        {
            const { rects } = this.geometryBuffers;
            const idx = rects.size;
            rects.buffer.setCenter(idx, 0, 0);
            rects.buffer.setHalfSize(idx, 1, 1);
            rects.buffer.setAngle(idx, 0);
            rects.buffer.setInside(idx, -1.0);
            rects.size++;
        }
        if (activatedObstacles.has(O_BIG_CIRCLE)) {
            createBigCircleObstacle(this, this.geometryBuffers);
        }
        if (activatedObstacles.has(O_SMALL_CIRCLE)) {
            createSmallCircleObstacle(this, this.geometryBuffers);
        }
        if (activatedObstacles.has(O_BIG_RECT)) {
            createInnerRect(this, this.geometryBuffers);
        }
        if (activatedObstacles.has(O_CORNER_RECTS)) {
            createCornerRects(this, this.geometryBuffers);
        }
        for (let [k, v] of Object.entries(this.geometryBuffers)) {
            v.buffer.upload();
        }
        this.geometrySizesBuffer.setInt(0, this.geometryBuffers.circles.size);
        this.geometrySizesBuffer.setInt(1, this.geometryBuffers.rects.size);
        this.geometrySizesBuffer.upload();
    }
    initTextures(outputSize) {
        let textures = this.textures;
        const { device } = this.env;
        this.offscreenSize = outputSize;
        this.offscreen = {
            tex: device.createTexture({
                size: [outputSize.w, outputSize.h],
                format: this.offscreenFormat,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING,
            }),
            sampler: device.createSampler({
                addressModeU: 'repeat',
                addressModeV: 'repeat',
                magFilter: 'linear',
                minFilter: 'linear',
                mipmapFilter: 'linear',
            })
        };
        for (let i = 0; i < 2; i++) {
            textures.push(device.createTexture({
                size: [outputSize.w, outputSize.h],
                format: this.textureFormat,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING,
            }));
        }
        this.samplers = textures.map(_ => device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
        }));
        this.currentTextureIndex = 0;
    }
    getOffscreen() {
        if (this.offscreen === null) {
            throw new Error("Access before initialization");
        }
        return [this.offscreen.tex, this.offscreen.sampler];
    }
    getCurrent() {
        return [this.textures[this.currentTextureIndex], this.samplers[this.currentTextureIndex]];
    }
    getPrevious() {
        const idx = (this.currentTextureIndex - 1 + this.textures.length) % this.textures.length;
        return [this.textures[idx], this.samplers[idx]];
    }
    stepTexture() {
        this.currentTextureIndex = (this.currentTextureIndex + 1) % this.textures.length;
    }
    initTime() {
        this.timestampLast = performance.now();
    }
    updateTime() {
        const t = performance.now();
        const deltaMS = t - this.timestampLast;
        this.timestampLast = t;
        this.dt = Math.min(1.0 / 60.0, deltaMS / 1000.0);
        this.dt *= this.timeScale;
        this.dt *= this.running ? 1.0 : 0.0;
        this.time += this.dt;
    }
}
async function init() {
    const gpu = navigator.gpu;
    if (gpu === undefined || gpu === null) {
        return null;
    }
    const adapter = await gpu.requestAdapter();
    if (adapter === null) {
        console.error("Could not get adapter");
        return null;
    }
    const device = await (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
    if (device === null || device === undefined) {
        console.error('need a browser that supports WebGPU');
        return null;
    }
    console.log(device);
    const canvas = document.querySelector('canvas');
    if (canvas === null) {
        console.error("No canvas");
        return null;
    }
    const context = canvas.getContext('webgpu');
    if (context === null) {
        console.error("Error getting webgpu context");
        return null;
    }
    return new GpuEnvironment(gpu, adapter, device, canvas, context);
}
function createComputePass(state, commonLayout) {
    const { env } = state;
    const { device } = env;
    const module = device.createShaderModule({
        label: 'update positions compute',
        code: /* wgsl */ `

    ${common_wgsl_funcs}
    ${common_wgsl_data}

    ${common_wgsl_objects}

   struct UniformData {
        time : f32,
        dt: f32,
        numPoints : i32,
        pointRadius: f32,
    };

    struct Viewport {
      bmin : vec2f,
      bmax : vec2f,
    }
    @group(0) @binding(1) var<uniform> uniformData : UniformData;
    @group(0) @binding(2) var<uniform> viewport : Viewport;


    @group(0) @binding(0) var<storage, read_write> pos_data: array<Vertex>;
      @compute @workgroup_size(64,1,1) fn computeSomething(
        @builtin(global_invocation_id) id: vec3u
      ) {
        let i = id.x;
        if(i > arrayLength(&pos_data)){
          return;
        }

        var p = pos_data[i].position;
        var v = pos_data[i].velocity;

        p = p  + pos_data[i].velocity*uniformData.dt;
        let pr = pos_data[i].radius;

        var dmin = 100000.0;
        var nmin = vec2f(0.0);


        for(var j = 0; j < shape_sizes[0]; j++){
          let ci = circles[j];

          
          let d = sdf_circ(ci, p);

          if(d < dmin){
            dmin = d;
            nmin = sdf_circ_normal(ci,p);
        
          }
        }

        for(var j = 0; j < shape_sizes[1]; j++){
          let rectj = rectangles[j];

          
          let d = sdf_rect(rectj, p);

          if(d < dmin){
            dmin = d;
            nmin = sdf_rect_normal(rectj,p);
        
          }
        }


        let dpr = dmin - pr;
        if(dpr < 0.0){

          p = p - nmin * 0.95*dpr;
          
          if(dot(nmin, v) < 0.0){
           
            
            v = reflect(v,nmin);
          }

        }

        if(length(v) > 0.0){
          v = normalize(v) * pos_data[i].speed;
        }
        pos_data[i].position = p;
        pos_data[i].velocity = v;
      }
    `,
    });
    const bindGroupLayout = device.createBindGroupLayout({
        label: "compute bind layout",
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                },
            },
            {
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "uniform"
                }
            },
            {
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "uniform"
                }
            },
        ],
    });
    const pipeline = device.createComputePipeline({
        label: 'compute pipeline',
        layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout, commonLayout],
        }),
        compute: {
            module,
        },
    });
    return pipeline;
}
function createGradientMap(device, colors) {
    const data = new Uint8Array(colors.flat());
    const texture = device.createTexture({
        size: [colors.length, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    device.queue.writeTexture({ texture }, data, { bytesPerRow: colors.length * 4 }, { width: colors.length, height: 1 });
    return [texture, device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
        })];
}
function createScreenCompose(state) {
    const { device, gpu } = state.env;
    const module = device.createShaderModule({
        label: 'screen compose shader',
        code: /* wgsl */ `

      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv: vec2f,
      };
    

    @vertex fn vs(
      @builtin(vertex_index) vertexIndex : u32,
      @builtin(instance_index) instanceIndex: u32
    ) -> VertexOutput {
      let pos = array(
        vec2f( -1.0,  -1.0),
        vec2f(3.0, -1.0),
        vec2f( -1.0, 3.0),
      );

      let uvs = array(
        vec2f( 0.0,  0.0),
        vec2f(2.0, 0.0),
        vec2f( 0.0, 2.0),
      );

      let pClip = pos[vertexIndex];

      let uv = uvs[vertexIndex];
        

      var vsOutput: VertexOutput;
      vsOutput.position = vec4f(pClip, 0.0, 1.0);
      vsOutput.uv = uv;
      return vsOutput;
    }

    @group(0) @binding(0) var tex: texture_2d<f32>;
    @group(0) @binding(1) var texSampler: sampler;

    @group(0) @binding(2) var prevTex: texture_2d<f32>;
    @group(0) @binding(3) var prevTexSampler: sampler;

    struct ComposeParams {
      blendFactor : f32,
    };

    @group(0) @binding(4) var<uniform> composeParams : ComposeParams;

    @fragment fn fs(input: VertexOutput) -> @location(0) vec4f {

      var testUv = input.uv;
      // render/texture coord system has y down, but ndc has y up
      testUv.y = 1.0 - testUv.y;
      let cur = textureSample(tex, texSampler, testUv);
      let prev = textureSample(prevTex, prevTexSampler, testUv);

      var mixed = cur + prev * composeParams.blendFactor * (1.0 - cur.a);
  
      var fc = cur + mixed * (1.0 - cur.a);
      mixed.a = 1.0;
      return mixed;
    }
    `,
    });
    const bindGroupLayout = device.createBindGroupLayout({
        label: "screen compose layout",
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {}
            },
            {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            },
            {
                binding: 3,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {}
            },
            {
                binding: 4,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform"
                }
            },
        ],
    });
    const pipeline = device.createRenderPipeline({
        label: 'screen compose pipeline',
        layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        }),
        vertex: {
            entryPoint: 'vs',
            module,
        },
        fragment: {
            entryPoint: 'fs',
            module,
            targets: [{
                    format: state.textureFormat,
                }],
        },
    });
    return pipeline;
}
function createScreenTexPass(state) {
    const { device, gpu } = state.env;
    const module = device.createShaderModule({
        label: 'screen tex shader',
        code: /* wgsl */ `

      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv: vec2f,
      };
    

    @vertex fn vs(
      @builtin(vertex_index) vertexIndex : u32,
      @builtin(instance_index) instanceIndex: u32
    ) -> VertexOutput {
      let pos = array(
        vec2f( -1.0,  -1.0),
        vec2f(3.0, -1.0),
        vec2f( -1.0, 3.0),
      );

      let uvs = array(
        vec2f( 0.0,  0.0),
        vec2f(2.0, 0.0),
        vec2f( 0.0, 2.0),
      );

      let pClip = pos[vertexIndex];

      let uv = uvs[vertexIndex];
        

      var vsOutput: VertexOutput;
      vsOutput.position = vec4f(pClip, 0.0, 1.0);
      vsOutput.uv = uv;
      return vsOutput;
    }

    @group(0) @binding(0) var tex: texture_2d<f32>;
    @group(0) @binding(1) var texSampler: sampler;


    @fragment fn fs(input: VertexOutput) -> @location(0) vec4f {
      var testUv = input.uv;
      // render/texture coord system has y down, but ndc has y up
      testUv.y = 1.0 - testUv.y;
      
      return textureSample(tex, texSampler, testUv);

    }
    `,
    });
    const pipeline = device.createRenderPipeline({
        label: 'screen texture pipeline',
        layout: "auto",
        vertex: {
            entryPoint: 'vs',
            module,
        },
        fragment: {
            entryPoint: 'fs',
            module,
            targets: [{
                    format: gpu.getPreferredCanvasFormat(),
                }],
        },
    });
    return pipeline;
}
class ComposeParamsBuffer extends BaseBufferWrapper {
    constructor(device) {
        const byteSize = 4 // blendFactor
        ;
        super(device, byteSize, 1, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
    }
    setBlendFactor(f) {
        this.setFloat(0, f);
    }
}
function createObstacleRenderPass(state, commonLayout) {
    const { device, gpu } = state.env;
    const module = device.createShaderModule({
        label: 'obstacle shader',
        code: /* wgsl */ `

    ${common_wgsl_objects}
      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv: vec2f,
        @location(1) posW: vec2f,
      };
    

  struct UniformData {
        time : f32,
        dt: f32,
        numPoints : i32,
        pointRadius: f32,
    };

    struct Viewport {
      bmin : vec2f,
      bmax : vec2f,
    }
    @group(0) @binding(2) var<uniform> viewport : Viewport;


    @vertex fn vs(
      @builtin(vertex_index) vertexIndex : u32,
      @builtin(instance_index) instanceIndex: u32
    ) -> VertexOutput {
      let pos = array(
        vec2f( -1.0,  -1.0),
        vec2f(3.0, -1.0),
        vec2f( -1.0, 3.0),
      );

      let uvs = array(
        vec2f( 0.0,  0.0), 
        vec2f(2.0, 0.0), 
        vec2f( 0.0, 2.0), 
      );

      let pClip = pos[vertexIndex];

      let uv = uvs[vertexIndex];
        

      var vsOutput: VertexOutput;
      vsOutput.position = vec4f(pClip, 0.0, 1.0);
      vsOutput.uv = uv;
      vsOutput.posW = vec2(0.0);
      return vsOutput;
    }

    @fragment fn fs(input: VertexOutput) -> @location(0) vec4f {

      let pw = input.uv * (viewport.bmax - viewport.bmin) + viewport.bmin;

      var color = vec4f(0.0,0.0,0.0,0.0);

      var dmin = 10000000.0;
      for(var j = 0; j < shape_sizes[0]; j++){
        let ci = circles[j];
        dmin = min(dmin, abs(sdf_circ(ci,pw)));

      }

      for(var j = 0; j < shape_sizes[1]; j++){
        let rectj = rectangles[j];
        dmin = min(dmin, abs(sdf_rect(rectj, pw)));

      }

   
      if(dmin < 0.01){

          let alpha = 1.0 - smoothstep(0.0,0.009, dmin);

          color = vec4f(vec3f(0.5,0.5,0.5) * alpha,alpha);

        }
        
      return color;
    }
    `,
    });
    const bindGroupLayout = device.createBindGroupLayout({
        label: "obstacle layout",
        entries: [
            {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform"
                }
            },
        ],
    });
    const pipeline = device.createRenderPipeline({
        label: 'obstacle pipeline',
        layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout, commonLayout],
        }),
        vertex: {
            entryPoint: 'vs',
            module,
        },
        fragment: {
            entryPoint: 'fs',
            module,
            targets: [{
                    format: state.offscreenFormat,
                    blend: {
                        color: {
                            operation: 'add',
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha'
                        },
                        alpha: {
                            operation: 'add',
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha'
                        },
                    }
                }],
        },
    });
    return pipeline;
}
function createContainer(children = [], tag = "div") {
    const container = document.createElement(tag);
    for (let c of children) {
        container.appendChild(c);
    }
    return container;
}
class MappedSlider {
    constructor(min, max, callback, initialValue = min, steps = 100) {
        const slider = document.createElement("input");
        this.events = new EventTarget();
        slider.type = "range";
        slider.min = "0";
        slider.max = (steps - 1).toString();
        this.slider = slider;
        this.min = min;
        this.max = max;
        this.delta = max - min;
        this.steps = steps;
        slider.oninput = () => {
            this.events.dispatchEvent(new CustomEvent("input", { detail: this }));
        };
        this.events.addEventListener("input", callback);
        this.setValue(initialValue);
    }
    getValue() {
        const sv = this.slider.valueAsNumber;
        return sv / (this.steps - 1) * this.delta + this.min;
    }
    setValue(v, notify = true) {
        const vn = (v - this.min) / this.delta;
        this.slider.valueAsNumber = vn * (this.steps - 1);
        if (notify) {
            const e = new Event("input", { bubbles: true });
            this.events.dispatchEvent(new CustomEvent("input", { detail: this }));
        }
    }
}
const defaultFormatter = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 2 });
function formatNumber(v) {
    return defaultFormatter.format(v);
}
function createLabeledSlider(options) {
    const { label = "", min = 0, max = 1, initialValue = 0, valueCallback = () => { }, steps = 100, addValueDisplay = true, } = options;
    const ms = new MappedSlider(min, max, (e) => {
        if (e.detail) {
            valueCallback(e.detail);
        }
    }, initialValue, steps);
    const container = createContainer([], "span");
    const elements = [];
    const labelEl = document.createElement("label");
    labelEl.append(document.createTextNode(label));
    labelEl.append(ms.slider);
    elements.push(labelEl);
    if (addValueDisplay) {
        const valueElement = document.createElement("span");
        valueElement.innerText = formatNumber(ms.getValue());
        const update = (val) => {
            valueElement.innerText = formatNumber(val);
        };
        ms.events.addEventListener("input", (e) => {
            if (e.detail) {
                update(e.detail.getValue());
            }
        });
        elements.push(valueElement);
    }
    container.append(...elements);
    return { root: container, mappedSlider: ms };
}
function labelElement(label, element) {
    const labelEl = document.createElement("label");
    labelEl.textContent = label;
    labelEl.append(element);
    return labelEl;
}
function createCheckbox(checked = true) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    return checkbox;
}
const O_BIG_CIRCLE = "big_circle";
const O_SMALL_CIRCLE = "small_circle";
const O_BIG_RECT = "inner_rect";
const O_CORNER_RECTS = "corner_rects";
function buildInterfaceOptions(container, state) {
    {
        const simContainer = createContainer();
        const header = document.createElement("h3");
        header.textContent = "Simulation";
        simContainer.append(header);
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = false;
        state.running = checkbox.checked;
        checkbox.oninput = () => {
            state.running = checkbox.checked;
        };
        const label = document.createElement("label");
        label.textContent = "Running";
        label.append(checkbox);
        simContainer.append(createContainer([label]));
        const { root: trailRoot, mappedSlider: trailSlider } = createLabeledSlider({
            label: "Trail strength",
            initialValue: 0.75,
            valueCallback: (slider) => {
                state.composeParams.setBlendFactor(Math.pow(slider.getValue(), 1.0 / 16.0));
            }
        });
        simContainer.append(createContainer([trailRoot]));
        const { root: timeScaleRoot, mappedSlider } = createLabeledSlider({
            label: "Time scale",
            initialValue: 0.5,
            steps: 200,
            valueCallback: (slider) => {
                state.timeScale = slider.getValue();
            }
        });
        simContainer.append(createContainer([timeScaleRoot]));
        container.append(simContainer);
    }
    // obstacles
    {
        const obstacles = createContainer();
        const header = document.createElement("h3");
        header.textContent = "Obstacles";
        obstacles.append(header);
        const elements = [];
        const update = () => {
            const activated = new Set();
            for (let e of elements) {
                if (e.check.checked) {
                    activated.add(e.name);
                }
            }
            state.updateObstacles(activated);
        };
        elements.push({
            label: "Big circle",
            name: O_BIG_CIRCLE,
            check: createCheckbox(true),
        });
        elements.push({
            label: "Small circle",
            name: O_SMALL_CIRCLE,
            check: createCheckbox(false),
        });
        elements.push({
            label: "Big rect",
            name: O_BIG_RECT,
            check: createCheckbox(false),
        });
        elements.push({
            label: "Corner rects",
            name: O_CORNER_RECTS,
            check: createCheckbox(false),
        });
        for (let e of elements) {
            obstacles.append(createContainer([labelElement(e.label, e.check)]));
            e.check.onchange = update;
        }
        container.append(obstacles);
    }
    // reset
    {
        const resetContainer = createContainer();
        const header = document.createElement("h3");
        header.textContent = "Reset";
        resetContainer.append(header);
        const velocityContainer = createContainer();
        const headerVel = document.createElement("h4");
        headerVel.textContent = "Velocity:";
        const xInput = document.createElement("input");
        xInput.type = "number";
        xInput.min = "-2.0";
        xInput.max = "2.0";
        xInput.step = "0.1";
        xInput.valueAsNumber = 0.75;
        const yInput = document.createElement("input");
        yInput.type = "number";
        yInput.min = "-2.0";
        yInput.max = "2.0";
        yInput.step = "0.1";
        yInput.valueAsNumber = 0.0;
        velocityContainer.append(header, labelElement("x: ", xInput), labelElement("y: ", yInput));
        resetContainer.append(velocityContainer);
        const headerShapes = document.createElement("h4");
        headerShapes.textContent = "Shapes:";
        const getVel = () => {
            let x = xInput.valueAsNumber;
            if (isNaN(x)) {
                xInput.valueAsNumber = 0.75;
                x = 0.75;
            }
            let y = yInput.valueAsNumber;
            if (isNaN(y)) {
                yInput.valueAsNumber = 0.0;
                y = 0.0;
            }
            return { x, y };
        };
        resetContainer.append(headerShapes);
        {
            const buttonCircleOutline = document.createElement("button");
            buttonCircleOutline.textContent = "Circle outline";
            buttonCircleOutline.onclick = () => {
                state.initPoints({
                    type: "circleOutline",
                    center: { x: 0, y: 0 },
                    radius: 0.1,
                    numPoints: 100000,
                    thicknessFactor: 0.1,
                    velocity: getVel(),
                });
            };
            resetContainer.append(buttonCircleOutline);
        }
        {
            const buttonCircle = document.createElement("button");
            buttonCircle.textContent = "Circle";
            buttonCircle.onclick = () => {
                state.initPoints({
                    type: "circle",
                    center: { x: 0, y: 0 },
                    radius: 0.2,
                    numPoints: 100000,
                    areaScale: 0.05,
                    velocity: getVel(),
                });
            };
            resetContainer.append(buttonCircle);
        }
        {
            const buttonBox = document.createElement("button");
            buttonBox.textContent = "Box";
            buttonBox.onclick = () => {
                state.initPoints({
                    type: "box",
                    center: { x: 0, y: 0 },
                    halfSize: { x: 0.1, y: 0.2 },
                    numPoints: 100000,
                    areaScale: 0.05,
                    velocity: getVel(),
                });
            };
            resetContainer.append(buttonBox);
        }
        container.append(resetContainer);
    }
}
class CapacityBuffer {
    constructor(buffer) {
        this.buffer = buffer;
        this.size = 0;
    }
}
function createBigCircleObstacle(state, buffers) {
    const { circles } = buffers;
    let idx = circles.size;
    circles.buffer.setCenter(idx, 0, 0.0);
    circles.buffer.setRadius(idx, 0.75);
    circles.buffer.setInside(idx, -1.0);
    circles.size++;
}
function createSmallCircleObstacle(state, buffers) {
    const { circles } = buffers;
    let idx = circles.size;
    circles.buffer.setCenter(idx, 0.75, 0.0);
    circles.buffer.setRadius(idx, 0.25);
    circles.buffer.setInside(idx, 1.0);
    circles.size++;
}
function createInnerRect(state, buffers) {
    const { rects } = buffers;
    let idx = rects.size;
    rects.buffer.setCenter(idx, 0, 0);
    rects.buffer.setHalfSize(idx, 0.5, 0.25);
    rects.buffer.setAngle(idx, 0);
    rects.buffer.setInside(idx, 1.0);
    rects.size++;
}
function createCornerRects(state, buffers) {
    const { rects } = buffers;
    let idx = rects.size;
    rects.buffer.setCenter(idx, 0.65, 0.45);
    rects.buffer.setHalfSize(idx, 0.15, 0.25);
    rects.buffer.setAngle(idx, Math.PI / 180.0 * 37.0);
    rects.buffer.setInside(idx, 1.0);
    rects.size++;
    idx++;
    rects.buffer.setCenter(idx, -0.65, 0.45);
    rects.buffer.setHalfSize(idx, 0.15, 0.25);
    rects.buffer.setAngle(idx, Math.PI / 180.0 * -37.0);
    rects.buffer.setInside(idx, 1.0);
    rects.size++;
    idx++;
    rects.buffer.setCenter(idx, -0.65, -0.45);
    rects.buffer.setHalfSize(idx, 0.15, 0.25);
    rects.buffer.setAngle(idx, Math.PI / 180.0 * 37.0);
    rects.buffer.setInside(idx, 1.0);
    rects.size++;
    idx++;
    rects.buffer.setCenter(idx, 0.65, -0.45);
    rects.buffer.setHalfSize(idx, 0.15, 0.25);
    rects.buffer.setAngle(idx, Math.PI / 180.0 * -37.0);
    rects.buffer.setInside(idx, 1.0);
    rects.size++;
}
function buildInterface(state) {
    const container = document.querySelector(".optionsContainer");
    if (container === null) {
        console.error("Could not find options container");
        return;
    }
    buildInterfaceOptions(container, state);
}
async function main() {
    const env = await init();
    if (env === null) {
        console.error("Could not initialize gpu environment");
        return;
    }
    const state = new State(env);
    const { context, device, gpu } = state.env;
    const presentationFormat = gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
        usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        alphaMode: "premultiplied",
    });
    const outputSize = {
        w: Math.max(1, Math.min(state.env.canvas.width, device.limits.maxTextureDimension2D)),
        h: Math.max(1, Math.min(state.env.canvas.height, device.limits.maxTextureDimension2D)),
    };
    state.initTextures(outputSize);
    state.composeParams.setBlendFactor(0.95);
    const module = device.createShaderModule({
        label: 'particle shader',
        code: /* wgsl */ `

    ${common_wgsl_funcs}
    ${common_wgsl_data}

    @group(0) @binding(0) var<storage, read> pos_data: array<Vertex>;

  struct UniformData {
        time : f32,
        dt: f32,
        numPoints : i32,
        pointRadius: f32,
    };

    struct Viewport {
      bmin : vec2f,
      bmax : vec2f,
    }
    @group(0) @binding(1) var<uniform> uniformData : UniformData;
    @group(0) @binding(2) var<uniform> viewport : Viewport;

      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv: vec2f,
        @location(1) velocity: vec2f,
      };
    

    @vertex fn vs(
      @builtin(vertex_index) vertexIndex : u32,
      @builtin(instance_index) instanceIndex: u32
    ) -> VertexOutput {
      let pos = array(
        vec2f( -1.0,  -1.0), 
        vec2f(1.0, -1.0),  
        vec2f( -1.0, 1.0), 
        vec2f( 1.0, 1.0)   
      );

      let uvs = array(
        vec2f( 0.0,  0.0), 
        vec2f(1.0, 0.0), 
        vec2f( 0.0, 1.0), 
        vec2f( 1.0, 1.0)  
      );

      let pWorld = pos[vertexIndex]*uniformData.pointRadius * pos_data[instanceIndex].radius  + pos_data[instanceIndex].position;

      let uv = uvs[vertexIndex];
        
      let pVP = worldToVP(viewport.bmin,viewport.bmax,pWorld);

      var vsOutput: VertexOutput;
      vsOutput.position = vec4f(pVP, 0.0, 1.0);
      vsOutput.uv = uv;
      vsOutput.velocity = pos_data[instanceIndex].velocity;
      return vsOutput;
    }

    @group(0) @binding(3) var tex: texture_2d<f32>;
    @group(0) @binding(4) var texSampler: sampler;
    const PI = 3.14159265359;
    @fragment fn fs(input: VertexOutput) -> @location(0) vec4f {

      let dist = length(input.uv - vec2f(0.5,0.5));
      const minRadius = 0.25;
      const maxRadius = 0.48;

      let alpha = (1.0 - smoothstep(minRadius, maxRadius, dist)) * 0.5;
      if (alpha == 0.0) {
        discard;
      }

      var angle = atan2(input.velocity.y, input.velocity.x);
      angle = (angle + 2.0* PI) % (2.0*PI);
      let col = textureSample(tex, texSampler, vec2f(angle/(2.0*PI),0.0)).xyz;
      return vec4f(col*alpha, alpha);
    }
    `,
    });
    const pipeline = device.createRenderPipeline({
        label: 'render particle pipeline',
        layout: device.createPipelineLayout({
            bindGroupLayouts: [state.drawShaderBindGroupLayout],
        }),
        primitive: {
            topology: "triangle-strip",
        },
        vertex: {
            entryPoint: 'vs',
            module,
        },
        fragment: {
            entryPoint: 'fs',
            module,
            targets: [{
                    // format: presentationFormat,
                    format: state.offscreenFormat,
                    blend: {
                        color: {
                            operation: 'add',
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha'
                        },
                        alpha: {
                            operation: 'add',
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha'
                        },
                    }
                }],
        },
    });
    const renderPassDescriptor = {
        label: 'scene renderpass',
        colorAttachments: [
            {
                clearValue: [0.0, 0.0, 0.0, 1],
                loadOp: 'clear',
                storeOp: 'store',
                view: context.getCurrentTexture().createView(),
            },
        ],
    };
    const commonObjBindGroup = device.createBindGroup({
        label: "shared objects bind group",
        layout: state.commonObjLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: state.geometryBuffers.circles.buffer.gpuBuffer,
                },
            },
            {
                binding: 1,
                resource: {
                    buffer: state.geometryBuffers.rects.buffer.gpuBuffer,
                },
            },
            {
                binding: 2,
                resource: {
                    buffer: state.geometrySizesBuffer.gpuBuffer,
                },
            },
        ],
    });
    const obstacleBindGroup = device.createBindGroup({
        label: "obstacle_bind_group",
        layout: state.obstaclePipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 2,
                resource: {
                    buffer: state.viewportBuffer.gpuBuffer,
                },
            },
        ],
    });
    const composeRenderPassDescriptor = {
        label: 'compose pass',
        colorAttachments: [
            {
                clearValue: [0.0, 0.0, 0.0, 1],
                loadOp: 'clear',
                storeOp: 'store',
                view: context.getCurrentTexture().createView(),
            },
        ],
    };
    const screenPassDescriptor = {
        label: 'final pass',
        colorAttachments: [
            {
                clearValue: [0.0, 0.0, 0.0, 1],
                loadOp: 'clear',
                storeOp: 'store',
                view: context.getCurrentTexture().createView(),
            },
        ],
    };
    buildInterface(state);
    async function render(state) {
        const { device } = state.env;
        const [offscreenTex, offscreenSampler] = state.getOffscreen();
        const [currentTex, currentSampler] = state.getCurrent();
        const [prevTex, prevSampler] = state.frame === 0 ? state.getOffscreen() : state.getPrevious();
        state.composeParams.upload();
        const composeBindGroup = device.createBindGroup({
            label: "compose bind group",
            layout: state.composePipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: offscreenTex.createView(),
                },
                {
                    binding: 1,
                    resource: offscreenSampler,
                },
                {
                    binding: 2,
                    resource: prevTex.createView(),
                },
                {
                    binding: 3,
                    resource: prevSampler,
                },
                {
                    binding: 4,
                    resource: {
                        buffer: state.composeParams.gpuBuffer
                    }
                }
            ],
        });
        const screenPassBindGroup = device.createBindGroup({
            label: "final bind group",
            layout: state.screenPipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: currentTex.createView(),
                },
                {
                    binding: 1,
                    resource: currentSampler,
                },
            ],
        });
        renderPassDescriptor.colorAttachments = [
            {
                // view: <- to be filled out when we render
                clearValue: [0.0, 0.0, 0.0, 0.0],
                loadOp: 'clear',
                storeOp: 'store',
                // view: context.getCurrentTexture().createView(),
                view: offscreenTex.createView(),
            },
        ];
        composeRenderPassDescriptor.colorAttachments = [
            {
                // view: <- to be filled out when we render
                clearValue: [0.0, 0.0, 0.0, 0.0],
                loadOp: 'clear',
                storeOp: 'store',
                view: currentTex.createView(),
                // view: textures[0].createView(),
            },
        ];
        screenPassDescriptor.colorAttachments = [
            {
                // view: <- to be filled out when we render
                clearValue: [0.0, 0.0, 0.0, 1],
                loadOp: 'clear',
                storeOp: 'store',
                view: context.getCurrentTexture().createView(),
                // view: textures[0].createView(),
            },
        ];
        const encoder = device.createCommandEncoder({ label: 'encoder' });
        state.updateTime();
        state.uniformStateBuffer.setTime(state.time);
        state.uniformStateBuffer.setDt(state.dt);
        state.uniformStateBuffer.upload();
        const computePass = encoder.beginComputePass({ label: "compute pass" });
        computePass.setPipeline(state.computePipeline);
        computePass.setBindGroup(0, state.computeBindGroup);
        computePass.setBindGroup(1, commonObjBindGroup);
        computePass.dispatchWorkgroups(Math.ceil(state.numPoints / 64));
        computePass.end();
        // make a render pass encoder to encode render specific commands
        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, state.drawShaderBindGroup);
        pass.draw(4, state.numPoints); // call our vertex shader 3 times
        pass.setPipeline(state.obstaclePipeline);
        pass.setBindGroup(0, obstacleBindGroup),
            pass.setBindGroup(1, commonObjBindGroup);
        pass.draw(3);
        pass.end();
        const composePass = encoder.beginRenderPass(composeRenderPassDescriptor);
        composePass.setPipeline(state.composePipeline);
        composePass.setBindGroup(0, composeBindGroup);
        composePass.draw(3);
        composePass.end();
        const screenPass = encoder.beginRenderPass(screenPassDescriptor);
        screenPass.setPipeline(state.screenPipeline);
        screenPass.setBindGroup(0, screenPassBindGroup);
        screenPass.draw(3);
        screenPass.end();
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
        state.stepTexture();
        state.nextFrame();
        window.requestAnimationFrame(() => render(state));
    }
    state.initTime();
    render(state);
}

export {
    main,
}