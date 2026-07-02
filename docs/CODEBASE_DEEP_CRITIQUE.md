# Plurid Codebase Deep Critique

Generated: 2026-06-19

> **Historical snapshot (2026-06-19).** Since this was written: canvas/html/routes-server were
> archived + de-globbed (`pnpm-workspace.yaml`); `CONTEXT-MAP.md` was added (the governance lens
> this doc asked for); `@plurid/plurid-kit` was added (`docs/FRAMEWORK_PLAN.md`); the architecture
> reference is now `docs/ARCHITECTURE.md`. Individual findings below may be resolved - the
> MAINTAINED ledgers are `docs/ENGINE_AUDIT_AND_ROADMAP.md` and `docs/FRAMEWORK_PLAN.md`; read
> this doc for the analysis, not for current state.

This document is a broad codebase critique of the current monorepo. It focuses on architecture, correctness risks, performance, build health, testing, package structure, stale surfaces, and product/feature opportunities.

It is complementary to `docs/ENGINE_AUDIT_AND_ROADMAP.md`, which already gives a detailed engine-centered roadmap. This file widens the lens to the entire repository and calls out repo-level governance and product-shape issues as well.

## Scope And Method

The review covered:

- Root workspace configuration, scripts, lockfile, README, docs, and package layout.
- The active `plurid-web` core and works packages.
- Utility packages under `packages/plurid-utilities`.
- Fixtures and generator templates.
- Browser extension, native prototypes, and specification/about folders where they affect codebase health.
- Verification runs: `pnpm test`, `pnpm build`, `pnpm lint`.

No project-specific context files such as `CONTEXT.md`, `CONTEXT-MAP.md`, or ADRs were found, so domain language in this critique is inferred from code and existing docs.

## Executive Assessment

Plurid has a strong core idea: a plane tree, spatial routing, and render adapters can form a distinctive application model. The repository already contains many of the pieces: engine logic, React rendering, SSR, themes, UI components, route matching, pubsub, templates, and exploratory native/browser-extension work.

The main problem is not lack of code. The main problem is that too much code is simultaneously active, stale, partly migrated, and weakly governed. The repo has modernized pieces next to archived experiments, structural-sharing tree functions next to mutating tree functions, real engine tests next to placeholder tests, and workspace scripts that do not cover everything that looks like a package.

The most important strategic move is to make the live system smaller and deeper:

- Define the live product surface.
- Archive or isolate non-live surfaces.
- Give the plane tree, route grammar, and React application view narrow interfaces.
- Make lint/test/build gates reliable.
- Add targeted behavioral tests around the spatial engine and React adapter.

If those moves are made, most other improvements become incremental instead of sprawling.

## Verification Snapshot

### Test

Command:

```sh
pnpm test
```

Result: passed.

Important caveat: the passing test suite is much less reassuring than it looks. The workspace ran 14 of 17 projects. Several packages have only sanity tests, many report effectively 0% useful coverage, and `@plurid/plurid-engine` still has skipped suites and skipped tests in exactly the areas that define the product model: matrices, quaternions, transforms, routing, and face-to-face layout.

Notable results:

- `@plurid/plurid-engine`: 12 suites passed, 8 skipped; 35 tests passed, 37 skipped.
- `@plurid/plurid-functions`: 7 suites passed, 18 tests.
- `@plurid/plurid-pubsub`: 2 suites passed, 3 tests, but behavior assertions are thin.
- `@plurid/plurid-react`: sanity test only.
- `@plurid/plurid-ui-components-react`: sanity test only.
- `@plurid/generate-plurid-app`: sanity test only.
- `@plurid/plurid-routes-server`: sanity test only.

### Build

Command:

```sh
pnpm build
```

Result: passed.

Important warnings:

- Repeated `emitDecoratorMetadata` warnings from `tsup` because `@swc/core` is not installed.
- Direct `eval` warnings in `@plurid/plurid-functions` SHA/UUID code.
- Default-and-named-export warnings in several packages.
- `fixtures/render-test` generated a large production chunk: about 724 KB before gzip.

Notable bundle sizes from the build output:

- `@plurid/plurid-react`: about 269 KB ESM, 283 KB CJS.
- `@plurid/plurid-icons-react`: about 235 KB ESM.
- `@plurid/plurid-ui-components-react`: about 157 KB ESM.
- `@plurid/plurid-engine`: about 90 KB ESM.
- `@plurid/plurid-data`: about 86 KB ESM.
- `@plurid/plurid-themes`: about 61 KB ESM.

### Lint

Command:

```sh
pnpm lint
```

Result: failed.

The failure occurs at `@plurid/plurid-data`:

```text
ESLint couldn't find a configuration file.
```

The package has `configurations/.eslintrc.js`, but the script runs:

```sh
eslint ./source --ext .ts,.tsx
```

without `-c configurations/.eslintrc.js`. This means the root lint gate is currently not enforceable.

