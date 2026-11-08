// Copy buttons: any element with data-copy="<text>" copies that text to the clipboard when clicked.
// Used beside the email address, which is hard to select by hand under the custom cursor.
//
// Markup (built in the Designer, so it can be restyled there):
//   button.copy_button[data-copy="luke@pixelsilo.net"][aria-label="Copy email address"]
//     .copy_icon        the icon (HTML embed, currentColor)
//     span.copy_tip     the tooltip, "Copy to clipboard"; hidden until .is-visible is added
//
// The script adds .is-visible to .copy_tip on hover and keyboard focus, and swaps its text to
// "Copied" for a moment after a click. A copied email address is recorded as email_copy, like a
// copy by hand (see contact-events.js).

import { track } from './contact-events.js';

const EMAIL = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/;
const COPIED = 'Copied';
const RESET_MS = 1800;

async function write(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // Older browsers, or a page without clipboard permission: the textarea fallback
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {}
    area.remove();
    return ok;
  }
}

function setup(button) {
  if (button.hasAttribute('data-copy-ready')) return;
  button.setAttribute('data-copy-ready', '');
  if (button.tagName === 'BUTTON' && !button.hasAttribute('type')) button.type = 'button';

  const tip = button.querySelector('.copy_tip');
  const label = tip?.textContent.trim() || '';
  let timer = 0;
  let hovered = false;
  let focused = false;

  const show = (on) => tip?.classList.toggle('is-visible', on);
  const sync = () => show(hovered || focused || !!timer);

  button.addEventListener('pointerenter', () => { hovered = true; sync(); });
  button.addEventListener('pointerleave', () => { hovered = false; sync(); });
  button.addEventListener('focus', () => { focused = button.matches(':focus-visible'); sync(); });
  button.addEventListener('blur', () => { focused = false; sync(); });

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    const text = button.getAttribute('data-copy');
    if (!text || !(await write(text))) return;
    if (EMAIL.test(text)) track('email_copy', { email: text, method: 'button' });
    if (tip) tip.textContent = COPIED;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = 0;
      if (tip) tip.textContent = label;
      sync();
    }, RESET_MS);
    sync();
  });
}

export default function copyButton() {
  document.querySelectorAll('[data-copy]').forEach(setup);
}
