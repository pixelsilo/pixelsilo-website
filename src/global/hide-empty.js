// Hides CMS-bound pieces that have no value, on the live site only. The Designer does not run
// site scripts, so there everything stays visible and editable.
//
//   data-hide-empty                 hide this element when it has no text
//   data-hide-empty-parent=".sel"   hide the closest ancestor matching .sel when this element has no text
//   data-hide-if-list-empty         hide this element when it holds a collection list with no items
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
}
