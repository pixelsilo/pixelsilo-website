// Starts a muted background video after the page has loaded, so its download doesn't compete
// with fonts, styles and scripts for first paint.
//
//   <video data-module="deferred-video" data-src="https://…/clip.mp4" muted loop playsinline autoplay>
//
// Reduced motion: the video is never loaded (the cell keeps its background colour).

export default function (video) {
  const src = video.getAttribute('data-src');
  if (!src || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const attach = () => {
    video.muted = true; // the attribute alone isn't always honoured once src changes
    video.src = src;
    video.play().catch(() => {}); // autoplay can still be refused (e.g. data saver); the cell stays blank
  };

  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  if (document.readyState === 'complete') idle(attach);
  else window.addEventListener('load', () => idle(attach), { once: true });
}
