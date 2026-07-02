# Getting started with plurid'

This walks you from an empty React app to a configured, host-controlled 3D space. It covers **using** the
engine; if you want to *work on* the engine itself, read [`CONTRIBUTING.md`](./CONTRIBUTING.md).

- [Prerequisites](#prerequisites)
- [Install](#install)
- [1 · Your first space](#1--your-first-space)
- [2 · Planes & views](#2--planes--views)
- [3 · Links — planes are pages](#3--links--planes-are-pages)
- [4 · Configuration](#4--configuration)
- [5 · Persistence](#5--persistence)
- [6 · The control surface](#6--the-control-surface)
- [7 · The viewpoint (share links & saved views)](#7--the-viewpoint-share-links--saved-views)
- [Where to go next](#where-to-go-next)



## Prerequisites

- **React 19** and **react-dom 19** (the engine renders with the React 19 runtime).
- A bundler that handles ESM + TypeScript (Vite, Next, etc.). `@plurid/plurid-react` ships ESM + CJS + `.d.ts`.



## Install

The adapter declares its `@plurid/*` siblings and a few libraries as **peer dependencies**, so install them
alongside it:

``` bash
npm install \
    @plurid/plurid-react \
    @plurid/plurid-data \
    @plurid/plurid-engine \
    @plurid/plurid-pubsub \
    @plurid/plurid-functions \
    @plurid/plurid-functions-react \
    @plurid/plurid-icons-react \
    @plurid/plurid-themes \
    @plurid/plurid-ui-components-react \
    @plurid/plurid-ui-state-react \
    @plurid/elementql \
    @plurid/elementql-client-react \
    @reduxjs/toolkit \
    react-redux \
    react \
    react-dom \
    styled-components \
    cross-fetch
```

> **Prefer scaffolding?** `npx @plurid/generate-plurid-app` produces a batteries-included starter. The
> manual route above is the precise dependency set if you're adding plurid' to an existing app.



## 1 · Your first space

A plane is a `route` + a `component`. A view is the list of routes to show first. That's the minimum:

``` tsx
import React from 'react';
import { PluridApplication, PluridReactPlane } from '@plurid/plurid-react';

const page = { padding: 24, height: '100%', background: '#0d0f12', color: '#cfe6ff' } as const;

const planes: PluridReactPlane[] = [
    { route: '/one',   component: () => <div style={page}>Plane one</div> },
    { route: '/two',   component: () => <div style={page}>Plane two</div> },
    { route: '/three', component: () => <div style={page}>Plane three</div> },
];

const App = () => (
    <PluridApplication
        planes={planes}
        view={['/one', '/two', '/three']}
    />
);

export default App;
```

Mount `<App />` as usual. You get a navigable space:

- **Drag** to orbit the camera.
- **Scroll / pinch** to zoom.
- Hold **G** then drag to grab-pan; press **?** for the shortcuts overlay.

Planes are real DOM — text stays selectable, content stays accessible and styleable.

> This is `examples/minimal`. The advanced counterpart, exercising every control seam, is
> `examples/control-surface`.



## 2 · Planes & views

**A plane** is `{ route: string, component: React.ComponentType }` (the `PluridReactPlane` type). The
`route` is the plane's address — it's how links target it and how `view` references it. The component is
rendered onto the plane surface and owns its own content, state, and styling.

**The view** (`view`, required) is the initial arrangement: the routes to lay out on first render. Pass a
flat list of routes for a single space, e.g. `['/one', '/two']`. (`view` also accepts nested `PluridView`
structures for multi-space universes — see `PluridApplicationView`.)

Useful related props:

| Prop | Purpose |
|---|---|
| `id` | Distinguishes multiple plurid apps on the same origin (also the persistence key). |
| `centerView` | Center the camera on one route from `view` at startup. |
| `planeNotFound` / `planeRenderError` | `true` (default) shows the built-in fallback, or pass your own component. |
| `customPlane` | Replace the internal plane wrapper entirely. |



## 3 · Links — planes are pages

Following a link spawns the target plane **in the same space** instead of navigating away, so the trail of
related content stays visible. Render a `PluridLink` inside a plane's component:

``` tsx
import { PluridLink } from '@plurid/plurid-react';

const Intro = () => (
    <div style={page}>
        <h3>Intro</h3>
        <PluridLink route="/details">open details →</PluridLink>
    </div>
);
```

Clicking it adds `/details` as a new plane, linked to its parent (the link is drawn in 3D, and shows up in
the backlinks). The spawned arrangement is part of the engine state — so it's covered by undo/redo,
persistence, and the viewpoint.



## 4 · Configuration

Pass a `configuration` object. The ergonomic way to build one is the **flat preset**,
`definePluridConfiguration`, which exposes every knob as a single flat key (no nested config object needed)
and fills in defaults:

``` tsx
import {
    PluridApplication,
    definePluridConfiguration,
    SPACE_LAYOUT,
} from '@plurid/plurid-react';

const configuration = definePluridConfiguration({
    theme: 'plurid',
    layout: { type: SPACE_LAYOUT.COLUMNS, columns: 3, gap: 0.06 },

    // opt out of always-on behavior
    undo: true,                 // set false to drop the history middleware entirely
    timings: { persistDebounce: 500, viewpointChangeDebounce: 250 },

    // tune interaction
    gestures: { rotateSensitivity: 0.25, buttonMap: { left: 'orbit', wheel: 'disabled' } },

    // own a keybinding; leave the rest default
    shortcuts: {
        onUnhandledKey: (event) => {
            if ((event.metaKey || event.ctrlKey) && event.code === 'KeyK') {
                event.preventDefault();
                // openYourCommandPalette();
            }
        },
    },
});

const App = () => (
    <PluridApplication planes={planes} view={view} configuration={configuration} />
);
```

Configuration groups (all optional):

| Group | Controls |
|---|---|
| `theme`, `layout` | Visual theme and how planes are arranged (columns / rows / faces / …). |
| `undo` | Whether spatial undo/redo runs at all (`true` by default). |
| `timings` | Debounces and animation durations (persist, viewpoint, resize, transform, fade-in, …). |
| `gestures` | Per-gesture sensitivities, drag threshold, momentum, and a `buttonMap` (left/middle/wheel → orbit \| pan \| zoom \| disabled). |
| `shortcuts` | `disabled` ids, a `keymap` to remap, and `onUnhandledKey`. |
| `elements` | `planeLinks.show` / `alignmentGuides.show` toggles for engine overlays. |

The full per-knob reference is **[`docs/CONTROL_SURFACE.md`](./docs/CONTROL_SURFACE.md)**.



## 5 · Persistence

Set `useLocalStorage` and the engine saves the **spatial state** (camera + plane tree) to `localStorage`,
keyed by `id`, and restores it on load (debounced, and flushed on `pagehide`):

``` tsx
<PluridApplication planes={planes} view={view} id="my-space" useLocalStorage />
```

Two extension points:

- **Your content** rides the same machinery via `onPersistContent` / `onRestoreContent` — return a
  JSON-serializable blob to store opaquely, receive it back once after mount. (Version your own shape; the
  engine versions only the spatial state.)
- **Where the bytes land** is swappable via `storageAdapter` — a Web-Storage-shaped
  `{ getItem, setItem, removeItem }`. Redirect *all* persistence to `sessionStorage`, an in-memory map, an
  encrypted wrapper, or a memory-mirrored IndexedDB. `useLocalStorage` still gates *whether* persistence
  runs; the adapter only changes *where*.

``` tsx
const sessionAdapter = {
    getItem: (k) => sessionStorage.getItem(k),
    setItem: (k, v) => sessionStorage.setItem(k, v),
    removeItem: (k) => sessionStorage.removeItem(k),
};

<PluridApplication planes={planes} view={view} id="my-space" useLocalStorage storageAdapter={sessionAdapter} />
```

> `getItem` is read synchronously to seed the first paint, so a purely-async backend (raw IndexedDB) can't
> hydrate the camera on first render — mirror it to memory, or restore asynchronously from `onReady`.



## 6 · The control surface

Plurid is transparent: the host drives and observes it. There are three layers, from most to least common.

**Config knobs** (section 4) cover the steady 90%.

**The pub/sub bus** drives and observes the engine without prop-drilling. Get the instance bus from
`onReady`, then:

``` tsx
import { PluridApplication, PLURID_PUBSUB_TOPIC } from '@plurid/plurid-react';

<PluridApplication
    planes={planes}
    view={view}
    onReady={(api) => {
        // CONTROL — drive the engine declaratively.
        api.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.FIT_TO_VIEW });

        // OBSERVE — one subscription for every state change, tagged by `kind`.
        api.pubsub.subscribe({
            topic: PLURID_PUBSUB_TOPIC.CHANGED, // 'space.changed'
            callback: ({ kind, value }) => {
                if (kind === 'selection') console.log('selected', value);
            },
        });
    }}
/>
```

Control topics cover the high-value declarative operations — fit-to-view, reset transform, undo/redo,
set-tree, selection (set / toggle / clear), set-viewpoint, and the rotate / translate / scale families;
niche operations go through the `onReady` store. The single `space.changed` observe topic fires for
selection / tree / links / active-plane / isolate / layout / loading changes. The full topic list is in
[`docs/CONTROL_SURFACE.md`](./docs/CONTROL_SURFACE.md).

**`onReady(api)` — the escape hatch.** When the declarative surface doesn't cover something, `api` hands you
the raw machinery:

``` ts
api.store         // the Redux store: getState / dispatch(any action) / subscribe
api.pubsub        // the pub/sub bus (above)
api.getSnapshot() // read the full engine state synchronously
api.getViewpoint()// read the encoded camera string synchronously
```

Action creators are exported as `pluridStateModules`, derived-state selectors as `pluridSelectors`, and the
structural hash undo/collaboration agree on as `arrangementSignature` — so you can build custom controls or
layout without forking. (The store's internal action/state *shapes* are the deliberate power-user seam, not
a stable API — prefer the topics + getters when they suffice.)

**Replace the chrome.** `renderToolbar`, `renderViewcube`, `renderMinimap`, and `renderShortcuts` each take
a render-slot that *substitutes* the corresponding engine overlay with your own element:

``` tsx
<PluridApplication
    planes={planes}
    view={view}
    renderToolbar={() => <MyToolbar />}
/>
```



## 7 · The viewpoint (share links & saved views)

The **viewpoint** is the camera state encoded as a short string. The engine never touches the URL — you
own that. Read it when it settles, and set it back, to build share links, saved views, or guided tours:

``` tsx
import { PluridApplication, encodeViewpoint, decodeViewpoint } from '@plurid/plurid-react';

<PluridApplication
    planes={planes}
    view={view}
    onViewpointChange={(viewpoint) => {
        // e.g. history.replaceState(null, '', `?v=${viewpoint}`)
    }}
/>
```

To restore a viewpoint, publish `space.setViewpoint` over the pub/sub bus (from `onReady`) with the stored
string. `encodeViewpoint` / `decodeViewpoint` are exported for full host control.



## Where to go next

- **[`examples/minimal`](./examples/minimal)** — the hello-world above, as a runnable file.
- **[`examples/control-surface`](./examples/control-surface)** — every seam in one small "spatial notes" component.
- **[`docs/CONTROL_SURFACE.md`](./docs/CONTROL_SURFACE.md)** — the full per-knob / per-topic reference.
- **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** - when you want to know how it works inside (render pipeline, camera/state model, pubsub protocol, consumption modes).
- **Server rendering + the batteries path** - [`@plurid/plurid-react-server`](./packages/plurid-web/plurid-works/plurid-react-server) (SSR/stills) and [`@plurid/plurid-kit`](./packages/plurid-web/plurid-works/plurid-kit) (`plurid.config.ts` + CLI; see [`docs/FRAMEWORK_PLAN.md`](./docs/FRAMEWORK_PLAN.md)).
- **[`CONTEXT-MAP.md`](./CONTEXT-MAP.md)** — which packages are live, and what each is for.
- **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** — to work on the engine itself.
