/* Slide 5: Teacher forcing. Two stacked rows of the same 3-step decoder:
 * generation (a wrong guess "Hund" is fed back and derails the prefix) vs.
 * training with teacher forcing (the true token is fed in regardless).
 * No bullets: build 0 = the generation row, 1 = + the training row (its header carries the
 * definition), 2 = the anchor, with the
 * red recurrent arrows drawn thick in both rows. */
(function () {
  const XS = [560, 800, 1040], BW = 92, BH = 92;
  const S = [tex`s_1`, tex`s_2`, tex`s_3`];

  // One decoder row. preds/inputs: [{text, state}] ; state: '' | 'wrong' | 'unknown'
  function row({ top, preds, inputs, feedback, loss }) {
    const PY = 34, CY = 104, IY = 266, mid = CY + BH / 2; // equal 34 px arrows above and below the states
    let s = '', ov = '', chain = '';
    const chip = (cx, cy, c) => c.state === 'unknown'
      ? C.chip({ cx, cy, text: '?', role: 'tgt', cls: 'chip-problem chip-unknown' })
      : C.chip({ cx, cy, text: c.text, role: 'tgt', cls: c.state === 'wrong' ? 'chip-problem' : '' });
    XS.forEach((cx, i) => {
      s += chip(cx, top + PY, preds[i]);
      s += `<path class="wire" d="M${cx},${top + CY - 4} V${top + PY + 32}" marker-end="url(#arr-ink)"/>`;
      s += `<rect class="state tgt" x="${cx - BW / 2}" y="${top + CY}" width="${BW}" height="${BH}"/>`;
      ov += C.ov(cx, top + mid, S[i], 'c', 'label');
      s += `<path class="wire" d="M${cx},${top + IY - 28} V${top + CY + BH + 8}" marker-end="url(#arr-ink)"/>`;
      s += chip(cx, top + IY, inputs[i]);
      if (i < 2) {
        s += `<path class="wire problem" d="M${cx + BW / 2 + 4},${top + mid} H${XS[i + 1] - BW / 2 - 10}" marker-end="url(#arr-problem)"/>`;
        // the same recurrent step drawn thick: shown in the last build ("still one step at a time")
        chain += `<path class="wire problem tf-chain" d="M${cx + BW / 2 + 4},${top + mid} H${XS[i + 1] - BW / 2 - 10}" marker-end="url(#arr-problem)"/>`;
        if (feedback) {
          const x1 = cx + C.chipW(preds[i].state === 'unknown' ? '?' : preds[i].text) / 2 + 4;
          const x2 = XS[i + 1] - C.chipW(inputs[i + 1].state === 'unknown' ? '?' : inputs[i + 1].text) / 2 - 6;
          s += `<path class="wire problem dashed" style="stroke-width:2.5" d="M${x1},${top + PY} C${x1 + 60},${top + PY} ${x2 - 60},${top + IY} ${x2},${top + IY}" marker-end="url(#arr-problem)"/>`;
        }
      }
    });
    if (loss) ov += C.ov(XS[0] - C.chipW('Hund') / 2 - 14, top + PY, `${C.icon('cross', 34)} <span class="caption">target: <span class="mono tgt-ink">die</span></span>`, 'r', 'loss');
    return { s, ov, chain };
  }

  Deck.slide({
    id: 's-5',
    part: 1,
    title: 'Training vs. Generation',
    cite: 'Williams &amp; Zipser, 1989',
    builds: 2,
    render() {
      const gen = row({
        top: 0, feedback: true,
        preds: [{ text: 'Hund', state: 'wrong' }, { state: 'unknown' }, { state: 'unknown' }],
        inputs: [{ text: '<BOS>' }, { text: 'Hund', state: 'wrong' }, { state: 'unknown' }],
      });
      const tf = row({
        top: 380, loss: true,
        preds: [{ text: 'Hund', state: 'wrong' }, { text: 'Katze' }, { text: 'saß' }],
        inputs: [{ text: '<BOS>' }, { text: 'die' }, { text: 'Katze' }],
      });
      const head = (y, title, sub) => `<div class="abs row-head" style="left:0;top:${y}px"><b>${title}</b><div class="row-sub">${sub}</div></div>`;
      return `
        <div class="abs tf" style="left:112px;top:186px;width:1696px;height:690px">
          <svg class="abs" width="1696" height="680" style="left:0;top:0">
            ${gen.s}
            <g data-build="1"><line x1="0" x2="1696" y1="336" y2="336" stroke="var(--rule)" stroke-width="1.5"/>${tf.s}</g>
            <g data-build="2">${gen.chain}${tf.chain}</g>
          </svg>
          ${gen.ov}<div data-build="1">${tf.ov}</div>
          ${head(108, 'Generation', '<i>inference</i>')}
          <div data-build="1">${head(488, 'Training', 'teacher forcing:<br>feed the <b>true</b> previous token')}</div>
          <div class="abs row-cap problem-ink" style="left:1180px;top:126px">one mistake ${tex`\to`} wrong prefix<br>for everything after</div>
          <div class="abs row-cap" data-build="1" style="left:1180px;top:506px">every step learns<br>from the correct prefix</div>
        </div>
        <div class="abs anchor-line" data-build="2" style="left:0;right:0;top:912px;text-align:center">all inputs are known in advance, <b>yet the RNN still computes ${tex`s_1 \to s_2 \to s_3`} one step at a time</b></div>`;
    },
  });
})();
