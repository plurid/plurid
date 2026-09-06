# Plurid Engine Documentation

Current as of **2026-09-06**.

## Authority order

| Document | Purpose |
| --- | --- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Source-verified description of the live package graph, render pipeline, state, SSR, kit, and public APIs |
| [`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md) | Canonical guide to configuration, callbacks, pubsub, storage, gestures, shortcuts, slots, and escape hatches |
| [`GETTING_STARTED.md`](./GETTING_STARTED.md) | Use the engine: a site first, a space, planes, links, configuration, persistence, the viewpoint |
| [`SHORTCUTS.md`](./SHORTCUTS.md) | GENERATED — every keyboard shortcut and pointer gesture, from the data tables (`pnpm docs.tables`) |
| [`HARNESS.md`](./HARNESS.md) | GENERATED — every flag and fixture of the verification harness (`fixtures/render-test`) |
| [`LOOKS.md`](./LOOKS.md) | GENERATED — the twelve looks and the 45 chrome tokens, from `@plurid/plurid-themes` (`pnpm docs.tables`) |
| [`DESIGN.md`](./DESIGN.md) | The chrome's vocabulary and rules: pill, panel, line; the dual ground; the two tiers; adding a piece of chrome |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Work on the engine: the gates, the harness, the traps |
| [`CONTEXT-MAP.md`](./CONTEXT-MAP.md) | Package status, ownership, and gate coverage |
| [`ENGINE_AUDIT_AND_ROADMAP.md`](./ENGINE_AUDIT_AND_ROADMAP.md) | Active engineering defects, performance work, and verification priorities |
| [`ENGINE_FEATURE_ROADMAP.md`](./ENGINE_FEATURE_ROADMAP.md) | Delivered capabilities, adoption status, and future capability sequence |
| [`FRAMEWORK_PLAN.md`](./FRAMEWORK_PLAN.md) | Current `@plurid/plurid-kit` adoption and generator plan |

Source wins on behavior. `ARCHITECTURE.md` and `CONTROL_SURFACE.md` are the maintained descriptions. Roadmaps express intent and must not be cited as proof that a capability exists.

## Current priorities

1. Measure retained content under culling and define virtualization (mount / retain / unmount) semantics with memory budgets — culling itself is wired.
2. Protect rendering and interaction with browser and visual regression tests — in place since 2026-09-05 (`fixtures/render-test/e2e/fixtures.spec.ts` for every fixture of the catalog, the `visual` Playwright project for the screenshot baselines, `e2e/page.spec.ts` for the page presentation frame by frame; `docs/HARNESS.md`); extend the catalog as features land.
3. Keep CI on the repository's own gates (type checks, module imports, generated tables and the chromium suite run on every change since 2026-09-06; the strict visual comparisons stay local, their baselines are macOS renders).
4. Move Denote onto the public engine control/persistence/collaboration seams.
5. Use Depict and Dechat to validate content and interaction generality.
6. Complete kit adoption and replace the CRA-era generator.
7. Define a renderer abstraction and WebXR path only after the DOM renderer has measured budgets and stable product contracts.

## Verification baseline

The root gates are:

```bash
pnpm build
pnpm test
pnpm lint
```

Every public package exposes a `check` script (the harness too). GitHub CI runs build, test, lint, `check`, `check.modules` and `docs.tables.check` on every change, plus the chromium browser suite in its own job; `pnpm verify` is the local superset (it adds the strict visual comparisons, whose baselines are macOS renders, and the packed-install smoke test). Rendering and interaction work also requires the Vite render harness; product-motivated engine work requires product-level verification in the consuming application.
