# Plurid Engine Architecture

Verified: 2026-07-02 against source.

This is the descriptive reference: how the system works today; roadmaps and knob how-tos live
elsewhere - see Appendix B. Every path, export name, count, and behavior below was checked against
the source on the date above. Claims are anchored to `file:symbol` wherever possible so they survive
line drift; when files move, this document is re-anchored, not trusted.

All paths are relative to the repo root
(`technologies/tools/plurid`) unless stated otherwise. Paths into packages omit the
`packages/plurid-web/` / `packages/plurid-utilities/` prefixes once the package is named.

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

Plurid renders web pages as PLANES in a navigable 3D space. The 3D is pure CSS: the space container
sets `perspective: 2000px` (plurid-react `components/structural/Space/styled.ts`), the camera is ONE
`matrix3d(...)` transform on the roots container (`components/structural/Roots`), and every plane is
a real DOM subtree positioned with its own small CSS transform under `transform-style: preserve-3d`
(`Roots/styled.ts`, `Root/styled.ts`). There is no canvas, no WebGL, no scene graph outside the DOM:
text stays selectable, inputs stay focusable, DevTools stays useful.

The runtime story, one paragraph: mounting `<PluridApplication>` (a class component) computes a
preloaded state from its props (view, planes, configuration, any persisted local snapshot, any
SSR-precomputed state), creates a PER-INSTANCE Redux Toolkit store and a per-instance pubsub bus,
and renders the connected `PluridView` under a private react-redux context. The view's hooks wire
pointer/keyboard/resize input and the pubsub bridge; the engine (`@plurid/plurid-engine`) computes
the plane tree and its layout; `Roots` applies the camera matrix computed by the space reducer; each
`Root`/`Plane` renders one plane's component with an injected `plurid` prop. Navigation is dispatch:
a pointer drag dispatches transform actions per frame, the reducer recomputes the matrix, and only
the roots container re-renders.

What runs where:

- `@plurid/plurid-react` - the browser adapter (also renders under SSR via `react-dom/server`).
- `@plurid/plurid-react-server` - the Express 5 SSR server: route matching, per-request data
  (preserves), HTML template, static stills.
- `@plurid/plurid-kit` - the framework layer: `plurid.config.ts` + the `plurid` CLI
  (`dev/build/start/info`) + `createPluridServer`/`createPluridClient` bootstraps. Unpublished.

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

The workspace (`pnpm-workspace.yaml`) globs `packages/plurid-web/plurid-core/*`,
`packages/plurid-web/plurid-works/*`, `packages/plurid-utilities/*`, and `fixtures/render-test`.
Layer rule: a package imports only from layers below it (verified against each `package.json`'s
`@plurid/*` dependencies, 2026-07-02).

| Layer | Package | Version | Directory | Role |
|---|---|---|---|---|
| L0 | `@plurid/plurid-themes` | 0.0.0-3 | plurid-utilities/plurid-themes | theme objects (no @plurid deps) |
| L0 | `@plurid/plurid-functions` | 0.0.0-32 | plurid-utilities/plurid-functions | pure utilities (`objects.merge`/`clone`, mathematics, ...) |
| L0 | `@plurid/plurid-functions-react` | 0.0.0-6 | plurid-utilities/plurid-functions-react | React utility hooks (`useDebouncedCallback`, ...) |
| L1 | `@plurid/plurid-data` | 0.0.0-21 | plurid-core/plurid-data | ALL shared types, constants, enums, defaults, pubsub topics |
| L1 | `@plurid/plurid-icons-react` | 0.0.0-10 | plurid-utilities/plurid-icons-react | icon set |
| L1 | `@plurid/plurid-ui-state-react` | 0.0.0-12 | plurid-utilities/plurid-ui-state-react | host-app UI state slices + `composePluridUIState` |
| L2 | `@plurid/plurid-pubsub` | 0.0.0-10 | plurid-core/plurid-pubsub | the event bus class |
| L2 | `@plurid/plurid-engine` | 0.0.0-19 | plurid-core/plurid-engine | plane tree, layout, routing, matrix math, state compute/persist (framework-agnostic) |
| L2 | `@plurid/plurid-ui-components-react` | 0.0.0-29 | plurid-utilities/plurid-ui-components-react | UI component library (48 styled files on the shared filtered `styled` factory) |
| L3 | `@plurid/plurid-react` | 0.0.0-35 | plurid-works/plurid-react | the render adapter: `PluridApplication`, routers, links, hooks |
| L4 | `@plurid/plurid-react-server` | 0.0.0-16 | plurid-works/plurid-react-server | SSR server (Express 5), stills, template |
| L5 | `@plurid/plurid-kit` | 0.0.0-0 (UNPUBLISHED) | plurid-works/plurid-kit | framework: config contract + CLI + bootstraps |
| L5 | `@plurid/generate-plurid-app` | 0.0.0-14 | plurid-utilities/generate-plurid-app | scaffolding CLI; still emits the CRA-era shape - the FRAMEWORK_PLAN P5 rework retargets it at the kit shape |
| L5 | `fixtures/render-test` | private | fixtures/render-test | the CAD verification harness (Vite, port 5273) |

Where things live, by rule:

- TYPES and constants live in `plurid-data` (interfaces, enums, `PLURID_PUBSUB_TOPIC`, the default
  configuration). Nothing below L3 knows React types beyond generics.
- LOGIC lives in `plurid-engine` (`source/modules/{space,planes,routing,state,interaction,general}`):
  tree compute/reconcile, the five layout algorithms, IsoMatcher/route parsing, matrix math,
  the persistence primitive.
- REACT lives in `plurid-react`: components, the store, the hooks, the pubsub bridge.

Archived / de-globbed (source kept on disk, out of every gate, `!` negations in
`pnpm-workspace.yaml`): `plurid-canvas` (empty 0.0.0-0), `plurid-html` (stale Stencil duplicate),
`plurid-routes-server` (orphaned pluriverse-era route cache). `plurid-works/plurid-html-server` is a
HUSK directory - LICENSE files only, no `package.json`, invisible to pnpm.

`pnpm-workspace.yaml` also carries the `overrides` block that keeps the graph single-versioned:
`immer ^10` (RTK 2.12 pairs with immer 10; immer 11 types leak), `react-redux ^9` and
`styled-components ^6` (two copies break React context -> blank render), and `@types/react ^18.3` +
`@types/react-dom ^18.3`. The `@types/react` pin exists because TWO type copies (18 from the libs,
19 from the React-19 harness) leak into styled-components' shared type inference and produce TS2742
("inferred type cannot be named") in dts builds; the libs build their types against 18.3 (a type-level
subset of 19) while runtime React stays 19.

Per-package status, gates, and the governance ledger live in [`../CONTEXT-MAP.md`](../CONTEXT-MAP.md)
- this document does not duplicate its table.


## 3. The render pipeline, mount to pixels

### 3.1 PluridApplication, the stateful shell

`plurid-react source/containers/Application/index.tsx` - a CLASS component (the only stateful shell
in the adapter). Per instance it owns:

- THE STORE: `computeStore()` calls `state.compute(view, configuration, planesRegistrar,
  currentState, localState, precomputedState, contextState, hostname)` (the engine's
  `modules/state/compute`), then `store(preloadedState, { history })` creates the RTK store.
  `history` is `resolvedSpace?.undo !== false` read off the MERGED configuration - an explicit
  `space.undo: false` drops the history middleware entirely (section 6).
- THE PUBSUB: `this.pubsub = properties.pubsub || new PluridPubSub()` - host-injectable via the
  `pubsub` prop, so a host can own the bus; either way it is the SAME instance the View subscribes
  its topics on and the one handed back via `onReady`.
- THE PLANES REGISTRAR: `prepare()` constructs a `PluridPlanesRegistrar(props.planes, hostname)`
  ONLY when `typeof window === 'undefined'` and none was passed - the SSR branch (the server passes
  a shared registrar; the browser registers planes into the module-level registrar via
  `registerPlanes` on every `computeStore`).
- TIMINGS: `space.timings.persistDebounce` -> `persistDebounceMs` (default 300) and
  `space.timings.viewpointChangeDebounce` -> `viewpointDebounceMs` (default 250), resolved once from
  the merged configuration.
