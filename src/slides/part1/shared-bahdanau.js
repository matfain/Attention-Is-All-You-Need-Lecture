/* Shared diagram for slides 6 and 7: RNN encoder states (blue), decoder states
 * s_0 … s_3 (orange). The weights for target word t are computed from the PREVIOUS
 * state s_{t-1} (the query); the context c_t then feeds the update of s_t.
 * Target index t = 0..2 ↔ decoder cell D[t+1]; its query cell is D[t]. Canvas px. */
(function () {
  const B = DATA.part1.bahdanau;
  const D = [150, 340, 530, 720], E = [250, 450, 650];
  const DB = { y: 76, w: 84, h: 94 }, CELL = 36, EY = 330;
  const CTX = { x: 1040, top: EY };                // context-vector bar (slide 6)
  const geo = { D, E, DB, CELL, EY, CTX, decBottom: DB.y + DB.h + 4, encTop: EY - 4, chipY: 30 };
  const S = [tex`s_0`, tex`s_1`, tex`s_2`, tex`s_3`];
  const QUERY = [tex`s_0`, tex`s_1`, tex`s_2`];

  window.Bahdanau = {
    geo,
    // problem: recurrent chains in red (slide 7); context: draw the c_t → s_t arrows (slide 6)
    svg({ sel = B.defaultRow, problem = false, clickable = false, context = false } = {}) {
      let s = '';
      const chainCls = problem ? 'wire problem' : 'wire graphite';
      const chainArrow = problem ? 'arr-problem' : 'arr-graphite';
      E.forEach((x, j) => {
        s += C.chip({ cx: x, cy: EY + 4 * CELL + 50, text: B.source[j], role: 'src' });
        s += `<path class="wire" d="M${x},${EY + 4 * CELL + 22} V${EY + 4 * CELL + 6}" marker-end="url(#arr-ink)" style="stroke-width:2"/>`;
        s += C.vbar({ x: x - CELL / 2, y: EY, values: B.encoderStates[j], role: 'src', cell: CELL, orient: 'v' });
        if (j < 2) s += `<path class="${chainCls}" d="M${x + CELL / 2 + 6},${EY + 2 * CELL} H${E[j + 1] - CELL / 2 - 10}" marker-end="url(#${chainArrow})"/>`;
      });
      D.forEach((x, k) => {
        const t = k - 1; // target index of this cell (-1 for s_0)
        if (t >= 0) s += C.chip({ cx: x, cy: geo.chipY, text: B.target[t], role: 'tgt', state: t === sel ? 'highlight' : '', cls: clickable ? 'clickable' : '', attrs: `data-t="${t}" ${clickable ? 'data-interactive' : ''}` });
        s += `<rect class="state tgt dstate ${k === 0 ? 's0' : ''}" data-k="${k}" x="${x - DB.w / 2}" y="${DB.y}" width="${DB.w}" height="${DB.h}"/>`;
        if (k < 3) s += `<path class="${chainCls}" d="M${x + DB.w / 2 + 6},${DB.y + DB.h / 2} H${D[k + 1] - DB.w / 2 - 10}" marker-end="url(#${chainArrow})"/>`;
      });
      // attention lines per target word, from its query cell D[t]
      let lines = '';
      B.target.forEach((_, t) => {
        lines += `<g class="attn-set" data-t="${t}" style="${t === sel ? '' : 'display:none'}">` +
          C.attnLines(E.map((ex, j) => ({ x1: D[t], y1: geo.decBottom, x2: ex, y2: geo.encTop, w: B.weights[t][j] }))) + `</g>`;
      });
      // c_t → update of the cell that emits word t
      let ctx = '';
      if (context) B.target.forEach((_, t) => {
        const cx = CTX.x + CELL / 2;
        ctx += `<path class="wire ctx-arrow" data-t="${t}" style="stroke:var(--src);stroke-width:3;${t === sel ? '' : 'display:none'}" d="M${cx},${CTX.top - 6} V200 H${D[t + 1] + 22} V${geo.decBottom + 4}" marker-end="url(#arr-src)"/>`;
      });
      return `<g class="attn-layer">${lines}</g>` + s + ctx;
    },
    // HTML overlay: state labels, the query label per target word.
    overlay({ sel = B.defaultRow, query = true } = {}) {
      let ov = D.map((x, k) => C.ov(x, DB.y + DB.h / 2, S[k], 'c', 'label' + (k === 0 ? ' muted' : ''))).join('');
      if (query) B.target.forEach((_, t) => {
        ov += `<div class="abs query-lab caption" data-t="${t}" style="left:${D[t] - 12}px;top:${geo.decBottom + 22}px;transform:translate(-100%,-50%);white-space:nowrap;${t === sel ? '' : 'display:none'}">query: ${QUERY[t]}</div>`;
      });
      return ov;
    },
    select(root, t) {
      root.querySelectorAll('.attn-set, .ctx-arrow, .query-lab').forEach((g) => (g.style.display = +g.dataset.t === t ? '' : 'none'));
      root.querySelectorAll('g.schip.tgt[data-t]').forEach((c) => c.classList.toggle('highlight', +c.dataset.t === t));
      root.querySelectorAll('rect.dstate').forEach((r) => r.classList.toggle('query', +r.dataset.k === t));
    },
    context(t) {
      const w = B.weights[t];
      return [0, 1, 2, 3].map((k) => w.reduce((a, wj, j) => a + wj * B.encoderStates[j][k], 0));
    },
  };
})();
