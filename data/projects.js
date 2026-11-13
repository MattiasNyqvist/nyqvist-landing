/**
 * Project data: the single place to edit when you add or change a project.
 * js/tree.js builds the directory tree from it and js/project-card.js fills the
 * project card from it.
 *
 * Why a .js file and not a .json file? Browsers refuse to read local .json files
 * when a page is opened straight from disk (file://), and this site is meant to
 * work that way too. The shape is the same as JSON, so it is easy to move later.
 * The types `SiteData`, `Folder` and `Project` are described in js/globals.d.ts.
 */
(function () {
  'use strict';

  /** @type {SiteData} */
  const data = {
    /**
     * The folders in the tree, in display order.
     * `icon` is the id of a <symbol> in the SVG sprite at the top of index.html.
     */
    folders: [
      { id: 'typescript', name: 'TypeScript', icon: 'i-ts' },
      { id: 'javascript', name: 'JavaScript', icon: 'i-js' },
      { id: 'python', name: 'Python', icon: 'i-py' },
      { id: 'ai', name: 'AI', icon: 'i-ai' },
      { id: 'dotnet', name: '.NET', icon: 'i-net' },
    ],

    /**
     * The projects. `folder` is the id of a folder above.
     * Rule of thumb: if AI is the product, use the "ai" folder; otherwise the language it is built in.
     * Optional fields: tagline, demo, github, note (a small label beside the title in the card).
     */
    projects: [
      {
        id: 'on-screen',
        folder: 'typescript',
        name: 'On Screen',
        tagline: 'Skriv inte bara din kod. Presentera den.',
        description: 'En webbapplikation för att skripta och simulera automatiserad kodinmatning samt presentationsoverlays för videotutorials.',
        demo: 'https://onscreen.nyqvist.net',
        github: 'https://github.com/MattiasNyqvist/codeonscreen',
        note: 'Byggt med AI-stöd',
      },
      // To add a project, copy the object above and change the values.
    ],
  };

  window.Site = window.Site || {};
  window.Site.data = data;
})();
