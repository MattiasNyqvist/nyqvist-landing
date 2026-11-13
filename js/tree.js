/**
 * Directory tree and status bar counters of the file manager panel.
 *
 * Builds the tree from the project data (data/projects.js) and writes it into
 * <ul class="tree"> in index.html. The folders are <details>/<summary> elements,
 * so they open and close without any further script. Each project row is a link
 * carrying the project's id in `data-project`; js/project-card.js uses that to
 * show the details.
 *
 * To add a project or a folder, edit data/projects.js - not this file.
 */
(function () {
  'use strict';

  const SELECTORS = {
    tree: '.tree',
    dirCount: '#dir-count',
    projectCount: '#project-count',
  };

  /** Visible texts (the site is in Swedish). */
  const TEXT = {
    rootFolder: 'Alla projekt',
    emptyFolder: 'Inga projekt ännu',
    folders: (/** @type {number} */ count) => `${count} ${count === 1 ? 'mapp' : 'mappar'}`,
    projects: (/** @type {number} */ count) => `${count} projekt`,
  };

  /** Set to false to hide folders that contain no projects yet. */
  const SHOW_EMPTY_FOLDERS = true;

  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const DEFAULT_FOLDER_ICON = 'i-folder';
  const EMPTY_ROW_ICON = 'i-file';

  /** Entry point, called from main.js. */
  function initTree() {
    const tree = document.querySelector(SELECTORS.tree);
    const data = window.Site && window.Site.data;
    if (!tree || !data) return;

    const projectsByFolder = groupByFolder(data);
    const projectsIn = (/** @type {Folder} */ folder) => projectsByFolder.get(folder.id) || [];
    const folders = data.folders.filter((folder) => SHOW_EMPTY_FOLDERS || projectsIn(folder).length > 0);

    tree.replaceChildren(createRoot(folders.map((folder) => createFolder(folder, projectsIn(folder)))));
    const shownProjects = folders.reduce((total, folder) => total + projectsIn(folder).length, 0);   // projects in an unknown folder are not shown, so not counted
    updateCounters(folders.length, shownProjects);
  }

  /* ---------- Data ---------- */

  /**
   * Groups the projects by folder id. Every folder gets an entry, also empty ones.
   * @param {SiteData} data
   * @returns {Map<string, Project[]>}
   */
  function groupByFolder(data) {
    /** @type {Map<string, Project[]>} */
    const groups = new Map(data.folders.map((folder) => [folder.id, []]));
    for (const project of data.projects) {
      const group = groups.get(project.folder);
      if (group) group.push(project);
      else console.warn(`Project "${project.name}" refers to an unknown folder: "${project.folder}"`);
    }
    return groups;
  }

  /* ---------- Building the markup (same structure the stylesheets expect) ---------- */

  /**
   * Creates an element with an optional class and text.
   * @template {keyof HTMLElementTagNameMap} K
   * @param {K} tag
   * @param {string} [className]
   * @param {string} [text]
   * @returns {HTMLElementTagNameMap[K]}
   */
  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  /**
   * An icon from the SVG sprite in index.html.
   * @param {string} symbolId
   */
  function createIcon(symbolId) {
    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NAMESPACE, 'use');
    use.setAttribute('href', `#${symbolId}`);
    svg.appendChild(use);
    return svg;
  }

  /**
   * One tree level: a collapsible folder row and the list that holds its children.
   * @param {string} className  extra class for the <details> element
   * @param {string} iconId
   * @param {string} name
   * @param {HTMLElement[]} children
   */
  function createNode(className, iconId, name, children) {
    const item = createElement('li');
    const details = createElement('details', className);
    const summary = createElement('summary', 'tree-row');
    summary.append(createIcon(iconId), createElement('span', 'row-name', name));
    const list = createElement('ul', 'tree-children');
    list.append(...children);
    details.append(summary, list);
    item.append(details);
    return { item, details };
  }

  /** @param {HTMLElement[]} folderItems */
  function createRoot(folderItems) {
    const { item, details } = createNode('tree-node tree-node--root', DEFAULT_FOLDER_ICON, TEXT.rootFolder, folderItems);
    details.open = true;
    return item;
  }

  /**
   * @param {Folder} folder
   * @param {Project[]} projects
   */
  function createFolder(folder, projects) {
    const rows = projects.length ? projects.map(createProjectRow) : [createEmptyRow()];
    return createNode('tree-node', folder.icon || DEFAULT_FOLDER_ICON, folder.name, rows).item;
  }

  /** @param {Project} project */
  function createProjectRow(project) {
    const item = createElement('li');
    const link = createElement('a', 'tree-row tree-row--project');
    link.href = project.demo || project.github || '#';   // used when a click is not handled by the project card (e.g. open in new tab)
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.project = project.id;
    link.append(createIcon(DEFAULT_FOLDER_ICON), createElement('span', 'row-name', project.name));
    if (project.tagline) link.append(createElement('span', 'row-desc', project.tagline));
    item.append(link);
    return item;
  }

  function createEmptyRow() {
    const item = createElement('li');
    const row = createElement('span', 'tree-row tree-row--empty');
    row.append(createIcon(EMPTY_ROW_ICON), createElement('span', 'row-name', TEXT.emptyFolder));
    item.append(row);
    return item;
  }

  /* ---------- Status bar ---------- */

  /**
   * @param {number} folderCount
   * @param {number} projectCount
   */
  function updateCounters(folderCount, projectCount) {
    const folders = document.querySelector(SELECTORS.dirCount);
    const projects = document.querySelector(SELECTORS.projectCount);
    if (folders) folders.textContent = TEXT.folders(folderCount);
    if (projects) projects.textContent = TEXT.projects(projectCount);
  }

  window.Site = window.Site || {};
  window.Site.initTree = initTree;
})();
