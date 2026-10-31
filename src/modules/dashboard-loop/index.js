// The dashboard loop: the client-dashboard story as a live, transparent animation that follows the
// site's theme. A pure function of the frame number (wide.jsx, portrait.jsx) is drawn with Preact at
// 60fps into a fixed-size stage, which is scaled to the root's width so nothing reflows.
//
//   <div data-module="dashboard-loop" data-layout="auto" data-avatar="https://…/luke.jpg"></div>
//
//   data-layout   "wide" (2560 × 1072, the default), "portrait" (1200 × 1600, 3:4) or "auto",
//                 which is portrait up to 767px wide and wide above
//   data-avatar   optional: Luke's photo for the update card (initials otherwise)
//
// Colours come from the Theme variables (see theme.js) and can be overridden per root with the
// `--lp-*` custom properties. It pauses off screen, and under reduced motion shows one still frame.

import { render } from 'preact';
import { ROOT_VARS } from './theme.js';
import * as wide from './wide.jsx';
import * as portrait from './portrait.jsx';
import { FPS } from './data.js';

const REDUCED = '(prefers-reduced-motion: reduce)';
const SMALL = '(max-width: 767px)';

export default function dashboardLoop(root) {
  const avatar = root.getAttribute('data-avatar') || undefined;
  const layout = root.getAttribute('data-layout') || 'wide';
  const small = window.matchMedia(SMALL);
  const pick = () => (layout === 'portrait' || (layout === 'auto' && small.matches) ? portrait : wide);
  let comp = pick();

  Object.assign(root.style, { position: 'relative', width: '100%', overflow: 'hidden', background: 'transparent' });
  Object.entries(ROOT_VARS).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('aria-hidden', 'true');

  const stage = document.createElement('div');
  Object.assign(stage.style, { position: 'absolute', left: '0', top: '0', transformOrigin: '0 0', pointerEvents: 'none' });
  root.appendChild(stage);

  const size = () => {
    root.style.aspectRatio = `${comp.W} / ${comp.H}`;
    stage.style.width = `${comp.W}px`;
    stage.style.height = `${comp.H}px`;
    fit();
  };
  const fit = () => {
    stage.style.transform = `scale(${root.clientWidth / comp.W})`;
  };
  size();
  new ResizeObserver(fit).observe(root);

  let frame = 0;
  const draw = (f) => {
    frame = f;
    render(comp.View({ f, avatar }), stage);
  };

  if (layout === 'auto') {
    small.addEventListener('change', () => {
      comp = pick();
      size();
      draw(frame);
    });
  }

  if (window.matchMedia(REDUCED).matches) {
    draw(comp.STILL);
    return;
  }

  // Time-based, so a dropped frame skips rather than slows. Pausing freezes the clock, so the loop
  // picks up where it stopped when it scrolls back into view.
  let elapsed = 0;
  let last = 0;
  let raf = 0;
  const tick = (now) => {
    if (last) elapsed += Math.min(100, now - last);
    last = now;
    draw(((elapsed / 1000) * FPS) % comp.DURATION);
    raf = requestAnimationFrame(tick);
  };
  let frozen = false;
  const start = () => {
    if (raf || frozen) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  // A handle for debugging and tests: root.dashboardLoop.freeze(frame) holds one frame.
  const freeze = (f) => {
    frozen = true;
    stop();
    draw(f);
  };
  root.dashboardLoop = { draw, freeze, get frame() { return frame; } };

  draw(0);
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { rootMargin: '10%' }).observe(root);
}
