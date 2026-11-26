// Builds src/ into one self-contained docs/index.html for GitHub Pages.
// Usage: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'docs');

const CSS = ['tokens.css', 'base.css', 'components.css', 'viz.css'];

const PAGES = [
  'home', 'basics', 'linked-lists', 'stacks-queues', 'trees', 'graphs',
  'answers', 'scenarios', 'revise',
];

const JS = [
  'core/util.js', 'core/site.js', 'core/store.js', 'core/scene.js', 'core/highlight.js',
  'algo/infix.js', 'algo/linkedlist.js', 'algo/cqueue.js', 'algo/bst.js', 'algo/avl.js',
  'algo/btree.js', 'algo/hashing.js', 'algo/treebuild.js', 'algo/graph.js',
  'core/stepper.js', 'core/quiz.js', 'core/flashcards.js',
  'viz/draw.js', 'viz/figures.js', 'viz/basics-viz.js', 'viz/linkedlist-viz.js',
  'viz/stackqueue-viz.js', 'viz/expr-viz.js', 'viz/tree-viz.js', 'viz/btree-viz.js',
  'viz/hash-viz.js', 'viz/graph-viz.js',
  'data/quizzes.js', 'data/flashcards.js', 'data/scenarios.js',
  'core/ui.js', 'core/router.js', 'core/main.js',
];

const read = (p) => readFileSync(join(SRC, p), 'utf8');
const errors = [];

let html = read('index.template.html');
const css = CSS.map((f) => `/* ---- ${f} ---- */\n${read('css/' + f)}`).join('\n');
const pages = PAGES.map((p) => `<!-- ===== page: ${p} ===== -->\n${read('pages/' + p + '.html')}`).join('\n');
const js = JS.map((f) => `/* ---- ${f} ---- */\n${read('js/' + f)}\n;`).join('\n');

if (/<\/script/i.test(js)) errors.push('A JS file contains "</script" which would end the inline script early.');
if (/<\/style/i.test(css)) errors.push('A CSS file contains "</style".');

html = html
  .replace('<!-- @css -->', () => `<style>\n${css}\n</style>`)
  .replace('<!-- @pages -->', () => pages)
  .replace('<!-- @js -->', () => `<script>\n${js}\n</script>`);

const leftover = html.match(/<!-- @[a-z]+ -->/g);
if (leftover) errors.push('Unresolved include markers: ' + leftover.join(', '));

// Strip code blocks (raw C inside <script type="text/plain">) before scanning ids and links.
const scan = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');

// Duplicate ids.
const ids = new Map();
for (const m of scan.matchAll(/\sid="([^"]+)"/g)) ids.set(m[1], (ids.get(m[1]) || 0) + 1);
const dups = [...ids].filter(([, n]) => n > 1).map(([id]) => id);
if (dups.length) errors.push('Duplicate ids: ' + dups.join(', '));

// Every internal #link must point at an id that exists.
const missing = new Set();
for (const m of scan.matchAll(/href="#([^"]*)"/g)) {
  const id = m[1];
  if (id && !ids.has(id)) missing.add(id);
}
for (const m of scan.matchAll(/data-answer-ref="([^"]+)"/g)) {
  for (const ref of m[1].trim().split(/\s+/)) if (!ids.has(ref)) missing.add(ref + ' (answer-ref)');
}
if (missing.size) errors.push('Links to missing ids: ' + [...missing].join(', '));

// Balance check for the most common container tags inside the page content.
for (const tag of ['section', 'article', 'div', 'details', 'table', 'ul', 'ol']) {
  const open = (scan.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
  const close = (scan.match(new RegExp(`</${tag}>`, 'g')) || []).length;
  if (open !== close) errors.push(`Unbalanced <${tag}>: ${open} open vs ${close} close`);
}

if (errors.length) {
  console.error('Build failed:\n - ' + errors.join('\n - '));
  process.exit(1);
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'index.html'), html);
writeFileSync(join(OUT, '.nojekyll'), '');
console.log(`Built docs/index.html (${(html.length / 1024).toFixed(0)} KB), ${ids.size} ids, ${PAGES.length} pages.`);
