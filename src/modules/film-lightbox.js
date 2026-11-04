// The Films and renders lightbox on the Work page. The tiles are Collection Items, so the film and
// stills come from the CMS as attributes; JS only fills the dialog and opens it. How the dialog,
// its close button and the stage look is styled on their classes in the Designer.
//
//   [data-module="film-lightbox"]   root, a <dialog> (opened with showModal, so Esc and focus work)
//   [data-film-stage]               where the film and stills go; its first child is the film player
//     [data-player="frame"]         .player_screen.is-lightbox, the site's film player (player.js, the
//                                   same one the case studies use), hidden when a tile has no film
//   [data-film-close]               the close <button>
//   [data-film-title]               gets the project name
//   [data-film-meta]                gets the services and the list descriptor, joined with middle dots
//   [data-film-note]                gets the experience note; its wrapper hides when there is none
//   [data-film-scroll]              a "Scroll" cue, given is-visible while there is more below
//   [data-film-open]                a tile's <button>, anywhere on the page, carrying:
//     data-film                     an MP4 link (Film file), optional
//     data-renders                  image links separated by spaces (Render links), optional
//     data-film-services            Services, e.g. Imagery · Motion
//     data-film-descriptor          List descriptor
//     data-film-note                Experience note
//     aria-label                    the project name, also used as the dialog's label
//
// The dialog's .film_inner is at least as tall as the dialog and centres its content, so a film
// that fits sits in the middle of the screen; anything taller scrolls from the top. The player takes
// each film's own shape and is capped so it and the heading fit the screen together.

import createPlayer from './player.js';

const FILM_HEIGHT = '100svh - 17rem'; // the tallest the film gets, leaving room for the heading
const words = (value) => (value || '').trim().split(/\s+/).filter(Boolean);
const SCROLL_SLACK = 48; // px from the bottom at which the scroll cue goes away

export default function (root) {
  const stage = root.querySelector('[data-film-stage]');
  const close = root.querySelector('[data-film-close]');
  const title = root.querySelector('[data-film-title]');
  const meta = root.querySelector('[data-film-meta]');
  const note = root.querySelector('[data-film-note]');
  const cue = root.querySelector('[data-film-scroll]');
  const frame = stage.querySelector('[data-player="frame"]');
  const player = frame ? createPlayer(frame) : null;
  if (frame) frame.hidden = true; // shown in the Designer; on the site only once a tile with a film opens
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let opener = null;

  // Fill a text slot, hiding its wrapper (the muted-colour div around it) when the CMS field is empty
  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
    const wrap = el.parentElement !== root && el.parentElement.children.length === 1 ? el.parentElement : el;
    wrap.hidden = !text;
  }

  function updateCue() {
    if (!cue) return;
    const more = root.scrollHeight - root.clientHeight - root.scrollTop > SCROLL_SLACK;
    cue.classList.toggle('is-visible', more);
  }

  // Stills load lazily and the film's height arrives with its metadata, so recheck as the stage grows
  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(updateCue) : null;
  resize?.observe(stage);
  root.addEventListener('scroll', updateCue, { passive: true });

  // Empty the stage of the last tile's stills and film, keeping the player itself
  function clear() {
    [...stage.children].forEach((child) => child !== frame && child.remove());
    player?.unload();
    if (frame) frame.hidden = true;
  }

  function fill(button) {
    clear();
    const name = button.getAttribute('aria-label') || '';
    const film = button.getAttribute('data-film');
    const services = (button.getAttribute('data-film-services') || '').trim();
    const descriptor = (button.getAttribute('data-film-descriptor') || '').trim();
    setText(title, name);
    setText(meta, [services, descriptor].filter(Boolean).join(' · '));
    setText(note, (button.getAttribute('data-film-note') || '').trim());
    if (film && player) {
      frame.hidden = false;
      frame.style.removeProperty('aspect-ratio');
      frame.style.removeProperty('max-width');
      const video = player.load(film, { title: name, autoplay: !reduceMotion });
      video.addEventListener('loadedmetadata', () => {
        if (!video.videoWidth) return;
        const shape = video.videoWidth / video.videoHeight;
        frame.style.aspectRatio = String(shape);
        frame.style.maxWidth = `calc((${FILM_HEIGHT}) * ${shape})`;
      }, { once: true });
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
    updateCue();
  }

  // Emptying the stage stops the film and frees it
  root.addEventListener('close', () => {
    clear();
    cue?.classList.remove('is-visible');
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