## Repository Shape

The root workspace includes:

- `packages/plurid-web/plurid-core/*`
- `packages/plurid-web/plurid-works/*`
- `packages/plurid-utilities/*`
- `fixtures/render-test`

There are about 1,700 tracked-looking source/config files visible through `rg --files`, with about 1,100 files under `source/` directories and roughly 84,000 lines under those source trees.

The active package graph appears to be:

- `@plurid/plurid-data`: shared constants, interfaces, enums, route data, theme data.
- `@plurid/plurid-engine`: spatial tree, layout, routing helpers, math.
- `@plurid/plurid-pubsub`: event bridge.
- `@plurid/plurid-react`: primary runtime/render adapter.
- `@plurid/plurid-react-server`: SSR/static/stills server.
- `@plurid/plurid-routes-server`: route server.
- `@plurid/plurid-functions`, `@plurid/plurid-functions-react`: utilities.
- `@plurid/plurid-themes`, `@plurid/plurid-icons-react`, `@plurid/plurid-ui-components-react`, `@plurid/plurid-ui-state-react`: UI support.
- `@plurid/generate-plurid-app`: scaffolding CLI.

Other surfaces exist but are not clearly live:

- `@plurid/plurid-canvas`, excluded from root build/test.
- `@plurid/plurid-html`, excluded from root build/test.
- Browser extension package under `packages/plurid-web/plurid-browser/...`, not included in workspace patterns.
- Native SwiftUI prototype under `packages/plurid-native`.
- `about/` and specification materials.
- Numerous legacy fixtures and generator templates.

The repo would be easier to reason about if it explicitly separated:

- Live product packages.
- Experimental packages.
- Archived packages.
- Fixtures/templates.
- Published but legacy compatibility packages.

Right now those categories are implied by folder names, old scripts, and root filters. That is not enough governance for a monorepo of this size.

## Highest-Risk Findings

### 1. The Lint Gate Is Broken

The root `pnpm lint` fails before it can lint the workspace. That makes every other quality rule aspirational.

Impact:

- Regressions in TypeScript, import hygiene, unused code, and style are not consistently caught.
- Packages with weak local tests can merge broken behavior without a second line of defense.
- Future cleanup work becomes riskier because automated feedback is unreliable.

Fix direction:

- Add a root ESLint config or make every package script explicitly pass its config.
- Prefer one shared config with package-level overrides only where required.
- Make root lint run in CI and fail on warnings once the baseline is cleaned up.

### 2. Test Green Does Not Mean Product Green

The root test suite passes, but many packages only assert that a placeholder exists. The most important runtime package, `@plurid/plurid-react`, has no meaningful interaction or render tests.

High-value missing coverage:

- Plane spawn/remove/toggle behavior.
- Layout recomputation after viewport resize.
- Route matching with parameters, queries, wildcards, and nested plane structures.
- Link-to-plane coordinate assignment.
- Pointer/orbit/fly controls at reducer and adapter levels.
- SSR/static still generation failure modes.
- Generator CLI option paths.

The engine has meaningful tests, but 37 tests are skipped. Skipped tests in core math, transform, layout, and routing modules should be treated as open debt, not neutral test inventory.

### 3. The Plane Tree Implementation Mixes Immutable And Mutating Logic

`packages/plurid-web/plurid-works/plurid-engine/source/modules/space/tree/logic.ts` contains both newer structural-sharing functions and older functions that mutate nested structures after shallow clones.

Examples:

- `updateTreePlane`, `updateTreeWithNewPlane`, and `updatePlaneLocation` are mostly immutable.
- `updateTreeWithNewPage` mutates `updatedTreePlaneParent.children.push(...)` after shallow cloning the parent, leaving shared child arrays at risk.
- `removePageFromTree` mutates `page.children`.
- `toggleAllChildren` mutates `plane.children` and `plane.show`.
- `removePlaneFromTree` mutates `plane.children`.
- `togglePlaneFromTree` looks mostly immutable but calls mutating child logic.

This is the kind of inconsistency that causes React identity bugs, stale renders, and hard-to-reproduce state corruption. The existing engine audit already identifies this modernization track; it should remain one of the top priorities.

Fix direction:

- Make the tree module either fully immutable or clearly split mutable helpers from immutable public functions.
- Export a small tree transaction interface instead of many low-level functions.
- Add identity-focused tests: unchanged branches retain identity, changed branches get new identity, no input tree is mutated.
- Remove defensive deep clones from reducers after the tree module itself guarantees immutability.

### 4. Parametric Route Logic Contains Stubs That Can Produce Wrong Planes

`space/tree/logic.ts` has route functions that look unfinished:

- `isParametric(viewRoute, planeRoute)` currently returns `true` unconditionally.
- `matchForParameters` is a stub.
- `assignPagesFromView` creates parametric copies for every plane in some branches.
- The parametric branch shallow-clones a plane and then mutates nested `routeDivisions`, which can mutate the original object.

