/* Slide 2.12: how far is word 1 from the prediction? A comparison table (RNN | Transformer,
 * same column order as the cards) over two static cards.
 * Left: slide 3's RNN chain with the same segmented state bars (one shade per word, illustrative
 * shares), the percentage = word 1's share of h_t; the red recurrent steps are numbered 1…n−1.
 * Right: the same tokens, attention lines from every earlier token straight into the last
 * position's vector: 1 hop. */
(function () {
  const TOK = DATA.part1.rnnTokens;
  const SHARES = DATA.part1.rnnShares.shares;
  const SHARE = DATA.part2.pathLength.wordOneShare;
  const SHADE = ['#1F43A3', '#4A74DE', '#9CB2EE', '#B3BAC6', '#D3D8E0']; // as on slide 3
  const n = TOK.length;
  const PW = 820; // card width
  const X0 = 70, DX = 136, BW = 64, BH = 200, BY = 204, CY = 468;
  const up = tex`\uparrow`, down = tex`\downarrow`;

  const token = (cx, t) => t === '…'
    ? C.chip({ cx, cy: CY, text: '', role: 'neutral', w: 72 }) + [-14, 0, 14].map((d) => `<circle cx="${cx + d}" cy="${CY}" r="4" fill="var(--graphite)"/>`).join('')
    : C.chip({ cx, cy: CY, text: t, role: 'src' });

  // a state bar split into one segment per word read so far (word 1 at the bottom)
  const segments = (i, x) => {
    let y = BY + BH, out = '';
    SHARES[i].forEach((s, w) => {
      const h = s * BH;
      y -= h;
      out += `<rect x="${x + 4}" y="${y + 2}" width="${BW - 8}" height="${Math.max(0, h - 4)}" rx="3" fill="${SHADE[w]}"/>`;
    });
    return out;
  };

  const rnn = () => {
    let s = '', ov = '';
    TOK.forEach((t, i) => {
      const cx = X0 + i * DX, x = cx - BW / 2;
      s += token(cx, t);
      s += `<path class="wire" d="M${cx},${CY - 28} V${BY + BH + 8}" marker-end="url(#arr-ink)"/>`;
      s += `<rect class="pl-frame" x="${x}" y="${BY}" width="${BW}" height="${BH}" rx="7"/>${segments(i, x)}`;
      if (i < n - 1) {
        s += `<path class="wire problem" d="M${x + BW + 6},${BY + BH / 2} H${x + DX - 10}" marker-end="url(#arr-problem)"/>`;
        s += `<text class="pl-n" x="${x + BW + DX / 2 - BW / 2 - 2}" y="${BY + BH / 2 - 14}">${i + 1}</text>`;
      }
      ov += C.ov(cx, BY - 20, `${Math.round(SHARE[i] * 100)}%`, 'b', 'pl-pct');
    });
    const last = X0 + (n - 1) * DX;
    s += `<path class="wire" d="M${last + BW / 2 + 6},${BY + 40} H${last + BW / 2 + 70}" marker-end="url(#arr-ink)"/>`;
    ov += C.ov(last + BW / 2 + 80, BY + 40, 'predict', 'l', 'caption');
    const mid = PW / 2; // card texts centred on the card
    ov += C.ov(mid, 92, `word 1 ${tex`\to`} prediction: <b class="problem-ink">${n - 1} steps</b> ${tex`= n-1`}`, 'c', 'pl-head');
    ov += C.ov(mid, 134, `share of <span class="mono src-ink">the</span> in ${tex`h_t`}`, 'c', 'pl-sub');
    return { s, ov };
  };

  const tf = () => {
    let s = '', ov = '';
    const last = X0 + (n - 1) * DX, vy = BY;
    TOK.forEach((t, i) => {
      const cx = X0 + i * DX;
      s += token(cx, t);
      if (i < n - 1) s += `<path class="attn ${i === 0 ? 'w1' : ''}" style="${C.attnStyle(i === 0 ? 0.55 : 0.25)}" d="${C.curve(cx, CY - 28, last - 36 + i * 12, vy + 34)}"/>`;
    });
    s += `<path class="wire" d="M${last + 24},${CY - 28} V${vy + 36}" marker-end="url(#arr-ink)"/>`;
    s += C.vbar({ x: last - 50, y: vy, values: [0.6, 0.3, 0.8, 0.45], role: 'src', cell: 25 }).replace('class="vbar ', 'class="vbar pl-vec ');
    s += `<path class="wire" d="M${last + 56},${vy + 12} H${last + 110}" marker-end="url(#arr-ink)"/>`;
    ov += C.ov(last + 120, vy + 12, 'predict', 'l', 'caption');
    ov += C.ov(PW / 2, 92, `word 1 ${tex`\to`} prediction: ${C.icon('hop', 36)} <b>1 hop</b>`, 'c', 'pl-head pl-hop');
    return { s, ov };
  };

  const panel = (x, title, { s, ov }) => `
    <div class="abs pl-panel" style="left:${x}px;top:470px;width:820px;height:510px">
      <div class="pl-title">${title}</div>
      <svg class="abs" width="820" height="510" style="left:0;top:0">${s}</svg>${ov}
    </div>`;

  // RNN vs Transformer at a glance (columns in the same order as the cards below)
  const table = `<table class="bt pl-tab"><thead><tr><th></th><th>RNN</th><th>Transformer</th></tr></thead><tbody>
      <tr><td class="rowh">prediction from</td><td><b>one vector per position</b></td><td><b>one vector per position</b></td></tr>
      <tr><td class="rowh">word 1 ${tex`\to`} that vector</td><td class="problem-ink">${tex`n-1`} sequential steps, fading</td><td><b>one attention hop</b>, in every layer</td></tr>
      <tr><td class="rowh">path length</td><td><b class="problem-ink">${tex`O(n)`}</b></td><td><b>${tex`O(1)`}</b></td></tr>
    </tbody></table>`;

  Deck.slide({
    id: 's-2-12',
    part: 2,
    title: 'How Far Is Word 1 From the Prediction?',
    render() {
      return `
        <div class="abs" style="left:0;right:0;top:176px;display:flex;justify-content:center">${table}</div>
        ${panel(112, 'RNN', rnn())}
        ${panel(988, 'Transformer', tf())}`;
    },
  });
})();
