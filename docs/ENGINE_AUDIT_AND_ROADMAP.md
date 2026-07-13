# Plurid Engine Audit and Roadmap

Status: **active engineering ledger, re-verified 2026-07-13**.

This document records what remains after the June/July modernization. Historical implementation detail belongs in git history and [`CODEBASE_DEEP_CRITIQUE.md`](./CODEBASE_DEEP_CRITIQUE.md); live mechanics belong in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Current assessment

The engine is governable and product-capable. It has a coherent workspace, a live package graph, modern builds, tests, lint, a browser harness, immutable tree work, scoped React rendering, persistence, spatial authoring primitives, a control surface, SSR, and the published kit. The next risk is not basic revival. It is mistaking a green library suite and a 40-plane demo for proof of product-scale correctness, performance, and operability.

## Completed foundations

- pnpm workspace orchestration and local package linking;
- current TypeScript/React/styled-components/Redux build stack;
- `tsup` across the live engine packages;
- build, test, and lint gates;
- archival/de-globbing of canvas, html, and routes-server surfaces outside the live graph;
- immutable/structurally shared plane-tree mutations and per-plane render scoping;
- state persistence hardening and spawned-plane reload recovery;
- pointer-event navigation in place of HammerJS in the engine;
- viewpoint, links, selection, movement, snapping, undo/redo, minimap, persistence, collaboration, and developer-control seams;
- `@plurid/plurid-kit@0.0.0-3` published and consumed by applications.

## P0: Make the gates mean product quality

### Add an explicit type-check gate

The root build transpiles and emits declarations but is not a complete source type-check. `plurid-react` has a `check` script; GitHub CI runs only build, test, and lint. Add a root `check` contract covering every live package and make it a required CI step.

**Done when:** a deliberately introduced source type error fails local `pnpm check` and CI without relying on a package build side effect.

### Add browser and visual regression coverage

The render harness is interactive but not a standing browser suite. Automate the critical behaviors: mount, orbit/pan/zoom, viewcube, link spawn, selection, group movement, editor input arbitration, viewpoint restore, persistence, collaboration apply/no-echo, minimap navigation, and configurable UI slots.

**Done when:** the suite runs headlessly in CI across at least desktop and mobile-sized viewports, detects blank rendering and geometry regressions, and retains diagnostic screenshots/traces on failure.

### Raise weak package tests

Several utilities and the generator still have sanity-only tests. Coverage output on barrel files is not evidence of behavior. Add tests around package contracts, failure paths, and generated artifacts according to risk.

**Done when:** a broken generator, persistence adapter, route parser, or server lifecycle behavior produces a focused test failure.

## P1: Establish and raise the large-space ceiling

### Wire culling into rendering

`culledView`, configuration, selectors, UI, and engine calculation exist, but the View dispatch is commented out and rendering does not consume a real visibility set. Complete the data flow without introducing camera-update feedback or unmounting stateful content unexpectedly.

The design must decide:

- geometric visibility versus distance-only culling;
- hide, detach, or virtualize semantics for interactive DOM content;
- overscan/hysteresis so planes do not flicker near boundaries;
- active/selected/focused plane exceptions;
- persistence and collaboration behavior for non-rendered planes;
- what `usePluridPlane()` reports as visibility.

**Done when:** parameterized large-space scenarios show a measured improvement, focused/editor state remains correct, and browser regressions cover boundary behavior.

### Replace the fixed 40-plane stress toggle with a benchmark matrix

Add configurable counts and representative content weights. Measure 40, 100, 500, and 1,000 lightweight planes plus smaller sets with editors/media. Capture frame time, long tasks, React commits, layout/style cost, memory, interaction latency, and recovery after camera movement.

**Done when:** budgets and results are recorded and repeatable enough to reject a regression.

### Control bundle growth

The render harness production chunk is already above the default Vite warning threshold. Separate engine cost from harness/product dependencies, inspect aggregate exports, and define per-package or per-entry budgets before optimization.

**Done when:** bundle reports are generated in CI and changes over an agreed threshold require review.

## P2: Deepen correctness boundaries

### Route grammar

Route parsing/matching behavior is spread across modules and parametric route coverage still contains a skipped case. Consolidate grammar and matching behind one tested contract before adding route features.

**Done when:** literal, parameterized, nested, invalid, and round-trip cases share one conformance suite with no unexplained skip.

