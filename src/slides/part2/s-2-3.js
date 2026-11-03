/* Slide 2.3: Multi-head attention as one fan-out / fan-in picture.
 * Build 0 = X · 1 Split into Heads (each head
 * projects X with its own W_i^Q, W_i^K, W_i^V) · 2 Attend in Parallel (the three illustrative head
 * maps, one per lane) · 3 Merge (head outputs → concat → ×W^O → ⊕ residual) · 4 the cost line. */
(function () {
  const H = DATA.part2.heads;
  const CELL = 46, GAP = 4, MAPH = 3 * CELL + 2 * GAP;
  const T = [350, 520, 690], CY = T.map((t) => t + MAPH / 2); // lane tops / centres
  const X = { x: 112, y: CY[1] - 80, w: 120, h: 160 };
  const QKV_X = 520, MAP_X = 830, BAR_X = 1290, BW = 40, CAT_X = 1414, SW = 26, OPX = 1626, OUT_X = 1670;
  const BLOCK = { y: CY[1] - 80, h: 160 };
  const W = [tex`\times W_1^Q, W_1^K, W_1^V`, tex`\times W_2^Q, W_2^K, W_2^V`, tex`\times W_8^Q, W_8^K, W_8^V`];
  const QKV = [[tex`Q_1`, tex`K_1`, tex`V_1`], [tex`Q_2`, tex`K_2`, tex`V_2`], [tex`Q_8`, tex`K_8`, tex`V_8`]];
  const XV = [tex`\times V_1`, tex`\times V_2`, tex`\times V_8`];
  const ROLE = ['q', 'k', 'v'];

  const arrow = (d, cls = '') => `<path class="wire ${cls}" d="${d}" marker-end="url(#arr-ink)"/>`;
  // a matrix drawn as a V-coloured block with one row line per token (3 rows)
  const mtx = (x, y, w, h) => `<rect class="mh-qkv v" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>` +
    [1, 2].map((r) => `<line class="mh-row" x1="${x}" x2="${x + w}" y1="${y + (r * h) / 3}" y2="${y + (r * h) / 3}"/>`).join('');
  const sCurve = (x1, y1, x2, y2) => `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`;

  Deck.slide({
    id: 's-2-3',
    part: 2,
    title: 'Multi-Head Attention',
    thumb: ['enc-mha', 'dec-masked-mha', 'dec-cross-mha'],
    builds: 4,
    render() {
      let s0 = '', s1 = '', s2 = '', s3 = '', o0 = '', o1 = '', o2 = '', o3 = '';

      // build 0: the input X, three token rows
      s0 += `<rect class="mh-x" x="${X.x}" y="${X.y}" width="${X.w}" height="${X.h}" rx="10"/>`;
      H.tokens.forEach((t, j) => { s0 += C.chip({ cx: X.x + X.w / 2, cy: X.y + 30 + j * 50, text: t, role: 'src', h: 40, fs: 24 }); });
      o0 += C.ov(X.x + X.w / 2, X.y - 26, tex`X`, 'c', 'label');
      o0 += C.ov(X.x + X.w / 2, X.y + X.h + 24, tex`n \times 512`, 'c', 'label muted');

      // build 1: split into heads, each lane projects X with its own weights
      CY.forEach((cy, i) => {
        s1 += arrow(sCurve(X.x + X.w + 6, X.y + X.h / 2, 296, cy).replace('M', 'M') + ` H${QKV_X - 12}`);
        o1 += C.ov(400, cy - 28, W[i], 'c', 'mh-w');
        ROLE.forEach((r, k) => {
          const x = QKV_X + k * 62;
          s1 += `<rect class="mh-qkv ${r}" x="${x}" y="${cy - 22}" width="52" height="44" rx="7"/>`;
          o1 += C.ov(x + 26, cy, QKV[i][k], 'c', 'mh-qkv-lab');
        });
      });
      o1 += C.ov(QKV_X + 88, CY[0] + 40, `each ${tex`n \times 64`}`, 't', 'caption');
      o1 += C.ov(QKV_X + 88, (CY[1] + CY[2]) / 2 + 6, '⋯ 8 heads', 'c', 'caption mh-dots');

      // build 2: each head's own attention map (rows = queries, columns = keys)
      H.list.forEach((h, i) => {
        s2 += arrow(`M${QKV_X + 3 * 62},${CY[i]} H${MAP_X - 72}`);
        H.tokens.forEach((t, j) => {
          s2 += C.chip({ cx: MAP_X - 28, cy: T[i] + j * (CELL + GAP) + CELL / 2, text: t, role: 'src', h: 34, fs: 22 });
          h.weights[j].forEach((v, k) => {
            s2 += `<rect class="mh-cell" x="${MAP_X + 20 + k * (CELL + GAP)}" y="${T[i] + j * (CELL + GAP)}" width="${CELL}" height="${CELL}" rx="3" style="fill:${C.ramp(v)}"/>`;
          });
        });
        o2 += C.ov(MAP_X + 20 + 3 * (CELL + GAP) + 14, CY[i], `<b>${h.label}</b><br><span class="muted">“${h.caption}”</span>`, 'l', 'mh-head');
      });
      H.tokens.forEach((t, k) => { s2 += `<text class="mh-col" x="${MAP_X + 20 + k * (CELL + GAP) + CELL / 2}" y="${T[0] - 16}">${t}</text>`; });

      // build 3: merge, head outputs → concat → ×W^O → ⊕ with X (residual) → X + MultiHead(X)
      CY.forEach((cy, i) => {
        s3 += arrow(`M${BAR_X - 74},${cy} H${BAR_X - 8}`);
        o3 += C.ov(BAR_X - 42, cy - 22, XV[i], 'c', 'mh-xv');
        s3 += mtx(BAR_X, T[i] + 10, BW, MAPH - 20); // head output, an n × 64 matrix (one row per token)
        s3 += arrow(sCurve(BAR_X + BW + 6, cy, CAT_X - 10, BLOCK.y + 30 + i * 42));
      });
      [0, 1, 2].forEach((k) => { s3 += mtx(CAT_X + k * (SW + 3), BLOCK.y, SW, BLOCK.h); });
      const CAT_W = 3 * (SW + 3) + 14;
      [0, 1, 2].forEach((d) => { s3 += `<circle cx="${CAT_X + 3 * (SW + 3) + 5}" cy="${BLOCK.y + BLOCK.h / 2 - 12 + d * 12}" r="2.4" fill="var(--graphite)"/>`; });
      o3 += C.ov(CAT_X + CAT_W / 2, BLOCK.y - 26, 'concat', 'c', 'label');
      o3 += C.ov(CAT_X + CAT_W / 2, BLOCK.y + BLOCK.h + 24, tex`n \times 512`, 'c', 'label muted');
      const mid = BLOCK.y + BLOCK.h / 2;
      s3 += arrow(`M${CAT_X + CAT_W + 6},${mid} H${OPX - 24}`);
      o3 += C.ov((CAT_X + CAT_W + 6 + OPX - 24) / 2, mid - 26, tex`\times W^O`, 'c', 'label');
      s3 += `<circle cx="${OPX}" cy="${mid}" r="18" class="oplus"/><path class="wire" style="stroke-width:2.5" d="M${OPX - 10},${mid} H${OPX + 10} M${OPX},${mid - 10} V${mid + 10}"/>`;
      s3 += arrow(`M${OPX + 20},${mid} H${OUT_X - 8}`);
      s3 += `<rect class="mh-x" x="${OUT_X}" y="${BLOCK.y}" width="44" height="${BLOCK.h}" rx="8"/>`;
      o3 += C.ov(OUT_X + 22, BLOCK.y - 26, tex`X + \mathrm{MultiHead}(X)`, 'c', 'label');
      // residual: from X under all lanes into ⊕
      const RY = 880;
      s3 += arrow(`M${X.x + X.w / 2},${X.y + X.h + 48} V${RY} H${OPX} V${mid + 22}`); // starts under the n × 512 label
      o3 += C.ov(OPX - 14, RY - 18, 'residual', 'r', 'caption');

      const stage = (k, x1, x2, title, sub) => `<div class="abs stage-title" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:176px">${title}</div>` +
        `<div class="abs stage-sub" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:246px">${sub}</div>`;
      return `
        <div class="abs mh" style="left:0;top:0;width:1920px;height:1080px">
          <svg class="abs" width="1920" height="1080" style="left:0;top:0">
            <g>${s0}</g><g data-build="1">${s1}</g><g data-build="2">${s2}</g><g data-build="3">${s3}</g>
          </svg>
          <div>${o0}</div><div data-build="1">${o1}</div><div data-build="2">${o2}</div><div data-build="3">${o3}</div>
          ${stage(1, 240, 740, 'Split into Heads', `own ${tex`W_i^Q, W_i^K, W_i^V`}: 512 ${tex`\to`} 64`)}
          ${stage(2, 770, 1230, 'Attend in Parallel', 'its own notion of <b>relevance</b>')}
          ${stage(3, 1250, 1585, 'Merge', `<span class="mh-formula">${tex`\mathrm{Concat}(\mathrm{head}_1,\dots,\mathrm{head}_8)\,W^O`}</span>`)}
        </div>
        <div class="abs anchor-line" data-build="4" style="left:0;right:0;top:922px;text-align:center">${tex`h=8`}, ${tex`d_k=512/8=64`} ${tex`\to`} <b>similar cost to one full-width head</b></div>`;
    },
  });
})();
