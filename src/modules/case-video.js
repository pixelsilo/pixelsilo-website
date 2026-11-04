// The project's film near the top of a case study, in the template's player. The player and its
// controls are elements in the Designer (restyle them there); this adds the video and wires them.
//
//   [data-module="case-video"]     the row; carries:
//     data-video                   the project's Video field (a direct MP4 link)
//     data-video-title             the project name, used as the video's accessible name
//   [data-player="frame"]          .media.is-player: a fixed full-width 32:9 frame, so the page never
//                                  changes height
//     [data-player="screen"]       .player_screen: the film, 16:9 between the middle two column lines;
//                                  Wide adds is-cinema, which widens it to fill the frame (only the width
//                                  eases, so the height holds steady)
//       [data-player="big-play"]   the round play button over the film while it's paused
//       [data-player="play"]       play and pause (this and the rest are in the screen's .player_bar)
//       [data-player="time"]       elapsed / length
//       [data-player="track"]      the seek bar (click, drag or arrow keys)
//         [data-player="fill"]     how far through it is
//       [data-player="mute"]       sound on and off
//       [data-player="mode"]       Wide or back to 16:9
//       [data-player="fullscreen"] full screen (the screen itself)
//
// The frame gets is-playing and is-muted, which code_css uses to swap the icons. Only the first
// frame and length load until it's played. With no link the row and the hairline after it are removed.

const SEEK_STEP = 5; // seconds per arrow key on the seek bar

const clock = (seconds) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function (root) {
  const src = (root.getAttribute('data-video') || '').trim();
  const frame = root.querySelector('[data-player="frame"]');
  if (!src || src === '#' || !frame) {
    const after = root.nextElementSibling;
    if (after?.classList.contains('line-h')) after.remove();
    root.remove();
    return;
  }

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

  const video = document.createElement('video');
  video.playsInline = true;
  video.preload = 'metadata';
  // #t shows the first frame as the poster in browsers that otherwise show nothing (Safari)
  video.src = src.includes('#') ? src : `${src}#t=0.001`;
  const title = root.getAttribute('data-video-title');
  if (title) video.setAttribute('aria-label', `${title} film`);
  screen.prepend(video);

  const toggle = () => (video.paused || video.ended ? video.play().catch(() => {}) : video.pause());

  const sync = () => {
    const playing = !video.paused && !video.ended;
    frame.classList.toggle('is-playing', playing);
    play?.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  };

  const progress = () => {
    const length = video.duration || 0;
    const at = video.currentTime;
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
    frame.classList.toggle('is-muted', video.muted);
    mute?.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
  };

  ['play', 'pause', 'ended'].forEach((type) => video.addEventListener(type, sync));
  ['timeupdate', 'loadedmetadata', 'durationchange'].forEach((type) => video.addEventListener(type, progress));
  video.addEventListener('volumechange', sound);
  video.addEventListener('click', toggle);
  play?.addEventListener('click', toggle);
  bigPlay?.addEventListener('click', toggle);
  mute?.addEventListener('click', () => {
    video.muted = !video.muted;
  });

  if (track) {
    const seek = (to) => {
      if (!video.duration) return;
      video.currentTime = Math.min(video.duration, Math.max(0, to));
      progress();
    };
    const seekAt = (x) => {
      const box = track.getBoundingClientRect();
      seek(((x - box.left) / box.width) * video.duration);
    };
    track.addEventListener('pointerdown', (event) => {
      track.setPointerCapture(event.pointerId);
      seekAt(event.clientX);
    });
    track.addEventListener('pointermove', (event) => {
      if (track.hasPointerCapture(event.pointerId)) seekAt(event.clientX);
    });
    track.addEventListener('keydown', (event) => {
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
    if (!screen.requestFullscreen && !video.webkitEnterFullscreen) full.remove();
    full.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (screen.requestFullscreen) screen.requestFullscreen().catch(() => {});
      else video.webkitEnterFullscreen(); // iPhone: only the video itself can go full screen
    });
    document.addEventListener('fullscreenchange', () => {
      full.setAttribute('aria-label', document.fullscreenElement === screen ? 'Exit full screen' : 'Full screen');
    });
  }

  sync();
  progress();
  sound();
}
