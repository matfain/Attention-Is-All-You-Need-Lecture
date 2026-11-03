/* VectorBar (values in [0,1], role): a strip of cells whose shade encodes the value.
 * Shading only: no numbers (used for illustrative state vectors). */
(function (C) {
  const ROLE = { src: '--src', tgt: '--tgt', q: '--q', k: '--k', v: '--v', ink: '--ink' };
  C.vbar = ({ x, y, values, role = 'src', cell = 28, orient = 'h', cls = '', attrs = '' }) => {
    const n = values.length;
    const W = orient === 'h' ? n * cell : cell, H = orient === 'h' ? cell : n * cell;
    const cells = values.map((v, i) => {
      const cx = orient === 'h' ? i * cell : 0, cy = orient === 'h' ? 0 : i * cell;
      return `<rect class="vcell" x="${cx}" y="${cy}" width="${cell}" height="${cell}" style="fill:var(${ROLE[role]});fill-opacity:${(0.1 + 0.9 * v).toFixed(3)}"/>`;
    }).join('');
    return `<g class="vbar ${cls}" transform="translate(${x},${y})" ${attrs}>${cells}<rect class="vframe ${role}" x="0" y="0" width="${W}" height="${H}"/></g>`;
  };
  C.setVbar = (g, values) => g.querySelectorAll('.vcell').forEach((r, i) => (r.style.fillOpacity = (0.1 + 0.9 * values[i]).toFixed(3)));
})(window.C);