- PERSISTENCE (`subscribeStore` + `persistState`): gated on `useLocalStorage`; a store subscription
  marks dirty and debounces one write per `persistDebounceMs` (a drag emits a change per frame -
  serializing every frame is a real jank source). The pending write is flushed SYNCHRONOUSLY on
  `pagehide` (reload/navigation/close; bfcache- and mobile-safe where `beforeunload` is not) and on
  `visibilitychange: hidden`, and on unmount. `persistState` saves the versioned space snapshot via
  the engine's `state.local.save` and, when `onPersistContent` is supplied, the product's opaque
  content blob via `state.local.saveContent` (section 6, persistence contract).
- VIEWPOINT CALLBACK (`subscribeViewpoint`): only wired when `onViewpointChange` is supplied;
  debounced `viewpointDebounceMs`; encodes the camera and fires ONLY when the encoded string
  actually changed (store updates fire for non-camera changes too).
- `componentDidMount`: first restores persisted content (`state.local.loadContent` ->
  `onRestoreContent`, gated on `useLocalStorage`), THEN fires `onReady(api)` ONCE, post-mount, so
  the View has already subscribed the pubsub topics and a host can publish immediately. The api
  shape (verified at the `onReady` call site):

  ```
  { store, pubsub, getSnapshot: () => store.getState(), getViewpoint: () => encodeViewpoint(...) }
  ```

- `componentDidUpdate`: recomputes the store projection and dispatches `{ type: 'SET_STATE' }` with
  it (prop changes flow into state through the same compute path as mount).

### 3.2 The provider stack

`render()` nests, outermost first:

```
StyleSheetManager shouldForwardProp={isPropValid}     (@emotion/is-prop-valid)
  ReduxProvider store={this.store} context={StateContext}
    PluridView {...props} planesRegistrar pubsub      (the connected View)
```

- The `StyleSheetManager` filter exists because styled-components v6 no longer auto-filters props:
  engine-internal styled props (`transformMode`, `show`, `active`, ...) would leak onto DOM nodes.
- `StateContext` (`services/state/context`) is the engine's PRIVATE react-redux context. Every
  `connect(...)` in the adapter passes `{ context: StateContext }`. This isolates the engine store
  from a host application's own react-redux `<Provider>` - both can wrap the same subtree without
  either store hijacking the other's `useSelector`/`connect`.

### 3.3 PluridView and the nine hooks

`containers/Application/View/index.tsx` is a connected function component: it subscribes the full
state plus derived slices (`mapStateToProperties`), binds ~20 dispatchers, attaches the raw
`keydown` + `wheel` listeners (passive: false) on the view element, and memoizes the
`pluridContext` value (registrar, plane context, `defaultPubSub`, `registerPubSub`) so that planes
- which read it via `useContext` - do not re-render on every per-frame View render. The behavior
lives in nine hooks, `containers/Application/View/hooks/` (the directory holds exactly these):

| Hook | Responsibility | File |
|---|---|---|
| `useGrabMode` | grab/navigate mode: G toggles, Escape exits; `grabModeRef` mirrors state for live pointer/wheel handlers | `hooks/useGrabMode.ts` |
| `useFlyControls` | first-person fly: held-key movement + pointer-lock mouse-look; on when `space.firstPerson`; `gestures.flySpeed` / `flyLookSensitivity` | `hooks/useFlyControls.ts` |
| `useViewResize` | window-resize handling: debounced view-size measure (`setViewSize`) + tree recompute | `hooks/useViewResize.ts` |
| `usePointerGestures` | native Pointer Events: orbit/pan/zoom drags per `gestures.buttonMap`, two-pointer pinch about the midpoint, decaying-momentum spin on a rAF loop (`momentumDecay` 0.92, `momentumMin` 0.05 defaults) | `hooks/usePointerGestures.ts` |
| `useTreeUpdate` | `treeUpdate`/`treeUpdateCallback`/`resolveLayout`: rebuild the tree from view + registered planes, re-attach runtime `planeID` + spawned children onto the relaid-out tree (keyed by route + ROUNDED location, so sub-pixel relayout drift cannot silently close spawned planes) | `hooks/useTreeUpdate.ts` |
| `usePluridPubSub` | the pubsub bridge: the bus registry + `registerPubSub`, subscribes the 35 control topics, re-publishes `space.transform` + `configuration` with `internal: true` (section 7) | `hooks/usePluridPubSub.ts` |
| `useCollaboration` | collaboration seam (on when `space.collaboration === true`): emits `COLLABORATION_MUTATION` on shared-arrangement change, applies `APPLY_REMOTE_MUTATION` with `meta.remote` | `hooks/useCollaboration.ts` |
| `useEngineEvents` | the engine->host observe channel: publishes `space.changed` `{ kind, value }` per watched slice; always on (publishing to a no-subscriber topic is free) | `hooks/useEngineEvents.ts` |
| `useViewpointURL` | opt-in URL binding for the camera: `restore` on mount (a deep-link overrides the persisted camera), debounced `replaceState` `write`; both default OFF | `hooks/useViewpointURL.ts` |

### 3.4 The structural tree

`View` renders `PluridViewContainer` (`containers/Application/View/Container/index.tsx`) when the
view is non-empty. The container is where the OVERLAY SLOTS live:

```
PluridViewContainer
  PluridSpace                 components/structural/Space      perspective: 2000px, fade-in
    PluridRoots               components/structural/Roots      THE camera transform
      PluridRoot (per root)   components/structural/Root       one root plane + its spawned subtree
        PluridPlane           components/structural/Plane      per-plane placement + chrome
          PlaneControls / PlaneContent / PlaneBridge           Plane/components/*
      PluridPlaneLinks        components/structural/PlaneLinks link beams (ride the camera)
      AlignmentGuides         components/structural/AlignmentGuides (ride the camera)
  PluridOrigin                transform-origin indicator
  Toolbar | Viewcube | Minimap | Shortcuts                     each replaceable
```

- SLOTS: `renderToolbar` / `renderViewcube` / `renderMinimap` / `renderShortcuts` - when provided,
  each REPLACES the engine's default overlay at the same spot; the `elements.*.show` flags and
  `global.micro` still govern the defaults but a slot bypasses them (the host owns that element).
- `Roots` applies ONE inline style: `transform: spaceTransformMatrix` (from
  `selectors.space.getTransformMatrix`) plus a `transform <transformTime>ms ease-in-out` transition
  when `animatedTransform` is set. It sizes itself via the opt-in `space.dimensions`
  (`resolveDimension`: number -> px, string passthrough; defaults width `'100%'`, height
  `window.innerHeight` - the historical behavior). It hosts `PluridPlaneLinks` and
  `AlignmentGuides` INSIDE the transformed container so beams and guides ride the camera.
- `Root` (per `TreePlane` in `state.space.tree`) deliberately subscribes to NOTHING
  (`mapStateToProperties` is empty) and is wrapped `connect(...)(React.memo(PluridRoot))`: with the
  tree immutable + structurally shared, an unchanged root's `plane` ownProp is referentially stable
  and the memo bails the re-render - this is what keeps per-frame work off the planes. It renders
  the root plane and recursively the spawned children, and provides `PluridPlaneIDContext` at BOTH
  injection sites (the root plane and each child plane) - the context `usePluridPlane` reads. Each
  plane component receives the injected `plurid` prop:
  `{ plane: { value, planeID, parentPlaneID, fragments, parameters, query }, route, pubSub }`.
- `Plane` positions itself with a per-plane CSS transform built from `treePlane.location`
  (`translateX/Y/Z` px + `rotateX/Y` deg, `transform-origin: 0 0 0`). Width comes from
  `elements.plane.width`: a value `<= 1` is a fraction of the measured view width, `> 1` is
  absolute px. It subscribes to DERIVED per-instance booleans (`stateIsActivePlane`,
  `stateIsSelected`) rather than the raw shared strings - the raw `activePlaneID` changes on every
  hover over ANY plane, so subscribing to the string re-rendered all planes per hover; the boolean
  flips only for the two planes whose state changed. Its chrome: `PlaneControls` (address bar,
  isolate/refresh/close), `PlaneContent` (the consumer component), `PlaneBridge` (the visual
  parent->child bridge).


## 4. The camera and transform model

