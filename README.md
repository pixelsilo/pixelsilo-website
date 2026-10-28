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

`dist/` is committed because jsDelivr serves files straight from the repo. Always run `npm run build` before you commit a release.

npm libraries get bundled. GSAP is the exception: use the copy Webflow already loads.

## Structure

```
src/
  main.js          # entry: GLOBALS + MODULES, boot
  global/          # site-wide init functions, run on every page
    hide-empty.js
  modules/         # opt-in modules, mounted on [data-module="<name>"]
dist/site.js       # build output (committed)
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

## Grid and hairlines

The site is drawn on a 4-column grid, and the hairlines are the grid. They're built to stay pixel-tight at every width and to be animatable later.

**Rules**

0. **Set gaps with Webflow's names, `grid-row-gap` / `grid-column-gap`.** Gaps set through the API as plain `row-gap` / `column-gap` render, but the Designer's Gap field shows 0 and can't edit them. Both names produce the same CSS.
0. **Always set grid rows and gaps explicitly.** If a grid only defines columns, the Designer seems to apply Webflow's default grid after load (two auto rows plus gaps). An empty second row then takes the leftover height and pushes content up. `.row` sets `grid-template-rows: auto`, `grid-auto-rows: auto` and zero gaps; the header uses `grid-template-rows: 100%`.
0. **Build lines as Div Blocks, never custom (DOM) elements.** The Designer draws empty custom elements as roughly 72px placeholder boxes, while the browser draws them at 1px. This applies to any empty decorative element.
1. **Lines are elements, never borders.** `.line-v` and `.line-h` are 1px divs (`Border/Hairline`) with a `line="v"` / `line="h"` attribute for future animation hooks. Cells, cards and media never get borders, so two edges can't sit side by side and double up.
2. **One line per edge.** A horizontal line belongs to the block above it: each `.row` is followed by a `.line-h`, and a section ends with one. The Header component owns the line under it, so the hero starts without one.
3. **Solid colour.** `Theme/Hairline` is a solid colour, not a transparent one: `#232324`, which is white 10% pre-mixed on Ink 950, and `#D5D4D1` in `theme-light`. Where two lines cross, a transparent colour would get brighter; a solid one doesn't.
4. **Content touches the line.** As in the Figma, content starts exactly on its column's hairline: `.cell` has no left padding and keeps a right gutter (3rem desktop, 2rem tablet, 1rem mobile) before the next line. Inset content only on purpose (the reel label is 1.5rem inside the reel).
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

## Motion

**Scroll reveals are native Webflow interactions (IX3)**, set up site-wide and targeted by attribute, with no JS in this repo:

| Attribute | Effect |
|---|---|
| `slide="item"` | the element rises and fades in |
| `slide="children"` | its direct children rise and fade in, staggered (card grids, Collection Lists) |
| `split="words"` | heading text splits into words that rise and fade in, staggered |
| `split="chars"` | the same per letter (short headings only) |

All four start at `top 85%` and end at `bottom top`, with the start clamp **off**. If start equals end with clamp on, anything already past the line at load (the hero, the first section) never plays. They fire once and are set to **not animate under `prefers-reduced-motion`**. Edit timing and easing in the Interactions panel, which is one place for the whole site.

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
