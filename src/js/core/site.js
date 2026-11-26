(function (root) {
  const DSA = (root.DSA = root.DSA || {});

  DSA.site = {
    pages: [
      { id: 'home', title: 'Start here', sub: 'Exam plan & how to answer', icon: 'home', group: 'Plan' },
      { id: 'basics', title: 'Basics', sub: 'Q21 · Structures, DMA, Big-O', icon: 'basics', unit: 'q21', q: 'Q21', group: 'Learn' },
      { id: 'linked-lists', title: 'Linked Lists', sub: 'Q22 · Single, double, circular', icon: 'lists', unit: 'q22', q: 'Q22', group: 'Learn' },
      { id: 'stacks-queues', title: 'Stacks & Queues', sub: 'Q23 · Circular queue, infix→postfix', icon: 'stacks', unit: 'q23', q: 'Q23', group: 'Learn' },
      { id: 'trees', title: 'Trees', sub: 'Q24 · AVL, B-Tree, hashing, MST', icon: 'trees', unit: 'q24', q: 'Q24', group: 'Learn' },
      { id: 'graphs', title: 'Graphs', sub: 'Q25 · BFS, DFS, Prim, Kruskal', icon: 'graphs', unit: 'q25', q: 'Q25', group: 'Learn' },
      { id: 'answers', title: 'Answer Bank', sub: '8M + 15M model answers', icon: 'answers', group: 'Practise' },
      { id: 'scenarios', title: 'Scenario Lab', sub: 'Pick the right data structure', icon: 'scenarios', group: 'Practise' },
      { id: 'revise', title: 'Last-Minute Revision', sub: 'Cheat sheet, flashcards, mock test', icon: 'revise', group: 'Practise' },
    ],
    levels: [
      { xp: 0, name: 'Fresher' },
      { xp: 80, name: 'Pointer Padawan' },
      { xp: 220, name: 'Stack Star' },
      { xp: 420, name: 'Tree Whisperer' },
      { xp: 700, name: 'Graph Guru' },
      { xp: 1000, name: 'Exam Ready' },
    ],
    badges: [
      { id: 'q21', name: 'Memory Keeper', unit: 'q21', icon: 'basics' },
      { id: 'q22', name: 'Pointer Pro', unit: 'q22', icon: 'lists' },
      { id: 'q23', name: 'Stack Master', unit: 'q23', icon: 'stacks' },
      { id: 'q24', name: 'Tree Whisperer', unit: 'q24', icon: 'trees' },
      { id: 'q25', name: 'Graph Navigator', unit: 'q25', icon: 'graphs' },
      { id: 'scn', name: 'Scenario Solver', icon: 'scenarios' },
      { id: 'mock', name: 'Mock Test Hero', icon: 'trophy' },
    ],
  };

  DSA.site.pageById = (id) => DSA.site.pages.find((p) => p.id === id);
  DSA.site.levelFor = (xp) => {
    const L = DSA.site.levels;
    let i = 0;
    while (i + 1 < L.length && xp >= L[i + 1].xp) i++;
    const cur = L[i];
    const next = L[i + 1] || null;
    const pct = next ? (xp - cur.xp) / (next.xp - cur.xp) : 1;
    return { index: i, name: cur.name, next, pct: Math.max(0, Math.min(1, pct)) };
  };
})(typeof window !== 'undefined' ? window : globalThis);
