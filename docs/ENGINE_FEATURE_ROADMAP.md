# Plurid Engine Feature Roadmap

Status: **capability ledger and forward plan, verified 2026-07-13**.

This document answers two questions: what reusable spatial capabilities already exist, and what capability work comes next. Implementation mechanics and public signatures are authoritative in [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md).

## Governing boundary

Plurid is content-agnostic. A plane hosts consumer-provided React content. The engine owns spatial state and reusable spatial interaction; products own their content and domain behavior.

| Engine | Product |
| --- | --- |
| camera, viewpoint codec, navigation, layout, plane tree | note/image/message domain models |
| selection, pinned movement, snapping, links, spatial history | editors, media tooling, model providers, product histories |
| persistence and collaboration transport seams | databases, CRDT choice, authorization, conflict policy |
| input arbitration, focus, sizing, visibility, rendering | product UX, search, explorer, sharing, billing |
| control/observe APIs and replaceable engine UI | product commands and application chrome |

A feature belongs in the engine when Denote, Depict, or Dechat can use the same primitive without importing one another's domain concepts.

## Delivered capabilities

| Capability | Engine status | Product status |
| --- | --- | --- |
| Serializable viewpoint | Delivered: opt-in URL read/write, codec, pubsub set, callback observation | Denote uses viewpoint configuration; broader saved-view/share UX remains product work |
| Content persistence seam | Delivered: opaque content callback path plus storage adapter | Product adoption remains partial; domain content storage stays outside the engine |
| Editor/input coexistence | Delivered: input/contenteditable guards and configurable gestures/shortcuts | Must be protected by Denote browser tests |
| Spatial undo/redo | Delivered: bounded arrangement history covering tree, links, and pinned movement | Product must keep editor/domain undo separate |
| Inter-plane links and CSS-3D edges | Delivered: state, selectors, persistence, pubsub, renderer | Backlink panels and drag-to-connect UX remain product work |
| Selection and arrangement | Delivered: multi-select, group movement, manual pinning, snapping, guides, Z movement | Needs realistic product-scale usability validation |
| Collaboration seam | Delivered: transport-agnostic mutation/apply path with echo and local-history controls | Transport, presence, CRDT, authorization, and conflict UX remain product work |
| Minimap | Delivered: projected overview with navigation and replaceable render slot | Needs large-space and accessibility validation |
| Developer control surface | Delivered: configuration, callbacks, pubsub, slots, selectors, `onReady` | Adoption in the application portfolio is still partial |
| Plane-content lens | Delivered: `usePluridPlane()` exposes live plane context to consumer content | Depict is the main generality test |
| Container sizing | Delivered: opt-in space dimensions | Needs responsive/embed browser coverage |

“Delivered” means present in the engine and exercised in its harness/tests. It does not mean a flagship product has fully adopted or protected the capability.

## Next 1: Visibility, culling, and virtualization — DONE 2026-09-10

