// The case study image treatment: each frame is uncovered from its bottom edge, like a print lifted
// out of a tray, while the photo inside settles from a slight zoom. After that the photo drifts a
// little inside its frame as the page scrolls, so the images feel layered under the hairlines.
//
//   unveil(frames, { drift })   frames are .media elements (overflow hidden, an img or video
//                               .media_image filling them). drift: false skips the scroll drift
//                               (the film player, whose controls sit inside the frame).
//
// Used by case-gallery (the Gallery images, once they're laid out) and case-motion (the film).
// Uses the GSAP and ScrollTrigger Webflow already loads. With either missing, or reduced motion,
// it does nothing and the images simply show.

const REDUCED = '(prefers-reduced-motion: reduce)';

const HIDDEN = 'inset(100% 0% 0% 0%)'; // clipped away from the top down to the bottom edge
const SHOWN = 'inset(0% 0% 0% 0%)';
const START = 'top 85%'; // same point the grid reveals use
const DURATION = 1.6;
const EASE = 'expo.out';
const PAIR_DELAY = 0.15; // the second image of a pair follows the first

const ZOOM = 1.18; // the photo starts this much larger
const REST = 1.1; // and settles here, leaving room to drift without showing an edge
const DRIFT = 3.5; // yPercent the photo travels either way while its frame crosses the screen

export function canAnimate() {
  return Boolean(window.gsap && window.ScrollTrigger) && !window.matchMedia(REDUCED).matches;
}

export function unveil(frames, { drift = true } = {}) {
  if (!canAnimate()) return;
  const { gsap } = window;
  gsap.registerPlugin(window.ScrollTrigger);

  [...frames].forEach((frame) => {
    const photos = frame.querySelectorAll(':scope > .media_image');
    // A pair's second frame waits a beat behind the first
    const row = frame.closest('.row');
    const delay = row && row.querySelectorAll('.media')[1] === frame ? PAIR_DELAY : 0;
    const rest = drift ? REST : 1;

    gsap.set(frame, { clipPath: HIDDEN });
    gsap.set(photos, { scale: drift ? ZOOM : 1.08, transformOrigin: '50% 50%' });

    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: DURATION, ease: EASE },
      onComplete: () => gsap.set(frame, { clearProps: 'clipPath' }),
    });
    tl.to(frame, { clipPath: SHOWN }, delay).to(photos, { scale: rest, duration: DURATION + 0.6 }, delay);

    window.ScrollTrigger.create({ trigger: frame, start: START, once: true, onEnter: () => tl.play() });

    if (drift) {
      gsap.fromTo(
        photos,
        { yPercent: -DRIFT },
        {
          yPercent: DRIFT,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        },
      );
    }
  });
}
