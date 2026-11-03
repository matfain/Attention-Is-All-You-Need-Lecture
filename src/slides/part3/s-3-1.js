/* Slide 3.1: Table 1 (no convolution row). Build 1: the hidden cost, n²d vs nd² for two
 * lengths at d = 512 (each bar pair on its own linear scale; the ratio does the comparison).
 * Build 2: "so why not RNNs for long inputs?", three short reasons replace the cases. */
(function () {
  const T = DATA.part3.table1;
  const d = T.d;
  const up = tex`\downarrow`;
  // "4.6×10⁵" with KaTeX_Main digits
  const sci = (v) => {
    const e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e);
    return `<span class="num">${m.toFixed(1)}×10<sup>${e}</sup></span>`;
  };
  const BAR = 300;
  const digits = (t) => t.replace(/\d+/g, (m) => `<span class="num">${m}</span>`);

  const kase = (c) => {
    const sa = c.n * c.n * d, rnn = c.n * d * d, mx = Math.max(sa, rnn);
    const ratio = Math.round(Math.max(sa, rnn) / Math.min(sa, rnn));
    const bar = (lab, f, v, cls) => `<div class="hc-row"><span class="hc-lab">${lab}</span>` +
      `<span class="hc-bar ${cls}" style="width:${Math.max(4, (v / mx) * BAR)}px"></span><span class="hc-val">${f} ${C.sym("≈")} ${sci(v)}</span></div>`;
    return `<div class="hc-card">
      <div class="hc-title">${digits(c.label)}, <span class="num"><i>n</i> = ${c.n.toLocaleString('en-US')}</span></div>
      ${bar('self-attention', tex`n^2 d`, sa, sa < rnn ? 'win' : 'lose')}
      ${bar('RNN', tex`n d^2`, rnn, rnn < sa ? 'win' : 'lose')}
      <div class="hc-res">${C.sym('→')} self-attention <b>~<span class="num">${ratio}</span>× ${sa < rnn ? 'cheaper' : 'more expensive'}</b></div>
    </div>`;
  };

  const table = `
    <table class="bt t1">
      <thead><tr><th>Layer</th><th class="center">Compute per layer ${up}</th><th class="center">Sequential operations ${up}</th><th class="center">Max path length ${up}</th></tr></thead>
      <tbody>
        <tr><td class="t1-sa">Self-attention</td><td class="center">${tex`O(n^2 d)`}</td><td class="center">${tex`O(1)`}</td><td class="center">${tex`O(1)`}</td></tr>
        <tr><td class="t1-rec">Recurrent</td><td class="center">${tex`O(n d^2)`}</td><td class="center">${tex`O(n)`}</td><td class="center">${tex`O(n)`}</td></tr>
      </tbody>
    </table>`;

  Deck.slide({
    id: 's-3-1',
    part: 3,
    title: 'Compute Comparison: Self-Attention vs. Recurrence',
    cite: 'Vaswani et al., 2017 · Table 1',
    builds: 2,
    render() {
      return `
        <div class="abs" style="left:0;right:0;top:176px;display:flex;justify-content:center">${table}</div>
        <div class="abs caption t1-def" style="left:0;right:0;top:396px;text-align:center">${tex`n`} = sequence length · ${tex`d`} = representation dimension</div>
        <ul class="anchors abs t1-anch" style="left:0;right:0;top:456px">
          <li>${tex`QK^\top`}: ${tex`n\times n`} dot products of size ${tex`d`}</li>
          <li>RNN: ${tex`n`} steps of a ${tex`d\times d`} product</li>
        </ul>
        <div data-build="1">
          <div class="abs anchor-line" style="left:0;right:0;top:600px;text-align:center">
            Self-attention is cheaper ${tex`\iff n^2 d < n d^2 \iff`} <b>${tex`n < d`}</b> <span class="muted">(${tex`d = 512`})</span>
          </div>
          <div class="abs hc" data-build-max="1" style="left:0;right:0;top:680px">${T.cases.map(kase).join('')}</div>
        </div>
        <div data-build="2" class="abs why" style="left:112px;right:112px;top:680px">
          <div class="why-q">So why not RNNs for long inputs?</div>
          <div class="why-row">
            <div class="why-tile"><b>Training speed</b><ul><li>RNN: ${tex`n`} steps in a row</li><li>attention: one parallel step</li></ul></div>
            <div class="why-tile"><b>Quality</b><ul><li>RNN: fixed-size state forgets</li><li>attention: one hop to any token</li></ul></div>
            <div class="why-tile"><b>Break-even grows with ${tex`d`}</b><ul><li>cheaper while ${tex`n < d`}</li><li>bigger ${tex`d`} ${tex`\to`} longer inputs</li></ul></div>
          </div>
        </div>`;
    },
  });
})();
