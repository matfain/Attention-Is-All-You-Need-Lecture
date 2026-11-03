/* Slide 2.2: Why divide by √d_k. Three titled build steps above an interactive visual:
 * softmax weights of one query over 6 keys, random q, k ~ N(0, I) with a fixed
 * seed per d_k. Slider d_k ∈ {4, 16, 64, 256, 512}, toggle unscaled / scaled.
 * Bars are the weights α_1 … α_6 of one query q over six keys k_1 … k_6.
 * The three titled steps (Scores Grow with d_k / Softmax Sees Only Gaps / Fix ÷√d_k) above a
 * wide, low widget that the builds drive: build 0 = widget only (default d_k = 512, free play), 1–3 = the steps;
 * build 2 sets d_k = 512 unscaled, build 3 scaled. */
(function () {
  const P = DATA.part2.sqrtDk;
  const KEYS = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'];

  // deterministic N(0,1) samples (mulberry32 + Box–Muller)
  function rng(seed) {
    let a = seed >>> 0;
    const u = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    return () => Math.sqrt(-2 * Math.log(u() + 1e-12)) * Math.cos(2 * Math.PI * u());
  }
  function weights(dk, scaled) {
    const g = rng(P.seedBase + dk);
    const q = Array.from({ length: dk }, g);
    const scores = KEYS.map(() => { let s = 0; for (let i = 0; i < dk; i++) s += q[i] * g(); return s; });
    const z = scores.map((s) => (scaled ? s / Math.sqrt(dk) : s));
    const m = Math.max(...z), e = z.map((x) => Math.exp(x - m)), sum = e.reduce((a, b) => a + b, 0);
    return { w: e.map((x) => x / sum), scores: z };
  }

  Deck.slide({
    id: 's-2-2',
    part: 2,
    title: `Why Divide by ${tex`\sqrt{d_k}`}?`,
    cite: 'Vaswani et al., 2017, footnote 4',
    thumb: ['enc-mha'],
    builds: 3,
    render() {
      const ticks = P.dkValues.map((v, i) => `<span style="left:${(i / (P.dkValues.length - 1)) * 100}%">${v}</span>`).join('');
      // three steps as titled columns
      const step = (k, x1, x2, title, body) => `<div class="abs stage-title" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:262px">${title}</div>` +
        `<div class="abs s22-step" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:340px">${body}</div>`;
      return `
        <div class="abs anchor-line" style="left:0;right:0;top:170px;text-align:center">${tex`\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\!\left(\frac{QK^\top}{\color{#4F64AE}\sqrt{d_k}}\right)V`}</div>
        ${step(1, 112, 660, `Scores Grow with ${tex`d_k`}`, `
          <div>${tex`q = (q_1, \dots, q_{d_k}),\quad k = (k_1, \dots, k_{d_k})`}</div>
          <div>${tex`q_r, k_r`} independent, mean 0, variance 1</div>
          <div>${tex`q\cdot k=\textstyle\sum_{r=1}^{d_k} q_rk_r,\quad \mathbb{E}[q\cdot k]=0`}</div>
          <div>${tex`\mathrm{Var}(q\cdot k)=\textstyle\sum_r \mathbb{E}[q_r^2]\,\mathbb{E}[k_r^2]=d_k`}</div>
          <div class="s22-key">${tex`\to`} spread ${tex`\sqrt{d_k}\approx 23`} at ${tex`d_k = 512`}</div>`)}
        ${step(2, 680, 1270, 'Softmax Sees Only Gaps', `
          <div>${tex`\alpha_j = \dfrac{\exp(e_j)}{\sum_m \exp(e_m)}`}</div>
          <div>${tex`\dfrac{\alpha_j}{\alpha_l} = \exp(e_j - e_l)`} <span class="s22-note">the denominator cancels</span></div>
          <div>gaps of tens ${tex`\to`} <b>one key takes all</b></div>
          <div>${tex`\dfrac{\partial\alpha_j}{\partial e_j} = \alpha_j(1-\alpha_j)\approx 0`} ${tex`\to`} <b>vanishing gradients</b></div>`)}
        ${step(3, 1290, 1590, `Fix: ${tex`\div\sqrt{d_k}`}`, `
          <div>variance 1 for any ${tex`d_k`}</div>
          <div>sets the <b>“temperature”</b></div>
          <div>of the averaging</div>`)}
        <div class="abs panel s22-vis" style="left:262px;top:650px;width:1396px;height:320px" data-interactive>
          <div class="s22-ctl">
            <div class="s22-slider">
              <div class="caption">${tex`d_k`} <b class="dk-val"></b></div>
              <input type="range" min="0" max="${P.dkValues.length - 1}" step="1" value="${P.dkValues.indexOf(P.defaultDk)}" aria-label="d_k">
              <div class="ticks">${ticks}</div>
            </div>
            ${C.seg('scale', [{ key: 'unscaled', label: 'Unscaled' }, { key: 'scaled', label: 'Scaled ÷ √d<sub>k</sub>' }], 'unscaled')}
          </div>
          <svg class="abs" width="680" height="300" style="left:680px;top:6px">
            ${C.weightBars({ x: 60, y: 238, labels: KEYS, weights: weights(P.defaultDk, false).w, h: 180, bw: 64, gap: 34, labelFs: 22 })
              .replace(/>k(\d)</g, '><tspan class="al">α</tspan><tspan class="al-sub" dy="7">$1</tspan><')}
          </svg>
        </div>`;
    },
    mount(el) {
      const range = el.querySelector('input[type=range]'), bars = el.querySelector('.wbars');
      const dkv = el.querySelector('.dk-val');
      let scaled = false;
      const draw = () => {
        const dk = P.dkValues[+range.value];
        const { w } = weights(dk, scaled);
        C.setWeightBars(bars, w);
        dkv.textContent = '= ' + dk;
      };
      range.addEventListener('input', draw);
      const setSeg = C.wireSeg(el, 'scale', (k) => { scaled = k === 'scaled'; draw(); });
      // the builds drive the widget (still fully interactive): 0–1 the default d_k (512), unscaled (free play) ·
      // 2 d_k = 512 unscaled (one key takes all) · 3 d_k = 512 scaled
      const top = P.dkValues.length - 1, def = P.dkValues.indexOf(P.defaultDk);
      const STATE = [{ dk: def, sc: false }, { dk: def, sc: false }, { dk: top, sc: false }, { dk: top, sc: true }];
      return {
        update(b) {
          const st = STATE[b];
          range.value = st.dk; scaled = st.sc; setSeg(st.sc ? 'scaled' : 'unscaled');
          draw();
        },
      };
    },
  });
})();
