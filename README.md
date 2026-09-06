<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    plurid'
</h1>


<h3 align="center">
    a 3D spatial engine for the web — planes are pages
</h3>



A **plane** is a piece of content: a page, a note, a fragment, any React component. The **space** is a
CSS-3D scene the planes float in, which you orbit, pan and zoom. A plane can **link** to another; following
the link opens the target as a new plane *behind* the first one and swings the camera to it, so what you came
from stays in view instead of being replaced.

`plurid'` is an **engine**, not an app. The host decides what the space is for; the engine gives it a layered
[control surface](./docs/CONTROL_SURFACE.md): one configuration object for the common case, a pub/sub bus to
drive and observe it, typed hooks and a handle for the host's own code, and `onReady(api)` down to the store
when nothing else fits. Planes are real DOM under CSS 3D transforms, so content stays selectable, accessible
and styleable; there is no WebGL and no canvas.



### Contents

+ [A site first](#a-site-first)
+ [A space](#a-space)
+ [The model](#the-model)
+ [Documentation](#documentation)
+ [Packages](#packages)
+ [Develop](#develop)
+ [License](#license)



## A site first

The engine can look like an ordinary site until the reader asks for more. In the **page presentation** every
plane is the size of the view and the camera is *docked* on the first one: face-on, at scale one, filling the
view to the pixel. It scrolls like a page, the engine's chrome stays out of the picture, and a small rail at
the corner is the only sign of the space behind it.

``` bash
npm install @plurid/plurid-react react react-dom
```

``` tsx
import React from 'react';
import { PluridApplication, PluridLink, PluridReactPlane, definePluridConfiguration } from '@plurid/plurid-react';

const Home = () => (
    <article>
        <h1>An ordinary page</h1>
        <p>Scroll it, select its text, tab through it. <PluridLink route="/about">About →</PluridLink></p>
    </article>
);
const About = () => <article><h1>About</h1></article>;

const planes: PluridReactPlane[] = [
    { route: '/', component: Home },
    { route: '/about', component: About },
];

const configuration = definePluridConfiguration({ presentation: 'page' });

export const App = () => (
    <PluridApplication planes={planes} view={['/']} configuration={configuration} />
);
```

Follow the link and the about page opens behind the site, the camera swinging to it: a page again. Press
**G**, pinch, or click the rail's cube and the page pulls back and tilts into the space it was always in; the
back chevron or **Escape** brings a page back. There is no mode flag anywhere: the pose of the camera is the
whole state, and every door into the space is a configuration knob (`docking`).



## A space

Without the presentation the same engine is a space of planes arranged by a layout:

``` tsx
const planes: PluridReactPlane[] = [
    { route: '/one',   component: () => <div style={page}>Plane one</div> },
    { route: '/two',   component: () => <div style={page}>Plane two</div> },
    { route: '/three', component: () => <div style={page}>Plane three</div> },
];
const page = { padding: 24, height: '100%', background: '#0d0f12', color: '#cfe6ff' } as const;

export const App = () => <PluridApplication planes={planes} view={['/one', '/two', '/three']} />;
```

Drag the empty space to orbit, scroll to zoom, right-drag to pan, hold **Space** to grab from anywhere.
Over a plane a drag is the page's (text selection, scrolling) unless you grab. Undo and the shortcuts are on by
default; persistence, collaboration, culling, snapping and the rest are opt-in, and every one of them, gestures,
layouts and the chrome included, is a documented knob (`docs/CONTROL_SURFACE.md`).



## The model

| Concept | What it is |
|---|---|
| **Plane** | A unit of content addressed by a `route`: real DOM on a 3D-positioned sheet. |
| **Space** | The scene that holds the planes: orbit, pan, zoom, fly. |
| **View** | The routes shown at the start; the layout arranges them. |
| **Link** | A connection between planes; following it spawns the target behind its parent, joined by a bridge. |
| **Camera** | One value: yaw, pitch, scale, pivot, offset. Docked on a page or free in the space. |
| **Viewpoint** | The camera encoded as a short string, for share links, saved views and tours. |
| **Universe · Cluster** | Higher groupings of spaces, for multi-space arrangements. |
| **Look** | The chrome's design tokens: twelve presets derived from a few colours, overridable from CSS, replaceable piece by piece. |



## Documentation

| Read | For |
|---|---|
| [`docs/GETTING_STARTED.md`](./docs/GETTING_STARTED.md) | Use the engine: a site first, a space, planes, links, configuration, persistence, the viewpoint. |
| [`docs/CONTROL_SURFACE.md`](./docs/CONTROL_SURFACE.md) | Every knob and seam with a snippet, tiered from the escape hatch to the granular options. |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | How it works: the packages, the render pipeline, the camera and state model, docking, the pub/sub wire, SSR. |
| [`docs/SHORTCUTS.md`](./docs/SHORTCUTS.md) · [`docs/HARNESS.md`](./docs/HARNESS.md) · [`docs/LOOKS.md`](./docs/LOOKS.md) | Generated from the data tables: every key and gesture; every flag and fixture of the harness; every look and token. |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | The chrome's vocabulary (pill, panel, line) and its rules; what a new piece of chrome must do. |
| [`examples/`](./examples) | Runnable references: [`minimal`](./examples/minimal), [`control-surface`](./examples/control-surface) and [`custom-chrome`](./examples/custom-chrome). |
| [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) | Work on the engine: the layout, the gates, the harness, the traps. |
| [`docs/CONTEXT-MAP.md`](./docs/CONTEXT-MAP.md) | Which packages are live, legacy or archived, and which gates cover each. |
| [`docs/README.md`](./docs/README.md) | The document map and its authority order; the roadmaps and the audit live there too. |



## Packages

```
plurid-data ──► plurid-engine ──► plurid-react ──► (your app)
  (types,        (plane tree,      (render adapter,
   constants)     layout, routing,   controls, links)
                  camera math)     └► plurid-react-server (SSR / static stills)
                                        └► plurid-kit (plurid.config.ts + CLI + bootstraps)
plurid-pubsub ──────────────────────► (host ↔ engine event bridge)
```

| Package | Role |
|---|---|
| [`@plurid/plurid-data`](./packages/plurid-web/plurid-core/plurid-data) | Shared types, constants, defaults, the data tables. |
| [`@plurid/plurid-engine`](./packages/plurid-web/plurid-core/plurid-engine) | The plane tree, layouts, routing, the camera and docking math. Framework-agnostic. |
| [`@plurid/plurid-pubsub`](./packages/plurid-web/plurid-core/plurid-pubsub) | The publish/subscribe bus. |
| [`@plurid/plurid-react`](./packages/plurid-web/plurid-works/plurid-react) | The React adapter: the application, the planes, the links, the chrome, the hooks, and a `testing` entry for the host's own suites. |
| [`@plurid/plurid-react-server`](./packages/plurid-web/plurid-works/plurid-react-server) | Server rendering and static "stills" for the React adapter. |
| [`@plurid/plurid-kit`](./packages/plurid-web/plurid-works/plurid-kit) | The framework layer: `plurid.config.ts`, the `plurid` CLI, client and server bootstraps. In build-out, unpublished ([`docs/FRAMEWORK_PLAN.md`](./docs/FRAMEWORK_PLAN.md)). |
| `@plurid/plurid-{themes,icons-react,ui-components-react,ui-state-react,functions,functions-react}` | Supporting utilities. |
| [`@plurid/generate-plurid-app`](./packages/plurid-utilities/generate-plurid-app) | The scaffolding CLI. |

React 19 · TypeScript 6 · Node 22 or later. Legacy and experimental packages are listed in
[`docs/CONTEXT-MAP.md`](./docs/CONTEXT-MAP.md).



## Develop

A **pnpm workspace**. One command runs every gate in order:

``` bash
pnpm install
pnpm verify        # build → type-check → unit tests → lint → module check → docs tables → browser suite → smoke pack
```

The gates one at a time:

``` bash
pnpm build         # every package (tsup: ESM + CJS + d.ts)
pnpm check         # tsc --noEmit in every package
pnpm test          # jest across the workspace
pnpm lint          # one flat-config ESLint pass
pnpm e2e           # the browser suite: Playwright against the harness, plus the visual baselines
pnpm docs.tables   # regenerate docs/SHORTCUTS.md, docs/HARNESS.md and docs/LOOKS.md from the data tables
```

The harness at `fixtures/render-test` is the engine running for real: a catalog of fixtures, every option a
query flag, a setup panel that edits the URL, and the scenes the browser suite and the visual baselines are
taken from.

``` bash
pnpm --filter plurid-render-test dev       # Vite on http://localhost:5273 — try ?presentation=page&pages=1
```

The workflow, the build order and the traps are in [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md).



## License

[`DEL`](./LICENSE) ([delicense](https://github.com/ly3xqhl8g9/delicense)) · versioning with
[αver](https://github.com/ly3xqhl8g9/alpha-versioning) · [Codeophon](https://github.com/ly3xqhl8g9/codeophon).
