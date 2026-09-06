# Plurid Engine Architecture

Verified: 2026-07-13 against source, package manifests, workspace configuration, and the applications consumer inventory; section 4 (camera), the wire catalog and Appendix A re-verified 2026-09-02 for the camera core.

This is the descriptive reference: how the system works today; roadmaps and knob how-tos live elsewhere - see Appendix B. Every path, export name, count, and behavior below was checked against the source on the date above. Claims are anchored to `file:symbol` wherever possible so they survive line drift; when files move, this document is re-anchored, not trusted.

All paths are relative to the repo root (`technologies/tools/plurid`) unless stated otherwise. Paths into packages omit the `packages/plurid-web/` / `packages/plurid-utilities/` prefixes once the package is named.

Contents:

1. The system on one page
2. Package layers
3. The render pipeline, mount to pixels
4. The camera and transform model
5. Plane lifecycle: registration -> tree -> layout -> render
6. The state model
7. The pubsub protocol
8. The configuration system
9. The SSR pipeline (plurid-react-server)
10. plurid-kit, the framework layer
11. The control surface, tiered
12. Consumption modes
13. Extension points
14. Verification harness and gates

- Appendix A - public API inventory
- Appendix B - doc map and authority order

## 1. The system on one page

Plurid renders web pages as PLANES in a navigable 3D space. The 3D is pure CSS: the space container sets `perspective: 2000px` (plurid-react `components/structural/Space/styled.ts`), the camera is ONE `matrix3d(...)` transform on the roots container (`components/structural/Roots`), and every plane is a real DOM subtree positioned with its own small CSS transform under `transform-style: preserve-3d` (`Roots/styled.ts`, `Root/styled.ts`). There is no canvas, no WebGL, no scene graph outside the DOM: text stays selectable, inputs stay focusable, DevTools stays useful.

The runtime story, one paragraph: mounting `<PluridApplication>` (a class component) computes a preloaded state from its props (view, planes, configuration, any persisted local snapshot, any SSR-precomputed state), creates a PER-INSTANCE Redux Toolkit store and a per-instance pubsub bus, and renders the connected `PluridView` under a private react-redux context. The view's hooks wire pointer/keyboard/resize input and the pubsub bridge; the engine (`@plurid/plurid-engine`) computes the plane tree and its layout; `Roots` applies the camera matrix computed by the space reducer; each `Root`/`Plane` renders one plane's component with an injected `plurid` prop. Navigation is dispatch: a pointer drag dispatches transform actions per frame, the reducer recomputes the matrix, and only the roots container re-renders.

What runs where:

- `@plurid/plurid-react` - the browser adapter (also renders under SSR via `react-dom/server`).
- `@plurid/plurid-react-server` - the Express 5 SSR server: route matching, per-request data (preserves), HTML template, static stills.
- `@plurid/plurid-kit` - the published framework layer: `plurid.config.ts` + the `plurid` CLI (`dev/build/start/info`) + `createPluridServer`/`createPluridClient` bootstraps.

Dependency layers (imports point downward only):

```
L5  plurid-kit          generate-plurid-app         fixtures/render-test
       |                     (scaffolder)               (harness)
       v
L4  plurid-react-server
       |
       v
L3  plurid-react
       |
       v
L2  plurid-engine        plurid-pubsub        plurid-ui-components-react
       |                     |                        |
       v                     v                        v
L1  plurid-data          plurid-icons-react   plurid-ui-state-react
       |                     |                        |
       v                     v                        v
L0  plurid-themes        plurid-functions     plurid-functions-react
```

## 2. Package layers