This is a correctness hazard. Even if current routing happens to hide it, the code advertises behavior it does not implement.

Fix direction:

- Either complete parametric matching or remove/disable the branch.
- Add tests for route parameters, invalid parameters, repeated parameters, query strings, and nested route expansion.
- Avoid mutating nested route division objects during matching.

### 5. React Rendering Still Selects Too Much Global State

`@plurid/plurid-react` has recent improvements, but the rendering seam is still broad:

- `Root` selects the whole tree and recomputes children from `plane` and `stateTree`.
- `Plane` selects the whole tree and resolves parent planes from the tree during render.
- `View` maps many unrelated pieces of global state and dispatch into one 1,500-line component.
- `Link` combines route construction, DOM geometry, coordinate matching, Redux dispatch, and render logic.

This keeps the implementation workable for small trees but makes larger plane sets expensive and fragile.

Fix direction:

- Introduce a plane index keyed by `planeID`.
- Select by ID instead of whole tree wherever possible.
- Move DOM geometry and link assignment into a small adapter service with tests.
- Split `View` into controller, input, layout, pubsub, and render-shell modules.
- Memoize `Plane`, `Root`, and link-heavy subtrees around narrow props.

### 6. Route Grammar Is Duplicated Across Modules

Routing logic appears in several places:

- Engine tree matching.
- `Parser`.
- `IsoMatcher`.
- React router service.
- Link route construction.
- Server/static route handling.

There have already been fixes around query extraction, candidate continuation, and parameter validation. Those fixes are useful, but the deeper issue is that there is no single route grammar interface.

Impact:

- A route can be valid in one layer and invalid in another.
- Query parsing can diverge between client and server.
- Parametric matching can behave differently in engine and SSR.
- Future route features will require broad edits.

Fix direction:

- Create one canonical route grammar package or module.
- Export parse, normalize, compare, match, stringify, and query utilities.
- Make engine, React adapter, SSR, and generator templates depend on that interface.
- Build a route conformance test matrix and run it from all relevant packages.

### 7. The Generator Can Fail In Normal CLI Use

> **SUPERSEDED (2026-07):** `docs/FRAMEWORK_PLAN.md` P5 reworks the generator to emit the plurid-kit shape; the kit owns bundling.

`@plurid/generate-plurid-app` has a CLI option path bug:

- The command action destructures `versioning`.
- The command options do not define `--versioning`.
- `process/index.ts` calls `program.versioning.toLowerCase()`.

That can throw for non-interactive command usage.

The generator also swallows command failures:

- `executeCommand` logs errors but resolves.
- `exec` callbacks in template setup do not consistently check `error`.
- File copying through streams does not give callers a reliable completion/failure signal.

Impact:

- Generated apps can be half-created but reported as successful.
- Failed installs can be hidden.
- CLI tests will not catch this because the package only has a sanity test.

Fix direction:

- Add integration tests around CLI argument combinations.
- Define `--versioning` or give it a default before calling `.toLowerCase()`.
- Make command execution reject on non-zero exit.
- Use `fs.promises.cp` or awaited stream completion for template copying.
- Move modern templates to Vite-first defaults and archive CRA templates.

### 8. Server Packages Own Process-Level Behavior

Both server packages install process signal handlers in constructors and call `process.exit(0)` on `SIGINT`.

Impact:

- Multiple server instances add multiple handlers.
- Embedding these libraries in another app changes the host process behavior.
- Tests and programmatic use become harder.

Fix direction:

- Move signal handling to CLI entrypoints.
- Keep library classes side-effect-light.
- Expose `start`, `stop`, and optional `attachSignalHandlers` separately.

### 9. Package Surfaces Are Larger Than Consumers Need

Several packages export large default objects or all-in-one barrels:

- `@plurid/plurid-icons-react` imports and exports all icons; `treeshake` is disabled.
- `@plurid/plurid-ui-components-react` imports broad component bundles; `treeshake` is disabled.
- `@plurid/plurid-data` includes all internationalization data in the main bundle path.
- `@plurid/plurid-themes` imports all themes and default-exports an object.

Impact:

- Bundle sizes stay high even for small consumers.
- Tree-shaking depends heavily on bundler behavior.
- Default object exports make selective import harder.

Fix direction:

- Add subpath exports for icons, locales, themes, and component groups.
- Avoid default aggregate objects on hot consumer paths.
- Enable `treeshake` where safe and test bundle output.
- Use generated entrypoints rather than hand-maintained broad barrels.

### 10. Workspace Governance Does Not Cover Everything That Looks Live

> **DONE (2026-06-21):** `CONTEXT-MAP.md` is exactly this lens - per-package live/legacy/experimental status + gate coverage.

The root workspace excludes some packages by pattern and root scripts exclude others by filter:

