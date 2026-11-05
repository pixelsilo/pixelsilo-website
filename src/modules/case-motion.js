// Motion on a case study page that the site-wide interactions can't reach, because the elements
// are made by script or need to be read at load.
//
//   [data-module="case-motion"]   the template's <main>
//
// The hero: the Page load intro fades and lifts the hero frame ([intro="media-rise"]); this eases
// the photo, or the hero film thumb-video put beside it, out of a slight zoom at the same time. If
// the script arrives after the frame has already faded in, it leaves the photo alone rather than
// jump it.
//
// The film (the Video field, .row.is-film): uncovered like the Gallery images (image-unveil), with
// no drift, because the player's controls sit inside the frame.
//
// The Gallery images get the same treatment from case-gallery once they're laid out.

import { canAnimate, unveil } from './image-unveil.js';

const HERO_ZOOM = 1.12;

export default function caseMotion(root) {
  if (!canAnimate()) return;
  const { gsap } = window;

  const hero = root.querySelector('[intro="media-rise"]');
  if (hero && Number(getComputedStyle(hero).opacity) < 0.5) {
    const photos = hero.querySelectorAll(':scope > .media_image');
    gsap.fromTo(photos, { scale: HERO_ZOOM }, { scale: 1, duration: 2.4, delay: 0.6, ease: 'expo.out', transformOrigin: '50% 50%' });
  }

  const film = root.querySelectorAll('.row.is-film .media.is-player');
  if (film.length) unveil(film, { drift: false });
}
