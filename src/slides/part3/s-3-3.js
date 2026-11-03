/* Slide 3.3 [SKIPPABLE]: training recipe. Three tiles + the learning-rate schedule
 * lr = d_model^-0.5 · min(step^-0.5, step · warmup^-1.5), steps 1–100K. Static. */
(function () {
  const R = DATA.part3.training;
  const lr = (s) => Math.pow(R.dModel, -0.5) * Math.min(Math.pow(s, -0.5), s * Math.pow(R.warmup, -1.5));
  const digits = (t) => t.replace(/[\d.]+/g, (m) => `<span class="num">${m}</span>`);
  const PW = 1100, PH = 310, YMAX = 8e-4;
  const px = (s) => (s / R.stepsMax) * PW, py = (v) => PH - (v / YMAX) * PH;

  const plot = () => {
    const steps = [R.warmup];
    for (let s = 1; s <= R.stepsMax; s += s < 8000 ? 50 : 500) steps.push(s);
    const pts = steps.sort((a, b) => a - b).map((s) => `${px(s).toFixed(1)},${py(lr(s)).toFixed(1)}`);
    const peak = lr(R.warmup);
    let g = '';
    [2e-4, 4e-4, 6e-4, 8e-4].forEach((v) => {
      g += `<line class="grid" x1="0" x2="${PW}" y1="${py(v)}" y2="${py(v)}"/><text class="ax" x="-14" y="${py(v)}" style="text-anchor:end">${Math.round(v * 1e4)}</text>`;
    });
    [0, 25000, 50000, 75000, 100000].forEach((s) => { g += `<text class="ax" x="${px(s)}" y="${PH + 34}">${s ? s / 1000 + 'K' : 0}</text>`; });
    g += `<line class="axis" x1="0" x2="${PW}" y1="${PH}" y2="${PH}"/><line class="axis" x1="0" x2="0" y1="0" y2="${PH}"/>`;
    g += `<polyline class="lr" points="${pts.join(' ')}"/>`;
    g += `<circle class="lr-peak" cx="${px(R.warmup)}" cy="${py(peak)}" r="7"/>`;
    g += `<path class="wire graphite" d="M${px(R.warmup) + 14},${py(peak) - 4} L${px(R.warmup) + 60},${py(peak) - 30}"/>`;
    return { g, peak };
  };

  Deck.slide({
    id: 's-3-3',
    part: 3,
    title: 'Training Recipe',
    cite: 'Vaswani et al., 2017',
    render() {
      const { g, peak } = plot();
      const tile = (h, lines) => `<div class="tile"><div class="tile-h">${h}</div>${lines.map((l) => `<div>${l}</div>`).join('')}</div>`;
      const e = Math.floor(Math.log10(peak)), m = Math.round(peak / Math.pow(10, e));
      return `
        <div class="abs tiles" style="left:112px;right:112px;top:190px">
          ${tile('Hardware', [`<span class="num">${R.gpus}</span> × P100 GPUs`, `base: <span class="num">${R.baseSteps}</span> steps ${tex`\approx`} ${digits(R.baseTime)}`, `big: <span class="num">${R.bigSteps}</span> steps ${tex`\approx`} ${digits(R.bigTime)}`])}
          ${tile('Optimizer', [`Adam (${tex`\beta_2`} = <span class="num">${R.beta2}</span>)`, `warmup <span class="num">${R.warmup}</span> steps,`, `then ${tex`\propto 1/\sqrt{\text{step}}`}`])}
          ${tile('Regularisation', [`residual dropout <span class="num">${R.dropout}</span>`, `label smoothing ${tex`\epsilon_{ls}`} = <span class="num">${R.labelSmoothing}</span>`])}
        </div>
        <div class="abs eq-display s33-eq" style="left:0;right:0;top:478px;text-align:center">
          ${tex`\text{lr} = d_{model}^{-0.5}\,\min\!\big(\text{step}^{-0.5},\ \text{step}\cdot 4000^{-1.5}\big)`}
        </div>
        <div class="abs s33-plot" style="left:${(1920 - PW) / 2}px;top:580px">
          <svg width="${PW}" height="${PH}" class="abs" style="left:0;top:0">${g}</svg>
          ${C.ov(px(R.warmup) + 68, py(peak) - 34, `peak ${tex`\approx`} <span class="num">${m}×10<sup>${e}</sup></span> at step <span class="num">${R.warmup}</span>`, 'l', 'label')}
          ${C.ov(-60, PH / 2, `learning rate (${tex`\times 10^{-4}`})`, 'c', 'caption ax-y')}
          ${C.ov(PW / 2, PH + 62, 'training step', 't', 'caption')}
          ${C.ov(PW - 10, py(lr(R.stepsMax)) - 34, `base model (${tex`d_{model} = 512`})`, 'r', 'label')}
        </div>`;
    },
  });
})();
