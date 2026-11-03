/* Slide 1: Roadmap. A line icon above each step; the path shrinks into the footer
 * progress indicator on leaving (the icons are outside the path and fade with the slide). */
(function () {
  const S = 'fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
  const box = (x, y, w, h, role) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="var(--${role}-tint)" stroke="var(--${role})" stroke-width="2.5"/>`;
  const ICONS = [
    // 1 Background: a tiny RNN chain
    box(4, 22, 22, 26, 'src') + box(45, 22, 22, 26, 'src') + box(86, 22, 22, 26, 'src') +
      `<path ${S} d="M28,35 H40 M69,35 H81"/><path ${S} d="M36,31 L41,35 L36,39 M77,31 L82,35 L77,39"/>`,
    // 2 The Transformer: two rows of chips joined by attention lines (the signature)
    box(6, 2, 22, 14, 'src') + box(45, 2, 22, 14, 'src') + box(84, 2, 22, 14, 'src') +
      box(6, 54, 22, 14, 'tgt') + box(45, 54, 22, 14, 'tgt') + box(84, 54, 22, 14, 'tgt') +
      `<g fill="none" stroke="var(--ink)" stroke-linecap="round">
        <path d="M17,52 C17,35 56,35 56,18" stroke-width="3.4"/>
        <path d="M56,52 C56,35 95,35 95,18" stroke-width="3.4"/>
        <path d="M95,52 C95,35 17,35 17,18" stroke-width="1.6" opacity=".45"/>
        <path d="M56,52 C56,35 17,35 17,18" stroke-width="1.6" opacity=".45"/>
      </g>`,
    // 3 Why & Results: a small bar chart
    `<path ${S} d="M8,66 H106 M8,66 V4"/>` +
      `<rect x="20" y="40" width="16" height="26" rx="2" fill="var(--graphite)" opacity=".55"/>` +
      `<rect x="46" y="28" width="16" height="38" rx="2" fill="var(--graphite)" opacity=".55"/>` +
      `<rect x="72" y="10" width="16" height="56" rx="2" fill="var(--ink)"/>`,
    // 4 Ablations: a magnifier
    `<circle cx="48" cy="30" r="22" ${S} stroke-width="3"/><path ${S} stroke-width="5" d="M64,46 L82,64"/>` +
      `<path ${S} stroke-width="2" d="M38,36 V28 M48,36 V22 M58,36 V31"/>`,
    // 5 Outlook: a timeline arrow
    `<path ${S} d="M4,36 H104"/><path ${S} d="M96,28 L105,36 L96,44"/>` +
      [18, 46, 74].map((x, i) => `<circle cx="${x}" cy="36" r="${i === 0 ? 7 : 5.5}" fill="${i === 0 ? 'var(--ink)' : 'var(--panel)'}" stroke="var(--ink)" stroke-width="2.5"/>`).join(''),
  ];

  Deck.slide({
    id: 's-1',
    part: 1,
    title: 'Roadmap',
    hideProgress: true,
    render() {
      const parts = DATA.deck.parts.filter((p) => !p.footerOnly);
      return `
        <div class="abs roadmap" style="left:112px;right:112px;top:430px">
          <div class="rm-icons">
            ${ICONS.map((ic) => `<div class="rm-icon"><svg width="146" height="94" viewBox="0 0 112 72" aria-hidden="true">${ic}</svg></div>`).join('')}
          </div>
          <div class="rm-path">
            ${parts.map((p) => `
              <div class="rm-node">
                <div class="rm-dot">${p.n}</div>
                <div class="rm-label">${p.label}</div>
              </div>`).join('')}
          </div>
        </div>`;
    },
    mount(el) {
      return {
        leave({ to, dir, instant }) {
          if (!instant && dir > 0 && !to.noFooter && !to.hideProgress) Deck.flip(el.querySelector('.rm-path'), Deck.progressEl(), 750, { tail: Deck.progressTail() });
        },
      };
    },
  });
})();
