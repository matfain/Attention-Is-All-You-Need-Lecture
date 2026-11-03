// Bundles the deck into ONE self-contained offline file: dist/lecture.html.
// - CSS, JS, data and fonts (base64 woff2) are inlined.
// - tex`...` / texd`...` in any JS source are pre-rendered with KaTeX here,
//   so the runtime needs only KaTeX's CSS + fonts, not its JS.
const fs = require('fs');
const path = require('path');
const katex = require('katex');

const root = path.join(__dirname, '..');
const rd = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const CSS = ['src/styles/tokens.css', 'src/styles/base.css', 'src/styles/components.css', 'src/styles/slides.css', 'src/styles/part2.css', 'src/styles/part3.css', 'src/styles/part4.css'];
const COMPONENTS = [
  'util.js', 'tokenChip.js', 'attentionLines.js', 'vectorBar.js', 'weightBars.js',
  'matrix.js', 'table.js', 'controls.js', 'architectureMap.js',
].map((f) => 'src/components/' + f);
const ENGINE = ['src/engine/deck.js'];
const SLIDES = JSON.parse(rd('src/slides/manifest.json')).map((f) => 'src/slides/' + f);

// ---- KaTeX pre-rendering -------------------------------------------------
let mathCount = 0;
function prerenderTex(src, file) {
  return src.replace(/\btex(d?)`([^`]*)`/g, (_, d, body) => {
    if (body.includes('${')) throw new Error(`${file}: interpolation inside tex\`\` is not allowed`);
    mathCount++;
    const html = katex.renderToString(body, { displayMode: d === 'd', throwOnError: true, output: 'html', strict: 'ignore' });
    return JSON.stringify(html);
  });
}

// ---- fonts -----------------------------------------------------------------
const b64 = (file) => fs.readFileSync(file).toString('base64');
const fontsCss = rd('assets/fonts/fonts.css').replace(/url\(([^)]+\.woff2)\)/g, (_, f) =>
  `url(data:font/woff2;base64,${b64(path.join(root, 'assets/fonts', f))})`);

const katexDir = path.join(root, 'node_modules/katex/dist');
const katexCss = fs.readFileSync(path.join(katexDir, 'katex.min.css'), 'utf8').replace(
  /src:url\(fonts\/([^)]+\.woff2)\) format\("woff2"\)[^;}]*/g,
  (_, f) => `src:url(data:font/woff2;base64,${b64(path.join(katexDir, 'fonts', f))}) format("woff2")`);
if (/url\(fonts\//.test(katexCss)) throw new Error('KaTeX CSS still references external fonts');
// "Deck Digits": KaTeX_Main for the digits 0–9 only, placed before Atkinson in --font-text, so
// running text uses the same unslashed digits as the charts and matrices
const digitsCss = [['normal', 400, 'Regular'], ['normal', 700, 'Bold'], ['italic', 400, 'Regular'], ['italic', 700, 'Bold']] // upright digits in italic text too
  .map(([style, weight, f]) => `@font-face{font-family:'Deck Digits';font-style:${style};font-weight:${weight};unicode-range:U+0030-0039;` +
    `src:url(data:font/woff2;base64,${b64(path.join(katexDir, 'fonts', `KaTeX_Main-${f}.woff2`))}) format("woff2")}`).join('\n');

// ---- data ------------------------------------------------------------------
const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const data = {};
for (const f of fs.readdirSync(path.join(root, 'src/data')).filter((f) => f.endsWith('.json')).sort()) {
  data[camel(f.replace(/\.json$/, ''))] = JSON.parse(rd('src/data/' + f));
}

// ---- logos (optional) ------------------------------------------------------
// Official brand files dropped into assets/logos/ (e.g. openai.svg, claude.svg, gemini.svg)
// are inlined as data URIs → DATA.logos.<name>; slides fall back to drawn icons without them.
data.logos = {};
const logoDir = path.join(root, 'assets/logos');
if (fs.existsSync(logoDir)) {
  const MIME = { svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp' };
  for (const f of fs.readdirSync(logoDir)) {
    const m = f.match(/^(.+)\.(svg|png|webp)$/i);
    if (m) data.logos[m[1].toLowerCase()] = `data:${MIME[m[2].toLowerCase()]};base64,${b64(path.join(logoDir, f))}`;
  }
}

// ---- assemble ------------------------------------------------------------
const js = [...COMPONENTS, ...ENGINE, ...SLIDES]
  .map((f) => `/* ---- ${f} ---- */\n${prerenderTex(rd(f), f)}`)
  .join('\n');
const css = CSS.map((f) => `/* ---- ${f} ---- */\n${rd(f)}`).join('\n') +
  '\n#stage.no-anim, #stage.no-anim * { transition: none !important; }\n';

const fill = (tpl, key, val) => tpl.split(`/*@${key}@*/`).join(val);
let html = rd('src/index.html');
html = fill(html, 'FONTS', fontsCss + '\n' + digitsCss);
html = fill(html, 'KATEX', katexCss);
html = fill(html, 'CSS', css);
html = fill(html, 'DATA', JSON.stringify(data).replace(/</g, '\\u003c'));
html = fill(html, 'JS', js.replace(/<\/script/gi, '<\\/script'));

if (/(src|href)=["']https?:/i.test(html)) throw new Error('external resource reference found');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist/lecture.html');
fs.writeFileSync(out, html);
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`dist/lecture.html  ${kb} KB  (${SLIDES.length} slide modules, ${mathCount} formulas pre-rendered)`);
