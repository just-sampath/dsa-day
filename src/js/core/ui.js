// Page chrome and content upgrades: theme, drawer, navigation, XP, toasts, confetti, callouts, answers, progress.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { $, $$, h, icon } = DSA.util;

  /* ---------- Theme ---------- */
  function currentTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return root.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function paintThemeButtons() {
    const dark = currentTheme() === 'dark';
    $$('[data-theme-toggle]').forEach((b) => { b.innerHTML = icon(dark ? 'sun' : 'moon'); b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'); });
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
    const meta = $('meta[name="theme-color"]');
    if (meta && bg) meta.setAttribute('content', bg);
  }
  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    DSA.store.setTheme(next);
    paintThemeButtons();
  }

  /* ---------- Drawer ---------- */
  let lastFocus = null;
  function openDrawer() {
    lastFocus = document.activeElement;
    $('#drawer').hidden = false;
    $('.drawer-scrim').hidden = false;
    $$('[data-drawer-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    document.body.style.overflow = 'hidden';
    const active = $('#drawer .nav-link.is-active') || $('#drawer .nav-link');
    if (active) active.focus({ preventScroll: true });
  }
  function closeDrawer() {
    if ($('#drawer').hidden) return;
    $('#drawer').hidden = true;
    $('.drawer-scrim').hidden = true;
    $$('[data-drawer-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- Navigation ---------- */
  function ring(pct, size, stroke) {
    const r = (size - stroke) / 2 - 1;
    const c = 2 * Math.PI * r;
    return `<svg class="nav-prog" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}"/><circle class="fill" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - pct)).toFixed(2)}"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle">${Math.round(pct * 100)}</text></svg>`;
  }

  function unitProgress(pageId) {
    const view = document.getElementById(pageId);
    if (!view) return { done: 0, total: 0, pct: 0 };
    const ids = $$('section.lesson[id]', view).map((s) => s.id);
    const done = ids.filter((id) => DSA.store.isDone(id)).length;
    return { done, total: ids.length, pct: ids.length ? done / ids.length : 0 };
  }

  function renderNav() {
    for (const list of $$('[data-nav]')) {
      list.textContent = '';
      let group = null;
      for (const p of DSA.site.pages) {
        if (p.group !== group) { group = p.group; list.append(h('li.nav-group-label', { 'aria-hidden': 'true' }, group)); }
        const prog = p.unit ? unitProgress(p.id) : null;
        const a = h('a.nav-link', { href: '#' + p.id, 'data-page': p.id },
          h('span.nav-ico', { html: icon(p.icon) }),
          h('span.nav-text', null, h('b', null, p.title), h('small', null, p.sub)),
          prog ? h('span', { html: ring(prog.pct, 30, 3.5), title: `${prog.done} of ${prog.total} sections done` }) : h('span'));
        list.append(h('li', null, a));
      }
    }
    markActiveNav();
  }

  function markActiveNav() {
    const cur = DSA.router && DSA.router.current;
    $$('.nav-link').forEach((a) => {
      const on = a.dataset.page === cur;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- XP ---------- */
  function renderXP() {
    const s = DSA.store.get();
    const L = DSA.site.levelFor(s.xp);
    $$('[data-xp-pill]').forEach((el) => { el.innerHTML = `${icon('bolt')}<span class="tnum">${s.xp}</span><span class="xp-word">XP</span>`; el.title = `${s.xp} XP · ${L.name}`; });
    $$('[data-xp-card]').forEach((el) => {
      el.innerHTML = '';
      el.append(levelBar(s.xp, L));
    });
    $$('[data-level]').forEach((el) => { el.textContent = ''; el.append(levelBar(s.xp, L)); });
    $$('[data-badges]').forEach((el) => {
      el.textContent = '';
      el.classList.add('badges');
      for (const b of DSA.site.badges) {
        const got = !!s.badges[b.id];
        el.append(h('span.badge' + (got ? '.is-earned' : ''), { title: got ? 'Earned!' : b.unit ? `Score 80%+ on the ${b.unit.toUpperCase()} unit challenge` : 'Keep going to earn this' },
          h('span.b-ico', { html: icon(b.icon) }), b.name));
      }
    });
    $$('[data-units]').forEach((el) => renderUnits(el));
    $$('[data-stat="xp"]').forEach((el) => (el.textContent = s.xp));
    $$('[data-stat="done"]').forEach((el) => (el.textContent = Object.keys(s.done).length));
    $$('[data-stat="badges"]').forEach((el) => (el.textContent = Object.keys(s.badges).length));
  }

  function levelBar(xp, L) {
    return h('div.level-bar', null,
      h('div.lb-top', null, h('span', null, L.name), h('span.tnum.muted', null, L.next ? `${xp} / ${L.next.xp} XP` : `${xp} XP · max level`)),
      h('div.lb-track', null, h('div.lb-fill', { style: `width:${Math.round(L.pct * 100)}%` })));
  }

  function renderUnits(el) {
    el.textContent = '';
    for (const p of DSA.site.pages.filter((x) => x.unit)) {
      const pr = unitProgress(p.id);
      const size = 54, stroke = 5, r = (size - stroke) / 2 - 1, c = 2 * Math.PI * r;
      el.append(h('a.unit-card', { href: '#' + p.id },
        h('span', { html: `<svg class="ring" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="27" cy="27" r="${r}"/><circle class="fill" cx="27" cy="27" r="${r}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - pr.pct)).toFixed(2)}"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle">${pr.done}/${pr.total}</text></svg>` }),
        h('span', { style: 'display:flex;flex-direction:column;gap:2px;min-width:0' },
          h('span.u-q', null, `${p.q} · 8 marks`), h('span.u-title', null, p.title), h('span.u-sub', null, p.sub.replace(/^Q\d+ · /, '')))));
    }
  }

  /* ---------- Toast and confetti ---------- */
  function toast(title, sub) {
    const zone = $('[data-toasts]');
    if (!zone) return;
    const t = h('div.toast', null, h('span', { html: icon('bolt'), style: 'width:18px;display:inline-grid;color:var(--mark-bg)' }), h('span', null, title), sub ? h('span', { style: 'font-weight:400;opacity:.8' }, sub) : null);
    zone.append(t);
    while (zone.children.length > 3) zone.firstChild.remove();
    setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, 2200);
  }

  function confetti() {
    if (DSA.util.reducedMotion()) return;
    const c = $('[data-confetti]');
    if (!c) return;
    c.hidden = false;
    const dpr = Math.min(2, root.devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    const cols = ['#2650e0', '#ffe25e', '#e8457a', '#19a97a', '#8ea6ff'];
    const parts = Array.from({ length: 110 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 160, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 11, vy: -Math.random() * 11 - 4, r: Math.random() * 6 + 4,
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[(Math.random() * cols.length) | 0],
    }));
    let frame = 0;
    (function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
      }
      if (++frame < 120) requestAnimationFrame(tick); else { ctx.clearRect(0, 0, innerWidth, innerHeight); c.hidden = true; }
    })();
  }

  /* ---------- Content upgrades ---------- */
  const CALLOUT = { analogy: ['bulb', 'Think of it like'], tip: ['smile', 'Tip'], trap: ['warn', 'Examiner’s trap'], key: ['pen', 'Write this in the exam'], mnemonic: ['key', 'Memory trick'], note: ['bulb', 'Note'] };
  function upgradeCallouts(scope) {
    for (const el of $$('.callout:not([data-ready])', scope)) {
      el.setAttribute('data-ready', '');
      const kind = Object.keys(CALLOUT).find((k) => el.classList.contains(k)) || 'note';
      const body = h('div.c-body');
      while (el.firstChild) body.appendChild(el.firstChild);
      el.append(h('span.c-ico', { html: icon(CALLOUT[kind][0]), 'aria-hidden': 'true' }), h('span.c-title', null, el.dataset.t || CALLOUT[kind][1]), body);
    }
  }

  function upgradeAnswer(a) {
    if (a.hasAttribute('data-ready')) return;
    a.setAttribute('data-ready', '');
    const body = h('div.answer-body');
    while (a.firstChild) body.appendChild(a.firstChild);
    const margin = h('div.answer-margin', null, h('span.qno', null, a.dataset.q || 'Q'), h('span.marks', null, a.dataset.m || '8M'));
    const q = $('.answer-q', body);
    const meta = h('div.answer-meta');
    if (a.dataset.time) meta.append(h('span', null, `Write in about ${a.dataset.time}`));
    if (a.dataset.pages) meta.append(h('span', null, `${a.dataset.pages} in the answer sheet`));
    const hasShort = $('.full-only, .short-only', body);
    if (hasShort) {
      const seg = DSA.kit.seg([['full', 'Full answer'], ['short', '5-min version']], 'full', (v) => a.classList.toggle('is-short', v === 'short'), 'Answer length');
      meta.append(seg);
    }
    if (q) q.after(meta); else body.prepend(meta);
    a.append(margin, body);
  }

  // Raw copies of every model answer, taken before anything is upgraded, so lessons can embed them.
  const answerTemplates = new Map();
  function snapshotAnswers() {
    for (const a of $$('.answer[id]')) answerTemplates.set(a.id, a.cloneNode(true));
  }
  function upgradeAnswerRefs(scope) {
    for (const ref of $$('[data-answer-ref]:not([data-ready])', scope)) {
      ref.setAttribute('data-ready', '');
      const ids = ref.getAttribute('data-answer-ref').split(/\s+/);
      const wrap = h('div.answer-ref-wrap');
      wrap.append(h('div.answer-ref-label', null, h('span.pen', { html: icon('pen') }), ref.dataset.label || 'Exam-ready answer'));
      for (const id of ids) {
        const tpl = answerTemplates.get(id);
        if (!tpl) continue;
        const c = tpl.cloneNode(true);
        c.removeAttribute('id');
        $$('[id]', c).forEach((x) => x.removeAttribute('id'));
        wrap.append(c);
      }
      wrap.append(h('a.link-arrow.small', { href: '#' + ids[0] }, 'See it in the Answer Bank'));
      ref.replaceWith(wrap);
    }
  }

  function addGotIt(scope) {
    for (const sec of $$('section.lesson[id]', scope)) {
      if ($('.got-it', sec)) continue;
      const id = sec.id;
      const btn = h('button.got-it', { type: 'button', 'aria-pressed': String(DSA.store.isDone(id)) }, h('span.box', { html: icon('check') }), 'I’ve got this');
      btn.addEventListener('click', () => {
        const on = !DSA.store.isDone(id);
        DSA.store.setDone(id, on);
        btn.setAttribute('aria-pressed', String(on));
        if (on) DSA.store.awardOnce('done:' + id, 20, 'Section understood');
        if (on) {
          const pg = DSA.site.pageById(sec.closest('.view').id);
          const pr = unitProgress(pg.id);
          if (pr.done === pr.total && pg.unit) { toast('Unit complete!', pg.title); confetti(); }
        }
      });
      sec.append(h('div.got-it-row', null, h('span.small.muted', null, 'Understood this part? Mark it so your progress ring fills up.'), btn));
    }
  }

  function upgrade(scope) {
    upgradeCallouts(scope);
    upgradeAnswerRefs(scope);
    $$('.answer:not([data-ready])', scope).forEach(upgradeAnswer);
    upgradeCallouts(scope);
    DSA.code.upgrade(scope);
    DSA.fig.mountAll(scope);
    for (const el of $$('[data-viz]:not([data-ready])', scope)) {
      el.setAttribute('data-ready', '');
      const fn = DSA.viz && DSA.viz[el.dataset.viz];
      if (fn) { try { fn(el); } catch (e) { console.error('viz', el.dataset.viz, e); el.textContent = 'This playground could not load.'; } }
    }
    for (const el of $$('[data-quiz]:not([data-ready]), [data-quiz-unit]:not([data-ready])', scope)) { el.setAttribute('data-ready', ''); DSA.quiz.mount(el); }
    for (const el of $$('[data-flash]:not([data-ready])', scope)) { el.setAttribute('data-ready', ''); DSA.flash.mount(el); }
    if (DSA.scn && $('[data-scenarios]:not([data-ready])', scope)) DSA.scn.mountAll(scope);
    addGotIt(scope);
  }

  function init() {
    paintThemeButtons();
    $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggleTheme));
    root.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintThemeButtons);
    $$('[data-drawer-open]').forEach((b) => b.addEventListener('click', openDrawer));
    $$('[data-drawer-close]').forEach((b) => b.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
    $('#drawer').addEventListener('click', (e) => { if (e.target.closest('a')) closeDrawer(); });
    $$('[data-icon]').forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
    const skip = $('[data-skip]');
    if (skip) skip.addEventListener('click', (e) => { e.preventDefault(); $('#main').focus(); });
    renderNav();
    renderXP();
    DSA.store.on(() => { renderXP(); renderNav(); });
  }

  DSA.ui = { init, toast, confetti, upgrade, renderNav, markActiveNav, renderXP, unitProgress, snapshotAnswers, closeDrawer };
})(typeof window !== 'undefined' ? window : globalThis);
