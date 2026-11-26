// Quick-check question sets. Format: id: { unit, qs: [{ q, o: [options], a: index of correct option, why }] }
// q and o are HTML: write &lt; for "<".
(function (root) {
  const DSA = (root.DSA = root.DSA || {});
  DSA.quizzes = {
    /* ============================== Q21 ============================== */
    ds: { unit: 'q21', qs: [
      { q: 'Which of these is a <b>non-linear</b> data structure?', o: ['Stack', 'Queue', 'Tree', 'Array'], a: 2, why: 'Trees and graphs arrange data as a hierarchy or network. Stack, queue and array keep data in a single line (sequence).' },
      { q: 'An <b>Abstract Data Type</b> (ADT) describes…', o: ['only how data is laid out in memory', 'the data and its operations, without saying how they are implemented', 'a data type built into C', 'a program that sorts data'], a: 1, why: 'Stack ADT = {push, pop, peek, isEmpty}. It can be implemented with an array or a linked list; the ADT does not care which.' },
      { q: 'Which is a <b>primitive</b> data structure?', o: ['int', 'Linked list', 'Graph', 'Structure'], a: 0, why: 'Primitive types (int, float, char, double, pointer) are built into the language and hold a single value.' },
      { q: 'A data structure whose size can change while the program runs is…', o: ['static', 'linear', 'dynamic', 'homogeneous'], a: 2, why: 'A linked list built with malloc grows and shrinks at run time. A normal array is static: its size is fixed when you declare it.' }
    ] },
    struct: { unit: 'q21', qs: [
      { q: 'Which operator reaches a member through a <b>pointer</b> to a structure?', o: ['. (dot)', '-&gt; (arrow)', '&amp; (ampersand)', '* (star) on its own'], a: 1, why: '<code>p-&gt;marks</code> is shorthand for <code>(*p).marks</code>. Use the dot with a structure variable, the arrow with a pointer.' },
      { q: 'Memory for a structure is allocated when…', o: ['the struct template is declared', 'a variable of that structure type is declared', 'a member is printed', 'the program ends'], a: 1, why: 'The <code>struct student { … };</code> declaration is only a blueprint. <code>struct student s1;</code> creates the actual memory.' },
      { q: '<code>struct student { int roll; char name[20]; float marks; };</code> Ignoring padding, its size is…', o: ['4 bytes', '20 bytes', '26 bytes', '28 bytes'], a: 3, why: 'int (4) + char[20] (20) + float (4) = 28 bytes. A structure’s size is the sum of its members (plus any padding).' },
      { q: 'How is a <b>union</b> different from a structure?', o: ['A union can only hold integers', 'Structure members share one memory location', 'Union members share the same memory, so its size equals its largest member', 'A union cannot be declared in C'], a: 2, why: 'In a structure every member gets its own memory; in a union all members overlap, so only one is valid at a time.' },
      { q: 'A structure containing a pointer to its own type, like a linked-list node, is a…', o: ['nested structure', 'self-referential structure', 'array of structures', 'union'], a: 1, why: '<code>struct node { int data; struct node *next; };</code> refers to itself. This is the building block of linked lists and trees.' }
    ] },
    dma: { unit: 'q21', qs: [
      { q: 'Dynamically allocated memory comes from the…', o: ['stack', 'heap', 'CPU registers', 'code segment'], a: 1, why: 'malloc/calloc/realloc take memory from the heap. Normal local variables live on the stack and vanish when the function returns.' },
      { q: 'Which function allocates memory <b>and</b> sets every byte to zero?', o: ['malloc()', 'calloc()', 'realloc()', 'free()'], a: 1, why: 'calloc(n, size) allocates n blocks and zero-fills them. malloc leaves garbage values.' },
      { q: 'What do malloc() and calloc() return when memory is not available?', o: ['0 bytes', '−1', 'NULL', 'a random address'], a: 2, why: 'Always check: <code>if (ptr == NULL) { printf("No memory"); exit(1); }</code>' },
      { q: 'Memory that was allocated but never freed, and can no longer be reached, is a…', o: ['dangling pointer', 'memory leak', 'stack overflow', 'null pointer'], a: 1, why: 'A dangling pointer is the opposite problem: the pointer still exists but the memory it points to was already freed.' },
      { q: 'Which call correctly reserves space for 10 integers?', o: ['malloc(10)', 'malloc(10 * sizeof(int))', 'calloc(sizeof(int))', 'free(10)'], a: 1, why: 'malloc takes a number of <b>bytes</b>: 10 × sizeof(int) = 40 bytes on most systems. calloc needs two arguments: calloc(10, sizeof(int)).' }
    ] },
    complexity: { unit: 'q21', qs: [
      { q: 'A loop inside a loop, each running n times, has time complexity…', o: ['O(n)', 'O(log n)', 'O(n²)', 'O(2n)'], a: 2, why: 'For each of the n outer iterations the inner loop runs n times: n × n = n² steps.' },
      { q: 'Big-O notation gives the…', o: ['lower bound (best case)', 'upper bound (worst case)', 'exact time in seconds', 'memory in bytes'], a: 1, why: 'O = upper bound (worst case), Ω (Omega) = lower bound (best case), Θ (Theta) = tight bound.' },
      { q: '<code>for (i = 1; i &lt; n; i = i * 2)</code> runs about how many times?', o: ['n', 'n / 2', 'log₂ n', 'n²'], a: 2, why: 'i takes the values 1, 2, 4, 8, … and passes n after about log₂ n doublings. Halving or doubling loops are O(log n).' },
      { q: 'Which grows the <b>slowest</b> as n gets large?', o: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], a: 2, why: 'Order: O(1) &lt; O(log n) &lt; O(n) &lt; O(n log n) &lt; O(n²) &lt; O(2ⁿ).' },
      { q: 'Linear search where the key is at the very first position is the…', o: ['best case, Ω(1)', 'worst case, O(n)', 'average case, Θ(n)', 'impossible to analyse'], a: 0, why: 'One comparison is enough: best case. Worst case is when the key is last or missing: n comparisons.' },
      { q: 'Binary search on a sorted array of n elements takes…', o: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], a: 1, why: 'Each comparison halves the remaining range, so about log₂ n comparisons. For a million items that is only about 20.' }
    ] },

    /* ============================== Q22 ============================== */
    'll-intro': { unit: 'q22', qs: [
      { q: 'Each node of a singly linked list contains…', o: ['only data', 'data and the address of the next node', 'data and an index number', 'two data fields'], a: 1, why: 'Picture a box split in two: <code>[ data | next ]</code>. next holds the address of the following node.' },
      { q: 'The <b>head</b> pointer stores…', o: ['the address of the last node', 'the number of nodes', 'the address of the first node', 'always NULL'], a: 2, why: 'head is your only entry point into the list. Lose it and you lose the whole list.' },
      { q: 'Compared with arrays, linked lists are slow at…', o: ['growing in size', 'inserting at the start', 'jumping straight to the k-th element', 'using memory only when needed'], a: 2, why: 'To reach node k you must walk k links: O(n). An array gives a[k] directly in O(1).' },
      { q: 'In a singly linked list, the next field of the last node is…', o: ['the head address', 'NULL', 'the first node’s data', 'its own address'], a: 1, why: 'NULL marks the end of the list. (In a circular list it points back to head instead.)' }
    ] },
    sll: { unit: 'q22', qs: [
      { q: 'To insert a new node at the <b>beginning</b>, the correct order is…', o: ['head = newNode, then newNode→next = head', 'newNode→next = head, then head = newNode', 'free(head), then head = newNode', 'temp→next = newNode'], a: 1, why: 'Connect the new node to the old first node <b>before</b> moving head; otherwise you lose the old list’s address.' },
      { q: 'Inserting at the end of a singly linked list (with only a head pointer) takes…', o: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], a: 2, why: 'You have to walk from head to the last node first, visiting all n nodes.' },
      { q: 'Trying to delete from an empty list is called…', o: ['overflow', 'underflow', 'a collision', 'a cycle'], a: 1, why: 'Always check <code>if (head == NULL)</code> first and print “Underflow” or “List is empty”.' },
      { q: 'To delete the node at position 3, the pointer temp must stop at…', o: ['node 1', 'node 2 (the one before)', 'node 3', 'the last node'], a: 1, why: 'You need the node before the target so you can do <code>temp→next = del→next</code> and skip over it.' },
      { q: 'List: 10 → 20 → 30. After inserting 15 at <b>position 2</b> the list is…', o: ['15 → 10 → 20 → 30', '10 → 20 → 15 → 30', '10 → 15 → 20 → 30', '10 → 20 → 30 → 15'], a: 2, why: 'Position 2 means it becomes the second node: 10 → 15 → 20 → 30.' }
    ] },
    dll: { unit: 'q22', qs: [
      { q: 'How many <b>pointer</b> fields does a doubly linked list node have?', o: ['1', '2', '3', '0'], a: 1, why: 'prev and next. With the data field that makes three fields in total: <code>[ prev | data | next ]</code>.' },
      { q: 'The prev pointer of the first node in a DLL is…', o: ['head', 'NULL', 'the last node', 'itself'], a: 1, why: 'Nothing comes before the first node, so prev is NULL. Likewise the last node’s next is NULL.' },
      { q: 'A main advantage of a DLL over a singly linked list is…', o: ['it uses less memory', 'it can be traversed in both directions', 'it never needs malloc', 'it has no NULL pointers'], a: 1, why: 'Forward and backward traversal, and you can delete a node when you only have a pointer to it.' },
      { q: 'To unlink node X from the middle of a DLL you set…', o: ['X→prev→next = X→next and X→next→prev = X→prev', 'X→next = NULL only', 'head = X', 'X→prev = X→next'], a: 0, why: 'Both neighbours must skip X: the left one’s next and the right one’s prev. Then free(X).' },
      { q: 'Which application naturally uses a doubly linked list?', o: ['browser back and forward buttons', 'a bracket checker', 'a hash function', 'binary search'], a: 0, why: 'Back = move to prev, Forward = move to next. Undo/redo and music players work the same way.' }
    ] },
    cll: { unit: 'q22', qs: [
      { q: 'In a circular linked list the last node points to…', o: ['NULL', 'the first node (head)', 'always itself', 'the previous node'], a: 1, why: 'That link back to head is what makes it a circle. There is no NULL anywhere.' },
      { q: 'Traversing a circular list stops when…', o: ['temp == NULL', 'temp→next == NULL', 'temp comes back to head', 'temp→data == 0'], a: 2, why: 'Use a do-while: print, move on, and stop once temp == head again. Checking for NULL would loop forever.' },
      { q: 'A typical application of a circular list is…', o: ['round-robin CPU scheduling', 'binary search', 'infix to postfix', 'building a BST'], a: 0, why: 'Each process gets a turn and then the turn passes to the next, forever around the circle.' },
      { q: 'A circular list with only one node: its next points to…', o: ['NULL', 'itself', 'head→prev', 'nothing'], a: 1, why: 'With one node, the “next node in the circle” is the node itself: <code>head→next = head</code>.' }
    ] },
    'll-compare': { unit: 'q22', qs: [
      { q: 'Which list uses the most memory per node?', o: ['Singly', 'Doubly', 'Circular singly', 'All the same'], a: 1, why: 'A DLL node stores two pointers (prev and next); SLL and CLL nodes store one.' },
      { q: 'Which list lets you get from the last node back to the first without starting again from head?', o: ['Singly', 'Circular', 'Array', 'None of them'], a: 1, why: 'In a circular list, last→next is head.' },
      { q: 'Array vs linked list: which statement is TRUE?', o: ['Arrays have a dynamic size', 'Linked list nodes sit in contiguous memory', 'Linked lists can insert at the beginning in O(1)', 'Arrays need a pointer to the next element'], a: 2, why: 'Insert at beginning = two pointer changes, no shifting. An array would have to shift every element.' }
    ] },

    /* ============================== Q23 ============================== */
    stack: { unit: 'q23', qs: [
      { q: 'A stack follows…', o: ['FIFO', 'LIFO', 'random order', 'sorted order'], a: 1, why: 'Last In, First Out, like a pile of plates: you take the top one, which is the last one placed.' },
      { q: 'Array stack with MAX = 5. Overflow happens when…', o: ['top == −1', 'top == 4 (MAX − 1)', 'top == 5', 'top == 0'], a: 1, why: 'top starts at −1. Indexes run 0..4, so the stack is full when top == MAX − 1 = 4.' },
      { q: 'push(1), push(2), push(3), pop(), push(4), pop(). What is on top now?', o: ['1', '2', '3', '4'], a: 1, why: 'After 1, 2, 3 the first pop removes 3; push 4; the second pop removes 4. The top is 2.' },
      { q: 'Which is <b>NOT</b> an application of a stack?', o: ['undo in an editor', 'checking balanced brackets', 'a printer’s waiting line of jobs', 'function calls and recursion'], a: 2, why: 'Printer jobs are served first come, first served: that is a queue.' },
      { q: 'Popping from an empty stack is…', o: ['overflow', 'underflow', 'a collision', 'a rotation'], a: 1, why: 'Underflow: top == −1 and you try to pop.' }
    ] },
    queue: { unit: 'q23', qs: [
      { q: 'A queue follows…', o: ['LIFO', 'FIFO', 'random order', 'largest value first'], a: 1, why: 'First In, First Out, like a ticket line: the first person to join is served first.' },
      { q: 'In a queue, insertion happens at the ___ and deletion at the ___.', o: ['front, rear', 'rear, front', 'top, top', 'middle, end'], a: 1, why: 'Join at the rear (enqueue), leave from the front (dequeue).' },
      { q: 'The drawback of a linear array queue is…', o: ['it cannot store integers', 'space freed at the front cannot be reused', 'it works in LIFO order', 'dequeue takes O(n²)'], a: 1, why: 'rear only moves forward. Once rear hits MAX − 1 it reports “full” even if the front slots are empty. The circular queue fixes this.' },
      { q: 'enqueue(5), enqueue(8), dequeue(), enqueue(2). The front element is…', o: ['5', '8', '2', 'the queue is empty'], a: 1, why: '5 joined first and was removed by dequeue. Now 8 is at the front and 2 is at the rear.' }
    ] },
    cqueue: { unit: 'q23', qs: [
      { q: 'In a circular queue of SIZE slots, the slot after rear is…', o: ['rear + 1', '(rear + 1) % SIZE', 'rear − 1', 'SIZE − rear'], a: 1, why: 'The % (modulo) wraps the last index back to 0, so the array behaves like a ring.' },
      { q: 'A circular queue is <b>full</b> when…', o: ['rear == SIZE − 1', 'front == −1', '(rear + 1) % SIZE == front', 'front == rear'], a: 2, why: 'The next slot after rear is front, so there is nowhere left. front == −1 means empty.' },
      { q: 'SIZE = 5, front = 3, rear = 4. After one enqueue, rear becomes…', o: ['5', '0', '3', '1'], a: 1, why: '(4 + 1) % 5 = 0. It wraps round to slot 0, which a linear queue could never reuse.' },
      { q: 'When you dequeue the only element (front == rear), you set…', o: ['front = rear = −1', 'front = 0', 'rear = SIZE', 'nothing changes'], a: 0, why: 'The queue is now empty, so reset both to −1.' },
      { q: 'The main benefit of a circular queue over a linear queue is…', o: ['it works in LIFO order', 'it reuses empty slots, so no space is wasted', 'it needs no array', 'it sorts the data'], a: 1, why: 'Same fixed array, but slots freed at the front get used again.' }
    ] },
    paren: { unit: 'q23', qs: [
      { q: 'Which data structure checks balanced parentheses?', o: ['Queue', 'Stack', 'Tree', 'Hash table'], a: 1, why: 'The last bracket opened must be the first closed: LIFO, so a stack.' },
      { q: 'Is <code>([)]</code> balanced?', o: ['Yes', 'No: they close in the wrong order', 'No: there are too many brackets', 'Only in C'], a: 1, why: 'When ) arrives, the top of the stack is [ : a mismatch.' },
      { q: 'After scanning <code>((a+b)</code>, one ( is still on the stack. The result is…', o: ['balanced', 'not balanced: an opening bracket was never closed', 'not balanced: extra closing bracket', 'an error in the algorithm'], a: 1, why: 'At the end the stack must be empty for the expression to be balanced.' },
      { q: 'A closing bracket arrives and the stack is empty. The expression…', o: ['is balanced', 'has an extra closing bracket: not balanced', 'needs a push', 'is in postfix form'], a: 1, why: 'There is no opening bracket to match it with.' }
    ] },
    infix: { unit: 'q23', qs: [
      { q: 'The postfix form of <code>A + B * C</code> is…', o: ['A B + C *', 'A B C * +', '+ A * B C', 'A B C + *'], a: 1, why: '* binds tighter than +, so B * C becomes B C * first, then A … +.' },
      { q: 'The postfix form of <code>(A + B) * C</code> is…', o: ['A B + C *', 'A B C + *', '* + A B C', 'A B C * +'], a: 0, why: 'The brackets force A + B first: A B +, then multiply by C: A B + C *.' },
      { q: 'Which operator has the <b>highest</b> precedence?', o: ['+', '*', '^', '−'], a: 2, why: '^ (power) &gt; * / &gt; + −. ^ is also right-associative.' },
      { q: 'The postfix form of <code>A ^ B ^ C</code> is…', o: ['A B ^ C ^', 'A B C ^ ^', '^ ^ A B C', 'A ^ B C ^'], a: 1, why: '^ is right-associative: A ^ (B ^ C). So B C ^ comes first, then A … ^.' },
      { q: 'During conversion, when you scan <code>)</code> you…', o: ['push it', 'pop operators to the output until ( and discard both brackets', 'ignore it', 'write it to the output'], a: 1, why: 'Brackets never appear in postfix. ) means: empty the stack back to the matching (.' },
      { q: 'The <b>prefix</b> form of <code>A + B * C</code> is…', o: ['+ A * B C', '* + A B C', 'A B C * +', '+ * A B C'], a: 0, why: 'Operator before operands: B * C → * B C, then A + (…) → + A * B C.' }
    ] },
    eval: { unit: 'q23', qs: [
      { q: 'Evaluate the postfix <code>5 3 + 8 2 − *</code>', o: ['48', '22', '16', '40'], a: 0, why: '5 + 3 = 8, 8 − 2 = 6, 8 × 6 = 48.' },
      { q: 'Evaluating postfix, you meet an operator. You pop B, then pop A, and push…', o: ['B op A', 'A op B', 'A + B always', 'nothing'], a: 1, why: 'The first value popped is the right operand. For 8 2 −: pop 2 (B), pop 8 (A), push 8 − 2 = 6.' },
      { q: 'Evaluate <code>2 3 1 * + 9 −</code>', o: ['−4', '4', '14', '−14'], a: 0, why: '3 × 1 = 3, 2 + 3 = 5, 5 − 9 = −4.' },
      { q: 'During postfix evaluation, the stack holds…', o: ['operators', 'operands (numbers)', 'brackets', 'nothing'], a: 1, why: 'In conversion the stack holds operators; in evaluation it holds numbers. Don’t mix them up.' }
    ] },

    /* ============================== Q24 ============================== */
    'tree-basics': { unit: 'q24', qs: [
      { q: 'A tree with n nodes has how many edges?', o: ['n', 'n − 1', 'n + 1', '2n'], a: 1, why: 'Every node except the root has exactly one edge going up to its parent.' },
      { q: 'A node with no children is a…', o: ['root', 'leaf', 'parent', 'sibling'], a: 1, why: 'Leaf (or external node). Nodes with at least one child are internal nodes.' },
      { q: 'The maximum number of nodes in a binary tree of height h (root at height 0) is…', o: ['2h', '2<sup>h</sup>', '2<sup>h+1</sup> − 1', 'h²'], a: 2, why: 'Levels hold 1 + 2 + 4 + … + 2<sup>h</sup> = 2<sup>h+1</sup> − 1 nodes.' },
      { q: 'In the array representation (root at index 0), the left child of node i is at…', o: ['i + 1', '2i + 1', '2i + 2', 'i / 2'], a: 1, why: 'Left = 2i + 1, right = 2i + 2, parent = ⌊(i − 1)/2⌋. (If the root is at index 1: left = 2i, right = 2i + 1.)' },
      { q: 'A binary tree in which every node has 0 or 2 children is…', o: ['complete', 'full (strict)', 'skewed', 'always perfect'], a: 1, why: 'Full/strict = 0 or 2 children. Complete = every level filled except possibly the last, filled left to right.' }
    ] },
    traversal: { unit: 'q24', qs: [
      { q: 'Which traversal of a BST lists the keys in sorted order?', o: ['Preorder', 'Inorder', 'Postorder', 'Level order'], a: 1, why: 'Inorder = Left, Root, Right. In a BST, everything left is smaller, so you get ascending order.' },
      { q: 'Preorder visits…', o: ['Left, Root, Right', 'Root, Left, Right', 'Left, Right, Root', 'level by level'], a: 1, why: '“Pre” = root comes first. “Post” = root comes last. “In” = root in the middle.' },
      { q: 'In postorder, the root is visited…', o: ['first', 'second', 'last', 'never'], a: 2, why: 'Left, Right, Root.' },
      { q: 'Tree: root 1, left child 2, right child 3. The postorder is…', o: ['1 2 3', '2 1 3', '2 3 1', '3 2 1'], a: 2, why: 'Left (2), Right (3), Root (1).' }
    ] },
    bst: { unit: 'q24', qs: [
      { q: 'In a BST, every key in the <b>left</b> subtree of a node is…', o: ['larger', 'smaller', 'equal', 'in any order'], a: 1, why: 'Left subtree &lt; node &lt; right subtree, for every node in the tree.' },
      { q: 'Insert 50, 30, 70, 20 into an empty BST. Where does 20 go?', o: ['right child of 70', 'left child of 30', 'it becomes the root', 'right child of 30'], a: 1, why: '20 &lt; 50 → go left to 30; 20 &lt; 30 → go left; that spot is empty, so 20 sits there.' },
      { q: 'Deleting a node with <b>two</b> children: replace it with its…', o: ['parent', 'inorder successor (smallest key in the right subtree)', 'left child, always', 'root'], a: 1, why: 'The inorder predecessor (largest in the left subtree) is also accepted. Either keeps the BST order.' },
      { q: 'Searching a skewed BST (1, 2, 3, 4, 5 inserted in order) takes…', o: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], a: 2, why: 'It degenerates into a straight line, like a linked list. AVL trees prevent this.' },
      { q: 'The smallest key in a BST is found by…', o: ['going right until NULL', 'going left until NULL', 'checking the root only', 'taking the last key of the inorder traversal'], a: 1, why: 'Keep going left: the leftmost node is the minimum. The rightmost is the maximum.' }
    ] },
    construct: { unit: 'q24', qs: [
      { q: 'Given preorder and inorder, the root of the tree is…', o: ['the last element of preorder', 'the first element of preorder', 'the middle of inorder', 'the first element of inorder'], a: 1, why: 'Preorder visits the root first. Then find it in inorder to split left and right.' },
      { q: 'Given postorder and inorder, the root is…', o: ['the first element of postorder', 'the last element of postorder', 'the first element of inorder', 'the last element of inorder'], a: 1, why: 'Postorder visits the root last.' },
      { q: 'Inorder: D B E A F C, and the root is A. The left subtree contains…', o: ['D B E', 'F C', 'D B E A', 'only B'], a: 0, why: 'Everything to the left of A in the inorder sequence belongs to the left subtree.' },
      { q: 'Which pair can <b>NOT</b> uniquely build a general binary tree?', o: ['inorder + preorder', 'inorder + postorder', 'preorder + postorder', 'inorder + level order'], a: 2, why: 'Without inorder you cannot tell whether a single child is on the left or the right.' }
    ] },
    avl: { unit: 'q24', qs: [
      { q: 'The balance factor of a node in an AVL tree is…', o: ['height(left) − height(right)', 'its number of children', 'height(left) + height(right)', 'its depth'], a: 0, why: 'BF = h(L) − h(R). An empty subtree has height −1 (or count levels; just be consistent).' },
      { q: 'The allowed balance factors in an AVL tree are…', o: ['0 only', '−1, 0, +1', '−2 to +2', 'any value'], a: 1, why: 'If any node reaches +2 or −2, a rotation is needed.' },
      { q: 'Insert 10, 20, 30 into an AVL tree. Which rotation fixes it?', o: ['LL → right rotation', 'RR → left rotation', 'LR', 'RL'], a: 1, why: 'The new key went Right of Right of 10: RR case, fixed by one left rotation. 20 becomes the root.' },
      { q: 'Insert 30, 10, 20. Which case is this?', o: ['LL', 'RR', 'LR: left-rotate 10, then right-rotate 30', 'RL'], a: 2, why: '20 went into the Left child’s Right subtree: LR, a double rotation. 20 becomes the root.' },
      { q: 'The height of an AVL tree with n nodes is always…', o: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], a: 1, why: 'That is the whole point: search, insert and delete stay O(log n).' }
    ] },
    btree: { unit: 'q24', qs: [
      { q: 'In a B-tree of order m, the maximum number of keys in a node is…', o: ['m', 'm − 1', 'm + 1', 'm / 2'], a: 1, why: 'Up to m children and m − 1 keys. Order 5 → at most 4 keys per node.' },
      { q: 'All the leaves of a B-tree are…', o: ['at different levels', 'at the same level', 'empty', 'linked into a list'], a: 1, why: 'B-trees grow upward from the root during splits, so they always stay perfectly balanced. (Linked leaves belong to B+ trees.)' },
      { q: 'When a node overflows during insertion…', o: ['the smallest key is deleted', 'it splits and the median key moves up to the parent', 'the tree is rotated', 'the key is thrown away'], a: 1, why: 'Split around the median; the median goes up. If the root splits, a new root is created and the height grows by one.' },
      { q: 'B-trees are mainly used in…', o: ['databases and file systems', 'expression evaluation', 'undo operations', 'BFS'], a: 0, why: 'Wide, short trees mean very few disk reads to find a record.' },
      { q: 'Order 3 B-tree: insert 10, 20, 30. The result is…', o: ['one node [10 20 30]', 'root [20] with children [10] and [30]', 'root [10] with children [20] and [30]', 'root [30] only'], a: 1, why: 'Order 3 allows at most 2 keys per node. [10 20 30] overflows, so the median 20 moves up.' }
    ] },
    hashing: { unit: 'q24', qs: [
      { q: 'With h(k) = k mod 10, where does 47 go?', o: ['slot 4', 'slot 7', 'slot 47', 'slot 0'], a: 1, why: '47 mod 10 = 7 (the remainder after dividing by 10).' },
      { q: 'Two keys mapping to the same slot is called…', o: ['a rotation', 'a collision', 'an overflow', 'a split'], a: 1, why: 'Example: 72 and 92 both give 2 when m = 10.' },
      { q: 'Linear probing: slot 2 is taken when inserting 92. Which slot is tried next?', o: ['slot 4', 'slot 3', 'slot 0', 'slot 9'], a: 1, why: 'Linear probing checks (h + 1), (h + 2), … mod m: slot 3 first.' },
      { q: 'Separate chaining stores colliding keys in…', o: ['the next empty slot', 'a linked list at that slot', 'a stack', 'always a second table'], a: 1, why: 'Each slot heads a linked list of every key that hashed there.' },
      { q: 'Quadratic probing tries the slots…', o: ['h, h+1, h+2, …', 'h, h+1, h+4, h+9, …', 'h, 2h, 3h, …', 'at random'], a: 1, why: '(h + i²) mod m for i = 0, 1, 2, 3, … jumps further each time.' },
      { q: 'Primary clustering is a problem of…', o: ['chaining', 'linear probing', 'double hashing', 'binary search'], a: 1, why: 'Linear probing makes long runs of filled slots, and new keys pile onto the end of them.' }
    ] },
    spanning: { unit: 'q24', qs: [
      { q: 'A spanning tree of a connected graph with 6 vertices has how many edges?', o: ['6', '5', '7', '15'], a: 1, why: 'Always n − 1 edges.' },
      { q: 'A spanning tree must…', o: ['contain a cycle', 'include every vertex and have no cycle', 'include every edge', 'be directed'], a: 1, why: 'All vertices, connected, no cycles, n − 1 edges.' },
      { q: 'How many spanning trees does the complete graph K₄ have?', o: ['4', '8', '12', '16'], a: 3, why: 'Cayley’s formula: n<sup>n−2</sup> = 4² = 16.' },
      { q: 'A <b>minimum</b> spanning tree is the spanning tree with…', o: ['the fewest vertices', 'the minimum total edge weight', 'the greatest depth', 'the fewest leaves'], a: 1, why: 'Every spanning tree has the same number of edges; the MST is the cheapest one. Found with Prim’s or Kruskal’s algorithm.' }
    ] },

    /* ============================== Q25 ============================== */
    'graph-terms': { unit: 'q25', qs: [
      { q: 'A graph G = (V, E) consists of…', o: ['vertices and edges', 'roots and leaves', 'keys and slots', 'front and rear'], a: 0, why: 'V = set of vertices (nodes), E = set of edges (connections).' },
      { q: 'The degree of a vertex in an undirected graph is…', o: ['the number of edges touching it', 'its distance from the start', 'its weight', 'the number of graphs it is in'], a: 0, why: 'In a directed graph you count in-degree (arrows in) and out-degree (arrows out) separately.' },
      { q: 'A complete undirected graph with n vertices has how many edges?', o: ['n', 'n − 1', 'n(n − 1) / 2', 'n²'], a: 2, why: 'Every pair is connected: n choose 2 = n(n − 1)/2. For 5 vertices that is 10.' },
      { q: 'A graph whose edges have a direction (arrows) is…', o: ['weighted', 'directed (a digraph)', 'complete', 'always cyclic'], a: 1, why: 'Weighted means the edges carry numbers (costs); directed means they have arrows.' }
    ] },
    'graph-repr': { unit: 'q25', qs: [
      { q: 'An adjacency matrix for V vertices needs space…', o: ['O(V)', 'O(E)', 'O(V²)', 'O(V + E)'], a: 2, why: 'A V × V grid, whether there are many edges or few.' },
      { q: 'An adjacency list needs space…', o: ['O(V + E)', 'O(V²)', 'O(1)', 'O(E²)'], a: 0, why: 'One list head per vertex plus one entry per edge (two entries per edge if undirected).' },
      { q: 'The adjacency matrix of an undirected graph is always…', o: ['symmetric', 'upper triangular', 'all ones', 'diagonal'], a: 0, why: 'If A–B is an edge, then M[A][B] = M[B][A] = 1.' },
      { q: 'Which is better for a <b>sparse</b> graph (few edges)?', o: ['Adjacency matrix', 'Adjacency list', 'Both are equal', 'Neither'], a: 1, why: 'A matrix wastes space storing mostly zeros. A list stores only the edges that exist.' },
      { q: 'Checking whether edge (u, v) exists takes O(1) in…', o: ['an adjacency list', 'an adjacency matrix', 'both', 'neither'], a: 1, why: 'Just read M[u][v]. In a list you must scan u’s neighbours.' }
    ] },
    'bfs-dfs': { unit: 'q25', qs: [
      { q: 'BFS uses a…', o: ['stack', 'queue', 'heap', 'hash table'], a: 1, why: 'Breadth = Queue: visit everything one step away before going two steps away.' },
      { q: 'DFS uses a…', o: ['queue', 'stack (or recursion)', 'matrix only', 'priority queue'], a: 1, why: 'Depth = Stack: go as deep as possible, then backtrack.' },
      { q: 'Which finds the shortest path (fewest edges) in an unweighted graph?', o: ['BFS', 'DFS', 'Kruskal', 'Prim'], a: 0, why: 'BFS reaches every vertex in order of distance from the start.' },
      { q: 'Graph: A–B, A–C, B–D, C–D, D–E. BFS from A (neighbours in alphabetical order) gives…', o: ['A B D C E', 'A B C D E', 'A C D B E', 'A B C E D'], a: 1, why: 'A; then its neighbours B, C; then D (from B); then E (from D).' },
      { q: 'Same graph, DFS from A gives…', o: ['A B C D E', 'A B D C E', 'A C B D E', 'A D B C E'], a: 1, why: 'A → B → D (deep first) → C (D’s first unvisited neighbour) → back to D → E.' },
      { q: 'With an adjacency list, BFS and DFS take…', o: ['O(V²)', 'O(V + E)', 'O(E log V)', 'O(1)'], a: 1, why: 'Every vertex and every edge is handled once. With a matrix it is O(V²).' }
    ] },
    prim: { unit: 'q25', qs: [
      { q: 'Prim’s algorithm grows the MST by repeatedly picking…', o: ['the cheapest edge in the whole graph', 'the cheapest edge joining the tree to a new vertex', 'the most expensive edge', 'a random edge'], a: 1, why: 'One tree grows outward. Kruskal’s is the one that picks the cheapest edge anywhere.' },
      { q: 'Prim’s algorithm is a…', o: ['divide and conquer algorithm', 'greedy algorithm', 'dynamic programming algorithm', 'backtracking algorithm'], a: 1, why: 'At every step it takes the locally cheapest choice, and for MSTs this gives the optimum. Kruskal’s is greedy too.' },
      { q: 'Prim’s algorithm starts from…', o: ['a sorted list of edges', 'any single vertex', 'the heaviest edge', 'a leaf'], a: 1, why: 'Pick any start vertex; the total MST cost is the same whichever you choose.' },
      { q: 'With an adjacency matrix, Prim’s runs in…', o: ['O(V²)', 'O(V)', 'O(E)', 'O(2ⁿ)'], a: 0, why: 'O(V²) with a matrix; O(E log V) with a min-heap and adjacency lists.' }
    ] },
    kruskal: { unit: 'q25', qs: [
      { q: 'The first step of Kruskal’s algorithm is to…', o: ['pick a start vertex', 'sort all edges by weight', 'run BFS', 'build an adjacency matrix'], a: 1, why: 'Sort ascending, then take edges one by one.' },
      { q: 'Kruskal’s rejects an edge when it…', o: ['is the cheapest one', 'would form a cycle', 'touches a leaf', 'has weight 0'], a: 1, why: 'If both ends are already connected, adding the edge closes a loop.' },
      { q: 'Kruskal’s detects cycles using…', o: ['union-find (disjoint sets)', 'a stack', 'a hash table', 'inorder traversal'], a: 0, why: 'Find: are u and v in the same set? If not, Union: merge their sets and accept the edge.' },
      { q: 'Kruskal’s is usually better for…', o: ['dense graphs', 'sparse graphs', 'trees only', 'directed graphs only'], a: 1, why: 'Its cost is dominated by sorting E edges: O(E log E). Prim’s with a matrix suits dense graphs.' },
      { q: 'Edges in order: B–C 1, A–C 2, D–E 3, A–B 4, B–D 5. After accepting B–C and A–C, edge A–B is…', o: ['accepted', 'rejected: A and B are already connected through C', 'accepted twice', 'skipped because it is too light'], a: 1, why: 'A–C–B is already a path, so A–B would make the cycle A–B–C.' }
    ] }
  };
})(window);
