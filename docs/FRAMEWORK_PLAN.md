# Plurid Framework Plan - `@plurid/plurid-kit`

Generated: 2026-06-23. Last updated: 2026-07-02.
Status: **P0-P4 DONE. P4 EXECUTED (2026-07-03): all 27 active web apps run on the
published `@plurid/plurid-kit@0.0.0-2`** (denote hand-piloted; 12 cores + 14 platform
apps via `applications/scripts/migrate-kit.mjs`; every app boot-check PASS at its
canonical port; denote production SSR verified on `plurid start`). Per-app deltas the
codemod handles: serverName derivation (the recipe's copied-'General WWW' artifact),
redux-context detection, DndProvider/Stripe third services, favicon-from-public,
the asset-loader `bundle` block, `.env.development` canonical ports. Hand-ported:
middleware (account/com-www/link-www - server-entry spread, config stays client-safe),
dashboard (pre-alias relative imports, literal root, no PTTP CORS handler). The legacy
`scripts/` stacks remain as `dev.legacy` until retirement. P5 pending -
**deploy pilot PROVEN (2026-07-03)**: the workspace-aware production image
(applications `configurations/docker/kit-app.production.dockerfile`, APP_NAME/
APP_PATH build args) = libs + `plurid build` built OUTSIDE docker (CI caches),
the builder stage runs `pnpm deploy --prod --legacy` (workspace libs packed
from distribution/, engine packages from public npm - NO private registry, NO
token) + copies build/; runtime = node:24-alpine + `node build/index.js`.
denote containerized: production SSR correct (15,423b real content, 0 errors),
566MB. pnpm 11 gotcha: unlisted dependency build scripts ERROR inside deploy -
`allowBuilds: protobufjs: false` (postinstall = version stamping, skippable).
History: **P0-P3 DONE (2026-06-23)** - P2/P3 end-to-end in denote was pending the operator
publish of `@plurid/plurid-kit` + the P1 `plurid-react-server` bump. **P4 UNBLOCKED
(2026-07-02):** the React-19/styled-6 fleet migration - the P4 gate - is complete
(27/27 active web apps on full-latest, operator-verified 2026-07, applications
workspace), and the 2026-07-02 engine round landed the P4 engine-side deltas (the CLI
now LOADS `plurid.config.ts` - `bundle.*` knobs wired into `dev`/`build`; both
styled-components v6 workarounds baked into `clientBuildOptions`; kit jest baseline +
README/LICENSE). Remaining P4 = per-app config + thinning (applications workspace,
post-publish). P5 pending.

**Progress**

- **P0 - DONE (2026-06-23).** Package scaffolded at `packages/plurid-web/plurid-works/plurid-kit/` - `@plurid/plurid-kit` (bin `plurid`): `defineConfig` + the full `PluridConfig` contract + stubbed `createPluridServer`/`createPluridClient` + the `dev|build|start|info` CLI skeleton. `pnpm install` + tsup build clean (ESM+CJS+DTS, 4 entries: index/server/client/cli); a denote-shaped `plurid.config.ts` type-checks losslessly (`tsc --noEmit` green); the `plurid` bin runs (shebang + exec bit + dispatch).
- **P1 - DONE (2026-06-23).** Additive runtime batteries in `plurid-react-server`, all backward-compatible: (1) `options.publicDirectory` -> a second `express.static` mount in `configureServer()` (`index:false`, `existsSync`-guarded, defaults to `<buildDirectory>/public`) so `/favicon.ico`, `/robots.txt`, og-image, manifest resolve - **this is denote's favicon fix**; (2) `template.{favicon,manifest,head}` serialized by a new `buildStaticHead()` and appended AFTER the helmet head in `renderApplication()` (per-route `<Helmet>` still overrides); (3) `template.errorHtml` overrides `SERVER_ERROR_TEMPLATE` at both 500 sites. Verified against a live server: favicon 200, no-publicDir 404 fall-through (no crash), all head tags emitted+escaped, empty-template head byte-identical to before. Build clean (CJS+ESM+DTS).
- **P2 - DONE pending operator publish (2026-06-23).** Implemented the real `createPluridServer`/`createPluridClient` + the `plurid dev` CLI, and migrated denote to the thin shape. Details:
  - `createPluridServer(config)` (server entry): projects `PluridConfig` -> `PluridServerConfiguration` (services via `serviceProperties`/`orderedServices`; preserves/load resolved through `ServerOnly` thunks; head/favicon/manifest -> `template`; `publicDirectory` defaults to `source/public` in dev; `handlers(server)` invoked). `startPluridServer` adds `.start($PORT)`.
  - `createPluridClient(config)` (client entry): reads `__PRELOADED_REDUX_STATE__`/`__PRELOADED_PLURID_METASTATE__`, composes providers with the IDENTICAL algorithm as the server `ContentGenerator` (services wrap outward over `HelmetProvider` over `PluridProvider > PluridRouterBrowser`), `hydrateRoot`s. Store built once (== the old `useRef`).
  - `plurid dev` (`source/cli/dev.ts` + `esbuild.ts` + `environment.ts`): verbatim generalization of denote's `dev.cjs` - the `externalize-bare` plugin, the `common` loaders, the client `define`s (ENV_MODE/SC_DISABLE_SPEEDY/global=window); dotenv `.env.*`; `--watch` rebuilds the client + server BUNDLES on change with a SINGLE node child (matches dev.cjs; the node process is not auto-restarted on a server-bundle change - restart `plurid dev`; auto server-restart deferred to avoid a spawn/port race). Plus `plurid info`.
  - **denote migration STAGED, not applied (denote restored to working).** The thin shape is `plurid.config.ts` (client-safe: identity/routes/shell/services/head/favicon) + thin `source/server/index.ts` (`startPluridServer({ ...config, preserves, handlers })`) + thin `source/client/index.tsx` (`createPluridClient(config)`): ~257 LOC -> ~10 LOC + one config. BUT swapping the entries in-place broke denote (they import the unpublished `@plurid/plurid-kit`), so the entries were git-restored to the working `new PluridServer(...)` and the proven thin entries parked at `denote/configurations/plurid-kit-migration/` with a README of the operator's post-publish swap. `denote/plurid.config.ts` stays at root, inert (tsconfig `include:["source"]` excludes it; `dev.cjs` builds only the entries) - denote runs exactly as before.
  - **Verified**: kit builds clean (ESM+CJS+DTS, 6 entries). denote's thin files type-check against denote's REAL modules with ZERO new errors - the only 2 residual errors (untyped `apps.libraries.*` requester = the dts backlog; a `PluridPreserve<PluridRouteMatch>` vs `PluridPreserveReact` alias mismatch) are PRE-EXISTING and identical in denote's original server (confirmed by type-checking the git original; denote's esbuild dev never type-checked them). Runtime smoke (contained, engine workspace): `createPluridServer` boots -> `GET / = 200` with SSR'd content, static head (title + favicon link) injected, **favicon 200 through the framework**, metastate hydration global present.
  - **Remaining = operator publish (cross-workspace):** denote resolves the PUBLISHED `@plurid/plurid-react-server@0.0.0-16` (pre-P1) and `@plurid/plurid-kit` is unpublished, so an end-to-end `plurid dev` in denote needs: publish `@plurid/plurid-kit` + a P1 `plurid-react-server` bump, add `@plurid/plurid-kit` to denote deps, `pnpm install`. Then `plurid dev` boots denote with the favicon. Until then denote still runs via its existing `scripts/dev.cjs` (untouched; the thin entries are staged).
