class PolarHistogram {

    constructor({
        innerBucketRadius = 0,
        resolutionAngle = 10,
        resolutionRadius = 10,
        maxRadius = 1,
        clampToBorder = true,
    } = {}) {
        this.innerBucketRadius = innerBucketRadius;
        this.resolutionAngle = resolutionAngle;
        this.resolutionRadius = resolutionRadius;
        this.maxRadius = maxRadius;

        this.outerRadius = this.maxRadius - this.innerBucketRadius;

        this.buckets = new Int32Array(this.resolutionAngle * this.resolutionRadius);
        this.innerBucket = 0;
        this.clampToBorder = clampToBorder;
        this.total = 0;

        this.ringAreas = new Float32Array(this.resolutionRadius);
        const da = 2 * Math.PI / this.resolutionAngle;
        for (let ri = 0; ri < this.resolutionRadius; ri++) {
            let r0 = ri / this.resolutionRadius * (this.maxRadius - this.innerBucketRadius) + this.innerBucketRadius;
            let r1 = (ri + 1) / this.resolutionRadius * (this.maxRadius - this.innerBucketRadius) + this.innerBucketRadius;


            const circleAreaOuter = da / (2 * Math.PI) * Math.PI * r1 * r1;
            const circleAreaInner = da / (2 * Math.PI) * Math.PI * r0 * r0;

            const area = circleAreaOuter - circleAreaInner;
            this.ringAreas[ri] = area;
        }

        this.centerArea = Math.PI * this.innerBucketRadius * this.innerBucketRadius;
    }

    insertSample(alpha, radius) {
        if (radius < this.innerBucketRadius) {
            this.innerBucket += 1;
            return;
        }

        const { ga, gr } = this.polarToGrid(alpha, radius);
        const idx = this.linearIndex(ga, gr);

        this.buckets[idx] += 1;
        this.total += 1;

    }

    polarToGrid(alpha, radius) {
        if (radius > this.maxRadius && !this.clampToBorder) {
            throw `Trying to insert alpha, radius = ${alpha}, ${radius} without clamping enabled into map with maximum radius: ${this.maxRadius}`;
        }

        radius = Math.min(radius, this.maxRadius);
        // relative
        let ra = alpha / (2 * Math.PI);
        // normalize angle
        ra -= Math.floor(ra);

        // ra should in [0,1), disregarding some floating point issues
        ra = Math.max(0, ra);


        const ga = Math.min(Math.floor(ra * this.resolutionAngle), this.resolutionAngle - 1);

        // relative radius with regards to [inner,maxRadius)
        let rr = (radius - this.innerBucketRadius) / (this.maxRadius - this.innerBucketRadius);

        const gr = Math.min(Math.floor(rr * this.resolutionRadius), this.resolutionRadius - 1);


        return { ga, gr };

    }

    linearIndex(ga, gr) {
        return ga + gr * this.resolutionAngle;
    }

