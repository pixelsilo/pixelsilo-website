// The tablet and phone menu. JS only toggles the `is-open` combo class and handles access; how open
// and closed look (panel wipe, button lines, link reveal) is styled on the classes in the Designer,
// with Theme variables, so it follows the Header's Light variant.
//
//   [data-module="mobile-menu"]   root (the Header)
//   [data-menu="toggle"]          the <button>, with aria-expanded and aria-controls
//   [data-menu="panel"]           the panel; .menu is hidden, .menu.is-open is visible
//   [data-menu="line"]            a button line; .menu_line.is-open rotates it into the cross
//   [data-menu="reveal"]          a link's text; .menu_item.is-open rises into its mask

const STAGGER = 70; // ms between links
const FIRST_DELAY = 150; // ms before the first link, so the panel wipe leads
const DESKTOP_UP = '(min-width: 992px)';

export default function (root) {
  const toggle = root.querySelector('[data-menu="toggle"]');
  const panel = root.querySelector('[data-menu="panel"]');
  const parts = root.querySelectorAll('[data-menu]');
  const reveals = root.querySelectorAll('[data-menu="reveal"]');
  const page = document.querySelectorAll('main, footer');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    parts.forEach((el) => el.style.setProperty('transition', 'none'));
  }

  const isOpen = () => panel.classList.contains('is-open');

  function setOpen(open) {
    parts.forEach((el) => el.classList.toggle('is-open', open));
    // Inline, because the delay depends on position. Cleared on close so the links leave together.
    reveals.forEach((el, i) => {
      el.style.transitionDelay = open ? `${FIRST_DELAY + i * STAGGER}ms` : '';
    });
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    page.forEach((el) => {
      el.inert = open;
    });
  }

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !isOpen()) return;
    setOpen(false);
    toggle.focus();
  });

  window.matchMedia(DESKTOP_UP).addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });

  // A page restored from the back/forward cache comes back as it was left
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) setOpen(false);
  });
}
