// Lays a case study's Gallery images out in the template's ruled rows. The Gallery is a
// multi-image CMS field shown by a Collection List; this moves its images into the same rows,
// cells and hairlines the rest of the case study uses, so it's restyled in the Designer by
// editing those classes.
//
//   [data-module="case-gallery"]   the Collection List wrapper (source: the project's Gallery).
//                                  Its list is .row.is-panel and each item a .cell holding a
//                                  .media > img.media_image, which is also how it looks without JS
//                                  and in the Designer: two to a row.
//
// Each image's shape decides its place: wide images (2:1 or wider) take a full-width row, the rest
// go two to a row in Gallery order. A pair shares one frame shape (the average of the two) so the
// hairline under it is straight; a lone image left over takes the full width if it's landscape,
// otherwise the left half. Shapes come from the smallest responsive size Webflow made of each
// image (multi-image fields often have none, so then the image itself). Reading them downloads
// the images, so it waits until the gallery is about two screens away, as lazy loading would.
// With no images the list, and the hairline before it, are removed.

const WIDE = 1.9; // width / height at or above which an image gets its own full-width row
const LANDSCAPE = 1.2; // a lone image at least this wide goes full width rather than half
const FALLBACK = 1.4; // used if an image's shape can't be read in time
const TIMEOUT = 4000;
const AHEAD = '200% 0px'; // start this far before the gallery scrolls into view

const HALF_SIZES = '(max-width: 767px) 100vw, 50vw';

// The smallest candidate in the srcset, else the image itself
function smallestSrc(img) {
  const candidates = (img.getAttribute('srcset') || '')
    .split(',')
    .map((entry) => entry.trim().split(/\s+/))
    .filter(([url]) => url)
    .map(([url, w]) => ({ url, w: parseInt(w, 10) || Infinity }))
    .sort((a, b) => a.w - b.w);
  return candidates[0]?.url || img.currentSrc || img.src;
}

function ratioOf(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve(img.naturalWidth / img.naturalHeight);
  return new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () => resolve(probe.naturalWidth / probe.naturalHeight || FALLBACK);
    probe.onerror = () => resolve(FALLBACK);
    probe.src = smallestSrc(img);
    setTimeout(() => resolve(FALLBACK), TIMEOUT);
  });
}

function cell(img, colClass, ratio, sizes) {
  const wrap = document.createElement('div');
  wrap.className = `cell ${colClass}`;
  const media = document.createElement('div');
  media.className = 'media';
  media.style.aspectRatio = String(ratio);
  img.sizes = sizes;
  media.append(img);
  wrap.append(media);
  return wrap;
}

function rule() {
  const line = document.createElement('div');
  line.className = 'line-h';
  line.setAttribute('aria-hidden', 'true');
  return line;
}

// Groups the images into rows: [{ cells: [{ img, ratio }], full }]
function plan(shots) {
  const rows = [];
  let waiting = null;
  const flush = () => {
    if (!waiting) return;
    rows.push({ cells: [waiting], full: waiting.ratio >= LANDSCAPE });
    waiting = null;
  };
  shots.forEach((shot) => {
    if (shot.ratio >= WIDE) {
      flush();
      rows.push({ cells: [shot], full: true });
    } else if (waiting) {
      rows.push({ cells: [waiting, shot], full: false });
      waiting = null;
    } else {
      waiting = shot;
    }
  });
  flush();
  return rows;
}

async function layout(root, imgs) {
  const ratios = await Promise.all(imgs.map(ratioOf));
  const rows = plan(imgs.map((img, i) => ({ img, ratio: ratios[i] })));

  const built = document.createDocumentFragment();
  rows.forEach((row, i) => {
    if (i) built.append(rule());
    const el = document.createElement('div');
    el.className = 'row is-panel';
    if (row.full) {
      const [{ img, ratio }] = row.cells;
      el.append(cell(img, 'is-col-full-bleed', ratio, '100vw'));
    } else {
      const shared = row.cells.reduce((sum, c) => sum + c.ratio, 0) / row.cells.length;
      row.cells.forEach(({ img }, j) => el.append(cell(img, j ? 'is-col-3-4-bleed' : 'is-col-1-2-bleed', shared, HALF_SIZES)));
    }
    built.append(el);
  });
  root.replaceWith(built);
}

export default function (root) {
  const imgs = [...root.querySelectorAll('.w-dyn-item img')].filter((img) => !img.classList.contains('w-dyn-bind-empty'));
  if (!imgs.length) {
    const before = root.previousElementSibling;
    if (before?.classList.contains('line-h')) before.remove();
    root.remove();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      layout(root, imgs);
    },
    { rootMargin: AHEAD },
  );
  observer.observe(root);
}
