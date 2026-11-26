// Graph representations, BFS, DFS, Prim's and Kruskal's algorithms, each with a step trace.
(function (root) {
  const byLabel = (a, b) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);

  function neighbours(g, u) {
    const out = [];
    for (const e of g.edges) {
      if (e.u === u) out.push({ v: e.v, w: e.w });
      else if (!g.directed && e.v === u) out.push({ v: e.u, w: e.w });
    }
    out.sort((a, b) => byLabel(a.v, b.v));
    return out;
  }

  function adjacencyList(g) {
    const m = {};
    for (const v of g.vertices) m[v] = neighbours(g, v);
    return m;
  }

  function adjacencyMatrix(g) {
    const idx = new Map(g.vertices.map((v, i) => [v, i]));
    const M = g.vertices.map(() => g.vertices.map(() => 0));
    for (const e of g.edges) {
      const val = g.weighted ? e.w : 1;
      M[idx.get(e.u)][idx.get(e.v)] = val;
      if (!g.directed) M[idx.get(e.v)][idx.get(e.u)] = val;
    }
    return M;
  }

  function degrees(g) {
    const d = {};
    for (const v of g.vertices) d[v] = { deg: 0, in: 0, out: 0 };
    for (const e of g.edges) {
      if (g.directed) { d[e.u].out++; d[e.v].in++; }
      else { d[e.u].deg++; d[e.v].deg++; }
    }
    return d;
  }

  function bfs(g, start) {
    const visited = new Set([start]);
    const queue = [start];
    const order = [];
    const tree = [];
    const steps = [{ text: `Start at ${start}: mark ${start} as visited and put it in the queue.`, cur: null, queue: queue.slice(), visited: [...visited], order: [], tree: [] }];
    while (queue.length) {
      const u = queue.shift();
      order.push(u);
      const parts = [];
      const fresh = [];
      for (const { v } of neighbours(g, u)) {
        if (!visited.has(v)) { visited.add(v); queue.push(v); tree.push([u, v]); fresh.push(v); parts.push(`${v} is new → mark and enqueue`); }
        else parts.push(`${v} already visited → skip`);
      }
      steps.push({
        text: `Dequeue ${u} and visit it (output ${u}).` + (parts.length ? ' Neighbours: ' + parts.join('; ') + '.' : ' It has no neighbours.'),
        cur: u, queue: queue.slice(), visited: [...visited], order: order.slice(), tree: tree.slice(), fresh,
      });
    }
    steps.push({ text: `The queue is empty, so BFS is finished. BFS order: ${order.join(' → ')}.`, cur: null, queue: [], visited: [...visited], order: order.slice(), tree: tree.slice(), done: true });
    return { order, steps, tree };
  }

  function dfs(g, start) {
    const visited = new Set();
    const order = [];
    const tree = [];
    const stack = [];
    const steps = [];
    function visit(u, from) {
      visited.add(u);
      order.push(u);
      stack.push(u);
      if (from) tree.push([from, u]);
      const nb = neighbours(g, u).map((x) => x.v);
      const unvisited = nb.filter((v) => !visited.has(v));
      steps.push({
        text: `Visit ${u} (output ${u}) and push it on the stack.` + (unvisited.length ? ` Unvisited neighbours: ${unvisited.join(', ')}. Go deeper into ${unvisited[0]}.` : ' It has no unvisited neighbours.'),
        cur: u, stack: stack.slice(), visited: [...visited], order: order.slice(), tree: tree.slice(),
      });
      for (const v of nb) if (!visited.has(v)) visit(v, u);
      stack.pop();
      steps.push({
        text: `All neighbours of ${u} are visited → pop ${u} and backtrack${stack.length ? ' to ' + stack[stack.length - 1] : ''}.`,
        cur: stack[stack.length - 1] || null, stack: stack.slice(), visited: [...visited], order: order.slice(), tree: tree.slice(), back: u,
      });
    }
    visit(start, null);
    steps.push({ text: `The stack is empty, so DFS is finished. DFS order: ${order.join(' → ')}.`, cur: null, stack: [], visited: [...visited], order: order.slice(), tree: tree.slice(), done: true });
    return { order, steps, tree };
  }

  const ek = (u, v) => [u, v].sort(byLabel).join('-');

  function prim(g, start) {
    const inTree = new Set([start]);
    const chosen = [];
    let total = 0;
    const steps = [{ text: `Start with vertex ${start} in the tree. Total cost = 0.`, inTree: [...inTree], chosen: [], cands: [], total: 0 }];
    while (inTree.size < g.vertices.length) {
      const cands = g.edges.filter((e) => inTree.has(e.u) !== inTree.has(e.v));
      if (!cands.length) { steps.push({ text: 'No edge leaves the tree: the graph is not connected, so there is no spanning tree.', inTree: [...inTree], chosen: chosen.slice(), cands: [], total, stuck: true }); break; }
      cands.sort((a, b) => a.w - b.w || byLabel(ek(a.u, a.v), ek(b.u, b.v)));
      const best = cands[0];
      const nv = inTree.has(best.u) ? best.v : best.u;
      const from = inTree.has(best.u) ? best.u : best.v;
      inTree.add(nv);
      chosen.push({ u: from, v: nv, w: best.w });
      total += best.w;
      steps.push({
        text: `Edges leaving the tree: ${cands.map((e) => `${e.u}–${e.v} (${e.w})`).join(', ')}. The cheapest is ${from}–${nv} (${best.w}) → add ${nv}. Total = ${total}.`,
        inTree: [...inTree], chosen: chosen.slice(), cands: cands.map((e) => ek(e.u, e.v)), pick: ek(best.u, best.v), total,
      });
    }
    if (inTree.size === g.vertices.length) steps.push({ text: `All ${g.vertices.length} vertices are in the tree using ${chosen.length} edges (n − 1). Minimum cost = ${total}.`, inTree: [...inTree], chosen: chosen.slice(), cands: [], total, done: true });
    return { chosen, total, steps };
  }

  function kruskal(g) {
    const parent = {};
    for (const v of g.vertices) parent[v] = v;
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const sets = () => {
      const groups = {};
      for (const v of g.vertices) (groups[find(v)] = groups[find(v)] || []).push(v);
      return Object.values(groups).map((a) => a.sort(byLabel)).sort((a, b) => byLabel(a[0], b[0]));
    };
    const sorted = g.edges.slice().sort((a, b) => a.w - b.w || byLabel(ek(a.u, a.v), ek(b.u, b.v)));
    const chosen = [];
    const rejected = [];
    let total = 0;
    const steps = [{ text: `Sort all edges by weight: ${sorted.map((e) => `${e.u}${e.v}(${e.w})`).join(', ')}. Every vertex starts in its own set.`, chosen: [], rejected: [], sets: sets(), total: 0, sorted: sorted.map((e) => ek(e.u, e.v)), at: -1 }];
    for (let i = 0; i < sorted.length; i++) {
      if (chosen.length === g.vertices.length - 1) {
        steps.push({ text: `We already have ${chosen.length} edges (n − 1), so stop. The remaining edges are not needed. Minimum cost = ${total}.`, chosen: chosen.slice(), rejected: rejected.slice(), sets: sets(), total, sorted: sorted.map((e) => ek(e.u, e.v)), at: i, done: true });
        return { chosen, total, steps, sorted };
      }
      const e = sorted[i];
      const ru = find(e.u), rv = find(e.v);
      if (ru !== rv) {
        parent[ru] = rv;
        chosen.push(e);
        total += e.w;
        steps.push({ text: `${e.u}–${e.v} (${e.w}): ${e.u} and ${e.v} are in different sets → no cycle → ACCEPT and join their sets. Total = ${total}.`, chosen: chosen.slice(), rejected: rejected.slice(), sets: sets(), total, sorted: sorted.map((x) => ek(x.u, x.v)), at: i, pick: ek(e.u, e.v) });
      } else {
        rejected.push(e);
        steps.push({ text: `${e.u}–${e.v} (${e.w}): ${e.u} and ${e.v} are already in the same set → it would make a cycle → REJECT.`, chosen: chosen.slice(), rejected: rejected.slice(), sets: sets(), total, sorted: sorted.map((x) => ek(x.u, x.v)), at: i, bad: ek(e.u, e.v) });
      }
    }
    const ok = chosen.length === g.vertices.length - 1;
    steps.push({ text: ok ? `${chosen.length} edges accepted (n − 1). Minimum cost = ${total}.` : 'The graph is not connected, so this is a spanning forest, not a spanning tree.', chosen: chosen.slice(), rejected: rejected.slice(), sets: sets(), total, sorted: sorted.map((x) => ek(x.u, x.v)), at: sorted.length, done: true });
    return { chosen, total, steps, sorted };
  }

  // Checks whether the chosen undirected edges form a spanning tree of g.
  function spanningCheck(g, edgeKeys) {
    const n = g.vertices.length;
    const chosen = g.edges.filter((e) => edgeKeys.includes(ek(e.u, e.v)));
    const parent = {};
    for (const v of g.vertices) parent[v] = v;
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    let cycle = false;
    for (const e of chosen) { const a = find(e.u), b = find(e.v); if (a === b) cycle = true; else parent[a] = b; }
    const roots = new Set(g.vertices.map(find));
    const connected = roots.size === 1;
    return { count: chosen.length, need: n - 1, cycle, connected, ok: connected && !cycle && chosen.length === n - 1, weight: chosen.reduce((s, e) => s + (e.w || 0), 0) };
  }

  const E = (list) => list.map(([u, v, w]) => ({ u, v, w }));
  const PRESETS = {
    trav: {
      name: 'Sample graph (7 vertices)', weighted: false, directed: false,
      vertices: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      edges: E([['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'E'], ['C', 'E'], ['C', 'F'], ['D', 'F'], ['E', 'G'], ['F', 'G']]),
      pos: { A: [200, 30], B: [80, 115], C: [200, 115], D: [320, 115], E: [120, 205], F: [280, 205], G: [200, 285] },
    },
    small: {
      name: 'Small graph (5 vertices)', weighted: false, directed: false,
      vertices: ['A', 'B', 'C', 'D', 'E'],
      edges: E([['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E']]),
      pos: { A: [60, 40], B: [200, 40], C: [60, 170], D: [200, 170], E: [320, 105] },
    },
    directed: {
      name: 'Directed graph (5 vertices)', weighted: false, directed: true,
      vertices: ['A', 'B', 'C', 'D', 'E'],
      edges: E([['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'B'], ['D', 'E'], ['E', 'C']]),
      pos: { A: [60, 40], B: [200, 40], C: [60, 170], D: [200, 170], E: [320, 105] },
    },
    mst: {
      name: 'Weighted graph (6 vertices)', weighted: true, directed: false,
      vertices: ['A', 'B', 'C', 'D', 'E', 'F'],
      edges: E([['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5], ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 3], ['D', 'F', 6], ['E', 'F', 7]]),
      pos: { A: [40, 140], B: [160, 40], C: [160, 240], D: [300, 40], E: [300, 240], F: [420, 140] },
    },
    clrs: {
      name: 'Textbook graph (9 vertices)', weighted: true, directed: false,
      vertices: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
      edges: E([['a', 'b', 4], ['a', 'h', 8], ['b', 'h', 11], ['b', 'c', 8], ['c', 'i', 2], ['c', 'f', 4], ['c', 'd', 7], ['d', 'f', 14], ['d', 'e', 9], ['e', 'f', 10], ['f', 'g', 2], ['g', 'i', 6], ['g', 'h', 1], ['h', 'i', 7]]),
      pos: { a: [30, 130], b: [130, 40], c: [260, 40], d: [390, 40], e: [490, 130], f: [390, 220], g: [260, 220], h: [130, 220], i: [195, 130] },
    },
    span: {
      name: 'Square with a diagonal', weighted: true, directed: false,
      vertices: ['A', 'B', 'C', 'D'],
      edges: E([['A', 'B', 3], ['B', 'C', 4], ['C', 'D', 2], ['D', 'A', 5], ['A', 'C', 1]]),
      pos: { A: [50, 40], B: [250, 40], C: [250, 200], D: [50, 200] },
    },
  };

  const X = { neighbours, adjacencyList, adjacencyMatrix, degrees, bfs, dfs, prim, kruskal, spanningCheck, edgeKey: ek, PRESETS };
  root.DSA = root.DSA || {};
  root.DSA.graph = X;
  if (typeof module === 'object' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
