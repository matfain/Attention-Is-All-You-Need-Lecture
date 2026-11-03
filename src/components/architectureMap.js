/* ArchitectureMap: the paper's Figure 1, recreated as SVG in our colour language
 * ("adapted from Vaswani et al., 2017"). Every block has a stable data-id
 * (listed in docs/framework.md, Architecture map). Wires carry the id of the
 * block they belong to, so highlighting a block lights its wiring too.
 *
 * C.archMap({mode: 'full'|'thumb'|'faded', width, cls}) -> svg string
 * C.archMapApi(svgEl) -> { highlight(ids), dim(ids), clear(), pulse(edgeId), showBadge(id, text), clearBadges() }
 */
(function (C) {
  const VB = { w: 780, h: 1010 };
  const EX = 230, DX = 530, BW = 210, LH = 28;

  // id, style class, centre x, top y, height, text lines
  const BLOCKS = [
    ['in-embed', 'emb-src', EX, 835, 70, ['Input', 'Embedding']],
    ['enc-mha', 'attn', EX, 640, 70, ['Multi-Head', 'Attention']],
    ['enc-addnorm1', 'norm', EX, 575, 40, ['Add & Norm']],
    ['enc-ffn', 'ffn', EX, 470, 65, ['Feed', 'Forward']],
    ['enc-addnorm2', 'norm', EX, 405, 40, ['Add & Norm']],
    ['out-embed', 'emb-tgt', DX, 835, 70, ['Output', 'Embedding']],
    ['dec-masked-mha', 'attn', DX, 615, 95, ['Masked', 'Multi-Head', 'Attention']],
    ['dec-addnorm1', 'norm', DX, 555, 40, ['Add & Norm']],
    ['dec-cross-mha', 'attn', DX, 445, 70, ['Multi-Head', 'Attention']],
    ['dec-addnorm2', 'norm', DX, 380, 40, ['Add & Norm']],
    ['dec-ffn', 'ffn', DX, 295, 65, ['Feed', 'Forward']],
    ['dec-addnorm3', 'norm', DX, 235, 40, ['Add & Norm']],
    ['linear', 'head', DX, 145, 40, ['Linear']],
    ['softmax', 'head', DX, 85, 40, ['Softmax']],
  ];

  // Wires: [id, path, arrow?]
  const fork = (cx, yFrom, yTo) => [-60, 0, 60].map((d) => `M${cx},${yFrom} H${cx + d} V${yTo}`);
  const WIRES = [
    ['inputs', `M${EX},950 V905`, 1],
    ['in-embed', `M${EX},835 V816`, 1],
    ['in-pe', `M${EX},786 V740`, 0],
    ...fork(EX, 740, 710).map((p) => ['enc-mha', p, 1]),
    ['enc-addnorm1', `M${EX},756 H${EX - 120} V595 H${EX - 105}`, 1],
    ['enc-mha', `M${EX},640 V615`, 1],
    ['enc-addnorm1', `M${EX},575 V535`, 1],
    ['enc-addnorm2', `M${EX},555 H${EX - 120} V425 H${EX - 105}`, 1],
    ['enc-ffn', `M${EX},470 V445`, 1],
    ['enc-to-dec', `M${EX},405 V350 H380 V530 H${DX} V515`, 1],
    ['enc-to-dec', `M${DX - 60},530 V515`, 1],
    ['outputs-shifted', `M${DX},945 V905`, 1],
    ['out-embed', `M${DX},835 V816`, 1],
    ['out-pe', `M${DX},786 V740`, 0],
    ...fork(DX, 740, 710).map((p) => ['dec-masked-mha', p, 1]),
    ['dec-addnorm1', `M${DX},756 H${DX + 120} V575 H${DX + 105}`, 1],
    ['dec-masked-mha', `M${DX},615 V595`, 1],
    ['dec-addnorm1', `M${DX + 60},555 V515`, 1],
    ['dec-addnorm2', `M${DX + 60},535 H${DX + 120} V400 H${DX + 105}`, 1],
    ['dec-cross-mha', `M${DX},445 V420`, 1],
    ['dec-addnorm2', `M${DX},380 V360`, 1],
    ['dec-addnorm3', `M${DX},370 H${DX + 120} V255 H${DX + 105}`, 1],
    ['dec-ffn', `M${DX},295 V275`, 1],
    ['dec-addnorm3', `M${DX},235 V185`, 1],
    ['linear', `M${DX},145 V125`, 1],
    ['softmax', `M${DX},85 V58`, 1],
  ];

  const GROUPS = {
    'enc-stack': ['enc-stack', 'enc-mha', 'enc-addnorm1', 'enc-ffn', 'enc-addnorm2'],
    'dec-stack': ['dec-stack', 'dec-masked-mha', 'dec-addnorm1', 'dec-cross-mha', 'dec-addnorm2', 'dec-ffn', 'dec-addnorm3'],
  };

  const block = ([id, cls, cx, y, h, lines]) => {
    const t = lines.map((l, i) => `<text x="${cx}" y="${y + h / 2 + (i - (lines.length - 1) / 2) * LH + 1}">${C.esc(l)}</text>`).join('');
    return `<g class="blk ${cls}" data-id="${id}"><rect x="${cx - BW / 2}" y="${y}" width="${BW}" height="${h}" rx="9"/>${t}</g>`;
  };

  const pe = (id, cx, side) => {
    const gx = cx + side * 75, cy = 800;
    const wave = `M${gx - 14},${cy} C${gx - 9},${cy - 15} ${gx - 4},${cy - 15} ${gx},${cy} S${gx + 9},${cy + 15} ${gx + 14},${cy}`;
    const lx = cx + side * 110, anchor = side < 0 ? 'end' : 'start';
    return `<g data-id="${id}">
      <line class="w" x1="${gx - side * 22}" y1="${cy}" x2="${cx + side * 14}" y2="${cy}"/>
      <circle class="pe-glyph" cx="${gx}" cy="${cy}" r="22"/><path class="pe-wave" d="${wave}"/>
      <circle class="pe-glyph" cx="${cx}" cy="${cy}" r="14"/>
      <path class="pe-wave" d="M${cx - 9},${cy} H${cx + 9} M${cx},${cy - 9} V${cy + 9}"/>
      <text class="side" x="${lx}" y="${cy - 14}" style="text-anchor:${anchor}">Positional</text>
      <text class="side" x="${lx}" y="${cy + 14}" style="text-anchor:${anchor}">Encoding</text>
    </g>`;
  };

  C.archMap = ({ mode = 'full', width = null, height = null, cls = '' } = {}) => {
    const size = (width ? `width="${width}"` : '') + (height ? ` height="${height}"` : '');
    const wires = WIRES.map(([id, d, arrow]) => `<path class="w" data-id="${id}" d="${d}" ${arrow ? 'marker-end="url(#arr-map)"' : ''}/>`).join('');
    return `<svg class="amap ${mode}${cls ? ' ' + cls : ''}" viewBox="0 0 ${VB.w} ${VB.h}" ${size} role="img" aria-label="Transformer architecture, adapted from Vaswani et al., 2017">
      <rect class="frame enc" data-id="enc-stack" x="${EX - 135}" y="385" width="270" height="380" rx="18"/>
      <rect class="frame dec" data-id="dec-stack" x="${DX - 135}" y="218" width="270" height="547" rx="18"/>
      <text class="nx" data-id="enc-stack" x="${EX - 150}" y="575" style="text-anchor:end">N×</text>
      <text class="nx" data-id="dec-stack" x="${DX + 150}" y="490" style="text-anchor:start">N×</text>
      ${wires}
      ${BLOCKS.map(block).join('')}
      ${pe('in-pe', EX, -1)}${pe('out-pe', DX, 1)}
      <g data-id="inputs"><text x="${EX}" y="975">Inputs</text></g>
      <g data-id="outputs-shifted"><text x="${DX}" y="966">Outputs</text><text class="side" x="${DX}" y="994">(shifted right)</text></g>
      <g data-id="out-probs"><text x="${DX}" y="36">Output Probabilities</text></g>
      <g class="am-badges"></g>
    </svg>`;
  };

  C.archMapApi = (svg) => {
    const expand = (ids) => {
      const s = new Set();
      ids.forEach((id) => (GROUPS[id] || [id]).forEach((x) => s.add(x)));
      return s;
    };
    const api = {
      highlight(ids = []) {
        const s = expand(ids);
        svg.classList.toggle('focus', s.size > 0);
        svg.querySelectorAll('[data-id]').forEach((e) => e.classList.toggle('hl', s.has(e.dataset.id)));
      },
      clear() { api.highlight([]); },
      dim(ids = []) {
        const s = expand(ids);
        svg.querySelectorAll('[data-id]').forEach((e) => (e.style.opacity = s.has(e.dataset.id) ? '.22' : ''));
      },
      pulse(edgeId) {
        if (Deck.reduced) return;
        svg.querySelectorAll(`path.w[data-id="${edgeId}"]`).forEach((p) => {
          const q = p.cloneNode();
          q.removeAttribute('marker-end');
          q.setAttribute('class', 'pulse');
          svg.appendChild(q);
          const L = p.getTotalLength();
          q.style.strokeDasharray = `40 ${L + 40}`;
          q.animate([{ strokeDashoffset: 40, opacity: 1 }, { strokeDashoffset: -L, opacity: 1 }], { duration: 1100, easing: 'ease-in-out' })
            .onfinish = () => q.remove();
        });
      },
      showBadge(id, text) {
        const r = svg.querySelector(`.blk[data-id="${id}"] rect, rect.frame[data-id="${id}"]`);
        if (!r) return;
        const x = +r.getAttribute('x') + +r.getAttribute('width') + 14, y = +r.getAttribute('y') + +r.getAttribute('height') / 2;
        const w = text.length * 12 + 28;
        svg.querySelector('.am-badges').insertAdjacentHTML('beforeend',
          `<g class="am-badge"><rect x="${x}" y="${y - 20}" width="${w}" height="40" rx="20"/><text x="${x + w / 2}" y="${y + 1}">${C.esc(text)}</text></g>`);
      },
      clearBadges() { svg.querySelector('.am-badges').innerHTML = ''; },
    };
    return api;
  };

  // Geometry in map (viewBox) units, for callouts placed next to blocks.
  C.archMapVB = VB;
  C.archMapBox = (id) => {
    const b = BLOCKS.find((x) => x[0] === id);
    if (b) return { x: b[2] - BW / 2, y: b[3], w: BW, h: b[4] };
    if (id === 'in-pe') return { x: EX - 97, y: 778, w: 111, h: 44 };
    if (id === 'out-pe') return { x: DX - 14, y: 778, w: 111, h: 44 };
    if (id === 'enc-stack') return { x: EX - 135, y: 385, w: 270, h: 380 };
    if (id === 'dec-stack') return { x: DX - 135, y: 218, w: 270, h: 547 };
    return null;
  };

  // Thumbnail slot for Part 2 slides ("you are here").
  C.mapThumb = () => `<div class="map-thumb" aria-hidden="true">${C.archMap({ mode: 'thumb', width: 230 })}</div>`;
})(window.C);
