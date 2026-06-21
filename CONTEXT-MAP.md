# Plurid — Package Map & Status

_Last updated: 2026-06-21._

This is the governance map for the monorepo: **what is live, what is legacy, what is experimental**, and how the workspace/quality gates cover each package. It exists because folder names alone don't make those distinctions clear (the lens both `docs/ENGINE_AUDIT_AND_ROADMAP.md` and `docs/CODEBASE_DEEP_CRITIQUE.md` asked for).

> New here? To **use** the engine read [`GETTING_STARTED.md`](./GETTING_STARTED.md); to **work on** it read [`CONTRIBUTING.md`](./CONTRIBUTING.md). This file is the package-by-package status reference.

## What is live right now

The shipping product is a **CSS-3D spatial engine** ("planes are pages" in a navigable 3D space) with a **React adapter** and an **SSR/static server**. The live graph is:

```
plurid-data ──► plurid-engine ──► plurid-react ──► (your app)
   (types,        (plane tree,      (render adapter,
    constants)     layout, routing,   controls, links)
                   math)            └► plurid-react-server (SSR / static stills)
plurid-pubsub ──────────────────────► (event bridge used by the adapter)
```

Everything else is support (themes, icons, UI components, ui-state, functions), tooling (`generate-plurid-app`), or **not live** (canvas/html adapters, native prototype, browser extension, fixtures).

## Status table

Gates: **B**uild · **T**est · **L**int (as run by the package's own scripts). "Root gates" = included in root `pnpm build`/`test`/`lint`.

| Package | Role | Status | Gates | Root gates | Notes |
|---|---|---|---|---|---|
| `@plurid/plurid-data` | shared types/constants/enums/theme+route data | **LIVE (core)** | BTL | ✅ | Has `test` + invariant suite (default config, pubsub-topic uniqueness, `defaultTreePlane`). Locale data bundled — see subpath-export backlog. |
| `@plurid/plurid-engine` | plane tree, layout, routing, math | **LIVE (core)** | BTL | ✅ | The deepest module. Tree mutations now immutable + structurally shared. 37 skipped tests = routing/matrix/transform/faceToFace debt. |
| `@plurid/plurid-pubsub` | event bridge | **LIVE (core)** | BTL | ✅ | Thin behavioral tests. |
| `@plurid/plurid-react` | primary render adapter | **LIVE (works)** | BTL | ✅ | Sanity test only — needs interaction/render tests. `View`/`router`/`Link` are the decomposition targets. |
| `@plurid/plurid-react-server` | SSR / static "stills" | **LIVE (works)** | BTL | ✅ | Hardened 2026-06-21: XSS-safe metastate injection, Express 5 (+ html-minifier-terser), Stiller browser-reuse/leak-safe, **stills pipeline re-wired** (Puppeteer = optional peer), template-util + Renderer SSR tests. |
| `@plurid/plurid-routes-server` | route server | **LEGACY / orphaned** | — | ❌ (de-globbed) | De-globbed (`!` in `pnpm-workspace.yaml`, 2026-06-21). Zero in-repo consumers; a pluriverse-era Express route-cache, not in the live graph. Source kept on disk. |
| `@plurid/plurid-functions`, `…-react` | utilities | **LIVE (utilities)** | BT | ✅ | Best-covered utilities. `eval` removed. |
| `@plurid/plurid-themes` | theme objects | **LIVE (utilities)** | BTL | ✅ | Aggregate default export — subpath exports pending. |
| `@plurid/plurid-icons-react` | icon set | **LIVE (utilities)** | BTL | ✅ | All-icons bundle, treeshake off — subpath exports pending. |
| `@plurid/plurid-ui-components-react` | UI components | **LIVE (utilities)** | BTL | ✅ | Aggregate bundle, treeshake off. |
| `@plurid/plurid-ui-state-react` | UI state slices | **LIVE (utilities)** | BTL | ✅ | Add reducer tests per action. |
| `@plurid/generate-plurid-app` | scaffolding CLI | **LIVE (tooling)** | BTL | ✅ | Still scaffolds CRA — Vite rewrite pending. `--versioning` fixed. |
| `fixtures/render-test` | CAD verification harness | **FIXTURE** | B | build-only | The engine's integration harness (port 5274). In the workspace; dev-served. |
| `@plurid/plurid-canvas` | canvas render adapter | **ARCHIVED** | — | ❌ (de-globbed) | De-globbed from the workspace (`!` in `pnpm-workspace.yaml`, 2026-06-20). Source kept on disk; out of every gate. |
| `@plurid/plurid-html` | Stencil HTML adapter | **ARCHIVED** | — | ❌ (de-globbed) | De-globbed (`!` in `pnpm-workspace.yaml`). Stale Stencil duplicate of the engine; source kept on disk. |
| `@plurid/plurid-pttp` (browser extension) | Chrome extension | **EXPERIMENTAL** | TL | ❌ (outside workspace) | `packages/plurid-web/plurid-browser/…`, not in workspace globs. |
| `packages/plurid-native` | SwiftUI prototype | **EXPERIMENTAL** | — | ❌ | Prototype; tracks Xcode user-state + `.DS_Store` (should be git-ignored). |
| `fixtures/extras/*`, `fixtures/plurid-react-*`, `…/themes-react` | generated/demo fixtures | **FIXTURE / demo** | varies | ❌ (outside workspace) | Not governed; some are generator outputs. |

## Workspace & gates

- **Workspace globs** (`pnpm-workspace.yaml`): `packages/plurid-web/plurid-core/*`, `packages/plurid-web/plurid-works/*`, `packages/plurid-utilities/*`, `fixtures/render-test` — with canvas, html, and **plurid-routes-server** **de-globbed** via explicit `!` negations (so they're no longer first-class).
- **Root scripts** (`package.json`): `build` + `test` are plain `pnpm -r` (no canvas/html filter needed anymore — they're out of the workspace). `lint` is a **single flat-config ESLint 10 pass** over the live source (`eslint.config.mjs` at the root), not `pnpm -r lint` — there are no per-package eslint configs. As of 2026-06-21, **root `build` + `test` + `lint` all pass** on React 19 / TypeScript 6.0 (lib ES2025) / jest 30 / Node 22+ (CI: Node 24).
- **Type-check** is separate from build: `tsup`/esbuild does not type-check, so `pnpm --filter <pkg> check` (`tsc`) is the real type gate.
- **Outside the workspace entirely**: the browser extension, the native prototype, and `fixtures/extras/*`.

## Recommended status moves

- ✅ **Decided `plurid-routes-server` → LEGACY** (2026-06-21): zero in-repo consumers, de-globbed from the workspace, dropped from the primary graph.
- ✅ **Archive `plurid-canvas` + `plurid-html`** — done (2026-06-20): both de-globbed from the workspace (`!` in `pnpm-workspace.yaml`); source kept on disk. Optionally move them under an `archive/` path later.
- **Git-ignore** native Xcode user-state + `.DS_Store`; treat the native + extension surfaces as clearly experimental.

## See also

- `GETTING_STARTED.md` — install → render → configure → control (for **using** the engine).
- `CONTRIBUTING.md` — layout, gates, the render-test harness, and how to add a seam (for **working on** it).
- `docs/CONTROL_SURFACE.md` — the full developer-control-surface reference.
- `examples/` — runnable references (`minimal`, `control-surface`).
- `docs/ENGINE_AUDIT_AND_ROADMAP.md` — engine-deep audit + phased roadmap (with per-phase progress).
- `docs/CODEBASE_DEEP_CRITIQUE.md` — repo-wide critique (governance, package shapes, product ideas).
