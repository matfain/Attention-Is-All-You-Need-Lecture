/* Slide 5.1: takeaways. A 2 × 2 grid of cards,
 * one per build, each with a small visual, a short headline and one sub-line:
 * attention alone → parallel + O(1) paths (both slide-8 bottlenecks solved) → better and
 * cheaper, and it transfers → caveats (the O(n²) price in red, thin evidence). */
(function () {
  // visuals, 160 × 110 viewBox
  const VIS = {
    attention: () => {
      const xs = [30, 80, 130];
      let s = xs.map((x) => `<path class="tk-arc" d="M80,84 C80,50 ${x},60 ${x},26"/>`).join('');
      s += xs.map((x) => `<rect x="${x - 20}" y="8" width="40" height="18" rx="5" class="tk-chip src"/>`).join('');
      s += xs.map((x) => `<rect x="${x - 20}" y="84" width="40" height="18" rx="5" class="tk-chip ${x === 80 ? 'tgt' : 'src'}"/>`).join('');
      return s;
    },
    parallel: () => `<g transform="translate(6,22) scale(1.6)">${C.icon('parallel', 40).replace(/<\/?svg[^>]*>/g, '')}</g>` +
      `<g transform="translate(86,22) scale(1.6)">${C.icon('hop', 40).replace(/<\/?svg[^>]*>/g, '')}</g>`,
    results: () => [0.45, 0.6, 0.66, 0.9].map((v, i) =>
      `<rect x="${14 + i * 36}" y="${100 - v * 90}" width="26" height="${v * 90}" rx="3" class="${i === 3 ? 'tk-bar win' : 'tk-bar'}"/>`).join('') +
      `<path d="M10,100 H150" stroke="var(--graphite)" stroke-width="2"/>`,
    caveat: () => {
      let s = '';
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) s += `<rect x="${42 + j * 16}" y="${12 + i * 16}" width="14" height="14" rx="2" class="tk-cell"/>`;
      return s + `<text class="tk-n2" x="80" y="106">${'n × n'}</text>`;
    },
  };

  const CARDS = [
    { vis: 'attention', h: 'Attention alone is enough', sub: 'no recurrence needed' },
    { vis: 'parallel', h: `<b>Parallel</b> training<br><b>${tex`O(1)`}</b> paths`, sub: 'both RNN bottlenecks solved' },
    { vis: 'results', h: '<b>Better and cheaper</b>,<br>and it transfers', sub: 'top BLEU at a fraction of the cost' },
    { vis: 'caveat', h: 'Caveats', sub: `<b class="problem-ink">quadratic cost</b> ${tex`O(n^2)`}<br>thin evidence in the ablations`, cls: 'warn' },
  ];

  Deck.slide({
    id: 's-5-1',
    part: 5,
    title: 'Takeaways',
    builds: CARDS.length - 1,
    render() {
      return `<div class="abs tk-grid" style="left:112px;right:112px;top:200px">
        ${CARDS.map((c, i) => `<div class="tk-card ${c.cls || ''}" ${i ? `data-build="${i}"` : ''}>
          <svg width="232" height="160" viewBox="0 0 160 110">${VIS[c.vis]()}</svg>
          <div class="tk-text"><div class="tk-h">${c.h}</div><div class="tk-sub">${c.sub}</div></div>
        </div>`).join('')}
      </div>`;
    },
  });
})();
