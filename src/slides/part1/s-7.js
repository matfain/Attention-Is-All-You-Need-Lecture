/* Slide 7: Two bottlenecks. Slide 6's diagram, static: attention kept (tick),
 * recurrent chains in red: encoder "still sequential · O(n) path", decoder
 * "sequential even in training". */
Deck.slide({
  id: 's-7',
  part: 1,
  title: 'One Bottleneck Solved, One Remains',
  cite: 'Bahdanau et al., 2015',
  render() {
    const g = Bahdanau.geo;
    const right = g.D[3] + g.DB.w / 2 + 28;
    const ov = Bahdanau.overlay({ query: false }) +
      C.ov(right, g.DB.y + g.DB.h / 2, '<span class="problem-ink"><b>sequential even in training</b></span>', 'l', 'label') +
      C.ov(g.E[2] + 46, g.EY + 2 * g.CELL, `<span class="problem-ink"><b>still sequential</b><br>${tex`O(n)`} path</span>`, 'l', 'label') +
      C.ov(g.CTX.x + g.CELL / 2, g.EY + 4 * g.CELL + 30, tex`c_t`, 'c', 'label muted') +
      C.ov(g.E[2] + 46, (g.decBottom + g.encTop) / 2, `${C.icon('tick', 44)} <span style="margin-left:6px">attention</span>`, 'l', 'label');
    return `
      <div class="abs" style="left:112px;top:280px;width:1100px;height:580px">
        <svg class="abs s7-svg" width="1100" height="580" style="left:0;top:0">${Bahdanau.svg({ problem: true, context: true })}${C.vbar({ x: g.CTX.x, y: g.EY, values: Bahdanau.context(DATA.part1.bahdanau.defaultRow), role: 'src', cell: g.CELL, orient: 'v', cls: 'ctx' })}</svg>${ov}
      </div>
      <ul class="anchors abs icon-list" style="left:1250px;top:470px;width:560px">
        <li class="plain">${C.icon('tick', 44)}<span>Information bottleneck<br>${tex`\to`} solved by attention (2015)</span></li>
        <li class="plain">${C.icon('cross', 44)}<span>Sequential computation, long paths<br>${tex`\to`} still there</span></li>
      </ul>
`;
  },
});
