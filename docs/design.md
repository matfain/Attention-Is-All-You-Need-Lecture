# Design

The visual rules of the deck. Values are defined in `src/styles/tokens.css`. For the engine and build, see [`framework.md`](framework.md).

The deck was made for a projector in a classroom, so text is large, contrast is high, and lines are thick. Slides carry short phrases, and the explanation is spoken.

## Canvas and layout

- Slides are authored on a 1920 × 1080 canvas and scaled to the window, with letterboxing in `--paper-deep`.
- Margins: 112 px left and right, 80 px top, ~96 px at the bottom for the footer.
- Titles are centred, 54 px, on one line. The engine shrinks a long title to 46 px at most, and anything longer has to be shortened.
- Footer on every slide except the title: part progress (clickable), citation, slide number.
- Part 2 component slides show a small architecture map top-right with the current block highlighted.
- Bullets are left-aligned. Equations, stage titles and bottom lines are centred.

### Slides without bullets

Most diagram slides use stage titles instead of a bullet list:

```
┌───────────────────────────────────────────────────────────┐
│                       Slide Title                         │
│              framing line (optional, build 0)             │
│                                                           │
│    Stage One          Stage Two          Stage Three      │  ← .stage-title, one per build
│  ─────────────      ─────────────      ─────────────      │
│   subtitle            subtitle           subtitle         │  ← .stage-sub
│   [ visual ]   →      [ visual ]   →     [ visual ]       │
│                                                           │
│            bottom line (optional, last build)             │
│ ───────────────────────────────────────────────────────── │
│ ● Part 1 — ○ Part 2 …          citation             12/36 │
└───────────────────────────────────────────────────────────┘
```

- Build 0 shows the title, sometimes with a framing line or the starting object.
- Each build adds one stage: `.stage-title` (34 px bold, centred, with a 3 px rule under it) and optionally `.stage-sub` (30 px).
- A bottom line states the conclusion, usually on the last build.
- A stage title takes a role colour when the stage has one (e.g. Encoder in blue, Decoder in orange), otherwise ink.

## Colour

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F4F5F7` | slide background |
| `--paper-deep` | `#E9ECF1` | letterbox, light panels |
| `--panel` | `#FCFCFD` | tables, widgets |
| `--ink` | `#1A2232` | text, axes, arrows, outlines |
| `--graphite` | `#5D6678` | captions, footer, secondary data |
| `--rule` | `#D5DAE2` | hairlines, gridlines, dimmed outlines |

Each role colour has one fixed meaning across the deck:

| Token | Fill | Text variant | Used for |
|---|---|---|---|
| `--src` | `#2D5BD2` | `#1F43A3` | source / encoder |
| `--tgt` | `#E8811A` | `#A85A08` | target / decoder |
| `--q` | `#7347C9` | `#55309F` | queries |
| `--k` | `#138FB3` | `#0C6A86` | keys |
| `--v` | `#4E9A2E` | `#36731D` | values |
| `--problem` | `#D1323F` | `#A3212C` | bottlenecks, sequential steps, masking, the $O(n^2)$ cost |
| `--key` | `#4F64AE` | (used as text) | bold key terms, the Transformer's results in Part 3 |

- Fills and tints (~14 % over paper) use the main value. Text uses the darker variant, for contrast.
- Elements without a role are ink or grey.
- Green is reserved for values, so ticks are drawn in ink on a light badge.
- Highlighting uses contrast rather than a new colour: the highlighted item is ink and bold, the rest graphite or faded. On the map, the highlighted block gets a 3 px outline and the others drop to ~25 % opacity.
- Attention heatmaps use one ramp from paper to dark indigo: `#F4F5F7 → #C9D2EA → #8E9FD3 → #4F64AE → #22305E`. Cell text turns white above ~0.5. The positional-encoding heatmap uses a grey ramp.
- Masked cells are hatched and show −∞ in score matrices and 0 in weight matrices.

## Typography

- **Atkinson Hyperlegible** for all text.
- **KaTeX** fonts for math. Math is always rendered by KaTeX, never typed in the text font.
- **JetBrains Mono** only for literal tokens in chips (`<BOS>`, words) and the parse-tree brackets.

| Element | Size |
|---|---|
| Title slide: title / subtitle | 84 / 40 px |
| Slide title | 54 px bold |
| Display equation | ~44 px |
| Anchors, bottom lines | 32 px |
| Stage title / subtitle | 34 px bold / 30 px |
| Labels, token chips | 26–28 px |
| Captions, axes | 22–24 px |
| Footer | 20 px |

- **Minimum text size is 20 px.** The review script checks this.
- Digits: Atkinson's slashed zero looks like "Ø", so digits in running text use a digits-only face built from KaTeX_Main ("Deck Digits", first in `--font-text`). The digits then match those in the math.
- Sentence case. Bold only for key terms, in `--key`. No semicolons on slides.

## Motion and interaction

- Slide change: ~200 ms crossfade. Build step: ~180 ms fade.
- Two animated transitions: the Roadmap path shrinking into the footer (S2 → S3) and the big map shrinking into the Part 2 thumbnail (S11 → S12).
- The title slide's background lines are the only continuous animation.
- Sliders and toggles update immediately. Nothing important is shown only on hover.
- Where a slide has a widget, the builds set its state, so the slide can be presented with the clicker alone. The widget can still be used by hand.
- With `prefers-reduced-motion`, all motion becomes an instant change.

## Other rules

- Displayed distributions sum to exactly 1.00 (largest-remainder rounding).
- The matrix at the end of an arrow is that operation's output. Parameters such as $W^O$ are shown separately.
- No "illustrative" labels or explanatory captions on visuals. Sources go in the footer.
- Metric names carry ↑ / ↓. A truncated axis shows its start value.
- Tables: 2 px top and bottom rules, 1 px under the header, no vertical lines.
