/* Slider / Toggle / Button: large hit areas, ink on panel, visible focus ring.
 * All controls are marked data-interactive so clicks never advance the slide. */
(function (C) {
  // Segmented toggle: options [{key, label}], returns html; wire with C.wireSeg.
  // cls 'indicator': display-only (driven by build steps, not clickable, clicks advance the deck).
  C.seg = (name, options, active, cls = '') => {
    const ind = cls.split(' ').includes('indicator');
    return `<div class="seg-ctl ${cls}" role="group" data-seg="${name}" ${ind ? '' : 'data-interactive'}>` +
    options.map((o) => `<button type="button" data-key="${o.key}" aria-pressed="${o.key === active}" class="${o.cls || ''}" ${ind ? 'tabindex="-1" disabled' : ''}>${o.label}</button>`).join('') +
    `</div>`;
  };

  C.wireSeg = (root, name, onChange) => {
    const g = root.querySelector(`[data-seg="${name}"]`);
    const set = (key) => g.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.key === key)));
    g.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      set(b.dataset.key);
      onChange(b.dataset.key);
    });
    return set;
  };
})(window.C);
