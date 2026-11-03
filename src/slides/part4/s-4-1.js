/* Slide 4.1: ablation, number of heads (Table 3 rows A). Ablation card on top; below, BLEU
 * bars with PPL labels, second x-row d_k = d_v, base highlighted, y from 24.5 (noted). Static. */
Deck.slide({
  id: 's-4-1',
  part: 4,
  title: 'Ablation: Number of Heads',
  cite: 'Vaswani et al., 2017 · Table 3',
  render() {
    return `
      ${C.ablCard({
        ablated: `heads ${tex`h`} with ${tex`h \cdot d_k = 512`} fixed · all else as base (${tex`N=6`}, ${tex`d_{model}=512`}, ${tex`h=8`})`,
        conclusion: `paper’s reading: <b>best at 8–16 heads</b> · 1 head ${tex`-0.9`} BLEU`,
      })}
      ${C.headsChart({ x: 560, y: 400, w: 860, h: 400 })}`;
  },
});
