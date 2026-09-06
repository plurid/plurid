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

## Next 1: Visibility, culling, and virtualization

Real culling is the immediate capability priority. The repository contains culling configuration, calculation, state, selectors, and UI, but the View update is commented and rendering does not consume a true visible set.

The capability must define:

- visibility and distance semantics in the camera frame;
- overscan and hysteresis;
- active, selected, focused, linked, or animating exceptions;
- whether non-visible planes are hidden, detached, or virtualized;
- preservation of editor/component state;
- visibility reporting through `usePluridPlane()`;
- behavior during persistence, collaboration, minimap, and link rendering.

Verification requires parameterized large-space browser scenarios and measured budgets, not only a unit test of the visibility calculation.

## Next 2: Deterministic readiness and command delivery

Products should not need one-tick `setTimeout` calls to wait for View subscriptions. Add an explicit readiness contract or buffered command mechanism that works in route-driven and direct-embed modes.

Verification: a host restores content/viewpoint, sets selection, or navigates immediately after mount without timing assumptions, duplicate application, or lost commands.

## Next 3: Accessible and configurable interaction

Continue treating embedded content as first-class web UI. Define keyboard navigation between planes, focus visibility, reduced-motion behavior, screen-reader structure, touch ergonomics, and remappable commands. Engine overlays and slots need semantic and focus contracts, not only visual customization.

Verification: automated accessibility checks plus keyboard-only and touch browser flows in the harness and Denote.

## Next 4: Content measurement and layout contracts

The engine already carries measured plane size and dormant/update seams, but layout algorithms need a clear contract for variable width/height, ResizeObserver updates, stable relayout, and consumer-controlled constraints.

This is important for Depict media, Dechat artifacts, and Denote editors. It must avoid feedback loops between content layout and spatial layout.

Verification: mixed-size planes resize without oscillation, loss of manual position, broken links, or unrelated tree churn.

## Next 5: Browser, visual, and performance observability

Expose a development-only diagnostic surface for plane identity, tree parentage, layout bounds, culled state, render/commit counts, active gestures, links, and camera state. Keep it out of production bundles by default.

Combine that with automated browser/visual suites and repeatable performance scenarios so engine behavior can be diagnosed rather than inferred from screenshots or console logs.

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

Landed 2026-09-02/03 (see ARCHITECTURE.md): the camera core and motion controller, the input layer v2, links/tree v2, navigation (home / presets / bookmarks / gamepad / animated relayout), selection and editing (marquee, snap engine, align / distribute / duplicate, resize handles, keyboard plane navigation), culling / depth cues / overlays / accessibility / perf HUD / benchmarks, and the DX surface (typed pubsub, hooks, the imperative handle, the testing entry, the kit dev loop). Consciously left for later:

- A command palette over the shortcut table (the table and the hooks make it a thin component).
- A roll / free-look camera (the quaternion path is tested and off the camera path; the turntable has no roll by design).
- Bookmarks UI beyond the toolbar drawer and the topics (a bookmark bar / thumbnails).
- Copy / paste of planes across instances (needs a serialization of a plane subtree + link identity).
- A history scrubber UI (the middleware exposes depths; a timeline needs snapshot labels).
- Collision against planes when flying (no physics today).
- Opt-in virtualized UNMOUNTING of culled planes (today culled planes keep their React state; `space.culling.unmount` is reserved).
- `content-visibility` for culled planes (needs intrinsic sizes; `visibility: hidden` + containment is used).
- A gallery / docs site generated from the harness scenarios.
- A screen-reader 2D fallback (a linear list of the planes with the same commands).
- State-preserving HMR for the kit (the dev loop restarts the server; client state survives only via persistence).
- Query / fragment preservation on link routes (`resolveViewItem` strips them; the IsoMatcher parametric route-plane test stays skipped).
- DONE 2026-09-05: `react-helmet-async` replaced by the document model (`PluridDocument` data; `<PluridDocument>` / `usePluridDocument`, `planes[].head`, `routes[].head`, a preserve's `document`, the server `document` hook; one `<title>`, hydration-clean). See ARCHITECTURE §9 and CONTROL_SURFACE "Document head". Streaming SSR stays out (late metadata from a resolved Suspense boundary lands in the body); `render: 'suspense'` is the buffered middle ground.
- DONE 2026-09-05: the PAGE PRESENTATION (`space.presentation: 'page'`, flat `presentation`; `elements.plane.height` / `planeHeight` as the general mechanism): the space presents as a site — view-sized pages, the camera docked (`interaction.camera` dock functions), the chrome hidden by `data-plurid-docked`, the wheel the page's, links / the corner control / G / a pinch reveal, Escape docks. Pose is the state; no mode flag. See ARCHITECTURE §4 and CONTROL_SURFACE "The page presentation". hypod and `generate-plurid-app` migrate to the one knob. Left for later: a per-page scroll restoration across dock / undock is native (the scroller keeps its position); a page-transition (crossfade) between docked pages is not planned — the swing IS the transition.
- DONE 2026-09-06: the page presentation POLISHED to the engine's standard (six phases, `docs/ARCHITECTURE.md` §4.1): `space.docking { motion, chrome, reveal, fade, aside, focus, epsilon }` (an instant switch, no chrome during a docking swing, the reveal pose, one fade, the lineage rule, the focus grab, the dock epsilon; flat `docking`), `elements.dockRail` + `renderDockRail` (the rail is the page's, the viewcube is the cube again), `dock` / `reveal` / `docked` on `useCamera`, the handle and the plane lens, `space.changed` kind `docked`, `planeID` on every plane-addressing message (`id` / `plane` aliases), the dead knobs retired (`micro`, `render`, `switch`, `linkView`, `centerView`, `transformMultimode`, `transformTouch`, `animatedTransform`); a link is a link on a page; only the page's lineage is shown while docked; the bridge is a leash to a scrolled link, drawn as a band that never crosses the parent's plane; the camera FOLLOWS the docked page through resizes, re-measured links and a persisted reload (the snapshot carries `viewSize`); two fingers on a page pinch it open; the docked wheel never reaches the host document; the bar never clips. Verified frame by frame (`e2e/page.spec.ts`, 33 scenarios) and by ten visual baselines. Next, with the user: THE ADDRESS BAR IS THE PAGE — `space.docking.url` (write the docked page's route, restore it on load, the back button walks the dock history) and its relation to `PluridRouterBrowser` and the viewpoint URL binding.
