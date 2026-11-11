// Numbers that count up from zero as they come into view: any element with a count-up attribute
// whose text is a plain number ("50", "5.4"). Used on the Hello pages' stats, where the number is
// bound to the CMS, so the script reads whatever Webflow rendered and animates to it.
//
// The final number is measured first and its width kept (with tabular figures), so the "/100" or
// "MB" beside it doesn't shuffle along while it counts. Each number counts once, starting when half
// of it is on screen, a beat after the row's reveal begins. Under reduced motion, or with text that
// isn't a plain number, it's left exactly as Webflow rendered it.

const REDUCED = '(prefers-reduced-motion: reduce)';
const DURATION = 1400; // ms
const DELAY = 200; // ms, so the count starts as the reveal brings the number up
const NUMBER = /^\d+(?:\.(\d+))?$/;

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export default function countUp() {
  if (window.matchMedia(REDUCED).matches || typeof IntersectionObserver !== 'function') return;

  const items = [...document.querySelectorAll('[count-up]')].flatMap((el) => {
    const text = el.textContent.trim();
    const match = NUMBER.exec(text);
    if (!match) return [];
    const target = Number(text);
    const places = match[1] ? match[1].length : 0;
    // Keep the final width so nothing beside the number moves while it counts.
    el.style.fontVariantNumeric = 'tabular-nums';
    el.style.display = 'inline-block';
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    el.textContent = (0).toFixed(places);
    return [{ el, target, places }];
  });
  if (!items.length) return;

  const run = ({ el, target, places }) => {
    let start = 0;
    const tick = (now) => {
      start ||= now;
      const t = Math.min(1, (now - start) / DURATION);
      el.textContent = (target * easeOut(t)).toFixed(places);
      if (t < 1) requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), DELAY);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const item = items.find((i) => i.el === entry.target);
        if (item) run(item);
      });
    },
    { threshold: 0.5 },
  );
  items.forEach(({ el }) => observer.observe(el));
}
