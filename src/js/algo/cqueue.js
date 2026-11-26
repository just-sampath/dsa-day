// Linear queue and circular queue on a fixed array (front = rear = -1 when empty, the usual textbook version).
(function (root) {
  function make(size) {
    return { size, arr: new Array(size).fill(null), front: -1, rear: -1 };
  }
  const clone = (q) => ({ size: q.size, arr: q.arr.slice(), front: q.front, rear: q.rear });

  function isEmpty(q) { return q.front === -1; }
  function isFullCircular(q) { return (q.rear + 1) % q.size === q.front; }
  function count(q) {
    if (q.front === -1) return 0;
    return q.rear >= q.front ? q.rear - q.front + 1 : q.size - q.front + q.rear + 1;
  }

  // Circular enqueue; returns {q, ok, msg, touched}
  function enqueue(q0, x) {
    const q = clone(q0);
    if (isFullCircular(q)) {
      return { q, ok: false, msg: `Overflow: (rear + 1) % ${q.size} = (${q.rear} + 1) % ${q.size} = ${(q.rear + 1) % q.size}, which equals front (${q.front}). The queue is full.` };
    }
    let how;
    if (q.front === -1) { q.front = 0; q.rear = 0; how = 'The queue was empty, so front = rear = 0.'; }
    else {
      const old = q.rear;
      q.rear = (q.rear + 1) % q.size;
      how = `rear = (rear + 1) % ${q.size} = (${old} + 1) % ${q.size} = ${q.rear}.` + (q.rear < old ? ' It wrapped around to the start!' : '');
    }
    q.arr[q.rear] = x;
    return { q, ok: true, msg: `${how} Put ${x} at index ${q.rear}.`, touched: q.rear };
  }

  function dequeue(q0) {
    const q = clone(q0);
    if (isEmpty(q)) return { q, ok: false, msg: 'Underflow: front is -1, the queue is empty.' };
    const x = q.arr[q.front];
    const at = q.front;
    q.arr[q.front] = null;
    let how;
    if (q.front === q.rear) { q.front = -1; q.rear = -1; how = 'That was the only element, so front = rear = -1 (empty again).'; }
    else {
      const old = q.front;
      q.front = (q.front + 1) % q.size;
      how = `front = (front + 1) % ${q.size} = (${old} + 1) % ${q.size} = ${q.front}.` + (q.front < old ? ' It wrapped around!' : '');
    }
    return { q, ok: true, value: x, msg: `Removed ${x} from index ${at}. ${how}`, touched: at };
  }

  // Linear queue: rear only moves forward, so freed front slots are wasted.
  function enqueueLinear(q0, x) {
    const q = clone(q0);
    if (q.rear === q.size - 1) {
      const wasted = q.front > 0 ? q.front : 0;
      return { q, ok: false, msg: `Overflow: rear = ${q.size - 1} = MAX − 1.` + (wasted ? ` But ${wasted} slot(s) at the front are empty and can't be used. This is why we need a circular queue.` : '') };
    }
    if (q.front === -1) q.front = 0;
    q.rear++;
    q.arr[q.rear] = x;
    return { q, ok: true, msg: `rear = ${q.rear}. Put ${x} at index ${q.rear}.`, touched: q.rear };
  }

  function dequeueLinear(q0) {
    const q = clone(q0);
    if (q.front === -1 || q.front > q.rear) return { q, ok: false, msg: 'Underflow: the queue is empty.' };
    const x = q.arr[q.front];
    const at = q.front;
    q.arr[q.front] = null;
    q.front++;
    let extra = '';
    if (q.front > q.rear) { extra = ' The queue is now empty, but front and rear stay where they are in this simple version.'; }
    return { q, ok: true, value: x, msg: `Removed ${x} from index ${at}. front = ${q.front}.${extra}`, touched: at };
  }

  const X = { make, enqueue, dequeue, enqueueLinear, dequeueLinear, isEmpty, isFullCircular, count };
  root.DSA = root.DSA || {};
  root.DSA.cq = X;
  if (typeof module === 'object' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
