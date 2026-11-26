// Hash router: #page shows a page; #section-id shows the page that holds it and scrolls there.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { $, $$, h, icon } = DSA.util;

  const router = { current: null };
  let spy = null;

  function views() { return $$('main > .view'); }

  function resolve(hash) {
    const id = decodeURIComponent((hash || '').replace(/^#/, ''));
    if (!id) return { view: 'home' };
    const el = document.getElementById(id);
    if (!el) return { view: 'home' };
    if (el.classList.contains('view')) return { view: id };
    const v = el.closest('.view');
    if (v) return { view: v.id, target: el };
    return null;
  }

  function show(viewId, target, opts) {
    opts = opts || {};
    const v = document.getElementById(viewId);
    if (!v) return;
    const changed = router.current !== viewId;
    if (changed) {
      views().forEach((x) => (x.hidden = x !== v));
      router.current = viewId;
      DSA.ui.upgrade(v);
      buildPageNav(v);
      buildChips(v);
      const p = DSA.site.pageById(viewId);
      document.title = p && viewId !== 'home' ? `${p.title} · DSA Night Before` : 'DSA Night Before';
      DSA.ui.markActiveNav();
    }
    if (target) {
      // the target may live inside a closed <details>
      let d = target.closest('details');
      while (d) { d.open = true; d = d.parentElement && d.parentElement.closest('details'); }
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: changed || DSA.util.reducedMotion() ? 'auto' : 'smooth' }));
    } else if (changed && !opts.keepScroll) {
      root.scrollTo(0, 0);
    }
    DSA.store.setLast('#' + (target && target.id ? target.id : viewId));
  }

  function route() {
    const r = resolve(location.hash);
    if (!r) return; // e.g. #main skip link: let the browser handle it
    show(r.view, r.target);
  }

  function buildPageNav(v) {
    if ($('.page-nav', v)) return;
    const pages = DSA.site.pages;
    const i = pages.findIndex((p) => p.id === v.id);
    const prev = pages[i - 1], next = pages[i + 1];
    const nav = h('nav.page-nav', { 'aria-label': 'Next and previous page' });
    if (prev) nav.append(h('a.prev', { href: '#' + prev.id }, h('small', null, '← Previous'), h('b', null, prev.title)));
    else nav.append(h('span'));
    if (next) nav.append(h('a.next', { href: '#' + next.id }, h('small', null, 'Next →'), h('b', null, next.title)));
    v.append(nav);
  }

  function buildChips(v) {
    const chips = $('[data-chips]');
    const toc = $('[data-toc]');
    const secs = $$('section.lesson[id]', v);
    chips.textContent = '';
    toc.textContent = '';
    chips.hidden = secs.length < 2;
    $('.toc').style.visibility = secs.length < 2 ? 'hidden' : '';
    const links = [];
    for (const s of secs) {
      const title = s.dataset.title || ($('h2', s) || {}).textContent || s.id;
      const done = DSA.store.isDone(s.id);
      const chip = h('a.chip', { href: '#' + s.id, 'data-for': s.id }, done ? h('span.tick', { html: '&#10003;' }) : null, title);
      const tl = h('a', { href: '#' + s.id, 'data-for': s.id }, title, done ? h('span.tick', { html: '&#10003;' }) : null);
      chips.append(chip);
      toc.append(h('li', null, tl));
      links.push(chip, tl);
    }
    if (spy) spy.disconnect();
    if (!secs.length || !root.IntersectionObserver) return;
    const visible = new Map();
    spy = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : null);
      let best = null, bestTop = Infinity;
      for (const s of secs) {
        const t = visible.get(s.id);
        if (t !== null && t !== undefined && t < bestTop) { best = s.id; bestTop = t; }
      }
      if (!best) return;
      links.forEach((l) => l.classList.toggle('is-active', l.dataset.for === best));
      const chip = chips.querySelector(`[data-for="${best}"]`);
      if (chip && !chips.hidden) {
        const left = chip.offsetLeft - chips.clientWidth / 2 + chip.clientWidth / 2;
        chips.scrollTo({ left, behavior: DSA.util.reducedMotion() ? 'auto' : 'smooth' });
      }
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    secs.forEach((s) => spy.observe(s));
  }

  function init() {
    root.addEventListener('hashchange', route);
    // Refresh ticks when a section is marked done.
    DSA.store.on(() => {
      const v = router.current && document.getElementById(router.current);
      if (!v) return;
      $$('section.lesson[id]', v).forEach((s) => {
        const done = DSA.store.isDone(s.id);
        $$(`[data-for="${s.id}"]`).forEach((a) => {
          const t = a.querySelector('.tick');
          if (done && !t) a[a.classList.contains('chip') ? 'prepend' : 'append'](h('span.tick', { html: '&#10003;' }));
          if (!done && t) t.remove();
        });
      });
    });
    const last = DSA.store.get().last;
    route();
    // On the home page, offer to jump back to where she stopped last time.
    const r = last && resolve(last);
    const banner = $('[data-resume]');
    if (banner && r && r.view !== 'home') {
      const p = DSA.site.pageById(r.view);
      const label = r.target ? (r.target.dataset.title || (r.target.querySelector('h2') || {}).textContent || p.title) : p.title;
      banner.hidden = false;
      const a = banner.querySelector('a');
      a.setAttribute('href', last);
      a.textContent = `Continue: ${p.title}${r.target ? ' · ' + label : ''}`;
    }
  }

  router.init = init;
  router.show = show;
  router.route = route;
  DSA.router = router;
})(typeof window !== 'undefined' ? window : globalThis);
