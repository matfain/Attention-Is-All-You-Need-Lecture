// Records README media from dist/lecture.html into assets/media/:
// - one GIF per entry in GIFS (a slide and a list of steps),
// - title.png and overview.png (a grid of slides, each at a fixed build),
// - overview-live.gif (the same grid, with some tiles playing their builds).
// Steps:
//   ['next']                          → press → (next build, or next slide)
//   ['click', selector]               → click an element (widget button, row label, Q&A tile)
//   ['key', 'Escape']                 → press a key
//   ['slide', selector, from, to, ms] → move a range input from one value to another over ms
//   ['hold', ms]                      → keep the current frame on screen
// The GIFs are a quick glance, not real time: while recording, the deck's animations run at
// RATE of their speed (so many frames are captured), and the result plays SPEED× faster than
// the real deck, resampled to one frame every STEP ms. 'hold' and 'slide' times are output times.
// Usage: npm run gifs                    → everything
//        npm run gifs -- pe-clocks stills overview-live   → only these
import { chromium } from 'playwright';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { GIFEncoder, quantize, applyPalette } = gifenc;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'media');
const url = 'file://' + path.join(root, 'dist', 'lecture.html');
const RATE = 0.25;   // animation speed while recording
const SPEED = 3;     // playback speed of animations in the GIF, relative to the real deck
const STEP = 40;     // output frame interval in ms (25 fps)
const ANIM = 800;    // deck-time ms recorded after each next / click / key
const PAUSE = 330;   // how long each build stays on screen in the GIF

const builds = (n, pause = PAUSE) => Array.from({ length: n }, () => [['next'], ['hold', pause]]).flat();

const GIFS = [
  { name: 'map-tour', start: ['s-2-0', 0], steps: [['hold', PAUSE], ...builds(6), ...builds(1, 900)] },
  { name: 'bahdanau', start: ['s-6', 0], steps: [['hold', PAUSE], ...builds(6),
    ['click', '#s-6 g.schip.pick[data-t="0"]'], ['hold', PAUSE], ['click', '#s-6 g.schip.pick[data-t="2"]'], ['hold', PAUSE]] },
  { name: 'attention-matrix', start: ['s-2-1b', 0], steps: [['hold', PAUSE], ...builds(5, 450),
    ['click', '#mA .rlab[data-row="0"]'], ['hold', PAUSE], ['click', '#mA .rlab[data-row="2"]'], ['hold', PAUSE], ...builds(1, 900)] },
  { name: 'sqrt-dk', start: ['s-2-2', 0], steps: [['hold', PAUSE], ...builds(3, 450),
    ['click', '#s-2-2 [data-key="unscaled"]'], ['hold', PAUSE], ['click', '#s-2-2 [data-key="scaled"]'], ['hold', 700]] },
  { name: 'generation', start: ['s-2-10', 0], steps: [['hold', 600], ...builds(3, 600), ['hold', 400]] },
  { name: 'pe-clocks', start: ['s-2-7', 1], steps: [['hold', 400],
    ['slide', '#s-2-7 input[type=range]', 0, 100, 2500], ['hold', 400], ['slide', '#s-2-7 input[type=range]', 100, 0, 1200], ['hold', 400]] },
];

// the overview grid, 3 per row: [id, build] is a still tile (null = final build),
// { start, steps } plays (and loops) in overview-live.gif and shows its last frame in overview.png
// (or the slide state given as still: [id, build])
const OVERVIEW = [
  ['s-0', 0],
  { start: ['s-tok', 0], steps: [['hold', 200], ...builds(4, 350), ['hold', 700]] },
  { start: ['s-6', 0], steps: [['hold', 200], ...builds(6, 300), ['hold', 700]] },
  { start: ['s-2-1b', 0], steps: [['hold', 200], ...builds(5, 350), ['hold', 700]] },
  { start: ['s-2-3', 0], steps: [['hold', 200], ...builds(4, 400), ['hold', 700]] },
  { start: ['s-2-7', 1], steps: [['slide', '#s-2-7 input[type=range]', 0, 100, 2000], ['slide', '#s-2-7 input[type=range]', 100, 0, 1100]] },
  // Table 2 → the scatter plot → on to the parsing slide (task → data → pipeline)
  { start: ['s-3-4', 0], steps: [['hold', 600], ...builds(1, 900), ...builds(3, 450), ['hold', 300]], still: ['s-3-4', 1] },
  ['s-4-4', 3],
  { start: ['s-5-2', 0], steps: [['hold', 300], ...builds(5, 500), ['hold', 900]] },
];
const TW = 640, TH = 360, GAP = 24, COLS = 3, BG = [214, 218, 226, 255];

