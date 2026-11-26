// Playground kit (shared by every widget) + the Q21 widgets: struct builder, heap simulator, growth race, complexity game.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, esc, icon } = DSA.util;

  const kit = {
    frame(el, o) {
      el.textContent = '';
      const rootEl = h('div.play');
      const head = h('div.play-head', null, h('span.play-tag', null, o.tag || 'Playground'), h('h4', null, o.title));
      if (o.hint) head.append(h('p', { html: o.hint }));
      const inputs = h('div.play-inputs');
      const body = h('div.play-body');
      const foot = h('div.play-foot');
      const msg = h('div.play-msg', { 'aria-live': 'polite' });
      foot.append(msg);
      rootEl.append(head, inputs, body);
      if (o.foot !== false) rootEl.append(foot);
      el.append(rootEl);
      const say = (text, kind) => { msg.className = 'play-msg' + (kind ? ' ' + kind : ''); msg.innerHTML = text; };
      return { root: rootEl, head, inputs, body, foot, msg, say };
    },
    btn(label, onclick, cls, attrs) {
      return h('button.btn.btn-sm' + (cls ? '.' + cls.split(' ').join('.') : ''), Object.assign({ type: 'button', onclick, html: label }, attrs || {}));
    },
    input(o) {
      const id = DSA.util.nextId('in');
      const inp = h('input.input' + (o.cls ? '.' + o.cls.split(' ').join('.') : ''), { id, type: o.type || 'text', value: o.value === undefined ? '' : o.value, placeholder: o.placeholder || '', inputmode: o.inputmode, 'aria-label': o.label, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', size: o.size });
      if (o.onenter) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); o.onenter(); } });
      if (o.label && o.showLabel) return { el: h('label.field', { for: id }, o.label, inp), input: inp };
      return { el: inp, input: inp };
    },
    select(options, value, onchange, label) {
      const sel = h('select.select', { 'aria-label': label || 'Choose', id: DSA.util.nextId('sel') });
      for (const [v, t] of options) sel.append(h('option', { value: v, selected: String(v) === String(value) ? true : null }, t));
      sel.addEventListener('change', () => onchange(sel.value));
      return sel;
    },
    seg(options, value, onchange, label) {
      const el = h('div.seg', { role: 'group', 'aria-label': label || 'Mode' });
      const bs = options.map(([v, t]) => {
        const b = h('button', { type: 'button', 'aria-pressed': String(v === value) }, t);
        b.addEventListener('click', () => { el.set(v); onchange(v); });
        el.append(b);
        return [v, b];
      });
      el.set = (v) => bs.forEach(([k, b]) => b.setAttribute('aria-pressed', String(k === v)));
      return el;
    },
    algoPanel(title) {
      const box = h('div.algo');
      const head = h('div.algo-head', null, h('span', null, title || 'Algorithm in plain English'));
      const ol = h('ol');
      box.append(head, ol);
      box.setLines = (lines) => { ol.textContent = ''; lines.forEach((l) => ol.append(h('li', { html: l }))); };
      box.setActive = (i) => [...ol.children].forEach((li, k) => li.classList.toggle('is-active', k === i));
      box.setTitle = (t) => (head.firstChild.textContent = t);
      return box;
    },
    tokens(arr, clsFn) {
      const box = h('div.tokens');
      if (!arr.length) box.append(h('span.tok.empty', null, 'empty'));
      arr.forEach((t, i) => box.append(h('span.tok' + (clsFn ? clsFn(t, i) : ''), null, String(t))));
      return box;
    },
    panel(title, content) { return h('div.panel', null, h('span.panel-t', null, title), content); },
  };
  DSA.kit = kit;
  DSA.viz = DSA.viz || {};

  /* ---------- Struct builder ---------- */
  const TYPES = [
    ['int', 4, '#2650e0'], ['char', 1, '#e8457a'], ['float', 4, '#19a97a'], ['double', 8, '#b9730a'],
    ['char[10]', 10, '#8a4fd8'], ['char[20]', 20, '#8a4fd8'], ['long', 8, '#0e8fb3'],
  ];
  DSA.viz['struct-builder'] = function (el) {
    const f = kit.frame(el, { title: 'Build a structure and see its memory', hint: 'Add members to <code>struct student</code>. Each box is 1 byte. Switch to <b>union</b> to see why a union only takes the size of its biggest member.' });
    let members = [['int', 'roll'], ['char[20]', 'name'], ['float', 'marks']];
    let kind = 'struct';
    const typeSel = kit.select(TYPES.map((t) => [t[0], t[0]]), 'int', () => {}, 'Member type');
    const nameIn = kit.input({ value: 'age', label: 'Member name', size: 8, onenter: () => add() });
    const add = () => {
      const nm = (nameIn.input.value || 'x').replace(/[^A-Za-z_0-9]/g, '').slice(0, 12) || 'x';
      if (members.length >= 6) { f.say('Six members is plenty for practice. Remove one first.', 'bad'); return; }
      members.push([typeSel.value, nm]); draw();
    };
    const segK = kit.seg([['struct', 'struct'], ['union', 'union']], kind, (v) => { kind = v; draw(); }, 'struct or union');
    f.inputs.append(segK, typeSel, nameIn.el, kit.btn('Add member', add, 'btn-primary'), kit.btn('Remove last', () => { members.pop(); draw(); }), kit.btn('Reset', () => { members = [['int', 'roll'], ['char[20]', 'name'], ['float', 'marks']]; draw(); }));
    const codeBox = h('div', { style: 'padding:14px 16px 0' });
    const mem = h('div.struct-mem');
    const legend = h('div.mem-legend');
    f.body.append(codeBox, mem, legend);
    function draw() {
      const info = members.map(([t, n]) => { const T = TYPES.find((x) => x[0] === t); return { t, n, size: T[1], color: T[2] }; });
      const code = `${kind} student {\n` + info.map((m) => `    ${m.t.replace(/\[(\d+)\]/, '')} ${m.n}${(m.t.match(/\[\d+\]/) || [''])[0]};   // ${m.size} byte${m.size > 1 ? 's' : ''}`).join('\n') + '\n};';
      codeBox.textContent = '';
      codeBox.append(DSA.code.build(code, { lang: 'c', title: 'Declaration', compact: true }));
      mem.textContent = '';
      legend.textContent = '';
      const total = kind === 'struct' ? info.reduce((s, m) => s + m.size, 0) : Math.max(0, ...info.map((m) => m.size));
      if (kind === 'struct') {
        info.forEach((m) => { for (let i = 0; i < m.size; i++) mem.append(h('span.byte', { style: `background:${m.color}33;border-color:${m.color}`, title: m.n }, i === 0 ? m.n.slice(0, 3) : '')); });
      } else {
        for (let i = 0; i < total; i++) {
          const users = info.filter((m) => m.size > i);
          mem.append(h('span.byte', { style: `background:${users[users.length - 1] ? users[0].color : '#888'}33;border-color:${users[0] ? users[0].color : '#888'}`, title: users.map((u) => u.n).join(', ') }, i === 0 ? 'all' : ''));
        }
      }
      info.forEach((m) => legend.append(h('span', null, h('i', { style: `background:${m.color}` }), `${m.n} (${m.t}) = ${m.size} B`)));
      f.say(kind === 'struct'
        ? `sizeof(struct student) = ${info.map((m) => m.size).join(' + ') || 0} = <b>${total} bytes</b>. Every member gets its own space, so all of them can hold values at the same time. (Real compilers may add a few "padding" bytes for alignment.)`
        : `sizeof(union student) = biggest member = <b>${total} bytes</b>. All members share the same memory, so only one of them holds a valid value at a time.`);
    }
    draw();
  };

  /* ---------- Heap simulator ---------- */
  DSA.viz['heap-sim'] = function (el) {
    const f = kit.frame(el, { title: 'malloc and free: watch the heap', hint: 'Each square is a block of heap memory. Ask for memory with <b>malloc</b>, give it back with <b>free</b>. Try making a <b>memory leak</b> (allocate again without freeing) and a <b>dangling pointer</b> (free, then keep using it).' });
    const CELLS = 32;
    const COLORS = { p: '#2650e0', q: '#19a97a', r: '#e8457a' };
    let cells, vars, blocks, nextB;
    const reset = () => { cells = new Array(CELLS).fill(null); vars = { p: null, q: null, r: null }; blocks = {}; nextB = 1; draw(); f.say('Heap is empty. Pick a pointer and allocate some ints.'); };
    const varSel = kit.select([['p', 'p'], ['q', 'q'], ['r', 'r']], 'p', () => {}, 'Pointer variable');
    const nSel = kit.select([[2, '2 ints'], [3, '3 ints'], [4, '4 ints'], [6, '6 ints']], 3, () => {}, 'How many ints');
    function alloc(fn) {
      const v = varSel.value, n = Number(nSel.value);
      let start = -1;
      for (let i = 0; i + n <= CELLS; i++) if (cells.slice(i, i + n).every((c) => c === null)) { start = i; break; }
      if (start === -1) { f.say(`malloc returned NULL: not enough free memory for ${n} ints. Always check for NULL!`, 'bad'); return; }
      const leaked = vars[v] && blocks[vars[v].b] && !blocks[vars[v].b].freed ? vars[v].b : null;
      const b = nextB++;
      blocks[b] = { start, n, owner: v, freed: false, leak: false, fn };
      for (let i = start; i < start + n; i++) cells[i] = b;
      if (leaked) {
        blocks[leaked].leak = true;
        f.say(`<b>Memory leak!</b> ${v} now points to the new block, so nobody points to the old block any more. It can never be freed. Always free(${v}) before reusing ${v}.`, 'bad');
      } else {
        f.say(`${v} = (int *) ${fn}(${fn === 'calloc' ? n + ', sizeof(int)' : n + ' * sizeof(int)'}); → ${n * 4} bytes reserved. ${fn === 'calloc' ? 'calloc fills them with 0.' : 'malloc leaves them with garbage values.'}`, 'ok');
      }
      vars[v] = { b, dangling: false };
      draw();
    }
    function free() {
      const v = varSel.value;
      const p = vars[v];
      if (!p) { f.say(`${v} is NULL. free(NULL) does nothing, which is safe.`); return; }
      if (p.dangling) { f.say(`<b>Double free!</b> ${v} was already freed. Freeing twice crashes programs. Set ${v} = NULL after free.`, 'bad'); return; }
      const bl = blocks[p.b];
      bl.freed = true;
      for (let i = bl.start; i < bl.start + bl.n; i++) cells[i] = null;
      p.dangling = true;
      f.say(`free(${v}): the memory goes back to the heap. But ${v} still holds the old address, so it is now a <b>dangling pointer</b>. Do ${v} = NULL next.`, 'bad');
      draw();
    }
    function nullify() {
      const v = varSel.value;
      if (vars[v] && !vars[v].dangling && blocks[vars[v].b] && !blocks[vars[v].b].freed) {
        blocks[vars[v].b].leak = true;
        f.say(`<b>Memory leak!</b> ${v} = NULL while its block was still allocated. The block is lost forever (until the program ends).`, 'bad');
      } else f.say(`${v} = NULL. Safe: it no longer points at freed memory.`, 'ok');
      vars[v] = null;
      draw();
    }
    f.inputs.append(varSel, nSel, kit.btn('malloc', () => alloc('malloc'), 'btn-primary'), kit.btn('calloc', () => alloc('calloc')), kit.btn('free', free), kit.btn('= NULL', nullify), kit.btn('Reset', reset));
    const grid = h('div.mem-grid');
    const varsEl = h('div.mem-vars');
    f.body.append(grid, varsEl);
    function draw() {
      grid.textContent = '';
      cells.forEach((c, i) => {
        const bl = c ? blocks[c] : null;
        const col = bl ? COLORS[bl.owner] : null;
        const leakCls = bl && bl.leak ? '.leak' : '';
        grid.append(h('span.mem-cell' + (bl ? '.used' : '') + leakCls, { style: col && !bl.leak ? `background:${col}26;border-color:${col}` : null, title: 'address ' + (1000 + i * 4) }, bl ? (bl.fn === 'calloc' ? '0' : '?') : ''));
      });
      varsEl.textContent = '';
      for (const v of ['p', 'q', 'r']) {
        const p = vars[v];
        const txt = !p ? `${v} = NULL` : p.dangling ? `${v} → freed memory!` : `${v} → address ${1000 + blocks[p.b].start * 4}`;
        varsEl.append(h('span.mem-var' + (p && p.dangling ? '.dangling' : ''), { style: !p || p.dangling ? null : `border-color:${COLORS[v]}` }, txt));
      }
      const leaks = Object.values(blocks).filter((b) => b.leak && !b.freed).length;
      if (leaks) varsEl.append(h('span.pill.bad', null, `${leaks} leaked block${leaks > 1 ? 's' : ''}`));
    }
    reset();
  };

  /* ---------- Growth race ---------- */
  DSA.viz.growth = function (el) {
    const f = kit.frame(el, { title: 'How fast do the steps grow?', hint: 'Drag n (the input size). Each bar is the number of steps an algorithm of that order needs. Bars are on a log scale, otherwise O(2ⁿ) would be off the screen.' });
    const id = DSA.util.nextId('rng');
    const range = h('input', { type: 'range', min: 1, max: 60, value: 16, id, style: 'flex:1 1 200px;min-width:0', 'aria-label': 'Input size n' });
    const nOut = h('b.tnum', null, '16');
    f.inputs.append(h('label.field', { for: id }, 'n ='), nOut, range);
    const rowsBox = h('div.growth');
    f.body.append(rowsBox);
    const FNS = [
      ['O(1)', () => 1, '#19a97a', 'constant'], ['O(log n)', (n) => Math.max(1, Math.log2(n)), '#0e8fb3', 'logarithmic'],
      ['O(n)', (n) => n, '#2650e0', 'linear'], ['O(n log n)', (n) => n * Math.max(1, Math.log2(n)), '#8a4fd8', 'n log n'],
      ['O(n²)', (n) => n * n, '#b9730a', 'quadratic'], ['O(2ⁿ)', (n) => Math.pow(2, n), '#e0484f', 'exponential'],
    ];
    const fmt = (v) => (v < 1e6 ? Math.round(v).toLocaleString() : v.toExponential(1).replace('e+', '×10^'));
    function draw() {
      const n = Number(range.value);
      nOut.textContent = String(n);
      rowsBox.textContent = '';
      const maxLog = Math.log10(Math.pow(2, 60));
      for (const [name, fn, col, word] of FNS) {
        const v = fn(n);
        const w = Math.max(0.6, (Math.log10(v + 1) / maxLog) * 100);
        rowsBox.append(h('div.g-row', null, h('span.g-name', null, name), h('div.g-track', null, h('div.g-bar', { style: `width:${w}%;background:${col}` })), h('span.g-val', { title: word }, fmt(v))));
      }
      const secs = Math.pow(2, n) / 1e9;
      f.say(`With n = ${n}, an O(n²) algorithm does ${fmt(n * n)} steps, but O(2ⁿ) does ${fmt(Math.pow(2, n))}. At a billion steps per second that is ${secs < 1 ? 'under a second' : secs < 3600 ? Math.round(secs) + ' seconds' : secs < 86400 * 365 ? Math.round(secs / 3600) + ' hours' : Math.round(secs / (86400 * 365)) + ' years'}.`);
    }
    range.addEventListener('input', draw);
    draw();
  };

  /* ---------- Complexity game ---------- */
  const SNIPS = [
    { code: 'x = a + b\nprint x', a: 0, why: 'A fixed number of steps no matter what n is → constant time.' },
    { code: 'for i = 1 to n:\n    print i', a: 2, why: 'The loop body runs n times → O(n).' },
    { code: 'for i = 1 to n:\n    for j = 1 to n:\n        print i, j', a: 4, why: 'n times inside n times = n × n = n² steps.' },
    { code: 'i = 1\nwhile i < n:\n    i = i * 2', a: 1, why: 'i doubles each time: 1, 2, 4, 8 … it reaches n after about log₂ n steps.' },
    { code: 'i = n\nwhile i > 1:\n    i = i / 2', a: 1, why: 'Halving n again and again takes log₂ n steps (this is how binary search works).' },
    { code: 'for i = 1 to n:\n    j = 1\n    while j < n:\n        j = j * 2', a: 3, why: 'An O(log n) loop inside an O(n) loop → O(n log n).' },
    { code: 'for i = 1 to n:\n    print i\nfor j = 1 to n:\n    print j', a: 2, why: 'Two loops one after another: n + n = 2n. Drop the constant → O(n).' },
    { code: 'for i = 1 to 100:\n    print i', a: 0, why: '100 is a fixed number, it does not depend on n → O(1).' },
    { code: 'for i = 1 to n:\n    for j = 1 to i:\n        print j', a: 4, why: '1 + 2 + … + n = n(n+1)/2 steps. The biggest term is n²/2 → O(n²).' },
    { code: 'search for key in an array of n items,\nchecking one item at a time', a: 2, why: 'Linear search may look at all n items in the worst case → O(n).' },
  ];
  const CHOICES = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];
  DSA.viz['cx-game'] = function (el) {
    const f = kit.frame(el, { title: 'Guess the time complexity', hint: 'Plain pseudocode, no programming needed. Count how many times the innermost line runs when the input has size n.', tag: 'Mini game' });
    let i = 0, score = 0, done = 0;
    const box = h('div', { style: 'padding:14px 16px;display:flex;flex-direction:column;gap:12px' });
    f.body.append(box);
    function show() {
      const s = SNIPS[i];
      box.textContent = '';
      box.append(h('div.small.muted.tnum', null, `Snippet ${i + 1} of ${SNIPS.length} · score ${score}/${done}`));
      box.append(DSA.code.build(s.code, { lang: 'python', title: 'Pseudocode', compact: true }));
      const opts = h('div.scn-opts');
      CHOICES.forEach((c, k) => {
        const b = h('button.opt', { type: 'button' }, c);
        b.addEventListener('click', () => {
          if (opts.dataset.done) return;
          opts.dataset.done = '1'; done++;
          const ok = k === s.a;
          if (ok) { score++; DSA.store.awardOnce('cx:' + i, 5, 'Complexity spotted'); }
          [...opts.children].forEach((bb, kk) => { bb.disabled = true; if (kk === s.a) bb.classList.add('is-right'); });
          if (!ok) b.classList.add('is-wrong');
          f.say(`<b>${ok ? 'Correct!' : 'Answer: ' + CHOICES[s.a] + '.'}</b> ${s.why}`, ok ? 'ok' : 'bad');
        });
        opts.append(b);
      });
      box.append(opts, h('div.btn-row', null, kit.btn(i < SNIPS.length - 1 ? 'Next snippet' + icon('next') : 'Start again' + icon('reset'), () => { i = (i + 1) % SNIPS.length; if (i === 0) { score = 0; done = 0; } f.say(''); show(); }, 'btn-ink')));
    }
    show();
  };
})(typeof window !== 'undefined' ? window : globalThis);