- `@plurid/plurid-canvas` excluded from root build/test.
- `@plurid/plurid-html` excluded from root build/test.
- Browser extension package is outside workspace patterns.
- Native prototype is outside normal package governance.

This may be intentional, but the repo does not make the distinction explicit enough.

Fix direction:

- Add a package status table: live, legacy, experimental, archived.
- Move archived code under an explicit `archive/` folder or remove from workspace-like locations.
- Add CI jobs for each live package.
- Do not let an untested package look first-class in docs.

## Architecture Critique

### The Core Domain Needs Three Deep Modules

The codebase wants three deep modules:

1. Plane tree.
2. Route grammar.
3. Render adapter.

Each should have a small public interface and a large private implementation.

Today, the opposite is often true. Callers reach into low-level details, pass raw tree objects around, parse routes in multiple places, and mix DOM geometry with application behavior.

The desired shape is:

```text
Application code
  -> route interface
  -> plane tree interface
  -> render adapter interface
       -> React implementation
       -> SSR implementation
       -> future native/canvas/html implementations
```

The current shape is closer to:

```text
Application code
  -> React View
       -> Redux state
       -> tree functions
       -> router functions
       -> pubsub
       -> DOM geometry
       -> controls
       -> render
       -> server/static assumptions
```

That makes changes expensive because every concept is nearby every other concept.

### Plane Tree Interface

The plane tree should answer a small set of questions:

- What is the current tree?
- What are the visible planes?
- What is the root index?
- How do I add, remove, toggle, or move a plane?
- How do I recompute layout for a new viewport/configuration?
- How do I resolve a plane by ID or route?

The implementation can then handle:

- Structural sharing.
- Layout algorithms.
- Parent/child invariants.
- Route-derived plane insertion.
- Bridge location and orientation.
- Index maintenance.

This should become the deepest module in the repo. React should not need to know how a root tree is traversed, how child arrays are spliced, or how parametric planes are cloned.

### Route Grammar Interface

The route grammar should be canonical. It should own:

- Normalization.
- Query extraction.
- Parameter extraction.
- Wildcard/partial matching.
- Route-plane comparison.
- Stringification.
- Validation.

The current code has a useful but scattered implementation. Consolidating route grammar would reduce bugs across engine, React, SSR, and generator templates.

### Render Adapter Interface

`@plurid/plurid-react` should be an adapter over the domain model, not the center of the model.

Good adapter responsibilities:

- Subscribe to state.
- Render planes.
- Attach pointer/keyboard controls.
- Measure DOM geometry.
- Dispatch user intentions.

Responsibilities to move out:

- Route matching semantics.
- Tree mutation/recomputation semantics.
- Layout identity preservation.
- Link matching rules.
- Pubsub protocol details.

This split would also make `plurid-html`, `plurid-canvas`, and native prototypes easier to evaluate. If they cannot implement the adapter interface, they are not live implementations yet.

## Correctness Risks And Bugs

### Hook Order Depends On Context Invariants

Several React components return before all hooks have run:

- `Root` calls `useContext`, then may return before later hooks.
- `Plane` follows a similar pattern.
- `Link` calls `useContext`, returns if context is missing, and later uses more hooks.

This is only safe if the context availability never changes across renders for a mounted component. That may be true today, but the component does not enforce it.

Fix direction:

- Call all hooks unconditionally.
- Put conditional behavior after hook declarations.
- Or split context-required internals into child components mounted only after context exists.

### Link Coordinate Matching Uses A Weak Predicate

`Link` assigns a tree plane to link coordinates using a coordinate comparison that accepts either matching `x` or matching `y`.

That can attach a link to the wrong plane if two planes share one coordinate axis. Spatial layouts often align rows or columns, so this is not an edge case.

Fix direction:

- Use a full coordinate identity predicate or a stable plane ID.
- Prefer `planeID` over coordinate matching where possible.
- Add tests with aligned planes sharing only one axis.

### Link Geometry Is DOM-Manual And Transform-Sensitive

`Link` walks DOM offsets manually to compute coordinates. This is fragile with:

- CSS transforms.
- Scroll containers.
- Positioning contexts.
- Browser zoom.
- Nested transformed roots.

Fix direction:

- Prefer `getBoundingClientRect()` for viewport geometry.
- Convert through one explicit coordinate transform utility.
- Test with nested scroll and transformed containers.

### Resize Root Matching Is Better But Still Conceptually Incomplete

Recent work replaces an O(roots^2) resize merge with a map keyed by route and rounded location. That is a clear performance improvement.

The remaining conceptual issue is identity. If roots should persist across layout changes even when location changes materially, then route plus location is not enough. The stable key should be a root/plane identity assigned by the tree model.

Fix direction:

- Decide whether spawned descendants should survive major layout changes.
- If yes, preserve by stable `planeID` or root key, not location.
- If no, document that large layout changes can reset derived child trees.

### Close Plane Still Uses A Timed Tree Dispatch

