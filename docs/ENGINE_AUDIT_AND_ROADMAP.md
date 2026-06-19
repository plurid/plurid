# Plurid Engine — Audit & Modernization Roadmap

_Last updated: 2026-06-19. Scope: the whole `plurid` monorepo (engine + utilities + peripheral packages). Based on a multi-agent read-only audit cross-verified against source (and, where load-bearing, by running the code/tests)._

This is the standing "what's left to make the engine modern, ergonomic, correct, and fast" plan. It catalogs concrete findings (with `file:line` + suggested fix + severity) and ends with a phased roadmap. Severity = **High** (correctness/perf/DX blocker), **Med**, **Low**.

---

## 0. Where we are

**Already done** (recent modernization): all packages on **tsup** (ESM+CJS+DTS green); single consolidated pnpm workspace at the repo root; utilities moved into `packages/plurid-utilities/`; React 19 / styled-components 6 / RTK 2 / TS 5.9; HammerJS → native Pointer Events; CAD navigation (orbit/pan/zoom, grab mode, fly mode, viewcube, fit-to-view); CSS-3D perf model proven at 40 planes; **space persistence** (versioned localStorage primitive, reload-restores); **link-spawn** (planes-as-pages) with configurable bridge geometry; **in-plane SPA navigation** (`PluridRouterBrowser`); discoverable keyboard-shortcuts overlay.

**The headline finding of this audit:** the codebase is structurally sound and the live render path is in good shape, **but the entire test corpus is silently dead** (see §1.0) — so none of the bugs below are caught. Fixing that one thing first turns the rest of this roadmap into a guarded refactor instead of a blind one.

**Correction to prior notes:** `plurid-html` (Stencil) does **not** import the engine's `*Plurid` matrix3d functions — it defines its own local `rotatePlurid`/`translatePlurid`/`scalePlurid` (name collision). The engine's matrix3d `*Plurid` functions therefore have **zero live consumers** and are safe to delete (§4.2).

---

## Progress — Phase A COMPLETE (2026-06-19)

Phase A (unblock & stop the bleeding) is **done and fully gated**: `pnpm build` (all 13 packages **+ the harness production build**) and `pnpm -r test` (14 projects) both exit 0; the `render-test` harness renders, spawns, persists, and production-builds clean with zero console errors.