The camera is state: `state.space` holds the six scalars `rotationX`, `rotationY`, `translationX`,
`translationY`, `translationZ`, `scale`, plus the CACHED matrix string `transform` (initial
`matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)`), `animatedTransform` (transition on/off) and
`transformTime` (default 450 ms).

`computeMatrix` (`plurid-react source/services/logic/transform` : `computeMatrix`) composes the
matrix from the scalars using the engine's matrix primitives
(`interaction.matrix`: `rotateMatrix`, `translateMatrix`, `scaleMatrix`,
`multiplyArrayOfMatrices`, `matrixArrayToCSSMatrix`):

1. The pivot is the CENTER OF THE VIEW CONTAINER (`spaceState.viewSize`, tracked in state; `window`
   inner size is only the fallback, and 1440x800 under SSR) - so rotation/scale pivot correctly
   when the space is embedded or resized.
2. `transformOrigin{X,Y,Z} = -translation + half-view` (Z: `-translationZ`).
3. Composition order: `[ translation, translate(origin), rotation(-rotX, -rotY in radians),
   translate(-origin), scale ]`, multiplied and serialized to a CSS `matrix3d(...)` string.

The reducers that move the camera (`rotateXWith`, `translateZWith`, `zoomAtPoint`, `flyMove`,
`setSpaceLocation`, ...) all end with `state.transform = computeMatrix(state)` - the matrix is
computed IN the reducer, once per action, and stored. `Roots` just applies the string.

THE PER-FRAME PATH: pointer event -> `usePointerGestures` dispatches a `*With` action -> the space
reducer mutates the scalars and recomputes the matrix -> react-redux notifies -> ONLY `PluridRoots`
re-renders (it is the only component subscribed to the matrix); `Root` is memo-bailed, planes
untouched. Zero per-frame JS on planes, zero per-frame layout work - the browser composites one
transformed layer. Momentum continues the dispatch loop on `requestAnimationFrame` until the
velocity decays below `momentumMin`.

Notable reducers (`services/state/modules/space/index.ts`):

- `zoomAtPoint` - zoom toward a screen point (the cursor / pinch midpoint) instead of the view
  center: for scale `s -> s'` it shifts translation by `(origin - translation) * (1 - s'/s)`,
  clamped to the scale limits; exact at rotation 0 (the common zoom case), close otherwise.
- `flyMove` - one camera-relative step per animation frame (forward/strafe/vertical + yaw/pitch),
  with pitch clamped to +-85 deg so the view cannot flip past vertical.
- `spaceFitToView` / `spaceResetTransform` - frame all planes / return to identity (also reachable
  as pubsub topics, section 7).
- `setAnimatedTransform` + `setTransformTime` - flip the CSS transition on `Roots` for smooth
  programmatic moves (the `space.animatedTransform` topic).

Modes: grab mode (G / Escape, `useGrabMode`) turns the primary drag into pan-navigation; fly mode
(`space.firstPerson`) enables `useFlyControls`. Gesture mapping, sensitivities, drag threshold and
momentum are all `space.gestures` knobs (see CONTROL_SURFACE).

THE VIEWPOINT CODEC (`services/logic/viewpoint`): a "viewpoint" is the six camera scalars as a
first-class encodable value.

- `encodeViewpoint(transform)` -> `"rX,rY,tX,tY,tZ,s"` in the fixed order `rotationX, rotationY,
  translationX, translationY, translationZ, scale`, each rounded to 4 decimals.
- `decodeViewpoint(string)` -> `SpaceTransform | null`; STRICT: anything that is not exactly 6
  finite numbers with `scale > 0` returns `null`, so a malformed `?v=` is ignored rather than
  corrupting the view.
- Restore dispatches `setSpaceLocation`, which sets the scalars AND recomputes the matrix.

URL binding (`useViewpointURL`, config knobs on `space.*`): `viewpointURLWrite` and
`viewpointURLRestore` BOTH default false (no URL pollution unless asked); `viewpointURLParam`
defaults `'v'`; `viewpointURLDebounce` defaults 400 ms for the `replaceState` write (path, other
query params and hash preserved; no history spam). The first write is skipped so the pre-restore
default transform never clobbers the `?v=` the user arrived with. Programmatic control rides the
`space.setViewpoint` topic (SET_VIEWPOINT -> `setSpaceLocation`); programmatic observation rides
the debounced `onViewpointChange(viewpoint)` prop and the synchronous `api.getViewpoint()` -
deliberately NOT the `space.changed` channel, because the camera changes per orbit frame.


## 5. Plane lifecycle: registration -> tree -> layout -> render

### 5.1 Registration and matching

Planes enter through two props: `planes` (`PluridReactPlane[]`: `{ route, component }`) and
`routes` (route definitions whose spaces/universes/clusters carry planes - the pluriverse-era full
shape). Registration is the engine's `planes.Registrar` (re-exported by the adapter as
`PluridPlanesRegistrar`, `plurid-react source/services/engine/index.ts`): a map from resolved plane
route -> `{ component, route }`, filled by `registerPlanes` on every `computeStore()` pass (browser)
or once per server (SSR shares one registrar via the `planesRegistrar` prop).

Matching is the engine's `routing` module: `IsoMatcher` (exported as `PluridIsoMatcher`) matches a
URL against routes and route-planes isomorphically (same code server and client); `RouteParser`
(exported as `PluridRouteParser`) parses parameterized route patterns. The adapter adds
`getDirectPlaneMatch` (`services/logic/router` : `getDirectPlaneMatch`): given a matched path, find
the route-plane (or top-level plane) it addresses directly - the SSR entry for "this URL IS a
plane".

### 5.2 The plane tree

