# Production readiness (2026-09-29)

The record of the sweep that prepared the 2026-09-29 release: what was checked, what changed, the
evidence, and what is known not to be done. What a host has to know, change by change, is in
[`MIGRATION.md`](./MIGRATION.md) (the first section and "Production readiness").

## Scope

Everything this repository publishes, in thirteen packages: the data and the engine
(`@plurid/plurid-data`, `@plurid/plurid-engine`), the bus (`@plurid/plurid-pubsub`), the React adapter
with its chrome, its accessibility and its `/testing` and `/agent` entries (`@plurid/plurid-react`),
the server (`@plurid/plurid-react-server`), the framework (`@plurid/plurid-kit`), the generator
(`@plurid/generate-plurid-app`), the utilities they depend on, and the packaging of all of them.

Out of scope, by decision: the applications that consume the library. Moving Dechat off its legacy
shell, and the 31 web packages not yet on the kit (counted 2026-07-13), live in the applications
repository.

## How it was checked

Four audits and an inventory, read-only, at `8cd1ec7`. Every finding was reproduced against the
built packages before anything changed (Node scripts on `distribution/`, jsdom through
`@plurid/plurid-react/testing`, real servers on ephemeral ports, Chromium), then fixed with a
regression test beside the code.

| Review | Verified findings | Outcome |
| --- | --- | --- |
| Engine and data | 15: 4 high, 8 medium, 3 low | All fixed, plus two found while fixing: the snap drift, and `objects.clone` turning every function into an empty one |
| React adapter and accessibility | 15: 1 critical, 4 high, 6 medium, 4 low | All fixed |
| Server, kit, generator | 15: 4 high, 8 medium, 3 low | All fixed, plus four found beside them: the stills' environment and status, the `plurid dev` pidfile, the package managers on Windows, the generator's ESM entry |
| Developer experience | 20 | 18 fixed; `planeNotFound` deprecated (it never did anything); one type-level residue of the loose public types (below) |
| Control-surface inventory | what an agent needs to operate an application | Closed by `@plurid/plurid-react/agent` and the new named exports |

The worst of what was found, now fixed: one plane that threw unmounted the whole application (the
error boundary was documented as on and was off); a layout option in the built-in toolbar emptied the
space, and two layout numbers hung or crashed the tab; one malformed camera input blanked the space;
a user's string in the documented `__PRELOADED_REDUX_STATE__` convention ran as script; a request to
an unknown URL could take the server process down; every unknown URL of a fresh application answered
`404 application/json {}`; production pages under any `buildDir` but `build` never hydrated.

## What changed

- **Engine.** No configuration or input can empty the space or put a NaN in the camera; a partial
  configuration is partial and normalised; root ids stay unique; routes are matched decoded and
  addressed canonically; a plane dropped from `planes` stops resolving; a 1000-root space computes in
  about 5 ms (it took 317 ms).
- **React.** A throwing plane is contained by default and reported (`planeError`); the bus reads the
  store at call time, answers every token (`plane` or `refused`) and names its application; a
  server-rendered page with saved state hydrates, then restores; the router no longer remounts on a
  host render; two applications share a page cleanly.
- **Accessibility.** The chrome's keys are the chrome's (Enter and Space press buttons; a dialog
  keeps every key); the plane and toolbar controls are buttons; the More menu is a disclosure;
  a keyboard focus ring; `prefers-reduced-motion` respected.
- **Server.** Script injection through preserve globals and `<html lang>` closed; errors never reach
  the client as stacks; the built-in 404 and 500 pages are HTML; `start()` / `stop()` are Promises and
  a stop drains the requests in flight; host routes answer ahead of the page.
- **Kit and generator.** The documented `.env` precedence; `plurid start` supervises the server and
  writes nothing; a broken config fails `build` and `start`; the config is validated; `notFound`,
  `errorPage` and `styles` work; the generator honours its directory argument and runs on every Node 22.
- **Packaging.** Declarations per module format (a NodeNext ESM project compiles), `'use client'` on
  every file of the React adapter, `engines` `node >=22`, correct homepages and repository
  directories.
- **Developer experience.** Configuration mistakes are warned about in development, including under
  Vite (the check read a `process` global Vite does not have); every documented example compiles and
  is type-checked by `pnpm check`; render slots are typed to return a React node.
