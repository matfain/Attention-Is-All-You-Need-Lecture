/* Slide 2.6: Attention is blind to order. No bullets: the equivariance statement as a framing line; build 0
 * "dog bites man" → outputs (the sentence is the panel's stage title); build 1 "man bites dog" →
 * the same output vectors, only reordered (≡ link on "dog"); build 2 the sets/graphs bottom line;
 * build 3 the fix (add PE) under it. */
(function () {
  const V = DATA.part2.permutation.vectors; // output shading per word
  const SENT = [['dog', 'bites', 'man'], ['man', 'bites', 'dog']];
  const Z = { dog: tex`z_{\text{dog}}`, bites: tex`z_{\text{bites}}`, man: tex`z_{\text{man}}` };
  const PX = [112, 1010], PW = 798, WX = [150, 400, 650], CELL = 34;
  const CY = 40, BAND = [108, 188], OY = 250, PT = 392; // panel top

  const panel = (sent, k) => {
    let s = `<rect class="sa-box" x="40" y="${BAND[0]}" width="${PW - 80}" height="${BAND[1] - BAND[0]}" rx="14"/>`;
    sent.forEach((w, i) => {
      const x = WX[i];
      s += C.chip({ cx: x, cy: CY, text: w, role: 'src', state: w === 'dog' ? 'highlight' : '' });
      s += `<path class="wire" d="M${x},${CY + 28} V${BAND[0] - 8}" marker-end="url(#arr-ink)"/>`;
      s += `<path class="wire" d="M${x},${BAND[1] + 4} V${OY - 10}" marker-end="url(#arr-ink)"/>`;
      s += C.vbar({ x: x - 2 * CELL, y: OY, values: V[w], role: 'src', cell: CELL, orient: 'h', cls: w === 'dog' ? 'dogbar' : '' });
    });
    const ov = C.ov(PW / 2, (BAND[0] + BAND[1]) / 2, 'self-attention <span class="muted">(no positions)</span>', 'c', 'sa-lab') +
      sent.map((w, i) => C.ov(WX[i], OY + CELL + 26, Z[w], 'c', 'label' + (w === 'dog' ? ' dog-lab' : ' muted'))).join('');
    return `<div class="abs stage-title" ${k ? 'data-build="1"' : ''} style="left:${PX[k] + 40}px;width:${PW - 80}px;top:${PT - 86}px">“${sent.join(' ')}”</div>
    <div class="abs s26-p" ${k ? 'data-build="1"' : ''} style="left:${PX[k]}px;top:${PT}px;width:${PW}px;height:360px">
      <svg class="abs" width="${PW}" height="360" style="left:0;top:0">${s}</svg>${ov}</div>`;
  };

  Deck.slide({
    id: 's-2-6',
    part: 2,
    title: 'Attention Is Blind to Order',
    thumb: ['in-pe', 'out-pe'],
    builds: 3,
    render() {
      // ≡ link between the two "dog" outputs (A: first word, B: last word)
      const ax = PX[0] + WX[0], bx = PX[1] + WX[2], y = PT + OY + CELL + 50;
      const link = `<svg class="abs" data-build="1" width="1920" height="1080" style="left:0;top:0;pointer-events:none">
          <path class="wire graphite dashed" d="M${ax},${y} C${ax},${y + 80} ${bx},${y + 80} ${bx},${y + 6}" marker-end="url(#arr-graphite)"/></svg>
        <div class="abs label" data-build="1" style="left:${(ax + bx) / 2}px;top:${y + 62}px;transform:translateX(-50%);background:var(--paper);padding:0 12px"><span class="equiv">${tex`\equiv`}</span> same vector</div>`;
      return `
        <div class="abs anchor-line" style="left:0;right:0;top:176px;text-align:center">${tex`\mathrm{SelfAttn}(PX) = P\,\mathrm{SelfAttn}(X)`} for any permutation ${tex`P`}: <b>permutation equivariance</b></div>
        <div class="abs anchor-line" data-build="2" style="left:0;right:0;top:876px;text-align:center">a feature for sets &amp; graphs (GNNs, set models), <b>a bug for language</b></div>
        <div class="abs anchor-line" data-build="3" style="left:0;right:0;top:934px;text-align:center"><b>Fix:</b> add a position vector, ${tex`x_{pos} = \mathrm{embed}(\text{token})\cdot\sqrt{d_{model}} + PE_{pos}`}</div>
        ${panel(SENT[0], 0)}${panel(SENT[1], 1)}${link}`;
    },
  });
})();
