// Quizzes: <div data-quiz="id"> (one question set) or <div data-quiz-unit="q22" data-count="8"> (random mix).
// Question format: { q, o: [options], a: index, why }
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, icon, shuffle } = DSA.util;
  const LET = 'ABCDEFG';

  function render(host, questions, opts) {
    opts = opts || {};
    host.textContent = '';
    host.classList.add('quiz');
    const id = opts.id;
    const saved = (id && DSA.store.getQuiz(id)) || null;
    let answered = 0, right = 0;
    const scoreEl = h('span.quiz-score.tnum');
    const head = h('div.quiz-head', null, h('h4', null, h('span', { html: icon('brain'), style: 'display:inline-grid;width:22px;color:var(--accent)' }), opts.title || 'Quick check'), scoreEl);
    host.append(head);
    if (opts.intro) host.append(h('p.muted.small', null, opts.intro));
    const result = h('div.quiz-result', { hidden: true });
    const update = () => {
      scoreEl.textContent = `${right}/${questions.length} correct`;
      if (answered === questions.length) {
        const pct = right / questions.length;
        result.hidden = false;
        result.innerHTML = '';
        result.append(
          h('b', null, `${right} / ${questions.length}`),
          h('span', null, pct === 1 ? 'Perfect! You own this topic.' : pct >= 0.8 ? 'Great score. Glance at the ones you missed.' : pct >= 0.5 ? 'Good start. Re-read the explanations above and try again.' : 'Read the lesson once more, then retry. You will get it.'),
          h('button.btn.btn-sm', { type: 'button', onclick: () => render(host, opts.reshuffle ? opts.reshuffle() : questions, opts) }, 'Try again')
        );
        if (id) DSA.store.setQuiz(id, { best: Math.max(right, (saved && saved.best) || 0), total: questions.length });
        if (pct >= 0.8) {
          if (opts.badge) DSA.store.earn(opts.badge);
          if (DSA.ui) DSA.ui.confetti();
        }
        if (opts.onDone) opts.onDone(right, questions.length);
      }
    };
    questions.forEach((qq, qi) => {
      const card = h('div.qcard');
      card.append(h('div.qtext', null, h('span.qnum', null, `${qi + 1}.`), h('span', { html: qq.q })));
      const opts2 = h('div.opts');
      const why = h('div.qwhy', { hidden: true });
      const order = shuffle(qq.o.map((t, i) => i));
      const buttons = order.map((oi, k) => {
        const b = h('button.opt', { type: 'button' }, h('span.letter', null, LET[k]), h('span', { html: qq.o[oi] }));
        b.addEventListener('click', () => {
          if (card.dataset.done) return;
          card.dataset.done = '1';
          answered++;
          const ok = oi === qq.a;
          if (ok) right++;
          buttons.forEach((bb, kk) => {
            bb.disabled = true;
            if (order[kk] === qq.a) bb.classList.add('is-right');
          });
          if (!ok) b.classList.add('is-wrong');
          why.hidden = false;
          why.className = 'qwhy ' + (ok ? 'ok' : 'bad');
          why.innerHTML = `<b>${ok ? 'Correct!' : 'Not quite.'}</b> ${qq.why || ''}`;
          if (ok && DSA.store) DSA.store.awardOnce('q:' + (opts.id || 'mix') + ':' + qq.q.slice(0, 60), 10, 'Correct answer');
          update();
        });
        opts2.append(b);
        return b;
      });
      card.append(opts2, why);
      host.append(card);
    });
    host.append(result);
    update();
  }

  function pool(unit) {
    const Q = DSA.quizzes || {};
    const out = [];
    for (const k in Q) if (!unit || Q[k].unit === unit) out.push(...Q[k].qs.map((q) => Object.assign({ set: k }, q)));
    return out;
  }

  function mount(el) {
    const id = el.getAttribute('data-quiz');
    const unit = el.getAttribute('data-quiz-unit');
    const Q = DSA.quizzes || {};
    if (id) {
      const set = Q[id];
      if (!set) { el.textContent = 'Quiz not found: ' + id; return; }
      render(el, set.qs, { id, title: el.getAttribute('data-title') || 'Quick check' });
    } else if (unit) {
      const n = Number(el.getAttribute('data-count') || 8);
      const pick = () => shuffle(pool(unit === 'all' ? null : unit)).slice(0, n);
      render(el, pick(), {
        id: 'unit-' + unit, title: el.getAttribute('data-title') || 'Unit challenge', reshuffle: pick,
        badge: el.getAttribute('data-badge') || (unit !== 'all' ? unit : null),
        intro: el.getAttribute('data-intro') || `${n} random questions. Score 80% or more to earn the badge.`,
      });
    }
  }

  DSA.quiz = { render, mount, pool };
})(typeof window !== 'undefined' ? window : globalThis);
