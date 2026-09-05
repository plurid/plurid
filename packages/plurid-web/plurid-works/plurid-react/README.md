<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-react">
        <img src="https://img.shields.io/npm/v/@plurid/plurid-react.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
    </a>
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    plurid' <i>for</i> React
</h1>


The **React** render adapter for [plurid'](https://github.com/plurid/plurid) — render content as **planes**
in a navigable **3D space**. A plane is a component; the space is a CSS-3D scene you orbit, pan, and zoom.



# Install

The quickest way to a batteries-included app is the scaffolder:

``` bash
npx @plurid/generate-plurid-app
```

To add plurid' to an existing **React 19** app, install the adapter and the three libraries it shares
with your app (everything else — the engine, the data package, the UI kit, redux — comes along as a
dependency, never as a peer you declare):

``` bash
npm install @plurid/plurid-react react react-dom styled-components
```

For a TypeScript project, add the dev types:

``` bash
npm install -D \
    @types/react \
    @types/react-dom
```

> `react` / `react-dom` must be **≥ 19**, `styled-components` ≥ 6. The engine's redux store is private to
> it (a store of your own never collides). `@plurid/elementql-client-react` is an optional peer, needed only by
> `PluridExternalPlane`. (Gestures use native Pointer Events — there is no `hammerjs` dependency.)



# Usage

A plane is a `route` + a `component`; the `view` is which routes to show first.

``` tsx
import React from 'react';
import {
    PluridApplication,
    PluridReactPlane,
} from '@plurid/plurid-react';


const planes: PluridReactPlane[] = [
    { route: '/',     component: () => <div>Home plane</div> },
    { route: '/about', component: () => <div>About plane</div>, width: 480, height: 300 }, // its own size in px (optional)
];

const view = ['/', '/about'];


const Application: React.FC = () => (
    <PluridApplication
        planes={planes}
        view={view}
    />
);


export default Application;
```

Drag to orbit, scroll to zoom, hold **G** to grab-pan.



# Going further

- **[Getting started](https://github.com/plurid/plurid/blob/master/GETTING_STARTED.md)** — planes, views,
  links, configuration, persistence, the control surface.
- **[Control surface](https://github.com/plurid/plurid/blob/master/docs/CONTROL_SURFACE.md)** — `onReady`,
  pub/sub control & observe topics, `storageAdapter`, gestures, shortcuts, UI render-slots.
- **[Examples](https://github.com/plurid/plurid/tree/master/examples)** — a minimal hello-world and a
  full control-surface reference.
