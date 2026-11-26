# DSA Night Before

An interactive, beginner-friendly revision site for a DSA end-semester exam. It covers every syllabus unit (Q21–Q25), has model answers for 8- and 15-mark questions, 32 scenario questions, flashcards and a mock test.

The whole site is one file, `docs/index.html`. It needs no server-side code and no installed packages, and apart from Google Fonts it works offline.

## Publish on GitHub Pages

1. Create a new **public** repository on GitHub (for example `dsa-night-before`).
2. Push this folder to it:

   ```
   git init
   git add .
   git commit -m "DSA exam prep site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/dsa-night-before.git
   git push -u origin main
   ```

3. On GitHub, open the repository and go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**, the branch to **main** and the folder to **/docs**, then press **Save**.
5. After about a minute the site is live at `https://YOUR-USERNAME.github.io/dsa-night-before/`. The Pages settings screen shows the exact link.

`docs/.nojekyll` tells GitHub to serve the file as it is, without running Jekyll.

## Preview locally

Open `docs/index.html` in a browser, or run a local server:

```
npm run serve
```

Then visit <http://localhost:8080>.

## Edit and rebuild

Edit the files in `src/`, then rebuild `docs/index.html`:

```
npm run build
npm test
```

The build stops with a message if a page links to a missing section, an id is used twice, or an HTML tag is left unclosed. The tests check every algorithm (infix to postfix, AVL rotations, B-tree splits, hashing, BFS/DFS, Prim, Kruskal and more) against textbook answers, so the worked examples on the site are always correct.

After rebuilding, commit and push `docs/index.html` and GitHub Pages updates by itself.

## Project layout

| Path | What it holds |
|---|---|
| `src/pages/` | One HTML file per page: home, basics (Q21), linked-lists (Q22), stacks-queues (Q23), trees (Q24), graphs (Q25), answers, scenarios, revise |
| `src/css/` | Design tokens (light and dark), layout, components, diagram styles |
| `src/js/algo/` | Pure algorithm modules, also used by the tests |
| `src/js/viz/` | Interactive playgrounds and the diagram/trace generators |
| `src/js/core/` | Router, progress store, stepper, quiz, flashcards, UI |
| `src/js/data/` | Quiz questions, flashcards and scenarios |
| `tests/` | `node --test` checks for the algorithm modules |
| `build.mjs` | Inlines everything into `docs/index.html` and checks links and ids |

Progress (XP, badges, finished topics) is saved in the browser’s local storage on each device.
