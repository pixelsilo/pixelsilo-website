/*
 * portrait-3d: the homepage studio portrait, camera-mapped so the field's
 * perspective shifts as the section scrolls past.
 *
 * The photo is projected from a rebuilt copy of the original camera onto three
 * surfaces: the ground (a plane running to the horizon), a fog card far off, and
 * a cut-out card of Luke where he stands. A second camera orbits, rises and
 * dolly-zooms a little with scroll. Halfway through the scroll it sits exactly
 * where the photo was taken, so the frame matches the still.
 *
 * Markup: data-module="portrait-3d" on the media wrapper that holds the <img>.
 * The <img> stays as the fallback (no WebGL 2, reduced motion, Designer) and
 * sets the crop: the canvas copies its object-fit: cover and object-position.
 *
 * Optional attributes (defaults in brackets):
 *   data-orbit  degrees the camera circles either side [3]
 *   data-pivot  metres from the camera to the point it circles [7]
 *   data-rise   metres the camera climbs either side [0.25]
 *   data-dolly  metres of dolly zoom either side [0.8]
 *   data-plate / data-person  image URLs [dist/portrait-3d/*.webp on jsDelivr]
 *
 * The layers are made by dev/portrait-3d/prep.py; the scene was tuned in
 * dev/portrait-3d/index.html.
 */

const BASE = (document.currentScript?.src || '').replace(/[^/]*$/, '') + 'portrait-3d/';

// Measured on the 1600px portrait
const IMG = 1600, HORIZON_Y = 483, FEET_Y = 1490;
const PERSON = { x0: 566, x1: 1112, y0: 78, y1: 1440 };
const LENS = 22;      // vertical degrees; with the horizon and feet it fixes the scene
const CAM_H = 1.35;   // the camera sat at his chest: the horizon crosses him there
const FAR = 250;      // the fog card
const OVERSCAN = 0.06; // extra zoom at the ends of the scroll, none at the middle

// --- small vector helpers -------------------------------------------------
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => mul(a, 1 / len(a));
// rotate v about unit axis k by angle t (Rodrigues)
const rot = (v, k, t) => {
  const c = Math.cos(t), s = Math.sin(t);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
};
// the rotation taking unit a onto unit b, applied to v
const turn = (v, a, b) => {
  const axis = cross(a, b), s = len(axis);
  if (s < 1e-9) return v;
  return rot(v, mul(axis, 1 / s), Math.atan2(s, dot(a, b)));
};

const VERT = `#version 300 es
in vec3 aPos;
uniform vec3 uCam, uR, uU, uF;   // render camera
uniform float uFn;               // its focal length, in widths of the square frame
uniform vec4 uCrop;              // visible part of the square frame: x0, y0, x1, y1
out vec3 vW;
void main() {
  vec3 d = aPos - uCam;
  float z = dot(d, uF);
  vec2 s = 0.5 + uFn * vec2(dot(d, uR), dot(d, uU)) / z;
  vec2 ndc = (s - uCrop.xy) / (uCrop.zw - uCrop.xy) * 2.0 - 1.0;
  vW = aPos;
  gl_Position = vec4(ndc * z, 0.0, z);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec3 vW;
uniform sampler2D uMap;
uniform vec3 uP, uPR, uPU, uPF;  // the projector: the camera the photo was taken with
uniform float uPFn;
uniform bool uCut;
out vec4 o;
void main() {
  vec3 d = vW - uP;
  vec2 uv = 0.5 + uPFn * vec2(dot(d, uPR), dot(d, uPU)) / dot(d, uPF);
  vec4 c = texture(uMap, uv);
  if (uCut) { if (c.a < 0.004) discard; } else c.a = 1.0;
  o = c;
}`;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// "50% 10%" -> [0.5, 0.1]; keywords and lengths fall back to centre
function objectPosition(img) {
  const parts = getComputedStyle(img).objectPosition.split(' ');
  const pct = (v, fb) => (v && v.endsWith('%') ? parseFloat(v) / 100 : { left: 0, top: 0, right: 1, bottom: 1 }[v] ?? fb);
  return [pct(parts[0], 0.5), pct(parts[1], 0.5)];
}

