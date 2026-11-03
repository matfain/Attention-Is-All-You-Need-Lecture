/* Slide 5.3: Questions. The full map (all lit) in the centre, presenter + email, and 8
 * refresher tiles (mini visual + label). A tile jumps to its slide in the final build;
 * that slide shows "← back to Questions" (Esc also returns). */
(function () {
  const D = DATA.part5;
  const TOY = DATA.toyAttention;
  const MAP_H = 790, k = MAP_H / C.archMapVB.h, MAP_W = C.archMapVB.w * k;

  // mini visuals, 150 × 100 viewBox
  const cells = (M, x0, y0, s, fill) => M.map((r, i) => r.map((v, j) =>
    `<rect x="${x0 + j * s}" y="${y0 + i * s}" width="${s - 2}" height="${s - 2}" rx="2" fill="${fill(v, i, j)}"/>`).join('')).join('');
  const MINI = {
    matrix: () => cells(TOY.A, 45, 5, 30, (v) => C.ramp(v)),
    bars: () => [0.03, 0.9, 0.02, 0.02, 0.02, 0.01].map((v, i) => `<rect x="${12 + i * 22}" y="${95 - v * 85}" width="16" height="${v * 85 + 1}" rx="2" fill="${v > 0.5 ? 'var(--ink)' : 'var(--graphite)'}"/>`).join(''),
    heads: () => DATA.part2.heads.list.map((h, n) => cells(h.weights, 6 + n * 48, 28, 14, (v) => C.ramp(v))).join(''),
    layer: () => ['var(--attn-block)', 'var(--paper-deep)', 'var(--k-tint)', 'var(--paper-deep)'].map((f, i) =>
      `<rect x="35" y="${76 - i * 22}" width="80" height="18" rx="4" fill="${f}" stroke="var(--ink)" stroke-width="1.5"/>`).join('') +
      `<path d="M28,90 V14" stroke="var(--graphite)" stroke-width="2" fill="none"/>`,
    clock: () => `<circle cx="75" cy="50" r="40" fill="var(--panel)" stroke="var(--ink)" stroke-width="3"/><path d="M75,50 L102,30" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/><circle cx="75" cy="50" r="4" fill="var(--ink)"/>`,
    mask: () => cells(DATA.part2.causalMask.weights, 45, 5, 30, (v, i, j) => (j > i ? 'url(#hatch)' : C.ramp(v))),
    table: () => `<path d="M12,14 H138 M12,32 H138 M12,88 H138" stroke="var(--ink)" stroke-width="2.5"/>` +
      [50, 70].map((y) => `<path d="M18,${y} H52 M68,${y} H96 M108,${y} H132" stroke="var(--graphite)" stroke-width="5" stroke-linecap="round"/>`).join(''),
    ablation: () => [0.5, 0.75, 0.9, 0.9, 0.7].map((v, i) => `<rect x="${14 + i * 26}" y="${88 - v * 66}" width="18" height="${v * 66}" rx="2" fill="${i === 2 ? 'var(--ink)' : 'var(--graphite)'}"/><rect x="${10 + i * 26}" y="${80 - v * 66}" width="26" height="16" fill="url(#hatch)" opacity=".9"/>`).join(''),
  };

  const tile = (t, i) => {
    const col = i < 4 ? 0 : 1, row = i % 4;
    const x = col === 0 ? 112 : 1920 - 112 - 360, y = 180 + row * 196;
    const label = C.esc(t.label).replace('√d_k', tex`\sqrt{d_k}`);
    return `<button type="button" class="abs qa-tile" data-target="${t.target}" style="left:${x}px;top:${y}px">
      <svg width="150" height="100" viewBox="0 0 150 100">${MINI[t.mini]()}</svg><span>${label}</span></button>`;
  };

  Deck.slide({
    id: 's-5-3',
    part: 6,
    title: 'Questions?',
    render() {
      return `
        <div class="abs" style="left:${(1920 - MAP_W) / 2}px;top:186px">${C.archMap({ mode: 'full', height: MAP_H })}</div>
        <div class="abs qa-who" style="left:0;right:0;top:140px;text-align:center">${C.esc(DATA.deck.presenter)} · ${C.esc(DATA.deck.email)}</div>
        ${D.tiles.map(tile).join('')}`;
    },
    mount(el) {
      el.querySelectorAll('.qa-tile').forEach((b) => b.addEventListener('click', () => Deck.jump(b.dataset.target)));
      return {};
    },
  });
})();
