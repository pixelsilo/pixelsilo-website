// Switches the whole site between dark and light. Light is `theme-light` on <html>: that class holds
// the Theme variables' Light mode, so everything styled with Theme variables follows. Dark is the
// default. The choice is saved here, and the snippet in Site settings > Custom code > Head applies
// it before the first paint, so a saved light theme doesn't flash dark.
//
//   data-theme="toggle"   on a <button>: switches the theme; its aria-label says which way
//
// While the theme changes, <html> also has `theme-switching`, which the CSS embed uses to turn
// CSS transitions off. Otherwise an element with a colour transition (the homepage title bar) is
// still mid-fade when the view transition captures the new state, and jumps when it ends.

const KEY = 'ps-theme';
const LIGHT = 'theme-light';
const SWITCHING = 'theme-switching';
const REDUCED = '(prefers-reduced-motion: reduce)';

export default function themeToggle() {
  const html = document.documentElement;
  const toggles = document.querySelectorAll('[data-theme="toggle"]');
  if (!toggles.length) return;

  const label = () => {
    const text = `Switch to ${html.classList.contains(LIGHT) ? 'dark' : 'light'} mode`;
    toggles.forEach((el) => {
      el.setAttribute('aria-label', text);
      el.setAttribute('title', text);
    });
  };

  const apply = (light) => {
    html.classList.toggle(LIGHT, light);
    label();
  };

  const toggle = () => {
    const light = !html.classList.contains(LIGHT);
    try {
      localStorage.setItem(KEY, light ? 'light' : 'dark');
    } catch (err) {
      // Storage blocked: it still switches, it just won't be remembered
    }
    html.classList.add(SWITCHING);
    const done = () => html.classList.remove(SWITCHING);
    if (document.startViewTransition && !window.matchMedia(REDUCED).matches) {
      document.startViewTransition(() => apply(light)).finished.finally(done);
    } else {
      apply(light);
      // Let the new colours paint before transitions come back on
      requestAnimationFrame(() => requestAnimationFrame(done));
    }
  };

  toggles.forEach((el) => el.addEventListener('click', toggle));
  label();
}
