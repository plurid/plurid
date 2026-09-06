# Contributing to plurid'

This is for working **on** the engine. To *use* it in an app, read
[`GETTING_STARTED.md`](./GETTING_STARTED.md). For which packages are live vs. legacy, read
[`CONTEXT-MAP.md`](./CONTEXT-MAP.md).

- [Prerequisites](#prerequisites)
- [Repository layout](#repository-layout)
- [The quality gates](#the-quality-gates)
- [Build order](#build-order)
- [The render-test harness](#the-render-test-harness)
- [Build gotchas (tsup / esbuild)](#build-gotchas-tsup--esbuild)
- [How to add a seam](#how-to-add-a-seam)
- [Tests](#tests)
- [CI, versioning & style](#ci-versioning--style)



## Prerequisites

- **Node ≥ 22** (CI runs on Node 24).
- **pnpm 11** — the root `package.json` pins it via `packageManager: "pnpm@11.3.0"`; `corepack enable` will
  use the right version automatically.

``` bash
pnpm install   # links the workspace; builds only the native binaries allow-listed in pnpm-workspace.yaml
```



## Repository layout

A single **pnpm workspace**. The globs (`pnpm-workspace.yaml`) are:

```
packages/
  plurid-web/
    plurid-core/                 # framework-agnostic core
      plurid-data/               #   types, constants, enumerations  (no build-time deps)
      plurid-engine/             #   plane tree, layout, routing, 3D math
      plurid-pubsub/             #   the publish/subscribe bus
    plurid-works/                # adapters
      plurid-react/              #   the primary render adapter (React)
      plurid-react-server/       #   SSR / static "stills"
      plurid-kit/                #   framework layer (plurid.config.ts + CLI + bootstraps)
      plurid-canvas/  plurid-html/   # ARCHIVED — excluded from the workspace (see pnpm-workspace.yaml)
  plurid-utilities/              # themes, icons, ui-components, ui-state, functions(+react), generate-plurid-app
fixtures/
  render-test/                   # the live browser harness (in the workspace)
docs/                            # ARCHITECTURE, CONTROL_SURFACE, audit, roadmaps, framework plan, critique
examples/                        # copy-pasteable reference components
```

`plurid-canvas` + `plurid-html` are archived (de-globbed with `!` in `pnpm-workspace.yaml`); their source is
kept on disk but they're out of every gate. The native prototype, browser extension, and `fixtures/extras/*`
are outside the workspace entirely. See [`CONTEXT-MAP.md`](./CONTEXT-MAP.md) for the full status table.



## The quality gates

Run from the root. CI enforces the first three (`build`, `test`, `lint`); the browser suite is a LOCAL gate — `pnpm verify` runs everything in order (build → test → lint → browser) and is what to run at every build:

| Command | What it does | Notes |
|---|---|---|
| `pnpm build` | `tsup` (esbuild) builds every package → ESM + CJS + `.d.ts` | **Does NOT type-check.** esbuild transpiles per-file. |
| `pnpm --filter <pkg> check` | `tsc --noEmit` against the package's check config | This is the real type-check. Run it on packages you touch. |
| `pnpm test` | `jest` across the workspace | jest 30. Hook/DOM tests use jsdom. |
| `pnpm lint` | one flat-config ESLint 10 pass over the live source | Single root `eslint.config.mjs` — there are no per-package eslint configs. |
| `pnpm format` / `pnpm format.check` | Prettier write / check | |
| `pnpm e2e` (`pnpm --filter plurid-render-test e2e`) | Playwright against the render-test harness (`e2e/*.spec.ts`) | Needs `npx playwright install chromium` once; starts the Vite server itself. After rebuilding a workspace package, clear `fixtures/render-test/node_modules/.vite`. `BENCH_STRICT=1` also enforces the absolute frame-time budgets of the benchmark (a development-machine gate; the machine-independent invariants always run). Two projects: `chromium` (every scenario, `fixtures.spec.ts` included) and `visual` (a screenshot per fixture × viewpoint against `e2e/__snapshots__/<platform>/`, compared strictly only with `VISUAL_STRICT=1`; the baselines are macOS / headless / DPR 1). |
| `pnpm docs.tables.check` | `docs/SHORTCUTS.md` and `docs/HARNESS.md` are current (generated from the shortcut tables and the harness's flag registry + fixture catalog) | Regenerate with `pnpm docs.tables`. |
| `pnpm check` | `tsc --noEmit` in EVERY package (`pnpm -r check`) | Every public package has a `check` script now; `pnpm build` alone would ship a type error (it transpiles per file). |
| `pnpm check.modules` | imports every published entry point under native Node ESM and CommonJS, from inside each package | Catches what bundled and jest gates cannot: a CommonJS peer read through a default import, a broken `exports` map. |
| `pnpm smoke.pack` | `pnpm pack` every public package, `npm install` the tarballs + peers into a throwaway ESM project, import every entry point both ways | The consumer's path end to end (needs the network; a minute). `--keep` leaves the project for inspection. |
| `pnpm verify` | build → check → test → lint → check.modules → browser suite → smoke.pack | The full local gate; what to run before a publish. |

Because **build ≠ type-check**, a change can build and ship a broken `.d.ts` or a type error that only `tsc`
catches. Before opening a PR: `pnpm verify` (or `pnpm build && pnpm test && pnpm lint && pnpm e2e`), plus `pnpm --filter <pkg> check` for
each package you changed (at minimum `@plurid/plurid-data`, `@plurid/plurid-engine`, `@plurid/plurid-react`
if you touched the core path).



## Build order

The dependency graph is `plurid-data → plurid-engine → plurid-react(-server)`, with `plurid-pubsub` feeding
the adapter. `pnpm build` runs `pnpm -r build`, which respects topological order, so a clean
`pnpm install && pnpm build` is correct. When iterating on one package, rebuild it **and its dependents** —
e.g. a change in `plurid-data` interfaces only reaches `plurid-react` after `plurid-engine` and
`plurid-react` are rebuilt.



## The render-test harness

`fixtures/render-test` is the engine's **"always rendering" gate** — a CAD-style multi-plane scene used to
verify that the engine actually renders and interacts after a change (the type system can't catch a blank
screen).

``` bash
pnpm --filter plurid-render-test dev    # Vite — prints the URL (configured port 5273)
```

Iteration loop when changing the engine:

1. Edit `plurid-data` / `plurid-engine` / `plurid-react`.
2. Rebuild the changed package **and its dependents** (`pnpm --filter <pkg>... build`).
3. **Nuke the Vite cache and restart with `--force`** — Vite serves a stale optimized bundle of the
   workspace deps otherwise, and you'll chase a "still blank" that's really a cache:
   ``` bash
   rm -rf fixtures/render-test/node_modules/.vite
   pnpm --filter plurid-render-test dev -- --force
   ```
4. Confirm the scene renders and orbits/pans/zooms.

The harness src (`fixtures/render-test/src/App.tsx`) is also the easiest place to try an `examples/*` file —
paste it over `App.tsx`.

**The URL is the fixture.** The SETUP button at the top-left expands into every option of the harness — the
fixtures of the catalog, the layout (live), the plane set and declared sizes (a remount), every startup flag
(a reload) — and rewrites the query, so any state is a pasteable link (COPY LINK). The flags are a registry
(`src/harness/flags.ts`), the fixtures a catalog (`src/fixtures/catalog.ts`); both are documented by the
generated `docs/HARNESS.md`. `?gallery=1` shows every fixture on one page.

**Adding a fixture** (a scene a feature needs verified): add an entry to `src/fixtures/catalog.ts` (its flags,
optional link-click steps, 1–2 viewpoints, expectations), run `pnpm docs.tables`, then from `fixtures/render-test`
run `npx playwright test --config e2e/playwright.config.ts --project=visual --update-snapshots` and commit the new
baselines under `e2e/__snapshots__/`. `fixtures.spec.ts` picks the fixture up by itself. A new flag goes into the
registry the same way (the panel and the docs follow).

Four traps: the suite REUSES a server already listening on 5273 (`reuseExistingServer`), so a server orphaned by a killed run keeps serving an old bundle — `lsof -nP -i :5273` before trusting a browser result; the strict / regenerate decision lives in `visual.spec.ts` (from `testInfo.config.updateSnapshots` and `VISUAL_STRICT`), never in the config, because a worker process does not see the CLI's arguments; a nested `test.use({ reducedMotion })` inside a `describe` did not reach the page (2026-09-06) — a scenario that needs an emulation makes its own `browser.newContext(...)`, as the touch scenarios do; and a plane's compositing layer includes everything it draws outside its box (its bridge, its controls bar), so an element of a plane that reaches PAST the parent's plane is split by Chrome's 3D sorting and everything outside the box disappears (the tilted leash, 2026-09-06 — now a band inside an axis-aligned box that ends at the parent's face). The budget is an absolute `maxDiffPixels` (120): a ratio let a 22×20 control vanish unnoticed.



## Build gotchas (tsup / esbuild)

esbuild transpiles **per-file** with no whole-program type info. Two rules follow, and both have bitten this
repo (compiled clean, rendered blank):

1. **Type-only re-exports must use `export type { … }`.** A plain `export { SomeInterface }` in a barrel
   (e.g. `plurid-react/source/index.tsx`) makes esbuild emit a *runtime* re-export of a name with no JS
   value → `SyntaxError: does not provide an export named …`. Keep values in `export { … }`, types in
   `export type { … }`.
2. **No unguarded `process.env` in library code.** It throws `ReferenceError: process is not defined` in
   browser ESM. Guard with `typeof process !== 'undefined' && process.env` and default sensibly.



## How to add a seam

The control surface is built from a few repeated patterns. Match them when extending it (full rationale in
[`docs/CONTROL_SURFACE.md`](./docs/CONTROL_SURFACE.md)).

Docs are part of the checklist: a new topic, knob, or export also updates
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) (the topic catalog / Appendix A inventory) and
[`docs/CONTROL_SURFACE.md`](./docs/CONTROL_SURFACE.md) (the quick reference).

### A configuration knob

1. Add the nested field to `PluridConfigurationSpace` and the flat key to `FlatPluridConfiguration`
   (`plurid-data` configuration interfaces).
2. Add its default to the configuration defaults.
3. Map flat → nested in `definePluridConfiguration`
   (`plurid-engine/source/modules/general/configuration/index.ts`).
4. Read it where it takes effect; add a case to the flat-mapping test
   (`…/configuration/__tests__/definePluridConfiguration.test.ts`).

### A pub/sub topic

1. Add the topic constant in `plurid-data/source/constants/pubsub/index.ts` (it's part of the exported
   union).
2. Add its typed message to `plurid-data/source/interfaces/external/pubsub/message.ts`.
3. Wire it:
   - **Control** (host → engine): add a handler in
     `plurid-react/source/containers/Application/View/hooks/usePluridPubSub.ts` that dispatches the action.
   - **Observe** (engine → host): publish it from
     `…/View/hooks/useEngineEvents.ts` when the relevant slice changes (publishing to a no-subscriber topic
     is free).

### A keyboard shortcut

Add ONE entry to `PLURID_SHORTCUTS` (plurid-data `constants/shortcuts/table.ts`: id, default `code`,
modifiers, `press` or `hold`, group, label) and, for a `press` shortcut, its binding in
`plurid-react/source/services/logic/shortcuts/index.ts` (the `match` + `run`). `hold` keys are read by
the hook that owns them (`useFlyControls`, `useGrabMode`) through `resolveHoldShortcuts`. The `?` overlay,
the toolbar drawer, `keymap` and `disabled` follow automatically; `registry.test.ts` fails if the table and
the ids drift. Pointer gestures are not shortcuts: change the intent table in
`services/logic/input/gesture.ts` (with its truth-table test) and the wheel policy in `input/wheel.ts`.

### A camera behavior

The camera is a pure engine module (`plurid-engine/source/modules/interaction/camera/`): state, matrix,
deltas, projection, framing, the legacy mapping, and the motion math, each with a `__tests__/` file. A
new camera behavior is a new `CameraDelta` field (plurid-data `interfaces/internal/camera`) applied in
`delta.ts` `applyCameraDelta`, with a unit test that pins the geometry (the golden test in
`__tests__/legacy.test.ts` must keep passing — it proves the rendered matrix is unchanged for the legacy
parameterization). The React side never computes a matrix: every reducer in the space slice ends in
`commitCamera`, and a host-facing entry is a thunk in `plurid-react/source/services/logic/camera` plus a
pubsub topic. Verify it in the browser suite (`pnpm --filter plurid-render-test e2e`, scenarios in
`fixtures/render-test/e2e/`), which drives the real harness through Playwright.


A programmatic camera MOVE (something that goes somewhere: a framing, a preset, a bookmark, an animated delta) is a `cameraCommand` kind, never a bespoke `setCamera` call: add the kind to `CameraCommand` and its target to `resolveCameraTarget` in `plurid-react source/services/logic/camera/index.ts` (pure — unit-test it against the reducer), expose it through a topic in `usePluridPubSub` and, if it has a key, a `PLURID_SHORTCUTS` entry; the tween-or-jump, reduced-motion and interruption behavior come for free from `commitCameraTarget`. A Playwright scenario in `fixtures/render-test/e2e/navigation.spec.ts` pins the user-visible motion (mid-tween sample, exact landing, interruption).

### A public export

Add it to `plurid-react/source/index.tsx` — values in the `export { … }` block, **types in the
`export type { … }` block** (see the esbuild rule above). If it's a host escape-hatch primitive (a
selector, a logic helper), document it inline like the existing `pluridSelectors` / `arrangementSignature`.




### A pubsub topic's payload type

Nothing to add by hand: `PluridPubSubPayloads` is DERIVED from the publish-message union. Declare the `PluridPubSubMessage<Name>` / `PluridPubSubPublishMessage<Name>` / `PluridPubSubSubscribeMessage<Name>` interfaces in `plurid-data interfaces/external/pubsub/message.ts`, add them to the two unions, and `publish` / `subscribe` / `usePluridPubSub` are typed for the new topic.

### A hook or a handle command

A hook lives in `plurid-react source/services/hooks/<name>/index.ts` on `useEngineSelector` / `useEngineDispatch` (the engine's private context — never `react-redux`'s default hooks), returns memoized commands built on the SAME thunks the gestures and topics use, and is exported from `services/hooks/index.ts` and `source/index.tsx`. A handle command is a line in `PluridApplicationShell.getHandle()` (`containers/Application/index.tsx`) plus its type in `containers/Application/handle.ts`.

### A user-visible behavior

Gets a Playwright scenario in `fixtures/render-test/e2e/*.spec.ts` (camera / input / links / navigation / selection / rendering / bench), driven through the harness's `?flag=` surface and `window.__rt*` helpers — and a fixture in the catalog when it needs a scene (the visual baseline and the generic invariants then follow for free) — the browser suite is the gate that jsdom cannot be. Host-side tests use `@plurid/plurid-react/testing`.

## Publishing

The packages are a dependency CHAIN (`plurid-data → plurid-engine / plurid-pubsub → plurid-react → plurid-react-server → plurid-kit`, with `plurid-icons-react`, `plurid-ui-state-react` and `plurid-ui-components-react` feeding the React adapter). A new React adapter needs the engine APIs of the same round, so:

- THE CONSUMER CONTRACT (since 2026-09-05): an app installs `@plurid/plurid-react` plus `react`, `react-dom` and `styled-components` — everything else (`plurid-data`, `plurid-engine`, `plurid-pubsub`, `plurid-functions*`, `plurid-icons-react`, `plurid-themes`, `plurid-ui-components-react`, `plurid-ui-state-react`, `@reduxjs/toolkit`, `react-redux`) is a DEPENDENCY of the package that imports it (`workspace:^`, packed as `^0.0.0-N`), never a peer the app must declare. Only singletons stay peers: `react`, `react-dom`, `styled-components` everywhere; `react-redux` + `@reduxjs/toolkit` for `plurid-ui-components-react` (it connects to the HOST's store); `@plurid/plurid-react` for the server and the kit (one copy: React contexts); `@plurid/elementql-client-react` is an OPTIONAL peer of plurid-react (loaded lazily by the external plane); `puppeteer` an optional peer of the server (stills only).
- Bump and publish the CHANGED CHAIN TOGETHER, never one package alone. The peer ranges are `>=<the version of the sibling this round>` (not `*`), so an old sibling from the registry is refused instead of crashing at runtime; `devDependencies` keep `workspace:*` (pnpm rewrites them to the exact version on pack — `pnpm smoke.pack` fails if one survives).
- `pnpm verify` first. Its last three steps exist for the release: `check` (a type error in a translation table or a leaf package is invisible to `build`), `check.modules` and `smoke.pack` (the packed ESM + CommonJS entry points, which is how the styled-components / react-helmet-async interop breakage was found).
- Native Node ESM interop: `styled-components@6` resolves to its CommonJS build under Node — a plain `import styled from 'styled-components'` in our ESM output yields the `module.exports` object. `scripts/tsup/cjs-interop.mjs` (an esbuild plugin wired in the React, server, kit, icons and UI-components tsup configs, together with `noExternal` for the module) redirects the import through a shim that resolves the default and named exports for every interop shape, and keeps the real module external. Add a module to `INTEROP_MODULES` if another CommonJS peer is read through a default or named import.
- After publishing, install the published versions from the registry into a throwaway `"type": "module"` project and import every entry point (what `pnpm smoke.pack` does with local tarballs); the 2026-09-05 release was verified this way. Every `@plurid/*` peer resolves; `react-helmet-async` is no longer a dependency (the document model replaced it).

## Tests

- **Engine / data** logic: jest unit tests next to the code under `__tests__/`.
- **React hooks / components**: jsdom + `@testing-library/react` — add the
  `/** @jest-environment jsdom */` docblock and use `renderHook`.
- Some legacy suites are intentionally skipped with a reason comment (routing/matrix/faceToFace debt tracked
  in [`CONTEXT-MAP.md`](./CONTEXT-MAP.md) and the audit). Don't un-skip without making them pass.



## CI, versioning & style

- **CI** (`.github/workflows/ci.yml`) runs on **Node 24**: `pnpm install --frozen-lockfile` → `build` →
  `test` → `lint`. A PR must be green. If you change dependencies, commit the updated `pnpm-lock.yaml`
  (CI installs frozen).
- **Versioning** is [αver](https://github.com/ly3xqhl8g9/alpha-versioning) (the `0.0.0-N` package versions).
- **Build artifacts** (`distribution/`) are git-ignored; never commit them.
- **Style**: Prettier (`.prettierrc.json`) + the flat ESLint config. The source uses the `// #region` folding
  convention — keep it consistent with the surrounding file. Match the comment density and naming of the code
  you're editing.
