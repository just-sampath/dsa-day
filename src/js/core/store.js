(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const KEY = 'dsa-nb-v1';
  const blank = () => ({ xp: 0, done: {}, quiz: {}, theme: null, last: null, badges: {}, scn: {}, seen: {} });

  let state = blank();
  try {
    const raw = root.localStorage && root.localStorage.getItem(KEY);
    if (raw) state = Object.assign(blank(), JSON.parse(raw));
  } catch (e) { /* private mode or blocked storage: keep in memory */ }

  const listeners = new Set();
  function save() {
    try { root.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } });
  }

  const store = {
    get: () => state,
    on: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    addXP(n, why) {
      if (!n) return;
      const before = DSA.site.levelFor(state.xp).index;
      state.xp += n;
      save();
      const after = DSA.site.levelFor(state.xp);
      if (DSA.ui) DSA.ui.toast(`+${n} XP`, why);
      if (after.index > before && DSA.ui) {
        setTimeout(() => { DSA.ui.toast('Level up!', after.name); DSA.ui.confetti(); }, 600);
      }
    },
    // Award XP only once per key (so re-answering doesn't farm points).
    awardOnce(key, n, why) {
      if (state.seen[key]) return false;
      state.seen[key] = 1;
      store.addXP(n, why);
      return true;
    },
    setDone(id, val) {
      if (val) state.done[id] = 1; else delete state.done[id];
      save();
    },
    isDone: (id) => !!state.done[id],
    setQuiz(id, data) { state.quiz[id] = data; save(); },
    getQuiz: (id) => state.quiz[id],
    setScn(id, ok) { state.scn[id] = ok ? 1 : 0; save(); },
    earn(badgeId) {
      if (state.badges[badgeId]) return false;
      state.badges[badgeId] = Date.now();
      save();
      const b = DSA.site.badges.find((x) => x.id === badgeId);
      if (b && DSA.ui) { DSA.ui.toast('Badge earned', b.name); DSA.ui.confetti(); }
      return true;
    },
    setTheme(t) { state.theme = t; save(); },
    setLang(l) { state.lang = l; save(); },
    setLast(hash) { state.last = hash; try { root.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} },
    reset() { state = blank(); save(); },
  };

  DSA.store = store;
})(typeof window !== 'undefined' ? window : globalThis);
