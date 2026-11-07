// Tells Google Analytics when an enquiry is sent: a generate_lead event (mark it as a key event in
// GA4) once Webflow shows the form's success message. Webflow has no submit-success callback, so this
// watches the .w-form-done block it reveals.
//
// gtag queues the event in dataLayer either way; it only reaches Google if the visitor has said yes
// to analytics (the head snippet loads the tag only then).

export default function enquiryEvent() {
  document.querySelectorAll('.w-form').forEach((block) => {
    const form = block.querySelector('form');
    const done = block.querySelector('.w-form-done');
    if (!form || !done) return;
    let sent = false;
    new MutationObserver(() => {
      if (sent || getComputedStyle(done).display === 'none') return;
      sent = true;
      window.gtag?.('event', 'generate_lead', { form_name: form.getAttribute('data-name') || form.name || 'form' });
    }).observe(done, { attributes: true, attributeFilter: ['style', 'class'] });
  });
}