- **A1 — tests restored:** removed the dead `@zerollup/ts-transform-paths` plugin block from 11 tsconfigs; fixed the uuid test's `globalThis.crypto` polyfill; re-enabled the live `direction` suite; added root `build`/`test`/`lint` scripts (filtering out archival `plurid-canvas`/`plurid-html`).
- **A2 — config resolution (highest blast radius):** `objects.merge` now unions key sets at each level (was iterating only the defaults' keys → silently dropped user fields like `space.bridge`/`space.camera`) with an `isMergeable` plain-object guard (Date/Map/Set/RegExp pass through by reference) + `in`-based resolver lookup (honors falsy resolver values); `objects.clone` defaults to the cycle-safe `deepClone` (the old JSON path threw on cyclic/undefined, on a per-mutation hot path); engine `state/compute/index.ts` now **layers** each state config on top of the accumulator (`merge(layer, accumulator)`) instead of reassigning from scratch (which discarded all but the last layer). Locked by new `merge.test.ts` + `clone.test.ts` (18 functions tests green). **Verified end-to-end:** the harness's nested `space.bridge.length: 160` flows through to a bridge element measured at exactly **160px** (vs the dropped default 100).
- **A3 — host-page pollution stopped:** deleted the `createGlobalStyle` that injected `html { overflow:hidden; background:black; color:white; font-family }` + `html,body{…}` into the **consumer** document; moved the load-bearing rules (scoped `box-sizing` reset, `overscroll-behavior-x` via prop) onto `StyledView`. **Verified:** host `<html>` computed style is back to browser defaults (transparent bg, `overflow:visible`, default color/font) while the engine still renders identically (the host backdrop now shows through the transparent engine root).
- **A4 — bundle:** `treeshake:true` in plurid-react tsup (**ESM 291→268 KB**); `sideEffects:false` on 10 verified-pure leaf libs; removed the obsolete `import 'immer'` HACK from plurid-react (DTS still green — RTK 2 resolved it) and replaced the **load-bearing** one in `plurid-ui-state-react` (which exports its RTK slices, so their immer-referencing types hit the public `.d.ts` → TS2742) with a zero-runtime `/// <reference types="immer" />`; dropped the `immer` dep.
- **A5 — on-ramp + workspace dep hygiene:** `generate-plurid-app` install lists no longer force `@plurid/elementql*`, drop the dead `hammerjs`, and repin `styled-components` from the malformed `==5.3.11` to `^6`. Also fixed a latent build break the full `pnpm build` exposed: the harness resolved **RTK 1.9.7** (immer-9-era, breaks under rollup's strict ESM with immer 10) because `plurid-ui-state-react` + `plurid-ui-components-react` pinned RTK `^1.9.5` / react-redux `^8.1.1` in their devDeps while the engine runs RTK 2 / react-redux 9 — bumped both libs (and the harness) to the **RTK 2.12 / react-redux 9.3 / redux 5** stack.

**New findings surfaced during Phase A (deferred, with rationale):**
- `uuid` + `sha` (`plurid-functions`) use `eval('require')('crypto')` to hide a Node-only require from bundlers (rollup flags the `eval`). It's correctly guarded (`isBrowser`→Web-Crypto path, `isNode`→eval path), so **not a live bug**, but both paths can be unified on `globalThis.crypto` (universal since Node 18) to kill the eval + warning. → **Phase C/D.**
- `@plurid/elementql*` is **not** dead in plurid-react: the exported `ExternalPlane` imports `ElementQLClient`. Removing it is an API-surface decision (drop the legacy ElementQL plane). → **Phase D.**
- `generate-plurid-app` still scaffolds a **CRA (`react-scripts`) + webpack/rollup** app — a full Vite/modern rewrite is out of scope for the engine-hardening pass. → **later.**

## Progress — Phase B (performance): scoped down after measurement (2026-06-19)

A read-only hot-path analysis (cross-verified against source) **corrected several §2 assumptions**, so Phase B's actual safe deliverable is narrower than the catalog implied — and one big item turned out to be coupled to Phase D:

- **DONE — `JSON.stringify(stateTree)` hook deps → raw tree ref** (`Link/index.tsx` ×4, `View/index.tsx` ×2 + the resize effect now depends on `treeUpdateCallback`). The space reducer swaps `state.tree` for a new array on every mutation, so the ref changes at the *same* cadence a content-hash would — at O(1) instead of re-serializing the whole tree on each of these components' (frequent) re-renders. Left the cheap `JSON.stringify(stateViewSize)` (2 numbers) and the `stateConfiguration` stringifies (config may be regenerated by `compute()`, so its ref isn't a reliable signal). **Verified:** spawn + bridge(160) + persistence + pubsub all still work; full build + test green.
- **NOT A BOTTLENECK (no change) — per-frame transforms.** During an orbit/pan/zoom gesture only the thin `PluridRoots` re-renders (its `style.transform`); planes are connected to `getTree`, which is untouched by transform actions, so they do **not** re-render per frame. The catalog's "dispatch-once + write DOM directly" rewrite is high-risk for negligible gain — **skipped on purpose.**
- **ALREADY GOOD (no change) — persistence debounce** (300 ms, durable-fields-only) and **matrix allocation** (5 small arrays/frame — negligible GC; scratch buffers would add bug-prone shared mutable state).
- **MOVED TO PHASE D (coupled) — per-plane re-render scope.** `PluridPlane.mapStateToProps` selects the whole `getTree` but uses it *only* to find its parent (`getTreePlaneByID(tree, treePlane.parentPlaneID)`), so a per-id selector + `React.memo` *should* let unrelated mutations bail out. **But** mutations `objects.clone` the entire tree (`Link` 312/372/407, `space.removePlane` 624), giving every plane a fresh object ref each mutation — so memoization is **inert until tree mutations use structural sharing**. These belong together in Phase D's tree-helper/immutability refactor (along with the rare resize O(n²) merge), not half-done in isolation.

## Progress — Phase C (correctness): 15 fixes, verified; full corpus green (2026-06-19)

Every §3 finding was re-checked against current source first (two had already been disproven; the triage cleared three more as non-bugs). **Fixed (15):**

- **Engine (8)** — `checkValidPath` no longer returns after the first length-constrained param (`validity:78`); `IsoMatcher` mismatches `continue` instead of `return` so later routes are tried (4 sites); `extractQuery` uses `URLSearchParams` (no throw on bare `%`, no `"undefined"` for flags) **and** the parametric route branch now reads the query off the original `value` not the query-stripped `routeValue` (`IsoMatcher:442`, found while re-enabling the suite); `toggleAllChildren` returns the built array not the input ref (`tree/logic.ts:1110`); faceToFace uses `checkIntegerNonUnit`, includes the gap in row spacing, and detects the last plane per-row (`faceToFace.ts`); `compute{Root,Camera}LocationX` are SSR-safe (`location/logic.ts`); column/row layouts guard `columns/rows === 0` (Infinity collapse) and an explicit `0` length (`column.ts`/`row.ts`). **Test impact:** re-enabled the **Parser** + **IsoMatcher simple** suites (engine 25→35 passing). The **IsoMatcher foreign** suite + one parametric-route-plane case stay skipped *with notes* — they fail on a separate, deeper cross-origin/route-plane matcher bug (archived-pluriverse territory), not on these fixes.
- **plurid-react (5)** — scale-lock operator precedence `((meta||ctrl) && locks.scale)` (`shortcuts:179,198`); `VIEW_REMOVE_PLANE` filter inverted to actually remove the plane (`View:641`); `requestPointerLock` guarded for cross-document + Promise-rejection (`View:1242`); `RouterLink` calls `preventDefault()` before the `atClick` early-exit so an SPA link never full-page-navigates; `RouterBrowser` compares the full URL (with search) and uses `window.`-qualified globals so a query-bearing URL doesn't push a spurious history entry.
- **ui-state (2)** — `setHead` now `Object.assign(state, action.payload)` (was a no-op that spread the whole action); notification IDs use `crypto.randomUUID()` with a counter fallback (was `Math.random()+''`).

**Verified:** full `pnpm build` + `pnpm -r test` exit 0; harness renders, spawns (bridge=160), no console errors.

**Deferred to Phase D (coupled with the tree-helper / immutability / merge refactor — fixing them in isolation would be superseded):** input-mutation immutability across `tree/logic.ts` (§3 engine) → central `mapTree`; the 4-caller `computePluridPlaneLocation` divergence → `placeChildPlane`; the `treeUpdate` float-equal merge (closes spawned planes on sub-pixel relayout) → rewrite as a stable-keyed hashmap; the 50 ms double-`setTree` HACK → removed once tree identities are immutable; dead `inverseMatrix`/`printMatrix`/`useAnimatedTransform` → dead-code deletion. **Cleared as non-bugs:** `ErrorBoundary.componentDidCatch` (intentional; add an `onError` only if desired), `setSpaceField` `(state as any)` (a typing smell, not a runtime bug), and the Parser `comparingPath` comparison (both sides already `splitPath`-normalized).

## Progress — Phase D: tree-mutation core made immutable + clone-free; safe dead-code removed (2026-06-19)

The hardest, highest-risk item — making the engine's tree mutations immutable so the whole-tree clones can go — is **done and verified** (full build + test exit 0; harness spawn bridge=160, link-coordinate updates, **no freeze errors** running directly on RTK's frozen state).

