// The site's own consent banner (replaced Usercentrics on 7 Nov 2026). One optional category,
// analytics: Google Analytics and Microsoft Clarity, which only load after a yes.
//
//   [data-consent="banner"]    the banner (in the Footer component). Hidden by its class; this adds
//                              is-open to show it, on a first visit or when Privacy settings is used.
//   [data-consent="accept"]    yes to analytics (a .button link, role="button", same style as Reject:
//   [data-consent="reject"]    no to analytics    the ICO asks for equal prominence)
//   [data-consent="settings"]  any link or button that reopens the banner (footer, corner, cookie page)
//
// The choice is a first-party cookie, ps_consent = <version>.<1|0>.<consent id>.<unix seconds>, kept
// six months, then the banner asks again. The head snippet (snippets/consent-head.html) reads it before
// anything else runs and loads analytics on a yes; Accept calls the same loader (window.psAnalytics).
//
// Each choice is also logged, so consent can be shown if anyone asks: the consent id, yes or no, the
// policy version and the time (no IP, no name) go to log_site_consent in the dashboard's Supabase
// (London). That function deletes rows older than 12 months.
//
// Saying no after a yes: Consent Mode is set back to denied, Clarity is told to stop and clear its
// cookies (its documented consent call), and the Google Analytics and Clarity cookies are removed.

const VERSION = 'v1'; // must match snippets/consent-head.html; bump when the cookie policy changes what's asked
const COOKIE = 'ps_consent';
const MAX_AGE = 60 * 60 * 24 * 182; // six months
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function read() {
  const raw = (document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`)) || [])[1];
  if (!raw) return null;
  const [version, analytics, id] = raw.split('.');
  if (version !== VERSION || !id) return null;
  return { analytics: analytics === '1', id };
}

function newId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
}

function write(analytics, id) {
  const secure = location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${COOKIE}=${VERSION}.${analytics ? 1 : 0}.${id}.${Math.floor(Date.now() / 1000)}; path=/; max-age=${MAX_AGE}; samesite=lax${secure}`;
}

function log(analytics, id) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  fetch(`${SUPABASE_URL}/rest/v1/rpc/log_site_consent`, {
    method: 'POST',
    keepalive: true,
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_consent_id: id, p_analytics: analytics, p_version: VERSION }),
  }).catch(() => {});
}

// Google Analytics (_ga, _ga_<id>) and Clarity (_clck, _clsk) cookies, on this host and its parent domains
function clearAnalyticsCookies() {
  const names = document.cookie.split('; ').map((c) => c.split('=')[0]).filter((n) => /^(_ga|_gid|_gat|_cl[a-z]{2})/.test(n));
  const parts = location.hostname.split('.');
  const domains = [''];
  for (let i = 0; i < parts.length - 1; i += 1) domains.push(`; domain=.${parts.slice(i).join('.')}`);
  names.forEach((name) => domains.forEach((d) => { document.cookie = `${name}=; path=/; max-age=0${d}`; }));
  try { sessionStorage.removeItem('_cltk'); } catch (e) { /* storage blocked */ }
}

export default function consent() {
  const banner = document.querySelector('[data-consent="banner"]');
  if (!banner) return;
  let lastFocus = null;

  const open = (focus) => {
    banner.classList.add('is-open');
    if (focus) banner.querySelector('[data-consent="accept"], [data-consent="reject"]')?.focus();
  };
  const close = () => {
    banner.classList.remove('is-open');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  };

  const choose = (analytics) => {
    const id = read()?.id || newId();
    const before = read()?.analytics;
    write(analytics, id);
    log(analytics, id);
    if (analytics) {
      window.psAnalytics?.load();
    } else if (before || window.psAnalytics?.loaded()) {
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      window.clarity?.('consent', false);
      clearAnalyticsCookies();
    }
    close();
  };

  banner.addEventListener('click', (e) => {
    const action = e.target.closest('[data-consent]')?.getAttribute('data-consent');
    if (action !== 'accept' && action !== 'reject') return;
    e.preventDefault(); // the buttons are Webflow links (href="#") with role="button"
    choose(action === 'accept');
  });

  // role="button" links should answer Space as well as Enter
  banner.addEventListener('keydown', (e) => {
    if (e.key !== ' ' || !e.target.matches('[data-consent="accept"], [data-consent="reject"]')) return;
    e.preventDefault();
    e.target.click();
  });

  // Reopen from anywhere (footer link, corner button, cookie page). Without JS these fall through to
  // their href, the cookie policy.
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-consent="settings"]');
    if (!trigger) return;
    e.preventDefault();
    lastFocus = trigger;
    open(true);
  });

  // Escape closes a reopened banner, but only once a choice exists
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && banner.classList.contains('is-open') && read()) close();
  });

  if (!read()) open(false);
}
