// Turns data (linked list state, trees, B-trees, graphs) into Scene specs.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});

  const PTR_CLASS = { head: 'label', newNode: 'label ptr-new', temp: 'label ptr-temp', last: 'label ptr-temp', del: 'label ptr-temp', prev: 'label ptr-temp', curr: 'label', next: 'label ptr-new' };
  const ABOVE = new Set(['head', 'newNode']);

  function llSpec(st) {
    const dbl = st.mode === 'dll';
    const SP = dbl ? 158 : 132;
    const order = (st.order || DSA.ll.chain(st)).filter((id) => st.nodes[id]);
    const idx = new Map(order.map((id, i) => [id, i]));
    const nodes = [], edges = [];
    const pos = {};
    const hl = new Set(st.hl || []), fresh = new Set(st.fresh || []), del = new Set(st.del || []);
    const hlE = new Set(st.hlEdges || []);
    const hint = st.hint && st.nodes[st.hint.id] ? st.hint : null;

    for (const id of Object.keys(st.nodes)) {
      const n = st.nodes[id];
      let x, y = 0, detached = false;
      if (idx.has(id)) x = idx.get(id) * SP;
      else {
        detached = true;
        y = -112;
        if (n.next && idx.has(n.next)) x = (idx.get(n.next) - 0.5) * SP;
        else if (n.prev && idx.has(n.prev)) x = (idx.get(n.prev) + 0.5) * SP;
        else if (hint && hint.id === id) x = (Math.min(hint.at, order.length) - 0.5) * SP;
        else x = (order.length - 0.5) * SP;
      }
      pos[id] = { x, y, detached };
      let cls = '';
      if (del.has(id)) cls = 'is-del'; else if (fresh.has(id)) cls = 'is-new'; else if (hl.has(id)) cls = 'is-hl';
      nodes.push({ key: id, kind: 'llnode', x, y, val: n.val, dbl, nextNull: n.next === null && (detached || st.mode === 'cll'), prevNull: dbl && n.prev === null && (detached || idx.get(id) !== 0), cls, from: detached ? { x, y: y - 30 } : undefined });
    }

    for (const id of Object.keys(st.nodes)) {
      const n = st.nodes[id];
      const a = pos[id];
      if (n.next && st.nodes[n.next]) {
        const b = pos[n.next];
        const k = id + ':next';
        const cls = hlE.has(k) ? 'is-hl' : '';
        if (st.mode === 'cll' && !a.detached && !b.detached && idx.get(n.next) === 0 && idx.get(id) === order.length - 1 && order.length > 1) {
          edges.push({ key: k, from: id, to: n.next, kind: 'loop-below', fp: dbl ? 'bottomR' : 'bottomR', tp: 'bottomL', cls, depth: 46 });
        } else if (n.next === id) {
          edges.push({ key: k, from: id, to: id, kind: 'loop-below', fp: 'bottomR', tp: 'bottomL', cls, depth: 40 });
        } else if (a.detached && !b.detached) {
          edges.push({ key: k, from: id, to: n.next, fp: 'next', tp: a.x < b.x - 30 ? 'inL' : 'top', cls });
        } else if (!a.detached && b.detached) {
          edges.push({ key: k, from: id, to: n.next, fp: 'next', tp: 'bottom', cls });
        } else if (b.x > a.x) {
          edges.push({ key: k, from: id, to: n.next, fp: 'next', tp: 'inL', cls });
        } else {
          edges.push({ key: k, from: id, to: n.next, fp: 'top', tp: 'top', bend: 46, cls: cls || 'is-ptr' });
        }
      }
      if (dbl && n.prev && st.nodes[n.prev]) {
        const b = pos[n.prev];
        const k = id + ':prev';
        const cls = hlE.has(k) ? 'is-hl' : '';
        if (a.detached && !b.detached) edges.push({ key: k, from: id, to: n.prev, fp: 'prev', tp: a.x > b.x + 30 ? 'inR' : 'top', cls });
        else if (!a.detached && b.detached) edges.push({ key: k, from: id, to: n.prev, fp: 'prev', tp: 'bottom', cls });
        else if (b.x < a.x) edges.push({ key: k, from: id, to: n.prev, fp: 'prev', tp: 'inR', cls });
        else edges.push({ key: k, from: id, to: n.prev, fp: 'bottom', tp: 'bottom', bend: 46, cls: cls || 'is-ptr' });
      }
    }

    // NULL markers for the real list ends
    if (st.mode !== 'cll' && order.length) {
      const last = order[order.length - 1];
      if (st.nodes[last].next === null) {
        nodes.push({ key: 'null-end', kind: 'null', x: pos[last].x + SP * 0.64, y: dbl ? -7 : 0 });
        edges.push({ key: 'e-null-end', from: last, to: 'null-end', fp: 'next', tp: 'inL' });
      }
      if (dbl && st.nodes[order[0]].prev === null) {
        nodes.push({ key: 'null-start', kind: 'null', x: pos[order[0]].x - SP * 0.64, y: 7 });
        edges.push({ key: 'e-null-start', from: order[0], to: 'null-start', fp: 'prev', tp: 'inR' });
      }
    }
    if (!Object.keys(st.nodes).length) {
      nodes.push({ key: 'null-empty', kind: 'null', x: 0, y: 0 });
    }

    // pointer labels
    const ptrs = Object.assign({}, st.head ? { head: st.head } : {}, st.ptrs || {});
    if (!st.head) ptrs.head = null;
    const stackAbove = {}, stackBelow = {};
    for (const name of Object.keys(ptrs)) {
      const id = ptrs[name];
      if (name === 'head' && !id) {
        nodes.push({ key: 'lbl-head', kind: 'label', text: 'head = NULL', x: order.length ? -SP * 0.7 : 0, y: -48, cls: 'label' });
        continue;
      }
      if (!id || !pos[id]) continue;
      const p = pos[id];
      if (ABOVE.has(name)) {
        const k = (stackAbove[id] = (stackAbove[id] || 0) + 1) - 1;
        nodes.push({ key: 'lbl-' + name, kind: 'label', text: name, arrow: 'down', len: 12 + k * 18, x: p.x, y: p.y - 50 - k * 18, cls: PTR_CLASS[name] || 'label' });
      } else {
        const k = (stackBelow[id] = (stackBelow[id] || 0) + 1) - 1;
        nodes.push({ key: 'lbl-' + name, kind: 'label', text: name, arrow: 'up', len: 30 + k * 18, x: p.x, y: p.y + 60 + k * 18, cls: PTR_CLASS[name] || 'label ptr-temp' });
      }
    }
    return { nodes, edges };
  }

  // Binary tree → scene spec. Keys are unique, so node key = 't' + key.
  function treeSpec(tree, o) {
    o = o || {};
    const L = DSA.bst.layout(tree, o.gapX || 48, o.gapY || 66);
    const set = (a) => new Set((a || []).map(String));
    const hl = set(o.hl), fresh = set(o.fresh), del = set(o.del), bad = set(o.bad), path = set(o.path), dim = set(o.dim), visit = set(o.visit), done = set(o.done);
    const nodes = [], edges = [];
    const bfOf = new Map();
    (function walk(n) { if (!n) return; bfOf.set(String(n.key), n.bf); walk(n.left); walk(n.right); })(tree);
    for (const [key, p] of L.pos) {
      const k = String(key);
      let cls = '';
      if (del.has(k)) cls = 'is-del';
      else if (bad.has(k)) cls = 'is-bad' + (hl.has(k) ? ' is-hl' : '');
      else if (visit.has(k)) cls = 'is-visit';
      else if (fresh.has(k)) cls = 'is-new';
      else if (hl.has(k)) cls = 'is-hl';
      else if (done.has(k)) cls = 'is-done';
      else if (path.has(k)) cls = 'is-hl';
      if (dim.has(k)) cls += ' is-dim';
      nodes.push({ key: (o.prefix || 't') + k, kind: 'circle', x: p.x, y: p.y, val: key, cls, bf: o.showBF ? bfOf.get(k) : undefined, sub: o.sub ? o.sub(key) : undefined });
    }
    for (const [a, b] of L.edges) {
      const onPath = path.has(String(a)) && (path.has(String(b)) || hl.has(String(b)) || fresh.has(String(b)));
      edges.push({ key: (o.prefix || 't') + 'e' + a + '-' + b, from: (o.prefix || 't') + a, to: (o.prefix || 't') + b, kind: 'line', cls: onPath ? 'is-hl' : '' });
    }
    if (!tree) nodes.push({ key: 'empty', kind: 'text', text: 'empty tree (root = NULL)', x: 0, y: 0, small: true });
    return { nodes, edges };
  }

  function btreeSpec(rootNode, o) {
    o = o || {};
    const nodes = [], edges = [];
    if (!rootNode) { nodes.push({ key: 'empty', kind: 'text', text: 'empty B-tree', x: 0, y: 0, small: true }); return { nodes, edges }; }
    const L = DSA.btree.layout(rootNode, 18, 78);
    const hl = new Set(o.hl || []), fresh = new Set(o.fresh || []), bad = new Set(o.bad || []);
    for (const [id, p] of L.pos) {
      let cls = '';
      if (bad.has(id)) cls = 'is-del'; else if (fresh.has(id)) cls = 'is-new'; else if (hl.has(id)) cls = 'is-hl';
      nodes.push({ key: id, kind: 'bnode', x: p.x, y: p.y, keys: p.node.keys.slice(), cls });
    }
    for (const [a, b, i] of L.edges) edges.push({ key: a + '>' + b, from: a, to: b, kind: 'line', fp: 'child-' + i, tp: 'top' });
    return { nodes, edges };
  }

  function graphSpec(g, o) {
    o = o || {};
    const nodes = [], edges = [];
    const nc = o.nodeCls || {}, ecl = o.edgeCls || {};
    for (const v of g.vertices) {
      const [x, y] = g.pos[v];
      nodes.push({ key: 'v' + v, kind: 'circle', x, y, val: v, cls: nc[v] || '', r: 19, sub: o.sub ? o.sub(v) : undefined });
    }
    const seenPair = new Set();
    for (const e of g.edges) {
      const k = DSA.graph.edgeKey(e.u, e.v);
      const pair = k;
      const bend = g.directed && seenPair.has(pair) ? 22 : 0;
      seenPair.add(pair);
      const cls = ecl[k] || '';
      edges.push({
        key: 'e' + e.u + '>' + e.v, from: 'v' + e.u, to: 'v' + e.v,
        kind: g.directed ? 'arrow' : 'line', cls, bend: bend || undefined,
        w: g.weighted ? e.w : undefined, wcls: cls.replace('sc-edge', '').trim(),
      });
    }
    return { nodes, edges };
  }

  function stableBounds(specs, pad) {
    let b = null;
    for (const sp of specs) b = DSA.sceneUnion(b, DSA.sceneMeasure(sp, pad));
    return b;
  }

  DSA.draw = { llSpec, treeSpec, btreeSpec, graphSpec, stableBounds };
})(typeof window !== 'undefined' ? window : globalThis);
