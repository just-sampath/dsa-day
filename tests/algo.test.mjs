// Checks the algorithm modules against hand-verified textbook answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const infix = require('../src/js/algo/infix.js');
const ll = require('../src/js/algo/linkedlist.js');
const cq = require('../src/js/algo/cqueue.js');
const bst = require('../src/js/algo/bst.js');
const avl = require('../src/js/algo/avl.js');
const btree = require('../src/js/algo/btree.js');
const hash = require('../src/js/algo/hashing.js');
const tb = require('../src/js/algo/treebuild.js');
const graph = require('../src/js/algo/graph.js');

test('infix to postfix', () => {
  const cases = {
    'A+B*C': 'ABC*+',
    '(A+B)*C': 'AB+C*',
    'A^B^C': 'ABC^^',
    'A-B+C': 'AB-C+',
    'A+B*(C^D-E)^(F+G*H)-I': 'ABCD^E-FGH*+^*+I-',
    'a+b*c-d/e': 'abc*+de/-',
    'K+L-M*N+(O^P)*W/U/V*T+Q': 'KL+MN*-OP^W*U/V/T*+Q+',
    '((A+B)-C*(D/E))+F': 'AB+CDE/*-F+',
    'A*(B+C)/D': 'ABC+*D/',
  };
  for (const [inp, out] of Object.entries(cases)) assert.equal(infix.toPostfix(inp).postfix, out, inp);
  assert.ok(infix.toPostfix('A+*B').error);
  assert.ok(infix.toPostfix('(A+B').error);
});

test('infix to prefix', () => {
  assert.equal(infix.toPrefix('A+B*C').prefix, '+A*BC');
  assert.equal(infix.toPrefix('(A+B)*C').prefix, '*+ABC');
  assert.equal(infix.toPrefix('A-B+C').prefix, '+-ABC');
  assert.equal(infix.toPrefix('A^B^C').prefix, '^A^BC');
  assert.equal(infix.toPrefix('(A-B/C)*(A/K-L)').prefix, '*-A/BC-/AKL');
});

test('postfix evaluation', () => {
  assert.equal(infix.evalPostfix('5 3 + 8 2 - *').value, 48);
  assert.equal(infix.evalPostfix('2 3 1 * + 9 -').value, -4);
  assert.equal(infix.evalPostfix('231*+9-').value, -4);
  assert.equal(infix.evalPostfix('6 2 3 + - 3 8 2 / + * 2 ^ 3 +').value, 52);
  assert.ok(infix.evalPostfix('5 +').error);
});

test('bracket matching', () => {
  assert.equal(infix.checkBrackets('{[()]}').ok, true);
  assert.equal(infix.checkBrackets('([)]').ok, false);
  assert.equal(infix.checkBrackets('((a+b)').ok, false);
  assert.equal(infix.checkBrackets('a+b)').ok, false);
  assert.equal(infix.checkBrackets('{a*(b+c)-[d/e]}').ok, true);
});

test('linked lists keep correct order for every operation', () => {
  for (const mode of ['sll', 'dll', 'cll']) {
    let st = ll.make(mode, [10, 20, 30]);
    const step = (op, a, b) => { const r = ll.run(st, op, a, b); assert.ok(!r.error, mode + ' ' + op + ' ' + r.error); st = r.final; return r; };
    step('insertFront', 5);
    assert.deepEqual(ll.values(st), [5, 10, 20, 30], mode);
    step('insertEnd', 40);
    assert.deepEqual(ll.values(st), [5, 10, 20, 30, 40], mode);
    step('insertAt', 3, 15);
    assert.deepEqual(ll.values(st), [5, 10, 15, 20, 30, 40], mode);
    step('deleteFront');
    assert.deepEqual(ll.values(st), [10, 15, 20, 30, 40], mode);
    step('deleteEnd');
    assert.deepEqual(ll.values(st), [10, 15, 20, 30], mode);
    step('deleteAt', 2);
    assert.deepEqual(ll.values(st), [10, 20, 30], mode);
    const s = step('search', 30);
    assert.equal(s.steps[s.steps.length - 1].state.found, 3, mode);
    step('reverse');
    assert.deepEqual(ll.values(st), [30, 20, 10], mode);
    if (mode === 'dll') {
      // prev pointers must mirror next pointers
      const ids = ll.chain(st);
      ids.forEach((id, i) => assert.equal(st.nodes[id].prev, i ? ids[i - 1] : null));
    }
    if (mode === 'cll') {
      const ids = ll.chain(st);
      assert.equal(st.nodes[ids[ids.length - 1]].next, st.head);
    }
    step('deleteAt', 3);
    step('deleteFront');
    step('deleteEnd');
    assert.deepEqual(ll.values(st), [], mode);
    step('insertEnd', 7);
    assert.deepEqual(ll.values(st), [7], mode);
  }
});

test('circular queue', () => {
  let q = cq.make(5);
  for (const x of [10, 20, 30, 40, 50]) q = cq.enqueue(q, x).q;
  assert.equal(cq.enqueue(q, 60).ok, false);
  q = cq.dequeue(q).q;
  q = cq.dequeue(q).q;
  q = cq.enqueue(q, 60).q;
  assert.equal(q.rear, 0);
  assert.equal(q.arr[0], 60);
  assert.equal(q.front, 2);
  assert.equal(cq.count(q), 4);
});

