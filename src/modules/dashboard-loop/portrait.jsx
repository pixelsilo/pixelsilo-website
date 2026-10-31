// The portrait loop: 1200 × 1600 (3:4), the same 1110 frames and story as wide.jsx, laid out as a
// stack: platforms in a row, the request list, then the replies, with the rail along the bottom.
// Stage names don't fit under 130px segments, so the rail shows numbers and one label line above.
import { T, accentAlpha } from './theme.js';
import { tween, bezier, EASY, OUT, LINEAR, enterLeave } from './motion.js';
import { STAGES, SIGNOFFS, HOOK, ANSWER, SUMMARY, PLATFORMS, ITEMS } from './data.js';
import { mono, Words, Tick, Icon, panel, Head, Avatar } from './parts.jsx';

export const W = 1200;
export const H = 1600;
export const DURATION = 1110;
export const STILL = 700;

const SQUARE = 83;
const M = 80; // side margin
const RAIL_Y = 1440;
const RAIL_L = M;
const RAIL_W = W - 2 * M;
const SEG = RAIL_W / 8;
const FILL = [[125, 165], [165, 210], [210, 262], [275, 330], [650, 720], [730, 890], [890, 940], [940, 990]];

const TILE = { y: 250, w: 250, h: 100, gap: 13 };
const LIST = { y: 376, row: 60 };
const REPLIES = { y: 822, row: 76 };
const HUB_IN = 270;
const HUB_OUT = 730;

const TO_LINE = bezier(0.3, 0.2, 0.2, 1);
const CLOSE_Y = bezier(0.4, 0, 0.7, 0.8);

const fillOf = (i, f) => tween(f, FILL[i][0], FILL[i][1] - FILL[i][0], 0, 1, LINEAR);
const percent = (f) => (FILL.reduce((a, _, i) => a + fillOf(i, f), 0) / 8) * 100;