`View` still contains a `setTimeout(..., 50)` dispatch after close-plane logic. The existing comment marks this as a hack.

Timed state correction is brittle because it depends on render scheduling and event timing.

Fix direction:

- Finish immutable tree updates.
- Make close-plane a single reducer transaction.
- Add a regression test for closing a plane with visible children.

### Parametric Plane Assignment Mutates Nested Route Divisions

The parametric branch in tree assignment shallow-clones a plane and mutates nested `routeDivisions`. If the nested object is shared, the source route data can be corrupted.

Fix direction:

- Deep-copy only the nested route division fields being changed.
- Better: return a new route division object from a pure route matcher.

### Generator Template Copying Has Weak Completion Guarantees

The generator copies files using streams but does not consistently await stream finish or reject stream errors.

Fix direction:

- Use `fs.promises.cp` on supported Node versions.
- Or wrap streams in `pipeline()`.
- Make all setup steps fail-fast with actionable errors.

### Static/Stills Rendering Fails Late If Puppeteer Is Missing

`Stiller` tries to require Puppeteer and logs an error if it fails, but later rendering can fail with a less useful undefined dependency.

Fix direction:

- Fail construction immediately when Puppeteer is required but unavailable.
- Or make Puppeteer an explicit injected dependency.
- Reuse browser instances instead of launching one browser per route.

## Performance Critique

### Whole-Tree Selection Creates Ongoing Render Pressure

The major React performance risk is broad state selection:

- Planes select the whole tree.
- Roots depend on the whole tree.
- Parent lookups happen by walking the tree during render.
- The large `View` component maps and dispatches many unrelated concerns.

This is manageable for small examples but not for large spatial applications.

Fix direction:

- Maintain a normalized plane index in state or derived memoized selector.
- Use per-plane selectors.
- Memoize plane components.
- Keep layout recomputation outside render.
- Add render-count tests or Playwright-based performance assertions.

### Pointer And Fly Controls Can Dispatch Too Broadly

Pointer/orbit/fly behavior still routes through global state actions. The fly loop runs every animation frame while first-person mode is enabled, even if no movement key is active.

Fix direction:

- Start the animation loop only when movement is active or pointer lock is engaged.
- Stop it when idle.
- Keep high-frequency transient control state outside Redux where possible.
- Commit only meaningful view transform changes to global state.

### Large Bundles Come From Aggregate Exports

The build passes, but bundle sizes are high for support packages:

- Icons bundle all icons.
- UI components bundle large groups.
- Data bundles all locale data.
- Themes bundle all themes.

Fix direction:

- Publish subpath exports:
  - `@plurid/plurid-icons-react/add`
  - `@plurid/plurid-themes/dark`
  - `@plurid/plurid-data/locales/en`
  - `@plurid/plurid-ui-components-react/dropdown`
- Keep aggregate exports for convenience but mark them as convenience paths, not hot paths.
- Track fixture bundle size in CI.

### Server-Side Rendering Launches Too Much Work Per Route

Static still generation appears to launch browser work per route. Browser launch is expensive.

Fix direction:

- Launch once per generation job.
- Reuse pages or browser contexts.
- Add concurrency limits.
- Add timeouts and route-level error reporting.

## Testing Critique

The test suite needs fewer placeholder tests and more contract tests.

Highest-value test suites:

- Plane tree immutability and identity.
- Route grammar conformance.
- Link coordinate assignment.
- Resize layout preservation.
- Close/toggle/remove plane transactions.
- React render-count tests for common interactions.
- Generator CLI integration tests.
- Server constructor and shutdown behavior.
- Stiller error handling and browser reuse.

Skipped engine suites should be treated as a roadmap:

- Matrix.
- Matrix3D.
- Quaternion.
- Transform.
- Route resolve/divide.
- Face-to-face layout.
- IsoMatcher foreign/simple cases.

The goal is not maximum coverage. The goal is behavioral coverage around the domain seams that make Plurid different from ordinary React apps.

## Build And Tooling Critique

### Package Tooling Is Partly Modernized

Many packages build with `tsup`, but old tooling remains:

- Rollup packages.
- `ttypescript`.
- `@zerollup/ts-transform-paths`.
- Webpack in old templates and extension code.
- CRA templates.
- Repeated package-level TypeScript and ESLint configs.

This is normal during migration, but the repo should now pick a target state.

Fix direction:

- Standardize library packages on `tsup`.
- Standardize apps/fixtures/templates on Vite unless there is a specific reason not to.
- Remove legacy transform tooling after import paths are clean.
- Add a root `tsconfig.base.json`.
- Add one shared ESLint config.

### Direct Distribution Imports Couple Source To Build Output

Some React source files import themes from `@plurid/plurid-themes/distribution`.

Impact:

- Source code depends on another package's built directory.
- Local development can break if distribution is stale.
- Package exports are bypassed.

Fix direction:

