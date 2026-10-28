import hideEmpty from './global/hide-empty.js';

// Site-wide behaviour that runs on every page
const GLOBALS = [hideEmpty];

// Opt-in modules, mounted on [data-module="<name>"] roots
const MODULES = {};

function boot() {
  GLOBALS.forEach((init) => {
    try {
      init();
    } catch (err) {
      console.error('[site] global failed:', err);
    }
  });

  document.querySelectorAll('[data-module]').forEach((root) => {
    if (root.hasAttribute('data-ready')) return; // guard double init
    const init = MODULES[root.getAttribute('data-module')];
    if (!init) return;
    try {
      init(root);
      root.setAttribute('data-ready', '');
    } catch (err) {
      console.error('[site] module failed:', root.getAttribute('data-module'), err);
    }
  });
}

// Injected scripts load async, so wait for Webflow's own JS and the DOM
window.Webflow ||= [];
window.Webflow.push(() => {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
});
