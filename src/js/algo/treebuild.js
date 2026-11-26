// Build a binary tree from inorder + preorder, or inorder + postorder, with a step trace.
(function (root) {
  function validate(inorder, other, name) {
    if (!inorder.length) return 'Type the inorder traversal.';
    if (inorder.length !== other.length) return `Inorder has ${inorder.length} items but ${name} has ${other.length}. They must have the same nodes.`;
    const a = new Set(inorder.map(String)), b = new Set(other.map(String));
    if (a.size !== inorder.length) return 'Inorder has repeated values. Every node must be unique for this method.';
    for (const x of b) if (!a.has(x)) return `"${x}" is in ${name} but not in inorder.`;
    return null;
  }

  function build(inorder, other, kind) {
    inorder = inorder.map(String); other = other.map(String);
    const name = kind === 'pre' ? 'preorder' : 'postorder';
    const err = validate(inorder, other, name);
    if (err) return { error: err, steps: [] };
    const steps = [];
    let tree = null;
    const index = new Map(inorder.map((v, i) => [v, i]));
    let p = kind === 'pre' ? 0 : other.length - 1;
    let bad = null;

    function snapshot() { return JSON.parse(JSON.stringify(tree)); }

    // returns subtree; attach via setter so we can snapshot the partial tree
    function rec(lo, hi, attach, label) {
      if (lo > hi || bad) return null;
      const v = other[p];
      const at = index.get(v);
      if (at === undefined || at < lo || at > hi) { bad = `The traversals don't match: ${v} cannot be the root of ${label}. Check the input.`; return null; }
      kind === 'pre' ? p++ : p--;
      const n = { key: v, left: null, right: null };
      attach(n);
      const left = inorder.slice(lo, at), right = inorder.slice(at + 1, hi + 1);
      steps.push({
        text: `${kind === 'pre' ? 'Next in preorder' : 'Next from the end of postorder'} is ${v}, so ${v} is the root of ${label}. In inorder, ${v} splits it into left [${left.join(' ') || 'empty'}] and right [${right.join(' ') || 'empty'}].`,
        tree: snapshot(), fresh: [v], left, right, root: v,
      });
      if (kind === 'pre') {
        rec(lo, at - 1, (c) => (n.left = c), `the left part of ${v}`);
        rec(at + 1, hi, (c) => (n.right = c), `the right part of ${v}`);
      } else {
        rec(at + 1, hi, (c) => (n.right = c), `the right part of ${v}`);
        rec(lo, at - 1, (c) => (n.left = c), `the left part of ${v}`);
      }
      return n;
    }
    rec(0, inorder.length - 1, (n) => (tree = n), 'the whole tree');
    if (bad) return { error: bad, steps };
    return { tree, steps };
  }

  const fromInPre = (inorder, pre) => build(inorder, pre, 'pre');
  const fromInPost = (inorder, post) => build(inorder, post, 'post');

  const X = { fromInPre, fromInPost };
  root.DSA = root.DSA || {};
  root.DSA.treebuild = X;
  if (typeof module === 'object' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
