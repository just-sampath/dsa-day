// Linked list playground: singly, doubly and circular, every operation shown pointer by pointer.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, icon, randInt } = DSA.util;
  const kit = DSA.kit;

  const OPS = [
    ['insertFront', 'Insert at beginning', 'val'],
    ['insertEnd', 'Insert at end', 'val'],
    ['insertAt', 'Insert at position', 'posval'],
    ['deleteFront', 'Delete from beginning', ''],
    ['deleteEnd', 'Delete from end', ''],
    ['deleteAt', 'Delete at position', 'pos'],
    ['search', 'Search', 'val'],
    ['traverse', 'Traverse (print)', ''],
    ['reverse', 'Reverse', ''],
  ];
  const NAMES = { sll: 'Singly linked list', dll: 'Doubly linked list', cll: 'Circular linked list' };

  DSA.viz['ll-playground'] = function (el) {
    let mode = el.dataset.mode || 'sll';
    let st = DSA.ll.make(mode, [10, 20, 30]);
    const f = kit.frame(el, {
      title: 'Linked list playground',
      hint: 'Pick an operation and press <b>Run</b>. Then step through it: every pointer change is one step, exactly like you would draw it in the exam. Turn on <b>Predict mode</b> to guess each step first.',
    });
    const modeSeg = kit.seg([['sll', 'Singly'], ['dll', 'Doubly'], ['cll', 'Circular']], mode, (m) => { mode = m; st = DSA.ll.make(m, DSA.ll.values(st).slice(0, 6)); showStatic(); }, 'List type');
    const opSel = kit.select(OPS.map(([k, t]) => [k, t]), 'insertFront', () => syncInputs(), 'Operation');
    const val = kit.input({ value: '5', label: 'Value', size: 4, inputmode: 'numeric', onenter: () => go() });
    const pos = kit.input({ value: '2', label: 'Position', size: 3, inputmode: 'numeric', onenter: () => go() });
    const posWrap = h('label.field', null, 'pos', pos.input);
    const valWrap = h('label.field', null, 'value', val.input);
    const runBtn = kit.btn(icon('play') + '<span>Run</span>', () => go(), 'btn-primary');
    const resetBtn = kit.btn(icon('reset') + '<span>New list</span>', () => { st = DSA.ll.make(mode, [10, 20, 30]); showStatic(); });
    f.inputs.append(modeSeg, opSel, valWrap, posWrap, runBtn, resetBtn);

    const stageBox = h('div');
    const stage = h('div.stage.tall');
    const out = h('div.panels');
    stageBox.append(stage, out);
    const algo = kit.algoPanel();
    const side = h('div', { style: 'padding:12px 16px;display:flex;flex-direction:column;gap:10px' }, algo);
    f.body.classList.add('with-code');
    f.body.append(stageBox, side);
    const scene = new DSA.Scene(stage, { minScale: 0.55, label: 'Linked list' });
    const stepper = new DSA.Stepper(stageBox, { render: (s) => drawStep(s), xpKey: 'll', xpTag: () => mode + opSel.value });

    function syncInputs() {
      const need = OPS.find((o) => o[0] === opSel.value)[2];
      valWrap.hidden = !need.includes('val');
      posWrap.hidden = !need.includes('pos');
    }

    let bounds = null;
    function drawStep(s) {
      scene.render(DSA.draw.llSpec(s.state), { bounds });
      algo.setActive(s.line);
      out.textContent = '';
      const st2 = s.state;
      if (st2.out && st2.out.length) out.append(kit.panel('Printed so far', kit.tokens(st2.out, () => '.new')));
      out.append(kit.panel('List now', h('div.small', null, DSA.ll.summary(Object.assign({}, st2, { order: null })))));
    }

    function showStatic() {
      syncInputs();
      algo.setTitle(NAMES[mode]);
      algo.setLines([
        'Each <b>node</b> has data and a pointer to the next node' + (mode === 'dll' ? ' and to the previous node.' : '.'),
        '<b>head</b> points to the first node.',
        mode === 'cll' ? 'The last node points back to the <b>first</b> node, so there is no NULL.' : 'The last node’s next is <b>NULL</b>: that is how we know the list ended.',
        'Choose an operation above and press Run.',
      ]);
      const spec = DSA.draw.llSpec(st);
      bounds = DSA.draw.stableBounds([spec]);
      stepper.load([{ text: `${NAMES[mode]}: ${DSA.ll.summary(st)}`, state: st, line: -1 }]);
      f.say('');
    }

    function go() {
      const op = opSel.value;
      let v = val.input.value.trim();
      if (v === '') v = String(randInt(1, 99));
      if (!/^-?\d{1,3}$/.test(v)) { f.say('Use a whole number with up to 3 digits as the value.', 'bad'); return; }
      v = Number(v);
      const count = DSA.ll.chain(st).length;
      if (op.startsWith('insert') && count >= 7) { f.say('Seven nodes is the most this screen shows nicely. Delete one first.', 'bad'); return; }
      const p = Number(pos.input.value);
      const r = op === 'insertAt' ? DSA.ll.run(st, op, p, v) : op === 'deleteAt' ? DSA.ll.run(st, op, p) : DSA.ll.run(st, op, v);
      if (r.error) { f.say(r.error, 'bad'); return; }
      algo.setTitle(OPS.find((o) => o[0] === op)[1] + ' · ' + NAMES[mode]);
      algo.setLines(r.algo);
      bounds = DSA.draw.stableBounds(r.steps.map((s) => DSA.draw.llSpec(s.state)));
      stepper.load(r.steps);
      st = r.final;
      f.say(r.empty ? 'The list is empty (underflow).' : `${r.steps.length} steps. Use Next or Play.`, r.empty ? 'bad' : '');
      val.input.value = String(randInt(1, 99));
      DSA.store.awardOnce('llop:' + mode + ':' + op, 3, 'Tried ' + OPS.find((o) => o[0] === op)[1]);
    }

    showStatic();
  };
})(typeof window !== 'undefined' ? window : globalThis);