- **P3 - DONE (2026-06-23).** Production build + serve + the single Dockerfile:
  - `plurid build` (`source/cli/build.ts`): production esbuild (minified, `ENV_MODE=production`) -> `build/index.js` (server) + `build/client/index.js` (single iife bundle, loadable by the template's `<script src>`) + recursively copies `source/public/**` -> `build/public/`; derives the real client entry from the esbuild metafile and writes `build/asset-manifest.json`.
  - `plurid start` (`source/cli/start.ts`): `node build/index.js` with production env; the container `CMD`.
  - **`/vendor.js` 404 fix**: the single-bundle client has no vendor chunk, so `createPluridServer` (production) sets `template.vendorScriptSource = ''` and reads `build/asset-manifest.json` for `mainScriptSource`. Engine made this work additively: Renderer `vendorScriptSource ?? DEFAULT` (was `||`, so an explicit `''` is now preserved as "skip") + the template emits the vendor `<script>` only when truthy.
  - **Reference `production.dockerfile`** (`packages/plurid-web/plurid-works/plurid-kit/templates/`): one Dockerfile per service-type (not per app), monorepo build context, `pnpm install` -> build libs (`^...`) -> `plurid build` -> `pnpm deploy --prod /deploy` (self-contained) -> slim runtime `pnpm exec plurid start`. P5's scaffolder emits it.
  - **Verified** (contained runtime tests): real `plurid build` on a scratch app -> correct `build/{index.js, client/index.js, public/**, asset-manifest.json}`; production `createPluridServer` render -> `<script src>` points at the manifest's hashed main, NO `/vendor.js`, NO empty `<script src="">`, SSR content, favicon 200 from `build/public`. Backward-compat regression: an existing raw `PluridServer` (no template) still emits the default `/vendor.js` + `/index.js`.
- **P4 - engine side DONE (2026-07-02); GATE LIFTED.** The fleet migration completed
  (27/27 active web apps on React 19 / styled 6 / full-latest, operator-verified
  2026-07, applications workspace). Engine-side deltas landed this round:
  (1) `source/cli/config.ts` `loadPluridConfig` - the CLI esbuild-bundles + imports the
  app's `plurid.config.ts` and wires `bundle.{clientExternals,forceBundle,define,
  loaders,environment}` into `clientBuildOptions`/`serverBuildOptions` (the typed
  replacement for each app's `scripts/custom.js` is now actually read); (2) the two
  styled-components v6 workarounds baked into `clientBuildOptions` (`SC_DISABLE_SPEEDY`
  define + `styledComponentsBrowserAlias` -> the app's
  `dist/styled-components.browser.esm.js`, existsSync-guarded) so adopting apps delete
  both hand-rolled hacks; (3) kit jest baseline (`source/__tests__/esbuild.test.ts`,
  7 tests - alias resolution, define pinning, config round-trip) - kit is no longer the
  only package `pnpm -r test` skips; (4) README + LICENSE/LICENSE.deon (the
  `SEE LICENSE IN LICENSE` pointer now resolves). Remaining P4 = the per-app work in
  the applications workspace (add `plurid.config.ts`, swap entries, delete `scripts/`),
  post-publish.

> **Biggest risk (verified 2026-06-23) - RESOLVED (2026-07):** generalizing past denote (P4) was **gated by a React-18->19 + styled-components-5->6 migration of ~54 apps** - the modernized engine hard-peers `react>=19`/`styled-components>=6`, and at the time **denote was the only app migrated**. That migration completed 2026-07 (27/27 active fleet on full-latest); the gate is lifted. The historical text stands as dated evidence. See section 5 P4 and section 9.

A batteries-included, configurable framework - a Next.js for plurid - built on top of the existing `@plurid/plurid-react-server` SSR runtime, so that a plurid web app becomes thin: **just its routes + shell + content + a `plurid.config.ts`**. denote is the proven vertical slice it is built against.

Companion docs: `docs/ENGINE_AUDIT_AND_ROADMAP.md` (engine), `docs/CONTROL_SURFACE.md` (engine control surface), and `applications/docs/PIPELINE.md` (the apps develop->build->deploy pipeline this framework feeds).

---

## 1. Why - the problem

`@plurid/plurid-react-server` is a solid SSR **runtime** (`PluridServer` -> Express -> React SSR -> HTML), but it is **not a framework**. The gaps:

- **No CLI.** `PluridLiveServer` is a stub that throws `"not implemented"`. There is no `dev`, `build`, or `start` command, no config-file convention, no `.env` loading.
- **Hardcoded HTML template** (`source/objects/Renderer/template/index.ts`). The `<head>` is composed only from `react-helmet-async` (`Server/index.ts:~1049`). There is **no favicon / metadata API**.
- **Static serving pinned to `build/client`** (`configureServer()`, `Server/index.ts:~1228`). An app's `source/public/` (favicon, og-image, manifest, robots) is **never served** - which is exactly why denote shows the default browser globe instead of its favicon.

Because the runtime ships none of the app plumbing, **each plurid web app copy-pastes ~2,100 LOC of identical boilerplate**. Verified inventory (ground-truth, all domains, as measured 2026-06-23): **58 web frontends** (52 `plurid-com` cores/tools/general/admin + 6 across `plurid-cloud`/`plurid-app`/`plurid-link`/`plurid-shop`); of those, **~55 use `new PluridServer`** (the framework target) and **3 are out of scope** - `plurid-cloud/products/{delog,messager}` and `plurid-com/general/data` use `@plurid/deserve-router`, not PluridServer. (57 `scripts/custom.js`, 58 `client/Client.tsx`.) Post-migration status (2026-07): the ACTIVE fleet is 27 apps, all on React 19 / styled 6 / full-latest - a different counting basis (active-and-booting vs all-frontends-on-disk); both figures stand with their dates. The de- app consumption measurements of 2026-07-02 (42 apps: 29 cores + 13 tools) are in `docs/ARCHITECTURE.md` section 12.

| Boilerplate | LOC | Per-app variance |
|---|---|---|
| `scripts/` (esbuild `dev.cjs` + legacy webpack/rollup `workings/` + `index.js`) | ~1,040 | only `custom.js` (~30 LOC: `externals`/`esModules`) |
| `source/server/index.ts` (the `new PluridServer({...})` wiring) | ~145 | only `hostname` + `serverName` (~6 lines) |
| `source/client/{index,Client}.tsx` (`hydrateRoot` + provider nesting) | ~120 | byte-identical across apps |
| `configurations/` (jest/eslint/tsconfig/dockerfiles), `environment/.env.*` | ~300 | trivial |

The genuinely app-specific surface (the product) is small and clear: `source/shared/{routes, shell, kernel}`, `source/server/preserves/logic/` (per-request data-loading: query -> build Redux store -> return `__PRELOADED_REDUX_STATE__`), and the `services` config (Apollo + Redux). The scaffolder `generate-plurid-app` *copies* the boilerplate (CRA-era webpack/rollup), so every new app starts heavy.

**The 3D engine modernization and the denote Layer-1 build hygiene are done** (denote builds its 15 closure libs with tsup, the `rebuild-denote-libs.cjs` hack is deleted, and denote boots HTTP 200 via its `scripts/dev.cjs`). denote is therefore the proven, modern reference app to build the framework against.

---

## 2. Thesis

> One framework (`@plurid/plurid-kit`) owns the build, the serve, and the conventions. An app declares its product in a `plurid.config.ts` and `source/{routes,shell,...}`; everything else - bundling, SSR wiring, hydration, static serving, favicons, env - is the framework's job.

This is the app-side counterpart to `applications/docs/PIPELINE.md`'s thesis ("one workspace builds everything; the same build runs three ways"): `plurid dev` is the Layer-2 (local mesh) dev runner, `plurid build`/`plurid start` produce the Layer-3 (ship) artifact, and **one CLI replaces ~55 `scripts/` dirs** - the "uniform by service-type" the pipeline demands.

---

## 3. Decisions (locked)

- **A published package `@plurid/plurid-kit`** lives in this engine repo at `packages/plurid-web/plurid-works/plurid-kit/`, sibling to `plurid-react-server` - the way `next` wraps `react-dom/server`. (Named `-kit`, not bare `@plurid/plurid`, to follow the `plurid-<role>` package convention; the **bin stays `plurid`**, so `plurid dev` is unchanged.) The renderer stays a lean, independently-versioned library; the framework is the batteries layer (CLI, config, conventions, client bootstrap). Apps (and future scaffolded standalone apps) depend on it via npm. During active build-out, iterate via a **local link** (pnpm `overrides`/`link:`) to avoid publish-bumps. (Decision-A "no-publish" in PIPELINE.md applies to apps' *libraries*, not to engine/framework tooling.)
- **Routing stays explicit** - a `routes` array in config, not file-based discovery. Plurid routes carry `planes`, per-route 3D `defaultConfiguration` (theme, `space.center`, toolbar drawers, viewcube), and `parameters`; the `IsoMatcher` is built directly from the arrays. A file-based router cannot express plane composition.
- **Bundler = esbuild** - generalize denote's proven `scripts/dev.cjs`. This **supersedes** the old `generate-plurid-app` modernization idea of "CRA->Vite": the framework owns bundling, so apps emit no bundler config at all. The framework package itself builds with tsup (its siblings' pattern).
- **One `plurid` bin**: `dev` / `build` / `start` / `info` are native. **`deploy`/`login` are out of scope** - there is no `@plurid/plurid-cli` in this repo (verified), and deploys go through Gitea CI + `kubectl`. The separate scaffolder `@plurid/generate-plurid-app` keeps its own `generate-plurid-app` bin (the `create-*` tool); P5 reworks its templates to emit the thin framework shape.
- **Runtime batteries go into the published `plurid-react-server`** (additive, backward-compatible) - `public/` serving, favicon/head/metadata, error pages. The framework *configures* them; it does not reimplement the renderer.

---

## 4. Architecture

### 4.1 The package `@plurid/plurid-kit`

```
@plurid/plurid-kit          -> defineConfig() + the config/runtime types (what plurid.config.ts imports)
@plurid/plurid-kit/server   -> createPluridServer(config): maps PluridConfig -> PluridServerConfiguration
                           (builds the helmet head from head/favicon/manifest, assembles services,
                            wires preserves/load, sets template.root + options, runs handlers,
                            start()s under require.main). Replaces every app's source/server/index.ts.
