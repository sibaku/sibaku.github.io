import { Attribute, Mesh } from "./gl.js";
import * as jsm from "../lib/jsmatrix.js";

class HemisphereHistogram {

    constructor({
        innerMinTheta = 0,
        resolutionTheta = 10,
        resolutionPhi = 10,
        clampToBorder = true,
    } = {}) {

        this.innerMinTheta = innerMinTheta;
        this.resolutionTheta = resolutionTheta;
        this.resolutionPhi = resolutionPhi;
        this.clampToBorder = clampToBorder;


        this.numCells = resolutionTheta * resolutionPhi;
        this.data = new Int32Array(this.numCells);
        this.innerData = 0;

        this.total = 0;


        this.areas = new Float32Array(this.numCells);
        this.innerArea = 2 * Math.PI * (1 - Math.cos(innerMinTheta));
        const deltaPhi = 2 * Math.PI - 0;
        let idx = 0;
        for (let y = 0; y < resolutionTheta; y++) {

            const v = y / resolutionTheta;
            const theta0 = this.innerMinTheta + v * (Math.PI * 0.5 - this.innerMinTheta);
            const theta1 = this.innerMinTheta + (y + 1) / resolutionTheta * (Math.PI * 0.5 - this.innerMinTheta);

            const area = (Math.cos(theta0) - Math.cos(theta1)) * deltaPhi / resolutionPhi;

            for (let x = 0; x < resolutionPhi; x++) {
                this.areas[idx] = area;
                idx++;
            }
        }
    }

    add(theta, phi) {

        this.total += 1;

        if (theta < this.innerMinTheta) {
            this.innerData += 1;
            return;
        }
        let v = (theta - this.innerMinTheta) / (Math.PI * 0.5 - this.innerMinTheta);
        let u = phi / (Math.PI * 2);

        if (u < 0) {
            u = u - Math.floor(u);
        }
        if (u > 1) {
            u = u % 1;
        }

        if (!this.clampToBorder) {
            if (v < 0 || v >= 1) {
                throw `Trying to insert theta, phi = ${theta}, ${phi} without clamping enabled into hemisphere}`;

            }
        }
        v = Math.max(0, Math.min(1, v));

        const idx = this.linearIndex(u, v);
        this.data[idx] += 1;
    }


    linearIndex(u, v) {
        const thetaIdx = Math.max(0, Math.min(this.resolutionTheta - 1, Math.floor(v * this.resolutionTheta)));
        const phiIdx = Math.max(0, Math.min(this.resolutionPhi - 1, Math.floor(u * this.resolutionPhi)));
        return phiIdx + thetaIdx * this.resolutionPhi;
    }

    fillArray(texData) {
        const num = this.data.length;
        if (texData === null || texData.length !== num) {
            texData = new Uint8Array(num);
        }

        let max = 0;

        if (this.innerMinTheta > 1E-7) {
            max = this.innerData / this.innerArea;
        }
        for (let i = 0; i < this.data.length; i++) {
            max = Math.max(this.data[i] / this.areas[i], max);
        }

        const invMax = max === 0 ? 1 : 1 / max;
        for (let i = 0; i < this.data.length; i++) {
            let v = this.data[i] / this.areas[i] * invMax;
            v = Math.min(255, Math.max(0, Math.floor(v * 255)));
            texData[i] = v;
        }
        return {
            texData,
            innerData: this.innerData / this.innerArea * invMax
        };
    }
}



export { HemisphereHistogram };