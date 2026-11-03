/* Backup: references (not presented; unnumbered, after 5.3). */
Deck.slide({
  id: 's-refs',
  part: 6,
  title: 'References',
  numbered: false,
  numLabel: 'backup',
  render() {
    const R = DATA.part5.references;
    const item = (r) => `<li>${C.esc(r).replace(/\d+/g, (m) => `<span class="num">${m}</span>`)}</li>`;
    return `<ol class="abs refs" style="left:112px;right:112px;top:180px">${R.map(item).join('')}</ol>`;
  },
});
