/* Slide 2.1b: Scaled dot-product attention in matrix form, with the canonical toy numbers.
 * Builds: X → Q,K,V → QKᵀ → A (softmax) → Z = AV → ×W^O and the residual update
 * X + ZW^O → scale-up view ("The General Case"). Step tags Project / Score / Softmax / Average / Update
 * reuse S12's stage names. From build 3 on, clicking a row label picks a token
 * (default "sat") and highlights its row in every matrix. */
(function () {
  const T = DATA.toyAttention;
  const TOK = T.tokens, DEF = 2, CELL = 64;
  const ROW1 = 300, ROW2 = 634;
  const SHIFT = 56; // centres the toy pipeline (it spans x 112–1695) on the slide
  const IDS = ['mQ', 'mS', 'mA', 'mZ', 'mZW', 'mXr'];

  const mtx = (o) => C.matrix({ rows: TOK, rowRole: 'src', colRole: 'src', cell: CELL, cellFs: 24, clickableRows: o.click, ...o });
  const arrow = (x, y, w, label) =>
    `<div class="abs mx-arrow" style="left:${x}px;top:${y}px;width:${w}px">${label ? `<div class="mx-alab">${label}</div>` : ''}` +
    `<svg width="${w}" height="24"><path class="wire" d="M4,12 H${w - 8}" marker-end="url(#arr-ink)"/></svg></div>`;
  const op = (x, y, html) => `<div class="abs mx-op" style="left:${x}px;top:${y}px">${html}</div>`;
  // step tag in S12's vocabulary, centred at x
  const tag = (x, y, name) => `<div class="abs mx-tag" style="left:${x}px;top:${y}px">${name}</div>`;

  Deck.slide({
    id: 's-2-1b',
    part: 2,
    title: 'Scaled Dot-Product Attention',
    thumb: ['enc-mha', 'enc-addnorm1'],
    builds: 6,
    render() {
      const toy = `
        <div class="abs eq-display s21b-eq" style="left:0;right:0;top:168px;text-align:center">
          ${tex`\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\!\left(\frac{QK^\top}{\color{#A8AFBD}\sqrt{d_k}}\right)V`}
        </div>
        <div data-build-max="5" class="s21b-body" style="position:absolute;inset:0;transform:translateX(${SHIFT}px)">
          <div class="abs" style="left:112px;top:${ROW1}px">${mtx({ values: T.X, dp: 0, shape: tex`X\;\; 3 \times 4`, id: 'mX', click: true })}</div>
          <div data-build="1" data-build-max="4">
            ${tag(566, ROW1 + 34, 'Project')}
            ${arrow(476, ROW1 + 86, 180, tex`\times W^Q,\ W^K,\ W^V`)}
            <div class="abs" style="left:672px;top:${ROW1}px">${mtx({ values: T.Q, dp: 1, frame: 'q', shape: tex`Q\;\; 3 \times 2`, id: 'mQ' })}</div>
            <div class="abs" style="left:928px;top:${ROW1}px">${mtx({ values: T.K, dp: 1, frame: 'k', shape: tex`K\;\; 3 \times 2` })}</div>
            <div class="abs" style="left:1184px;top:${ROW1}px">${mtx({ values: T.V, dp: 1, frame: 'v', shape: tex`V\;\; 3 \times 2` })}</div>
          </div>
          <div data-build="5">
            ${op(500, ROW1 + 98, tex`+`)}
            <div class="abs" style="left:548px;top:${ROW1}px">${C.matrix({ values: T.ZWO, cell: CELL, cellFs: 24, shape: tex`ZW^O\;\; 3 \times 4`, id: 'mZW', rows: null })}</div>
            ${op(840, ROW1 + 98, tex`=`)}
            <div class="abs" style="left:890px;top:${ROW1}px">${C.matrix({ values: T.Xres, cell: CELL, cellFs: 24, frame: 'ink', shape: tex`X + ZW^O`, id: 'mXr', rows: null })}</div>
            <div class="abs anchor-line" style="left:1210px;top:${ROW1 + 80}px">residual stream:<br><b>each token gets an edit</b></div>
          </div>
          <div data-build="2">
            ${tag(290, ROW2 - 50, 'Score')}
            <div class="abs" style="left:112px;top:${ROW2}px">${mtx({ values: T.QKt, cols: TOK, dp: 2, shape: tex`QK^\top = (e_{ij})\;\; 3 \times 3`, id: 'mS', click: true })}</div>
          </div>
          <div data-build="3">
            ${tag(523, ROW2 + 62, 'Softmax')}
            ${arrow(414, ROW2 + 116, 218, tex`\div\sqrt{2}`)}
            <div class="abs mx-alab" style="left:414px;width:218px;text-align:center;top:${ROW2 + 178}px">${tex`\exp(\cdot)\,/\textstyle\sum_j \exp(\cdot)`}</div>
            <div class="abs caption" style="left:414px;width:218px;text-align:center;top:${ROW2 + 226}px">row-wise</div>
            <div class="abs" style="left:640px;top:${ROW2}px">${mtx({ values: T.A, cols: TOK, mode: 'both', roundRows: true, shape: tex`A = (\alpha_{ij})\;\; 3 \times 3` + ' <span class="muted">· rows sum to 1</span>', id: 'mA', click: true })}</div>
          </div>
          <div data-build="4">
            ${tag(1016, ROW2 + 62, 'Average')}
            ${arrow(946, ROW2 + 116, 140, tex`\times V`)}
            <div class="abs" style="left:1100px;top:${ROW2}px">${mtx({ values: T.Z, dp: 2, shape: tex`Z = AV\;\; 3 \times 2`, id: 'mZ', click: true })}</div>
          </div>
          <div data-build="5">
            <div class="abs wo-def" style="left:1380px;top:${ROW2 + 40}px">
              <div class="caption wo-cap">output projection (toy)</div>
              <div class="wo-row">${tex`W^O =`} ${C.matrix({ values: T.WO, cell: 52, cellFs: 22, dp: 0, shape: tex`2 \times 4` })}</div>
            </div>
            <svg class="abs wo-arrow" width="1920" height="1080" style="left:0;top:0;pointer-events:none"></svg>
            <div class="abs mx-alab wo-lab" style="transform:translate(-50%,-50%);background:var(--paper);padding:0 10px">${tex`\times W^O`}</div>
            <div class="abs mx-tag wo-tag" style="background:var(--paper);padding:0 10px">Update</div>
          </div>
        </div>`;
      const ab = (o) => C.matrixAbstract({ cell: 44, ...o });
      const scale = `
        <div data-build="6" class="abs stage-title" style="left:560px;width:800px;top:296px">The General Case: Any Length ${tex`n`}</div>
        <div data-build="6" class="abs scaleup" style="left:60px;right:60px;top:410px">
          <div class="su-row">
            ${ab({ rows: 4, cols: 4, shape: tex`X\;\; n \times d_{model}` })}
            <div class="su-op">${tex`\to`}</div>
            ${ab({ rows: 4, cols: 3, frame: 'q', shape: tex`Q\;\; n \times d_k` })}
            ${ab({ rows: 4, cols: 3, frame: 'k', shape: tex`K` })}
            ${ab({ rows: 4, cols: 3, frame: 'v', shape: tex`V` })}
            <div class="su-op">${tex`\to`}</div>
            ${ab({ rows: 4, cols: 4, fill: '#C9D2EA', shape: tex`A\;\; n \times n` })}
            <div class="su-op">${tex`\times V`}</div>
            ${ab({ rows: 4, cols: 3, shape: tex`Z\;\; n \times d_v` })}
            <div class="su-op">${tex`\times W^O,\ +X`}</div>
            ${ab({ rows: 4, cols: 4, frame: 'ink', shape: tex`X'\;\; n \times d_{model}` })}
          </div>
          <div class="su-badges">${C.badge(tex`d_{model}=512`, 'lg')} ${C.badge(tex`d_k=d_v=64`, 'lg')}
            <span class="anchor-line" style="margin-left:24px">all <b>${tex`n`}</b> tokens at once: a few matrix products</span></div>
        </div>`;
      return toy + scale + `
        <div class="abs" data-build-max="5" style="left:0;right:0;top:952px;text-align:center">${C.badge('toy: ' + tex`n=3,\ d_{model}=4,\ d_k=d_v=2`)} ${C.badge('paper: ' + tex`d_{model}=512,\ d_k=d_v=64`)}</div>`;
    },
    mount(el) {
      let build = 0, sel = DEF;
      // ×W^O arrow: from the centre of Z's cells up to the centre of ZW^O,
      // its horizontal run halfway between the two rows (measured, so it stays centred).
      const body = el.querySelector('.s21b-body');
      const box = (sel) => {
        const o = Deck.stageRect(body), rs = [...body.querySelectorAll(sel)].map((n) => Deck.stageRect(n));
        const x0 = Math.min(...rs.map((r) => r.x)), y0 = Math.min(...rs.map((r) => r.y));
        const x1 = Math.max(...rs.map((r) => r.x + r.w)), y1 = Math.max(...rs.map((r) => r.y + r.h));
        return { x0: x0 - o.x, y0: y0 - o.y, x1: x1 - o.x, y1: y1 - o.y, cx: (x0 + x1) / 2 - o.x };
      };
      const z = box('#mZ .cell'), zw = box('#mZW .cell'), row1 = box('#mX, #mZW, #mXr'), row2 = box('#mS, #mA, #mZ');
      const yMid = (row1.y1 + row2.y0) / 2;
      body.querySelector('.wo-arrow').innerHTML =
        `<path class="wire" d="M${z.cx},${z.y0 - 6} V${yMid} H${zw.cx} V${row1.y1 + 6}" marker-end="url(#arr-ink)"/>`;
      Object.assign(body.querySelector('.wo-lab').style, { left: (z.cx + zw.cx) / 2 + 'px', top: yMid + 'px' });
      // step tag on the same run, left of the ×W^O label
      Object.assign(body.querySelector('.wo-tag').style, { left: (z.cx + zw.cx) / 2 - 120 + 'px', top: yMid - 18 + 'px' });
      const paint = () => {
        const on = build >= 3 && build <= 5;
        IDS.concat('mX').forEach((id) => { const m = el.querySelector('#' + id); if (m) C.setMatrixRow(m, on ? sel : null); });
        el.querySelectorAll('.rlab[data-row]').forEach((l) => l.toggleAttribute('data-interactive', on));
        el.classList.toggle('rows-live', on);
      };
      el.addEventListener('click', (e) => {
        const l = e.target.closest('.rlab[data-row]');
        if (!l || build < 3 || build > 5) return;
        sel = +l.dataset.row;
        paint();
      });
      return {
        update(b) {
          build = b;
          if (b < 3 || b > 5) sel = DEF;
          paint();
        },
      };
    },
  });
})();
