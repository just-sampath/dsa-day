// Tree playgrounds: terminology explorer, traversals, BST, AVL, tree-from-traversals.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, esc, icon, parseKeys, uniqueRandom } = DSA.util;
  const kit = DSA.kit;
  const B = () => DSA.bst;

  function treeStage(host, opts) {
    const stage = h('div.stage.tall');
    host.append(stage);
    const scene = new DSA.Scene(stage, Object.assign({ minScale: 0.5, label: 'Tree' }, opts || {}));
    return { stage, scene };
  }

  /* ---------- Terminology explorer ---------- */
  DSA.viz['tree-terms'] = function (el) {
    const T = (k, l, r) => ({ key: k, left: l || null, right: r || null });
    const tree = T('A', T('B', T('D', T('G')), T('E', null, T('H'))), T('C', T('F', null, T('I'))));
    const f = kit.frame(el, { title: 'Tap any node to see its family facts', hint: 'Every word examiners use (parent, child, sibling, leaf, degree, depth, height…) for the node you tap.', tag: 'Explorer' });
    const { stage, scene } = treeStage(f.body);
    const info = h('div', { style: 'padding: 12px 16px' });
    f.body.append(info);
    const parentOf = new Map(), nodeOf = new Map();
    (function w(n, p) { if (!n) return; parentOf.set(n.key, p); nodeOf.set(n.key, n); w(n.left, n.key); w(n.right, n.key); })(tree, null);
    const kids = (n) => [n.left, n.right].filter(Boolean).map((c) => c.key);
    const depth = (k) => { let d = 0; while (parentOf.get(k)) { k = parentOf.get(k); d++; } return d; };
    const heightE = (n) => (!n ? -1 : 1 + Math.max(heightE(n.left), heightE(n.right)));
    const desc = (n) => (!n ? [] : [n.key].concat(desc(n.left), desc(n.right)));
    function select(k) {
      const n = nodeOf.get(k);
      const p = parentOf.get(k);
      const sib = p ? kids(nodeOf.get(p)).filter((x) => x !== k) : [];
      const anc = []; let x = p; while (x) { anc.push(x); x = parentOf.get(x); }
      const d = desc(n).slice(1);
      scene.render(DSA.draw.treeSpec(tree, { visit: [k], hl: kids(n), done: anc, sub: null }));
      const leaf = !n.left && !n.right;
      info.innerHTML = '';
      info.append(h('dl.kv', null,
        h('dt', null, 'Node'), h('dd', null, `${k} ${k === 'A' ? '(the root: no parent)' : ''}`),
        h('dt', null, 'Type'), h('dd', null, leaf ? 'Leaf (external) node: no children' : k === 'A' ? 'Root, also an internal node' : 'Internal node: has at least one child'),
        h('dt', null, 'Parent'), h('dd', null, p || 'none'),
        h('dt', null, 'Children'), h('dd', null, kids(n).join(', ') || 'none'),
        h('dt', null, 'Siblings'), h('dd', null, sib.join(', ') || 'none'),
        h('dt', null, 'Degree'), h('dd', null, `${kids(n).length} (number of children)`),
        h('dt', null, 'Depth / level'), h('dd', null, `${depth(k)} (edges from the root; some books count the root as level 1, then it is ${depth(k) + 1})`),
        h('dt', null, 'Height of node'), h('dd', null, `${heightE(n)} (edges on the longest path down to a leaf)`),
        h('dt', null, 'Ancestors'), h('dd', null, anc.join(', ') || 'none'),
        h('dt', null, 'Descendants'), h('dd', null, d.join(', ') || 'none')));
      f.say(`Whole tree: 9 nodes, 8 edges (always n − 1), height ${heightE(tree)}, leaves G, H, I. Blue = selected, yellow = its children, light = its ancestors.`);
      DSA.store.awardOnce('terms:' + k, 1, 'Explored a node');
    }
    stage.addEventListener('click', (e) => { const g = e.target.closest('.sc-node'); if (g && g.dataset.key) select(g.dataset.key.slice(1)); });
    stage.style.cursor = 'pointer';
    select('B');
  };

  /* ---------- Traversals ---------- */
  DSA.viz['traversal-play'] = function (el) {
    let tree = B().fromSequence([50, 30, 70, 20, 40, 60, 80]).tree;
    let kind = 'in';
    const RULE = { pre: 'Preorder = Root → Left → Right', in: 'Inorder = Left → Root → Right', post: 'Postorder = Left → Right → Root', level: 'Level order = level by level, left to right (uses a queue)' };
    const f = kit.frame(el, { title: 'Watch the traversal walk', hint: 'Choose a traversal and press Play. The blue node is being printed now.' });
    const seg = kit.seg([['pre', 'Preorder'], ['in', 'Inorder'], ['post', 'Postorder'], ['level', 'Level order']], kind, (v) => { kind = v; run(); }, 'Traversal');
    const inp = kit.input({ value: '50 30 70 20 40 60 80', label: 'Build a BST from these keys', cls: 'mono', size: 18, onenter: () => rebuild() });
    f.inputs.append(seg, h('div.grow', null, inp.input), kit.btn('Build tree', () => rebuild()), kit.btn('Random', () => { inp.input.value = uniqueRandom(7, 10, 99).join(' '); rebuild(); }));
    const box = h('div');
    const { scene } = treeStage(box);
    const out = h('div.panels');
    box.append(out);
    f.body.append(box);
    let bounds = null;
    const stepper = new DSA.Stepper(box, { render: (s) => {
      scene.render(DSA.draw.treeSpec(tree, { visit: s.cur !== null ? [s.cur] : [], done: s.order.slice(0, -1) }), { bounds });
      out.textContent = '';
      out.append(kit.panel('Printed so far', kit.tokens(s.order, (t, k) => (k === s.order.length - 1 ? '.new' : ''))));
      out.append(kit.panel('Rule', h('div.small', null, RULE[kind])));
    }, speed: 900, xpKey: 'trav', xpTag: () => kind });
    function rebuild() {
      const keys = parseKeys(inp.input.value).slice(0, 15);
      if (!keys.length) { f.say('Type a few numbers first.', 'bad'); return; }
      tree = B().fromSequence(keys).tree;
      run();
    }
    function run() {
      const order = kind === 'pre' ? B().preorder(tree) : kind === 'in' ? B().inorder(tree) : kind === 'post' ? B().postorder(tree) : B().levelorder(tree);
      const steps = [{ text: RULE[kind] + '. Press Play or Next.', cur: null, order: [] }];
      order.forEach((k, i) => steps.push({ text: `Print ${k}.`, cur: k, order: order.slice(0, i + 1), ask: 'Which node is printed next?' }));
      steps.push({ text: `${kind === 'in' ? 'Inorder' : kind === 'pre' ? 'Preorder' : kind === 'post' ? 'Postorder' : 'Level order'}: ${order.join(' ')}` + (kind === 'in' ? '. Notice: inorder of a BST is always sorted!' : '.'), cur: null, order });
      bounds = DSA.draw.stableBounds([DSA.draw.treeSpec(tree, {})]);
      stepper.load(steps);
      f.say(`<b>${RULE[kind]}</b>`);
    }
    run();
  };

  /* ---------- BST playground ---------- */
  DSA.viz['bst-play'] = function (el) {
    let tree = B().fromSequence([50, 30, 70, 20, 40, 60, 80]).tree;
    const f = kit.frame(el, { title: 'Binary search tree playground', hint: 'Smaller keys go <b>left</b>, bigger keys go <b>right</b>. Insert, search or delete a key and step through the comparisons. Deleting shows all 3 cases.' });
    const key = kit.input({ value: '65', label: 'Key', size: 4, inputmode: 'numeric', onenter: () => op('insert') });
    const seq = kit.input({ value: '50 30 70 20 40 60 80', label: 'Insert keys in this order', cls: 'mono', size: 18, onenter: () => build() });
    f.inputs.append(h('label.field', null, 'key', key.input), kit.btn('Insert', () => op('insert'), 'btn-primary'), kit.btn('Search', () => op('search')), kit.btn('Delete', () => op('delete')),
      h('span', { style: 'flex-basis:100%;height:0' }), h('div.grow', null, seq.input), kit.btn('Build from list', () => build()), kit.btn('Random', () => { seq.input.value = uniqueRandom(8, 10, 99).join(' '); build(); }));
    const box = h('div');
    const { scene } = treeStage(box);
    const trav = h('div.panels');
    box.append(trav);
    f.body.append(box);
    let bounds = null;
    const stepper = new DSA.Stepper(box, { render: (s) => {
      scene.render(DSA.draw.treeSpec(s.tree, { hl: s.hl, fresh: s.fresh, del: s.del, path: s.path }), { bounds });
      showTrav(s.tree);
    }, xpKey: 'bst' });
    function showTrav(t) {
      trav.textContent = '';
      trav.append(kit.panel('Inorder (always sorted)', kit.tokens(B().inorder(t))));
      trav.append(kit.panel('Preorder', kit.tokens(B().preorder(t))));
      trav.append(kit.panel('Postorder', kit.tokens(B().postorder(t))));
    }
    function load(steps, msg) {
      bounds = DSA.draw.stableBounds(steps.map((s) => DSA.draw.treeSpec(s.tree, {})));
      stepper.load(steps);
      if (msg) f.say(msg);
    }
    function build() {
      const keys = parseKeys(seq.input.value).slice(0, 15);
      if (!keys.length) { f.say('Type some keys first.', 'bad'); return; }
      const r = B().fromSequence(keys);
      tree = r.tree;
      load([{ text: 'Empty tree. Each step inserts the next key.', tree: null }].concat(r.steps.map((s) => ({ text: s.text, tree: s.tree, fresh: s.fresh, ask: `Where does ${s.key} go?` }))), `Built from ${keys.length} keys. Step through to see each insertion.`);
    }
    function op(kind) {
      const raw = key.input.value.trim();
      if (!raw) { f.say('Type a key first.', 'bad'); return; }
      const k = /^-?\d+$/.test(raw) ? Number(raw) : raw.toUpperCase();
      let r;
      if (kind === 'insert') {
        if (B().size(tree) >= 15) { f.say('15 nodes is plenty for this screen. Delete some first.', 'bad'); return; }
        r = B().insertTrace(tree, k);
      } else if (kind === 'search') r = B().searchTrace(tree, k);
      else r = B().deleteTrace(tree, k);
      const before = { text: kind === 'insert' ? `Insert ${k}: start at the root.` : kind === 'search' ? `Search for ${k}: start at the root.` : `Delete ${k}: first find it.`, tree: tree };
      load([before].concat(r.steps), '');
      if (r.tree) tree = r.tree;
      DSA.store.awardOnce('bst:' + kind, 3, 'BST ' + kind);
      key.input.value = String(DSA.util.randInt(10, 99));
    }
    build();
    stepper.go(stepper.steps.length - 1, true);
  };

  /* ---------- AVL playground ---------- */
  DSA.viz['avl-play'] = function (el) {
    let tree = null;
    const f = kit.frame(el, { title: 'AVL tree builder', hint: 'Insert keys one by one. The small number beside each node is its <b>balance factor</b> = height(left) − height(right). When any BF becomes +2 or −2, the tree rotates. Step through to see which case (LL, RR, LR, RL) and which rotation.' });
    const key = kit.input({ value: '25', label: 'Key', size: 4, inputmode: 'numeric', onenter: () => ins() });
    const seq = kit.input({ value: el.dataset.keys || '10 20 30 25 28 27', label: 'Insert keys in this order', cls: 'mono', size: 18, onenter: () => build() });
    f.inputs.append(h('label.field', null, 'key', key.input), kit.btn('Insert', () => ins(), 'btn-primary'), kit.btn('Delete', () => del()),
      h('span', { style: 'flex-basis:100%;height:0' }), h('div.grow', null, seq.input), kit.btn('Build from list', () => build()), kit.btn('Random', () => { seq.input.value = uniqueRandom(8, 1, 60).join(' '); build(); }));
    const box = h('div');
    const { scene } = treeStage(box);
    const rotBar = h('div.panels');
    box.append(rotBar);
    f.body.append(box);
    let bounds = null;
    const stepper = new DSA.Stepper(box, { render: (s) => {
      scene.render(DSA.draw.treeSpec(s.tree, { showBF: true, hl: s.hl, fresh: s.fresh, bad: s.bad }), { bounds });
      rotBar.textContent = '';
      rotBar.append(kit.panel('Case', h('div', null, s.rot ? h('span.pill.bad', null, s.rot + ' → ' + { LL: 'right rotation', RR: 'left rotation', LR: 'left + right rotation', RL: 'right + left rotation' }[s.rot]) : h('span.pill.ok', null, 'balanced'))));
      if (s.key !== undefined) rotBar.append(kit.panel('Inserting', h('div.tokens', null, h('span.tok.hl', null, String(s.key)))));
    }, xpKey: 'avl' });
    function load(steps, msg) {
      bounds = DSA.draw.stableBounds(steps.map((s) => DSA.draw.treeSpec(s.tree, { showBF: true })));
      stepper.load(steps);
      f.say(msg || '');
    }
    function build() {
      const keys = parseKeys(seq.input.value).slice(0, 15);
      if (!keys.length) { f.say('Type some keys first.', 'bad'); return; }
      const r = DSA.avl.fromSequence(keys);
      tree = r.tree;
      const rots = r.snaps.filter((s) => s.rot).map((s) => `${s.key}: ${s.rot}`);
      load([{ text: 'Empty tree.', tree: null }].concat(r.steps.map((s) => Object.assign({ ask: s.rot ? 'Which rotation fixes this?' : `Insert ${s.key}: does anything become unbalanced?` }, s))),
        rots.length ? `Rotations needed: ${rots.join(', ')}.` : 'No rotations needed for this order.');
    }
    function ins() {
      const raw = key.input.value.trim();
      if (!raw) return;
      const k = /^-?\d+$/.test(raw) ? Number(raw) : raw.toUpperCase();
      if (B().size(tree) >= 15) { f.say('15 nodes is plenty here. Delete some first.', 'bad'); return; }
      const r = DSA.avl.insertTrace(tree, k);
      tree = r.tree;
      load([{ text: `Insert ${k}.`, tree: DSA.avl.annotate(JSON.parse(JSON.stringify(r.steps[0].tree))), key: k }].concat(r.steps.map((s) => Object.assign({ key: k }, s))).slice(1), r.rot ? `${r.rot} rotation happened.` : 'No rotation needed.');
      DSA.store.awardOnce('avl:ins', 3, 'AVL insert');
      key.input.value = String(DSA.util.randInt(1, 60));
    }
    function del() {
      const raw = key.input.value.trim();
      const k = /^-?\d+$/.test(raw) ? Number(raw) : raw.toUpperCase();
      const r = DSA.avl.deleteTrace(tree, k);
      tree = r.tree;
      load(r.steps, r.missing ? `${k} is not in the tree.` : 'Deleted. Rotations (if any) are shown step by step.');
    }
    build();
    stepper.go(stepper.steps.length - 1, true);
  };

  /* ---------- Build a tree from two traversals ---------- */
  DSA.viz['treebuild-play'] = function (el) {
    let kind = 'pre';
    const f = kit.frame(el, { title: 'Construct a binary tree from two traversals', hint: 'Preorder gives roots from the <b>front</b>, postorder gives roots from the <b>back</b>. Inorder tells you which nodes go <b>left</b> and <b>right</b> of each root.' });
    const inIn = kit.input({ value: 'D B E A F C', label: 'Inorder', cls: 'mono wide', onenter: () => go() });
    const other = kit.input({ value: 'A B D E C F', label: 'Preorder or postorder', cls: 'mono wide', onenter: () => go() });
    const lab = h('span.field', null, 'Preorder');
    const seg = kit.seg([['pre', 'Inorder + Preorder'], ['post', 'Inorder + Postorder']], kind, (v) => {
      kind = v;
      lab.textContent = v === 'pre' ? 'Preorder' : 'Postorder';
      if (v === 'post') { inIn.input.value = '4 2 5 1 6 3 7'; other.input.value = '4 5 2 6 7 3 1'; }
      else { inIn.input.value = 'D B E A F C'; other.input.value = 'A B D E C F'; }
      go();
    }, 'Which traversals');
    f.inputs.append(seg, h('span', { style: 'flex-basis:100%;height:0' }), h('span.field', null, 'Inorder'), h('div.grow', null, inIn.input), h('span', { style: 'flex-basis:100%;height:0' }), lab, h('div.grow', null, other.input), kit.btn('Build', () => go(), 'btn-primary'));
    const box = h('div');
    const { scene } = treeStage(box);
    const parts = h('div.panels');
    box.append(parts);
    f.body.append(box);
    let bounds = null, inorder = [];
    const stepper = new DSA.Stepper(box, { render: (s) => {
      scene.render(DSA.draw.treeSpec(s.tree, { fresh: s.root ? [s.root] : [] }), { bounds });
      parts.textContent = '';
      if (s.root) {
        parts.append(kit.panel('Root found', kit.tokens([s.root], () => '.hl')));
        parts.append(kit.panel('Goes left', kit.tokens(s.left)));
        parts.append(kit.panel('Goes right', kit.tokens(s.right)));
      } else parts.append(kit.panel('Inorder', kit.tokens(inorder)));
    }, xpKey: 'build' });
    function go() {
      inorder = DSA.util.parseList(inIn.input.value);
      const o = DSA.util.parseList(other.input.value);
      const r = kind === 'pre' ? DSA.treebuild.fromInPre(inorder, o) : DSA.treebuild.fromInPost(inorder, o);
      if (r.error) { f.say(r.error, 'bad'); return; }
      const steps = [{ text: kind === 'pre' ? 'The FIRST item of preorder is always the root.' : 'The LAST item of postorder is always the root.', tree: null }]
        .concat(r.steps.map((s) => Object.assign({ ask: 'Which node is the next root, and what goes left/right?' }, s)));
      const fin = r.tree;
      steps.push({ text: `Done. Check: preorder ${B().preorder(fin).join(' ')}, inorder ${B().inorder(fin).join(' ')}, postorder ${B().postorder(fin).join(' ')}.`, tree: fin });
      bounds = DSA.draw.stableBounds([DSA.draw.treeSpec(fin, {})]);
      stepper.load(steps);
      f.say(`Built! ${kind === 'pre' ? 'Postorder' : 'Preorder'} of this tree: <code>${esc((kind === 'pre' ? B().postorder(fin) : B().preorder(fin)).join(' '))}</code>`, 'ok');
    }
    go();
  };
})(typeof window !== 'undefined' ? window : globalThis);
