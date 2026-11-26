// Tiny highlighter for C, Java and Python, plus code blocks.
// A line may end with "//? note" or "#? note" for a tap-to-explain note.
// Optional code lives in <div class="code-tabs"> holding one <script type="text/plain" data-lang="c|java|python"> per language.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, esc } = DSA.util;

  const LANGS = {
    c: {
      name: 'C',
      kw: 'if else while for do return break continue switch case default goto sizeof typedef struct union enum static const extern register volatile auto',
      types: 'int char float double void long short unsigned signed bool FILE size_t NULL true false',
      comment: '//',
      pre: true,
    },
    java: {
      name: 'Java',
      kw: 'if else while for do return break continue switch case default new class public private protected static final void this super extends implements import package try catch finally throw throws interface instanceof',
      types: 'int char float double long short boolean byte String Integer Object null true false var',
      comment: '//',
    },
    python: {
      name: 'Python',
      kw: 'if elif else while for in return break continue def class import from as pass not and or is lambda try except finally raise with yield global None True False del',
      types: 'int str float list dict set tuple len range print self object',
      comment: '#',
    },
  };
  for (const k in LANGS) { LANGS[k].kwSet = new Set(LANGS[k].kw.split(' ')); LANGS[k].typeSet = new Set(LANGS[k].types.split(' ')); }

  function highlightLine(line, lang) {
    const L = LANGS[lang] || LANGS.c;
    let out = '';
    let i = 0;
    const n = line.length;
    if (L.pre && /^\s*#/.test(line)) return `<span class="tok-pre">${esc(line)}</span>`;
    while (i < n) {
      const c = line[i];
      if (line.startsWith(L.comment, i)) { out += `<span class="tok-com">${esc(line.slice(i))}</span>`; break; }
      if (L.comment === '//' && c === '/' && line[i + 1] === '*') {
        const end = line.indexOf('*/', i + 2);
        const j = end === -1 ? n : end + 2;
        out += `<span class="tok-com">${esc(line.slice(i, j))}</span>`; i = j; continue;
      }
      if (c === '"' || c === "'") {
        let j = i + 1;
        while (j < n && line[j] !== c) { if (line[j] === '\\') j++; j++; }
        out += `<span class="tok-str">${esc(line.slice(i, j + 1))}</span>`; i = j + 1; continue;
      }
      if (/[0-9]/.test(c) && !/[\w]/.test(line[i - 1] || '')) {
        let j = i;
        while (j < n && /[0-9.xa-fA-F]/.test(line[j])) j++;
        out += `<span class="tok-num">${esc(line.slice(i, j))}</span>`; i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i;
        while (j < n && /\w/.test(line[j])) j++;
        const w = line.slice(i, j);
        let k = j; while (k < n && line[k] === ' ') k++;
        if (L.kwSet.has(w)) out += `<span class="tok-kw">${w}</span>`;
        else if (L.typeSet.has(w)) out += `<span class="tok-type">${w}</span>`;
        else if (line[k] === '(') out += `<span class="tok-fn">${w}</span>`;
        else out += esc(w);
        i = j; continue;
      }
      out += esc(c); i++;
    }
    return out;
  }

  function splitNotes(src) {
    const lines = src.replace(/^\n+|\s+$/g, '').split('\n');
    const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    return lines.map((l) => {
      l = l.slice(ind === Infinity ? 0 : ind);
      let k = l.indexOf('//?');
      if (k === -1) k = l.indexOf('#?');
      if (k === -1) return { code: l.replace(/\s+$/, ''), note: null };
      const mark = l.startsWith('//?', k) ? 3 : 2;
      return { code: l.slice(0, k).replace(/\s+$/, ''), note: l.slice(k + mark).trim() };
    });
  }

  function build(src, opts) {
    opts = opts || {};
    const lang = opts.lang || 'c';
    const rows = splitNotes(src);
    const hasNotes = rows.some((r) => r.note);
    const fig = h('figure.code' + (opts.compact ? '.compact' : ''));
    const head = h('div.code-head', null, h('b', null, opts.title || (LANGS[lang] ? LANGS[lang].name : 'Code')));
    if (hasNotes) head.append(h('span.hint', null, 'Tap a dotted line'));
    const pre = h('pre');
    const copy = h('button', { type: 'button', 'aria-label': 'Copy the code' }, 'Copy');
    copy.addEventListener('click', () => {
      const text = rows.map((r) => r.code).join('\n');
      const done = () => { copy.textContent = 'Copied'; setTimeout(() => (copy.textContent = 'Copy'), 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => selectAll(pre));
      else selectAll(pre);
    });
    head.append(copy);
    const code = h('code');
    const lineEls = rows.map((r, i) => {
      const el = h('span.ln' + (r.note ? '.has-note' : ''), { 'data-n': i + 1, html: highlightLine(r.code, lang) || ' ' });
      if (r.note) { el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', `Line ${i + 1}: explain`); }
      code.appendChild(el);
      code.appendChild(document.createTextNode('\n'));
      return el;
    });
    pre.append(code);
    fig.append(head, pre);
    const panel = h('div.note-panel', { hidden: true, 'aria-live': 'polite' });
    fig.append(panel);
    let open = -1;
    function show(i) {
      lineEls.forEach((el) => el.classList.remove('is-open'));
      if (i === open) { open = -1; panel.hidden = true; return; }
      open = i;
      lineEls[i].classList.add('is-open');
      panel.innerHTML = `<b>Line ${i + 1}</b> &nbsp;${rows[i].note}`;
      panel.hidden = false;
    }
    lineEls.forEach((el, i) => {
      if (!rows[i].note) return;
      el.addEventListener('click', () => show(i));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } });
    });
    return fig;
  }

  function selectAll(el) {
    const r = document.createRange();
    r.selectNodeContents(el);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  const langListeners = new Set();
  const getLang = () => (DSA.store && DSA.store.get().lang) || 'c';
  function setLang(l) {
    if (DSA.store) DSA.store.setLang(l);
    langListeners.forEach((fn) => fn(l));
  }

  // <div class="code-tabs" data-title="..."> with one script per language → closed dropdown with a language switch.
  function buildTabs(holder) {
    const title = holder.getAttribute('data-title') || 'Code';
    const open = holder.hasAttribute('data-open');
    const srcs = {};
    for (const sc of holder.querySelectorAll('script[type="text/plain"]')) srcs[sc.getAttribute('data-lang') || 'c'] = sc.textContent;
    const langs = ['c', 'java', 'python'].filter((l) => srcs[l]);
    const det = h('details.more.code-drop', open ? { open: true } : null);
    const sum = h('summary', null,
      h('span.cd-ico', { html: DSA.util.icon('basics') }),
      h('span.cd-title', null, h('b', null, title), h('small', null, open ? 'Code' : 'Optional · for "write a program" questions')));
    const body = h('div.more-body');
    const seg = h('div.seg', { role: 'group', 'aria-label': 'Programming language' });
    const slot = h('div');
    const btns = langs.map((l) => {
      const b = h('button', { type: 'button', 'aria-pressed': 'false' }, LANGS[l].name);
      b.addEventListener('click', () => setLang(l));
      seg.append(b);
      return [l, b];
    });
    function render(l) {
      if (!srcs[l]) l = langs[0];
      btns.forEach(([k, b]) => b.setAttribute('aria-pressed', String(k === l)));
      slot.textContent = '';
      slot.append(build(srcs[l], { lang: l, title: `${title} · ${LANGS[l].name}` }));
    }
    langListeners.add(render);
    let built = false;
    det.addEventListener('toggle', () => { if (det.open && !built) { built = true; render(getLang()); } });
    if (open) { built = true; render(getLang()); }
    body.append(h('div.code-drop-bar', null, h('span.small.muted', null, 'Language:'), seg), slot);
    det.append(sum, body);
    holder.replaceWith(det);
  }

  // Upgrade code inside an element: visible snippets (data-code) and optional dropdowns (.code-tabs).
  function upgrade(el) {
    for (const holder of el.querySelectorAll('.code-tabs')) buildTabs(holder);
    for (const sc of el.querySelectorAll('script[type="text/plain"][data-code]')) {
      sc.replaceWith(build(sc.textContent, { title: sc.getAttribute('data-title'), lang: sc.getAttribute('data-code') || 'c' }));
    }
  }

  DSA.code = { build, upgrade, highlightLine, getLang, setLang, LANGS };
})(typeof window !== 'undefined' ? window : globalThis);
