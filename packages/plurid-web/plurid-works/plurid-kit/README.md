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

Status: in build-out; unpublished (`0.0.0-0`). Plan of record:
[`docs/FRAMEWORK_PLAN.md`](https://github.com/plurid/plurid/blob/master/docs/FRAMEWORK_PLAN.md).


## The thin-app contract

A plurid-kit application is three files + a config:

```
plurid.config.ts            the single source of truth
source/
    server/index.ts         createPluridServer(config) + startPluridServer(server)
    client/index.tsx        createPluridClient(config)
    public/                 favicons, manifest, robots (served statically)
```

``` typescript
// plurid.config.ts
import { defineConfig } from '@plurid/plurid-kit';

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

    head: {
        title: 'denote',
    },
    favicon: '/favicon.ico',
});
```

``` typescript
// source/server/index.ts
import config from '../../plurid.config';
import {
    createPluridServer,
    startPluridServer,
} from '@plurid/plurid-kit/server';

startPluridServer(createPluridServer(config));
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

- `dev` loads `.env.development`, `build`/`start` load `.env.production`;
  `--watch` keeps the client + server bundles rebuilding (refresh the browser
  for client changes; restart `plurid dev` for server changes).
- `build` copies `source/public/** -> build/public/`, derives the real client
  entry from the esbuild metafile, and writes `build/asset-manifest.json` so
  the server template points at the actually-emitted script (no `/vendor.js`
  404 - the kit sets `vendorScriptSource: ''`).
- The CLI reads `plurid.config.ts` for the build-time knobs (`bundle.*`);
  an app without a config file builds on convention alone.


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
2. Swap the server entry for `createPluridServer` + `startPluridServer` and
   the client entry for `createPluridClient`.
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
