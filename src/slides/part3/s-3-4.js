/* Slide 3.4: translation results (Table 2). Build 0: the results table (Transformer cost
 * cells span both FLOPs columns, base EN→FR greyed). Build 1: an EN→DE cost–quality
 * scatter replaces the table (log-x FLOPs, BLEU; shaded region = better and cheaper than
 * the best prior model, ConvS2S Ens.). Anchors on the right, both builds. */
(function () {
  const R = DATA.part3.results;
  const up = tex`\uparrow`, down = tex`\downarrow`;
  const sci = (str) => {
    const [m, e] = String(str).split('e');
    return `<span class="num">${m}×10<sup>${+e}</sup></span>`;
  };

  const bestDe = Math.max(...R.table.map((r) => +r.deBleu)), bestFr = Math.max(...R.table.map((r) => +r.frBleu));
  const big = R.table.find((r) => +r.frBleu === bestFr);

  const table = () => {
    const rows = R.table.map((r) => {
      const name = r.model.replace(/ \((.*)\)$/, '<br><span class="muted rowsub">$1</span>');
      const de = `<td class="num ${+r.deBleu === bestDe ? 'best' : ''}">${r.deBleu}</td>`;
      const fr = `<td class="num ${r.frGrey ? 'grey' : +r.frBleu === bestFr ? 'best' : ''}">${r.frBleu}</td>`;
      const cost = r.cost ? `<td class="num center" colspan="2">${sci(r.cost)}</td>` : `<td class="num">${sci(r.deCost)}</td><td class="num">${sci(r.frCost)}</td>`;
      return `<tr class="${r.ours ? 'ours' : ''}"><td>${r.ours ? `<b>${name}</b>` : name}</td>${de}${fr}${cost}</tr>`;
    }).join('');
    return `<table class="bt t2">
      <thead>
        <tr><th rowspan="2">Model</th><th colspan="2" class="center">BLEU ${up}</th><th colspan="2" class="center">Training cost ${down} (FLOPs)</th></tr>
        <tr class="sub"><th class="num">EN${tex`\to`}DE</th><th class="num">EN${tex`\to`}FR</th><th class="num">EN${tex`\to`}DE</th><th class="num">EN${tex`\to`}FR</th></tr>
      </thead><tbody>${rows}</tbody></table>`;
  };

  // scatter geometry (canvas px inside the plot box)
  const PW = 1100, PH = 470, X0 = 18, X1 = 21, Y0 = 24, Y1 = 29;
  const sx = (c) => ((Math.log10(c) - X0) / (X1 - X0)) * PW, sy = (b) => PH - ((b - Y0) / (Y1 - Y0)) * PH;
  // label placement per point (layout only): [dx, dy, anchor]
  const LAB = {
    'GNMT+RL': [16, 0, 'start'], 'ConvS2S': [16, 0, 'start'], 'MoE': [16, 6, 'start'],
    'GNMT+RL Ens.': [16, 26, 'start'], 'ConvS2S Ens.': [-16, -22, 'end'],
    'Transformer base': [18, 0, 'start'], 'Transformer big': [-18, 0, 'end'],
  };

  const scatter = () => {
    const best = R.scatter.find((p) => p.label === 'ConvS2S Ens.');
    let g = `<rect class="sc-region" x="0" y="0" width="${sx(best.cost)}" height="${sy(best.bleu)}"/>`;
    g += `<path class="sc-guide" d="M0,${sy(best.bleu)} H${sx(best.cost)} V0"/>`;
    for (let b = Y0; b <= Y1; b++) g += `<line class="grid" x1="0" x2="${PW}" y1="${sy(b)}" y2="${sy(b)}"/><text class="ax" x="-14" y="${sy(b)}" style="text-anchor:end">${b}</text>`;
    for (let e = X0; e <= X1; e++) g += `<text class="ax" x="${sx(Math.pow(10, e))}" y="${PH + 34}">10<tspan class="sup" dy="-12">${e}</tspan></text>`;
    g += `<line class="axis" x1="0" x2="${PW}" y1="${PH}" y2="${PH}"/><line class="axis" x1="0" x2="0" y1="0" y2="${PH}"/>`;
    R.scatter.forEach((p) => {
      const x = sx(p.cost), y = sy(p.bleu), [dx, dy, a] = LAB[p.label];
      const cls = p.ours ? 'ours' : '';
      g += p.ens
        ? `<rect class="pt ens" x="${x - 9}" y="${y - 9}" width="18" height="18" transform="rotate(45 ${x} ${y})"/>`
        : `<circle class="pt ${cls}" cx="${x}" cy="${y}" r="${p.ours ? 12 : 9}"/>`;
      g += `<text class="pt-lab ${cls}" x="${x + dx}" y="${y + dy}" style="text-anchor:${a}">${C.esc(p.label)} <tspan class="pt-v">${p.shown}</tspan></text>`;
    });
    return g;
  };

  Deck.slide({
    id: 's-3-4',
    part: 3,
    title: 'Main Results: Better <i>and</i> Cheaper',
    cite: 'Vaswani et al., 2017 · Table 2',
    builds: 1,
    render() {
      return `
        <div data-build-max="0" class="abs s34-tab" style="left:0;right:0;top:178px">
          ${table()}
          <div class="caption s34-note">base: below prior best on EN${tex`\to`}FR</div>
        </div>
        <div data-build="1" class="abs s34-sc" style="left:${(1920 - PW) / 2 + 30}px;top:190px">
          <svg width="${PW}" height="${PH}" class="abs" style="left:0;top:0">${scatter()}</svg>
          ${C.ov(sx(1.2e18) + 6, sy(R.scatter.find((p) => p.label === 'ConvS2S Ens.').bleu) - 22, 'better and cheaper than the prior best', 'l', 'sc-region-lab')}
          ${C.ov(-70, PH / 2, `EN${tex`\to`}DE BLEU ${up}`, 'c', 'caption ax-y')}
          ${C.ov(PW / 2, PH + 62, `training cost ${down} (FLOPs, log scale)`, 't', 'caption')}
          ${C.ov(PW, PH + 62, '<span class="lg-dot"></span> single model &nbsp; <span class="lg-dia"></span> ensemble', 'r', 'caption', 'transform:translate(-100%,0)')}
        </div>
        <div class="abs s34-stats" style="left:112px;right:112px;top:790px">
          <div class="stat"><b>+2 BLEU</b><div class="sl">big, EN${tex`\to`}DE: beats all prior,<br>ensembles included</div></div>
          <div class="stat"><b>lowest cost</b><div class="sl">base, EN${tex`\to`}DE: already<br>beats every prior model</div></div>
          <div class="stat"><b class="num">${big.frBleu}</b><div class="sl">big, EN${tex`\to`}FR: new<br>single-model state of the art</div></div>
        </div>`;
    },
  });
})();
