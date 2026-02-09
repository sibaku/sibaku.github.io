import * as jm from "../bundles/jsmatrix.bundle.min.js"

import { VecF32 as v32, MatF32 as m32 } from "../bundles/jsmatrix.bundle.min.js"

// simple geometry to display the bones
const geom = m32.from([0, 0, 1, 0.1, -0.2, 1, 1, 0, 1, 0.1, 0.2, 1], 3, 4);

// From https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY, // been adjusted to be relative to element
  };
}

// 2d translation matrix
function trans2D(t) {
  const T = jm.setId(jm.similar(t, 3, 3));
  const subcol = jm.subvec(jm.col(T, 2), 0, 2);
  jm.insert(subcol, t);
  return T;
}

// 2d rotation matrix. 3x3 to work with translation
function rot2D(a) {
  const R = jm.MatF32.id(3, 3);
  const ca = Math.cos(a);
  const sa = Math.sin(a);

  R.set(ca, 0, 0);
  R.set(ca, 1, 1);

  R.set(sa, 1, 0);
  R.set(-sa, 0, 1);

  return R;
}

// 2d scale matrix. 3x3 to work with translation
function scale2D(s) {
  const S = jm.similar(s, 3, 3);

  const subdiag = jm.subvec(jm.diag(S), 0, 2);
  jm.insert(subdiag, s);
  S.set(1, 2, 2);
  return S;
}

// coordinate transform to the effector of the given bone
function boneTransform(len, angle) {
  return jm.mult(rot2D(angle), trans2D(v32.from([len, 0])));
}

