/* Slide 2.1a: Self-attention, the idea, as a schematic of ONE token's update (no numbers: the
 * numbers come once, in matrix form, on 2.1b). No bullets. Build 0 = the framing line + x_i and the x_j ·
 * 1 Project (q_i, k_j, v_j with their one-line intuitions) · 2 Score (q_i · k_j) · 3 Softmax (α_ij)
 * · 4 Update (Σ_j α_ij v_j → W^O → ⊕ residual → x_i') + the update formula as the bottom line. */
(function () {
  const ROW = { q: 470, k: 620, v: 770 };          // q / k / v rows (canvas px)
  const XI = [172, ROW.q], XJ = [172, (ROW.k + ROW.v) / 2];
  const WX = 330, VX = 450;                         // W boxes, vectors
  const SC = [806, (ROW.q + ROW.k) / 2], EB = [958, SC[1]], SM = [1112, SC[1]], AL = [1262, SC[1]];
  const SG = [1410, SC[1]], WO = [1524, SC[1]], OP = [1628, SC[1]], RY = 880; // the update runs on the score row
  // the weights α_ij shown after the softmax, and the scores e_ij that give exactly them (log α, centred)
  const ALPHA = [0.09, 0.72, 0.19];
  const LOGA = ALPHA.map(Math.log), MEAN = LOGA.reduce((a, b) => a + b, 0) / 3, E = LOGA.map((l) => l - MEAN);

  const box = (x, y, w, h, cls = '') =>
    `<rect class="sch-box ${cls}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="8"/>`;
  const vec = (x, y, role, n = 1) => {
    let s = '';
    for (let k = n - 1; k >= 0; k--) {
      const dx = k * 8, dy = -k * 8;
      s += `<rect class="v2 ${role}" x="${x - 34 + dx}" y="${y - 16 + dy}" width="32" height="32" rx="4"/><rect class="v2 ${role}" x="${x + 2 + dx}" y="${y - 16 + dy}" width="32" height="32" rx="4"/>`;
    }
    return s;
  };
  const arr = (d, cls = '') => `<path class="wire ${cls}" d="${d}" marker-end="url(#arr-ink)"/>`;
  const sCurve = (x1, y1, x2, y2) => `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`;

  function svg() {
    const L = (s, b) => `<g data-build="${b}">${s}</g>`;
    let base = C.chip({ cx: XI[0], cy: XI[1], text: '', role: 'src', state: 'highlight', w: 76 });
    for (let k = 2; k >= 0; k--) base += C.chip({ cx: XJ[0] + k * 8, cy: XJ[1] - k * 8, text: '', role: 'src', w: 76 });
    const proj =
      box(WX, ROW.q, 70, 46) + box(WX, ROW.k, 70, 46) + box(WX, ROW.v, 70, 46) +
      arr(`M${XI[0] + 40},${ROW.q} H${WX - 41}`) +
      arr(sCurve(XJ[0] + 62, XJ[1] - 22, WX - 41, ROW.k)) +
      arr(sCurve(XJ[0] + 62, XJ[1] + 6, WX - 41, ROW.v)) +
      arr(`M${WX + 35},${ROW.q} H${VX - 42}`) + arr(`M${WX + 35},${ROW.k} H${VX - 42}`) + arr(`M${WX + 35},${ROW.v} H${VX - 42}`) +
      vec(VX, ROW.q, 'q') + vec(VX, ROW.k, 'k', 3) + vec(VX, ROW.v, 'v', 3);
    const score =
      arr(sCurve(VX + 40, ROW.q, SC[0] - 56, SC[1] - 13)) +
      arr(sCurve(VX + 56, ROW.k - 8, SC[0] - 56, SC[1] + 13)) +
      box(SC[0], SC[1], 104, 52) + arr(`M${SC[0] + 52},${SC[1]} H${EB[0] - 52}`) +
      // signed score bars around a zero line (largest in ink)
      E.map((e, j) => { const h = Math.abs(e) * 34; return `<rect class="wbar ${j === 1 ? 'top' : 'rest'}" x="${EB[0] - 40 + j * 28}" y="${e > 0 ? SC[1] - h : SC[1]}" width="22" height="${h}" rx="2"/>`; }).join('') +
      `<line x1="${EB[0] - 46}" x2="${EB[0] + 46}" y1="${SC[1]}" y2="${SC[1]}" stroke="var(--graphite)" stroke-width="1.5"/>`;
    const soft =
      arr(`M${EB[0] + 52},${SC[1]} H${SM[0] - 56}`) +
      box(SM[0], SM[1], 104, 52, 'sm') + arr(`M${SM[0] + 52},${SM[1]} H${AL[0] - 52}`) +
      ALPHA.map((w, j) => `<rect class="wbar ${j === 1 ? 'top' : 'rest'}" x="${AL[0] - 40 + j * 28}" y="${AL[1] + 26 - w * 70}" width="22" height="${w * 70}" rx="2"/>`).join('') +
      `<line x1="${AL[0] - 46}" x2="${AL[0] + 46}" y1="${AL[1] + 27}" y2="${AL[1] + 27}" stroke="var(--graphite)" stroke-width="1.5"/>`;
    const upd =
      arr(`M${AL[0] + 52},${AL[1]} H${SG[0] - 34}`) +
      arr(`M${VX + 56},${ROW.v - 8} H${SG[0]} V${SG[1] + 34}`) +
      `<circle class="sch-op" cx="${SG[0]}" cy="${SG[1]}" r="28"/>` +
      arr(`M${SG[0] + 28},${SG[1]} H${WO[0] - 37}`) + box(WO[0], WO[1], 70, 46) +
      arr(`M${WO[0] + 35},${WO[1]} H${OP[0] - 22}`) +
      `<circle class="sch-op" cx="${OP[0]}" cy="${OP[1]}" r="18"/><path class="wire" style="stroke-width:2.5" d="M${OP[0] - 10},${OP[1]} H${OP[0] + 10} M${OP[0]},${OP[1] - 10} V${OP[1] + 10}"/>` +
      arr(`M${XI[0] - 40},${XI[1]} H${XI[0] - 56} V${RY} H${OP[0]} V${OP[1] + 22}`, 'res') +
      arr(`M${OP[0] + 18},${OP[1]} H${OP[0] + 60}`);
    return base + L(proj, 1) + L(score, 2) + L(soft, 3) + L(upd, 4);
  }

  function overlay() {
    const o = (x, y, html, a = 'c', cls = 'label') => C.ov(x, y, html, a, cls);
    const L = (s, b) => `<div data-build="${b}">${s}</div>`;
    const intu = (y, role, name, q) => o(VX + 4, y + 44, `<b class="${role}-ink">${name}</b> <span class="muted">“${q}”</span>`, 'c', 'sa-intu');
    return o(XI[0], XI[1] - 46, tex`x_i`) + o(XJ[0] + 8, XJ[1] - 70, tex`x_1, \dots, x_n`) +
      L(o(WX, ROW.q, tex`W^Q`) + o(WX, ROW.k, tex`W^K`) + o(WX, ROW.v, tex`W^V`) +
        o(VX, ROW.q - 38, tex`q_i`, 'c', 'label q-ink') + o(VX + 8, ROW.k - 52, tex`k_1, \dots, k_n`, 'c', 'label k-ink') + o(VX + 8, ROW.v - 52, tex`v_1, \dots, v_n`, 'c', 'label v-ink') +
        intu(ROW.q, 'q', 'Query', 'what am I looking for?') + intu(ROW.k, 'k', 'Key', 'what do I offer?') + intu(ROW.v, 'v', 'Value', 'what do I pass on?'), 1) +
      L(o(SC[0], SC[1], tex`q_i\cdot k_j`) + o(EB[0], EB[1] - 64, tex`e_{ij}`), 2) +
      L(o(SM[0], SM[1], 'softmax', 'c', 'caption sch-t') + o(AL[0], AL[1] - 64, tex`\alpha_{ij}`), 3) +
      L(o(SG[0], SG[1], tex`\textstyle\sum_j`) + o(SG[0], SG[1] - 52, tex`\alpha_{ij}\, v_j`, 'c') + o(WO[0], WO[1], tex`W^O`) +
        o(OP[0] - 14, RY - 18, 'residual', 'r', 'caption') +
        o(OP[0] + 70, OP[1], tex`x_i'`, 'l', 'label'), 4);
  }

  const stage = (k, x1, x2, title, sub) => `<div class="abs stage-title" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:250px">${title}</div>` +
    `<div class="abs stage-sub" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:320px">${sub}</div>`;

  Deck.slide({
    id: 's-2-1a',
    part: 2,
    title: 'Self-Attention: Token Updates in a Sentence',
    thumb: ['enc-mha'],
    builds: 4,
    render() {
      return `
        <div class="abs anchor-line" style="left:112px;width:1440px;top:168px;text-align:center">Replaces the RNN update ${tex`h_t = f(h_{t-1}, x_t)`}: <b>every token</b> is updated from <b>all tokens</b> at once</div>
        <div class="abs s21a-vis" style="left:0;top:0;width:1920px;height:1080px">
          <svg class="abs" width="1920" height="1080" style="left:0;top:0">${svg()}</svg>
        </div>
        <div class="abs" style="left:0;top:0;width:1920px;height:1080px;pointer-events:none">${overlay()}</div>
        ${stage(1, 112, 730, 'Project', 'three roles per token')}
        ${stage(2, 740, 1030, 'Score', tex`e_{ij} = q_i\cdot k_j`)}
        ${stage(3, 1050, 1320, 'Softmax', tex`\alpha_{ij} = \mathrm{softmax}_j(e_{ij})`)}
        ${stage(4, 1340, 1600, 'Update', 'average + <b>residual</b>')}
        <div class="abs anchor-line" data-build="4" style="left:0;right:0;top:918px;text-align:center">${tex`x_i \leftarrow x_i + \big(\textstyle\sum_j \alpha_{ij}\, v_j\big)\, W^O`}</div>`;
    },
  });
})();
