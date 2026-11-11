// The site's cursor: a small orange dot in place of the pointer, on screens with a mouse or
// trackpad. It sits exactly on the pointer (no easing behind it), grows over anything you can
// click, shrinks a touch while pressed, and gives way to the normal text caret in form fields.
// Touch screens keep their own behaviour and never get the dot.
//
// The script only adds the dot and toggles classes; how it looks is in the code_css embed:
//   html.has-cursor     hides the normal pointer (only set where there's a fine pointer)
//   .cursor             the dot, a fixed, click-through element at the end of <body>
//     .is-visible       the pointer is over the page
//     .is-hover         over a link, button or other clickable thing
//     .is-down          a button is held
//     .is-text          over a text field, where the caret shows instead
//
// A modal <dialog> (the Work page lightbox), an open popover (the Hello pages' AEO explainer) and a
// full-screen film sit in the browser's top layer, above everything else, so the dot moves into
// whichever is open to stay on top.

const FINE = '(hover: hover) and (pointer: fine)';
const CLICKABLE = 'a[href], button, [role="button"], label, select, summary, [data-film-open], [data-player="track"], [tabindex]:not([tabindex="-1"])';
const TEXT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="range"]), textarea, [contenteditable="true"]';

export default function cursor() {
  const fine = window.matchMedia(FINE);
  const html = document.documentElement;
  let dot = null;

  const openPopover = () => {
    try {
      return document.querySelector(':popover-open');
    } catch {
      return null; // a browser without popovers has none open
    }
  };
  const home = () => document.fullscreenElement || document.querySelector('dialog[open]') || openPopover() || document.body;
  const rehome = () => {
    const parent = home();
    if (dot && dot.parentElement !== parent) parent.append(dot);
  };

  function move(event) {
    if (event.pointerType !== 'mouse') {
      dot.classList.remove('is-visible');
      return;
    }
    dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    dot.classList.add('is-visible');
  }

  function over(event) {
    const target = event.target instanceof Element ? event.target : null;
    rehome();
    // An iframe takes the pointer's events, so the dot would stall at its edge; let the frame's own cursor show
    if (target?.tagName === 'IFRAME') dot.classList.remove('is-visible');
    dot.classList.toggle('is-text', !!target?.closest(TEXT));
    dot.classList.toggle('is-hover', !!target?.closest(CLICKABLE) && !target?.closest(TEXT));
  }

  const down = (event) => event.pointerType === 'mouse' && dot.classList.add('is-down');
  const up = () => dot.classList.remove('is-down');
  const leave = () => dot.classList.remove('is-visible', 'is-down');

  function enable() {
    if (dot) return;
    dot = document.createElement('div');
    dot.className = 'cursor';
    dot.setAttribute('aria-hidden', 'true');
    document.body.append(dot);
    html.classList.add('has-cursor');
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    html.addEventListener('mouseleave', leave);
    document.addEventListener('fullscreenchange', rehome);
    // A popover's toggle event doesn't bubble, so listen in the capture phase
    document.addEventListener('toggle', rehome, true);
  }

  function disable() {
    if (!dot) return;
    window.removeEventListener('pointermove', move);
    document.removeEventListener('pointerover', over);
    window.removeEventListener('pointerdown', down);
    window.removeEventListener('pointerup', up);
    html.removeEventListener('mouseleave', leave);
    document.removeEventListener('fullscreenchange', rehome);
    document.removeEventListener('toggle', rehome, true);
    html.classList.remove('has-cursor');
    dot.remove();
    dot = null;
  }

  // A tablet that gains a mouse (or loses one) switches over
  const sync = () => (fine.matches ? enable() : disable());
  sync();
  fine.addEventListener?.('change', sync);
}
