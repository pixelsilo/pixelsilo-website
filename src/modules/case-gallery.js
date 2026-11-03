// More images at the end of a case study, from the project's Image links field (links separated
// by spaces). The template's own image classes do the styling, so the gallery looks like the
// detail row above it and is restyled in the Designer by editing those classes.
//
//   [data-module="case-gallery"]   root, a .row.is-panel; carries:
//     data-images                  the image links
//     data-alt                     the project name, used as each image's alt text
//
// Images go two to a row (.cell.is-col-1-2-bleed and .cell.is-col-3-4-bleed, each holding a
// .media.is-case-detail); an odd last image takes the full width (.media.is-case-wide). With no
// links the row and the hairline after it are removed.

const words = (value) => (value || '').trim().split(/\s+/).filter(Boolean);

function cell(src, alt, cellClass, mediaClass) {
  const wrap = document.createElement('div');
  wrap.className = `cell ${cellClass}`;
  const media = document.createElement('div');
  media.className = `media ${mediaClass}`;
  const img = document.createElement('img');
  img.className = 'media_image';
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  img.decoding = 'async';
  media.append(img);
  wrap.append(media);
  return wrap;
}

export default function (root) {
  const links = words(root.getAttribute('data-images'));
  const alt = root.getAttribute('data-alt') || '';
  if (!links.length) {
    const rule = root.nextElementSibling;
    if (rule?.classList.contains('line-h')) rule.remove();
    root.remove();
    return;
  }
  links.forEach((src, i) => {
    const last = i === links.length - 1;
    if (last && i % 2 === 0) root.append(cell(src, alt, 'is-col-full-bleed', 'is-case-wide'));
    else root.append(cell(src, alt, i % 2 ? 'is-col-3-4-bleed' : 'is-col-1-2-bleed', 'is-case-detail'));
  });
}
