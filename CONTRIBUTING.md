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

Run from the root. These four are what CI enforces (plus `check`):

| Command | What it does | Notes |
|---|---|---|
| `pnpm build` | `tsup` (esbuild) builds every package → ESM + CJS + `.d.ts` | **Does NOT type-check.** esbuild transpiles per-file. |
| `pnpm --filter <pkg> check` | `tsc --noEmit` against the package's check config | This is the real type-check. Run it on packages you touch. |
| `pnpm test` | `jest` across the workspace | jest 30. Hook/DOM tests use jsdom. |
| `pnpm lint` | one flat-config ESLint 10 pass over the live source | Single root `eslint.config.mjs` — there are no per-package eslint configs. |
| `pnpm format` / `pnpm format.check` | Prettier write / check | |

Because **build ≠ type-check**, a change can build and ship a broken `.d.ts` or a type error that only `tsc`
catches. Before opening a PR: `pnpm build && pnpm test && pnpm lint`, plus `pnpm --filter <pkg> check` for
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

### A public export

Add it to `plurid-react/source/index.tsx` — values in the `export { … }` block, **types in the
`export type { … }` block** (see the esbuild rule above). If it's a host escape-hatch primitive (a
selector, a logic helper), document it inline like the existing `pluridSelectors` / `arrangementSignature`.



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
