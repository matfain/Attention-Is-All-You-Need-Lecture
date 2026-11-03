/* Slide 2.4: One Transformer layer. No bullets. One token's journey through the residual stream, stage by stage
 * (illustrative 4-cell vectors): build 0 = x · 1–2 = Attention (⊕ update, LN) · 3–4 = Feed-Forward
 * (⊕ update, LN), each pair under a stage title with a subtitle · 5 = the layer excerpt from
 * Figure 1 as a summary, with the "stacked N = 6 times" badge under it. */
(function () {
  const J = DATA.part2.layerJourney;

  const ln = (v) => { // LayerNorm (no learned scale/shift), mapped to [0,1] for shading
    const m = v.reduce((a, b) => a + b, 0) / v.length;
    const sd = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length) || 1;
    return v.map((x) => Math.max(0, Math.min(1, ((x - m) / sd + 2) / 4)));
  };
  const add = (a, b) => a.map((x, i) => Math.min(1, x + b[i]));
  const x0 = J.x, x1 = add(x0, J.attnEdit), x2 = ln(x1), x3 = add(x2, J.ffnEdit), x4 = ln(x3);

  // mini layer diagram (canvas px)
  const BX = 60, BW = 250;
  const blocks = [
    ['mha', 'attn', 470, 70, 'Multi-Head Attention'],
    ['an1', 'norm', 380, 46, 'Add & Norm'],
    ['ffn', 'ffn', 240, 70, 'Feed Forward'],
    ['an2', 'norm', 150, 46, 'Add & Norm'],
  ];
  const mini = () => {
    let s = blocks.map(([id, cls, y, h, t]) => `<g class="blk ${cls}" data-id="${id}"><rect x="${BX}" y="${y}" width="${BW}" height="${h}" rx="9"/><text x="${BX + BW / 2}" y="${y + h / 2 + 1}">${t}</text></g>`).join('');
    const cx = BX + BW / 2;
    s += `<path class="w" d="M${cx},600 V${540 + 4}" marker-end="url(#arr-map)"/>` +
      `<path class="w" d="M${cx},470 V${426 + 4}" marker-end="url(#arr-map)"/>` +
      `<path class="w" d="M${cx},380 V${310 + 4}" marker-end="url(#arr-map)"/>` +
      `<path class="w" d="M${cx},240 V${196 + 4}" marker-end="url(#arr-map)"/>` +
      `<path class="w" d="M${cx},150 V100" marker-end="url(#arr-map)"/>` +
      `<path class="w res" data-id="an1" d="M${cx},572 H${BX - 30} V403 H${BX - 4}" marker-end="url(#arr-map)"/>` +
      `<path class="w res" data-id="an2" d="M${cx},345 H${BX - 30} V173 H${BX - 4}" marker-end="url(#arr-map)"/>`;
    return s;
  };

  const STAGES = [
    { v: x0, label: tex`x` },
    { v: x1, label: tex`x + \mathrm{MHA}(x)`, edit: J.attnEdit, editLabel: 'attention update' },
    { v: x2, label: 'LayerNorm' },
    { v: x3, label: tex`x + \mathrm{FFN}(x)`, edit: J.ffnEdit, editLabel: 'FFN update' },
    { v: x4, label: 'LayerNorm' },
  ];

  Deck.slide({
    id: 's-2-4',
    part: 2,
    title: 'One Transformer Layer',
    thumb: ['enc-addnorm1', 'enc-ffn', 'enc-addnorm2', 'enc-mha'],
    builds: STAGES.length,
    render() {
      const SX = 60, DXS = 290, CELL = 44, VY = 430;
      let s = '', ov = '';
      STAGES.forEach((st, i) => {
        const x = SX + i * DXS, ay = VY + 2 * CELL;
        s += `<g data-build="${i}">${C.vbar({ x, y: VY, values: st.v, role: 'src', cell: CELL, orient: 'v' })}`;
        if (i > 0) {
          const x0 = x - DXS + CELL + 10, mx = (x0 + x - 12) / 2;
          if (st.edit) {
            // the sub-layer's edit enters the stream through ⊕ (residual connection)
            s += `<path class="wire" d="M${x0},${ay} H${mx - 18}"/><path class="wire" d="M${mx + 18},${ay} H${x - 12}" marker-end="url(#arr-ink)"/>` +
              `<circle cx="${mx}" cy="${ay}" r="16" class="oplus"/><path class="wire" style="stroke-width:2.5" d="M${mx - 9},${ay} H${mx + 9} M${mx},${ay - 9} V${ay + 9}"/>` +
              C.vbar({ x: mx - 15, y: ay + 70, values: st.edit, role: 'ink', cell: 30, orient: 'v' }) +
              `<path class="wire graphite" d="M${mx},${ay + 66} V${ay + 22}" marker-end="url(#arr-graphite)"/>`;
            ov += `<div data-build="${i}">` + C.ov(mx, ay + 70 + 4 * 30 + 12, st.editLabel, 't', 'caption') + `</div>`;
          } else {
            s += `<rect x="${mx - 26}" y="${ay - 20}" width="52" height="40" rx="6" class="ln-box"/><text x="${mx}" y="${ay + 1}" class="ln-t">LN</text>` +
              `<path class="wire" d="M${x0},${ay} H${mx - 30}"/><path class="wire" d="M${mx + 30},${ay} H${x - 12}" marker-end="url(#arr-ink)"/>`;
            // LayerNorm defined once, under the first LN box
            if (i === 2) ov += `<div data-build="${i}">` + C.ov(mx, ay + 34, 'LayerNorm: per token,<br>mean 0 · variance 1', 't', 'caption', 'text-align:center') + `</div>`;
          }
        }
        s += '</g>';
        ov += `<div data-build="${i}">` + C.ov(x + CELL / 2, VY - 30, st.label, 'c', 'label') + `</div>`;
      });
      // stage titles (x ranges in journey coordinates) with a subtitle line
      const stage = (k, x1, x2, title, sub) => `<div class="abs stage-title" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:196px">${title}</div>` +
        `<div class="abs stage-sub" data-build="${k}" style="left:${x1}px;width:${x2 - x1}px;top:266px">${sub}</div>`;
      return `
        <div class="abs s24-j" style="left:112px;top:0;width:1696px;height:1080px">
          <svg class="abs" width="1696" height="1080" style="left:0;top:0">${s}</svg>${ov}
          ${stage(1, 110, 690, 'Attention', 'tokens <b>exchange</b> information')}
          ${stage(3, 710, 1270, 'Feed-Forward', `each token <b>processes</b> it<br><span class="caption">${tex`\mathrm{FFN}(x)=\max(0, xW_1+b_1)W_2+b_2`}</span>`)}
        </div>
        <div class="abs s24-mini" data-build="5" style="left:1450px;top:350px;width:340px;height:560px">
          <svg class="amap mini-layer" width="340" height="560" viewBox="0 70 340 560">${mini()}</svg>
        </div>
        <div class="abs" data-build="5" style="left:1635px;top:905px;transform:translateX(-50%)">${C.badge('stacked ' + tex`N = 6` + ' times', 'lg')}</div>`;
    },
  });
})();
