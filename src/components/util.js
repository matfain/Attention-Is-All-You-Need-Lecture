/* Shared helpers + small components (Badge, icons, illustrative tag, overlays).
 * Components return HTML/SVG strings; slides compose them in render().
 * tex`...` / texd`...` are replaced at build time by pre-rendered KaTeX HTML. */
window.C = window.C || {};
(function (C) {
  C.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Number for display: true minus sign, fixed decimals.
  C.fmt = (v, dp = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(dp);

  // Largest-remainder rounding: displayed distributions always sum to exactly 1.00.
  C.roundDist = (values, dp = 2) => {
    const k = Math.pow(10, dp);
    const target = Math.round(values.reduce((a, b) => a + b, 0) * k);
    const floors = values.map((v) => Math.floor(v * k + 1e-9));
    let rest = target - floors.reduce((a, b) => a + b, 0);
    const order = values.map((v, i) => [v * k - floors[i], i]).sort((a, b) => b[0] - a[0]);
    for (let j = 0; rest > 0; j++, rest--) floors[order[j % order.length][1]]++;
    return floors.map((f) => f / k);
  };

  // Attention heatmap ramp (paper → deep indigo), w in [0, 1].
  const STOPS = ['#F4F5F7', '#C9D2EA', '#8E9FD3', '#4F64AE', '#22305E'].map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  C.ramp = (w) => {
    w = Math.max(0, Math.min(1, w)) * (STOPS.length - 1);
    const i = Math.min(STOPS.length - 2, Math.floor(w)), t = w - i;
    const c = STOPS[i].map((a, j) => Math.round(a + (STOPS[i + 1][j] - a) * t));
    return `rgb(${c.join(',')})`;
  };

  // Neutral ramp (paper → ink) for non-attention values, e.g. positional encodings.
  const INK = [[0xF4, 0xF5, 0xF7], [0x1A, 0x22, 0x32]];
  C.rampInk = (w) => {
    w = Math.max(0, Math.min(1, w));
    return `rgb(${INK[0].map((a, j) => Math.round(a + (INK[1][j] - a) * w)).join(',')})`;
  };

  // Shared SVG defs (markers, hatch), inserted once into the stage.
  C.globalDefs = () => {
    const arrow = (id, color, size = 14) =>
      `<marker id="${id}" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="${size}" markerHeight="${size}" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,0.8 L9.4,5 L0,9.2 L2.2,5 Z" fill="${color}"/></marker>`;
    return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      ${arrow('arr-ink', 'var(--ink)', 18)}
      ${arrow('arr-graphite', 'var(--graphite)', 16)}
      ${arrow('arr-problem', 'var(--problem)', 22)}
      ${arrow('arr-src', 'var(--src)', 18)}
      ${arrow('arr-tgt', 'var(--tgt)', 18)}
      ${arrow('arr-map', 'var(--ink)', 15)}
      <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="var(--paper-deep)"/><line x1="0" y1="0" x2="0" y2="10" stroke="var(--rule)" stroke-width="4"/></pattern>
    </defs></svg>`;
  };

  // Icons (SVG). Tick = ink on a light badge (no green: green belongs to V).
  C.icon = (name, size = 40) => {
    const s = `class="icon" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"`;
    switch (name) {
      case 'tick':
        return `<svg ${s}><circle cx="20" cy="20" r="18.5" fill="var(--paper-deep)" stroke="var(--rule)" stroke-width="1.5"/><path d="M11.5 20.5 L17.5 26.5 L29 13.5" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case 'cross':
        return `<svg ${s}><circle cx="20" cy="20" r="18.5" fill="var(--problem-tint)" stroke="var(--problem)" stroke-width="1.5"/><path d="M13 13 L27 27 M27 13 L13 27" fill="none" stroke="var(--problem)" stroke-width="4" stroke-linecap="round"/></svg>`;
      case 'parallel':
        return `<svg ${s}><g fill="none" stroke="var(--ink)" stroke-width="3.2" stroke-linecap="round"><path d="M10 31 V11 M20 31 V11 M30 31 V11"/><path d="M6 15 L10 9 L14 15 M16 15 L20 9 L24 15 M26 15 L30 9 L34 15" stroke-linejoin="round"/></g></svg>`;
      case 'hop':
        return `<svg ${s}><rect x="2" y="25" width="11" height="9" rx="2.5" fill="var(--src-tint)" stroke="var(--src)" stroke-width="2"/><rect x="27" y="25" width="11" height="9" rx="2.5" fill="var(--src-tint)" stroke="var(--src)" stroke-width="2"/><path d="M7.5 24 C 9 6, 31 6, 32.5 22" fill="none" stroke="var(--ink)" stroke-width="3.2" stroke-linecap="round"/></svg>`;
      // reading-ablations icons (slide 4.4), ink line style
      case 'dice':
        return `<svg ${s}><rect x="7" y="7" width="26" height="26" rx="5" fill="none" stroke="var(--ink)" stroke-width="3"/><circle cx="14" cy="14" r="2.6" fill="var(--ink)"/><circle cx="20" cy="20" r="2.6" fill="var(--ink)"/><circle cx="26" cy="26" r="2.6" fill="var(--ink)"/></svg>`;
      case 'knob':
        return `<svg ${s}><g stroke="var(--ink)" stroke-width="3" stroke-linecap="round"><path d="M8 12 H32 M8 20 H32 M8 28 H32" stroke="var(--rule)"/><path d="M8 20 H32"/></g><circle cx="24" cy="20" r="5" fill="var(--panel)" stroke="var(--ink)" stroke-width="3"/></svg>`;
      case 'gauge':
        return `<svg ${s}><path d="M6 30 A14 14 0 0 1 34 30" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><path d="M20 30 L28 17" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="30" r="3" fill="var(--ink)"/></svg>`;
      case 'diverge':
        return `<svg ${s}><g fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20 H16 L31 9 M16 20 L31 31"/><path d="M25 8 H31 V14 M25 32 H31 V26"/></g></svg>`;
      case 'question':
        return `<svg ${s}><circle cx="20" cy="20" r="15" fill="none" stroke="var(--ink)" stroke-width="3"/><path d="M15 15.5 C15 9.5, 25 9.5, 25 15.5 C25 19.5, 20 19.5, 20 24" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="29.5" r="2.2" fill="var(--ink)"/></svg>`;
      case 'fullscreen':
        return `<svg ${s} width="26" height="26"><path d="M6 15 V6 H15 M25 6 H34 V15 M34 25 V34 H25 M15 34 H6 V25" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    return '';
  };

  // Math symbols in running text: Atkinson's Latin subsets lack →, ≈, ≤, so use KaTeX glyphs.
  const SYM = { '→': tex`\to`, '≈': tex`\approx`, '≤': tex`\leq` };
  C.sym = (html) => html.replace(/[→≈≤]/g, (c) => SYM[c]);

  C.badge = (html, cls = '') => `<span class="badge ${cls}">${html}</span>`;

  // "illustrative" tag, bottom-right of a visual (position via style).
  C.illus = (style = 'right:0;bottom:0') => `<div class="illus abs" style="${style}">illustrative</div>`;

  // Absolutely positioned HTML (e.g. KaTeX) over an SVG that uses canvas px.
  // anchor: c (centre), l (left-middle), r (right-middle), t (top-centre), b (bottom-centre)
  C.ov = (x, y, html, anchor = 'c', cls = '', style = '') => {
    const tf = { c: '-50%,-50%', l: '0,-50%', r: '-100%,-50%', t: '-50%,0', b: '-50%,-100%' }[anchor];
    return `<div class="abs ${cls}" style="left:${x}px;top:${y}px;transform:translate(${tf});white-space:nowrap;${style}">${html}</div>`;
  };
})(window.C);
