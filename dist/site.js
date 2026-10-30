(function(){"use strict";var f;function m(){const r=t=>!t.textContent.trim(),a=t=>t.style.setProperty("display","none");document.querySelectorAll("[data-hide-empty]").forEach(t=>{r(t)&&a(t)}),document.querySelectorAll("[data-hide-empty-parent]").forEach(t=>{if(!r(t))return;const c=t.closest(t.getAttribute("data-hide-empty-parent"));c&&a(c)}),document.querySelectorAll("[data-hide-if-list-empty]").forEach(t=>{t.querySelector(".w-dyn-item")||a(t)})}function b(){document.addEventListener("click",r=>{var t;!r.target.closest('[data-consent="settings"]')||!((t=window.UC_UI)!=null&&t.showSecondLayer)||(r.preventDefault(),window.UC_UI.showSecondLayer())})}const h=`
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
`;function y(){const r=new CSSStyleSheet;r.replaceSync(h);const a=()=>{var s;const c=(s=document.querySelector("#usercentrics-cmp-ui"))==null?void 0:s.shadowRoot;return c?(c.adoptedStyleSheets=[...c.adoptedStyleSheets,r],!0):!1};if(a())return;const t=new MutationObserver(()=>{a()&&t.disconnect()});t.observe(document.documentElement,{childList:!0,subtree:!0})}const v=500,w="cubic-bezier(0.2, 0.7, 0.2, 1)";function S(r){const a=window.matchMedia("(prefers-reduced-motion: reduce)").matches,t=[...r.querySelectorAll('[data-work="item"]')].map((o,e)=>{var i;const n={el:o,toggle:o.querySelector('[data-work="toggle"]'),panel:o.querySelector('[data-work="panel"]'),icon:o.querySelector('[data-work="icon"]'),num:o.querySelector('[data-work="num"]')};return(i=n.panel).id||(i.id=`work-panel-${e+1}`),n.toggle.setAttribute("aria-controls",n.panel.id),n}),c=o=>o.panel.classList.contains("is-open");function s(o,e,n){a||o.animate([{height:`${e}px`},{height:`${n}px`}],{duration:v,easing:w})}function d(o,e){if(e===c(o))return;const n=o.panel.offsetHeight;[o.panel,o.icon,o.num].forEach(i=>i==null?void 0:i.classList.toggle("is-open",e)),o.icon&&(o.icon.textContent=e?"−":"+"),o.toggle.setAttribute("aria-expanded",String(e)),s(o.panel,n,o.panel.offsetHeight)}function l(o){const e=!c(o);t.forEach(n=>d(n,e&&n===o))}t.forEach(o=>{o.toggle.addEventListener("click",()=>l(o)),o.toggle.addEventListener("keydown",e=>{e.key!=="Enter"&&e.key!==" "||(e.preventDefault(),l(o))})})}const k="https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie_light.min.js",E=(((f=document.currentScript)==null?void 0:f.src)||"").replace(/[^/]*$/,"")+"lottie/",A=200;let p,u=0;function L(){return p||(p=new Promise((r,a)=>{if(window.lottie)return r(window.lottie);const t=document.createElement("script");t.src=k,t.onload=()=>r(window.lottie),t.onerror=a,document.head.appendChild(t)})),p}function x(r){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const a=Number(r.getAttribute("data-lottie-stagger"))||A,t=[...r.querySelectorAll("[data-lottie]")],c=new IntersectionObserver(d=>{d.some(l=>l.isIntersecting)&&(c.disconnect(),s())},{rootMargin:"100% 0px"});c.observe(r);const s=()=>L().then(d=>{const l=new Map;t.forEach(e=>{const n=d.loadAnimation({container:e,renderer:"svg",loop:!1,autoplay:!1,path:`${E}${e.getAttribute("data-lottie")}.json`});n.addEventListener("DOMLoaded",()=>{e.querySelectorAll("img").forEach(i=>i.style.display="none"),e.querySelector("svg").style.display="block",e.setAttribute("data-lottie-ready",""),o.observe(e)}),l.set(e,n)});const o=new IntersectionObserver(e=>{e.filter(n=>n.isIntersecting).sort((n,i)=>t.indexOf(n.target)-t.indexOf(i.target)).forEach(({target:n})=>{o.unobserve(n);const i=performance.now();u=Math.max(i,u+a),setTimeout(()=>l.get(n).play(),u-i)})},{threshold:.4})}).catch(d=>console.error("[site] lottie player failed to load:",d))}function q(r){const a=r.getAttribute("data-src");if(!a||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const t=()=>{r.muted=!0,r.src=a,r.play().catch(()=>{})},c=window.requestIdleCallback||(s=>setTimeout(s,200));document.readyState==="complete"?c(t):window.addEventListener("load",()=>c(t),{once:!0})}const M=70,O=150,I="(min-width: 992px)";function C(r){const a=r.querySelector('[data-menu="toggle"]'),t=r.querySelector('[data-menu="panel"]'),c=r.querySelectorAll("[data-menu]"),s=r.querySelectorAll('[data-menu="reveal"]'),d=document.querySelectorAll("main, footer");window.matchMedia("(prefers-reduced-motion: reduce)").matches&&c.forEach(e=>e.style.setProperty("transition","none"));const l=()=>t.classList.contains("is-open");function o(e){c.forEach(n=>n.classList.toggle("is-open",e)),s.forEach((n,i)=>{n.style.transitionDelay=e?`${O+i*M}ms`:""}),a.setAttribute("aria-expanded",String(e)),a.setAttribute("aria-label",e?"Close menu":"Open menu"),document.documentElement.style.overflow=e?"hidden":"",d.forEach(n=>{n.inert=e})}a.addEventListener("click",()=>o(!l())),t.addEventListener("click",e=>{e.target.closest("a")&&o(!1)}),document.addEventListener("keydown",e=>{e.key!=="Escape"||!l()||(o(!1),a.focus())}),window.matchMedia(I).addEventListener("change",e=>{e.matches&&o(!1)}),window.addEventListener("pageshow",e=>{e.persisted&&o(!1)})}const D=[m,b,y],G={"work-list":S,"lottie-stagger":x,"deferred-video":q,"mobile-menu":C};function g(){D.forEach(r=>{try{r()}catch(a){console.error("[site] global failed:",a)}}),document.querySelectorAll("[data-module]").forEach(r=>{if(r.hasAttribute("data-ready"))return;const a=G[r.getAttribute("data-module")];if(a)try{a(r),r.setAttribute("data-ready","")}catch(t){console.error("[site] module failed:",r.getAttribute("data-module"),t)}})}window.Webflow||(window.Webflow=[]),window.Webflow.push(()=>{document.readyState==="loading"?document.addEventListener("DOMContentLoaded",g):g()})})();
