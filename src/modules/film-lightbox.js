// The Films and renders lightbox on the Work page. The tiles are Collection Items, so the film and
// stills come from the CMS as attributes; JS only fills the dialog and opens it. How the dialog,
// its close button and the stage look is styled on their classes in the Designer.
//
//   [data-module="film-lightbox"]   root, a <dialog> (opened with showModal, so Esc and focus work)
//   [data-film-stage]               where the film and stills go
//   [data-film-close]               the close <button>
//   [data-film-open]                a tile's <button>, anywhere on the page, carrying:
//     data-film                     an MP4 link (Film file), optional
//     data-renders                  image links separated by spaces (Render links), optional
//     aria-label                    the project name, also used as the dialog's label

const words = (value) => (value || '').trim().split(/\s+/).filter(Boolean);

export default function (root) {
  const stage = root.querySelector('[data-film-stage]');
  const close = root.querySelector('[data-film-close]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let opener = null;

  function fill(button) {
    stage.replaceChildren();
    const name = button.getAttribute('aria-label') || '';
    const film = button.getAttribute('data-film');
    if (film) {
      const video = document.createElement('video');
      video.src = film;
      video.controls = true;
      video.playsInline = true;
      video.autoplay = !reduceMotion;
      video.preload = 'metadata';
      video.setAttribute('aria-label', name);
      stage.append(video);
    }
    words(button.getAttribute('data-renders')).forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = name;
      img.loading = 'lazy';
      img.decoding = 'async';
      stage.append(img);
    });
    root.setAttribute('aria-label', name);
  }

  function open(button) {
    opener = button;
    fill(button);
    root.showModal();
    root.scrollTop = 0;
    document.documentElement.style.overflow = 'hidden';
  }

  // Emptying the stage stops the film and frees it
  root.addEventListener('close', () => {
    stage.replaceChildren();
    document.documentElement.style.overflow = '';
    opener?.focus();
  });
  close?.addEventListener('click', () => root.close());
  // A click on the dark surround (the dialog itself, not its contents) closes it
  root.addEventListener('click', (event) => {
    if (event.target === root) root.close();
  });

  document.querySelectorAll('[data-film-open]').forEach((button) => {
    // A tile with nothing to show stays a plain card
    if (!button.getAttribute('data-film') && !words(button.getAttribute('data-renders')).length) {
      button.hidden = true;
      return;
    }
    button.addEventListener('click', () => open(button));
  });
}