- Import from `@plurid/plurid-themes`.
- Ensure package exports expose the needed paths.
- Make workspace builds depend on source/package exports, not built internals.

### Build Warnings Should Become Backlog Items

The current build warnings are not all urgent, but they are useful signals:

- Remove or justify `eval` in functions.
- Resolve `emitDecoratorMetadata` warnings by removing the option if unused or installing/configuring the expected SWC plugin.
- Avoid default-and-named export ambiguity where possible.
- Track large fixture chunks.

## Package Notes

### `@plurid/plurid-engine`

Strengths:

- Contains the real domain model.
- Has the most meaningful tests in the repo.
- Recent work appears to have improved root resize merging and tree identity.

Problems:

- Tree logic is too large and too mixed.
- Some route parameter functions are stubs.
- Mutating and immutable helpers coexist.
- Layout modules contain duplicated row/column logic.
- Important test suites are skipped.

Recommended direction:

- Split tree logic into public transaction interface plus private traversal/layout helpers.
- Complete immutability work.
- Consolidate row/column grid layout code.
- Make route matching depend on canonical route grammar.
- Turn skipped tests into active tests or delete obsolete expectations.

### `@plurid/plurid-react`

Strengths:

- It is the primary working adapter.
- It has recent targeted fixes and performance-minded changes.
- It integrates tree, routing, controls, links, and state into a usable runtime.

Problems:

- `View` is too large and owns too many concerns.
- `Root`, `Plane`, and `Link` depend on broad state.
- Hook ordering depends on context invariants.
- Link geometry and assignment are fragile.
- Timed dispatch remains after close-plane.
- Tests do not cover runtime behavior.

Recommended direction:

- Split `View` into smaller modules.
- Introduce per-plane selectors and a plane index.
- Move link geometry into a tested utility.
- Add component/integration tests through the render fixture.
- Add performance budgets for plane count and interaction loops.

### `@plurid/plurid-react-server`

Strengths:

- Provides SSR/static/stills concepts that are valuable for a spatial app model.
- Has some tests around Stiller behavior.

Problems:

- Server constructors attach process signal handlers.
- Puppeteer dependency failure is handled late.
- Browser launch strategy appears expensive.
- Server file is large and multipurpose.

Recommended direction:

- Move signal handling to CLI.
- Make Puppeteer explicit and fail-fast.
- Reuse browser instances for still generation.
- Split server concerns: routing, rendering, static assets, lifecycle.

### `@plurid/plurid-routes-server`

Strengths:

- Has an identifiable route-server concept.

Problems:

- No obvious active in-repo consumers.
- Only sanity coverage.
- Process signal handler side effects.
- Cache behavior is fixed and thinly tested.

Recommended direction:

- Decide whether this is live.
- If live, add contract tests and lifecycle cleanup.
- If not live, archive it or mark it legacy.

### `@plurid/generate-plurid-app`

Strengths:

- Gives the project an onboarding path.
- Encodes product templates.

Problems:

- CLI option bug around `versioning`.
- Command failures can be swallowed.
- CRA templates are stale.
- Template dependency sets are large and old.
- Template copying has weak error/completion semantics.

Recommended direction:

- Rebuild around Vite-first templates.
- Add CLI integration tests.
- Make all shell/file operations fail-fast.
- Remove `.DS_Store` and old generated artifacts from templates.

### `@plurid/plurid-data`

Strengths:

- Centralizes shared data and types.
- Has clear role as common domain package.

Problems:

- No test script.
- Lint script currently breaks root lint.
- Main bundle includes broad locale/constants data.

Recommended direction:

- Fix lint config.
- Add tests for route/constants invariants if they exist.
- Add subpath exports for locales and large optional data.

### `@plurid/plurid-themes`

Strengths:

- Clean conceptual package.
- Tests exist, though shallow.

Problems:

- Aggregate default export encourages importing all themes.
- Build emits default/named export warnings.
- Coverage output shows little useful exercised logic.

Recommended direction:

- Add per-theme subpath exports.
- Prefer named exports for tree-shaking.
- Add a small compatibility test for exported theme shape.

### `@plurid/plurid-icons-react`

Strengths:

- Useful support package.
- Clear generated/component-like surface.

Problems:

- Large all-icons bundle.
- `treeshake` disabled.
- Tests are placeholder-level.

Recommended direction:

- Generate one entrypoint per icon.
- Keep aggregate export for convenience.
- Add a smoke test for server render of representative icons.

### `@plurid/plurid-ui-components-react`

Strengths:

- Rich component inventory.
- Good candidate for reuse across Plurid tools.

Problems:

- Large package with placeholder tests.
- Aggregate exports and disabled treeshake.
- Some components are large and likely need accessibility review.

Recommended direction:

- Add subpath exports by component.
- Add focused tests for high-use inputs and overlays.
- Add Storybook or a Vite docs fixture only if it becomes a real governance tool.

### `@plurid/plurid-ui-state-react`

