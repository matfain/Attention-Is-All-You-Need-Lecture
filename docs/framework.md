# Framework

How the deck is built, and how to reuse it for your own deck. It uses plain HTML, CSS, JS and SVG: one engine file, a set of drawing helpers, and one file per slide. There is no front-end framework, and the output is a single offline HTML file.

- [Architecture](#architecture)
- [A slide, end to end](#a-slide-end-to-end)
- [Builds](#builds)
- [Math](#math)
- [Data](#data)
- [Components](#components)
- [Engine features](#engine-features)
- [The build](#the-build)
- [The review harness](#the-review-harness)
- [Making your own deck](#making-your-own-deck)
- [Gotchas](#gotchas)

## Architecture

```
src/index.html          shell: CSP (no network), placeholders for fonts, CSS, data, JS
src/engine/deck.js      canvas scaling, navigation, builds, URL hash, footer, Q&A jumps, FLIP helper
src/components/*.js     drawing helpers on the global C (chips, attention lines, matrices, map, …)
src/styles/*.css        tokens.css (design tokens) → base → components → per-part slide styles
src/slides/manifest.json  slide order
src/slides/partN/*.js   one file per slide, each calls Deck.slide({...})
src/data/*.json         every number shown on a slide → window.DATA.<camelCaseName>
build/build.js          inlines everything into dist/lecture.html, pre-renders KaTeX
test/review.mjs         screenshots + automatic checks (Playwright)
scripts/make-gifs.mjs   README media
```

At runtime the slide modules register themselves, the engine creates one `<section>` per slide on a 1920 × 1080 stage, scales the stage to the window, and renders a slide each time it is entered.

## A slide, end to end

A complete slide with two builds, a formula, a number from `/data` and a small interactive control:

```js
/* src/slides/part2/s-example.js: softmax temperature. Build 0: the formula · 1: the bars (T = 0.5)
 * · 2: T = 2 + the bottom line. The builds drive the toggle, which stays clickable (clicks on it
 * never advance the deck). */
(function () {
  const D = DATA.part2.example;                      // src/data/part2.json → "example": {...}

  Deck.slide({
    id: 's-example',                                 // stable ID: URL hash, Questions tiles, tests
    part: 2,                                         // footer progress segment
    title: 'Softmax Has a Temperature',
    cite: 'Vaswani et al., 2017',                    // footer citation
    builds: 2,                                       // build steps after build 0
    thumb: ['enc-mha'],                              // map thumbnail, these blocks highlighted
    render() {                                       // called on EVERY entry → widgets reset
      return `
        <div class="abs anchor-line" style="left:0;right:0;top:200px;text-align:center">
          ${tex`\alpha_j = \exp(e_j / T) \,/\, \sum_m \exp(e_m / T)`}
        </div>
        <div class="abs" data-build="1" style="left:660px;top:340px">
          ${C.seg('temp', [{ key: 'low', label: 'T = 0.5' }, { key: 'high', label: 'T = 2' }], 'low')}
          <svg class="abs" width="600" height="300" style="left:0;top:90px">
            ${C.weightBars({ x: 60, y: 260, labels: D.labels, weights: D.low })}
          </svg>
        </div>
        <div class="abs anchor-line" data-build="2" style="left:0;right:0;top:820px;text-align:center">
          lower <b>temperature</b> → sharper weights
        </div>`;
    },
    mount(el) {                                      // after render: wire interactions
      const bars = el.querySelector('g.wbars');
      const select = C.wireSeg(el, 'temp', (k) => C.setWeightBars(bars, D[k]));  // live clicks
      return {
        update(b) {                                  // derive ALL build state from b alone
          const k = b >= 2 ? 'high' : 'low';
          select(k);
          C.setWeightBars(bars, D[k]);
        },
      };
    },
  });
})();
```

Then add `"part2/s-example.js"` to `src/slides/manifest.json`, the numbers to `src/data/part2.json`, slide styles to the part's CSS file, and run `npm run build`.

### `Deck.slide({...})` options

| Option | Meaning |
|---|---|
| `id` | stable slide ID (URL hash `#s-2-1b`, `Deck.jump`, tests) |
| `part` | 1–5, the footer segment it belongs to |
| `title` | HTML title (centred, auto-shrinks to stay on one line) |
| `cite` | footer citation HTML |
| `builds` | number of build steps after build 0 |
| `thumb` | array of architecture-map block IDs → map thumbnail top-right |
| `numbered` | `false` for unnumbered slides (the References backup) |
| `noFooter`, `hideProgress` | footer off entirely / progress bar off (title, roadmap) |
| `cls` | extra class on the slide's `<section>` |
| `render()` | returns the slide's HTML, called on every entry |
| `mount(el)` | optional, returns `{ update(build), leave({ to, dir, instant }) }` |

## Builds

- `data-build="k"`: the element is visible from build `k` on.
- `data-build-max="k"`: the element is hidden after build `k`. Both together give a range (e.g. a visual that is replaced).
- `update(b)` runs after every build change. It must compute the whole build-dependent state from `b` alone, never from the previous state, because the review harness checks that going forward and then backward gives identical DOM.
- Entering a slide forward starts at build 0. Entering it backward shows its final build. Re-entering always re-renders (widgets reset).
- **Builds can drive widgets** (S14, S19): `update(b)` sets the slider or toggle, so the talk runs on the clicker, and the widget remains playable between clicks.
- **Clicks:** a click on the slide background advances. Clicks on buttons, inputs, the footer and anything with `data-interactive` do not. Toggle `data-interactive` only while an interaction is live.

## Math

Write `` tex`...` `` (inline) or `` texd`...` `` (display) anywhere in slide or component JS:

```js
`${tex`\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V`}`
```

`build/build.js` replaces each one with KaTeX HTML at build time, so the deck ships KaTeX's CSS and fonts but not its JS. There is one restriction: **no `${}` inside a tex literal** (the build fails). For a label that varies, pre-render each variant: `const H = [tex`h_1`, tex`h_2`, tex`h_3`];`.

Arrows and symbols in running text (→, ≈, ≤) go through `C.sym('…')`, which swaps in KaTeX glyphs. Never pass KaTeX output through it.

## Data

- Every number a slide shows lives in `src/data/*.json`. `part2.json` becomes `DATA.part2` and `toy-attention.json` becomes `DATA.toyAttention`.
- Exact values are stored, and display rounding happens in components. `C.roundDist` rounds a distribution to 2 decimals with the largest remainder, so it still sums to 1.00.
- Notes about provenance ("from Table 3", "illustrative") go in `_note` / `_source` fields next to the numbers.
- `DATA.deck` holds the part labels and `totalSlides` (shown as "n / 36" in the footer).
- Image files in `assets/logos/` are inlined as `DATA.logos.<name>` (data URIs).

## Components

All on the global `C`. They return SVG or HTML strings (to embed in `render()`), and some have a setter to update them in place.

| Helper | What it draws |
|---|---|
| `C.chip({cx, cy, text, role, state})`, `C.chipHTML(text, role)` | token chip (SVG / inline HTML), `role` src · tgt · q · k · v |
| `C.curve(x1, y1, x2, y2)`, `C.attnStyle(w)`, `C.attnLines(lines)` | attention lines: width 1 + 9w px, opacity 0.15 + 0.85w |
| `C.matrix({values, rows, cols, mode, roundRows, masked, clickableRows, frame, shape})` | numbers / heatmap / both, row highlight (`C.setMatrixRow`), masked cells, clickable row labels |
| `C.matrixAbstract({rows, cols, shape})` | "⋯ ⋮ ⋱" matrix for scale-up views |
| `C.vbar({x, y, values, role})`, `C.setVbar` | small vector of shaded cells |
| `C.weightBars({x, y, labels, weights})`, `C.setWeightBars` | softmax bar chart with values |
| `C.table({head, rows})` | booktabs table |
| `C.seg(name, options, active)`, `C.wireSeg(root, name, onChange)` | segmented toggle (also a display-only tab row) |
| `C.archMap({mode, width})`, `C.archMapApi(svg)` | the paper's Figure 1 as SVG, `highlight(ids)`, `dim`, `pulse(edgeId)`, `showBadge(id, text)` |
| `C.archMapBox(id)`, `C.archMapVB` | block geometry, for callouts next to blocks |
| `C.ov(x, y, html, anchor)` | absolutely positioned HTML (KaTeX labels) over an SVG in canvas px |
| `C.icon(name)`, `C.badge(html)`, `C.sym(text)`, `C.fmt(v)`, `C.esc(s)`, `C.ramp(w)`, `C.rampInk(w)` | small utilities |

**Architecture map block IDs:**
- `inputs`, `in-embed`, `in-pe`
- `enc-mha`, `enc-addnorm1`, `enc-ffn`, `enc-addnorm2`, `enc-stack`
- `outputs-shifted`, `out-embed`, `out-pe`
- `dec-masked-mha`, `dec-addnorm1`, `dec-cross-mha`, `dec-addnorm2`, `dec-ffn`, `dec-addnorm3`, `dec-stack`
- `linear`, `softmax`, `out-probs`, `enc-to-dec`

Highlighting a block also lights its wires.

**Shared CSS classes:**
- `.abs`: absolute position in canvas px.
- `.anchor-line`: 32 px, bold in `--key`.
- `.caption`, `.muted`.
- `.stage-title` / `.stage-sub`: the "no bullets" stages, see [`design.md`](design.md).
- `.q-ink`, `.k-ink`, `.v-ink`, `.src-ink`, `.tgt-ink`, `.problem-ink`: role text colours.

## Engine features

- **Navigation:**
  - next: → / Space / PageDown / background click; previous: ← / PageUp.
  - first / last: Home / End.
  - `F` toggles fullscreen.
  - The URL hash keeps your place on reload.
- **Footer:** progress segments from `DATA.deck.parts`, each jumping to the part's first slide with a footer. A `footerOnly` part ("Questions") appears only in the footer.
- **Questions hub:** `Deck.jump(id)` (used by the S36 tiles) opens a slide at its final build and shows "← back to Questions". The button or Esc returns, and any other navigation clears it.
- **FLIP transitions:** `Deck.flip(srcEl, dstEl, ms, { tail })` flies a clone from one element's box to another's (Roadmap → footer, map → thumbnail). It is called from a slide's `leave()`.
- **Measuring:** `Deck.stageRect(el)` returns an element's box in canvas px, for drawing arrows between laid-out elements (S13's $\times W^O$ arrow, S15's residual loop).
- **Title fitting:** titles shrink from 54 to 46 px to stay on one line.
- **Reduced motion:** `Deck.reduced`, and the CSS motion tokens drop to 0 ms.
- **Test API:** `window.deck.go(id, build)`, `next()`, `prev()`, `state()`, `list()`.

## The build

`npm run build` (`build/build.js`):

1. reads the CSS files, components, engine and the slides in manifest order,
2. replaces every `tex`/`texd` literal with KaTeX HTML,
3. inlines fonts as base64 woff2 (Atkinson Hyperlegible, JetBrains Mono, KaTeX, plus the "Deck Digits" face),
4. inlines all `src/data/*.json` and `assets/logos/*`,
5. fills the placeholders in `src/index.html` and fails if any external `src=`/`href=` remains.

The result, `dist/lecture.html` (~1.3 MB), opens by double-click. Its Content-Security-Policy (`default-src 'none'`) makes network access impossible.

## The review harness

`npm run review` builds the deck and runs `test/review.mjs` in headless Chromium, offline:

- screenshots of every slide × every build, plus key widget states → `review/latest/` (or `npm run review -- <label>`),
- checks:
  - build reversibility (forward vs backward DOM),
  - backward entry lands on the final build,
  - widget reset on re-entry,
  - clicks on widgets don't advance and the background does,
  - keyboard navigation, footer navigation, the Questions tiles with back button and Esc,
- **no text below 20 px**, no wrapped titles, no slide IDs leaking into slide text,
- no console errors, no network requests, reduced motion honoured, letterboxing at 1366×768 and 1024×768,
- `--firefox` adds a quick Firefox pass.

Problems are listed in `review/latest/report.txt`. The checks don't cover layout (overlaps, crowding, alignment), so the screenshots need to be looked at too. When working with a coding agent, have it run the review, read the report, look at the screenshots of the slides it changed and fix what it finds before reporting back. This deck was built that way.

## Making your own deck

1. Fork the repo, run `npm install`.
2. Keep `src/engine/`, `src/components/`, `src/styles/tokens.css` / `base.css` / `components.css`, `build/` and `test/`.
3. Replace `src/slides/` (and the manifest), `src/data/`, the per-part CSS files and `assets/logos/`.
4. Update `DATA.deck` (part labels, `totalSlides`) and the title in `src/index.html`.
5. Adapt `test/review.mjs`: its widget states and navigation checks name this deck's slide IDs.
6. Write your own content document (like [`lecture-content.md`](lecture-content.md)) and a `CLAUDE.md` for your agent.

For a different topic you mostly write new slides and data. The architecture-map component is the only part specific to this paper.

## Gotchas

- **Reversibility false positives:** toggling classes can leave `class=""`, reordered class lists or empty `style=""`. Use `el.hidden` / full `style.cssText`, or normalise in the test.
- **Fonts load before init:** the engine waits for the inlined fonts so title fitting and chip widths are measured correctly.
- **Measure in `mount()`:** elements of later builds are `visibility: hidden`, not `display: none`, so they already have layout.
- **Hidden footer progress must not be clickable** (`pointer-events: none`).
- **Mouse-clicked controls are blurred on pointerup,** so Space and the arrows keep driving the deck.
- **SVG crops via `viewBox` need `overflow: hidden`** to actually clip.
- **CSS name clashes across slides:** prefix slide-specific classes (`.s35-…`, `.tv-…`). A generic name like `.stat b` can restyle another slide.
