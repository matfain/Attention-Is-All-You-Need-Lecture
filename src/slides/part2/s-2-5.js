/* Slide 2.5: Cross-attention, three stages left to right. Build 0 Where It Sits: a crop of the Figure 1 map (encoder
 * output → the decoder's middle attention block), K, V and Q marked · 1 Who Looks at Whom: source
 * tokens (blue) emit K, V; target positions (orange) emit Q; attention lines (illustrative
 * weights) · 2 Weight Matrix: the target × source heatmap + the bottom line. */
(function () {
  const X = DATA.part2.crossAttention;
  // map crop (map units) and its scale on the slide; text stays ≥ 20 px (26 × 0.8)
  const CROP = { x: 85, y: 212, w: 590, h: 560 }, SC = 0.8, ML = 120, MT = 370;
  const mp = (x, y) => [ML + (x - CROP.x) * SC, MT + (y - CROP.y) * SC];
  // the lines picture (local coordinates, container at L2, T2)
  const L2 = 640, T2 = 400, SX = [60, 260, 460], TX = [140, 340, 540], SY = 60, TY = 400;

  Deck.slide({
    id: 's-2-5',
    part: 2,
    title: 'Cross-Attention: The Decoder Reads the Source',
    thumb: ['dec-cross-mha', 'enc-to-dec'],
    builds: 2,
    render() {
      // build 0: where it sits
      const map = C.archMap({ mode: 'full', width: CROP.w * SC, height: CROP.h * SC, cls: 'ca-map' })
        .replace('viewBox="0 0 780 1010"', `viewBox="${CROP.x} ${CROP.y} ${CROP.w} ${CROP.h}" style="overflow:hidden"`);
      const [kx, ky] = mp(305, 338), [qx, qy] = mp(604, 538);
      const where = `<div class="abs" style="left:${ML}px;top:${MT}px">${map}</div>` +
        C.ov(kx, ky, `<b class="k-ink">K</b>, <b class="v-ink">V</b>`, 'c', 'ca-tag') +
        C.ov(qx, qy, `<b class="q-ink">Q</b>`, 'l', 'ca-tag') +
        C.ov(...mp(230, 795), '<span class="src-ink">encoder</span>', 'c', 'caption') +
        C.ov(...mp(530, 795), '<span class="tgt-ink">decoder</span>', 'c', 'caption');

      // build 1: who looks at whom
      let s = '';
      const cellBar = (x, y, role, lab) => `<rect class="v2 ${role}" x="${x}" y="${y}" width="40" height="30" rx="5"/><text class="v2t ${role}-lab" x="${x + 20}" y="${y + 16}">${lab}</text>`;
      X.weights.forEach((row, i) => row.forEach((w, j) => {
        s += `<path class="attn" style="${C.attnStyle(w)}" d="${C.curve(TX[i], TY - 70, SX[j], SY + 104)}"/>`;
      }));
      X.cols.forEach((t, j) => {
        s += C.chip({ cx: SX[j], cy: SY, text: t, role: 'src' });
        s += cellBar(SX[j] - 44, SY + 40, 'k', 'k') + cellBar(SX[j] + 4, SY + 40, 'v', 'v');
      });
      X.rows.forEach((t, i) => {
        s += C.chip({ cx: TX[i], cy: TY, text: t, role: 'tgt' });
        s += cellBar(TX[i] - 20, TY - 70, 'q', 'q');
      });
      const mid = (SX[0] + TX[2]) / 2;
      const ov = C.ov(mid, SY - 50, `<span class="src-ink">encoder output</span> emits <b class="k-ink">K</b>, <b class="v-ink">V</b>`, 'c', 'caption ca-cap') +
        C.ov(mid, TY + 50, `<span class="tgt-ink">decoder positions</span> emit <b class="q-ink">Q</b>`, 'c', 'caption ca-cap');
      const look = `<div class="abs" style="left:${L2}px;top:${T2}px;width:620px;height:480px">
        <svg class="abs" width="620" height="480" style="left:0;top:0;overflow:visible">${s}</svg>${ov}</div>`;

      const stage = (k, x1, x2, title, sub) => `<div class="abs stage-title" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:176px">${title}</div>` +
        `<div class="abs stage-sub" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:246px">${sub}</div>`;
      return `
        ${stage(0, 112, 610, 'Where It Sits', 'in every decoder layer')}
        ${stage(1, 640, 1250, 'Who Looks at Whom', 'each target position reads the source')}
        ${stage(2, 1280, 1600, 'Weight Matrix', `${tex`m \times n`}, rows sum to 1`)}
        <div>${where}</div>
        <div data-build="1">${look}</div>
        <div class="abs" data-build="2" style="left:1290px;top:430px">
          ${C.matrix({ values: X.weights, rows: X.rows, cols: X.cols, mode: 'both', cell: 80, rowRole: 'tgt', colRole: 'src', roundRows: true, cellFs: 24, cls: 'ca-mtx' })}
        </div>
        <div class="abs caption ca-shape" data-build="2" style="transform:translateX(-50%);white-space:nowrap">target × source</div>
        <div class="abs anchor-line" data-build="2" style="left:0;right:0;top:922px;text-align:center"><b>Bahdanau attention, without the RNNs</b></div>`;
    },
    mount(el) {
      // the path from the encoder output into the decoder's cross-attention block, the rest dimmed
      C.archMapApi(el.querySelector('svg.ca-map')).highlight(['enc-addnorm2', 'enc-to-dec', 'dec-addnorm1', 'dec-cross-mha']);
      // the matrix caption is centred on the cells, not on cells + row labels
      const cells = [...el.querySelectorAll('.ca-mtx .cell')].map((c) => Deck.stageRect(c));
      const x0 = Math.min(...cells.map((r) => r.x)), x1 = Math.max(...cells.map((r) => r.x + r.w)), y1 = Math.max(...cells.map((r) => r.y + r.h));
      Object.assign(el.querySelector('.ca-shape').style, { left: (x0 + x1) / 2 + 'px', top: y1 + 14 + 'px' });
      return {};
    },
  });
})();
