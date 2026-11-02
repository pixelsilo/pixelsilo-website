// The Work page filter. Buttons and cards are matched by word, so the CMS Services text
// ("Brand · Web · Imagery") drives it and the collection needs no extra fields. JS only toggles
// `is-active` on the buttons and hides cards; how a pressed button looks is styled in the Designer.
//
//   [data-module="work-filter"]   root, wrapping the buttons and every project list
//   [data-filter="Brand"]         a <button>; data-filter="all" shows every project
//   [data-services]               a project card, carrying its Services text
//
// Changing the filter is animated. Where the browser has view transitions, cards leaving fade out,
// cards arriving fade in and cards that stay glide to their new place. Elsewhere the remaining
// cards fade back in. Reduced motion switches straight over.

const ALL = 'all';
const MS = 450; // view transition length
const FADE_MS = 300; // fallback fade length
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const STYLE_ID = 'work-filter-transition';

// Only the cards animate; the rest of the page stays put instead of cross-fading.
function addStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    ::view-transition-old(root), ::view-transition-new(root) { animation: none; }
    ::view-transition-group(*) { animation-duration: ${MS}ms; animation-timing-function: ${EASE}; }
    ::view-transition-old(*), ::view-transition-new(*) { animation-duration: ${MS * 0.6}ms; }
  `;
  document.head.appendChild(style);
}

export default function (root) {
  const buttons = [...root.querySelectorAll('[data-filter]')];
  const cards = [...root.querySelectorAll('[data-services]')];
  const words = (card) => card.getAttribute('data-services').toLowerCase().split(/[^a-z]+/);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canTransition = typeof document.startViewTransition === 'function';
  let current = null;
  let running = null;

  // Each card needs its own name so the browser can follow it from old place to new.
  if (canTransition) {
    addStyle();
    cards.forEach((card, i) => card.style.setProperty('view-transition-name', `work-card-${i}`));
  }

  function update(value) {
    buttons.forEach((button) => {
      const on = button.dataset.filter === value;
      button.classList.toggle('is-active', on);
      button.setAttribute('aria-pressed', String(on));
    });
    cards.forEach((card) => {
      const show = value === ALL || words(card).includes(value.toLowerCase());
      // Inline, because the card's own class sets its display
      if (show) card.style.removeProperty('display');
      else card.style.setProperty('display', 'none');
    });
  }

  function apply(value) {
    if (value === current) return;
    const first = current === null;
    current = value;
    if (first || reduceMotion.matches) return update(value);

    if (canTransition) {
      running?.skipTransition();
      running = document.startViewTransition(() => update(value));
      running.finished.finally(() => { running = null; });
      return;
    }

    update(value);
    cards
      .filter((card) => card.style.display !== 'none')
      .forEach((card, i) => card.animate(
        [{ opacity: 0, transform: 'translateY(0.75rem)' }, { opacity: 1, transform: 'none' }],
        { duration: FADE_MS, delay: Math.min(i, 8) * 30, easing: EASE, fill: 'backwards' },
      ));
  }

  buttons.forEach((button) => button.addEventListener('click', () => apply(button.dataset.filter)));
  apply(ALL);
}
