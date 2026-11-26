// Stack (array) and queue (linear vs circular) playgrounds.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, s, randInt } = DSA.util;
  const kit = DSA.kit;

  DSA.viz['stack-play'] = function (el) {
    const MAX = 5;
    let arr = [], top = -1;
    const f = kit.frame(el, { title: 'Stack of plates (array version, MAX = 5)', hint: '<b>push</b> puts a plate on top, <b>pop</b> takes the top plate off. You can only touch the top. Try pushing 6 items (overflow) or popping an empty stack (underflow).' });
    const val = kit.input({ value: String(randInt(1, 99)), label: 'Value', size: 4, inputmode: 'numeric', onenter: () => push() });
    function push() {
      const v = val.input.value.trim() || String(randInt(1, 99));
      if (top === MAX - 1) { f.say(`<b>Overflow!</b> top = ${top} = MAX − 1, so the stack is full. push(${v}) fails.`, 'bad'); flash(); return; }
      top++; arr[top] = v;
      f.say(`push(${v}): top = top + 1 = ${top}, then stack[${top}] = ${v}.`, 'ok');
      val.input.value = String(randInt(1, 99));
      DSA.store.awardOnce('stack:push', 3, 'First push');
      draw('push');
    }
    function pop() {
      if (top === -1) { f.say('<b>Underflow!</b> top = −1, so the stack is empty. Nothing to pop.', 'bad'); flash(); return; }
      const v = arr[top]; arr[top] = undefined; top--;
      f.say(`pop() returns ${v}: take stack[${top + 1}], then top = top − 1 = ${top}.`, 'ok');
      DSA.store.awardOnce('stack:pop', 3, 'First pop');
      draw('pop');
    }
    function peek() {
      if (top === -1) { f.say('peek(): the stack is empty, there is no top element.', 'bad'); return; }
      f.say(`peek() returns ${arr[top]} (stack[${top}]) without removing it.`);
      draw('peek');
    }
    f.inputs.append(h('label.field', null, 'value', val.input), kit.btn('push', push, 'btn-primary'), kit.btn('pop', pop), kit.btn('peek', peek), kit.btn('Reset', () => { arr = []; top = -1; draw(); f.say('Empty stack: top = −1.'); }));
    const wrap = h('div.sq-wrap');
    f.body.append(wrap);
    let flashing = false;
    function flash() { flashing = true; draw(); setTimeout(() => { flashing = false; }, 400); }
    function draw(act) {
      wrap.textContent = '';
      const box = h('div.stack-box', { style: flashing ? 'border-color: var(--bad)' : null });
      for (let i = 0; i < MAX; i++) {
        if (i <= top) box.append(h('div.stack-cell' + (i === top ? '.is-top' : ''), { style: act === 'peek' && i === top ? 'outline:3px solid var(--accent)' : null }, String(arr[i])));
        else box.append(h('div.stack-cell.ghost', null, `[${i}]`));
      }
      wrap.append(h('div.stack-col', null, h('span.top-ptr', null, top === -1 ? 'top = −1 (empty)' : `top = ${top}`), box, h('span.stack-label', null, 'Stack')));
      // array view
      const row = h('div.arr-row');
      for (let i = 0; i < MAX; i++) row.append(h('div.arr-cell', null, h('span.p', null, i === top ? 'top' : ''), h('span.v' + (i > top ? '.empty' : i === top ? '.is-rear' : ''), null, i <= top ? String(arr[i]) : '—'), h('span.i', null, String(i))));
      wrap.append(h('div.stack-col', null, h('span.stack-label', null, 'Same thing as an array: stack[0 … 4]'), row,
        h('span.small.muted', null, top === MAX - 1 ? 'FULL: top == MAX − 1' : top === -1 ? 'EMPTY: top == −1' : `${top + 1} of ${MAX} used`)));
    }
    draw();
    f.say('Empty stack: top = −1. Push something!');
  };

  DSA.viz['queue-play'] = function (el) {
    const N = 5;
    let mode = el.dataset.mode || 'linear';
    let q = DSA.cq.make(N);
    const f = kit.frame(el, { title: 'Queue: linear vs circular (SIZE = 5)', hint: 'Enqueue at the <b>rear</b>, dequeue from the <b>front</b>. In the <b>linear</b> queue, fill it, dequeue two, then try to enqueue: the free slots at the front are wasted. Switch to <b>circular</b> and do the same: rear wraps around with <code>(rear + 1) % SIZE</code>.' });
    const val = kit.input({ value: String(randInt(1, 99)), label: 'Value', size: 4, inputmode: 'numeric', onenter: () => enq() });
    const seg = kit.seg([['linear', 'Linear queue'], ['circular', 'Circular queue']], mode, (m) => { mode = m; q = DSA.cq.make(N); draw(); f.say(m === 'circular' ? 'Circular queue: front = rear = −1 (empty).' : 'Linear queue: front = rear = −1 (empty).'); }, 'Queue type');
    function enq() {
      const v = val.input.value.trim() || String(randInt(1, 99));
      const r = mode === 'circular' ? DSA.cq.enqueue(q, v) : DSA.cq.enqueueLinear(q, v);
      q = r.q;
      f.say((r.ok ? '' : '') + r.msg, r.ok ? 'ok' : 'bad');
      if (r.ok) { val.input.value = String(randInt(1, 99)); DSA.store.awardOnce('q:' + mode, 3, 'Queue explored'); }
      draw(r.touched);
    }
    function deq() {
      const r = mode === 'circular' ? DSA.cq.dequeue(q) : DSA.cq.dequeueLinear(q);
      q = r.q;
      f.say(r.msg, r.ok ? 'ok' : 'bad');
      draw();
    }
    f.inputs.append(seg, h('label.field', null, 'value', val.input), kit.btn('enqueue', enq, 'btn-primary'), kit.btn('dequeue', deq), kit.btn('Reset', () => { q = DSA.cq.make(N); draw(); f.say('Empty queue: front = rear = −1.'); }));
    const wrap = h('div.sq-wrap', { style: 'align-items:center' });
    f.body.append(wrap);

    function draw(touched) {
      wrap.textContent = '';
      const empty = mode === 'circular' ? q.front === -1 : q.front === -1 || q.front > q.rear;
      if (mode === 'circular') wrap.append(ring(touched));
      const row = h('div.arr-row');
      for (let i = 0; i < N; i++) {
        const v = q.arr[i];
        const tags = [];
        if (!empty && i === q.front) tags.push('front');
        if (!empty && i === q.rear) tags.push('rear');
        if (mode === 'linear' && q.front > 0 && i < q.front && v === null) tags.push('wasted');
        const cls = v === null ? (tags.includes('wasted') ? '.wasted' : '.empty') : !empty && i === q.front ? '.is-front' : !empty && i === q.rear ? '.is-rear' : '';
        row.append(h('div.arr-cell', null, h('span.p', null, tags.join(' · ')), h('span.v' + cls, null, v === null ? '—' : String(v)), h('span.i', null, String(i))));
      }
      wrap.append(h('div.stack-col', null, h('span.stack-label', null, `queue[0 … ${N - 1}]`), row,
        h('span.small.muted.tnum', null, `front = ${q.front}, rear = ${q.rear}` + (mode === 'circular' ? ` · count = ${DSA.cq.count(q)}` : ''))));
    }

    function ring(touched) {
      const R = 82, r = 23, cx = 120, cy = 120;
      const svg = s('svg', { viewBox: '0 0 240 240', width: 220, height: 220, class: 'scene', role: 'img', 'aria-label': 'Circular queue drawn as a ring' });
      svg.append(s('circle', { cx, cy, r: R, fill: 'none', stroke: 'var(--line-strong)', 'stroke-width': 2, 'stroke-dasharray': '4 6' }));
      const empty = q.front === -1;
      for (let i = 0; i < N; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
        const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        const v = q.arr[i];
        const isF = !empty && i === q.front, isR = !empty && i === q.rear;
        const g = s('g', { class: 'sc-node' + (isF ? ' is-new' : isR ? ' is-hl' : '') });
        g.append(s('circle', { class: 'box', cx: x, cy: y, r, style: v === null ? 'fill: var(--surface-2); stroke-dasharray: 4 3' : null }));
        g.append(s('text', { x, y: y + 1 }, v === null ? '' : String(v)));
        const lx = cx + (R + 38) * Math.cos(a), ly = cy + (R + 38) * Math.sin(a);
        g.append(s('text', { class: 'small', x: lx, y: ly - (isF || isR ? 7 : 0) }, `[${i}]`));
        if (isF || isR) g.append(s('text', { class: 'small', x: lx, y: ly + 8, style: 'fill: var(--accent); font-weight: 800' }, [isF ? 'F' : '', isR ? 'R' : ''].filter(Boolean).join('/')));
        if (touched === i) g.append(s('circle', { cx: x, cy: y, r: r + 5, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2 }));
        svg.append(g);
      }
      svg.append(s('text', { class: 'sc-caption', x: cx, y: cy - 4 }, empty ? 'empty' : `${DSA.cq.count(q)} / ${N}`));
      svg.append(s('text', { class: 'sc-caption', x: cx, y: cy + 12 }, 'clockwise'));
      return svg;
    }
    draw();
    f.say(mode === 'circular' ? 'Circular queue: front = rear = −1 (empty).' : 'Linear queue: front = rear = −1 (empty).');
  };
})(typeof window !== 'undefined' ? window : globalThis);
