/* Slide 2.11: causal masking. Build 0: the shift (decoder input = target shifted right,
 * position i predicts label i). Builds 1–2: decoder positions (queries, bottom) attending
 * to the decoder inputs (keys, top) + the 3×3 weight matrix; build 1 mask off, with red
 * "cheating" lines (a position looks at the word it must predict); build 2 mask on, the
 * future is −∞ → 0. Build 3: the "three kinds of attention" table replaces the visual.
 * No bullets: each build has its
 * own stage title + subtitle, and build 2 adds the bottom line. */
(function () {
  const M = DATA.part2.causalMask;
  const TOK = M.tokens, XS = [200, 470, 740], KY = 70, QY = 380;
  const isCheat = (i, j) => M.cheat.some(([r, c]) => r === i && c === j);

  const lines = () => {
    let s = '';
    M.unmasked.forEach((row, i) => row.forEach((w, j) => {
      s += `<path class="attn ${isCheat(i, j) ? 'problem' : ''}" data-i="${i}" data-j="${j}" ${j > i ? 'data-build-max="1"' : ''} style="${C.attnStyle(w)}" d="${C.curve(XS[i], QY - 30, XS[j], KY + 30)}"/>`;
    }));
    return s;
  };

  // build 0: position / label to predict / decoder input, diagonal arrows = the shift
  const shift = () => {
    const CX = [820, 1060, 1300], LY = 580, IY = 780;
    let s = '', ov = '';
    TOK.forEach((t, i) => {
      s += C.chip({ cx: CX[i], cy: IY, text: t, role: 'tgt' });
      s += C.chip({ cx: CX[i], cy: LY, text: M.targets[i], role: 'tgt' });
      s += `<path class="wire" d="M${CX[i]},${IY - 30} V${LY + 34}" marker-end="url(#arr-ink)"/>`;
      if (i < TOK.length - 1) s += `<path class="wire graphite dashed" d="M${CX[i] + 30},${LY + 28} L${CX[i + 1] - 34},${IY - 30}" marker-end="url(#arr-graphite)"/>`;
      ov += C.ov(CX[i], 460, `<span class="num">${i + 1}</span>`, 'c', 'label');
    });
    ov += C.ov(640, 460, 'position', 'r', 'label muted') + C.ov(640, LY, 'label to predict', 'r', 'label') + C.ov(640, IY, 'decoder input', 'r', 'label');
    ov += C.ov(CX[2] + 90, (LY + IY) / 2, 'shift right', 'l', 'caption');
    return `<svg class="abs" width="1920" height="1080" style="left:0;top:0">${s}</svg>${ov}`;
  };

  Deck.slide({
    id: 's-2-11',
    part: 2,
    title: 'Causal Masking: No Peeking at the Future',
    thumb: ['dec-masked-mha'],
    builds: 3,
    render() {
      let svg = lines();
      TOK.forEach((t, j) => { svg += C.chip({ cx: XS[j], cy: KY, text: t, role: 'tgt' }); });
      TOK.forEach((t, i) => { svg += C.chip({ cx: XS[i], cy: QY, text: t, role: 'tgt' }); });
      const ov = TOK.map((t, i) => C.ov(XS[i], QY + 50, `predicts <span class="mono tgt-ink">${C.esc(M.targets[i])}</span>`, 't', 'caption')).join('') +
        C.ov(XS[2] + 110, KY, 'keys', 'l', 'caption') + C.ov(XS[2] + 110, QY, 'queries', 'l', 'caption') +
        `<div class="abs cheat-lab problem-ink" data-build-max="1" style="left:${XS[0] - 22}px;top:${(KY + QY) / 2 + 40}px;transform:translate(-100%,-50%)">cheating</div>`;
      const mtx = (values, masked, id) => C.matrix({
        values, rows: TOK, cols: TOK, mode: 'both', cell: 92, cellFs: 26, rowRole: 'tgt', colRole: 'tgt',
        roundRows: true, masked, id, maskText: '0',
        shape: masked ? `scores ${tex`-\infty`} ${C.sym('→')} weight ${tex`0`} · rows sum to 1` : 'rows sum to 1',
      });
      const masked = TOK.map((_, i) => TOK.map((__, j) => j > i));
      const table = C.table({
        cls: 'kinds', head: ['Attention', 'Who averages', 'Over what'],
        rows: [
          ['Encoder self-attention', 'each source token', 'all source tokens'],
          ['Decoder masked self-attention', 'each target position', C.sym('target positions ≤ itself')],
          ['Cross-attention', 'each target position', 'all source tokens'],
        ].map((cells) => ({ cells })),
      });
      // one titled stage per build (the visual swaps rather than accumulates)
      const stage = (b, title, sub) => `<div class="abs stage-title" data-build="${b}" data-build-max="${b}" style="left:360px;width:1200px;top:176px">${title}</div>` +
        `<div class="abs stage-sub" data-build="${b}" data-build-max="${b}" style="left:260px;width:1400px;top:246px">${sub}</div>`;
      return `
        ${stage(0, 'Shift Right', `decoder input = target shifted right by one (${C.chipHTML('<BOS>', 'tgt', 'sm')} in front), all positions at once`)}
        ${stage(1, 'Without a Mask: Cheating', 'each position can <b class="problem-ink">see the word it must predict</b>')}
        ${stage(2, 'With the Mask', `scores ${tex`-\infty`} for ${tex`j>i`} ${C.sym('→')} weight ${tex`0`} after softmax`)}
        ${stage(3, 'Three Kinds of Attention', 'who averages over what')}
        <div data-build-max="0" class="abs" style="left:0;top:-40px;width:1920px;height:1080px">${shift()}</div>
        <div data-build="1" data-build-max="2">
          <div class="abs s210-vis" style="left:112px;top:370px;width:1000px;height:480px">
            <svg class="abs" width="1000" height="480" style="left:0;top:0">${svg}</svg>${ov}
          </div>
          <div class="abs" data-build-max="1" style="left:1250px;top:400px">${mtx(M.unmasked, null, 'mOff')}</div>
          <div class="abs" data-build="2" style="left:1250px;top:400px">${mtx(M.weights, masked, 'mOn')}</div>
        </div>
        <div class="abs anchor-line" data-build="2" data-build-max="2" style="left:0;right:0;top:922px;text-align:center"><b>shift right + mask = teacher forcing, in one parallel pass</b></div>
        <div class="abs" data-build="3" style="left:0;right:0;top:420px;display:flex;justify-content:center">${table}</div>`;
    },
    mount(el) {
      // red outline on the cheating cells of the unmasked matrix
      M.cheat.forEach(([r, c]) => el.querySelector(`#mOff .cell[data-r="${r}"][data-c="${c}"]`).classList.add('cheat'));
      return {
        update(b) {
          // line thickness = the weights of the matrix currently shown
          const W = b <= 1 ? M.unmasked : M.weights;
          el.querySelectorAll('.s210-vis path.attn').forEach((p) => { p.style.cssText = C.attnStyle(W[+p.dataset.i][+p.dataset.j]); });
        },
      };
    },
  });
})();
