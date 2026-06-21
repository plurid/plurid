<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-react-server">
        <img src="https://img.shields.io/npm/v/@plurid/plurid-react-server.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
    </a>
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    plurid' Server <i>for</i> React
</h1>


Server-side rendering for [plurid'](https://github.com/plurid/plurid) — render a plurid 3D space to HTML on
the server (faster first paint, crawlable markup), with an optional **static "stills"** pipeline for
pre-rendering routes ahead of time.


## Install

`@plurid/plurid-react-server` is normally scaffolded by
[`@plurid/generate-plurid-app`](https://github.com/plurid/plurid/tree/master/packages/plurid-utilities/generate-plurid-app)
(server templates). The two runnable references are
[`fixtures/plurid-react-typescript-server`](https://github.com/plurid/plurid/tree/master/fixtures) and its
JavaScript twin.

``` bash
npm install @plurid/plurid-react-server
```


## Server-side rendering

`PluridServer` is an Express server: it matches the request route, computes the plurid metastate via
`@plurid/plurid-react`'s `serverComputeMetastate`, renders the React tree to HTML (styled-components +
`react-helmet-async`), injects the metastate, and responds. Construct it with your routes / planes / helmet
/ services and `start(port)` — see the server fixtures for a complete setup.

``` ts
import PluridServer from '@plurid/plurid-react-server';

const server = new PluridServer({ routes, planes, preserves, helmet, /* … */ });
server.start(3000);
```


## Static stills (optional, Puppeteer)

A **still** is a route pre-rendered to static HTML ahead of time. When a still exists for a request, the
server sends it directly and skips on-the-fly rendering. Stills are entirely opt-in.

> **Puppeteer is an optional peer dependency** — only stills *generation* needs it; SSR does not. Install it
> where you generate stills:
> ``` bash
> npm install puppeteer
> ```

**Generating** stills (`PluridStillsGenerator`) — run it after building your server bundle:

``` ts
import { PluridStillsGenerator } from '@plurid/plurid-react-server';

// reads routes from the BUILT server (default ./build/server.js), spins it up on a free port,
// drives Puppeteer over each static (non-parameterized) route, and writes:
//   build/stills/<uuid>.json   (one per route)  +  build/stills/metadata.json  (the route → file index)
await new PluridStillsGenerator({ server: './build/server.js', build: './build/' }).initialize();
```

The order matters: **build the server first**, then run the generator (it `require()`s the built bundle and
fails with a clear message if it's missing). Parameterized routes (`/x/:id`) and `stiller.ignore` routes are
skipped. One headless browser is reused across all routes; a navigation failure aborts the run with the
underlying reason rather than writing partial output.

**Serving** stills — automatic: on startup `PluridServer` loads `build/stills/metadata.json` (the
`stillsDirectory` under `buildDirectory`) and serves a matching still before falling back to live SSR. Tune
generation via the server's `stiller` option (`waitUntil`, `timeout`, `ignore`).


## Documentation

Full engine docs: the repo [`README`](https://github.com/plurid/plurid),
[`GETTING_STARTED`](https://github.com/plurid/plurid/blob/master/GETTING_STARTED.md), and
[`CONTROL_SURFACE`](https://github.com/plurid/plurid/blob/master/docs/CONTROL_SURFACE.md).
