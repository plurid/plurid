# Plurid Codebase Critique — 2026-09-06

- **Audited revision:** `d2d510d684db872f2dd2d3b4ea3fdc45299e032d`.
- **Audience:** engine maintainers, application integrators, and designers of products using Plurid.
- **Method:** dual-agent UI assessment: design `/root/design_review` and detector/browser evidence `/root/ui_evidence`, supplemented by the main source/gate review and `/root/core_review`. The independent design assessment finished before detector findings were combined with it.
- **Status:** a dated assessment of this revision. This document proposes improvements; it does not implement them or replace the maintained architecture and control-surface references.

## Resolution (2026-09-06, the same day)

Every finding was verified against the source (C06 reproduced on the built engine) and acted on; the
regression tests named below are the acceptance evidence. Sizes in section 9 stood; two items were bounded
deliberately (C03 as an interim rule, U06 left as a hypothesis).

| ID | Disposition | Where |
| --- | --- | --- |
| C01 | Fixed — the bus bridge is a layout effect, installed before `componentDidMount` fires `onReady` | `View/hooks/usePluridPubSub.ts`; `Application/__tests__/lifecycle.test.tsx` |
| C02 | Fixed — the store / viewpoint subscriptions and the flush listeners are mount-owned (StrictMode replay re-subscribes; the unmount resets them) | `Application/index.tsx`; the same test |
| C03 | Interim — a remote apply clears the local undo/redo stacks; rebased undo remains the follow-up | `state/middleware/history.ts`; `history.test.ts`; CONTROL_SURFACE "Undo" |
| C04 | Fixed — one registrar per application (client too), the window-global registry a read fallback | `Application/index.tsx` `prepare()`; engine `planes/registrar/object.ts`; lifecycle test |
| C05 | Fixed — the culling pass takes the eligibility inputs (selection, active, isolate, configuration) and listens to focus | `View/hooks/useCulling.ts`; `useCulling.test.tsx` |
| C06 | Fixed — any hash leaves the pathname and the query; a malformed directive is dropped, never thrown | engine `routing/Parser/logic.ts`; parser + matcher tests |
| C07 | Fixed — an `onServe` failure without `onError` reaches the error path; `onError` may respond, depreserve, or handle | `Server/preserves.ts`; `server.test.tsx` |
| C08 | Fixed — `/api/*` matches `/api` and `/api/…` only, query ignored | `Server/preserves.ts`; `server.test.tsx` |
| C09 | Fixed — `afterServe` is observed (`.catch` with the request id), never a second response | `Server/pipeline.tsx`; `server.test.tsx` |
| C10 | Fixed — the arrangement signature carries `parentPlaneID` | `logic/arrangement/signature.ts`; `signature.test.ts` |
| C11 | Fixed — one `normalizeAnswers` for both paths; unsupported choices (and the unimplemented UI engines) fail with a message and exit 1 | generator `process/normalize.ts`; `__tests__/normalize.test.ts` |
| C12 | Fixed — argument-array commands that reject on failure, awaited `fs.cp` copies, `fs.rm` removals, an owned (empty) destination, removals only after every command succeeded | generator `utilities/index.ts`, `process/react/{client,server}/index.ts`; the same test |
| C13 | Fixed — `resolvePaths(config)` governs dev, build, esbuild, start, the manifest and the server defaults | kit `cli/paths.ts`; `__tests__/paths.test.ts` |
| C14 | Fixed — the target is resolved once (omitted = window, `null` = off) and captured for teardown; a changed element re-subscribes | functions-react `hooks/event`; `hooks/__tests__/hooks.test.tsx` |
| C15 | Fixed — only a container the hook created is removed, when empty; `id` / `parentID` are inputs | functions-react `hooks/portal`; the same test |
| U01 | Fixed — drawer headings are native `button[aria-expanded][aria-controls]`s | `Toolbar/General/components/Drawer`; `e2e/a11y.spec.ts` |
| U02 | Fixed — at ≤ 640 px the rail and the `?` rise above the toolbar band while the space is revealed | `DockRail/styled.ts`, `Shortcuts/styled.ts`; `a11y.spec.ts` |
| U03 | Fixed — while a page is docked every other plane is `inert`; the focus anchor is named | `structural/Plane/index.tsx`; `a11y.spec.ts` |
| U04 | Fixed — `PluridLink` renders an `href` (the plane's address); Enter is the native click | `links/Link/index.tsx`; `fallback.test.tsx`, `a11y.spec.ts` |
| U05 | Fixed — `PluridSwitch` takes `label`; the Transform drawer names its switches and selection buttons | ui-components `Switch`; `MenuMore/components/Transform` |
| U06 | Open — a usability hypothesis; task-oriented help is not built | — |
| U07 | Fixed — the plane error boundary renders an alert with a Retry action | `utilities/ErrorBoundary` |
| U08 | Fixed — a visible Close pill in the shortcuts dialog (targets unchanged) | `Shortcuts` |
| DX | CI runs check / check.modules / docs.tables.check and a chromium job; the harness has a `check` script and type-checks; the minimal example's key copy is current | `.github/workflows/ci.yml`, `fixtures/render-test` |
| + | Found while checking the mobile view the same day: the harness page and the server template had no viewport meta (a phone laid the page out at 980 px and shrank it) — the harness declares one, the server template emits one unless the document does; and the production store variant lacked the serializable-check ignore for `shortcuts.onUnhandledKey`, so a dev server logged an error per action — both variants share one middleware stack now | `fixtures/render-test/index.html`, `Renderer/template`, `state/store/middleware.ts`; `server.test.tsx` |
| Docs | The conflicts table reconciled: package-map counts, the persistence fields, the roadmap culling language, the kit's status (registry `0.0.0-4`, workspace `0.0.0-5`), the kit README restart note, the root README defaults | `docs/CONTEXT-MAP.md`, `ARCHITECTURE.md`, `README.md`, the roadmaps, the kit README |

## Contents

1. [Executive assessment](#1-executive-assessment)
2. [Coverage and evidence](#2-coverage-and-evidence)
3. [Correctness and reliability findings](#3-correctness-and-reliability-findings)
4. [UI, UX, and accessibility](#4-ui-ux-and-accessibility)
5. [Architecture and developer experience](#5-architecture-and-developer-experience)
6. [Performance](#6-performance)
7. [Security and operational boundaries](#7-security-and-operational-boundaries)
8. [Implemented capabilities and remaining gaps](#8-implemented-capabilities-and-remaining-gaps)
9. [Prioritized improvement roadmap](#9-prioritized-improvement-roadmap)
10. [Verification record and regression scenarios](#10-verification-record-and-regression-scenarios)

## 1. Executive assessment

Plurid has a coherent product idea and a substantial implementation: ordinary DOM content becomes navigable, linked planes, with a camera that can dock onto a page or reveal its spatial context. The page-to-space transition, configurable chrome, framework-independent geometry, typed host controls, and SSR document model are meaningful strengths.

The main engineering weakness is **composition between features**. Readiness does not guarantee that commands can be received. Development remounts break persistence subscriptions. Local history can undo a peer's later work. Culling exceptions are read without all the changes that should trigger recomputation. These failures sit between otherwise well-developed modules.

The user experience has a similar pattern: the visual language is consistent, but some fundamental interaction contracts are incomplete. Keyboard users cannot reach settings drawers, spatial links lack native link semantics, offscreen page ancestors remain in the tab sequence, and mobile controls overlap. These deserve attention before expanding the visual system.

The verification baseline is stronger than several repository documents suggest: **494 package tests passed, one was skipped; 107 Chromium scenarios and 38 strict visual comparisons passed; the build, type checks, lint, module imports, generated documentation checks, and packed-install smoke test passed.** The reproduced defects below therefore identify specific gaps in coverage, not an absence of testing.

| Dimension | Assessment | Main implication |
| --- | --- | --- |
| Product model | Strong and distinctive | Preserve the DOM/page/plane model while hardening its contracts. |
| Core correctness | Capable, with important integration defects | Prioritize lifecycle, history/collaboration, registry isolation, and routing. |
| Visual design | Coherent, restrained, configurable | Improve responsive composition and discoverability within the existing vocabulary. |
| Accessibility | Foundations exist; major interaction gaps remain | Keyboard reachability, focus scope, names, and native links need explicit acceptance tests. |
| Developer experience | Rich control surface; uneven onboarding and reliability | Repair the generator, align config behavior, and make readiness dependable. |
| Performance | Encouraging camera-path measurements | Separate camera cost, content cost, retained memory, and first-frame latency. |
| Verification/release | Strong local gates, narrower CI | Move the important existing checks into a reliable release path. |
| Documentation | Extensive but internally inconsistent | Reconcile status claims with source and generate more factual inventories. |

**Recommended first priorities:** preserve user and peer state, make application lifecycle/readiness deterministic, restore keyboard and mobile access to existing controls, fix routing and server error propagation, then close the gap between local verification and CI.

## 2. Coverage and evidence

### Repository scope

The revision contains **2,213 tracked files**, including assets, templates, documentation, and retained experiments. The live workspace has **13 public packages plus the render-test fixture**. This was a subsystem review with deep investigation of selected call paths; it was not a line-by-line audit of every tracked file.

| Surface | Review depth | What was inspected or exercised |
| --- | --- | --- |
| `plurid-data`, `plurid-engine`, `plurid-pubsub` | Deep on selected contracts | Configuration/types, registration, route parsing, arrangement/history semantics, camera/culling, persistence, and host command delivery. |
| `plurid-react` | Deep | Application lifecycle, View hooks, store/history/collaboration, links, plane focus, chrome, browser interaction, and regression suite. |
| `plurid-react-server` | Targeted deep review | Preserve/loading and response pipeline, SSR/document serialization, error handling, static assets, still-generation lifecycle, and HTTP tests. |
| `plurid-kit` | Targeted | Configuration loading, build/start paths, client/server entry points, asset manifest, process ownership, tests, and packaging. |
| Themes, icons, UI components, UI state, functions, React functions | Targeted | Theme/token architecture, shared control semantics, hook cleanup, exports, test depth, and workspace/package gates. No exhaustive audit of every utility or icon. |
| `generate-plurid-app` and templates | Targeted deep review | CLI option normalization, supported choices, command construction, failure behavior, filesystem operations, template copying, and onboarding shape. No real generated application was deployed. |
| Harness, examples, docs, build scripts, CI | Deep on integration quality | Fixture catalog, browser/visual/benchmark gates, examples and documentation consistency, package imports, packed installation, and CI omissions. |
| HTML/canvas/routes-server archives | Inventory and governance | Workspace exclusions, retained source and package status. Their defects are not treated as failures of the live React engine. |
| Browser extension, native prototypes, specification/about material | Inventory | Experimental status and lack of coverage by the live workspace gates. No native build, extension installation, or protocol interoperability test. |

Source takes precedence over [architecture descriptions](./ARCHITECTURE.md), [the package map](./CONTEXT-MAP.md), and roadmaps when they disagree. The [June critique](./CODEBASE_DEEP_CRITIQUE.md) remains historical provenance; its counts and open-item descriptions were not imported as current findings.

### Evidence and priority conventions

- **Reproduced:** the failure was exercised against the actual application, built public API, or source function. Each finding identifies narrower harness limitations where relevant.
- **Observed:** directly inspected in the browser, DOM, accessibility snapshot, command output, or repository configuration.
- **Source-supported risk:** a specific code path supports the concern, but the complete failing user flow was not executed.
- **Opportunity:** a proposed improvement or capability, not a claim that the existing implementation is defective.

Priority is separate from confidence: **P0** is an immediate critical incident; **P1** is a serious state, reliability, access, or safety problem; **P2** is a material limitation or improvement; **P3** is lower-impact polish. No P0 incident was established. Estimates in the roadmap describe relative implementation size, not delivery commitments.

## 3. Correctness and reliability findings

| ID | Priority | Finding | Evidence |
| --- | --- | --- | --- |
| C01 | P1 | `onReady` can expose a bus before it receives commands | Reproduced application mount |
| C02 | P1 | StrictMode disconnects persistence and viewpoint subscriptions | Reproduced application mount/remount |
| C03 | P1 | Local undo can erase a later peer mutation | Reproduced store, collaboration, and outbound event |
| C04 | P1 | Default browser plane registries collide across applications | Reproduced registration; render path traced |
| C05 | P1 | Selection and some configuration changes leave culling stale | Reproduced application/store path |
| C06 | P1 | Route fragments are misparsed; malformed directives throw | Reproduced public parser/matcher |
| C07 | P1 | Loading exceptions are swallowed before SSR | Reproduced source helper |
| C08 | P2 | Ignored route prefixes match unrelated paths | Reproduced source helper |
| C09 | P1 | Rejected post-response hooks have no rejection handler | Source-supported process-reliability risk |
| C10 | P2 | Arrangement signatures omit parent/child topology | Reproduced signature collision |
| C11 | P1 | Noninteractive generator defaults fail before generation | Reproduced actual source with installed Commander and mocked system operations |
| C12 | P1 | Generator continues toward deletion after command failures | Reproduced control flow with mocked system operations |
| C13 | P2 | Kit runtime directories and CLI output paths disagree | Source-supported public configuration inconsistency |
| C14 | P2 | Shared event hooks have unsafe cleanup and stale targets | Reproduced helper cleanup; target dependency inspected |
| C15 | P2 | Portal cleanup retains an empty generated container | Reproduced helper lifecycle with controlled DOM |

### C01 — Readiness does not guarantee command delivery

**Trigger and result:** publish `SPACE_ROTATE_X_TO` with `{ value: 30 }` synchronously from `onReady`. In the React 19/JSDOM reproduction the bus had zero subscriptions at that point and rotation remained zero; the same command worked after effects had run.

**Cause:** [Application's mount callback][application-ready] exposes the API before [the View's passive subscription effect][pubsub-effect] installs the command bridge. This makes a natural restore/navigation integration depend on mount ordering.

**Improvement:** make the bridge explicitly establish readiness before invoking the host callback. Define initial-command behavior and keep it consistent across the handle, pubsub, and hooks. A documented buffer is another possible implementation, but a host should not need a one-tick timeout to use an API named `onReady`.

**Acceptance:** a synchronous command in `onReady` executes exactly once in ordinary and StrictMode mounts; unmount/remount and a supplied external bus do not duplicate handlers.

### C02 — StrictMode silently disconnects persistence and viewpoint callbacks

**Trigger and result:** mount the application, then rotate the camera with a recording storage adapter and `onViewpointChange`. Ordinary mounting produced one storage write and one callback; StrictMode produced neither, although the camera changed.

**Cause:** [subscriptions are installed in the constructor][application-subscriptions], [removed on unmount][application-unmount], and not reinstalled on mount. Constructor-side listeners also merit a leak check for discarded instances. React explicitly exercises mount/unmount/mount in development and requires symmetrical setup and cleanup. [React lifecycle reference](https://react.dev/reference/react/Component#componentdidmount).

**Improvement:** give mounted application lifecycle code ownership of subscriptions, browser listeners, debounce timers, and final persistence flushing. Reconfigure resources when their owning props change. Converting the class to hooks is optional; fixing ownership is the substantive work.

**Acceptance:** persistence and callbacks survive StrictMode replay, no discarded instance retains listeners, and a pending persistence update flushes once on real unmount.

### C03 — Local undo restores a snapshot that predates peer work

**Trigger and result:** locally hide A, apply a remote snapshot hiding B, then undo. Both A and B become visible. The application reproduction also observed the undo result broadcast as an outbound collaboration mutation.

**Cause:** [history stores and restores complete arrangement snapshots][history]. Skipping `meta.remote` when recording history does not rebase an older local snapshot. [Collaboration applies remote changes atomically][collaboration], but the next local undo can still replace those changes.

**Improvement:** specify peer-preserving local undo semantics and use inverse operations or rebased history. As a conservative interim behavior, invalidate incompatible local history on remote apply and explain that behavior to hosts; do not advertise remote-skipping alone as safe collaborative undo.

**Acceptance:** local undo/redo preserves later unrelated peer edits, including remote changes received during a drag transaction. Restores must not broadcast an accidental rollback of peer state.

### C04 — Default browser registrations are shared across application instances

**Trigger and result:** register `/same` with component A, then register `/same` with component B using the default browser registrar. Reading `/same` returns B. [Application registration][application-registrar] falls back to [browser-global storage][registrar], which [Root subsequently reads][root-registrar].

**Impact and limit:** one default application can replace the registration another resolves. Registration collision was executed; two complete applications were not rendered side by side in the browser, so the exact visible replacement timing remains unverified.

**Improvement:** own the default registrar per application, consistently in client and server rendering. Preserve intentional shared registrars as an explicit injected capability.

**Acceptance:** two applications can use identical routes with different components and independent add/remove lifecycles without influencing each other.

### C05 — Culling exceptions do not reliably invalidate the culling pass

**Trigger and result:** cull an offscreen plane, select it without moving the camera, and wait beyond the culling interval. It remains hidden despite selection being an exception. Disabling culling through the exported direct configuration action also left hidden state stale when the camera/tree references were retained.

**Cause:** [the hook reads configuration, selection, active/isolate state, and focused DOM content][culling], but its effect depends only on `transform` and `tree`. Other paths can accidentally hide the defect: the pubsub configuration path cleared the state in the tested fixture by triggering additional work. The finding is not that every configuration entry point fails.

**Improvement:** schedule recomputation for every state transition that changes culling eligibility, including focus and relevant configuration changes. Clear hidden/frozen state immediately when disabling the feature, rather than relying on a later camera movement.

**Acceptance:** stationary-camera tests cover selected, active, isolated, focused, and resized planes; direct and pubsub configuration entry points agree.

### C06 — Fragment handling breaks ordinary routing and can throw

**Public API observations:** a matcher with `/a` registered returned no match for `/a#details`; `/a?x=1#details` included the fragment inside `query.x`; `/a#:~:text` threw a `TypeError` involving `split`. See [fragment parsing][parser] and [matcher usage][matcher].

**Improvement:** normalize pathname, query, and ordinary hash before interpreting Plurid-specific or text-fragment syntax. Reject malformed directives predictably instead of throwing from unchecked string operations. Keep client and server route interpretation consistent.

**Acceptance:** test ordinary anchors, empty/malformed directives, encoded delimiters, query-plus-hash combinations, and nested route navigation through public entry points.

### C07 — Loading failures can fall through to normal rendering

**Trigger and result:** a preserve's `onServe` throws with no `onError` handler. Calling the actual [preserve-resolution helper][preserves] resolves normally with `preserveResponded: false` and no result, instead of rejecting. The [request pipeline][server-pipeline] can continue rendering.

**Impact:** operational failures can produce a normal-looking response with missing request data. If a host relies on a thrown loading/authorization error to stop rendering, the behavior also undermines that host assumption; an actual authorization bypass was not tested.

**Improvement:** propagate unhandled loading failures to the server error path. Define what `onError` must return to recover, respond, or deliberately continue without preservation. Make recovery explicit and observable.

**Acceptance:** throwing and rejected `onServe` handlers yield the configured failure response unless a tested recovery branch is deliberately selected; successful data loading remains unchanged.

### C08 — Wildcard exclusions overmatch path segments

**Trigger and result:** `ignoreGetRequest({ ignore: ['/api/*'] }, '/apiculture')` returns `true`. The helper removes `/*` and uses `startsWith('/api')`, without preserving a path-segment boundary. See [ignore matching][ignore-routes].

**Improvement:** match the intended directory prefix, with explicit behavior for the exact `/api` path, trailing slashes, and query normalization.

**Acceptance:** `/api/x` is excluded, `/apiculture` is not, and the exact-prefix rule is documented and tested.

### C09 — Post-response hook rejections are detached

**Evidence:** [the async `resolvePreserveAfterServe` helper][after-serve] awaits host code, while [request branches call it without awaiting or catching its promise][after-serve-call]. A rejected callback can escape the request's `try/catch`. No deliberate process crash was triggered during this review.

**Improvement:** explicitly catch and report post-response failures with request context. Once a response has been sent, failure handling must not attempt a second HTML response. Define whether completion of these hooks is part of request lifecycle or managed background work.

**Acceptance:** a rejected `afterServe` is observable, leaves the sent response intact, and does not become an unhandled rejection. Node's default unhandled-rejection behavior can terminate a process; deployed runtime flags and handlers affect the outcome. [Node process reference](https://nodejs.org/api/process.html#event-unhandledrejection).

### C10 — Arrangement equality loses topology

**Trigger and result:** the [shared arrangement signature][signature] is identical for two roots `[A, B]` and a tree `[A(children: [B])]` when the IDs and other encoded fields match. It sorts a flattened list without parent identity or structural ordering.

**Impact and limit:** history and outbound collaboration both use this signature to detect authored change. A topology-only change can be invisible to both. The signature collision was reproduced; a public UI reparenting workflow was not demonstrated. Other omitted fields should be evaluated against the authored-arrangement contract rather than automatically treated as bugs.

**Improvement:** define the authored state that undo and synchronization must preserve, then encode parentage and semantically relevant ordering alongside manual geometry and link metadata.

**Acceptance:** reparenting changes the signature while pure auto-layout reflow does not. History and collaboration agree on these distinctions.

### C11 — Default CLI service options never become the expected array

**Trigger and result:** the generator's actual source, transpiled in memory with installed Commander, reaches its generic failure message when given `--directory` and otherwise default options. A controlled harness supplied a pre-existing directory and mocked filesystem/process operations; no filesystem mutation or dependency installation was attempted.

**Cause:** [Commander supplies the default `graphql,redux,stripe` as a string][generator-options], but the [processing code calls `services.reduce`][generator-process] as though it were the `string[]` declared by `Answers`. CLI spellings also need normalization to the internal service vocabulary. The catch suppresses the cause, and the action does not establish a reliable failure exit status.

**Improvement:** parse and validate all CLI options into a typed application model before creating a directory. Use one normalization path for interactive and noninteractive input, reject unsupported choices, and return actionable errors with a nonzero exit code.

**Acceptance:** default, empty, explicit, invalid, and mixed-case service lists behave predictably; `--help` works without side effects; noninteractive failure is visible to automation.

### C12 — Generator failure handling and filesystem work need a safe execution model

**Evidence:** [client generation interpolates the application directory into shell commands and ignores callback errors][generator-client]. In a controlled source execution, failures were supplied for both creation and installation commands; the client-generation function still requested recursive removal of `public`, `src`, and `.git` under an existing destination. These operations were mocked: no actual deletion occurred. [Server generation constructs unquoted removal commands][generator-server]. [The command wrapper resolves even on failure, and file copies use streams without awaiting completion][generator-utilities]. The copy race is source-supported; no real filesystem race was measured.

**Impact:** valid paths containing spaces can be misinterpreted; shell metacharacters can change command meaning; failed install steps can be reported as successful; a copy may still be in progress when subsequent setup reads the file. The client path also removes the generated application's Git directory, making explicit destination ownership important.

**Improvement:** use argument-array process APIs, awaited filesystem copy operations, and filesystem APIs for removal. Validate destination ownership/non-emptiness, stop on the first failed prerequisite, and report the failed step. Stage generation so an incomplete attempt is identifiable and recoverable.

**Acceptance:** exercise paths with spaces, existing nonempty directories, package-manager failure, interrupted copy, and cleanup in disposable directories with fake package-manager executables. No test should need to run dangerous shell payloads on the host.

### C13 — Kit directory configuration does not govern the full toolchain

**Evidence:** the public config exposes `buildDir`/`publicDir`, and [server construction uses them][kit-server]. [Build][kit-build], [esbuild options][kit-esbuild], and [start][kit-start] retain fixed `build/...` and `source/public` paths; the production asset manifest is also read from a fixed location.

**Impact and limit:** an application can configure the runtime to serve a different directory from the one the CLI builds. This mismatch is source-verified; a custom-directory application was not built end to end during the review.

**Improvement:** resolve one application-path configuration used by dev, build, start, asset copying, manifest reading, and server defaults. Alternatively, narrow the exposed contract until directory customization is supported consistently.

**Acceptance:** a fixture with non-default output/public directories passes dev, production build/start, script loading, and static-asset checks from the documented working directory.

### C14 — Event helper cleanup can dereference a missing element

**Evidence:** the exported [React utility event hook][utility-events] guards `addEventListener` with `if (element)` but unconditionally calls `element.removeEventListener` during cleanup. Running the actual helper with a captured effect and no element produced a `TypeError` on cleanup. The element is absent from effect dependencies. `useGlobalKeyDown` and `useGlobalWheel` accept an optional element while their window fallback is commented out. The engine contains [a duplicate implementation][internal-events]. No claim is made that every current engine caller exercises this optional-target path.

**Improvement:** define and document whether an omitted target means `window` or a disabled subscription. Resolve and capture the target for both setup and teardown, and resubscribe when the element changes. Consolidate the duplicate only after specifying compatible behavior for its callers.

**Acceptance:** omitted/null targets, target replacement, unmount, and StrictMode cleanup do not throw or leave listeners on an old element. These helpers need behavioral tests rather than only a package sanity assertion.

### C15 — Portal teardown cannot remove an empty generated container

**Evidence:** [portal cleanup][portal] tests `childNodes.length === -1`, an impossible length. A controlled DOM/effect reproduction removed the inner portal node and retained the empty generated container. This was helper-level lifecycle verification, not a real React mounting test.

**Improvement:** track ownership and remove an empty container only if this hook created it. Replacing `-1` with `0` alone can delete an empty host-provided container. Specify behavior when `id` or `parentID` changes; the effect currently has an empty dependency list.

**Acceptance:** repeated create/destroy cycles leave no owned empty containers, shared/host containers survive, and changed targets are handled deliberately.

## 4. UI, UX, and accessibility

### What works

The page presentation provides a useful gradual entry into a spatial interface. Docked content reads as a page; reveal exposes the surrounding geometry, and the parent relationship remains understandable. In the observed desktop flows, Enter followed a page link, Escape returned to the parent, and the rail provided an independently understandable return control.

The [chrome vocabulary](./DESIGN.md) is also effective: pills, panels, lines, centralized tokens, scoped styling, look presets, and replacement slots give hosts a consistent system to customize. Native buttons and labels on the rail, focus treatment, remappable shortcuts, content-input guards, and live announcements provide a real accessibility foundation. Dark and paper/light combinations were visually inspected; that is not a claim that every preset was visually audited.

### Interaction findings

| ID | Priority | Finding | Evidence and improvement |
| --- | --- | --- | --- |
| U01 | P1 | Settings headings are unreachable by keyboard | Both reviewers opened More and observed Tab skip all eight drawers to the viewcube. [Drawer headings are click-only divs][drawer]. Use native disclosure buttons, expanded state, controlled regions, and focus-aware dismissal. |
| U02 | P1 | Mobile More obscures Fit | At 390×844 after page Reveal, More occupied x300–340/y784–820 and Fit x302–334/y791–823; the center of Fit hit More. Coordinate [toolbar placement][toolbar-style] with [rail placement][rail-style], including safe areas and open states. |
| U03 | P1 | Offscreen ancestors remain keyboard destinations while docked | After About docked, reverse tabbing reached an unnamed focus anchor and the parent page's Contact link while only About was visible. [Plane inertness][plane-focus] excludes aside planes, while [lineage selection][lineage] retains ancestors. Separate retained geometry from the active reading/focus scope. |
| U04 | P2 | Spatial links lack native link semantics | About/Contact are focusable anchors without `href` or role; the accessibility snapshot calls them generic. Enter works through a custom handler. [Link rendering and click handling][link] should preserve a real destination and modifier-click behavior when host routing can resolve one. |
| U05 | P2 | Transform controls have inadequate accessible names | Mouse-opening Transform exposed six unnamed checkboxes and ten glyph-named action buttons. Associate [Transform labels/actions][transform-controls] with their controls and give [the shared Switch][switch] an accessible-name contract. |
| U06 | P2 | Help is a reference inventory before it is an introduction | The observed [dialog][shortcuts] shows seven command groups with tightly wrapped descriptions; More exposes eight headings. Offer optional task-oriented help: read, reveal, navigate, return. Keep the full reference available and avoid mandatory onboarding. This is a usability hypothesis, not a measured first-use failure rate. |
| U07 | P2 | Recovery states give little guidance | When `planeRenderError` enables the per-plane error boundary, its [default fallback][error-boundary] is a generic heading. [The empty branch][empty-branch] replaces the normal View container and also provides little recovery guidance. Provide host-owned retry/return actions and preserve essential help when useful. Failure rendering was inspected in source, not exercised manually. |
| U08 | P3 | Touch help dismissal and small targets are weak affordances | The mobile [dialog][shortcuts] fits and scrolls, but has no Close button and tells users to use `?` or Escape; backdrop dismissal must be discovered. Add a visible close control. Rail/help targets measured 32×32; minimap targets were 26×26 and children 20×20. Increase hit areas where practical. |

For U04, adding `role="link"` alone would improve semantics but would not supply native destination behavior. Prefer a real `href` where possible and document the limitation for purely internal engine actions. [WAI link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/).

For U03, the [View applies `role="application"`][view-role] even in page presentation. Reassess whether the page's reading area should retain document/region semantics, and validate the exact structure with assistive technology. DOM inspection alone does not establish how VoiceOver or NVDA will speak the interface.

For U08, 32px is not automatically a WCAG failure: the minimum target-size criterion uses 24 CSS pixels with spacing and other exceptions. The measured 20px children warrant a spacing assessment, and larger targets remain a usability opportunity. The proven mobile blocker is occlusion, not a blanket 44px compliance rule. [WCAG 2.5.8 explanation](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

### Provisional design-health score

The independent design reviewer used a 0–4 rubric: 0 = absent/broken, 1 = major weakness, 2 = mixed, 3 = good, 4 = excellent. This is a bounded heuristic assessment, not a certification or a numerical measure of the whole engine.

| Heuristic | Score / 4 | Basis |
| --- | ---: | --- |
| Visibility of system status | 2 | Announcements exist; some control state remains visual only. |
| Match with the real world | 2 | Page metaphor works; link/browser behavior diverges from that expectation. |
| User control and freedom | 3 | Fit, back, dock, Escape, and history provide recovery foundations. |
| Consistency and standards | 2 | Native controls coexist with click-only divs and non-native links. |
| Error prevention | 2 | Input guards exist; action prerequisites are not consistently exposed. |
| Recognition rather than recall | 2 | Visible controls and reference help exist, but specialist terms and hidden settings add learning cost. |
| Flexibility and efficiency | 3 | Extensive remappable shortcuts and several navigation methods. |
| Aesthetic minimalism | 3 | Restrained chrome; settings/help become dense. |
| Error recovery | 1 | Generic source-level fallback assessment; failure flow not manually tested. |
| Help and documentation | 2 | Substantial generated reference; limited task-oriented introduction. |
| **Total** | **22 / 40** | **Provisional desktop/source assessment; significant usability work remains.** |

The first-time reader's strongest moment is revealing the space and understanding the parent relationship. The difficult moment is learning the newly exposed controls. Keyboard users encounter reproduced access problems; DOM semantics indicate additional screen-reader risks. Experienced users benefit from accelerators, but their settings path should be equally efficient. Harness tutorial copy is demo content and cannot be counted as onboarding supplied to every host.

### Automated detector interpretation

The focused detector examined **143 files**: one harness App, 26 container files, and 116 component files. It returned one `layout-transition` warning at [Minimap's animated dot][minimap-transition]: opacity, width, and height transition over 120ms. This is a true pattern match but a low-priority concern in a small positioned area; no jank attributable to it was measured. The detector did not identify the major keyboard or occlusion defects, which required manual inspection.

The documented browser API allowed read-only DOM evaluation but not the mutable injection needed for detector overlays. No overlay, detector live server, or human-visible overlay tab was created. Native screenshots, DOM snapshots, hit testing, and existing browser tests supplied the evidence. Review tabs were finalized and the viewport restored.

## 5. Architecture and developer experience

### Deepen the contracts that own related behavior

The data → engine → React → server/kit layering is useful. The highest-value architectural changes concentrate related state and lifecycle responsibilities behind interfaces that callers can test directly.

| Module opportunity | Existing friction | Concrete direction and benefit |
| --- | --- | --- |
| Application lifecycle and readiness | Construction, mount effects, pubsub registration, persistence, and host callbacks have implicit ordering. | One owner for resource setup/teardown and ready-command delivery. This improves locality for C01/C02 and makes lifecycle tests exercise the host interface. |
| Authored arrangement | Tree snapshots, equality/signatures, undo, and collaboration encode overlapping assumptions. | Define one authored-arrangement contract, including identity/topology and peer-preserving history semantics. Keep automatic layout outputs distinguishable from authored changes. |
| Plane registration | Browser globals undermine otherwise per-instance stores and buses. | Per-instance default registrar with an explicit shared adapter. Test two real consumers across the same interface. |
| Visibility and focus eligibility | Culling, selection, focus, docking lineage, and DOM inertness make separate visibility decisions. | A shared eligibility model with distinct paint, interaction, measurement, and retention decisions. Resolve C05/U03 without forcing them to mean the same thing. |
| Request lifecycle | Loading recovery, rendering, post-response work, and error reporting do not share a precise outcome contract. | Explicit request outcomes and post-response failure ownership; test load/render/hooks as one request flow. |
| Framework application paths | CLI and runtime repeat conventions independently. | Resolve paths once and pass them through the kit build/runtime interface. |

These are bounded refactors justified by observed failures. A broad rewrite, replacing Redux, or turning every class into a hook would not by itself solve them. Existing seams for a storage adapter, explicit registrar, custom chrome, and host collaboration transport are useful; preserve their small interfaces while making their guarantees dependable.

### DX findings and improvements

- **Generator modernization is an adoption prerequisite.** Repair C11/C12 immediately; then complete the existing kit-shaped generator direction. Generate a small working application without the current webpack/rollup/CRA-era template tree, and test the result as a consumer. Avoid offering HTML/Vue/Angular choices when the processing switch only implements React. See [generator dispatch][generator-process] and [the framework plan](./FRAMEWORK_PLAN.md).
- **Configuration failures should identify what stopped applying.** [Kit config loading][kit-config] catches bundle/load failures and continues with conventions. This can be useful during development, but production builds should make a malformed requested configuration an explicit failure or require an explicit fallback choice. Test an invalid configuration and its diagnostics.
- **CI enforces only a subset of the repository's own release gate.** [The workflow][ci] runs build, tests, and lint. Type checking, module imports, generated-table checks, browser tests, strict visuals, and packed installation are currently local checks. Add the inexpensive deterministic gates to every change and establish an appropriate browser/visual/release matrix. Do not assume `tsup` transpilation covers every TypeScript check.
- **Public hook and scaffolder test depth is weak.** The React-functions, icons, and generator packages each ran one test; the engine and adapter ran 187 and 199 passing tests respectively. Test counts alone do not prove quality, but the gap is material where C11/C14 sit behind public interfaces. [Root lint configuration][lint-config] also lacks React hook dependency/accessibility rules and disables several general checks. Introduce targeted rules with a ratcheted baseline rather than one noisy repository-wide rewrite.
- **The render harness is built but lacks a `check` script.** Root recursive checking covers the public packages, while Vite builds the fixture without a dedicated TypeScript gate. Add check-only coverage for the harness, examples, and browser-test code where it is absent.
- **Examples should be executable integration references.** Their current presentation requires copying a component into a host. Add a documented way to select/run each example and type-check it against the package's public entries. Verify controls in README snippets against the generated shortcut catalog; the minimal example still describes holding G to grab-pan while the current root guide describes Space as the grab key.
- **Package smoke tests should also model minimal consumers.** The current smoke test successfully installs all public tarballs together. That is valuable, but can mask a missing dependency that another explicitly installed sibling supplies. Add one minimal React consumer, one kit/SSR consumer, and the generated app; verify runtime import and TypeScript consumption of each.

### Documentation conflicts that should be reconciled

| Current claim | Source/evidence at this revision | Correction |
| --- | --- | --- |
| Package map says React has only a sanity test | 33 React suites, 199 passing tests, plus browser/visual coverage | Replace stale counts/status and automate the factual inventory. |
| Package map says 37 engine tests are skipped | 187 engine tests pass, one is skipped | Remove the obsolete debt count and identify the actual remaining skip. |
| Architecture persistence descriptions disagree | One section describes v3; another still describes v2 and excludes `viewSize`; [source writes v3 and upgrades v2][persistence] | Maintain one persistence schema description and link to it. |
| Roadmap/index language treats culling as unwired | [The culling hook][culling] is wired and exercised | Describe current invalidation defects, retained DOM, and missing measurement budgets accurately. |
| Kit is described as unpublished/build-out in some docs and published in others | Current manifest is `0.0.0-5`, with implemented CLI and exported bootstraps | State implementation and publication status separately; verify registry status before claiming publication. |
| Kit README tells users to restart dev after server edits | [The current dev process][kit-dev] requests restart after successful server rebuild | Align watch instructions with the implemented behavior. |
| Root guide suggests broad opt-in behavior | [History defaults on unless disabled][development-store] | Generate or verify defaults from the configuration tables instead of generalizing. |

The document index provides a useful authority order, but an authority label is not a substitute for keeping the content synchronized. Treat contradictory descriptions inside one reference as bugs in the developer interface. This report leaves historical documents intact so the critique remains a reviewable, documentation-only addition.

## 6. Performance

### Measurements from the existing browser benchmark

The full browser suite ran the existing 40/100/500-plane orbit/pan/zoom benchmark once on this macOS machine, with headless Chromium and one worker. These are fixture measurements, not a universal capacity claim. See [the benchmark and its assertions][benchmark].

| Planes | Boot | First frame | Frame p50 | Frame p95 | Maximum frame | Dispatches / measured frames |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 40 | 207ms | 8ms | 8.2ms | 9.2ms | 11.6ms | 240 / 239 |
| 100 | 168ms | 8ms | 8.2ms | 9.5ms | 10.9ms | 241 / 239 |
| 500 | 307ms | 91ms | 16.5ms | 32.8ms | 125.3ms | 241 / 239 |

The dispatch allowance, no-frame-above-500ms check, and scaling bounds passed. `BENCH_STRICT=1` was not enabled. Camera-path median cost grows much more slowly than plane count in this fixture, which supports the current centralized transform approach. The 500-plane first frame and maximum frame still warrant investigation for perceptible pauses; the benchmark does not identify their cause.

### Rendering and memory priorities

1. **Measure retained content separately from painting.** Current culling hides/freezes eligible planes while preserving mounted content. It does not provide general plane-subtree virtualization. The separate exported [PluridVirtualList][virtual-list] does implement row windowing. The existing [usePluridPlane hook][plane-visibility] exposes live `shown`, `culled`, and `frozen` state so content can pause media, polling, or animation. Culling suspends the engine's plane measurement observer, but host-owned effects do not stop automatically. Extend this existing interface with explicit retention/unmount semantics after measuring representative content.
2. **Profile the complete navigation loop.** Measure spawn → content measurement → layout → docking → culling, not only steady camera movement. Include nested links, asynchronously resizing media, large selections, and history/collaboration changes.
3. **Set reproducible budgets.** Record machine/browser/viewport, cold versus warm state, content complexity, DOM/node count, memory after repeated open/close, p95 input-to-paint latency, and frame time. Test culling both on and off with the same content.
4. **Keep geometry reads and writes scheduled.** Review culling and depth-fade DOM traversals, plane measurement, and link/bridge reflow together. A throttled pass is useful, but broad traversal and hidden-content work still need measurement.

### Bundle size and consumption

The production render harness emitted a main chunk of **829.71kB minified / 247.35kB gzip**, and Vite warned about a chunk above 500kB. This includes the harness and its dependency graph; it is not the size of the engine alone and does not prove every consumer ships the same payload.

Use an esbuild/Vite metafile to attribute bytes before changing exports. Then test a minimal page-mode application and a spatial application. Prioritize unused aggregate imports, optional capabilities, and content loading that demonstrably enter those bundles. Preserve the successful native ESM/CommonJS interoperability work and verify every new subpath in both runtime and declaration consumption.

## 7. Security and operational boundaries

This section reviews concrete trust and failure paths found in source. No current dependency-advisory scan, penetration test, or external service assessment was performed, so it makes no claim that the dependency graph is vulnerability-free.

| Area | Current evidence | Recommended treatment |
| --- | --- | --- |
| SSR state/document serialization | [State injection escapes `<`][server-serialization]; [document serialization escapes text/attributes and JSON script data][document-serialization]. Existing server tests pass. | Keep adversarial serialization regressions. Preserve the distinction between escaped data and intentionally executable raw script/template fields. |
| Trusted raw customization | Document scripts, template fragments, and [global injection][globals-injection] accept intentionally executable/raw content. | Document these as trusted host inputs. Do not pass untrusted content through them without an explicit sanitization/data-serialization path. Their existence alone is not an XSS finding. |
| Loading and post-response failures | C07/C09 expose failure-ownership gaps. | Fail predictably, retain request context, and observe post-response work without attempting duplicate responses. |
| Generator paths and commands | C12 interpolates local paths into shell operations and continues after command failures. | Replace shell construction and validate destination ownership before any write/removal. This is a local-tool risk, not a demonstrated remote exploit. |
| Remote collaboration input | [The inbound hook][collaboration] checks that tree/links exist before applying the snapshot; transport and peer trust belong to the host. | Specify shape/version/size limits and validate at the adapter seam. Host authentication, authorization, and convergence remain explicit responsibilities. Avoid accepting arbitrarily deep or cyclic in-process trees. |
| Embedded external content | [Iframe planes][iframe] supply a route and title without a configurable sandbox/permission policy. [External PTTP loading][external-plane] constructs an `http` URL and swallows fetch/load failures. | Expose host-controlled embed policy and visible loading/failure behavior; define supported protocols, origins, and credentials. Live remote embedding was not exercised. |
| Server/stills operation | Still-generation code reuses a browser, closes pages/browser in cleanup, and reports a missing optional dependency. | Retain these improvements; add cancellation/timeouts where host work can hang, and test multi-instance shutdown and production process behavior. |

Operational observability should make a failed load, rejected post-response hook, dropped startup command, rejected persistence snapshot, or remote-apply failure diagnosable through a supported host interface. Logging should expose the relevant stage and identifier without dumping user content or serialized state by default.

## 8. Implemented capabilities and remaining gaps

Feature evaluation must distinguish having an implementation from having a robust, fully validated contract. The following inventory is source-based; product adoption outside this repository was not verified.

| Capability | Current state | What would make it better |
| --- | --- | --- |
| DOM planes, spatial camera, layouts, linked spawning | Implemented and exercised | Harden route edge cases and feature-composition sequences. |
| Page presentation, docking/reveal, lineage, scroll preservation | Implemented with substantial browser coverage | Correct accessible focus scope and responsive controls; validate reading with assistive technology. |
| Pointer/touch input, remappable shortcuts, gamepad | Implemented | Expand device/browser coverage and make secondary controls equally operable. |
| Camera home/bookmarks, viewpoint encoding/URL binding | Implemented | Clarify camera-sharing state versus navigation history and docked page URLs. |
| Docked route in address bar and browser Back/Forward | Partial/integration work remains | Define the contract with host routing and viewpoint binding; exercise reload, deep links, and native link actions. [Current control-surface note](./CONTROL_SURFACE.md). |
| Selection, movement, alignment, distribution, duplication, resizing, snapping | Implemented | Verify accessible controls, prerequisites, and interaction with undo/collaboration. |
| Undo/redo and grouped transactions | Implemented, with C03/C10 limitations | Preserve later peer work and all relevant authored topology. |
| Persistence and host content callbacks | v3 snapshot with v2 upgrade; implemented | Repair StrictMode lifecycle; test failure, reload, migration, and host content boundaries together. |
| Collaboration | Whole-arrangement publish/apply seam with echo suppression | Clarify local undo, validation, ordering, conflict behavior, and resynchronization. Transport, identity, and presence are host concerns unless an optional adapter is deliberately added. |
| Culling, freezing, depth cues, content visibility flags | Implemented; `usePluridPlane()` exposes live shown/culled/frozen state | Fix invalidation, use the existing hook to pause host work, and measure actual content/CPU savings. |
| General plane-content virtualization | Not established by current culling; a separate `PluridVirtualList` provides row windowing | Define mount/retain/freeze semantics for stateful planes; measure memory before adding a renderer rewrite. |
| Themes/looks, tokens, custom chrome slots/primitives | Implemented | Responsive composition, accessible names, larger hit areas, and broader visual/contrast validation. |
| SSR and document head model | Implemented, tested; buffered Suspense path exists | Strengthen loading/error contracts and cancellation. Treat streaming SSR as a deliberate tradeoff, not an assumed requirement. |
| Kit configuration/CLI | Implemented with remaining consistency/adoption work | Resolve directory options consistently and make invalid production configuration explicit. |
| Modern generated starter | Not delivered by the current generator path | Produce a minimal kit application and validate its install/type-check/build/browser flow. |
| Browser/visual/performance tests | Implemented and passing locally | CI enforcement, small mobile layouts, multiple browser engines, composition regressions, and content-memory budgets. |
| Task-oriented first-use help and recovery | Partial | Optional guidance and host-owned recovery actions without mandatory tutorials. |
| Alternative renderer/WebXR/native experience | Experimental, archived, or future work | First establish a renderer contract and measured DOM limits; keep routes, state, persistence, and accessibility decisions shared. |

Good feature additions would reduce host work at proven seams: dependable initialization, stronger portability guarantees for saved spaces, accessible navigation controls, clearer retention and lifecycle semantics around the existing plane visibility hook, and minimal working starters. Domain-specific editors, account systems, media management, chat/model APIs, billing, and collaboration transport should not become mandatory engine dependencies merely because a consuming application needs them.

## 9. Prioritized improvement roadmap

Sizes are relative: **S** = bounded behavior plus regression test; **M** = coordinated changes across a few modules; **L** = contract design, compatibility work, and several integration scenarios. Ordering considers impact and prerequisites, not only code size.

| Order | Work | Size | Dependencies and completion evidence |
| ---: | --- | --- | --- |
| 1 | Repair readiness and mount/unmount ownership (C01/C02) | M | Public synchronous startup commands work; StrictMode persistence/callbacks and listener cleanup pass. |
| 2 | Preserve peer changes through local undo (C03), define authored topology (C10) | L | Agree on collaborative undo semantics; interleaved peer/local edits and outbound events are regression-tested. If necessary, ship documented history invalidation as an interim safeguard. |
| 3 | Restore access to current UI (U01–U05) | M | Keyboard-only settings/navigation, docked focus scope, native link semantics, and non-overlapping controls at 390px pass. Include actual screen-reader validation. |
| 4 | Fix route parsing and server failure propagation (C06–C09) | M | Malformed URLs fail predictably; loader and post-response exceptions have explicit tested outcomes. |
| 5 | Isolate registrars and invalidate visibility correctly (C04/C05) | M | Two applications with colliding routes remain independent; stationary-camera eligibility changes are reflected immediately. |
| 6 | Fix generator input/execution safety and utility lifecycle defects (C11/C12/C14/C15) | M | Disposable generation cases, nonzero failures, safe path handling, and event/portal ownership tests pass. |
| 7 | Enforce existing quality gates in CI and reconcile docs | M | Type/module/table gates plus browser/release coverage are automated; generated factual inventories replace stale counts. |
| 8 | Complete kit directories and a minimal generated starter (C13) | M–L | Custom-directory and minimal-consumer applications install, type-check, build, serve, and render. |
| 9 | Define content lifecycle/virtualization and performance budgets | L | Representative editor/media workloads show bounded memory and input latency across 40/100/500-plane cases. |
| 10 | Improve optional onboarding, help, and recovery | M | New users discover reveal/return without demo prose; touch help closes visibly; empty/error actions are appropriate to host capabilities. |
| 11 | Prototype alternate rendering only against measured requirements | L | A prototype shares plane identity, navigation, persistence, and host contracts; accessibility/content limitations are explicit. |

A useful integration regression is: mount → issue initial command → open a linked child → select/move/resize → receive peer change → undo locally → persist → reload → dock → traverse by keyboard. This crosses the interfaces where the strongest current findings occur.

## 10. Verification record and regression scenarios

### Environment and executed gates

Local environment: **macOS, Node 26.3.0, pnpm 11.3.0, installed React 19.2.7**. The root requires Node ≥22 and CI uses Node 24; those additional Node versions were not tested. No tracked runtime files, lockfiles, dependency declarations, or visual snapshots were changed for this audit.

| Check | Result | Qualification |
| --- | --- | --- |
| `pnpm build` | Pass | Production harness main chunk warning recorded in section 6; mixed named/default export warnings do not invalidate the separately passing import checks. |
| `pnpm check` | Pass | All 13 public package check scripts; harness has no dedicated check script. |
| `pnpm test` | Initial socket-dependent failures | Sandbox denied local sockets used by server tests; unaffected packages passed. |
| `pnpm --filter @plurid/plurid-react-server --filter @plurid/plurid-kit test` with local socket access | Pass | 30 server tests and 18 kit tests; combined package result is 494 passed, one skipped. No aggregate pass is claimed for the initial restricted invocation. |
| `pnpm lint` | Pass | Uses the existing rule set and exclusions. |
| `pnpm check.modules` | Pass | Every entry of 13 packages loads under native ESM and CommonJS. |
| `pnpm docs.tables.check` | Pass | SHORTCUTS, HARNESS, and LOOKS agree with their source tables. |
| Full existing Playwright suite, strict visuals, one worker, no retries | Pass | 107 Chromium scenarios + 38 visual comparisons = 145 passed in 1.9 minutes. |
| Benchmark within that suite | Pass | One measured run; absolute `BENCH_STRICT` gate was not enabled. |
| `node scripts/smoke-pack.mjs`, with registry access | Pass | 13 packed packages installed and all entries loaded in both module modes. Initial restricted attempt had registry `ENOTFOUND`, surfaced by npm as `ERESOLVE`; it was environmental, not a confirmed peer conflict. |
| Independent native-browser and detector review | Completed | Manual defects in section 4; one low-priority detector warning. |

The complete root `pnpm verify` chain was not invoked as a single command; its relevant component gates were run individually with environmental restrictions handled explicitly.

Package test results: functions-react 1; functions 18; generator 1; themes 14; UI-state 5; data 5; icons 1; pubsub 3; UI-components 12; engine 187 plus one skipped; React 199; server 30; kit 18. Counts include sanity tests and do not represent feature coverage percentages.

### Browser command and limits

From `fixtures/render-test`, after starting the installed Vite runner on port 5273:

```sh
VISUAL_STRICT=1 node_modules/.bin/playwright test \
  --config e2e/playwright.config.ts \
  --workers=1 \
  --retries=0 \
  --update-snapshots=none \
  --output=/tmp/plurid-critique-e2e/artifacts \
  --reporter=list
```

Visual comparisons used the committed macOS baselines at **1280×800, DPR 1, dark mode, reduced motion**, with the existing tolerance of 120 differing pixels and threshold 0.2. The touch subset uses 1000×700, not a narrow phone viewport. Passing these tests does not contradict the manually observed 390×844 collision.

Manual review covered default spatial view, Fit, docked/spawned/revealed pages, settings, help, light/paper presentation, and mobile docked/revealed/help states. It confirmed no horizontal overflow on the tested docked mobile page. Help took focus, retained it during sampled tabbing, closed with Escape, and restored focus. Actual screen-reader speech, 200% browser zoom, real mobile hardware, other browser engines, every look, and failure rendering remain unverified.

### Reproduction record and follow-up tests

Core probes used the built React application and its store/hooks in JSDOM, the built public engine API, and source functions transpiled in memory where no public entry exposed the relevant helper. Browser geometry was checked separately in real Chrome; JSDOM results must not be presented as visual verification.

The consolidated core probe was retained as a review-session artifact, runnable from the repository root with `node /tmp/plurid-core-audit-d2d510d6.cjs "$PWD"`. This temporary file is not a committed regression suite and may disappear when the system clears temporary storage.

The application harness used an empty rendered view with injected trees, an in-memory storage adapter, a `matchMedia(false)` substitute with no-op listeners, and no `ResizeObserver`. Its observed results include:

```text
onReady, ordinary and StrictMode: subscriptions=0; immediate rotation=0; later rotation=30
ordinary mount after rotateX(15): writes=1; viewpoint callbacks=1
StrictMode after rotateX(15): writes=0; viewpoint callbacks=0
local hide A → remote hide B → undo: A=true, B=true; the result was broadcast
culled far plane → select → direct disable: hidden persists; camera change clears it
flat and nested arrangement signatures: a:1|b:1# in both cases
```

These probes deliberately assert current broken behavior; their successful exit is evidence of reproduction, not evidence that the features are correct. Public route behavior can also be reproduced directly from the repository root after building:

```sh
node --input-type=module <<'JS'
import { IsoMatcher } from './packages/plurid-web/plurid-core/plurid-engine/distribution/index.mjs';
const matcher = new IsoMatcher({ planes: [{ route: '/a', component: 'fixture' }] });
console.log(matcher.match('/a#details'));
console.log(matcher.match('/a?x=1#details'));
try { matcher.match('/a#:~:text'); } catch (error) { console.log(error.message); }
JS
```

| Scenario | Current evidence | Regression test to add when fixing |
| --- | --- | --- |
| Immediate startup command | C01 command lost before subscriptions exist | Execute actual commands from `onReady` across ordinary/StrictMode/external-bus mounts. |
| Mount replay and persistence | C02 callback/write difference | Assert resource symmetry, callbacks, and final persistence flush. |
| Peer/local interleaving | C03 peer change erased and broadcast after local undo | Assert both state and outbound event sequence for undo/redo and transaction interleaving. |
| Same routes in two applications | C04 registration overwrite | Render two applications and mutate/unmount each independently. |
| Stationary-camera culling | C05 selection/direct-config invalidation | Test selected/active/focused/isolated exceptions and every supported configuration path. |
| URL robustness | C06 normal/malformed fragment results | Public matcher and client/server integration cases, including encoded boundaries. |
| Request failures | C07 helper swallows exception; C09 detached promise risk | HTTP-level loader/recovery/post-response failure tests with an unhandled-rejection assertion. |
| Route exclusions | C08 `/api/*` matches `/apiculture` | Segment boundaries and exact-prefix behavior. |
| Arrangement equality | C10 flattened topology collision | Reparenting/order/manual geometry changes versus automatic layout reflow. |
| Generator options and failures | C11 default service type mismatch; C12 cleanup requested after mocked process failures | Shared option normalization, fake package managers, awaited copying, existing destinations, and failure exit codes. |
| Utility lifecycle | C14 missing-target cleanup throws; C15 owned container remains | Actual React mount/unmount, target replacement, shared target ownership, and StrictMode. |
| UI accessibility and mobile | U01–U05 browser observations | Keyboard journeys, semantic names, actual assistive technology, and hit tests at 390px and neighboring widths. |
| Minimal consumers | Packed imports pass with all siblings installed | Independent minimal React, kit/SSR, and generated applications plus declaration consumption. |

Temporary logs and reproduction harnesses were kept outside the repository for review; all test-started servers were stopped, review tabs were finalized, and incidental workspace caches were removed. The report and documentation-index link are the intended repository changes.

### Remaining verification limits

External consuming applications such as Denote, Depict, and Dechat were not inspected or tested. Native/extension functionality, remote PTTP interoperability, publication status in the registry, dependency advisories, production authorization behavior, real multi-user network convergence, long-running memory retention, and cross-browser rendering remain open verification areas. Feature recommendations in those areas are opportunities or source-supported risks, not claims of observed production failure.

<!-- Source references are relative to this document. Line anchors refer to the audited revision. -->

[application-ready]: ../packages/plurid-web/plurid-works/plurid-react/source/containers/Application/index.tsx#L199
[application-subscriptions]: ../packages/plurid-web/plurid-works/plurid-react/source/containers/Application/index.tsx#L183
[application-unmount]: ../packages/plurid-web/plurid-works/plurid-react/source/containers/Application/index.tsx#L264
[application-registrar]: ../packages/plurid-web/plurid-works/plurid-react/source/containers/Application/index.tsx#L401
[pubsub-effect]: ../packages/plurid-web/plurid-works/plurid-react/source/containers/Application/View/hooks/usePluridPubSub.ts#L754
[history]: ../packages/plurid-web/plurid-works/plurid-react/source/services/state/middleware/history.ts#L102
[signature]: ../packages/plurid-web/plurid-works/plurid-react/source/services/logic/arrangement/signature.ts#L26
[collaboration]: ../packages/plurid-web/plurid-works/plurid-react/source/containers/Application/View/hooks/useCollaboration.ts#L107
[registrar]: ../packages/plurid-web/plurid-core/plurid-engine/source/modules/planes/registrar/utilities.ts#L38
[root-registrar]: ../packages/plurid-web/plurid-works/plurid-react/source/components/structural/Root/index.tsx#L264
[culling]: ../packages/plurid-web/plurid-works/plurid-react/source/containers/Application/View/hooks/useCulling.ts#L72
[parser]: ../packages/plurid-web/plurid-core/plurid-engine/source/modules/routing/Parser/logic.ts#L22
[matcher]: ../packages/plurid-web/plurid-core/plurid-engine/source/modules/routing/IsoMatcher/index.ts#L226
[preserves]: ../packages/plurid-web/plurid-works/plurid-react-server/source/objects/Server/preserves.ts#L183
[server-pipeline]: ../packages/plurid-web/plurid-works/plurid-react-server/source/objects/Server/pipeline.tsx#L117
[ignore-routes]: ../packages/plurid-web/plurid-works/plurid-react-server/source/objects/Server/preserves.ts#L43
[after-serve]: ../packages/plurid-web/plurid-works/plurid-react-server/source/objects/Server/preserves.ts#L219
[after-serve-call]: ../packages/plurid-web/plurid-works/plurid-react-server/source/objects/Server/pipeline.tsx#L304
[generator-options]: ../packages/plurid-utilities/generate-plurid-app/source/index.ts#L44
[generator-process]: ../packages/plurid-utilities/generate-plurid-app/source/process/index.ts#L44
[generator-client]: ../packages/plurid-utilities/generate-plurid-app/source/process/react/client/index.ts#L61
[generator-server]: ../packages/plurid-utilities/generate-plurid-app/source/process/react/server/index.ts#L298
[generator-utilities]: ../packages/plurid-utilities/generate-plurid-app/source/utilities/index.ts#L95
[kit-server]: ../packages/plurid-web/plurid-works/plurid-kit/source/server/index.ts#L106
[kit-build]: ../packages/plurid-web/plurid-works/plurid-kit/source/cli/build.ts#L30
[kit-esbuild]: ../packages/plurid-web/plurid-works/plurid-kit/source/cli/esbuild.ts#L156
[kit-start]: ../packages/plurid-web/plurid-works/plurid-kit/source/cli/start.ts#L29
[kit-dev]: ../packages/plurid-web/plurid-works/plurid-kit/source/cli/dev.ts#L123
[kit-config]: ../packages/plurid-web/plurid-works/plurid-kit/source/cli/config.ts#L115
[utility-events]: ../packages/plurid-utilities/plurid-functions-react/source/hooks/event/index.ts#L33
[internal-events]: ../packages/plurid-web/plurid-works/plurid-react/source/services/hooks/event/index.ts#L35
[portal]: ../packages/plurid-utilities/plurid-functions-react/source/hooks/portal/index.tsx#L78
[drawer]: ../packages/plurid-web/plurid-works/plurid-react/source/components/utilities/Toolbar/General/components/Drawer/index.tsx#L114
[toolbar-style]: ../packages/plurid-web/plurid-works/plurid-react/source/components/utilities/Toolbar/General/styled.ts#L165
[rail-style]: ../packages/plurid-web/plurid-works/plurid-react/source/components/utilities/DockRail/styled.ts#L39
[plane-focus]: ../packages/plurid-web/plurid-works/plurid-react/source/components/structural/Plane/index.tsx#L583
[lineage]: ../packages/plurid-web/plurid-works/plurid-react/source/services/state/modules/space/selectors.ts#L138
[link]: ../packages/plurid-web/plurid-works/plurid-react/source/components/links/Link/index.tsx#L456
[transform-controls]: ../packages/plurid-web/plurid-works/plurid-react/source/components/utilities/Toolbar/General/components/MenuMore/components/Transform/index.tsx#L153
[switch]: ../packages/plurid-utilities/plurid-ui-components-react/source/components/universal/inputs/Switch/index.tsx#L79
[shortcuts]: ../packages/plurid-web/plurid-works/plurid-react/source/components/utilities/Shortcuts/index.tsx#L210
[empty-branch]: ../packages/plurid-web/plurid-works/plurid-react/source/containers/Application/View/index.tsx#L1069
[error-boundary]: ../packages/plurid-web/plurid-works/plurid-react/source/components/utilities/ErrorBoundary/index.tsx#L55
[view-role]: ../packages/plurid-web/plurid-works/plurid-react/source/containers/Application/View/index.tsx#L1054
[minimap-transition]: ../packages/plurid-web/plurid-works/plurid-react/source/components/utilities/Minimap/index.tsx#L119
[ci]: ../.github/workflows/ci.yml#L33
[lint-config]: ../eslint.config.mjs#L42
[development-store]: ../packages/plurid-web/plurid-works/plurid-react/source/services/state/store/development/index.ts#L41
[persistence]: ../packages/plurid-web/plurid-core/plurid-engine/source/modules/state/local/index.ts#L21
[benchmark]: ../fixtures/render-test/e2e/bench.spec.ts#L63
[virtual-list]: ../packages/plurid-web/plurid-works/plurid-react/source/components/virtuals/List/index.tsx#L109
[plane-visibility]: ../packages/plurid-web/plurid-works/plurid-react/source/services/hooks/plane/index.ts#L303
[server-serialization]: ../packages/plurid-web/plurid-works/plurid-react-server/source/utilities/template/index.ts#L100
[document-serialization]: ../packages/plurid-web/plurid-core/plurid-engine/source/modules/general/document/serialize.ts#L25
[globals-injection]: ../packages/plurid-web/plurid-works/plurid-react-server/source/utilities/template/index.ts#L112
[iframe]: ../packages/plurid-web/plurid-works/plurid-react/source/components/planes/IframePlane/index.tsx#L91
[external-plane]: ../packages/plurid-web/plurid-works/plurid-react/source/components/planes/ExternalPlane/index.tsx#L53