Culling is wired and exercised (`useCulling`: hidden / frozen planes, depth cues, the active / selected / isolated / focused exceptions, invalidated on every eligibility change since 2026-09-06). CONTENT VIRTUALIZATION landed 2026-09-10 as THE DETACH TIER, `space.culling.detach` (`'retain'` — React's Activity keeps the state, `'unmount'` — the DOM is freed; `{ mode, delay, distance, max }`): a hidden plane's content is detached after `delay` ms while its SHELL stays (the geometry, the minimap, the beams and the culling never change), re-attached the moment it is shown; the visibility and distance semantics are the pass's (camera-space, the frustum margin with its half-margin show hysteresis as the overscan), the exceptions the pass's plus the docked lineage and a parent with a visible child, the budget `max`; `usePluridPlane().detached` / `culled: 'detached'`, `space.changed` kind `culling`, `handle.tree.culling()`; nothing is persisted or broadcast. Measured: `fixtures/render-test/e2e/virtualization.spec.ts` (500 planes: 500 shells and minimap dots, the far corner's DOM node count with `unmount` ≤ 40 % of the plain run's — the number is printed per run; a pan swaps the mounted set; the budget; `retain` keeps a counter and the scroll, `unmount` drops the counter; a detached parent re-attaches with its link and the child's bridge), the harness flags `cullDetach` / `cullDelay` / `cullMax` / `cullDetachDistance`, the HUD's `live` / `detached` counts, `__rtMounted()`. Left as written: the memory budget is a DOM-node ratio (machine-independent), not a heap number; `customPlane` hosts are outside virtualization; `content-visibility` stays unused (the shell has no intrinsic size).

## Next 2: Deterministic readiness and command delivery — DONE 2026-09-10

THE READINESS CONTRACT: commands are accepted from `onReady` on — the View bridges the bus in a layout effect, which runs before the Application's `componentDidMount` fires `onReady` (C01, 2026-09-06), so a command published synchronously from it executes. In the ROUTE-DRIVEN mode `PluridRouterBrowser` takes `onReady` and `pubsub` too (2026-09-10): the application rendered for the matched route fires the router's `onReady` (again for the next route's application) and shares the router's bus. A command published BEFORE readiness (or after an unmount) reaches no subscriber: the bus's `onDrop` hook tells the engine, which warns once per topic in development (`pubsub-drop:<topic>`; the engine's own emits are never a dropped command). The decision: readiness, not buffering — a buffered command replayed later would run against a state the host never saw. Verification: `lifecycle.test.tsx` (the direct embed and the router: a synchronous rotate from `onReady`; the drop reported once), the harness's `?router=1` boot (`__rtRouterRotation`). No one-tick deferral is needed or supported.

## Next 3: Accessible and configurable interaction — DONE 2026-09-10 (one item deferred)

Delivered: keyboard navigation between planes (the arrows, Enter, Alt+F / Alt+B, the roots' cycling), focus visibility (the two-tone ring on the chrome, the plane's focus anchor), reduced motion (`navigation.motion.reducedMotion: 'respect' | 'ignore'`, the CSS rules, the harness's `reducedMotion` flag), touch ergonomics (one finger is the page's, two are the space's; the small-screen chrome), remappable commands (`space.shortcuts.disabled` / `keymap` / `onUnhandledKey`, `gestures.buttonMap`), the semantic chrome (native disclosure buttons, `role="dialog"`, the live region, `inert` outside the reading scope), and — 2026-09-10 — every plane a NAMED GROUP (`role="group"`, `aria-roledescription="plane"`, `aria-label` = the declared document title, else the route path). Verification: `e2e/a11y.spec.ts` — the U01–U04 contracts, a keyboard-only flow (the space focused, the arrows, Enter, Alt+W, Alt+Shift+T) and an axe scan (`@axe-core/playwright`) of the space and of a docked page with no serious or critical violation. Deferred: the screen-reader 2D fallback — a linear list of the planes with the same commands.

## Next 4: Content measurement and layout contracts — DONE 2026-09-10

THE SIZING CONTRACT (`docs/ARCHITECTURE.md` §5.3.1): width is never the content's; height is the content's unless declared, configured or hand-set, and can be capped (`elements.plane.maxHeight`, `planes[].maxHeight` — taller content scrolls inside); a measurement is an observation (rounded, equality-gated, never persisted as intent); the roots are placed by their CURRENT sizes (`Tree.compute` takes the previous tree, `applyKnownSizes`) and a measured height change relays them once per frame, gliding, never mid-motion (`useMeasuredRelayout`); a relayout changes transforms only, so the loop is closed by construction. Fixed on the way: a dragged CHILD snapped back to its link (`recomputeSubtree` now respects `manuallyPositioned`); `reconcileTree` dropped `linkCoordinates` / `bridgeSide` / `bridgeOffset` / `spawnedByLinkID` on an equal-route reconcile. Verification: `fixtures/render-test/e2e/layout.spec.ts` (content-sized roots pack by their heights and the space is still; a grown root moves the roots below it, gliding, the rest unmoved; a resize keeps the packing and a pin; a dragged child stays through a resize and a host `setTree`; a capped plane scrolls and reports the cap), the fixture `columns-content`, engine `layout/__tests__/sizes.test.ts`, the reducer and Plane suites. Follow-up: the leash of a DRAGGED child (today it follows a scrolled link only).

## Next 5: Browser, visual, and performance observability — DONE 2026-09-10

`api.inspect()` (also on the handle and `usePluridApi()`): one plain snapshot — the camera, the motion, the gesture in flight, the view, the counts (dispatches, renders, shown / mounted / hidden / frozen / detached), every shown plane's identity, parentage, box, size mode, pin, spawning link, culling tier and render count, the links. The counters run only under `development.inspector` (`?debug=1` in the harness). The debuggers gained parentage, renders, renders/s and the gesture, and are `React.lazy` behind their flags — a bundle that never asks for them never loads their code (`e2e/diagnostics.spec.ts` asserts no debugger request without the flag, and that an orbit re-renders no plane: the render counts stand still). Repeatable performance: the bench gained the `relayout` and `spawn` scenarios next to the orbit, `pnpm bench` prints the table (`scripts/bench.mjs`). The browser and visual suites are the gates (`docs/HARNESS.md`). The bench measured that a view resize with N planes cost N `setPlaneSize` dispatches (every plane re-measured and reported alone — 100 planes: ~110 dispatches and a 300–400 ms frame per relayout); since 2026-09-13 the application's one ResizeObserver delivers a frame's measurements as one `setPlaneSizes` (one tree write per relayout).

## Later: Renderer abstraction and WebXR

WebXR is a strategic direction, not the next implementation task. First stabilize renderer-independent contracts for planes, geometry, content capability, camera, hit testing, selection, and input. Then prototype a WebGL/WebXR adapter behind those contracts.

The research must explicitly address selectable/editable DOM content, accessibility, DOM overlays versus textures, focus transfer, controller/hand input, and parity between flat-browser and immersive sessions. A WebXR implementation that forks product state or route/tree semantics is not an acceptable renderer adapter.

## Product adoption sequence

### Denote

Adopt and protect viewpoint, persistence, readiness, selection, links, collaboration transport, input arbitration, and large-space behavior. Denote is the integration/regression product.

### Depict

Validate the plane-content lens, variable-size/media planes, visibility/culling, selection, and media-oriented layout. Do not add image/video components to the engine.

### Dechat

Validate branching layouts, streaming content stability, artifacts as planes, context navigation, and history/collaboration boundaries. Do not add LLM provider or message semantics to the engine.

## Feature admission template

Before implementing a new engine capability, record:

1. the product problem and at least two plausible consumers;
2. why existing control/configuration surfaces are insufficient;
3. the engine/product ownership boundary;
4. public API and backward-compatibility impact;
5. state, persistence, collaboration, input, SSR, and accessibility effects;
6. unit, browser, visual, performance, and product verification;
7. removal or migration of any product workaround.

## Definition of done

A capability is done when its domain behavior is tested, its public control/observation surface is documented, the render harness verifies it, at least one product consumes it, performance/accessibility consequences are measured where relevant, and no undocumented product workaround remains.

## Deferred after the 2026-09 engine pass

Landed 2026-09-02/03 (see ARCHITECTURE.md): the camera core and motion controller, the input layer v2, links/tree v2, navigation (home / presets / bookmarks / gamepad / animated relayout), selection and editing (marquee, snap engine, align / distribute / duplicate, resize handles, keyboard plane navigation), culling / depth cues / overlays / accessibility / perf HUD / benchmarks, and the DX surface (typed pubsub, hooks, the imperative handle, the testing entry, the kit dev loop). What followed, and what waits:

Landed since:

- DONE 2026-09-13: THE BOOKMARKS UI — the toolbar's Bookmarks drawer: name the view you are on and save it, every saved view listed with A COMPUTED PICTURE of what it frames (`ViewpointThumb`: the minimap's projection of the live tree under the saved camera's footprint), a click travelling there, an in-place rename (`space.bookmark { action: 'rename', to }`, the row keeping its position), remove, and the home viewpoint as a row of its own. The bookmarks, the host's presets and home are ONE list (`PluridNamedViewpoint`, `namedViewpoints`) — the drawer, the palette and `usePluridBookmarks()` read it, so a row can never drift from a command.
- DONE 2026-09-13: THE HISTORY SCRUBBER — every step carries a derived label and a time (`describeArrangementChange`), the status lists `past` / `future`, `space/historyGoTo` jumps N steps as one restore, and the toolbar's History drawer lists them with the present marked.
- DONE 2026-09-13: THE COMMAND PALETTE (⌘/Ctrl+K) — the applicable commands with their keys, the bookmarks and presets, every shown plane, in one filtered list; a row runs the binding's own `run` (`runShortcut(id, …)`, exported), so a command has one implementation; `elements.palette.show`, `renderPalette`, `ui.paletteVisible`.
- DONE 2026-09-10: REBASED COLLABORATIVE UNDO — a peer's applied change no longer clears the local history; every snapshot is replayed over the peer's arrangement (`services/logic/arrangement/rebase.ts`), the local change winning on its planes, the peer's everywhere else. Not OT: two drags of one plane resolve to the local intent on undo.
- DONE 2026-09-05: `react-helmet-async` replaced by the document model (`PluridDocument` data; `<PluridDocument>` / `usePluridDocument`, `planes[].head`, `routes[].head`, a preserve's `document`, the server `document` hook; one `<title>`, hydration-clean). See ARCHITECTURE §9 and CONTROL_SURFACE "Document head". Streaming SSR stays out (late metadata from a resolved Suspense boundary lands in the body); `render: 'suspense'` is the buffered middle ground.
- DONE 2026-09-05: the PAGE PRESENTATION (`space.presentation: 'page'`, flat `presentation`; `elements.plane.height` / `planeHeight` as the general mechanism): the space presents as a site — view-sized pages, the camera docked (`interaction.camera` dock functions), the chrome hidden by `data-plurid-docked`, the wheel the page's, links / the corner control / G / a pinch reveal, Escape docks. Pose is the state; no mode flag. See ARCHITECTURE §4 and CONTROL_SURFACE "The page presentation". hypod and `generate-plurid-app` migrate to the one knob. Left for later: a per-page scroll restoration across dock / undock is native (the scroller keeps its position); a page-transition (crossfade) between docked pages is not planned — the swing IS the transition.
- DONE 2026-09-06: the page presentation POLISHED to the engine's standard (six phases, `docs/ARCHITECTURE.md` §4.1): `space.docking { motion, chrome, reveal, fade, aside, focus, epsilon }` (an instant switch, no chrome during a docking swing, the reveal pose, one fade, the lineage rule, the focus grab, the dock epsilon; flat `docking`), `elements.dockRail` + `renderDockRail` (the rail is the page's, the viewcube is the cube again), `dock` / `reveal` / `docked` on `useCamera`, the handle and the plane lens, `space.changed` kind `docked`, `planeID` on every plane-addressing message (`id` / `plane` aliases), the dead knobs retired (`micro`, `render`, `switch`, `linkView`, `centerView`, `transformMultimode`, `transformTouch`, `animatedTransform`); a link is a link on a page; only the page's lineage is shown while docked; the bridge is a leash to a scrolled link, drawn as a band that never crosses the parent's plane; the camera FOLLOWS the docked page through resizes, re-measured links and a persisted reload (the snapshot carries `viewSize`); two fingers on a page pinch it open; the docked wheel never reaches the host document; the bar never clips. Verified frame by frame (`e2e/page.spec.ts`, 33 scenarios) and by ten visual baselines. DONE 2026-09-06: THE ADDRESS BAR IS THE PAGE — `space.docking.url` (on by default in the page presentation): the docked page's path in the location, one history entry per page, Back / Forward docking pages, a deep link booting docked (a sub-page spawned through its parent's link), the query mode inside `PluridRouterBrowser`; the viewpoint binding shares the URL (`?v=`). DONE 2026-09-10: a root deep link docks at STORE time (the client store and the server render, no frame of the first page), `url.base` (a site under a prefix), `url.orphan: 'root' | 'keep'`; the router's location handler reads its current props.

Deferred:

- A roll / free-look camera (the quaternion path is tested and off the camera path; the turntable has no roll by design).
- Copy / paste of planes across instances (needs a serialization of a plane subtree + link identity).
- Collision against planes when flying (no physics today).
- `content-visibility` for culled planes (needs intrinsic sizes; `visibility: hidden` + containment is used).
- A gallery / docs site generated from the harness scenarios.
- A screen-reader 2D fallback (a linear list of the planes with the same commands).
- State-preserving HMR for the kit (the dev loop restarts the server; client state survives only via persistence).
- DONE 2026-09-13: QUERY / FRAGMENT PRESERVATION ON LINK ROUTES — a link's `?query#fragment` travels with the plane it opens (`routeSuffix`, `resolveViewItem` fills `routeDivisions.plane`, `Root` hands it to the component; two queries, two planes); the parametric route-plane test is un-skipped (a route plane nests under its route when its path is relative, an absolute path stays absolute; the route-plane branch reads the query off the raw value).