- **Tree immutability + structural sharing.** `updateTreePlane` (`tree/logic.ts`) rewritten to be immutable *and* structurally shared — only the nodes on the path to the changed plane get new identities; untouched subtrees keep their reference (the precondition for per-id memoization). `updateTreeWithNewPlane` (spawn), `updatePlaneLocation`, and `togglePlaneFromTree` no longer `.push`/assign into the shared input arrays (Phase C §3 "input mutation"). `toggleAllChildren` returns its built array. Engine tree suites (`updateTreePage`, `removePageFromTree`, `togglePageFromTree`) stay green.
- **Removed the redundant whole-tree clones** in `Link` (the three `objects.clone(stateTree)` before `updatePlaneLocation`/`updateTreeWithNewPlane`/`togglePlaneFromTree`) — they re-serialized all planes to change one and existed only to defend against the now-removed mutation. Safe because the mutations are immutable; verified clone-free on frozen state.
- **Dead code removed (safe subset):** `changeTransform` empty reducer + its `ChangeTransformPayload` type/import; the no-op gamepad `useEffect`; the unused `useAnimatedTransform` import in `View`. **Live `inverseMatrix` row-corruption FIXED** (deep-copies rows — it IS used by plurid-react `computing`, so it was kept+fixed, not deleted). `resolveRoute` confirmed LIVE (kept).

**Still open in D (foundation now in place):**
- **Consume the structural sharing (per-plane re-render scope).** Attempted + reverted: swapping `PluridPlane`'s whole-`getTree` selection for a parent-by-id lookup is **net-negative without two more pieces** — (a) `connect` re-runs `mapStateToProps` on *every* dispatch, so a raw `getTreePlaneByID` walk turns the orbit hot path into O(n²) **per frame** (must use a *memoized* per-id selector / a `Map<planeID,node>` index, not a raw walk); and (b) `PluridRoot` itself still selects whole `getTree` and rebuilds all child elements each tree mutation, so it defeats the leaf bail-out (must be memoized too). Also note: a spawn legitimately re-renders all planes once (the new plane becomes active → `stateActivePlaneID` changes). Measured at the harness: 6 planes re-render on spawn — partly legitimate. **Do this as: memoized per-id selectors + `React.memo` on both Root and Plane, verified with a render-count harness.**
- Rewrite the resize merge as a stable-keyed hashmap (fixes the float-equal relayout close + lets the 50 ms `setTree` HACK go).
- Delete the bulkier dead code (matrix3d `*Plurid`, 9 quaternion fns, `printMatrix` + their skipped tests, ~46 commented `console.log` blocks).
- API surface (flat config preset, unify dual export, type `StateContext`).

---

## 1. Critical / do-first

### 1.0 — The test suites don't run (HIGH, repo-wide)
Every package's `tsconfig.json` still declares the `@zerollup/ts-transform-paths` plugin (≈11 tsconfigs). tsup/esbuild ignore tsconfig `plugins` (so builds pass), but **ts-jest reads it and calls `ts.createLiteral`, removed in TS 5** → `TypeError: ts.createLiteral is not a function` on any test importing a `~`-aliased module.
- Engine: **10/20 suites fail, 6 skipped, 4 pass** (`jest ./source`); the 2,500 lines of layout/routing tests exist but never execute.
- plurid-functions: 5/6 suites fail.
- e.g. `packages/plurid-web/plurid-core/plurid-engine/tsconfig.json:50-58`.
- **Fix:** delete the dead `plugins` block from all tsconfigs (jest `moduleNameMapper` + tsup already resolve `~` aliases). Also re-enable the `xdescribe('transformations')` matrix3d tests (`.../transform/matrix3d/__tests__/index.test.ts:16`) and the `xdescribe` layout test (`.../space/layout/__tests__/computeFaceToFaceLayout.test.tsx:21`). Add a root `package.json` `"test": "pnpm -r test"` (root currently has **no scripts**).

