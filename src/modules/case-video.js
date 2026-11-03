// The project's film at the top of a case study's work section, full width with the browser's
// own controls. The video keeps its own shape; the row and its frame are classes on the template.
//
//   [data-module="case-video"]   the .row.is-panel; carries:
//     data-video                 the project's Video field (a direct MP4 link)
//     data-video-title           the project name, used as the video's accessible name
//
// The video goes into the row's .media. It loads only its first frame and length until it's
// played. With no link the row and the hairline after it are removed.

export default function (root) {
  const src = (root.getAttribute('data-video') || '').trim();
  if (!src || src === '#') {
    const after = root.nextElementSibling;
    if (after?.classList.contains('line-h')) after.remove();
    root.remove();
    return;
  }

  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  // #t shows the first frame as the poster in browsers that otherwise show nothing (Safari)
  video.src = src.includes('#') ? src : `${src}#t=0.001`;
  const title = root.getAttribute('data-video-title');
  if (title) video.setAttribute('aria-label', `${title} film`);
  (root.querySelector('.media') || root).append(video);
}
