// One-open-at-a-time project list. Clicking a row opens its panel and closes the open one,
// so the list never jumps far. JS only toggles the `is-open` combo class; how open and closed
// look (panel height, icon and number colour) is styled on the classes in the Designer.
//
//   [data-module="work-list"]   root
//   [data-work="item"]          one project
//   [data-work="toggle"]        the clickable row (role="button", tabindex="0")
//   [data-work="panel"]         the panel; .work_panel is height 0, .work_panel.is-open is auto
//   [data-work="icon"]          the + / − indicator
//   [data-work="num"]           the row number (accent when open)
//   [data-work="bg"]            optional full-bleed image behind the row and panel; gets `is-open` (fades in), and
//                               then the row gets `is-open` too (dark bar) and the item `theme-dark`
//
// Optional, on the root, for a list fed by the CMS (where every row starts from the same template):
//   data-work-number="auto"     writes 01, 02, 03... into each row's number
//   data-work-open="first"      opens the first row on load, without animating

const DURATION = 500;
const EASING = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

export default function (root) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [...root.querySelectorAll('[data-work="item"]')].map((el, i) => {
    const item = {
      el,
      toggle: el.querySelector('[data-work="toggle"]'),
      panel: el.querySelector('[data-work="panel"]'),
      icon: el.querySelector('[data-work="icon"]'),
      num: el.querySelector('[data-work="num"]'),
      bg: el.querySelector('[data-work="bg"]'),
    };
    item.panel.id ||= `work-panel-${i + 1}`;
    item.toggle.setAttribute('aria-controls', item.panel.id);
    return item;
  });

  const isOpen = (item) => item.panel.classList.contains('is-open');

  function animate(panel, from, to) {
    if (reduceMotion) return;
    panel.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: DURATION, easing: EASING });
  }

  function setState(item, open, instant = false) {
    if (open === isOpen(item)) return;
    const from = item.panel.offsetHeight;
    [item.panel, item.icon, item.num, item.bg].forEach((el) => el?.classList.toggle('is-open', open));
    // A project with no hero image bound has only the blank fallback (w-dyn-bind-empty): it stays a plain row
    if (item.bg && !item.bg.classList.contains('w-dyn-bind-empty')) {
      // A row with a background image (the homepage list) reads as a dark card whichever theme the page is in
      item.toggle.classList.toggle('is-open', open);
      item.el.classList.toggle('theme-dark', open);
    }
    if (item.icon) item.icon.textContent = open ? '−' : '+';
    item.toggle.setAttribute('aria-expanded', String(open));
    if (!instant) animate(item.panel, from, item.panel.offsetHeight);
  }

  if (root.getAttribute('data-work-number') === 'auto') {
    items.forEach((item, i) => {
      const label = item.num?.querySelector('p') || item.num;
      if (label) label.textContent = String(i + 1).padStart(2, '0');
    });
  }
  if (root.getAttribute('data-work-open') === 'first' && items[0]) setState(items[0], true, true);

  function select(target) {
    const opening = !isOpen(target);
    items.forEach((item) => setState(item, opening && item === target));
  }

  items.forEach((item) => {
    item.toggle.addEventListener('click', () => select(item));
    item.toggle.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      select(item);
    });
  });
}