// ---- recording: a list of { t (output ms), data (RGBA) } keyframes, each shown until the next ----
async function openPage(browser, w, h) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, offline: true })).newPage();
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Animation.enable');
  return { page, rate: (r) => cdp.send('Animation.setPlaybackRate', { playbackRate: r }) };
}
const grab = async (page) => PNG.sync.read(await page.screenshot()).data;
const goTo = (page, [id, b]) => page.evaluate(([id, b]) => window.deck.go(id, b ?? window.deck.list().find((s) => s.id === id).builds), [id, b]);

async function record({ page, rate }, start, steps) {
  const frames = [];
  let t = 0;
  await rate(1);
  await goTo(page, start);
  await page.waitForTimeout(700);
  await rate(RATE);
  const animate = async () => {          // capture the transition at RATE, map to output time
    const t0 = Date.now(), real = ANIM / RATE;
    while (Date.now() - t0 < real) {
      const data = await grab(page);
      frames.push({ t: t + ((Date.now() - t0) * RATE) / SPEED, data });
    }
    t += ANIM / SPEED;
  };
  for (const [op, a, b, c, d] of steps) {
    if (op === 'hold') { frames.push({ t, data: await grab(page) }); t += a; }
    else if (op === 'next') { await page.keyboard.press('ArrowRight'); await animate(); }
    else if (op === 'key') { await page.keyboard.press(a); await animate(); }
    else if (op === 'click') { await page.click(a); await page.mouse.move(0, 0); await animate(); }
    else if (op === 'slide') {
      const n = Math.max(1, Math.abs(c - b));
      for (let k = 0; k <= n; k++) {
        await page.evaluate(([sel, v]) => { const r = document.querySelector(sel); r.value = v; r.dispatchEvent(new Event('input')); }, [a, Math.round(b + ((c - b) * k) / n)]);
        frames.push({ t, data: await grab(page) });
        t += d / n;
      }
    } else throw new Error(`unknown step ${op}`);
  }
  await rate(1);
  return { frames, duration: t };
}

// the keyframe on screen at output time t (looping)
const at = ({ frames, duration }, t) => {
  t %= duration;
  let lo = 0;
  while (lo + 1 < frames.length && frames[lo + 1].t <= t) lo++;
  return frames[lo].data;
};

// ---- encoding: one palette, one frame per STEP, identical frames merged, and each frame stores
// only the pixels that changed (the rest is the transparent index, which compresses to almost nothing)
function makePalette(samples) {
  const all = new Uint8Array(samples.reduce((n, d) => n + d.length, 0));
  samples.reduce((o, d) => (all.set(d, o), o + d.length), 0);
  const palette = quantize(all, 255);
  const T = palette.length;
  while (palette.length < 256) palette.push([255, 0, 255]);
  return { palette, colours: palette.slice(0, T), T };
}

