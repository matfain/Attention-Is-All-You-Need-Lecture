/* Slide 4.2: ablation, model size (Table 3 rows C + big). Ablation card on top; below, two
 * small scatters sharing the x-axis (parameters, log): PPL ↓ and BLEU ↑. Points only, with
 * "base" and "big (3× longer training)" marked. Static. */
(function () {
  const S = DATA.part4.size;
  const PW = 640, PH = 400, X0 = Math.log10(20), X1 = Math.log10(250);
  const sx = (p) => ((Math.log10(p) - X0) / (X1 - X0)) * PW;

  const panel = (left, key, label, y0, y1, step, dp) => {
    const sy = (v) => PH - ((v - y0) / (y1 - y0)) * PH;
    let g = '', ov = '';
    for (let v = y0; v <= y1 + 1e-9; v += step) g += `<line class="grid" x1="0" x2="${PW}" y1="${sy(v)}" y2="${sy(v)}"/><text class="ax" x="-14" y="${sy(v)}" style="text-anchor:end">${v.toFixed(dp)}</text>`;
    [25, 50, 100, 200].forEach((p) => { g += `<line class="grid" x1="${sx(p)}" x2="${sx(p)}" y1="0" y2="${PH}"/><text class="ax" x="${sx(p)}" y="${PH + 32}">${p}</text>`; });
    g += `<line class="axis" x1="0" x2="${PW}" y1="${PH}" y2="${PH}"/><line class="axis" x1="0" x2="0" y1="0" y2="${PH}"/>`;
    S.forEach((r) => {
      const x = sx(r.params), y = sy(r[key]);
      g += r.big
        ? `<rect class="pt big" x="${x - 11}" y="${y - 11}" width="22" height="22" transform="rotate(45 ${x} ${y})"/>`
        : `<circle class="pt ${r.base ? 'basept' : ''}" cx="${x}" cy="${y}" r="${r.base ? 13 : 10}"/>`;
    });
    const base = S.find((r) => r.base), big = S.find((r) => r.big);
    ov += C.ov(sx(base.params) - 22, sy(base[key]), 'base', 'r', 'sz-lab base');
    ov += C.ov(sx(big.params) - 22, sy(big[key]), `big <span class="muted">(${tex`3\times`} longer)</span>`, 'r', 'sz-lab');
    return `<div class="abs" style="left:${left}px;top:420px">
      <div class="abs sz-title" style="left:0;top:-52px;width:${PW}px">${label}</div>
      <svg class="abs" width="${PW}" height="${PH}" style="left:0;top:0">${g}</svg>${ov}
      ${C.ov(PW / 2, PH + 62, 'parameters (millions, log scale)', 't', 'caption')}
    </div>`;
  };

  Deck.slide({
    id: 's-4-2',
    part: 4,
    title: 'Ablation: Model Size',
    cite: 'Vaswani et al., 2017 · Table 3',
    render() {
      return `
        ${C.ablCard({
          ablated: `depth ${tex`N`} · width ${tex`d_{model}`} · FFN size ${tex`d_{ff}`}`,
          conclusion: `paper’s reading: <b>bigger is better</b> on both metrics`, // the paper's claim (S33 shows size is confounded with compute)
        })}
        ${panel(250, 'ppl', `PPL ${tex`\downarrow`}`, 4.0, 6.5, 0.5, 1)}
        ${panel(1030, 'bleu', `BLEU ${tex`\uparrow`}`, 23.5, 26.5, 1.0, 1)}`;
    },
  });
})();
