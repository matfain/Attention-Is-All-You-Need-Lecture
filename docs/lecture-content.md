# Lecture Content

What each slide shows, the numbers on it, and background notes for the harder slides. The slide code and `src/data/*.json` follow this document. If they disagree, one of them has a bug.

- **Audience:** M.Sc seminar in statistics & data science (classic ML background, basic deep learning).
- **Paper:** Vaswani et al., *Attention Is All You Need*, NeurIPS 2017 ([arXiv:1706.03762](https://arxiv.org/abs/1706.03762), also in `paper/`).
- **Slide numbers:** "S7" is the footer number (title = S1). The ID in brackets (`s-6`) is the file name in `src/slides/`. The full slide/ID/builds table is in `CLAUDE.md`.

| Part | Slides | Covers |
|---|---|---|
| 1 Background | S1–S10 | seq2seq, RNNs and their limits, attention, the paper |
| 2 The Transformer | S11–S23 | each component, then the full flow, generation, masking |
| 3 Why & Results | S24–S29 | Table 1 (compute), Table 2 (translation), Table 4 (parsing) |
| 4 Ablations | S30–S33 | Table 3, then a critical reading of it |
| 5 Outlook | S34–S36 | takeaways, later Transformer models, Questions |

## Conventions

- **Running example:** "the cat sat" → "die Katze saß".
- **Toy model** for walkthroughs: 3 tokens, $d_{model}=4$, $d_k=d_v=2$. Badges give the paper's sizes ($d_{model}=512$, $h=8$, $d_k=d_v=64$). From S20 on, shapes use the paper's sizes ($n$ source tokens, $m$ target tokens, vocabulary ≈ 37K).
- **Notation:** $e$ = score (softmax input), $\alpha$ = weight (softmax output), $\exp(\cdot)$. $Z$ only for attention output ($Z = AV$). $i, j$ index tokens, so S14 uses $r$ for vector entries.
- Displayed distributions sum to exactly 1.00 (largest-remainder rounding). Exact values are in `src/data`.
- Metrics carry ↑ (higher is better) or ↓ (lower is better).
- Attention walkthroughs end with the residual update $x \leftarrow x + \text{update}$.

## Part 1: Background

- **S1 Title** (s-0): title, subtitle *From Sequence-to-Sequence Models to the Transformer*, Vaswani et al. NeurIPS 2017, presenter and email. Animated attention lines in the background.
- **S2 Roadmap** (s-1): the five parts. On leaving, the path shrinks into the footer progress bar.
- **S3 Sequence-to-Sequence Tasks** (s-2):
  - $x = (x_1..x_n) \to y = (y_1..y_m)$, $n \neq m$ in general.
  - $p(y\mid x)=\prod_t p(y_t \mid y_{<t}, x)$.
  - Builds switch the example: translation, summarization, speech-to-text, LLM chat.
- **S4 Text In, Probabilities Out** (s-tok): four stages.
  - Tokenization: ids 5 / 2431 / 8117; "tokenization" → token + ization.
  - Embedding: rows of a learned table $E$, ≈37K × 512.
  - Network: one output vector per position.
  - Prediction: softmax over the vocabulary, loss $-\log p(\text{on})$.
  - Bottom line: all weights, embeddings included, are trained by maximum likelihood. The tokenizer is fixed.
- **S5 RNNs** (s-3):
  - $h_t = f(h_{t-1}, x_t)$, same weights every step.
  - Builds compute $h_1..h_5$. Each bar has one segment per word read so far, and older words shrink (illustrative shares).
  - Ends with the two problems: information bottleneck, fading long-range dependencies.
- **S6 Encoder–Decoder RNNs** (s-4): stages Encoder → Context Vector $c$ (fixed, computed once, the decoder's initial state) → Decoder ($s_0 = c$, $s_t = f(s_{t-1}, y_{t-1})$). Then: the whole source squeezed into one fixed vector.
- **S7 Training vs. Generation** (s-5):
  - At generation a wrong guess ("Hund") is fed back and derails the rest.
  - Teacher forcing feeds the true previous token.
  - Even so, the RNN still computes $s_1 \to s_2 \to s_3$ one step at a time.
- **S8 Attention** (s-6), Bahdanau et al. 2015: one decoding step, one build per step.
  - Score $e_{t,j} = \text{score}(s_{t-1}, h_j)$ → softmax $\alpha_{t,j}$ → context $c_t = \sum_j \alpha_{t,j} h_j$ → update $s_t = f(s_{t-1}, y_{t-1}, c_t)$ → predict.
  - Build 6 shows the 3 × 3 alignment matrix, and target words become clickable. See [notes](#s8-bahdanau-attention).
- **S9 One Bottleneck Solved, One Remains** (s-7): the S8 diagram with the recurrent chains in red. ✓ information bottleneck (attention). ✗ sequential computation and long paths.
- **S10 The Chosen Paper** (s-8): drop recurrence · parallel training · O(1) path between any two tokens · +2 BLEU at a fraction of the cost.

## Part 2: The Transformer

Component slides show the architecture map top-right with the current block highlighted.

- **S11 The Transformer at a Glance** (s-2-0):
  - Figure 1 redrawn. Builds highlight self-attention, multi-head, the layer block, cross-attention and positional encoding in turn.
  - On leaving, the map shrinks into S12's thumbnail.
- **S12 Self-Attention** (s-2-1a): one token's update, no numbers.
  - Framing: every token is updated from all tokens at once, instead of $h_t = f(h_{t-1}, x_t)$.
  - Project: $q_i, k_j, v_j$ ("what am I looking for / what do I offer / what do I pass on").
  - Score $e_{ij} = q_i \cdot k_j$, then softmax $\alpha_{ij}$.
  - Update $x_i \leftarrow x_i + (\sum_j \alpha_{ij} v_j) W^O$.
- **S13 Scaled Dot-Product Attention** (s-2-1b): $\text{softmax}(QK^\top/\sqrt{d_k})V$ in matrix form with the toy numbers.
  - Builds: $X$ → $Q,K,V$ → $QK^\top$ → $A$ → $Z = AV$ → $X + ZW^O$ → the general case with $n$ tokens.
  - Clicking a row label highlights that token in every matrix. See [notes](#s13-toy-numbers).
- **S14 Why Divide by √d_k?** (s-2-2): paper footnote 4.
  - A widget shows the softmax weights of one query over six keys ($d_k$ slider, scaled/unscaled toggle). The builds set its state.
  - Steps: scores grow with $d_k$ (variance $d_k$) → softmax depends only on gaps, so one key takes all and gradients vanish → dividing by $\sqrt{d_k}$ restores variance 1. See [notes](#s14-scaling).
- **S15 Multi-Head Attention** (s-2-3):
  - $X$ splits into heads, each with its own $W_i^Q, W_i^K, W_i^V$ (512 → 64).
  - Each head attends in parallel (heads labelled "self", "previous word", "find the noun").
  - The head outputs are concatenated, multiplied by $W^O$ and added back.
  - Bottom line: $h=8$, $d_k=64$, similar cost to one full-width head.
- **S16 One Transformer Layer** (s-2-4): one token vector through attention (add, LayerNorm) and the feed-forward network $\max(0, xW_1+b_1)W_2+b_2$ (add, LayerNorm). Last build: the layer excerpt from Figure 1, stacked $N = 6$ times.
- **S17 Cross-Attention** (s-2-5):
  - Where it sits on the map: K, V from the encoder, Q from the decoder.
  - Attention lines from <BOS> / die / Katze to the source.
  - The $m \times n$ weight matrix.
  - Bottom line: Bahdanau attention without the RNNs.
- **S18 Attention Is Blind to Order** (s-2-6):
  - $\text{SelfAttn}(PX) = P\,\text{SelfAttn}(X)$.
  - "dog bites man" and "man bites dog" give "dog" the same vector.
  - Fine for sets and graphs, wrong for language. Fix: add a position vector to the scaled embedding.
- **S19 Sinusoidal Positional Encoding** (s-2-7):
  - $PE_{pos} = (\sin\omega_0 pos, \cos\omega_0 pos, \dots) \in \mathbb{R}^{512}$, $\omega_i = 10000^{-2i/512}$.
  - A position slider drives six clock dials (labelled with $\lambda = 2\pi/\omega_i$, positions per turn) and sin | cos heatmaps.
  - Bottom line: a shift $pos \to pos+k$ rotates each pair. See [notes](#s19-positional-encoding).
- **S20 Full Flow** (s-2-9): the map, one stage per build, with shapes.
  - Source $n \times 512$ → 6 encoder layers → into every decoder layer.
  - Target $m \times 512$ → 6 decoder layers → Linear + softmax → $m \times 37$K.
- **S21 Prediction Head & Generation** (s-2-10):
  - Decode → predict (Linear 512 → 37K + softmax, last position only) → append the chosen token.
  - Builds generate die → Katze → saß → <EOS>.
  - Bottom line: multinomial logistic regression on learned features.
- **S22 Causal Masking** (s-2-11):
  - Decoder input is the target shifted right.
  - Without a mask, positions see the word they must predict.
  - The mask sets scores to −∞ for $j > i$, so their weights are 0. Shift + mask = teacher forcing in one parallel pass.
  - Last build: a table of the three attention types (encoder self, decoder masked self, cross).
- **S23 Path to the Prediction** (s-2-12): word 1 reaches the prediction in $n-1$ fading steps in an RNN ($O(n)$), in one attention hop in a Transformer ($O(1)$).

## Part 3: Why & Results

- **S24 Compute Comparison** (s-3-1): Table 1 without the convolution row. See [notes](#s24-table-1).

  | Layer | Compute ↓ | Sequential ops ↓ | Max path ↓ |
  |---|---|---|---|
  | Self-attention | $O(n^2 d)$ | $O(1)$ | $O(1)$ |
  | Recurrent | $O(n d^2)$ | $O(n)$ | $O(n)$ |

  - Build 1: cheaper iff $n < d$. At $d = 512$, $n = 30$ is ~17× cheaper and $n = 10{,}000$ is ~20× more expensive.
  - Build 2: why RNNs still lose on long inputs (training speed, quality, break-even grows with $d$).
- **S25 Experiments** (s-3-2):
  - Train WMT 2014, test newstest2014. EN→DE 4.5M pairs, EN→FR 36M.
  - Metrics: BLEU ↑ (n-gram overlap, 0–100) · PPL ↓ (exp of mean cross-entropy per token) · training cost ↓ (FLOPs ≈ time × GPUs × throughput).
- **S26 Training Recipe** (s-3-3, skippable):
  - 8 × P100; base 100K steps ≈ 12 h, big 300K ≈ 3.5 days.
  - Adam ($\beta_2 = 0.98$), 4000 warmup steps then $\propto 1/\sqrt{\text{step}}$ (peak ≈ 7e-4).
  - Dropout 0.1, label smoothing 0.1.
- **S27 Main Results** (s-3-4): Table 2, then a cost–quality scatter (EN→DE).

  | Model | EN→DE BLEU ↑ | EN→FR BLEU ↑ | Cost ↓ (FLOPs) |
  |---|---|---|---|
  | MoE (best prior single) | 26.03 | 40.56 | 2.0e19 / 1.2e20 |
  | ConvS2S Ens. (best prior ensemble) | 26.36 | 41.29 | 7.7e19 / 1.2e21 |
  | Transformer base | 27.3 | 38.1 (greyed) | 3.3e18 |
  | Transformer big | 28.4 | 41.8 | 2.3e19 |

  - Scatter adds GNMT+RL 24.6, ConvS2S 25.16, GNMT+RL Ens. 26.30.
  - Tiles: +2 BLEU (big, EN→DE) · lowest cost (base) · 41.8 (big, EN→FR single-model state of the art).
- **S28 Constituency Parsing** (s-3-5): sentence → bracketed tree `(S (NP the cat) (VP sat))`.
  - Data: WSJ ~40K human-annotated trees, plus ≈17M auto-parsed sentences for the semi-supervised setting (pipeline shown).
  - Metric: F1 on labelled constituents, tested on WSJ section 23.
  - Model: 4 layers, $d_{model}=1024$, trained from scratch, other hyperparameters as the EN→DE base model. See [notes](#s28s29-parsing).
- **S29 It Transfers** (s-3-6): Table 4.
  - WSJ only: RNN seq2seq 88.3 · Petrov 90.4 · Zhu 90.4 · RNN Grammar 91.7 · **Transformer 91.3**.
  - Semi-supervised: Zhu 91.3 · Huang & Harper 91.3 · McClosky 92.1 · Vinyals & Kaiser 92.1 · **Transformer 92.7**.
  - Tiles: +3 F1 vs RNN seq2seq on the same 40K data · highest reported among semi-supervised parsers · minimal tuning.

## Part 4: Ablations

S30–S32 share a card: what is changed, how it is measured (BLEU and PPL on newstest2013, 100K steps), conclusion. Base: $N=6$, $d_{model}=512$, $d_{ff}=2048$, $h=8$, $d_k=d_v=64$. All numbers are from Table 3.

- **S30 Number of Heads** (s-4-1), with $h \cdot d_k = 512$ fixed. Conclusion: "paper's reading: best at 8–16 heads" · 1 head −0.9 BLEU.

  | $h$ | 1 | 4 | 8 (base) | 16 | 32 |
  |---|---|---|---|---|---|
  | BLEU ↑ | 24.9 | 25.5 | 25.8 | 25.8 | 25.4 |
  | PPL ↓ | 5.29 | 5.00 | 4.92 | 4.91 | 5.01 |

- **S31 Model Size** (s-4-2): PPL and BLEU against parameters for $N$ = 2/4/8, $d_{model}$ = 256/1024, $d_{ff}$ = 1024/4096 and big (28M–213M params, BLEU 23.7–26.4). Conclusion: "paper's reading: bigger is better on both metrics".
- **S32 Positional Encoding** (s-4-3): sinusoidal 4.92 PPL / 25.8 BLEU vs learned 4.92 / 25.7. Same quality, so the choice was about extrapolating beyond the training length.
- **S33 Reading Ablations Critically** (s-4-4): four numbered points, each highlighting its evidence. See [notes](#s33-ablations).
  1. Single runs, no seeds or confidence intervals.
  2. 13 of 19 changes are within ±0.5 BLEU of base.
  3. Size effects are confounded with compute.
  4. PPL and BLEU can disagree (label smoothing).
  - Bottom line: gains are commonly reported without significance tests.

## Part 5: Outlook

- **S34 Takeaways** (s-5-1): attention alone is enough · parallel training and O(1) paths · better, cheaper, and it transfers · caveats: $O(n^2)$ cost and thin ablation evidence.
- **S35 One Architecture for Everything** (s-5-2): timeline by release year.
  - 2017 Transformer
  - 2018 GPT, BERT
  - 2020 ViT
  - 2022 Whisper, TabPFN, DiT
  - 2023 Claude, Gemini
  - 2024 Chronos, Stable Diffusion 3, Sora
- **S36 Questions?** (s-5-3): the full map and 8 tiles that jump to S13, S14, S15, S16, S19, S22, S24 and S33. The target slide shows "← back to Questions", and Esc also returns.
- **References** (s-refs, unnumbered): the 22 sources listed at the end.

## Notes on the harder slides

### S8 Bahdanau attention
- One decoding step produces **one row** of weights (query $s_{t-1}$ against all $h_j$), so the matrix is built one row per step. In self-attention all rows are computed at once.
- $s_t = f(s_{t-1}, y_{t-1}, c_t)$ takes three separate inputs (not summed).
- Illustrative logits are chosen so the softmax rounds exactly to the weights:
  - die: 2.8 / 1.1 / 0.0 → 0.80 / 0.15 / 0.05
  - Katze: 0.7 / 2.8 / 0.0 → 0.10 / 0.85 / 0.05
  - saß: 0.0 / 1.1 / 2.8 → 0.05 / 0.15 / 0.80
- Luong et al. (2015) use the current state $s_t$ as the query and a dot-product score. Bahdanau uses a small MLP and a bidirectional encoder.

### S13 toy numbers
Script-verified. Rows are the / cat / sat.
- $X$ = `[[1,0,1,0],[0,2,0,1],[1,1,0,1]]`
- $W^Q$ = `[[0.7,-0.8],[0.2,0.6],[0.5,-0.7],[0.6,0.8]]` · $W^K$ = `[[-1.0,0.5],[0.8,-0.9],[-0.2,-1.0],[-0.6,0.6]]` · $W^V$ = `[[1,0],[0,1],[0.5,0.5],[0,-1]]`
- $QK^\top$ = `[[-0.69,3.00,-1.26],[-2.20,-1.40,-0.40],[-2.10,0.78,-1.08]]`
- $A$ (displayed) = `[[0.07,0.89,0.04],[0.16,0.28,0.56],[0.09,0.72,0.19]]` (exact values in `toy-attention.json`)
- $Z = AV$ = `[[0.14,0.92],[0.80,0.36],[0.33,0.76]]` · $W^O$ = `[[1,0,1,0],[0,1,0,1]]` · $X + ZW^O$ = `[[1.14,0.92,1.14,0.92],[0.80,2.36,0.80,1.36],[1.33,1.76,0.33,1.76]]`

"sat" attends mostly to "cat" (0.72) and to itself (0.19). Without $W^Q, W^K$ the scores $x_i \cdot x_j$ would be symmetric.

### S14 scaling
- If $q_r, k_r$ are independent with mean 0 and variance 1, then $\text{Var}(q\cdot k) = d_k$: a spread of ≈ 23 at $d_k = 512$.
- Softmax depends only on gaps ($\alpha_j/\alpha_l = \exp(e_j - e_l)$). With gaps of tens one weight is ≈ 1 and $\partial\alpha_j/\partial e_j = \alpha_j(1-\alpha_j) \approx 0$.
- Dividing by $\sqrt{d_k}$ (the standard deviation) restores variance 1. Dividing by $d_k$ would flatten the weights.
- The independence assumption is a heuristic. The model can still learn sharper attention.

### S19 positional encoding
- Hand $i$ turns $\omega_i$ radians per position, a full turn every $\lambda_i = 2\pi/\omega_i$ positions: from 6.3 ($i = 0$) to ≈ 60,611 ($i = 255$).
- Fast hands separate nearby positions, slow hands far ones. In the heatmap each row is one $PE_{pos}$ and each column one frequency.
- A shift by $k$ rotates each (sin, cos) pair by $\omega_i k$, so $PE_{pos+k}$ is linear in $PE_{pos}$. $PE_p \cdot PE_q = \sum_i \cos(\omega_i(p-q))$ depends only on the distance. RoPE later applies this rotation to $q$ and $k$ directly.

### S24 Table 1
- Each row is one layer mapping $n$ vectors of size $d$ to $n$ vectors.
- **Recurrent** is a plain RNN/LSTM layer without attention: $n$ sequential steps, each a $d \times d$ matrix-vector product, so $O(nd^2)$, with $O(n)$ sequential steps and an $O(n)$ path.
- **Self-attention:** $QK^\top$ and $AV$ are $n^2$ dot products of length $d$, so $O(n^2 d)$, computed in parallel with an $O(1)$ path.
- The $W^Q, W^K, W^V, W^O$ projections add $O(nd^2)$ to a real layer but are not in the table. The paper's convolutional and restricted-attention rows are omitted.

### S28–S29 parsing
- **Semi-supervised data** (Vinyals & Kaiser et al. 2015):
  - ≈11M web-news sentences where BerkeleyParser and ZPar agree, re-sampled to WSJ lengths.
  - ≈7M parsed by BerkeleyParser alone.
  - The Transformer paper reports the combination as "approximately 17M". Neither paper explains the gap to 18M, so the slide shows only 17M.
- **F1:** each tree is a set of labelled spans (label, first word, last word). Precision = matched / predicted, recall = matched / gold, F1 = $2PR/(P+R)$, summed over the test set.
  - Example: gold `(S (NP the cat) (VP sat (PP on (NP the mat))))` vs predicted `(S (NP the cat) (VP sat) (PP on (NP the mat)))`.
  - 4 of 5 spans match (VP 3–3 ≠ VP 3–6), so F1 = 0.80.
- **Comparisons:** Table 4 values come from each paper, not a re-run. Only the WSJ-only rows share training data, so that comparison is the cleaner one. +3 F1 removes about a quarter of the errors (11.7 % → 8.7 %).

### S33 ablations
- Near-tie means $|\Delta \text{BLEU}| \le 0.5$ vs base 25.8 (inclusive). That gives 13 of 19 rows.
- Clearly larger effects: $h=1$ (−0.9), $d_k=16$ (−0.7), $N=2$ (−2.1), $d_{model}=256$ (−1.3), dropout 0 (−1.2), big (+0.6).
- All sizes train for the same 100K steps. Only the heads block keeps compute fixed ($h \cdot d_k = 512$).
- Label smoothing 0: PPL improves (4.67) while BLEU drops (25.3).
- "big" changes four settings and trains 3× longer, so its +0.6 can't be attributed to one change.

## Decisions to keep

These were each discussed and settled. Change them only with a new argument.

- S8 follows Bahdanau. Luong's version is Q&A material.
- S12 doesn't claim a token matches itself best.
- S15 says "similar cost" (the paper's wording). Head **outputs** are concatenated, not attention maps.
- S19: each $\omega_i$ fills a sin/cos pair (dims $2i$, $2i+1$). $\lambda$ is a wavelength in positions.
- S21 comes before S22: inference first, then masking as the training mechanism.
- Masked cells show −∞ in score matrices and 0 in weight matrices.
- The encoder output has no letter ($Z$ is $AV$). The final decoder vector is $o_i$.
- The parsing model is trained from scratch, and only hyperparameters are reused.
- Table 2's Transformer cost spans both language pairs.
- S30 and S31 conclusions say "paper's reading", since S33 shows the effects are small or confounded.
- PPL is per word-piece, defined once on S25.
- Slides state only what the paper or the cited sources support.

## Sources

1. Vaswani et al. (2017). Attention Is All You Need. NeurIPS.
2. Hochreiter & Schmidhuber (1997). Long Short-Term Memory. Neural Computation.
3. Williams & Zipser (1989). A Learning Algorithm for Continually Running Fully Recurrent Neural Networks. Neural Computation.
4. Sutskever, Vinyals & Le (2014). Sequence to Sequence Learning with Neural Networks. NeurIPS.
5. Cho et al. (2014). Learning Phrase Representations using RNN Encoder–Decoder for Statistical Machine Translation. EMNLP.
6. Bahdanau, Cho & Bengio (2015). Neural Machine Translation by Jointly Learning to Align and Translate. ICLR.
7. Luong, Pham & Manning (2015). Effective Approaches to Attention-based Neural Machine Translation. EMNLP.
8. He et al. (2016). Deep Residual Learning for Image Recognition. CVPR.
9. Ba, Kiros & Hinton (2016). Layer Normalization. arXiv.
10. Vinyals, Kaiser et al. (2015). Grammar as a Foreign Language. NeurIPS.
11. Michel, Levy & Neubig (2019). Are Sixteen Heads Really Better than One? NeurIPS.
12. Radford et al. (2018). Improving Language Understanding by Generative Pre-Training. OpenAI.
13. Devlin et al. (2019). BERT. NAACL.
14. Dosovitskiy et al. (2021). An Image is Worth 16x16 Words (ViT). ICLR.
15. Radford et al. (2023). Robust Speech Recognition via Large-Scale Weak Supervision (Whisper). ICML.
16. Hollmann et al. (2023). TabPFN. ICLR.
17. Ansari et al. (2024). Chronos: Learning the Language of Time Series. TMLR.
18. Peebles & Xie (2023). Scalable Diffusion Models with Transformers (DiT). ICCV.
19. Esser et al. (2024). Scaling Rectified Flow Transformers for High-Resolution Image Synthesis (Stable Diffusion 3). ICML.
20. OpenAI (2024). Video Generation Models as World Simulators (Sora).
21. Anthropic (2023). Introducing Claude.
22. Gemini Team, Google (2023). Gemini: A Family of Highly Capable Multimodal Models. arXiv.
