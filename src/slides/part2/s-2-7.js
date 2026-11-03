/* Slide 2.7: Sinusoidal positional encoding. Position slider (0…100) drives
 * (left) six clock dials, one per frequency pair i (hand tip = (sin, cos) of ω_i·pos),
 * and (right) a PE heatmap, positions × first 128 dimensions, current row highlighted.
 * No bullets: stage titles over the panels (Clock Hands / All Positions) and a build-2 bottom line (why sinusoids). */
(function () {
  const P = DATA.part2.peClocks;
  const D = P.dModel;
  const omega = (i) => Math.pow(10000, (-2 * i) / D);
  const pe = (pos, dim) => { const i = Math.floor(dim / 2); return dim % 2 === 0 ? Math.sin(omega(i) * pos) : Math.cos(omega(i) * pos); };
  const lam = (i) => (2 * Math.PI) / omega(i);
  const fmtLam = (x) => (x >= 1000 ? Math.round(x).toLocaleString('en-US') : x >= 100 ? x.toFixed(0) : x.toFixed(1));

  const R = 54, DW = 210, DH = 200;
  const dial = (i, k) => {
    const cx = (k % 3) * DW + DW / 2, cy = Math.floor(k / 3) * DH + 64;
    return `<g class="dial" data-i="${i}" transform="translate(${cx},${cy})">
      <circle r="${R}" class="dial-face"/>
      <line x1="0" y1="${-R}" x2="0" y2="${-R + 10}" class="dial-tick"/>
      <line class="dial-hand" x1="0" y1="0" x2="0" y2="${-R + 8}"/>
      <circle class="dial-tip" r="6" cx="0" cy="${-R + 8}"/>
      <circle r="4" class="dial-hub"/>
      <text class="dial-i" y="${R + 32}">i = ${i}</text>
      <text class="dial-l" y="${R + 60}">λ ≈ ${fmtLam(lam(i))}</text>
    </g>`;
  };

  const HM = { x: 0, y: 0, w: 840, h: 340, gap: 56 }, POS = P.posMax + 1, DIMS = P.heatDims;
  const BW = (HM.w - HM.gap) / 2; // one block per component: sin | cos

  Deck.slide({
    id: 's-2-7',
    part: 2,
    title: 'Sinusoidal Positional Encoding',
    thumb: ['in-pe', 'out-pe'],
    builds: 2, // 0: the definition only · 1: Clock Hands (slider, dials) + All Positions (heatmaps) · 2: why sinusoids
    render() {
      return `
        <div class="abs pe-eqs" style="left:112px;top:166px">
        <div class="eq-display pe-top">
          ${tex`PE_{pos} = \big(\sin(\omega_0\, pos),\ \cos(\omega_0\, pos),\ \sin(\omega_1\, pos),\ \cos(\omega_1\, pos),\ \dots,\ \sin(\omega_{255}\, pos),\ \cos(\omega_{255}\, pos)\big) \in \mathbb{R}^{512}`}
        </div>
        <div class="eq-display pe-gen">
          ${tex`PE_{(pos,2i)}=\sin(\omega_i\, pos),\quad PE_{(pos,2i+1)}=\cos(\omega_i\, pos),\quad \omega_i = 10000^{-2i/d_{model}}`}
        </div>
        </div>
        <div data-build="1">
        <div class="abs stage-title" style="left:112px;width:640px;top:300px">Clock Hands</div>
        <div class="abs stage-sub" style="left:112px;width:640px;top:366px">fast ${tex`\to`} fine position · slow ${tex`\to`} coarse position</div>
        <div class="abs stage-title" style="left:968px;width:840px;top:300px">All Positions</div>
        <div class="abs stage-sub" style="left:968px;width:840px;top:366px">row = ${tex`PE_{pos}`} · column = one frequency</div>
        <div class="abs s27-ctl" style="left:112px;top:422px;width:640px" data-interactive>
          <div class="caption">Position <b class="pos-val"></b></div>
          <input type="range" min="0" max="${P.posMax}" step="1" value="${P.defaultPos}" aria-label="Position">
        </div>
        <svg class="abs s27-dials" width="${3 * DW}" height="${2 * DH}" style="left:122px;top:500px">${P.dials.map(dial).join('')}</svg>
        <div class="abs caption s27-lam" style="left:${122 + 1.5 * DW}px;top:890px">${tex`\lambda = 2\pi/\omega_i`}: positions per full turn</div>
        <div class="abs s27-hm" style="left:968px;top:476px;width:${HM.w}px;height:${HM.h}px">
          ${[0, 1].map((b) => P.dials.map((i) => `<div class="hm-tick${i === 4 || i === 16 ? ' bare' : ''}" style="left:${b * (BW + HM.gap) + ((i + 0.5) / DIMS) * BW}px">${i === 4 || i === 16 ? '' : i}</div>`).join('')).join('')}
          <canvas data-k="0" width="${DIMS}" height="${POS}" style="position:absolute;left:0;top:0;width:${BW}px;height:${HM.h}px"></canvas>
          <canvas data-k="1" width="${DIMS}" height="${POS}" style="position:absolute;left:${BW + HM.gap}px;top:0;width:${BW}px;height:${HM.h}px"></canvas>
          <div class="hm-row"></div>
          <div class="abs caption" style="left:0;width:${BW}px;text-align:center;top:${HM.h + 8}px">${tex`\sin(\omega_i\, pos)`} entries, ${tex`i = 0 \to 255`}</div>
          <div class="abs caption" style="left:${BW + HM.gap}px;width:${BW}px;text-align:center;top:${HM.h + 8}px">${tex`\cos(\omega_i\, pos)`} entries, ${tex`i = 0 \to 255`}</div>
          <div class="abs caption hm-ylab">position 0 ${tex`\to`} ${P.posMax}</div>
        </div>
        </div>
        <div class="abs anchor-line" data-build="2" style="left:0;right:0;top:940px;text-align:center">${tex`pos \to pos{+}k`} <b>rotates</b> each sin/cos pair: relative offsets are easy to learn</div>
`;
    },
    mount(el) {
      const range = el.querySelector('input[type=range]'), pv = el.querySelector('.pos-val');
      const row = el.querySelector('.hm-row');
      // heatmaps once: block 0 = sin entries (dims 2i), block 1 = cos entries (dims 2i+1)
      el.querySelectorAll('.s27-hm canvas').forEach((cv) => {
        const k = +cv.dataset.k, ctx = cv.getContext('2d'), img = ctx.createImageData(DIMS, POS);
        for (let p = 0; p < POS; p++) for (let i = 0; i < DIMS; i++) {
          const c = C.rampInk((pe(p, 2 * i + k) + 1) / 2).match(/\d+/g).map(Number);
          img.data.set([c[0], c[1], c[2], 255], (p * DIMS + i) * 4);
        }
        ctx.putImageData(img, 0, 0);
      });
      const draw = () => {
        const pos = +range.value;
        pv.textContent = '= ' + pos;
        el.querySelectorAll('.dial').forEach((g) => {
          const th = omega(+g.dataset.i) * pos; // hand tip = (sin θ, cos θ): angle θ clockwise from 12 o'clock
          const x = Math.sin(th) * (R - 8), y = -Math.cos(th) * (R - 8);
          const hand = g.querySelector('.dial-hand'), tip = g.querySelector('.dial-tip');
          hand.setAttribute('x2', x.toFixed(2)); hand.setAttribute('y2', y.toFixed(2));
          tip.setAttribute('cx', x.toFixed(2)); tip.setAttribute('cy', y.toFixed(2));
        });
        const rh = HM.h / POS;
        row.style.top = (pos * rh - 2) + 'px';
        row.style.height = (rh + 4) + 'px';
      };
      range.addEventListener('input', draw);
      draw();
      return {};
    },
  });
})();
