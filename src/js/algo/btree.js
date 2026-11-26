// B-tree of order m (at most m children, at most m-1 keys per node). Bottom-up insertion with splits, with traces.
(function (root) {
  const cmp = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);

  function make(m) { return { m, root: null, nextId: 1 }; }
  const newNode = (T, keys, children) => ({ id: 'b' + T.nextId++, keys: keys || [], children: children || [] });
  const isLeaf = (n) => n.children.length === 0;
  const cloneNode = (n) => (n ? { id: n.id, keys: n.keys.slice(), children: n.children.map(cloneNode) } : null);
  const cloneT = (T) => ({ m: T.m, root: cloneNode(T.root), nextId: T.nextId });
  const fmt = (keys) => '[' + keys.join(', ') + ']';
  const medianIndex = (m) => Math.floor((m - 1) / 2);

  function insertTrace(T0, key) {
    const T = cloneT(T0);
    const m = T.m;
    const steps = [];
    const push = (text, extra) => steps.push(Object.assign({ text, tree: cloneNode(T.root) }, extra || {}));
    if (!T.root) {
      T.root = newNode(T, [key]);
      push(`The tree is empty: create the root ${fmt([key])}.`, { fresh: [T.root.id] });
      return { T, steps };
    }
    // find leaf, remembering the path
    const path = [];
    let cur = T.root;
    for (;;) {
      if (cur.keys.some((k) => cmp(k, key) === 0)) {
        push(`${key} is already in the tree. B-trees keep keys unique.`, { hl: [cur.id] });
        return { T, steps, dup: true };
      }
      path.push(cur);
      if (isLeaf(cur)) break;
      let i = 0;
      while (i < cur.keys.length && cmp(key, cur.keys[i]) > 0) i++;
      const where = i === 0 ? `${key} < ${cur.keys[0]}` : i === cur.keys.length ? `${key} > ${cur.keys[cur.keys.length - 1]}` : `${cur.keys[i - 1]} < ${key} < ${cur.keys[i]}`;
      push(`At ${fmt(cur.keys)}: ${where} → go down to child ${i + 1}.`, { hl: [cur.id] });
      cur = cur.children[i];
    }
    let i = 0;
    while (i < cur.keys.length && cmp(key, cur.keys[i]) > 0) i++;
    cur.keys.splice(i, 0, key);
    const over = cur.keys.length > m - 1;
    push(`Insert ${key} into the leaf in sorted order → ${fmt(cur.keys)}.` + (over ? ` That is ${cur.keys.length} keys but the maximum is ${m - 1} (order ${m}), so the node must split.` : ` It has ${cur.keys.length} key(s), at most ${m - 1} allowed, so no split.`), { fresh: [cur.id], bad: over ? [cur.id] : [] });
    // split upwards
    let level = path.length - 1;
    let node = cur;
    while (node.keys.length > m - 1) {
      const mid = medianIndex(m);
      const med = node.keys[mid];
      const leftKeys = node.keys.slice(0, mid);
      const rightKeys = node.keys.slice(mid + 1);
      const right = newNode(T, rightKeys, isLeaf(node) ? [] : node.children.slice(mid + 1));
      const fullKeys = node.keys.slice();
      node.keys = leftKeys;
      if (!isLeaf(node)) node.children = node.children.slice(0, mid + 1);
      const parent = level > 0 ? path[level - 1] : null;
      if (!parent) {
        T.root = newNode(T, [med], [node, right]);
        push(`Split ${fmt(fullKeys)}: the median ${med} moves up to a NEW root. Left ${fmt(leftKeys)}, right ${fmt(rightKeys)}. The tree grows taller by one level.`, { fresh: [T.root.id], hl: [node.id, right.id] });
        break;
      }
      let j = parent.children.indexOf(node);
      parent.keys.splice(j, 0, med);
      parent.children.splice(j + 1, 0, right);
      const pOver = parent.keys.length > m - 1;
      push(`Split ${fmt(fullKeys)}: the median ${med} moves up into the parent → ${fmt(parent.keys)}. Left ${fmt(leftKeys)}, right ${fmt(rightKeys)}.` + (pOver ? ` Now the parent has ${parent.keys.length} keys, too many, so it splits too.` : ''), { fresh: [parent.id], hl: [node.id, right.id], bad: pOver ? [parent.id] : [] });
      node = parent;
      level--;
    }
    return { T, steps };
  }

  function fromSequence(keys, m) {
    let T = make(m);
    const steps = [];
    const snaps = [];
    for (const k of keys) {
      const r = insertTrace(T, k);
      T = r.T;
      r.steps.forEach((s) => steps.push(Object.assign({ key: k }, s)));
      if (!r.dup) {
        const split = r.steps.some((s) => /^Split/.test(s.text));
        snaps.push({ key: k, split, tree: cloneNode(T.root), note: split ? r.steps.filter((s) => /^Split/.test(s.text)).map((s) => s.text.split(':')[1].split('.')[0].trim()).join('; ') : '' });
      }
    }
    return { T, steps, snaps };
  }

  // Layout: leaves packed left to right, parents centred over their children.
  function layout(rootNode, gapX, gapY) {
    gapX = gapX || 16; gapY = gapY || 74;
    const CW = 36;
    const pos = new Map();
    const edges = [];
    let cursor = 0;
    (function walk(n, d) {
      const w = Math.max(1, n.keys.length) * CW;
      if (isLeaf(n)) {
        pos.set(n.id, { x: cursor + w / 2, y: d * gapY, node: n });
        cursor += w + gapX;
        return;
      }
      n.children.forEach((c) => walk(c, d + 1));
      const first = pos.get(n.children[0].id).x;
      const last = pos.get(n.children[n.children.length - 1].id).x;
      pos.set(n.id, { x: (first + last) / 2, y: d * gapY, node: n });
      n.children.forEach((c, i) => edges.push([n.id, c.id, i]));
    })(rootNode, 0);
    return { pos, edges };
  }

  function check(T) {
    const m = T.m;
    const minKeys = Math.ceil(m / 2) - 1;
    const leafDepths = new Set();
    let ok = true;
    const all = [];
    (function w(n, d, isRoot) {
      if (!n) return;
      for (let i = 1; i < n.keys.length; i++) if (cmp(n.keys[i - 1], n.keys[i]) >= 0) ok = false;
      if (n.keys.length > m - 1) ok = false;
      if (!isRoot && n.keys.length < minKeys) ok = false;
      if (isLeaf(n)) leafDepths.add(d);
      else if (n.children.length !== n.keys.length + 1) ok = false;
      n.children.forEach((c, i) => {
        if (i > 0 && c.keys.some((k) => cmp(k, n.keys[i - 1]) <= 0)) ok = false;
        if (i < n.keys.length && c.keys.some((k) => cmp(k, n.keys[i]) >= 0)) ok = false;
        w(c, d + 1, false);
      });
      all.push(...n.keys);
    })(T.root, 0, true);
    return ok && leafDepths.size <= 1;
  }

  function levelsOf(rootNode) {
    const out = [];
    (function w(n, d) { if (!n) return; (out[d] = out[d] || []).push(n.keys.slice()); n.children.forEach((c) => w(c, d + 1)); })(rootNode, 0);
    return out;
  }

  const X = { make, insertTrace, fromSequence, layout, check, levelsOf, medianIndex };
  root.DSA = root.DSA || {};
  root.DSA.btree = X;
  if (typeof module === 'object' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
