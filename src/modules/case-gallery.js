// Lays a case study's Gallery images out in the brief, in the template's ruled rows. The Gallery
// is a multi-image CMS field shown by a Collection List; this moves its images into rows, cells
// and hairlines like the rest of the case study, so it's restyled in the Designer by editing
// those classes.
//
//   [data-module="case-gallery"]   the Collection List wrapper (source: the project's Gallery),
//                                  after What we did. Its list is .row.is-panel.is-spaced and each
//                                  item a .cell.is-gallery holding a .media > img.media_image, which
//                                  is also how it looks without JS and in the Designer: two to a row.
//   [data-gallery-slot="lead"]     an empty block after What it had to prove; the first two images
//                                  go here and the rest stay where the list is
//
// Each image's shape decides its place: wide images (2:1 or wider) take a full-width row, the rest
// go two to a row in Gallery order. A pair shares one frame shape (the average of the two) so the
// hairline under it is straight; a lone image left over takes the full width if it's landscape,
// otherwise the left half.
//
// Each image is framed by its own hairlines, tight to its edges, with a gap between images:
//   image row   .row.is-panel.is-framed (the page background, so the column lines don't show
//               through), cells .cell.is-col-*-bleed.is-framed (a hairline each side; a pair's
//               cells stand 1.25rem off the middle line, so the pair is 2.5rem apart)
//   gap row     the same row class with empty .is-gap cells (2.5rem tall, same side hairlines),
//               so the frame lines run on through the gap
//   .line-h     a full-width hairline above and below every gap row, so where four images meet
//               the lines box in a small square
// A block starts straight under the hairline before it and ends with its own hairline.
//
// Shapes come from the smallest responsive size Webflow made of each image (multi-image fields
// often have none, so then the image itself). Reading them downloads the images, so it waits until
// the lead slot is about two screens away, as lazy loading would. With no images the list and the
// slot are removed.

const WIDE = 1.9; // width / height at or above which an image gets its own full-width row
const LANDSCAPE = 1.2; // a lone image at least this wide goes full width rather than half
const FALLBACK = 1.4; // used if an image's shape can't be read in time
const TIMEOUT = 4000;
const AHEAD = '200% 0px'; // start this far before the gallery scrolls into view
const LEAD = 2; // images placed after What it had to prove

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

function framedRow() {
  const el = document.createElement('div');
  el.className = 'row is-panel is-framed';
  return el;
}

// The gap between two rows carries on the frame lines of whichever columns the rows use
function gapRow(above, below) {
  const el = framedRow();
  const halves = [above, below].filter((row) => !row.full);
  const add = (col) => {
    const gap = document.createElement('div');
    gap.className = `cell ${col} is-gap`;
    el.append(gap);
  };
  if (!halves.length) add('is-col-full-bleed');
  else {
    add('is-col-1-2-bleed');
    if (halves.some((row) => row.cells.length > 1)) add('is-col-3-4-bleed');
  }
  return el;
}

// A framed block of rows for some images, ending with its hairline
function build(shots) {
  const built = document.createDocumentFragment();
  const rows = plan(shots);
  rows.forEach((row, i) => {
    if (i) built.append(rule(), gapRow(rows[i - 1], row), rule());
    const el = framedRow();
    if (row.full) {
      const [{ img, ratio }] = row.cells;
      el.append(cell(img, 'is-col-full-bleed is-framed', ratio, '100vw'));
    } else {
      const shared = row.cells.reduce((sum, c) => sum + c.ratio, 0) / row.cells.length;
      row.cells.forEach(({ img }, j) => el.append(cell(img, `${j ? 'is-col-3-4-bleed' : 'is-col-1-2-bleed'} is-framed`, shared, HALF_SIZES)));
    }
    built.append(el);
  });
  built.append(rule());
  return built;
}

async function layout(root, slot, imgs) {
  const ratios = await Promise.all(imgs.map(ratioOf));
  const shots = imgs.map((img, i) => ({ img, ratio: ratios[i] }));
  const lead = slot ? shots.slice(0, LEAD) : [];
  const rest = shots.slice(lead.length);
  if (slot) slot.replaceWith(build(lead));
  if (rest.length) root.replaceWith(build(rest));
  else root.remove();
}

export default function (root) {
  const slot = document.querySelector('[data-gallery-slot="lead"]');
  const imgs = [...root.querySelectorAll('.w-dyn-item img')].filter((img) => !img.classList.contains('w-dyn-bind-empty'));
  if (!imgs.length) {
    slot?.remove();
    root.remove();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      layout(root, slot, imgs);
    },
    { rootMargin: AHEAD },
  );
  observer.observe(slot || root);
}
