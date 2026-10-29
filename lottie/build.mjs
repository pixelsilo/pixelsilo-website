// Builds the Adapt feature visuals (lottie/visuals.json, taken from the Figma frames) into
// self-contained Lottie files in public/lottie, which Vite copies to dist/lottie. Text is
// converted to Geist Mono outlines, so the files need no fonts. Each plays once (~0.9s) and
// holds its last frame.
//
//   npm run lottie            -> public/lottie/adapt-0N.json, plus adapt-0N.svg (the last frame)
//   npm run lottie -- --preview <file.html>   also writes a standalone preview page

import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/lottie'); // Vite copies public/ into dist on build
const FR = 60;
const W = 384;
const H = 128;

// Type: Geist Mono 10px, 4% tracking, 12px line height (as in Figma)
const FONT_SIZE = 10;
const TRACKING = 0.4;
const LINE_HEIGHT = 12;
const fontDir = path.join(ROOT, 'node_modules/@fontsource/geist-mono/files');
const fonts = ['latin', 'symbols2'].map((s) => {
  const buf = fs.readFileSync(path.join(fontDir, `geist-mono-${s}-400-normal.woff`));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
});
const { ascender, descender } = fonts[0].tables.hhea;
const upm = fonts[0].unitsPerEm;
const BASELINE = (LINE_HEIGHT - ((ascender - descender) / upm) * FONT_SIZE) / 2 + (ascender / upm) * FONT_SIZE;

// Easing (Lottie stores the outgoing handle on the first key, the incoming on the next)
const EASE = {
  out: { o: { x: [0.16], y: [1] }, i: { x: [0.3], y: [1] } }, // expo out, cubic-bezier(.16,1,.3,1)
  inOut: { o: { x: [0.7], y: [0] }, i: { x: [0.2], y: [1] } }, // fast middle, soft ends
  fade: { o: { x: [0.4], y: [0] }, i: { x: [0.2], y: [1] } },
};

// The stutter for small squares: one state per step, 2 frames a step, then it stays on
const STUTTER = [0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1];
const STUTTER_SHORT = [0, 1, 0, 1, 1];
const STEP = 2;

const r3 = (n) => Math.round(n * 1000) / 1000;
const still = (k) => ({ a: 0, k });

// [[frame, value, easeName?], ...] -> animated property. Values are arrays or numbers.
function tween(keys) {
  const arr = (v) => (Array.isArray(v) ? v.map(r3) : [r3(v)]);
  return {
    a: 1,
    k: keys.map(([t, v, ease], i) => {
      const k = { t: r3(t), s: arr(v) };
      if (i < keys.length - 1) Object.assign(k, ease === 'hold' ? { h: 1 } : EASE[ease || 'out']);
      return k;
    }),
  };
}

// Opacity that steps through a pattern from `start` and stays on
function stutter(start, pattern = STUTTER, on = 100) {
  const keys = [[0, 0, 'hold']];
  pattern.forEach((state, i) => keys.push([start + i * STEP, state ? on : 0, 'hold']));
  return { prop: tween(keys), end: start + pattern.length * STEP };
}

function colour(spec) {
  const [hex, op = '1'] = spec.split('@');
  const n = parseInt(hex.slice(1), 16);
  return { c: [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1].map(r3), o: Number(op) * 100 };
}

const fill = (spec) => {
  const { c, o } = colour(spec);
  return { ty: 'fl', c: still(c), o: still(o), r: 1 };
};
const stroke = (spec) => {
  const { c, o } = colour(spec);
  return { ty: 'st', c: still(c), o: still(o), w: still(1), lc: 1, lj: 1, ml: 4 };
};
const transform = (o = still(100)) => ({
  ty: 'tr', p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o, sk: still(0), sa: still(0),
});
const group = (items, o) => ({ ty: 'gr', it: [...items, transform(o)] });
const rect = (x, y, w, h) => ({ ty: 'rc', d: 1, p: still([r3(x + w / 2), r3(y + h / 2)]), s: still([r3(w), r3(h)]), r: still(0) });
const shape = (v, closed, inT, outT) => ({
  ty: 'sh',
  ks: still({ c: closed, v: v.map((p) => p.map(r3)), i: (inT || v.map(() => [0, 0])).map((p) => p.map(r3)), o: (outT || v.map(() => [0, 0])).map((p) => p.map(r3)) }),
});
const trim = (e) => ({ ty: 'tm', s: still(0), e, o: still(0), m: 1 });

