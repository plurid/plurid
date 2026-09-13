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

Run from the root. **CI enforces every row of this table** (2026-09-13: the browser suite is three CI jobs, and `smoke.pack` joined the gates job); `pnpm verify` runs them all in order locally and is what to run at every build:

| Command | What it does | Notes |
|---|---|---|
| `pnpm build` | `tsup` (esbuild) builds every package → ESM + CJS + `.d.ts` | **Does NOT type-check.** esbuild transpiles per-file. |
| `pnpm --filter <pkg> check` | `tsc --noEmit` against the package's check config | This is the real type-check. Run it on packages you touch. |
| `pnpm test` | `jest` across the workspace | jest 30. Hook/DOM tests use jsdom. |
| `pnpm lint` | one flat-config ESLint 10 pass over the live source | Single root `eslint.config.mjs` — there are no per-package eslint configs. |
| `pnpm format` / `pnpm format.check` | Prettier write / check | |
| `pnpm e2e` (`pnpm --filter plurid-render-test e2e`) | Playwright against the render-test harness (`e2e/*.spec.ts`) | Needs `npx playwright install chromium` once; starts the Vite server itself. After rebuilding a workspace package, clear `fixtures/render-test/node_modules/.vite`. THREE projects, run as three commands on CI (see [Tests](#tests)): `chromium` (the behavioural scenarios), `perf` (the benchmark and the virtualization budgets, alone on a machine — `BENCH_STRICT=1` adds the absolute frame-time budgets on top of the always-on relative ones) and `visual` (a screenshot per fixture × viewpoint against `e2e/__snapshots__/<platform>/`, compared unconditionally; `darwin` and `linux` baselines are committed). `retries: 0` — a flake is a failure. |
| `pnpm docs.tables.check` | `docs/SHORTCUTS.md` and `docs/HARNESS.md` are current (generated from the shortcut tables and the harness's flag registry + fixture catalog) | Regenerate with `pnpm docs.tables`. |
| `pnpm check` | `tsc --noEmit` in EVERY package (`pnpm -r check`) | Every public package has a `check` script now; `pnpm build` alone would ship a type error (it transpiles per file). |
| `pnpm check.modules` | imports every published entry point under native Node ESM and CommonJS, from inside each package | Catches what bundled and jest gates cannot: a CommonJS peer read through a default import, a broken `exports` map. |
| `pnpm release` | preflight → bump the changed chain (+ its `>=` peer ranges) → `pnpm verify` → `pnpm -r publish` → tag | The whole release. `--dry-run` first, always. |
| `pnpm size` | measures every public package's published ESM (entry + chunks) gzipped against `configurations/size-budgets.json` | Fails over budget. `pnpm size --update` rewrites the budgets from disk — do that only for a deliberate change, in the same commit, with the reason in the message. A budget is the measurement rounded up to the next 5 KB with at least 2 KB of room. |
| `pnpm smoke.pack` | `pnpm pack` every public package, `npm install` the tarballs + peers into a throwaway ESM project, import every entry point both ways | The consumer's path end to end (needs the network; a minute). `--keep` leaves the project for inspection. |
| `pnpm verify` | build → check → test → lint → check.modules → size → docs.tables.check → browser suite → smoke.pack | The full local gate; what to run before a publish. |

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

Four traps: the suite REUSES a server already listening on 5273 (`reuseExistingServer`), so a server orphaned by a killed run keeps serving an old bundle — `lsof -nP -i :5273` before trusting a browser result; the regenerate decision lives in `visual.spec.ts` (from `testInfo.config.updateSnapshots`), never in the config, because a worker process does not see the CLI's arguments; a nested `test.use({ reducedMotion })` inside a `describe` did not reach the page (2026-09-06) — a scenario that needs an emulation makes its own `browser.newContext(...)`, as the touch scenarios do; and a plane's compositing layer includes everything it draws outside its box (its bridge, its controls bar), so an element of a plane that reaches PAST the parent's plane is split by Chrome's 3D sorting and everything outside the box disappears (the tilted leash, 2026-09-06 — now a band inside an axis-aligned box that ends at the parent's face). The budget is an absolute `maxDiffPixels` (120): a ratio let a 22×20 control vanish unnoticed.



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
[`docs/CONTROL_SURFACE.md`](./CONTROL_SURFACE.md)).

Docs are part of the checklist: a new topic, knob, or export also updates
[`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) (the topic catalog / Appendix A inventory) and
[`docs/CONTROL_SURFACE.md`](./CONTROL_SURFACE.md) (the quick reference).

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
**`pnpm release` does the whole thing** (`scripts/release.mjs`, added 2026-09-13 — there was no release
automation at all before it, and the cost showed: the 2026-09-05 round was bumped and then never
published, so the workspace integers sat one ahead of npm for eight days and nothing said so).

```bash
pnpm release --dry-run     # say exactly what would happen, touch nothing (works on a dirty tree)
pnpm release               # bump what changed → pnpm verify → publish → tag
pnpm release --skip-verify # only if you just ran the gate
pnpm release --no-bump     # publish the versions as they stand
pnpm release --force       # publish even though CI is red or still running
```

It refuses to run on a dirty tree, off `master`, out of sync with `origin`, or unauthenticated — **and
it refuses while CI on that commit is red or still running**, because a publish cannot be taken back and
CI is the only independent check that the picture gate, the browser suite and the container run pass.
`--force` is the escape and names what it is overriding. A run it cannot find (no `gh`, no CI on a fork)
only warns: absence of evidence is not evidence of a failure. **What counts as changed** is a package's SHIPPED source
(`source/**` minus `__tests__`) since the last `release/<date>` tag — tests do not ship, so a test-only
change is not a release. With no tag yet it falls back to "the workspace version is ahead of the
registry", which is what a hand-bump leaves behind. Publishing itself is `pnpm -r publish`, which walks
the workspace topologically and skips anything already on the registry.

After publishing it prints the one check nothing else can do — see the note on `smoke.pack` below.

- Bump and publish the CHANGED CHAIN TOGETHER, never one package alone. The peer ranges are `>=<the version of the sibling this round>` (not `*`), so an old sibling from the registry is refused instead of crashing at runtime; `devDependencies` keep `workspace:*` (pnpm rewrites them to the exact version on pack — `pnpm smoke.pack` fails if one survives).
- `pnpm verify` first. Its last three steps exist for the release: `check` (a type error in a translation table or a leaf package is invisible to `build`), `check.modules` and `smoke.pack` (the packed ESM + CommonJS entry points, which is how the styled-components / react-helmet-async interop breakage was found).
- Native Node ESM interop: `styled-components@6` resolves to its CommonJS build under Node — a plain `import styled from 'styled-components'` in our ESM output yields the `module.exports` object. `scripts/tsup/cjs-interop.mjs` (an esbuild plugin wired in the React, server, kit, icons and UI-components tsup configs, together with `noExternal` for the module) redirects the import through a shim that resolves the default and named exports for every interop shape, and keeps the real module external. Add a module to `INTEROP_MODULES` if another CommonJS peer is read through a default or named import.
- After publishing, install the published versions from the registry into a throwaway `"type": "module"` project and import every entry point (what `pnpm smoke.pack` does with local tarballs); the 2026-09-05 release was verified this way. Every `@plurid/*` peer resolves; `react-helmet-async` is no longer a dependency (the document model replaced it).

## Tests

### The five rules (2026-09-13)

A suite is only worth its runtime if a green run MEANS something. These five are what the testing pass
installed; three of them are enforced by a tool rather than by convention.

1. **A test waits on STATE, never on TIME.** Every wait is a state predicate, a frame step, or a knob that
   removes the delay. *Lint-enforced*: `page.waitForTimeout` is a `no-restricted-syntax` error inside
   `fixtures/render-test/e2e/**` — use `waitForState` / `afterFrames` / `waitQuiet` / `expect.poll` from
   `e2e/helpers.ts`. (The browser suite went from 71 sleeps and 16.8 s of dead clock to zero.)
2. **A budget is relative to the RUN.** An absolute millisecond is a property of the machine; it lives
   behind `BENCH_STRICT=1`. What always runs is the shape — a p95 against the run's own median, with the
   single worst frame held only to a separate freeze ceiling.
3. **A test drives the SEAM it claims to test.** Setup may reach into the store; the behaviour under test
   may not. A test named "a drag" drives a pointer; a test of a pubsub topic publishes on the bus.
4. **A gate that does not run is not a gate** — and a new gate is not finished until it has been PROVEN to
   bite: break the thing it guards, watch it go red, restore.
5. **One toolkit per layer.** `@plurid/plurid-react/testing` (`renderPlurid`, `gestures`,
   `installFrameClock`, `makeSpaceStore`, `motionStub`, `expectCamera`) and `e2e/helpers.ts` are the
   vocabularies. A new test composes them; it does not copy a snippet.

### Where a test goes

- **Engine / data** logic: jest unit tests next to the code under `__tests__/`.
- **React hooks / components**: jsdom + `@testing-library/react` — add the
  `/** @jest-environment jsdom */` docblock and use `renderHook`, or `renderPlurid` for a whole application.
- **A host-facing seam** (a pubsub topic, a handle command): drive it as a host does — publish on the bus
  the application handed back, and assert the STATE, never the dispatch
  (`plurid-react source/containers/Application/View/hooks/__tests__/pubsub.test.tsx`).
- **Anything a reader can see**: a Playwright scenario in `fixtures/render-test/e2e/`.
- **Nothing is skipped.** The repository has zero `describe.skip` / `it.skip` / `test.fixme` (verified
  2026-09-13; the routing / matrix / faceToFace debt this line used to point at was either fixed or
  deleted, and the CONTEXT-MAP section it referenced never existed). If you need to park a test, prefer
  deleting it with the code it guards — a skipped test is a gate that does not run.

### The three browser commands

The browser suite is three Playwright projects, because the three ask different questions and must not
share a machine. From `fixtures/render-test`:

```bash
npx playwright test --config e2e/playwright.config.ts --project=chromium   # the behavioural scenarios
npx playwright test --config e2e/playwright.config.ts --project=perf       # the frame budgets, ALONE
npx playwright test --config e2e/playwright.config.ts --project=visual     # the committed pictures
```

`pnpm e2e` still runs all three. `perf` is separate because a 240-frame benchmark run beside 160 other
tests measures the runner, not the engine — that is how CI #53 failed. **Nothing retries** (`retries: 0`):
a flake is a failure, and is to be fixed as one.

### The visual baseline ritual

A baseline exists PER PLATFORM under `e2e/__snapshots__/<platform>/`, and a run on a platform with a
baseline compares — always, no opt-in flag. `darwin` baselines are generated on this machine; `linux`
baselines are generated in the PINNED official container, which is the same image CI uses, so the bytes
are expected to match:

**THE ORIGIN IS IN THE PICTURE.** A plane's bar renders its full route — `plurid://<host>:<port>/path` —
so the address the harness was served from is part of every screenshot showing a bar. The baselines must
therefore be taken against **`http://localhost:5273`**, the address CI serves from; `visual.spec.ts`
refuses any other origin, naming the one it found. (2026-09-13: 28 `linux` baselines went in reading
`host.docker.internal:5273` and CI failed them all against its own `localhost:5273` — a ~3000-pixel text
diff with no other difference. That guard is why it cannot happen twice.)

```bash
# darwin, from fixtures/render-test
npx playwright test --config e2e/playwright.config.ts --project=visual --update-snapshots
```

**linux** is awkward on a mac and worth reading twice. The container has no `pnpm`, so its `webServer`
command (`pnpm dev`) exits 127; and the repository's `node_modules` is a darwin install, so `vite` inside
the container dies on rollup's missing native binding. Both of the obvious routes are therefore closed.
The two that work:

1. **Take them from CI** — the simplest, and exact by construction. Let the `visual` job fail, then
   download its `visual-diff` artifact: every `*-actual.png` in it is the picture CI renders, so copying
   those over the corresponding baselines IS the regeneration. Verify with route 2 before pushing.
2. **Reproduce CI's origin locally** — serve from the host, but present it as `localhost:5273` inside the
   container with a TCP proxy, so the bars render the same string CI renders:

```bash
# from the repository root, with the harness served on the host:
(cd fixtures/render-test && npx vite --port 5273 --strictPort --host &)
docker run --rm --add-host=host.docker.internal:host-gateway \
    -v "$PWD":/work -w /work/fixtures/render-test \
    mcr.microsoft.com/playwright:v1.62.1-noble \
    bash -lc 'node -e '"'"'require("net").createServer(c=>{const u=require("net").connect(5273,"host.docker.internal");c.pipe(u);u.pipe(c);c.on("error",()=>u.destroy());u.on("error",()=>c.destroy())}).listen(5273,"127.0.0.1")'"'"' &
              for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:5273 && break; sleep 1; done
              npx playwright test --config e2e/playwright.config.ts --project=visual'
```

On CI none of this applies — the container IS the runner, installs pnpm and builds inside Linux, so
`pnpm dev` works there.

Never regenerate on a broken build, and never regenerate to make a red run green. **A picture changes only
with a reason written in the commit** — a changed baseline with no reason is an unreviewed visual
regression.

### Coverage floors

Every package's `coverageThreshold` is its own MEASURED coverage on the day it was set, rounded down to a
multiple of five — and one step further where that would have left under a point of room
(`configurations/jest.config.js`). The extra step matters: a floor sitting exactly ON its measurement (two
did) goes red the first time anyone adds an uncovered function, which is a failure about nothing, and a
gate that cries wolf gets raised until it means nothing. Every floor now keeps 1–5 points of slack, which
still fails a package that loses a test file.

A floor from reality cannot be cargo-culted and cannot silently rot. Floors only ever move UP — when a
package's coverage rises, raise its floor in the same commit that earns it.

### What CI actually runs

`.github/workflows/ci.yml`, four jobs on Node 24:

| Job | Steps |
|---|---|
| `gates` | `build` → `test` → `lint` → `check` → `check.modules` → `size` → `docs.tables.check` → `smoke.pack` |
| `browser` | the `chromium` project (needs `gates`) |
| `perf` | the `perf` project, alone on its runner (needs `gates`) |
| `visual` | the `visual` project INSIDE `mcr.microsoft.com/playwright:v1.62.1-noble`; uploads the differing pictures on failure (needs `gates`) |



## CI, versioning & style

- **CI** (`.github/workflows/ci.yml`) runs on **Node 24**, in four jobs: `gates`
  (`install --frozen-lockfile` → `build` → `test` → `lint` → `check` → `check.modules` →
  `docs.tables.check` → `smoke.pack`), then `browser`, `perf` and `visual` in parallel behind it. A PR
  must be green in all four, and nothing retries. If you change dependencies, commit the updated
  `pnpm-lock.yaml` (CI installs frozen).
- **Versioning** is [αver](https://github.com/ly3xqhl8g9/alpha-versioning) (the `0.0.0-N` package versions).
- **Build artifacts** (`distribution/`) are git-ignored; never commit them.
- **Style**: Prettier (`.prettierrc.json`) + the flat ESLint config. The source uses the `// #region` folding
  convention — keep it consistent with the surrounding file. Match the comment density and naming of the code
  you're editing.
