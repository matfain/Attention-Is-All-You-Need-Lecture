/* Slide 2.9: the full flow. The same large map as 2.0; each build lights the next stage
 * (the rest dims) and adds its label with the paper's shapes. Earlier labels stay, in grey. */
(function () {
  const F = DATA.part2.fullFlow;
  const MAP_H = 790, MAP_TOP = 172;
  const k = MAP_H / C.archMapVB.h, MAP_W = C.archMapVB.w * k, MAP_LEFT = (1920 - MAP_W) / 2;
  const X = (vx) => MAP_LEFT + vx * k, Y = (vy) => MAP_TOP + vy * k;
  const chips = (toks) => `<span class="ff-chips">${toks.map((t) => C.chipHTML(t, F.src.includes(t) ? 'src' : 'tgt', 'sm')).join('')}</span>`;
  const shape = (s) => C.badge(s);

  // side: label left or right of the map; at: [vx, vy] point the leader ends on; ly: label y (canvas px)
  const STEPS = [
    { ids: ['inputs', 'in-embed', 'in-pe'], side: 'l', at: [125, 870], ly: 868,
      html: `${chips(F.src)}<span>embedding + position</span>${shape(tex`n \times 512`)}` },
    { ids: ['enc-stack'], side: 'l', at: [38, 575], ly: 622,
      html: `<span>${tex`N = 6`} encoder layers</span><span>encoder output ${shape(tex`n \times 512`)}</span>` },
    { ids: ['enc-to-dec', 'dec-cross-mha'], side: 'l', at: [305, 350], ly: 372, drop: true, pulse: true,
      html: '<span>into <b>every</b> decoder layer</span>' },
    { ids: ['outputs-shifted', 'out-embed', 'out-pe'], side: 'r', at: [635, 870], ly: 868,
      html: `${chips(F.tgt)}<span>shifted right ${shape(tex`m \times 512`)}</span>` },
    { ids: ['dec-stack'], side: 'r', at: [665, 300], ly: 452,
      html: `<span>${tex`N = 6`} decoder layers</span><span class="ff-sub">masked self-attn → cross-attn → FFN</span>${shape(tex`m \times 512`)}` },
    { ids: ['linear', 'softmax', 'out-probs'], side: 'r', at: [635, 105], ly: 236,
      html: `<span>one next-word distribution</span><span>per position ${shape(tex`m \times 37\text{K}`)}</span>` },
  ];

  const callout = (s, i) => {
    const bx = X(s.at[0]) + (s.side === 'l' ? -6 : 6), by = Y(s.at[1]);
    const lx = s.side === 'l' ? MAP_LEFT - 40 : MAP_LEFT + MAP_W + 40;
    const kx = s.side === 'l' ? bx - 30 : bx + 30;
    const x0 = s.side === 'l' ? lx + 12 : lx - 12;
    // drop: the leader meets a horizontal wire from above instead of running along it
    const d = s.drop ? `M${x0},${s.ly} H${X(s.at[0])} V${by - 8}` : `M${x0},${s.ly} L${kx},${s.ly} L${kx},${by} L${bx},${by}`;
    const line = `<path class="tour-leader" data-i="${i}" d="${d}"/>`;
    const html = `<div class="abs tour-label ff-label ${s.side}" data-i="${i}" style="left:${lx}px;top:${s.ly}px;transform:translate(${s.side === 'l' ? '-100%' : '0'},-50%)">` +
      (s.side === 'r' ? `<span class="tour-num">${i + 1}</span>` : '') +
      `<span class="ff-body">${C.sym(s.html)}</span>` +
      (s.side === 'l' ? `<span class="tour-num">${i + 1}</span>` : '') + `</div>`;
    return { line, html };
  };

  Deck.slide({
    id: 's-2-9',
    part: 2,
    title: 'From Source Sentence to Next-Word Probabilities',
    builds: STEPS.length,
    render() {
      const cs = STEPS.map(callout);
      return `
        <div class="abs" style="left:${MAP_LEFT}px;top:${MAP_TOP}px">${C.archMap({ mode: 'full', height: MAP_H, cls: 'flow-map' })}</div>
        <svg class="abs tour-lines" width="1920" height="1080" style="left:0;top:0;pointer-events:none">${cs.map((c) => c.line).join('')}</svg>
        ${cs.map((c) => c.html).join('')}`;
    },
    mount(el) {
      const map = C.archMapApi(el.querySelector('svg.flow-map'));
      return {
        update(b) {
          const step = STEPS[b - 1];
          map.highlight(step ? step.ids : []);
          if (step && step.pulse) map.pulse('enc-to-dec');
          el.querySelectorAll('.tour-label, .tour-leader').forEach((n) => {
            const i = +n.dataset.i;
            n.classList.toggle('build-off', i >= b);
            n.classList.toggle('current', i === b - 1);
          });
        },
      };
    },
  });
})();