function layer(ind, nm, shapes, { anchor = [0, 0], scale, opacity, end }) {
  return {
    ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, ip: 0, op: end, st: 0, bm: 0,
    ks: {
      o: opacity || still(100), r: still(0), p: still([...anchor.map(r3), 0]), a: still([...anchor.map(r3), 0]),
      s: scale || still([100, 100, 100]),
    },
    shapes,
  };
}

// Lays a text box out glyph by glyph: [{ ch, glyph, x, y }] with y on the baseline
function layoutText(el) {
  const glyphs = [...el.txt].map((ch) => {
    const font = fonts.find((f) => f.charToGlyph(ch).index > 0) || fonts[0];
    return { ch, font, glyph: font.charToGlyph(ch) };
  });
  const advance = (g) => (g.glyph.advanceWidth / g.font.unitsPerEm) * FONT_SIZE + TRACKING;
  const width = glyphs.reduce((sum, g) => sum + advance(g), 0);
  let x = el.al === 'CENTER' ? el.x + (el.w - width) / 2 : el.x;
  return glyphs.map((g) => {
    const out = { ...g, x, y: el.y + BASELINE };
    x += advance(g);
    return out;
  });
}

// Geist Mono has no ↗, so it is drawn as two 1px strokes the size of a cap
const arrowLines = ({ x, y }) => {
  const [l, r, t, b] = [x + 1, x + 6, y - 6.5, y - 1.5];
  return [[[l, b], [r, t]], [[l + 1, t], [r, t], [r, b - 1]]];
};

// Text -> one group per glyph, so each character can switch on by itself
function textGlyphs(el) {
  return layoutText(el).map((g) => {
    if (g.ch === '↗') return [...arrowLines(g).map((pts) => shape(pts, false)), ...el.f.map(stroke)];
    const contours = toContours(g.glyph.getPath(g.x, g.y, FONT_SIZE).commands);
    return contours.length ? [...contours, ...el.f.map(fill)] : [];
  });
}

