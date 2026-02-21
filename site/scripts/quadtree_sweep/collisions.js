import {
    vadd,
    vsub,
    vscale,
} from "./simple_vector.js";

import {
    OBSTACLE,
} from "./grid.js";


// classes here are used more as plain data and functions operate on them

//---------------------------------
// Simple AABB class
//---------------------------------
class AABB {
    // minimum extent
    min = [0, 0];
    // maximum extent
    max = [0, 0];
    // total size = max - min
    delta = [0, 0];
    // center of the AABB = (max + min) * 0.5
    center = [0, 0];
    // half size of the AABB = delta * 0.5
    half = [0, 0];

    constructor(min, max) {
        this.min = min;
        this.max = max;
        this.delta = vsub(max, min);
        this.half = vscale(this.delta, 0.5);
        this.center = vadd(min, this.half);
    }
}

// computes the intersection of AABBs A and B
// B's origin is moved by offsetB
function intersectAABB(a, b, offsetB = [0, 0]) {
    if (a.min[0] >= b.max[0] + offsetB[0] ||
        a.max[0] <= b.min[0] + offsetB[0] ||
        a.min[1] >= b.max[1] + offsetB[1] ||
        a.max[1] <= b.min[1] + offsetB[1]
    ) {
        return false;
    }

    return true;
}

// intersects a ray with an AABB
function intersectRayAABB(bmin, bmax, rayPos, rayDir) {
    let tNear = -Infinity;
    let tFar = Infinity;

    // slab method
    for (let i = 0; i < bmin.length; i++) {

        // check axis -> must not be parallel
        if (Math.abs(rayDir[i]) > 1E-7) {
            const tlow = (bmin[i] - rayPos[i]) / rayDir[i];
            const thigh = (bmax[i] - rayPos[i]) / rayDir[i];

            const tNearI = Math.min(tlow, thigh);
            const tFarI = Math.max(tlow, thigh);

            tNear = Math.max(tNear, tNearI);
            tFar = Math.min(tFar, tFarI);
        } else {
            // if direction in axis is 0, we check instead if the ray origin in that axis lies in the bounds
            if (rayPos[i] - 1E-7 <= bmin[i] || rayPos[i] + 1E-7 >= bmax[i]) {
                return null;
            }
        }
    }

    // outside
    if (tNear > tFar) {
        return null;
    }

    // calculate various in and out values
    let t = Infinity;
    if (tNear >= 0) {
        t = tNear;
    }

    if (tFar >= 0) {
        t = Math.min(t, tFar);
    }
    if (!isFinite(t)) {
        return null;
    }
    // if the second hit occured before the origin, no actual hit happened
    const hit = tFar > 0;
    return {
        // first intersection
        tNear,
        // second intersection
        tFar,
        // first non-zero intersection
        t,
        // if a hit occured
        hit,
    };

}


// sweeps an object B by the amount moveB and computes its possibly adjusted movement vector if a collision with A occurs
function sweepAABB(ba, bb, offsetB, moveB) {

    // move bounds of b to offset
    const bbOrig = vadd(bb.center, offsetB);
    // pad size of a by b
    // we use the half size, as computing min max is easy: center -+ half
    const baHalfSizePadded = vadd(ba.half, bb.half);
    // adjusted min max
    const baPadMin = vsub(ba.center, baHalfSizePadded);
    const baPadMax = vadd(ba.center, baHalfSizePadded);
    // raycast with the adjusted bounds and movement vector
    const hit = intersectRayAABB(baPadMin, baPadMax, bbOrig, moveB);

    let result = {
        t: 1,
        move: moveB,
        hit: false,
    };

    if (hit !== null) {
        if (!hit.hit) {
            return result;
        }

        // a hit exist, but we need to make sure to handle the case, that the extended bounds contain the ray origin
        // if the ray origin is inside, tNear will be less than 0 and we can't move
        // generally we will take the closest intersection but clamp it to zero
        let t = Math.max(0, hit.tNear);

        // collision occured further away than we want to go, so no problem
        if (t > 1) {
            return result;
        }

        // blocked -> fill result
        result.hit = true;
        result.t = t;
        result.move = vscale(moveB, t);
    }

    return result;
}


//---------------------------------
// Simple quadtree
// each node is a valid tree on its own, containing subtrees via its children
// contains extra information to simplify code, not for performance or memory
//---------------------------------
class QuadNode {
    // aabb of the region covered by a node
    bounds = null;
    // child nodes, null represents an empty subtree
    children = [null, null, null, null];
    // the level (how many splits have occured) for this node
    level = 0;
    // whether this is a leaf
    // could also be computed by checking if all children are null
    // this is easier to use though
    leaf = true;
}


