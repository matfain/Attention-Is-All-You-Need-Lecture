/* Slide 3.6: parsing results (Table 4). Two horizontal bar charts, F1 axis from 87 (the tick labels
 * show it, no extra caption); Transformer bars in the
 * accent colour. Static. */
(function () {
  const P = DATA.part3.parsing;
  const LW = 370, BW = 360, ROW = 62, TOP = 20, MAX = 93;
  const bx = (f) => ((f - P.axisMin) / (MAX - P.axisMin)) * BW;

  const chart = (title, rows) => {
    let g = '';
    for (let f = P.axisMin; f <= MAX; f++) {
      g += `<line class="grid" x1="${LW + bx(f)}" x2="${LW + bx(f)}" y1="${TOP - 8}" y2="${TOP + rows.length * ROW}"/>`;
      g += `<text class="ax" x="${LW + bx(f)}" y="${TOP + rows.length * ROW + 32}">${f}</text>`;
    }
    rows.forEach((r, i) => {
      const y = TOP + i * ROW + 10, h = ROW - 22, cls = r.ours ? 'ours' : '';
      g += `<text class="hb-lab ${cls}" x="${LW - 16}" y="${y + h / 2}">${C.esc(r.label).replace(/\d{4}/g, (m) => `<tspan class="num">${m}</tspan>`)}</text>`;
      g += `<rect class="hb ${cls}" x="${LW}" y="${y}" width="${bx(r.f1)}" height="${h}" rx="3"/>`;
      g += `<text class="hb-val ${cls}" x="${LW + bx(r.f1) + 10}" y="${y + h / 2}">${r.f1.toFixed(1)}</text>`;
    });
    g += `<line class="axis" x1="${LW}" x2="${LW}" y1="${TOP - 8}" y2="${TOP + rows.length * ROW}"/>`;
    const H = TOP + rows.length * ROW + 50;
    return `<div class="pr-chart"><div class="pr-title">${title}</div>
      <svg width="${LW + BW + 70}" height="${H}">${g}</svg></div>`;
  };

  Deck.slide({
    id: 's-3-6',
    part: 3,
    title: 'It Transfers',
    cite: 'Vaswani et al., 2017 · Table 4',
    render() {
      return `
        <div class="abs anchor-line" style="left:0;right:0;top:176px;text-align:center">F1 ${tex`\uparrow`} on the WSJ test set · Transformer <b>trained from scratch</b> on parsing</div>
        <div class="abs pr" style="left:0;right:0;top:260px">${chart('Trained on WSJ only (~<span class="num">40</span>K)', P.wsj)}${chart('+ ~<span class="num">17</span>M auto-parsed sentences', P.semi)}</div>
        <div class="abs s34-stats" style="left:112px;right:112px;top:790px">
          <div class="stat"><b>+3 F1</b><div class="sl">vs RNN seq2seq, <b>same 40K data</b><br>second only to the RNN Grammar</div></div>
          <div class="stat"><b class="num">92.7</b><div class="sl">+ ~17M sentences: <b>highest reported</b><br>among semi-supervised parsers</div></div>
          <div class="stat"><b>minimal tuning</b><div class="sl">same architecture: not a<br>translation-specific trick</div></div>
        </div>`;
    },
  });
})();
