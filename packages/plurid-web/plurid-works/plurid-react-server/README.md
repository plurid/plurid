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
(server templates), which is the runnable reference — it generates an application, and `pnpm smoke.pack`
builds and serves one on every CI run.

(The `fixtures/plurid-react-*-server` directories are NOT references: they are pinned to versions from
the 0.0.0-3x era, are outside the workspace, and are neither built nor type-checked. Use the generator,
or `fixtures/render-test` for the client side.)

``` bash
npm install @plurid/plurid-react-server
```


## Server-side rendering

`PluridServer` is an Express server: it matches the request route, renders the React tree to HTML
(styled-components), assembles the document head from the DOCUMENT MODEL, injects the metastate marker (the
browser's sign that the page was server-rendered), and responds. A `document` hook also receives the computed
engine state (`@plurid/plurid-react`'s `serverComputeMetastate`), computed only when there is a hook. Construct it with your routes /
planes / services and `start(port)` — the application `@plurid/generate-plurid-app` writes (through `@plurid/plurid-kit`) is the
complete setup.

``` ts
import PluridServer from '@plurid/plurid-react-server';

const server = new PluridServer({ routes, planes, preserves, /* … */ });
await server.start(3000);   // resolves once listening; rejects on EADDRINUSE; a second call is the same start
// …
await server.stop();        // answers the requests in flight, then closes (cut after `options.stopTimeout`, 5 s)
```

With `options.attachSignalHandlers` (the default) SIGINT / SIGTERM stop the server the same way and exit `0` once
it has closed. The host's own routes go through `handle().get / post / put / patch / delete(path, …handlers)` or
the `handlers: (server) => …` configuration hook, both ahead of the page's catch-all `GET` (a `GET` added through
`instance()` after construction is behind it and never answers). An error that reaches Express — a malformed JSON
body, a throwing middleware — answers with its status and a generic body, never a stack. `template.errorHtml` and
`template.notFoundHtml` replace the built-in 500 and 404 pages.

`globals` from a preserve are written into an inline script as `window.<name> = <value>;`: the value is JavaScript
source (by convention `JSON.stringify(state)`), written with `<` escaped, so a `</script>` in the data cannot close
the script; a name that is not a JavaScript identifier fails the request.

### The document head

The head is data, not a head-manager library: a `PluridDocument` (`title`, `titleTemplate`, `description`,
`canonical`, `meta`, `links`, `styles`, `scripts`, `jsonLd`, `lang`, `htmlAttributes`, `bodyAttributes`, …)
merged from layers, lowest first:

1. `template.head` (+ `template.favicon` / `manifest` / `htmlLanguage`) — the static defaults;
2. the matched route's `head` (`routes[].head`, static or `(context) => document`, async allowed on the server) and
   the shown planes' `head` (`planes[].head`);
3. in-render declarations — `<PluridDocument title="…"><meta … /></PluridDocument>` or `usePluridDocument({ … })`
   from `@plurid/plurid-react`, anywhere in a plane (the deepest one wins);
4. the preserve's `document` (per request);
5. the `document` hook — `document: ({ request, match, metastate, document, preserve }) => PluridDocument`, the
   post-render layer (also the seam for a head library you keep running inside `services`).

Exactly one `<title>` is written; `<meta>`, `<link>`, scripts and JSON-LD deduplicate by key. The client claims the
same tags at hydration. `render: 'suspense'` renders through a buffered `renderToPipeableStream` that waits for
every boundary (`use()` inside a plane) — one document, no streaming. The former `helmet` option is ignored with a
warning; `react-helmet-async` is no longer a dependency.


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

The order matters: **build the server first**, then run the generator (it loads the built bundle — from this
package's ESM build as from its CommonJS one — and fails with a clear message if it is missing, or does not export
its `PluridServer`). Puppeteer is checked before the server is forked; "not installed" and "installed but could not
be loaded" are reported apart. The forked server keeps the generator's environment (`PATH`, `NODE_ENV`, secrets) and
is waited for until it answers. Parameterized routes (`/x/:id`) and `stiller.ignore` routes are skipped. One headless
browser is reused across all routes; a navigation failure — or a page the server answered with an error status, which
would otherwise be served as a 200 still — aborts the run with the underlying reason rather than writing partial output.

**Serving** stills — automatic: on startup `PluridServer` loads `build/stills/metadata.json` (the
`stillsDirectory` under `buildDirectory`) and serves a matching still before falling back to live SSR. Tune
generation via the server's `stiller` option (`waitUntil`, `timeout`, `ignore`).


## Documentation

Full engine docs: the repo [`README`](https://github.com/plurid/plurid),
[`GETTING_STARTED`](https://github.com/plurid/plurid/blob/master/docs/GETTING_STARTED.md), and
[`CONTROL_SURFACE`](https://github.com/plurid/plurid/blob/master/docs/CONTROL_SURFACE.md).
