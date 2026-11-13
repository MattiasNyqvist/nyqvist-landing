/**
 * Type declarations for the editor and `tsc` (see jsconfig.json). Nothing here
 * runs in the browser.
 *
 * Every script registers what it provides on one shared object, `window.Site`;
 * js/main.js then starts the features. This file describes that object and the
 * shape of the project data in data/projects.js.
 */

/** A folder in the directory tree. */
interface Folder {
  /** Unique key; projects refer to it with `folder`. */
  id: string;
  /** Name shown in the tree. */
  name: string;
  /** Id of a <symbol> in the SVG sprite in index.html. Defaults to the plain folder icon. */
  icon?: string;
}

/** A project in the tree and its details in the project card. */
interface Project {
  /** Unique key. */
  id: string;
  /** `id` of the folder it lives in. */
  folder: string;
  name: string;
  /** Short line shown after the name in the tree. */
  tagline?: string;
  /** Longer text shown in the project card. */
  description: string;
  /** Link to the running application. */
  demo?: string;
  /** Link to the repository. */
  github?: string;
  /** Small label beside the title in the card, e.g. "Byggt med AI-stöd". */
  note?: string;
}

/** Everything in data/projects.js. */
interface SiteData {
  folders: Folder[];
  projects: Project[];
}

interface SiteNamespace {
  /** The project data (data/projects.js). */
  data: SiteData;
  /** Builds the directory tree and the status bar counters (js/tree.js). */
  initTree(): void;
  /** Shows project details when a project is selected (js/project-card.js). */
  initProjectCard(): void;
  /** Wandering light behind the hero (js/light.js). */
  initLight(): void;
}

interface Window {
  /** Filled in piece by piece as each script loads, hence `Partial`. */
  Site?: Partial<SiteNamespace>;
}

/** Available once all scripts have loaded, i.e. when main.js runs. */
declare const Site: SiteNamespace;
