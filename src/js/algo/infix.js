// Infix -> postfix / prefix, postfix evaluation and bracket matching, each with a step trace.
(function (root) {
  const PREC = { '^': 3, '*': 2, '/': 2, '%': 2, '+': 1, '-': 1 };
  const RIGHT = { '^': true };
  const OPEN = { '(': ')', '[': ']', '{': '}' };
  const CLOSE = { ')': '(', ']': '[', '}': '{' };
  const isOp = (t) => Object.prototype.hasOwnProperty.call(PREC, t);

  function tokenize(expr) {
    const out = [];
    const s = String(expr).replace(/\s+/g, ' ').trim();
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === ' ') { i++; continue; }
      if (/[A-Za-z0-9_.]/.test(c)) {
        let j = i;
        // Single letters are separate operands (AB means A then B) unless digits/words are written with spaces.
        if (/[0-9.]/.test(c)) { while (j < s.length && /[0-9.]/.test(s[j])) j++; }
        else j = i + 1;
        out.push(s.slice(i, j));
        i = j;
        continue;
      }
      if (isOp(c) || OPEN[c] || CLOSE[c]) { out.push(c); i++; continue; }
      if (c === '$') { out.push('^'); i++; continue; }
      throw new Error(`I don't understand the symbol "${c}". Use letters, numbers, + - * / % ^ and brackets.`);
    }
    return out;
  }

  const joinOut = (arr) => (arr.every((t) => t.length === 1) ? arr.join('') : arr.join(' '));

  function validate(tokens) {
    // operand/operator alternation check
    let expectOperand = true;
    let depth = 0;
    for (const t of tokens) {
      if (OPEN[t]) { if (!expectOperand) return 'An operator is missing before "' + t + '".'; depth++; continue; }
      if (CLOSE[t]) { if (expectOperand) return 'Something is missing before "' + t + '".'; depth--; if (depth < 0) return 'There is a closing bracket with no opening bracket.'; continue; }
      if (isOp(t)) { if (expectOperand) return 'Two operators in a row near "' + t + '" (or the expression starts with one).'; expectOperand = true; continue; }
      if (!expectOperand) return 'Two operands in a row near "' + t + '". Put an operator between them.';
      expectOperand = false;
    }
    if (expectOperand && tokens.length) return 'The expression ends with an operator.';
    if (depth !== 0) return 'The brackets are not balanced.';
    if (!tokens.length) return 'Type an expression first.';
    return null;
  }

  // mode 'postfix' (normal) or 'prefix-pass' (used on the reversed expression)
  function convert(tokens, mode) {
    const stack = [];
    const out = [];
    const steps = [];
    const snap = (sym, action) => steps.push({ sym, action, stack: stack.slice(), out: out.slice() });
    for (const t of tokens) {
      if (OPEN[t]) { stack.push(t); snap(t, `"${t}" is an opening bracket → push it.`); continue; }
      if (CLOSE[t]) {
        const popped = [];
        while (stack.length && !OPEN[stack[stack.length - 1]]) { const p = stack.pop(); out.push(p); popped.push(p); }
        stack.pop();
        snap(t, popped.length
          ? `"${t}" → pop ${popped.map((p) => `"${p}"`).join(', ')} to the output until the opening bracket, then throw both brackets away.`
          : `"${t}" → pop until the opening bracket (nothing in between), then discard both brackets.`);
        continue;
      }
      if (isOp(t)) {
        const popped = [];
        const why = [];
        while (stack.length) {
          const top = stack[stack.length - 1];
          if (!isOp(top)) break;
          const pt = PREC[top], pc = PREC[t];
          let pop;
          if (mode === 'prefix-pass') pop = pt > pc || (pt === pc && RIGHT[t]);
          else pop = pt > pc || (pt === pc && !RIGHT[t]);
          if (!pop) break;
          why.push(pt > pc ? `"${top}" has higher precedence than "${t}"` : `"${top}" has the same precedence as "${t}" and ${mode === 'prefix-pass' ? '"' + t + '" is right-associative' : 'they group left to right'}`);
          out.push(stack.pop());
          popped.push(top);
        }
        stack.push(t);
        let action;
        if (popped.length) action = `Operator "${t}": ${why[0]} → pop ${popped.map((p) => `"${p}"`).join(', ')} to the output, then push "${t}".`;
        else {
          const top = stack[stack.length - 2];
          if (!top) action = `Operator "${t}" and the stack is empty → push it.`;
          else if (OPEN[top]) action = `Operator "${t}" and the top is "${top}" → push it.`;
          else if (PREC[top] < PREC[t]) action = `"${t}" has higher precedence than "${top}" on top → push it.`;
          else action = `"${t}" is right-associative (same precedence as "${top}") → push it, don't pop.`;
        }
        snap(t, action);
        continue;
      }
      out.push(t);
      snap(t, `"${t}" is an operand → write it straight to the output.`);
    }
    const rest = [];
    while (stack.length) { const p = stack.pop(); out.push(p); rest.push(p); }
    if (rest.length) steps.push({ sym: 'end', action: `End of the expression → pop everything left (${rest.map((p) => `"${p}"`).join(', ')}) to the output.`, stack: [], out: out.slice() });
    return { out, steps };
  }

  function toPostfix(expr) {
    const tokens = tokenize(expr);
    const err = validate(tokens);
    if (err) return { error: err, tokens, steps: [] };
    const { out, steps } = convert(tokens, 'postfix');
    return { postfix: joinOut(out), tokens: out, steps };
  }

  function toPrefix(expr) {
    const tokens = tokenize(expr);
    const err = validate(tokens);
    if (err) return { error: err, tokens, steps: [] };
    const rev = tokens.slice().reverse().map((t) => (OPEN[t] ? OPEN[t] : CLOSE[t] ? CLOSE[t] : t));
    const { out, steps } = convert(rev, 'prefix-pass');
    const pre = out.slice().reverse();
    return { prefix: joinOut(pre), reversedInput: joinOut(rev), reversedOutput: joinOut(out), tokens: pre, steps };
  }

  function applyOp(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': if (b === 0) throw new Error('Division by zero.'); return a / b;
      case '%': if (b === 0) throw new Error('Division by zero.'); return a % b;
      case '^': return Math.pow(a, b);
    }
    throw new Error('Unknown operator ' + op);
  }

  const fmt = (n) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 10000) / 10000));

  function evalPostfix(input) {
    let tokens;
    const str = String(input).trim();
    if (/\s/.test(str)) tokens = str.split(/\s+/);
    else tokens = str.split('');
    const stack = [];
    const steps = [];
    for (const t of tokens) {
      if (isOp(t)) {
        if (stack.length < 2) return { error: `Not enough operands for "${t}". Check the postfix expression.`, steps };
        const b = stack.pop(), a = stack.pop();
        let r;
        try { r = applyOp(a, b, t); } catch (e) { return { error: e.message, steps }; }
        stack.push(r);
        steps.push({ sym: t, action: `Operator "${t}" → pop B = ${fmt(b)} (top), then A = ${fmt(a)}. Push A ${t} B = ${fmt(a)} ${t} ${fmt(b)} = ${fmt(r)}.`, stack: stack.map(fmt) });
      } else if (/^-?\d+(\.\d+)?$/.test(t)) {
        stack.push(Number(t));
        steps.push({ sym: t, action: `"${t}" is an operand → push it.`, stack: stack.map(fmt) });
      } else {
        return { error: `"${t}" is not a number. For evaluation use digits, e.g. 5 3 + 8 2 - *`, steps };
      }
    }
    if (stack.length !== 1) return { error: `The expression leaves ${stack.length} values on the stack. Check that it is valid postfix.`, steps };
    steps.push({ sym: 'end', action: `End → the only value on the stack is the answer: ${fmt(stack[0])}.`, stack: stack.map(fmt) });
    return { value: stack[0], text: fmt(stack[0]), steps };
  }

  function checkBrackets(expr) {
    const stack = [];
    const steps = [];
    const s = String(expr);
    for (const c of s) {
      if (OPEN[c]) { stack.push(c); steps.push({ sym: c, action: `"${c}" opens → push.`, stack: stack.slice() }); continue; }
      if (CLOSE[c]) {
        if (!stack.length) {
          steps.push({ sym: c, action: `"${c}" closes but the stack is empty → NOT balanced (extra closing bracket).`, stack: [], bad: true });
          return { ok: false, reason: `Extra closing "${c}" with nothing to match.`, steps };
        }
        const top = stack[stack.length - 1];
        if (top !== CLOSE[c]) {
          steps.push({ sym: c, action: `"${c}" closes but the top is "${top}" → wrong type → NOT balanced.`, stack: stack.slice(), bad: true });
          return { ok: false, reason: `"${c}" does not match "${top}".`, steps };
        }
        stack.pop();
        steps.push({ sym: c, action: `"${c}" matches "${top}" on top → pop.`, stack: stack.slice() });
        continue;
      }
    }
    if (stack.length) {
      steps.push({ sym: 'end', action: `End of input but the stack still has ${stack.map((x) => `"${x}"`).join(' ')} → NOT balanced (unclosed bracket).`, stack: stack.slice(), bad: true });
      return { ok: false, reason: `Unclosed ${stack.map((x) => `"${x}"`).join(' ')}.`, steps };
    }
    steps.push({ sym: 'end', action: 'End of input and the stack is empty → BALANCED.', stack: [] });
    return { ok: true, steps };
  }

  const X = { tokenize, toPostfix, toPrefix, evalPostfix, checkBrackets, PREC };
  root.DSA = root.DSA || {};
  root.DSA.infix = X;
  if (typeof module === 'object' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
