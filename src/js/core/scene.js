// Keyed SVG scene: nodes glide to new positions and edges follow them.
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  const { s, reducedMotion } = DSA.util;
  let sceneCount = 0;

  const CW = 36; // B-tree key cell width

  const KINDS = {
    llnode: {
      size: (n) => ({ w: n.dbl ? 100 : 78, h: 40 }),
      draw(g, n) {
        const { w, h } = this.size(n);
        const x0 = -w / 2, y0 = -h / 2;
        if (n.dbl) {
          g.append(
            s('rect', { class: 'cell alt', x: x0, y: y0, width: 24, height: h, rx: 4 }),
            s('rect', { class: 'cell', x: x0 + 24, y: y0, width: w - 48, height: h }),
            s('rect', { class: 'cell alt', x: w / 2 - 24, y: y0, width: 24, height: h, rx: 4 }),
            s('text', { x: 0, y: 1 }, String(n.val))
          );
          g.append(ptrMark(x0 + 12, n.prevNull, h), ptrMark(w / 2 - 12, n.nextNull, h));
        } else {
          g.append(
            s('rect', { class: 'cell', x: x0, y: y0, width: w - 26, height: h, rx: 4 }),
            s('rect', { class: 'cell alt', x: w / 2 - 26, y: y0, width: 26, height: h, rx: 4 }),
            s('text', { x: x0 + (w - 26) / 2, y: 1 }, String(n.val))
          );
          g.append(ptrMark(w / 2 - 13, n.nextNull, h));
        }
        if (n.addr) g.append(s('text', { class: 'small', x: 0, y: h / 2 + 12 }, n.addr));
      },
      port(n, name) {
        const { w } = this.size(n);
        const dy = n.dbl ? 7 : 0;
        switch (name) {
          case 'next': return n.dbl ? [w / 2 - 12, -dy] : [w / 2 - 13, 0];
          case 'prev': return [-w / 2 + 12, dy];
          case 'inL': return [-w / 2, -dy];
          case 'inR': return [w / 2, dy];
          case 'top': return [0, -20];
          case 'bottom': return [0, 20];
          case 'bottomL': return [-w / 2 + 10, 20];
          case 'bottomR': return [w / 2 - 10, 20];
          default: return [0, 0];
        }
      },
    },
    circle: {
      size: (n) => ({ w: (n.r || 20) * 2, h: (n.r || 20) * 2 }),
      draw(g, n) {
        const r = n.r || 20;
        g.append(s('circle', { class: 'box', r }));
        g.append(s('text', { y: 1, style: String(n.val).length > 3 ? 'font-size:12px' : null }, String(n.val)));
        if (n.bf !== undefined && n.bf !== null) {
          g.append(s('text', { class: 'bf' + (Math.abs(n.bf) > 1 ? ' bad' : ''), x: r + 6, y: -r + 2, 'text-anchor': 'start' }, (n.bf > 0 ? '+' : '') + n.bf));
        }
        if (n.sub) g.append(s('text', { class: 'small', y: r + 13 }, n.sub));
      },
      radius: (n) => n.r || 20,
    },
    bnode: {
      size: (n) => ({ w: Math.max(1, n.keys.length) * CW, h: 36 }),
      draw(g, n) {
        const { w, h } = this.size(n);
        const x0 = -w / 2;
        if (!n.keys.length) g.append(s('rect', { class: 'cell', x: x0, y: -h / 2, width: w, height: h, rx: 5 }));
        n.keys.forEach((k, i) => {
          g.append(s('rect', { class: 'cell' + (n.hlKey === i ? ' hlk' : ''), x: x0 + i * CW, y: -h / 2, width: CW, height: h, rx: i === 0 || i === n.keys.length - 1 ? 4 : 0, style: n.hlKey === i ? 'fill: var(--viz-hl)' : null }));
          g.append(s('text', { x: x0 + i * CW + CW / 2, y: 1, style: String(k).length > 2 ? 'font-size:12px' : null }, String(k)));
        });
      },
      port(n, name) {
        const { w, h } = this.size(n);
        if (name === 'top') return [0, -h / 2];
        const m = /^child-(\d+)$/.exec(name || '');
        if (m) return [-w / 2 + Number(m[1]) * CW, h / 2];
        return [0, 0];
      },
    },
    label: {
      size: (n) => ({ w: String(n.text).length * 8 + 8, h: 18 + (n.len || 0) }),
      draw(g, n) {
        const len = n.len === undefined ? 20 : n.len;
        if (n.arrow === 'up') {
          g.append(s('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, n.text));
          g.append(s('path', { d: `M0 -9 L0 ${-9 - len} M-4 ${-3 - len} L0 ${-9 - len} L4 ${-3 - len}`, fill: 'none', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
        } else if (n.arrow === 'down') {
          g.append(s('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, n.text));
          g.append(s('path', { d: `M0 9 L0 ${9 + len} M-4 ${3 + len} L0 ${9 + len} L4 ${3 + len}`, fill: 'none', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
        } else {
          g.append(s('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, n.text));
        }
      },
      bounds(n) {
        const len = n.len === undefined ? 20 : n.len;
        const w = String(n.text).length * 8 + 8;
        if (n.arrow === 'up') return [-w / 2, -9 - len - 2, w / 2, 10];
        if (n.arrow === 'down') return [-w / 2, -10, w / 2, 9 + len + 2];
        return [-w / 2, -10, w / 2, 10];
      },
    },
    null: {
      size: () => ({ w: 40, h: 16 }),
      draw(g) { g.append(s('text', { x: 0, y: 0 }, 'NULL')); },
      port: (n, name) => (name === 'inR' ? [20, 0] : name === 'top' ? [0, -8] : [-20, 0]),
    },
    text: {
      size: (n) => ({ w: String(n.text).length * 7.5, h: 16 }),
      draw(g, n) { g.append(s('text', { class: n.small ? 'small' : null, x: 0, y: 0 }, n.text)); },
    },
    box: {
      size: (n) => ({ w: n.w || 50, h: n.h || 36 }),
      draw(g, n) {
        const w = n.w || 50, hh = n.h || 36;
        g.append(s('rect', { class: 'box', x: -w / 2, y: -hh / 2, width: w, height: hh, rx: 6 }));
        if (n.val !== undefined) g.append(s('text', { y: 1 }, String(n.val)));
        if (n.sub) g.append(s('text', { class: 'small', y: hh / 2 + 12 }, n.sub));
      },
    },
  };

  function ptrMark(cx, isNull, h) {
    if (isNull) {
      return s('line', { x1: cx - 7, y1: h / 2 - 6, x2: cx + 7, y2: -h / 2 + 6, stroke: 'var(--viz-stroke)', 'stroke-width': 2 });
    }
    return s('circle', { class: 'dot', cx, cy: 0, r: 3.5 });
  }

  function nodeBounds(n) {
    const k = KINDS[n.kind];
    if (k.bounds) {
      const b = k.bounds(n);
      return [n.x + b[0], n.y + b[1], n.x + b[2], n.y + b[3]];
    }
    const { w, h } = k.size(n);
    let extraB = 0, extraR = 0;
    if (n.kind === 'llnode' && n.addr) extraB = 18;
    if (n.kind === 'circle' && n.sub) extraB = 16;
    if (n.kind === 'circle' && n.bf !== undefined && n.bf !== null) extraR = 22;
    if (n.kind === 'box' && n.sub) extraB = 16;
    return [n.x - w / 2, n.y - h / 2, n.x + w / 2 + extraR, n.y + h / 2 + extraB];
  }

  function measure(spec, pad) {
    pad = pad === undefined ? 18 : pad;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of spec.nodes || []) {
      const b = nodeBounds(n);
      x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]);
    }
    for (const e of spec.edges || []) {
      if (e.kind === 'loop-below' && e._yb !== undefined) y1 = Math.max(y1, e._yb + 4);
    }
    if (spec.extra) {
      x0 = Math.min(x0, spec.extra[0]); y0 = Math.min(y0, spec.extra[1]);
      x1 = Math.max(x1, spec.extra[2]); y1 = Math.max(y1, spec.extra[3]);
    }
    if (!isFinite(x0)) return [0, 0, 200, 80];
    return [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
  }

  function union(a, b) {
    if (!a) return b;
    return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
  }

  class Scene {
    constructor(container, opts) {
      this.opts = Object.assign({ minScale: 0.6, duration: 420, maxScale: 1 }, opts || {});
      this.container = container;
      this.id = 'sc' + ++sceneCount;
      this.svg = s('svg', { class: 'scene', role: 'img', 'aria-label': this.opts.label || 'Diagram' });
      const defs = s('defs');
      for (const v of ['', 'hl', 'new', 'bad', 'temp']) {
        const m = s('marker', {
          id: `${this.id}-arrow${v ? '-' + v : ''}`, viewBox: '0 0 10 10', refX: 9, refY: 5,
          markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse',
        });
        m.append(s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'sc-arrowhead' + (v ? ' ' + v : '') }));
        defs.append(m);
      }
      this.edgeLayer = s('g', { class: 'sc-edges' });
      this.nodeLayer = s('g', { class: 'sc-nodes' });
      this.svg.append(defs, this.edgeLayer, this.nodeLayer);
      container.appendChild(this.svg);
      this.items = new Map(); // key -> {g, node, cx, cy, sig}
      this.edgeEls = new Map();
      this.edges = [];
      this.box = [0, 0, 200, 80];
      if (root.ResizeObserver) {
        this.ro = new ResizeObserver(() => { cancelAnimationFrame(this._fitRaf); this._fitRaf = requestAnimationFrame(() => this.fit()); });
        this.ro.observe(container);
      }
    }

    fit() {
      const [x0, y0, x1, y1] = this.box;
      const w = x1 - x0, hgt = y1 - y0;
      const cs = getComputedStyle(this.container);
      const avail = this.container.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
      let scale = this.opts.maxScale;
      if (avail > 0 && w * scale > avail) scale = Math.max(this.opts.minScale, avail / w);
      this.svg.setAttribute('viewBox', `${x0} ${y0} ${w} ${hgt}`);
      this.svg.setAttribute('width', Math.round(w * scale));
      this.svg.setAttribute('height', Math.round(hgt * scale));
    }

    render(spec, opt) {
      opt = opt || {};
      const animate = opt.animate !== false && !reducedMotion() && this.items.size > 0;
      const dur = animate ? (opt.duration || this.opts.duration) : 0;
      const nodes = spec.nodes || [];
      // pre-compute loop-below y for bounds
      for (const e of spec.edges || []) {
        if (e.kind === 'loop-below') {
          const ys = nodes.filter((n) => n.kind === 'llnode').map((n) => n.y);
          e._yb = (ys.length ? Math.max(...ys) : 0) + (e.depth || 42);
        }
      }
      this.box = opt.bounds || measure(spec, opt.pad);
      this.fit();

      const seen = new Set();
      const moves = [];
      for (const n of nodes) {
        seen.add(n.key);
        const sig = JSON.stringify(n, (k, v) => (k === 'x' || k === 'y' || k === 'from' ? undefined : v));
        let it = this.items.get(n.key);
        if (!it) {
          const g = s('g', { class: 'sc-node ' + n.kind + (n.cls ? ' ' + n.cls : ''), 'data-key': n.key });
          KINDS[n.kind].draw(g, n);
          this.nodeLayer.appendChild(g);
          const start = n.from || { x: n.x, y: n.y };
          it = { g, node: n, cx: start.x, cy: start.y, sig, op: animate ? 0 : 1, entering: true };
          this.items.set(n.key, it);
        } else if (it.sig !== sig || it.leaving) {
          it.g.setAttribute('class', 'sc-node ' + n.kind + (n.cls ? ' ' + n.cls : ''));
          it.g.textContent = '';
          KINDS[n.kind].draw(it.g, n);
          it.leaving = false;
        }
        it.sig = sig;
        it.node = n;
        moves.push({ it, fx: it.cx, fy: it.cy, tx: n.x, ty: n.y, fo: it.op, to: 1 });
      }
      for (const [key, it] of this.items) {
        if (!seen.has(key)) {
          it.leaving = true;
          moves.push({ it, fx: it.cx, fy: it.cy, tx: it.cx, ty: it.cy, fo: it.op, to: 0, remove: key });
        }
      }

      // Edges: rebuild elements keyed by edge key.
      this.edges = spec.edges || [];
      const eseen = new Set();
      for (const e of this.edges) {
        eseen.add(e.key);
        let el = this.edgeEls.get(e.key);
        const cls = 'sc-edge' + (e.cls ? ' ' + e.cls : '');
        if (!el) {
          const g = s('g', { class: 'sc-edge-g' });
          const path = s('path', { class: cls });
          g.append(path);
          let wg = null;
          if (e.w !== undefined) {
            wg = s('g', { class: 'sc-weight' + (e.wcls ? ' ' + e.wcls : '') });
            wg.append(s('rect', { x: -12, y: -10, width: 24, height: 20, rx: 6 }), s('text', {}, String(e.w)));
            g.append(wg);
          }
          if (animate) { g.style.opacity = '0'; g.style.transition = `opacity ${dur}ms ease`; requestAnimationFrame(() => requestAnimationFrame(() => { g.style.opacity = '1'; })); }
          this.edgeLayer.appendChild(g);
          el = { g, path, wg };
          this.edgeEls.set(e.key, el);
        } else {
          el.path.setAttribute('class', cls);
          if (el.wg) el.wg.setAttribute('class', 'sc-weight' + (e.wcls ? ' ' + e.wcls : ''));
          if (el.wg && e.w !== undefined) el.wg.lastChild.textContent = String(e.w);
        }
        const mk = e.kind === 'line' || e.kind === 'wline' ? null : markerFor(e.cls);
        if (mk) el.path.setAttribute('marker-end', `url(#${this.id}-arrow${mk ? '-' + mk : ''})`.replace('-arrow-default', '-arrow'));
        else el.path.removeAttribute('marker-end');
      }
      for (const [key, el] of this.edgeEls) {
        if (!eseen.has(key)) { el.g.remove(); this.edgeEls.delete(key); }
      }

      cancelAnimationFrame(this.raf);
      const t0 = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const t = dur ? Math.min(1, (now - t0) / dur) : 1;
        const e = ease(t);
        for (const m of moves) {
          m.it.cx = m.fx + (m.tx - m.fx) * e;
          m.it.cy = m.fy + (m.ty - m.fy) * e;
          m.it.op = m.fo + (m.to - m.fo) * e;
          m.it.g.setAttribute('transform', `translate(${m.it.cx.toFixed(1)},${m.it.cy.toFixed(1)})`);
          m.it.g.style.opacity = m.it.op >= 0.999 ? '' : String(m.it.op);
        }
        this.drawEdges();
        if (t < 1) this.raf = requestAnimationFrame(step);
        else {
          for (const m of moves) {
            if (m.remove && this.items.get(m.remove) === m.it && m.it.leaving) { m.it.g.remove(); this.items.delete(m.remove); }
          }
        }
      };
      if (dur) this.raf = requestAnimationFrame(step); else step(t0);
    }

    pos(key) {
      const it = this.items.get(key);
      return it && !it.leaving ? it : null;
    }

    portPoint(it, port, towards) {
      const n = it.node;
      const k = KINDS[n.kind];
      if (k.radius && !port) {
        const r = k.radius(n);
        const dx = towards[0] - it.cx, dy = towards[1] - it.cy;
        const d = Math.hypot(dx, dy) || 1;
        return [it.cx + (dx / d) * r, it.cy + (dy / d) * r];
      }
      if (k.port) {
        const p = k.port(n, port);
        return [it.cx + p[0], it.cy + p[1]];
      }
      return [it.cx, it.cy];
    }

    drawEdges() {
      for (const e of this.edges) {
        const el = this.edgeEls.get(e.key);
        if (!el) continue;
        const a = this.pos(e.from), b = this.pos(e.to);
        if (!a || !b) { el.g.style.display = 'none'; continue; }
        el.g.style.display = '';
        let d;
        if (e.kind === 'loop-below') {
          const p1 = this.portPoint(a, e.fp || 'bottomR', [b.cx, b.cy]);
          const p2 = this.portPoint(b, e.tp || 'bottomL', [a.cx, a.cy]);
          const yb = e._yb;
          const r = 10;
          d = `M${p1[0]},${p1[1]} L${p1[0]},${yb - r} Q${p1[0]},${yb} ${p1[0] - r},${yb} L${p2[0] + r},${yb} Q${p2[0]},${yb} ${p2[0]},${yb - r} L${p2[0]},${p2[1] + 2}`;
        } else {
          const ca = [a.cx, a.cy], cb = [b.cx, b.cy];
          let p1 = this.portPoint(a, e.fp, cb);
          let p2 = this.portPoint(b, e.tp, ca);
          if (e.kind === 'arrow' || !e.kind) {
            // keep a hair of space before the target for the arrowhead
            const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
            const dd = Math.hypot(dx, dy) || 1;
            p2 = [p2[0] - (dx / dd) * 1.5, p2[1] - (dy / dd) * 1.5];
          }
          if (e.bend) {
            const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
            const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
            const dd = Math.hypot(dx, dy) || 1;
            const cx = mx - (dy / dd) * e.bend, cy = my + (dx / dd) * e.bend;
            d = `M${p1[0]},${p1[1]} Q${cx},${cy} ${p2[0]},${p2[1]}`;
            if (el.wg) el.wg.setAttribute('transform', `translate(${(mx + cx) / 2},${(my + cy) / 2})`);
          } else {
            d = `M${p1[0].toFixed(1)},${p1[1].toFixed(1)} L${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
            if (el.wg) el.wg.setAttribute('transform', `translate(${((p1[0] + p2[0]) / 2).toFixed(1)},${((p1[1] + p2[1]) / 2).toFixed(1)})`);
          }
        }
        el.path.setAttribute('d', d);
      }
    }

    clear() {
      this.nodeLayer.textContent = '';
      this.edgeLayer.textContent = '';
      this.items.clear();
      this.edgeEls.clear();
    }
  }

  function markerFor(cls) {
    if (!cls) return 'default';
    if (/\bis-hl\b|\bis-ptr\b(?!.*\b(temp|new)\b)/.test(cls) && !/temp|new/.test(cls)) return 'hl';
    if (/\bnew\b|is-new/.test(cls)) return 'new';
    if (/is-bad/.test(cls)) return 'bad';
    if (/temp/.test(cls)) return 'temp';
    return 'default';
  }

  DSA.Scene = Scene;
  DSA.sceneMeasure = measure;
  DSA.sceneUnion = union;
})(typeof window !== 'undefined' ? window : globalThis);