function drawGeom(ctx, points, { close = true, fill = true, stroke = true }) {
  let n = points.cols();
  if (n < 2) {
    return;
  }
  ctx.beginPath();

  let p = jm.col(points, 0);
  ctx.moveTo(p.at(0), p.at(1));

  for (let i = 1; i < n; i++) {
    p = jm.col(points, i);
    ctx.lineTo(p.at(0), p.at(1));
  }
  if (close) {
    ctx.closePath();
  }
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

function drawBones(ctx, points) {
  let n = points.cols();
  if (n < 2) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.fillStyle = "rgb(128,128,128)";

  for (let i = 0; i < n - 1; i++) {
    const pi = jm.col(points, i);
    const pip = jm.col(points, i + 1);
    const l = jm.norm(jm.sub(pi, pip));
    const rn = jm.normalize(jm.fromTo(pi, pip));
    const cosa = rn.at(0);
    let a = Math.acos(Math.max(-1, Math.min(1, cosa)));
    a *= Math.sign(rn.at(1));
    let M = trans2D(pi);
    M = jm.mult(M, rot2D(a));
    M = jm.mult(M, scale2D(v32.from([l, l])));
    drawGeom(ctx, jm.mult(M, geom), {});
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgb(255,0,0)";
  drawGeom(ctx, points, {
    close: false,
    fill: false,
  });

  ctx.restore();
}

// creates points from lengths and angles
function createPoints(base, lengths, angles) {
  const n = lengths.rows();

  const points = m32.uninitialized(2, n + 1);

  const zh = v32.from([0, 0, 1]);

  let M = trans2D(base);

  let p = jm.mult(M, zh);

  jm.insert(jm.col(points, 0), jm.subvec(p, 0, 2));
  for (let i = 0; i < n; i++) {
    M = jm.mult(M, boneTransform(lengths.at(i), angles.at(i)));
    p = jm.mult(M, zh);
    jm.insert(jm.col(points, i + 1), jm.subvec(p, 0, 2));
  }
  return points;
}

// direct implementation of the FABRIK algorithm:
// FABRIK: A fast, iterative solver for the Inverse Kinematics problem
// Andreas Aristidou, Joan Lasenby
function fabrik(base, lengths, angles, target, maxIt = 20, minErr = 1) {
  // compute positions
  const points = createPoints(base, lengths, angles);

  const n = points.cols();

  const p = (i) => jm.col(points, i);

  // The distance between root and target
  const dist = jm.norm2(jm.sub(p(0), target));

  const mix = (a, b, lambda) =>
    jm.add(jm.scale(a, 1 - lambda), jm.scale(b, lambda));

  // Check whether the target is within reach
  if (dist > jm.sum(lengths)) {
    // The target is unreachable
    for (let i = 0; i < n - 1; i++) {
      // Find the distance ri between the target t and
      // the joint position pi
      const pi = p(i);
      const ri = jm.norm2(jm.sub(target, pi));
      const di = lengths.at(i);
      const lambdai = di / ri;

      // Find the new joint positions pi.
      const pip = mix(pi, target, lambdai);
      jm.insert(p(i + 1), pip);
    }
  } else {
    // The target is reachable; thus, set as b the
    // initial position of the joint p1
    let b = jm.copy(p(0));
    // Check whether the distance between the end
    // effector pn and the target t is greater than a tolerance.
    let difa = jm.norm2(jm.sub(p(n - 1), target));

    let it = 0;
    while (difa > minErr && it < maxIt) {
      // STAGE 1: FORWARD REACHING
      // Set the end effector pn as target t
      jm.insert(p(n - 1), target);

      for (let i = n - 2; i >= 0; i--) {
        // Find the distance ri between the new joint
        // position pi+1 and the joint pi
        const ri = jm.norm2(jm.sub(p(i + 1), p(i)));
        const di = lengths.at(i);
        const lambdai = di / ri;
        // Find the new joint positions pi.
        jm.insert(p(i), mix(p(i + 1), p(i), lambdai));
      }
      // STAGE 2: BACKWARD REACHING
      // Set the root p1 its initial position
      jm.insert(p(0), b);

      for (let i = 0; i < n - 1; i++) {
        // Find the distance ri between the new joint
        // position pi and the joint pi+1
        const ri = jm.norm2(jm.sub(p(i + 1), p(i)));
        const di = lengths.at(i);
        const lambdai = di / ri;
        // Find the new joint positions pi
        jm.insert(p(i + 1), mix(p(i), p(i + 1), lambdai));
      }

      difa = jm.norm2(jm.sub(p(n - 1), target));
      it++;
    }
  }

  return points;
}

// Compute the position of the endeffector
function endeffector(base, lengths, angles) {
  let M = trans2D(base);

  const n = lengths.rows();
  for (let i = 0; i < n; i++) {
    M = jm.mult(M, boneTransform(lengths.at(i), angles.at(i)));
  }

  return jm.mult(M, v32.from([0, 0, 1]));
}

// error function for optimization
function errorFunction(base, lengths, angles, target) {
  const e = jm.subvec(endeffector(base, lengths, angles), 0, 2);

  return jm.norm2Squared(jm.sub(e, target));
}

function optimize(base, lengths, angles, target, maxIt = 20, minErr = 1) {
  const n = lengths.rows();

  // computes the gradient
  // use simple forward gradient, takes less computations
  const compGrad = () => {
    const eps = 1e-3;

    // gradient is for the free parameters, the angles
    const grad = v32.uninitialized(n);
    const e1 = errorFunction(base, lengths, angles, target);

    for (let i = 0; i < n; i++) {
      const cur = angles.at(i);
      angles.set(cur + eps, i);
      const e2 = errorFunction(base, lengths, angles, target);
      angles.set(cur, i);
      grad.set(e2 - e1, i);
    }

    jm.scale(grad, 1 / eps, grad);
    return grad;
  };

  // two sided version
  // const compGrad = () => {
  //     const eps = 1E-3;

  //     // gradient is for the free parameters, the angles
  //     const grad = v32.uninitialized(n);
  //     for (let i = 0; i < n; i++) {
  //         const cur = angles.at(i);
  //         angles.set(cur + eps, i);
  //         const e1 = errorFunction(base, lengths, angles, target);
  //         angles.set(cur - eps, i);
  //         const e2 = errorFunction(base, lengths, angles, target);
  //         angles.set(cur, i);
  //         grad.set(e1 - e2, i);
  //     }

  //     jm.scale(grad, 1 / (2 * eps), grad);
  //     return grad;

  // };

  // gradient
  let grad = compGrad();
  // search direction
  let p = jm.neg(grad);

  // compute error
  let err = errorFunction(base, lengths, angles, target);

  let it = 0;

  while (err > minErr && it < maxIt) {
    // alpha is the scaling parameter for the gradient
    let alpha = 0.01;

    const c = 0.9;
    const rho = 0.5;

    // Armijo conditions
    while (
      errorFunction(base, lengths, jm.add(angles, jm.scale(p, alpha)), target) >
      err + c * alpha * jm.dot(grad, p)
    ) {
      alpha = rho * alpha;
    }

    grad = compGrad();
    p = jm.neg(grad);
    jm.add(angles, jm.scale(p, alpha), angles);

    err = errorFunction(base, lengths, angles, target);

    it++;
  }
}

function run(containerId, appContext) {
  const canvas = document.getElementById("canvas");
  const modeH = document.getElementById("current_mode");
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");

  const n = 2 + Math.floor(Math.random() * 6);

  const scale = 70;

  const lengths = v32.uninitialized(n);
  const angles = v32.uninitialized(n);

  const w = canvas.width;
  const h = canvas.height;

  for (let i = 0; i < n; i++) {
    lengths.set(Math.random() * scale, i);
    angles.set(0, i);
  }

  const base = v32.from([w / 2, h / 2]);

  let mouse = v32.zeros(2);
  canvas.addEventListener("mousemove", (evt) => {
    const p = getMousePos(canvas, evt);
    mouse = v32.from([p.x, p.y]);
  });

  let mode = 0;
  let requestedFrame = null;

  modeH.textContent = `Current mode: ${mode === 0 ? "FABRIK" : "Gradient descent"}`;
  document.addEventListener("keyup", (evt) => {
    if (evt.key === "m") {
      mode = (mode + 1) % 2;
      modeH.textContent = `Current mode: ${mode === 0 ? "FABRIK" : "Gradient descent"}`;
    } else if (evt.key === "r") {
      if (requestedFrame !== null) {
        window.cancelAnimationFrame(requestedFrame);
        requestedFrame = null;
        mouse = v32.zeros(2);

        run();
      }
    }
  });
  const update = () => {
    const rel = jm.fromTo(base, mouse);

    let target = mouse;

    ctx.clearRect(0, 0, w, h);

    if (mode === 0) {
      const points = fabrik(base, lengths, angles, target);
      drawBones(ctx, points);
    } else {
      const total_length = jm.sum(lengths);

      if (jm.norm2Squared(rel) > total_length * total_length) {
        target = jm.add(base, jm.scale(jm.normalize(rel), total_length));
      }

      optimize(base, lengths, angles, target);
      const points = createPoints(base, lengths, angles);
      drawBones(ctx, points);
    }

    requestedFrame = requestAnimationFrame(update);
  };

  update();
};


export {
  run
};