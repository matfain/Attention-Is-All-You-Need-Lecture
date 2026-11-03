/* Slide 0: Title. Ambient motif: faint token chips joined by slowly drifting attention lines. */
Deck.slide({
  id: 's-0',
  part: 1,
  noFooter: true,
  cls: 's-title',
  render() {
    const top = ['the', 'cat', 'sat', 'on', 'the', 'mat'];
    const bot = ['die', 'Katze', 'saß', 'auf', 'der', 'Matte'];
    const xs = (n) => Array.from({ length: n }, (_, i) => 150 + i * 190);
    const chips = top.map((t, i) => C.chip({ cx: xs(6)[i], cy: 96, text: t, role: 'src' })).join('') +
      bot.map((t, i) => C.chip({ cx: xs(6)[i], cy: 984, text: t, role: 'tgt' })).join('');
    let lines = '';
    xs(6).forEach((x1, i) => xs(6).forEach((x2, j) => {
      lines += `<path class="attn" data-i="${i}" data-j="${j}" d="${C.curve(x1, 124, x2, 956)}" style="${C.attnStyle(0)}"/>`;
    }));
    return `
      <svg class="abs motif" width="1920" height="1080" style="left:0;top:0" aria-hidden="true">
        <g class="motif-lines">${lines}</g><g class="motif-chips">${chips}</g>
      </svg>
      <div class="abs title-block" style="left:112px;top:310px;width:1180px">
        <h1 class="t-title">Attention Is All You Need</h1>
        <p class="t-sub">From Sequence-to-Sequence Models to the Transformer</p>
        <p class="t-ref">Vaswani et al., NeurIPS 2017</p>
        <p class="t-seminar">Statistics M.Sc Seminar</p>
        <p class="t-presenter">${DATA.deck.presenter} <span class="muted">·</span> <span class="muted">${DATA.deck.email}</span></p>
      </div>
      <div class="abs" style="right:150px;top:140px">${C.archMap({ mode: 'faded', height: 780 })}</div>`;
  },
  mount(el) {
    const paths = [...el.querySelectorAll('.motif-lines path')];
    const n = 6;
    // Each top token holds a softmax over bottom tokens whose logits drift slowly.
    const phase = paths.map((_, k) => (k * 2.399) % (2 * Math.PI));
    const speed = paths.map((_, k) => 0.12 + ((k * 37) % 11) / 60);
    const draw = (t) => {
      for (let i = 0; i < n; i++) {
        const logits = [];
        for (let j = 0; j < n; j++) logits.push(2.4 * Math.sin(phase[i * n + j] + t * speed[i * n + j]));
        const m = Math.max(...logits), e = logits.map((l) => Math.exp(l - m)), s = e.reduce((a, b) => a + b, 0);
        for (let j = 0; j < n; j++) C.setAttn(paths[i * n + j], e[j] / s);
      }
    };
    draw(4);
    if (Deck.reduced) return {};
    let raf, t0 = performance.now(), last = 0;
    const loop = (now) => {
      if (now - last > 50) { draw(4 + (now - t0) / 1000); last = now; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return { leave() { cancelAnimationFrame(raf); } };
  },
});
