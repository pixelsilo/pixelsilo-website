// Plays Lottie files once as they scroll into view, 200ms apart when several arrive together.
// Each slot holds a poster image (the finished frame) so the Designer, no-JS and reduced motion
// all show the final state; the Lottie replaces it once it has loaded.
//
//   [data-module="lottie-stagger"]   root (optional data-lottie-stagger="200", ms between plays)
//   [data-lottie="adapt-01"]         a slot; plays dist/lottie/adapt-01.json
//
// The files load from the same place as site.js (jsDelivr tag, or localhost with ?dev).

const PLAYER = 'https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie_light.min.js';
const BASE = (document.currentScript?.src || '').replace(/[^/]*$/, '') + 'lottie/';
const STAGGER = 200;

let player;
let nextAt = 0; // shared, so two roots arriving together still take turns
function loadPlayer() {
  player ||= new Promise((resolve, reject) => {
    if (window.lottie) return resolve(window.lottie);
    const s = document.createElement('script');
    s.src = PLAYER;
    s.onload = () => resolve(window.lottie);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return player;
}

export default function (root) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // posters stay
  const stagger = Number(root.getAttribute('data-lottie-stagger')) || STAGGER;
  const slots = [...root.querySelectorAll('[data-lottie]')];

  loadPlayer().then((lottie) => {
    const anims = new Map();
    slots.forEach((slot) => {
      const anim = lottie.loadAnimation({
        container: slot,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `${BASE}${slot.getAttribute('data-lottie')}.json`,
      });
      // Swap the poster for the (empty) first frame only once the Lottie is ready to draw
      anim.addEventListener('DOMLoaded', () => {
        slot.querySelectorAll('img').forEach((img) => (img.style.display = 'none'));
        slot.setAttribute('data-lottie-ready', '');
        observer.observe(slot);
      });
      anims.set(slot, anim);
    });

    const observer = new IntersectionObserver((entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => slots.indexOf(a.target) - slots.indexOf(b.target))
        .forEach(({ target }) => {
          observer.unobserve(target);
          const now = performance.now();
          nextAt = Math.max(now, nextAt + stagger);
          setTimeout(() => anims.get(target).play(), nextAt - now);
        });
    }, { threshold: 0.4 });
  }).catch((err) => console.error('[site] lottie player failed to load:', err));
}