function writeGif(file, w, h, ticks, frameAt, samples) {
  const { palette, colours, T } = makePalette(samples);
  const enc = GIFEncoder();
  let prev = null, pending = null, n = 0;
  const flush = () => {
    if (!pending) return;
    let px = pending.index;
    if (prev) { px = Uint8Array.from(px); for (let k = 0; k < px.length; k++) if (px[k] === prev[k]) px[k] = T; }
    enc.writeFrame(px, w, h, { palette: prev ? undefined : palette, delay: pending.delay, transparent: !!prev, transparentIndex: T, dispose: 1 });
    prev = pending.index; n++;
  };
  for (let k = 0; k < ticks; k++) {
    const index = applyPalette(frameAt(k * STEP), colours);
    if (pending && Buffer.compare(Buffer.from(pending.index.buffer), Buffer.from(index.buffer)) === 0) pending.delay += STEP;
    else { flush(); pending = { index, delay: STEP }; }
  }
  flush();
  enc.finish();
  fs.writeFileSync(file, enc.bytes());
  const mb = (fs.statSync(file).size / 1024 / 1024).toFixed(1);
  console.log(`${path.basename(file)}  ${n} frames  ${((ticks * STEP) / 1000).toFixed(1)} s  ${mb} MB`);
}

async function gif(browser, g) {
  const W = 1280, H = 720;
  const p = await openPage(browser, W, H);
  const rec = await record(p, g.start, g.steps);
  await p.page.context().close();
  const f = rec.frames;
  writeGif(path.join(outDir, `${g.name}.gif`), W, H, Math.ceil(rec.duration / STEP), (t) => at(rec, t),
    [f[0].data, f[f.length >> 1].data, f[f.length - 1].data]);
}

// ---- the grid -----------------------------------------------------------------------------
async function grid(browser, live) {
  const ROWS = Math.ceil(OVERVIEW.length / COLS);
  const GW = COLS * TW + (COLS + 1) * GAP, GH = ROWS * TH + (ROWS + 1) * GAP;
  const p = await openPage(browser, TW, TH);
  const tiles = [];
  for (const o of OVERVIEW) {
    if (Array.isArray(o)) { await goTo(p.page, o); await p.page.waitForTimeout(800); tiles.push({ still: await grab(p.page) }); }
    else {
      const rec = await record(p, o.start, o.steps);
      let last = rec.frames[rec.frames.length - 1].data;
      if (o.still) { await goTo(p.page, o.still); await p.page.waitForTimeout(800); last = await grab(p.page); }
      tiles.push({ rec, last });
    }
  }
  await p.page.context().close();
  const canvas = new PNG({ width: GW, height: GH });
  const src = new PNG({ width: TW, height: TH });
  const compose = (t) => {
    for (let k = 0; k < canvas.data.length; k += 4) canvas.data.set(BG, k);
    tiles.forEach((tile, n) => {
      src.data = Buffer.from(tile.still ?? (t == null ? tile.last : at(tile.rec, t)));
      PNG.bitblt(src, canvas, 0, 0, TW, TH, GAP + (n % COLS) * (TW + GAP), GAP + Math.floor(n / COLS) * (TH + GAP));
    });
    return canvas.data;
  };
  if (!live) {
    compose(null);
    fs.writeFileSync(path.join(outDir, 'overview.png'), PNG.sync.write(canvas));
    console.log(`overview.png  ${OVERVIEW.length} slides`);
    return;
  }
  const duration = Math.max(...tiles.filter((x) => x.rec).map((x) => x.rec.duration));
  const samples = [0, duration / 2, duration * 0.9].map((t) => Buffer.from(compose(t)));
  writeGif(path.join(outDir, 'overview-live.gif'), GW, GH, Math.ceil(duration / STEP), compose, samples);
}

async function title(browser) {
  const { page } = await openPage(browser, 1600, 900);
  await goTo(page, ['s-0', 0]);
  await page.waitForTimeout(800);
  fs.writeFileSync(path.join(outDir, 'title.png'), await page.screenshot());
  await page.context().close();
  console.log('title.png');
}

const only = process.argv.slice(2);
const want = (name) => !only.length || only.includes(name);
const known = [...GIFS.map((g) => g.name), 'stills', 'overview-live'];
const unknown = only.filter((n) => !known.includes(n));
if (unknown.length) throw new Error(`unknown: ${unknown.join(', ')}; known: ${known.join(', ')}`);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const g of GIFS) if (want(g.name)) await gif(browser, g);
if (want('stills')) { await title(browser); await grid(browser, false); }
if (want('overview-live')) await grid(browser, true);
await browser.close();
