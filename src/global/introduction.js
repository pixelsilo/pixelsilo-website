// Introduction links (docs/referral-scheme.md): /contact?ref=<code>&from=<name>
//
//   ref   the code the dashboard matches to a client or introducer (lowercase, digits, hyphens, 3-32)
//   from  who sent them, as it should read on the page ("Regenta", "Smith PR"). Optional: links made
//         before 10 Nov 2026 only have ref, and the page then says "Someone".
//
// With a valid code the page:
//   - shows [data-intro="strip"] (adds .is-visible), with {name} in its text replaced by the name
//   - adds a subject to every mailto: link, so the email says who introduced them
//   - points the WhatsApp links (/whatsapp) at /whatsapp/<message>, a Webflow redirect to wa.me with
//     the message pre-filled (Site settings > Publishing > 301 redirects: /whatsapp/(.*) to
//     https://wa.me/<number>?text=%1), so the number still never appears in the page or this code
// The enquiry form's hidden Referred by field is filled in contact-events.js.
//
// Read from the URL only, never stored, so no consent is needed. The name is only ever set as text.

const REF = /^[a-z0-9-]{3,32}$/;
const NAME_MAX = 60;
const FALLBACK = 'Someone';

export function readIntro() {
  const q = new URLSearchParams(location.search);
  const code = (q.get('ref') || '').trim().toLowerCase();
  if (!REF.test(code)) return null;
  const name = (q.get('from') || '')
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX)
    .trim();
  return { code, name };
}

function fillName(root, name) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeValue.includes('{name}')) node.nodeValue = node.nodeValue.split('{name}').join(name);
  }
}

function withSubject(href, subject) {
  const [address, query = ''] = href.split('?');
  const params = new URLSearchParams(query);
  params.set('subject', subject);
  // URLSearchParams encodes spaces as +, which mail apps show literally
  return `${address}?${params.toString().replace(/\+/g, '%20')}`;
}

export default function introduction() {
  const intro = readIntro();
  if (!intro) return;
  const name = intro.name || FALLBACK;

  document.querySelectorAll('[data-intro="strip"]').forEach((strip) => {
    fillName(strip, name);
    strip.classList.add('is-visible');
  });

  const subject = intro.name ? `Introduced by ${intro.name}` : `Introduction (${intro.code})`;
  document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    a.setAttribute('href', withSubject(a.getAttribute('href'), subject));
  });

  const message = intro.name
    ? `Hi, ${intro.name} introduced me to PIXEL SILO. `
    : `Hi, I was introduced to PIXEL SILO (${intro.code}). `;
  document.querySelectorAll('a[href="/whatsapp"]').forEach((a) => {
    a.setAttribute('href', `/whatsapp/${encodeURIComponent(message)}`);
  });
}
