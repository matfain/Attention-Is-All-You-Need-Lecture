/* Slide 4.3: ablation, positional encoding (Table 3 row E). Ablation card on top; below, two
 * cards: sinusoids (defined for any position, also past the training length) vs a learned
 * table (rows 0…L only, no entry beyond), each with its PPL / BLEU. Static. */
(function () {
  const P = DATA.part4.pe;
  const up = tex`\uparrow`, down = tex`\downarrow`;
  const W = 520, H = 200, L = 380; // sketch size; x = L marks the training length

  // three sinusoids of different frequency, solid up to L, dashed beyond
  const waves = () => [[0.045, 1], [0.09, 0.8], [0.025, 0.6]].map(([f, a], k) => {
    const y0 = 40 + k * 60, pts = (from, to) => {
      let d = '';
      for (let x = from; x <= to; x += 4) d += `${d ? 'L' : 'M'}${x},${(y0 - a * 22 * Math.sin(f * x)).toFixed(1)} `;
      return d;
    };
    return `<path class="pe-w" d="${pts(0, L)}"/><path class="pe-w ext" d="${pts(L, W)}"/>`;
  }).join('');

  // a lookup table: rows for positions 0…L, then an empty row past L
  const table = () => {
    let s = '';
    const rows = 6, rh = 26;
    for (let r = 0; r < rows; r++) for (let c = 0; c < 8; c++) {
      s += `<rect x="${60 + c * 50}" y="${4 + r * rh}" width="46" height="${rh - 4}" rx="2" fill="${C.rampInk([0.2, 0.5, 0.35, 0.7, 0.15, 0.6, 0.4, 0.3][(r * 3 + c) % 8] * 0.6)}"/>`;
    }
    s += `<rect class="pe-miss" x="60" y="${4 + rows * rh}" width="396" height="${rh - 4}" rx="2"/>`;
    s += `<text class="pe-q" x="258" y="${4 + rows * rh + rh / 2 - 1}">?</text>`;
    return s;
  };

  const card = (r, svg, lab) => `
    <div class="pe-card ${r.extrap ? 'ok' : ''}">
      <div class="pe-h">${r.name}</div>
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>
      <div class="pe-ext">${C.icon(r.extrap ? 'tick' : 'cross', 34)} ${lab}</div>
      <div class="pe-nums">PPL ${down} <span class="num">${r.ppl}</span> · BLEU ${up} <span class="num">${r.bleu}</span></div>
    </div>`;

  Deck.slide({
    id: 's-4-3',
    part: 4,
    title: 'Ablation: Positional Encoding',
    cite: 'Vaswani et al., 2017 · Table 3',
    render() {
      const sin = waves() + `<line class="pe-L" x1="${L}" x2="${L}" y1="0" y2="${H}"/><text class="pe-Lt" x="${L - 8}" y="${H - 8}">training length</text>`;
      return `
        ${C.ablCard({
          ablated: 'a learned position table instead of sinusoids',
          conclusion: `<b>same quality</b> ${C.sym('→')} the choice was about <b>extrapolation</b> to longer inputs`,
        })}
        <div class="abs pe-cards" style="left:0;right:0;top:400px">
          ${card(P[0], sin, 'any position: defined by a formula')}
          ${card(P[1], table(), 'no entry beyond the training length')}
        </div>`;
    },
  });
})();
