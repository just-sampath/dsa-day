// Shared step player: Reset / Back / Play / Next, narration, progress, and a Predict mode for active recall.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { h, icon } = DSA.util;

  class Stepper {
    constructor(host, opts) {
      this.opts = Object.assign({ speed: 1300, xpKey: null }, opts || {});
      this.steps = [];
      this.i = 0;
      this.timer = null;
      this.predict = false;
      this.pending = false;
      this.el = h('div.stepper');
      this.narr = h('div.narr', { 'aria-live': 'polite' }, h('span.narr-n'), h('span.narr-t'));
      this.pbox = h('div.predict', { hidden: true },
        h('span', null, 'What happens next? Say it out loud, then check.'),
        h('button.btn.btn-sm.btn-primary', { type: 'button', onclick: () => this.reveal() }, 'Reveal'));
      const b = (cls, label, ico, fn, text) => {
        const btn = h('button.btn.btn-sm' + (cls ? '.' + cls : ''), { type: 'button', 'aria-label': label, title: label, onclick: fn });
        btn.innerHTML = icon(ico) + (text ? `<span>${text}</span>` : '');
        return btn;
      };
      this.bReset = b('', 'Start again', 'reset', () => this.go(0));
      this.bBack = b('', 'Previous step', 'prev', () => this.go(this.i - 1));
      this.bPlay = b('', 'Play all steps', 'play', () => this.toggle(), 'Play');
      this.bNext = b('btn-primary', 'Next step', 'next', () => this.next(), 'Next');
      const tid = DSA.util.nextId('pred');
      const tog = h('label.toggle', { for: tid, title: 'Hide each step until you guess it' },
        h('input', { type: 'checkbox', id: tid, onchange: (e) => { this.predict = e.target.checked; this.stop(); this.pbox.hidden = true; this.pending = false; this.sync(); } }),
        h('span.sw'), h('span', null, 'Predict mode'));
      this.ctrl = h('div.ctrl', null, this.bReset, this.bBack, this.bPlay, this.bNext, h('span.spacer'), tog);
      this.prog = h('div.prog', null, h('div.prog-fill'));
      this.el.append(this.narr, this.pbox, this.ctrl, this.prog);
      host.appendChild(this.el);
      this.el.tabIndex = -1;
      this.el.addEventListener('keydown', (e) => {
        if (e.target.closest('input, select, textarea')) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(this.i - 1); }
      });
    }

    load(steps, start) {
      this.stop();
      this.steps = steps || [];
      this.pending = false;
      this.pbox.hidden = true;
      this.go(start === 'end' ? this.steps.length - 1 : 0, true);
    }

    go(i, silent) {
      if (!this.steps.length) { this.sync(); return; }
      this.i = Math.max(0, Math.min(this.steps.length - 1, i));
      this.pending = false;
      this.pbox.hidden = true;
      const st = this.steps[this.i];
      if (this.opts.render) this.opts.render(st, this.i, this.steps);
      this.narr.firstChild.textContent = `Step ${this.i + 1}/${this.steps.length}`;
      this.narr.lastChild.innerHTML = st.html || DSA.util.esc(st.text || '');
      this.sync();
      if (!silent && this.i === this.steps.length - 1 && this.opts.xpKey && DSA.store) {
        DSA.store.awardOnce(this.opts.xpKey + ':' + (this.opts.xpTag ? this.opts.xpTag() : ''), 5, 'Finished a walkthrough');
      }
    }

    next() {
      if (this.i >= this.steps.length - 1) { this.stop(); return; }
      if (this.predict && !this.pending) {
        this.pending = true;
        this.pbox.hidden = false;
        this.narr.firstChild.textContent = `Step ${this.i + 2}/${this.steps.length}`;
        this.narr.lastChild.textContent = this.steps[this.i + 1].ask || 'Hidden until you guess…';
        this.pbox.querySelector('button').focus({ preventScroll: true });
        this.sync();
        return;
      }
      this.go(this.i + 1);
    }

    reveal() { this.pending = false; this.go(this.i + 1); }

    toggle() { if (this.timer) this.stop(); else this.play(); }

    play() {
      if (this.predict) return;
      if (this.i >= this.steps.length - 1) this.go(0);
      this.timer = setInterval(() => {
        if (this.i >= this.steps.length - 1) { this.stop(); return; }
        this.go(this.i + 1);
      }, this.opts.speed);
      this.sync();
    }

    stop() { clearInterval(this.timer); this.timer = null; this.sync(); }

    sync() {
      const n = this.steps.length;
      this.bBack.disabled = this.i <= 0 || !n;
      this.bReset.disabled = this.i <= 0 || !n;
      this.bNext.disabled = !n || this.i >= n - 1;
      this.bPlay.disabled = !n || n < 2 || this.predict;
      this.bPlay.innerHTML = this.timer ? icon('pause') + '<span>Pause</span>' : icon('play') + '<span>Play</span>';
      this.prog.firstChild.style.width = n > 1 ? `${(this.i / (n - 1)) * 100}%` : n ? '100%' : '0';
    }
  }

  DSA.Stepper = Stepper;
})(typeof window !== 'undefined' ? window : globalThis);
