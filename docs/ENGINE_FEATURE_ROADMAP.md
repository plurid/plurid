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
