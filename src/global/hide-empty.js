// Hides CMS-bound pieces that have no value, on the live site only. The Designer does not run
// site scripts, so there everything stays visible and editable.
//
//   data-hide-empty                 hide this element when it has no text
//   data-hide-empty-parent=".sel"   hide the closest ancestor matching .sel when this element has no text
//   data-hide-if-list-empty         hide this element when it holds a collection list with no items
//   data-hide-if-no-link=".sel"     on a link: hide the closest ancestor matching .sel when the link
//                                   has no address (an empty CMS link field is published as href="#")
//   data-hide-if-no-image           hide this element, and a .line-h straight after it, when none of
//                                   its CMS images has a file (and no [data-video] inside has a link)
//
// Without JS everything is shown, so empty shapes can appear for an instant before this runs.

export default function hideEmpty() {
  const empty = (el) => !el.textContent.trim();
  // Inline display beats the display set by a class (flex, grid...), which [hidden] would not
  const hide = (el) => el.style.setProperty('display', 'none');

  document.querySelectorAll('[data-hide-empty]').forEach((el) => {
    if (empty(el)) hide(el);
  });

  document.querySelectorAll('[data-hide-empty-parent]').forEach((el) => {
    if (!empty(el)) return;
    const target = el.closest(el.getAttribute('data-hide-empty-parent'));
    if (target) hide(target);
  });

  document.querySelectorAll('[data-hide-if-list-empty]').forEach((el) => {
    if (!el.querySelector('.w-dyn-item')) hide(el);
  });

  document.querySelectorAll('[data-hide-if-no-link]').forEach((el) => {
    const href = (el.getAttribute('href') || '').trim();
    if (href && href !== '#') return;
    hide(el.closest(el.getAttribute('data-hide-if-no-link')) || el);
  });

  // An empty CMS image field is published as an <img> with the w-dyn-bind-empty class
  document.querySelectorAll('[data-hide-if-no-image]').forEach((el) => {
    const hasImage = el.querySelector('img:not(.w-dyn-bind-empty)')
      || [...el.querySelectorAll('[data-video]')].some((v) => !['', '#'].includes(v.getAttribute('data-video').trim()));
    if (hasImage) return;
    hide(el);
    const rule = el.nextElementSibling;
    if (rule?.classList.contains('line-h')) hide(rule);
  });
}