### Plane tree

The plane tree is the engine's core domain structure. Continue moving tree transactions, reconciliation, identity, and layout inputs behind explicit interfaces instead of adding behavior to large reducers and link components.

**Done when:** callers express domain operations rather than cloning/mutating internal nodes, invariants are tested centrally, and unrelated branches retain identity.

### Lifecycle and readiness

Denote still contains one-tick publication deferrals because child effects and View subscriptions have mount-order coupling. Provide a documented readiness or buffered command path instead of making every product guess when the engine can receive a command.

**Done when:** a product can publish initial restore/navigation commands deterministically with no `setTimeout` protocol.

### Server process ownership

Keep signal handlers, start/stop behavior, and still-generation browser lifecycle explicit and embeddable. Optional Puppeteer behavior should fail early with a clear capability error.

**Done when:** multiple server instances can be tested without process-global leakage and still generation has a deterministic dependency check and cleanup path.

## P3: Consume the engine in products

### Denote

Map each engine-related workaround to a supported surface: route-exterior pubsub or `onReady`, viewpoint codec/callback, storage adapter, `space.changed`, persistence callbacks, selection/links, and collaboration mutation/apply. Keep note history and owner/local storage in Denote; do not misclassify product data as engine state.

**Done when:** Denote's spatial core loop has browser tests and no undocumented timing/global bridge is required.

### Depict

Use `usePluridPlane()` and consumer-authored media planes. The engine should provide sizing, visibility, focus, selection, and spatial behavior; it should not ship Depict image components.

**Done when:** Depict's primary media workflow runs in the engine without a second plane/rendering model.

### Dechat

Use engine primitives for conversation branches, context, artifacts, navigation, and spatial history only where they are domain-independent. Model providers, token streams, tool calls, messages, privacy, and retention remain Dechat concerns.

**Done when:** Dechat can express its spatial interaction through public engine APIs without the engine depending on an LLM SDK.

## P4: Complete developer experience

### Finish the kit-shaped generator

`generate-plurid-app` still shells out to Create React App and emits webpack/rollup-era dependencies. Replace it with direct generation of a small kit application, validate inputs, make failures non-silent, and test the generated project by installing/building through a fixture strategy appropriate for CI.

**Done when:** a generated app has `plurid.config.ts`, thin entries, no legacy `scripts/` tree, and passes type-check/build/browser smoke.

### Clarify package surfaces and compatibility

Avoid source imports from distribution internals, reduce aggregate entry points that drag unnecessary code, document peer compatibility, and automate a release matrix for data/engine/react/server/kit.

**Done when:** public entry points are sufficient for Denote, Depict, and Dechat and an incompatible publish is caught before release.

## P5: Renderer evolution and WebXR

Do not begin by translating DOM components into an unrelated WebGL application. First define a renderer contract around stable plane identity, geometry, content capability, input, selection, and camera state. Measure what the DOM renderer cannot meet. Then prototype WebGL/WebXR as an adapter that shares the engine domain/state model.

Open questions include DOM overlay versus texture rendering, accessibility and text input, focus transfer, content measurement, hit testing, XR controllers/hands, and coexistence between flat browser and immersive modes.

**Done when:** the same product space can use another renderer without forking routes, tree semantics, persistence, collaboration, or product data.

## Package disposition

| Surface | Status |
| --- | --- |
| `plurid-data`, `plurid-engine`, `plurid-pubsub`, `plurid-react`, `plurid-react-server`, `plurid-kit` | Live supported graph |
| themes/functions/icons/UI utilities | Live support packages; test depth should match public use |
| `generate-plurid-app` | Live but outdated; P4 target |
| `fixtures/render-test` and examples | Live verification and learning surfaces |
| `plurid-canvas`, `plurid-html`, `plurid-routes-server` | Source retained but excluded from the live workspace gates |
| browser extension/native/specification prototypes | Experimental or historical unless explicitly promoted through a product/renderer decision |

## Required verification commands

Today:

```bash
pnpm build
pnpm test
pnpm lint
pnpm --filter @plurid/plurid-react check
```

Target:

```bash
pnpm build
pnpm check
pnpm test
pnpm lint
pnpm test:browser
pnpm size
```

The target commands are roadmap contracts, not claims that those root scripts already exist.
