// The site's film player, shared by the case study film (case-video) and the Work page lightbox
// (film-lightbox), so both look and behave the same. The player and its controls are elements in
// the Designer (restyle them there); this adds the video and wires the controls, each found by its
// data-player value:
//
//   [data-player="frame"]          gets is-playing and is-muted, which code_css uses to swap the icons
//     [data-player="screen"]       where the video goes and what goes full screen (the frame itself
//                                  when it has no separate screen, as in the lightbox)
//       [data-player="big-play"]   the round play button over the film while it's paused
//       [data-player="play"]       play and pause
//       [data-player="time"]       elapsed / length
//       [data-player="track"]      the seek bar (click, drag or arrow keys)
//         [data-player="fill"]     how far through it is
//       [data-player="mute"]       sound on and off
//       [data-player="mode"]       optional: Wide (adds is-cinema to the screen) or back to 16:9
//       [data-player="fullscreen"] optional: full screen
//
// The controls are wired once; load() puts a film in (only its first frame and length load until
// it's played, unless autoplay) and unload() takes it out again, so one player can show many films.

const SEEK_STEP = 5; // seconds per arrow key on the seek bar

const clock = (seconds) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function createPlayer(frame) {
  const part = (name) => frame.querySelector(`[data-player="${name}"]`);
  const screen = part('screen') || frame;
  const play = part('play');
  const bigPlay = part('big-play');
  const time = part('time');
  const track = part('track');
  const fill = part('fill');
  const mute = part('mute');
  const mode = part('mode');
  const full = part('fullscreen');
  let video = null;

  const toggle = () => {
    if (!video) return;
    if (video.paused || video.ended) video.play().catch(() => {});
    else video.pause();
  };

  const sync = () => {
    const playing = !!video && !video.paused && !video.ended;
    frame.classList.toggle('is-playing', playing);
    play?.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  };

  const progress = () => {
    const length = video?.duration || 0;
    const at = video?.currentTime || 0;
    if (fill) fill.style.width = length ? `${(at / length) * 100}%` : '0%';
    if (time) time.textContent = `${clock(at)} / ${clock(length)}`;
    if (track) {
      track.setAttribute('aria-valuemin', '0');
      track.setAttribute('aria-valuemax', String(Math.round(length)));
      track.setAttribute('aria-valuenow', String(Math.round(at)));
      track.setAttribute('aria-valuetext', `${clock(at)} of ${clock(length)}`);
    }
  };

  const sound = () => {
    const muted = !!video?.muted;
    frame.classList.toggle('is-muted', muted);
    mute?.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
  };

  play?.addEventListener('click', toggle);
  bigPlay?.addEventListener('click', toggle);
  mute?.addEventListener('click', () => {
    if (video) video.muted = !video.muted;
  });

  if (track) {
    const seek = (to) => {
      if (!video?.duration) return;
      video.currentTime = Math.min(video.duration, Math.max(0, to));
      progress();
    };
    const seekAt = (x) => {
      const box = track.getBoundingClientRect();
      if (video) seek(((x - box.left) / box.width) * video.duration);
    };
    track.addEventListener('pointerdown', (event) => {
      track.setPointerCapture(event.pointerId);
      seekAt(event.clientX);
    });
    track.addEventListener('pointermove', (event) => {
      if (track.hasPointerCapture(event.pointerId)) seekAt(event.clientX);
    });
    track.addEventListener('keydown', (event) => {
      if (!video) return;
      const to = {
        ArrowRight: video.currentTime + SEEK_STEP,
        ArrowUp: video.currentTime + SEEK_STEP,
        ArrowLeft: video.currentTime - SEEK_STEP,
        ArrowDown: video.currentTime - SEEK_STEP,
        Home: 0,
        End: video.duration,
      }[event.key];
      if (to === undefined) return;
      event.preventDefault();
      seek(to);
    });
  }

  if (mode) {
    // Webflow wraps a button's text in a child block
    const text = mode.firstElementChild || mode;
    mode.setAttribute('aria-label', 'Wide view');
    mode.addEventListener('click', () => {
      const wide = screen.classList.toggle('is-cinema');
      mode.setAttribute('aria-pressed', String(wide));
      text.textContent = wide ? '16:9' : 'Wide';
    });
  }

  if (full) {
    const canFull = !!screen.requestFullscreen || 'webkitEnterFullscreen' in HTMLVideoElement.prototype;
    if (!canFull) full.remove();
    full.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (screen.requestFullscreen) screen.requestFullscreen().catch(() => {});
      else video?.webkitEnterFullscreen(); // iPhone: only the video itself can go full screen
    });
    document.addEventListener('fullscreenchange', () => {
      full.setAttribute('aria-label', document.fullscreenElement === screen ? 'Exit full screen' : 'Full screen');
    });
  }

  function unload() {
    if (document.fullscreenElement === screen) document.exitFullscreen().catch(() => {});
    video?.remove(); // removing it stops the film and frees it
    video = null;
    sync();
    progress();
    sound();
  }

  function load(src, { title = '', autoplay = false } = {}) {
    unload();
    video = document.createElement('video');
    video.playsInline = true;
    video.preload = 'metadata';
    // #t shows the first frame as the poster in browsers that otherwise show nothing (Safari)
    video.src = src.includes('#') ? src : `${src}#t=0.001`;
    if (title) video.setAttribute('aria-label', `${title} film`);
    ['play', 'pause', 'ended'].forEach((type) => video.addEventListener(type, sync));
    ['timeupdate', 'loadedmetadata', 'durationchange'].forEach((type) => video.addEventListener(type, progress));
    video.addEventListener('volumechange', sound);
    video.addEventListener('click', toggle);
    screen.prepend(video);
    sync();
    progress();
    sound();
    if (autoplay) video.play().catch(() => {}); // a browser that refuses leaves it paused, play button showing
    return video;
  }

  return { load, unload };
}
