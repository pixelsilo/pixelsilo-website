// Colours come from the page: the site's Theme variables (dark by default, `theme-light` on <html>
// flips them), so the loop follows the theme toggle with no code of its own. The `--lp-*` names
// are set on the module root (index.js) with these fallbacks, and can be overridden from CSS.
export const T = {
  text: 'var(--lp-text)',
  grey: 'var(--lp-muted)',
  accent: 'var(--lp-accent)',
  card: 'var(--lp-card)',
  head: 'var(--lp-head)',
  line: 'var(--lp-line)',
  line2: 'var(--lp-line-strong)',
  ink: 'var(--lp-ink)',
  sans: 'var(--font--sans, Geist, Arial, sans-serif)',
  mono: 'var(--font--mono, "Geist Mono", Arial, sans-serif)',
};

export const ROOT_VARS = {
  '--lp-text': 'var(--_theme---text, #f2f1ee)',
  '--lp-muted': 'var(--_theme---text-muted, #8a8a8e)',
  '--lp-accent': 'var(--_theme---accent, #ff5b1f)',
  '--lp-card': 'var(--_theme---background, #0b0b0c)',
  '--lp-head': 'color-mix(in srgb, var(--_theme---background, #0b0b0c) 94%, var(--_theme---text, #f2f1ee))',
  '--lp-line': 'var(--_theme---hairline, #232324)',
  '--lp-line-strong': 'var(--_theme---line-strong, #36363a)',
  '--lp-ink': 'var(--_theme---background, #0b0b0c)',
};

/** The accent at a given alpha, in whichever theme is on. */
export const accentAlpha = (a) => `color-mix(in srgb, var(--lp-accent) ${Math.round(a * 100)}%, transparent)`;
