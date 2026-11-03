/* Slide 2.10: the prediction head and generation. Build k = generation step k+1:
 * the decoder input grows by one token; ONE shared decoder band spans all positions, with
 * faint attention arcs from the earlier positions into the last one; only the last
 * position's final vector o_i goes through Linear + softmax; earlier o_i are dimmed; the
 * top token is appended to the input (dashed slot), until <EOS>. No bullets: stage titles Decode / Predict / Append from build 0,
 * the logistic-regression anchor as the bottom line. */
(function () {
  const G = DATA.part2.generation;
  const N = G.steps.length;
  const PX = [210, 410, 610, 810], CHIP_Y = 820, DEC_Y = 620, DEC_H = 130, O_Y = 572;
  const HEAD = { x: 960, y: 575, w: 180, h: 114 };
  const DY = -80; // the whole picture, moved up (no bullets above it)
  const O_LAB = [tex`o_1`, tex`o_2`, tex`o_3`, tex`o_4`];

  Deck.slide({
    id: 's-2-10',
    part: 2,
    title: 'The Prediction Head &amp; Generation',
    thumb: ['linear', 'softmax', 'out-probs'],
    builds: N - 1,
    render() {
      let svg = '', ov = '';
      PX.forEach((x, i) => {
        svg += `<path class="wire gen-in" data-i="${i}" d="M${x},${CHIP_Y - 28} V${DEC_Y + DEC_H + 6}" marker-end="url(#arr-ink)"/>`;
        // earlier positions' outputs are dimmed: only the last o_i is used
        svg += `<g class="gen-pos" data-i="${i}">
          <path class="wire" d="M${x},${DEC_Y - 2} V${O_Y + 22}" marker-end="url(#arr-ink)"/>
          ${C.vbar({ x: x - 50, y: O_Y - 20, values: [0.7, 0.3, 0.55, 0.15], role: 'tgt', cell: 25 })}
        </g>`;
        ov += `<div class="abs gen-o" data-i="${i}" style="left:${x - 64}px;top:${O_Y}px">${O_LAB[i]}</div>`;
        ov += `<div class="abs gen-chip" data-i="${i}" style="left:${x}px;top:${CHIP_Y}px"></div>`;
      });
      svg = `<rect class="gen-dec" x="${PX[0] - 80}" y="${DEC_Y}" height="${DEC_H}" rx="12"/><g class="gen-arcs"></g>` + svg;
      ov += `<div class="abs gen-dec-lab" style="left:${PX[0] - 66}px;top:${DEC_Y + 8}px">decoder × 6</div>`;
      svg += `<rect class="gen-head" x="${HEAD.x}" y="${HEAD.y}" width="${HEAD.w}" height="${HEAD.h}" rx="10"/>`;
      svg += `<path class="wire gen-feed" d=""/>`;
      svg += `<path class="wire" d="M${HEAD.x + HEAD.w + 4},${HEAD.y + HEAD.h / 2} H${HEAD.x + HEAD.w + 60}" marker-end="url(#arr-ink)"/>`;
      svg += C.weightBars({ x: 1230, y: 810, labels: G.vocab, weights: G.steps[0].probs, h: 330, bw: 84, gap: 32, labelFs: 24 });
      ov += C.ov(HEAD.x + HEAD.w / 2, HEAD.y + HEAD.h / 2, `Linear<br><span class="gen-shape">${C.sym('512 → ≈37K')}</span><br>+ softmax`, 'c', 'gen-head-lab');
      ov += `<div class="abs badge lg gen-stop" style="top:${CHIP_Y}px">stop</div>`;
      const stage = (x1, x2, title, sub) => `<div class="abs stage-title" style="left:${x1}px;width:${x2 - x1}px;top:176px">${title}</div>` +
        `<div class="abs stage-sub" style="left:${x1}px;width:${x2 - x1}px;top:246px">${sub}</div>`;
      ov += C.ov((PX[0] + PX[3]) / 2, DEC_Y + DEC_H + 150, 'training: the same computation, all rows at once', 'c', 'caption');
      return `
        ${stage(112, 880, 'Decode', 'only the <b>last position</b> is used')}
        ${stage(910, 1190, 'Predict', 'p(next token)')}
        ${stage(1220, 1600, 'Append', 'chosen token ' + C.sym('→') + ' next input')}
        <div class="abs gen-vis" style="left:0;top:${DY}px;width:1920px;height:1080px">
          <svg class="abs" width="1920" height="1080" style="left:0;top:0">${svg}</svg>${ov}
        </div>
        <div class="abs anchor-line" style="left:0;right:0;top:918px;text-align:center"><b>multinomial logistic regression on learned features</b></div>`;
    },
    mount(el) {
      const bars = el.querySelector('g.wbars');
      return {
        update(b) {
          const st = G.steps[b], last = st.input.length - 1, stop = st.pick === '<EOS>';
          // the shared band grows with the prefix; arcs: every earlier position → the last one
          el.querySelector('.gen-dec').setAttribute('width', PX[last] - PX[0] + 160);
          el.querySelector('.gen-arcs').innerHTML = PX.slice(0, last).map((x) =>
            `<path class="attn gen-arc" style="${C.attnStyle(0.3)}" d="M${x},${DEC_Y + DEC_H - 14} Q${(x + PX[last]) / 2},${DEC_Y + 18} ${PX[last] - 6},${DEC_Y + 24}"/>`).join('');
          el.querySelectorAll('.gen-in').forEach((n) => n.classList.toggle('build-off', +n.dataset.i > last));
          el.querySelectorAll('.gen-pos, .gen-o').forEach((n) => {
            const i = +n.dataset.i;
            n.classList.toggle('build-off', i > last);
            n.classList.toggle('gen-dim', i < last);
          });
          el.querySelectorAll('.gen-chip').forEach((n) => {
            const i = +n.dataset.i;
            const tok = i <= last ? st.input[i] : i === last + 1 && !stop ? st.pick : null;
            n.innerHTML = tok ? C.chipHTML(tok, 'tgt', i > last ? 'next' : '') : '';
          });
          const stopEl = el.querySelector('.gen-stop');
          stopEl.classList.toggle('build-off', !stop);
          stopEl.style.left = PX[last] + 200 + 'px';
          const x = PX[last];
          el.querySelector('.gen-feed').setAttribute('d', `M${x + 54},${O_Y} C${x + 140},${O_Y} ${HEAD.x - 90},${HEAD.y + HEAD.h / 2} ${HEAD.x - 6},${HEAD.y + HEAD.h / 2}`);
          el.querySelector('.gen-feed').setAttribute('marker-end', 'url(#arr-ink)');
          C.setWeightBars(bars, st.probs);
        },
      };
    },
  });
})();
