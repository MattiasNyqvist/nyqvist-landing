/**
 * Entry point. Loaded last (every script uses `defer`, so the DOM is ready).
 *
 * Each feature lives in its own file and registers an `init…` function on the
 * shared `window.Site` object (typed in js/globals.d.ts); the project data is
 * registered there too, by data/projects.js. Plain scripts are used instead of
 * ES modules so the page also works when opened straight from disk (file://),
 * where browsers block modules.
 */
Site.initTree();         // needs Site.data
Site.initProjectCard();  // needs the tree
Site.initLight();
