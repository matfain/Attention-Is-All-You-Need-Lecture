/* Slide 5.2: outlook. One horizontal time axis with only the years that have a model,
 * equally spaced; each model is a card (coloured domain icon,
 * model name, domain) on a stem to its year, above / below the axis so same-year models
 * don't collide (vertical position carries no meaning). Cards appear left to right with the
 * builds, one year per build. No side box, no talk-2 hook. Generative diffusion transformers
 * (DiT, Stable Diffusion 3, Sora) and LLM assistants (Claude, Gemini) added in the final round. */
(function () {
  const T = DATA.part5.timeline;
  const YEARS = [...new Set(T.nodes.map((n) => n.year))];
  const GAP = 285, AY = 625, X0 = 960 - (GAP * (YEARS.length - 1)) / 2; // centred on the slide
  const xs = (y) => X0 + YEARS.indexOf(y) * GAP;
  // card centre y per node (layout only): above (two tiers, the upper one's stem runs
  // behind the lower card) / below the axis
  const UP = 490, UP2 = 318, DOWN = 778;
  const SLOT = {
    Transformer: UP, GPT: DOWN, BERT: UP, ViT: DOWN, Whisper: UP, TabPFN: DOWN, DiT: UP2,
    Claude: UP, Gemini: DOWN, Chronos: UP, 'Stable Diffusion 3': DOWN, Sora: UP2,
  };

  // a deterministic 6 × 6 noise patch (40 × 40) and an arrow, for the diffusion icons
  const NOISE = Array.from({ length: 36 }, (_, i) => {
    const v = (Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1;
    return `<rect x="${2 + (i % 6) * 6.6}" y="${4 + Math.floor(i / 6) * 6.6}" width="6.6" height="6.6" fill="${C.rampInk(0.15 + 0.6 * Math.abs(v))}"/>`;
  }).join('') + '<rect x="2" y="4" width="40" height="40" rx="3" fill="none" stroke="var(--graphite)" stroke-width="1.5"/>';
  const GEN_ARROW = '<path d="M45 24 H53" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/><path d="M50 20 L54 24 L50 28" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
  const WIDE = { 'image generation': 1, 'video generation': 1 }; // 100 × 48 icons
  // official logos (assets/logos/*.svg, inlined by the build) replace the drawn icon when present
  const LOGO = { GPT: 'openai', Claude: 'claude', Gemini: 'gemini' };
  const iconFor = (n) => {
    const src = LOGO[n.model] && DATA.logos[LOGO[n.model]];
    if (src) return `<img class="tl-logo" src="${src}" alt="">`;
    const w = WIDE[n.domain] ? 100 : 64;
    return `<svg width="${w}" height="48" viewBox="0 0 ${w} 48">${ICON[n.domain]}</svg>`;
  };

  // domain icons, 64 × 48 viewBox (100 × 48 for the diffusion ones)
  const ICON = {
    translation: `<rect x="4" y="6" width="30" height="22" rx="6" fill="var(--src-tint)" stroke="var(--src)" stroke-width="2.5"/><path d="M12 28 L10 35 L18 28" fill="var(--src-tint)" stroke="var(--src)" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="28" y="18" width="32" height="22" rx="6" fill="var(--tgt-tint)" stroke="var(--tgt)" stroke-width="2.5"/><path d="M50 40 L54 46 L44 40" fill="var(--tgt-tint)" stroke="var(--tgt)" stroke-width="2.5" stroke-linejoin="round"/>`,
    'language generation': `<path d="M6 10 H54 M6 22 H50 M6 34 H30" stroke="var(--tgt)" stroke-width="3.5" stroke-linecap="round"/><rect x="34" y="28" width="5" height="13" fill="var(--tgt-ink)"/>`,
    'language understanding': `<path d="M6 10 H54 M6 22 H34 M6 34 H26" stroke="var(--src)" stroke-width="3.5" stroke-linecap="round"/><circle cx="44" cy="30" r="9" fill="var(--src-tint)" stroke="var(--src-ink)" stroke-width="3"/><path d="M51 37 L58 44" stroke="var(--src-ink)" stroke-width="3.5" stroke-linecap="round"/>`,
    vision: [0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${12 + c * 14}" y="${3 + r * 14}" width="12" height="12" rx="2" fill="${C.ramp([0.25, 0.6, 0.4, 0.8, 0.3, 0.65, 0.45, 0.2, 0.7][r * 3 + c])}"/>`).join('')).join(''),
    'speech / audio': [6, 14, 26, 18, 34, 22, 12, 28, 16, 8].map((h, i) => `<path d="M${7 + i * 5.5} ${24 - h / 2} V${24 + h / 2}" stroke="var(--k)" stroke-width="3.2" stroke-linecap="round"/>`).join(''),
    'tabular data': `<rect x="8" y="5" width="48" height="38" rx="3" fill="var(--panel)" stroke="var(--v)" stroke-width="2.5"/><rect x="8" y="5" width="48" height="10" rx="3" fill="var(--v-tint)" stroke="var(--v)" stroke-width="2.5"/><path d="M8 24.5 H56 M8 34 H56 M24 5 V43 M40 5 V43" stroke="var(--graphite)" stroke-width="1.6"/>`,
    // diffusion: a noise patch → arrow → the generated picture (frame) or video (film strip)
    'image generation': `${NOISE}${GEN_ARROW}<rect x="58" y="4" width="40" height="40" rx="4" fill="#DCE6FB" stroke="var(--ink)" stroke-width="2"/><circle cx="88" cy="14" r="5" fill="var(--tgt)"/><path d="M59 43 L72 24 L81 34 L87 28 L97 43 Z" fill="var(--ramp-2)" stroke="var(--ramp-3)" stroke-width="1.5" stroke-linejoin="round"/>`,
    'video generation': `${NOISE}${GEN_ARROW}<rect x="56" y="6" width="44" height="36" rx="4" fill="var(--q-tint)" stroke="var(--q)" stroke-width="2"/><path d="M56 12 H100 M56 36 H100" stroke="var(--q)" stroke-width="1.6"/>${[60, 68, 76, 84, 92].map((x) => `<rect x="${x}" y="7.5" width="4" height="3" fill="var(--q)"/><rect x="${x}" y="37.5" width="4" height="3" fill="var(--q)"/>`).join('')}<path d="M73 17 L84 24 L73 31 Z" fill="var(--q)"/>`,
    'chat assistant': `<rect x="6" y="6" width="52" height="30" rx="10" fill="var(--hl-tint)" stroke="var(--key)" stroke-width="2.5"/><path d="M18 36 L14 45 L28 36" fill="var(--hl-tint)" stroke="var(--key)" stroke-width="2.5" stroke-linejoin="round"/><circle cx="22" cy="21" r="3" fill="var(--key)"/><circle cx="32" cy="21" r="3" fill="var(--key)"/><circle cx="42" cy="21" r="3" fill="var(--key)"/>`,
    'time-series forecasting': `<path d="M6 40 H58" stroke="var(--graphite)" stroke-width="2"/><path d="M6 32 L16 22 L24 28 L33 14 L40 20" fill="none" stroke="var(--q)" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><path d="M40 20 L48 12 L58 16" fill="none" stroke="var(--q)" stroke-width="3.2" stroke-dasharray="4 4" stroke-linecap="round"/>`,
  };

  Deck.slide({
    id: 's-5-2',
    part: 5,
    title: 'One Architecture for Everything',
    builds: YEARS.length - 1, // one build per year
    render() {
      const XN = xs(YEARS[YEARS.length - 1]);
      let g = `<line class="tl-axis" x1="${X0 - 120}" x2="${XN + 120}" y1="${AY}" y2="${AY}"/>`, ov = '';
      YEARS.forEach((y) => { ov += C.ov(xs(y), AY + 32, `<span class="num">${y}</span>`, 'c', 'tl-year'); });
      T.nodes.forEach((n, i) => {
        const x = xs(n.year), cy = SLOT[n.model], above = cy < AY;
        const yi = YEARS.indexOf(n.year);
        g += `<g class="tl-stem" data-y="${yi}"><line x1="${x}" x2="${x}" y1="${above ? cy + 50 : AY + 52}" y2="${above ? AY - 10 : cy - 50}"/><circle cx="${x}" cy="${AY}" r="8"/></g>`;
        ov += `<div class="abs tl-card ${n.origin ? 'origin' : ''}" data-y="${yi}" style="left:${x}px;top:${cy}px">
          ${iconFor(n)}
          <b>${C.esc(n.model)}</b><span class="tl-dom">${C.esc(n.domain)}</span></div>`;
      });
      return `
        <div class="abs anchor-line" style="left:0;right:0;top:176px;text-align:center">Within a few years, almost every deep-learning domain <b>converged on the Transformer</b></div>
        <svg class="abs" width="1920" height="1080" style="left:0;top:0">${g}</svg>${ov}`;
    },
    mount(el) {
      return {
        update(b) { el.querySelectorAll('.tl-card, .tl-stem').forEach((n) => n.classList.toggle('build-off', +n.dataset.y > b)); },
      };
    },
  });
})();
