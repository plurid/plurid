# Plurid — Package Map & Status

_Last updated: 2026-06-20._

This is the governance map for the monorepo: **what is live, what is legacy, what is experimental**, and how the workspace/quality gates cover each package. It exists because folder names alone don't make those distinctions clear (the lens both `docs/ENGINE_AUDIT_AND_ROADMAP.md` and `docs/CODEBASE_DEEP_CRITIQUE.md` asked for).

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
| `@plurid/plurid-data` | shared types/constants/enums/theme+route data | **LIVE (core)** | B·L | ✅ | No test script (add invariants if any). Locale data bundled — see subpath-export backlog. |
| `@plurid/plurid-engine` | plane tree, layout, routing, math | **LIVE (core)** | BTL | ✅ | The deepest module. Tree mutations now immutable + structurally shared. 37 skipped tests = routing/matrix/transform/faceToFace debt. |
| `@plurid/plurid-pubsub` | event bridge | **LIVE (core)** | BTL | ✅ | Thin behavioral tests. |
| `@plurid/plurid-react` | primary render adapter | **LIVE (works)** | BTL | ✅ | Sanity test only — needs interaction/render tests. `View`/`router`/`Link` are the decomposition targets. |
| `@plurid/plurid-react-server` | SSR / static "stills" | **LIVE (works)** | BTL | ✅ | Signal handlers now opt-out. Stiller/Puppeteer hardening pending. |
| `@plurid/plurid-routes-server` | route server | **LIVE? (utilities)** | BTL | ✅ | **No obvious in-repo consumer** — confirm live or mark legacy. |
| `@plurid/plurid-functions`, `…-react` | utilities | **LIVE (utilities)** | BT | ✅ | Best-covered utilities. `eval` removed. |
| `@plurid/plurid-themes` | theme objects | **LIVE (utilities)** | BTL | ✅ | Aggregate default export — subpath exports pending. |
| `@plurid/plurid-icons-react` | icon set | **LIVE (utilities)** | BTL | ✅ | All-icons bundle, treeshake off — subpath exports pending. |
| `@plurid/plurid-ui-components-react` | UI components | **LIVE (utilities)** | BTL | ✅ | Aggregate bundle, treeshake off. |
| `@plurid/plurid-ui-state-react` | UI state slices | **LIVE (utilities)** | BTL | ✅ | Add reducer tests per action. |
| `@plurid/generate-plurid-app` | scaffolding CLI | **LIVE (tooling)** | BTL | ✅ | Still scaffolds CRA — Vite rewrite pending. `--versioning` fixed. |
| `fixtures/render-test` | CAD verification harness | **FIXTURE** | B | build-only | The engine's integration harness (port 5274). In the workspace; dev-served. |
| `@plurid/plurid-canvas` | canvas render adapter | **LEGACY / not live** | BTL | ❌ (filtered) | In `plurid-works/*` glob but excluded from root scripts. Align to a render-adapter interface or archive. |
| `@plurid/plurid-html` | Stencil HTML adapter | **LEGACY / not live** | BT | ❌ (filtered) | Duplicates engine math locally; not an engine consumer. Archive candidate. |
| `@plurid/plurid-pttp` (browser extension) | Chrome extension | **EXPERIMENTAL** | TL | ❌ (outside workspace) | `packages/plurid-web/plurid-browser/…`, not in workspace globs. |
| `packages/plurid-native` | SwiftUI prototype | **EXPERIMENTAL** | — | ❌ | Prototype; tracks Xcode user-state + `.DS_Store` (should be git-ignored). |
| `fixtures/extras/*`, `fixtures/plurid-react-*`, `…/themes-react` | generated/demo fixtures | **FIXTURE / demo** | varies | ❌ (outside workspace) | Not governed; some are generator outputs. |

## Workspace & gates

- **Workspace globs** (`pnpm-workspace.yaml`): `packages/plurid-web/plurid-core/*`, `packages/plurid-web/plurid-works/*`, `packages/plurid-utilities/*`, `fixtures/render-test`. Note this **includes** canvas + html.
- **Root scripts** (`package.json`) run `pnpm -r` with `--filter='!@plurid/plurid-canvas' --filter='!@plurid/plurid-html'`, so those two are excluded from build/test/lint. As of 2026-06-20, **root `build` + `test` + `lint` all pass**.
- **Outside the workspace entirely**: the browser extension, the native prototype, and `fixtures/extras/*`.

## Recommended status moves

- **Decide `plurid-routes-server`**: live or legacy. If legacy, mark it and drop from the primary graph.
- **Archive `plurid-canvas` + `plurid-html`** explicitly (move under an `archive/` path or document as legacy) so the workspace glob stops implying they're first-class.
- **Git-ignore** native Xcode user-state + `.DS_Store`; treat the native + extension surfaces as clearly experimental.

## See also

- `docs/ENGINE_AUDIT_AND_ROADMAP.md` — engine-deep audit + phased roadmap (with per-phase progress).
- `docs/CODEBASE_DEEP_CRITIQUE.md` — repo-wide critique (governance, package shapes, product ideas).
