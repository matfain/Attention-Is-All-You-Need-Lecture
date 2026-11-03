/* Slide 8: The paper. A "paper card" + the promise, with badges answering slide 7's red items. */
Deck.slide({
  id: 's-8',
  part: 1,
  title: 'The Chosen Paper',
  cite: 'Vaswani et al., 2017',
  render() {
    const P = DATA.part1.paper;
    return `
      <div class="abs paper-card" style="left:112px;top:220px;width:720px">
        <div class="pc-rule"></div>
        <div class="pc-title">${P.title}</div>
        <div class="pc-rule thin"></div>
        <div class="pc-authors">${P.authors.join(' · ')}</div>
        <div class="pc-aff">${P.affiliations}</div>
        <div class="pc-venue">${P.venue}</div>
      </div>
      <ul class="anchors abs s8-list" style="left:900px;top:250px;width:908px">
        <li>8 authors · Google Brain &amp; Google Research</li>
        <li><b>Drop recurrence</b>: attention only</li>
        <li><b>Parallel</b> training · <b>${tex`O(1)`}</b> path between any two tokens</li>
        <li><b>+2 BLEU</b> at a fraction of the training cost</li>
      </ul>
      <div class="abs promise" style="left:900px;top:640px">
        ${C.badge(`${C.icon('parallel', 36)} parallel <span class="muted">· was: sequential</span>`, 'lg')}
        ${C.badge(`${C.icon('hop', 36)} ${tex`O(1)`} path <span class="muted">· was: ${tex`O(n)`}</span>`, 'lg')}
      </div>`;
  },
});
