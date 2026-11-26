// B-tree insertion playground (order 3, 4 or 5).
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, parseKeys, uniqueRandom, randInt } = DSA.util;
  const kit = DSA.kit;

  DSA.viz['btree-play'] = function (el) {
    let m = Number(el.dataset.order || 3);
    let T = DSA.btree.make(m);
    const f = kit.frame(el, { title: 'B-tree builder', hint: 'Order <b>m</b> means a node can have at most <b>m children</b> and <b>m − 1 keys</b>. Insert always happens in a <b>leaf</b>. If a node gets too many keys, it <b>splits</b> and the middle key moves up.' });
    const ordSel = kit.select([[3, 'Order 3 (max 2 keys)'], [4, 'Order 4 (max 3 keys)'], [5, 'Order 5 (max 4 keys)']], m, (v) => { m = Number(v); build(); }, 'Order of the B-tree');
    const key = kit.input({ value: '25', label: 'Key', size: 4, inputmode: 'numeric', onenter: () => ins() });
    const seq = kit.input({ value: el.dataset.keys || '10 20 30 40 50 60 70 80 90', label: 'Insert keys in this order', cls: 'mono', size: 22, onenter: () => build() });
    f.inputs.append(ordSel, h('label.field', null, 'key', key.input), kit.btn('Insert', () => ins(), 'btn-primary'),
      h('span', { style: 'flex-basis:100%;height:0' }), h('div.grow', null, seq.input), kit.btn('Build from list', () => build()), kit.btn('Random', () => { seq.input.value = uniqueRandom(12, 1, 99).join(' '); build(); }));
    const box = h('div');
    const stage = h('div.stage.tall');
    box.append(stage);
    const rules = h('div.panels');
    box.append(rules);
    f.body.append(box);
    const scene = new DSA.Scene(stage, { minScale: 0.5, label: 'B-tree' });
    let bounds = null;
    const stepper = new DSA.Stepper(box, { render: (s) => {
      scene.render(DSA.draw.btreeSpec(s.tree, { hl: s.hl, fresh: s.fresh, bad: s.bad }), { bounds });
    }, xpKey: 'btree' });
    function showRules() {
      rules.textContent = '';
      rules.append(kit.panel(`Rules for order ${m}`, h('div.small', { html: `Max keys per node: <b>${m - 1}</b> · Max children: <b>${m}</b><br>Min keys (non-root): <b>⌈${m}/2⌉ − 1 = ${Math.ceil(m / 2) - 1}</b> · All leaves on the same level` })));
      rules.append(kit.panel('Split rule', h('div.small', { html: m % 2 ? `When a node reaches ${m} keys, the middle key (the ${(m + 1) / 2}${(m + 1) / 2 === 2 ? 'nd' : 'rd'}) goes up.` : `${m} keys has two middles. This tool pushes up the <b>left-middle</b> key. Some books use the right one; both are fine if you say which.` })));
    }
    function load(steps, msg) {
      bounds = DSA.draw.stableBounds(steps.map((s) => DSA.draw.btreeSpec(s.tree)));
      stepper.load(steps);
      f.say(msg || '');
    }
    function build() {
      const keys = parseKeys(seq.input.value).slice(0, 24);
      if (!keys.length) { f.say('Type some keys first.', 'bad'); return; }
      const r = DSA.btree.fromSequence(keys, m);
      T = r.T;
      showRules();
      const splits = r.snaps.filter((s) => s.split).length;
      load([{ text: 'Empty tree.', tree: null }].concat(r.steps.map((s) => Object.assign({ ask: /^Split/.test(s.text) ? 'Which key moves up?' : `Where does ${s.key} go?` }, s))), `${keys.length} keys, ${splits} insertion(s) caused a split. Final height: ${DSA.btree.levelsOf(T.root).length} level(s).`);
    }
    function ins() {
      const raw = key.input.value.trim();
      if (!raw) return;
      const k = /^-?\d+$/.test(raw) ? Number(raw) : raw.toUpperCase();
      const r = DSA.btree.insertTrace(T, k);
      const before = { text: `Insert ${k}: start at the root and find the right leaf.`, tree: T.root ? JSON.parse(JSON.stringify(T.root)) : null };
      T = r.T;
      load([before].concat(r.steps));
      DSA.store.awardOnce('btree:ins', 3, 'B-tree insert');
      key.input.value = String(randInt(1, 99));
    }
    build();
    stepper.go(stepper.steps.length - 1, true);
  };
})(typeof window !== 'undefined' ? window : globalThis);
