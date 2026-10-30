// Brands the Usercentrics consent UI. It renders in an open shadow root and defines its colours
// there, so page CSS can't reach it: this attaches one stylesheet to that root instead. Colours come
// from the Webflow variables on :root (custom properties inherit into shadow DOM), so they follow
// the Designer. Accept and Deny share a style on purpose: equal prominence is what the ICO asks for.

const CSS = `
.cmp, .modal-wrapper, .privacyNotice {
  --color-main-primary: var(--colour--orange);
  --color-main-text: var(--colour--paper);
  --color-links-anchor: var(--colour--paper);
  --color-cmp-background: var(--colour--ink-900);
  --color-cmp-background-rgb: 17, 17, 19;
  --color-tabs-container-background: var(--colour--ink-900);
  --color-tabs-tab-active: var(--colour--paper);
  --color-tabs-tab-inactive: var(--colour--grey-500);
  --color-main-border: var(--line--hairline);
  --color-focus: var(--colour--orange);
  --color-cmp-scrollbar-thumb: var(--colour--grey-800);
  --color-buttons-accept-background: var(--colour--paper);
  --color-buttons-accept-text: var(--colour--ink-950);
  --color-buttons-deny-background: var(--colour--paper);
  --color-buttons-deny-text: var(--colour--ink-950);
  --color-buttons-ok-background: var(--colour--paper);
  --color-buttons-ok-text: var(--colour--ink-950);
  --color-buttons-save-background: transparent;
  --color-buttons-save-text: var(--colour--paper);
  --color-buttons-more-background: transparent;
  --color-buttons-more-text: var(--colour--paper);
  --color-toggle-background-active: var(--colour--orange);
  --color-toggle-handle-active: var(--colour--ink-950);
  --color-toggle-background-inactive: var(--colour--grey-800);
  --color-toggle-handle-inactive: var(--colour--paper);
  --color-toggle-background-disabled: var(--line--hairline);
  --color-toggle-handle-disabled: var(--colour--grey-500);
  --layout-border-radius: 0;
  --layout-border-color: var(--line--hairline);
  --element-buttons-border-radius: 0;
  --typography-font: Geist, Arial, sans-serif;
}

/* The UI asks for weight 700 and the site only loads up to 500: use 500, don't fake a bold */
* {
  font-synthesis: none;
}

#uc-main-dialog {
  border: 1px solid var(--line--hairline);
  border-radius: 0;
  box-shadow: none;
}

.privacy-title {
  font-size: 1.375rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.uc-toggle-container .text {
  font-family: 'Geist Mono', monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

button.accept, button.deny, button.ok, button.save, button.more {
  font-weight: 500;
  transition: background-color 300ms ease, border-color 300ms ease, color 300ms ease;
}

button.accept:hover, button.deny:hover, button.ok:hover {
  background-color: var(--colour--orange);
  color: var(--colour--paper);
}

button.save, button.more, #save {
  border: 1px solid var(--line--strong);
}

button.save:hover, button.more:hover, #save:hover {
  background-color: var(--colour--orange);
  border-color: var(--colour--orange);
  color: var(--colour--paper);
}

a.uc-button-link:hover, .poweredBy a:hover {
  color: var(--colour--orange);
}
`;

export default function consentSkin() {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(CSS);

  const apply = () => {
    const root = document.querySelector('#usercentrics-cmp-ui')?.shadowRoot;
    if (!root) return false;
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    return true;
  };

  if (apply()) return;
  const watch = new MutationObserver(() => {
    if (apply()) watch.disconnect();
  });
  watch.observe(document.documentElement, { childList: true, subtree: true });
}
