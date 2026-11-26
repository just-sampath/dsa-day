// Static figures and worked-example tables drawn from the tested algorithms.
// <div data-fig="..."> draws a diagram; <div data-trace="..."> draws a step table or a row of snapshots.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, esc, parseList, parseKeys } = DSA.util;

  function staticScene(host, spec, opts) {
    const stage = h('div.stage');
    host.appendChild(stage);
    const sc = new DSA.Scene(stage, Object.assign({ minScale: 0.5, label: opts && opts.label }, opts || {}));
    sc.render(spec, { animate: false, pad: opts && opts.pad });
    return sc;
  }

  function table(headers, rows, opts) {
    opts = opts || {};
    const wrap = h('div.table-wrap');
    const t = h('table.t.trace-table' + (opts.compact ? '.compact' : ''));
    t.append(h('thead', null, h('tr', null, headers.map((x) => h('th', { html: x })))));
    const tb = h('tbody');
    rows.forEach((r) => tb.append(h('tr', r.cls ? { class: r.cls } : null, r.cells.map((c) => (c instanceof Node ? h('td', null, c) : h('td', typeof c === 'object' && c ? { class: c.cls, html: c.html } : { html: c }))))));
    t.append(tb);
    if (opts.caption) t.append(h('caption', { html: opts.caption }));
    wrap.append(t);
    return wrap;
  }

  const stackStr = (arr) => (arr.length ? arr.join(' ') : '<span class="muted">empty</span>');

  const FIG = {
    ll(el) {
      const mode = el.dataset.mode || 'sll';
      const st = DSA.ll.make(mode, parseKeys(el.dataset.vals || '10,20,30'));
      staticScene(el, DSA.draw.llSpec(st), { label: 'Linked list diagram' });
    },
    tree(el) {
      const keys = parseKeys(el.dataset.keys || '');
      const kind = el.dataset.kind || 'bst';
      let tree = kind === 'avl' ? DSA.avl.annotate(DSA.avl.fromSequence(keys).tree) : DSA.bst.fromSequence(keys).tree;
      if (el.dataset.del) for (const k of parseKeys(el.dataset.del)) tree = DSA.bst.deleteTrace(tree, k).tree;
      const spec = DSA.draw.treeSpec(tree, { showBF: el.hasAttribute('data-bf'), hl: parseList(el.dataset.hl || '') });
      staticScene(el, spec, { label: 'Tree diagram' });
    },
    'tree-in': (el) => {
      const inorder = parseList(el.dataset.in);
      const r = el.dataset.pre ? DSA.treebuild.fromInPre(inorder, parseList(el.dataset.pre)) : DSA.treebuild.fromInPost(inorder, parseList(el.dataset.post));
      staticScene(el, DSA.draw.treeSpec(r.tree, {}), { label: 'Constructed tree' });
    },
    btree(el) {
      const r = DSA.btree.fromSequence(parseKeys(el.dataset.keys), Number(el.dataset.order || 3));
      staticScene(el, DSA.draw.btreeSpec(r.T.root), { label: 'B-tree diagram' });
    },
    stack(el) {
      const vals = parseList(el.dataset.vals || '');
      const max = Number(el.dataset.max || 5);
      const box = h('div.stack-box');
      for (let i = 0; i < max; i++) box.append(i < vals.length ? h('div.stack-cell' + (i === vals.length - 1 ? '.is-top' : ''), null, vals[i]) : h('div.stack-cell.ghost', null, `[${i}]`));
      el.append(h('div.sq-wrap', null, h('div.stack-col', null, h('span.top-ptr', null, vals.length ? `top = ${vals.length - 1} → ${vals[vals.length - 1]}` : 'top = −1'), box, h('span.stack-label', null, `stack[0 … ${max - 1}]`))));
    },
    queue(el) {
      const size = Number(el.dataset.size || 5);
      const front = Number(el.dataset.front), rear = Number(el.dataset.rear);
      const vals = parseList(el.dataset.vals || '');
      const row = h('div.arr-row');
      for (let i = 0; i < size; i++) {
        const v = vals[i] && vals[i] !== '_' ? vals[i] : null;
        const tags = [i === front ? 'front' : '', i === rear ? 'rear' : ''].filter(Boolean).join(' · ');
        row.append(h('div.arr-cell', null, h('span.p', null, tags), h('span.v' + (v === null ? '.empty' : i === front ? '.is-front' : i === rear ? '.is-rear' : ''), null, v === null ? '—' : v), h('span.i', null, String(i))));
      }
      el.append(h('div.sq-wrap', null, row));
    },
    graph(el) {
      const g = DSA.graph.PRESETS[el.dataset.graph || 'trav'];
      const o = {};
      if (el.dataset.mst) {
        const r = el.dataset.mst === 'kruskal' ? DSA.graph.kruskal(g) : DSA.graph.prim(g, g.vertices[0]);
        o.edgeCls = {};
        for (const e of g.edges) o.edgeCls[DSA.graph.edgeKey(e.u, e.v)] = 'is-dim';
        r.chosen.forEach((e) => (o.edgeCls[DSA.graph.edgeKey(e.u, e.v)] = 'is-tree'));
      }
      staticScene(el, DSA.draw.graphSpec(g, o), { label: g.name });
    },
  };

  const TRACE = {
    infix(el) {
      const r = DSA.infix.toPostfix(el.dataset.input);
      if (r.error) { el.textContent = r.error; return; }
      const showAct = !el.hasAttribute('data-no-action');
      const rows = r.steps.map((s, i) => ({ cells: [String(i + 1), { cls: 'sym', html: s.sym === 'end' ? '<i>end</i>' : esc(s.sym) }, { cls: 'stk', html: stackStr(s.stack.map(esc)) }, { cls: 'out', html: esc(s.out.join('')) || '<span class="muted">—</span>' }].concat(showAct ? [{ cls: 'act', html: esc(s.action) }] : []) }));
      el.append(table(['#', 'Symbol', 'Stack (bottom → top)', 'Postfix so far'].concat(showAct ? ['What happened'] : []), rows));
      el.append(h('div.trace-final', null, 'Postfix:', h('code', null, r.postfix)));
    },
    prefix(el) {
      const r = DSA.infix.toPrefix(el.dataset.input);
      if (r.error) { el.textContent = r.error; return; }
      el.append(h('ol.steps', null,
        h('li', { html: `Reverse the infix and swap the brackets: <code>${esc(r.reversedInput)}</code>` }),
        h('li', { html: `Convert that to postfix (same rules, but for equal precedence only pop when the incoming operator is <code>^</code>): <code>${esc(r.reversedOutput)}</code>` }),
        h('li', { html: `Reverse the result: <code>${esc(r.prefix)}</code>` })));
      el.append(h('div.trace-final', null, 'Prefix:', h('code', null, r.prefix)));
    },
    'postfix-eval': (el) => {
      const r = DSA.infix.evalPostfix(el.dataset.input);
      const rows = r.steps.map((s, i) => ({ cells: [String(i + 1), { cls: 'sym', html: s.sym === 'end' ? '<i>end</i>' : esc(s.sym) }, { cls: 'stk', html: stackStr(s.stack) }, { cls: 'act', html: esc(s.action) }] }));
      el.append(table(['#', 'Symbol', 'Stack (bottom → top)', 'What happened'], rows));
      el.append(r.error ? h('div.trace-final.bad', null, r.error) : h('div.trace-final', null, 'Result:', h('code', null, r.text)));
    },
    brackets(el) {
      const r = DSA.infix.checkBrackets(el.dataset.input);
      const rows = r.steps.map((s, i) => ({ cls: s.bad ? 'is-now' : '', cells: [String(i + 1), { cls: 'sym', html: s.sym === 'end' ? '<i>end</i>' : esc(s.sym) }, { cls: 'stk', html: stackStr(s.stack.map(esc)) }, { cls: 'act', html: esc(s.action) }] }));
      el.append(table(['#', 'Bracket', 'Stack', 'What happened'], rows, { caption: `Input: <code>${esc(el.dataset.input)}</code> (other characters are skipped)` }));
      el.append(h('div.trace-final' + (r.ok ? '' : '.bad'), null, r.ok ? 'Balanced' : 'Not balanced: ' + r.reason));
    },
    bst(el) {
      const keys = parseKeys(el.dataset.keys);
      const r = DSA.bst.fromSequence(keys);
      snapsGrid(el, r.steps.map((s) => ({ title: `Insert ${s.key}`, note: '', spec: DSA.draw.treeSpec(s.tree, { fresh: [s.key] }) })));
    },
    avl(el) {
      const keys = parseKeys(el.dataset.keys);
      const r = DSA.avl.fromSequence(keys);
      const items = [];
      for (const s of r.snaps) {
        if (s.rot) items.push({ title: `Insert ${s.key}`, note: `Unbalanced at ${s.beforeBad.join(', ')}`, rotNote: true, spec: DSA.draw.treeSpec(s.before, { showBF: true, bad: s.beforeBad, fresh: [s.key] }) });
        items.push({ title: s.rot ? `After ${s.rot} rotation` : `Insert ${s.key}`, note: s.rot ? ROT_FIX[s.rot] : 'Balanced, no rotation', rotNote: !!s.rot, spec: DSA.draw.treeSpec(s.tree, { showBF: true, fresh: [s.key] }) });
      }
      snapsGrid(el, el.dataset.last ? items.slice(-Number(el.dataset.last)) : items);
    },
    btree(el) {
      const m = Number(el.dataset.order || 3);
      const r = DSA.btree.fromSequence(parseKeys(el.dataset.keys), m);
      const every = el.hasAttribute('data-every');
      const items = r.snaps.filter((s, i) => every || s.split || i === r.snaps.length - 1)
        .map((s) => ({ title: `Insert ${s.key}`, note: s.split ? 'Split: ' + s.note : 'No split', rotNote: s.split, spec: DSA.draw.btreeSpec(s.tree) }));
      if (!every) el.append(h('p.small.muted', null, `Order ${m}: at most ${m - 1} keys per node. Only the insertions that cause a split are drawn; the others just slot into a leaf.`));
      snapsGrid(el, items, true);
    },
    hash(el) {
      const keys = parseList(el.dataset.keys).map(Number);
      const m = Number(el.dataset.m || 10);
      const method = el.dataset.method || 'linear';
      const r = DSA.hash.build(keys, m, method);
      const rows = r.steps.map((s) => ({ cells: [{ cls: 'sym', html: String(s.key) }, { html: s.probes.map((p) => `${esc(p.formula)}${p.hit && method !== 'chaining' ? ' <span class="pill bad">full</span>' : ''}`).join('<br>') }, { cls: 'sym', html: s.placed === -1 ? '—' : String(s.placed) }, { html: esc(s.note) }] }));
      el.append(table(['Key', 'Probes', 'Index', 'Note'], rows, { caption: method === 'double' ? `h1(k) = k mod ${m}, h2(k) = ${r.R} − (k mod ${r.R}), index = (h1 + i·h2) mod ${m}` : method === 'quadratic' ? `index = (h(k) + i²) mod ${m}` : method === 'linear' ? `index = (h(k) + i) mod ${m}` : `h(k) = k mod ${m}` }));
      el.append(hashTableEl(r.table, method));
    },
    graphwalk(el) {
      const g = DSA.graph.PRESETS[el.dataset.graph || 'trav'];
      const start = el.dataset.start || g.vertices[0];
      const kind = el.dataset.kind || 'bfs';
      const r = kind === 'bfs' ? DSA.graph.bfs(g, start) : DSA.graph.dfs(g, start);
      const rows = r.steps.map((s, i) => ({ cells: [String(i + 1), { cls: 'sym', html: s.cur || '—' }, { cls: 'stk', html: stackStr(kind === 'bfs' ? s.queue : s.stack) }, { cls: 'out', html: s.order.join(' ') || '—' }, { cls: 'act', html: esc(s.text) }] }));
      el.append(table(['#', kind === 'bfs' ? 'Visited now' : 'Current', kind === 'bfs' ? 'Queue (front → rear)' : 'Stack (bottom → top)', 'Output', 'What happened'], rows));
      el.append(h('div.trace-final', null, (kind === 'bfs' ? 'BFS' : 'DFS') + ' order:', h('code', null, r.order.join(' → '))));
    },
    prim(el) {
      const g = DSA.graph.PRESETS[el.dataset.graph || 'mst'];
      const r = DSA.graph.prim(g, el.dataset.start || g.vertices[0]);
      const rows = r.steps.slice(1).filter((s) => !s.done).map((s, i) => ({ cells: [String(i + 1), { html: s.inTree.join(', ') }, { cls: 'sym', html: s.chosen.length ? `${s.chosen[s.chosen.length - 1].u}–${s.chosen[s.chosen.length - 1].v}` : '' }, { cls: 'sym', html: s.chosen.length ? String(s.chosen[s.chosen.length - 1].w) : '' }, { cls: 'sym', html: String(s.total) }] }));
      el.append(table(['Step', 'Vertices in tree after the step', 'Edge added', 'Weight', 'Total'], rows));
      el.append(h('div.trace-final', null, 'MST edges:', h('code', null, r.chosen.map((e) => `${e.u}${e.v}`).join(', ')), 'Minimum cost =', h('code', null, String(r.total))));
    },
    kruskal(el) {
      const g = DSA.graph.PRESETS[el.dataset.graph || 'mst'];
      const r = DSA.graph.kruskal(g);
      const rows = [];
      r.steps.forEach((s) => {
        if (s.at < 0 || s.at >= r.sorted.length || (s.done && !s.pick && !s.bad)) return;
        const e = r.sorted[s.at];
        rows.push({ cls: s.bad ? '' : 'is-now', cells: [{ cls: 'sym', html: `${e.u}–${e.v}` }, { cls: 'sym', html: String(e.w) }, { html: s.bad ? '<span class="pill bad">Reject: cycle</span>' : '<span class="pill ok">Accept</span>' }, { html: s.sets.map((x) => '{' + x.join(',') + '}').join(' ') }, { cls: 'sym', html: String(s.total) }] });
      });
      el.append(table(['Edge', 'Weight', 'Decision', 'Sets after (union-find)', 'Total'], rows, { caption: 'Edges are taken in increasing order of weight. Stop once n − 1 edges are accepted.' }));
      el.append(h('div.trace-final', null, 'MST edges:', h('code', null, r.chosen.map((e) => `${e.u}${e.v}`).join(', ')), 'Minimum cost =', h('code', null, String(r.total))));
    },
    treebuild(el) {
      const inorder = parseList(el.dataset.in);
      const usePre = !!el.dataset.pre;
      const r = usePre ? DSA.treebuild.fromInPre(inorder, parseList(el.dataset.pre)) : DSA.treebuild.fromInPost(inorder, parseList(el.dataset.post));
      if (r.error) { el.textContent = r.error; return; }
      snapsGrid(el, r.steps.map((s, i) => ({ title: `Step ${i + 1}: root ${s.root}`, note: `Left [${s.left.join(' ') || '—'}] · Right [${s.right.join(' ') || '—'}]`, spec: DSA.draw.treeSpec(s.tree, { fresh: [s.root] }) })));
    },
    cqueue(el) {
      const size = Number(el.dataset.size || 5);
      let q = DSA.cq.make(size);
      const rows = [];
      for (const op of parseList(el.dataset.ops)) {
        let r, label;
        if (op[0].toUpperCase() === 'E') { r = DSA.cq.enqueue(q, op.slice(1)); label = `enqueue(${op.slice(1)})`; }
        else { r = DSA.cq.dequeue(q); label = 'dequeue()'; }
        q = r.q;
        const arr = q.arr.map((v, i) => `<span class="tok${i === q.front && i === q.rear ? ' new' : i === q.front ? ' new' : i === q.rear ? ' hl' : ''}${v === null ? ' empty' : ''}">${v === null ? '·' : esc(v)}</span>`).join(' ');
        rows.push({ cls: r.ok ? '' : 'is-now', cells: [{ cls: 'mono', html: label }, { cls: 'sym', html: String(q.front) }, { cls: 'sym', html: String(q.rear) }, { html: `<div class="tokens">${arr}</div>` }, { html: esc(r.msg) }] });
      }
      el.append(table(['Operation', 'front', 'rear', `Array [0 … ${size - 1}]`, 'Why'], rows, { caption: 'Green = front, yellow = rear. Full when (rear + 1) % SIZE == front. Empty when front == -1.' }));
    },
  };

  const ROT_FIX = {
    LL: 'LL case → right rotation', RR: 'RR case → left rotation',
    LR: 'LR case → left then right rotation', RL: 'RL case → right then left rotation',
  };

  function snapsGrid(el, items, wide) {
    const grid = h('div.snaps' + (wide ? '.wide' : ''));
    for (const it of items) {
      const card = h('div.snap');
      card.append(h('div.snap-h', null, h('b', null, it.title), it.note ? h('span', { class: it.rotNote ? 'rot' : 'muted' }, it.note) : null));
      grid.append(card);
      staticScene(card, it.spec, { minScale: 0.45, pad: 14 });
    }
    el.append(grid);
  }

  function hashTableEl(table, method) {
    const box = h('div.htable', { style: 'margin-top:4px' });
    table.forEach((v, i) => {
      const slot = h('div.hslot' + ((method === 'chaining' ? v.length : v !== null) ? '.filled' : ''));
      if (method === 'chaining') {
        if (!v.length) slot.append(h('span.muted', null, 'NULL'));
        v.forEach((k, j) => { if (j) slot.append(h('span.chain-arrow', null, '→')); slot.append(h('span.chain-node', null, String(k))); });
        if (v.length) slot.append(h('span.chain-arrow', null, '→ NULL'));
      } else slot.append(v === null ? h('span.muted', null, 'empty') : String(v));
      box.append(h('div.hrow', null, h('span.hidx', null, String(i)), slot));
    });
    return h('div.fig', null, h('div.cap', null, 'Final hash table'), box);
  }

  function mountAll(scope) {
    for (const el of scope.querySelectorAll('[data-fig]:not([data-ready])')) {
      el.setAttribute('data-ready', '');
      const f = FIG[el.dataset.fig];
      if (f) { try { f(el); } catch (e) { console.error('figure', el.dataset.fig, e); el.textContent = 'Could not draw this figure.'; } }
    }
    for (const el of scope.querySelectorAll('[data-trace]:not([data-ready])')) {
      el.setAttribute('data-ready', '');
      el.classList.add('stack');
      const f = TRACE[el.dataset.trace];
      if (f) { try { f(el); } catch (e) { console.error('trace', el.dataset.trace, e); el.textContent = 'Could not draw this example.'; } }
    }
  }

  DSA.fig = { mountAll, staticScene, table, hashTableEl, snapsGrid };
})(typeof window !== 'undefined' ? window : globalThis);
