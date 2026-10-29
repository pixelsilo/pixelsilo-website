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

npm libraries get bundled. The exceptions are GSAP (use the copy Webflow already loads) and the Lottie player, which `lottie-stagger` loads from jsDelivr only on pages that use it.

## Structure

```
src/
  main.js          # entry: GLOBALS + MODULES, boot
  global/          # site-wide init functions, run on every page
    hide-empty.js
  modules/         # opt-in modules, mounted on [data-module="<name>"]
lottie/            # Lottie generator: visuals.json (from Figma) -> build.mjs
public/lottie/     # generated Lottie JSON + SVG posters, copied into dist/lottie
dist/              # build output (committed): site.js, lottie/
snippets/
  loader.html      # the Webflow footer loader (source of truth)
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
  - **What the JS does:** it loads `lottie_light` 5.12.2 from jsDelivr, loads `lottie/<name>.json` from the same place as `site.js` (the tag, or localhost with `?dev`), hides the poster once the Lottie is ready, and plays it when 40% visible. Under reduced motion it does nothing, so the poster stays.
  - **The animations:** `lottie/build.mjs` turns `lottie/visuals.json` (the Figma frames, 384 x 128) into Lottie. It sorts each element by kind: 1px lines grow from their start, 2px content bars grow a beat later, outlined panels and arrows trace on, buttons scale from 94% and fade in, chips grow from the left with any accent fill flickering on, small squares stutter (0 1 0 1 0 1 1 0 0 1 1, 2 frames a step) and text types on a character at a time. It runs at 60fps, roughly 0.8–0.9s each, plays once and holds the last frame. Text is outlined Geist Mono, so the files need no fonts. To change one, edit `visuals.json` (or the timings at the top of `build.mjs`), run `npm run lottie -- --preview lottie/preview.html`, open the preview, then release. If a poster changes, re-upload it to Webflow.

### Globals

- **`hide-empty`** (`src/global/hide-empty.js`) hides empty Designer and CMS content on the live site only, so the Designer still shows everything:
  - `data-hide-empty` hides the element when it has no text.
  - `data-hide-empty-parent=".selector"` hides the closest matching ancestor when this element has no text.
  - `data-hide-if-list-empty` hides the element when the Collection List inside it has no items.

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
- **Buttons:** `.button` (solid), `.button.is-outline`, `.button.is-text` and `.button.is-block` (full width), each with `.button_icon` holding a `currentColor` SVG arrow. All have CSS hover states (see Motion).
- **Heading icon:** `.heading_icon` is an inline `<span>` holding a `currentColor` SVG, sized in em (0.57em × 0.54em, accent) so it scales with whatever heading it sits in. Used for the sparkle before "AI powered dashboard." Keep a real space in the text before it, so the heading reads correctly without the icon.
- **Cell gutter:** text sits flush to the left column line but never touches the right one. `.cell` has `padding-right` = **Cell / Gutter**, and `.line-h` has `margin-right` = **Cell / Line bleed** (with `width: auto`), so hairlines inside a cell still run to the line. Both variables are 0 in Base mode; `.cell` switches the Cell collection to **In cell** (2rem / −2rem) and, at small, **In cell (small)** (1.25rem / −1.25rem). `.cell.is-pad` boxes are padded all round already, so they set the collection back to Base. `.line-h.is-stack` (absolute, edge to edge) keeps `margin-right: 0`. Right-aligned content in a cell (the FAQ and work +, footer location, Enquiries) is inset by the same gutter.

## Motion

**Scroll reveals are native Webflow interactions (IX3)**, set up site-wide and targeted by custom attribute or class, with no JS in this repo. Add the attribute or class to any element in the Designer and it animates; edit timing and easing in the Interactions panel (one place for the whole site).

| Target | Interaction | Effect |
|---|---|---|
| `split="chars"` | Reveal · chars | text splits per letter; each rises 40% and fades in (0.55s, expo out, 0.4s spread across the line). **H1 and H2 only.** |
| `.grid-lines` (the Grid lines component) | Grid · columns ripple | as the section reaches `top 85%`, its `.line-v` columns draw down from the top (scaleY 0→1, 2.6s, power3 out), 0.3s apart left to right, so the columns ripple across. |
| `.line-h` | Grid · hairline draw | each hairline draws in from the left as it reaches `top 92%` (scaleX 0→1, 2.2s, power3 out). |
| `reveal-group` (a row) | Grid · box reveal, row | **desktop and tablet.** When the row reaches `top 85%`, every `reveal="down"` inside drops in from 1.5rem above (0.12s apart) and every `reveal="up"` rises from 1.5rem below (0.07s apart, starting 0.1s later). All fade 0→100%, 1.1s, power3 out. The stagger runs in DOM order, so it travels across the boxes. |
| `reveal-box` (a box) | Grid · box reveal, mobile | **small and tiny only** (boxes stack, so each box triggers itself at `top 88%`). Same moves as the row version. |

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

It reaches buttons inside components (the footer's "Client sign in") and any new button without extra setup. For a new arrow, copy an existing `.button_icon` (↗ and → paths are on the homepage). `.nav-link`, `.work_link` and `.email-link` have colour hovers.

GSAP in JS (the copy Webflow already loads, not bundled) is only for things interactions can't express. Gate it on GSAP being present and on no reduced motion.

## Delivery

```
https://cdn.jsdelivr.net/gh/pixelsilo/pixelsilo-website@vX.Y.Z/dist/site.js
```

- Always pin a git tag. **Never `@main`**: branch URLs are cached for hours and change under you.
- **Never move or re-push a tag.** jsDelivr caches tagged files permanently.
- Semver: patch for fixes, minor for new modules or globals, major when the attribute contract changes and Webflow markup has to change too.

### The loader

`snippets/loader.html` lives in **Site settings > Custom code > Footer**. The **Head is left empty.** The loader has one `VERSION` constant, and that constant is the only thing that changes on release. `?dev` switches this browser to `http://127.0.0.1:5500/site.js`, and `?dev=off` switches back.

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
