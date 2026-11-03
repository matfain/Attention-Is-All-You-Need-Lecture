/* Table (booktabs): top/bottom rules 2px ink, header rule 1px, no vertical lines.
 * head: [html | {html, cls, colspan}], rows: [{cells: [html | {html, cls, colspan}], cls}] */
(function (C) {
  const cell = (tag, c) => {
    const o = typeof c === 'object' && c !== null ? c : { html: c };
    return `<${tag} class="${o.cls || ''}" ${o.colspan ? `colspan="${o.colspan}"` : ''} ${o.attrs || ''}>${o.html ?? ''}</${tag}>`;
  };
  C.table = ({ head, rows, cls = '', style = '' }) =>
    `<table class="bt ${cls}" style="${style}"><thead><tr>${head.map((h) => cell('th', h)).join('')}</tr></thead>` +
    `<tbody>${rows.map((r) => `<tr class="${r.cls || ''}" ${r.attrs || ''}>${r.cells.map((c) => cell('td', c)).join('')}</tr>`).join('')}</tbody></table>`;
})(window.C);
