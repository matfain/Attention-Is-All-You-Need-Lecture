/* Slide 3.2: experimental setup. A subtitle line (WMT 2014, test set), two dataset cards
 * (example pair, size bar to scale: 4.5M vs 36M, vocabulary) and three metric tiles (BLEU,
 * PPL, training cost: the single place where the metrics are introduced). Static. */
(function () {
  const D = DATA.part3.datasets;
  const up = tex`\uparrow`, down = tex`\downarrow`;
  const MAXW = 640, max = Math.max(...D.map((x) => x.pairs));
  const digits = (t) => C.esc(t).replace(/[\d.]+/g, (m) => `<span class="num">${m}</span>`);

  const card = (x) => `
    <div class="ds-card">
      <div class="ds-pair">${x.pair.replace('→', tex`\to`)}</div>
      <div class="ds-ex">${C.chipHTML(x.src, 'src')} ${tex`\to`} ${C.chipHTML(x.tgt, 'tgt')}</div>
      <div class="ds-size"><div class="ds-bar" style="width:${(x.pairs / max) * MAXW}px"></div><span><span class="num">${x.pairs}M</span> sentence pairs</span></div>
    </div>`;

  Deck.slide({
    id: 's-3-2',
    part: 3,
    title: 'Experiments: Machine Translation',
    cite: 'Vaswani et al., 2017',
    render() {
      return `
        <div class="abs anchor-line ds-split" style="left:0;right:0;top:166px">
          <div>train: <b>WMT <span class="num">2014</span></b> · sentences with human translations</div>
          <div>test: <b>newstest<span class="num">2014</span></b> · held-out news sentences</div>
        </div>
        <div class="abs ds" style="left:112px;right:112px;top:300px">${D.map(card).join('')}</div>
        <div class="abs metrics" style="left:112px;right:112px;top:720px">
          <div class="metric"><b>BLEU ${up}</b>n-gram overlap with a human translation (<span class="num">0–100</span>)</div>
          <div class="metric"><b>PPL ${down} (perplexity)</b>${tex`\exp`}(mean cross-entropy per token)<br>${tex`\approx`} effective choices per token</div>
          <div class="metric"><b>Training cost ${down}</b>FLOPs ${tex`\approx`} training time<br>× GPUs × GPU throughput</div>
        </div>`;
    },
  });
})();
