// Silent loops over project images: the short loops on the homepage rows, Work cards and Imagery
// and motion tiles (the project's Thumbnail video field) and the longer film that replaces a
// case study's hero image (the Hero video fields).
//
//   <img data-thumb-video="https://…/loop.mp4">   on any image; empty means the image stays still
//
// Optional, for a video encoded per screen size and codec (the case study hero), the same
// variants the homepage hero's deferred-video takes:
//   data-thumb-video-av1           AV1 version, used where the browser can play AV1
//   data-thumb-video-mobile        the phone version (screens up to 767px wide), H.264
//   data-thumb-video-mobile-av1    the phone version in AV1
// The size is chosen once, when the page loads. H.264 is the fallback everywhere. A variant left
// empty (or "#", which is how Webflow publishes an empty link field) is skipped.
//
// The video goes straight after the image and takes the image's classes, so it fills the same
// frame (and, on the homepage, fades in with the row like the image does). It loads only once the
// image is near the screen, shows only once it's actually playing, and pauses off screen.
// Reduced motion or data saver: the still image only.

const REDUCED = '(prefers-reduced-motion: reduce)';
const MOBILE = '(max-width: 767px)';
const AV1 = 'video/mp4; codecs="av01.0.08M.08"'; // main profile, level 4.0, 8-bit: what our AV1 files are

const attr = (img, name) => {
  const value = (img.getAttribute(name) || '').trim();
  return value === '#' ? '' : value;
};

// The file for this screen: the phone version on a phone when there is one, AV1 where the browser
// can play it, H.264 otherwise
function pickSource(img) {
  const canAv1 = document.createElement('video').canPlayType(AV1) === 'probably';
  const variant = (suffix) => (canAv1 && attr(img, `data-thumb-video${suffix}-av1`)) || attr(img, `data-thumb-video${suffix}`);
  return (window.matchMedia(MOBILE).matches && variant('-mobile')) || variant('');
}

function attach(img) {
  const video = document.createElement('video');
  video.className = img.className;
  // Copied so a script that finds the image by its data hook (work-list's data-work="bg") finds this too
  [...img.attributes].forEach(({ name, value }) => {
    if (name.startsWith('data-') && !name.startsWith('data-thumb-video')) video.setAttribute(name, value);
  });
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  video.style.visibility = 'hidden'; // the image shows until the first frame plays
  video.addEventListener('playing', () => video.style.removeProperty('visibility'), { once: true });
  img.after(video);
  return video;
}

export default function thumbVideo() {
  const imgs = [...document.querySelectorAll('img[data-thumb-video]')].filter((img) => pickSource(img));
  if (!imgs.length || window.matchMedia(REDUCED).matches || navigator.connection?.saveData) return;

  const videos = new Map(imgs.map((img) => [attach(img), pickSource(img)]));
  const inView = new Set();

  // A homepage row's background only shows while the row is open (work-list adds is-open), so its
  // loop loads and plays only then; every other loop plays whenever it's near the screen
  const shown = (video) => inView.has(video) && (!video.matches('[data-work="bg"]') || video.classList.contains('is-open'));
  const update = (video) => {
    if (!shown(video)) {
      video.pause();
      return;
    }
    if (!video.src) video.src = videos.get(video);
    video.play().catch(() => {}); // autoplay can still be refused; the image stays
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) inView.add(target);
        else inView.delete(target);
        update(target);
      });
    },
    { rootMargin: '200px 0px' },
  );
  const classes = new MutationObserver((records) => records.forEach(({ target }) => update(target)));
  videos.forEach((_, video) => {
    observer.observe(video);
    if (video.matches('[data-work="bg"]')) classes.observe(video, { attributeFilter: ['class'] });
  });
}
