/* AttentionLines: cubic Bézier curves; width = 1 + 9w px, opacity = 0.15 + 0.85w.
 * The deck's visual signature. Colour by context: ink (default) or problem. */
(function (C) {
  C.curve = (x1, y1, x2, y2, orient = 'v', bend = 0.55) =>
    orient === 'v'
      ? `M${x1},${y1} C${x1},${y1 + (y2 - y1) * bend} ${x2},${y2 - (y2 - y1) * bend} ${x2},${y2}`
      : `M${x1},${y1} C${x1 + (x2 - x1) * bend},${y1} ${x2 - (x2 - x1) * bend},${y2} ${x2},${y2}`;

  C.attnStyle = (w) => `stroke-width:${(1 + 9 * w).toFixed(2)}px;opacity:${(0.15 + 0.85 * w).toFixed(3)}`;

  // lines: [{x1,y1,x2,y2,w,orient?,cls?,attrs?}]
  C.attnLines = (lines, cls = '') =>
    lines.map((l) => `<path class="attn ${cls} ${l.cls || ''}" d="${C.curve(l.x1, l.y1, l.x2, l.y2, l.orient)}" style="${C.attnStyle(l.w)}" ${l.attrs || ''}/>`).join('');

  // Update an existing line's weight in place (keeps CSS transitions smooth).
  C.setAttn = (path, w) => {
    path.style.strokeWidth = (1 + 9 * w).toFixed(2) + 'px';
    path.style.opacity = (0.15 + 0.85 * w).toFixed(3);
  };
})(window.C);
