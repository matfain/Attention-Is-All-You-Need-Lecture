// Self-review: opens dist/lecture.html OFFLINE in Chromium, screenshots every slide × build state
// and key widget states into review/<label>/, and checks build reversibility, click isolation,
// widget reset, footer + Questions navigation, text size, titles, console errors and network requests.
// Problems are listed in review/<label>/report.txt. Look at the screenshots too: the checks cannot see layout.
// Usage: npm run review                    → review/latest/
//        npm run review -- before-fix      → review/before-fix/
//        npm run review -- --firefox       → also a quick Firefox pass (npx playwright install firefox)
import { chromium, firefox } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const withFirefox = args.includes('--firefox');
const label = args.find((a) => !a.startsWith('--')) || 'latest';
const outDir = path.join(root, 'review', label);
fs.rmSync(outDir, { recursive: true, force: true });
if (withFirefox) fs.mkdirSync(path.join(outDir, 'firefox'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'viewports'), { recursive: true });
const url = 'file://' + path.join(root, 'dist', 'lecture.html');
const SETTLE = 450;
const problems = [];

// Key widget states per slide: [name, async (page) => {...}, build (default: last)]
const setRange = (sel, v) => (p) => p.evaluate(([sel, v]) => { const r = document.querySelector(sel); r.value = v; r.dispatchEvent(new Event('input')); }, [sel, v]);
const WIDGETS = {
  's-2-1b': [
    ['row-the-b3', (p) => p.click('#mA .rlab[data-row="0"]'), 3],
    ['row-cat-b4', (p) => p.click('#mA .rlab[data-row="1"]'), 4],
  ],
  's-2-2': [
    // the builds drive the widget (0–1: default d_k unscaled · 2: largest d_k unscaled · 3: largest d_k scaled)
    ['dk4-unscaled-b0', setRange('#s-2-2 input[type=range]', 0), 0],
    ['dk256-unscaled-b2', setRange('#s-2-2 input[type=range]', 3), 2],
    ['dk4-scaled-b3', setRange('#s-2-2 input[type=range]', 0), 3],
    ['click-unscaled-b3', (p) => p.click('#s-2-2 [data-key="unscaled"]'), 3],
  ],
  's-2-7': [0, 7, 60, 100].map((v) => [`pos-${v}`, setRange('#s-2-7 input[type=range]', v)]),
  's-6': [0, 2, 1].map((t) => [`target-${t}`, (p) => p.click(`#s-6 g.schip.pick[data-t="${t}"]`)])
    .concat([['heatmap-row-0', (p) => p.click('#s-6 .rlab[data-row="0"]')]]),
};