The space's content is `state.space.tree: TreePlane[]` - roots with recursive `children`. It is
computed by the engine (`plurid-engine source/modules/space/tree`): a `Tree` class (`object.ts`)
over pure functions (`logic.ts`: `computeSpaceTree`, `updateTreeWithNewPlane`,
`updatePlaneLocation`, `togglePlaneFromTree`, `getTreePlaneByID`, `removePlaneFromTree`,
`reconcileTree`, ...). Tree mutations are IMMUTABLE + STRUCTURALLY SHARED (`reconcileTree`):
untouched subtrees keep their references, which is the invariant the whole render-perf model
(3.4's memo bailouts) and the history middleware's cheap snapshots (6) lean on.

`TreePlane` essentials (`plurid-data source/interfaces/internal/tree` : `TreePlane`): `sourceID`
(the registered plane it instantiates), `planeID` (the runtime instance id), `parentPlaneID`,
`route`, measured `width`/`height`, `location` (`translateX/Y/Z`, `rotateX/Y`), `show`, `children`,
`bridgeLength`/`planeAngle` (spawn geometry), and `manuallyPositioned` - set when the user drags a
plane; auto-layout then leaves it pinned (its location carries across relayouts) and arranges only
the un-pinned planes.

### 5.3 Layout algorithms

`plurid-engine source/modules/space/layout/` contains exactly five algorithms plus the index:
`column.ts`, `row.ts`, `sheaves.ts`, `faceToFace.ts`, `zigZag.ts` (exported as
`computeColumnLayout`, `computeRowLayout`, `computeSheavesLayout`, `computeFaceToFaceLayout`,
`computeZigZagLayout`). They are selected by `configuration.space.layout.type` against the
`SPACE_LAYOUT` enum (`plurid-data enumerations` : `LAYOUT_TYPES`): `COLUMNS`, `ROWS`,
`FACE_TO_FACE`, `ZIG_ZAG`, `SHEAVES`, plus `META` (layout carried by the route metadata rather
than one of the five). Each algorithm reads its own fields off the layout object (e.g. `columns` +
`gap`; `angle`; `depth` + offsets) and computes plane spacing FROM THE MEASURED VIEW SIZE - which
is why `space.dimensions` (8) sizes the container only.

### 5.4 Spawn, close, links, selection

- SPAWN: `PluridLink` (`components/links/Link`) - the in-space anchor. A click computes the child
  plane via `space.tree.logic.updateTreeWithNewPlane` / toggles via `togglePlaneFromTree`, joined
  to its parent by a bridge (`space.bridge.length` drives BOTH the parent->child gap and the
  rendered bridge, so they stay aligned). `useTreeUpdate`'s reconcile carries spawned children
  across relayouts (route + rounded-location key).
- CLOSE / REOPEN: `space.closePlane` / `space.openClosedPlane` topics or the plane controls;
  `lastClosedPlane` is tracked for reopen.
- LINKS: `state.space.links: PlaneLink[]` is an adjacency list, edited by the
  `addPlaneLink`/`removePlaneLink`/`updatePlaneLink`/`setPlaneLinks` reducers;
  `PluridPlaneLinks` renders them as beams positioned from the two planes' locations, inside the
  camera container. `elements.planeLinks.show` gates rendering.
- SELECTION: `selectedPlaneIDs` + `setSelection`/`toggleSelection`/`addToSelection`/
  `clearSelection`/`setDraggingSelection`; `transformSelectedPlanes` drag-moves the working set
  (setting `manuallyPositioned`); `snapSelection` snaps a released drag to the nearest
  edge-alignment within a 12 px threshold; `AlignmentGuides` previews exactly those snap lines
  mid-drag (same 12 px `THRESHOLD`, guide span 8000 px), rendering only the lines a release would
  actually snap to.


## 6. The state model

The store (`plurid-react source/services/state/`) is per-application-instance (3.1).
`services/state/modules/` holds exactly six slices: `configuration`, `general`, `shortcuts`,
`space`, `themes`, `ui`. `space` is the heart; the others are thin (merged configuration, general
flags, shortcut state, theme objects, engine-UI state).

The SPACE SLICE (`modules/space/index.ts`, RTK `createSlice` named `'space'`) groups into reducer
families:

- field setters: `setSpaceField`, `setSpaceLoading`, `setTransform`, `setAnimatedTransform`,
  `setTransformTime`, `setSpaceLocation` (scalars + matrix recompute);
- camera steps: `viewCameraMove{Forward,Backward,Left,Right,Up,Down}`,
  `viewCameraTurn{Up,Down,Left,Right}`;
- rotate: `rotateUp/Down/Left/Right`, `rotateX`, `rotateXWith`, `rotateY`, `rotateYWith`;
- translate: `translateUp/Down/Left/Right/In/Out`, `translateXWith`, `translateYWith`,
  `translateZWith`;
- scale: `scaleUp`, `scaleDown`, `scaleUpWith`, `scaleDownWith`, `zoomAtPoint` (section 4);
- fly: `flyMove` (section 4);
- declarative camera: `spaceResetTransform`, `spaceFitToView`;
- tree: `setTree`, `updateSpaceTreePlane`, `removePlane`;
- view/measure: `setViewSize`, `setSpaceSize`, `spaceSetView`, `spaceSetCulledView` (reducer exists
  but nothing dispatches it - see 12.6), `setActiveUniverse`;
- links: `addPlaneLink`, `removePlaneLink`, `updatePlaneLink`, `setPlaneLinks`,
  `updateSpaceLinkCoordinates`;
- selection: `setSelection`, `toggleSelection`, `addToSelection`, `clearSelection`,
  `setDraggingSelection`, `transformSelectedPlanes`, `snapSelection`;
- arrangement restore: `restoreArrangement` (raw, exact tree+links set - no reconcile);
- undo/redo MARKERS: `undo: (_state) => {}` and `redo: (_state) => {}` - deliberate no-op reducers;
  the actual work happens in the middleware, which intercepts the action types.

THE HISTORY MIDDLEWARE (`services/state/middleware/history.ts` : `createHistoryMiddleware`) is
spatial undo/redo over the AUTHORED arrangement (structure, pinned positions, links), keyed on
`arrangementSignature` (`services/logic/arrangement/signature`, also a public export):

- One snapshot per SIGNATURE change: a relayout reflow moves auto-layout positions but leaves the
  signature unchanged, so it is ignored - which is what lets a restore stick instead of being
  re-reconciled away. A real authoring change (plane added/removed/shown/hidden/moved, link
  edited) flips it and is recorded.
- STATELESS: it compares THIS action's before/after signatures (a tracked `lastSignature` would go
  stale across a skipped remote apply). Fast path: neither `tree` nor `links` changed reference.
