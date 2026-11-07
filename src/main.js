import hideEmpty from './global/hide-empty.js';
import consent from './global/consent.js';
import enquiryEvent from './global/enquiry-event.js';
import themeToggle from './global/theme-toggle.js';
import thumbVideo from './global/thumb-video.js';
import marqueeEager from './global/marquee-eager.js';
import cursor from './global/cursor.js';
import headingIcon from './global/heading-icon.js';
import smoothScroll from './global/smooth-scroll.js';
import workList from './modules/work-list.js';
import lottieStagger from './modules/lottie-stagger.js';
import deferredVideo from './modules/deferred-video.js';
import mobileMenu from './modules/mobile-menu.js';
import dashboardLoop from './modules/dashboard-loop/index.js';
import workFilter from './modules/work-filter.js';
import filmLightbox from './modules/film-lightbox.js';
import caseGallery from './modules/case-gallery.js';
import caseVideo from './modules/case-video.js';
import caseMotion from './modules/case-motion.js';

// Site-wide behaviour that runs on every page (thumb-video before the modules, so work-list finds its loops)
const GLOBALS = [hideEmpty, consent, enquiryEvent, themeToggle, thumbVideo, marqueeEager, cursor, headingIcon, smoothScroll];

// Opt-in modules, mounted on [data-module="<name>"] roots
const MODULES = {
  'work-list': workList,
  'lottie-stagger': lottieStagger,
  'deferred-video': deferredVideo,
  'mobile-menu': mobileMenu,
  'dashboard-loop': dashboardLoop,
  'work-filter': workFilter,
  'film-lightbox': filmLightbox,
  'case-gallery': caseGallery,
  'case-video': caseVideo,
  'case-motion': caseMotion,
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
