// Hashing playground (collision resolution) and a hash-function calculator.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, esc, parseNums, uniqueRandom } = DSA.util;
  const kit = DSA.kit;

  DSA.viz['hash-play'] = function (el) {
    let method = el.dataset.method || 'linear';
    let m = 10;
    const f = kit.frame(el, { title: 'Hash table: watch the collisions', hint: 'Hash function: <b>h(k) = k mod m</b>. When two keys land on the same slot (a <b>collision</b>), the method decides where the second key goes.' });
    const seg = kit.seg(Object.entries(DSA.hash.METHODS).map(([k, v]) => [k, v.replace(' probing', '').replace(' hashing', '').replace('Separate ', '')]), method, (v) => { method = v; run(); }, 'Collision method');
    const keys = kit.input({ value: el.dataset.keys || '72 27 36 24 63 81 92 101', label: 'Keys to insert', cls: 'mono', size: 22, onenter: () => run() });
    const mSel = kit.select([[7, 'm = 7'], [10, 'm = 10'], [11, 'm = 11'], [13, 'm = 13']], m, (v) => { m = Number(v); run(); }, 'Table size');
    f.inputs.append(seg, mSel, h('span', { style: 'flex-basis:100%;height:0' }), h('div.grow', null, keys.input), kit.btn('Insert all', () => run(), 'btn-primary'), kit.btn('Random', () => { keys.input.value = uniqueRandom(7, 10, 120).join(' '); run(); }));
    const box = h('div');
    const tableBox = h('div.stage-html', { style: 'display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))' });
    const left = h('div');
    const right = h('div.stack');
    tableBox.append(left, right);
    box.append(tableBox);
    f.body.append(box);
    let res = null;
    const stepper = new DSA.Stepper(box, { render: (s) => draw(s), xpKey: 'hash', xpTag: () => method });

    function draw(s) {
      left.textContent = '';
      right.textContent = '';
      const table = s.table || (method === 'chaining' ? Array.from({ length: m }, () => []) : new Array(m).fill(null));
      const probed = new Set((s.probes || []).filter((p) => p.hit).map((p) => p.idx));
      const box2 = h('div.htable');
      table.forEach((v, i) => {
        let cls = '.hslot';
        const filled = method === 'chaining' ? v.length : v !== null;
        if (filled) cls += '.filled';
        if (i === s.placed) cls += '.placed';
        else if (probed.has(i) && method !== 'chaining') cls += '.probe';
        const slot = h('div' + cls);
        if (method === 'chaining') {
          if (!v.length) slot.append(h('span.muted', null, 'NULL'));
          v.forEach((k, j) => { if (j) slot.append(h('span.chain-arrow', null, '→')); slot.append(h('span.chain-node' + (k === s.key && i === s.placed ? '.placed' : ''), null, String(k))); });
        } else slot.append(v === null ? h('span.muted', null, 'empty') : String(v));
        box2.append(h('div.hrow', null, h('span.hidx', null, String(i)), slot));
      });
      left.append(h('div.panel-t', null, `Hash table (m = ${m})`), box2);
      if (s.key !== undefined) {
        right.append(h('div.panel-t', null, `Inserting ${s.key}`));
        const list = h('ol.steps');
        s.probes.forEach((p) => list.append(h('li', { html: `${esc(p.formula)} ${p.hit && method !== 'chaining' ? `<span class="pill bad">taken by ${p.by}</span>` : method === 'chaining' && p.hit ? '<span class="pill">collision → chain</span>' : '<span class="pill ok">free</span>'}` })));
        right.append(list);
      } else {
        right.append(h('div.panel-t', null, 'Formulas'), h('div.formula', { html: formulas() }));
      }
      if (res) {
        const n = res.results.filter((r) => r.placed !== -1).length;
        const coll = res.results.reduce((a, r) => a + Math.max(0, r.probes - 1), 0);
        right.append(h('div.small.muted', null, `Load factor α = n / m = ${n} / ${m} = ${(n / m).toFixed(2)}` + (method === 'chaining' ? '' : ` · total extra probes: ${coll}`)));
      }
    }
    function formulas() {
      if (method === 'linear') return `h(k) = k mod ${m}\ntry h, h+1, h+2, … (mod ${m})\nindex = (h(k) + i) mod ${m}`;
      if (method === 'quadratic') return `h(k) = k mod ${m}\nindex = (h(k) + i²) mod ${m}\ntries h, h+1, h+4, h+9, …`;
      if (method === 'double') return `h1(k) = k mod ${m}\nh2(k) = ${DSA.hash.primeBelow(m)} − (k mod ${DSA.hash.primeBelow(m)})\nindex = (h1 + i × h2) mod ${m}`;
      return `h(k) = k mod ${m}\nEach slot holds a linked list.\nCollision → add to that slot's list.`;
    }
    function run() {
      const ks = parseNums(keys.input.value).filter((k) => k >= 0).slice(0, 14);
      if (!ks.length) { f.say('Type some non-negative whole numbers.', 'bad'); return; }
      res = DSA.hash.build(ks, m, method);
      const steps = [{ text: `Empty table of size ${m}. Method: ${DSA.hash.METHODS[method]}.`, table: null, probes: [] }];
      res.steps.forEach((s) => steps.push({ text: `Insert ${s.key}: ${s.note}`, table: s.table, probes: s.probes, placed: s.placed, key: s.key, ask: `Where does ${s.key} end up?` }));
      stepper.load(steps);
      const failed = res.results.filter((r) => r.placed === -1).map((r) => r.key);
      f.say(failed.length ? `Could not place: ${failed.join(', ')}.` : `All ${ks.length} keys placed. Step through to see each probe.`, failed.length ? 'bad' : 'ok');
    }
    run();
  };

  DSA.viz['hashfn-calc'] = function (el) {
    const f = kit.frame(el, { title: 'Hash function calculator', hint: 'Type a key and a table size to see all four common hash functions worked out.', tag: 'Calculator' });
    const key = kit.input({ value: '123456', label: 'Key', size: 8, inputmode: 'numeric', onenter: () => calc() });
    const m = kit.input({ value: '100', label: 'Table size m', size: 5, inputmode: 'numeric', onenter: () => calc() });
    f.inputs.append(h('label.field', null, 'key', key.input), h('label.field', null, 'm', m.input), kit.btn('Calculate', () => calc(), 'btn-primary'));
    const out = h('div', { style: 'padding: 12px 16px' });
    f.body.append(out);
    function calc() {
      const k = Math.abs(Math.floor(Number(key.input.value)));
      const mm = Math.max(2, Math.floor(Number(m.input.value)));
      if (!Number.isFinite(k) || !Number.isFinite(mm)) { f.say('Use whole numbers.', 'bad'); return; }
      const rows = [
        ['Division', DSA.hash.division(k, mm)],
        ['Mid-square', DSA.hash.midSquare(k, mm)],
        ['Folding', DSA.hash.folding(k, mm)],
        ['Multiplication', DSA.hash.multiplication(k, mm)],
      ];
      out.textContent = '';
      out.append(DSA.fig.table(['Method', 'Working', 'Index'], rows.map(([n, r]) => ({ cells: [{ html: `<b>${n}</b>` }, { html: esc(r.work) }, { cls: 'sym', html: String(r.value) }] }))));
      f.say('Division (k mod m) is the one most exams use. Pick m as a prime number to spread keys better.');
    }
    calc();
  };
})(typeof window !== 'undefined' ? window : globalThis);