- Snapshots are REFERENCES to the immutable slices (cheap); stack capped at `HISTORY_LIMIT` 100;
  a fresh user action clears the redo stack; `meta.remote` actions (a peer's collaboration apply)
  are skipped - a peer's change is not in YOUR undo.
- `space/undo` / `space/redo` pop and dispatch `space/restoreArrangement`.
- Dropped entirely (no per-action signature cost, no snapshot memory) when the merged
  `space.undo === false` (3.1); the topics then no-op.

THE PERSISTENCE CONTRACT (`plurid-engine source/modules/state/local`):

- `PERSISTED_STATE_VERSION = 2` - a stored snapshot with a different version is IGNORED on load
  (fresh space) rather than risking a partial mis-merge.
- `PERSISTED_SPACE_FIELDS` (13): `rotationX`, `rotationY`, `scale`, `translationX`, `translationY`,
  `translationZ`, `transform`, `camera`, `activePlaneID`, `isolatePlane`, `lastClosedPlane`,
  `tree`, `links`. Deliberately excluded: transient flags (`loading`, `resolvedLayout`,
  `animatedTransform`, `transformTime`), environmental sizes re-measured on mount (`viewSize`,
  `spaceSize`, `culledView`, `view`), and the other slices (they come from props/defaults).
- Keys: `pluridState-<id>` (the versioned space snapshot) and `pluridContent-<id>` (the OPAQUE
  product blob from `onPersistContent` - no version stamp; the content shape and its migration are
  the product's concern; the engine never inspects it).
- Backend: the caller's `storageAdapter` wins; else a `localStorage` adapter; else (SSR/no storage)
  every entry point no-ops. Writes are best-effort (full/private-mode storage is swallowed), but a
  SERIALIZATION failure warns once - it means a cycle/DOM/function ref leaked into the persisted
  fields, a real bug that would otherwise silently disable persistence forever.
- The debounce + pagehide/visibility flush around all of this lives in the Application shell (3.1).

`pluridSelectors` (`services/state/selectors`, public export) exposes the same derived-state
selectors the engine's own components use (`selectors.space.getTransform`, `.getTree`,
`.getSelectedPlaneIDs`, ...) so hosts read state off `api.store` without re-deriving.

THE STABILITY CONTRACT: the pubsub topics (7) and the public export list (Appendix A) ARE the API.
Action shapes and state shapes are NOT - `pluridStateModules` exports the action creators
deliberately (the power seam), but their payload/state internals may change between versions.
Anything reachable only by deep `distribution/` import is off-contract.


## 7. The pubsub protocol

The bus (`plurid-pubsub source/objects/PluridPubSub`) is minimal by design: `publish({ topic,
data })`, `subscribe({ topic, callback }) -> selector`, `unsubscribe(selector)`. Per topic it holds
a callback map; publish iterates the callbacks in a try/catch and SWALLOWS handler errors unless
the bus was constructed with `{ debug: true }` (then `console.log`s them) - when verifying handlers,
turn `debug` on. The bus is PER-INSTANCE (one per `PluridApplication`, host-injectable via the
`pubsub` prop, handed out via `onReady(api).pubsub` and injected into every plane as
`plurid.pubSub`); topics are instance-scoped, not global.

The topic catalog is `plurid-data source/constants/pubsub/index.ts` : `PLURID_PUBSUB_TOPIC` -
exactly 51 constants (counted 2026-07-02). Directions: `host -> engine` = a control topic the
engine subscribes; `engine -> host` = the engine publishes, hosts subscribe; `declared` = in the
catalog + typed message shapes, but NO in-repo subscriber today (kept for wire compatibility;
directional nudges ride the shortcut/dispatch paths instead). Unless noted, subscription happens in
the View bridge `usePluridPubSub` (35 topics).

| Constant | Topic string | Direction | Handled in |
|---|---|---|---|
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
| CHANGED | `space.changed` | engine -> host (emit) | useEngineEvents |
| SET_PLANE_PATH | `plane.setPath` | declared | - |

Notes on the special rows:

- THE OBSERVE CHANNEL: `space.changed` publishes `{ kind, value }` whenever a watched slice's
  reference changes. The kinds (verified in `useEngineEvents` and typed as `PluridChangeKind` in
  plurid-data): `selection`, `tree`, `links`, `activePlane`, `isolate`, `layoutResolved`,
  `loading` - seven, one subscription covers all. The camera is intentionally NOT here (per-frame);
  use `onViewpointChange` / `getViewpoint()`.
- COLLABORATION: the engine PUBLISHES `space.collaborationMutation` when the shared arrangement
  changes; a host forwards it over its own transport and republishes incoming peer changes as
  `space.applyRemoteMutation` (applied with `meta.remote`, so it skips the local undo history).
- INTERNAL RE-PUBLISH: the bridge also PUBLISHES `space.transform` and `configuration` with an
  `internal: true` flag whenever state changes, so external subscribers can observe them; the
  flag is how the bridge's own subscriptions ignore the echo.
- `space.refreshPlane` is subscribed INSIDE each `Plane` (each instance filters for its own id) -
  the one control topic not living in the View bridge. `useViewpointURL` handles no topics (it
  binds the URL only); `space.setViewpoint` is bridged in `usePluridPubSub` like the rest.

This section is the WIRE CATALOG. Usage snippets, payload examples, and the tier framing live in
[`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md) - the two documents deliberately do not duplicate each
other.


## 8. The configuration system

`PluridConfiguration` (`plurid-data source/interfaces/external/configuration`) has five sections:
`global`, `elements`, `space`, `network`, `development`. The complete defaults live in
`plurid-data source/constants/configuration` (`defaultConfigurationGlobal`, `...Elements`,
`...Space`, `...Network`, `...Development`, assembled as `defaultConfiguration`).

Three ways in, one merge path:

1. NESTED PARTIAL: the `configuration` prop takes a `PluridPartialConfiguration` (a
   `RecursivePartial`), merged over the defaults.
2. FLAT SHORTHAND: `definePluridConfiguration(flat)` (`plurid-engine
   source/modules/general/configuration` : `definePluridConfiguration`) expands
   `FlatPluridConfiguration`'s one-level fields to their nested locations (`theme` ->
   `global.theme`, `layout` -> `space.layout`, `planeWidth` -> `elements.plane.width`,
   `spaceDimensions` -> `space.dimensions`, `undo` -> `space.undo`, ...), layers `extend` (a normal
   nested partial) LAST so it wins over the flat fields, and returns a complete configuration.
3. PER-ROUTE: a route can carry `defaultConfiguration`, which seeds that route's application state
   during SSR metastate compute (`serverComputeMetastate` reads `isoMatch.data.defaultConfiguration`).

The merge itself (`configuration/index.ts` : `merge`) clones the defaults and the target
(cycle-safe `objects.clone` - the default path is a deep clone handling Date/Map/Set/RegExp and
cyclic references, never the throw-on-cycle JSON round-trip), then runs `objects.merge`
(`plurid-functions source/functions/objects` : `merge`) with a `'global.theme'` resolver that
normalizes a theme name or `{ general, interaction }` object. `objects.merge` is UNION-KEYED: it
recurses on sub-nodes and unions BOTH sides' keys at each level, so a field present in the partial
but absent from the defaults is KEPT (the historical merge iterated only the base's keys and
silently dropped such fields); it recurses into PLAIN objects only (class instances/Date/Map are
leaf values merged by reference), honors dot-path `resolvers` (including falsy resolver values),
and is O(total keys).

LIVE RECONFIGURATION: publishing on the `configuration` topic dispatches `setConfiguration` with
the new (partial) configuration - the same merge applies, and dependent hooks re-read their knobs
from the store.

NEW this round: `space.dimensions` (`PluridConfigurationSpaceDimensions`, flat alias
`spaceDimensions`) - opt-in explicit sizing of the roots container, consumed in
`plurid-react components/structural/Roots` via `resolveDimension` (number = px, string passes
through: `'100%'`, `'60vh'`); defaults preserve the historical behavior (width `'100%'`, height
`window.innerHeight`). LIMITATION (by design, stated in the interface doc): the layout algorithms
still compute plane spacing from the MEASURED view size; `dimensions` sizes the container only.

Knob-by-knob reference (every `space.*`/`elements.*` option with a snippet):
[`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md).


## 9. The SSR pipeline (plurid-react-server)

`plurid-react-server source/objects/Server/index.ts` : `PluridServer` - an Express 5 app. The
package's top level exports `PluridServer` (default), `PluridLiveServer`, `PluridStillsGenerator`,
and the external interfaces (Appendix A).

CONSTRUCTION: stores `routes`, `planes`, `preserves`, `helmet` (react-helmet-async context),
`styles`, `middleware`, `exterior`, `shell`, `routerProperties`, `services`, `template`,
`usePTTP`/`pttpHandler`, `elementqlEndpoint`; resolves `options` via `handleOptions` (serverName,
hostname, debug defaulting to `error` in production / `info` otherwise, compression, directories,
`publicDirectory` default `''`, staticCache, ignore list, stills options, `attachSignalHandlers`
default true - a bound SIGINT/SIGTERM handler registered once and removed in `stop()`); builds a
`PluridStillsManager` and a `PluridIsoMatcher` over routes + planes; registers the endpoints
(catch-all GET + optional PTTP POST).

`configureServer` (run at start): disables `x-powered-by`; stamps a request id + start time;
`compression` when enabled, plus a `/vendor.js` handler that rewrites to `vendor.js.br` when the
client accepts brotli and the file exists; `express.static(<buildDirectory>/client)`; then the
PUBLIC DIRECTORY battery - `options.publicDirectory` or `<buildDirectory>/public`, mounted at `/`
with `index: false` (so it cannot hijack the `/` SSR route) and SKIPPED unless the directory exists
(apps without one are byte-identical to before); then the user `middleware` chain.

THE REQUEST WALK (`handleGetRequest`), in order:

1. `ignoreGetRequest` - `options.ignore` exact paths and `/*` prefixes fall through to `next()`.
2. `resolvePreserve` - find the preserve for this route (a catch-all preserve wins; the not-found
   preserve applies when nothing matches). Its `onServe(transmission)` gets
   `{ context: { route, match }, request, response }` and can: respond itself (`responded: true`
   short-circuits), return `redirect` (an `http...` redirect answers 302), and return `globals`
   (serialized into the page - the app's own preloaded state, e.g.
   `__PRELOADED_REDUX_STATE__`) plus per-request `providers` and `template` additions. `onError`
   can respond or `depreserve`; `afterServe` runs after the response.
3. STILLS CACHE - `this.stills.get(matchingPath)`: a pre-generated static HTML still is served
   verbatim instead of rendering (404s check a not-found still first, too).
4. `isoMatcher.match(matchingPath, 'route')` - no match walks the 404 ladder: not-found still ->
   not-found route rendered -> bare `NOT_FOUND_TEMPLATE`.
5. `renderApplication(isoMatch, preserveResult)` -> `response.send(await renderer.html())`.
6. Any thrown error -> 500 with `template.errorHtml || SERVER_ERROR_TEMPLATE` (the errorHtml
   battery).

`renderApplication`:

- `serverComputeMetastate(isoMatch, routes, globals, hostname)` - imported FROM `@plurid/plurid-react`
  (`services/logic/server` : `serverComputeMetastate`): computes, per plurid application on the
  matched route, the preloaded engine state (configuration merged with the route's
  `defaultConfiguration`, the COMPUTED PLANE TREE, themes, SSR-safe view sizes) - the state the
  client store hydrates from.
- `getContentAndStyles` -> `PluridContentGenerator` (`objects/ContentGenerator/index.tsx`): builds
  `PluridProvider metastate > PluridRouterStatic (path, directPlane, routes, planes, exterior,
  shell, ...)`, wraps it in `HelmetProvider` (`utilities/wrapping` composes provider layers), then
  wraps EACH `services[{ name, Provider, properties }]` entry outward IN ORDER - merging the
  per-request `preserveResult.providers[name]` OVER the static `service.properties` (verified in
  ContentGenerator's render loop). The whole stack renders through styled-components'
  `ServerStyleSheet` via `renderToString`; `styles = stylesheet.getStyleTags()`.
- Head assembly: react-helmet-async output first, then `buildStaticHead()` - the template-config
  battery that emits the favicon set (string shorthand or `{ icon, apple, sizes, maskIcon,
  themeColor }`), `manifest`, and default `head` title/description/meta/links, ALL
  attribute/text-escaped (XSS-safe), returning `''` when unconfigured so existing apps' heads stay
  byte-identical. Per the source comment, the static head is placed after the helmet output so
  per-route `<Helmet>` tags override these defaults.
- `PluridRenderer` (`objects/Renderer`) renders the template (`objects/Renderer/template`):
  html lang + attributes, head, defaultStyle, collected styles, headScripts, the VENDOR script tag
  emitted ONLY when `vendorScriptSource` is truthy - so the empty string `''` SKIPS it (the
  battery the kit uses for its single-bundle output), the deferred main script (default
  `/index.js`), the root div with the SSR content, the injected `globals` from the preserve, and
  `window.__PRELOADED_PLURID_METASTATE__ = <safeStore(metastate JSON)>` (name configurable via
  `template.defaultPreloadedPluridMetastate`; `safeStore` escapes the JSON against script
  breakout), body scripts, optional minify via `cleanTemplate`.

THE HYDRATION CONTRACT, two window globals:

- `__PRELOADED_PLURID_METASTATE__` - emitted by the Renderer, consumed by `PluridProvider
  metastate` on the client (each `PluridApplication` picks its `precomputedState` from it).
- `__PRELOADED_REDUX_STATE__` - the CONVENTION for the app's own store state: a preserve returns it
  in `globals`, the client rebuilds its service store from it (the kit does this in
  `createPluridClient`; legacy apps hand-roll the same in `Client.tsx`).

Escape hatches and the rest of the object:

- `handle()` returns `{ post, patch, put, delete }` registrars on the underlying Express app, and
  `instance()` returns the app itself - custom API routes without leaving the server.
- PTTP (`usePTTP`, default on): a POST protocol endpoint that resolves a plane path to its element
  payload; `pttpHandler` can take over.
- STILLS: `PluridStillsGenerator` boots the server, drives a headless browser over the routes and
  writes static HTML stills; `Stiller` owns the browser (PUPPETEER IS AN OPTIONAL PEER, `>= 22` -
  apps that never generate stills do not install it); `StillsManager` loads them at runtime (step 3
  of the walk).
- `PluridLiveServer` is a STUB - its setup/start are unimplemented and fail loudly
  (`objects/LiveServer`).


## 10. plurid-kit, the framework layer

`plurid-works/plurid-kit` - the Next.js-shaped layer over plurid-react-server: one
`plurid.config.ts` replaces each app's hand-written `server/index.ts`, `client/index.tsx`, and
`scripts/` directory. STATUS: built, jest-tested, README/LICENSE in place, bin `plurid` -
UNPUBLISHED at `0.0.0-0`; the plan of record is [`FRAMEWORK_PLAN.md`](./FRAMEWORK_PLAN.md).

THE CONTRACT (`source/index.ts`): `defineConfig(config: PluridConfig)` - an identity function for
editor types. `PluridConfig` groups: identity (`serverName`, `hostname`, `root`); the product
surface (`routes`, `planes`, `shell`, `exterior`, `routerProperties`, `customPlane`); the SHARED
service stack (`services: PluridServiceConfig[]` - `{ name, Provider, properties, client, store,
context, order }`, used identically on both targets so provider order can never drift); server-only
data loading (`preserves`, `load` sugar); document head (`head`, `favicon`, `manifest`, `styles`);
error pages; static + build (`publicDir`, `buildDir`, `usePTTP`, `elementqlEndpoint`,
`bundle: PluridBundleConfig`); Express extension (`middleware`, `handlers`); and the raw
passthrough escape hatches (`options`, `template`).

`ServerOnly<T>` (`source/index.ts` : `ServerOnly`) is the client-bundle firewall: a value OR a
thunk (`() => import('./server/preserves')`); `resolveServerOnly` (`source/shared`) calls the
thunk, awaits, and unwraps a `{ default }` namespace - so server-only modules (data loaders,
requesters, secrets) are loaded only inside `createPluridServer` and never enter the client graph.

`createPluridServer(config)` (`source/server` : `createPluridServer`) projects the config onto
`PluridServerConfiguration`: services via `orderedServices` + `serviceProperties(service,
'server')` (a base `store(undefined)`; the preserve overrides per request); preserves resolved +
`load` appended; the template folded from `root`/`favicon`/`manifest`/`head` with
`vendorScriptSource: ''` ALWAYS (the kit emits a single client bundle in dev AND prod, so the
vendor `<script>` is skipped in both - the historical `/vendor.js` 404 fix) and, in production,
`mainScriptSource` read from the build's `asset-manifest.json`; options with `publicDirectory`
defaulting to `source/public` in development; then `new PluridServer(...)` and the server-only
`handlers(server)` thunk for custom routes. `startPluridServer` additionally starts it on
`process.env.PORT`.

`createPluridClient(config)` (`source/client` : `createPluridClient`) hydrates with the IDENTICAL
provider-wrap algorithm the server uses (same `orderedServices`/`serviceProperties` from
`source/shared`): innermost `PluridProvider > PluridRouterBrowser`, wrapped by `HelmetProvider`,
then each service wrapped OUTWARD in the same order; per-request state read from
`__PRELOADED_REDUX_STATE__` (into the service `store(preloadedState)` factory) and
`__PRELOADED_PLURID_METASTATE__` (into `PluridProvider`); then `hydrateRoot`. Context providers
emit no DOM, so the hydrated markup matches the server render exactly.

THE CLI (`source/cli`): `plurid dev | build | start | info`. `dev` = esbuild client+server builds,
watch + relaunch, default port 33721 or `$PORT`; `build` = production build to
`build/{index.js, client/**, public/**}` plus `build/asset-manifest.json`; `start` = run
`build/index.js`; `info` = print the resolved environment/entries. NEW this round:
`loadPluridConfig` (`source/cli/config.ts` : `loadPluridConfig`) - the CLI now LOADS
`plurid.config.ts` by esbuild-bundling it to `node_modules/.plurid-kit/plurid.config.cjs` with bare
imports externalized (importing the config never drags the app's runtime modules into the CLI
process), cache-busted per load; absence tolerated (`{}` - convention alone works). The `bundle.*`
knobs are wired into BOTH `dev` and `build`: `clientExternals`, `forceBundle`, `define`, `loaders`,
`environment`.

The esbuild layer (`source/cli/esbuild.ts`) bakes in the two styled-components v6 workarounds every
legacy app carried by hand, both applied in `clientBuildOptions`:

1. `define['process.env.SC_DISABLE_SPEEDY'] = 'true'` - production style injection.
2. `styledComponentsBrowserAlias()` - alias `styled-components` to the app's OWN
   `dist/styled-components.browser.esm.js` (esbuild's browser resolution otherwise lands on the CJS
   browser build, whose default-export interop breaks `styled.div` under bundling - the fleet's
   "black screen"). GUARDED: no styled-components installed, or a future layout without that file,
   -> no alias.

The server build uses the `externalizeBare` plugin: bundle the app's own source (`.`/`/`/`~`
paths), force-bundle explicit ids, externalize every other bare import to runtime `require`.
`templates/production.dockerfile` ships the production container recipe.


## 11. The control surface, tiered

The canonical per-knob reference is [`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md) - this document
explains the machinery and never duplicates its snippets. The map:

| Tier | Surface | Machinery |
|---|---|---|
| 0 | `onReady(api)` - `{ store, pubsub, getSnapshot, getViewpoint }`, fired once post-mount | section 3.1 |
| 1 | pubsub CONTROL (fit/reset/undo/redo/setTree/setViewpoint/selection/links/...) + OBSERVE (`space.changed` kinds, `onViewpointChange`) | sections 7, 4 |
| 2 | opt-outs of the always-on: `space.undo: false` (drops the middleware), `storageAdapter` + `onPersistContent`/`onRestoreContent` (redirect/extend persistence), `space.timings` (debounce windows) | sections 6, 3.1 |
| 3 | granular knobs (`space.gestures`, `space.shortcuts` + `onUnhandledKey`, `transformLocks`, `space.dimensions`, `elements.*`), UI slots (`renderToolbar`/`renderViewcube`/`renderMinimap`/`renderShortcuts`), exported primitives (`pluridSelectors`, `arrangementSignature`, viewpoint codec, engine modules) | sections 8, 3.4, 13 |

Design rule (the granular-control principle): every imposed behavior has an opt-out, every engine
action a programmatic trigger, every state change an observation seam, and the escape hatch covers
the unanticipated rest.


## 12. Consumption modes

### 12.1 Mode A - route planes + exterior via PluridServer

The app hands `PluridServer` routes whose definitions carry planes (and optionally a per-route
`defaultConfiguration`), plus `exterior`/`shell` components. SSR computes the metastate (the
per-application preloaded engine state including the computed tree), `PluridRouterStatic` renders
route exterior + the plurid application server-side, and `PluridRouterBrowser` hydrates - route
navigation swaps spaces, planes are the content. This is the full "planes are pages" shape.

### 12.2 Mode B - direct PluridApplication embed

A component island: render `<PluridApplication planes={...} view={...} configuration={...} />`
anywhere in any React tree (no PluridServer required). The instance owns its store/pubsub (3.1);
`space.dimensions` sizes it into a host container (8). This is the render-test harness's shape and
the recommended shape for products embedding one space.

### 12.3 Mode C - no-3D PluridServer

Routes WITHOUT planes: PluridServer as an SSR router/shell only - preserves for data, services for
providers, the template for the document; no space is mounted. Most of the consumer fleet runs
this mode today.

### 12.4 The consumer reality

External measurements, all as measured 2026-07-02 (applications workspace; the separate consumer
monorepo, not this repo):

- 42 `de-` applications ride the engine (modes A-C above).
- The duplicated glue the kit exists to delete: approx 7,000 LOC of near-identical
  `server/index.ts` across the fleet, approx 2,700 LOC of `Client.tsx`, approx 37,000 LOC of
  hand-rolled per-app state modules.
- Control-surface adoption before this round: ZERO. denote worked around the missing seams with
  `window` globals for the pubsub, `setTimeout`-after-mount sequencing, and a hand-rolled
  `localStorer` + `historyPlayer` for persistence and camera history.
- depict (355 files) and deview (245 files) hand-roll `ImagePlane`/`VideoPlane` as PLAIN React
  outside the space - media UIs that never became planes because the plane-content seams did not
  exist.
- Kit adoption: one inert `plurid.config.ts` in denote (written, not yet driving the app;
  publish pending).

### 12.5 The replacement map

Each fleet hack maps onto a shipped seam:

| Current hack (fleet) | The seam that replaces it |
|---|---|
| `window.pluridSpacePubSub` globals | `onReady(api)` - the api owns store + pubsub (3.1) |
| `setTimeout`-after-mount sequencing | `onRestoreContent` + the `space.changed` observe channel (3.1, 7) |
| hand-rolled `localStorer` | `storageAdapter` + `onPersistContent`/`onRestoreContent` (6) |
| `historyPlayer` camera persistence | the viewpoint codec + `SET_VIEWPOINT` + `onViewpointChange` (4) |
| forked overlay components | `renderToolbar`/`renderViewcube`/`renderMinimap`/`renderShortcuts` slots (3.4) |
| tolerated unknown-prop console spam | fixed ui-components styled factory + `pluridShouldForwardProp` (Appendix A) |
| hand-rolled per-app state modules | `composePluridUIState` (plurid-ui-state-react) |
| plain-React media UI outside the space | `usePluridPlane` consumer planes (12.6) |
| per-app `server/index.ts` + `Client.tsx` + `scripts/` | plurid-kit `plurid.config.ts` + CLI (10; post-publish) |

### 12.6 Building a media plane as a consumer (the recipe)

The engine ships NO media components, deliberately - a media app is a CONSUMER of the plane
substrate. The working example is `fixtures/render-test/src/MediaPlane.tsx` (behind `?media=1`).

1. OWN PLANE COMPONENT, registered via `planes`/`routes` like any plane; the media id comes from
   the injected `plurid.plane.parameters` / `plurid.plane.query` (3.4).
2. LIVE SIGNALS via `usePluridPlane()` -> `PluridPlaneLens` `{ planeID, active, selected,
   isolation, shown, scale, viewSize, location }` (`plurid-react source/services/hooks/plane`).
   Field subscriptions are per-primitive (the engine's own granular-derived pattern), so the
   content re-renders only when a consumed value changes - not per orbit frame. Valid only under a
   `PluridApplication`; outside plane content (exteriors, overlays) `planeID` is `undefined` and
   the plane-derived fields are inert.
3. PAUSE RULE: pause playback when `!active`, or `isolation === 'other'` (another plane is
   isolated; this content is faded/inert), or `!shown`. Pick asset quality from `scale`.
4. OFF-SCREEN DETECTION: there is NO `visible` field - `culledView` exists in state but is NOT
   computed (6). Use `IntersectionObserver` on the plane content (it works under CSS 3D
   transforms), or compute from `location` + `scale` + `viewSize` yourself.
5. SIZING: width is the PLANE's (the global `elements.plane.width` knob); make height
   content-driven (`aspect-ratio` + `object-fit`) inside it.
6. ENGINE COORDINATION via the injected `plurid.pubSub` - e.g. publish `ISOLATE_PLANE` on play to
   focus the plane.
7. LOAD-ONCE: `PluridExternalPlane` is the reference content-loader - a `loadStarted` ref guards
   the fetch so React 19 StrictMode's double-invoke cannot double-load
   (`components/planes/ExternalPlane`). Copy that pattern for your own loaders.
8. NEVER AUTOPLAY - playback is user- or host-driven (the granular-control principle).


## 13. Extension points

- RENDER SLOTS: `renderToolbar`/`renderViewcube`/`renderMinimap`/`renderShortcuts` - replace an
  engine overlay wholesale (3.4).
- `customPlane`: replace the internal plane implementation itself; `Root` renders it instead of
  `PluridPlane`, passing `{ plane, treePlane, planeID, location }` (3.4).
- SHIPPED PLANE COMPONENTS: `PluridExternalPlane` (fetch-and-render external content, the
  load-once reference), `PluridIframePlane`, `PluridVirtualList`.
- `usePluridPlane()` (NEW): the plane-content lens - live per-plane signals for content-heavy
  consumers (12.6).
- `storageAdapter`: any key->string backend for ALL engine persistence (6).
- COLLABORATION SEAM: transport-agnostic, opt-in (`space.collaboration`); the engine
  emits/applies arrangement mutations, the host owns the wire (7).
- `space.shortcuts.onUnhandledKey`: the host receives every key the engine did not consume
  (`services/logic/shortcuts`); plus `disabled`/`keymap` remapping.
- SSR: the `services` provider array (per-request props via `preserve.providers[name]`),
  `handle()`/`instance()` for custom Express routes, `middleware` (9).
- THE `internals` EXPORT (verified in `plurid-react source/index.tsx`): `{ PluridPlaneBridge,
  PluridPlaneContent, PluridPlaneControls, PluridPlaneDebugger, PluridSpaceDebugger }` - the
  structural pieces, for hosts recomposing plane chrome.
- ENGINE PRIMITIVES off `@plurid/plurid-engine`: `space.tree` (compute/reconcile), `space.location`
  and `interaction` (matrix/geometry) - the same building blocks the adapter uses, for custom
  layout/controls without forking; plus `pluridSelectors` + `arrangementSignature` off
  `@plurid/plurid-react`.

Where NOT to extend: action/state SHAPES (exported as a power seam, not a stable contract - 6),
and `distribution/` deep imports (build artifacts, no compatibility promise).


## 14. Verification harness and gates

`fixtures/render-test` - the CAD verification harness: Vite + React 19 against the workspace
engine, port 5273 (verified: `"dev": "vite --port 5273"` in `fixtures/render-test/package.json`).
Content: 5 CAD instrument panels (GEOMETRY, TRANSFORM, MATERIAL, TOPOLOGY, TESSELLATION), a
40-plane stress set, a link-spawned detail plane (`/geometry/detail`, registered but NOT in the
initial view - spawned by the PluridLink), and the 5 layout toggles + STRESS + PERSIST buttons.

Every verification feature is DEFAULT-OFF behind a query param (`src/App.tsx`, complete list):

| Param | Exercises |
|---|---|
| `?undo=0` | `space.undo: false` - the history middleware dropped |
| `?store=memory` | persistence routed to an in-memory adapter (`window.__rtStore`) |
| `?persistMs=<n>` | `space.timings.persistDebounce` override |
| `?rotateSens=<n>` | `gestures.rotateSensitivity` |
| `?dragThreshold=<n>` | `gestures.dragThreshold` |
| `?btnLeft=orbit\|pan\|zoom\|disabled` | `gestures.buttonMap.left` |
| `?btnWheel=zoom\|disabled` | `gestures.buttonMap.wheel` |
| `?scDisable=all` or `?scDisable=<ids>` | `shortcuts.disabled` |
| `?scRemap=<id>:<code>,...` | `shortcuts.keymap` |
| `?slotToolbar=1` | the `renderToolbar` slot |
| `?hideLinks=1` | `elements.planeLinks.show` + `alignmentGuides.show` false via `extend` |
| `?media=1` (NEW) | the consumer media plane - `usePluridPlane` lens, lazy image, button video |
| `?spaceW=<n>` / `?spaceH=<n>` (NEW) | `space.dimensions` roots-container sizing |

Assertion globals published on `window` for tests: `__pluridApi` (the `onReady` api),
`__rtViewpoint` (last `onViewpointChange`), `__rtContent`/`__rtRestored` (the content persistence
round-trip), `__rtStore` (the memory adapter's map), `__rtUnhandled` (unhandled key codes),
`__rtRootsSize()` (the applied roots container size), `__rtPlaneLens` (the live lens values),
`__rtMediaImageLoaded`. The harness is also the reference for driving the REAL topic strings
against a live instance - remember publish swallows handler errors unless the bus has
`debug: true` (7).

`examples/{minimal,control-surface}` - copy-pasteable single-file references, type-correct against
the public API: `minimal` is three planes / zero configuration; `control-surface` exercises every
tier in one component.

Gates (root `package.json`): `pnpm build` = `pnpm -r build`; `pnpm test` = `pnpm -r test`;
`pnpm lint` = eslint over core + works + utilities + the harness src. `plurid-react` additionally
has `check` (`tsc --project ./configurations/tsconfig.check.json`). CI
(`.github/workflows/ci.yml`): Node 24, pnpm from `packageManager`, frozen lockfile, then
build + test + lint.


## Appendix A - public API inventory

The verbatim export lists, transcribed from the sources on 2026-07-02. THIS APPENDIX IS THE LIST
EVERY OTHER DOC MUST AGREE WITH; when an export changes, this section re-anchors first.

### @plurid/plurid-react (`source/index.tsx`)

Value exports (the named `export { ... }` block, in source order):

```
PluridApplication
PluridRouterBrowser
PluridRouterStatic
PluridProvider
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
getDirectPlaneMatch
encodeViewpoint
decodeViewpoint
pluridStateModules
pluridSelectors
arrangementSignature
internals
```

plus `export default Plurid` (the aggregate object mirroring the above:
`Plurid.Application`, `.Link`, `.PubSub`, `.PUBSUB_TOPIC`, `.IsoMatcher`, `.routerNavigate`,
`.encodeViewpoint`/`.decodeViewpoint`, `.selectors`, `.arrangementSignature`, `.internals`, ...).

Type exports (`export type { ... }` blocks, in source order):

```
PluridPlaneLens
PluridPlaneIsolation
Theme
PluridPlane
PluridView
PluridUniverse
PluridRouterProperties
PluridRouterPartialProperties
PluridRoute
PluridRouteSpace
PluridRouteUniverse
PluridRoutePlane
ComponentWithPlurid
PluridPlaneComponentProperty
PluridRouteComponentProperty
PluridReactComponent
PluridReactPlane
PluridReactPlaneComponent
PluridReactRouteComponent
PluridReactRoute
PluridReactRoutePlane
PluridRouteMatch
PluridPreserve
PluridPreserveTransmission
PluridPubSubPublishMessage
PluridPubSubSubscribeMessage
PluridApi
PluridStore
PluridStorageAdapter
PluridConfiguration
PluridPartialConfiguration
FlatPluridConfiguration
RecursivePartial
```

(`PluridPlaneLens` / `PluridPlaneIsolation` are NEW this round, from `./services/hooks/plane`;
the type-only blocks use `export type` so esbuild's per-file transpile elides them at runtime.)

### @plurid/plurid-react-server (`source/index.ts`)

```
default: PluridServer
PluridLiveServer
PluridStillsGenerator
```

plus `export * from './data/interfaces/external'`, which is exactly (12 exports):

```
PluridServerMiddleware
ServerRequest
DebugLevels
PluridServerOptions
PluridServerPartialOptions
PluridServerService
PluridServerConfiguration
PTTPHandler
PluridServerTemplateConfiguration
PluridStillerOptions
PluridPreserveReact
PluridLiveServerOptions
```

### @plurid/plurid-kit

Root (`.` - `source/index.ts`): value `defineConfig`; types `ServerOnly`, `PluridHeadMeta`,
`PluridHeadLink`, `PluridHead`, `PluridFaviconSet`, `PluridFavicon`, `PluridServiceConfig`,
`PluridBundleConfig`, `PluridConfig`, plus re-exported types `PluridServerConfiguration`,
`PluridServerOptions`, `PluridServerService`, `PluridServerMiddleware`,
`PluridServerTemplateConfiguration`, `PluridPreserveReact`.

`./server` (`source/server/index.ts`): `createPluridServer`, `startPluridServer`.

`./client` (`source/client/index.tsx`): `createPluridClient`.

Bin: `plurid` (`distribution/cli/index.js`) - commands `dev | build | start | info`.

### @plurid/plurid-ui-state-react (additions this round)

`composePluridUIState(overrides?)` (`source/compose`) -> `{ reducers, actions, selectors,
initialStates }` over the FIVE modules `head`, `notifications`, `shortcuts`, `sitting`, `themes`;
types `PluridUIState`, `PluridUIStateOverrides`. Overrides are partial initial states spread over
each module's defaults (`notifications`, an array slice, REPLACES); RTK action types are
name-derived, so the default `actions` drive the override reducers.

### @plurid/plurid-ui-components-react (addition this round)

`pluridShouldForwardProp` (`source/utilities/styled`, re-exported from `source/index.ts`) - the
prop filter all 48 of the library's styled files use via the shared filtered `styled` factory:
`@emotion/is-prop-valid` plus the `STYLE_ONLY_PROPS` deny-set `{ 'size', 'selected' }` (style-only
props that are ALSO valid HTML attributes); composed `styled(Component)` targets forward
everything. Exported so applications reuse the exact semantics in their own
`<StyleSheetManager shouldForwardProp={pluridShouldForwardProp}>`.


## Appendix B - doc map and authority order

| Document | Authority over | Notes |
|---|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) (this) | HOW IT WORKS - structure, pipelines, contracts, the wire catalog | descriptive; re-verified when source moves |
| [`CONTROL_SURFACE.md`](./CONTROL_SURFACE.md) | HOW YOU DRIVE IT - every knob/seam with a snippet, tiered | the canonical per-knob reference |
| [`../CONTEXT-MAP.md`](../CONTEXT-MAP.md) | PACKAGE STATUS - live/legacy/archived, gates, governance | per-package table; this doc links, never duplicates |
| [`ENGINE_AUDIT_AND_ROADMAP.md`](./ENGINE_AUDIT_AND_ROADMAP.md) | DEFECT + REFACTOR LEDGER - findings and their phases | audit lens |
| [`ENGINE_FEATURE_ROADMAP.md`](./ENGINE_FEATURE_ROADMAP.md) | CAPABILITY HISTORY + PLANS - what shipped when, what is next | feature lens |
| [`FRAMEWORK_PLAN.md`](./FRAMEWORK_PLAN.md) | THE KIT - plurid-kit plan of record (P0-P5) | section 10's future tense lives here |
| [`CODEBASE_DEEP_CRITIQUE.md`](./CODEBASE_DEEP_CRITIQUE.md) | HISTORICAL SNAPSHOT (2026-06-19) | pre-modernization state; do not cite as current |
| package `README.md`s | npm-facing per-package intro | usage-first, not architecture |

Also: [`../GETTING_STARTED.md`](../GETTING_STARTED.md) (use the engine),
[`../CONTRIBUTING.md`](../CONTRIBUTING.md) (work on it), [`../examples/`](../examples/) (runnable
references), [`../fixtures/render-test/`](../fixtures/render-test/) (the harness).

On conflict: source wins; then this document and CONTROL_SURFACE for behavior; CONTEXT-MAP for
status; the roadmaps for intent. A doc that disagrees with Appendix A's export lists is stale.