test('BST and traversals', () => {
  const { tree } = bst.fromSequence([50, 30, 70, 20, 40, 60, 80]);
  assert.deepEqual(bst.inorder(tree), [20, 30, 40, 50, 60, 70, 80]);
  assert.deepEqual(bst.preorder(tree), [50, 30, 20, 40, 70, 60, 80]);
  assert.deepEqual(bst.postorder(tree), [20, 40, 30, 60, 80, 70, 50]);
  assert.deepEqual(bst.levelorder(tree), [50, 30, 70, 20, 40, 60, 80]);
  let t = bst.deleteTrace(tree, 20).tree; // leaf
  t = bst.deleteTrace(t, 30).tree; // one child
  t = bst.deleteTrace(t, 50).tree; // two children → successor 60
  assert.equal(t.key, 60);
  assert.deepEqual(bst.inorder(t), [40, 60, 70, 80]);
  assert.ok(bst.isBST(t));
});

test('AVL rotations', () => {
  const lvl = (keys) => bst.levelorder(avl.fromSequence(keys).tree);
  assert.deepEqual(lvl([10, 20, 30]), [20, 10, 30]); // RR
  assert.deepEqual(lvl([30, 20, 10]), [20, 10, 30]); // LL
  assert.deepEqual(lvl([30, 10, 20]), [20, 10, 30]); // LR
  assert.deepEqual(lvl([10, 30, 20]), [20, 10, 30]); // RL
  assert.deepEqual(lvl([1, 2, 3, 4, 5, 6, 7]), [4, 2, 6, 1, 3, 5, 7]);
  const r = avl.fromSequence([10, 20, 30]);
  assert.equal(r.snaps[2].rot, 'RR');
  assert.equal(avl.fromSequence([30, 10, 20]).snaps[2].rot, 'LR');
  // textbook example: 50 20 60 10 8 15 32 46 11 48
  const big = avl.fromSequence([50, 20, 60, 10, 8, 15, 32, 46, 11, 48]);
  assert.ok(avl.isAVL(big.tree));
  // random sequences keep the AVL property; deletions too
  for (let trial = 0; trial < 200; trial++) {
    const keys = [...new Set(Array.from({ length: 25 }, () => Math.floor(Math.random() * 100)))];
    let t = avl.fromSequence(keys).tree;
    assert.ok(avl.isAVL(t));
    assert.deepEqual(bst.inorder(t), keys.slice().sort((a, b) => a - b));
    for (const k of keys.slice(0, 10)) { t = avl.deleteTrace(t, k).tree; assert.ok(avl.isAVL(t), 'after delete ' + k); }
    assert.equal(bst.size(t), keys.length - 10);
  }
});

test('B-tree insertion', () => {
  const r = btree.fromSequence([1, 2, 3, 4, 5, 6, 7], 3);
  assert.deepEqual(btree.levelsOf(r.T.root), [[[4]], [[2], [6]], [[1], [3], [5], [7]]]);
  for (const m of [3, 4, 5, 6]) {
    for (let trial = 0; trial < 100; trial++) {
      const keys = [...new Set(Array.from({ length: 40 }, () => Math.floor(Math.random() * 200)))];
      const t = btree.fromSequence(keys, m).T;
      assert.ok(btree.check(t), `order ${m}`);
    }
  }
  // order 5 letters example
  const letters = 'C N G A H E K Q M F W L T Z D P R X Y S'.split(' ');
  const L = btree.fromSequence(letters, 5).T;
  assert.ok(btree.check(L));
});

test('hashing', () => {
  const keys = [72, 27, 36, 24, 63, 81, 92, 101];
  const lin = hash.build(keys, 10, 'linear').table;
  assert.deepEqual(lin, [null, 81, 72, 63, 24, 92, 36, 27, 101, null]);
  const ch = hash.build(keys, 10, 'chaining').table;
  assert.deepEqual(ch[1], [81, 101]);
  assert.deepEqual(ch[2], [72, 92]);
  const quad = hash.build(keys, 10, 'quadratic').table;
  // 92: 2 busy, 3 busy, 6 busy, 11%10=1 busy, 18%10=8 free
  assert.equal(quad.indexOf(92), 8);
  const dbl = hash.build(keys, 10, 'double');
  assert.equal(dbl.R, 7);
  assert.equal(hash.primeBelow(13), 11);
  assert.equal(hash.folding(123456, 1000).value, 579);
});

test('tree from traversals', () => {
  const a = tb.fromInPost('4 2 5 1 6 3 7'.split(' '), '4 5 2 6 7 3 1'.split(' '));
  assert.deepEqual(bst.preorder(a.tree), '1 2 4 5 3 6 7'.split(' '));
  const b = tb.fromInPre('D B E A F C'.split(' '), 'A B D E C F'.split(' '));
  assert.deepEqual(bst.postorder(b.tree), 'D E B F C A'.split(' '));
  assert.ok(tb.fromInPre('A B C'.split(' '), 'A B D'.split(' ')).error);
});

test('graphs', () => {
  const g = graph.PRESETS.trav;
  assert.deepEqual(graph.bfs(g, 'A').order, ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  assert.deepEqual(graph.dfs(g, 'A').order, ['A', 'B', 'E', 'C', 'F', 'D', 'G']);
  const m = graph.PRESETS.mst;
  assert.equal(graph.prim(m, 'A').total, 17);
  assert.equal(graph.kruskal(m).total, 17);
  const c = graph.PRESETS.clrs;
  assert.equal(graph.prim(c, 'a').total, 37);
  assert.equal(graph.kruskal(c).total, 37);
  assert.equal(graph.kruskal(c).chosen.length, 8);
  const M = graph.adjacencyMatrix(graph.PRESETS.small);
  assert.deepEqual(M[0], [0, 1, 1, 0, 0]);
  assert.ok(graph.spanningCheck(graph.PRESETS.span, ['A-C', 'C-D', 'A-B']).ok);
  assert.equal(graph.spanningCheck(graph.PRESETS.span, ['A-C', 'C-D', 'A-D']).cycle, true);
});
