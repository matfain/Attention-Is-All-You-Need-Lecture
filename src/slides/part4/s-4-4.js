/* Slide 4.4: reading ablations critically. Left: visual area that changes with the build
 * (0: heads chart, y from 20, with hatched "?" noise bands; 1: full Table 3 with near-ties
 * |ΔBLEU| ≤ 0.5 vs base highlighted, inclusive). Right: numbered criticisms, one per build, each
 * matching a numbered highlight in the table: 1 single runs (heads chart) · 2 near-ties · 3 Params /
 * compute-matched heads block · 4 label smoothing PPL vs BLEU · build 4: the bottom line. */
(function () {
  const A = DATA.part4;
  const up = tex`\uparrow`, down = tex`\downarrow`;
  // ΔBLEU in tenths, rounded, so 25.3 − 25.8 is exactly −0.5 (inclusive band)
  const delta = (b) => Math.round((+b - A.baseBleu) * 10) / 10;

  const table = () => {
    let seenA = false;
    const rows = A.table3.map(([grp, change, ppl, bleu, params]) => {
      const base = grp === 'base', d = delta(bleu), near = !base && Math.abs(d) <= A.nearTie;
      const ds = base ? '' : (d > 0 ? '+' : d < 0 ? '−' : '±') + Math.abs(d).toFixed(1);
      // the big model changes several things at once (and trains 3× longer): not a one-factor
      // ablation, so it is set apart (italic, own rule) but still counted and still "clearly large"
      const big = grp === 'big';
      // build 2: the heads block (A) is the compute-matched one (h · d_k = 512); build 3: label smoothing 0.0,
      // where PPL and BLEU point in opposite directions
      const firstA = grp === 'A' && !seenA, ls0 = change === 'label smoothing 0.0';
      if (grp === 'A') seenA = true;
      return `<tr class="${base ? 'hl' : near ? 'near' : 'large'}${big ? ' big-row' : ''}${grp === 'A' ? ' grp-a' : ''}${ls0 ? ' ls0' : ''}">
        <td class="grp">${grp}</td><td class="${base ? 'base-cfg' : ''}">${C.mvar(change)}${firstA ? ' <span class="cm-tag">compute-matched</span>' : ''}</td>
        <td class="num ppl">${ppl}</td><td class="num bleu">${bleu}${ls0 ? '<span class="nb nb4">4</span>' : ''}</td>
        <td class="num dlt">${ds}</td><td class="num par">${params}</td></tr>`;
    }).join('');
    return `<table class="bt t3"><thead><tr><th></th><th>Change</th><th class="num">PPL ${down}</th><th class="num">BLEU ${up}</th>
      <th class="num">${tex`\Delta`} BLEU</th><th class="num par">Params (M)<span class="nb nb3">3</span></th></tr></thead><tbody>${rows}</tbody></table>
      <div class="t3-key"><span class="nb nb2">2</span><span class="key-near"></span> near-tie: within ${tex`\pm 0.5`} BLEU of base</div>`;
  };

  Deck.slide({
    id: 's-4-4',
    part: 4,
    title: 'Reading Ablations Critically',
    cite: 'Vaswani et al., 2017 · Table 3',
    builds: 4,
    render() {
      const nNear = A.table3.filter(([g, , , b]) => g !== 'base' && Math.abs(delta(b)) <= A.nearTie).length;
      return `
        <div data-build-max="0">${C.headsChart({ x: 260, y: 290, w: 820, h: 520, hatch: true, min: 20 })}</div>
        <div data-build="1" class="abs t3-wrap" style="left:112px;width:1120px;top:176px">${table()}</div>
        <ul class="abs icon-list" style="left:1262px;top:300px;width:546px">
          <li><span class="nb">1</span>${C.icon('dice', 44)}<span>single runs:<br><b>no seeds, no CIs</b></span></li>
          <li data-build="1"><span class="nb">2</span>${C.icon('question', 44)}<span><b><span class="num">${nNear}</span> of <span class="num">${A.table3.length - 1}</span> changes</b> within ${tex`\pm 0.5`}:<br><b>most effects within noise</b></span></li>
          <li data-build="2"><span class="nb">3</span>${C.icon('gauge', 44)}<span><b>size effects confounded</b><br>with compute</span></li>
          <li data-build="3"><span class="nb">4</span>${C.icon('diverge', 44)}<span>PPL and BLEU<br><b>can disagree</b></span></li>
        </ul>
        <div class="abs anchor-line s44-bottom" data-build="4" style="left:1262px;top:700px;width:546px">a wider habit: <b>gains reported without significance</b></div>
        <div class="abs t3-legend" style="left:1262px;top:800px;width:546px">
          <div>${tex`N`}<span>layers</span></div><div>${tex`h`}<span>number of heads</span></div>
          <div>${tex`d_{model}`}<span>token-vector width</span></div><div>${tex`d_k, d_v`}<span>size of each head</span></div>
          <div>${tex`d_{ff}`}<span>FFN inner size</span></div>
        </div>`;
    },
    mount(el) {
      const t3 = el.querySelector('table.t3'), items = [...el.querySelectorAll('.icon-list > li')];
      return {
        update(b) {
          t3.dataset.mode = String(b); // 1 near-ties · 2 Params + compute-matched A · 3 label smoothing PPL vs BLEU · 4 none
          items.forEach((li, k) => li.classList.toggle('dimmed', b < 4 && k !== b)); // build 4: all back to full, + the bottom line
        },
      };
    },
  });
})();