export default function (root) {
  const still = root.querySelector('img');
  if (!still) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return;

  const num = (name, fb) => {
    const v = parseFloat(root.getAttribute(`data-${name}`));
    return Number.isFinite(v) ? v : fb;
  };
  const ORBIT = (num('orbit', 3) * Math.PI) / 180, PIVOT = num('pivot', 7), RISE = num('rise', 0.25), DOLLY = num('dolly', 0.8);

  // --- the original camera, rebuilt from the photo ---
  const fn = 0.5 / Math.tan((LENS * Math.PI) / 360);          // focal length in frame widths
  const pitch = Math.atan((0.5 - HORIZON_Y / IMG) / fn);
  const P = [0, CAM_H, 0];
  const PR = [1, 0, 0], PF = [0, -Math.sin(pitch), -Math.cos(pitch)], PU = [0, Math.cos(pitch), -Math.sin(pitch)];
  const feetAngle = pitch + Math.atan((FEET_Y / IMG - 0.5) / fn);
  const D = CAM_H / Math.tan(feetAngle);                         // how far away he stands
  const hit = (px, py) => {
    const dir = add(add(PF, mul(PR, (px / IMG - 0.5) / fn)), mul(PU, (0.5 - py / IMG) / fn));
    return add(P, mul(dir, -D / dir[2]));
  };
  const a = hit(PERSON.x0, PERSON.y0), b = hit(PERSON.x1, PERSON.y1);
  const T = [(a[0] + b[0]) / 2, 1.2, -D];                        // his chest: the camera keeps it in view

  // --- geometry: ground, fog card, Luke's card (two triangles each) ---
  const quad = (p0, p1, p2, p3) => [...p0, ...p1, ...p2, ...p0, ...p2, ...p3];
  const verts = new Float32Array([
    ...quad([-FAR, 0, -2.5], [FAR, 0, -2.5], [FAR, 0, -FAR], [-FAR, 0, -FAR]),
    ...quad([-2 * FAR, 0, -FAR], [2 * FAR, 0, -FAR], [2 * FAR, 2 * FAR, -FAR], [-2 * FAR, 2 * FAR, -FAR]),
    ...quad([a[0], b[1], -D], [b[0], b[1], -D], [b[0], a[1], -D], [a[0], a[1], -D]),
  ]);

  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const u = (n) => gl.getUniformLocation(prog, n);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);

  gl.uniform3fv(u('uP'), P); gl.uniform3fv(u('uPR'), PR); gl.uniform3fv(u('uPU'), PU); gl.uniform3fv(u('uPF'), PF);
  gl.uniform1f(u('uPFn'), fn);
  gl.uniform1i(u('uMap'), 0);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const texture = (img, wrap) => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    return t;
  };

  let plateTex, personTex, last = -1, raf = 0, visible = false;
  // Geometry is measured once and on resize, never while scrolling: reading layout or computed
  // style every frame forces the browser to recalculate mid-frame while Lenis and the reveals run.
  let docTop = 0, boxH = 1, viewH = window.innerHeight, crop = [0, 0, 1, 1];
  const U_ = {};
  for (const n of ['uCam', 'uR', 'uU', 'uF', 'uFn', 'uCrop', 'uCut']) U_[n] = u(n);

  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', opacity: '0', transition: 'opacity 0.6s ease', pointerEvents: 'none' });
  canvas.setAttribute('aria-hidden', 'true');
  if (getComputedStyle(root).position === 'static') root.style.position = 'relative';

  function measure() {
    const r = root.getBoundingClientRect();
    docTop = r.top + window.scrollY;
    boxH = r.height || 1;
    viewH = window.innerHeight;
    // Up to 1.5x pixel density and about 2 million pixels: the photo is soft and grainy, so more
    // only costs GPU time on every scroll frame.
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cap = Math.sqrt(2.0e6 / Math.max(1, r.width * r.height));
    dpr = Math.min(dpr, cap);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    // the still's crop: object-fit cover at its object-position
    const [ox, oy] = objectPosition(still);
    let x0 = 0, x1 = 1, y0 = 0, y1 = 1;
    if (w / h > 1) { const vh = h / w; const top = (1 - vh) * oy; y1 = 1 - top; y0 = y1 - vh; }
    else { const vw = w / h; x0 = (1 - vw) * ox; x1 = x0 + vw; }
    crop = [x0, y0, x1, y1];
    last = -1;
  }

  function draw(p) {
    const s = p * 2 - 1; // -1 entering, 0 centred (the still), 1 leaving

    // 1) circle a point on the line of sight
    const pivot = add(P, mul(PF, PIVOT));
    const yaw = -ORBIT * s, Y = [0, 1, 0];
    let C = add(rot(sub(P, pivot), Y, yaw), pivot);
    let R = rot(PR, Y, yaw), U = rot(PU, Y, yaw), F = rot(PF, Y, yaw);
    const aim = norm(sub(T, C));
    // 2) climb, 3) push in towards him with the lens widening so he keeps his size
    C = add(C, [0, RISE * s, 0]);
    const dist = len(sub(T, C)), push = DOLLY * s;
    C = add(C, mul(norm(sub(T, C)), push));
    // 4) turn so his chest stays where the circling left it
    const aim2 = norm(sub(T, C));
    R = turn(R, aim, aim2); U = turn(U, aim, aim2); F = turn(F, aim, aim2);
    const camFn = fn * ((dist - push) / dist) * (1 + OVERSCAN * Math.abs(s));

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform3fv(U_.uCam, C); gl.uniform3fv(U_.uR, R); gl.uniform3fv(U_.uU, U); gl.uniform3fv(U_.uF, F);
    gl.uniform1f(U_.uFn, camFn);
    gl.uniform4f(U_.uCrop, crop[0], crop[1], crop[2], crop[3]);

    gl.disable(gl.BLEND);
    gl.uniform1i(U_.uCut, 0);
    gl.bindTexture(gl.TEXTURE_2D, plateTex);
    gl.drawArrays(gl.TRIANGLES, 0, 12);
    gl.enable(gl.BLEND);
    gl.uniform1i(U_.uCut, 1);
    gl.bindTexture(gl.TEXTURE_2D, personTex);
    gl.drawArrays(gl.TRIANGLES, 12, 6);
  }

  // from cached geometry and the scroll position alone: no layout read
  function progress() {
    const top = docTop - window.scrollY;
    return Math.min(1, Math.max(0, (viewH - top) / (viewH + boxH)));
  }

  // Draw only when something asks: a scroll, a resize, or coming on screen. Lenis's scroll event
  // fires inside its frame, right after it moves the page, so drawing there keeps the canvas in
  // step with the page; anything else waits for the next frame, once.
  function frame() {
    raf = 0;
    if (!plateTex || !visible) return;
    const p = Math.round(progress() * 2000) / 2000;
    if (p === last) return;
    last = p;
    draw(p);
  }
  const request = () => { if (!raf) raf = requestAnimationFrame(frame); };

  let started = false;
  async function start() {
    if (started) return;
    started = true;
    try {
      const [plate, person] = await Promise.all([
        loadImage(root.getAttribute('data-plate') || BASE + 'plate.webp'),
        loadImage(root.getAttribute('data-person') || BASE + 'person.webp'),
      ]);
      plateTex = texture(plate, gl.MIRRORED_REPEAT);
      personTex = texture(person, gl.CLAMP_TO_EDGE);
    } catch (err) {
      console.warn('[site] portrait-3d: layers failed to load, keeping the still', err);
      return;
    }
    still.after(canvas);
    measure();
    draw((last = progress()));
    requestAnimationFrame(() => { canvas.style.opacity = '1'; });

    // remeasure when the portrait or anything above it changes size (the work list opening, fonts)
    const ro = new ResizeObserver(() => { measure(); request(); });
    ro.observe(root);
    ro.observe(document.body);
    window.addEventListener('resize', () => { measure(); request(); });
    if (window.lenis?.on) window.lenis.on('scroll', frame);
    else window.addEventListener('scroll', request, { passive: true });
  }

  // load a screen ahead; only draw while it's on screen
  new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); }, { rootMargin: '100% 0px' }).observe(root);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && plateTex) { measure(); request(); }
  }).observe(root);
}