// create quadtree from a grid
// base function to call into the recursive build
function createQuadtree(grid) {

    // initial values for the recursive call
    // size includes the full grid
    // NOTE: The maximimum is placed at (w,h), while the pixel range ends in (w-1,h-1)
    // this is because the bounding box contains the full pixel, while the indexing only considers the start
    // during iteration we must take this into account
    return createQuadNode(grid, new AABB([0, 0], [grid.w, grid.h]), 0);

}

// recursive build of a quadtree
function createQuadNode(grid, aabb, level) {

    // used to iterate over the pixels
    const [minX, minY] = aabb.min;
    const [maxX, maxY] = aabb.max;

    // used to determine if we arrived at a leaf or split too far
    const [deltaX, deltaY] = aabb.delta;

    // node has zero size -> empty -> nothing to do
    if (deltaX === 0 || deltaY === 0) {
        return null;
    }

    const { data, w } = grid;

    // go through the grid and search for obstacles
    for (let y = minY; y < maxY; y++) {
        // small optimization, we precompute this
        // we could also just call the value method of the grid
        let yOffset = y * w;
        for (let x = minX; x < maxX; x++) {

            let idx = yOffset + x;

            // if not an obstacle, we check the next pixel
            if (data[idx] !== OBSTACLE) {
                continue;
            }


            // found an obstacle
            // create node and traverse down
            const node = new QuadNode();
            node.bounds = aabb;
            node.level = level;
            node.leaf = false;

            // stop, if we are a leaf
            // a leaf is a pixel, so size is 1
            if (deltaX === 1 && deltaY == 1) {
                node.leaf = true;
                return node;
            }

            // split
            // also handles non-power-of-two sizes
            const cX = minX + Math.floor(deltaX / 2);
            const cY = minY + Math.floor(deltaY / 2);
            const c = [cX, cY];

            // the four quadrants
            node.children[0] = createQuadNode(grid, new AABB(aabb.min, c), level + 1);
            node.children[1] = createQuadNode(grid, new AABB([cX, minY], [maxX, cY]), level + 1);
            node.children[3] = createQuadNode(grid, new AABB(c, aabb.max), level + 1);
            node.children[2] = createQuadNode(grid, new AABB([minX, cY], [cX, maxY]), level + 1);

            return node;
        }
    }

    return null;
}

// computes all intersections between two quadtrees
// tree A is assumed to be located at its origin
// B is moved by an offset, which is the relative vector between both origins (B-A)
// the maxLevel parameters allow us to intersect with coarser levels
function intersectQuadtrees(aTree, bTree, offsetB, {
    maxLevelA = -1,
    maxLevelB = -1,
} = {}) {
    // contains all intersections at the end
    const intersections = [];

    // queue of node pairs
    const queue = [[aTree, bTree]];

    // we work until all pairs have been processed
    while (queue.length > 0) {
        // the current pair
        const [a, b] = queue.pop();

        // one of the nodes is empty, no intersections possible
        if (a === null || b === null) {
            continue;
        }

        // check if nodes are leaf nodes or treat them as one if they are larger than the max level (-1 is treated as infinity)
        const aLeaf = a.leaf || (maxLevelA >= 0 && a.level >= maxLevelA);
        const bLeaf = b.leaf || (maxLevelB >= 0 && b.level >= maxLevelB);

        // no intersection -> children can't intersect either
        if (!intersectAABB(a.bounds, b.bounds, offsetB)) {
            continue;
        }

        // two leaf nodes -> intersection found
        if (aLeaf && bLeaf) {
            intersections.push([a, b]);
            continue;
        }

        // go through all children
        let nodesA = a.children;
        let nodesB = b.children;

        // if a node is a leaf, use the node itself instead of its non-existing children
        if (aLeaf) {
            nodesA = [a];
        }
        if (bLeaf) {
            nodesB = [b];
        }

        // add all child pairs
        // we don't add empty pairs, but we could, as it is handled above
        for (const ca of nodesA) {
            if (ca === null) {
                continue;
            }
            for (const cb of nodesB) {
                if (cb === null) {
                    continue;
                }
                queue.push([ca, cb]);
            }
        }
    }

    return intersections;
}

