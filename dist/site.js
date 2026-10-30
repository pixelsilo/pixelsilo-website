(function(){"use strict";var h;function f(){const o=e=>!e.textContent.trim(),n=e=>e.style.setProperty("display","none");document.querySelectorAll("[data-hide-empty]").forEach(e=>{o(e)&&n(e)}),document.querySelectorAll("[data-hide-empty-parent]").forEach(e=>{if(!o(e))return;const c=e.closest(e.getAttribute("data-hide-empty-parent"));c&&n(c)}),document.querySelectorAll("[data-hide-if-list-empty]").forEach(e=>{e.querySelector(".w-dyn-item")||n(e)})}function b(){document.addEventListener("click",o=>{var e;!o.target.closest('[data-consent="settings"]')||!((e=window.UC_UI)!=null&&e.showSecondLayer)||(o.preventDefault(),window.UC_UI.showSecondLayer())})}const y=`
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
`;function v(){const o=new CSSStyleSheet;o.replaceSync(y);const n=()=>{var d;const c=(d=document.querySelector("#usercentrics-cmp-ui"))==null?void 0:d.shadowRoot;return c?(c.adoptedStyleSheets=[...c.adoptedStyleSheets,o],!0):!1};if(n())return;const e=new MutationObserver(()=>{n()&&e.disconnect()});e.observe(document.documentElement,{childList:!0,subtree:!0})}const w="ps-theme",u="theme-light",S="(prefers-reduced-motion: reduce)";function k(){const o=document.documentElement,n=document.querySelectorAll('[data-theme="toggle"]');if(!n.length)return;const e=()=>{const i=`Switch to ${o.classList.contains(u)?"dark":"light"} mode`;n.forEach(l=>{l.setAttribute("aria-label",i),l.setAttribute("title",i)})},c=i=>{o.classList.toggle(u,i),e()},d=()=>{const i=!o.classList.contains(u);try{localStorage.setItem(w,i?"light":"dark")}catch{}document.startViewTransition&&!window.matchMedia(S).matches?document.startViewTransition(()=>c(i)):c(i)};n.forEach(i=>i.addEventListener("click",d)),e()}const E=500,A="cubic-bezier(0.2, 0.7, 0.2, 1)";function L(o){const n=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e=[...o.querySelectorAll('[data-work="item"]')].map((r,t)=>{var s;const a={el:r,toggle:r.querySelector('[data-work="toggle"]'),panel:r.querySelector('[data-work="panel"]'),icon:r.querySelector('[data-work="icon"]'),num:r.querySelector('[data-work="num"]')};return(s=a.panel).id||(s.id=`work-panel-${t+1}`),a.toggle.setAttribute("aria-controls",a.panel.id),a}),c=r=>r.panel.classList.contains("is-open");function d(r,t,a){n||r.animate([{height:`${t}px`},{height:`${a}px`}],{duration:E,easing:A})}function i(r,t){if(t===c(r))return;const a=r.panel.offsetHeight;[r.panel,r.icon,r.num].forEach(s=>s==null?void 0:s.classList.toggle("is-open",t)),r.icon&&(r.icon.textContent=t?"−":"+"),r.toggle.setAttribute("aria-expanded",String(t)),d(r.panel,a,r.panel.offsetHeight)}function l(r){const t=!c(r);e.forEach(a=>i(a,t&&a===r))}e.forEach(r=>{r.toggle.addEventListener("click",()=>l(r)),r.toggle.addEventListener("keydown",t=>{t.key!=="Enter"&&t.key!==" "||(t.preventDefault(),l(r))})})}const x="https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie_light.min.js",q=(((h=document.currentScript)==null?void 0:h.src)||"").replace(/[^/]*$/,"")+"lottie/",M=200;let p,g=0;function O(){return p||(p=new Promise((o,n)=>{if(window.lottie)return o(window.lottie);const e=document.createElement("script");e.src=x,e.onload=()=>o(window.lottie),e.onerror=n,document.head.appendChild(e)})),p}function I(o){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const n=Number(o.getAttribute("data-lottie-stagger"))||M,e=[...o.querySelectorAll("[data-lottie]")],c=new IntersectionObserver(i=>{i.some(l=>l.isIntersecting)&&(c.disconnect(),d())},{rootMargin:"100% 0px"});c.observe(o);const d=()=>O().then(i=>{const l=new Map;e.forEach(t=>{const a=i.loadAnimation({container:t,renderer:"svg",loop:!1,autoplay:!1,path:`${q}${t.getAttribute("data-lottie")}.json`});a.addEventListener("DOMLoaded",()=>{t.querySelectorAll("img").forEach(s=>s.style.display="none"),t.querySelector("svg").style.display="block",t.setAttribute("data-lottie-ready",""),r.observe(t)}),l.set(t,a)});const r=new IntersectionObserver(t=>{t.filter(a=>a.isIntersecting).sort((a,s)=>e.indexOf(a.target)-e.indexOf(s.target)).forEach(({target:a})=>{r.unobserve(a);const s=performance.now();g=Math.max(s,g+n),setTimeout(()=>l.get(a).play(),g-s)})},{threshold:.4})}).catch(i=>console.error("[site] lottie player failed to load:",i))}function T(o){const n=o.getAttribute("data-src");if(!n||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const e=()=>{o.muted=!0,o.src=n,o.play().catch(()=>{})},c=window.requestIdleCallback||(d=>setTimeout(d,200));document.readyState==="complete"?c(e):window.addEventListener("load",()=>c(e),{once:!0})}const C=70,D=150,G="(min-width: 992px)";function U(o){const n=o.querySelector('[data-menu="toggle"]'),e=o.querySelector('[data-menu="panel"]'),c=o.querySelectorAll("[data-menu]"),d=o.querySelectorAll('[data-menu="reveal"]'),i=document.querySelectorAll("main, footer");window.matchMedia("(prefers-reduced-motion: reduce)").matches&&c.forEach(t=>t.style.setProperty("transition","none"));const l=()=>e.classList.contains("is-open");function r(t){c.forEach(a=>a.classList.toggle("is-open",t)),d.forEach((a,s)=>{a.style.transitionDelay=t?`${D+s*C}ms`:""}),n.setAttribute("aria-expanded",String(t)),n.setAttribute("aria-label",t?"Close menu":"Open menu"),document.documentElement.style.overflow=t?"hidden":"",i.forEach(a=>{a.inert=t})}n.addEventListener("click",()=>r(!l())),e.addEventListener("click",t=>{t.target.closest("a")&&r(!1)}),document.addEventListener("keydown",t=>{t.key!=="Escape"||!l()||(r(!1),n.focus())}),window.matchMedia(G).addEventListener("change",t=>{t.matches&&r(!1)}),window.addEventListener("pageshow",t=>{t.persisted&&r(!1)})}const $=[f,b,v,k],P={"work-list":L,"lottie-stagger":I,"deferred-video":T,"mobile-menu":U};function m(){$.forEach(o=>{try{o()}catch(n){console.error("[site] global failed:",n)}}),document.querySelectorAll("[data-module]").forEach(o=>{if(o.hasAttribute("data-ready"))return;const n=P[o.getAttribute("data-module")];if(n)try{n(o),o.setAttribute("data-ready","")}catch(e){console.error("[site] module failed:",o.getAttribute("data-module"),e)}})}window.Webflow||(window.Webflow=[]),window.Webflow.push(()=>{document.readyState==="loading"?document.addEventListener("DOMContentLoaded",m):m()})})();
