// Expression playgrounds: bracket checker, infix → postfix/prefix converter, postfix evaluator.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, esc, randInt, shuffle } = DSA.util;
  const kit = DSA.kit;

  function exprRow(symbols, at) {
    const box = h('div.tokens');
    symbols.forEach((t, i) => box.append(h('span.tok' + (i === at ? '.hl' : i < at ? '.dim' : ''), null, t)));
    return box;
  }

  function traceTable(headers, rows) {
    const wrap = h('div.table-wrap', { style: 'max-height: 360px; overflow: auto' });
    const t = h('table.t.compact.trace-table');
    t.append(h('thead', null, h('tr', null, headers.map((x) => h('th', null, x)))));
    const tb = h('tbody');
    const trs = rows.map((cells) => { const tr = h('tr', null, cells.map((c) => h('td', { class: c.cls || '', html: c.html }))); tb.append(tr); return tr; });
    t.append(tb);
    wrap.append(t);
    wrap.setNow = (i) => trs.forEach((tr, k) => { tr.classList.toggle('is-now', k === i); tr.classList.toggle('is-future', k > i); if (k === i) { const top = tr.offsetTop - wrap.clientHeight / 2; wrap.scrollTop = Math.max(0, top); } });
    return wrap;
  }

  const stackHtml = (a) => (a.length ? a.map(esc).join(' ') : '<span class="muted">empty</span>');

  /* ---------- Infix → postfix / prefix ---------- */
  const EXAMPLES = ['A+B*C', '(A+B)*C', 'A^B^C', 'A+B*C-D/E', 'A*(B+C)/D', '(A+B)*(C-D)', 'A+B*(C^D-E)^(F+G*H)-I'];
  function randomExpr() {
    const L = shuffle('ABCDEFGH'.split('')).slice(0, randInt(4, 6));
    const ops = ['+', '-', '*', '/', '^'];
    let e = L[0];
    for (let i = 1; i < L.length; i++) {
      const op = ops[randInt(0, i === 1 ? 3 : 4)];
      const part = op + L[i];
      e += part;
      if (Math.random() < 0.3 && i < L.length - 1) { e = e.slice(0, e.length - 1) + '(' + L[i] + ops[randInt(0, 3)] + L[++i] + ')'; }
    }
    if (Math.random() < 0.35) e = '(' + e.slice(0, 3) + ')' + e.slice(3);
    return DSA.infix.toPostfix(e).error ? 'A+B*(C-D)/E' : e;
  }

  DSA.viz['infix-play'] = function (el) {
    let kind = 'postfix';
    const f = kit.frame(el, { title: 'Infix → Postfix converter', hint: 'Type any expression (single letters or numbers, + − * / % ^ and brackets). You get the exact table examiners expect: <b>Symbol | Stack | Postfix</b>. Tap <b>Random</b> for endless practice: solve it on paper first, then check.' });
    const inp = kit.input({ value: el.dataset.input || 'A+B*(C-D)/E', label: 'Infix expression', cls: 'mono wide', onenter: () => go() });
    const segK = kit.seg([['postfix', 'Postfix'], ['prefix', 'Prefix']], kind, (v) => { kind = v; go(); }, 'Convert to');
    f.inputs.append(h('div.grow', null, inp.input), segK, kit.btn('Convert', () => go(), 'btn-primary'), kit.btn('Random', () => { inp.input.value = randomExpr(); go(); }));
    const chips = h('div.btn-row', { style: 'padding: 0 16px 12px; border-bottom: 1px solid var(--line)' }, h('span.small.muted', null, 'Try:'),
      EXAMPLES.map((e) => kit.btn(`<code>${esc(e)}</code>`, () => { inp.input.value = e; go(); }, 'btn-ghost')));
    f.inputs.after(chips);
    const top = h('div.panels');
    const tableBox = h('div', { style: 'padding: 0 16px 12px' });
    const box = h('div');
    box.append(top, tableBox);
    f.body.append(box);
    const stepper = new DSA.Stepper(box, { render: (s, i) => render(s, i), xpKey: 'infix', xpTag: () => inp.input.value });
    let cur = null, table = null, symbols = [];
    function render(s, i) {
      top.textContent = '';
      const at = s.sym === 'end' ? symbols.length : i;
      top.append(kit.panel(kind === 'prefix' ? 'Reversed expression (scanning →)' : 'Expression (scanning →)', exprRow(symbols, at)));
      top.append(kit.panel('Stack (bottom → top)', kit.tokens(s.stack, (t, k) => (k === s.stack.length - 1 ? '.hl' : ''))));
      top.append(kit.panel(kind === 'prefix' ? 'Output (reverse it at the end)' : 'Postfix so far', kit.tokens(s.out, (t, k) => (k >= s.out.length - (s.popped || 1) && i === cur.steps.indexOf(s) ? '.new' : ''))));
      if (table) table.setNow(i);
    }
    function go() {
      const e = inp.input.value.trim();
      const r = kind === 'prefix' ? DSA.infix.toPrefix(e) : DSA.infix.toPostfix(e);
      if (r.error) { f.say(r.error, 'bad'); return; }
      cur = r;
      try { symbols = kind === 'prefix' ? DSA.infix.tokenize(r.reversedInput) : DSA.infix.tokenize(e); } catch (err) { symbols = []; }
      tableBox.textContent = '';
      table = traceTable(['#', 'Symbol', 'Stack', kind === 'prefix' ? 'Output' : 'Postfix'], r.steps.map((s, i) => [{ html: String(i + 1) }, { cls: 'sym', html: s.sym === 'end' ? '<i>end</i>' : esc(s.sym) }, { cls: 'stk', html: stackHtml(s.stack) }, { cls: 'out', html: esc(s.out.join('')) || '—' }]));
      tableBox.append(table);
      stepper.load(r.steps.map((s) => Object.assign({}, s, { text: s.action, ask: s.sym === 'end' ? 'End of expression. What do you do with the stack?' : `Next symbol: "${s.sym}". Push, pop or output?` })));
      f.say(kind === 'prefix'
        ? `Reverse <code>${esc(e)}</code> → <code>${esc(r.reversedInput)}</code>, convert it, then reverse the output <code>${esc(r.reversedOutput)}</code>. <b>Prefix: <code>${esc(r.prefix)}</code></b>`
        : `<b>Postfix: <code>${esc(r.postfix)}</code></b> · ${r.steps.length} steps. Use Next to walk through.`, 'ok');
    }
    go();
  };

  /* ---------- Bracket checker ---------- */
  DSA.viz['brackets-play'] = function (el) {
    const f = kit.frame(el, { title: 'Bracket checker (balanced parentheses)', hint: 'Opening bracket → push. Closing bracket → the top must be the same type, then pop. At the end the stack must be empty.' });
    const inp = kit.input({ value: '{a*(b+c)-[d/e]}', label: 'Expression', cls: 'mono wide', onenter: () => go() });
    f.inputs.append(h('div.grow', null, inp.input), kit.btn('Check', () => go(), 'btn-primary'));
    const chips = h('div.btn-row', { style: 'padding: 0 16px 12px; border-bottom: 1px solid var(--line)' }, h('span.small.muted', null, 'Try:'),
      ['{[()]}', '([)]', '((a+b)', 'a+b)', '{a*(b+c)-[d/e]}'].map((e) => kit.btn(`<code>${esc(e)}</code>`, () => { inp.input.value = e; go(); }, 'btn-ghost')));
    f.inputs.after(chips);
    const panels = h('div.panels');
    const box = h('div', null, panels);
    f.body.append(box);
    let brackets = [];
    const stepper = new DSA.Stepper(box, { render: (s, i) => {
      panels.textContent = '';
      panels.append(kit.panel('Brackets in the input', exprRow(brackets, s.sym === 'end' ? brackets.length : i)));
      panels.append(kit.panel('Stack (bottom → top)', kit.tokens(s.stack, (t, k) => (k === s.stack.length - 1 ? '.hl' : ''))));
    }, xpKey: 'brackets' });
    function go() {
      const e = inp.input.value;
      const r = DSA.infix.checkBrackets(e);
      brackets = [...e].filter((c) => '()[]{}'.includes(c));
      stepper.load(r.steps.map((s) => Object.assign({}, s, { text: s.action, ask: s.sym === 'end' ? 'End of input. Balanced or not?' : `Next bracket: "${s.sym}". Push or pop?` })));
      f.say(r.ok ? '<b>Balanced.</b> Every opening bracket has a matching closing bracket in the right order.' : `<b>Not balanced:</b> ${esc(r.reason)}`, r.ok ? 'ok' : 'bad');
    }
    go();
  };

  /* ---------- Postfix evaluator ---------- */
  DSA.viz['eval-play'] = function (el) {
    const f = kit.frame(el, { title: 'Evaluate a postfix expression', hint: 'Number → push. Operator → pop the top two (first pop is B, second is A), compute <b>A op B</b>, push the result.' });
    const inp = kit.input({ value: '5 3 + 8 2 - *', label: 'Postfix expression', cls: 'mono wide', onenter: () => go() });
    f.inputs.append(h('div.grow', null, inp.input), kit.btn('Evaluate', () => go(), 'btn-primary'));
    const chips = h('div.btn-row', { style: 'padding: 0 16px 12px; border-bottom: 1px solid var(--line)' }, h('span.small.muted', null, 'Try:'),
      ['5 3 + 8 2 - *', '2 3 1 * + 9 -', '6 2 3 + - 3 8 2 / + * 2 ^ 3 +', '4 5 * 6 2 / -'].map((e) => kit.btn(`<code>${esc(e)}</code>`, () => { inp.input.value = e; go(); }, 'btn-ghost')));
    f.inputs.after(chips);
    const panels = h('div.panels');
    const box = h('div', null, panels);
    f.body.append(box);
    let toks = [];
    const stepper = new DSA.Stepper(box, { render: (s, i) => {
      panels.textContent = '';
      panels.append(kit.panel('Expression', exprRow(toks, s.sym === 'end' ? toks.length : i)));
      panels.append(kit.panel('Stack (bottom → top)', kit.tokens(s.stack, (t, k) => (k === s.stack.length - 1 ? '.hl' : ''))));
    }, xpKey: 'eval' });
    function go() {
      const e = inp.input.value.trim();
      const r = DSA.infix.evalPostfix(e);
      toks = /\s/.test(e) ? e.split(/\s+/) : e.split('');
      if (!r.steps.length) { f.say(r.error, 'bad'); return; }
      stepper.load(r.steps.map((s) => Object.assign({}, s, { text: s.action, ask: s.sym === 'end' ? 'Finished scanning. What is the answer?' : `Next: "${s.sym}". What happens to the stack?` })));
      f.say(r.error ? r.error : `<b>Result = ${r.text}</b>`, r.error ? 'bad' : 'ok');
    }
    go();
  };
})(typeof window !== 'undefined' ? window : globalThis);
