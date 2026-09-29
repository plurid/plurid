# AGENTS.md

Instructions for AI coding agents working in this repository, or with the library it publishes.
Humans: the same facts are in [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) and [`docs/README.md`](./docs/README.md).

## What this is

`plurid'` is a React engine for 3D spatial interfaces. Planes (any React component) float in a CSS-3D
space the reader orbits, pans and zooms, and links open planes beside the one they are in. A **page
presentation** makes the same application an ordinary site until the reader reveals the space. There
is no WebGL: planes are real DOM, so they stay selectable, accessible and styleable.

## Layout

| Path | What |
| --- | --- |
| `packages/plurid-web/plurid-core/plurid-data` | Types, constants and the data tables (topics, shortcuts, change kinds). No runtime logic. |
| `packages/plurid-web/plurid-core/plurid-engine` | Framework-free logic: layout, tree, camera, routing, configuration, state compute. |
| `packages/plurid-web/plurid-core/plurid-pubsub` | The synchronous bus. |
| `packages/plurid-web/plurid-works/plurid-react` | The React adapter: `@plurid/plurid-react`, plus `/testing` and `/agent`. |
| `packages/plurid-web/plurid-works/plurid-react-server` | Server rendering (`PluridServer`). |
| `packages/plurid-web/plurid-works/plurid-kit` | The framework CLI (`plurid dev/build/start`). |
| `packages/plurid-utilities/generate-plurid-app` | The app generator. |
| `fixtures/render-test` | The browser harness (Vite, port 5273) and the Playwright suite (`e2e/`). |
| `examples/` | Type-checked examples (`pnpm --filter plurid-render-test check`). |
| `docs/` | Architecture, control surface, guides; four files are GENERATED (below). |

## Setup and gates

pnpm 11 and Node 22 or later. After `pnpm install`, run `pnpm build` first: packages import each
other's `distribution/`, so a stale build fails the others' checks in confusing ways.

| Command | What it checks |
| --- | --- |
| `pnpm build` | every package (tsup: ESM `.mjs` + CommonJS `.js` + types) |
| `pnpm check` | `tsc` in every package, the harness, and the examples |
| `pnpm test` | jest in every package (jsdom for React) |
| `pnpm lint` | eslint |
| `pnpm check.modules` | every entry point loads under ESM and CommonJS; React renders the same through both |
| `pnpm size` | bundle budgets (`configurations/size-budgets.json`; `--update` after a deliberate change) |
| `pnpm docs.tables.check` | the generated docs match the data tables (`pnpm docs.tables` rewrites them) |
| `pnpm e2e` | the Playwright suite against the harness (`--project=chromium`, `perf`, `visual`) |
| `pnpm smoke.pack` | packs every package, generates an app, builds it, hydrates it in Chromium |
| `pnpm verify` | all of the above, in order |

Run a single jest file from a package directory:
`npx jest source/path/to/file.test.tsx --config ./configurations/jest.config.js --rootDir ./ --coverage=false`.

## Rules the code base holds

- **Never edit `distribution/`** or the generated docs (`docs/SHORTCUTS.md`, `HARNESS.md`, `LOOKS.md`,
  `CHANGES.md`). Change the data table in `plurid-data` and run `pnpm docs.tables`.
- **A new bus topic needs a subscriber.** A test asserts that every command topic has one. A new
  `space.changed` kind goes in both `PLURID_CHANGE_KINDS` and `PluridChangeKind` (a test holds them equal).
- **Bus handlers read the store at call time** (`current()` in `usePluridPubSub`), never a closure
  or the last render.
- **Browser tests wait on state, never on time.** `page.waitForTimeout` is a lint error in `e2e/`.
  Use the helpers in `e2e/helpers.ts` (`waitForState`, `settle`, `afterFrames`). Nothing is retried.
- **Visual baselines are per platform** (`e2e/__snapshots__/<platform>/`). CI compares the `linux`
  ones inside the pinned Playwright container. A chrome change that moves pixels needs new baselines
  there; `visual.spec.ts` says how.
- **ESM and CommonJS must render the same.** styled-components numbers components in creation order;
  keep React's build split in both formats (see `tsup.config.ts`).
- **A fix carries its regression test,** next to the code in `__tests__/`. React tests render through
  `@plurid/plurid-react/testing` (`renderPlurid`, `gestures`, `installFrameClock`).
- **Style:** 4-space indent, `// #region` blocks, and comments that explain WHY. The house style is
  full sentences about behaviour, often with the date a behaviour changed.
- **Commits:** a short subject, `dev: …` for code or `docs: …` for documentation, with no body.

## Using the library from an agent

- **Embed plurid and let an AI agent operate it:** `@plurid/plurid-react/agent`
  ([`docs/AGENT_CONTROL.md`](./docs/AGENT_CONTROL.md)). It provides fourteen tools with JSON Schemas,
  an observation of the space, WebMCP registration, a `window` global, and a Claude loop example.
- **Drive an application programmatically without an agent:** the bus and the handle
  ([`docs/CONTROL_SURFACE.md`](./docs/CONTROL_SURFACE.md)).
- **Start an application:** [`docs/GETTING_STARTED.md`](./docs/GETTING_STARTED.md), or
  `npx @plurid/generate-plurid-app`.
