// The project's film near the top of a case study, in the site's film player (player.js, shared
// with the Work page lightbox).
//
//   [data-module="case-video"]     the row; carries:
//     data-video                   the project's Video field (a direct MP4 link)
//     data-video-title             the project name, used as the video's accessible name
//     data-video-poster            optional: an image shown until the film plays
//   img[data-player="poster"]      optional, anywhere in the row (hidden): the same, from a bound
//                                  CMS image field
//   [data-player="frame"]          .media.is-player: a fixed full-width 32:9 frame, so the page never
//                                  changes height
//     [data-player="screen"]       .player_screen: the film, 16:9 between the middle two column lines;
//                                  Wide adds is-cinema, which widens it to fill the frame (only the width
//                                  eases, so the height holds steady)
//       the round play button and the .player_bar controls (see player.js)
//
// With no link the row and the hairline after it are removed.

import createPlayer from './player.js';

export default function (root) {
  const src = (root.getAttribute('data-video') || '').trim();
  const frame = root.querySelector('[data-player="frame"]');
  if (!src || src === '#' || !frame) {
    const after = root.nextElementSibling;
    if (after?.classList.contains('line-h')) after.remove();
    root.remove();
    return;
  }
  // The poster: data-video-poster on the row, or an image marked data-player="poster" (bound to a
  // CMS image field in the Designer). The image is only a carrier, so it's removed once read.
  const img = root.querySelector('img[data-player="poster"]');
  let poster = (root.getAttribute('data-video-poster') || '').trim();
  if (img) {
    const url = img.getAttribute('src') || '';
    if (!poster && url && !img.classList.contains('w-dyn-bind-empty') && !/placeholder/i.test(url)) poster = url;
    img.remove();
  }
  createPlayer(frame).load(src, { title: root.getAttribute('data-video-title') || '', poster });
}
