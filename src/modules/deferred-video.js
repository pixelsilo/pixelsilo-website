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
// AV1 is only used where the device decodes it in hardware (MediaCapabilities says smooth and
// power efficient). canPlayType alone isn't enough: Safari on iPhones without an AV1 decoder, and
// simulated iPhones, answer "probably" and then show nothing (found 17 Nov 2026 on a test iPhone).
// If the AV1 file still errors, or hasn't started playing a few seconds after loading, the video
// switches to the H.264 file.
//
// Reduced motion: the video is never loaded (the cell keeps its poster, or its background colour).

const MOBILE = '(max-width: 767px)';
const AV1 = 'video/mp4; codecs="av01.0.08M.08"'; // main profile, level 4.0, 8-bit: what the hero files are
const AV1_GRACE = 4000; // ms an AV1 file gets to start playing before falling back to H.264

/** True only where AV1 plays smoothly in hardware. Never throws; anything unknown means no. */
async function hardwareAv1(mobile) {
  if (av1CanPlay() !== 'probably' || !navigator.mediaCapabilities?.decodingInfo) return false;
  try {
    const info = await navigator.mediaCapabilities.decodingInfo({
      type: 'file',
      video: { contentType: AV1, width: mobile ? 1080 : 1920, height: mobile ? 1350 : 1080, bitrate: 3000000, framerate: 30 },
    });
    return Boolean(info.supported && info.smooth && info.powerEfficient);
  } catch {
    return false;
  }
}
function av1CanPlay() {
  try {
    return document.createElement('video').canPlayType(AV1);
  } catch {
    return '';
  }
}

export default function (video) {
  const mobile = window.matchMedia(MOBILE).matches;
  const pick = (name) => (mobile && video.getAttribute(`${name}-mobile`)) || video.getAttribute(name);

  const poster = pick('data-poster');
  if (poster) video.poster = poster;

  const h264 = pick('data-src');
  const av1 = mobile ? video.getAttribute('data-src-mobile-av1') : video.getAttribute('data-src-av1');
  if (!(h264 || av1) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const play = (src) => {
    video.muted = true; // the attribute alone isn't always honoured once src changes
    video.src = src;
    video.play().catch(() => {}); // autoplay can still be refused (e.g. Low Power Mode); the poster stays
  };

  const attach = async () => {
    const useAv1 = Boolean(av1 && h264) && (await hardwareAv1(mobile));
    if (!useAv1) return play(h264 || av1);
    let fellBack = false;
    const fallBack = () => {
      if (fellBack || !video.paused) return;
      fellBack = true;
      play(h264);
    };
    video.addEventListener('error', fallBack, { once: true });
    play(av1);
    setTimeout(() => {
      // Still not playing, with no frame decoded: AV1 isn't working here.
      if (video.paused && video.readyState < 2) fallBack();
    }, AV1_GRACE);
  };

  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  if (document.readyState === 'complete') idle(attach);
  else window.addEventListener('load', () => idle(attach), { once: true });
}
