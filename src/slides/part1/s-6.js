/* Slide 6: RNNs + attention (Bahdanau). Build steps walk through ONE decoding step
 * (predicting "Katze"): ① score with the query s_{t-1} ② softmax ③ context c_t
 * ④ update s_t = f(s_{t-1}, y_{t-1}, c_t) ⑤ predict. Build 6: repeat for every word —
 * the whole attention matrix fills in and target words / heatmap rows become clickable.
 * One decoding step computes ONE row of weights (query s_{t-1} vs all h_j), so builds 1–5 show
 * only that 1 × 3 row, labelled by its query; the stacked 3 × 3 alignment matrix (rows = the
 * word each step produced) appears at build 6. Weights and state shadings are illustrative. */
(function () {
  const B = DATA.part1.bahdanau;
  const TOP = ['<BOS>', ...B.target];                    // chip above decoder cell k (y_k)
  const D = [70, 240, 410, 580], CY = 110, CW = 84, CH = 90;
  const E = [130, 320, 510], EY = 400, CELL = 34;
  const CTX = { x: 650 }, LINE_Y = 250, CHIP_Y = 50;
  const FINAL = 6;
  const S = [tex`s_0`, tex`s_1`, tex`s_2`, tex`s_3`];
  const QUERY = [tex`s_0`, tex`s_1`, tex`s_2`];
  const H = [tex`h_1`, tex`h_2`, tex`h_3`];

  const STEPS = [
    ['Score', tex`e_{t,j} = \mathrm{score}(s_{t-1}, h_j)`, 'query: the <b>previous</b> decoder state'],
    ['Softmax', tex`\alpha_{t,j} = \dfrac{\exp(e_{t,j})}{\sum_l \exp(e_{t,l})}`, 'logits → probabilities (sum to 1)'],
    ['Context', tex`c_t = \textstyle\sum_j \alpha_{t,j}\, h_j`, 'weighted average of encoder states'],
    ['Update', tex`s_t = f(s_{t-1},\, y_{t-1},\, c_t)`, 'previous state + previous word + context'],
    ['Predict', tex`p(y_t \mid y_{<t}, x) = g(s_t,\, y_{t-1},\, c_t)`, 'next-word distribution'],
  ];

  // The diagram is a pure function of (build, selected target t).
  function draw(b, t) {
    const final = b >= FINAL, q = t, u = t + 1;   // query cell D[q], updated cell D[u]
    const enter = (k) => (b === k ? ' enter' : '');
    let s = '';
    // encoder
    E.forEach((x, j) => {
      s += C.chip({ cx: x, cy: EY + 4 * CELL + 54, text: B.source[j], role: 'src' });
      s += `<path class="wire" style="stroke-width:2" d="M${x},${EY + 4 * CELL + 26} V${EY + 4 * CELL + 6}" marker-end="url(#arr-ink)"/>`;
      s += C.vbar({ x: x - CELL / 2, y: EY, values: B.encoderStates[j], role: 'src', cell: CELL, orient: 'v' });
      if (j < 2) s += `<path class="wire graphite" d="M${x + CELL / 2 + 6},${EY + 2 * CELL} H${E[j + 1] - CELL / 2 - 10}" marker-end="url(#arr-graphite)"/>`;
    });
    // decoder cells + chain
    D.forEach((x, k) => {
      const done = final || k <= q, active = k === u && b >= 4;
      const cls = k === 0 ? 's0' : done || active ? '' : 'pending';
      s += `<rect class="state tgt dcell ${cls}${active && !final ? ' active' : ''}${k === q && b >= 1 ? ' query' : ''}" x="${x - CW / 2}" y="${CY}" width="${CW}" height="${CH}"/>`;
      if (k < 3) {
        const step = k === q && b >= 4;
        const vis = final || k < q || step;
        s += `<path class="wire ${step ? '' : 'graphite'}${vis ? '' : ' faint'}${step ? enter(4) : ''}" style="${step ? 'stroke-width:3.5' : ''}" d="M${x + CW / 2 + 6},${CY + CH / 2} H${D[k + 1] - CW / 2 - 10}" marker-end="url(#${step ? 'arr-ink' : 'arr-graphite'})"/>`;
      }
      // word chips y_k above cell k
      const shown = final || k <= q || (k === u && b >= 5);
      if (shown) {
        const isTarget = k === u && b >= 5;
        s += C.chip({ cx: x, cy: CHIP_Y, text: TOP[k], role: 'tgt', state: isTarget ? 'highlight' : '', cls: (k > 0 ? 'pick' : '') + (isTarget && !final ? enter(5) : ''), attrs: k > 0 ? `data-t="${k - 1}"` : '' });
        if (k > 0) s += `<path class="wire" style="stroke-width:2" d="M${x},${CY - 4} V${CHIP_Y + 30}" marker-end="url(#arr-ink)"/>`;
      }
    });
    // ① score: uniform dashed lines from the query cell; ② softmax: weighted lines + weights
    if (b >= 1) {
      const w = C.roundDist(B.weights[t]);
      const top = B.weights[t].indexOf(Math.max(...B.weights[t]));
      E.forEach((ex, j) => {
        const d = C.curve(D[q], CY + CH + 4, ex, EY - 4);
        s += b === 1
          ? `<path class="attn score enter" d="${d}"/>`
          : `<path class="attn${enter(2)}" d="${d}" style="${C.attnStyle(B.weights[t][j])}"/>`;
        if (b === 1) s += `<text class="wlabel logit enter" x="${ex + CELL / 2 + 8}" y="${EY + 14}">${C.fmt(B.logits[t][j], 1)}</text>`;
        if (b >= 2) s += `<text class="wlabel${j === top ? ' top' : ''}${enter(2)}" x="${ex + CELL / 2 + 8}" y="${EY + 14}">${w[j].toFixed(2)}</text>`;
      });
    }
    // ③ context vector
    if (b >= 3) s += `<g class="${enter(3).trim()}">${C.vbar({ x: CTX.x, y: EY, values: Bahdanau.context(t), role: 'src', cell: CELL, orient: 'v' })}</g>`;
    // ④ update: previous word y_{t-1} and c_t flow into the new state
    if (b >= 4) {
      const x1 = D[q] + C.chipW(TOP[q]) / 2 + 4, x2 = D[u] - CW / 2 - 6;
      s += `<path class="wire dashed${enter(4)}" style="stroke:var(--tgt);stroke-width:3" d="M${x1},${CHIP_Y} C${x1 + 40},${CHIP_Y} ${x2 - 50},${CY + 22} ${x2},${CY + 22}" marker-end="url(#arr-tgt)"/>`;
      s += `<path class="wire${enter(4)}" style="stroke:var(--src);stroke-width:3" d="M${CTX.x + CELL / 2},${EY - 6} V${LINE_Y} H${D[u] + 20} V${CY + CH + 6}" marker-end="url(#arr-src)"/>`;
    }
    return s;
  }

  // HTML overlay (KaTeX labels), also a function of (build, t).
  function overlay(b, t) {
    const final = b >= FINAL;
    let ov = D.map((x, k) => C.ov(x, CY + CH / 2, S[k], 'c', 'label' + (k === 0 ? ' muted' : '') + (!final && k > t + 1 ? ' faint' : ''))).join('');
    ov += E.map((x, j) => C.ov(x - CELL / 2 - 10, EY + 3.5 * CELL, H[j], 'r', 'label')).join('');
    if (b >= 1) ov += C.ov(D[t] + CW / 2 + 6, CY + CH + 26, `query: ${QUERY[t]}`, 'l', 'caption query-lab' + (b === 1 ? ' enter' : ''));
    if (b >= 3) ov += C.ov(CTX.x + CELL / 2, EY + 4 * CELL + 30, tex`c_t`, 'c', 'label' + (b === 3 ? ' enter' : ''));
    if (b >= 4) ov += C.ov(CTX.x + CELL / 2 - 12, LINE_Y + 24, `${tex`c_t`} into the update`, 'l', 'caption src-ink' + (b === 4 ? ' enter' : ''), 'transform:translate(-100%,-50%)');
    return ov;
  }

  Deck.slide({
    id: 's-6',
    part: 1,
    title: 'Attention: A Learned, Dynamic Weighted Average',
    cite: 'Bahdanau et al., 2015 · Luong et al., 2015',
    builds: FINAL,
    render() {
      const rail = STEPS.map(([name, f, note], i) => `
        <div class="rail-step" data-build="${i + 1}" data-k="${i + 1}">
          <div class="rail-num">${i + 1}</div>
          <div><div class="rail-name">${name}</div><div class="rail-f">${f}</div><div class="rail-note">${note}</div></div>
        </div>`).join('');
      // same label column width in both views, so the columns don't jump at build 6
      const COLS = 'grid-template-columns:130px repeat(3, 84px)';
      const heat = C.matrix({
        values: B.weights, rows: B.target, cols: B.source, mode: 'both', cell: 84,
        rowRole: 'tgt', colRole: 'src', highlightRow: B.defaultRow, clickableRows: true, roundRows: true, cellFs: 24,
      }).replace(/grid-template-columns:[^;"]*/, COLS);
      const t = B.defaultRow;
      // builds 1–5: the single row this step computes (query s_{t-1}); its output word appears at ⑤
      const step = `<div class="mtx step-mtx" style="${COLS};--cell:84px">
          <div></div>${B.source.map((c) => `<div class="clab">${C.chipHTML(c, 'src', 'sm')}</div>`).join('')}
          <div class="rlab step-q">query <span class="step-qbox">${QUERY[t]}</span></div>
          ${B.source.map((_, j) => `<div class="cell rowhl" data-c="${j}" style="font-size:24px"></div>`).join('')}
          <div></div><div class="step-pred" data-build="5">predicts ${C.chipHTML(B.target[t], 'tgt', 'sm highlight')}</div>
        </div>`;
      return `
        <ul class="anchors abs" style="left:112px;top:168px;width:1700px">
          <li>Keep <b>all</b> encoder states ${tex`h_1,\dots,h_n`} (no single vector), one decoding step:</li>
        </ul>
        <div class="abs rail" style="left:112px;top:250px;width:560px">${rail}</div>
        <div class="abs bd" style="left:690px;top:230px;width:740px;height:680px">
          <svg class="abs bd-svg" width="740" height="680" style="left:0;top:0"></svg>
          <div class="bd-ov"></div>
        </div>
        <div class="abs bd-heat" style="left:1410px;top:262px">
          <div class="caption heat-title" data-build="1"><span class="ht-scores">scores (logits) ${tex`e_{t,j}`}</span><span class="ht-weights">attention weights ${tex`\alpha_{t,j}`}</span></div>
          <div class="heat-wrap">
            <div class="heat-step" data-build="1" data-build-max="5">${step}</div>
            <div class="heat-full" data-build="6">${heat}</div>
          </div>
        </div>
        <div class="abs caption" data-build="1" style="left:1410px;top:690px">query = previous decoder state<br>keys = values = encoder states</div>`;
    },
    mount(el) {
      const svg = el.querySelector('.bd-svg'), ovl = el.querySelector('.bd-ov');
      const heat = el.querySelector('.heat-full');
      const stepCells = [...el.querySelectorAll('.step-mtx .cell')];
      let build = 0, sel = B.defaultRow;
      const paint = () => {
        const t = build >= FINAL ? sel : B.defaultRow;
        svg.innerHTML = draw(build, t);
        ovl.innerHTML = overlay(build, t);
        // the step's single row: logits at ① score, probabilities from ② softmax
        const w = C.roundDist(B.weights[t]);
        stepCells.forEach((c, j) => {
          const logit = build === 1;
          c.classList.toggle('logit', logit);
          c.classList.toggle('dark', !logit && B.weights[t][j] > 0.5);
          c.style.cssText = `background:${logit ? 'var(--panel)' : C.ramp(B.weights[t][j])};font-size:24px`;
          c.textContent = logit ? C.fmt(B.logits[t][j], 1) : w[j].toFixed(2);
        });
        el.querySelector('.ht-scores').hidden = build !== 1;
        el.querySelector('.ht-weights').hidden = build === 1;
        C.setMatrixRow(heat, build >= FINAL ? t : null);
        el.querySelectorAll('.rail-step').forEach((r) => r.classList.toggle('current', +r.dataset.k === build));
        el.classList.toggle('bd-final', build >= FINAL);
        heat.toggleAttribute('data-interactive', build >= FINAL);
        heat.querySelectorAll('.rlab').forEach((r) => r.toggleAttribute('data-interactive', build >= FINAL));
        if (build >= FINAL) svg.querySelectorAll('g.schip.pick').forEach((c) => {
          c.setAttribute('data-interactive', '');
          c.addEventListener('click', () => { sel = +c.dataset.t; paint(); });
        });
      };
      heat.addEventListener('click', (e) => {
        if (build < FINAL) return;
        const r = e.target.closest('[data-row], .cell');
        if (!r) return;
        sel = +(r.dataset.row ?? r.dataset.r);
        paint();
      });
      return {
        update(b) {
          build = b;
          if (b < FINAL) sel = B.defaultRow;
          paint();
        },
      };
    },
  });
})();