const Hub = ({ f }) => {
  if (f < HUB_IN || f > HUB_OUT + 40) return null;
  const sentCount = ITEMS.filter((i) => f >= i.sent).length;
  const receivedCount = ITEMS.filter((i) => f >= i.received).length;
  const outstanding = ITEMS.length - sentCount;
  const list = enterLeave(f, 278, HUB_OUT + 8);
  const replies = enterLeave(f, 290, HUB_OUT + 12);
  return (
    <Fragment>
      {PLATFORMS.map((p, i) => {
        const e = enterLeave(f, 282 + i * 10, HUB_OUT + i * 4);
        const mine = ITEMS.filter((it) => it.from === i);
        const live = mine.some((it) => f >= it.sent - 30 && f < it.sent + 24);
        const used = mine.some((it) => f >= it.sent);
        const edge = live ? T.accent : used ? T.text : T.line2;
        return (
          <div key={p.platform} style={panel({ left: M + i * (TILE.w + TILE.gap), top: TILE.y, width: TILE.w, height: TILE.h, opacity: e.opacity, transform: `translateY(${e.y}px)`, borderColor: edge })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', height: '100%' }}>
              <div style={{ width: 52, height: 52, flex: 'none', boxSizing: 'border-box', border: `1px solid ${edge}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={p.icon} size={28} color={live ? T.accent : T.text} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ ...mono, fontSize: 14, color: live ? T.accent : T.grey, whiteSpace: 'nowrap' }}>{live ? 'Sending' : p.platform}</div>
                <div style={{ fontSize: 19, fontWeight: 500, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              </div>
            </div>
          </div>
        );
      })}

      <div style={panel({ left: M, top: LIST.y, width: RAIL_W, opacity: list.opacity, transform: `translateY(${list.y}px)` })}>
        <Head n="#18" label="What we need from you" right={outstanding === 0 && receivedCount === ITEMS.length ? 'All in, thank you' : `${receivedCount} done · ${sentCount - receivedCount} sent · ${outstanding} outstanding`} />
        {ITEMS.map((it, i) => {
          const sent = tween(f, it.sent, 18, 0, 1, OUT);
          const rec = tween(f, it.received, 18, 0, 1, OUT);
          const stage = sent + rec;
          const flash = Math.max(0, Math.sin(sent * Math.PI)) * 0.08;
          return (
            <div key={it.title} style={{ height: LIST.row, display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px 0 24px', boxSizing: 'border-box', borderBottom: i < ITEMS.length - 1 ? `1px solid ${T.line}` : 'none', fontSize: 22, background: flash > 0.002 ? accentAlpha(flash) : 'transparent' }}>
              <span style={{ width: 36, height: 36, flex: 'none', boxSizing: 'border-box', border: `1px solid ${rec >= 1 ? T.text : T.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={it.kind} size={20} color={stage >= 1 ? T.text : T.accent} />
              </span>
              <span style={{ ...mono, fontSize: 14, color: T.grey, width: 86 }}>{it.label}</span>
              <span style={{ flex: 1, color: stage >= 2 ? T.grey : T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.title}</span>
              <span style={{ position: 'relative', width: 150, height: 28, overflow: 'hidden', textAlign: 'right', ...mono, fontSize: 15 }}>
                <span style={{ position: 'absolute', right: 0, top: Math.round(-stage * 28), color: T.accent }}>Needed</span>
                <span style={{ position: 'absolute', right: 0, top: Math.round((1 - stage) * 28), color: T.grey }}>Sent</span>
                <span style={{ position: 'absolute', right: 0, top: Math.round((2 - stage) * 28), color: T.grey, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                  <Tick p={Math.min(1, rec)} size={15} color={T.grey} /> Done
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div style={panel({ left: M, top: REPLIES.y, width: RAIL_W, opacity: replies.opacity, transform: `translateY(${replies.y}px)` })}>
        <Head n="[ 05 ]" label="Replies" right={`${sentCount} of ${ITEMS.length}`} />
        {ITEMS.map((it, i) => {
          const inn = tween(f, it.sent, 22, 0, 1, OUT);
          const done = tween(f, it.received, 16, 0, 1, OUT);
          return (
            <div key={it.title} style={{ height: REPLIES.row, position: 'relative', boxSizing: 'border-box', borderBottom: i < ITEMS.length - 1 ? `1px solid ${T.line}` : 'none', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, padding: '12px 24px', opacity: inn, transform: `translateY(${Math.round((1 - inn) * 14)}px)` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ fontSize: 19, lineHeight: 1.2, color: done >= 1 ? T.grey : T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{it.reply}</div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none', marginTop: 2, ...mono, fontSize: 14, color: done > 0 ? T.grey : T.accent, opacity: done > 0 ? done : inn }}>
                    {done > 0 ? (
                      <Fragment>
                        <Tick p={done} size={15} color={T.grey} /> Done
                      </Fragment>
                    ) : (
                      'New'
                    )}
                  </span>
                </div>
                {it.chips.length ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    {it.chips.map((c, k) => {
                      const cp = tween(f, it.sent + 8 + k * 6, 18, 0, 1, OUT);
                      return (
                        <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 9px', border: `1px solid ${T.line2}`, ...mono, textTransform: 'none', letterSpacing: 0, fontSize: 13, color: T.grey, opacity: cp, transform: `translateY(${Math.round((1 - cp) * 6)}px)`, maxWidth: 280, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          <Icon name={it.kind} size={12} color={T.grey} />
                          {c}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Fragment>
  );
};

const Summary = ({ f }) => {
  if (f < 752 || f > 890) return null;
  const e = enterLeave(f, 758, 852);
  const shown = Math.floor(tween(f, 774, 66, 0, SUMMARY.length, LINEAR));
  const bar = tween(f, 768, 80, 0, 1, EASY);
  return (
    <div style={{ position: 'absolute', left: M, top: 420, width: RAIL_W, opacity: e.opacity, transform: `translateY(${e.y}px)` }}>
      <div style={{ ...mono, fontSize: 18, color: T.grey, marginBottom: 20 }}>
        Renaissance / Overview
      </div>
      <div style={{ position: 'relative', paddingLeft: 36 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: `${bar * 100}%`, background: T.accent }} />
        <div style={{ ...mono, fontSize: 18, color: T.accent, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="spark" size={24} />
          AI summary <span style={{ color: T.grey }}>· Written just now</span>
        </div>
        <p style={{ margin: '22px 0 0', fontSize: 46, lineHeight: 1.22, letterSpacing: '-0.025em', fontWeight: 400 }}>
          {SUMMARY.map((w, i) => (
            <span key={i} style={{ opacity: i < shown ? 1 : 0.08 }}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

const Update = ({ f, avatar }) => {
  if (f < 865 || f > 990) return null;
  const e = enterLeave(f, 872, 956);
  return (
    <div style={panel({ left: 280, top: 520, width: 640, opacity: e.opacity, transform: `translateY(${e.y}px)` })}>
      <Head n="[ 06 ]" label="Latest update" right="Today" />
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar initials="LW" img={avatar} />
          <span style={{ fontSize: 24, fontWeight: 500 }}>Luke Willson</span>
          <span style={{ ...mono, fontSize: 16, color: T.grey }}>Pixel Silo</span>
        </div>
        <p style={{ fontSize: 32, lineHeight: 1.3, letterSpacing: '-0.02em', margin: '22px 0 0', whiteSpace: 'nowrap' }}>
          Homepage is on staging.
          <br />
          Have a look, and tell me what you think.
        </p>
        <div style={{ ...mono, fontSize: 18, color: T.accent, marginTop: 22 }}>Staging site ↗</div>
      </div>
    </div>
  );
};

export const View = ({ f, avatar }) => {
  const toLine = tween(f, 0, 44, 0, 1, TO_LINE);
  const closeW = tween(f, 1050, 46, 0, 1, EASY);
  const closeY = tween(f, 1064, 46, 0, 1, CLOSE_Y);
  const openW = tween(f, 26, 70, SQUARE, RAIL_W, EASY);
  const railW = f < 1050 ? openW : RAIL_W + (SQUARE - RAIL_W) * closeW;
  const railH = f < 1050 ? SQUARE + (6 - SQUARE) * toLine : 6 + (SQUARE - 6) * closeW;
  const railY = f < 1050 ? 760 + (RAIL_Y - 760) * toLine : RAIL_Y + (760 - RAIL_Y) * closeY;
  const railX = W / 2 - railW / 2;
  const solid = f < 500 ? tween(f, 100, 24, 1, 0) : tween(f, 1034, 24, 0, 1);
  const chrome = tween(f, 84, 40, 0, 1) * tween(f, 1030, 24, 1, 0);
  const pct = percent(f);
  const cascade = (i) => tween(f, 944 + (7 - i) * 6, 14, 0, 1) - tween(f, 960 + (7 - i) * 6, 20, 0, 1);
  const early = f < 500;

  return (
    <div style={{ position: 'absolute', inset: 0, color: T.text, fontFamily: T.sans, fontWeight: 400, fontSize: 16, lineHeight: 'normal', overflow: 'hidden', textAlign: 'left' }}>
      {/* Counter and project header. */}
      <div style={{ position: 'absolute', left: M, top: 70, opacity: chrome }}>
        <div style={{ ...mono, fontSize: 18, color: T.grey }}>
          Renaissance / Website rebuild
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 100, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', minWidth: 160 }}>{Math.round(pct)}</span>
          <span style={{ ...mono, fontSize: 18, color: T.grey }}>% complete</span>
        </div>
      </div>
      <div style={{ position: 'absolute', right: M, top: 70, textAlign: 'right', opacity: chrome, ...mono, fontSize: 18, color: T.grey, lineHeight: 1.5 }}>
        <span style={{ color: T.accent }}>Launch in 82 days</span>
        <br />
        20 Jan 2027
      </div>

      {/* Hook and answer. */}
      {f < 160 || f >= 986 ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: 100, boxSizing: 'border-box' }}>
          <div style={{ maxWidth: 1000 }}>
            <Words words={early ? HOOK : ANSWER} f={f} start={early ? 22 : 994} end={early ? 118 : 1058} size={100} />
          </div>
        </div>
      ) : null}

      {/* Scene 2: who signed off each early stage, three cards across. */}
      {[0, 1, 2].map((i) => {
        const at = FILL[i][1] - 12;
        if (f < at || f > at + 60) return null;
        const e = enterLeave(f, at, at + 28);
        return (
          <div key={i} style={panel({ left: M + i * 350, top: 1180, width: 340, height: 124, opacity: e.opacity, transform: `translateY(${Math.round(e.y - tween(f, at, 60, 0, 20, LINEAR))}px)` })}>
            <div style={{ padding: '22px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, fontWeight: 500, whiteSpace: 'nowrap' }}>
                <Tick p={tween(f, at + 10, 22, 0, 1, OUT)} /> {STAGES[i]}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 19, color: T.text }}>{SIGNOFFS[i][1]}</span>
                <span style={{ ...mono, fontSize: 14, color: T.grey }}>{SIGNOFFS[i][0]}</span>
              </div>
            </div>
          </div>
        );
      })}

      <Hub f={f} />
      <Summary f={f} />
      <Update f={f} avatar={avatar} />

      {/* The stage label line above the rail: the stage that is filling, or the last one done. */}
      <div style={{ position: 'absolute', left: RAIL_L, top: RAIL_Y - 56, height: 24, width: RAIL_W, opacity: chrome, ...mono, fontSize: 16 }}>
        {STAGES.map((s, i) => {
          const show = (i === 0 ? 1 : tween(f, FILL[i][0], 12, 0, 1)) - (i < 7 ? tween(f, FILL[i + 1][0], 12, 0, 1) : 0);
          if (show <= 0) return null;
          const fill = fillOf(i, f);
          return (
            <div key={s} style={{ position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', color: fill > 0 && fill < 1 ? T.accent : T.grey, opacity: show, transform: `translateY(${Math.round((1 - show) * 10)}px)` }}>
              <span style={{ color: T.accent }}>0{i + 1}</span>
              {s}
              <span style={{ width: 18, height: 18, display: 'block', marginLeft: 2 }}>{fill >= 1 ? <Tick p={Math.min(1, tween(f, FILL[i][1], 18, 0, 1, OUT))} size={18} color={T.text} /> : null}</span>
            </div>
          );
        })}
      </div>

      {/* The rail itself: track, fills, numbers. */}
      <div style={{ position: 'absolute', left: railX, top: railY - railH / 2, width: railW, height: railH, background: T.accent, opacity: solid }} />
      <div style={{ position: 'absolute', left: RAIL_L, top: RAIL_Y - 3, width: RAIL_W, height: 6, opacity: 1 - solid }}>
        {STAGES.map((s, i) => {
          const fill = fillOf(i, f);
          const done = fill >= 1;
          const active = fill > 0 && !done;
          return (
            <div key={s} style={{ position: 'absolute', left: i * SEG, width: SEG - 10, top: 0, height: 6, background: T.line2 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: `${fill * 100}%`, background: done && i < 7 ? T.text : T.accent, opacity: 0.8 + cascade(i) * 0.2 }} />
              <div style={{ position: 'absolute', left: 0, top: 22, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', ...mono, fontSize: 16, color: active ? T.accent : T.grey, opacity: chrome, transform: `translateY(${Math.round((1 - tween(f, 84 + i * 3, 30, 0, 1, OUT)) * 14)}px)` }}>
                0{i + 1}
                <span style={{ width: 18, height: 18, display: 'block' }}>{done ? <Tick p={Math.min(1, tween(f, FILL[i][1], 18, 0, 1, OUT))} size={18} color={cascade(i) > 0.5 ? T.accent : T.text} /> : null}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