### 1.1 — Config merge silently drops fields (HIGH)
`plurid-functions/source/functions/objects/index.ts` `merge()` iterates keys of the **defaults** object only, so any user config key absent from defaults is discarded. **Confirmed:** `merge({a,b:{c}}, {a,b:{c,d},extra})` → loses `extra` and `b.d`.
- Real impact: `space.camera` is typed (`plurid-data/.../configuration/index.ts:123`) but absent from `defaultConfigurationSpace` → silently dropped; `computeCameraLocationX` always sees `undefined`. The earlier "bridge config didn't apply" symptom was the same class of bug.
- **Fix:** union the key sets at each level (`new Set([...Object.keys(field), ...Object.keys(targetField)])`); and add every optional field to the defaults.

### 1.2 — `compute()` config layering overwrites instead of accumulating (HIGH)
`plurid-engine/source/modules/state/compute/index.ts:49-62`: the loop does `stateConfiguration = merge(layer)` (reassign) instead of `merge(layer, stateConfiguration)`, so precomputed/context/local contributions are lost once a later layer exists.
- **Fix:** pass the accumulator as the merge target.

### 1.3 — `clone()` is lossy and throws, on a per-mutation hot path (HIGH)
`plurid-functions/.../objects/index.ts` default `clone` path is `JSON.parse(JSON.stringify())`: drops functions/`undefined`, stringifies `Date`, **throws on cyclic input and on `clone(undefined)`**. Called before every tree mutation (`plurid-react/.../space/index.ts:624`, `Link/index.tsx:312-407`).
- **Fix:** default to the in-file cycle-safe `deepClone` (or `structuredClone`); guard `undefined`. Better: drop most of these clones — the engine tree-mutation fns already build fresh arrays, so the clones are largely redundant (also a perf win, §2.4).

### 1.4 — `GlobalStyle` pollutes the host page (HIGH)
`plurid-react/.../Application/View/styled.ts:25-61` injects `html { overflow:hidden; background:black; color:white }` + `html,body{margin:0;height:100%}` into the **consumer's** document via `createGlobalStyle`. A library that black-screens its host is hostile.
- **Fix:** delete `createGlobalStyle`; move every rule onto `StyledView` (already tagged `data-plurid-entity=PLURID_ENTITY_VIEW`) and its descendants; `preventOverscroll` becomes a `StyledView` prop.

---

## 2. Performance

### 2.1 — Per-frame transforms route through Redux (HIGH)
The space `transform` string is Redux state; `onPointerMove` dispatches on every pointer event (`View/index.tsx:1132`) → up to 120 dispatches/s, each running `computeMatrix` and re-notifying all connected subscribers. Momentum dispatches **two** actions/frame (`rotateByDelta`, `View/index.tsx:948-955`), each re-running `computeMatrix`.
- **Fix:** during continuous gestures write `element.style.transform` directly from the rAF loop (ref accumulator) and dispatch to Redux **once at gesture end**. Add a single `rotateWith({dx,dy})` action so momentum runs `computeMatrix` once/frame. Hoist matrix scratch buffers in `computeMatrix` (`services/logic/transform/index.ts:40-86`) — it allocates ~a dozen arrays/strings per call.

### 2.2 — `JSON.stringify(...)` in hook deps (HIGH)
Serializes the whole tree/config **every render** just to compute a dependency string; O(n²) where it's per-plane. The team already fixed this in `Root/index.tsx:238` (reference deps) — finish the job:
- `Link/index.tsx:526, 580, 581, 650, 684` (per-plane → O(n²))
- `View/index.tsx:427, 910-911, 1366-1367, 1377`
- **Fix:** depend on the references (`stateTree`, `stateConfiguration`) — they're rebuilt immutably so identity already changes on real change.

### 2.3 — All planes re-render on any mutation; zero `React.memo` (HIGH)
`Plane` (`structural/Plane/index.tsx:445`) and `Root` (`structural/Root/index.tsx:354`) both select the **whole** `getTree`, so any single mutation changes tree identity → all 40 Planes + 40 Roots re-render. No `React.memo` anywhere in the source.
- **Fix:** per-id memoized selectors (`createSelector` keyed by `planeID`, returning just that node) + `React.memo` on Plane/Root. Turns O(n) re-renders/mutation into O(1). Highest-leverage scaling fix.

