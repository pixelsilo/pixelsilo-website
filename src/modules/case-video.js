// The project's film near the top of a case study, in the site's film player (player.js, shared
// with the Work page lightbox).
//
//   [data-module="case-video"]     the row; carries:
//     data-video                   the project's Video field (a direct MP4 link)
//     data-video-title             the project name, used as the video's accessible name
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
  createPlayer(frame).load(src, { title: root.getAttribute('data-video-title') || '' });
}
