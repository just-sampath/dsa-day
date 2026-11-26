// AVL tree insertion and deletion with rotation traces. Balance factor = height(left) - height(right).
(function (root) {
  const B = root.DSA && root.DSA.bst ? root.DSA.bst : (typeof require === 'function' ? require('./bst.js') : null);
  const { cmp } = B;

  const ht = (n) => (n ? n.h : 0);
  function fix(n) { if (!n) return 0; n.h = 1 + Math.max(fix(n.left), fix(n.right)); return n.h; }
  const bf = (n) => (n ? ht(n.left) - ht(n.right) : 0);
  function annotate(t) { (function w(n) { if (!n) return; w(n.left); w(n.right); n.bf = bf(n); })(t); return t; }
  const clone = (t) => (t ? { key: t.key, left: clone(t.left), right: clone(t.right), h: t.h } : null);
  const snap = (t) => annotate(clone(t));

  function rotRight(z) { const y = z.left; z.left = y.right; y.right = z; return y; }
  function rotLeft(z) { const y = z.right; z.right = y.left; y.left = z; return y; }

  function parentOf(t, key) {
    let p = null, c = t;
    while (c && cmp(key, c.key) !== 0) { p = c; c = cmp(key, c.key) < 0 ? c.left : c.right; }
    return p;
  }

  // Rotate the subtree rooted at z (found by key) in place; returns new tree root.
  function rotateAt(t, zKey, dir) {
    const p = parentOf(t, zKey);
    const z = p ? (p.left && cmp(p.left.key, zKey) === 0 ? p.left : p.right) : t;
    const y = dir === 'L' ? rotLeft(z) : rotRight(z);
    if (!p) t = y; else if (p.left === z) p.left = y; else p.right = y;
    fix(t);
    return t;
  }

  const CASE_TEXT = {
    LL: 'LL case (the new key went Left, then Left). Fix: one RIGHT rotation',
    RR: 'RR case (the new key went Right, then Right). Fix: one LEFT rotation',
    LR: 'LR case (Left, then Right). Fix: LEFT rotation at the child, then RIGHT rotation',
    RL: 'RL case (Right, then Left). Fix: RIGHT rotation at the child, then LEFT rotation',
  };

  // Rebalance node z (by key). kind decides the case. Pushes steps. Returns {tree, rot}
  function rebalance(t, z, steps, decide) {
    const b = bf(z);
    let kase;
    if (b > 1) kase = decide(z, 'L');
    else kase = decide(z, 'R');
    const zk = z.key;
    const child = b > 1 ? z.left : z.right;
    steps.push({ text: `${zk} is unbalanced (BF = ${b > 0 ? '+' : ''}${b}). ${CASE_TEXT[kase]}${kase.length === 2 && kase[0] !== kase[1] ? '' : ' at ' + zk}.`, tree: snap(t), bad: [zk], hl: [child.key], rot: kase });
    if (kase === 'LL') {
      t = rotateAt(t, zk, 'R');
      steps.push({ text: `After RIGHT rotation at ${zk}: ${child.key} moves up and ${zk} becomes its right child.`, tree: snap(t), fresh: [child.key], rot: kase });
    } else if (kase === 'RR') {
      t = rotateAt(t, zk, 'L');
      steps.push({ text: `After LEFT rotation at ${zk}: ${child.key} moves up and ${zk} becomes its left child.`, tree: snap(t), fresh: [child.key], rot: kase });
    } else if (kase === 'LR') {
      const g = child.right.key;
      t = rotateAt(t, child.key, 'L');
      steps.push({ text: `Step 1: LEFT rotation at ${child.key}. Now it looks like an LL case.`, tree: snap(t), hl: [g], bad: [zk], rot: kase });
      t = rotateAt(t, zk, 'R');
      steps.push({ text: `Step 2: RIGHT rotation at ${zk}. ${g} is now on top, with ${child.key} on its left and ${zk} on its right.`, tree: snap(t), fresh: [g], rot: kase });
    } else {
      const g = child.left.key;
      t = rotateAt(t, child.key, 'R');
      steps.push({ text: `Step 1: RIGHT rotation at ${child.key}. Now it looks like an RR case.`, tree: snap(t), hl: [g], bad: [zk], rot: kase });
      t = rotateAt(t, zk, 'L');
      steps.push({ text: `Step 2: LEFT rotation at ${zk}. ${g} is now on top, with ${zk} on its left and ${child.key} on its right.`, tree: snap(t), fresh: [g], rot: kase });
    }
    return { tree: t, rot: kase };
  }

  function insertTrace(t0, key) {
    let t = clone(t0);
    const steps = [];
    const path = [];
    if (!t) {
      t = { key, left: null, right: null, h: 1 };
      steps.push({ text: `Tree is empty, so ${key} becomes the root. BF = 0.`, tree: snap(t), fresh: [key], rot: null });
      return { tree: t, steps, rot: null };
    }
    let cur = t;
    const dirs = [];
    for (;;) {
      const c = cmp(key, cur.key);
      if (c === 0) { steps.push({ text: `${key} is already in the tree. Duplicates are not allowed.`, tree: snap(t), hl: [key], rot: null }); return { tree: t, steps, dup: true }; }
      path.push(cur);
      const d = c < 0 ? 'left' : 'right';
      dirs.push(`${key} ${c < 0 ? '<' : '>'} ${cur.key} → ${d}`);
      if (!cur[d]) { cur[d] = { key, left: null, right: null, h: 1 }; break; }
      cur = cur[d];
    }
    fix(t);
    let z = null;
    for (let i = path.length - 1; i >= 0; i--) if (Math.abs(bf(path[i])) > 1) { z = path[i]; break; }
    steps.push({ text: `Insert ${key} like a BST (${dirs.join(', ')}). Update the balance factors.` + (z ? '' : ' Every BF is −1, 0 or +1, so no rotation is needed.'), tree: snap(t), fresh: [key], bad: z ? [z.key] : [], rot: null });
    if (!z) return { tree: t, steps, rot: null };
    const r = rebalance(t, z, steps, (zz, side) => {
      if (side === 'L') return cmp(key, zz.left.key) < 0 ? 'LL' : 'LR';
      return cmp(key, zz.right.key) > 0 ? 'RR' : 'RL';
    });
    return { tree: r.tree, steps, rot: r.rot };
  }

  function deleteTrace(t0, key) {
    let t = clone(t0);
    fix(t);
    const steps = [];
    const path = [];
    let parent = null, cur = t;
    while (cur && cmp(key, cur.key) !== 0) { path.push(cur); parent = cur; cur = cmp(key, cur.key) < 0 ? cur.left : cur.right; }
    if (!cur) { steps.push({ text: `${key} is not in the tree.`, tree: snap(t) }); return { tree: t, steps, missing: true }; }
    const setChild = (p, oldN, n) => { if (!p) t = n; else if (p.left === oldN) p.left = n; else p.right = n; };
    if (cur.left && cur.right) {
      path.push(cur);
      let sp = cur, s = cur.right;
      while (s.left) { path.push(s); sp = s; s = s.left; }
      if (sp !== cur) path.push(sp);
      steps.push({ text: `${key} has two children. Replace it with its inorder successor ${s.key} (smallest in the right subtree), then delete ${s.key} from below.`, tree: snap(t), bad: [key], hl: [s.key] });
      if (sp === cur) sp.right = s.right; else sp.left = s.right;
      cur.key = s.key;
    } else {
      const child = cur.left || cur.right;
      steps.push({ text: `${key} has ${child ? 'one child' : 'no children'}. ${child ? `Link ${child.key} to ${parent ? parent.key : 'the root'}` : 'Remove it'}.`, tree: snap(t), bad: [key] });
      setChild(parent, cur, child);
    }
    fix(t);
    steps.push({ text: `After deleting ${key}, update the balance factors going up.`, tree: snap(t) });
    // walk up the path (nodes may have moved after rotations, so use references)
    const seen = new Set();
    for (let i = path.length - 1; i >= 0; i--) {
      const n = path[i];
      if (seen.has(n)) continue;
      seen.add(n);
      fix(t);
      if (Math.abs(bf(n)) > 1) {
        const r = rebalance(t, n, steps, (zz, side) => {
          if (side === 'L') return bf(zz.left) >= 0 ? 'LL' : 'LR';
          return bf(zz.right) <= 0 ? 'RR' : 'RL';
        });
        t = r.tree;
      }
    }
    fix(t);
    steps.push({ text: 'The tree is balanced again.', tree: snap(t) });
    return { tree: t, steps };
  }

  function fromSequence(keys) {
    let t = null;
    const all = [];
    const snaps = [];
    for (const k of keys) {
      const r = insertTrace(t, k);
      t = r.tree;
      r.steps.forEach((s) => all.push(Object.assign({ key: k }, s)));
      if (!r.dup) snaps.push({ key: k, rot: r.rot, tree: snap(t), before: r.rot ? r.steps[0].tree : null, beforeBad: r.rot ? r.steps[0].bad : null });
    }
    return { tree: t, steps: all, snaps };
  }

  function isAVL(t) {
    let ok = true;
    (function w(n) {
      if (!n) return 0;
      const l = w(n.left), r = w(n.right);
      if (Math.abs(l - r) > 1) ok = false;
      if (n.h !== undefined && n.h !== 1 + Math.max(l, r)) ok = false;
      return 1 + Math.max(l, r);
    })(t);
    return ok && B.isBST(t);
  }

  const X = { insertTrace, deleteTrace, fromSequence, isAVL, annotate, fix, bf };
  root.DSA = root.DSA || {};
  root.DSA.avl = X;
  if (typeof module === 'object' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
