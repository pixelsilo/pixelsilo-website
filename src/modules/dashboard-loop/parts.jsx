import { T } from './theme.js';
import { tween, OUT, IN } from './motion.js';

export const mono = { fontFamily: T.mono, textTransform: 'uppercase', letterSpacing: '0.04em' };

/** Words rise out of a mask, each a few frames after the last. */
export const Words = ({ words, f, start, end, size }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.26, fontWeight: 500, fontSize: size, letterSpacing: '-0.05em', lineHeight: 1 }}>
    {words.map((w, i) => {
      const y = tween(f, start + i * 5, 34, 115, 0, OUT) + tween(f, end + i * 2, 18, 0, -115, IN);
      return (
        <span key={w + i} style={{ overflow: 'hidden', display: 'inline-block', padding: '0.04em 0 0.14em' }}>
          <span style={{ display: 'inline-block', transform: `translateY(${y}%)` }}>{w}</span>
        </span>
      );
    })}
  </div>
);

export const Tick = ({ p, size = 22, color = T.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
    <path d="M3 13l6 6L21 6" style={{ stroke: color }} stroke-width="3" pathLength="26" stroke-dasharray="26" stroke-dashoffset={26 * (1 - p)} />
  </svg>
);

const ICONS = {
  mail: ['M3 5h18v14H3z', 'M3 7l9 6 9-6'],
  spark: ['M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z', 'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'],
  image: ['M3 4h18v16H3z', 'M3 16l5-5 4 4 3-3 6 6', 'M17.5 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z'],
  copy: ['M4 6h16M4 11h16M4 16h10'],
  link: ['M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1'],
  video: ['M3 5h18v14H3z', 'M10 9l5 3-5 3z'],
  access: ['M12 14a4 4 0 11-8 0 4 4 0 018 0z', 'M11 11l9-9M16 6l2 2M13 9l2 2'],
  feedback: ['M4 5h16v10H9l-5 4z'],
  screen: ['M3 4h18v12H3z', 'M8 20h8M12 16v4'],
  phone: ['M7 2.5h10v19H7z', 'M11 18h2'],
};

export const Icon = ({ name, color = T.accent, size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style={{ display: 'block', stroke: color }}>
    {(ICONS[name] || ICONS.phone).map((d) => <path key={d} d={d} />)}
  </svg>
);

export const panel = (extra = {}) => ({
  position: 'absolute',
  background: T.card,
  border: `1px solid ${T.line2}`,
  color: T.text,
  overflow: 'hidden',
  boxSizing: 'border-box',
  ...extra,
});

export const Head = ({ n, label, right }) => (
  <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', borderBottom: `1px solid ${T.line}`, background: T.head }}>
    <span style={{ ...mono, fontSize: 19, color: T.text, fontWeight: 500 }}>
      <span style={{ color: T.accent, marginRight: 14 }}>{n}</span>
      {label}
    </span>
    {right ? <span style={{ ...mono, fontSize: 17, color: T.grey }}>{right}</span> : null}
  </div>
);

export const Avatar = ({ initials, img, size = 44 }) =>
  img ? (
    <img src={img} alt="" style={{ width: size, height: size, objectFit: 'cover', flex: 'none', display: 'block' }} />
  ) : (
    <div style={{ width: size, height: size, flex: 'none', background: T.text, color: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: size * 0.36 }}>{initials}</div>
  );
