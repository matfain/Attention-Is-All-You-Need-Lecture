/* Slide 3: RNNs. Build steps compute h_1 … h_5 one at a time. Each h_t is a fixed-size
 * bar with one segment per word read so far: older words shrink (illustrative shares).
 * A last build adds the observation: the two problems (bottleneck, long-range dependencies).
 * No bullets: a framing line under
 * the title, the chain moved up, the two problems as a red bottom line. */
(function () {
  const TOK = DATA.part1.rnnTokens;
  const SHARES = DATA.part1.rnnShares.shares;
  const H_LABELS = [tex`h_1`, tex`h_2`, tex`h_3`, tex`h_4`, tex`h_5`];
  // one shade of the source blue per word; placeholder words in grey
  const SHADE = ['#1F43A3', '#4A74DE', '#9CB2EE', '#B3BAC6', '#D3D8E0'];
  const TEXT = ['#fff', '#fff', 'var(--ink)', 'var(--ink)', 'var(--ink)'];
  const X0 = 300, DXS = 250, BW = 116, BH = 290, BY = 84;

  const segments = (i) => {
    let y = BY + BH, out = '';
    SHARES[i].forEach((s, w) => {
      const h = s * BH;
      y -= h;
      const x = X0 + i * DXS - BW / 2;
      out += `<rect x="${x + 4}" y="${y + 2}" width="${BW - 8}" height="${Math.max(0, h - 4)}" rx="3" fill="${SHADE[w]}"/>`;
      if (h >= 38 && TOK[w] !== '…') out += `<text x="${x + BW / 2}" y="${y + h / 2 + 1}" class="mono seg-lab" style="fill:${TEXT[w]}">${TOK[w]}</text>`;
    });
    return out;
  };

  Deck.slide({
    id: 's-3',
    part: 1,
    title: 'Recurrent Neural Networks (RNNs)',
    builds: TOK.length + 1,
    render() {
      let svg = '', ov = '';
      svg += `<path class="wire graphite" d="M${X0 - 170},${BY + BH / 2} H${X0 - BW / 2 - 8}" marker-end="url(#arr-graphite)"/>`;
      ov += C.ov(X0 - 192, BY + BH / 2, tex`h_0`, 'r', 'label muted');
      TOK.forEach((t, i) => {
        const cx = X0 + i * DXS, x = cx - BW / 2;
        svg += t === '…'
          ? C.chip({ cx, cy: 456, text: '', role: 'neutral', w: 72 }) + [-14, 0, 14].map((d) => `<circle cx="${cx + d}" cy="456" r="4" fill="var(--graphite)"/>`).join('')
          : C.chip({ cx, cy: 456, text: t, role: 'src' });
        svg += `<path class="wire in" data-i="${i}" d="M${cx},428 V${BY + BH + 10}" marker-end="url(#arr-ink)"/>`;
        svg += `<g class="hbox" data-i="${i}">
          <rect class="hb-frame" x="${x}" y="${BY}" width="${BW}" height="${BH}" rx="8"/>
          <g class="hb-segs">${segments(i)}</g>
        </g>`;
        if (i < TOK.length - 1) svg += `<path class="wire chain" data-i="${i}" d="M${x + BW + 6},${BY + BH / 2} H${x + DXS - 10}" marker-end="url(#arr-ink)"/>`;
        ov += C.ov(cx, BY - 28, H_LABELS[i], 'c', 'label hlabel');
        ov += `<div class="abs counter" data-i="${i}" style="left:${cx}px;top:0;transform:translateX(-50%);white-space:nowrap">steps from <span class="mono src-ink">the</span> to here: <b>${i}</b></div>`;
      });
      // legend
      const legend = [['the', 0], ['cat', 1], ['sat', 2], ['later words', 3]].map(([w, k], j) =>
        `<rect x="0" y="${j * 46}" width="30" height="30" rx="4" fill="${SHADE[k]}"/>` +
        `<text x="44" y="${j * 46 + 16}" class="${k < 3 ? 'mono' : 'cap'}" style="font-size:24px;dominant-baseline:central">${w}</text>`).join('');
      svg += `<g transform="translate(1520,${BY + 40})">${legend}</g>`;
      return `
        <div class="abs anchor-line" style="left:0;right:0;top:176px;text-align:center">${tex`h_t = f(h_{t-1}, x_t)`}: a <b>running summary</b>, same weights at every step</div>
        <div class="abs anchor-line" data-build="${TOK.length + 1}" style="left:0;right:0;top:910px;text-align:center"><b class="problem-ink">information bottleneck</b> (fixed-size ${tex`h_t`}) · <b class="problem-ink">long-range dependencies</b> fade</div>
        <div class="abs rnn" style="left:112px;top:320px;width:1696px;height:500px">
          <svg width="1696" height="500" class="abs" style="left:0;top:0">${svg}</svg>
          ${ov}
        </div>`;
    },
    mount(el) {
      return {
        update(b) {
          b = Math.min(b, TOK.length); // the observation build keeps the last state on screen
          el.querySelectorAll('.hbox').forEach((g) => {
            const i = +g.dataset.i;
            g.classList.toggle('on', i < b);
            g.classList.toggle('current', i === b - 1);
          });
          el.querySelectorAll('.wire.in').forEach((w) => w.classList.toggle('off', +w.dataset.i >= b));
          el.querySelectorAll('.wire.chain').forEach((w) => w.classList.toggle('off', +w.dataset.i >= b - 1));
          el.querySelectorAll('.counter').forEach((c) => c.classList.toggle('build-off', +c.dataset.i !== b - 1));
          el.querySelectorAll('.hlabel').forEach((l, i) => l.classList.toggle('dimtext', i >= b));
        },
      };
    },
  });
})();
