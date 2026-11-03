/* Part 4 shared pieces: the ablation card (Ablated / Measured / Conclusion), variable names like
 * "d_model=256" as math-styled HTML, and the heads bar chart (slide 4.1, again on 4.4 with
 * hatched "?" bands for the unreported run-to-run noise). */
(function (C) {
  const A = DATA.part4;
  const up = tex`\uparrow`, down = tex`\downarrow`;

  // Ablation card: a two-column table on top of 4.1–4.3,
  // rows Ablated / Measured / Conclusion, one line each.
  C.ablCard = ({ ablated, conclusion }) => `
    <table class="abs abl-card"><tbody>
      <tr><th>Ablated</th><td>${ablated}</td></tr>
      <tr><th>Measured</th><td>BLEU ${up} · PPL ${down} on the dev set (newstest<span class="num">2013</span>), <span class="num">100</span>K training steps each</td></tr>
      <tr><th>Conclusion</th><td>${conclusion}</td></tr>
    </tbody></table>`;

  // "d_model=256" / "h=1, d_k=512" / "N=8" → italic variable, subscript, KaTeX digits
  C.mvar = (s) => C.esc(s)
    .replace(/\b(d|h|N)(?:_(model|ff|k|v))?(?==)/g, (_, v, sub) => `<i class="mv">${v}</i>${sub ? `<sub>${sub}</sub>` : ''}`)
    .replace(/(\d+(?:\.\d+)?)/g, '<span class="num">$1</span>');

  // Heads chart in canvas px, top-left at (x, y). opts.hatch: noise bands with "?".
  // opts.min: y-axis start (4.1: 24.5, noted on the axis; 4.4: 20, so the differences look as small as they are)
  C.headsChart = ({ x, y, w = 900, h = 380, hatch = false, min = A.headsAxisMin }) => {
    const H = A.heads, MIN = min, MAX = MIN < 24 ? 28 : 26.0, STEP = MIN < 24 ? 2 : 0.5;
    const slot = w / H.length, bw = Math.min(120, slot * 0.6);
    const by = (v) => h - ((v - MIN) / (MAX - MIN)) * h;
    let g = '', ov = '';
    for (let v = MIN; v <= MAX + 1e-9; v += STEP) {
      g += `<line class="grid" x1="0" x2="${w}" y1="${by(v)}" y2="${by(v)}"/><text class="ax" x="-14" y="${by(v)}" style="text-anchor:end">${v.toFixed(1)}</text>`;
    }
    H.forEach((r, i) => {
      const cx = slot * (i + 0.5), top = by(r.bleu), cls = r.base ? 'base' : '';
      // noise band: fixed, unlabelled size (no numeric width is reported or invented)
      if (hatch) g += `<rect class="noise" x="${cx - bw / 2 - 10}" y="${top - 60}" width="${bw + 20}" height="120" rx="6"/><text class="noise-q" x="${cx + bw / 2 + 26}" y="${top}">?</text>`;
      g += `<rect class="hbar ${cls}" x="${cx - bw / 2}" y="${top}" width="${bw}" height="${h - top}" rx="3"/>`;
      g += `<text class="hval ${cls}" x="${cx}" y="${top - (hatch ? 72 : 18)}">${r.bleu.toFixed(1)}</text>`;
      g += `<text class="hppl ${cls}" x="${cx}" y="${h - 22}">${r.ppl.toFixed(2)}</text>`;
      ov += C.ov(x + cx, y + h + 26, `<span class="num">${r.h}</span>`, 'c', 'hx' + (r.base ? ' base' : ''));
      ov += C.ov(x + cx, y + h + 62, `<span class="num">${r.dk}</span>`, 'c', 'hx sub' + (r.base ? ' base' : ''));
    });
    g += `<line class="axis" x1="0" x2="${w}" y1="${h}" y2="${h}"/><line class="axis" x1="0" x2="0" y1="0" y2="${h}"/>`;
    ov += C.ov(x - 20, y + h + 26, tex`h`, 'r', 'hx') + C.ov(x - 20, y + h + 62, tex`d_k = d_v`, 'r', 'hx sub');
    ov += C.ov(x - 70, y + h / 2, MIN < 24 ? `BLEU ${up}` : `BLEU ${up} · axis starts at ${MIN}`, 'c', 'caption ax-y');
    ov += C.ov(x + w + 16, y + h - 22, `PPL ${down}`, 'l', 'caption');
    if (hatch) ov += C.ov(x + w / 2, y - 40, 'run-to-run noise: not reported', 'c', 'noise-lab');
    return `<svg class="abs heads-chart" width="${w}" height="${h}" style="left:${x}px;top:${y}px">${g}</svg>${ov}`;
  };
})(window.C);
