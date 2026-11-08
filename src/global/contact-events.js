// Records the ways someone gets in touch, in Google Analytics and Microsoft Clarity:
//
//   generate_lead   the enquiry form was sent (Webflow showed its success message)
//   email_click     a mailto: link was clicked
//   phone_click     a tel: link was clicked
//   email_copy      an email address was copied from the page
//   phone_copy      a phone number was copied from the page
//
// Mark the ones that count as an enquiry as key events in GA4 (Admin > Events). In Clarity the same
// names are custom events (clarity("event", …)), so recordings can be filtered to visits that got in touch.
//
// The enquiry form also gets two hidden fields, Clarity user and Clarity session, filled from Clarity's
// metadata callback, so each submission in Webflow says which recording it came from (search Clarity
// recordings by user ID). They are added here rather than in the Designer and fill on page load and
// again when someone starts filling in the form, in case analytics was accepted after the page loaded.
//
// Both tools only exist after a yes to analytics (snippets/consent-head.html). Without it gtag queues
// nothing that leaves the browser, window.clarity is undefined, and the hidden fields go blank.

const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/;
const PHONE = /(\+|\b0)[\d\s().-]{8,}\d/; // a UK or international number: starts 0 or +, at least ten digits-ish
const FIELDS = { user: 'Clarity user', session: 'Clarity session' };

function track(name, params = {}) {
  window.gtag?.('event', name, params);
  window.clarity?.('event', name);
}

// Hidden fields: Webflow's form handler sends every named input in the form, hidden ones included
function hiddenField(form, label) {
  let input = form.querySelector(`input[data-name="${label}"]`);
  if (!input) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = label;
    input.setAttribute('data-name', label);
    form.prepend(input);
  }
  return input;
}

function fillClarity(user, session) {
  if (!window.clarity || (user.value && session.value)) return;
  window.clarity('metadata', (meta) => {
    if (!meta) return;
    user.value = meta.userId || '';
    session.value = meta.sessionId || '';
  }, false);
}

function forms() {
  document.querySelectorAll('.w-form').forEach((block) => {
    const form = block.querySelector('form');
    const done = block.querySelector('.w-form-done');
    if (!form || form.hasAttribute('data-contact-ready')) return;
    form.setAttribute('data-contact-ready', '');

    const user = hiddenField(form, FIELDS.user);
    const session = hiddenField(form, FIELDS.session);
    fillClarity(user, session);
    form.addEventListener('focusin', () => fillClarity(user, session));

    // Webflow has no submit-success callback, so watch the .w-form-done block it reveals
    if (!done) return;
    let sent = false;
    new MutationObserver(() => {
      if (sent || getComputedStyle(done).display === 'none') return;
      sent = true;
      track('generate_lead', { form_name: form.getAttribute('data-name') || form.name || 'form' });
    }).observe(done, { attributes: true, attributeFilter: ['style', 'class'] });
  });
}

function links() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest?.('a[href^="mailto:"], a[href^="tel:"]');
    if (!link) return;
    const href = link.getAttribute('href');
    const email = href.startsWith('mailto:');
    track(email ? 'email_click' : 'phone_click', {
      [email ? 'email' : 'phone']: decodeURIComponent(href.replace(/^(mailto|tel):/, '').split('?')[0]),
    });
  });
}

function copies() {
  document.addEventListener('copy', (e) => {
    // A copy inside the form (someone pasting their own details around) isn't a contact
    if (e.target.closest?.('form')) return;
    const text = String(window.getSelection?.() || '');
    const email = text.match(EMAIL);
    if (email) {
      track('email_copy', { email: email[0] });
      return;
    }
    const phone = text.match(PHONE);
    if (phone && phone[0].replace(/\D/g, '').length >= 10) track('phone_copy', { phone: phone[0].trim() });
  });
}

export default function contactEvents() {
  forms();
  links();
  copies();
}
