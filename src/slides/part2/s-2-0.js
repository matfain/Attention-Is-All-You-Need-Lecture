/* Slide 2.0: The Transformer at a glance. The full map, large and centred.
 * Build steps tour the components in order (highlight + callout); final: all lit. */
(function () {
  const MAP_H = 790, MAP_TOP = 172;
  const k = MAP_H / C.archMapVB.h, MAP_W = C.archMapVB.w * k, MAP_LEFT = (1920 - MAP_W) / 2;
  const X = (vx) => MAP_LEFT + vx * k, Y = (vy) => MAP_TOP + vy * k;

  // side: callout left or right of the map; at: block the leader points to; dy: label offset
  const TOUR = [
    { ids: ['enc-mha'], label: 'Self-attention', side: 'l', at: 'enc-mha', dy: -26 },
    { ids: ['enc-mha'], label: `Multi-head (${tex`\times h`})`, side: 'l', at: 'enc-mha', dy: 30, badge: ['enc-mha', '×h'] },
    { ids: ['enc-addnorm1', 'enc-ffn', 'enc-addnorm2'], label: 'Layer block', side: 'l', at: 'enc-ffn', dy: 0 },
    { ids: ['dec-cross-mha', 'enc-to-dec'], label: 'Cross-attention', side: 'r', at: 'dec-cross-mha', dy: 0 },
    { ids: ['in-pe', 'out-pe'], label: 'Positional encoding', side: 'l', at: 'in-pe', dy: 0 },
  ];

  const callout = (s, i) => {
    const b = C.archMapBox(s.at);
    const by = Y(b.y + (s.side === 'r' ? 14 : b.h / 2));
    const ly = by + s.dy;
    const bx = s.side === 'l' ? X(b.x) - 6 : X(b.x + b.w) + 6;
    const lx = s.side === 'l' ? MAP_LEFT - 30 : MAP_LEFT + MAP_W + 40;
    const line = `<path class="tour-leader" data-i="${i}" d="M${s.side === 'l' ? lx + 12 : lx - 12},${ly} L${s.side === 'l' ? bx - 30 : bx + 30},${ly} L${bx},${by}"/>`;
    const html = `<div class="abs tour-label" data-i="${i}" style="left:${lx}px;top:${ly}px;transform:translate(${s.side === 'l' ? '-100%' : '0'},-50%)">` +
      `<span class="tour-num">${i + 1}</span><span>${s.label}</span></div>`;
    return { line, html };
  };

  Deck.slide({
    id: 's-2-0',
    part: 2,
    title: 'The Transformer at a Glance',
    builds: TOUR.length + 1,
    render() {
      const cs = TOUR.map(callout);
      return `
        <div class="abs" style="left:${MAP_LEFT}px;top:${MAP_TOP}px">${C.archMap({ mode: 'full', height: MAP_H, cls: 'tour-map' })}</div>
        <svg class="abs tour-lines" width="1920" height="1080" style="left:0;top:0;pointer-events:none">${cs.map((c) => c.line).join('')}</svg>
        ${cs.map((c) => c.html).join('')}`;
    },
    mount(el) {
      const map = C.archMapApi(el.querySelector('svg.tour-map'));
      return {
        // Leaving forward: the big map shrinks into the next slide's thumbnail.
        leave({ to, dir, instant }) {
          if (instant || dir < 0 || !to.thumb) return;
          const src = el.querySelector('svg.tour-map');
          requestAnimationFrame(() => {
            const dst = to.el.querySelector('.map-thumb svg');
            if (dst) Deck.flip(src, dst, 800);
          });
        },
        update(b) {
          const step = TOUR[b - 1];
          map.clearBadges();
          map.highlight(step ? step.ids : []);
          if (b >= 2) map.showBadge(...TOUR[1].badge);
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
