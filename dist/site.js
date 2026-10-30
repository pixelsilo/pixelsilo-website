(function(){"use strict";var b;function f(){const o=e=>!e.textContent.trim(),n=e=>e.style.setProperty("display","none");document.querySelectorAll("[data-hide-empty]").forEach(e=>{o(e)&&n(e)}),document.querySelectorAll("[data-hide-empty-parent]").forEach(e=>{if(!o(e))return;const c=e.closest(e.getAttribute("data-hide-empty-parent"));c&&n(c)}),document.querySelectorAll("[data-hide-if-list-empty]").forEach(e=>{e.querySelector(".w-dyn-item")||n(e)})}function m(){document.addEventListener("click",o=>{var e;!o.target.closest('[data-consent="settings"]')||!((e=window.UC_UI)!=null&&e.showSecondLayer)||(o.preventDefault(),window.UC_UI.showSecondLayer())})}const h=`
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
`;function v(){const o=new CSSStyleSheet;o.replaceSync(h);const n=()=>{var l;const c=(l=document.querySelector("#usercentrics-cmp-ui"))==null?void 0:l.shadowRoot;return c?(c.adoptedStyleSheets=[...c.adoptedStyleSheets,o],!0):!1};if(n())return;const e=new MutationObserver(()=>{n()&&e.disconnect()});e.observe(document.documentElement,{childList:!0,subtree:!0})}const y=500,w="cubic-bezier(0.2, 0.7, 0.2, 1)";function k(o){const n=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e=[...o.querySelectorAll('[data-work="item"]')].map((t,r)=>{var i;const a={el:t,toggle:t.querySelector('[data-work="toggle"]'),panel:t.querySelector('[data-work="panel"]'),icon:t.querySelector('[data-work="icon"]'),num:t.querySelector('[data-work="num"]')};return(i=a.panel).id||(i.id=`work-panel-${r+1}`),a.toggle.setAttribute("aria-controls",a.panel.id),a}),c=t=>t.panel.classList.contains("is-open");function l(t,r,a){n||t.animate([{height:`${r}px`},{height:`${a}px`}],{duration:y,easing:w})}function s(t,r){if(r===c(t))return;const a=t.panel.offsetHeight;[t.panel,t.icon,t.num].forEach(i=>i==null?void 0:i.classList.toggle("is-open",r)),t.icon&&(t.icon.textContent=r?"−":"+"),t.toggle.setAttribute("aria-expanded",String(r)),l(t.panel,a,t.panel.offsetHeight)}function u(t){const r=!c(t);e.forEach(a=>s(a,r&&a===t))}e.forEach(t=>{t.toggle.addEventListener("click",()=>u(t)),t.toggle.addEventListener("keydown",r=>{r.key!=="Enter"&&r.key!==" "||(r.preventDefault(),u(t))})})}const S="https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie_light.min.js",A=(((b=document.currentScript)==null?void 0:b.src)||"").replace(/[^/]*$/,"")+"lottie/",E=200;let p,d=0;function x(){return p||(p=new Promise((o,n)=>{if(window.lottie)return o(window.lottie);const e=document.createElement("script");e.src=S,e.onload=()=>o(window.lottie),e.onerror=n,document.head.appendChild(e)})),p}function L(o){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const n=Number(o.getAttribute("data-lottie-stagger"))||E,e=[...o.querySelectorAll("[data-lottie]")],c=new IntersectionObserver(s=>{s.some(u=>u.isIntersecting)&&(c.disconnect(),l())},{rootMargin:"100% 0px"});c.observe(o);const l=()=>x().then(s=>{const u=new Map;e.forEach(r=>{const a=s.loadAnimation({container:r,renderer:"svg",loop:!1,autoplay:!1,path:`${A}${r.getAttribute("data-lottie")}.json`});a.addEventListener("DOMLoaded",()=>{r.querySelectorAll("img").forEach(i=>i.style.display="none"),r.querySelector("svg").style.display="block",r.setAttribute("data-lottie-ready",""),t.observe(r)}),u.set(r,a)});const t=new IntersectionObserver(r=>{r.filter(a=>a.isIntersecting).sort((a,i)=>e.indexOf(a.target)-e.indexOf(i.target)).forEach(({target:a})=>{t.unobserve(a);const i=performance.now();d=Math.max(i,d+n),setTimeout(()=>u.get(a).play(),d-i)})},{threshold:.4})}).catch(s=>console.error("[site] lottie player failed to load:",s))}function q(o){const n=o.getAttribute("data-src");if(!n||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const e=()=>{o.muted=!0,o.src=n,o.play().catch(()=>{})},c=window.requestIdleCallback||(l=>setTimeout(l,200));document.readyState==="complete"?c(e):window.addEventListener("load",()=>c(e),{once:!0})}const M=[f,m,v],O={"work-list":k,"lottie-stagger":L,"deferred-video":q};function g(){M.forEach(o=>{try{o()}catch(n){console.error("[site] global failed:",n)}}),document.querySelectorAll("[data-module]").forEach(o=>{if(o.hasAttribute("data-ready"))return;const n=O[o.getAttribute("data-module")];if(n)try{n(o),o.setAttribute("data-ready","")}catch(e){console.error("[site] module failed:",o.getAttribute("data-module"),e)}})}window.Webflow||(window.Webflow=[]),window.Webflow.push(()=>{document.readyState==="loading"?document.addEventListener("DOMContentLoaded",g):g()})})();