- **Agents.** `@plurid/plurid-react/agent` lets an AI agent operate an embedded application: fourteen
  tools with JSON Schemas, an observation of the space, WebMCP registration, a `window` global and a
  Claude tool-use loop ([`AGENT_CONTROL.md`](./AGENT_CONTROL.md)). [`AGENTS.md`](../AGENTS.md) and
  [`llms.txt`](../llms.txt) describe the repository and the library to coding agents.

## Evidence

The gates on the final tree (`pnpm verify` runs them in this order):

| Gate | Result |
| --- | --- |
| `pnpm build` | 13 packages: ESM, CommonJS and declarations |
| `pnpm check` | every package, the harness and the examples type-check, the tests included |
| `pnpm test` | 1,186 tests in 13 packages, all passing: React 575 (88 suites), engine 358, functions 63, server 60, kit 60, generator 16, data 14, UI components 11, themes 9, pubsub 8, icons 5, UI state 4, functions-react 3 |
| `pnpm lint` | clean |
| `pnpm check.modules` | every entry point loads under ESM and CommonJS with its own declarations per format; the React adapter renders identically through both, and all 24 of its files begin with `'use client'` |
| `pnpm size` | 18 entry points within budget; the React adapter ships 102 KB of its 105 KB (minified, gzipped) |
| `pnpm docs.tables.check` | the four generated documents match the data tables |
| `pnpm e2e` | chromium: 174 scenarios passed, twice (the second after the last engine change); perf: 13 passed. Visual: the 50 screenshots are pixel-identical to `8cd1ec7`'s rendered on the same machine (the CI baselines, taken in the pinned container, differ from this machine's fonts, not from the code) |
| `pnpm smoke.pack` | 13 packed packages install and load under ESM and CommonJS; 17 typed entry points compile for a NodeNext ESM and CommonJS consumer; the generated application type-checks under TypeScript 5 and 6, builds, and under `plurid start` and `plurid dev` paints before its script on a desktop and a phone, hydrates with no error, warning or moved page, and follows its first link |

Each fix's regression test fails without the fix; for the fixes made last, that was confirmed by
reverting the fix and watching the test fail. The same-machine screenshot comparison also caught one
regression the sweep itself had introduced (a face-to-face `middle: true` read as 0, dropping the
middle plane); it is fixed and tested (`layout/__tests__/numerics.test.ts`).

## Known limitations

- **A plane's `component` still accepts a string at the type level** (the ElementQL name). At runtime
  a plane given one now shows its error card and reports `planeError`; narrowing the type would break
  the compile of hosts that pass ElementQL names on purpose.
- **`pluridSelectors.space` names an internal module in its published type**
  (`__services_state_modules_space_selectors`). Spelling it out adds 82 KB of declarations; the
  selectors themselves are fully typed.
- **`planeNotFound` is deprecated, not implemented.** Use a not-found route (`/not-found`) or
  `renderEmpty`.
- **`space.changed` stays permissive by default** (`value: any`) so existing subscribers compile;
  `PluridChange` is the strict, narrowing union.
- **A server without `hostname` renders on the request's `Host` header.** Configure `hostname` in
  production (the kit requires it).
- **A preserve global must be JSON**, or keep `<` inside string literals: values are escaped for the
  inline script.
- **Visual baselines are per platform.** CI compares the Linux ones in the pinned Playwright
  container; a chrome change that moves pixels needs new baselines there.
- **Node 22 or later**, for every package.

## Releasing

Nothing reaches an application until it is published. Every package's manifest changed (the
`exports` maps), so all thirteen are released, in dependency order:

1. `@plurid/plurid-themes`, `@plurid/plurid-functions`, `@plurid/plurid-functions-react`
2. `@plurid/plurid-data`
3. `@plurid/plurid-pubsub`, `@plurid/plurid-engine`, `@plurid/plurid-icons-react`, `@plurid/plurid-ui-state-react`
4. `@plurid/plurid-ui-components-react`
5. `@plurid/plurid-react`
6. `@plurid/plurid-react-server`
7. `@plurid/plurid-kit`
8. `@plurid/generate-plurid-app` (last: it stamps the versions of the kit, the server and the engine
   into the applications it generates)
