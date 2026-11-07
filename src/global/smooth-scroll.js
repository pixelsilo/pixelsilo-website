// Smooth scrolling for the mouse wheel and trackpad, with Lenis (lenis.darkroom.engineering).
// Touch scrolling stays native, and with reduced motion on it doesn't run at all.
//
// Set up the way Lenis documents it for GSAP: Lenis is driven by GSAP's ticker and tells
// ScrollTrigger on every scroll, so the Webflow interactions (reveals, column lines, the case study
// images) stay in step with the page. Without GSAP it runs its own loop.
//
//   autoToggle         pauses while the page is locked (html overflow: hidden), which is how the
//                      mobile menu and the film lightbox lock it, so nothing moves underneath
//   allowNestedScroll  anything with its own scroll (the film lightbox, the consent panel) scrolls
//                      natively; add data-lenis-prevent to any other element that must
//   anchors            same-page links (#id) glide to their target
//
// Feel: LERP is how much of the distance left is covered each frame. Lower is floatier; 0.1 is
// Lenis's default. Each notch of a clicky mouse wheel starts a new glide, and above about 0.1 each
// glide is mostly over before the next notch, so the notches show as steps (0.12 did, 7 Nov 2026).
// Lower runs the notches together into one continuous movement.

import Lenis from 'lenis';

const LERP = 0.075;
const REDUCED = '(prefers-reduced-motion: reduce)';
const STYLE_ID = 'lenis-style';

// Lenis's own stylesheet (lenis/dist/lenis.css), less the rule that turns off clicks on iframes
const CSS = `
html.lenis, html.lenis body { height: auto; }
.lenis:not(.lenis-autoToggle).lenis-stopped { overflow: clip; }
.lenis [data-lenis-prevent], .lenis [data-lenis-prevent-wheel], .lenis [data-lenis-prevent-touch],
.lenis [data-lenis-prevent-vertical], .lenis [data-lenis-prevent-horizontal] { overscroll-behavior: contain; }
.lenis.lenis-autoToggle { transition-property: overflow; transition-duration: 1ms; transition-behavior: allow-discrete; }
`;

export default function smoothScroll() {
  if (window.lenis || window.matchMedia(REDUCED).matches) return;

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.append(style);
  }

  const { gsap, ScrollTrigger } = window;
  const withGsap = Boolean(gsap && ScrollTrigger);

  const lenis = new Lenis({
    lerp: LERP,
    autoRaf: !withGsap,
    autoToggle: true,
    allowNestedScroll: true,
    anchors: true,
  });
  window.lenis = lenis;

  if (withGsap) {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}
