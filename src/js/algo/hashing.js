// Hash functions and collision resolution (chaining, linear, quadratic, double hashing) with probe traces.
(function (root) {
  const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const primeBelow = (m) => { for (let p = m - 1; p >= 2; p--) if (isPrime(p)) return p; return 1; };
  const mod = (a, m) => ((a % m) + m) % m;

  const METHODS = {
    chaining: 'Separate chaining',
    linear: 'Linear probing',
    quadratic: 'Quadratic probing',
    double: 'Double hashing',
  };

  // Inserts keys one by one. Returns {table, steps, R}. table[i] = key | null (or array for chaining).
  function build(keys, m, method, opts) {
    opts = opts || {};
    const R = opts.R || primeBelow(m);
    const table = method === 'chaining' ? Array.from({ length: m }, () => []) : new Array(m).fill(null);
    const steps = [];
    const results = [];
    for (const k of keys) {
      const h = mod(k, m);
      const probes = [];
      let placed = -1;
      let note = '';
      if (method === 'chaining') {
        table[h].push(k);
        placed = h;
        probes.push({ i: 0, idx: h, formula: `h(${k}) = ${k} mod ${m} = ${h}`, hit: table[h].length > 1 });
        note = table[h].length > 1 ? `Collision at ${h}: add ${k} to the end of the chain there.` : `Slot ${h} is empty, store ${k} there (start a chain).`;
      } else {
        const h2 = method === 'double' ? R - mod(k, R) : 0;
        for (let i = 0; i < m; i++) {
          let idx, formula;
          if (method === 'linear') { idx = mod(h + i, m); formula = i === 0 ? `h(${k}) = ${k} mod ${m} = ${h}` : `(${h} + ${i}) mod ${m} = ${idx}`; }
          else if (method === 'quadratic') { idx = mod(h + i * i, m); formula = i === 0 ? `h(${k}) = ${k} mod ${m} = ${h}` : `(${h} + ${i}²) mod ${m} = (${h} + ${i * i}) mod ${m} = ${idx}`; }
          else { idx = mod(h + i * h2, m); formula = i === 0 ? `h1(${k}) = ${k} mod ${m} = ${h}` : `(${h} + ${i} × ${h2}) mod ${m} = ${idx}`; }
          const busy = table[idx] !== null;
          probes.push({ i, idx, formula, hit: busy, by: busy ? table[idx] : null });
          if (!busy) { table[idx] = k; placed = idx; break; }
        }
        if (method === 'double') note = `h2(${k}) = ${R} − (${k} mod ${R}) = ${h2}. `;
        const coll = probes.length - 1;
        if (placed === -1) note += `No free slot found after ${probes.length} probes — ${k} could not be inserted. ${method === 'quadratic' ? 'Quadratic probing may miss empty slots; keep the table less than half full or use a prime size.' : 'The table is full.'}`;
        else note += coll ? `${coll} collision${coll > 1 ? 's' : ''}, placed at ${placed}.` : `Slot ${placed} is free, placed directly.`;
      }
      const snapshot = method === 'chaining' ? table.map((c) => c.slice()) : table.slice();
      steps.push({ key: k, probes, placed, note, table: snapshot });
      results.push({ key: k, placed, probes: probes.length });
    }
    return { table, steps, R, results };
  }

  // Load factor
  const loadFactor = (n, m) => n / m;

  // Other hash functions, for the calculator.
  function midSquare(k, m) {
    const sq = k * k;
    const digits = String(m - 1).length;
    const s = String(sq);
    const start = Math.max(0, Math.floor((s.length - digits) / 2));
    const mid = s.slice(start, start + digits);
    return { value: Number(mid) % m, work: `${k}² = ${sq}. Take the middle ${digits} digit(s): ${mid}.` + (Number(mid) >= m ? ` ${mid} mod ${m} = ${Number(mid) % m}.` : '') };
  }
  function folding(k, m) {
    const digits = Math.max(1, String(m - 1).length);
    const s = String(k);
    const parts = [];
    for (let i = 0; i < s.length; i += digits) parts.push(s.slice(i, i + digits));
    const sum = parts.reduce((a, p) => a + Number(p), 0);
    return { value: sum % m, work: `Split ${k} into parts of ${digits} digit(s): ${parts.join(' + ')} = ${sum}. ${sum} mod ${m} = ${sum % m}.` };
  }
  function multiplication(k, m, A) {
    A = A || 0.6180339887;
    const p = k * A;
    const frac = p - Math.floor(p);
    const v = Math.floor(m * frac);
    return { value: v, work: `k × A = ${k} × ${A.toFixed(4)} = ${p.toFixed(4)}. Fraction part = ${frac.toFixed(4)}. ⌊${m} × ${frac.toFixed(4)}⌋ = ${v}.` };
  }
  function division(k, m) { return { value: mod(k, m), work: `${k} mod ${m} = ${mod(k, m)} (the remainder when ${k} is divided by ${m}).` }; }

  const X = { build, METHODS, primeBelow, isPrime, loadFactor, midSquare, folding, multiplication, division };
  root.DSA = root.DSA || {};
  root.DSA.hash = X;
  if (typeof module === 'object' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
