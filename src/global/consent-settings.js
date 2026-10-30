// Opens the Usercentrics privacy settings (second layer) from any link or button, so the footer
// needs no inline `javascript:` href. The CMP itself loads from Site settings > Custom code > Head.
//
//   data-consent="settings"   on a link or button: opens the privacy settings
//
// If the CMP hasn't loaded (blocked, offline), the link falls through to its href, so point the
// href at the cookie policy.

export default function consentSettings() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-consent="settings"]');
    if (!trigger || !window.UC_UI?.showSecondLayer) return;
    e.preventDefault();
    window.UC_UI.showSecondLayer();
  });
}
