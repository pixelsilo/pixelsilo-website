// Motion helpers for the dashboard loop. Everything is a pure function of the frame number, so
// a frame can be drawn at any time, in any order, and the loop is deterministic.

/** Cubic bezier easing (the CSS cubic-bezier curve), solved for x with Newton's method. */
export function bezier(x1, y1, x2, y2) {
  const A = (a, b) => 1 - 3 * b + 3 * a;
  const B = (a, b) => 3 * b - 6 * a;
  const Cc = (a) => 3 * a;
  const calc = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + Cc(a)) * t;
  const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + Cc(a);
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (s === 0) break;
      t -= (calc(t, x1, x2) - x) / s;
    }
    return calc(t, y1, y2);
  };
}

export const EASY = bezier(0.7, 0, 0.2, 1);
export const OUT = bezier(0.16, 1, 0.3, 1);
export const IN = bezier(0.6, 0, 0.9, 0.3);
export const LINEAR = (t) => t;

/** from → to over [start, start + dur], clamped either side. */
export const tween = (f, start, dur, from, to, easing = EASY) => {
  if (dur <= 0) return f < start ? from : to;
  const t = Math.min(1, Math.max(0, (f - start) / dur));
  return from + (to - from) * easing(t);
};

/** Slides up into place and leaves upwards: no bounce. */
export const enterLeave = (f, inAt, outAt) => {
  const a = tween(f, inAt, 36, 0, 1, OUT);
  const b = tween(f, outAt, 26, 0, 1, IN);
  return { opacity: a * (1 - b), y: Math.round((1 - a) * 46 - b * 40) };
};
