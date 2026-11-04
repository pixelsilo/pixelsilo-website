// The sparkle in a heading (.heading_icon, e.g. before "AI powered dashboard.") pops in with the
// heading's letters. Webflow's Reveal · chars interaction splits the heading into letters and
// fades each one in, but the icon isn't a letter, so it sat there fully drawn while the words
// built up around it. This holds the icon back (is-armed) and pops it (is-in) the moment the
// letter straight after it starts to appear, so it always keeps time with the interaction, whatever
// its timings. How the pop looks is in the code_css embed (Heading icon).
//
// Webflow's GSAP writes each split letter's opacity inline, starting at 0, so the first letter
// after the icon is watched only while the icon is on screen, and only until it pops.
// Reduced motion, a heading that isn't split, or a letter that never starts: the icon just shows.

const REDUCED = '(prefers-reduced-motion: reduce)';
const GIVE_UP = 4000; // ms on screen before the icon shows anyway

// The first split letter after the icon (the A of "AI"), found each time as the split may come late
function nextLetter(icon) {
  for (let el = icon.nextElementSibling; el; el = el.nextElementSibling) {
    const letter = el.matches('.gsap_split_letter') ? el : el.querySelector('.gsap_split_letter');
    if (letter) return letter;
  }
  return null;
}

export default function headingIcon() {
  if (window.matchMedia(REDUCED).matches || typeof IntersectionObserver !== 'function') return;

  document.querySelectorAll('.heading_icon').forEach((icon) => {
    icon.classList.add('is-armed');
    let frame = 0;
    let since = 0;

    const pop = () => {
      icon.classList.add('is-in');
      cancelAnimationFrame(frame);
      observer.disconnect();
    };

    const watch = (now) => {
      since ||= now;
      const letter = nextLetter(icon);
      const opacity = letter ? parseFloat(letter.style.opacity) : NaN;
      // Not split (no letter) or never hidden (no inline opacity): nothing to wait for
      if (!letter || Number.isNaN(opacity) || opacity > 0.05 || now - since > GIVE_UP) {
        pop();
        return;
      }
      frame = requestAnimationFrame(watch);
    };

    // The bottom margin roughly matches where the interaction starts (the heading 85% down the
    // screen), so the give-up clock doesn't run while the icon is only just peeking in
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      since = 0;
      if (entry.isIntersecting) frame = requestAnimationFrame(watch);
    }, { rootMargin: '0px 0px -15% 0px' });
    observer.observe(icon);
  });
}
