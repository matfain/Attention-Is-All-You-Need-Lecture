/* Matrix (values, rowLabels, colLabels, mode: numbers|heatmap|both).
 * Options: roundRows (display rows as distributions summing to 1.00), masked (bool[][]),
 * highlightRow, dimOtherRows, frame (q|k|v|ink), shape (html under the grid),
 * clickableRows (row labels get data-row and are interactive), abstract (scale-up view),
 * maskText (what a masked cell shows: −∞ for scores, 0 for weights). */
(function (C) {
  const NEG_INF = tex`-\infty`;
  // abstract-matrix fillers: three centred dots (KaTeX \vdots has a low baseline and overlapped the next row)
  const dots = (pts) => `<svg width="100%" height="100%" viewBox="0 0 30 30" aria-hidden="true">${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7" fill="var(--graphite)"/>`).join('')}</svg>`;
  const DOTS = { h: dots([[7, 15], [15, 15], [23, 15]]), v: dots([[15, 7], [15, 15], [15, 23]]), d: dots([[7, 7], [15, 15], [23, 23]]) };

  C.matrix = ({
    values, rows = null, cols = null, mode = 'numbers', cell = 72, dp = 2,
    rowRole = 'src', colRole = 'src', roundRows = false, masked = null,
    highlightRow = null, dimOtherRows = false, frame = null, shape = null,
    clickableRows = false, cls = '', id = '', cellFs = null, maskText = NEG_INF,
  }) => {
    const shown = roundRows ? values.map((r) => C.roundDist(r, dp)) : values;
    const nc = values[0].length;
    const tpl = (rows ? 'auto ' : '') + `repeat(${nc}, ${cell}px)`;
    let html = '';
    if (cols) {
      if (rows) html += '<div></div>';
      html += cols.map((c) => `<div class="clab">${C.chipHTML(c, colRole, 'sm')}</div>`).join('');
    }
    values.forEach((r, i) => {
      if (rows) {
        html += `<div class="rlab ${clickableRows ? 'clickable' : ''}" ${clickableRows ? `data-row="${i}" data-interactive` : ''}>${C.chipHTML(rows[i], rowRole, 'sm' + (highlightRow === i ? ' highlight' : ''))}</div>`;
      }
      r.forEach((v, j) => {
        const isMasked = masked && masked[i][j];
        const heat = mode !== 'numbers' && !isMasked;
        const classes = ['cell'];
        if (isMasked) classes.push('masked');
        if (heat && v > 0.5) classes.push('dark');
        if (highlightRow === i) classes.push('rowhl');
        if (dimOtherRows && highlightRow !== null && highlightRow !== i) classes.push('dimmed');
        const bg = heat ? `background:${C.ramp(v)};` : '';
        const fs = cellFs ? `font-size:${cellFs}px;` : '';
        const txt = isMasked ? maskText : mode === 'heatmap' ? '' : C.fmt(shown[i][j], dp);
        html += `<div class="${classes.join(' ')}" data-r="${i}" data-c="${j}" style="${bg}${fs}">${txt}</div>`;
      });
    });
    const grid = `<div class="mtx" style="grid-template-columns:${tpl};--cell:${cell}px">${html}</div>`;
    return `<div class="mtx-frame ${cls}" ${id ? `id="${id}"` : ''}>` +
      (frame ? `<div class="mtx-framed ${frame}">${grid}</div>` : grid) +
      (shape ? `<div class="shape">${shape}</div>` : '') + `</div>`;
  };

  // Highlight one row in place (row-highlight state).
  C.setMatrixRow = (root, row, dimOthers = false) => {
    root.querySelectorAll('.cell').forEach((c) => {
      const r = +c.dataset.r;
      c.classList.toggle('rowhl', r === row);
      c.classList.toggle('dimmed', dimOthers && row !== null && r !== row);
    });
    root.querySelectorAll('.rlab').forEach((l, i) => l.querySelector('.chip').classList.toggle('highlight', i === row));
  };

  // Abstract variant for scale-up views: a rows × cols grid of dots with a shape label.
  C.matrixAbstract = ({ rows = 4, cols = 4, cell = 56, frame = null, shape = '', fill = 'var(--panel)' }) => {
    let html = '';
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const lastR = i === rows - 2, lastC = j === cols - 2;
      const g = lastR && lastC ? DOTS.d : lastR ? DOTS.v : lastC ? DOTS.h : '';
      html += `<div class="cell" style="background:${g ? 'transparent' : fill};${g ? 'border-color:transparent' : ''}">${g}</div>`;
    }
    const grid = `<div class="mtx" style="grid-template-columns:repeat(${cols}, ${cell}px);--cell:${cell}px">${html}</div>`;
    return `<div class="mtx-frame">${frame ? `<div class="mtx-framed ${frame}">${grid}</div>` : grid}<div class="shape">${shape}</div></div>`;
  };
})(window.C);
