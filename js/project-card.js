/**
 * Project card: shows the details of the project selected in the tree.
 *
 * Clicking a project row (see js/tree.js) fills the card from the project data
 * (data/projects.js) and shows it. Clicking anything else in the tree hides the
 * card again, so only the active selection is ever shown. The card can also be
 * closed with its X button or the Escape key.
 */
(function () {
  'use strict';

  const SELECTORS = {
    tree: '.tree',
    projectRow: 'a.tree-row--project',
    card: '#project-card',
  };

  /**
   * Typed shortcut for `querySelector`.
   * @template {HTMLElement} T
   * @param {string} selector
   * @param {ParentNode} [root]
   * @returns {T | null}
   */
  function find(selector, root = document) {
    return /** @type {T | null} */ (root.querySelector(selector));
  }

  /** Entry point, called from main.js. */
  function initProjectCard() {
    const data = window.Site && window.Site.data;
    const card = find(SELECTORS.card);
    const tree = find(SELECTORS.tree);
    if (!data || !card || !tree) return;

    const title = find('.project-card-title', card);
    const note = find('.project-card-note', card);
    const description = find('.project-card-desc', card);
    const actions = find('.project-card-actions', card);
    const closeButton = find('.project-card-close', card);
    if (!title || !note || !description || !actions || !closeButton) return;   // incomplete markup: leave the page as it is

    /** The project row whose details are currently shown, if any. */
    /** @type {HTMLElement | null} */
    let selectedRow = null;

    /**
     * @param {string} label
     * @param {string} href
     * @param {string} className
     */
    function createButton(label, href, className) {
      const link = document.createElement('a');
      link.className = className;
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = `${label} ↗`;
      return link;
    }

    /**
     * @param {HTMLElement} row  the clicked project row
     * @param {Project} project
     */
    const show = (row, project) => {
      title.textContent = project.name;
      description.textContent = project.description;
      note.textContent = project.note || '';
      note.hidden = !project.note;

      /** @type {HTMLAnchorElement[]} */
      const buttons = [];
      if (project.demo) buttons.push(createButton('Besök', project.demo, 'button button--primary'));
      if (project.github) buttons.push(createButton('GitHub', project.github, 'button'));
      actions.replaceChildren(...buttons);

      selectedRow?.removeAttribute('aria-current');
      row.setAttribute('aria-current', 'true');
      selectedRow = row;
      card.hidden = false;
    };

    const hide = () => {
      selectedRow?.removeAttribute('aria-current');
      selectedRow = null;
      card.hidden = true;
    };

    /** Manual close (X button or Escape): hide the card and give keyboard focus back to the project row. */
    const close = () => {
      const previous = selectedRow;
      hide();
      if (previous) previous.focus();
    };

    // One listener on the whole tree (the rows are created by js/tree.js)
    tree.addEventListener('click', (event) => {
      const clicked = event.target instanceof Element ? /** @type {HTMLElement | null} */ (event.target.closest(SELECTORS.projectRow)) : null;
      const project = clicked && data.projects.find((p) => p.id === clicked.dataset.project);

      if (!clicked || !project) {
        hide();   // a folder or an empty row was clicked
        return;
      }
      // Leave modified clicks (open in new tab/window) to the browser
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.button) return;
      event.preventDefault();
      show(clicked, project);
    });

    closeButton.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !card.hidden) close();
    });
  }

  window.Site = window.Site || {};
  window.Site.initProjectCard = initProjectCard;
})();
