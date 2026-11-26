// Graph playgrounds: representations, BFS/DFS, Prim/Kruskal, spanning-tree game.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h } = DSA.util;
  const kit = DSA.kit;
  const G = () => DSA.graph;
  const copyG = (g) => JSON.parse(JSON.stringify(g));

  function graphStage(host) {
    const stage = h('div.stage');
    host.append(stage);
    return { stage, scene: new DSA.Scene(stage, { minScale: 0.55, label: 'Graph' }) };
  }

  /* ---------- Representations ---------- */
  DSA.viz['graph-repr'] = function (el) {
    let g = copyG(G().PRESETS.small);
    const f = kit.frame(el, { title: 'Graph ↔ adjacency matrix ↔ adjacency list', hint: 'Tap any cell of the matrix to add or remove that edge. The drawing and the list update instantly. Switch to <b>directed</b> to see how the matrix stops being symmetric.' });
    const seg = kit.seg([['small', 'Undirected'], ['directed', 'Directed'], ['mst', 'Weighted']], 'small', (v) => { g = copyG(G().PRESETS[v]); draw(); }, 'Graph type');
    f.inputs.append(seg, kit.btn('Clear edges', () => { g.edges = []; draw(); }));
    const top = h('div');
    const { scene } = graphStage(top);
    const reps = h('div', { style: 'display:grid;gap:16px;padding:12px 16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr))' });
    f.body.append(top, reps);
    function toggle(u, v) {
      const i = g.edges.findIndex((e) => (e.u === u && e.v === v) || (!g.directed && e.u === v && e.v === u));
      if (i >= 0) g.edges.splice(i, 1);
      else g.edges.push({ u, v, w: g.weighted ? DSA.util.randInt(1, 9) : undefined });
      DSA.store.awardOnce('repr:toggle', 3, 'Edited a graph');
      draw();
    }
    function draw() {
      scene.render(DSA.draw.graphSpec(g, {}), { bounds: [0, 0, 460, 300].map((x, i) => (i < 2 ? x - 10 : x + 10)) });
      const M = G().adjacencyMatrix(g);
      const t = h('table.matrix');
      t.append(h('tr', null, h('th', null, ''), g.vertices.map((v) => h('th', null, v))));
      g.vertices.forEach((u, i) => {
        const tr = h('tr', null, h('th', null, u));
        g.vertices.forEach((v, j) => {
          const val = M[i][j];
          const td = h('td', { class: (val ? 'on' : '') + (i === j ? ' diag' : '') });
          const b = h('button', { type: 'button', 'aria-label': `Edge ${u} to ${v}: ${val ? 'yes' : 'no'}. Tap to toggle.` }, String(val));
          if (i === j) b.disabled = true;
          b.addEventListener('click', () => toggle(u, v));
          td.append(b);
          tr.append(td);
        });
        t.append(tr);
      });
      const list = h('div.adj-list');
      const A = G().adjacencyList(g);
      for (const v of g.vertices) {
        const row = h('div.adj-row', null, h('span.adj-head', null, v));
        for (const n of A[v]) row.append(h('span.adj-arrow', null, '→'), h('span.adj-item', null, h('span', null, g.weighted ? `${n.v}|${n.w}` : n.v)));
        row.append(h('span.adj-arrow', null, '→'), h('span.adj-null', null, 'NULL'));
        list.append(row);
      }
      const deg = G().degrees(g);
      reps.textContent = '';
      reps.append(h('div.stack', null, h('span.panel-t', null, 'Adjacency matrix (row → column)'), h('div', { style: 'overflow-x:auto' }, t),
        h('span.small.muted', null, g.directed ? 'Directed: M[u][v] = 1 means an edge from u to v. Not symmetric.' : g.weighted ? 'Weighted: the cell stores the weight, 0 means no edge.' : 'Undirected: the matrix is symmetric about the diagonal.')));
      reps.append(h('div.stack', null, h('span.panel-t', null, 'Adjacency list'), list,
        h('span.small.muted', null, g.vertices.map((v) => (g.directed ? `${v}: in ${deg[v].in}, out ${deg[v].out}` : `deg(${v}) = ${deg[v].deg}`)).join(' · '))));
      const n = g.vertices.length, e = g.edges.length;
      f.say(`V = ${n}, E = ${e}. Matrix uses V² = ${n * n} cells no matter how many edges. The list uses V + ${g.directed ? 'E' : '2E'} = ${n + (g.directed ? e : 2 * e)} entries.` + (g.directed ? '' : ` Sum of degrees = 2E = ${2 * e}.`));
    }
    draw();
  };

  /* ---------- BFS / DFS ---------- */
  DSA.viz['graph-walk'] = function (el) {
    let kind = el.dataset.kind || 'bfs';
    let g = G().PRESETS.trav;
    let start = 'A';
    const f = kit.frame(el, { title: 'BFS and DFS, step by step', hint: '<b>BFS</b> uses a <b>queue</b> and spreads out level by level, like ripples. <b>DFS</b> uses a <b>stack</b> and goes as deep as possible before backtracking, like exploring a maze. Neighbours are taken in alphabetical order.' });
    const seg = kit.seg([['bfs', 'BFS (queue)'], ['dfs', 'DFS (stack)']], kind, (v) => { kind = v; run(); }, 'Traversal');
    const gSel = kit.select([['trav', '7-vertex graph'], ['small', '5-vertex graph']], 'trav', (v) => { g = G().PRESETS[v]; startSel(); run(); }, 'Graph');
    const sBox = h('span');
    function startSel() {
      sBox.textContent = '';
      if (!g.vertices.includes(start)) start = g.vertices[0];
      sBox.append(h('label.field', null, 'start', kit.select(g.vertices.map((v) => [v, v]), start, (v) => { start = v; run(); }, 'Start vertex')));
    }
    f.inputs.append(seg, gSel, sBox);
    startSel();
    const box = h('div');
    const { scene } = graphStage(box);
    const panels = h('div.panels');
    box.append(panels);
    f.body.append(box);
    const stepper = new DSA.Stepper(box, { render: (s) => {
      const nc = {};
      s.visited.forEach((v) => (nc[v] = 'is-done'));
      (s.order || []).forEach((v) => (nc[v] = 'is-done'));
      (kind === 'bfs' ? s.queue : s.stack).forEach((v) => (nc[v] = 'is-hl'));
      if (s.cur) nc[s.cur] = 'is-visit';
      const ec = {};
      s.tree.forEach(([u, v]) => (ec[G().edgeKey(u, v)] = 'is-tree'));
      scene.render(DSA.draw.graphSpec(g, { nodeCls: nc, edgeCls: ec }));
      panels.textContent = '';
      panels.append(kit.panel(kind === 'bfs' ? 'Queue (front → rear)' : 'Stack (bottom → top)', kit.tokens(kind === 'bfs' ? s.queue : s.stack, (t, i, a) => (kind === 'dfs' && i === s.stack.length - 1 ? '.hl' : kind === 'bfs' && i === 0 ? '.hl' : ''))));
      panels.append(kit.panel('Visited', kit.tokens(s.visited)));
      panels.append(kit.panel('Output order', kit.tokens(s.order, (t, i) => (i === s.order.length - 1 && s.cur === t ? '.new' : ''))));
    }, speed: 1500, xpKey: 'walk', xpTag: () => kind });
    function run() {
      const r = kind === 'bfs' ? G().bfs(g, start) : G().dfs(g, start);
      stepper.load(r.steps.map((s) => Object.assign({ ask: kind === 'bfs' ? 'Which vertex leaves the queue, and who joins it?' : 'Where does DFS go next?' }, s)));
      f.say(`<b>${kind.toUpperCase()} from ${start}: ${r.order.join(' → ')}</b>. Thick blue edges form the ${kind.toUpperCase()} spanning tree.`, 'ok');
    }
    run();
  };

  /* ---------- Prim / Kruskal ---------- */
  DSA.viz['mst-play'] = function (el) {
    let kind = el.dataset.kind || 'prim';
    let g = G().PRESETS.mst;
    let start = g.vertices[0];
    const f = kit.frame(el, { title: 'Minimum spanning tree: Prim vs Kruskal', hint: '<b>Prim</b> grows ONE tree from a start vertex, always adding the cheapest edge that leaves the tree. <b>Kruskal</b> sorts ALL edges and accepts the cheapest one that does not make a cycle. Both get the same minimum cost.' });
    const seg = kit.seg([['prim', 'Prim'], ['kruskal', 'Kruskal']], kind, (v) => { kind = v; startSel(); run(); }, 'Algorithm');
    const gSel = kit.select([['mst', '6-vertex graph'], ['clrs', 'Textbook 9-vertex graph']], 'mst', (v) => { g = G().PRESETS[v]; start = g.vertices[0]; startSel(); run(); }, 'Graph');
    const sBox = h('span');
    function startSel() {
      sBox.textContent = '';
      if (kind !== 'prim') return;
      sBox.append(h('label.field', null, 'start', kit.select(g.vertices.map((v) => [v, v]), start, (v) => { start = v; run(); }, 'Start vertex')));
    }
    f.inputs.append(seg, gSel, sBox);
    startSel();
    const box = h('div');
    const { scene } = graphStage(box);
    const panels = h('div.panels');
    box.append(panels);
    f.body.append(box);
    let sorted = [];
    const stepper = new DSA.Stepper(box, { render: (s) => {
      const nc = {}, ec = {};
      const chosen = new Set(s.chosen.map((e) => G().edgeKey(e.u, e.v)));
      if (kind === 'prim') {
        s.inTree.forEach((v) => (nc[v] = 'is-done'));
        (s.cands || []).forEach((k) => (ec[k] = 'is-hl'));
      } else {
        (s.rejected || []).forEach((e) => (ec[G().edgeKey(e.u, e.v)] = 'is-bad'));
        s.chosen.forEach((e) => { nc[e.u] = 'is-done'; nc[e.v] = 'is-done'; });
      }
      chosen.forEach((k) => (ec[k] = 'is-tree'));
      if (s.bad) ec[s.bad] = 'is-bad';
      scene.render(DSA.draw.graphSpec(g, { nodeCls: nc, edgeCls: ec }));
      panels.textContent = '';
      if (kind === 'kruskal') {
        const list = h('div.tokens');
        sorted.forEach((e, i) => {
          const k = G().edgeKey(e.u, e.v);
          const cls = chosen.has(k) ? '.new' : (s.rejected || []).some((x) => G().edgeKey(x.u, x.v) === k) ? '.dim' : i === s.at ? '.hl' : '';
          list.append(h('span.tok' + cls, { title: chosen.has(k) ? 'accepted' : '' }, `${e.u}${e.v}:${e.w}`));
        });
        panels.append(kit.panel('Edges sorted by weight', list));
        panels.append(kit.panel('Sets (union-find)', h('div.small', null, (s.sets || []).map((x) => '{' + x.join(',') + '}').join(' '))));
      } else {
        panels.append(kit.panel('In the tree', kit.tokens(s.inTree)));
      }
      panels.append(kit.panel('MST edges · total', h('div', null, kit.tokens(s.chosen.map((e) => `${e.u}${e.v}`), () => '.new'), h('b.tnum', null, `Total = ${s.total}`))));
    }, speed: 1700, xpKey: 'mst', xpTag: () => kind });
    function run() {
      const r = kind === 'prim' ? G().prim(g, start) : G().kruskal(g);
      sorted = r.sorted || [];
      stepper.load(r.steps.map((s) => Object.assign({ ask: kind === 'prim' ? 'Which edge is added next?' : 'Accept or reject this edge?' }, s)));
      f.say(`<b>${kind === 'prim' ? "Prim's" : "Kruskal's"}: minimum cost = ${r.total}</b> with ${r.chosen.length} edges (n − 1 = ${g.vertices.length - 1}).`, 'ok');
    }
    run();
  };

  /* ---------- Spanning tree game ---------- */
  DSA.viz['span-game'] = function (el) {
    const g = G().PRESETS.span;
    const best = G().kruskal(g).total;
    let picked = new Set();
    const f = kit.frame(el, { title: 'Make a spanning tree', hint: `Tap edges to choose them. A spanning tree must <b>connect all ${g.vertices.length} vertices</b>, have <b>no cycle</b>, and use exactly <b>n − 1 = ${g.vertices.length - 1} edges</b>. Bonus: find the cheapest one (cost ${best}).`, tag: 'Mini game' });
    const chips = h('div.btn-row');
    f.inputs.append(chips, kit.btn('Clear', () => { picked = new Set(); draw(); }));
    const box = h('div');
    const { scene } = graphStage(box);
    f.body.append(box);
    function draw() {
      chips.textContent = '';
      for (const e of g.edges) {
        const k = G().edgeKey(e.u, e.v);
        const b = kit.btn(`${e.u}–${e.v} (${e.w})`, () => { if (picked.has(k)) picked.delete(k); else picked.add(k); draw(); }, picked.has(k) ? 'is-on' : '');
        b.setAttribute('aria-pressed', String(picked.has(k)));
        chips.append(b);
      }
      const ec = {};
      for (const e of g.edges) { const k = G().edgeKey(e.u, e.v); ec[k] = picked.has(k) ? 'is-tree' : 'is-dim'; }
      scene.render(DSA.draw.graphSpec(g, { edgeCls: ec }));
      const c = G().spanningCheck(g, [...picked]);
      const bits = [`${c.count}/${c.need} edges`, c.connected ? 'connected ✓' : 'not connected yet', c.cycle ? 'has a cycle ✗' : 'no cycle ✓'];
      if (c.ok) {
        const msg = c.weight === best ? `<b>Minimum spanning tree!</b> Cost ${c.weight}, the cheapest possible.` : `<b>Valid spanning tree</b> with cost ${c.weight}. Can you find one that costs ${best}?`;
        f.say(msg, 'ok');
        if (c.weight === best) DSA.store.awardOnce('span:mst', 15, 'Found the MST');
        else DSA.store.awardOnce('span:any', 5, 'Made a spanning tree');
      } else f.say(bits.join(' · '), c.cycle ? 'bad' : '');
    }
    draw();
  };
})(typeof window !== 'undefined' ? window : globalThis);