async function openPage(browserType, viewport, reducedMotion = 'no-preference') {
  const browser = await browserType.launch();
  const context = await browser.newContext({ viewport, offline: true, reducedMotion });
  const page = await context.newPage();
  const log = [];
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith('file:') || u.startsWith('data:')) return route.continue();
    log.push(`NETWORK REQUEST blocked: ${u}`);
    return route.abort();
  });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) log.push(`console.${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => log.push(`pageerror: ${e.message}`));
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  return { browser, page, log };
}

const go = (page, id, b) => page.evaluate(([id, b]) => window.deck.go(id, b), [id, b]);
const sig = (page) => page.evaluate(() => {
  const el = document.querySelector('.slide.active');
  if (el.id === 's-0') return 's-0';
  const c = el.cloneNode(true);
  c.querySelectorAll('.pulse').forEach((p) => p.remove());
  c.querySelectorAll('[class]').forEach((e) => e.setAttribute('class', [...e.classList].sort().join(' ')));
  return c.innerHTML.replace(/ class=""/g, '');
});

async function chromiumPass() {
  const { browser, page, log } = await openPage(chromium, { width: 1920, height: 1080 });
  const slides = await page.evaluate(() => window.deck.list());
  // Fonts actually loaded?
  await go(page, 's-6', 0);
  await page.waitForTimeout(600);
  const fontsOk = await page.evaluate(async () => {
    await document.fonts.ready;
    const loaded = new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
    return ['Atkinson Hyperlegible', 'JetBrains Mono', 'KaTeX_Main', 'KaTeX_Math'].map((f) => [f, loaded.has(f)]);
  });
  fontsOk.filter(([, ok]) => !ok).forEach(([f]) => problems.push(`font not available: ${f}`));

  let n = 0;
  for (const s of slides) {
    for (let b = 0; b <= s.builds; b++) {
      await go(page, s.id, b);
      await page.waitForTimeout(SETTLE);
      await page.screenshot({ path: path.join(outDir, `${String(++n).padStart(3, '0')}-${s.id}-b${b}.png`) });
    }
    for (const [name, act, wb] of WIDGETS[s.id] || []) {
      await go(page, s.id, wb ?? s.builds);
      await page.waitForTimeout(150);
      const before = await page.evaluate(() => window.deck.state());
      await act(page);
      await page.waitForTimeout(SETTLE);
      const after = await page.evaluate(() => window.deck.state());
      if (before.id !== after.id || before.build !== after.build) problems.push(`${s.id}: widget "${name}" advanced the deck`);
      await page.screenshot({ path: path.join(outDir, `${String(++n).padStart(3, '0')}-${s.id}-widget-${name}.png`) });
    }
  }

  // Reversibility: forward through all builds, then back; states must match exactly.
  for (const s of slides) {
    if (!s.builds) continue;
    await go(page, s.id, 0);
    const fwd = [];
    for (let b = 0; b <= s.builds; b++) {
      if (b) await page.evaluate(() => window.deck.next());
      await page.waitForTimeout(SETTLE);
      fwd.push(await sig(page));
    }
    for (let b = s.builds; b >= 0; b--) {
      await page.waitForTimeout(SETTLE);
      if ((await sig(page)) !== fwd[b]) problems.push(`${s.id}: build ${b} differs going backward`);
      if (b) await page.evaluate(() => window.deck.prev());
    }
  }
  // Entering backward shows the final build state.
  for (let i = 1; i < slides.length; i++) {
    await go(page, slides[i].id, 0);
    await page.evaluate(() => window.deck.prev());
    const st = await page.evaluate(() => window.deck.state());
    if (st.id !== slides[i - 1].id || st.build !== slides[i - 1].builds) problems.push(`backward entry into ${slides[i - 1].id} not at final build`);
  }
  // Widgets reset on re-entry.
  await go(page, 's-6', 6);
  await page.click('#s-6 g.schip.pick[data-t="0"]');
  await go(page, 's-7', 0);
  await go(page, 's-6', 6);
  const sel = await page.evaluate(() => document.querySelector('#s-6 .rlab .chip.highlight').textContent);
  if (sel !== 'Katze') problems.push('s-6 selection did not reset on re-entry');
  // s-2 tabs are display-only: clicking them advances the build
  await go(page, 's-2', 0);
  await page.click('#s-2 [data-seg="ex"]', { force: true });
  await page.waitForTimeout(80);
  if ((await page.evaluate(() => window.deck.state().build)) !== 1) problems.push('s-2 indicator click did not advance the build');
  // Click on background advances; keyboard works.
  // (s-4 has build steps: a click goes to its build 1)
  await go(page, 's-4', 0);
  await page.mouse.click(1500, 300);
  await page.waitForTimeout(100);
  { const st = await page.evaluate(() => window.deck.state()); if (st.id !== 's-4' || st.build !== 1) problems.push('background click did not advance'); }
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  if ((await page.evaluate(() => window.deck.state().id)) !== 's-3') problems.push('ArrowLeft navigation failed');
  // Space after clicking a widget button must advance (button must not keep focus).
  await go(page, 's-6', 6);
  await page.click('#s-6 g.schip.pick[data-t="2"]');
  await page.waitForTimeout(50);
  await page.keyboard.press(' ');
  await page.waitForTimeout(50);
  if ((await page.evaluate(() => window.deck.state().id)) !== 's-7') problems.push('Space after widget click did not advance');

  // Footer roadmap: clicking a part jumps to its first slide with a footer.
  await go(page, 's-2-4', 0);
  await page.click('.footer .seg[data-part="1"]');
  await page.waitForTimeout(80);
  if ((await page.evaluate(() => window.deck.state().id)) !== 's-1') problems.push('footer roadmap: Part 1 did not jump to s-1');
  await go(page, 's-5', 0); // (on the Roadmap itself the progress bar is hidden and not clickable)
  await page.click('.footer .seg[data-part="2"]');
  await page.waitForTimeout(80);
  if ((await page.evaluate(() => window.deck.state().id)) !== 's-2-0') problems.push('footer roadmap: Part 2 did not jump to s-2-0');
  await page.click('.footer .seg[data-part="3"]');
  await page.waitForTimeout(80);
  if ((await page.evaluate(() => window.deck.state().id)) !== 's-3-1') problems.push('footer roadmap: Part 3 did not jump to s-3-1');
  for (const [part, id] of [[4, 's-4-1'], [5, 's-5-1'], [6, 's-5-3']]) {
    await page.click(`.footer .seg[data-part="${part}"]`);
    await page.waitForTimeout(80);
    if ((await page.evaluate(() => window.deck.state().id)) !== id) problems.push(`footer roadmap: Part ${part} did not jump to ${id}`);
  }

  // Questions tiles: jump to the target in its final build, show the back button,
  // return by button (and by Esc); the button disappears once you navigate away.
  await go(page, 's-5-3', 0);
  const qaTargets = await page.evaluate(() => [...document.querySelectorAll('#s-5-3 .qa-tile')].map((t) => t.dataset.target));
  for (const [i, target] of qaTargets.entries()) {
    await go(page, 's-5-3', 0);
    await page.waitForTimeout(80);
    await page.click(`#s-5-3 .qa-tile[data-target="${target}"]`);
    await page.waitForTimeout(150);
    const st = await page.evaluate(() => window.deck.state());
    if (st.id !== target || st.build !== st.builds || !st.qa) problems.push(`Q&A tile ${target}: landed on ${st.id} b${st.build}/${st.builds}, back=${st.qa}`);
    if (!(await page.isVisible('.back-btn'))) problems.push(`Q&A tile ${target}: back button not visible`);
    if (i === 0) await page.screenshot({ path: path.join(outDir, `qa-jump-${target}.png`) });
    if (i % 2) await page.keyboard.press('Escape'); else await page.click('.back-btn');
    await page.waitForTimeout(150);
    if ((await page.evaluate(() => window.deck.state().id)) !== 's-5-3') problems.push(`Q&A tile ${target}: back (${i % 2 ? 'Esc' : 'button'}) did not return`);
  }
  if (qaTargets.length !== 8) problems.push(`Questions slide has ${qaTargets.length} tiles (expected 8)`);
  await page.click('#s-5-3 .qa-tile[data-target="s-2-2"]');
  await page.waitForTimeout(100);
  await page.evaluate(() => window.deck.next());
  await page.waitForTimeout(100);
  if (await page.isVisible('.back-btn')) problems.push('back button still visible after navigating away');
  await go(page, 's-2-2', 0);
  if (await page.isVisible('.back-btn')) problems.push('back button visible without a Q&A jump');

  // Text size audit: no rendered text below 20px (canvas px).
  const small = await page.evaluate(async (ids) => {
    const out = [];
    for (const id of ids) {
      window.deck.go(id, 99);
      await new Promise((r) => setTimeout(r, 60));
      const el = document.getElementById(id);
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        const p = node.parentElement;
        if (p.closest('.katex, .amap.thumb, .amap.faded, .motif')) continue;
        const fs = parseFloat(getComputedStyle(p).fontSize);
        if (fs < 20) out.push(`${id}: "${node.textContent.trim().slice(0, 30)}" ${fs}px`);
      }
    }
    return out;
  }, slides.map((s) => s.id));
  small.forEach((m) => problems.push('text < 20px: ' + m));

  // No on-slide spec IDs ("slide 2.10", "(see 4.2)", "2.1b", "s-2-3") and no wrapped titles.
  const audit = await page.evaluate(async (ids) => {
    const out = [];
    const SPEC = [/\b(slide|see)\s+\d\.\d+/i, /\b\d\.\d+[ab]\b/, /\bs-\d(-\d+[ab]?)?\b/];
    for (const id of ids) {
      window.deck.go(id, 99);
      await new Promise((r) => setTimeout(r, 60));
      const el = document.getElementById(id);
      const clone = el.cloneNode(true);
      clone.querySelectorAll('.katex').forEach((k) => k.remove());
      const txt = clone.textContent;
      SPEC.forEach((re) => { const m = txt.match(re); if (m) out.push(`${id}: on-slide spec ID "${m[0]}"`); });
      const t = el.querySelector('.slide-title');
      if (t) {
        const lh = parseFloat(getComputedStyle(t).lineHeight) || parseFloat(getComputedStyle(t).fontSize) * 1.15;
        if (t.getBoundingClientRect().height / window.Deck.scale > lh * 1.5) out.push(`${id}: title wraps`);
      }
    }
    return out;
  }, slides.map((s) => s.id));
  problems.push(...audit);

  // Viewports (letterboxing).
  for (const vp of [{ width: 1366, height: 768 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(vp);
    for (const id of ['s-2', 's-6']) {
      await go(page, id, 0);
      await page.waitForTimeout(SETTLE);
      await page.screenshot({ path: path.join(outDir, 'viewports', `${id}-${vp.width}x${vp.height}.png`) });
    }
  }
  problems.push(...log.map((l) => 'chromium ' + l));
  await browser.close();
}

async function firefoxPass() {
  const { browser, page, log } = await openPage(firefox, { width: 1920, height: 1080 });
  const slides = await page.evaluate(() => window.deck.list());
  for (const s of slides) {
    await go(page, s.id, s.builds);
    await page.waitForTimeout(SETTLE);
    await page.screenshot({ path: path.join(outDir, 'firefox', `${s.id}-final.png`) });
  }
  problems.push(...log.map((l) => 'firefox ' + l));
  await browser.close();
}

async function reducedMotionPass() {
  const { browser, page, log } = await openPage(chromium, { width: 1920, height: 1080 }, 'reduce');
  const r = await page.evaluate(() => window.Deck.reduced);
  if (!r) problems.push('reduced motion not detected');
  await go(page, 's-0', 0);
  await page.waitForTimeout(300);
  const a = await page.evaluate(() => document.querySelector('#s-0 .motif path').getAttribute('style'));
  await page.waitForTimeout(600);
  const b = await page.evaluate(() => document.querySelector('#s-0 .motif path').getAttribute('style'));
  if (a !== b) problems.push('title motif animates under prefers-reduced-motion');
  problems.push(...log.map((l) => 'reduced ' + l));
  await browser.close();
}

await chromiumPass();
if (withFirefox) await firefoxPass();
await reducedMotionPass();
const size = (fs.statSync(path.join(root, 'dist/lecture.html')).size / 1024).toFixed(0);
const report = [`review ${label}: ${fs.readdirSync(outDir).filter((f) => f.endsWith('.png')).length} screenshots, file ${size} KB`,
  problems.length ? problems.map((p) => ' ✗ ' + p).join('\n') : ' ✓ no problems found'].join('\n');
fs.writeFileSync(path.join(outDir, 'report.txt'), report + '\n');
console.log(report);
