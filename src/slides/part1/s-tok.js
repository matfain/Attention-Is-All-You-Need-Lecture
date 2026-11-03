/* Slide s-tok: text in, probabilities out (deep-learning-for-text basics).
 * No bullets: build 0 is the title only; each build adds one titled stage of a
 * left-to-right pipeline, one lane per token: 1 Tokenization (text → tokens + ids, a sub-word example) ·
 * 2 Embedding (ids → rows of the learned table E) · 3 Network (→ one output vector per position) ·
 * 4 Prediction (last position → softmax, loss −log p above the bars) + the bottom line. */
(function () {
  const T = DATA.part1.textToVec;
  const LY = [560, 660, 760];                       // lane centres
  const CHIP_X = 470, ID_X = 528;                   // token chips, ids
  const E = { x: 700, y: 504, cols: 4, rows: 12, cell: 26 };
  const NET = { xs: [960, 1060, 1160, 1260], n: [3, 4, 4, 3], r: 15 }, OUT_X = 1336;
  const DY = -125; // the whole pipeline, centred vertically (no bullets)
  const BARS = { x: 1540, y: 800, h: 240, bw: 52, gap: 18 };
  const BARS_CX = BARS.x + (4 * BARS.bw + 3 * BARS.gap) / 2;
  const rowY = (r) => E.y + r * E.cell + E.cell / 2;

  const arrow = (d, cls = '') => `<path class="wire ${cls}" d="${d}" marker-end="url(#arr-ink)"/>`;
  const sCurve = (x1, y1, x2, y2) => `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`;

  // the embedding table: a tall grid, the looked-up rows shaded like the vectors they are
  const table = () => {
    let s = `<rect class="tv-e-frame" x="${E.x}" y="${E.y}" width="${E.cols * E.cell}" height="${E.rows * E.cell}" rx="4"/>`;
    for (let r = 1; r < E.rows; r++) s += `<line class="tv-e-rule" x1="${E.x}" x2="${E.x + E.cols * E.cell}" y1="${E.y + r * E.cell}" y2="${E.y + r * E.cell}"/>`;
    T.embedRows.forEach((r, i) => { s += C.vbar({ x: E.x, y: E.y + r * E.cell, values: T.embed[i], role: 'src', cell: E.cell }); });
    return s;
  };

  // a small fully connected network: input nodes on the lanes, two hidden layers, output nodes on the lanes
  const nodeYs = (k) => (k === 3 ? LY : [535, 618, 702, 785]);
  const network = () => {
    let edges = '', nodes = '';
    NET.xs.forEach((x, l) => {
      const ys = nodeYs(NET.n[l]);
      if (l < NET.xs.length - 1) {
        const ys2 = nodeYs(NET.n[l + 1]);
        ys.forEach((y1) => ys2.forEach((y2) => { edges += `<line class="tv-edge" x1="${x}" y1="${y1}" x2="${NET.xs[l + 1]}" y2="${y2}"/>`; }));
      }
      const kind = l === 0 ? 'in' : l === NET.xs.length - 1 ? 'out' : 'hid';
      ys.forEach((y) => { nodes += `<circle class="tv-node ${kind}" cx="${x}" cy="${y}" r="${NET.r}"/>`; });
    });
    return edges + nodes;
  };

  Deck.slide({
    id: 's-tok',
    part: 1,
    title: 'Text In, Probabilities Out',
    builds: 4,
    render() {
      const b = (k, html) => `<g data-build="${k}">${html}</g>`;
      // stage title over its group, with a rule spanning the group
      const stage = (k, x1, x2, html) => `<div class="abs stage-title" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px">${html}</div>`;
      let s1 = '', s2 = '', s3 = '', s4 = '', ov = '';

      // build 1: tokenization, text → tokens → ids
      T.tokens.forEach((t, i) => {
        s1 += arrow(sCurve(338, 660, CHIP_X - C.chipW(t) / 2 - 10, LY[i]));
        s1 += C.chip({ cx: CHIP_X, cy: LY[i], text: t, role: 'src' });
        s1 += `<text class="tv-id" x="${ID_X}" y="${LY[i] + 1}">${T.ids[i]}</text>`;
      });
      ov += stage(1, 112, 600, 'Tokenization');
      ov += `<div class="abs tv-text mono" data-build="1" style="left:112px;top:${660 - 34}px">the cat sat</div>`;
      ov += `<div class="abs caption tv-sub" data-build="1" style="left:112px;top:842px">rare word: <span class="mono">${T.subword.word}</span> ${tex`\to`} ${T.subword.pieces.map((p) => C.chipHTML(p, 'src', 'sm')).join(' ')}</div>`;

      // build 2: embedding, id → its row of E
      T.tokens.forEach((t, i) => { s2 += arrow(sCurve(608, LY[i], E.x - 10, rowY(T.embedRows[i]))); });
      s2 = table() + s2;
      const ecx = E.x + (E.cols * E.cell) / 2;
      ov += stage(2, 640, 865, 'Embedding');
      ov += `<div class="abs caption tv-shape" data-build="2" style="left:${ecx}px;top:${E.y + E.rows * E.cell + 10}px">table ${tex`E`}<br>${C.sym('≈37K × 512')}</div>`;

      // build 3: network → one output vector per position
      T.tokens.forEach((t, i) => {
        s3 += arrow(sCurve(E.x + E.cols * E.cell + 8, rowY(T.embedRows[i]), NET.xs[0] - NET.r - 10, LY[i]));
        s3 += arrow(`M${NET.xs[3] + NET.r + 6},${LY[i]} H${OUT_X - 10}`);
        s3 += C.vbar({ x: OUT_X, y: LY[i] - 14, values: T.out[i], role: 'ink', cell: 28 });
      });
      s3 = network() + s3;
      ov += stage(3, 905, 1470, 'Network');

      // build 4: next-token prediction, last position → softmax over the vocabulary, the loss above the bars
      s4 += arrow(sCurve(OUT_X + 122, LY[2], BARS.x - 16, LY[2] - 50));
      s4 += C.weightBars({ x: BARS.x, y: BARS.y, labels: T.vocab, weights: T.probs, h: BARS.h, bw: BARS.bw, gap: BARS.gap, labelFs: 24 })
        .replace(`<text class="wlab"`, `<text class="wlab tv-true"`); // the first label is the true next token
      ov += stage(4, 1510, 1810, 'Prediction');
      ov += `<div class="abs tv-loss" data-build="4" style="left:${BARS_CX}px;top:528px">loss ${tex`= -\log p(\text{on})`}</div>`;
      ov += `<div class="abs caption tv-shape" data-build="4" style="left:${BARS_CX}px;top:852px">true next token: <span class="mono src-ink">${T.next}</span></div>`;

      return `
        <div class="abs tv" style="left:0;top:${DY}px;width:1920px;height:1080px">
          <svg class="abs" width="1920" height="1080" style="left:0;top:0">${b(1, s1)}${b(2, s2)}${b(3, s3)}${b(4, s4)}</svg>${ov}
        </div>
        <div class="abs anchor-line" data-build="4" style="left:0;right:0;top:${928 + DY + 50}px;text-align:center"><b>all weights trained by maximum likelihood (SGD)</b>, embeddings included · tokenizer fixed</div>`;
    },
  });
})();