// The finished frame as a plain SVG: the Designer preview, and what shows without JS or motion
function poster(els) {
  const paint = (spec, kind) => {
    const [hex, op = '1'] = spec.split('@');
    return `${kind}="${hex}"${op !== '1' ? ` ${kind}-opacity="${Number(op)}"` : ''}`;
  };
  const body = els.map((el) => {
    if (el.t === 'TEXT') {
      return layoutText(el).map((g) => g.ch === '↗'
        ? arrowLines(g).map((pts) => `<polyline points="${pts.map((p) => p.map(r3).join(',')).join(' ')}" fill="none" ${paint(el.f[0], 'stroke')}/>`).join('')
        : `<path d="${g.glyph.getPath(g.x, g.y, FONT_SIZE).toPathData(3)}" ${paint(el.f[0], 'fill')}/>`).join('');
    }
    if (el.t === 'VECTOR') {
      return `<polyline points="${el.pts.map(([px, py]) => `${el.x + px},${el.y + py}`).join(' ')}" fill="none" ${paint(el.s[0], 'stroke')}/>`;
    }
    let out = '';
    if (el.f) out += `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" ${paint(el.f[0], 'fill')}/>`;
    if (el.s) out += `<rect x="${el.x + 0.5}" y="${el.y + 0.5}" width="${el.w - 1}" height="${el.h - 1}" fill="none" ${paint(el.s[0], 'stroke')}/>`;
    return out;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}</svg>`;
}

function toContours(cmds) {
  const out = [];
  let cur = null;
  const last = () => cur.v[cur.v.length - 1];
  for (const c of cmds) {
    if (c.type === 'M') {
      cur = { v: [[c.x, c.y]], i: [[0, 0]], o: [[0, 0]] };
      out.push(cur);
    } else if (c.type === 'L') {
      cur.v.push([c.x, c.y]); cur.i.push([0, 0]); cur.o.push([0, 0]);
    } else if (c.type === 'Q' || c.type === 'C') {
      const [px, py] = last();
      const c1 = c.type === 'Q' ? [px + (2 / 3) * (c.x1 - px), py + (2 / 3) * (c.y1 - py)] : [c.x1, c.y1];
      const c2 = c.type === 'Q' ? [c.x + (2 / 3) * (c.x1 - c.x), c.y + (2 / 3) * (c.y1 - c.y)] : [c.x2, c.y2];
      cur.o[cur.o.length - 1] = [c1[0] - px, c1[1] - py];
      cur.v.push([c.x, c.y]); cur.i.push([c2[0] - c.x, c2[1] - c.y]); cur.o.push([0, 0]);
    } else if (c.type === 'Z' && cur.v.length > 1) {
      const [fx, fy] = cur.v[0];
      const [lx, ly] = last();
      if (Math.abs(fx - lx) < 1e-6 && Math.abs(fy - ly) < 1e-6) {
        cur.i[0] = cur.i.pop(); cur.v.pop(); cur.o.pop();
      }
    }
  }
  return out.filter((ct) => ct.v.length > 1).map((ct) => shape(ct.v, true, ct.i, ct.o));
}

// Rectangle outline traced clockwise from the top-left corner, inside the box like Figma's stroke
function outline(el) {
  const [x0, y0, x1, y1] = [el.x + 0.5, el.y + 0.5, el.x + el.w - 0.5, el.y + el.h - 0.5];
  return shape([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true);
}

function classify(el, all) {
  if (el.t === 'TEXT') return 'text';
  if (el.t === 'VECTOR') return 'draw';
  const label = all.find((t) => t.t === 'TEXT' && t.al === 'CENTER' && t.x === el.x && t.w === el.w && t.y > el.y && t.y < el.y + el.h);
  if (label) return 'button';
  if (el.h <= 2 && el.w > el.h * 4) return 'hline';
  if (el.w <= 2 && el.h > el.w * 4) return 'vline';
  if (el.w <= 24 && el.h <= 24) return 'square';
  if (el.s && el.h >= 40) return 'panel';
  return 'chip';
}

// When each kind of element starts, before the left-to-right, top-to-bottom offset
const BASE = { hline: 0, vline: 0, panel: 0, button: 4, draw: 10, chip: 10, bar: 12, square: 14, text: 16 };

function build(name, els) {
  const layers = [];
  const buttonStart = new Map();
  let end = 0;

  els.forEach((el, idx) => {
    let role = classify(el, els);
    if (role === 'hline' && el.h === 2) role = 'bar'; // 2px lines are content, 1px are structure
    const isLabel = role === 'text' && buttonStart.has(`${el.x},${el.w}`);
    const spatial = (el.x / W) * 14 + (el.y / H) * 8;
    const start = isLabel ? buttonStart.get(`${el.x},${el.w}`) + 8 : BASE[role] + spatial;
    const paint = [...(el.f || []).map(fill), ...(el.s || []).map(stroke)];
    const nm = `${role} ${idx + 1}`;
    let item;

    if (role === 'hline' || role === 'bar' || role === 'vline') {
      const dur = role === 'bar' ? 26 : 30;
      const from = role === 'vline' ? [100, 0, 100] : [0, 100, 100];
      item = layer(0, nm, [group([rect(el.x, el.y, el.w, el.h), ...paint])], {
        anchor: [el.x, el.y],
        scale: tween([[start, from], [start + dur, [100, 100, 100]]]),
        opacity: tween([[0, 0, 'hold'], [start, 100]]),
      });
      end = Math.max(end, start + dur);
    } else if (role === 'panel') {
      const dur = 32;
      item = layer(0, nm, [group([outline(el), ...paint, trim(tween([[start, 0, 'inOut'], [start + dur, 100]]))])], {
        opacity: tween([[0, 0, 'hold'], [start, 100]]),
      });
      end = Math.max(end, start + dur);
    } else if (role === 'draw') {
      const dur = 18;
      const pts = el.pts.map(([px, py]) => [el.x + px, el.y + py]);
      item = layer(0, nm, [group([shape(pts, false), ...paint, trim(tween([[start, 0, 'inOut'], [start + dur, 100]]))])], {
        opacity: tween([[0, 0, 'hold'], [start, 100]]),
      });
      end = Math.max(end, start + dur);
    } else if (role === 'button') {
      buttonStart.set(`${el.x},${el.w}`, start);
      const body = el.s ? outline(el) : rect(el.x, el.y, el.w, el.h);
      item = layer(0, nm, [group([body, ...paint])], {
        anchor: [el.x + el.w / 2, el.y + el.h / 2],
        scale: tween([[start, [94, 94, 100]], [start + 28, [100, 100, 100]]]),
        opacity: tween([[start, 0, 'fade'], [start + 8, 100]]),
      });
      end = Math.max(end, start + 28);
    } else if (role === 'chip') {
      // Grows from its left edge; an accent fill flickers on once the outline is there
      const dur = 22;
      const groups = [];
      if (el.f) {
        const flick = stutter(start + 10, STUTTER_SHORT);
        groups.push(group([rect(el.x, el.y, el.w, el.h), ...el.f.map(fill)], flick.prop));
        end = Math.max(end, flick.end);
      }
      if (el.s) groups.unshift(group([outline(el), ...el.s.map(stroke)]));
      item = layer(0, nm, groups, {
        anchor: [el.x, el.y + el.h / 2],
        scale: tween([[start, [0, 100, 100]], [start + dur, [100, 100, 100]]]),
        opacity: tween([[0, 0, 'hold'], [start, 100]]),
      });
      end = Math.max(end, start + dur);
    } else if (role === 'square') {
      const flick = stutter(start);
      const body = el.s && !el.f ? outline(el) : rect(el.x, el.y, el.w, el.h);
      item = layer(0, nm, [group([body, ...paint])], { opacity: flick.prop });
      end = Math.max(end, flick.end);
    } else if (role === 'text') {
      // Types on a character a frame, with the odd character blinking once as it lands
      const glyphs = textGlyphs(el);
      const groups = glyphs.map((items, i) => {
        const t = start + i * 1.2;
        const blink = (i * 7 + el.txt.length) % 4 === 0;
        const keys = blink
          ? [[0, 0, 'hold'], [t, 100, 'hold'], [t + 2, 0, 'hold'], [t + 4, 100]]
          : [[0, 0, 'hold'], [t, 100]];
        end = Math.max(end, t + (blink ? 4 : 0));
        return items.length ? group(items, tween(keys)) : null;
      }).filter(Boolean); // spaces have no outline
      item = layer(0, nm, groups, {});
    }
    layers.push(item);
  });

  const op = Math.ceil(end) + 1;
  // Figma draws later children on top; Lottie draws the first layer on top
  layers.reverse().forEach((l, i) => { l.ind = i + 1; l.op = op; });
  return { v: '5.12.2', fr: FR, ip: 0, op, w: W, h: H, nm: name, ddd: 0, assets: [], layers };
}

const visuals = JSON.parse(fs.readFileSync(path.join(ROOT, 'lottie/visuals.json'), 'utf8'));
fs.rmSync(OUT, { recursive: true, force: true }); // no stale files from renamed visuals
fs.mkdirSync(OUT, { recursive: true });
const built = {};
for (const [name, els] of Object.entries(visuals)) {
  if (name.startsWith('_')) continue;
  built[name] = build(name, els);
  const file = path.join(OUT, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(built[name]));
  fs.writeFileSync(path.join(OUT, `${name}.svg`), poster(els));
  console.log(`${name}.json  ${(built[name].op / FR).toFixed(2)}s  ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
}

const previewArg = process.argv.indexOf('--preview');
if (previewArg > -1) {
  const target = path.resolve(process.argv[previewArg + 1]);
  const player = fs.readFileSync(path.join(ROOT, 'node_modules/lottie-web/build/player/lottie_light.min.js'), 'utf8');
  const cells = Object.keys(built).map((n) => `<div class="cell"><span>${n}</span><div class="anim" data-name="${n}"></div></div>`).join('');
  fs.writeFileSync(target, `<!doctype html><meta charset="utf-8"><title>Adapt Lottie preview</title>
<style>body{margin:0;background:#0b0b0c;color:#8a8a8e;font:12px monospace;padding:32px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);border-left:1px solid #232324;border-top:1px solid #232324}
.cell{border-right:1px solid #232324;border-bottom:1px solid #232324;padding:24px}.anim{aspect-ratio:3/1;margin-top:16px}
button{margin-bottom:16px;background:#ff5b1f;border:0;padding:8px 16px;font:inherit;cursor:pointer}</style>
<button onclick="play()">Replay</button><div class="grid">${cells}</div>
<script>${player}</script><script>
const data=${JSON.stringify(built)};
const anims=[...document.querySelectorAll('.anim')].map(el=>lottie.loadAnimation({container:el,renderer:'svg',loop:false,autoplay:false,animationData:data[el.dataset.name]}));
function play(){anims.forEach(a=>a.goToAndStop(0,true));anims.forEach((a,i)=>setTimeout(()=>a.play(),i*200));}
play();</script>`);
  console.log('preview ->', target);
}
