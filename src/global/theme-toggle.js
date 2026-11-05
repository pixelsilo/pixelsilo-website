// Switches the whole site between light, dark and auto (follows the device), the same three modes
// as the client dashboard. Each click moves on one: Light → Dark → Auto → Light.
//
// The choice is shared with the dashboard (dashboard.pixelsilo.net, its sign-in and help guide)
// through the `theme` cookie on .pixelsilo.net, so picking light here means light there too.
// Where that cookie can't be set (the webflow.io staging site), localStorage `ps-theme` holds it.
// The snippet in Site settings > Custom code > Head reads the same values and applies them before
// the first paint, so a saved theme never flashes the wrong one. With nothing saved, the site is dark.
//
//   data-theme="toggle"      on a <button>: moves to the next mode; its aria-label and title name it
//
// On <html>:
//   theme-light              the light colours are on (the Theme variables' Light mode); dark is the default
//   data-theme-mode          light | dark | auto, the chosen mode, which the code_css embed uses to turn
//                            the toggle icon: dark 0°, auto 90° (the filled half along the bottom),
//                            light 180°. Clicks keep turning it clockwise, so the script adds the turn
//                            inline: +180 to dark, +90 to auto, +90 back to light.
//   theme-switching          for the length of a switch; the CSS embed turns transitions off meanwhile,
//                            so nothing with a colour transition is caught halfway through a fade.

const COOKIE = 'theme';
const KEY = 'ps-theme';
const MODES = ['light', 'dark', 'auto'];
const DEFAULT = 'dark';
const NEXT = { light: 'dark', dark: 'auto', auto: 'light' };
const ANGLE = { dark: 0, auto: 90, light: 180 };
const SHARED_DOMAIN = 'pixelsilo.net';
const YEAR = 31536000;
const LIGHT = 'theme-light';
const SWITCHING = 'theme-switching';
const PREFERS_LIGHT = '(prefers-color-scheme: light)';
const REDUCED = '(prefers-reduced-motion: reduce)';
const LABEL = { light: 'Switch to light mode', dark: 'Switch to dark mode', auto: 'Switch to auto mode, matching your device' };

function readMode() {
  const cookie = (document.cookie.match(/(?:^|; )theme=(light|dark|auto)(?:;|$)/) || [])[1];
  if (cookie) return cookie;
  try {
    const stored = localStorage.getItem(KEY);
    if (MODES.includes(stored)) return stored;
  } catch (err) {
    // Storage blocked
  }
  return DEFAULT;
}

function saveMode(mode) {
  const host = location.hostname;
  // The shared cookie only sticks on pixelsilo.net and its subdomains
  if (host === SHARED_DOMAIN || host.endsWith(`.${SHARED_DOMAIN}`)) {
    document.cookie = `${COOKIE}=${mode}; domain=.${SHARED_DOMAIN}; path=/; max-age=${YEAR}; samesite=lax; secure`;
  }
  try {
    localStorage.setItem(KEY, mode);
  } catch (err) {
    // Storage blocked: the cookie (or this visit) still holds it
  }
}

export default function themeToggle() {
  const html = document.documentElement;
  const toggles = document.querySelectorAll('[data-theme="toggle"]');
  const prefersLight = window.matchMedia(PREFERS_LIGHT);
  let mode = readMode();
  let angle = ANGLE[mode];

  const isLight = () => mode === 'light' || (mode === 'auto' && prefersLight.matches);

  const paint = () => {
    html.classList.toggle(LIGHT, isLight());
    html.setAttribute('data-theme-mode', mode);
    const text = LABEL[NEXT[mode]];
    toggles.forEach((el) => {
      el.setAttribute('aria-label', text);
      el.setAttribute('title', text);
      el.querySelectorAll('.theme_icon').forEach((icon) => {
        icon.style.transform = `rotate(${angle}deg)`;
      });
    });
  };

  // Turns transitions off while the colours change, cross-fading where the browser can
  const switchTo = (update) => {
    html.classList.add(SWITCHING);
    const done = () => html.classList.remove(SWITCHING);
    if (document.startViewTransition && !window.matchMedia(REDUCED).matches) {
      document.startViewTransition(update).finished.finally(done);
    } else {
      update();
      // Let the new colours paint before transitions come back on
      requestAnimationFrame(() => requestAnimationFrame(done));
    }
  };

  const next = () => {
    const from = mode;
    mode = NEXT[mode];
    angle += (ANGLE[mode] - ANGLE[from] + 360) % 360 || 360;
    saveMode(mode);
    const willChange = isLight() !== html.classList.contains(LIGHT);
    if (willChange) switchTo(paint);
    else paint(); // e.g. dark to auto on a dark device: only the icon turns
  };

  // In auto, follow the device when it switches between light and dark
  prefersLight.addEventListener?.('change', () => {
    if (mode === 'auto' && isLight() !== html.classList.contains(LIGHT)) switchTo(paint);
  });

  toggles.forEach((el) => el.addEventListener('click', next));
  paint();
}
