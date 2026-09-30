<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://www.npmjs.com/package/@plurid/plurid-kit">
        <img src="https://img.shields.io/npm/v/@plurid/plurid-kit.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
    </a>
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    plurid' Kit
</h1>


The framework layer for [plurid'](https://github.com/plurid/plurid) applications - a
`plurid.config.ts` contract, a CLI (`plurid dev | build | start | info`), and thin
client/server bootstraps over
[`@plurid/plurid-react-server`](https://github.com/plurid/plurid/tree/master/packages/plurid-web/plurid-works/plurid-react-server).
"Next.js for plurid": one config file replaces the per-application `new PluridServer({...})`
boilerplate (~145 lines), the provider-nesting `Client.tsx` (~85 lines), and the
webpack/rollup `scripts/workings/` build machinery.

Status: implemented (config contract, CLI, bootstraps) and published as a pre-release (`0.0.0-6`, the workspace's version); adoption is in progress. Plan of record:
[`docs/FRAMEWORK_PLAN.md`](https://github.com/plurid/plurid/blob/master/docs/FRAMEWORK_PLAN.md).


## The thin-app contract

A plurid-kit application is three files + a config:

```
plurid.config.ts            the single source of truth
source/
    server/index.ts         startPluridServer(config)
    client/index.tsx        createPluridClient(config)
    public/                 favicons, manifest, robots (served statically)
```

``` typescript
// plurid.config.ts
import { defineConfig, serverOnly } from '@plurid/plurid-kit';

import routes from './source/shared/routes';
import shell from './source/shared/shell';


export default defineConfig({
    serverName: 'denote',
    hostname: 'denote.plurid.com',

    routes,
    shell,

    services: [
        // { name: 'Apollo', Provider, properties, client, order }
    ],

    // SERVER-ONLY fields may be thunks so their modules never
    // enter the client bundle:
    // preserves: () => import('./source/server/preserves'),
    // `document` and `handlers` are functions themselves: a bare function IS the
    // hook, a lazy import is marked
    // document: serverOnly(() => import('./source/server/document')),
    // handlers: serverOnly(() => import('./source/server/handlers')),

    head: {                         // the document head's lowest layer (PluridDocument)
        title: 'denote',
    },
    favicon: '/favicon.ico',
    styles: ['/global.css'],        // <link rel="stylesheet"> in the head
    notFound: NotFound,             // a component (the /not-found route) or '/404.html' under public/
    errorPage: '/500.html',         // a file under public/, or a component rendered once at startup
});
```

`createPluridServer` checks the config before a server exists (`routes` must be
an array of routes, `services` need a `name` and a `Provider`, …) and lists
every problem with the shape it expected. `handlers(server)` runs during the
server's construction, before the page's catch-all `GET`, so
`server.instance().get('/status', …)` and `server.handle().get(…)` answer.

``` typescript
// source/server/index.ts
import config from '../../plurid.config';
import {
    startPluridServer,
} from '@plurid/plurid-kit/server';

// `startPluridServer` takes the CONFIG (it creates the server itself and starts it on `$PORT`);
// `createPluridServer(config)` alone gives you the server to start or extend by hand
startPluridServer(config);
```

``` typescript
// source/client/index.tsx
import config from '../../plurid.config';
import {
    createPluridClient,
} from '@plurid/plurid-kit/client';

createPluridClient(config);
```

`createPluridServer` projects the config onto `PluridServerConfiguration`;
`createPluridClient` composes the provider stack with the IDENTICAL wrapping
algorithm the server's ContentGenerator uses, then hydrates from
`__PRELOADED_REDUX_STATE__` / `__PRELOADED_PLURID_METASTATE__` - so SSR and
hydration can not drift apart.


## CLI

```
plurid dev [--watch] [--port <n>]    esbuild client + server, start node (default port 33721)
plurid build [--no-clean]            production build -> build/{index.js, client/**, public/**}
plurid start                         node build/index.js (ENV_MODE=production; container CMD)
plurid info                          print the app's kit-shape diagnosis
```

- `dev` loads the `development` environment files, `build`/`start` the
  `production` ones, the most specific first: `.env.<mode>.local` >
  `.env.<mode>` > `.env.local` > `.env` (each in the root, then in
  `environment/`); a variable already set in the environment wins over every
  file. `--watch` keeps the client + server bundles rebuilding (refresh the
  browser for client changes; the server process restarts by itself after a
  successful server rebuild).
- `start` (and `dev`) supervise the server: SIGINT / SIGTERM / SIGHUP are passed
  on to it, it answers the requests in flight before it exits, and the CLI exits
  as the server did (`128 + n` when the server was killed by signal `n`). `start`
  writes nothing to disk (a read-only image runs it).
- `build` copies `source/public/** -> build/public/`, derives the real client
  entry from the esbuild metafile, and writes `build/asset-manifest.json` so
  the server template points at the actually-emitted script (no `/vendor.js`
  404 - the kit sets `vendorScriptSource: ''`).
- The CLI reads `plurid.config.ts` for the build-time knobs (`bundle.*`) and
  the directories (`buildDir`, `publicDir`); an app without a config file
  builds on convention alone. A config that is present but cannot be bundled or
  evaluated fails `build` and `start` (exit 1); `dev` and `info` warn and go on
  with the conventions.


## styled-components v6 workarounds: built in

Every legacy plurid application carries two hand-rolled styled-components v6
build fixes. The kit bakes both into `clientBuildOptions`, so kit-adopting
applications delete them:

- `process.env.SC_DISABLE_SPEEDY = 'true'` - production style injection
  (styles not rendering in minified builds).
- `styled-components -> dist/styled-components.browser.esm.js` alias - the
  CJS browser build's default-export interop breaks `styled.div` under
  bundling (the "black screen"). Resolved from the APPLICATION's own
  styled-components install, guarded, with a clean fallback when absent.


## Bundle escape hatches (`bundle.*` in the config)

``` typescript
bundle: {
    // client-only natives to keep external in the browser bundle
    clientExternals: ['geoip-lite'],
    // deep interop paths to force-bundle on the server
    forceBundle: ['@plurid/apps.libraries.frontends.requester/distribution/server.frontend.js'],
    // esbuild defines + extra loaders + client-inlined env keys
    define: { 'process.env.FLAG': '"on"' },
    loaders: { '.glb': 'file' },
    environment: ['PUBLIC_API_URL'],
},
```

These replace the per-application `scripts/custom.js`.


## Migrating a legacy application

1. Author `plurid.config.ts` from the app's `source/server/index.ts`
   (`new PluridServer({...})` fields map one-to-one onto the config).
2. Swap the server entry for `startPluridServer(config)` (`createPluridServer(config)`
   when you extend the server by hand) and the client entry for `createPluridClient`.
3. Replace the `scripts/workings/` build with the three package scripts:
   `"dev": "plurid dev --watch"`, `"build": "plurid build"`, `"start": "plurid start"`.
4. Delete the `SC_DISABLE_SPEEDY` defines and the styled-components
   browser-ESM alias from any local build scripts - the kit provides both.
5. Containerize with `templates/production.dockerfile` as the reference.


## Documentation

- Architecture of the whole engine: `docs/ARCHITECTURE.md` (section 10 covers the kit).
- The kit plan of record: `docs/FRAMEWORK_PLAN.md`.
- The engine control surface (what the config's `configuration` field drives):
  `docs/CONTROL_SURFACE.md`.
