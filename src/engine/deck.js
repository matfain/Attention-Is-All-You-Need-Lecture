/* Deck engine: canvas scaling, navigation, reversible builds, hash, footer.
 * docs/framework.md explains the engine.
 *
 * A slide module calls Deck.slide({...}) with:
 *   id, part (1-5), title (html), cite (html), builds (number of build steps),
 *   numbered (default true), noFooter, hideProgress, cls,
 *   thumb: [map block ids] -> map thumbnail top-right with those blocks highlighted,
 *   render()      -> html string (called on every entry: re-entry resets widgets)
 *   mount(el)     -> optional instance { update(build), leave(info) }
 * Elements with data-build="k" are visible when build >= k;
 * data-build-max="k" hides them when build > k. update(build) must derive the
 * whole build-dependent state from `build` alone, so going back is exact.
 */
(function () {
  const W = 1920, H = 1080;
  const defs = [];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Deck = (window.Deck = { slide: (d) => defs.push(d), reduced, scale: 1 });

  let stage, footer, backBtn, cur = -1, build = 0, inst = {};
  // Q&A jump (slide 5.3 tiles): { from: questions slide idx, to: target idx } while active
  let qa = null;

  function init() {
    stage = document.getElementById('stage');
    stage.insertAdjacentHTML('afterbegin', C.globalDefs());
    let n = 0;
    defs.forEach((d, i) => {
      d.builds = d.builds || 0;
      if (d.numbered !== false) d.num = ++n;
      const el = document.createElement('section');
      el.className = 'slide' + (d.cls ? ' ' + d.cls : '') + (d.thumb ? ' has-thumb' : '');
      el.id = d.id;
      el.dataset.idx = i;
      stage.appendChild(el);
      d.el = el;
    });
    buildFooter();
    backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.type = 'button';
    backBtn.setAttribute('data-interactive', '');
    backBtn.innerHTML = tex`\leftarrow` + ' back to Questions';
    backBtn.addEventListener('click', backToQuestions);
    stage.appendChild(backBtn);
    fit();
    window.addEventListener('resize', fit);
    document.addEventListener('fullscreenchange', fit);
    document.addEventListener('keydown', onKey);
    stage.addEventListener('click', onClick);
    // Mouse-clicked controls must not keep focus, or Space/arrows would drive them.
    document.addEventListener('pointerup', (e) => {
      const c = e.target.closest && e.target.closest('button, input, [tabindex]');
      if (c && e.pointerType === 'mouse') setTimeout(() => c.blur(), 0);
    });
    const h = parseHash();
    go(h.idx, h.build, { instant: true });
  }

  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const s = Math.min(vw / W, vh / H);
    Deck.scale = s;
    stage.style.transform = `translate(${(vw - W * s) / 2}px, ${(vh - H * s) / 2}px) scale(${s})`;
  }

  /* ---------- footer ---------- */
  function buildFooter() {
    const parts = DATA.deck.parts;
    footer = document.createElement('div');
    footer.className = 'footer';
    const seg = (p, i) => (i ? '<span class="link"></span>' : '') +
      `<span class="seg" data-part="${p.n}"><span class="dot"></span>${p.label}</span>`;
    // the five talk parts (the Roadmap slide shrinks onto these) + footer-only "Questions"
    const main = parts.filter((p) => !p.footerOnly), extra = parts.filter((p) => p.footerOnly);
    footer.innerHTML =
      `<div class="progress"><span class="prog-main">${main.map(seg).join('')}</span><span class="prog-extra">${extra.map((p) => seg(p, 1)).join('')}</span></div>
       <div class="cite"></div>
       <div class="num"></div>
       <button class="fs-btn" title="Fullscreen (F)" aria-label="Toggle fullscreen">${C.icon('fullscreen')}</button>`;
    footer.querySelector('.fs-btn').addEventListener('click', toggleFullscreen);
    // Roadmap navigation: clicking a part jumps to its first slide that has a footer
    // (for Part 1 that is the roadmap, not the title slide). Parts not built yet are inert.
    footer.querySelectorAll('.seg').forEach((s) => {
      const idx = defs.findIndex((d) => d.part === +s.dataset.part && !d.noFooter);
      if (idx < 0) return;
      s.classList.add('nav');
      s.setAttribute('title', 'Go to this part');
      s.addEventListener('click', () => go(idx, 0));
    });
    stage.appendChild(footer);
  }
  function updateFooter(d) {
    footer.classList.toggle('hidden', !!d.noFooter);
    footer.querySelector('.progress').classList.toggle('hidden', !!d.hideProgress);
    footer.querySelectorAll('.seg').forEach((s) => {
      const p = +s.dataset.part;
      s.classList.toggle('current', p === d.part);
      s.classList.toggle('done', p < d.part);
    });
    footer.querySelector('.cite').innerHTML = d.cite || '';
    footer.querySelector('.num').textContent = d.num ? `${d.num} / ${DATA.deck.totalSlides}` : d.numLabel || '';
  }
  Deck.progressEl = () => footer.querySelector('.prog-main');
  Deck.progressTail = () => footer.querySelector('.prog-extra'); // footer-only parts (Questions)

  /* ---------- navigation ---------- */
  function applyBuild(d, b) {
    d.el.querySelectorAll('[data-build], [data-build-max]').forEach((e) => {
      const { build: from, buildMax: to } = e.dataset;
      e.classList.toggle('build-off', (from !== undefined && +from > b) || (to !== undefined && b > +to));
    });
    if (inst.update) inst.update(b);
  }

  function go(idx, b = 0, opts = {}) {
    idx = Math.max(0, Math.min(defs.length - 1, idx));
    const d = defs[idx];
    b = Math.max(0, Math.min(d.builds, b));
    if (opts.instant) stage.classList.add('no-anim');
    if (idx !== cur) {
      const dir = idx > cur ? 1 : -1;
      if (cur >= 0) {
        const old = defs[cur];
        if (inst.leave) inst.leave({ to: d, dir, instant: !!opts.instant });
        old.el.classList.remove('active');
      }
      d.el.innerHTML = (d.title ? `<h2 class="slide-title">${d.title}</h2>` : '') + d.render() + (d.thumb ? C.mapThumb() : '');
      if (d.thumb) C.archMapApi(d.el.querySelector('.map-thumb svg')).highlight(d.thumb);
      fitTitle(d.el);
      inst = (d.mount && d.mount(d.el)) || {};
      cur = idx;
      updateFooter(d);
      d.el.classList.add('active');
      history.replaceState(null, '', '#' + d.id);
    }
    build = b;
    applyBuild(d, b);
    // the back button exists only on a slide reached from a Questions tile
    if (opts.qaFrom !== undefined) qa = { from: opts.qaFrom, to: idx };
    else if (qa && idx !== qa.to) qa = null;
    backBtn.classList.toggle('on', !!qa);
    if (opts.instant) requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('no-anim')));
  }

  // Questions-slide tiles: jump to a slide in its final build, with a way back.
  Deck.jump = (id) => {
    const idx = defs.findIndex((d) => d.id === id);
    if (idx >= 0) go(idx, defs[idx].builds, { qaFrom: cur, instant: true });
  };
  function backToQuestions() {
    if (!qa) return;
    const from = qa.from;
    qa = null;
    go(from, defs[from].builds, { instant: true });
  }

  // Long titles: shrink (down to 46px) to stay on one line; beyond that they wrap.
  function fitTitle(el) {
    const h = el.querySelector('.slide-title');
    if (!h) return;
    let fs = 54;
    while (h.offsetHeight > 75 && fs > 46) { fs -= 2; h.style.fontSize = fs + 'px'; }
  }

  function next() {
    const d = defs[cur];
    if (build < d.builds) go(cur, build + 1);
    else if (cur < defs.length - 1) go(cur + 1, 0);
  }
  function prev() {
    if (build > 0) go(cur, build - 1);
    else if (cur > 0) go(cur - 1, defs[cur - 1].builds);
  }

  function parseHash() {
    const m = location.hash.slice(1).split('/');
    const idx = defs.findIndex((d) => d.id === m[0]);
    return { idx: idx < 0 ? 0 : idx, build: +(m[1] || 0) };
  }

  /* ---------- input ---------- */
  function onKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    const inRange = t && t.matches && t.matches('input[type=range]');
    const onButton = t && t.closest && t !== document.body && t.closest('button');
    switch (e.key) {
      case 'ArrowRight': case 'PageDown':
        if (inRange) return; e.preventDefault(); next(); break;
      case ' ':
        if (onButton) return; e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp':
        if (inRange) return; e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); go(0, 0); break;
      case 'End': e.preventDefault(); go(defs.length - 1, defs[defs.length - 1].builds); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'Escape': if (qa) { e.preventDefault(); backToQuestions(); } break;
    }
  }
  function onClick(e) {
    if (e.button !== 0) return;
    if (e.target.closest('[data-interactive], button, input, a, select, label, .footer')) return;
    next();
  }
  function toggleFullscreen() {
    const de = document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      (de.requestFullscreen || de.webkitRequestFullscreen).call(de);
    }
  }

  /* ---------- helpers for slides ---------- */
  // Rect of an element in unscaled stage coordinates.
  Deck.stageRect = (el) => {
    const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect(), k = Deck.scale;
    return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
  };
  // FLIP a clone of `src` onto the box of `dst` (the roadmap → progress shrink).
  // `tail` (optional): an element that is not part of the flight; it stays hidden until the clone has
  // landed, then slides in from the left (the footer-only "Questions" after the roadmap lands).
  Deck.flip = (src, dst, ms = 750, { tail = null } = {}) => {
    if (reduced) return;
    const a = Deck.stageRect(src), b = Deck.stageRect(dst);
    const clone = src.cloneNode(true);
    Object.assign(clone.style, {
      position: 'absolute', left: a.x + 'px', top: a.y + 'px', width: a.w + 'px', height: a.h + 'px',
      margin: 0, transformOrigin: '0 0', zIndex: 60, pointerEvents: 'none',
    });
    stage.appendChild(clone);
    const sx = b.w / a.w, sy = b.h / a.h;
    const anim = clone.animate(
      [
        { transform: 'none', opacity: 1 },
        { transform: `translate(${b.x - a.x}px, ${b.y - a.y}px) scale(${sx}, ${sy})`, opacity: 0.9, offset: 0.85 },
        { transform: `translate(${b.x - a.x}px, ${b.y - a.y}px) scale(${sx}, ${sy})`, opacity: 0 },
      ],
      { duration: ms, easing: 'cubic-bezier(.6,0,.25,1)' }
    );
    dst.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: ms });
    if (tail) {
      const T = ms + 320, hidden = { opacity: 0, transform: 'translateX(-14px)' };
      tail.animate([hidden, { ...hidden, offset: ms / T }, { opacity: 1, transform: 'none' }], { duration: T, easing: 'ease-out' });
    }
    anim.onfinish = () => clone.remove();
  };

  // Test / dev API.
  window.deck = {
    go: (id, b = 0) => go(typeof id === 'number' ? id : defs.findIndex((d) => d.id === id), b, { instant: true }),
    next, prev,
    state: () => ({ id: defs[cur].id, idx: cur, build, builds: defs[cur].builds, qa: !!qa }),
    list: () => defs.map((d) => ({ id: d.id, builds: d.builds, num: d.num || null })),
  };

  // Load the inlined fonts first so text measurement (title fit, chip widths) is right.
  const FONTS = ['700 54px "Atkinson Hyperlegible"', '400 32px "Atkinson Hyperlegible"', 'italic 400 32px "Atkinson Hyperlegible"',
    '400 27px "JetBrains Mono"', '400 26px KaTeX_Main', 'italic 400 26px KaTeX_Math'];
  // "Deck Digits" covers 0–9 only (unicode-range), so it must be loaded with digit text
  const DIGITS = ['400 32px "Deck Digits"', '700 54px "Deck Digits"', 'italic 400 32px "Deck Digits"'];
  document.addEventListener('DOMContentLoaded', () =>
    Promise.all([...FONTS.map((f) => document.fonts.load(f)), ...DIGITS.map((f) => document.fonts.load(f, '0123456789'))]
      .map((p) => p.catch(() => null))).then(init, init));
})();
