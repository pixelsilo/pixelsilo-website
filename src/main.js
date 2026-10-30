import hideEmpty from './global/hide-empty.js';
import consentSettings from './global/consent-settings.js';
import consentSkin from './global/consent-skin.js';
import workList from './modules/work-list.js';
import lottieStagger from './modules/lottie-stagger.js';
import deferredVideo from './modules/deferred-video.js';
import mobileMenu from './modules/mobile-menu.js';

// Site-wide behaviour that runs on every page
const GLOBALS = [hideEmpty, consentSettings, consentSkin];

// Opt-in modules, mounted on [data-module="<name>"] roots
const MODULES = {
  'work-list': workList,
  'lottie-stagger': lottieStagger,
  'deferred-video': deferredVideo,
  'mobile-menu': mobileMenu,
};

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