// computes the sweep collision between two quadtrees
// tree A is assumed to be located at its origin
// B is moved by an offset, which is the relative vector between both origins (B-A)
// B tries to move by the vector moveB
// the maxLevel parameters allow us to intersect with coarser levels
function sweepQuadtrees(aTree, bTree, offsetB, moveB, {
    maxLevelA = -1,
    maxLevelB = -1,
} = {}) {

    // result contains movement values and the object pair of the collision
    let result = {
        sweep: {
            t: 1,
            move: moveB,
            hit: false,
        },
        objects: null,
    };

    // working queue of node pairs
    const queue = [[aTree, bTree]];

    // we work until all pairs have been processed
    while (queue.length > 0) {
        // current pair
        const [a, b] = queue.pop();

        // one of the nodes is empty, no intersections possible
        if (a === null || b === null) {
            continue;
        }

        // compute sweep between values
        const abSweep = sweepAABB(a.bounds, b.bounds, offsetB, moveB);

        // no collision found -> next pair
        if (!abSweep.hit) {
            continue;
        }

        // check if nodes are leaf nodes or treat them as one if they are larger than the max level (-1 is treated as infinity)
        const aLeaf = a.leaf || (maxLevelA >= 0 && a.level >= maxLevelA);
        const bLeaf = b.leaf || (maxLevelB >= 0 && b.level >= maxLevelB);

        // both leafs
        if (aLeaf && bLeaf) {
            // if the hit is before the one we already found -> replace
            if (abSweep.hit) {
                if (abSweep.t < result.sweep.t) {
                    result.sweep = abSweep;
                    result.objects = [a, b];
                }
            }
            continue;
        }

        // go through all children
        let nodesA = a.children;
        let nodesB = b.children;

        // if a node is a leaf, use the node itself instead of its non-existing children
        if (aLeaf) {
            nodesA = [a];
        }
        if (bLeaf) {
            nodesB = [b];
        }

        // add all child pairs
        // we don't add empty pairs, but we could, as it is handled above
        for (const ca of nodesA) {
            if (ca === null) {
                continue;
            }
            for (const cb of nodesB) {
                if (cb === null) {
                    continue;
                }

                queue.push([ca, cb]);
            }
        }

    }
    return result;

}

// draws the quadtree up to a level
function drawQuadtree(tree, ctx, offset, scale, maxLevel = -1) {
    if (tree === null) {
        return;
    }
    ctx.save();

    const queue = [tree];

    while (queue.length > 0) {
        const node = queue.pop();

        if (node.leaf || (maxLevel >= 0 && node.level >= maxLevel)) {
            // draw

            const x0 = (offset[0] + node.bounds.min[0]) * scale;
            const y0 = (offset[1] + node.bounds.min[1]) * scale;

            ctx.fillRect(x0, y0, node.bounds.delta[0] * scale, node.bounds.delta[1] * scale);
        }
        else {
            for (const c of node.children) {
                if (c !== null) {
                    queue.push(c);
                }
            }
        }

    }
    ctx.restore();
}

// colors for the tree bounds
const defaultColors = [
    "rgba(255,0,0,0.5)",
    "rgba(0, 255, 0, 0.5)",
    "rgba(0, 0, 255, 0.5)",
    "rgba(172, 172, 0, 0.5)",
    "rgba(0, 255, 255, 0.5)",
    "rgba(255, 0, 255, 0.5)",
    "rgba(64, 128, 255, 0.5)",
];

// draws the levels of a quadtree. can be adjusted by some predicate to only show certain levels
function drawQuadtreeBounds(tree, ctx, offset, scale, { colors = defaultColors, levelPredicate = () => true, lineWidth = 1 } = {}) {
    if (tree === null) {
        return;
    }
    ctx.save();

    const queue = [tree];
    ctx.lineWidth = lineWidth;

    while (queue.length > 0) {
        const node = queue.pop();

        if (node.leaf || levelPredicate(node.level)) {
            // draw

            const x0 = (offset[0] + node.bounds.min[0]) * scale;
            const y0 = (offset[1] + node.bounds.min[1]) * scale;

            ctx.strokeStyle = colors[node.level % colors.length];

            ctx.strokeRect(x0, y0, node.bounds.delta[0] * scale, node.bounds.delta[1] * scale);
        }

        for (const c of node.children) {
            if (c !== null) {
                queue.push(c);
            }
        }


    }
    ctx.restore();
}

export {
    AABB,
    intersectAABB,
    intersectRayAABB,
    sweepAABB,
    QuadNode,
    createQuadtree,
    intersectQuadtrees,
    sweepQuadtrees,
    drawQuadtree,
    drawQuadtreeBounds,
    defaultColors,
}