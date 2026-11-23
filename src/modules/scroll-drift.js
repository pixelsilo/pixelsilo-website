// A photo that moves a little inside its frame as the frame crosses the screen.
//
//   <div class="media" data-module="scroll-drift" data-drift="left">
//     <img class="media_image" …>
//   </div>
//
//   data-drift   up | down | left | right   the photo travels that way as you scroll down
//                in | out                   the photo slowly zooms in, or out
//
// The frame needs overflow hidden (.media has it). A travelling photo is held 10% larger so no
// edge shows; the travel and the scrub match the case study galleries (image-unveil.js). With
// reduced motion, or without GSAP, the photo simply sits still.

const TRAVEL = 3.5; // percent of the photo's size, either way
const HELD = 1.1; // scale while travelling, leaving room at the edges
const ZOOM = [1.02, 1.12]; // scale across the frame's trip up the screen, for "in" (reversed for "out")
const SCRUB = 0.8; // seconds the photo takes to catch up with the scroll

const MOVES = {
  up: { from: { yPercent: TRAVEL, scale: HELD }, to: { yPercent: -TRAVEL } },
  down: { from: { yPercent: -TRAVEL, scale: HELD }, to: { yPercent: TRAVEL } },
  left: { from: { xPercent: TRAVEL, scale: HELD }, to: { xPercent: -TRAVEL } },
  right: { from: { xPercent: -TRAVEL, scale: HELD }, to: { xPercent: TRAVEL } },
  in: { from: { scale: ZOOM[0] }, to: { scale: ZOOM[1] } },
  out: { from: { scale: ZOOM[1] }, to: { scale: ZOOM[0] } },
};

export default function (frame) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const move = MOVES[frame.getAttribute('data-drift')] || MOVES.up;
  const photos = frame.querySelectorAll(':scope > .media_image');
  if (!photos.length) return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.fromTo(
    photos,
    { ...move.from, transformOrigin: '50% 50%' },
    {
      ...move.to,
      ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: SCRUB },
    },
  );
}
