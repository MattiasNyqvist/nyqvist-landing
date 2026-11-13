# nyqvist.net – personal site

A static site: plain HTML, CSS and vanilla JavaScript. No build step, no dependencies, no framework.
Visible text is Swedish; code, comments and documentation are English.

Open `index.html` directly in a browser, or serve the folder (e.g. `python3 -m http.server`).

## Structure

```
index.html              Start page: sidebar, hero (headline, intro, file manager) and footer
data/
  projects.js           The project data (folders and projects) – edit this to add a project
favicon.svg
css/
  tokens.css            Design tokens: fonts, colours, spacing (loaded first)
  base.css              Reset, page shell, utility classes, page backdrop
  sidebar.css           Logo, main menu, social links (left rail; top bar on mobile)
  hero.css              Headline, intro line, avatar, site name, grid and light effects
  file-manager.css      The glass panel with the directory tree
  project-card.css      Details of the selected project, buttons
  site-footer.css       Footer
js/
  main.js               Entry point – calls the init functions below
  tree.js               Builds the directory tree and status bar counters from the data
  project-card.js       Shows the details of the selected project
  light.js              Slowly wandering light patches behind the hero
  globals.d.ts          Types for `Site`, the data and its folders/projects (editor / tsc only)
fonts/                  Selawik (SIL OFL), a Segoe UI-compatible typeface, self-hosted as woff2
img/
  profile/avatar.webp   The round photo shown on the page
  profile/portrait.webp Original portrait cut-out – the source avatar.webp was made from (not used by the page)
  brand/logo.svg        Logo source (the logo is also inlined in the sidebar markup)
jsconfig.json           Lets the editor / tsc type-check js/ (see "Type checking")
```

## How it fits together

**Page load.** `index.html` loads the stylesheets in dependency order (tokens → base → components), then the
scripts with `defer`, `main.js` last. Deferred scripts run in order once the DOM is ready.

**JavaScript.** There are no ES modules (browsers block them on `file://`). Instead each script is an IIFE that
registers what it provides on a shared object, `window.Site`, and `main.js` starts the features:

```
data/projects.js  →  Site.data              (folders and projects)
tree.js           →  Site.initTree()         builds the tree from Site.data
project-card.js   →  Site.initProjectCard()  shows details when a project row is clicked
light.js          →  Site.initLight()        wandering light behind the hero
main.js           →  calls the three init functions, in that order
```

`js/globals.d.ts` describes `Site` and the shape of the data (`Folder`, `Project`). A new feature = a new file in
`js/` + a `<script defer>` tag before `main.js` + one line in `main.js` + one line in `globals.d.ts`. Scripts find their
elements with CSS selectors that live in a `SELECTORS` constant at the top of the file.

**Data.** The projects live in `data/projects.js`, not in the HTML. It is a `.js` file with JSON-shaped data rather
than a real `.json` file, because browsers refuse to read local `.json` files when a page is opened from disk.
The directory tree is built by script, so it is empty without JavaScript (a deliberate choice).

**CSS.** All colours, the typeface and the main spacing are custom properties in `css/tokens.css`. Responsive
rules sit at the bottom of the file they belong to, with three breakpoints:
`>=1000px` two-column hero | `<=999px` stacked | `<=899px` mobile (the sidebar becomes a top bar).
Class names are descriptive and hyphenated; variants use a double hyphen (`.tree-row--project`, `.button--primary`).

**Stacking inside the hero** (`.hero` creates its own stacking context, so these never leak out):

| z-index | Layer |
|--------:|-------|
| -3 | technical grid (`.hero::before`) |
| -1 | fixed spotlight (`.hero-intro::before`) and the wandering light patches (`.light-patch`) |
| auto | headline, intro, avatar, file manager panel |
| 3 | site name in the top-right corner |

The sidebar is `fixed` above everything (z-index 30).

## Common tasks

**Add a project.** Add an object to `projects` in `data/projects.js`:

```js
{
  id: 'my-project',                 // unique
  folder: 'typescript',             // the id of a folder in the same file
  name: 'My Project',
  tagline: 'Short line in the tree.',      // optional
  description: 'Longer text shown in the project card.',
  demo: 'https://…',                // optional
  github: 'https://…',              // optional
  note: 'Byggt med AI-stöd',        // optional, a small label beside the title in the card
}
```

The tree, the status bar counters and the card follow automatically. Rule of thumb for the folder: *if AI is the
product, it goes under AI; otherwise under the language it is built in.*

**Add a folder or icon.** Folders are entries in `folders` in `data/projects.js`. Their `icon` is the id of a `<symbol>` in
the inline SVG sprite at the top of `index.html` (inline so the page also works from `file://`). Set `SHOW_EMPTY_FOLDERS`
to `false` at the top of `js/tree.js` to hide folders that have no projects yet.

**Change the look.** Colours, font and spacing: `css/tokens.css`. The technical grid and its bright point
(`--grid-x` / `--grid-y`): `.hero::before` in `css/hero.css`. The fixed spotlight behind "25 år i IT":
`.hero-intro::before`.

**Tune the light effect.** `CONFIG` at the top of `js/light.js` (number and size of patches, speed, how often they go
dark, where they may roam). Remove `Site.initLight();` from `main.js` to switch it off.

## Type checking

The JavaScript is annotated with JSDoc and can be checked as if it were TypeScript, without any build step:

```
npx -p typescript tsc -p jsconfig.json
```

VS Code also shows the same errors in the editor, because of `jsconfig.json`.

## Accessibility

Visible focus styles, keyboard-operable tree and project card (Escape closes the card), decorative layers are
`aria-hidden`, and everything that moves respects `prefers-reduced-motion`.
