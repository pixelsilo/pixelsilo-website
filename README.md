# Pixel Silo: Webflow custom code

This repo holds the custom JavaScript for the Pixel Silo Webflow site (**PIXEL SILO 2026**, site ID `6ae21a9bfa755795687adbc6`, staging at `pixel-silo-2026.webflow.io`). Vite builds it into one file, `dist/site.js`, which is committed to the repo. jsDelivr serves that file from a git tag, and one small snippet in the Webflow **footer** loads it (`snippets/loader.html`).

The setup copies [Cocos Organic](https://github.com/pixelsilo/cocos-organic).

## Develop

```bash
npm install
npm run dev     # terminal 1: rebuild dist/ on change (unminified, with sourcemaps)
npm run serve   # terminal 2: serve dist/ at http://127.0.0.1:5500 (CORS on)
```

Then open the Webflow site (`pixel-silo-2026.webflow.io`) with `?dev` on the URL. That browser then loads `http://127.0.0.1:5500/site.js` until you visit with `?dev=off`, and the console shows `[site] DEV mode`. Everyone else keeps getting the tagged CDN build. The flag is stored in `localStorage` (key `ps-dev`), so it survives page changes.

Use Chrome, and allow local-network access if it asks. Safari blocks `http://127.0.0.1` scripts on https pages. The Designer canvas doesn't run custom code, so put realistic default content in the markup.

## Build

`vite.config.js` builds `src/main.js` into a single IIFE called `dist/site.js`. The filename is stable and unhashed, so the CDN URL only changes with the tag. `preview: { cors: true }` lets the https Webflow page load the local build.

`npm run build` runs the Lottie generator first (`npm run lottie` on its own), then Vite, which copies `public/` into `dist/`.

`dist/` is committed because jsDelivr serves files straight from the repo. Always run `npm run build` before you commit a release.

npm libraries get bundled (Preact for the dashboard loop). The exceptions are GSAP (use the copy Webflow already loads) and the Lottie player, which `lottie-stagger` loads from jsDelivr only on pages that use it.

## Structure

```
src/
  main.js          # entry: GLOBALS + MODULES, boot
  global/          # site-wide init functions, run on every page
    hide-empty.js
    consent-settings.js
    consent-skin.js
    theme-toggle.js
  modules/         # opt-in modules, mounted on [data-module="<name>"]
lottie/            # Lottie generator: visuals.json (from Figma) -> build.mjs
public/lottie/     # generated Lottie JSON + SVG posters, copied into dist/lottie
dist/              # build output (committed): site.js, lottie/
snippets/
  loader.html      # the Webflow footer loader (source of truth)
  theme-head.html  # the saved-theme snippet at the top of the Webflow head
```

`src/main.js` works like this:

- `GLOBALS` is an array of site-wide init functions imported from `src/global/`.
- `MODULES` maps a name to a function from `src/modules/`. Each one mounts on every `[data-module="<name>"]` element.
- Each init runs inside try/catch. A failure logs `[site] global failed:` or `[site] module failed: <name>` and doesn't stop the others.
- A root that has been initialised gets `data-ready`. Roots that already have it are skipped, which guards against double init.
- Boot is queued with `window.Webflow.push`, so it runs after Webflow's own JS (interactions, forms, sliders). It then checks `document.readyState`, because the injected script loads async and the DOM may already be ready.

### Adding a module

```js
// src/modules/example.js
export default function (root) {
  const button = root.querySelector('[data-part="toggle"]');
  // query only inside root, so several copies can share a page
}
```

Register it in `MODULES` in `src/main.js` (`{ example }`), then give the Webflow element the custom attribute `data-module="example"`.

### Modules

- **`work-list`** (`src/modules/work-list.js`, from v1.1.0) is the homepage project list, with one project open at a time.
  - **Markup:** the root is `[data-module="work-list"]`. Each project is `[data-work="item"]`, containing a clickable row `[data-work="toggle"]` (`role="button"`, `tabindex="0"`), a panel `[data-work="panel"]`, a `+`/`−` icon `[data-work="icon"]` and a number `[data-work="num"]`.
  - **What the JS does:** it only toggles the `is-open` combo class on the panel, icon and number. It also swaps the icon text and sets `aria-expanded` / `aria-controls`.
  - **Styling:** done in the Designer. `.work_panel` is height 0, `.work_panel.is-open` is height auto, and the icon and number go to accent when open.
  - **Animation:** the panel height animates over 500ms and is skipped under reduced motion.
  - **Designer default:** put `is-open` on the first project so it shows open.

- **`lottie-stagger`** (`src/modules/lottie-stagger.js`, from v1.2.0) plays the Adapt feature mini UIs once as they scroll into view, 200ms apart when several arrive together (shared across roots).
  - **Markup:** the root is `[data-module="lottie-stagger"]` (both Adapt feature rows), with an optional `data-lottie-stagger="200"` in ms. Each slot is `.feature_visual[data-lottie="adapt-01"]` (`aria-hidden="true"`), holding an Image of the matching poster (`adapt-0N.svg` asset, class `feature_poster`).
  - **What the JS does:** nothing until the row is about a screen away (from v1.2.4, so the Lotties cost nothing at page load). Then it loads `lottie_light` 5.12.2 from jsDelivr, loads `lottie/<name>.json` from the same place as `site.js` (the tag, or localhost with `?dev`), hides the poster once the Lottie is ready, and plays it when 40% visible. Under reduced motion it does nothing, so the poster stays.
  - **The animations:** `lottie/build.mjs` turns `lottie/visuals.json` (the Figma frames, 384 x 128) into Lottie. It sorts each element by kind: 1px lines grow from their start, 2px content bars grow a beat later, outlined panels and arrows trace on, buttons scale from 94% and fade in, chips grow from the left with any accent fill flickering on, small squares stutter (0 1 0 1 0 1 1 0 0 1 1, 2 frames a step) and text types on a character at a time. It runs at 60fps, roughly 0.8–0.9s each, plays once and holds the last frame. Text is outlined Geist Mono, so the files need no fonts. To change one, edit `visuals.json` (or the timings at the top of `build.mjs`), run `npm run lottie -- --preview lottie/preview.html`, open the preview, then release. If a poster changes, re-upload it to Webflow.
- **`deferred-video`** (`src/modules/deferred-video.js`, from v1.2.4) starts a muted background video once the page has loaded, so its download doesn't compete with first paint. Markup: the `<video>` itself is the root, `data-module="deferred-video"` with the file in `data-src` (no `src`), plus `muted loop playsinline autoplay preload="none"`. Webflow drops bare `muted` and `loop` attributes on publish, so give them values (`muted="muted"`, `loop="loop"`). Under reduced motion the video never loads. Used on the hero reel (`.media_video`).
- **`mobile-menu`** (`src/modules/mobile-menu.js`, from v1.3.0) is the tablet and phone navigation (991px and below). The panel sits under the header bar, so the logo and button stay on screen.
  - **Markup:** the root is `.header` with `data-module="mobile-menu"`. Inside it, `[data-menu="toggle"]` is the `<button>`, `[data-menu="panel"]` the panel (`#site-menu`), `[data-menu="line"]` the two button lines and `[data-menu="reveal"]` the text in each row.
  - **What the JS does:** toggles `is-open` on all of those, sets `aria-expanded` and `aria-label`, staggers the rows (70ms apart), locks page scroll and makes `main` and `footer` inert. Esc closes and returns focus to the button. A link tap closes it, and so does widening past 991px. Under reduced motion all transitions are off.
  - **Styling:** done in the Designer with Theme variables. `.menu` is hidden and wiped closed with `clip-path`, `.menu.is-open` wipes open; `.menu_item.is-open` rises out of `.menu_mask`; `.menu_line.is-open` and `.menu_line.is-bottom.is-open` rotate into the cross; `.menu_button.is-open` is accent. It's a state rather than a hover because a hover sticks on touch screens. To edit the open look, add `is-open` to `.menu` (and `.menu_item` or the lines) in the Designer, then remove it.
  - **Height:** `.menu` is `calc(100dvh - 4.5rem - 1px)`, the header row plus its hairline. Webflow collapses a `calc()` containing a variable into that variable, so `4.5rem` is written out. If `Site/Header height` changes, change it here too. It's absolute inside the header, not fixed, because the page-load intro leaves a transform on `.header`.
  - **Light and dark:** the menu uses Theme variables, so it follows the site's [theme toggle](#globals). The Header component also has a **Light** variant, which switches the Theme collection on `.header` only. Select the Header instance on a page and pick the variant to fix the bar and the menu to paper whatever the visitor chose.

- **`dashboard-loop`** (`src/modules/dashboard-loop/`, from v1.5.0) is the "Your dashboard" animation: an 18.5-second seamless loop of one website build, drawn live in the page rather than played as a video, so it has a transparent background, follows the theme toggle and costs about 10KB gzipped.
  - **Markup:** an empty Div Block with `data-module="dashboard-loop"`, inside `.media.is-loop` in the Your dashboard section (or wherever it should play). `.media.is-loop` has no fixed height or background and reserves the same shape as the module (2560 / 1072, 3 / 4 at 767px and below), so nothing is cropped and the section doesn't jump when the script runs. Keep those two ratios in step with the module. `data-layout="auto"` shows the 3:4 portrait version at 767px and below and the 2560 × 1072 wide version above; `"wide"` (the default) or `"portrait"` fixes one. `data-avatar` is the URL of Luke's photo for the update card (upload `luke.jpg` as a Webflow asset and paste its URL); without it the card shows initials. The div sizes itself (`aspect-ratio`), so give it the width you want and nothing else. The Designer canvas shows it empty, so keep the section's other content realistic.
  - **How it works:** `wide.jsx` and `portrait.jsx` are pure functions from a frame number to markup (ported from the Remotion edit in the dashboard repo, `docs/marketing/launch-loop`), rendered with Preact into a fixed-size stage that is scaled to the div's width, so nothing reflows and the pixel alignment holds at any size. `index.js` runs the clock (time-based, so a dropped frame skips rather than slows), pauses it when the div is off screen, and under reduced motion draws one still frame (everything in, marked done). `motion.js` has the easing and tweens, `data.js` the story (stages, platforms, the six items and their replies), `parts.jsx` the shared pieces.
  - **Colours:** `theme.js` maps the Theme variables (`--_theme---text`, `--_theme---text-muted`, `--_theme---accent`, `--_theme---background`, `--_theme---hairline`, `--_theme---line-strong`) onto `--lp-*` custom properties on the root, so the loop flips with `theme-light` like everything else. Cards use the Background colour so they stand off the Surface band; override any `--lp-*` on the root from CSS to change that.
  - **Testing:** `dev/dashboard-loop.html` runs both layouts outside Webflow with fake Theme variables and a theme button (`npm run serve`, then open `/dev/dashboard-loop.html`; `?f=560` freezes both on a frame, `?big` enlarges the portrait). On the page itself, `root.dashboardLoop.freeze(frame)` holds a frame in the console.
  - **Build:** JSX is Preact via esbuild's `jsxFactory: 'h'` in `vite.config.js`; `preact` is the only runtime dependency the site bundles.
### Globals

- **`hide-empty`** (`src/global/hide-empty.js`) hides empty Designer and CMS content on the live site only, so the Designer still shows everything:
  - `data-hide-empty` hides the element when it has no text.
  - `data-hide-empty-parent=".selector"` hides the closest matching ancestor when this element has no text.
  - `data-hide-if-list-empty` hides the element when the Collection List inside it has no items.
- **`consent-settings`** (`src/global/consent-settings.js`, from v1.2.5) opens the Usercentrics privacy settings from any `[data-consent="settings"]` link or button. If the CMP hasn't loaded, the link falls through to its href, so point the href at the cookie policy.
- **`consent-skin`** (`src/global/consent-skin.js`, from v1.2.6) brands the Usercentrics UI. See [Consent and analytics](#consent-and-analytics).
- **`theme-toggle`** (`src/global/theme-toggle.js`, from v1.4.0) switches the whole site between dark and light from any `[data-theme="toggle"]` button.
  - **How it works:** light is the `theme-light` class on `<html>`, which already holds the Theme variables' Light mode, so anything styled with Theme variables follows with no extra rules. Keep `theme-light` on at least one element (the Studio section has it), or Webflow stops publishing the class. Dark is the default for everyone, whatever their device is set to. A visitor's choice is saved in `localStorage` as `ps-theme` only when they press the button, and it's a preference they asked for, so it isn't behind consent.
  - **No flash:** `snippets/theme-head.html` sits at the top of Site settings > Custom code > Head and adds the class before the first paint. The JS only does the switching, and crossfades with a View Transition where the browser has one and motion is allowed.
  - **Markup:** two buttons in the Header component. `.theme_toggle` sits at the end of `.nav` on desktop and `.theme_toggle.is-bar` sits beside the menu button at 991px and below, because `.cell.is-nav` is hidden there. Each holds `.theme_icon`, an embed with a `currentColor` SVG. The JS sets `aria-label` and `title` to say which way it will switch.
  - **White artwork:** the client logos and the Adapt posters and Lotties are white files, so Theme variables can't reach them. The `code_css` embed flips them with `filter: invert(1) hue-rotate(180deg)` under `.theme-light`, which turns white to ink and keeps the orange. It also turns the icon over. New white artwork needs adding to that rule.
  - **Stays dark:** the Usercentrics banner and settings window, because `consent-skin` uses fixed colours. It reads fine over paper. The Style guide has no Header, so it has no toggle, but it does follow a saved choice.

## Conventions

- **Hook JS to attributes, never to Webflow classes or IDs.** Designers can then rename and restyle freely.
- **Body styles go on Body (All Pages) in the Designer, not in the embed.** The Designer canvas draws Body as its own element, so a `body {}` rule in the `code_css` embed styles the live site but not the canvas. Set Body (All Pages) to: background `Theme/Background`, colour `Theme/Text`, font `Font/Sans`, size `Text/Body`, line height 1.5. The embed keeps the same rule as a fallback. `html { font-size }` (fluid rem) works from the embed.
- **All custom CSS lives in the `code-snippets` component, and nowhere else.** Not in this repo, not in Site or Page settings custom code, and not injected by JS. The Designer only renders HTML embeds, so this is the one place CSS previews while designing.
  - The component is `code-snippets`: a Div with class `code-snippets` (`display: none`) holding one HTML embed with class `code_css`. Write CSS inside that embed's `<style>` tag. Hiding the embed doesn't stop its CSS from rendering.
  - **Every page needs an instance** at the end of its Body, including new pages, CMS templates and the 404. Home has one.
  - **Never put a `<script>` in that embed**: the Designer then skips the whole embed. JS lives in this repo.
- **Units: rem throughout.** px only where it has to be: 1px hairlines and borders (`Border/Hairline`).
- **Fluid rem:** the `code_css` embed sets `html { font-size }` per range (Finsweet-style), so everything in rem scales. 16px up to 991, 14px→16px across 992–1439, 16px for 1440–1919 (the Figma 1440 and 1920 frames share sizes), then `0.8333vw` from 1920, capped at 21.33px.
- **Responsive type:** display, heading and title classes step down at the tablet (≤991), mobile landscape (≤767) and mobile (≤479) breakpoints, in rem on the classes themselves. `display-xl` is 7.4375rem by default (the 119px hero in the 1440 frame) and goes back to `Text/Display XL` (9.75rem) at the 1920 breakpoint. The hero size at 1920 needs the 1920 breakpoint switched on in the Designer (it is).
- **Gutter = header height.** `Site/Header height` (4.5rem) sets the header row height, and `Site/Margin` is an alias of it. On desktop, the gap at the page edges always equals the navbar height, and both scale with the fluid root. `.row`, `.container` and `.grid-lines` use `Site/Margin`, with 2.5rem on tablet and 1.25rem on mobile. To change both, edit `Site/Header height` only.
- **Design tokens are Webflow variables** (Base collection): `Colour/*`, `Line/*`, `Font/*`, `Text/*` sizes, `Space/*`, `Site/Margin`, `Border/Hairline`. They came from the v5 wireframes in the PS - Design Figma file, which had no Figma variables or styles, so values were read off the frames. The **Style guide** page (`/style-guide`) shows every token and type class. Update it when you add one.
- Type classes (`display-xl` … `text-mono-s`) carry font, size, line height, tracking and zeroed margins. Colour is inherited; use the `text-muted` / `text-accent` wrappers or set it per element.
- **Light on dark, via themes.** The `Theme` variable collection holds the colour roles: `Background`, `Surface`, `Text`, `Text muted`, `Line`, `Line strong`, `Accent` (CSS `--_theme---*`). Base mode is dark; the `Light` mode swaps them to paper. Style components with Theme variables, not the raw palette, so they work in both. Add `theme-light` to a section (the Studio band) to flip it; `theme-dark` flips a block back. Body, `text-muted`, `text-accent` and the style guide lines already use Theme tokens.
- Hide empty Designer content with the `hide-empty` attributes above, never with CSS.

## Editable in the Designer

Everything that can be set in the Designer is set there, so it shows in the Style panel and can be edited:

- **Classes and variables:** all spacing, sizes, colours and type are on classes and variables.
- **Gaps:** use `grid-row-gap` / `grid-column-gap`.
- **Grid placement:** uses start/end line numbers (for example `2` / `5`), never `span N`.
- **Body styles:** on Body (All Pages).
- **Centring:** done with flex or auto margins, never raw `transform`.
- **Content:** text and links are native elements; double-click to edit.

Only what the Designer has no control for lives in code (the `code_css` embed), so nothing there overrides a Designer edit:

- **Fluid rem:** `html { font-size }`.
- **Font smoothing:** on `body`.
- **Selection colour:** `::selection`.

One element is code by design: the **logo**. It's an inline SVG in an HTML embed (in the Header component) so it follows the theme colours. To change the logo, edit that embed's SVG.

## Grid and hairlines

The site is drawn on a 4-column grid, and the hairlines are the grid. They're built to stay pixel-tight at every width and to be animatable later.

**Rules**

0. **Set gaps with Webflow's names, `grid-row-gap` / `grid-column-gap`.** Gaps set through the API as plain `row-gap` / `column-gap` render, but the Designer's Gap field shows 0 and can't edit them. Both names produce the same CSS.
0. **Always set grid rows and gaps explicitly.** If a grid only defines columns, the Designer seems to apply Webflow's default grid after load (two auto rows plus gaps). An empty second row then takes the leftover height and pushes content up. `.row` sets `grid-template-rows: auto`, `grid-auto-rows: auto` and zero gaps; the header uses `grid-template-rows: 100%`.
0. **Build lines as Div Blocks, never custom (DOM) elements.** The Designer draws empty custom elements as roughly 72px placeholder boxes, while the browser draws them at 1px. This applies to any empty decorative element.
1. **Lines are elements, never borders.** `.line-v` and `.line-h` are 1px divs (`Border/Hairline`) with a `line="v"` / `line="h"` attribute for future animation hooks. Cells, cards and media never get borders, so two edges can't sit side by side and double up.
2. **One line per edge.** A horizontal line belongs to the block above it: each `.row` is followed by a `.line-h`, and a section ends with one. The Header component owns the line under it, so the hero starts without one.
3. **Solid colour.** `Theme/Hairline` is a solid colour, not a transparent one: `#232324`, which is white 10% pre-mixed on Ink 950, and `#D5D4D1` in `theme-light`. Where two lines cross, a transparent colour would get brighter; a solid one doesn't.
4. **Content touches the line.** As in the Figma, content starts exactly on its column's hairline: `.cell` has no left padding. On desktop it has no right padding either, so cells span line to line (Luke's choice, 29 Oct 2026). Tablet keeps a 2rem right gutter and mobile 1rem. Inset content only on purpose (the reel label is 1.5rem inside the reel).
5. **Lines sit under content.** `.grid-lines` is `z-index: 0` and `.row` is `position: relative; z-index: 1`. Lines show through empty space, while media covers them and text reads on top.

**Structure of a section**

```
section.section
  div.row            ← 4-col grid, carries the page gutter (Site/Margin)
    div.cell.is-col-1 …
  div.line-h
  div.row …
  div.line-h
  Grid lines         ← component, always the last child
```

- **Grid lines** component: `.grid-lines` is absolutely positioned and inset by the same gutter as `.row`. It holds `.line-v` combos `is-start` (0), `is-q1` (25%), `is-mid` (50%), `is-q3` (75%) and `is-end` (right: 0). Lines and grid columns use the same box and the same percentages, so they always line up.
- **Collapse:** desktop has 4 columns. On tablet (≤991) there are 2 columns and `is-q1`/`is-q3` hide. On mobile (≤767) there's 1 column and `is-mid` hides too, leaving only the two edge lines.
- **Cell placement** (combos on `.cell`): `is-col-1`, `is-col-2-3`, `is-col-2-4`, `is-col-4`, `is-col-full`, `is-aside` (column 1, hidden on tablet down), `is-col-2-4-bleed` (no inner padding, for media that should land exactly on the lines). Header-only: `is-logo`, `is-nav`, `is-nav-end`. On tablet, content placements go full width; on mobile everything stacks.
- **Stacked dividers:** `.line-h.is-stack` goes as the first child of a cell that follows another cell. It only shows on mobile, centred in the row gap, so items that stack still get a divider.
- **Row spacing:** `.row` is 4rem / 3rem / 2rem (desktop / tablet / mobile). `is-tight` is 2rem and vertically centred (the logo bands). `is-header` is for the header.
- **Helpers:** `.stack` (column, 1.5rem gap) with `is-loose`, `is-split`, `is-tight`, `is-actions`. Also `.eyebrow`, `.button` / `.button.is-text` + `.button_icon`, `.media` + `.media_label` / `.media_play`, `.names`, `.marker`.

The style guide page has a live demo of the grid ("05 · Grid and lines").

**Components:** Header, Footer, Grid lines and code-snippets. A new page is Header, then a `main` of sections, then Footer, then code-snippets.

**Section patterns used on the homepage** (reuse them on other pages):
- **Intro:** a full-width cell with an eyebrow and a two-line heading (the second line in `.text-muted`). Add `row.is-intro` when a paragraph follows in columns 2–3.
- **Cell grid:** `row.is-panel` (no padding) with `cell.is-pad` cells for the Process stages and dashboard features. Padded cells fill line to line, with `.split` for number + meta and `.feature_visual` (a 3:1 slot) for the animated mini UI (see `lottie-stagger`).
- **Open/close lists:** the Work list and the FAQ both use the `work-list` module. FAQ answers sit in `row.is-answer`.
- **Surfaces:** `section.is-surface` gives the lifted band. `theme-light.is-section` gives the light Studio band, where everything inside flips to paper, hairlines included.
- **Buttons:** `.button` (solid), `.button.is-outline`, `.button.is-text` and `.button.is-block` (full width), each with `.button_icon` holding a `currentColor` SVG arrow. All have CSS hover states (see Motion). A button in a flex column stretches to the column: `.button.is-outline.is-hug` keeps it to its label.
- **Heading icon:** `.heading_icon` is an inline `<span>` holding a `currentColor` SVG, sized in em (0.57em × 0.54em, accent) so it scales with whatever heading it sits in. Used for the sparkle before "AI powered dashboard." Keep a real space in the text before it, so the heading reads correctly without the icon.
- **Cell gutter:** text sits flush to the left column line but never touches the right one. `.cell` has `padding-right` = **Cell / Gutter**, and `.line-h` has `margin-right` = **Cell / Line bleed** (with `width: auto`), so hairlines inside a cell still run to the line. Both variables are 0 in Base mode; `.cell` switches the Cell collection to **In cell** (2rem / −2rem) and, at small, **In cell (small)** (1.25rem / −1.25rem). `.cell.is-pad` boxes are padded all round already, so they set the collection back to Base. `.line-h.is-stack` (absolute, edge to edge) keeps `margin-right: 0`. Right-aligned content in a cell (the FAQ and work +) is inset by the same gutter. The exceptions, on desktop only, are Enquiries (`.cell.is-nav-end`) and the footer location (`.cell.is-col-4.is-flush`), which sit on the right-hand line; both get the gutter back on tablet down.

## Motion

**Scroll reveals are native Webflow interactions (IX3)**, set up site-wide and targeted by custom attribute or class, with no JS in this repo. Add the attribute or class to any element in the Designer and it animates; edit timing and easing in the Interactions panel (one place for the whole site).

| Target | Interaction | Effect |
|---|---|---|
| `split="chars"` | Reveal · chars | text splits per letter; each rises 40% and fades in (0.55s, expo out, 0.4s spread across the line). **H1 and H2 only.** Runs on every breakpoint (it was briefly switched off on phones for Lighthouse, then restored on request; on a throttled phone it costs ~300ms of main-thread time). |
| `.grid-lines` (the Grid lines component) | Grid · columns ripple | as the section reaches `top 85%`, its `.line-v` columns draw down from the top (scaleY 0→1, 2.6s, power3 out), 0.3s apart left to right, so the columns ripple across. |
| `.line-h` | Grid · hairline draw | each hairline draws in from the left as it reaches `top 92%` (scaleX 0→1, 2.2s, power3 out). |
| `reveal-group` (a row) | Grid · box reveal, row | **desktop and tablet.** When the row reaches `top 85%`, every `reveal="down"` inside drops in from 1.5rem above (0.12s apart) and every `reveal="up"` rises from 1.5rem below (0.07s apart, starting 0.1s later). All fade 0→100%, 1.1s, power3 out. The stagger runs in DOM order, so it travels across the boxes. |
| `reveal-box` (a box) | Grid · box reveal, mobile | **small and tiny only** (boxes stack, so each box triggers itself at `top 88%`). Same moves as the row version. |

**Page load intro:** **Page load · intro** (page-load trigger, one timeline) plays once when the page loads: the navbar (`.header`) slides down from -100% and fades in (1.1s, expo out, at 0s); `intro="eyebrow"` rises 0.75rem and fades (0.8s, at 0.35s); `intro="title"` (the H1) splits into masked letters that rise from 140% below their line (Site settings > Custom code > Head has `.gsap_split_letter-mask{padding-bottom:.2em;margin-bottom:-.2em}`, because GSAP sizes each letter mask to the 0.95 line height and would otherwise clip descenders like the g; 140% keeps letters fully hidden inside the taller mask) (1.1s, expo out, 0.55s spread, from 0.45s); `intro="media"` fades in (1.2s, from 0.7s) while `intro="media-inner"` (the video) eases from 112% scale to 100% (2.2s, expo out); `intro="item"` (hero paragraph, both buttons, reel caption) rise 1rem and fade, 0.09s apart (0.9s, from 1s). The H1 no longer has `split="chars"`, so the scroll reveal doesn't touch it. Reduced motion skips to the end. To add something above the fold to the intro, give it `intro="item"`; timings are all in the one timeline.

**Logo marquee:** the client logos (`.names.is-logos`, columns 2–4 of the Selected clients row) are a clipped single-line viewport holding two identical `.logos_track` rows (`marquee="track"`; the second is `aria-hidden` with empty alts). **Logos · marquee** (page load) moves both tracks `xPercent 0 → -100` over 45s, linear, repeating forever (`repeat: -1` on the action and timeline), so when the first track has scrolled off the second sits exactly where it started and the loop is seamless, the same technique as the old site. Tracks have a 4rem gap and 4rem right padding so the seam matches the gaps. Add or remove a logo in **both** tracks. Reduced motion: doesn't animate. Speed: change the duration.

**Grid box reveal, how to use it:** put `reveal-group="grid"` on the row, `reveal-box="grid"` on each box, and `reveal="up"` (or `reveal="down"` for top-of-box markers like the stage number and duration) on each piece inside. The box clips (`overflow: clip` on desktop and tablet, `visible` on mobile so the stacked dividers show), so content appears from behind the box edge rather than floating in: `.cell.is-pad` clips already; plain cells use the `.cell.is-clip` combo (`.cell.is-col-2.is-clip` for the first capabilities column). Used on: Built for (3 boxes), What we do (3 columns, each list item separately), testimonials (3), How it works (8 stages: number and duration down, title and copy up), Adapt features (8: number down, visual, title and copy up), and the Footer component (`reveal-group` is on the footer itself, because its bottom row never reaches `top 85%` at the end of the page; the four top cells are `reveal-box` for mobile, and the bottom row just shows on mobile). Each breakpoint's interaction is set to "don't animate" on the other breakpoints, so they never both run.

The grid targets are classes, not attributes, so every grid line animates with no tagging: drop in the Grid lines component or a `.line-h` and it builds. Transform origins live on the classes (`.line-v` top, `.line-h` left). Other smaller text, body copy and buttons are static for now (29 Oct 2026: the full set was too busy) and get added back one section at a time. The old `line="h"` / `line="v"` attributes are unused.

How they trigger: each element is its own trigger (`trigger-only` target, or `within` the trigger for the columns), starting at `top 90%` unless noted. Toggles are enter **play**, leave **complete**, enter back / leave back **none**: they play once, never reverse when you scroll up, and anything you jump past (a reload mid-page) is completed rather than left hidden. Reduced motion skips to the end.

**Hovers are pure CSS, never interactions.** Every `.button` variant has a Designer `:hover` state with a 300ms colour transition (solid → accent fill with paper text, outline → accent fill and border with paper text, text → accent).

The arrow is an inline `<svg>` (16×16 viewBox, `fill="currentColor"`) inside `.button_icon`, so it takes the icon's CSS `color`. `.button_icon` reads two variables from the **Button** collection: `color` = **Arrow**, `left` = **Arrow shift** (it's `position: relative`, so the nudge doesn't move the text). A hover state on the button switches the collection's mode, and the icon picks it up:

| Mode | Arrow | Arrow shift | Set by |
|---|---|---|---|
| Base | accent | 0 | default |
| On fill | paper | 0.25rem | `.button:hover`, `.button.is-outline:hover` (orange fill, so the arrow goes white) |
| Hover | accent | 0.25rem | `.button.is-text:hover` |

It reaches buttons inside components (the footer's "Client sign in") and any new button without extra setup. For a new arrow, copy an existing `.button_icon` (↗ and → paths are on the homepage). `.nav-link`, `.menu_link`, `.work_link` and `.email-link` have colour hovers. Client sign in carries `.nav_icon`, an embed holding a `currentColor` SVG (0.75rem square), and its label is a Text Block beside it so it stays editable.

GSAP in JS (the copy Webflow already loads, not bundled) is only for things interactions can't express. Gate it on GSAP being present and on no reduced motion.

## Consent and analytics

Same accounts as the old site: Termageddon + Usercentrics (settings `Q0hwsKFJcnsAdA`), GA4 `G-ELKBMW227J` and Microsoft Clarity `tcmlnzg8yf`. Everything sits in **Site settings > Custom code > Head**, in this order:

1. **Consent Mode v2 defaults**, all denied. They have to run before any Google tag; Usercentrics sends the update (`googleConsentMode` is on in its settings).
2. **The Termageddon snippet**, unchanged: `uc-block.bundle.js`, then the CMP loader, then the translations call. `uc-block` is synchronous on purpose, because it has to be in place before anything it blocks.
3. **GA and Clarity as Usercentrics manual markup**: `type="text/plain" data-usercentrics="<Service name>"`, which the CMP activates once that service has consent. The name must match the service name in Usercentrics exactly.

Why manual markup, when `uc-block` is meant to do this: its bundle has rules for Google Analytics but none for Clarity, so Clarity is never blocked automatically, on any domain, and a Termageddon rescan doesn't change that. The old site loads Clarity through the Webflow app and it records before consent. Don't connect the Clarity app or Webflow's Google integration here, or the tags load outside this markup.

- **Withdrawing consent:** the Consent Mode update stops GA straight away and neither tag loads on the next page. One `scroll` event recorded while consent was still granted can leave in GA's 5-second batch. Clarity keeps running on the current page until navigation, unless **Microsoft Clarity consent signal** is enabled in Usercentrics. `_ga`, `_ga_*` and `_clck` stay in the browser after withdrawal.
- **Skin:** the banner renders in an open shadow root and defines its colours there, so page CSS can't reach it. `consent-skin` attaches one stylesheet to that root. Colours are the Webflow variables on `:root` (custom properties inherit into shadow DOM), so they follow the Designer. Accept and Deny share a style on purpose: the ICO asks for equal prominence. The site loads Geist up to 500, so `font-synthesis: none` stops the UI's 700 turning into a fake bold. The Usercentrics dashboard's colours and Custom CSS are the official route if the skin ever breaks after a Usercentrics update.
- **Policy pages:** `/privacy-policy` and `/cookie-policy` hold the Termageddon embeds, in `.cell.is-col-2-3.is-legal` (`overflow-wrap: anywhere`, because the policy text has long URLs we don't control). The footer's Privacy settings link and the cookie page's button use `data-consent="settings"`.
- **Corner link:** `.privacy_corner` is fixed bottom left at `Site/Margin` × `Site/Header height`, and `.privacy_button` inside it is 50% of each, so it stays centred in that corner and follows the variables. It uses `data-consent="settings"` and has no words, so its name comes from `aria-label` and `title`. It lives in the Footer component so every page with a Footer gets it, and it sits at z-index 50, under the header's mobile menu. Solid background, so it stays legible over content on tablet and phone, where the gutter is narrower than it.
- **To test:** in a fresh browser nothing from `googletagmanager.com` or `clarity.ms` should load before a choice; after Accept, GA hits carry `gcs=G101`.

## SEO and performance

- **Homepage meta** (Page settings): title, description, Open Graph title, description and image (`og-pixel-silo.jpg`, a 1200 x 630 render of the hero). The style guide has its own title and description.
- **Schema** (Page settings > Schema markup, written with the schema endpoint; the page-settings call drops it): one JSON-LD `@graph` with `ProfessionalService` (Luke as founder, Zoe, the four services), `WebSite` (en-GB) and `FAQPage` built from the six FAQ answers word for word. If an FAQ answer changes on the page, change it in the schema too. URLs point at `https://www.pixelsilo.net/`, so update them if the launch domain differs.
- **Language:** `lang="en-GB"` comes from Webflow's site language setting.
- **Contrast:** in the Light theme mode, Accent is **Colour/Orange deep** (`#b83a0a`, 5.1:1 on paper) so small orange text passes WCAG AA; dark sections keep `#ff5b1f`.
- **Lighthouse** (29 Oct 2026, staging): accessibility 100, best practices 100, SEO 100 apart from `is-crawlable`, which only fails because Webflow noindexes `webflow.io`. Performance: desktop 93–97, mobile 78–92 (measured with the per-letter heading split off on phones; it is back on, which adds roughly 300ms of blocking time on a throttled phone). A later run (31 Oct 2026, three runs each, first visit with the consent banner) gave desktop 90–93 and mobile 53–62, or 59–65 with Usercentrics blocked. Test the clean URL: a query string misses Webflow's cache and adds about half a second to the server response. Mobile is held back by Webflow's scripts at the end of `<body>` (jQuery, webflow.js, GSAP, SplitText, ScrollTrigger), which we can't defer, by the interactions runtime starting up (~700ms of main-thread work on a throttled phone), by the hero paragraph waiting for the intro (LCP about 3.8s, against 0.9s with it out of the intro on Slow 4G with 4x CPU and no banner; left as it is by choice) and, on a first visit, by the banner text being the largest element on phones. Measured costs on mobile: the per-letter heading split ~300ms, the mobile box reveal ~150ms, hairlines and columns ~50ms each. Fonts are self-hosted custom fonts (Geist and Geist Mono, Regular and Medium only, same family names as the old Google fonts, `font-display: swap`), replaced with WOFF2 subset to Latin, Latin-1, general punctuation, arrows, minus, € and ™ (14-16KB each, from 43-46KB). If copy needs a character outside that set it falls back to Arial, so re-subset from the original TTFs (fontTools `pyftsubset`). The two PNG client logos (Far and Wide, True Beauty) are now 64px-tall WebP (2-3KB, from 44KB and 9KB). What Lighthouse still flags and can't be fixed from the site: Webflow's scripts, unsized logo images (the API can't set image width/height; CLS is 0 anyway) and the 9MB hero video (loads after the page).
- **Consent banner cost** (30 Oct 2026, staging, with the banner live): accessibility, best practices and SEO still 100. Performance: desktop 89–92, mobile 50–63. On a first mobile visit the banner's description text is the largest paint (23,660px² against 17,380px² for `.text-lead`), so LCP becomes the moment the banner appears, about 5.4–6.3s under throttling, up from 3.1–4.6s. Lighthouse always tests a first visit; returning visitors never see the banner. Preconnects to the CMP hosts were tried and made no measurable difference, so they were removed. The only ways under `.text-lead` are shorter consent copy or 12px type, and the banner stays as it is.

## Delivery

```
https://cdn.jsdelivr.net/gh/pixelsilo/pixelsilo-website@vX.Y.Z/dist/site.js
```

- Always pin a git tag. **Never `@main`**: branch URLs are cached for hours and change under you.
- **Never move or re-push a tag.** jsDelivr caches tagged files permanently.
- Semver: patch for fixes, minor for new modules or globals, major when the attribute contract changes and Webflow markup has to change too.

### The loader

`snippets/loader.html` lives in **Site settings > Custom code > Footer**. The Head holds only the saved-theme snippet (`snippets/theme-head.html`), the descender fix and the consent and analytics tags (see [Consent and analytics](#consent-and-analytics)); no site script loads there. The loader has one `VERSION` constant, and that constant is the only thing that changes on release. `?dev` switches this browser to `http://127.0.0.1:5500/site.js`, and `?dev=off` switches back.

Keep `snippets/loader.html` identical to what's in Webflow. Commit it whenever `VERSION` changes.

## Release

```bash
npm run build
git add -A && git commit -m "<what changed>"
git push
git tag -a vX.Y.Z -m "<what changed>"
git push origin vX.Y.Z
```

1. Check `https://cdn.jsdelivr.net/gh/pixelsilo/pixelsilo-website@vX.Y.Z/dist/site.js` returns 200 with the new build. A brand-new tag can take a minute.
2. Bump `VERSION` in the Webflow footer loader via the Webflow API. Read the footer first, change only `VERSION`, then read it back. Update `snippets/loader.html` to match.
3. Publish to the `webflow.io` staging subdomain only, **never a custom domain**. Luke has given standing permission for staging publishes (28 Oct 2026). A publish ships every pending change on the site, not just this one.
4. On the published page, check there are no console errors and that every `[data-module]` root has `data-ready`.

**Rollback:** set `VERSION` back to the previous tag, then republish with approval.

## Secrets

No keys or tokens go in this repo, which is public. Luke handles secrets.
