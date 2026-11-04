// Starts a muted background video after the page has loaded, so its download doesn't compete
// with fonts, styles and scripts for first paint.
//
//   <video data-module="deferred-video" data-src="https://…/clip.mp4" muted loop playsinline autoplay>
//
// Optional, for a video encoded per screen size and codec (the homepage hero):
//   data-src-av1           AV1 version of data-src, used where the browser can play AV1
//   data-src-mobile        the phone version (screens up to 767px wide), H.264
//   data-src-mobile-av1    the phone version in AV1
//   data-poster            first frame, shown straight away until the video plays
//   data-poster-mobile     the phone version's first frame
// The size is chosen once, when the video starts. H.264 is the fallback everywhere, since every
// browser plays it; AV1 is about half the size where it's supported.
//
// Reduced motion: the video is never loaded (the cell keeps its poster, or its background colour).

const MOBILE = '(max-width: 767px)';
const AV1 = 'video/mp4; codecs="av01.0.08M.08"'; // main profile, level 4.0, 8-bit: what the hero files are

export default function (video) {
  const mobile = window.matchMedia(MOBILE).matches;
  const pick = (name) => (mobile && video.getAttribute(`${name}-mobile`)) || video.getAttribute(name);

  const poster = pick('data-poster');
  if (poster) video.poster = poster;

  const av1 = mobile ? video.getAttribute('data-src-mobile-av1') : video.getAttribute('data-src-av1');
  const src = (av1 && video.canPlayType(AV1) === 'probably' && av1) || pick('data-src');
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
