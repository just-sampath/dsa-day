// Binary search tree with step traces, plus traversals and tree measurements shared by other modules.
(function (root) {
  const node = (key) => ({ key, left: null, right: null });
  const clone = (t) => (t ? { key: t.key, left: clone(t.left), right: clone(t.right), h: t.h } : null);
  const cmp = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);

  function height(t) { return t ? 1 + Math.max(height(t.left), height(t.right)) : 0; } // nodes on longest path
  function size(t) { return t ? 1 + size(t.left) + size(t.right) : 0; }
  function leaves(t) { return !t ? 0 : !t.left && !t.right ? 1 : leaves(t.left) + leaves(t.right); }

  function preorder(t, out = []) { if (t) { out.push(t.key); preorder(t.left, out); preorder(t.right, out); } return out; }
  function inorder(t, out = []) { if (t) { inorder(t.left, out); out.push(t.key); inorder(t.right, out); } return out; }
  function postorder(t, out = []) { if (t) { postorder(t.left, out); postorder(t.right, out); out.push(t.key); } return out; }
  function levelorder(t) {
    const out = [];
    const q = t ? [t] : [];
    while (q.length) { const n = q.shift(); out.push(n.key); if (n.left) q.push(n.left); if (n.right) q.push(n.right); }
    return out;
  }
  function levels(t) {
    const out = [];
    (function walk(n, d) { if (!n) return; (out[d] = out[d] || []).push(n.key); walk(n.left, d + 1); walk(n.right, d + 1); })(t, 0);
    return out;
  }

  function insertTrace(t0, key) {
    let t = clone(t0);
    const steps = [];
    const path = [];
    if (!t) {
      t = node(key);
      steps.push({ text: `The tree is empty, so ${key} becomes the root.`, tree: clone(t), fresh: [key], path: [] });
      return { tree: t, steps };
    }
    let cur = t;
    for (;;) {
      path.push(cur.key);
      const c = cmp(key, cur.key);
      if (c === 0) {
        steps.push({ text: `${key} is already in the tree. A BST does not store duplicates, so nothing changes.`, tree: clone(t), hl: [cur.key], path: path.slice() });
        return { tree: t, steps, dup: true };
      }
      const dir = c < 0 ? 'left' : 'right';
      const word = c < 0 ? 'smaller' : 'bigger';
      if (cur[dir]) {
        steps.push({ text: `${key} is ${word} than ${cur.key} → go ${dir}.`, tree: clone(t), hl: [cur.key], path: path.slice() });
        cur = cur[dir];
      } else {
        cur[dir] = node(key);
        steps.push({ text: `${key} is ${word} than ${cur.key} and the ${dir} spot is empty → insert ${key} as the ${dir} child of ${cur.key}.`, tree: clone(t), fresh: [key], path: path.slice() });
        return { tree: t, steps };
      }
    }
  }

  function insert(t, key) { return insertTrace(t, key).tree; }

  function fromSequence(keys) {
    let t = null;
    const steps = [];
    for (const k of keys) {
      const r = insertTrace(t, k);
      t = r.tree;
      steps.push({ key: k, text: r.steps[r.steps.length - 1].text, tree: clone(t), fresh: [k] });
    }
    return { tree: t, steps };
  }

  function searchTrace(t, key) {
    const steps = [];
    const path = [];
    let cur = t;
    while (cur) {
      path.push(cur.key);
      const c = cmp(key, cur.key);
      if (c === 0) { steps.push({ text: `${key} == ${cur.key}. Found after ${path.length} comparison(s)!`, tree: clone(t), fresh: [cur.key], path: path.slice() }); return { found: true, steps }; }
      const dir = c < 0 ? 'left' : 'right';
      steps.push({ text: `${key} ${c < 0 ? '<' : '>'} ${cur.key} → go ${dir}.`, tree: clone(t), hl: [cur.key], path: path.slice() });
      cur = cur[dir];
    }
    steps.push({ text: `Reached an empty spot (NULL): ${key} is not in the tree.`, tree: clone(t), path: path.slice() });
    return { found: false, steps };
  }

  function minNode(t) { while (t && t.left) t = t.left; return t; }

  function deleteTrace(t0, key) {
    let t = clone(t0);
    const steps = [];
    let parent = null, cur = t, dir = null;
    const path = [];
    while (cur && cmp(key, cur.key) !== 0) {
      path.push(cur.key);
      const c = cmp(key, cur.key);
      steps.push({ text: `${key} ${c < 0 ? '<' : '>'} ${cur.key} → go ${c < 0 ? 'left' : 'right'}.`, tree: clone(t), hl: [cur.key], path: path.slice() });
      parent = cur; dir = c < 0 ? 'left' : 'right'; cur = cur[dir];
    }
    if (!cur) { steps.push({ text: `${key} is not in the tree, nothing to delete.`, tree: clone(t) }); return { tree: t, steps, missing: true }; }
    const setChild = (p, d, n) => { if (!p) t = n; else p[d] = n; };
    if (!cur.left && !cur.right) {
      steps.push({ text: `Found ${key}. Case 1: it is a leaf (no children).`, tree: clone(t), del: [key], kase: 1 });
      setChild(parent, dir, null);
      steps.push({ text: `Just remove it${parent ? ` (set ${parent.key}→${dir} = NULL)` : ''}.`, tree: clone(t), kase: 1 });
    } else if (!cur.left || !cur.right) {
      const child = cur.left || cur.right;
      steps.push({ text: `Found ${key}. Case 2: it has one child (${child.key}).`, tree: clone(t), del: [key], hl: [child.key], kase: 2 });
      setChild(parent, dir, child);
      steps.push({ text: `Connect ${parent ? parent.key : 'the root pointer'} directly to ${child.key}, then delete ${key}.`, tree: clone(t), fresh: [child.key], kase: 2 });
    } else {
      steps.push({ text: `Found ${key}. Case 3: it has two children. Find its inorder successor (smallest key in the right subtree).`, tree: clone(t), del: [key], kase: 3 });
      let sp = cur, s = cur.right;
      const sPath = [s.key];
      while (s.left) { sp = s; s = s.left; sPath.push(s.key); }
      steps.push({ text: `Go right once, then left as far as possible → successor is ${s.key}.`, tree: clone(t), del: [key], hl: [s.key], path: sPath, kase: 3 });
      const sk = s.key;
      // remove successor (it has no left child)
      if (sp === cur) sp.right = s.right; else sp.left = s.right;
      cur.key = sk;
      steps.push({ text: `Copy ${sk} into ${key}'s place, then delete the old ${sk} node (it had at most a right child).`, tree: clone(t), fresh: [sk], kase: 3 });
    }
    return { tree: t, steps };
  }

  // Layout: x by inorder index, y by depth. Returns {pos: Map key->{x,y,depth}, edges:[[parentKey, childKey, 'L'|'R']], width, depth}
  function layout(t, gapX, gapY) {
    gapX = gapX || 46; gapY = gapY || 62;
    const pos = new Map();
    const edges = [];
    let i = 0, maxD = 0;
    (function walk(n, d) {
      if (!n) return;
      walk(n.left, d + 1);
      pos.set(n.key, { x: i * gapX, y: d * gapY, depth: d });
      i++;
      maxD = Math.max(maxD, d);
      walk(n.right, d + 1);
    })(t, 0);
    (function walkE(n) {
      if (!n) return;
      if (n.left) { edges.push([n.key, n.left.key, 'L']); walkE(n.left); }
      if (n.right) { edges.push([n.key, n.right.key, 'R']); walkE(n.right); }
    })(t);
    return { pos, edges, width: Math.max(0, i - 1) * gapX, depth: maxD };
  }

  function find(t, key) { while (t && cmp(key, t.key) !== 0) t = cmp(key, t.key) < 0 ? t.left : t.right; return t; }
  function isBST(t, lo, hi) {
    if (!t) return true;
    if (lo !== undefined && cmp(t.key, lo) <= 0) return false;
    if (hi !== undefined && cmp(t.key, hi) >= 0) return false;
    return isBST(t.left, lo, t.key) && isBST(t.right, t.key, hi);
  }

  const X = { node, clone, cmp, height, size, leaves, preorder, inorder, postorder, levelorder, levels, insert, insertTrace, fromSequence, searchTrace, deleteTrace, layout, find, minNode, isBST };
  root.DSA = root.DSA || {};
  root.DSA.bst = X;
  if (typeof module === 'object' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