@plurid/plurid-kit/client   -> createPluridClient(config): reads window.__PRELOADED_*__, composes providers
                           FROM THE SAME services array (so SSR/hydration order can't drift), wraps
                            PluridProvider + PluridRouterBrowser, hydrateRoot.
                            Replaces every app's source/client/{index,Client}.tsx.
bin: { plurid: ./distribution/cli/index.js }
```

### 4.2 The CLI (generalizes denote's working `dev.cjs`)

- **`plurid dev`** - load `.env.<mode>` + `plurid.config.ts`; two esbuild watch contexts:
  - **client** (browser, bundle-all, asset loaders, `define` `ENV_MODE`/`SC_DISABLE_SPEEDY`/`global=window`) -> `build/client`;
  - **server** (node, the `externalize-bare` plugin: bundle `./` + `/` + `~`-alias imports, **externalize every bare import** so `@plurid/*` and third-party load from `node_modules` at runtime) -> `build/index.js`;
  - then `spawn('node', ['build/index.js'])` once with `PORT`/`ENV` (single child, matching `dev.cjs`). esbuild reads the **app's own `tsconfig.json`** for `~` path aliases (native support - the load-bearing detail that makes `dev.cjs` work today).
- **`plurid build`** - production esbuild (minify, `ENV_MODE=production`) -> `build/{index.js, client/**}`; copy `source/public/**` -> `build/public/`; **compute `mainScriptSource`/`vendorScriptSource` from the esbuild metafile** (fixes today's `/vendor.js` 404 by pointing the template at the real emitted files); pre-compress (`.br`) the vendor chunk. This replaces the entire legacy webpack/rollup `scripts/workings/`.
- **`plurid start`** - `node build/index.js` with production env. The container `CMD`.
- **`plurid info`** - print the resolved config (routes count, hostname, externals, build dir, env file).

**`custom.js` -> config.** Today `custom.js` carries `externals` (client-only natives, e.g. `geoip-lite`) and `esModules` (force-bundle deep paths/interop, e.g. `...requester/distribution/server.frontend.js`, `react-dnd`, `recharts`). These become `config.bundle.clientExternals` and `config.bundle.forceBundle` - **sane defaults plus an explicit escape hatch; never pure inference** (the edge cases are real and human-set).

**Monorepo lib consumption (PIPELINE Decision A).** Identical in dev and image because the bundler always compiles lib *source* through `node_modules` symlinks; `externalize-bare` keeps `@plurid/apps.*` external and node requires them at runtime. In the image, `pnpm deploy --filter <app>` populates `node_modules` from the monorepo, then `plurid build` / `plurid start`.

### 4.3 The config - `plurid.config.ts`

`defineConfig({ ... })` collapses `source/server/index.ts` (~145 LOC) + `source/client/*` (~120 LOC) + `custom.js` into one declarative module. Representative shape (denote):

```ts
import { defineConfig } from '@plurid/plurid-kit';

export default defineConfig({
  serverName: 'Plurid-com ... Denote',
  hostname:   PLURID_COM_DENOTE_DOMAIN,
  root:       APPLICATION_ROOT,

  routes,                   // explicit - carries planes (TEXT/SCRIPT/VIEW) + per-route 3D config
  shell,

  services: [               // drives BOTH server SSR and client hydration (no order drift)
    { name: 'Apollo', Provider: ApolloProvider, client: () => clientRequester },
    { name: 'Redux',  Provider: ReduxProvider,  store: (s) => reduxStore(s), context: reduxContext },
  ],

  load: { serve: '*', onServe: (t) => loadDenote(t, { serverRequester }) },  // existing preserves logic, referenced

  head:    { lang: 'en', title: 'denote', meta: [ ... og/description/theme-color ... ] },
  favicon: { icon: '/favicon.ico', apple: '/apple-touch-icon.png',
             sizes: { '16x16': '/favicon-16x16.png', '32x32': '/favicon-32x32.png' } },
  manifest: '/site.webmanifest',

  usePTTP: true,
  bundle: {
    clientExternals: ['geoip-lite'],                                   // <- custom.js externals
    forceBundle: [ (d) => d.startsWith('@plurid/apps.libraries') ? d : undefined,
                   '...requester/distribution/server.frontend.js' ],     // <- custom.js esModules
  },
  handlers: (server) => { /* server.handle().post(...) - optional custom routes */ },
});
```

Everything app-specific (the preserves logic, the stores, the routes with their 3D config) is **referenced, not rewritten**. The Redux store is passed as a **factory** `store: (s) => reduxStore(s)` so SSR (preloaded from the preserve) and the client (preloaded from `window`) unify on one code path.

### 4.4 Runtime batteries (added to `plurid-react-server`)

| Battery | Where it slots in | Effect |
|---|---|---|
| `public/` serving | `options.publicDirectory` + a 2nd `express.static` mount in `configureServer()` (~L1228) | `/favicon.ico`, `/site.webmanifest`, `/og-*.jpg`, `/robots.txt` resolve |
| favicon / head / metadata | extend `PluridServerTemplateConfiguration.head`; **feed the static defaults INTO the Helmet context as defaults (or dedup by tag key) - NOT raw string concat**, so a single `<title>`/`<meta>`/`<link>` is rendered with deterministic precedence (per-route `<Helmet>` overrides the config default) | a real favicon/meta API; the standard `<link rel="icon"\|"apple-touch-icon"\|"mask-icon"\|"manifest">` tags, no duplicate title/meta |
| error pages | `config.notFound`/`errorPage`; override `SERVER_ERROR_TEMPLATE` via `template.errorHtml` (~L621) | customizable 404/500 |
| script sources | framework sets `template.{main,vendor}ScriptSource` from the esbuild metafile | no `<script src>` 404 |
| env loading | the CLI (not the runtime): `dotenv` `.env.<ENV_MODE>` before config load | `.env.local`/`.env.production` convention |

### 4.5 The thin-app contract (denote, before -> after)

**Delete:** `scripts/**`, `source/server/index.ts`, `source/client/{index,Client}.tsx`, the `kernel/services/helmet` wiring, legacy `configurations/docker.*`, and **stub** `source/server/handlers/`.
**Keep:** `plurid.config.ts` (new), `source/shared/{routes,shell,kernel}`, `source/server/preserves/logic/`, **`source/server/handlers/` where it has real Express behavior** (deon=9, defile=11, decart, status, ... have real `.get/.post`/`handle()` calls) - **referenced from `config.handlers`, not deleted**, `source/public/`, `tsconfig.json` (the `~` aliases), `environment/.env.*`, a 3-script `package.json` (`plurid dev|build|start` + `deploy`).

```
After:
denote/
+-- plurid.config.ts                <- NEW - the only orchestration
+-- environment/.env.{local,production}
+-- source/
|   +-- shared/{routes, shell, data, kernel/...}   <- the product
|   +-- server/preserves/logic/                  <- per-request data-loading (referenced by config.load)
|   \-- public/                                  <- favicon/og/manifest/robots - now served + linked
+-- package.json   -> { dev: "plurid dev", build: "plurid build", start: "plurid start", deploy: "plurid deploy" }
\-- tsconfig.json
```

Net per app: **~1,300+ LOC of copy-paste -> one ~50-line `plurid.config.ts`**. Across ~55 apps, ~110,000 LOC of duplication collapse to one framework + 55 small configs (after the React/styled migration each app needs first - see section 5 P4).

---

## 5. Phased rollout (P0-P5)

denote-first, prove-then-generalize, never boil the ocean.

| Phase | Goal | Key changes | Verify | Main risk |
|---|---|---|---|---|
| **P0  DONE** | Scaffold `@plurid/plurid-kit` | `defineConfig` + the full `PluridConfig` contract + `createPluridServer`/`createPluridClient` stubs + CLI skeleton; tsup build (ESM+CJS+DTS) |  tsup build clean; a denote-shaped `plurid.config.ts` type-checks losslessly (`tsc --noEmit` green); `plurid` bin runs | none (nothing runs) - "wrong contract" mitigated by projecting via indexed-access types off `PluridServerConfiguration` |
| **P1 DONE** | Runtime batteries | `publicDirectory` mount, `template.head`/favicon serialization, error-page hooks, metafile script sources (all additive) | a raw `PluridServer` + `publicDirectory` serves `/favicon.ico`; denote's existing `server/index.ts` still boots unchanged | none (backward-compatible) |
| **P2 DONE** (end-to-end pending operator publish) | `plurid dev` + migrate denote (**the proof**) | generalize `dev.cjs`; add `denote/plurid.config.ts`; run `plurid dev` **with `scripts/` still present** -> assert identical to `node scripts/dev.cjs`; **then** delete denote's `scripts/` + server/client boilerplate | HTTP 200 on :33721, 3D/Lexical/gizmo interactive, **favicon now 200**, zero console errors, `__PRELOADED_*` set; metafile diff shows no externalization regression | tsconfig `~`-alias resolution (pass the app's tsconfig), the requester deep-path (keep in `forceBundle`), client store memoization. Reversible (working-tree restore) |
| **P3 DONE** (end-to-end pending operator publish) | `plurid build`/`start` + production Dockerfile | one esbuild production pass -> the `build/{index.js,client/**,public/**}` the `web-app` chart serves; new multi-stage `production.dockerfile` (`pnpm deploy --filter` -> `plurid build` -> slim -> `plurid start`) = the single Dockerfile-per-service-type | build+run denote's image from the monorepo context -> parity; slim; no `scripts/` | carry forward `SC_DISABLE_SPEEDY` (styled-components prod footgun); pin `@plurid/plurid-*` exact for reproducible images |
| **P4** (gate LIFTED 2026-07; engine side done) | Generalize - prerequisite complete | **The prerequisite migration is COMPLETE (2026-07: 27/27 active apps on React 19 / styled 6, operator-verified, applications workspace).** Engine side landed 2026-07-02: config loading in the CLI (`bundle.*` wired), styled-v6 workarounds baked in, kit tests + README. Remaining, per app (applications workspace, post-publish): add `plurid.config.ts`, swap scripts, delete `scripts/`. Sample spanning every axis: `denote`, a core (`depict`), `deon`/`defile` (real handlers), `general/account` (StripeProvider), `general/www` (DndProvider), a `plurid-cloud/*` | each thinned app boots HTTP 200, console-clean, **styled-6 renders correctly** | per-app drift (each app's custom.js externals map onto `bundle.*`); behind the framework's verification gate |
| **P5** | Rework `generate-plurid-app` | emit `plurid.config.ts` + `source/{routes,shell}` + `source/server/preserves/` stubs + `public/` + a 3-script `package.json` + the framework dep; delete the CRA-era webpack/rollup template tree | a generated app has no `scripts/`, boots via `plurid dev`, ~50-100 LOC app-specific | keep the scaffolder's test suite green; have it import `defineConfig` so a bad stub fails to type-check |

**Coexistence / safety.** The legacy (`scripts/`) and framework (`plurid.config.ts`) paths are mutually invisible - the CLI reads a config legacy apps lack; the legacy runner reads a `scripts/` migrated apps lack. P1 parallels before P2 deletes; per-app migration is atomic, independent, and reversible; the framework being a dependency means a framework bug can't break a not-yet-migrated app.

---

## 6. Critical files

- `packages/plurid-web/plurid-works/plurid-react-server/source/objects/Server/index.ts` - `configureServer` (~L1228, add the public mount), `renderApplication` (~L1049, head/favicon), error hooks (~L546/621). `attachSignalHandlers` already present makes it CLI-embeddable.
- `.../plurid-react-server/source/data/interfaces/external/index.ts` - extend `PluridServerOptions` (`publicDirectory`) + `PluridServerTemplateConfiguration` (`head`/`favicon`/`manifest`/`errorHtml`). `PluridServerConfiguration` (L133) is the contract `plurid.config.ts` projects onto.
- `.../plurid-react-server/source/objects/Renderer/template/index.ts` - the fixed HTML template needing the static-head insertion point + metafile-driven script sources.
- `.../plurid-react-server/tsup.config.ts` - the build/externalization template the framework package + `plurid build` mirror.
- `applications/.../products/cores/denote/scripts/dev.cjs` - the proven esbuild client+server build/watch+serve the CLI generalizes (the `externalize-bare` plugin is load-bearing).
- `applications/.../products/cores/denote/source/{server/index.ts, client/Client.tsx, server/preserves/logic/index.ts, scripts/custom.js}` - the exact boilerplate `plurid.config.ts` + `@plurid/plurid-kit/{server,client}` absorb; the canonical translation target.
- `packages/plurid-utilities/generate-plurid-app/source/process/react/server/index.ts` - the copy-the-boilerplate logic P5 replaces.

---

## 7. Verification (end-to-end, denote slice = P0-P2)

1. `pnpm -r build` clean - the framework package compiles.
2. A raw `PluridServer` with `publicDirectory` set serves `/favicon.ico` (200).
3. `plurid dev` in denote (with `scripts/` still present) is byte-equivalent in behavior to `node scripts/dev.cjs`: **HTTP 200 on :33721**, interactive (3D engine, Lexical, transform gizmo), **favicon 200** (was effectively absent), zero console errors, `__PRELOADED_REDUX_STATE__`/metastate present.
4. Delete denote's `scripts/` + server/client boilerplate -> re-verify identical.
5. Diff the esbuild metafile (bundled-vs-external module list) before/after to confirm no externalization regressions; assert no `<script src>` 404.

---

## 8. Constraints

- **No git commits/pushes by the agent** - the operator commits the framework package, the `plurid-react-server` battery changes, denote's thinning, and the scaffolder rework. Read-only git + local builds/runs only.
- **Two separate pnpm workspaces** - `technologies/tools/plurid` (engine, published) and `applications` (consumes the published engine). The framework publishes from the engine repo; apps consume it via npm; **local-link during active build-out**.
- **Extend, don't rewrite** - reuse the existing `PluridServer` config surface, the `dev.cjs` esbuild approach, and the engine's tsup pattern.

---

## 9. Interface design constraints (resolve in P0) - review-driven (2026-06-23)

The risk to avoid: replacing copy-paste with a **leaky, shallow** config interface - "config, but actually Express/esbuild/Redux/Apollo/Helmet internals." The framework must be a **deep module**: the *common* app config is tiny (`serverName`, `hostname`, `routes`, `shell` - everything else defaulted); the subtle fields below are **escape hatches, not required wiring**. Settle these before P0 freezes the contract.

1. **Target-aware config (server-only vs client-only imports).** `plurid.config.ts` mixes server-only modules (`serverRequester`, `preserves/logic`) and client-only modules (`clientRequester`). If one config import graph feeds **both** the server and client esbuild entries, the **client bundle can pull server-only code**. Guardrail: split the contract into `server`/`client` sections (or have the client entry import only client-safe config, with `preserves`/`load`/`handlers` lazy/`await import()`-ed server-side). **P2 must verify via the esbuild metafile that no server-only module enters the client bundle.**

2. **`services` lifecycle - the hardest interface (verified).** `ContentGenerator/index.tsx:96` renders each service as `createElement(service.Provider, { ...service.properties, ...preserveResult.providers[service.name] })` - i.e. **static config props merged with the per-request preserve override, keyed by `service.name`.** The client separately reads+deletes `window.__PRELOADED_*__` and **memoizes Redux store creation in a ref**. The single `services` array must therefore specify: per-request server props (from preserve, by name), client hydration props (from window), one-time client factories, **provider order**, and serialization. The store **factory** form `store:(s)=>...` unifies SSR (preloaded from preserve) and client (preloaded from window); keep the client memoize-in-ref. **Services are NOT uniform** (this was a wrong assumption in the first draft): beyond Apollo+Redux, `general/www` + `defile` add `DndProvider` and `general/account` adds `StripeProvider` - each is just another array entry with its own factory + order, and the config must carry it.

3. **`load` is a thin adapter over `preserves`, not a new abstraction.** `PluridPreserveResponse` already supports provider data, redirects, `responded`/`depreserve`/`pass`, `globals`, and template overrides (`plurid-data/.../preserve/index.ts:~56`). `load` is sugar for one catch-all preserve and must map 1:1 onto it - `preserves` stays the real, full interface.

4. **Handlers stay referenced, not deleted.** 57 apps have `source/server/handlers/`; many are stubs, but **deon (9), defile (11), decart, status, ... have real `.get/.post`/`handle()` Express behavior.** `config.handlers: (server) => void` keeps the app's handler module referenced; only stub handlers are dropped (see section 4.5).

5. **Head precedence, not concatenation** (see section 4.4) - static defaults feed *through* Helmet (or dedup by tag key) so exactly one `<title>`/`<meta>`/`<link>` renders with deterministic per-route override.

6. **Client/server bundling rule, stated precisely** (P2): the **client** esbuild *bundles* `@plurid/apps.*` (compiles their `source`/`distribution` into the client bundle); the **server** esbuild *externalizes* every bare import (`externalize-bare`) and `require`s `@plurid/apps.*` at runtime. "Compiles lib source through symlinks" = the client; "external at runtime" = the server. `dev.cjs:14` is the reference.

**Pre-P0 deliverable - inventory/migration matrix.** Enumerate the ~55 PluridServer web apps before freezing the contract. Ground-truth variance already found (so the contract must expose these as fields, defaulted): React/styled versions (**1 R19/sc6 = denote; ~54 R18/sc5; `datasign` = R18/sc6**) / `usePTTP` (**4 apps `false`**) / top-level `planes` (**uipilot, paul, decart, dechat**) / `routerProperties` (**uipilot, paul**) / extra providers (**`DndProvider`: general/www, defile; `StripeProvider`: general/account**) / `handlers/` stub-or-real (deon=9, defile=11, decart, status real) / `custom.js` `externals`/`esModules` (+ an `environment` key in 2 apps) / `options.ignore` / `preserves` shape / `public/` assets / Docker/env. Out of scope: `delog`, `messager`, `general/data` (deserve-router). The matrix sizes the escape hatches and confirms the common case is genuinely tiny.

*Credit: these refinements come from an independent read-only review (Codex, 2026-06-23) that verified the inventory (59/57/58 across all domains) and the non-stub handlers, and flagged the services-lifecycle / target-awareness / head-precedence interfaces as the parts most at risk of becoming leaky.*
