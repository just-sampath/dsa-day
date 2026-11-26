// Scenario Lab: data + renderer. <div data-scenarios> mounts every scenario with a unit filter.
// Scenario: { id, u, t: title, s: story, q: question, o: options, a: correct index, why,
//             ops: operations needed, pick: chosen DS, just: justification, cx: complexity, not: rejected option }
(function (root) {
  const DSA = (root.DSA = root.DSA || {});

  const S = [
    /* ---------- Q21 ---------- */
    { id: 'student-record', u: 'q21', t: 'One record, many types', s: 'A college app must keep, for each student, a roll number (whole number), a name (text) and a CGPA (decimal) together as one unit.', q: 'What should you use to store one student?', o: ['An int array', 'A stack', 'A structure', 'A queue'], a: 2,
      why: 'Only a structure groups members of <b>different types</b> under one name.',
      ops: 'Store and read related fields of different types together.', pick: '<code>struct student { int roll; char name[30]; float cgpa; };</code>', just: 'A structure is a user-defined type that groups different data types as one record; an array of structures can hold the whole class.', cx: 'Accessing a member (s.cgpa) is O(1).', not: 'An array: all its elements must have the same type.' },
    { id: 'unknown-count', u: 'q21', t: 'How many students?', s: 'The registration program only learns at run time how many students joined: it could be 12 or 12,000.', q: 'How should memory for the records be obtained?', o: ['A static array int a[100]', 'Dynamic memory allocation (malloc/calloc, then realloc to grow)', 'Register variables', 'Recursion'], a: 1,
      why: 'Only DMA decides the size <b>at run time</b>, so nothing is wasted and nothing overflows.',
      ops: 'Allocate exactly n records when n is known; grow later if needed.', pick: '<code>s = malloc(n * sizeof(struct student));</code> and <code>realloc</code> to grow, <code>free</code> at the end.', just: 'Memory comes from the heap at run time, exactly as much as needed.', cx: 'O(n) memory for n students.', not: 'A static array: too small overflows, too big wastes memory.' },
    { id: 'fixed-class', u: 'q21', t: 'Exactly 60 students', s: 'A class always has exactly 60 students. A teacher wants marks instantly by roll number 1–60, and the class size never changes.', q: 'Which data structure fits best?', o: ['An array', 'A linked list', 'A stack', 'A graph'], a: 0,
      why: 'Fixed size + instant access by position = array. marks[roll − 1] is O(1).',
      ops: 'Direct access by position; no inserts or deletes.', pick: 'Array: <code>float marks[60];</code>', just: 'Contiguous memory gives random access in O(1); the size is known and fixed.', cx: 'Access O(1), memory exactly 60 elements.', not: 'A linked list: reaching roll 45 would need 44 steps (O(n)).' },
    { id: 'binary-search', u: 'q21', t: 'Searching a million', s: 'A sorted list holds 1,000,000 roll numbers. The search must use as few comparisons as possible.', q: 'Which method?', o: ['Linear search, O(n)', 'Bubble sort first, then linear search', 'Both need the same number of comparisons', 'Binary search, O(log n)'], a: 3,
      why: 'log₂(1,000,000) ≈ 20 comparisons, versus up to 1,000,000 for linear search.',
      ops: 'Search in sorted data.', pick: 'Binary search: compare with the middle, discard half each time.', just: 'Each step halves the range: about 20 steps for a million items.', cx: 'O(log n) time, O(1) extra space.', not: 'Linear search: O(n), up to a million comparisons.' },

    /* ---------- Q22 ---------- */
    { id: 'browser', u: 'q22', t: 'Back and Forward', s: 'A browser has Back and Forward buttons. Each moves exactly one page, in either direction, through your history.', q: 'Which structure models this best?', o: ['A singly linked list', 'A hash table', 'A queue', 'A doubly linked list'], a: 3,
      why: '<b>prev</b> = Back, <b>next</b> = Forward. A singly linked list can only go forward.',
      ops: 'Move to the previous page, move to the next page, add a new page after the current one.', pick: 'Doubly linked list (two stacks are also accepted).', just: 'Each node has prev and next pointers, so both buttons are a single pointer move.', cx: 'Back/Forward O(1); visiting a new page O(1).', not: 'A singly linked list: going back would mean restarting from head.' },
    { id: 'playlist', u: 'q22', t: 'Repeat all', s: 'A music app has “repeat all”: after the last song the first one plays again, and songs can be added at any time.', q: 'Which structure?', o: ['A circular linked list', 'An array', 'A stack', 'A hash table'], a: 0,
      why: 'The last node points back to the first, so “next” after the last song is the first song.',
      ops: 'Next song, wrap from last to first, insert a song.', pick: 'Circular linked list (doubly circular if “previous” is also needed).', just: 'last→next = head, so playback loops naturally; inserting is just pointer changes.', cx: 'Next O(1); insert after the current song O(1).', not: 'An array: fixed size, and inserting means shifting songs.' },
    { id: 'train', u: 'q22', t: 'Railway coaches', s: 'In a railway yard, coaches are attached to or removed from the <b>middle</b> of a train all day, so the train’s length keeps changing.', q: 'Which structure models the train?', o: ['An array', 'A stack', 'A linked list', 'A hash table'], a: 2,
      why: 'Inserting or deleting in the middle only changes two pointers; no shifting.',
      ops: 'Insert at a position, delete at a position, traverse.', pick: 'Linked list (each coach is a node).', just: 'Dynamic size; insert/delete are pointer changes once you reach the position.', cx: 'Reach position O(n), relink O(1).', not: 'An array: every insert or delete shifts all later coaches.' },
    { id: 'polynomial', u: 'q22', t: 'Adding polynomials', s: 'Store polynomials like 5x⁴ + 3x² + 7 and add two of them. Most powers are missing (zero).', q: 'How should a polynomial be stored?', o: ['A stack of coefficients', 'A queue', 'An adjacency matrix', 'A linked list of (coefficient, power) nodes'], a: 3,
      why: 'Store only the non-zero terms, in decreasing order of power.',
      ops: 'Store terms, walk both polynomials, add like powers.', pick: 'Linked list: each node = [coeff | power | next].', just: 'Only non-zero terms take memory; addition walks the two lists together like a merge.', cx: 'Addition O(m + n) for m and n terms.', not: 'An array indexed by power: x¹⁰⁰⁰ would need 1001 slots for 2 terms.' },

    /* ---------- Q23 ---------- */
    { id: 'undo', u: 'q23', t: 'Ctrl + Z', s: 'A text editor’s Undo reverses the <b>most recent</b> change first, then the one before it, and so on.', q: 'Which data structure stores the changes?', o: ['A queue', 'A stack', 'A hash table', 'A fixed array'], a: 1,
      why: 'Most recent first = Last In, First Out = stack.',
      ops: 'Save each change; take back the latest change.', pick: 'Stack: push every change, pop to undo.', just: 'LIFO matches “undo the last thing first”.', cx: 'push and pop O(1).', not: 'A queue: it would undo the oldest change first.' },
    { id: 'printer', u: 'q23', t: 'Office printer', s: 'Twenty employees send jobs to one printer. Jobs must print in the order they were received.', q: 'Which structure holds the waiting jobs?', o: ['A stack', 'A BST', 'A queue', 'A graph'], a: 2,
      why: 'First come, first served = FIFO = queue.',
      ops: 'Add a job at the end; take the oldest job.', pick: 'Queue: enqueue at rear, dequeue from front.', just: 'FIFO is fair: the first job sent is the first printed.', cx: 'enqueue and dequeue O(1).', not: 'A stack: the newest job would always jump ahead.' },
    { id: 'round-robin', u: 'q23', t: 'Round-robin CPU', s: 'The CPU gives each of 5 processes a 10 ms turn, then goes back to the first one, again and again.', q: 'Which structure?', o: ['A stack', 'A circular queue', 'A BST', 'An adjacency matrix'], a: 1,
      why: 'Take the front process, run it, put it back at the rear, wrapping around a fixed array.',
      ops: 'Take the next process; put it back at the end after its turn.', pick: 'Circular queue (a circular linked list is also accepted).', just: 'rear = (rear + 1) % SIZE reuses slots, so the cycle can go on forever.', cx: 'All operations O(1).', not: 'A linear queue: freed front slots are wasted and it soon reports “full”.' },
    { id: 'brackets', u: 'q23', t: 'Bracket checker', s: 'A code editor underlines a bracket in red when brackets don’t match, for example <code>{[(])}</code>.', q: 'Which structure checks this?', o: ['A queue', 'A hash table', 'A stack', 'A tree'], a: 2,
      why: 'The last bracket opened must be the first one closed: LIFO.',
      ops: 'Remember open brackets; check each closing bracket against the latest open one.', pick: 'Stack: push openers, pop on a closer and compare.', just: 'Matching pairs nest, so the most recent opener must match first.', cx: 'O(n) time, O(n) space.', not: 'A queue: it would compare with the oldest opener, which is wrong.' },
    { id: 'calculator', u: 'q23', t: 'Calculator app', s: 'A calculator receives <code>5 + 3 * (8 − 2)</code> exactly as typed and must respect precedence and brackets.', q: 'What does it do?', o: ['Evaluate left to right with a queue', 'Convert infix to postfix with a stack, then evaluate the postfix with a stack', 'Sort the numbers first', 'Use a hash table'], a: 1,
      why: 'Postfix (5 3 8 2 − * +) needs no brackets or precedence, so one left-to-right pass with a stack gives 23.',
      ops: 'Handle precedence and brackets, then compute.', pick: 'Stack, twice: operator stack for conversion, operand stack for evaluation.', just: 'The conversion stack holds operators until their turn; the evaluation stack holds intermediate values.', cx: 'Both passes O(n).', not: 'Plain left to right: (5 + 3) × 6 = 48 is wrong; the answer is 23.' },
    { id: 'ticket-wait', u: 'q23', t: 'Waiting list', s: 'For train tickets, when a confirmed ticket is cancelled the passenger who has been waiting <b>longest</b> gets it.', q: 'Which structure holds the waiting list?', o: ['A queue', 'A stack', 'A BST', 'A circular linked list only'], a: 0,
      why: 'Earliest waiting is served first: FIFO.',
      ops: 'Add to the end of the list; serve the earliest.', pick: 'Queue.', just: 'Fair first-come-first-served ordering.', cx: 'O(1) per operation.', not: 'A stack would give the ticket to the latest request.' },
    { id: 'ring-buffer', u: 'q23', t: 'Last 5 readings', s: 'A temperature sensor keeps only the last 5 readings. When a 6th arrives, it overwrites the oldest.', q: 'Which structure?', o: ['A stack', 'A BST', 'A graph', 'A circular queue (ring buffer)'], a: 3,
      why: 'A fixed array whose index wraps with % SIZE: the oldest slot is reused.',
      ops: 'Add the newest reading; drop the oldest when full.', pick: 'Circular queue of size 5.', just: 'Indexes wrap round, so memory stays fixed at 5 slots forever.', cx: 'O(1) per reading, O(5) memory.', not: 'A linear queue would run out of slots after 5 readings.' },
    { id: 'call-stack', u: 'q23', t: 'Function calls', s: 'Function A calls B, and B calls C. When C finishes the computer must return to B, and after B finishes, to A.', q: 'What keeps track of the return points?', o: ['A queue', 'A hash table', 'A tree', 'A stack (the call stack)'], a: 3,
      why: 'The last function called is the first to return: LIFO.',
      ops: 'Save the return point on each call; restore the latest one on return.', pick: 'Stack (call stack): push on call, pop on return.', just: 'Calls nest inside each other, which is exactly LIFO. Recursion uses the same stack.', cx: 'O(1) per call and return; depth d uses O(d) memory.', not: 'A queue would return to A before B.' },
    { id: 'reverse', u: 'q23', t: 'Reverse a word', s: 'Reverse the letters of a word: EXAM becomes MAXE.', q: 'Which structure makes this easy?', o: ['A stack', 'A queue', 'A hash table', 'A tree'], a: 0,
      why: 'Push E, X, A, M; popping gives M, A, X, E.',
      ops: 'Read the letters in order; output them in reverse.', pick: 'Stack.', just: 'LIFO naturally reverses the order.', cx: 'O(n) time and space.', not: 'A queue keeps the same order.' },
    { id: 'hospital', u: 'q23', t: 'Emergency room', s: 'In a hospital emergency room, critical patients must be treated before others, whatever time they arrived.', q: 'Which structure?', o: ['A stack', 'A simple queue', 'A priority queue', 'A circular linked list'], a: 2,
      why: 'Each patient has a priority; the highest priority is removed first (FIFO among equal priorities).',
      ops: 'Insert a patient with a priority; remove the most urgent.', pick: 'Priority queue.', just: 'Removal order depends on priority, not arrival time.', cx: 'O(log n) with a heap; O(n) with a sorted list.', not: 'A simple queue would make a critical patient wait behind minor cases.' },

    /* ---------- Q24 ---------- */
    { id: 'contacts', u: 'q24', t: 'Contacts lookup', s: 'A phone with 5,000 contacts must show a number instantly when you type the exact name.', q: 'Which structure?', o: ['A linked list', 'A hash table', 'A queue', 'A stack'], a: 1,
      why: 'h(name) gives the slot directly: O(1) on average.',
      ops: 'Exact-match search, insert, delete.', pick: 'Hash table (collisions handled by chaining).', just: 'A hash function maps each name to a slot, so there is no need to scan.', cx: 'O(1) average search, insert and delete.', not: 'A linked list: up to 5,000 comparisons (O(n)).' },
    { id: 'isbn', u: 'q24', t: 'Two books, one slot', s: 'A library hashes accession numbers with h(k) = k mod 1000. Books 10233 and 20233 both land in slot 233.', q: 'What should the system do?', o: ['Reject the second book', 'Use collision resolution: separate chaining or open addressing', 'Use a stack instead', 'Make the keys longer'], a: 1,
      why: 'This is a collision. Chaining links both books at slot 233; linear probing would put 20233 in slot 234.',
      ops: 'Store two keys that hash to the same slot; still find each one.', pick: 'Hash table with separate chaining (or linear/quadratic probing, or double hashing).', just: 'Chaining keeps a linked list per slot; open addressing probes for the next free slot.', cx: 'O(1) average; O(n) worst case if everything collides.', not: 'Rejecting the book loses data. Collisions are normal in hashing.' },
    { id: 'db-index', u: 'q24', t: 'Bank on a disk', s: 'A bank stores 10 million account records on disk, where every disk read is slow. It needs fast lookup by account number, range listing (all accounts from 5000 to 6000), and daily inserts.', q: 'Which index structure?', o: ['An AVL tree', 'A B-tree', 'A stack', 'A circular queue'], a: 1,
      why: 'Each B-tree node holds many keys (one disk block), so the tree is only 3–4 levels deep: 3–4 disk reads.',
      ops: 'Search, range queries and inserts on disk.', pick: 'B-tree (in practice a B+ tree).', just: 'Multi-way nodes keep the height tiny; all leaves are on the same level; keys stay sorted for ranges.', cx: 'O(log n) operations with very few disk accesses.', not: 'An AVL tree is binary: its height is about 24 for 10 million keys, so about 24 slow disk reads.' },
    { id: 'dictionary', u: 'q24', t: 'Dictionary app', s: 'A dictionary app adds new words all the time. Search must stay fast, <b>and</b> the app must print all the words in alphabetical order.', q: 'Which structure?', o: ['A hash table', 'An unsorted array', 'A queue', 'An AVL tree'], a: 3,
      why: 'A balanced BST gives O(log n) search, and its inorder traversal prints the words sorted.',
      ops: 'Insert, search, list in sorted order.', pick: 'AVL tree (self-balancing BST).', just: 'Rotations keep the height O(log n); inorder traversal gives alphabetical order for free.', cx: 'Insert and search O(log n); sorted listing O(n).', not: 'A hash table: fast search, but it keeps no ordering.' },
    { id: 'skewed', u: 'q24', t: 'Sorted inserts', s: 'Roll numbers 1, 2, 3, …, 1000 are inserted one after another into a BST, and searching becomes very slow.', q: 'What fixes this?', o: ['A stack', 'More RAM', 'A queue', 'An AVL tree (self-balancing)'], a: 3,
      why: 'Sorted input makes a plain BST a straight line of height n. AVL rotations keep it balanced.',
      ops: 'Insert sorted keys; keep searches fast.', pick: 'AVL tree.', just: 'After each insert, any node with BF ±2 is fixed by an LL/RR/LR/RL rotation, so the height stays about log₂ n ≈ 10.', cx: 'O(log n) instead of O(n).', not: 'A plain BST degenerates into a linked list: 1000 comparisons in the worst case.' },
    { id: 'folders', u: 'q24', t: 'Folders', s: 'Folders contain subfolders and files, and the app shows paths like Home › Documents › Exams.', q: 'Which structure?', o: ['A tree', 'A queue', 'A stack', 'A hash table'], a: 0,
      why: 'One root, each folder has one parent and many children: a hierarchy.',
      ops: 'Parent–child navigation, listing contents, path from the root.', pick: 'Tree (general tree; each node keeps a list of its children).', just: 'Hierarchical data with exactly one path from the root to each item.', cx: 'Finding an item at depth d takes O(d) steps.', not: 'Linear structures cannot show parent–child relationships.' },
    { id: 'campus-span', u: 'q24', t: 'Patrol route', s: 'A school has 5 buildings joined by many corridors that form loops. The guard wants a set of corridors that reaches every building, with no loops and as few corridors as possible.', q: 'What is the guard looking for?', o: ['A spanning tree', 'A hash table', 'A stack', 'A queue'], a: 0,
      why: 'All vertices, connected, no cycles: a spanning tree with 5 − 1 = 4 edges.',
      ops: 'Connect all vertices with no cycles and the fewest edges.', pick: 'Spanning tree of the corridor graph (found with BFS or DFS).', just: 'A spanning tree always has n − 1 edges, the minimum that keeps everything connected.', cx: 'Found in O(V + E) with BFS or DFS.', not: 'Keeping every corridor leaves loops (cycles).' },

    /* ---------- Q25 ---------- */
    { id: 'cable', u: 'q25', t: 'Fibre for villages', s: 'Connect 6 villages with fibre-optic cable. The cost of every possible link is known; every village must be reachable and the total cost must be minimum.', q: 'Which technique?', o: ['BFS', 'DFS', 'Hashing', 'Minimum spanning tree (Prim’s or Kruskal’s)'], a: 3,
      why: 'Villages = vertices, cable costs = edge weights. The MST connects all with the least total weight using 5 cables.',
      ops: 'Connect all vertices with minimum total weight and no cycle.', pick: 'Weighted graph + minimum spanning tree (Kruskal’s or Prim’s).', just: 'The MST has n − 1 edges and the minimum possible cost; a cycle would be a wasted cable.', cx: 'Kruskal’s O(E log E); Prim’s O(V²).', not: 'BFS/DFS find a spanning tree but ignore the costs.' },
    { id: 'friends', u: 'q25', t: 'People you may know', s: 'A social app suggests “people you may know”: friends of your friends, exactly two steps away from you.', q: 'Which approach?', o: ['A graph with BFS', 'A stack', 'A BST', 'A circular queue'], a: 0,
      why: 'BFS explores level by level: level 1 = your friends, level 2 = their friends.',
      ops: 'Find everyone at distance 2.', pick: 'Graph (users = vertices, friendships = edges, adjacency list) + BFS.', just: 'BFS visits vertices in order of distance, so it stops neatly after level 2.', cx: 'O(V + E).', not: 'DFS dives deep along one chain first, mixing up the distances.' },
    { id: 'maze', u: 'q25', t: 'Maze robot', s: 'A robot explores a maze: it follows one corridor as far as possible and, when stuck, goes back to the last junction to try another way.', q: 'Which traversal is this?', o: ['BFS with a queue', 'Kruskal’s', 'A hash table', 'DFS with a stack (backtracking)'], a: 3,
      why: 'Going deep and then backtracking is exactly depth-first search.',
      ops: 'Go deep, remember junctions, backtrack.', pick: 'DFS (stack or recursion).', just: 'The stack remembers the junctions; popping returns to the most recent one.', cx: 'O(V + E).', not: 'BFS explores all paths a little at a time, which a single robot cannot do physically.' },
    { id: 'metro', u: 'q25', t: 'Fewest stops', s: 'A metro app must find the route from station A to station Z with the <b>fewest stops</b>. Every hop counts the same.', q: 'Which algorithm?', o: ['DFS', 'BFS', 'Prim’s', 'Hashing'], a: 1,
      why: 'In an unweighted graph BFS reaches each station by the fewest edges.',
      ops: 'Shortest path by number of edges.', pick: 'Graph + BFS from A (keep each station’s parent to rebuild the route).', just: 'BFS visits all stations 1 stop away, then 2 stops, …, so the first time it reaches Z is the minimum.', cx: 'O(V + E).', not: 'DFS may find a long winding route first.' },
    { id: 'dense-roads', u: 'q25', t: 'Direct road?', s: '20 cities, and almost every pair has a direct road. The app must answer instantly: “Is there a direct road between X and Y?”', q: 'Which representation?', o: ['An adjacency list', 'A stack', 'An adjacency matrix', 'A linked list of cities'], a: 2,
      why: 'M[X][Y] answers in O(1), and a dense 20 × 20 grid wastes almost nothing.',
      ops: 'Edge existence checks in a dense graph.', pick: 'Adjacency matrix (20 × 20).', just: 'Constant-time lookup; with most pairs connected, the matrix is mostly ones anyway.', cx: 'Check O(1); space O(V²) = 400 cells.', not: 'An adjacency list must scan X’s neighbours: O(degree).' },
    { id: 'sparse-social', u: 'q25', t: 'A million users', s: 'A network has 1,000,000 users, each with about 150 friends. The friendships must be stored in memory.', q: 'Which representation?', o: ['An adjacency matrix', 'A 1,000,000 × 1,000,000 array', 'An adjacency list', 'A queue'], a: 2,
      why: 'About 150 million list entries versus 10¹² matrix cells, nearly all zero.',
      ops: 'Store a very sparse graph; list a user’s friends.', pick: 'Adjacency list.', just: 'Space O(V + E) stores only the friendships that exist.', cx: 'Space O(V + E); listing friends O(degree).', not: 'An adjacency matrix needs O(V²) = a trillion cells.' },
    { id: 'reach-all', u: 'q25', t: 'Can the update reach everyone?', s: 'A server sends a software update across the office network. Check whether it can reach every computer. No costs are involved.', q: 'How do you check?', o: ['A BFS or DFS traversal from the server', 'Prim’s algorithm', 'A hash table', 'Postfix evaluation'], a: 0,
      why: 'If the traversal visits all V computers, the network is connected.',
      ops: 'Reachability from one vertex.', pick: 'Graph + BFS (or DFS) from the server.', just: 'A traversal visits exactly the vertices reachable from the start.', cx: 'O(V + E).', not: 'Prim’s solves minimum cost, which is not the question here.' }
  ];

  const UNITS = [['all', 'All'], ['q21', 'Q21'], ['q22', 'Q22'], ['q23', 'Q23'], ['q24', 'Q24'], ['q25', 'Q25']];
  const LET = 'ABCD';
  const BADGE_AT = 15;

  function mount(host) {
    const { h } = DSA.util;
    host.setAttribute('data-ready', '1');
    host.textContent = '';
    let unit = 'all';
    const progress = h('span.pill.accent.tnum');
    const seg = h('div.seg', { role: 'group', 'aria-label': 'Filter scenarios by unit' });
    const segBtns = UNITS.map(([u, label]) => {
      const b = h('button', { type: 'button', 'aria-pressed': String(u === unit), onclick: () => { unit = u; segBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); filter(); } }, label);
      seg.append(b);
      return b;
    });
    const list = h('div.stack');
    host.append(h('div.filter-bar', null, seg, progress), list);

    const solvedCount = () => Object.values(DSA.store.get().scn || {}).filter((v) => v === 1).length;
    const updateProgress = () => { progress.textContent = `${solvedCount()} / ${S.length} solved`; };

    const cards = S.map((sc, n) => {
      const prev = (DSA.store.get().scn || {})[sc.id];
      const status = h('span.pill' + (prev === 1 ? '.ok' : prev === 0 ? '.bad' : ''), null, prev === 1 ? 'Solved' : prev === 0 ? 'Try again' : sc.u.toUpperCase());
      const card = h('article.scn', { 'data-u': sc.u, id: 'scn-' + sc.id });
      const why = h('div.qwhy', { hidden: true });
      const model = h('details.more', { hidden: true },
        h('summary', null, 'Write it like this (4-step method)'),
        h('div.more-body', null,
          h('dl.kv', null,
            h('dt', null, '1. Operations'), h('dd', { html: sc.ops }),
            h('dt', null, '2. Data structure'), h('dd', { html: sc.pick }),
            h('dt', null, '3. Why + complexity'), h('dd', { html: sc.just + ' ' + sc.cx }),
            h('dt', null, '4. Why not the other'), h('dd', { html: sc.not }))));
      const opts = h('div.opts');
      const buttons = sc.o.map((text, i) => {
        const b = h('button.opt', { type: 'button' }, h('span.letter', null, LET[i]), h('span', { html: text }));
        b.addEventListener('click', () => {
          if (card.dataset.done) return;
          card.dataset.done = '1';
          const ok = i === sc.a;
          buttons.forEach((bb, k) => { bb.disabled = true; if (k === sc.a) bb.classList.add('is-right'); });
          if (!ok) b.classList.add('is-wrong');
          why.hidden = false;
          why.className = 'qwhy ' + (ok ? 'ok' : 'bad');
          why.innerHTML = `<b>${ok ? 'Correct!' : 'Not quite.'}</b> ${sc.why}`;
          model.hidden = false;
          model.open = !ok;
          const before = (DSA.store.get().scn || {})[sc.id];
          if (ok || before !== 1) DSA.store.setScn(sc.id, ok);
          if (ok) {
            DSA.store.awardOnce('scn:' + sc.id, 15, 'Scenario solved');
            status.className = 'pill ok';
            status.textContent = 'Solved';
            if (solvedCount() >= BADGE_AT) DSA.store.earn('scn');
          } else if (before !== 1) {
            status.className = 'pill bad';
            status.textContent = 'Try again';
          }
          updateProgress();
        });
        opts.append(b);
        return b;
      });
      card.append(
        h('div.scn-top', null, h('span.scn-n', null, `Scenario ${n + 1} · ${sc.t}`), status),
        h('p', { html: sc.s }),
        h('p.scn-text', { html: sc.q }),
        opts, why, model);
      list.append(card);
      return card;
    });

    function filter() { cards.forEach((c) => { c.hidden = unit !== 'all' && c.dataset.u !== unit; }); }
    updateProgress();
  }

  DSA.scenarios = S;
  DSA.scn = {
    mountAll(scope) { (scope || document).querySelectorAll('[data-scenarios]:not([data-ready])').forEach(mount); }
  };
})(window);
