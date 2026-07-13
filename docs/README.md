# Plurid Engine Documentation

Current as of **2026-07-13**.

## Authority order

| Document | Purpose |
| --- | --- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Source-verified description of the live package graph, render pipeline, state, SSR, kit, and public APIs |
| [`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md) | Canonical guide to configuration, callbacks, pubsub, storage, gestures, shortcuts, slots, and escape hatches |
| [`../CONTEXT-MAP.md`](../CONTEXT-MAP.md) | Package status, ownership, and gate coverage |
| [`ENGINE_AUDIT_AND_ROADMAP.md`](./ENGINE_AUDIT_AND_ROADMAP.md) | Active engineering defects, performance work, and verification priorities |
| [`ENGINE_FEATURE_ROADMAP.md`](./ENGINE_FEATURE_ROADMAP.md) | Delivered capabilities, adoption status, and future capability sequence |
| [`FRAMEWORK_PLAN.md`](./FRAMEWORK_PLAN.md) | Current `@plurid/plurid-kit` adoption and generator plan |
| [`CODEBASE_DEEP_CRITIQUE.md`](./CODEBASE_DEEP_CRITIQUE.md) | Historical 2026-06-19 audit; useful provenance, not current status |

Source wins on behavior. `ARCHITECTURE.md` and `CONTROL_SURFACE.md` are the maintained descriptions. Roadmaps express intent and must not be cited as proof that a capability exists.

## Current priorities

1. Wire and measure real culling/virtualization for large spaces.
2. Protect rendering and interaction with browser and visual regression tests.
3. Add explicit repository type-checking to CI.
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

`plurid-react` also exposes an explicit `check` script. The current GitHub CI runs build, test, and lint but not that type-check. Rendering and interaction work also requires the Vite render harness; product-motivated engine work requires product-level verification in the consuming application.
