// Short silent loops over project images (the homepage rows, Work cards and Imagery and motion
// tiles), from the project's Thumbnail video field.
//
//   <img data-thumb-video="https://…/loop.mp4">   on any image; empty means the image stays still
//
// The video goes straight after the image and takes the image's classes, so it fills the same
// frame (and, on the homepage, fades in with the row like the image does). It loads only once the
// image is near the screen, shows only once it's actually playing, and pauses off screen.
// Reduced motion or data saver: the still image only.

const REDUCED = '(prefers-reduced-motion: reduce)';

function attach(img) {
  const video = document.createElement('video');
  video.className = img.className;
  // Copied so a script that finds the image by its data hook (work-list's data-work="bg") finds this too
  [...img.attributes].forEach(({ name, value }) => {
    if (name.startsWith('data-') && name !== 'data-thumb-video') video.setAttribute(name, value);
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
  const imgs = [...document.querySelectorAll('img[data-thumb-video]')].filter((img) => {
    const src = img.getAttribute('data-thumb-video').trim();
    return src && src !== '#';
  });
  if (!imgs.length || window.matchMedia(REDUCED).matches || navigator.connection?.saveData) return;

  const videos = new Map(imgs.map((img) => [attach(img), img.getAttribute('data-thumb-video').trim()]));
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
