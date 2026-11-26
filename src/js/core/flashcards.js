// Flashcards: <div data-flash="all|q21|..."> builds a deck from DSA.flashcards [{u, f, b}].
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, icon, shuffle } = DSA.util;
  const UNITS = [['all', 'All'], ['q21', 'Q21'], ['q22', 'Q22'], ['q23', 'Q23'], ['q24', 'Q24'], ['q25', 'Q25']];

  function mount(host) {
    const all = DSA.flashcards || [];
    let unit = host.getAttribute('data-flash') || 'all';
    let deck = [], i = 0;
    host.textContent = '';
    host.classList.add('flash-deck');
    const seg = h('div.seg', { role: 'group', 'aria-label': 'Filter flashcards by unit' });
    const segBtns = UNITS.map(([u, label]) => {
      const b = h('button', { type: 'button', 'aria-pressed': String(u === unit), onclick: () => { unit = u; segBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); make(false); } }, label);
      seg.append(b);
      return b;
    });
    const front = h('div.flash-face.front');
    const back = h('div.flash-face.back');
    const card = h('button.flash', { type: 'button', 'aria-label': 'Flashcard. Tap to flip.' }, front, back);
    const scene = h('div.flash-scene', null, card);
    const count = h('span.flash-count');
    const prev = h('button.btn.btn-sm', { type: 'button', 'aria-label': 'Previous card', html: icon('prev') });
    const next = h('button.btn.btn-sm.btn-primary', { type: 'button', html: '<span>Next card</span>' + icon('next') });
    const shuf = h('button.btn.btn-sm', { type: 'button', html: icon('shuffle') + '<span>Shuffle</span>' });
    host.append(seg, scene, h('div.flash-bar', null, h('div.btn-row', null, prev, next), count, shuf));

    function sizeCard() {
      // make the card tall enough for its longer face
      card.style.minHeight = '';
      const hh = Math.max(240, front.scrollHeight, back.scrollHeight);
      card.style.minHeight = hh + 'px';
    }
    function show() {
      const c = deck[i];
      card.classList.remove('is-flipped');
      if (!c) { front.innerHTML = '<span class="ftext">No cards here yet.</span>'; back.innerHTML = ''; count.textContent = ''; return; }
      front.innerHTML = `<span class="ftag">${c.u.toUpperCase()} · Question</span><span class="ftext">${c.f}</span><span class="fhint">Tap the card to see the answer</span>`;
      back.innerHTML = `<span class="ftag">${c.u.toUpperCase()} · Answer</span><span class="ftext">${c.b}</span><span class="fhint">Tap to flip back</span>`;
      count.textContent = `${i + 1} / ${deck.length}`;
      requestAnimationFrame(sizeCard);
    }
    function make(doShuffle) {
      deck = all.filter((c) => unit === 'all' || c.u === unit);
      if (doShuffle) deck = shuffle(deck);
      i = 0;
      show();
    }
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
      if (card.classList.contains('is-flipped') && deck[i]) DSA.store.awardOnce('fc:' + deck[i].f.slice(0, 50), 2, 'Flashcard');
    });
    prev.addEventListener('click', () => { i = (i - 1 + deck.length) % deck.length; show(); });
    next.addEventListener('click', () => { i = (i + 1) % deck.length; show(); });
    shuf.addEventListener('click', () => make(true));
    host.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next.click();
      if (e.key === 'ArrowLeft') prev.click();
    });
    window.addEventListener('resize', DSA.util.debounce(sizeCard, 150));
    make(false);
  }

  DSA.flash = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
