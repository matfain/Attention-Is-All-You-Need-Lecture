/* Slide 3.5: constituency parsing, task & setup. Builds: 0 the task (sentence → bracketed tree) ·
 * 1 Data (WSJ, human trees) · 2 the semi-supervised data: the task visual is replaced by the
 * auto-parsing pipeline (tri-training, Vinyals & Kaiser et al. 2015) and the Data tile gains the
 * ≈17M line · 3 Metric (incl. the test set) · 4 Model. */
(function () {
  const up = tex`\uparrow`;

  // the small drawn tree for (S (NP the cat) (VP sat))
  const tree = () => {
    const N = { S: [300, 40], NP: [170, 150], VP: [430, 150] };
    const L = [['the', 100, 270, 'NP'], ['cat', 240, 270, 'NP'], ['sat', 430, 270, 'VP']];
    let s = '';
    s += `<path class="tr-e" d="M${N.S[0]},${N.S[1] + 22} L${N.NP[0]},${N.NP[1] - 22} M${N.S[0]},${N.S[1] + 22} L${N.VP[0]},${N.VP[1] - 22}"/>`;
    L.forEach(([w, x, y, p]) => { s += `<path class="tr-e" d="M${N[p][0]},${N[p][1] + 22} L${x},${y - 26}"/>`; });
    Object.entries(N).forEach(([k, [x, y]]) => { s += `<text class="tr-n" x="${x}" y="${y}">${k}</text>`; });
    L.forEach(([w, x, y]) => { s += C.chip({ cx: x, cy: y, text: w, role: 'src', h: 46, fs: 24 }); });
    return s;
  };

  // the auto-parsing pipeline (canvas coordinates of the left half), top to bottom
  const pipeline = () => {
    const CX = 560, Y = { news: 400, parse: 500, same: 600, res: 700, out: 820 };
    const box = (cx, cy, w, h, cls) => `<rect class="pp-box ${cls}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="10"/>`;
    const arrow = (d, cls = '') => `<path class="wire ${cls}" d="${d}" marker-end="url(#arr-${cls.includes('problem') ? 'problem' : 'ink'})"/>`;
    let s = '', ov = '';
    s += box(CX, Y.news, 520, 52, 'pp-text');
    ov += C.ov(CX, Y.news, 'news sentences from the web <span class="muted">(no trees)</span>', 'c', 'pp-lab');
    [[430, 'BerkeleyParser'], [690, 'ZPar']].forEach(([x, name]) => {
      s += arrow(`M${x},${Y.news + 28} V${Y.parse - 30}`);
      s += box(x, Y.parse, 220, 52, 'pp-parser');
      ov += C.ov(x, Y.parse, name, 'c', 'pp-lab');
      s += arrow(`M${x},${Y.parse + 28} V${Y.same - 32}`);
    });
    s += box(CX, Y.same, 300, 56, 'pp-test');
    ov += C.ov(CX, Y.same, 'same tree?', 'c', 'pp-lab');
    s += arrow(`M${CX + 152},${Y.same} H${CX + 248}`, 'problem');
    ov += C.ov(CX + 200, Y.same - 20, 'no', 'c', 'caption problem-ink') + C.ov(CX + 256, Y.same, '<b>discard</b>', 'l', 'pp-lab problem-ink');
    s += arrow(`M${CX},${Y.same + 30} V${Y.res - 30}`);
    ov += C.ov(CX + 14, (Y.same + Y.res) / 2, 'yes', 'l', 'caption');
    s += box(CX, Y.res, 420, 52, 'pp-step');
    ov += C.ov(CX, Y.res, 're-sample to WSJ sentence lengths', 'c', 'pp-lab');
    s += arrow(`M${CX},${Y.res + 28} V${Y.out - 36}`);
    s += box(CX, Y.out, 340, 64, 'pp-out');
    ov += C.ov(CX, Y.out, `<b>${C.sym('≈')}17M auto-parsed trees</b>`, 'c', 'pp-lab');
    return `<svg class="abs" width="1920" height="1080" style="left:0;top:0">${s}</svg>${ov}`;
  };

  Deck.slide({
    id: 's-3-5',
    part: 3,
    title: 'Does It Transfer? English Constituency Parsing',
    cite: 'Vaswani et al., 2017 · Vinyals &amp; Kaiser et al., 2015',
    builds: 4,
    render() {
      const fact = (b, h, body) => `<div class="fact" ${b ? `data-build="${b}"` : ''}><b>${h}</b><div>${body}</div></div>`;
      return `
        <div class="abs anchor-line" style="left:112px;top:186px"><b>Task:</b> sentence ${tex`\to`} its syntax tree, written as a sequence</div>
        <div class="abs s35-vis" data-build-max="1" style="left:112px;top:280px;width:900px">
          <div class="s35-io"><span class="caption">input</span><div class="s35-in">${['the', 'cat', 'sat'].map((t) => C.chipHTML(t, 'src', 'sm')).join(' ')}</div></div>
          <div class="s35-arrow">${tex`\downarrow`}</div>
          <div class="s35-io"><span class="caption">output <b class="problem-ink">much longer</b>, strict structure</span><div class="s35-out mono">(S (NP the cat) (VP sat))</div></div>
          <svg class="s35-tree" width="560" height="300" viewBox="0 0 560 300">${tree()}</svg>
          <div class="caption s35-legend"><span class="mono">S</span> = sentence · <span class="mono">NP</span> = noun phrase · <span class="mono">VP</span> = verb phrase</div>
        </div>
        <div data-build="2">
          <div class="abs stage-title" style="left:112px;width:900px;top:262px">Semi-Supervised: Auto-Parsed Trees</div>
          ${pipeline()}
        </div>
        <div class="abs facts" style="left:1080px;top:290px;width:728px">
          ${fact(1, 'Data', `Penn Treebank WSJ: ~<span class="num">40</span>K sentences<br><b class="key">trees by human annotators</b>
            <div data-build="2">semi-supervised: + ${C.sym('≈')}<span class="num">17</span>M <b class="key">auto-parsed</b> sentences</div>`)}
          ${fact(3, `Metric`, `F1 ${up} on labelled phrases (constituents)<br><b class="key">test: WSJ section <span class="num">23</span></b> (human trees)`)}
          ${fact(4, 'Model', `<span class="num">4</span> layers, ${tex`d_{model}=1024`}<br>only dropout, learning rate, beam size tuned<br><b class="key">other hyperparameters as EN${tex`\to`}DE base</b>`)}
        </div>`;
    },
  });
})();