    draw(context, {
        gridLinesRadius = false,
        gridLinesAngle = false,
        gridLineColor = 0,
        gridlineSize = 1,   
        colorMap = [0, 1],
        pixelSize = 100,
        pixelCenter = null,
        flipY = true,
        normalizeDensity = true,
    } = {}) {


        const {
            width: w,
            height: h,
        } = context.canvas;

        if (pixelCenter === null) {
            pixelCenter = {
                x: Math.floor(w / 2),
                y: Math.floor(h / 2)
            };
        }
        let maxVal = 0;
        let avgValue = 0;

        if (normalizeDensity) {
            if (this.centerArea > 0) {

                maxVal = this.innerBucket / this.centerArea;
                avgValue += this.innerBucket / this.centerArea;
            }
            for (let ri = 0; ri < this.resolutionRadius; ri++) {

                const area = this.ringAreas[ri];
                for (let ai = 0; ai < this.resolutionAngle; ai++) {
                    const linIdx = this.linearIndex(ai, ri);
                    maxVal = Math.max(maxVal, this.buckets[linIdx] / area);
                    avgValue += this.buckets[linIdx] / area;
                }
            }
        } else {

            if (this.centerArea > 0) {

                maxVal = this.innerBucket / this.resolutionAngle;
            }

            for (let i = 0; i < this.buckets.length; i++) {
                maxVal = Math.max(maxVal, this.buckets[i]);
                avgValue += this.buckets[linIdx];

            }
        }

        const invMax = maxVal === 0 ? 1 : 1 / maxVal;

        avgValue /= this.innerBucketRadius > 0 ? this.buckets.length + 1 : this.buckets.length;


        // inner
        context.save();

        // background because canvas usually does produce gaps..
        {
            context.beginPath();

            const color = this.getColor(colorMap, avgValue * invMax);
            const fillStyle = this.colorToFillStyle(color);
            context.fillStyle = fillStyle;
            context.arc(pixelCenter.x, pixelCenter.y, pixelSize, 0, 2 * Math.PI);


            context.fill();
        }
        // color
        if (this.innerBucketRadius > 0) {
            // inner covers angular resolution cells
            let val = this.innerBucket;

            if (normalizeDensity) {
                val /= this.centerArea;
            } else {
                val /= this.resolutionAngle;
            }


            const innerColor = this.getColor(colorMap, val * invMax);
            const fillStyle = this.colorToFillStyle(innerColor);
            context.fillStyle = fillStyle;
            context.beginPath();

            context.arc(pixelCenter.x, pixelCenter.y, this.innerBucketRadius / this.maxRadius * pixelSize, 0, 2 * Math.PI);


            context.fill();
        }

        for (let ri = 0; ri < this.resolutionRadius; ri++) {
            const area = this.ringAreas[ri];
            for (let ai = 0; ai < this.resolutionAngle; ai++) {

                let a0 = ai / this.resolutionAngle * Math.PI * 2;
                let a1 = (ai + 1) / this.resolutionAngle * Math.PI * 2;

                let r0 = ri / this.resolutionRadius * (this.maxRadius - this.innerBucketRadius) + this.innerBucketRadius;
                let r1 = (ri + 1) / this.resolutionRadius * (this.maxRadius - this.innerBucketRadius) + this.innerBucketRadius;

                r0 *= pixelSize;
                r1 *= pixelSize;

                const linIdx = this.linearIndex(ai, ri);
                let val = this.buckets[linIdx];


                if (normalizeDensity) {
                    val /= area;
                }
                const color = this.getColor(colorMap, val * invMax);
                const fillStyle = this.colorToFillStyle(color);
                context.fillStyle = fillStyle;
                context.beginPath();
                context.arc(pixelCenter.x, pixelCenter.y, r1, a0, a1, false);
                context.arc(pixelCenter.x, pixelCenter.y, r0, a1, a0, true);

                context.fill();
            }
        }

        if (gridLinesRadius || gridLinesAngle) {
            let strokeStyle;
            if (typeof (gridLineColor) === "number") {
                const strokeColor = {
                    r: gridLineColor,
                    g: gridLineColor,
                    b: gridLineColor,
                    a: 1,

                };
                strokeStyle = this.colorToFillStyle(strokeColor);
            } else if (typeof (gridLineColor) === "string") {
                strokeStyle = gridLineColor;
            } else {
                strokeStyle = this.colorToFillStyle(gridLineColor);

            }
            context.strokeStyle = strokeStyle;
            context.lineWidth = gridlineSize;

            if (gridLinesRadius) {
                // rings
                for (let ri = 0; ri <= this.resolutionRadius; ri++) {

                    let r = ri / this.resolutionRadius * (this.maxRadius - this.innerBucketRadius) + this.innerBucketRadius;


                    context.beginPath();
                    context.arc(pixelCenter.x, pixelCenter.y, r * pixelSize, 0, 2 * Math.PI);
                    context.stroke();

                }
            }

            if (gridLinesAngle) {

                // draw lines
                context.translate(pixelCenter.x, pixelCenter.y);
                for (let ai = 0; ai < this.resolutionAngle; ai++) {
                    context.save();
                    context.beginPath();
                    let a0 = ai / this.resolutionAngle * Math.PI * 2;
                    context.rotate(a0)
                    context.moveTo(0, 0);
                    context.lineTo(pixelSize, 0);
                    context.stroke();
                    context.restore();
                }
            }

        }


        context.restore();
    }

    colorToFillStyle(color) {
        return `rgba(${Math.floor(255 * color.r)}, ${Math.floor(255 * color.g)}, ${Math.floor(255 * color.b)},${color.a})`;
    }

    getColor(colormap, value) {

        const vr = Math.min(value * colormap.length, colormap.length - 1);
        const vl = Math.floor(vr);
        const vu = vl + 1;

        const t = (vr - vl) / (vu - vl);

        const c0 = colormap[vl];
        const c1 = colormap[Math.min(colormap.length - 1, vu)];

        if (typeof (c0) === "number") {
            const inter = this.interpolate(c0, c1, t);
            return { r: inter, g: inter, b: inter, a: 1 };
        } else {
            return this.interpolateColor(c0, c1, t);
        }
    }

    interpolate(v0, v1, t) {
        return v0 * (1 - t) + v1 * t;
    }
    interpolateColor(c0, c1, t) {
        return {
            r: this.interpolate(c0.r, c1.r, t),
            g: this.interpolate(c0.g, c1.g, t),
            b: this.interpolate(c0.b, c1.b, t),
            a: this.interpolate(c0.a, c1.a, t),
        };
    }
}

export { PolarHistogram };