The workspace (`pnpm-workspace.yaml`) globs `packages/plurid-web/plurid-core/*`, `packages/plurid-web/plurid-works/*`, `packages/plurid-utilities/*`, and `fixtures/render-test`. Layer rule: a package imports only from layers below it (verified against each `package.json`'s `@plurid/*` dependencies, 2026-07-13).

| Layer | Package | Version | Directory | Role |
| --- | --- | --- | --- | --- |
| L0 | `@plurid/plurid-themes` | 0.0.0-3 | plurid-utilities/plurid-themes | theme objects (no @plurid deps) |
| L0 | `@plurid/plurid-functions` | 0.0.0-32 | plurid-utilities/plurid-functions | pure utilities (`objects.merge`/`clone`, mathematics, ...) |
| L0 | `@plurid/plurid-functions-react` | 0.0.0-6 | plurid-utilities/plurid-functions-react | React utility hooks (`useDebouncedCallback`, ...) |
| L1 | `@plurid/plurid-data` | 0.0.0-22 | plurid-core/plurid-data | ALL shared types, constants, enums, defaults, pubsub topics |
| L1 | `@plurid/plurid-icons-react` | 0.0.0-10 | plurid-utilities/plurid-icons-react | icon set |
| L1 | `@plurid/plurid-ui-state-react` | 0.0.0-13 | plurid-utilities/plurid-ui-state-react | host-app UI state slices + `composePluridUIState` |
| L2 | `@plurid/plurid-pubsub` | 0.0.0-10 | plurid-core/plurid-pubsub | the event bus class |
| L2 | `@plurid/plurid-engine` | 0.0.0-20 | plurid-core/plurid-engine | plane tree, layout, routing, matrix math, state compute/persist (framework-agnostic) |
| L2 | `@plurid/plurid-ui-components-react` | 0.0.0-32 | plurid-utilities/plurid-ui-components-react | UI component library (48 styled files on the shared filtered `styled` factory) |
| L3 | `@plurid/plurid-react` | 0.0.0-36 | plurid-works/plurid-react | the render adapter: `PluridApplication`, routers, links, hooks |
| L4 | `@plurid/plurid-react-server` | 0.0.0-17 | plurid-works/plurid-react-server | SSR server (Express 5), stills, template |
| L5 | `@plurid/plurid-kit` | 0.0.0-3 | plurid-works/plurid-kit | published framework: config contract + CLI + bootstraps |
| L5 | `@plurid/generate-plurid-app` | 0.0.0-14 | plurid-utilities/generate-plurid-app | scaffolding CLI; still emits the CRA-era shape - the FRAMEWORK_PLAN P5 rework retargets it at the kit shape |
| L5 | `fixtures/render-test` | private | fixtures/render-test | the CAD verification harness (Vite, port 5273) |

Where things live, by rule:

- TYPES and constants live in `plurid-data` (interfaces, enums, `PLURID_PUBSUB_TOPIC`, the default configuration). Nothing below L3 knows React types beyond generics.
- LOGIC lives in `plurid-engine` (`source/modules/{space,planes,routing,state,interaction,general}`): tree compute/reconcile, the five layout algorithms, IsoMatcher/route parsing, matrix math, the persistence primitive.
- REACT lives in `plurid-react`: components, the store, the hooks, the pubsub bridge.

Archived / de-globbed (source kept on disk, out of every gate, `!` negations in `pnpm-workspace.yaml`): `plurid-canvas` (empty 0.0.0-0), `plurid-html` (stale Stencil duplicate), `plurid-routes-server` (orphaned pluriverse-era route cache). `plurid-works/plurid-html-server` is a HUSK directory - LICENSE files only, no `package.json`, invisible to pnpm.

`pnpm-workspace.yaml` also carries the `overrides` block that keeps the graph single-versioned: `immer ^10` (RTK 2.12 pairs with immer 10; immer 11 types leak), `react-redux ^9` and `styled-components ^6` (two copies break React context -> blank render), and `@types/react ^18.3` + `@types/react-dom ^18.3`. The `@types/react` pin exists because TWO type copies (18 from the libs, 19 from the React-19 harness) leak into styled-components' shared type inference and produce TS2742 ("inferred type cannot be named") in dts builds; the libs build their types against 18.3 (a type-level subset of 19) while runtime React stays 19.

Per-package status, gates, and the governance ledger live in [`CONTEXT-MAP.md`](./CONTEXT-MAP.md)

- this document does not duplicate its table.

### 2.1 Packaging and native ESM (2026-09-05)

Every package builds with tsup to ESM (`.mjs`) + CommonJS (`.js`) + declarations, peers external. One peer breaks under NATIVE Node ESM only: `styled-components@6` resolves to its CommonJS build (so `import styled from 'styled-components'` in our ESM output is the whole `module.exports`; `styled.default` is the function). Bundlers and CommonJS never see it, which is why the browser suite and jest passed while `node -e "import('@plurid/plurid-react')"` threw `styled.div is not a function`. `scripts/tsup/cjs-interop.mjs` is an esbuild plugin (wired in the React, server, kit, icons and UI-components tsup configs, with `noExternal` for the module because tsup's own externals plugin runs first) that redirects the import through an inlined shim resolving the default and each named export across the interop shapes, keeping the real module external. (`react-helmet-async` used to be the second such peer; it is gone since the document model, 2026-09-05.) THE DEPENDENCY CONTRACT (2026-09-05): internal `@plurid/*` packages and redux are `dependencies` (`workspace:^` → `^0.0.0-N`) of whichever package imports them; the only peers are the singletons — `react`, `react-dom`, `styled-components` (everywhere), `react-redux` + `@reduxjs/toolkit` (ui-components / ui-state: the host's store), `@plurid/plurid-react` (server, kit), and the optional `@plurid/elementql-client-react` (plurid-react's external plane) / `puppeteer` (server stills). A consumer installs `@plurid/plurid-react react react-dom styled-components`. `pnpm check.modules` and `pnpm smoke.pack` guard it. The React adapter's ESM output is code-split (`index.mjs`, `testing.mjs` and a shared `chunk-*.mjs` — all under `files: distribution/`).

## 3. The render pipeline, mount to pixels

### 3.1 PluridApplication, the stateful shell

`plurid-react source/containers/Application/index.tsx` - a CLASS component (the only stateful shell in the adapter). Per instance it owns:

- THE STORE: `computeStore()` calls `state.compute(view, configuration, planesRegistrar, currentState, localState, precomputedState, contextState, hostname)` (the engine's `modules/state/compute`), then `store(preloadedState, { history })` creates the RTK store. `history` is `resolvedSpace?.undo !== false` read off the MERGED configuration - an explicit `space.undo: false` drops the history middleware entirely (section 6).
- THE PUBSUB: `this.pubsub = properties.pubsub || new PluridPubSub()` - host-injectable via the `pubsub` prop, so a host can own the bus; either way it is the SAME instance the View subscribes its topics on and the one handed back via `onReady`.
- THE PLANES REGISTRAR: `prepare()` constructs a `PluridPlanesRegistrar(props.planes, hostname)` ONLY when `typeof window === 'undefined'` and none was passed - the SSR branch (the server passes a shared registrar; the browser registers planes into the module-level registrar via `registerPlanes` on every `computeStore`).
- TIMINGS: `space.timings.persistDebounce` -> `persistDebounceMs` (default 300) and `space.timings.viewpointChangeDebounce` -> `viewpointDebounceMs` (default 250), resolved once from the merged configuration.
- PERSISTENCE (`subscribeStore` + `persistState`): gated on `useLocalStorage`; a store subscription marks dirty and debounces one write per `persistDebounceMs` (a drag emits a change per frame - serializing every frame is a real jank source). The pending write is flushed SYNCHRONOUSLY on `pagehide` (reload/navigation/close; bfcache- and mobile-safe where `beforeunload` is not) and on `visibilitychange: hidden`, and on unmount. `persistState` saves the versioned space snapshot via the engine's `state.local.save` and, when `onPersistContent` is supplied, the product's opaque content blob via `state.local.saveContent` (section 6, persistence contract).
- VIEWPOINT CALLBACK (`subscribeViewpoint`): only wired when `onViewpointChange` is supplied; debounced `viewpointDebounceMs`; encodes the camera and fires ONLY when the encoded string actually changed (store updates fire for non-camera changes too).
- `componentDidMount`: first restores persisted content (`state.local.loadContent` -> `onRestoreContent`, gated on `useLocalStorage`), THEN fires `onReady(api)` ONCE, post-mount, so the View has already subscribed the pubsub topics and a host can publish immediately. The api shape (verified at the `onReady` call site):

    ```
    { store, pubsub, getSnapshot: () => store.getState(), getViewpoint: () => encodeViewpoint(...) }
    ```

- `componentDidUpdate`: recomputes the store projection and dispatches `{ type: 'SET_STATE' }` with it (prop changes flow into state through the same compute path as mount).

### 3.2 The provider stack

`render()` nests, outermost first:

```
StyleSheetManager shouldForwardProp={isPropValid}     (@emotion/is-prop-valid)
  ReduxProvider store={this.store} context={StateContext}
    PluridView {...props} planesRegistrar pubsub      (the connected View)
```

- The `StyleSheetManager` filter exists because styled-components v6 no longer auto-filters props: engine-internal styled props (`transformMode`, `show`, `active`, ...) would leak onto DOM nodes.
- `StateContext` (`services/state/context`) is the engine's PRIVATE react-redux context. Every `connect(...)` in the adapter passes `{ context: StateContext }`. This isolates the engine store from a host application's own react-redux `<Provider>` - both can wrap the same subtree without either store hijacking the other's `useSelector`/`connect`.

### 3.3 PluridView and the nine hooks

`containers/Application/View/index.tsx` is a connected function component: it subscribes the full state plus derived slices (`mapStateToProperties`), binds ~20 dispatchers, attaches the raw `keydown` + `wheel` listeners (passive: false) on the view element — the keydown runs the shortcut dispatcher (`services/logic/shortcuts`, generated from the `PLURID_SHORTCUTS` table), the wheel runs `services/logic/input/wheel.ts` (`normalizeWheel` for `deltaMode`/trackpad classification, `wheelToDelta` for the policy: pinch/Ctrl zoom at the cursor — a trackpad pinch by an exponent per px (`gestures.trackpadPinchSensitivity`, ≈ ×3 over a whole pinch; a Ctrl + mouse notch keeps the notch step), modes and modifiers, `scroll-first` over scrollable plane content, `trackpadScroll` on empty space) into a SMOOTHED batcher (`createSmoothedBatcher`: each frame releases `gestures.wheelSmoothing` (0.6 per 60 Hz frame, scaled to the real frame time) of the still-pending pan / dolly / yaw / pitch / log-zoom and keeps the rest, so a wheel burst neither steps nor floats and lands exactly on its total; raw under reduced motion; a press cancels the tail). `normalizeWheel` keeps a `WheelHistory`: the device of a wheel STREAM wins, so a fast trackpad flick — 40–200 px deltas that look like mouse notches — stays a trackpad pan instead of becoming a zoom — and memoizes the `pluridContext` value (registrar, plane context, `defaultPubSub`, `registerPubSub`) so that planes

- which read it via `useContext` - do not re-render on every per-frame View render. The behavior lives in nine hooks, `containers/Application/View/hooks/` (the directory holds exactly these):

| Hook | Responsibility | File |
| --- | --- | --- |
| `useGrabMode` | grab/navigate mode: G toggles (a registry shortcut), Space holds (tracked here), Escape exits; both flags live in the `ui` slice; `grabModeRef` mirrors the effective value for live pointer/wheel handlers | `hooks/useGrabMode.ts` |
| `useCameraMotion` | the ONE rAF loop for programmatic motion: interruptible tweens (`interpolateCamera`, eased, reduced-motion aware) and time-based flings (velocity px/ms, `decay^(dt/16.67)`); every input calls `cancel()`; writes `state.space.motion` | `hooks/useCameraMotion.ts` |
| `useFlyControls` | first-person fly: registry hold-keys (WASD, E/Q, Shift sprint), time-based movement with normalized diagonals, loop only while a key is down, editable-target guard; pointer-lock look rotates about the EYE | `hooks/useFlyControls.ts` |
| `useViewResize` | `ResizeObserver` on the view (window `resize` fallback): debounced `setViewSize` + tree recompute | `hooks/useViewResize.ts` |
| `usePointerGestures` | native Pointer Events: a press resolves to ONE intent through `services/logic/input/gesture.ts` (`resolveGestureIntent`: planes-are-pages on content, orbit on empty space, right/middle/Shift pan, Alt dolly, modes and `buttonMap`); per-frame coalescing (`input/frame.ts`); auto-pivot under the cursor (`navigation.orbitPivot`); two-pointer pinch + pan; window-level pointerup/blur safety net; right-drag menu suppression; double-click frame; drag-to-move as ONE history transaction; release velocity → `motion.fling` | `hooks/usePointerGestures.ts` |
| `useTreeUpdate` | `treeUpdate`/`treeUpdateCallback`/`resolveLayout`: rebuild the tree from view + registered planes, re-attach runtime `planeID` + spawned children onto the relaid-out tree (keyed by route + ROUNDED location, so sub-pixel relayout drift cannot silently close spawned planes) | `hooks/useTreeUpdate.ts` |
| `usePluridPubSub` | the pubsub bridge: the bus registry + `registerPubSub`, subscribes the 35 control topics, re-publishes `space.transform` + `configuration` with `internal: true` (section 7) | `hooks/usePluridPubSub.ts` |
| `useCollaboration` | collaboration seam (on when `space.collaboration === true`): emits `COLLABORATION_MUTATION` on shared-arrangement change, applies `APPLY_REMOTE_MUTATION` with `meta.remote` | `hooks/useCollaboration.ts` |
| `useEngineEvents` | the engine->host observe channel: publishes `space.changed` `{ kind, value }` per watched slice; always on (publishing to a no-subscriber topic is free) | `hooks/useEngineEvents.ts` |
| `useViewpointURL` | opt-in URL binding for the camera: `restore` on mount (a deep-link overrides the persisted camera), debounced `replaceState` `write`; both default OFF | `hooks/useViewpointURL.ts` |

### 3.4 The structural tree

`View` renders `PluridViewContainer` (`containers/Application/View/Container/index.tsx`) when the view is non-empty. The container is where the OVERLAY SLOTS live:

```
PluridViewContainer
  PluridSpace                 components/structural/Space      perspective: 2000px, fade-in
    PluridRoots               components/structural/Roots      THE camera transform
      PluridRoot (per root)   components/structural/Root       one root plane + its spawned subtree (Roots and Root are `pointer-events: none` transform wrappers — their own boxes lie in the wall plane and took the clicks meant for planes behind it — planes are `pointer-events: auto`, bridges none)
        PluridPlane           components/structural/Plane      per-plane placement + chrome
          PlaneControls / PlaneContent / PlaneBridge           Plane/components/*
      PluridPlaneLinks        components/structural/PlaneLinks link beams (ride the camera)
      AlignmentGuides         components/structural/AlignmentGuides (ride the camera)
  PluridOrigin                transform-origin indicator
  Toolbar | Viewcube | Minimap | Shortcuts                     each replaceable (the minimap, 2026-09-05: a FIXED FRONT VIEW — world X across, Y down, always; `components/utilities/Minimap/logic.ts` fits `worldBounds` of the shown planes into the map and puts a dot at each `planeCenter`, farther planes smaller and dimmer, children smaller and joined to their parent, hits stacked by depth; the ring is the VIEWER — the camera eye, so it moves with every orbit / pan / zoom — clamped into the map, with a tick toward the pivot (`computeMinimapRing`; the separate pivot mark was removed 2026-09-05 — one more dot than planes and viewer read as a mystery). The old rule — Z vertical once any plane had depth, the eye inside the bounds — re-arranged the map when a child spawned and stacked coincident dots so a click framed the wrong root)
```

- OVERLAYS are `position: absolute` INSIDE the `position: relative` view (an embedded space keeps its minimap, viewcube, toolbar, shortcuts dialog and HUD inside its container; nothing is `position: fixed`), stacked by the one ladder in `plurid-react data/constants/zIndex.ts` (`Z_INDEX`), and marked `data-plurid-overlay` so a wheel over them never reaches the camera (the toolbar's button strip deliberately is NOT an overlay: a drag or a wheel on its background is the space's, as it always was; its drawer menu is). ACCESSIBILITY: the view is `role="application"` with an `aria-roledescription`; every engine control — toolbar buttons, viewcube arrows, fit button and face zones, minimap dots, the plane controls — is a real `<button>` with an `aria-label` and a `:focus-visible` ring (the viewcube's controls stay in the DOM and show on hover or keyboard focus); `PluridLiveRegion` announces the active plane, the selection size and the end of a camera move politely. The `SpaceDebugger` (`development.spaceDebugger`) is the performance HUD — fps, dispatches/s, planes mounted / hidden / frozen, camera, motion — and `PlaneDebugger` (`development.planeDebugger`) the per-plane readout (id, route, placement, size, depth, link).
- SLOTS: `renderToolbar` / `renderViewcube` / `renderMinimap` / `renderShortcuts` - when provided, each REPLACES the engine's default overlay at the same spot; the `elements.*.show` flags and `global.micro` still govern the defaults but a slot bypasses them (the host owns that element).
- `Roots` applies ONE inline style: `transform: spaceTransformMatrix` (from `selectors.space.getTransformMatrix`) and NO CSS transition — programmatic camera moves tween through the View's motion controller (one commit per frame, interruptible by any input), which a CSS transition on the camera would fight. It sizes itself via the opt-in `space.dimensions` (`resolveDimension`: number -> px, string passthrough; defaults width `'100%'`, height `window.innerHeight` - the historical behavior). It hosts `PluridPlaneLinks` and `AlignmentGuides` INSIDE the transformed container so beams and guides ride the camera.
- `Root` (per `TreePlane` in `state.space.tree`) deliberately subscribes to NOTHING (`mapStateToProperties` is empty) and is wrapped `connect(...)(React.memo(PluridRoot))`: with the tree immutable + structurally shared, an unchanged root's `plane` ownProp is referentially stable and the memo bails the re-render - this is what keeps per-frame work off the planes. It renders the root plane and recursively the SHOWN spawned children (a closed child takes its subtree out of the DOM; nothing hidden is mounted), and provides `PluridPlaneIDContext` at BOTH injection sites (the root plane and each child plane) - the context `usePluridPlane` reads. Each plane component receives the injected `plurid` prop: `{ plane: { value, planeID, parentPlaneID, fragments, parameters, query }, route, pubSub }`.
- The plane CONTROLS bar keeps the route on ONE line (its end visible, the start elided) and drops it entirely on planes narrower than 340 px (`COMPACT_WIDTH`), so a narrow plane shows icons only instead of a bar that wraps into three lines; the icon groups keep their size (`auto minmax(0, 1fr) auto`).
- `Plane` positions itself with a per-plane CSS transform built from `treePlane.location` (`translateX/Y/Z` px + `rotateX/Y` deg, `transform-origin: 0 0 0`). Width comes from `elements.plane.width`: a value `<= 1` is a fraction of the measured view width, `> 1` is absolute px. It subscribes to DERIVED per-instance booleans (`stateIsActivePlane`, `stateIsSelected`) rather than the raw shared strings - the raw `activePlaneID` changes on every hover over ANY plane, so subscribing to the string re-rendered all planes per hover; the boolean flips only for the two planes whose state changed. Its chrome: `PlaneControls` (address bar, isolate/refresh/close), `PlaneContent` (the consumer component), `PlaneBridge` (the visual parent->child bridge). During an ANIMATED RELAYOUT (`state.space.layoutTransition` > 0: a layout switch, a `view.addPlane`/`view.removePlane`, a `view` prop change) the plane's placement transform carries a CSS transition for that window — the one place a CSS transition is right (many independent plane transforms, not the camera) — instant under reduced motion. A registered plane may DECLARE its own `width` / `height` in px (`planes[].width` / `height`, the tuple's options too): it renders exactly that box (content taller than a declared height scrolls inside the plane — `PlaneContent` gets `overflow: auto`), the tree node is born `sizeMode: 'declared'` with those numbers, the layouts space by them, and a hand resize (`elements.plane.resizable`) overrides it; a declared width alone keeps the content-driven height.
- `PluridEmpty` (`components/structural/Empty`) renders in place of the space when the layout resolved to no planes; the `renderEmpty` slot replaces it.

### 3.5 The look (2026-09-06)

Every piece of engine chrome reads ONE set of design tokens, the look, and owns no colour, radius,
font size or opacity of its own ([DESIGN.md](./DESIGN.md)). The pieces: `@plurid/plurid-themes`
`looks/` — `LookBase` (scheme, space, surface, ink, accent, fonts, grid, vignette) → `deriveLook` →
`LookTokens` (44 tokens, `LOOK_TOKENS` is the table the docs are generated from), twelve preset bases
(`LOOK_BASES`, `looks`), `themeFromLook` (the legacy `Theme` a look implies), `LEGACY_LOOKS` (the old
theme names → the nearest preset), the colour helpers (`parseColor`, `withAlpha`, `mix`, `contrastRatio`).
The engine resolves `global.look` once per configuration object (`general/look` `resolveLook`: a name,
a base, or `{ preset, tokens }`, identity-memoised) and derives `state.themes` from it unless the host
set a `theme`. The View emits the tokens as one scoped `<style>` (`services/look` `lookStylesheet`:
`[data-plurid-application="<id>"] { --plurid-…: … }`, specificity 0,1,0 so host CSS wins) and carries
`data-plurid-application` / `data-plurid-look`; a runtime `configuration` message re-emits it; the server
renders it with the page. The vocabulary lives in `services/styled/chrome.ts` (`chromePill`, `chromePanel`,
`chromeLine`, `chromeKey`, `chromeRoot`, `chromeDocked`) and is exported as components (`PluridPill`,
`PluridPanel`, `PluridIconButton`, `PluridKey`) and fragments (`internals.chrome`); the space draws the
ground and the grid from the tokens (`Space/styled.ts`). The chrome mode (`elements.chrome`:
`full` / `minimal` / `none`, `services/chrome` `showsChrome`) gates the defaults in the view container, the
planes, the marquee and the guides; every `render*` slot is called with the chrome context (the look,
the live camera, the docked page, the presentation, the selection, the history, the configuration, the
bus), the plane-level slots (`renderPlaneControls`, `renderPlaneBridge`) with the plane and the frame-stable
part of it through the engine context. Verification: `plurid-themes` (derivation, contrast per preset),
`plurid-engine` `look` (resolution, legacy names), `plurid-react` `services/look` (the stylesheet, the three
forms end to end, the runtime switch) and `services/chrome` (the modes, the slots, `useLook`), the server's
page test (the block ships with the HTML), `chrome.spec.ts` (the host-CSS guarantee on two looks, the headless
fixture, the minimal mode, the plane-bar slot), the visual baselines (`columns-paper`, `page-revealed-paper`,
`columns-headless`), `?gallery=looks`.

## 4. The camera and transform model

The camera is a first-class value, `state.space.camera` (`CameraState`, defined in plurid-data `interfaces/internal/camera`), and the pure math lives in the engine's `modules/interaction/camera/` (`interaction.camera`):

```
CameraState = { yaw, pitch, scale, pivot: Vec3, offset: Vec3, perspective }
M = T(C + offset) · Rx(pitch) · Ry(yaw) · S(scale) · T(−pivot)        C = view center
```

- `pivot` is the WORLD point orbit and zoom act about; `offset` is where that pivot sits in camera space relative to the view center — `x`/`y` are the screen-space pan, `z` the dolly (positive = closer to the eye).
- Pan is applied AFTER the rotation, so it is screen-exact at any orientation (`panBy` scales the delta by the perspective factor at the pivot depth so the content on that plane follows the pointer 1:1). Orbit changes only `yaw`/`pitch` and leaves the pivot fixed on screen. `setPivot` is a lossless re-parameterization (`offset' = offset + R·s·(pivot' − pivot)`), which is how "orbit about the point under the cursor" works: re-pivot, then rotate.
- Zoom is multiplicative through ONE function, `zoomAt(anchor, factor)`, exact for everything on the pivot-depth plane at any yaw/pitch/dolly (the wheel, the pinch, the drag-zoom, the toolbar and the keys all reduce to it). `yaw` is wrapped to (−180, 180], `pitch` clamped to ±`navigation.pitchLimit` (89), `scale` to [`zoomMin`, `zoomMax`], the dolly kept in front of the eye (`clampCamera`).
- The rotation is the explicit CSS turntable `Rx(pitch) · Ry(yaw)` (`rotationXMatrix`/`rotationYMatrix` are pinned to the CSS `rotateX`/`rotateY` definitions by tests); no quaternion on the camera path.
- The CSS `perspective` on `Space` is `camera.perspective` (config `space.perspective`, finally read), with `perspective-origin: 50% 50%` — the vanishing point is the view center, which is also the pivot frame, so an orbit pivots instead of shearing. `project`/`unprojectAtCameraZ`/`pickPlanePoint` reproduce the browser's projection for hit-testing and framing; `framePlane`/`fitAll` compute a framing camera from the MEASURED plane extents (a bisection on the zoom, so perspective is honored).

THE COMMIT PATH: every camera mutation in the space slice ends in `commitCamera(state, next)` (`services/state/modules/space/index.ts`): clamp → store `camera` → mirror the six legacy scalars → render `transform` via `cameraMatrix3d`. Nothing else writes `transform` or the scalars. The legacy reducers (`rotateXWith`, `translateYWith`, `zoomAtPoint`, `setSpaceLocation`, `spaceFitToView`, …) are thin wrappers that build a `CameraDelta` (or re-derive the camera from the scalars) and commit; the new reducers are `applyCameraDelta`, `setCamera`, `setCameraFromLegacy`, `setPerspective`, `setCameraLimits`, `setMotion`, and `setPlaneSize`.

THE LEGACY SCALARS (`rotationX/Y`, `translationX/Y/Z`, `scale`) remain on state as READ-ONLY MIRRORS (an exact alternative parameterization with the pivot at the view center — `interaction.camera.toLegacy`/`fromLegacy`, proven equivalent to the historical matrix by a golden test). `setViewSize` re-derives the camera from them about the new center, so a resize keeps the picture anchored at rotation 0 exactly as before.

THE PER-FRAME PATH: pointer event → a camera action → the space reducer commits the camera and the matrix → react-redux notifies → ONLY `PluridRoots` re-renders (it is the only component subscribed to the matrix); `Root` is memo-bailed, planes untouched. Zero per-frame JS on planes, zero per-frame layout work. `Roots` carries `will-change: transform` only while `state.space.motion` is not idle.

CULLING AND DEPTH CUES (`useCulling`, at most one pass per 100 ms after a camera commit or a tree change): `plurid-engine modules/space/view/culling.ts` : `cullPlanes` decides which shown planes stop painting — every projected corner outside the view expanded by `space.culling.frustumMargin`, or the center farther from the EYE than `space.culling.distance` — and which are frozen (farther than `freezeDistance`, still painted, contained); both thresholds carry hysteresis against the previous result, and the active, selected, isolated and focused planes are never culled. The result is `state.space.culled` (written only when it changes); a hidden plane keeps its React state and gets `data-plurid-culled="hidden"` (`visibility: hidden`, `pointer-events: none`, `contain: layout paint style`), a frozen one `data-plurid-culled="frozen"` (`contain: layout paint style`, its `ResizeObserver` stops reporting); `usePluridPlane()` exposes `culled` / `frozen` so a plane can pause video or polling while unseen. Distances are camera-space from the eye, so a plane at the pivot depth sits at `perspective` (2000) — defaults `freezeDistance` 3500, `distance` 6000; off unless `space.culling.enabled`. With `elements.plane.depthFade` the same pass writes `--plurid-plane-depth` / `--plurid-plane-fade` / `--plurid-plane-blur` on each plane element (no store churn) and the plane's stylesheet fades/blurs with them; `elements.plane.backface: 'hidden'` stops painting planes seen from behind.

BENCHMARK (`?planes=N&bench=1`, `fixtures/render-test/e2e/bench.spec.ts`): a scripted orbit + pan + zoom of 240 frames with one camera delta per frame, at 40 / 100 / 500 planes in ONE test (same machine, same state); the harness reports `__rtBench = { bootMs, firstFrameMs, p50FrameMs, p95FrameMs, maxFrameMs, dispatches, frames }`. ALWAYS asserted: one camera commit per frame (dispatches ≤ frames + 12), no stalled frame (max ≤ 500 ms), and sub-linear scaling relative to the 40-plane p50 measured in the same run (100 planes ≤ 3×, 500 planes ≤ 8×) — the properties a regression breaks on any machine. ABSOLUTE p95 budgets (40 → 40 ms, 100 → 50 ms, 500 → 100 ms) are a property of the machine (a CI runner is several times slower than a development laptop) and are enforced only with `BENCH_STRICT=1`; the numbers are always attached to the report. Measured 2026-09-03 in headless Chromium on the development machine: 40 planes p95 17 ms (p50 8.4), 100 planes p95 17.5 ms (p50 8.4), 500 planes p95 33 ms (p50 16.7); the GitHub runner measured ~100 ms p95 at 500 planes.

MEASUREMENT: every `Plane` runs a `ResizeObserver` and writes its untransformed `offsetWidth/Height` into the tree through `setPlaneSize` (equality-gated, structurally shared via `space.tree.fields.updateTreePlaneFields`), so `TreePlane.width/height` are real — fit-to-view, framing, the link beams and the minimap read them. The view element is observed too (`useViewResize`), so an embedded space re-centers when its container resizes.

THE MOTION PATH: every NON-GESTURE camera move is `cameraCommand(kind, options)` (`services/logic/camera`, also under `services/state/thunks/camera.ts`) — `frame` (a plane / the selection / everything), `fit`, `reset`, `home`, `preset`, `bookmark`, `viewpoint`, `delta` — which resolves the target camera from the live state (pure `resolveCameraTarget`) and commits it through `commitCameraTarget`: an interruptible tween on the View's motion controller (`useCameraMotion`: one rAF loop for tweens AND momentum flings, `interpolateCamera` with shortest-arc yaw and geometric zoom, easing/duration from `navigation.motion`, instant under reduced motion) or, without a mounted View or with `animate: false`, one `setCamera` jump. Thunks reach the controller through the store's THUNK EXTRA ARGUMENT (`services/state/extra.ts`: `PluridThunkExtra.motion`, created with the store by `PluridApplication`, filled in by the View while mounted). Navigation (`navigatePlane`: link spawn, Alt+F/B, roots, minimap, `navigateToPlane`), the viewcube faces/arrows/fit, the toolbar, the shortcuts, double-click and the `space.frame` / `space.cameraDelta` (`animate`) / `space.fitToView` / `space.resetTransform` / `space.setViewpoint` (`animated`) topics all go through it; any pointer, wheel, key or gamepad input cancels the tween where it is (no snap). The controller keeps its OWN record of the motion it last dispatched (`motionRef`): `stateRef` is assigned at render time, so within one synchronous retarget (`stop()` then a new tween) comparing against the store alone skipped the `tween` after the `idle` and left the store `idle` for the whole retargeted tween (2026-09-06); a retarget to the SAME pose keeps the running tween instead of restarting it. `state.space.motion` (`idle | gesture | fling | tween`) is observable as `space.changed` kind `motion`.

### 4.1 Docking and the page presentation

`space.presentation: 'page'` makes the space present as a SITE (2026-09-05, polished 2026-09-06). It is ONE knob with three defaults layered under the caller's configuration in `merge()` (`pagePresentationDefaults`: `fadeInTime: 0`, `opaque: false`, `elements.plane.height: 1`; a value still AT the space default counts as unset, so a runtime switch gets them too) and ONE derived state, the docked page. There is no mode flag.

**The pose is the state.** `elements.plane.height` (flat `planeHeight`; ≤ 1 a fraction of the view height, > 1 px) is the general mechanism: the height every UNDECLARED plane renders at (`space/layout/size.ts` : `configuredPlaneSize`, the one definition the Plane and the layouts read), so in the page presentation every plane is view-sized. The camera DOCKS on a page (`interaction/camera/dock.ts`): `dockPose` = yaw −rotateY, pitch −rotateX, scale 1, pivot the plane center, offset 0, never pitch-clamped (a `rotateX: ±90` page docks face-on) — with `M = T(C+offset)·Rx·Ry·S·T(−pivot)` a view-sized plane then maps to view px 1:1, so at boot the identity camera IS the dock pose of root 0 and no fit runs. `isDocked` is "the camera IS the dock pose of this plane": scale 1, yaw = −rotateY, pitch = −rotateX within `DOCK_TOLERANCE` (1e-3), and the plane's CENTER projected within `docking.epsilon` (0.5 px) of the view center AT THE PIVOT DEPTH (`projected.cameraZ`) — two parallel pages a few hundred units apart project to the same point and are told apart by depth; the picture is compared, not the parameters, because zoom-at-cursor and the cursor pivot re-parameterize pivot/offset losslessly. A glossary: DOCKED (the camera is on a page), DESTINATION (the page a running swing lands on), CANDIDATE (`dockCandidate`: the shown page whose projected center is nearest the view center — what `space.dock` without a plane docks; a hidden root hides its subtree).

**The geometry a page docks by.** `dockGeometry(plane, configured)`: a declared or manual size is the plane's own; a MEASURED size is only an observation of the configured one (it lags a frame behind a view resize and starts at 0), so a configured dimension wins over it — without this the boot and every resize flashed the chrome for one frame. `findDockedPlane` computes one camera matrix, early-exits on `scale ≠ 1` (an orbit or a zoom walks no tree) and walks the shown tree; `revealPose(dock, limits, reveal)` is the dock pose pulled back and tilted by `docking.reveal` (`REVEAL`: scale 0.75, pitch −24, yaw 0 — looking DOWN on the page, its top nearest; the user's pick from rendered candidates, 2026-09-06).

**The derived state.** The memoized selector `getDockedPlaneID` (camera + tree + view + the docking configuration; `''` outside the presentation) surfaces as ONE DOM attribute, `data-plurid-docked="<planeID>"` on the View: CSS does every chrome fade (`chromeDocked` in `services/styled/chrome.ts` — instant on dock, because a site must never flash its 3D chrome, `--plurid-dock-fade` (`docking.fade`, 240 ms) in on the reveal), and the wheel rule (`WheelContext.docked` → `scroll` when the page can scroll, `consume` when it cannot: a plain wheel over a docked page is the page's and never reaches the host document; pinch, Ctrl, Shift, Alt and grab still move the camera), Escape, G, the rail and the plane's focus grab (`docking.focus`) read the same selector. `frameTargetForPlane` returns the dock pose instead of a fitted frame, so EVERY framing path docks (the frame control, a link, `navigateToParent`, `onClose: 'parent'`, the arrows, the minimap, `space.frame`) while `fit` still fits, a legitimate undock. `CameraCommand` has `dock` (that plane, else the docked one, else the candidate) and `reveal`; topics `space.dock` `{ planeID?, animate? }` / `space.reveal` `{ animate? }`; `useCamera` / the handle / the `usePluridPlane` lens expose `dock`, `reveal`, `docked` (the lens also `aside` and `presentation`); `space.changed` kind `docked`. The wheel's smoothed tail is dropped when a page docks and never fights a tween. The rail (`PluridDockRail`, the page's own affordance, left to right: fit (the globe) · a `dock-back` chevron when the docked page has a parent · the `dock-toggle` corner control at the far right, 32 px pills with a 16 px margin, a halo and a backdrop blur so they read on any page, a two-tone focus ring — `chromePill` in `services/styled/chrome.ts`, the one look the `?` trigger shares) has its own `renderDockRail` slot and `elements.dockRail.show`; the viewcube is the cube again and `renderViewcube` no longer removes the page's affordance. The controls bar hangs ABOVE the sheet (`top: -PLANE_BAR_HEIGHT`) and is the plane's top: it moves with the sheet and is clipped with it when that top leaves the view, never sliding (the user's rule, 2026-09-06); the content scroller gets `tabIndex -1` and the focus when its page docks (a next-frame retry if it is not mounted yet), so PageDown / Space / the arrows / Home scroll it — inside plane content those keys are the page's, never shortcuts.

**Docking controls** (`space.docking`, 2026-09-06). `commitCameraTarget` — the one exit of every programmatic move — learns whether the target LANDS DOCKED (`landingDockPlaneID`: the page presentation and `findDockedPlane` on the target) and records a docking tween's destination in `state.space.dockingPlaneID` (written only when a tween actually started; cleared by `setMotion` whenever the motion leaves `tween`); a jump cancels the running motion before it commits, and `tweenTo` returns whether a tween started and carries `onSettle` across a retarget (the focus grab after a link rides it; no timer).

| | `chrome: 'hidden'` (default) | `chrome: 'shown'` |
| --- | --- | --- |
| `motion: 'swing'` (default) | the pages swing, nothing else appears: the destination counts as docked for the whole tween (`getDockedPlaneID` falls back to it while `motion === 'tween'`) | the space shows during the swing, the page docks at the end |
| `motion: 'instant'` | a link, a child's back, `onClose: 'parent'`, Escape and `space.dock` jump, like a router rendering the new page | the same jump; the reveal keeps its motion in every cell |

The docked STATE stays derived; what is stored is the tween's destination, the one fact about a tween the camera cannot tell yet. The motion controller keeps its own record of the motion it dispatched (`motionRef`), so a synchronous retarget dispatches `tween` after `idle`; a retarget to the SAME pose keeps the running tween.

**The lineage** (`docking.aside`, 2026-09-06). While a page is docked (or a swing is docking) only its lineage is shown — `getDockedLineage` (a memoized `Set` from the docked id and the tree: `computePath` ancestors + the page + `collectPlaneIDs` descendants; empty under `aside: 'none'`) and the per-plane `makeGetIsPlaneAside` (false for an id the tree does not hold). A plane outside it carries `data-plurid-aside`, is `inert`, and fades through the inline opacity it already owns (`--plurid-dock-fade` both ways, `visibility: hidden` after it, none under reduced motion). Two links in one header spawn two parallel view-sized pages a few dozen pixels apart, and the one opened last would otherwise cover the one clicked; a root-to-root dock fades the source root from the first frame (roots are not each other's lineage). ON A PAGE A LINK IS A LINK: `toggleLinkPlane` never closes while the camera is DOCKED on a page (`getDockedPlaneID`, the docking destination included — an open link navigates to its page); with the space revealed the toggle is back, as in the space presentation (the user's refinement, 2026-09-06).

**The followed page** (2026-09-06). A page's dock pose moves with its geometry — a resize resizes every page and relays the roots, a re-measured link relocates a spawned page, a restore brings last session's geometry, a measurement corrects a fallback — and the camera that was docked on it (or docking toward it) ONE COMMIT AGO is re-docked by the View (a jump, or the running swing retargeted): `dockedBeforeRef` is written by an effect declared after the follow effect, so the follow reads the previous commit's page and compares the page's geometry signature, never the camera (a user move is not followed). A resize mid-swing and a persisted reload both used to re-dock with stale geometry (the link re-measured after the re-dock; the store booting at the 771×764 fallback re-pivoted a camera framed for 1280×800): the space snapshot now persists `viewSize` — the camera is framed in view coordinates, so a camera without the view it was framed in is ambiguous — and `resolveSpace` starts the store at it, so a restored page is docked from the first frame. TOUCH: a touch inside content is declined (one finger is the page's, the browser scrolls it); `usePointerGestures` remembers declined touches while they are down, and a second finger over one starts a pinch — two fingers are the space's, the pinch that reveals a page (in the space presentation too).

**SSR.** The server renders the identity camera, so the HTML is the docked page with the chrome hidden by the stylesheet it ships (`plurid-react-server` `page.test.tsx`).

**Verification.**

| Where | What |
| --- | --- |
| `plurid-engine` `camera/__tests__/dock.test.ts` | the dock pose, `isDocked` (a pixel, a degree, a re-pivot, a small page, two parallel pages, a stale measurement), the candidate, the reveal |
| `plurid-engine` `configuration/__tests__/presentation.test.ts`, `flatCompleteness.test.ts` | the page defaults (a host's value wins, a runtime switch), every flat key reaches its nested path |
| `plurid-react` `command.test.ts`, `camera.test.ts`, `planes.test.ts`, `useCameraMotion.test.tsx`, `pagePresentation.test.tsx` (on `testing/fixtures.ts` + `testing/store.ts`) | framing docks, the destination and the controls, the selector mid-tween, the lineage (an orphan too), a link is a link, the retarget, `onSettle`, the DOM (view-sized, docked, aside + inert), a pinch inside content, the followed page |
| `plurid-react-server` `page.test.tsx` | the HTML is docked |
| `fixtures/render-test/e2e/page.spec.ts` (33 scenarios) | the boot without a frame of chrome, the wheel and the keys, a pinch (Ctrl + wheel, two fingers), the corner control, links / back / a grandchild / Escape twice, the leash, the docking controls frame by frame, the aside, a resize (idle and mid-swing), a persisted reload, the render slots, a root-to-root dock, reduced motion, the host document never scrolling, the bar on screen after a small undock |
| the `visual` project | the ten `page-*` baselines of the catalog (`docs/HARNESS.md`) |

HOME, PRESETS, BOOKMARKS: `navigation.home` / `navigation.presets` (configured, encoded viewpoints), `state.space.home` (runtime, `space.setHome` — the current camera when no viewpoint is given) and `state.space.bookmarks` (runtime, name -> encoded v2 viewpoint; both persisted in the space snapshot); topics `space.home`, `space.setHome`, `space.preset` `{ name }`, `space.bookmark` `{ name, action: go | save | remove }`; the `home` shortcut (Home; `0` fits); the viewcube fit button: click fits, ⌘/Ctrl-click goes home, Alt-click sets home, Shift-click resets. `space.changed` kind `bookmarks`.

GAMEPAD (`gestures.gamepad`, opt-in, `useGamepad`): left stick pans (flies in first person), right stick orbits (looks), triggers zoom (dolly), A fits, Y goes home, B undoes; dead zone + response curve, dt-based so the speed is frame-rate independent; polled only while enabled and a pad is connected.

KEYS AND MOTION: the view's `keydown` handler cancels any tween or fling BEFORE the shortcut runs (any key on the space is an input) — never after, or a shortcut that starts a tween (Alt+1…9 to a root, Alt+F, Home, the arrows) would lose its own tween on the same keystroke and only the active-plane highlight would land.

Navigation modes: grab mode (G arms ONE grab — the drag's release ends it, `finish` in `usePointerGestures`; G again or Escape cancels an unused one; Space held grabs for as long as the hold, `useGrabMode` — from inside a page's content too once the space is revealed; docked, Space inside the content scrolls the page) turns the primary drag into pan-navigation — and A PRESS THE ENGINE TAKES IS THE ENGINE'S: its `pointerdown` default is prevented whatever it landed on (no native selection is anchored — an orbit from the empty space around a page used to drag a selection into its text — clicks still fire, and a press from outside the view focuses it), while the View carries `data-plurid-navigating` in a navigation mode and `data-plurid-motion='gesture'` during a drag, under which a plane's text is `user-select: none` (2026-09-06); fly mode (`space.firstPerson`) enables `useFlyControls`, whose look rotates about the EYE (`lookBy`) and whose movement is camera-relative (`flyBy`, forward respects pitch). Gesture mapping, sensitivities, drag threshold and momentum are `space.gestures` knobs (see CONTROL_SURFACE).

THE VIEWPOINT CODEC (`services/logic/viewpoint`): two encodings, both always accepted on decode.

- v1 — `encodeViewpoint(transform)` → `"rX,rY,tX,tY,tZ,s"` (the six legacy scalars, 4 decimals): what existing share links carry, exact for the rendered picture with the pivot at the view center. The DEFAULT output of `getViewpoint()`, `onViewpointChange` and the URL binding.
- v2 — `encodeCameraViewpoint(camera, view, 2)` → `"v2|yaw|pitch|scale|px|py|pz|ox|oy|oz|d"`: the full camera, preserving the orbit pivot and the pan. Opt in with `space.viewpointURLVersion: 2` or `getViewpoint({ version: 2 })`.
- `decodeViewpoint(string, view?)` → legacy scalars (a v2 string is reduced through `toLegacy`); `decodeCameraViewpoint(string, view, perspective?, limits?)` → `CameraState` for either version (the application's own perspective wins over a v2 string's). Malformed strings decode to `null` and are ignored.

URL binding (`useViewpointURL`, config knobs on `space.*`): `viewpointURLWrite` and `viewpointURLRestore` BOTH default false; `viewpointURLParam` defaults `'v'`; `viewpointURLDebounce` defaults 400 ms for the `replaceState` write (path, other query params and hash preserved; no history spam). Programmatic control rides the `space.setViewpoint` topic (v1 or v2, `animated` optional), `space.cameraDelta` (one `CameraDelta`, `animate` optional) and `space.frame` (`{ planeID? | selection? }`, everything when neither); programmatic observation rides the debounced `onViewpointChange(viewpoint)` prop and the synchronous `api.getViewpoint()` - deliberately NOT the `space.changed` channel, because the camera changes per orbit frame.

Persistence: the camera, the view size it was framed in (2026-09-06: `resolveSpace` starts the store at it, so a restored camera is consistent until the first real measurement, which re-pivots it the way a live resize does), the bookmarks and the runtime home are stored in the versioned space snapshot (`PERSISTED_STATE_VERSION = 3`); a v2 snapshot (scalars only) is upgraded on load by deriving the camera from its scalars.

## 5. Plane lifecycle: registration -> tree -> layout -> render

### 5.1 Registration and matching

Planes enter through two props: `planes` (`PluridReactPlane[]`: `{ route, component }`) and `routes` (route definitions whose spaces/universes/clusters carry planes - the pluriverse-era full shape). Registration is the engine's `planes.Registrar` (re-exported by the adapter as `PluridPlanesRegistrar`, `plurid-react source/services/engine/index.ts`): a map from resolved plane route -> `{ component, route }`, filled by `registerPlanes` on every `computeStore()` pass (browser) or once per server (SSR shares one registrar via the `planesRegistrar` prop).

Matching is the engine's `routing` module: `IsoMatcher` (exported as `PluridIsoMatcher`) matches a URL against routes and route-planes isomorphically (same code server and client); `RouteParser` (exported as `PluridRouteParser`) parses parameterized route patterns. The adapter adds `getDirectPlaneMatch` (`services/logic/router` : `getDirectPlaneMatch`): given a matched path, find the route-plane (or top-level plane) it addresses directly - the SSR entry for "this URL IS a plane".

### 5.2 The plane tree

The space's content is `state.space.tree: TreePlane[]` - roots with recursive `children`. It is computed by the engine (`plurid-engine source/modules/space/tree`): a `Tree` class (`object.ts`) over pure functions (`logic.ts`: `computeSpaceTree`, `updateTreeWithNewPlane`, `updateLinkCoordinates`, `togglePlaneFromTree`, `getTreePlaneByID`, `removePlaneFromTree`, `reconcileTree`, ...; `fields.ts`: `updateTreePlaneFields`, `findPlaneByLinkID`, `collectPlaneIDs`, `pruneLinks`; `location/child.ts`: `childLocation`, `resolvePlaneAngle`, `recomputeSubtree`, `recomputeTree`, `planeDepth`). Tree mutations are IMMUTABLE + STRUCTURALLY SHARED (`reconcileTree`): untouched subtrees keep their references, which is the invariant the whole render-perf model (3.4's memo bailouts) and the history middleware's cheap snapshots (6) lean on.

`TreePlane` essentials (`plurid-data source/interfaces/internal/tree` : `TreePlane`): `sourceID` (the registered plane it instantiates), `planeID` (the runtime instance id), `parentPlaneID`, `route`, measured `width`/`height` (+ `sizeMode`: `measured` | `manual` (a hand resize) | `declared` — the registered plane's own `width`/`height` in px, the node's size from the start; a measurement fills an undeclared dimension, a hand resize overrides it), `location` (`translateX/Y/Z`, `rotateX/Y`), `show`, `children`, `bridgeLength`/`planeAngle`/`bridgeSide`/`linkCoordinates`/`spawnedByLinkID` (spawn geometry — the edge the bridge leaves from included — and the identity of the link that spawned it), and `manuallyPositioned` - set when the user drags a plane; auto-layout then leaves it pinned (its location carries across relayouts) and arranges only the un-pinned planes.

### 5.3 Layout algorithms

`plurid-engine source/modules/space/layout/` contains exactly five algorithms plus the index (and `pitch.ts`, the per-column / per-row helper: since 2026-09-05 `column` / `row` / `zigZag` place by PER-COLUMN widths and PER-ROW heights — each column as wide as its widest plane, a declared or measured width (the configured width for an unmeasured one), each row as tall as its tallest (the tallest measured plane, else the view height, for an unmeasured one) — so mixed declared sizes pack without overlap and unmeasured planes keep the uniform grid of before; `faceToFace` spaces a row by each plane's own width and stacks rows by their tallest plane; `sheaves` is a cascade whose placement ignores plane sizes): `column.ts`, `row.ts`, `sheaves.ts`, `faceToFace.ts`, `zigZag.ts` (exported as `computeColumnLayout`, `computeRowLayout`, `computeSheavesLayout`, `computeFaceToFaceLayout`, `computeZigZagLayout`). They are selected by `configuration.space.layout.type` against the `SPACE_LAYOUT` enum (`plurid-data enumerations` : `LAYOUT_TYPES`): `COLUMNS`, `ROWS`, `FACE_TO_FACE`, `ZIG_ZAG`, `SHEAVES`, plus `META` (layout carried by the route metadata rather than one of the five). Each algorithm reads its own fields off the layout object (e.g. `columns` + `gap`; `angle`; `depth` + offsets) and computes plane spacing FROM THE MEASURED VIEW SIZE (`state.space.viewSize`, passed in as `viewSize` - never `window.innerWidth`) - which is why `space.dimensions` (8) sizes the container only. The column / row PITCH comes from the planes' MEASURED sizes when they have them (the widest root's width, the tallest root's height), falling back to the configured width and a view-height row, so planes never overlap their neighbors — a hand-resized or wider-than-configured plane pushes the next column. The View relays the roots whenever the MEASURED view size changes (`layoutViewSizeRef` effect: the first real measurement after the startup fallback, a container resize, a sidebar toggle) — previously only a window `resize` did, so a space measured after its first layout, or restored from a snapshot laid out for another size, kept a stale pitch. `space.center` (config; flat `center`) pans a FRESH space once, when the state's view size is the element's and the first root is measured, so the first root's center sits at the view center.

### 5.4 Spawn, close, links, selection

- SPAWN: `PluridLink` (`components/links/Link`) - the in-space anchor. THE TREE IS THE SINGLE SOURCE OF TRUTH for a link's state: a link has a stable identity (`linkID` prop, else `<parentPlaneID>#<route>#<ordinal>`, the ordinal being its index among the links to the same route inside the plane, DOM order), the plane it spawns records it as `TreePlane.spawnedByLinkID`, and the link's open/closed state and target plane are DERIVED from the tree (`space.tree.fields.findPlaneByLinkID`) - never held in component state, so undo, a host `setTree`, a relayout or a collaboration apply keep every link in step. A click dispatches the `toggleLinkPlane` thunk (`services/state/thunks/planes.ts`): absent -> `updateTreeWithNewPlane` (the spawned plane id is `<route>@<digest of the link id>`, deterministic and uniqued against the tree) then navigate; present -> `togglePlaneFromTree`. Geometry is ONE function, `space.location.childLocation(parentLocation, linkCoordinates, bridgeLength, planeAngle, bridgeSide, childWidth, bridgeOffset)`: the child sits at the end of a bridge from the link point — its TOP (the top of its controls bar) half a strip above the link's midline, so the bridge is centred on the link's line and flush with the plane's top (`TreePlane.bridgeOffset`, `resolveBridgeOffset`: `−BRIDGE_STRIP_HEIGHT / 2`, plus `PLANE_BAR_HEIGHT` on a page where the bar hangs above the sheet; stored with the spawn geometry, 2026-09-06) — turned by `planeAngle`, applied the SAME way every generation by default (`space.bridge.fan: 'fixed'`: each child turns 90° to the right of its parent and hangs behind its parent's face, exactly like the first link off a root — the user's rule, 2026-09-05; `'alternate'` flips the sign by generation so a grandchild faces the way its grandparent does), and whose FIRST sign is the growth direction (`space.bridge.direction: 'backward'` (default) | `'forward'`): backward starts POSITIVE — CSS `rotateY(θ)` turns local +X toward −Z for a positive θ — so a chain grows DEEPER, behind the wall its root sits on (the space is explored by going in; in a wall layout a grandchild can therefore sit behind the neighbouring roots and be seen, and clicked, only through the gaps between them until the camera goes around or in — Chrome paints and hit-tests exactly that geometry, verified 2026-09-05); forward starts negative, the chain grows out of the wall toward the viewer. a generation hangs off its parent's LEFT edge on the side the fanned angle turns to — a grandchild sits on the side its parent fin faces, like the original engine (the user's choice, 2026-09-05). With `space.bridge.keepBehind` the generations that would hang on the side their parent faces are MIRRORED to the other side of the link — `TreePlane.bridgeSide: 'end'` (`resolveBridgeSide`), the bridge leaves the child's right edge and the child's origin sits `bridgeLength + width` back along its own axis (placed with the spawn's `fallbackWidth` until measured; `setPlaneSize` re-places it) — so every generation lies behind its parent's face; `bridgeLength`/`planeAngle`/`linkCoordinates` are stored on the node and `recomputeSubtree` re-places a whole subtree from its (moved) root - after a drag, a snap, a relayout, or a re-measured link. The link measures where it sits on its plane through the `offsetParent` chain (`services/logic/link/measure.ts`; layout offsets, never transformed rects) and re-measures on plane-size, view-size and link-size changes through the equality-gated `updateLinkCoordinates` reducer (an unchanged measurement dispatches nothing). `useTreeUpdate` carries spawned children across relayouts keyed by IDENTITY (`sourceID@route`, in order for duplicates) and re-places them from the root's new location. The rendered bridge reads the node's own `bridgeLength`, so a configuration change never detaches existing bridges; it is DECORATION (`pointer-events: none`) — seen nearly edge-on, a bridge's hit box landed over its parent's links (2026-09-05).
- ON A PAGE A LINK IS A LINK (2026-09-06): while the camera is docked on a page `toggleLinkPlane` never closes — a click on an open link navigates to its page (the Alt-click path); revealed, and in the space presentation, the toggle closes it.
- A SCROLLED LINK, THE LEASH (2026-09-06): the measurement is CLAMPED into the visible box of every clipping ancestor (a scroller, `overflow: hidden`), so a link beyond the fold anchors AT the fold and its child never leaves the sheet; and on scroll the child does not move at all — `Link` re-measures per frame through a capture `scroll` listener on the plane (no store dispatch) and writes `--plurid-bridge-reach` / `--plurid-bridge-angle` on the child plane element, which the bridge's stylesheet turns into a LEASH: the segment from the child's edge to the link's current point, drawn as a band across an axis-aligned box exactly one bridge length long (angled gradients, never a rotated element: a plane's layer bounds include its bridge, and a layer crossing the parent's plane is split by the browser's 3D sorting, which dropped the child's bridge and controls bar whenever the leash tilted — Chrome, 2026-09-06), resting at the fold (`services/logic/link/bridge.ts` `bridgeGeometry`; vertical displacement only — a horizontal one would leave the child's plane).
- CLOSE / REOPEN: `space.closePlane` / `space.openClosedPlane` topics or the plane controls, through the `closePlane` / `openPlane` / `openLastClosed` thunks (deep lookups - spawned children answer too) and the `setPlaneShow` reducer; hiding a plane hides its subtree and records `lastClosedPlane`; the toggle path-copies (siblings keep their references). Closing the plane IN VIEW (the active one, the isolated one, or the one under the view center — `planeCoversViewCenter`) hands the camera to its parent (`space.navigation.onClose`, default `parent`; the topic / `tree.close` / `usePluridPlane().close` take a per-call `navigate`), so a view never rests on the empty spot a plane left. REOPEN (a link click, `openLastClosed`): a closed plane is unmounted, so its measured size and its link's coordinates froze at the moment it closed — the click's fresh measurement relocates the subtree BEFORE the toggle, the frame targets the best-known geometry, and `PluridThunkExtra.pendingFrame` makes the plane's first measurement (`reportPlaneSize`, the plane's ResizeObserver path) re-frame from the measured size (never during a gesture / fling). A view resize re-derives hidden, non-manual planes' sizes from the fallback (`refreshHiddenPlaneSizes`) so bridges and the minimap stay honest while a plane is closed. This was hypod's "back button off-screen after resize + reopen" (2026-09-05).
- LINKS: `state.space.links: PlaneLink[]` is an adjacency list, edited by the `addPlaneLink`/`removePlaneLink`/`updatePlaneLink`/`setPlaneLinks` reducers; `PluridPlaneLinks` renders them as beams between the two planes' CENTERS (`interaction.camera.planeCenter` through each plane's rotated basis, sizes from the tree with the configured fallback - no DOM reads), inside the camera container. Links are PRUNED whenever the tree is written (`setTree`, `restoreArrangement`, `removePlane`): an edge whose plane is gone disappears with it; self-links are rejected and a link's `id` cannot be rewritten through `updatePlaneLink`. `elements.planeLinks.show` gates rendering.
- SELECTION: `selectedPlaneIDs` + `setSelection`/`toggleSelection`/`addToSelection`/`clearSelection`/`selectAll`/`invertSelection`/`setDraggingSelection`. The selection MODIFIER is ⌘/Ctrl: ⌘-click a plane toggles it (Shift-click too), a ⌘-drag on EMPTY SPACE draws the marquee (`state.ui.marquee`, `PluridMarquee`; Shift adds, Alt subtracts, through `selectInScreenRect` on the planes' projected rects), a plain ⌘-click on empty space clears, and so does a plain click (no drag) on empty space or Escape. DRAG-TO-MOVE (a plain drag on a selected plane) maps the screen delta to a WORLD delta on the dragged plane's camera depth (`dragWorldDelta`: exact at any orientation, no `1/scale` drift); Alt moves along the camera's forward direction; spawned subtrees ride along (`recomputeTree`); one history transaction per drag. SNAPPING is ONE engine (`plurid-engine modules/space/snap.ts`: `computeSnap` — the nearest edge/center of another plane within `space.snap.threshold` (12), else the `space.snap.grid`, deterministic first-wins on ties): the release snap (`snapSelection`) and the mid-drag `AlignmentGuides` both call it with the same inputs, so the preview is exactly what lands. `alignSelection(edge)` / `distributeSelection(axis)` / `duplicateSelection()` (offset copies of the selected roots, pinned, selected afterwards) edit the selection (topics `space.align` / `space.distribute` / `space.duplicate` / `space.selectAll` / `space.invertSelection`; the toolbar's Transform drawer has the buttons). KEYBOARD: plain arrows walk to the nearest plane in that screen direction (`navigateDirection`: projected centers, a 60° cone, straight-ahead preferred) and Enter frames the active plane — never from inside plane content; ⌘/Ctrl+A / +I / +D select all / invert / duplicate. RESIZE: with `elements.plane.resizable`, a selected plane shows right/bottom/corner handles (`PlaneResizeHandles`) writing `setPlaneSize({ sizeMode: 'manual' })` — the plane keeps that size (its observer's reports are ignored), its children reflow, one history entry per drag; manual sizes are part of the arrangement signature (undoable). `pluridSelectors.getHistory` and the `space.changed` kind `history` expose undo/redo availability.

## 6. The state model

The store (`plurid-react source/services/state/`) is per-application-instance (3.1). `services/state/modules/` holds exactly six slices: `configuration`, `general`, `shortcuts`, `space`, `themes`, `ui`. `space` is the heart; the others are thin (merged configuration, general flags, shortcut state, theme objects, engine-UI state).

The SPACE SLICE (`modules/space/index.ts`, RTK `createSlice` named `'space'`) groups into reducer families:

- field setters: `setSpaceField`, `setSpaceLoading`, `setTransform`, `setAnimatedTransform`, `setTransformTime`, `setSpaceLocation` (scalars + matrix recompute);
- camera steps: `viewCameraMove{Forward,Backward,Left,Right,Up,Down}`, `viewCameraTurn{Up,Down,Left,Right}`;
- rotate: `rotateUp/Down/Left/Right`, `rotateX`, `rotateXWith`, `rotateY`, `rotateYWith`;
- translate: `translateUp/Down/Left/Right/In/Out`, `translateXWith`, `translateYWith`, `translateZWith`;
- scale: `scaleUp`, `scaleDown`, `scaleUpWith`, `scaleDownWith`, `zoomAtPoint` (section 4);
- fly: `flyMove` (section 4);
- declarative camera: `spaceResetTransform`, `spaceFitToView`;
- tree: `setTree`, `updateSpaceTreePlane`, `removePlane`;
- view/measure: `setViewSize`, `setSpaceSize`, `spaceSetView`, `spaceSetCulledView` (reducer exists but nothing dispatches it - see 12.6), `setActiveUniverse`;
- links: `addPlaneLink`, `removePlaneLink`, `updatePlaneLink`, `setPlaneLinks`, `updateSpaceLinkCoordinates`;
- selection: `setSelection`, `toggleSelection`, `addToSelection`, `clearSelection`, `setDraggingSelection`, `transformSelectedPlanes`, `snapSelection`;
- arrangement restore: `restoreArrangement` (raw, exact tree+links set - no reconcile);
- undo/redo MARKERS: `undo: (_state) => {}` and `redo: (_state) => {}` - deliberate no-op reducers; the actual work happens in the middleware, which intercepts the action types.

THE HISTORY MIDDLEWARE (`services/state/middleware/history.ts` : `createHistoryMiddleware`) is spatial undo/redo over the AUTHORED arrangement (structure, pinned positions, links), keyed on `arrangementSignature` (`services/logic/arrangement/signature`, also a public export). `space/historyBegin` … `space/historyEnd` (ref-counted) fold everything in between into ONE entry (a drag is one undo, not sixty); `meta.history: 'skip'` bypasses one action; after every stack change the availability is written to `state.space.history` (`{ canUndo, canRedo, undoDepth, redoDepth }`) for host controls:

- One snapshot per SIGNATURE change: a relayout reflow moves auto-layout positions but leaves the signature unchanged, so it is ignored - which is what lets a restore stick instead of being re-reconciled away. A real authoring change (plane added/removed/shown/hidden/moved, link edited) flips it and is recorded.
- STATELESS: it compares THIS action's before/after signatures (a tracked `lastSignature` would go stale across a skipped remote apply). Fast path: neither `tree` nor `links` changed reference.
- Snapshots are REFERENCES to the immutable slices (cheap); stack capped at `HISTORY_LIMIT` 100; a fresh user action clears the redo stack; `meta.remote` actions (a peer's collaboration apply) are skipped - a peer's change is not in YOUR undo.
- `space/undo` / `space/redo` pop and dispatch `space/restoreArrangement`.
- Dropped entirely (no per-action signature cost, no snapshot memory) when the merged `space.undo === false` (3.1); the topics then no-op.

THE PERSISTENCE CONTRACT (`plurid-engine source/modules/state/local`):

- `PERSISTED_STATE_VERSION = 2` - a stored snapshot with a different version is IGNORED on load (fresh space) rather than risking a partial mis-merge.
- `PERSISTED_SPACE_FIELDS` (13): `rotationX`, `rotationY`, `scale`, `translationX`, `translationY`, `translationZ`, `transform`, `camera`, `activePlaneID`, `isolatePlane`, `lastClosedPlane`, `tree`, `links`. Deliberately excluded: transient flags (`loading`, `resolvedLayout`, `animatedTransform`, `transformTime`), environmental sizes re-measured on mount (`viewSize`, `spaceSize`, `culledView`, `view`), and the other slices (they come from props/defaults).
- Keys: `pluridState-<id>` (the versioned space snapshot) and `pluridContent-<id>` (the OPAQUE product blob from `onPersistContent` - no version stamp; the content shape and its migration are the product's concern; the engine never inspects it).
- Backend: the caller's `storageAdapter` wins; else a `localStorage` adapter; else (SSR/no storage) every entry point no-ops. Writes are best-effort (full/private-mode storage is swallowed), but a SERIALIZATION failure warns once - it means a cycle/DOM/function ref leaked into the persisted fields, a real bug that would otherwise silently disable persistence forever.
- The debounce + pagehide/visibility flush around all of this lives in the Application shell (3.1).

`pluridSelectors` (`services/state/selectors`, public export) exposes the same derived-state selectors the engine's own components use (`selectors.space.getTransform`, `.getTree`, `.getSelectedPlaneIDs`, ...) so hosts read state off `api.store` without re-deriving.

THE STABILITY CONTRACT: the pubsub topics (7) and the public export list (Appendix A) ARE the API. Action shapes and state shapes are NOT - `pluridStateModules` exports the action creators deliberately (the power seam), but their payload/state internals may change between versions. Anything reachable only by deep `distribution/` import is off-contract.

## 7. The pubsub protocol

The bus (`plurid-pubsub source/objects/PluridPubSub`) is minimal by design: `publish({ topic, data })`, `subscribe({ topic, callback }) -> selector`, `unsubscribe(selector)`. Per topic it holds a callback map; publish iterates the callbacks in a try/catch and SWALLOWS handler errors unless the bus was constructed with `{ debug: true }` (then `console.log`s them) - when verifying handlers, turn `debug` on. The bus is PER-INSTANCE (one per `PluridApplication`, host-injectable via the `pubsub` prop, handed out via `onReady(api).pubsub` and injected into every plane as `plurid.pubSub`); topics are instance-scoped, not global.

The topic catalog is `plurid-data source/constants/pubsub/index.ts` : `PLURID_PUBSUB_TOPIC` - exactly 62 constants (counted 2026-09-02). Directions: `host -> engine` = a control topic the engine subscribes; `engine -> host` = the engine publishes, hosts subscribe; `declared` = in the catalog + typed message shapes, but NO in-repo subscriber today (kept for wire compatibility; directional nudges ride the shortcut/dispatch paths instead). Unless noted, subscription happens in the View bridge `usePluridPubSub` (46 topics).

| Constant | Topic string | Direction | Handled in |
| --- | --- | --- | --- |
| CONFIGURATION | `configuration` | host -> engine (+ internal re-publish) | usePluridPubSub |
| SPACE_ANIMATED_TRANSFORM | `space.animatedTransform` | host -> engine | usePluridPubSub |
| SPACE_ROTATE_UP | `space.rotateUp` | declared | - |
| SPACE_ROTATE_DOWN | `space.rotateDown` | declared | - |
| SPACE_ROTATE_LEFT | `space.rotateLeft` | declared | - |
| SPACE_ROTATE_RIGHT | `space.rotateRight` | declared | - |
| SPACE_ROTATE_X_WITH | `space.rotateXWith` | host -> engine | usePluridPubSub |
| SPACE_ROTATE_Y_WITH | `space.rotateYWith` | host -> engine | usePluridPubSub |
| SPACE_ROTATE_X_TO | `space.rotateXTo` | host -> engine | usePluridPubSub |
| SPACE_ROTATE_Y_TO | `space.rotateYTo` | host -> engine | usePluridPubSub |
| SPACE_TRANSLATE_UP | `space.translateUp` | declared | - |
| SPACE_TRANSLATE_DOWN | `space.translateDown` | declared | - |
| SPACE_TRANSLATE_LEFT | `space.translateLeft` | declared | - |
| SPACE_TRANSLATE_RIGHT | `space.translateRight` | declared | - |
| SPACE_TRANSLATE_X_WITH | `space.translateXWith` | host -> engine | usePluridPubSub |
| SPACE_TRANSLATE_Y_WITH | `space.translateYWith` | host -> engine | usePluridPubSub |
| SPACE_TRANSLATE_Z_WITH | `space.translateZWith` | host -> engine | usePluridPubSub |
| SPACE_TRANSLATE_X_TO | `space.translateXTo` | host -> engine | usePluridPubSub |
| SPACE_TRANSLATE_Y_TO | `space.translateYTo` | host -> engine | usePluridPubSub |
| SPACE_TRANSLATE_Z_TO | `space.translateZTo` | host -> engine | usePluridPubSub |
| SPACE_SCALE_UP | `space.scaleUp` | declared | - |
| SPACE_SCALE_DOWN | `space.scaleDown` | declared | - |
| SPACE_SCALE_WITH | `space.scaleWith` | declared | - |
| SPACE_TRANSFORM | `space.transform` | host -> engine (+ internal re-publish) | usePluridPubSub |
| VIEW_ADD_PLANE | `view.addPlane` | host -> engine | usePluridPubSub |
| VIEW_SET_PLANES | `view.setPlanes` | host -> engine | usePluridPubSub |
| VIEW_REMOVE_PLANE | `view.removePlane` | host -> engine | usePluridPubSub |
| NAVIGATE_TO_PLANE | `space.navigateToPlane` | host -> engine | usePluridPubSub |
| REFRESH_PLANE | `space.refreshPlane` | host -> engine | Plane component (per-plane) |
| ISOLATE_PLANE | `space.isolatePlane` | host -> engine | usePluridPubSub |
| OPEN_CLOSED_PLANE | `space.openClosedPlane` | host -> engine | usePluridPubSub |
| CLOSE_PLANE | `space.closePlane` | host -> engine | usePluridPubSub |
| PREVIOUS_ROOT | `space.previousRoot` | host -> engine | usePluridPubSub |
| NEXT_ROOT | `space.nextRoot` | host -> engine | usePluridPubSub |
| NAVIGATE_TO_ROOT | `space.navigateToRoot` | host -> engine | usePluridPubSub |
| ADD_PLANE_LINK | `space.addPlaneLink` | host -> engine | usePluridPubSub |
| REMOVE_PLANE_LINK | `space.removePlaneLink` | host -> engine | usePluridPubSub |
| SET_PLANE_LINKS | `space.setPlaneLinks` | host -> engine | usePluridPubSub |
| SET_SELECTION | `space.setSelection` | host -> engine | usePluridPubSub |
| TOGGLE_SELECTION | `space.toggleSelection` | host -> engine | usePluridPubSub |
| CLEAR_SELECTION | `space.clearSelection` | host -> engine | usePluridPubSub |
| COLLABORATION_MUTATION | `space.collaborationMutation` | engine -> host (emit) | useCollaboration |
| APPLY_REMOTE_MUTATION | `space.applyRemoteMutation` | host -> engine | useCollaboration |
| SET_VIEWPOINT | `space.setViewpoint` | host -> engine | usePluridPubSub |
| FIT_TO_VIEW | `space.fitToView` | host -> engine | usePluridPubSub |
| RESET_TRANSFORM | `space.resetTransform` | host -> engine | usePluridPubSub |
| UNDO | `space.undo` | host -> engine | usePluridPubSub |
| REDO | `space.redo` | host -> engine | usePluridPubSub |
| SET_TREE | `space.setTree` (data: `{ tree }`) | host -> engine | usePluridPubSub |
| SPACE_CAMERA_DELTA | `space.cameraDelta` (data: `CameraDelta & { animate? }`) | host -> engine | usePluridPubSub |
| SPACE_FRAME | `space.frame` (data: `{ planeID?, selection?, animate? }`) | host -> engine | usePluridPubSub |
| SPACE_HOME | `space.home` | host -> engine | usePluridPubSub |
| SPACE_SET_HOME | `space.setHome` | host -> engine | usePluridPubSub |
| SPACE_PRESET | `space.preset` | host -> engine | usePluridPubSub |
| SPACE_BOOKMARK | `space.bookmark` | host -> engine | usePluridPubSub |
| SPACE_ALIGN | `space.align` | host -> engine | usePluridPubSub |
| SPACE_DISTRIBUTE | `space.distribute` | host -> engine | usePluridPubSub |
| SPACE_DUPLICATE | `space.duplicate` | host -> engine | usePluridPubSub |
| SPACE_SELECT_ALL | `space.selectAll` | host -> engine | usePluridPubSub |
| SPACE_INVERT_SELECTION | `space.invertSelection` | host -> engine | usePluridPubSub |
| CHANGED | `space.changed` | engine -> host (emit) | useEngineEvents |
| SET_PLANE_PATH | `plane.setPath` | declared | - |

Notes on the special rows:

- THE OBSERVE CHANNEL: `space.changed` publishes `{ kind, value }` whenever a watched slice's reference changes. The kinds (verified in `useEngineEvents` and typed as `PluridChangeKind` in plurid-data): `selection`, `tree`, `links`, `activePlane`, `isolate`, `layoutResolved`, `loading` - seven, one subscription covers all. The camera is intentionally NOT here (per-frame); use `onViewpointChange` / `getViewpoint()`.
- COLLABORATION: the engine PUBLISHES `space.collaborationMutation` when the shared arrangement changes; a host forwards it over its own transport and republishes incoming peer changes as `space.applyRemoteMutation` (applied with `meta.remote`, so it skips the local undo history).
- INTERNAL RE-PUBLISH: the bridge also PUBLISHES `space.transform` and `configuration` with an `internal: true` flag whenever state changes, so external subscribers can observe them; the flag is how the bridge's own subscriptions ignore the echo.
- `space.refreshPlane` is subscribed INSIDE each `Plane` (each instance filters for its own id) - the one control topic not living in the View bridge. `useViewpointURL` handles no topics (it binds the URL only); `space.setViewpoint` is bridged in `usePluridPubSub` like the rest.

This section is the WIRE CATALOG. Usage snippets, payload examples, and the tier framing live in [`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md) - the two documents deliberately do not duplicate each other.

## 8. The configuration system

`PluridConfiguration` (`plurid-data source/interfaces/external/configuration`) has five sections: `global`, `elements`, `space`, `network`, `development`. The complete defaults live in `plurid-data source/constants/configuration` (`defaultConfigurationGlobal`, `...Elements`, `...Space`, `...Network`, `...Development`, assembled as `defaultConfiguration`).

Three ways in, one merge path:

1. NESTED PARTIAL: the `configuration` prop takes a `PluridPartialConfiguration` (a `RecursivePartial`), merged over the defaults.
2. FLAT SHORTHAND: `definePluridConfiguration(flat)` (`plurid-engine source/modules/general/configuration` : `definePluridConfiguration`) expands `FlatPluridConfiguration`'s one-level fields to their nested locations (`theme` -> `global.theme`, `layout` -> `space.layout`, `planeWidth` -> `elements.plane.width`, `spaceDimensions` -> `space.dimensions`, `undo` -> `space.undo`, ...), layers `extend` (a normal nested partial) LAST so it wins over the flat fields, and returns a complete configuration.
3. PER-ROUTE: a route can carry `defaultConfiguration`, which seeds that route's application state during SSR metastate compute (`serverComputeMetastate` reads `isoMatch.data.defaultConfiguration`).

PRESENTATION DEFAULTS (2026-09-05): `merge()` resolves `space.presentation` first (the partial's, else the target's); when it is `'page'` the base is the defaults with `pagePresentationDefaults` (`space.fadeInTime: 0`, `space.opaque: false`, `elements.plane.height: 1`; plurid-data `constants/configuration`) layered over them BEFORE the target and the partial, so a host's own `fadeInTime: 300` still wins. Flat keys: `presentation` → `space.presentation`, `planeHeight` → `elements.plane.height`, `docking` → `space.docking` (merged over the defaults `{ motion: 'swing', chrome: 'hidden', reveal: { scale: 0.75, pitch: -24, yaw: 0 }, fade: 240, aside: 'lineage', focus: true, epsilon: 0.5 }`), `dockRail` → `elements.dockRail`, `bridge` → `space.bridge` (`bridgeLength` / `bridgePlaneAngle` stay as aliases). A table-driven test (`flatCompleteness.test.ts`, typed over `keyof FlatPluridConfiguration`) proves every flat key reaches its nested path. How the knob is read: §4.1.

The merge itself (`configuration/index.ts` : `merge`) clones the defaults and the target (cycle-safe `objects.clone` - the default path is a deep clone handling Date/Map/Set/RegExp and cyclic references, never the throw-on-cycle JSON round-trip), then runs `objects.merge` (`plurid-functions source/functions/objects` : `merge`) with a `'global.theme'` resolver that normalizes a theme name or `{ general, interaction }` object. `objects.merge` is UNION-KEYED: it recurses on sub-nodes and unions BOTH sides' keys at each level, so a field present in the partial but absent from the defaults is KEPT (the historical merge iterated only the base's keys and silently dropped such fields); it recurses into PLAIN objects only (class instances/Date/Map are leaf values merged by reference), honors dot-path `resolvers` (including falsy resolver values), and is O(total keys).

LIVE RECONFIGURATION: publishing on the `configuration` topic dispatches `setConfiguration` with the new (partial) configuration - the same merge applies, and dependent hooks re-read their knobs from the store. A CHANGED `configuration` PROP is the host's authority: `PluridApplication.componentDidUpdate` recomputes the store only when an input prop (`view`, `planes`, `configuration`, `space`, `id`, `hostname`, `precomputedState`, `useLocalStorage`) changed identity, `state.compute` merges the changed prop ON TOP of the current configuration (`configurationAuthoritative`), and the root reducer's `SET_STATE` handler replaces the host-owned slices (`configuration`, `themes`, `shortcuts`) while the live `space` keeps the camera, tree, selection and history and takes only the `view` and the camera limits. (Until this round `SET_STATE` had no reducer at all — prop changes never reached the store, which is why hosts remounted to switch a layout.) A layout change relays the live space with an animated relayout; a `view` change relays with the new roots.

NEW this round: `space.dimensions` (`PluridConfigurationSpaceDimensions`, flat alias `spaceDimensions`) - opt-in explicit sizing of the roots container, consumed in `plurid-react components/structural/Roots` via `resolveDimension` (number = px, string passes through: `'100%'`, `'60vh'`); defaults preserve the historical behavior (width `'100%'`, height `window.innerHeight`). LIMITATION (by design, stated in the interface doc): the layout algorithms still compute plane spacing from the MEASURED view size; `dimensions` sizes the container only.

RETIRED (2026-09-06, after a deprecation on 2026-09-03; every one was read by nothing): `global.micro` and the flat `micro`, `global.render`, `elements.switch`, `PluridRoutePlaneOptions.linkView`, `PluridApplication.centerView`, `space.transformMultimode`, `space.transformTouch` (see `gestures.touchOne`), the nested `space.cullingDistance` (the flat key still maps to `space.culling.distance`), and the `space.animatedTransform` topic + state. New defaults: `development.warnings: true`, `space.bridge.keepBehind: false`. The keyboard and pointer tables are GENERATED into [`SHORTCUTS.md`](./SHORTCUTS.md) by `scripts/generate-tables.mjs` (`pnpm docs.tables`, `--check` in CI) from the data tables, so they cannot drift.

Knob-by-knob reference (every `space.*`/`elements.*` option with a snippet): [`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md).

## 9. The SSR pipeline (plurid-react-server)

`plurid-react-server source/objects/Server/` : `PluridServer` - an Express 5 app. Since 2026-09-05 the class (`index.ts`, ~360 lines: fields, constructor, signal handlers, `start` / `stop` / `handle` / `instance`, the endpoint registration) implements `PluridServerContext` (`context.ts`) and hands itself to per-concern modules: `options.ts` (`resolveServerOptions`, `debugAllows`, `computeRequestTime`), `express.ts` (`configureExpress`, `openBrowser` — `open` is ESM-only and loaded lazily), `preserves.ts` (`ignoreGetRequest`, `resolveMatchingPath`, `resolvePreserve`, `resolvePreserveAfterServe`), `pipeline.tsx` (`handleGetRequest`, `renderApplication`), `render.tsx` (`buildRequestTree`, `renderContent`), `document.ts` (`documentFromTemplate`, `resolveRouteDocument`, `assembleDocument`), `pttp.ts` (`handlePTTPRequest`). The package's top level exports `PluridServer` (default), `PluridStillsGenerator`, the preload key constants (`PRELOADED_PLURID_METASTATE_KEY`, `PRELOADED_REDUX_STATE_KEY`) and the external interfaces (Appendix A). `PluridLiveServer` (a stub that threw) is gone.

CONSTRUCTION: stores `routes`, `planes`, `preserves`, `document` (the post-render document hook), `render` (`'string'` | `'suspense'`), `styles`, `middleware`, `exterior`, `shell`, `routerProperties`, `services`, `template` (its document projection computed once: `documentFromTemplate`), `usePTTP`/`pttpHandler`, `elementqlEndpoint` (`helmet` and `customPlane` are accepted, ignored and deprecated); resolves `options` via `handleOptions` (serverName, hostname, debug defaulting to `error` in production / `info` otherwise, compression, directories, `publicDirectory` default `''`, staticCache, ignore list, stills options, `attachSignalHandlers` default true - a bound SIGINT/SIGTERM handler registered once and removed in `stop()`); builds a `PluridStillsManager` and a `PluridIsoMatcher` over routes + planes; registers the endpoints (catch-all GET + optional PTTP POST).

`configureServer` (run at start): disables `x-powered-by`; stamps a request id + start time; `compression` when enabled, plus a `/vendor.js` handler that rewrites to `vendor.js.br` when the client accepts brotli and the file exists; `express.static(<buildDirectory>/client)`; then the PUBLIC DIRECTORY battery - `options.publicDirectory` or `<buildDirectory>/public`, mounted at `/` with `index: false` (so it cannot hijack the `/` SSR route) and SKIPPED unless the directory exists (apps without one are byte-identical to before); then the user `middleware` chain.

THE REQUEST WALK (`handleGetRequest`), in order:

1. `ignoreGetRequest` - `options.ignore` exact paths and `/*` prefixes fall through to `next()`.
2. `resolvePreserve` - find the preserve for this route (a catch-all preserve wins; the not-found preserve applies when nothing matches). Its `onServe(transmission)` gets `{ context: { route, match }, request, response }` and can: respond itself (`responded: true` short-circuits), return `redirect` (an `http...` redirect answers 302), and return `globals` (serialized into the page - the app's own preloaded state, e.g. `__PRELOADED_REDUX_STATE__`) plus per-request `providers` and `template` additions. `onError` can respond or `depreserve`; `afterServe` runs after the response.
3. STILLS CACHE - `this.stills.get(matchingPath)`: a pre-generated static HTML still is served verbatim instead of rendering (404s check a not-found still first, too).
4. `isoMatcher.match(matchingPath, 'route')` - no match walks the 404 ladder: not-found still -> not-found route rendered -> bare `NOT_FOUND_TEMPLATE`.
5. `renderApplication(isoMatch, preserveResult, request)` -> `response.send(await renderer.html())`.
6. Any thrown error — a render failure included (`renderContent` throws; there is no empty-`#root` 200 any more) -> 500 with `template.errorHtml || SERVER_ERROR_TEMPLATE` (the errorHtml battery).

`renderApplication`:

- `serverComputeMetastate(isoMatch, routes, globals, hostname)` - imported FROM `@plurid/plurid-react` (`services/logic/server` : `serverComputeMetastate`): computes, per plurid application on the matched route, the preloaded engine state (configuration merged with the route's `defaultConfiguration`, the COMPUTED PLANE TREE, themes, SSR-safe view sizes) - the state the client store hydrates from.
- THE DOCUMENT (2026-09-05, the document model): a per-request `createDocumentRegistry({ server: true })` (from `@plurid/plurid-react`) receives the matched route's / route plane's `head` BEFORE the render (`resolveRouteDocument`, sync or async) and, DURING the render, the shown planes' `head` options (`PluridDocumentPlanes` inside the application) and every in-render `usePluridDocument` / `<PluridDocument>` declaration in render order. Nothing is shared across requests.
- `buildRequestTree` (`objects/Server/render.tsx`) builds `PluridProvider metastate documentRegistry > PluridRouterStatic (path, directPlane, routes, planes, exterior, shell, ...)` and wraps EACH `services[{ name, Provider, properties }]` entry outward IN ORDER through `composePluridProviders` (exported by `@plurid/plurid-react`; `layers[0]` innermost — the kit client hydrates with the same function), merging the per-request `preserveResult.providers[name]` OVER the static `service.properties`. `renderContent` renders it through styled-components' `ServerStyleSheet`: `renderToString`, or with `render: 'suspense'` a BUFFERED `renderToPipeableStream` that resolves on `onAllReady` (every boundary settled — `use()` / async data inside planes — still one document, no streaming); `styles = sheet.getStyleTags()`; a render error throws.
- `splitHoistablePrefix`: React 19 emits a hoistable rendered anywhere in a fragment render (a raw `<title>` in a plane) as a PREFIX of the string; the server moves it into the head and warns once — declare heads through the model instead.
- `assembleDocument` merges, lowest → highest: `documentFromTemplate(template)` (favicon set, manifest, `htmlLanguage`, `htmlAttributes`, the static `head`) → the registry snapshot (route → planes → in-render) → the preserve's `document` → the `document` hook (`PluridServerDocumentHook({ request, match, metastate, document, preserve })`, the seam for a head library kept in `services`). `general.document.serializeDocumentHead` (engine, one escaper) writes base / title (`titleTemplate` applied once) / meta (charset first) / links / styles / head scripts / noscript / JSON-LD; managed elements carry `data-plurid-document="<key>"` so the client adopts them; html/body attributes and body scripts come from the same document.
- `PluridRenderer` (`objects/Renderer`) renders the template (`objects/Renderer/template`): html lang + attributes, head, defaultStyle, collected styles, headScripts, the VENDOR script tag emitted ONLY when `vendorScriptSource` is truthy - so the empty string `''` SKIPS it (the battery the kit uses for its single-bundle output), the deferred main script (default `/index.js`), the root div with the SSR content, the injected `globals` from the preserve, and `window.__PRELOADED_PLURID_METASTATE__ = <safeStore(metastate JSON)>` (name configurable via `template.defaultPreloadedPluridMetastate`; `safeStore` escapes the JSON against script breakout), body scripts, optional minify via `cleanTemplate`.

THE HYDRATION CONTRACT, two window globals:

- `__PRELOADED_PLURID_METASTATE__` - emitted by the Renderer, consumed by `PluridProvider metastate` on the client (each `PluridApplication` picks its `precomputedState` from it).
- `__PRELOADED_REDUX_STATE__` - the CONVENTION for the app's own store state: a preserve returns it in `globals`, the client rebuilds its service store from it (the kit does this in `createPluridClient`; legacy apps hand-roll the same in `Client.tsx`).

Escape hatches and the rest of the object:

- `handle()` returns `{ post, patch, put, delete }` registrars on the underlying Express app, and `instance()` returns the app itself - custom API routes without leaving the server.
- PTTP (`usePTTP`, default on): a POST protocol endpoint that resolves a plane path to its element payload; `pttpHandler` can take over.
- STILLS: `PluridStillsGenerator` boots the server, drives a headless browser over the routes and writes static HTML stills; `Stiller` owns the browser (PUPPETEER IS AN OPTIONAL PEER, `>= 22` - apps that never generate stills do not install it); `StillsManager` loads them at runtime (step 3 of the walk).
- The gateway render (`handleGateway`, the `gateway*` props of `PluridRouterStatic`) and `PluridLiveServer` were dead and are deleted (2026-09-05); `options.gatewayEndpoint`, `options.assetsDirectory`, `customPlane` and `helmet` are accepted, ignored and deprecated for one release.

## 10. plurid-kit, the framework layer

`plurid-works/plurid-kit` - the Next.js-shaped layer over plurid-react-server: one `plurid.config.ts` replaces each app's hand-written `server/index.ts`, `client/index.tsx`, and `scripts/` directory. STATUS: published at `0.0.0-3`, built, jest-tested, documented, and consumed by 29 applications; the adoption plan of record is [`FRAMEWORK_PLAN.md`](./FRAMEWORK_PLAN.md).

THE CONTRACT (`source/index.ts`): `defineConfig(config: PluridConfig)` - an identity function for editor types. `PluridConfig` groups: identity (`serverName`, `hostname`, `root`); the product surface (`routes`, `planes`, `shell`, `exterior`, `routerProperties`); the SHARED service stack (`services: PluridServiceConfig[]` - `{ name, Provider, properties, client, store, context, order }`, used identically on both targets so provider order can never drift; lower `order` = inner); server-only data loading (`preserves`, `load` sugar); the document (`head: PluridDocument` as the lowest layer, `favicon`, `manifest`, `styles`, the server-only `document` hook, `render` mode); error pages; static + build (`publicDir`, `buildDir`, `usePTTP`, `elementqlEndpoint`, `bundle: PluridBundleConfig`); Express extension (`middleware`, `handlers`); and the raw passthrough escape hatches (`options`, `template`).

`ServerOnly<T>` (`source/index.ts` : `ServerOnly`) is the client-bundle firewall: a value OR a thunk (`() => import('./server/preserves')`); `resolveServerOnly` (`source/shared`) calls the thunk, awaits, and unwraps a `{ default }` namespace - so server-only modules (data loaders, requesters, secrets) are loaded only inside `createPluridServer` and never enter the client graph.

`createPluridServer(config)` (`source/server` : `createPluridServer`) projects the config onto `PluridServerConfiguration`: services via `orderedServices` + `serviceProperties(service, 'server')` (a base `store(undefined)`; the preserve overrides per request); preserves resolved + `load` appended; the template folded from `root`/`favicon`/`manifest`/`head` with `vendorScriptSource: ''` ALWAYS (the kit emits a single client bundle in dev AND prod, so the vendor `<script>` is skipped in both - the historical `/vendor.js` 404 fix) and, in production, `mainScriptSource` read from the build's `asset-manifest.json`; options with `publicDirectory` defaulting to `source/public` in development; then `new PluridServer(...)` and the server-only `handlers(server)` thunk for custom routes. `startPluridServer` additionally starts it on `process.env.PORT`.

`createPluridClient(config)` (`source/client` : `createPluridClient`) hydrates with the SAME function the server render uses (`composePluridProviders`, plus `orderedServices`/`serviceProperties` from `source/shared`): innermost `PluridProvider > PluridRouterBrowser`, then each service wrapped OUTWARD in the same order (`services[0]` innermost); per-request state read from `__PRELOADED_REDUX_STATE__` (into the service `store(preloadedState)` factory) and `__PRELOADED_PLURID_METASTATE__` (into `PluridProvider`; both keys are constants in `source/shared`); then `hydrateRoot`. Context providers emit no DOM, so the hydrated markup matches the server render exactly, and the provider's document head claims the server-serialized head tags at hydration (one `<title>`, never two).

THE CLI (`source/cli`): `plurid dev | build | start | info`. `dev` = esbuild client+server builds, watch + relaunch, default port 33721 or `$PORT`; `build` = production build to `build/{index.js, client/**, public/**}` plus `build/asset-manifest.json`; `start` = run `build/index.js`; `info` = print the resolved environment/entries. NEW this round: `loadPluridConfig` (`source/cli/config.ts` : `loadPluridConfig`) - the CLI now LOADS `plurid.config.ts` by esbuild-bundling it to `node_modules/.plurid-kit/plurid.config.cjs` with bare imports externalized (importing the config never drags the app's runtime modules into the CLI process), cache-busted per load; absence tolerated (`{}` - convention alone works). The `bundle.*` knobs are wired into BOTH `dev` and `build`: `clientExternals`, `forceBundle`, `define`, `loaders`, `environment`.

The esbuild layer (`source/cli/esbuild.ts`) bakes in the two styled-components v6 workarounds every legacy app carried by hand, both applied in `clientBuildOptions`:

1. `define['process.env.SC_DISABLE_SPEEDY'] = 'true'` - production style injection.
2. `styledComponentsBrowserAlias()` - alias `styled-components` to the app's OWN `dist/styled-components.browser.esm.js` (esbuild's browser resolution otherwise lands on the CJS browser build, whose default-export interop breaks `styled.div` under bundling - the fleet's "black screen"). GUARDED: no styled-components installed, or a future layout without that file, -> no alias.

The server build uses the `externalizeBare` plugin: bundle the app's own source (`.`/`/`/`~` paths), force-bundle explicit ids, externalize every other bare import to runtime `require`. `templates/production.dockerfile` ships the production container recipe.

## 11. The control surface, tiered

The canonical per-knob reference is [`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md) - this document explains the machinery and never duplicates its snippets. The map:

| Tier | Surface | Machinery |
| --- | --- | --- |
| 0 | `onReady(api)` - `{ store, pubsub, getSnapshot, getViewpoint }`, fired once post-mount | section 3.1 |
| 1 | pubsub CONTROL (fit/reset/undo/redo/setTree/setViewpoint/selection/links/...) + OBSERVE (`space.changed` kinds, `onViewpointChange`) | sections 7, 4 |
| 2 | opt-outs of the always-on: `space.undo: false` (drops the middleware), `storageAdapter` + `onPersistContent`/`onRestoreContent` (redirect/extend persistence), `space.timings` (debounce windows) | sections 6, 3.1 |
| 3 | granular knobs (`space.gestures`, `space.shortcuts` + `onUnhandledKey`, `transformLocks`, `space.dimensions`, `elements.*`), UI slots (`renderToolbar`/`renderViewcube`/`renderMinimap`/`renderShortcuts`), exported primitives (`pluridSelectors`, `arrangementSignature`, viewpoint codec, engine modules) | sections 8, 3.4, 13 |

Design rule (the granular-control principle): every imposed behavior has an opt-out, every engine action a programmatic trigger, every state change an observation seam, and the escape hatch covers the unanticipated rest.

### 11.1 The typed seams (2026-09-03)

- TYPED PUBSUB: `plurid-data interfaces/external/pubsub/payloads.ts` : `PluridPubSubPayloads` is a mapped type over the publish-message union keyed by topic string; the `PluridPubSub` interface carries generic `publish` / `subscribe` overloads on top of the message-union signatures, so every topic's `data` and callback argument is checked without a second hand-written table.
- HOOKS (`plurid-react services/hooks/{engine,camera,selection,history,pubsub,api}`): `useEngineSelector` / `useEngineDispatch` / `useEngineStore` bind react-redux's `createSelectorHook` / `createDispatchHook` / `createStoreHook` to the engine's private `StateContext`, so `useCamera`, `useSelection`, `usePluridHistory`, `usePluridPubSub` and `usePluridApi` work anywhere under an application (plane content, render-slots, overlays) and never touch a host's own Redux.
- THE HANDLE: `containers/Application/index.tsx` is now `PluridApplicationShell` (the class) wrapped by a `forwardRef` `PluridApplication` whose ref is a `PluridApplicationHandle` (`containers/Application/handle.ts`): the `onReady` api plus `camera` / `selection` / `history` / `tree` command groups and `focus()` — all built on the same thunks the gestures, shortcuts and topics use (`cameraCommand`, the selection thunks, `toggleLinkPlane` / `closePlane` / `openPlane`). The View registers its element in the thunk extra (`PluridThunkExtra.view`) for `focus()`.
- DEVELOPMENT WARNINGS (`services/logic/development/warn.ts` : `warnOnce`, gated by `development.warnings`, never in production): an unstable `planes` identity (same routes, new array), a view route with no registered plane, a container with a width but no height, a perspective outside 500–5000.
- THE TESTING ENTRY (`source/testing/index.tsx` → `@plurid/plurid-react/testing`, a second tsup entry with its own `exports` subpath): `renderPlurid` (jsdom render, resolves on `onReady`, hands back the api + handle + the view element), `gestures` (pointer drag / pinch / wheel / key as real DOM events), `installFrameClock` + `flushFrames` (a deterministic rAF + `performance.now`), `expectCamera(...).toBeNear`; polyfills for `PointerEvent`, pointer capture and `matchMedia`. The package's own jest suite uses it (`source/testing/__tests__`); its `moduleNameMapper` aliases are now ANCHORED to the `~` prefix (the unanchored patterns swallowed relative `./components/…` imports).
- THE KIT DEV LOOP (`plurid-kit source/cli/process.ts`): `createRestarter` (a debounced, SERIALIZED kill → wait-for-exit → spawn of the server child, driven by an esbuild `onEnd` plugin on the server context) and `isPortFree` (a pre-flight bind check with a clear message); `loadPluridConfig` says when no config file was found; the help text is honest about what `--watch` does.

## 12. Consumption modes

### 12.1 Mode A - route planes + exterior via PluridServer

The app hands `PluridServer` routes whose definitions carry planes (and optionally a per-route `defaultConfiguration`), plus `exterior`/`shell` components. SSR computes the metastate (the per-application preloaded engine state including the computed tree), `PluridRouterStatic` renders route exterior + the plurid application server-side, and `PluridRouterBrowser` hydrates - route navigation swaps spaces, planes are the content. This is the full "planes are pages" shape.

### 12.2 Mode B - direct PluridApplication embed

A component island: render `<PluridApplication planes={...} view={...} configuration={...} />` anywhere in any React tree (no PluridServer required). The instance owns its store/pubsub (3.1); `space.dimensions` sizes it into a host container (8). This is the render-test harness's shape and the recommended shape for products embedding one space.

### 12.3 Mode C - no-3D PluridServer

Routes WITHOUT planes: PluridServer as an SSR router/shell only - preserves for data, services for providers, the template for the document; no space is mounted. Most of the consumer fleet runs this mode today.

### 12.4 The consumer reality

External measurements from the applications workspace on 2026-07-13:

- 60 web package manifests declare React 19 and styled-components 6.
- 29 web apps have `plurid.config.ts`, thin client/server entries, and `plurid dev/build/start`; 31 web packages remain outside the kit contract.
- Denote and Depict consume `@plurid/plurid-kit@0.0.0-3`. Dechat remains on the legacy application shell.
- Kit adoption has advanced faster than adoption of the engine control/persistence/collaboration surfaces. Denote still contains a typed route-exterior pubsub registry and one-tick publication deferrals that should be replaced or formally supported.
- Depict remains the principal test of consumer-authored image/media planes, and Dechat will test streaming/branching content without putting product domain concepts into the engine.
- The earlier measurements of duplicated `server/index.ts`, `Client.tsx`, scripts, and app state remain useful historical motivation, but should be re-measured before quoting a current removal total.

### 12.5 The replacement map

Each fleet hack maps onto a shipped seam:

| Current hack (fleet) | The seam that replaces it |
| --- | --- |
| `window.pluridSpacePubSub` globals | DONE in denote (2026-07-03): a typed app-side registry (`~kernel-services/engine`) fed from the route exterior's engine-injected `pubsub` prop. `onReady(api)` is the equivalent for mode-B embeds that own the `PluridApplication` element (3.1); mode-A route exteriors already receive the handle as props. |
| `setTimeout`-after-mount sequencing | PARTLY structural: the 1-tick deferrals around `pubsub.publish` cover child-effects-before-View-subscription mount ordering; a buffered/ready-gated publish is engine roadmap. `onRestoreContent` + the `space.changed` observe channel cover restore sequencing (3.1, 7). |
| hand-rolled `localStorer` | RE-DIAGNOSED (2026-07-03): denote's `localStorer` stores APP data (owner id), not engine state - not an engine seam. `storageAdapter` + `onPersistContent`/`onRestoreContent` (6) apply to engine-space persistence only. |
| `historyPlayer` camera persistence | RE-DIAGNOSED (2026-07-03): denote's `HistoryPlayer` is note-EDIT playback (app domain), not camera history; its store-capture-via-connect is app architecture. The viewpoint codec + `SET_VIEWPOINT` + `onViewpointChange` (4) remain the seams for actual camera persistence. |
| forked overlay components | `renderToolbar`/`renderViewcube`/`renderMinimap`/`renderShortcuts` slots (3.4) |
| tolerated unknown-prop console spam | fixed ui-components styled factory + `pluridShouldForwardProp` (Appendix A) |
| hand-rolled per-app state modules | `composePluridUIState` (plurid-ui-state-react) |
| plain-React media UI outside the space | `usePluridPlane` consumer planes (12.6) |
| per-app `server/index.ts` + `Client.tsx` + `scripts/` | published plurid-kit `plurid.config.ts` + CLI (10); adoption is 29/60 web packages as of 2026-07-13 |

### 12.6 Building a media plane as a consumer (the recipe)

The engine ships NO media components, deliberately - a media app is a CONSUMER of the plane substrate. The working example is `fixtures/render-test/src/MediaPlane.tsx` (behind `?media=1`).

1. OWN PLANE COMPONENT, registered via `planes`/`routes` like any plane; the media id comes from the injected `plurid.plane.parameters` / `plurid.plane.query` (3.4).
2. LIVE SIGNALS via `usePluridPlane()` -> `PluridPlaneLens` `{ planeID, active, selected, isolation, shown, scale, viewSize, location }` (`plurid-react source/services/hooks/plane`). Field subscriptions are per-primitive (the engine's own granular-derived pattern), so the content re-renders only when a consumed value changes - not per orbit frame. Valid only under a `PluridApplication`; outside plane content (exteriors, overlays) `planeID` is `undefined` and the plane-derived fields are inert.
3. PAUSE RULE: pause playback when `!active`, or `isolation === 'other'` (another plane is isolated; this content is faded/inert), or `!shown`. Pick asset quality from `scale`.
4. OFF-SCREEN DETECTION: there is NO `visible` field - `culledView` exists in state but is NOT computed (6). Use `IntersectionObserver` on the plane content (it works under CSS 3D transforms), or compute from `location` + `scale` + `viewSize` yourself.
5. SIZING: width is the PLANE's (the global `elements.plane.width` knob); make height content-driven (`aspect-ratio` + `object-fit`) inside it.
6. ENGINE COORDINATION via the injected `plurid.pubSub` - e.g. publish `ISOLATE_PLANE` on play to focus the plane.
7. LOAD-ONCE: `PluridExternalPlane` is the reference content-loader - a `loadStarted` ref guards the fetch so React 19 StrictMode's double-invoke cannot double-load (`components/planes/ExternalPlane`). Copy that pattern for your own loaders.
8. NEVER AUTOPLAY - playback is user- or host-driven (the granular-control principle).

## 13. Extension points

- RENDER SLOTS: `renderToolbar`/`renderViewcube`/`renderMinimap`/`renderShortcuts` - replace an engine overlay wholesale (3.4).
- `customPlane`: replace the internal plane implementation itself; `Root` renders it instead of `PluridPlane`, passing `{ plane, treePlane, planeID, location }` (3.4).
- SHIPPED PLANE COMPONENTS: `PluridExternalPlane` (fetch-and-render external content, the load-once reference), `PluridIframePlane`, `PluridVirtualList`.
- `usePluridPlane()` (NEW): the plane-content lens - live per-plane signals for content-heavy consumers (12.6).
- `storageAdapter`: any key->string backend for ALL engine persistence (6).
- COLLABORATION SEAM: transport-agnostic, opt-in (`space.collaboration`); the engine emits/applies arrangement mutations, the host owns the wire (7).
- `space.shortcuts.onUnhandledKey`: the host receives every key the engine did not consume (`services/logic/shortcuts`); plus `disabled`/`keymap` remapping.
- SSR: the `services` provider array (per-request props via `preserve.providers[name]`), `handle()`/`instance()` for custom Express routes, `middleware` (9).
- THE `internals` EXPORT (verified in `plurid-react source/index.tsx`): `{ PluridPlaneBridge, PluridPlaneContent, PluridPlaneControls, PluridPlaneDebugger, PluridSpaceDebugger }` - the structural pieces, for hosts recomposing plane chrome.
- ENGINE PRIMITIVES off `@plurid/plurid-engine`: `space.tree` (compute/reconcile), `space.location` and `interaction` (matrix/geometry) - the same building blocks the adapter uses, for custom layout/controls without forking; plus `pluridSelectors` + `arrangementSignature` off `@plurid/plurid-react`.

Where NOT to extend: action/state SHAPES (exported as a power seam, not a stable contract - 6), and `distribution/` deep imports (build artifacts, no compatibility promise).

## 14. Verification harness and gates

`fixtures/render-test` - the CAD verification harness: Vite + React 19 against the workspace engine, port 5273 (verified: `"dev": "vite --port 5273"` in `fixtures/render-test/package.json`). Content: 5 CAD instrument panels (GEOMETRY, TRANSFORM, MATERIAL, TOPOLOGY, TESSELLATION), a 40-plane stress set, a link-spawned detail plane (`/geometry/detail`, registered but NOT in the initial view - spawned by the PluridLink), and ONE SETUP BUTTON at the top-left (`src/harness/Setup.tsx`) that expands into every option: the fixtures of the catalog, the layout (switching on the LIVE instance — an animated relayout, children attached), the plane set / declared sizes / persistence (a remount), and every startup flag (a reload). THE URL IS THE FIXTURE: the panel rewrites the query, so any state is a pasteable link.

Every verification feature is DEFAULT-OFF behind a query flag. The flags are a REGISTRY (`src/harness/flags.ts`: key, type, default, how it applies, what it exercises) that the setup panel, `readFlags` (the URL → typed flags; `?fixture=<name>` expands a catalog entry UNDER the explicit params) and the docs generator all read — the complete, generated list is **`docs/HARNESS.md`** (`pnpm docs.tables`; `pnpm docs.tables.check` is part of `pnpm verify`, so it cannot drift). The FIXTURE CATALOG (`src/fixtures/catalog.ts`) names scenes — a set of flags, optional link clicks, 1–2 viewpoints, expectations — and is verified twice: `e2e/fixtures.spec.ts` asserts the generic invariants for every fixture (boots without console errors, every shown plane measured, a declared size is the plane's DOM box, the roots of a grid layout do not overlap in world X/Y, one minimap dot per shown plane, every on-screen link hit by itself, the space idle), and the `visual` Playwright project (`e2e/visual.spec.ts`) compares a screenshot per fixture × viewpoint against the committed baselines in `e2e/__snapshots__/<platform>/` — strictly only with `VISUAL_STRICT=1` (macOS, headless Chromium, DPR 1; elsewhere the fixtures still open and render), regenerated with `npx playwright test --config e2e/playwright.config.ts --project=visual --update-snapshots` from `fixtures/render-test`. `?gallery=1` renders every fixture on one page (each in its own harness iframe) for eyeballing. Declared plane sizes come from the `sizes` sets in `src/harness/planes.tsx` (`mixed`, `wide`, `tall`, `small`).

Assertion globals published on `window` for tests (`src/harness/globals.ts`; the full list is in `docs/HARNESS.md`): `__pluridApi` (the `onReady` api), `__rtFlags()` (the parsed flags), `__rtPlanes()` (the declared sizes by route), `__rtViewpoint` (last `onViewpointChange`), `__rtContent`/`__rtRestored` (the content persistence round-trip), `__rtStore` (the memory adapter's map), `__rtUnhandled` (unhandled key codes), `__rtRootsSize()` (the applied roots container size), `__rtPlaneLens` (the live lens values), `__rtMediaImageLoaded`, `__rtCamera()` / `__rtViewpoint2()` / `__rtTree()` (the live camera, v2 viewpoint and tree), `__rtPerf` (store notifications + frames) and `__rtChanges` (which slice keys each notification changed - the "nothing dispatches while idle" assertions). The harness is also the reference for driving the REAL topic strings against a live instance - remember publish swallows handler errors unless the bus has `debug: true` (7).

`examples/{minimal,control-surface}` - copy-pasteable single-file references, type-correct against the public API: `minimal` is three planes / zero configuration; `control-surface` exercises every tier in one component.

Gates (root `package.json`; `pnpm docs.tables.check` — `docs/SHORTCUTS.md` and `docs/HARNESS.md` current — joined `pnpm verify` on 2026-09-05, before the browser suite, which now runs two Playwright projects, `chromium` and `visual`): `pnpm build` = `pnpm -r build`; `pnpm check` = `pnpm -r check` (`tsc --noEmit` in EVERY package — added 2026-09-05 after nine translation tables shipped missing fields that `build` cannot see); `pnpm test` = `pnpm -r test`; `pnpm lint` = eslint over core + works + utilities + the harness src; `pnpm check.modules` imports every published entry point under native Node ESM and CommonJS; `pnpm smoke.pack` packs every public package, installs the tarballs with npm into a throwaway ESM project and imports them the consumer's way. `pnpm verify` runs all of it in order. CI (`.github/workflows/ci.yml`): Node 24, pnpm from `packageManager`, frozen lockfile, then build + test + lint. The BROWSER suite is deliberately a LOCAL gate, not a CI job (`pnpm verify` = build → test → lint → browser; `pnpm e2e` alone): it drives a real Chromium against the harness and its benchmark is machine-dependent, which a shared runner cannot judge. Type-checks are per package (`pnpm --filter <pkg> check`).

The page presentation in the harness (2026-09-05/06): `?presentation=page&pages=N` (the SITE set: N root pages with an about and a contact sub-page, the about page linking on to contact, `src/Site.tsx`; `siteTheme=light`, `stickyHeader=1`, `dockMotion`, `dockChrome`, `slotDockRail`, `slotViewcube`), the `page-*` fixtures of the catalog with their `revealed` / `leash` / `fit` viewpoints and `scroll` / `dock` / `focus` steps (the generated list: [`HARNESS.md`](./HARNESS.md)), `e2e/page.spec.ts` (33 scenarios; `e2e/helpers.ts` owns the typed `HarnessWindow`, `recordFrames` + `motionRuns` — a failure prints `tween×37, idle×4` — and the page helpers), and the links invariant of `fixtures.spec.ts` treats chrome over a link (the minimap over a revealed page's header) as legitimate. The SETUP pill defaults to the bottom-left on a page (its position is remembered).

## Appendix A - public API inventory

The verbatim export lists, transcribed from the sources on 2026-07-02 and spot-checked during the 2026-07-13 documentation pass. THIS APPENDIX IS THE LIST EVERY OTHER DOC MUST AGREE WITH; when an export changes, this section re-anchors first.

### @plurid/plurid-react (`source/index.tsx`)

Regenerated 2026-09-03 from the source export blocks (a script-assisted transcription; the source order is kept); re-anchored 2026-09-05 for the document model — new: `PluridDocument` (the component), `PluridDocumentScope`, `usePluridDocument`, `createDocumentRegistry`, `composePluridProviders`, and the type exports listed below; `PluridLink`'s default export is now the gate that renders a plain anchor outside an application; `usePluridPlane()` gained the plane identity, the pubsub and `close` / `navigateToParent` / `frame`. New on 2026-09-03: the hooks (`useCamera`, `useSelection`, `usePluridHistory`, `usePluridPubSub`, `usePluridApi`), the `PluridApplicationHandle` type (the `ref` of `PluridApplication`, which is now a `forwardRef` around `PluridApplicationShell`), `CameraMotionOptions` / `CameraCommand`, and the second entry `@plurid/plurid-react/testing` (`renderPlurid`, `gestures`, `installFrameClock`, `flushFrames`, `expectCamera`, `installPointerEvents`, `installMatchMedia`). Removed: the `general` state slice (so `pluridStateModules.general` and `pluridSelectors.general` are gone), the `computeMatrix` shim, `beginAnimatedTransform` / `useAnimatedTransform` (the `animatedTransform` state field, its reducer and the `space.animatedTransform` topic remain for wire compatibility but nothing renders from them). (+ `width` / `height` / `sizeMode` since 2026-09-05)

Value exports (the named `export { ... }` block, in source order):

```
PluridApplication
PluridRouterBrowser
PluridRouterStatic
PluridProvider
PluridDocument
PluridDocumentScope
usePluridDocument
createDocumentRegistry
composePluridProviders
PluridLink
PluridRouterLink
PluridApplicationConfigurator
PluridPlaneConfigurator
PluridExternalPlane
PluridIframePlane
PluridVirtualList
SPACE_LAYOUT
SIZES
TRANSFORM_MODES
TRANSFORM_TOUCHES
PLURID_ROUTER_LOCATION_CHANGED
PLURID_ROUTER_LOCATION_STORED
PluridIsoMatcher
PluridRouteParser
definePluridConfiguration
PluridPubSub
PLURID_PUBSUB_TOPIC
serverComputeMetastate
pluridRouterNavigate
usePluridRouter
usePluridPlane
useCamera
useSelection
usePluridHistory
usePluridPubSub
usePluridApi
getDirectPlaneMatch
encodeViewpoint
decodeViewpoint
encodeCameraViewpoint
decodeCameraViewpoint
pluridStateModules
pluridSelectors
arrangementSignature
internals
```

Type exports (`export type { ... } from`), by source module:

- `./services/hooks/plane`: `PluridPlaneLens`, `PluridPlaneIsolation`
- `./services/hooks/camera`: `PluridCameraHandle`
- `./services/hooks/selection`: `PluridSelectionHandle`
- `./services/hooks/history`: `PluridHistoryHandle`
- `./containers/Application/handle`: `PluridApplicationHandle`
- `./services/logic/camera`: `CameraMotionOptions`, `CameraCommand`
- `./services/document/registry`: `PluridDocumentRegistry`, `PluridDocumentBaseLayer`
- `./components/utilities/Document`: `PluridDocumentProperties`
- `./services/utilities/providers`: `PluridProviderLayer`
- `@plurid/plurid-data` (re-exported): `PluridDocumentDescriptor` (= `PluridDocument`, the data type; the component keeps the bare name), `PluridDocumentMeta`, `PluridDocumentLink`, `PluridDocumentScript`, `PluridDocumentStyle`, `PluridDocumentContext`, `PluridDocumentResolver`, `PluridDocumentSource`

The default export `Plurid` object carries: `Application`, `RouterStatic`, `RouterBrowser`, `Provider`, `Link`, `RouterLink`, `ApplicationConfigurator`, `PlaneConfigurator`, `ExternalPlane`, `IframePlane`, `VirtualList`, `SPACE_LAYOUT`, `SIZES`, `TRANSFORM_MODES`, `TRANSFORM_TOUCHES`, `PubSub`, `PUBSUB_TOPIC`, `serverComputeMetastate`, `IsoMatcher`, `routerNavigate`, `encodeViewpoint`, `decodeViewpoint`, `encodeCameraViewpoint`, `decodeCameraViewpoint`, `selectors`, `arrangementSignature`, `internals`.

### @plurid/plurid-react-server (`source/index.ts`)

```
default: PluridServer
PluridStillsGenerator
```

plus `export * from './data/constants/preload'` (`PRELOADED_PLURID_METASTATE_KEY`, `PRELOADED_REDUX_STATE_KEY`) and `export * from './data/interfaces/external'`, which is exactly (2026-09-05; `PluridLiveServerOptions` is gone with `PluridLiveServer`):

```
PluridServerMiddleware
ServerRequest
DebugLevels
PluridServerOptions
PluridServerPartialOptions
PluridServerService
PluridServerRenderMode
PluridServerDocumentContext
PluridServerDocumentHook
PluridServerConfiguration
PTTPHandler
PluridServerTemplateConfiguration
PluridStillerOptions
PluridPreserveReact
```

and, re-exported from `@plurid/plurid-data` as types: `PluridDocument`, `PluridDocumentMeta`, `PluridDocumentLink`, `PluridDocumentScript`, `PluridDocumentStyle`, `PluridDocumentBase`, `PluridDocumentContext`, `PluridDocumentResolver`, `PluridDocumentSource`.

### @plurid/plurid-kit

Root (`.` - `source/index.ts`): value `defineConfig`; types `ServerOnly`, `PluridHead` (= `PluridDocument`; `PluridHeadMeta` / `PluridHeadLink` are deprecated aliases of `PluridDocumentMeta` / `PluridDocumentLink`), `PluridFaviconSet`, `PluridFavicon` (derived from the server's template type), `PluridServiceConfig`, `PluridBundleConfig`, `PluridConfig` (with `document?: ServerOnly<PluridServerDocumentHook>` and `render?: PluridServerRenderMode`; `helmet` and `customPlane` removed), plus re-exported types `PluridServerConfiguration`, `PluridServerOptions`, `PluridServerService`, `PluridServerMiddleware`, `PluridServerTemplateConfiguration`, `PluridPreserveReact`. `source/shared` exports `PRELOADED_REDUX_STATE_KEY` / `PRELOADED_PLURID_METASTATE_KEY` for both targets.

`./server` (`source/server/index.ts`): `createPluridServer`, `startPluridServer`.

`./client` (`source/client/index.tsx`): `createPluridClient`.

Bin: `plurid` (`distribution/cli/index.js`) - commands `dev | build | start | info`.

### @plurid/plurid-ui-state-react (additions this round)

`composePluridUIState(overrides?)` (`source/compose`) -> `{ reducers, actions, selectors, initialStates }` over the FIVE modules `head`, `notifications`, `shortcuts`, `sitting`, `themes`; types `PluridUIState`, `PluridUIStateOverrides`. Overrides are partial initial states spread over each module's defaults (`notifications`, an array slice, REPLACES); RTK action types are name-derived, so the default `actions` drive the override reducers.

### @plurid/plurid-ui-components-react (addition this round)

`pluridShouldForwardProp` (`source/utilities/styled`, re-exported from `source/index.ts`) - the prop filter all 48 of the library's styled files use via the shared filtered `styled` factory: `@emotion/is-prop-valid` plus the `STYLE_ONLY_PROPS` deny-set `{ 'size', 'selected' }` (style-only props that are ALSO valid HTML attributes); composed `styled(Component)` targets forward everything. Exported so applications reuse the exact semantics in their own `<StyleSheetManager shouldForwardProp={pluridShouldForwardProp}>`.

## Appendix B - doc map and authority order

| Document | Authority over | Notes |
| --- | --- | --- |
| [`README.md`](./README.md) | READING ORDER - maintained/current/historical document map | start here |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) (this) | HOW IT WORKS - structure, pipelines, contracts, the wire catalog | descriptive; re-verified when source moves |
| [`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md) | HOW YOU DRIVE IT - every knob/seam with a snippet, tiered | the canonical per-knob reference |
| [`CONTEXT-MAP.md`](./CONTEXT-MAP.md) | PACKAGE STATUS - live/legacy/archived, gates, governance | per-package table; this doc links, never duplicates |
| [`ENGINE_AUDIT_AND_ROADMAP.md`](./ENGINE_AUDIT_AND_ROADMAP.md) | DEFECT + REFACTOR LEDGER - findings and their phases | audit lens |
| [`ENGINE_FEATURE_ROADMAP.md`](./ENGINE_FEATURE_ROADMAP.md) | CAPABILITY HISTORY + PLANS - what shipped when, what is next | feature lens |
| [`FRAMEWORK_PLAN.md`](./FRAMEWORK_PLAN.md) | THE KIT - current adoption and generator plan | section 10 describes the implemented contract |
| [`CODEBASE_DEEP_CRITIQUE.md`](./CODEBASE_DEEP_CRITIQUE.md) | HISTORICAL SNAPSHOT (2026-06-19) | pre-modernization state; do not cite as current |
| package `README.md`s | npm-facing per-package intro | usage-first, not architecture |

Also: [`GETTING_STARTED.md`](./GETTING_STARTED.md) (use the engine), [`CONTRIBUTING.md`](./CONTRIBUTING.md) (work on it), [`../examples/`](../examples/) (runnable references), [`../fixtures/render-test/`](../fixtures/render-test/) (the harness).

On conflict: source wins; then this document and CONTROL_SURFACE for behavior; CONTEXT-MAP for status; the roadmaps for intent. A doc that disagrees with Appendix A's export lists is stale.
