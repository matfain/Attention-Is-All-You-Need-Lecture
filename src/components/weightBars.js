/* WeightBars (labels, weights): vertical bars for a softmax output.
 * Value above each bar (rounded so the shown values sum to 1.00); top bar in ink, rest graphite.
 * (x, y) = left end of the baseline. */
(function (C) {
  C.weightBars = ({ x, y, labels, weights, h = 200, bw = 64, gap = 30, labelFs = 24, cls = '', round = true }) => {
    const shown = round ? C.roundDist(weights) : weights;
    const top = weights.indexOf(Math.max(...weights));
    const bars = weights.map((w, i) => {
      const bx = i * (bw + gap), bh = Math.max(2, w * h), isTop = i === top;
      return `<rect class="wbar ${isTop ? 'top' : 'rest'}" data-i="${i}" x="${bx}" y="${-bh}" width="${bw}" height="${bh}" rx="3"/>` +
        `<text class="wval ${isTop ? 'top' : ''}" data-i="${i}" x="${bx + bw / 2}" y="${-bh - 14}">${shown[i].toFixed(2)}</text>` +
        `<text class="wlab" x="${bx + bw / 2}" y="${labelFs + 12}" style="font-size:${labelFs}px">${C.esc(labels[i])}</text>`;
    }).join('');
    const totalW = weights.length * (bw + gap) - gap;
    return `<g class="wbars ${cls}" transform="translate(${x},${y})" data-h="${h}">${bars}<line x1="-8" x2="${totalW + 8}" y1="0" y2="0" stroke="var(--graphite)" stroke-width="1.5"/></g>`;
  };

  // Update in place (smooth transitions).
  C.setWeightBars = (g, weights) => {
    const h = +g.dataset.h, shown = C.roundDist(weights);
    const top = weights.indexOf(Math.max(...weights));
    g.querySelectorAll('rect.wbar').forEach((r) => {
      const i = +r.dataset.i, bh = Math.max(2, weights[i] * h);
      r.setAttribute('y', -bh); r.setAttribute('height', bh);
      r.classList.toggle('top', i === top); r.classList.toggle('rest', i !== top);
    });
    g.querySelectorAll('text.wval').forEach((t) => {
      const i = +t.dataset.i, bh = Math.max(2, weights[i] * h);
      t.setAttribute('y', -bh - 14); t.textContent = shown[i].toFixed(2);
      t.classList.toggle('top', i === top);
    });
  };
})(window.C);
