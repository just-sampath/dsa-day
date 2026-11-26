// Linked list operations (singly, doubly, circular) as step-by-step snapshots with plain-English narration.
(function (root) {
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const ALGO = {
    insertFront: {
      sll: ['Create a new node and put the data in it.', 'Point the new node at the current first node: newNode→next = head.', 'Move head to the new node: head = newNode.'],
      dll: ['Create a new node with the data. Its prev = NULL.', 'newNode→next = head.', 'If the list is not empty, the old first node points back: head→prev = newNode.', 'head = newNode.'],
      cll: ['Create a new node with the data.', 'If the list is empty: newNode→next = newNode (it points to itself), head = newNode. Stop.', 'Walk temp to the last node (the node whose next is head).', 'newNode→next = head.', 'last→next = newNode (keeps the circle closed).', 'head = newNode.'],
    },
    insertEnd: {
      sll: ['Create a new node with the data. Its next = NULL.', 'If the list is empty, head = newNode. Stop.', 'Start temp at head and move it forward until temp→next is NULL (temp is then the last node).', 'temp→next = newNode.'],
      dll: ['Create a new node with the data. Its next = NULL.', 'If the list is empty, head = newNode. Stop.', 'Walk temp to the last node.', 'temp→next = newNode.', 'newNode→prev = temp.'],
      cll: ['Create a new node with the data.', 'If the list is empty: newNode→next = newNode, head = newNode. Stop.', 'Walk temp to the last node (temp→next == head).', 'temp→next = newNode.', 'newNode→next = head (close the circle).'],
    },
    insertAt: {
      sll: ['If position is 1, do "insert at beginning". If it is length+1, do "insert at end".', 'Create a new node with the data.', 'Walk temp to the node at position (pos − 1).', 'newNode→next = temp→next.', 'temp→next = newNode.'],
      dll: ['If position is 1, do "insert at beginning". If it is length+1, do "insert at end".', 'Create a new node with the data.', 'Walk temp to the node at position (pos − 1).', 'newNode→next = temp→next and newNode→prev = temp.', 'temp→next→prev = newNode.', 'temp→next = newNode.'],
      cll: ['If position is 1, do "insert at beginning". If it is length+1, do "insert at end".', 'Create a new node with the data.', 'Walk temp to the node at position (pos − 1).', 'newNode→next = temp→next.', 'temp→next = newNode.'],
    },
    deleteFront: {
      sll: ['If head is NULL the list is empty (underflow). Stop.', 'temp = head (the node to delete).', 'head = head→next.', 'free(temp).'],
      dll: ['If head is NULL the list is empty. Stop.', 'temp = head.', 'head = head→next.', 'If head is not NULL, head→prev = NULL.', 'free(temp).'],
      cll: ['If head is NULL the list is empty. Stop.', 'If there is only one node, free it and set head = NULL. Stop.', 'Walk last to the last node.', 'temp = head, then head = head→next.', 'last→next = head (the circle skips the old first node).', 'free(temp).'],
    },
    deleteEnd: {
      sll: ['If head is NULL the list is empty. Stop.', 'If there is only one node, free(head) and head = NULL. Stop.', 'Walk temp to the second-last node (until temp→next→next is NULL).', 'free(temp→next), then temp→next = NULL.'],
      dll: ['If head is NULL the list is empty. Stop.', 'If there is only one node, free(head) and head = NULL. Stop.', 'Walk temp to the last node.', 'temp→prev→next = NULL.', 'free(temp).'],
      cll: ['If head is NULL the list is empty. Stop.', 'If there is only one node, free it and head = NULL. Stop.', 'Walk temp to the second-last node (temp→next→next == head).', 'free(temp→next), then temp→next = head.'],
    },
    deleteAt: {
      sll: ['If position is 1, do "delete from beginning".', 'Walk temp to the node at position (pos − 1).', 'del = temp→next (the node to delete).', 'temp→next = del→next (skip over it).', 'free(del).'],
      dll: ['If position is 1, do "delete from beginning".', 'Walk temp to the node at position pos (the one to delete).', 'temp→prev→next = temp→next.', 'If temp→next is not NULL, temp→next→prev = temp→prev.', 'free(temp).'],
      cll: ['If position is 1, do "delete from beginning".', 'Walk temp to the node at position (pos − 1).', 'del = temp→next (the node to delete).', 'temp→next = del→next (skip over it).', 'free(del).'],
    },
    search: {
      sll: ['temp = head, pos = 1.', 'While temp is not NULL: if temp→data == key, it is found at pos. Stop.', 'Otherwise temp = temp→next and pos = pos + 1.', 'If temp becomes NULL, the key is not in the list.'],
      dll: ['temp = head, pos = 1.', 'While temp is not NULL: if temp→data == key, it is found at pos. Stop.', 'Otherwise temp = temp→next and pos = pos + 1.', 'If temp becomes NULL, the key is not in the list.'],
      cll: ['If the list is empty, not found. temp = head, pos = 1.', 'Repeat: if temp→data == key, it is found at pos. Stop.', 'temp = temp→next, pos = pos + 1, until temp comes back to head.', 'Back at head means the key is not in the list.'],
    },
    traverse: {
      sll: ['temp = head.', 'While temp is not NULL: print temp→data, then temp = temp→next.', 'temp is NULL → stop.'],
      dll: ['temp = head.', 'While temp is not NULL: print temp→data, then temp = temp→next.', 'temp is NULL → stop.'],
      cll: ['If the list is empty, stop. temp = head.', 'Do: print temp→data, temp = temp→next, while temp != head.', 'temp is back at head → stop (otherwise it would loop forever).'],
    },
    reverse: {
      sll: ['prev = NULL, curr = head.', 'While curr is not NULL: next = curr→next; curr→next = prev; prev = curr; curr = next.', 'head = prev.'],
      dll: ['temp = head.', 'For every node: swap its prev and next pointers, then move to the next node (which is now in prev).', 'The old last node becomes head.'],
      cll: ['prev = last node, curr = head.', 'Do: next = curr→next; curr→next = prev; prev = curr; curr = next; while curr != head.', 'head = prev (the old last node).'],
    },
  };

  function make(mode, vals) {
    const st = { mode, nodes: {}, head: null, ptrs: {}, hl: [], fresh: [], del: [], hlEdges: [], out: [], nextId: 1, order: null, found: null };
    let prev = null;
    for (const v of vals) {
      const id = newNode(st, v);
      if (prev === null) st.head = id;
      else { st.nodes[prev].next = id; if (mode === 'dll') st.nodes[id].prev = prev; }
      prev = id;
    }
    if (mode === 'cll' && prev !== null) st.nodes[prev].next = st.head;
    return st;
  }

  function newNode(st, v) {
    const id = 'n' + st.nextId;
    st.nodes[id] = { val: v, next: null, prev: null, addr: String(100 * st.nextId) };
    st.nextId++;
    return id;
  }

  function chain(st) {
    const out = [];
    const seen = new Set();
    let c = st.head;
    while (c && st.nodes[c] && !seen.has(c)) { out.push(c); seen.add(c); c = st.nodes[c].next; }
    return out;
  }

  const values = (st) => chain(st).map((id) => st.nodes[id].val);

  function run(st0, op, arg1, arg2) {
    const st = clone(st0);
    Object.assign(st, { ptrs: {}, hl: [], fresh: [], del: [], hlEdges: [], out: [], order: null, found: null, hint: null });
    const mode = st.mode;
    const algo = ALGO[op][mode];
    const steps = [];
    const V = (id) => (id && st.nodes[id] ? st.nodes[id].val : 'NULL');
    const nx = (id) => st.nodes[id].next;
    const push = (text, line) => steps.push({ text, line, state: clone(st) });
    const len = chain(st).length;
    const stopAt = mode === 'cll' ? st.head : null;
    const fail = (msg) => ({ error: msg, steps: [], algo, final: st0 });

    push('Starting list.', -1);

    if (op === 'insertFront') {
      const v = arg1;
      const id = newNode(st, v);
      st.fresh = [id]; st.ptrs.newNode = id; st.hint = { id, at: 0 };
      push(`Create a new node with data ${v}.`, 0);
      if (mode === 'cll') {
        if (!st.head) {
          st.nodes[id].next = id; st.head = id;
          push('The list is empty, so the new node points to itself and head = newNode.', 1);
        } else {
          let t = st.head; st.ptrs.temp = t;
          push(`temp = head (${V(t)}). We need the last node.`, 2);
          while (nx(t) !== st.head) { t = nx(t); st.ptrs.temp = t; push(`temp→next is not head, move temp to ${V(t)}.`, 2); }
          const old = chain(st);
          st.nodes[id].next = st.head; st.hlEdges = [id + ':next'];
          push(`temp is the last node. newNode→next = head (${V(st.head)}).`, 3);
          st.nodes[t].next = id; st.hlEdges = [t + ':next']; st.order = [id].concat(old);
          push(`last→next = newNode, so ${V(t)} now points to ${v}. The circle stays closed.`, 4);
          st.head = id; delete st.ptrs.temp; st.hlEdges = [];
          push(`head = newNode. ${v} is the first node.`, 5);
        }
      } else {
        st.nodes[id].next = st.head; st.hlEdges = [id + ':next'];
        push(st.head ? `newNode→next = head, so ${v} points to ${V(st.head)}.` : 'The list is empty, so newNode→next = head = NULL.', 1);
        if (mode === 'dll') {
          if (st.head) {
            st.nodes[st.head].prev = id; st.hlEdges = [st.head + ':prev'];
            push(`head→prev = newNode, so ${V(st.head)} points back to ${v}.`, 2);
          }
          st.head = id; st.hlEdges = [];
          push(`head = newNode. ${v} is now the first node.`, 3);
        } else {
          st.head = id; st.hlEdges = [];
          push(`head = newNode. ${v} is now the first node.`, 2);
        }
      }
    }

    else if (op === 'insertEnd') {
      const v = arg1;
      const id = newNode(st, v);
      st.fresh = [id]; st.ptrs.newNode = id; st.hint = { id, at: len };
      push(`Create a new node with data ${v}.${mode === 'cll' ? '' : ' Its next is NULL.'}`, 0);
      if (!st.head) {
        if (mode === 'cll') st.nodes[id].next = id;
        st.head = id;
        push(`The list is empty, so head = newNode${mode === 'cll' ? ' and it points to itself' : ''}.`, 1);
      } else {
        let t = st.head; st.ptrs.temp = t;
        push(`temp = head (${V(t)}).`, 2);
        while (nx(t) !== stopAt) { t = nx(t); st.ptrs.temp = t; push(`temp→next is not ${mode === 'cll' ? 'head' : 'NULL'}, move temp to ${V(t)}.`, 2); }
        st.nodes[t].next = id; st.hlEdges = [t + ':next'];
        push(`temp (${V(t)}) is the last node. temp→next = newNode.`, 3);
        if (mode === 'dll') {
          st.nodes[id].prev = t; st.hlEdges = [id + ':prev'];
          push(`newNode→prev = temp, so ${v} points back to ${V(t)}.`, 4);
        }
        if (mode === 'cll') {
          st.nodes[id].next = st.head; st.hlEdges = [id + ':next'];
          push(`newNode→next = head (${V(st.head)}), closing the circle.`, 4);
        }
        delete st.ptrs.temp;
      }
    }

    else if (op === 'insertAt') {
      const pos = Number(arg1), v = arg2;
      if (!Number.isInteger(pos) || pos < 1 || pos > len + 1) return fail(`Position must be between 1 and ${len + 1}.`);
      if (pos === 1 || pos === len + 1) {
        const r = run(st0, pos === 1 ? 'insertFront' : 'insertEnd', v);
        r.steps.splice(1, 0, { text: `Position ${pos} is the ${pos === 1 ? 'beginning' : 'end'}, so this is "insert at ${pos === 1 ? 'beginning' : 'end'}".`, line: 0, state: r.steps[0].state });
        r.algo = algo;
        r.steps.forEach((s, i) => { if (i > 1) s.line = -1; });
        return r;
      }
      const id = newNode(st, v);
      st.fresh = [id]; st.ptrs.newNode = id; st.hint = { id, at: pos - 1 };
      push(`Create a new node with data ${v}.`, 1);
      let t = st.head; st.ptrs.temp = t;
      push(`temp = head (position 1, value ${V(t)}).`, 2);
      for (let i = 1; i < pos - 1; i++) { t = nx(t); st.ptrs.temp = t; push(`Move temp to position ${i + 1} (${V(t)}).`, 2); }
      const after = nx(t);
      if (mode === 'dll') {
        st.nodes[id].next = after; st.nodes[id].prev = t; st.hlEdges = [id + ':next', id + ':prev'];
        push(`temp is at position ${pos - 1}. newNode→next = temp→next (${V(after)}) and newNode→prev = temp (${V(t)}).`, 3);
        st.nodes[after].prev = id; st.hlEdges = [after + ':prev'];
        push(`temp→next→prev = newNode, so ${V(after)} points back to ${v}.`, 4);
        st.nodes[t].next = id; st.hlEdges = [t + ':next'];
        push(`temp→next = newNode. ${v} is now at position ${pos}.`, 5);
      } else {
        st.nodes[id].next = after; st.hlEdges = [id + ':next'];
        push(`temp is at position ${pos - 1}. newNode→next = temp→next, so ${v} points to ${V(after)}.`, 3);
        st.nodes[t].next = id; st.hlEdges = [t + ':next'];
        push(`temp→next = newNode. ${v} is now at position ${pos}.`, 4);
      }
      delete st.ptrs.temp;
    }

    else if (op === 'deleteFront') {
      if (!st.head) { push('head is NULL: the list is empty (underflow). Nothing to delete.', 0); return { steps, algo, final: st0, error: null, empty: true }; }
      if (mode === 'cll') {
        if (nx(st.head) === st.head) {
          st.del = [st.head]; push(`Only one node (${V(st.head)}). It will be deleted.`, 1);
          delete st.nodes[st.head]; st.head = null; st.del = [];
          push('free(head) and head = NULL. The list is now empty.', 1);
        } else {
          const old = chain(st);
          st.order = old;
          let l = st.head; st.ptrs.last = l;
          push(`last = head (${V(l)}). Walk it to the last node.`, 2);
          while (nx(l) !== st.head) { l = nx(l); st.ptrs.last = l; push(`Move last to ${V(l)}.`, 2); }
          const t = st.head; st.ptrs.temp = t; st.del = [t];
          st.head = nx(t);
          push(`last is ${V(l)}. temp = head (${V(t)}), then head = head→next (${V(st.head)}).`, 3);
          st.nodes[l].next = st.head; st.hlEdges = [l + ':next'];
          push(`last→next = head, so ${V(l)} now points to ${V(st.head)} and skips ${V(t)}.`, 4);
          delete st.nodes[t]; st.del = []; delete st.ptrs.temp; delete st.ptrs.last; st.order = null; st.hlEdges = [];
          push(`free(temp): ${old.length > 0 ? st0.nodes[t].val : ''} is deleted.`, 5);
        }
      } else {
        const t = st.head; st.ptrs.temp = t; st.del = [t];
        push(`temp = head. The node to delete is ${V(t)}.`, 1);
        st.head = nx(t);
        push(`head = head→next. ${st.head ? V(st.head) + ' is the new first node.' : 'head is NULL now.'}`, 2);
        if (mode === 'dll') {
          if (st.head) { st.nodes[st.head].prev = null; st.hlEdges = [st.head + ':prev']; push(`head→prev = NULL, so ${V(st.head)} no longer points back.`, 3); }
          delete st.nodes[t]; st.del = []; delete st.ptrs.temp; st.hlEdges = [];
          push(`free(temp): ${st0.nodes[t].val} is deleted.`, 4);
        } else {
          delete st.nodes[t]; st.del = []; delete st.ptrs.temp;
          push(`free(temp): ${st0.nodes[t].val} is deleted and its memory goes back to the system.`, 3);
        }
      }
    }

    else if (op === 'deleteEnd') {
      if (!st.head) { push('head is NULL: the list is empty. Nothing to delete.', 0); return { steps, algo, final: st0, empty: true }; }
      if (len === 1) {
        st.del = [st.head]; push(`Only one node (${V(st.head)}).`, 1);
        delete st.nodes[st.head]; st.head = null; st.del = [];
        push('free(head) and head = NULL. The list is now empty.', 1);
      } else if (mode === 'dll') {
        let t = st.head; st.ptrs.temp = t;
        push(`temp = head (${V(t)}).`, 2);
        while (nx(t) !== null) { t = nx(t); st.ptrs.temp = t; push(`Move temp to ${V(t)}.`, 2); }
        st.del = [t];
        const p = st.nodes[t].prev;
        st.nodes[p].next = null; st.hlEdges = [p + ':next'];
        push(`temp (${V(t)}) is the last node. temp→prev→next = NULL, so ${V(p)} becomes the last node.`, 3);
        delete st.nodes[t]; st.del = []; delete st.ptrs.temp; st.hlEdges = [];
        push(`free(temp): ${st0.nodes[t].val} is deleted.`, 4);
      } else {
        let t = st.head; st.ptrs.temp = t;
        push(`temp = head (${V(t)}).`, 2);
        while (nx(nx(t)) !== stopAt) { t = nx(t); st.ptrs.temp = t; push(`temp→next→next is not ${mode === 'cll' ? 'head' : 'NULL'}, move temp to ${V(t)}.`, 2); }
        const d = nx(t); st.del = [d];
        push(`temp (${V(t)}) is the second-last node. temp→next (${V(d)}) will be deleted.`, 2);
        delete st.nodes[d]; st.del = [];
        st.nodes[t].next = mode === 'cll' ? st.head : null; st.hlEdges = [t + ':next'];
        push(`free(temp→next) deletes ${st0.nodes[d].val}, then temp→next = ${mode === 'cll' ? 'head (circle closed again)' : 'NULL'}.`, 3);
        delete st.ptrs.temp;
      }
    }

    else if (op === 'deleteAt') {
      const pos = Number(arg1);
      if (!len) { push('head is NULL: the list is empty. Nothing to delete.', 0); return { steps, algo, final: st0, empty: true }; }
      if (!Number.isInteger(pos) || pos < 1 || pos > len) return fail(`Position must be between 1 and ${len}.`);
      if (pos === 1) {
        const r = run(st0, 'deleteFront');
        r.steps.splice(1, 0, { text: 'Position 1 is the first node, so this is "delete from beginning".', line: 0, state: r.steps[0].state });
        r.algo = algo;
        r.steps.forEach((s, i) => { if (i > 1) s.line = -1; });
        return r;
      }
      if (mode === 'dll') {
        let t = st.head; st.ptrs.temp = t;
        push(`temp = head (position 1, ${V(t)}).`, 1);
        for (let i = 1; i < pos; i++) { t = nx(t); st.ptrs.temp = t; push(`Move temp to position ${i + 1} (${V(t)}).`, 1); }
        st.del = [t];
        const p = st.nodes[t].prev, n = st.nodes[t].next;
        st.nodes[p].next = n; st.hlEdges = [p + ':next'];
        push(`temp (${V(t)}) is the node to delete. temp→prev→next = temp→next, so ${V(p)} now points to ${V(n)}.`, 2);
        if (n) { st.nodes[n].prev = p; st.hlEdges = [n + ':prev']; push(`temp→next→prev = temp→prev, so ${V(n)} points back to ${V(p)}.`, 3); }
        delete st.nodes[t]; st.del = []; delete st.ptrs.temp; st.hlEdges = [];
        push(`free(temp): ${st0.nodes[t].val} is deleted.`, 4);
      } else {
        let t = st.head; st.ptrs.temp = t;
        push(`temp = head (position 1, ${V(t)}).`, 1);
        for (let i = 1; i < pos - 1; i++) { t = nx(t); st.ptrs.temp = t; push(`Move temp to position ${i + 1} (${V(t)}).`, 1); }
        const d = nx(t); st.ptrs.del = d; st.del = [d];
        push(`temp is at position ${pos - 1}. del = temp→next (${V(d)}), the node to delete.`, 2);
        st.nodes[t].next = st.nodes[d].next; st.hlEdges = [t + ':next'];
        push(`temp→next = del→next, so ${V(t)} now points to ${V(st.nodes[d].next)} and skips ${V(d)}.`, 3);
        delete st.nodes[d]; st.del = []; delete st.ptrs.temp; delete st.ptrs.del; st.hlEdges = [];
        push(`free(del): ${st0.nodes[d].val} is deleted.`, 4);
      }
    }

    else if (op === 'search') {
      const key = arg1;
      if (!st.head) { push('The list is empty, so the key is not found.', 0); return { steps, algo, final: st0 }; }
      let t = st.head, pos = 1; st.ptrs.temp = t;
      push(`temp = head, pos = 1.`, 0);
      for (;;) {
        st.hl = [t];
        if (String(st.nodes[t].val) === String(key)) {
          st.hl = []; st.fresh = [t]; st.found = pos;
          push(`${V(t)} == ${key}. Found at position ${pos}!`, 1);
          break;
        }
        push(`${V(t)} ≠ ${key}, keep going.`, 1);
        const n = nx(t);
        if (n === stopAt) {
          st.hl = []; delete st.ptrs.temp;
          push(mode === 'cll' ? `temp came back to head: ${key} is not in the list.` : `temp→next is NULL, temp becomes NULL: ${key} is not in the list.`, 3);
          break;
        }
        t = n; pos++; st.ptrs.temp = t;
        push(`temp = temp→next, pos = ${pos}.`, 2);
      }
    }

    else if (op === 'traverse') {
      if (!st.head) { push('The list is empty, nothing to print.', 0); return { steps, algo, final: st0 }; }
      let t = st.head; st.ptrs.temp = t;
      push('temp = head.', 0);
      for (;;) {
        st.hl = [t]; st.out.push(st.nodes[t].val);
        push(`Print ${V(t)}.`, 1);
        const n = nx(t);
        if (n === stopAt) { st.hl = []; delete st.ptrs.temp; push(mode === 'cll' ? 'temp→next is head again → stop.' : 'temp→next is NULL → stop.', 2); break; }
        t = n; st.ptrs.temp = t;
        push(`temp = temp→next (${V(t)}).`, 1);
      }
    }

    else if (op === 'reverse') {
      if (len < 2) { push('A list with fewer than 2 nodes is already reversed.', 0); return { steps, algo, final: st0 }; }
      const old = chain(st);
      st.order = old;
      if (mode === 'dll') {
        let t = st.head; st.ptrs.temp = t;
        push('temp = head.', 0);
        let last = t;
        while (t) {
          const n = st.nodes[t];
          const tmp = n.next; n.next = n.prev; n.prev = tmp;
          st.hlEdges = [t + ':next', t + ':prev'];
          last = t;
          push(`Swap prev and next of ${n.val}.`, 1);
          t = n.prev; // the old next
          if (t) { st.ptrs.temp = t; push(`Move temp to ${V(t)} (old next, now stored in prev).`, 1); }
        }
        st.head = last; delete st.ptrs.temp; st.hlEdges = []; st.order = null;
        push(`head = ${V(last)} (the old last node). Reversed!`, 2);
      } else if (mode === 'cll') {
        const lastId = old[old.length - 1];
        let prev = lastId, curr = st.head;
        st.ptrs.prev = prev; st.ptrs.curr = curr;
        push(`prev = last node (${V(prev)}), curr = head (${V(curr)}).`, 0);
        do {
          const next = nx(curr); st.ptrs.next = next;
          push(`next = curr→next (${V(next)}).`, 1);
          st.nodes[curr].next = prev; st.hlEdges = [curr + ':next'];
          push(`curr→next = prev: ${V(curr)} now points to ${V(prev)}.`, 1);
          prev = curr; curr = next; st.ptrs.prev = prev; st.ptrs.curr = curr; delete st.ptrs.next; st.hlEdges = [];
          push(`prev = curr, curr = next.`, 1);
        } while (curr !== st.head);
        st.head = prev; st.ptrs = {}; st.order = null;
        push(`curr is back at head, so head = prev (${V(prev)}). Reversed!`, 2);
      } else {
        let prev = null, curr = st.head;
        st.ptrs.curr = curr;
        push(`prev = NULL, curr = head (${V(curr)}).`, 0);
        while (curr) {
          const next = nx(curr);
          if (next) st.ptrs.next = next; else delete st.ptrs.next;
          push(`next = curr→next (${V(next)}). Save the rest of the list first!`, 1);
          st.nodes[curr].next = prev; st.hlEdges = [curr + ':next'];
          push(`curr→next = prev: ${V(curr)} now points ${prev ? 'back to ' + V(prev) : 'to NULL'}.`, 1);
          prev = curr; curr = next;
          st.ptrs.prev = prev; if (curr) st.ptrs.curr = curr; else delete st.ptrs.curr; delete st.ptrs.next; st.hlEdges = [];
          push(`Move prev to ${V(prev)} and curr to ${V(curr)}.`, 1);
        }
        st.head = prev; st.ptrs = {}; st.order = null;
        push(`curr is NULL, so head = prev (${V(prev)}). Reversed!`, 2);
      }
    }

    const final = clone(st);
    Object.assign(final, { ptrs: {}, hl: [], fresh: [], del: [], hlEdges: [], order: null, hint: null });
    // A last calm frame without pointer labels.
    if (steps.length) {
      const lastText = steps[steps.length - 1].text;
      steps.push({ text: 'Done. ' + summary(final), line: -1, state: Object.assign(clone(final), { out: st.out, found: st.found, fresh: op === 'search' ? st.fresh : [] }), lastText });
    }
    return { steps, algo, final };
  }

  function summary(st) {
    const v = values(st);
    if (!v.length) return 'The list is empty.';
    return 'List: ' + v.join(st.mode === 'dll' ? ' ⇄ ' : ' → ') + (st.mode === 'cll' ? ' → (back to ' + v[0] + ')' : ' → NULL');
  }

  const X = { make, run, chain, values, ALGO, summary };
  root.DSA = root.DSA || {};
  root.DSA.ll = X;
  if (typeof module === 'object' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