### 2.4 — Redundant whole-tree work on routine ops (HIGH/MED)
- `objects.clone(stateTree)` JSON round-trip before each mutation (§1.3) — re-serializes all 40 planes to add 1.
- `treeUpdate` rebuilds the entire `Tree`, calls `.compute()`, then an O(roots²) `objects.equals(location)` deep-merge **on every resize** (`View/index.tsx:374-414`). Resize never changes structure. **Fix:** recompute root positions in one pass; if rebuild stays, index `computedTree` by `route` in a `Map`.
- `getTreePlaneByID(...)` called in `Plane` render body (`structural/Plane/index.tsx:179`) = O(n) walk × n planes = O(n²). **Fix:** memoize, pass parent as prop, or maintain a `Map<planeID,node>` index.

### 2.5 — Bundle (HIGH)
- `plurid-react/tsup.config.ts:14` sets `treeshake: false` (engine sets `true`). → `true`.
- No package declares `"sideEffects": false` → consumer bundlers can't drop unused barrels. Add to all leaf libs.
- `services/state/modules/index.ts:4` has `import 'immer'` ("HACK prevent TS error") — a side-effect import that blocks tree-shaking; `immer` is transitive via RTK. Remove it + drop `immer` from deps.
- `@plurid/plurid-data` ships **all 10 i18n languages** always (~88 KB). Add `sideEffects:false` + per-locale subpath/lazy `import()` (~88 KB → ~9 KB single-locale).
- Consider `splitting:true` + `React.lazy` for Toolbar (~4.4k lines) and Viewcube (~1.8k lines).

### 2.6 — Persistence debounce keeps getting deferred (MED)
The post-spawn focus animation (`animation/index.ts:99-124`, a 500 ms batch) dispatches transform/`animatedTransform` fields that each reset the 300 ms save debounce → a spawn's save lands ~800 ms+ later (reload sooner = spawn unsaved).
- **Fix:** cap the debounce with a max-wait (force flush ≥1 s after first dirty), and/or gate `persistDirty` on durable fields only (`tree`, `activePlaneID`, final transform) — transient transform churn need not trigger saves at all.

### 2.7 — Misc (LOW)
Fly rAF loop spins every frame even with no keys held (`View:1242-1257`); `TransformArrow` uses `setInterval(40ms)` not rAF; per-`pointermove` `{vx,vy}`/point allocations + `getBoundingClientRect()` in the pinch path force layout each move.

---

## 3. Correctness & bugs

### Engine
- **HIGH** `toggleAllChildren` returns the wrong variable — builds `updatedTree` but `return tree` (relies on mutation). `space/tree/logic.ts:1110`.
- **HIGH** `checkValidPath` returns after validating only the **first** length-constrained param — `routing/logic/validity/index.ts:72-79` (`return validLength` inside the loop). Route guards under-validate.
- **HIGH** `Parser.extractParametersAndMatch` compares the rebuilt path against the raw `route` (leading slash + query/fragment) so the matcher is ~always false (`routing/Parser/logic.ts:76`); `IsoMatcher` only works because it pre-slices inputs. Correct line is commented at `:149`.
- **MED** IsoMatcher loops `return;` on a parametric mismatch instead of `continue;` — a later valid route is never tried (`IsoMatcher/index.ts:305-307, 317-319, 422-423, 435-437`).
- **MED** `extractQuery` throws on any `%` in a value (`decodeURIComponent`) and stores `"undefined"` for flag keys (`Parser/logic.ts:199-203`). **Fix:** `URLSearchParams`.
- **MED** faceToFace layout: row spacing omits the gap, `last`-plane detection wrong for partial rows, gap uses `Number.isInteger` vs the shared `checkIntegerNonUnit` (`space/layout/faceToFace.ts:101-110`).
- **MED** pervasive input mutation presented as pure transforms (`{...parent}` then `.children.push`) — `space/tree/logic.ts:740, 881, 1025, 1056, 1099, 1164, 1244`. Causes Redux stale-render/double-apply.
- **MED** `compute*LocationX` test `Array.isArray(configuration.space.layout)` but `layout` is an object → dead branch; `center`/`camera` positioning silently no-ops (`space/location/logic.ts:166, 215`). Same fns use unguarded `window.innerWidth` (SSR-unsafe).
- **MED** the 4-caller `computePluridPlaneLocation` divergence: three call sites pass **different** bridge/angle defaults (config-read vs stored vs hardcoded 100/90), so the same spawn produces different geometry per path (`tree/logic.ts:777, 909, 950` + `location/logic.ts:111`). _(One instance — the post-spawn recompute resetting the gap — was fixed 2026-06-19; the duplication remains.)_
- **LOW** column/row layout: `columns=0` → `Math.ceil(n/0)=Infinity` collapses planes; `columnLength ||` swallows explicit `0`. `space/layout/column.ts:51-55`, `row.ts`.
- **LOW** `inverseMatrix` shallow-copies rows then mutates them, corrupting the caller's matrix (`mathematics/matrix/index.ts:310`).
- **LOW** live `console.log` shipped in `printMatrix` (`mathematics/matrix/index.ts:149`).

