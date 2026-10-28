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

  function setState(item, open) {
    if (open === isOpen(item)) return;
    const from = item.panel.offsetHeight;
    [item.panel, item.icon, item.num].forEach((el) => el?.classList.toggle('is-open', open));
    if (item.icon) item.icon.textContent = open ? '−' : '+';
    item.toggle.setAttribute('aria-expanded', String(open));
    animate(item.panel, from, item.panel.offsetHeight);
  }

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
