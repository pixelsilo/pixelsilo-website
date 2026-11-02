// The Work page filter. Buttons and cards are matched by word, so the CMS Services text
// ("Brand · Web · Imagery") drives it and the collection needs no extra fields. JS only toggles
// `is-active` on the buttons and hides cards; how a pressed button looks is styled in the Designer.
//
//   [data-module="work-filter"]   root, wrapping the buttons and every project list
//   [data-filter="Brand"]         a <button>; data-filter="all" shows every project
//   [data-services]               a project card, carrying its Services text

const ALL = 'all';

export default function (root) {
  const buttons = [...root.querySelectorAll('[data-filter]')];
  const cards = [...root.querySelectorAll('[data-services]')];
  const words = (card) => card.getAttribute('data-services').toLowerCase().split(/[^a-z]+/);

  function apply(value) {
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

  buttons.forEach((button) => button.addEventListener('click', () => apply(button.dataset.filter)));
  apply(ALL);
}