### plurid-react
- **MED** operator-precedence: `if (event.metaKey || event.ctrlKey && locks.scale)` → Meta+Arrow scales even when scale is locked off (`shortcuts/index.ts:179, 198`). Want `(meta||ctrl) && locks.scale`.
- **MED** `VIEW_REMOVE_PLANE` filter is inverted/no-op (keeps the matching plane) — `View/index.tsx:637-643` (self-flagged TODO).
- **HIGH** unguarded `requestPointerLock()` throws `WrongDocumentError` in iframe/cross-doc contexts (`View/index.tsx:1235-1240`). **Fix:** try/catch + promise `.catch`, guard `ownerDocument===document`/`isConnected`, and only request lock on an explicit affordance (not any click).
- **MED** 50 ms double-`setTree` "HACK" to force a tree update (`View/index.tsx:729-733`) — racy band-aid for missing immutable identity in `togglePlaneFromTree`. Fix the root (new node identities) and remove the timeout.
- **MED** `treeUpdate` merges computed vs state tree by matching on float-equal `location` — sub-pixel relayout drops the match and silently closes spawned planes (`View/index.tsx:399-412`). Match by `planeID`.
- **MED** Rules-of-Hooks: early `return` before later hooks in `Link/index.tsx:128-143` and `Root/index.tsx:95-98` — crashes if context ever toggles.
- **MED** `useAnimatedTransform` is a misnamed non-hook with a **module-singleton** timer shared across all `PluridApplication` instances (`animation/index.ts:39-63, 99`) — two spaces animating can leave one stuck with `animatedTransform=true`.
- **MED** `RouterBrowser` initial-mount `history.pushState` is unguarded for static/SSR hydration → spurious history entry / back-button break (`RouterBrowser/index.tsx:226-235`); also uses bare `location`/`history` globals.
- **LOW** `RouterLink` `atClick`-truthy exits before `preventDefault()`, so "handle it myself" still triggers default full-page nav (`RouterLink/index.tsx:106-125`). Programmatic `history.forward()` was also flaky in testing (worth a real-browser confirm).
- **LOW** `ErrorBoundary.componentDidCatch` is empty — render errors vanish with no `onError` hook (`ErrorBoundary/index.tsx:43`).
- **MED** `setSpaceField` reducer is an untyped escape hatch `(state as any)[field]=value` (`space/index.ts:113`) — a typo'd field writes garbage. Replace with discrete typed reducers.

### Utilities
- **HIGH** `plurid-ui-state-react` `head` slice `setHead` is a no-op **and** spreads the wrong object: `state = {...state, ...action}` (reassigns local + spreads the action, not `action.payload`) — `modules/head/index.ts`. **Fix:** `Object.assign(state, action.payload)`.
- **MED** `notifications` slice uses `Math.random()+''` for IDs (collision-prone).

---

## 4. Architecture & code quality

### 4.1 — Monolith files (HIGH)
- `containers/Application/View/index.tsx` — **1,596 lines**: 30+ dispatch props, the entire ~350-line pubsub subscribe table (re-created each render), 8 gesture/listener effects, the tree-merge HACK. **Split** into `usePointerGestures`, `useFlyControls`, `useGrabMode`, `usePluridPubSubBridge`, `useViewResize`; make the pubsub table a data-driven `{topic: handler}` map. _Single highest-leverage refactor._
- `services/logic/router/index.tsx` — **1,549 lines, ~60% dead/commented**, 37 `as any`. Four near-duplicate "walk path→space→universe→cluster→plane, build address, push Application" traversals. **Extract** one `buildPlaneAddress(parts)` + one `iterateRoutePlanes(route, visitor)`.
- `components/links/Link/index.tsx` — **808 lines**, 6 concerns (DOM coordinate-walk, tree mutation, preview state machine, pubsub, unmount timeout, render). Extract `useLinkCoordinates`, `useLinkPreview`, `useLinkPlaneLifecycle`.
- `plurid-engine/.../space/tree/logic.ts` — **1,252 lines**, ~26% dead commented blocks (`:176-266, 403-456, 820-874`) + two stub functions. `isParametric` (`:603`) unconditionally returns `true`, making the guard at `:656` always fire (double-push). Delete dead/stubs (→ ~600 lines); split into build/mutate/traverse.

### 4.2 — Dead code (HIGH)
- Engine matrix3d `*Plurid` functions — **zero live consumers** (verified; plurid-html uses its own). Safe to delete: `rotatePlurid/translatePlurid/scalePlurid/setTransform/getTranslationMatrix` + ~90 lines of commented Euler experiments (`mathematics/transform/matrix3d/index.ts`). Keep only the live `getTransform*` readers. (~50% of the file.)
- Quaternion module (`mathematics/quaternion/index.ts`, 255 lines) — only `degToRad`/`radToDeg` are used; the quaternion fns have only test refs. Delete or document as a reserved toolkit.
- ~46 commented-out `console.log` blocks across `router`, `Link`, `Root`, `server` (plurid-react); ~20 across engine routing.
- `changeTransform` reducer is an empty stub (`space/index.ts:130`); gamepad effect is a no-op stub (`View/index.tsx:1316`); `resolveRoute`/`mapPathsToRoutes` are abandoned stubs that echo input (`routing/logic/general/index.ts`).

