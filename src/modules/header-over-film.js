// Keeps the site header clear while a full-bleed film hero sits under it, and gives it back its
// usual background once the hero has scrolled away.
//
//   <section class="section is-hero is-film" data-module="header-over-film"> … </section>
//
// The look lives in Webflow: the combo class `header is-over-film` (clear background, light text).
// This only adds and removes that class, so the header is never hidden.

const CLASS = 'is-over-film';

export default function (hero) {
  const header = document.querySelector('.header');
  if (!header) return;
  const set = () => header.classList.toggle(CLASS, hero.getBoundingClientRect().bottom > header.offsetHeight);
  set();
  window.addEventListener('scroll', set, { passive: true });
  window.addEventListener('resize', set);
}
