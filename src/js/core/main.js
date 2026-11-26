// Start-up.
(function (root) {
  const DSA = root.DSA;
  function start() {
    DSA.ui.snapshotAnswers();
    DSA.ui.init();
    DSA.router.init();
    // Keep the site's progress rings honest after the first render.
    DSA.ui.renderNav();
    DSA.ui.renderXP();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window);