### 4.3 — Duplication (MED)
- 7–8 hand-rolled recursive tree walks in `space/tree/logic.ts` + `space/utilities`; `removePageFromTree` and `removePlaneFromTree` are the same op written twice. **Extract** one `mapTree`/`walkTree`/`findInTree` (fixes immutability centrally).
- Path splitting/normalization implemented 3–4 incompatible ways across routing (filtered vs unfiltered splits, duplicated trailing-slash cleaners). **One** canonical `normalizePath` + `splitPath`.
- Layout files share ~5× viewport preamble; `column.ts`/`row.ts` ~95% identical → one transposed `computeGridLayout`.
- `switch(layout.type)` (`tree/logic.ts:516`) → `Record<LAYOUT_TYPES, fn>` with `satisfies` for exhaustiveness.

---

## 5. API & DX

- **MED** `PluridConfiguration` (`plurid-data/.../configuration/index.ts`) is a 5-level, all-required nested interface usable only via `RecursivePartial` + the lossy merge. **Fix:** (1) add missing optionals to defaults so merge stops dropping them; (2) offer a **flat preset/shorthand** for the handful of knobs that matter (`{layout, perspective, theme, …}`) that expands into the nested shape; (3) make merge key-union (loss-free). Replicate the good `bridge` doc-comment style for `transformLocks`/`transformMode`.
- **MED** Dual public surface drifts: the `Plurid` default object (`index.tsx:125-162`) and the named exports (`:171-219`) list **non-identical** sets (`usePluridRouter`, `getDirectPlaneMatch`, `PLURID_ROUTER_LOCATION_*` are named-only). Naming also diverges (`Plurid.routerNavigate` vs `pluridRouterNavigate`, `Plurid.IsoMatcher` vs `PluridIsoMatcher`). **Fix:** derive the object from the named exports; standardize names.
- **MED** `internals` exported with no `@internal`/`unstable_` marker (`index.tsx:114`).
- **MED** custom Redux `StateContext` is `createContext<any>({})` (`state/context/index.ts:10`) — a forgotten `{context: StateContext}` in `connect()` fails silently at runtime. Type it + add a dev-mode assertion in `Application`.
- **LOW** ~100 lines of hand-wired `mapDispatch` boilerplate in `View` (`:1473-1579`); migrate `connect()` components to `useSelector`/`useDispatch` (via `createSelectorHook(StateContext)`/`createDispatchHook(StateContext)`) — deletes hundreds of lines.
- **LOW** root prop interfaces (`PluridApplicationProperties`, `PluridRouterProperties`) live in `@plurid/plurid-data`, invisible from `plurid-react` — re-export them by name + add TSDoc. `PluridLink` used outside an Application silently renders an inert `<a>` — add a dev `console.warn`.
- **LOW** `as any`/`: any` ≈ 189 in plurid-react (router 37, ViewcubeFace 29, View 13, `StyledView: any` defeats prop typing); the `IsoMatcher` `data as any` (`IsoMatcher/index.ts:470`) papers over a real route-vs-plane datashape mismatch — add a proper union member. `RecursiveOmit = any`, `splitIntoGroups` `any[]` accumulator.

---

## 6. Modernization, build & tooling

