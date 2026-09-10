# Plurid Framework Plan: `@plurid/plurid-kit`

Status: **published and partially adopted, verified 2026-07-13**.

`@plurid/plurid-kit@0.0.0-3` is the supported batteries layer over `plurid-react-server`. It replaces copied client/server orchestration and build scripts with a typed `plurid.config.ts`, thin runtime entries, and the `plurid` CLI.

## Current adoption

The applications workspace contains 60 web package manifests. All 60 declare React 19 and styled-components 6. On 2026-07-13:

- 29 apps had `plurid.config.ts`;
- 29 apps used thin `createPluridClient` and `startPluridServer` entries;
- 29 apps exposed `plurid dev/build/start`;
- 31 web packages remained outside the kit contract;
- Denote and Depict were on the kit;
- Dechat remained on the legacy shell.

Package modernization and framework adoption are different milestones. A current React version does not make an app kit-shaped, and a kit-shaped scaffold does not make it a complete product.

## Contract

### `plurid.config.ts`

The config owns shared application orchestration:

- identity, hostname, routes, planes, shell, exterior, and router properties;
- ordered service/provider definitions used consistently by SSR and hydration;
- head, favicon, manifest, public directory, and error-page configuration;
- client bundle loaders, defines, externals, and forced bundles;
- optional server-only preserves, load functions, middleware, and handlers;
- escape hatches into the underlying `PluridServer` options/template.

Server-only values use a thunk/import boundary so loaders, requesters, secrets, and handlers do not leak into the browser graph. The common app should remain small; framework internals are escape hatches, not required boilerplate.

### Runtime entries

`@plurid/plurid-kit/client` hydrates the same ordered provider stack used on the server and consumes preloaded app/engine state. `@plurid/plurid-kit/server` maps the config to `PluridServer`, resolves server-only behavior, serves public assets, and starts the production server.

### CLI

```text
plurid dev    -> esbuild watch, server restart, local runtime
plurid build  -> production server/client/public artifact
plurid start  -> run the built server artifact
plurid info   -> show resolved entries/environment/config summary
```

Deployment is intentionally outside the CLI. CI builds images and applies reviewed deployment configuration.

## Design constraints

- Routing stays explicit because Plurid routes carry planes and per-route spatial configuration.
- Client and server use the same provider ordering but not the same import graph.
- Redux/client factories run once per client lifecycle and per request on the server.
- Real Express handlers remain product modules referenced by config; only empty copied handlers are removed.
- The document head has deterministic precedence: the kit's `head` < a route's / plane's `head` < in-render `<PluridDocument>` declarations < a preserve's `document` < the server `document` hook (the document model, 2026-09-05).
- The client bundles application libraries; the server may externalize bare imports that are present in the runtime workspace skeleton.
- Build exceptions are explicit typed configuration, not hidden inference.
- Legacy and kit paths may coexist during an atomic migration, but the legacy path does not define new framework requirements unless an active product needs it.

## Remaining P4: Finish fleet adoption

Use `applications/scripts/migrate-kit.mjs` for the common transformation, then review every result. Priority order:

1. protect Denote and keep it as the reference configuration;
2. complete Depict and its media/API/worker path;
3. migrate Dechat after its LLM/domain architecture is defined;
4. finish active platform/general applications needed by those slices;
5. migrate other products only when selected or when doing so removes shared operational risk.

Per-app verification:

```text
[ ] config imports no server-only code into the client graph
[ ] provider order and preloaded state match SSR/hydration
[ ] real preserves and handlers remain wired
[ ] public assets/head resolve
[ ] plurid dev renders SSR and hydrates without console errors
[ ] plurid build + plurid start serve the production artifact
[ ] product browser smoke passes
[ ] legacy runner removal is reversible in the reviewed change
```

Do not equate a generated config with successful migration.

## P5: Replace `generate-plurid-app` — DONE 2026-09-10

The generator emits the kit shape below (TypeScript, one template stamped with the workspace's versions at build; `-d`, `-m npm|pnpm|yarn`, `-v git|none`, `--no-install`; another language or UI engine is refused). Tests: the answers, the deterministic file list and manifest, an end-to-end generation with git; `pnpm smoke.pack` generates an application, installs it from the packed tarballs, runs `plurid build`, starts it and asserts the space at `/`. ### Historical: the plan (2026-09)

The generator was CRA/webpack/rollup-era code: it shelled out to Create React App, carried large dependency lists, completed weakly on failure, and had only a sanity test. The plan was to replace it with direct generation of the kit shape:

```text
plurid.config.ts
source/client/index.tsx
source/server/index.ts
source/shared/routes/
source/shared/shell/
source/server/preserves/       # optional typed stub
source/public/
package.json                   # dev/build/start/check/test
tsconfig.json
```

with no CRA, webpack, rollup, copied application scripts or per-app Dockerfile (containerization and deployment belong to shared service-type templates and CI), and with tests for input validation and non-zero failure behavior, deterministic file output, TypeScript config correctness, the generated install / build / type-check, a browser smoke of the generated app, and compatibility with the published engine and kit versions. All of it landed as described above.

## Framework verification

Engine repository:

```bash
pnpm --filter @plurid/plurid-kit build
pnpm --filter @plurid/plurid-kit test
pnpm --filter @plurid/plurid-react-server test
```

Application repository, per migrated app:

```bash
pnpm --filter <app> build
node scripts/boot-check.mjs <name> <port> <package-filter>
```

The exact boot-check arguments are application-specific. Denote and Depict also need their product browser tests as those are added.

## Release and compatibility

`plurid-data`, `plurid-engine`, `plurid-react`, `plurid-react-server`, and `plurid-kit` form a compatibility chain. Publish them with explicit compatible versions and test a small generated/fixture app against the exact release set. Applications should pin that set for production rather than use `*` ranges.

## Completion criteria

The framework program is complete when a new app is generated directly into the kit shape, Denote/Depict/Dechat require no copied orchestration, active apps have a measured migration disposition, CI verifies the generated contract, and the application delivery pipeline consumes one reproducible kit artifact shape.
