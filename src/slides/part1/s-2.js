/* Slide 2: Sequence-to-sequence tasks. Build steps walk through four examples (translation first,
 * LLM chat last, styled like the others). The tab row is a non-interactive indicator of the current example. */
Deck.slide({
  id: 's-2',
  part: 1,
  title: 'Sequence-to-Sequence (seq2seq) Tasks',
  builds: DATA.part1.seq2seqExamples.length - 1,
  render() {
    const ex = DATA.part1.seq2seqExamples;
    return `
      <ul class="anchors abs" style="left:112px;top:196px;width:1700px">
        <li>Input ${tex`x = (x_1,\dots,x_n)`} ${tex`\;\to\;`} output ${tex`y = (y_1,\dots,y_m)`}, generally ${tex`n \neq m`}</li>
        <li>Autoregressive generation: ${tex`p(y\mid x)=\prod_{t=1}^{m} p(y_t \mid y_{<t}, x)`}</li>
        <li class="quote">one token at a time, conditioned on input + past outputs</li>
      </ul>
      <div class="abs s2s-panel panel" style="left:112px;top:470px;width:1696px;height:380px">
        <div class="abs" style="left:0;right:0;top:32px;display:flex;justify-content:center">${C.seg('ex', ex.map((e) => ({ key: e.key, label: e.label })), ex[0].key, 'indicator')}</div>
        <div class="abs s2s-flow" style="left:40px;right:40px;top:132px;height:220px"></div>
      </div>`;
  },
  mount(el) {
    const ex = DATA.part1.seq2seqExamples;
    const flow = el.querySelector('.s2s-flow');
    const wave = () => {
      // Audio frames: a waveform drawn as bars (fixed pseudo-random amplitudes).
      let bars = '';
      for (let i = 0; i < 46; i++) {
        const a = 10 + 70 * Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21 + 1)) * (0.4 + 0.6 * Math.abs(Math.sin(i * 1.7)));
        bars += `<rect x="${i * 13}" y="${90 - a}" width="8" height="${2 * a}" rx="3"/>`;
      }
      return `<svg width="600" height="180" class="wave" aria-label="audio waveform frames"><g fill="var(--src)" fill-opacity=".75">${bars}</g></svg>`;
    };
    const show = (key) => {
      const e = ex.find((x) => x.key === key);
      const src = e.srcKind === 'waveform' ? wave() : e.src.map((t) => C.chipHTML(t, 'src')).join('');
      flow.innerHTML = `
        <div class="s2s-side src-side">${src}</div>
        <svg class="s2s-arrow" width="90" height="40"><path class="wire" d="M6,20 H78" marker-end="url(#arr-ink)"/></svg>
        <div class="s2s-model">model</div>
        <svg class="s2s-arrow" width="90" height="40"><path class="wire" d="M6,20 H78" marker-end="url(#arr-ink)"/></svg>
        <div class="s2s-side tgt-side">${e.tgt.map((t) => C.chipHTML(t, 'tgt')).join('')}</div>`;
    };
    const tabs = [...el.querySelectorAll('[data-seg="ex"] button')];
    return {
      update(b) {
        show(ex[b].key);
        tabs.forEach((t, i) => t.setAttribute('aria-pressed', String(i === b)));
      },
    };
  },
});