- **HIGH** Dead toolchain in **every** package post-migration: `scripts/rollup.config.js`, `rollup`/`ttypescript`/`@rollup/plugin-terser` devDeps, rollup `watch`/`build.development` scripts, and the `@zerollup/ts-transform-paths` + `typescript-transform-paths` plugin blocks. Three packages (`plurid-functions`, `plurid-functions-react`, `plurid-ui-state-react`) carry the `@zerollup` TS5 landmine (§1.0). **Fix:** purge it all.
- **MED** No shared `tsconfig.base.json`; each of 11 tsconfigs repeats `target: ES6`, `moduleResolution: node`, decorators, the dead plugin block. **Fix:** one base, `target` ES2020+, `moduleResolution: bundler`, drop decorators, `extends` it.
- **MED** ESLint near-toothless (extends only `eslint:recommended`, disables `no-unused-vars`/`no-empty`; doesn't load the TS-recommended set), legacy `.eslintrc.js` on EOL ESLint 8; **no Prettier**; several packages have no `lint` script. **Fix:** one flat ESLint config + Prettier, or explicitly scope lint out.
- **MED** **No CI** (`.github/` absent) and **no release automation** (manual `npm publish` per package at `0.0.0-N`). **Fix:** minimal GitHub Actions (install → `pnpm -r build` → `pnpm -r test`, once tests run); consider Changesets. _(Operator publishes manually — recommendation, not an action.)_
- **LOW** `plurid-react` still lists dead `@plurid/elementql` + `@plurid/elementql-client-react` in peer+dev deps; `engines.node` varies (`>=12`/`>=18`/absent) — unify `>=18`; stale `coverage/` dirs committed (gitignored but tracked) — `git rm -r --cached`.
- **LOW** hand-rolled query/fragment parsing → `URLSearchParams`/`URL`; `degToRad` hardcodes `0.01745…` instead of `Math.PI/180`; `for…of`+`push` accumulators that are `map`/`filter`.

---

## 7. Per-package disposition (peripheral)

| Package | Status | Action |
|---|---|---|
| `plurid-canvas` | abandoned `0.0.0-0`, only a sanity test | **ARCHIVE** (drop from build/test loop) |
| `plurid-html` | pure Stencil, stale since 2021, fully duplicates the engine, **no `@plurid` deps** | **ARCHIVE** (unless a deliberate framework-agnostic edition is planned → re-point at the engine) |
| `plurid-react-server` | genuinely tsup'd, in sync, no React-19/sc6 incompatibility | **KEEP** + 2 low fixes: jest `moduleNameMapper` aliases (`configurations/jest.config.js:37`), remove dead rollup script + ttypescript tsconfig block |
| `generate-plurid-app` | templates match current API, but **installs non-existent `@plurid/elementql*`**, pins `styled-components@==5.3.11`, scaffolds on CRA | **FIX** (drop dead deps, repin sc, replace CRA) then **KEEP** — it's the public on-ramp, currently broken at `npm install` |
| `plurid-routes-server` | tsup'd, but **zero in-repo consumers**, full unused rollup stack | **KEEP** (prune deps, wire `tests/index.ts`) **or ARCHIVE** |

Also: the legacy `about/**` and root `README.md` describe the **dead** `plurid.js` custom-element model — mark obsolete; the closest current reference is `packages/plurid-specification/README.md`.

---

## 8. Testing (the gap that hides everything else)

After §1.0 un-breaks ts-jest:
- **Engine layout**: `sheaves` (the historically-buggy one) and `row` have **no tests**; faceToFace's test is `xdescribe`'d and will fail until §3 bugs are fixed. Add/enable them — layout is the visible product surface.
- **Engine routing**: tests exist (2,500 lines) but never ran; they'll immediately expose the matcher bugs (§3).
- **plurid-functions**: no tests for the riskiest fns — `clone` (Date/fn/cyclic/undefined), `getNested`, `mapToObject`, and the merge target-only-key case. These are load-bearing for the whole engine.
- **plurid-ui-state-react**: the `head` no-op bug (§3) would've been caught by one reducer test; add reducer tests for all 5 slices.
- **plurid-react**: zero component tests; at minimum smoke-render `PluridApplication` + a spawn + an SPA nav (the harness already does this manually via `fixtures/render-test`).

---

## 9. Prioritized roadmap

**Phase A — Unblock & stop the bleeding (small, high-ROI):**
1. Remove `@zerollup` plugin from all tsconfigs; re-enable `xdescribe` tests; add root `test`/`build`/`lint` scripts (§1.0). _Now every fix below is guarded._
2. Fix `objects.merge` (drop-fields) + `compute` layering + `objects.clone` (lossy/throws) — §1.1–1.3. _Highest blast radius._
3. Scope `GlobalStyle` to the engine root (§1.4). _Stops black-screening hosts._
4. Bundle quick wins: `treeshake:true`, `sideEffects:false`, drop `immer` HACK + dep, remove dead `@plurid/elementql*` deps (§2.5, §6).
5. Fix `generate-plurid-app` install list (§7). _Unbreaks the on-ramp._

**Phase B — Performance pass (guarded by Phase A tests):**
6. Per-frame transforms → DOM-direct + dispatch-once; single `rotateWith` for momentum; matrix scratch buffers (§2.1).
7. Replace all `JSON.stringify` hook deps with references (§2.2).
8. Per-id memoized selectors + `React.memo` on Plane/Root (§2.3).
9. Remove redundant tree clones + the resize rebuild/O(n²) merge (§2.4); cap the persistence debounce (§2.6).

**Phase C — Correctness sweep:**
10. The discrete bugs in §3 (engine routing/layout/toggleAllChildren; plurid-react precedence/remove-plane/pointer-lock/Rules-of-Hooks/useAnimatedTransform; ui-state `head`). Each is small; the Phase-A tests make them safe.

**Phase D — Architecture & API (bigger, do incrementally):**
11. Delete dead code: matrix3d `*Plurid`, quaternion, commented blocks, stubs (§4.2). _~800 LOC + makes the live path legible._
12. Extract the tree-walk + `placeChildPlane` helpers (§4.3) — fixes immutability + the 4-caller divergence centrally.
13. Decompose `View` into gesture hooks + data-driven pubsub map (§4.1); collapse the router's duplicated traversals (§4.1).
14. The config-API ergonomics: flat preset layer + key-union merge + defaults (§5); unify the dual export surface; type `StateContext`.

**Phase E — Tooling baseline:**
15. Shared `tsconfig.base.json` (ES2020+, `moduleResolution: bundler`), flat ESLint + Prettier, minimal CI, archive `plurid-canvas`/`plurid-html`, prune dead rollup/babel devDeps, unify `engines.node` (§6, §7).

**Phase F — Then:** build **denote** (Spatial Notes) on the hardened engine.

---

### Two notable positives
The versioned, field-allow-listed localStorage persistence (`plurid-engine/.../state/local/index.ts`) and `plurid-pubsub` are genuinely modern and clean — use them as the quality bar for the rest.