Strengths:

- Keeps UI state separate from view code.

Problems:

- Reducer behavior is under-tested.
- Prior issues around notification IDs and head state need regression tests.

Recommended direction:

- Add reducer tests for every exported action.
- Treat notification lifecycle as a contract.

### `@plurid/plurid-pubsub`

Strengths:

- Small and understandable.
- Useful primitive for decoupling.

Problems:

- Tests do not assert enough behavior.
- Selector format is stringly typed.
- Unsubscribe behavior can report success too broadly.

Recommended direction:

- Add tests for subscribe, publish, unsubscribe, missing topics, bad selectors, and repeated IDs.
- Consider typed topic helpers for public APIs.

### `@plurid/plurid-functions` And `@plurid/plurid-functions-react`

Strengths:

- Utility packages have better test coverage than many support packages.

Problems:

- Build warns about direct `eval` in SHA/UUID code.
- Some legacy transform tooling remains.

Recommended direction:

- Remove `eval` paths or isolate them with justification.
- Continue converting utility code to straightforward ESM/CJS builds.

### `plurid-canvas`, `plurid-html`, Native, Browser Extension

These surfaces need explicit status.

If they are live:

- Bring them into workspace scripts and CI.
- Add smoke tests.
- Align them to the render adapter interface.

If they are not live:

- Move them to archive or mark them legacy.
- Remove them from primary docs.
- Stop letting them influence new architecture.

The native SwiftUI package currently looks like a prototype. It has minimal implementation, unused plane data, no meaningful tests, committed Xcode user state, and committed `.DS_Store` artifacts. That is fine for exploration, but it should not look production-ready.

## Documentation And Product Critique

### README Is Stale

> **DONE (2026-06-21):** the root README was rewritten (status callout, doc table, packages table).

The root README still references older package paths and product names. It describes a broad ecosystem, but does not clearly tell a new contributor what is live today.

Fix direction:

- Add a current architecture map.
- Add a live package table.
- Explain how to run build/test/lint.
- Link to the engine audit and this critique.
- Move historical/speculative text into `about/` or an archive.

### Specification Is More Vision Than Spec

The specification materials are useful as historical/product context, but they do not define a precise executable contract for the current React implementation.

Fix direction:

- Create a short current spec:
  - Plane.
  - Space.
  - Route.
  - Link.
  - View.
  - Layout.
  - Render adapter.
- Add examples that are tested against the engine and React adapter.

### Existing Audit Should Become A Maintained Roadmap

> **DONE:** `docs/ENGINE_AUDIT_AND_ROADMAP.md` carries per-phase progress + a dated open-items block (re-verified 2026-07-02).

`docs/ENGINE_AUDIT_AND_ROADMAP.md` is already valuable. It should be kept, but it should not become the only source of truth.

Recommended doc set:

- `CONTEXT.md`: current product/domain model.
- `CONTEXT-MAP.md`: package map and ownership.
- `docs/adr/`: decisions about live adapters, route grammar, tree immutability, and package archiving.
- `docs/ENGINE_AUDIT_AND_ROADMAP.md`: engine-specific work.
- `docs/CODEBASE_DEEP_CRITIQUE.md`: broad critique snapshot.

## Conceptual Product And Feature Ideas

These are not immediate fixes. They are product/architecture ideas suggested by the current code shape.

### 1. Plane Tree Transactions

Expose a transaction interface:

```ts
tree.spawnPlane(...)
tree.removePlane(...)
tree.togglePlane(...)
tree.relayout(...)
tree.resolveRoute(...)
tree.visiblePlanes()
```

This gives React, SSR, and future adapters one stable way to interact with the spatial model.

### 2. Route Workbench

Create a small route workbench fixture that visualizes:

- Parsed route divisions.
- Match candidates.
- Parameters.
- Query state.
- Generated plane tree.

This would help debug the most conceptually hard part of the system.

### 3. Performance Harness

Create a fixture that renders:

- 10 planes.
- 100 planes.
- 500 planes.
- Links between aligned planes.
- Repeated resize.
- Pointer/orbit/fly loops.

Track:

- Render counts.
- Commit duration.
- Bundle size.
- Layout recomputation time.

### 4. Stable Plane Identity And Persistence

The product likely wants persistence:

- Save current plane arrangement.
- Restore session.
- Share a spatial route/view state.
- Persist spawned child planes.
- Undo/redo plane operations.

This requires stable plane identity independent of layout location.

### 5. Adapter Conformance Suite

If React, HTML, canvas, and native are all desired, define an adapter conformance suite:

- Given a route set, render the same visible plane model.
- Given a spawn/remove/toggle action, produce the same tree result.
- Given a link, resolve the same target.

Only adapters that pass should be presented as live.

### 6. Modern Generator

> **SUPERSEDED (2026-07):** the modern path is `@plurid/plurid-kit` (`docs/FRAMEWORK_PLAN.md`); P5 makes the generator emit the kit shape.

