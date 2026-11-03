/* Slide 4: Encoder–decoder RNNs. No bullets: build 0 is the title only; each build
 * adds one titled stage: 1 Encoder (blue chain) · 2 Context Vector (red neck c labelled "information
 * bottleneck", the decoder's initial state, computed once) · 3 Decoder (orange s_1 → s_2 → s_3, outputs
 * fed back) · 4 the problem statement under the slide title. */
Deck.slide({
  id: 's-4',
  part: 1,
  title: 'Encoder–Decoder RNNs',
  cite: 'Sutskever et al., 2014 · Cho et al., 2014',
  builds: 4,
  render() {
    const BW = 96, BH = 130, BY = 150, mid = BY + BH / 2;
    const enc = [150, 360, 570], dec = [1170, 1380, 1590];
    const src = ['the', 'cat', 'sat'], inp = ['<BOS>', 'die', 'Katze'], out = ['die', 'Katze', 'saß'];
    const H = [tex`h_1`, tex`h_2`, tex`h_3`], S = [tex`s_1`, tex`s_2`, tex`s_3`];
    const TOP = 395; // the whole diagram, centred vertically (no bullets)
    let se = '', sb = '', sd = '', oe = '', ob = '', od = '';
    enc.forEach((cx, i) => {
      se += C.chip({ cx, cy: 410, text: src[i], role: 'src' });
      se += `<path class="wire" d="M${cx},382 V${BY + BH + 8}" marker-end="url(#arr-ink)"/>`;
      se += `<rect class="state src" x="${cx - BW / 2}" y="${BY}" width="${BW}" height="${BH}"/>`;
      oe += C.ov(cx, mid, H[i], 'c', 'label');
      if (i < 2) se += `<path class="wire" d="M${cx + BW / 2 + 4},${mid} H${enc[i + 1] - BW / 2 - 8}" marker-end="url(#arr-ink)"/>`;
    });
    oe += C.ov(360, 480, '<span class="src-ink">encoder</span> <span class="muted">= the RNN from the previous slide</span>', 'c', 'caption', 'font-size:24px');
    // funnel from the last encoder state into the narrow vector c
    const fx0 = enc[2] + BW / 2 + 6, nx = 800, nw = 34, nh = 34;
    sb += `<path d="M${fx0},${BY + 6} L${nx},${mid - nh / 2} L${nx},${mid + nh / 2} L${fx0},${BY + BH - 6} Z" fill="var(--problem-tint)" stroke="var(--problem)" stroke-width="2.5" stroke-linejoin="round"/>`;
    sb += `<rect x="${nx}" y="${mid - nh / 2}" width="${nw}" height="${nh}" rx="5" fill="var(--problem)"/>`;
    // c is the decoder's initial state
    sb += `<path class="wire problem" style="stroke-width:3" d="M${nx + nw + 6},${mid} H${dec[0] - BW / 2 - 10}" marker-end="url(#arr-problem)"/>`;
    ob += C.ov(nx + nw / 2, BY - 50, '<b>information bottleneck</b>', 'c', 'label problem-ink', 'font-size:30px');
    sb += `<path class="wire problem" style="stroke-width:2.5" d="M${nx + nw / 2},${BY - 30} V${mid - nh / 2 - 10}" marker-end="url(#arr-problem)"/>`;
    ob += C.ov(nx + nw / 2 + 4, mid + 58, `${tex`c`}: fixed, computed once`, 'l', 'caption problem-ink', 'transform:translate(-26px,-50%)');
    dec.forEach((cx, i) => {
      sd += C.chip({ cx, cy: 410, text: inp[i], role: 'tgt' });
      sd += `<path class="wire" d="M${cx},382 V${BY + BH + 8}" marker-end="url(#arr-ink)"/>`;
      sd += `<rect class="state tgt" x="${cx - BW / 2}" y="${BY}" width="${BW}" height="${BH}"/>`;
      od += C.ov(cx, mid, S[i], 'c', 'label');
      sd += `<path class="wire" d="M${cx},${BY - 4} V${BY - 46}" marker-end="url(#arr-ink)"/>`;
      sd += C.chip({ cx, cy: BY - 76, text: out[i], role: 'tgt' });
      if (i < 2) {
        sd += `<path class="wire" d="M${cx + BW / 2 + 4},${mid} H${dec[i + 1] - BW / 2 - 8}" marker-end="url(#arr-ink)"/>`;
        // the generated word is fed back as the next step's input
        const x1 = cx + C.chipW(out[i]) / 2 + 4, x2 = dec[i + 1] - C.chipW(inp[i + 1]) / 2 - 6;
        sd += `<path class="wire graphite dashed" d="M${x1},${BY - 76} C${x1 + 70},${BY - 76} ${x2 - 70},410 ${x2},410" marker-end="url(#arr-graphite)"/>`;
      }
    });
    od += C.ov(1380, 480, `<span class="tgt-ink">decoder:</span> <span>${tex`s_0 = c,\;\; s_t = f(s_{t-1},\, y_{t-1}) \to y_t`}</span>`, 'c', 'caption', 'font-size:24px');
    // stage titles over their groups (x range in diagram coordinates)
    const stage = (k, x1, x2, html, cls) => `<div class="abs stage-title ${cls}" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:-100px">${html}</div>`;
    return `
      <div class="abs anchor-line" data-build="4" style="left:0;right:0;top:178px;text-align:center"><b class="problem-ink">Problem:</b> the whole source squeezed into <b class="problem-ink">one fixed vector</b></div>
      <div class="abs" style="left:112px;top:${TOP}px;width:1696px;height:520px">
        <svg class="abs" width="1696" height="520" style="left:0;top:0;overflow:visible">
          <g data-build="1">${se}</g><g data-build="2">${sb}</g><g data-build="3">${sd}</g>
        </svg>
        <div data-build="1">${oe}</div><div data-build="2">${ob}</div><div data-build="3">${od}</div>
        ${stage(1, 60, 660, 'Encoder', 'src-ink')}${stage(2, 700, 1080, 'Context Vector', 'problem-ink')}${stage(3, 1110, 1660, 'Decoder', 'tgt-ink')}
      </div>`;
  },
});
