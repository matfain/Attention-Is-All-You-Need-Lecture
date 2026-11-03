/* TokenChip (text, role: src|tgt|neutral, state: normal|dim|highlight). Mono label. */
(function (C) {
  const ADV = 0.6; // JetBrains Mono advance width (em)
  C.chipW = (text, fs = 27, pad = 16) => Math.round([...String(text)].length * ADV * fs + 2 * pad + 4);

  // SVG chip centred at (cx, cy).
  C.chip = ({ cx, cy, text, role = 'src', state = '', h = 52, fs = 27, w, cls = '', attrs = '' }) => {
    w = w || C.chipW(text, fs);
    return `<g class="schip ${role} ${state} ${cls}" transform="translate(${cx - w / 2},${cy - h / 2})" ${attrs}>` +
      `<rect width="${w}" height="${h}" rx="10"/><text x="${w / 2}" y="${h / 2 + 1}" style="font-size:${fs}px">${C.esc(text)}</text></g>`;
  };

  // HTML chip (for flowing layouts).
  C.chipHTML = (text, role = 'src', extra = '') => `<span class="chip ${role} ${extra}">${C.esc(text)}</span>`;
})(window.C);
