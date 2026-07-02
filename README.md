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



`plurid'` renders pieces of content as **planes** floating in a navigable **3D space**. A plane is just a
component (a page, a note, a fragment); the space is a CSS-3D scene you can orbit, pan, zoom, and fly
through. Planes can **link** to one another — following a link spawns the target as a new plane in the same
space, so the connections between ideas stay visible instead of replacing what you were looking at.

It is a transparent **engine**, not an app: it facilitates spatial navigation and arrangement, and the host
developer decides what the app is *for*. Everything the engine does is reachable from the host through a
layered [control surface](./docs/CONTROL_SURFACE.md) — config knobs for the common case, a pub/sub bus to
drive and observe it, and a single `onReady` escape hatch to the raw store when you need it.

Built on **CSS 3D transforms** (`perspective` + `preserve-3d` + `matrix3d`), **React 19**, and **Redux
Toolkit** — no WebGL, no canvas. Planes are real DOM, so your content stays selectable, accessible, and
styleable.

> **Status (2026-07).** Actively developed. The engine builds, type-checks, tests, and lints green, and
> renders + 3D-navigates on **React 19 · TypeScript 6.0 · Node 22+** (CI on Node 24). The reference
> integration harness is `fixtures/render-test`.



### Contents

+ [Quickstart](#quickstart)
+ [The model](#the-model)
+ [Documentation](#documentation)
+ [Packages](#packages)
+ [Develop](#develop)
+ [License](#license)



## Quickstart

Install the React adapter and its `@plurid/*` peers (see
[`GETTING_STARTED.md`](./GETTING_STARTED.md) for the full list):

``` bash
npm install @plurid/plurid-react react react-dom
```

Render three planes into a space:

``` tsx
import React from 'react';
import { PluridApplication, PluridReactPlane } from '@plurid/plurid-react';

const planes: PluridReactPlane[] = [
    { route: '/one',   component: () => <div style={page}>Plane one</div> },
    { route: '/two',   component: () => <div style={page}>Plane two</div> },
    { route: '/three', component: () => <div style={page}>Plane three</div> },
];

const view = ['/one', '/two', '/three'];

const page = { padding: 24, height: '100%', background: '#0d0f12', color: '#cfe6ff' } as const;

const App = () => <PluridApplication planes={planes} view={view} />;

export default App;
```

Drag to orbit, scroll to zoom, hold **G** to grab-pan. That's the whole engine — everything else is
opt-in. The step-by-step walkthrough (planes, views, configuration, the control surface) lives in
**[`GETTING_STARTED.md`](./GETTING_STARTED.md)**.



## The model

| Concept | What it is |
|---|---|
| **Plane** | A unit of content (a component) addressed by a `route`. Real DOM on a 3D-positioned surface. |
| **Space** | The 3D scene that holds planes. Transformable: orbit / pan / zoom / fly. |
| **View** | The list of plane routes shown initially — the starting arrangement. |
| **Link** | A connection from one plane to another; following it spawns the target plane in the same space. |
| **Universe / Cluster** | Higher groupings of spaces, for multi-space arrangements. |
| **Viewpoint** | The camera state, encodable to/from a short string for share links, saved views, and tours. |

The host stays in control: undo/redo, persistence, gestures, shortcuts, and chrome are all configurable or
replaceable, and `onReady(api)` hands you the Redux store + pub/sub bus for anything the declarative surface
doesn't cover. See **[`docs/CONTROL_SURFACE.md`](./docs/CONTROL_SURFACE.md)**.



## Documentation

| Doc | For |
|---|---|
| **[`GETTING_STARTED.md`](./GETTING_STARTED.md)** | Install → render → configure → control. Start here to *use* the engine. |
| **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** | How the engine actually works - package layers, render pipeline, camera/state model, the pubsub wire catalog, SSR, consumption modes + the hack-to-seam replacement map. |
| **[`docs/CONTROL_SURFACE.md`](./docs/CONTROL_SURFACE.md)** | The developer-control surface — `onReady`, pub/sub control & observe topics, config, storage adapter, gestures, shortcuts, UI slots. |
| **[`examples/`](./examples)** | Runnable references: [`minimal`](./examples/minimal) (hello-world) and [`control-surface`](./examples/control-surface) (every seam in one component). |
| **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** | Monorepo layout, build/test/lint gates, the render-test harness, and how to add a config field / pub/sub topic / export. |
| **[`CONTEXT-MAP.md`](./CONTEXT-MAP.md)** | Package map & status — what's live vs. legacy/experimental, and which gates cover each package. |
| **[`docs/ENGINE_AUDIT_AND_ROADMAP.md`](./docs/ENGINE_AUDIT_AND_ROADMAP.md)** · **[`docs/ENGINE_FEATURE_ROADMAP.md`](./docs/ENGINE_FEATURE_ROADMAP.md)** · **[`docs/FRAMEWORK_PLAN.md`](./docs/FRAMEWORK_PLAN.md)** · **[`docs/CODEBASE_DEEP_CRITIQUE.md`](./docs/CODEBASE_DEEP_CRITIQUE.md)** | Engine-deep audit, the feature roadmap (with progress), the plurid-kit framework plan, and the repo-wide critique (historical snapshot). |



## Packages

The live graph (full status in [`CONTEXT-MAP.md`](./CONTEXT-MAP.md)):

```
plurid-data ──► plurid-engine ──► plurid-react ──► (your app)
  (types,        (plane tree,      (render adapter,
   constants)     layout, routing,   controls, links)
                  3D math)         └► plurid-react-server (SSR / static stills)
                                        └► plurid-kit (plurid.config.ts + CLI + bootstraps)
plurid-pubsub ──────────────────────► (host ↔ engine event bridge)
```

| Package | Role |
|---|---|
| [`@plurid/plurid-data`](./packages/plurid-web/plurid-core/plurid-data) | Shared types, constants, enumerations. |
| [`@plurid/plurid-engine`](./packages/plurid-web/plurid-core/plurid-engine) | Plane tree, layout, routing, 3D math. Framework-agnostic core. |
| [`@plurid/plurid-pubsub`](./packages/plurid-web/plurid-core/plurid-pubsub) | The publish/subscribe message bus. |
| [`@plurid/plurid-react`](./packages/plurid-web/plurid-works/plurid-react) | The primary render adapter (React). |
| [`@plurid/plurid-react-server`](./packages/plurid-web/plurid-works/plurid-react-server) | SSR / static "stills" for the React adapter. |
| [`@plurid/plurid-kit`](./packages/plurid-web/plurid-works/plurid-kit) | Framework layer: `plurid.config.ts` + the `plurid` CLI + client/server bootstraps over plurid-react-server. In build-out, unpublished - see [`docs/FRAMEWORK_PLAN.md`](./docs/FRAMEWORK_PLAN.md). |
| `@plurid/plurid-{themes,icons-react,ui-components-react,ui-state-react,functions,functions-react}` | Supporting utilities. |
| [`@plurid/generate-plurid-app`](./packages/plurid-utilities/generate-plurid-app) | Scaffolding CLI (templates to be reworked to the kit shape - FRAMEWORK_PLAN P5). |

Legacy/experimental (canvas + html adapters, native prototype, browser extension) and fixtures are listed
in [`CONTEXT-MAP.md`](./CONTEXT-MAP.md).



## Develop

This repository is a **pnpm workspace** (pnpm 11, Node ≥ 22). From the root:

``` bash
pnpm install          # link the workspace
pnpm build            # build every package (tsup: ESM + CJS + d.ts)
pnpm test             # jest across the workspace
pnpm lint             # one flat-config ESLint pass
pnpm --filter @plurid/plurid-react check   # tsc type-check (build does NOT type-check)
```

Run the engine in a live browser harness:

``` bash
pnpm --filter plurid-render-test dev       # Vite — prints the local URL (port 5273)
```

`fixtures/render-test` is the engine's "always rendering" gate — a CAD-style multi-plane scene used to
verify rendering + interaction after any change. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full
workflow.



## License

[`DEL`](./LICENSE) ([delicense](https://github.com/ly3xqhl8g9/delicense)) · versioning with
[αver](https://github.com/ly3xqhl8g9/alpha-versioning) · [Codeophon](https://github.com/ly3xqhl8g9/codeophon).