Turn the generator into a high-confidence onboarding path:

- Vite React client.
- Optional server.
- Optional static/stills generation.
- Minimal dependencies by default.
- Working tests in generated apps.
- Type-safe route examples.

The generator should prove the public API is pleasant.

### 7. Visual Debug Overlay

A spatial app framework benefits from a debug overlay:

- Plane IDs.
- Parent IDs.
- Route divisions.
- Coordinates.
- Layout type.
- Link anchors.
- Render count per plane.

This would accelerate development and make bugs easier to report.

## Recommended Roadmap

### Phase 1: Make The Repo Governable

1. Fix root lint.
2. Add CI for build/test/lint.
3. Add a package status table.
4. Mark archived/experimental packages explicitly.
5. Remove committed `.DS_Store`, Xcode user state, and obsolete generated artifacts where tracked.
6. Refresh the root README.

Success criteria:

- A new contributor can tell what is live in under five minutes.
- Root `pnpm build`, `pnpm test`, and `pnpm lint` all pass.
- CI enforces the same commands.

### Phase 2: Stabilize The Domain Seams

1. Finish immutable plane tree transactions.
2. Build a canonical route grammar module.
3. Move parametric matching out of stubs.
4. Add route and tree contract tests.
5. Remove timed close-plane dispatch.

Success criteria:

- Tree updates never mutate inputs.
- Route behavior is identical across engine, React, and server.
- Core skipped engine tests are either active or intentionally deleted.

### Phase 3: Reduce React Adapter Blast Radius

1. Split `View`.
2. Add plane index/selectors.
3. Memoize plane/root rendering around narrow props.
4. Move link geometry into a utility.
5. Add render-count and interaction tests.

Success criteria:

- Adding one child plane does not require broad re-rendering.
- Link assignment is tested independently.
- Pointer/fly/orbit controls have predictable update budgets.

### Phase 4: Modernize Package Surfaces

1. Add subpath exports for icons, themes, locales, and UI components.
2. Remove direct `distribution` imports from source.
3. Resolve build warnings.
4. Consolidate TypeScript and ESLint configuration.
5. Remove stale transform/build dependencies.

Success criteria:

- Consumers can import small pieces without pulling aggregate bundles.
- Build output is warning-clean or warnings are documented.
- Tooling is consistent across live packages.

### Phase 5: Productize Onboarding

1. Rebuild generator templates around Vite.
2. Add generator integration tests.
3. Make generated apps pass build/test/lint.
4. Add a route workbench and performance fixture.
5. Publish current docs around the public mental model.

Success criteria:

- A generated app is the best example of current Plurid usage.
- The docs match the code.
- Performance and route behavior can be inspected without reading internals.

## Deletion And Archival Candidates

> **DONE (2026-06-20/21):** canvas + html + routes-server archived/de-globbed via `!` negations in `pnpm-workspace.yaml`; source kept on disk.

These areas should be reviewed with the deletion test: if removing or archiving the code makes the live system easier to understand without breaking supported use cases, prefer archiving.

- Old CRA templates.
- Old Rollup/webpack template variants.
- `plurid-html` if not actively maintained.
- `plurid-canvas` if not actively maintained.
- Native prototype user-state files and placeholder tests.
- Browser extension package if not part of current product.
- `about/` assets that no longer inform current docs.
- Distribution/coverage artifacts if any are tracked.

Archiving is not a judgment that the ideas are bad. It is a way to stop old experiments from obscuring the live architecture.

## Near-Term Bug Backlog

1. Fix `@plurid/plurid-data` lint script/config resolution.
2. Define or default generator `versioning`.
3. Make generator command execution reject on failure.
4. Replace direct `eval` in SHA/UUID utilities or document why it is required.
5. Remove process signal handlers from server constructors.
6. Make `Stiller` fail fast when Puppeteer is missing.
7. Fix link plane assignment to require stable identity or full coordinate match.
8. Complete or disable parametric route matching stubs.
9. Remove mutating tree helpers or isolate them behind immutable wrappers.
10. Remove the `setTimeout(..., 50)` close-plane dispatch after tree identity is reliable.
11. Avoid early returns before all hooks in React components.
12. Replace direct `@plurid/plurid-themes/distribution` source imports.

## Closing Assessment

The codebase is not fundamentally broken. It is overextended.

The core Plurid idea is still visible and technically interesting, especially in the plane tree, route model, and spatial React adapter. The problem is that the repo carries too many eras of that idea at once. The next improvement cycle should be less about adding another implementation surface and more about making the current live surface smaller, sharper, tested, and governable.

The highest-leverage work is:

- Fix the quality gates.
- Finish immutable tree transactions.
- Canonicalize route grammar.
- Split the React adapter.
- Modernize package exports.
- Archive what is not live.

That would turn Plurid from a large exploratory monorepo into a codebase with a clear center of gravity.
