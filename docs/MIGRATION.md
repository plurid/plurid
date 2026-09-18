# Migrating to the next release (unreleased, in progress since 2026-09-16)

The defaults below change how a space LOOKS the moment the pins move. Every one of them is a
configuration value; a host that wants the old picture names the old value. The section for the
2026-09-13 release follows unchanged.

## 1. Behaviours that now default to something else

| knob | was | is | what changes, and how to keep the old picture |
|---|---|---|---|
| `space.bridge.planeAngle` | `90` | `90.1` | a spawned child stands a tenth of a degree past perpendicular. 90 exactly is a zero-width quad CSS 3D mishandles (hit tests miss, paints flicker); 90.1 keeps every quad a quad and reads no differently. `bridge: { planeAngle: 90 }` puts it back. |
| `space.bridge.fan` | `fixed` | `alternate` | a grandchild turns back to its grandparent's facing, beside and behind the fin, so a chain of any depth reads from one yaw as a receding staircase and nothing ever reaches 180° and mirrors. `fan: 'fixed'` puts it back. |
| `space.bridge.anchor` (new) | `link` | `edge` | the bridge leaves the parent's RIGHT EDGE at the link's height, so the child stands clear of its parent's silhouette; siblings from one parent take longer bridges (`length + i·(childWidth + 50)`) and line up side by side rather than coincide, the later ones drawn as leashes. `anchor: 'link'` puts it back. |
| `space.bridge.preset` (new) | - | `reading` | a name for the three above; `preset: 'objects'` is the whole old geometry (90, fixed, from the link) in one word, and any field named beside it wins over it. |
| `elements.plane.backface` | `visible` | `hidden` | a plane seen from behind no longer paints mirrored. With the alternating fan nothing faces away; `backface: 'visible'` puts it back. |
| `space.navigation.childFraming` (new) | - | `pair` | a spawn and a link click frame the child AND its parent from the yaw between them (`−45.05°` for a 90.1° child: each at 0.706 of its width) instead of the child alone face-on, which left the parent edge-on. `childFraming: 'plane'` puts it back. An EXPLICIT frame of one plane faces it: `space.navigateToPlane`, Alt+F, Alt+B and Enter on a plane's anchor land face-on (`space.navigateToPlane { framing: 'pair' }` asks for the pair). |
| `space.navigation.fitYaw` (new) | - | `best` | `space.fitToView`, the toolbar's fit and `0` turn to the yaw that maximises the narrowest plane's projected width (`bestYaw`) and frame every plane by its real corners, so a space of roots and their branches reads as one picture; a space of roots alone still fits from the front. `fitYaw: 'front'` puts it back. `faceOn: false` on the topic still keeps the current yaw. |
| `space.gestures.dragHandle` (new) | the whole plane | `chrome` | a selected plane is dragged by its controls bar (or anything a host marks `data-plurid-drag-handle`), its buttons included (a click without movement still clicks); a press on its CONTENT is the page's again, so a word in a selected plane can be selected with the mouse, `dragHandle: 'plane'` puts the whole plane back in hand. |
| `space.docking.scale` (new) | - | `fill` (unchanged) | `natural` caps the dock scale at 1, so a plane smaller than the view is read at its own size rather than magnified (a 460px card on an 800px view docks at 1.39 under `fill`). NOT the default, on purpose: under `natural` a plane centred at scale 1 IS its dock pose, so a space that centres a root at 1 boots docked on it and hides its chrome. Choose it only where no plane is ever framed so. |

## 2. Semantic changes

- **`space.movePlanes` leaves the selection alone and pins only when asked.** It used to select the planes it named (clobbering whatever the reader had in hand) and pin every plane it moved. Now: `{ planeIDs?, deltaX, deltaY, deltaZ?, frame: 'world' | 'plane', pinned }` moves the planes named (else the selection), touches no selection, pins only with `pinned: true`, and with `frame: 'plane'` moves along each plane's own axes (`deltaX: 100` on a plane turned 90.1° goes along world z). A move that pins is one history step; an unpinned move is the layout's to keep or not, and no step. A host that relied on the old selection or pin: pass `pinned: true`, and select with `space.setSelection` if it meant to.
- **`space.pinPlane`** (new): `{ planeID, pinned? }` pins a plane where it is, or lets the layout have it back (a child is re-placed from its link at once).
- **`space.command` ignores `space.shortcuts.disabled`** and reports what it did on `space.changed` kind `command`: `{ id, ran, reason }` (`unknown`, `disabled` never, `needsKey`, `declined`). A disabled shortcut is a KEY the host took away from the reader; a command on the bus is the host's own act.
- **`view.setPlanes` and `view.setTree` validate what they are given** and leave the view or the tree as it was on a malformed message (a warning names the first bad node); they used to throw inside a render, out of the host's reach. `view: []` with a tree set through `view.setTree` RENDERS: the empty state reads the tree, not the view; and `view.setTree` makes the view agree with the tree's roots, so a later relayout (a resize, a configuration, a measurement) places what the host set rather than the empty view it used to place, which took the host's tree away.
- **`space.isolatePlane { planeID: null }`** (or `''`) clears the isolation; it used to be ignored.
- **`space.translateXTo` / `YTo` / `ZTo`** do what their names say; they were wired to nothing.
- **The configuration is no longer re-published with every transform** (sixty times a second during a gesture): the transform and the configuration are published on their own changes, each `internal: true`.
- **A field keeps the pointer and the wheel only while it HAS the keyboard.** A press or a wheel over a hovered field (a composer nobody is typing in) is the space's like any content: in a rotate, move or scale mode it rotates, moves or scales, and the wheel over it moves the space rather than doing nothing; with the caret in the field, the field keeps its selection and its scroll (`isFocusedEditable`). The explicit modes claim a press on plane content again.
- **Momentary chrome keeps no focus a key could light**: a toolbar button, a plane control or a `PluridPill` clicked with the pointer hands the focus to the view once the click has fired (the keys still reach the space: Escape off a docked page, the mode keys), so the next key press no longer lights the browser's keyboard ring on it. Keyboard activation keeps the focus and the ring. A host's own buttons inside a plane are untouched; a host that wants the same for its controls uses `PluridPill` (marked `data-plurid-pill`).
- **A click on a field in a navigation mode focuses it**: a mode, first person or the grab takes a press on a field the reader is not typing in (the drag is the space's), and a press released where it landed is a click: the field gets the focus and the caret, as the prevented mousedown would have given them.
- **The plane's focus ring is for the keyboard**: `data-plurid-focus` is set only when the anchor's focus is `:focus-visible`, so a selection or a drag by mouse draws no ring on the plane.
- **A trackpad pinch zooms; Cmd + wheel and Ctrl + a mouse notch are the browser's** (its page zoom). The space used to take them, and the page zoom with them. `gestures.wheel: 'plane'` (new) gives a plane its wheel whatever it can do (it scrolls if it can, else nothing) and zooms only on empty space.
- **The mode keys toggle, and leave content alone.** `R`, `T`, `S` pressed in their own mode return to the plain one; `Escape` leaves a rotate, move or scale mode (`exitTransformMode`, a new shortcut id); none of `R T S F 0 .`, `⌘A`, `⌘I`, `⌘D` runs from inside a plane's content (a focused link, a list, a field), where the key is the page's. `Enter` on a plane's focus anchor frames THAT plane, the active one only when it comes from the view.
- **The marquee skips what it cannot show**: a plane whose projected quad is thinner than 4px (an edge-on fin) is not selected by a rubber band across it (`MARQUEE_MIN_PROJECTED_PX`); a second finger during a marquee takes the band off before it pinches.
- **The mode is named**: `data-plurid-mode` on the view (`rotate` | `translate` | `scale` | `grab` | `fly`), a badge (`PluridModeBadge`, top left, `rotate mode` and `esc to leave`) while one is on, and the live region announcing it and its end.
- **An unmeasured root is placed at the fallback size, never the view's height.** The column, row and face-to-face layouts pitched an unmeasured root by the view height (840 on a server), so a space booted with its rows a screen apart and jumped when the first measurement came in; they now pitch by `fallbackPlaneSize` (the configured width, and a reading proportion of it for the height where the configuration leaves the height to the content), the same size the camera frames an unmeasured plane at. A host that measured its boot pitch will see the roots closer.
- **One rule for the size a node keeps** (`carryRootRuntime`): a hand-set size is the plane's own; a dimension the incoming node carries stays; one it does not carry takes the configured value where the configuration sets one, else what was measured before. The layout's carry and the store's used to differ, and where the configuration set a width the store copied a stale measured width back after a resize; a node in a space with a configured width now reads that width until measured.
- **A window resize relays the roots once**, after the debounced measure of the view (`PLURID_DEFAULT_RESIZE_DEBOUNCE_TIME`) changes the view size; a second, undebounced listener used to relay the whole tree on every resize event of a drag, on top of that one. The measured-relayout signature rounds to whole pixels: a measurement that settles by a fraction relays nothing.
- **`PluridChromeContext` no longer carries `camera`.** A context that carried the live camera changed every orbit frame and re-rendered every chrome slot with it; the context now keeps its identity through a camera move, and a slot that needs the camera reads `useCamera()` (a plane's slot never had it).
- **A plane's DOM id is a digest** (`plurid-<hash>`, `domID(planeID)`), and its focus anchor's is that plus `-focus`; the anchor names its plane in `data-plurid-plane-anchor`. The ids used to be the plane ids themselves (`plurid://host/docs?x=1@2`), which no selector could address and which leaked every route into the document. Address a plane by `[data-plurid-plane="<id>"]`, as the engine does.
- **An isolated space has one reading scope**: `space.isolatePlane` makes every other plane `inert` (unreachable by Tab, unread by assistive technology), as the page presentation already did for the planes outside the docked page. The focus anchor acts: Enter frames its plane, Space selects it (`aria-pressed`), and the plane wears the focus ring (`data-plurid-focus`) while the anchor has the keyboard.
- **The arrangement fragment carries `show`**: a plane put away travels put away and comes back so (it used to come back shown). `fragmentOf`, `serializeFragment`, `parseFragment`, `materializeFragment` and the fragment types are exported from `@plurid/plurid-react`: the fragment is the persistence format for a host that keeps arrangements of its own.
- **The empty state reads the language table** (`spaceEmpty`, a new field every language carries) rather than an English string. A plane's controls bar re-reads the route the tree holds, so a plane re-pointed by a host's tree shows its new path.
- **`PluridChromeContext` and `PluridPlaneChromeContext` live in `@plurid/plurid-data`** (re-exported by the react package), and every `render*` slot is typed with its context (`PluridRenderSlot<PluridChromeContext>`, the plane slots with `PluridPlaneChromeContext`) rather than `any`.
- **`space.changed` kinds `describe`, `command`, `focus`** (see `docs/CHANGES.md`, generated from `PLURID_CHANGE_KINDS`): `space.describe { token }` answers with the inspection `api.inspect()` gives, for a host that has no api (a route-driven product); `space.blur` takes the keyboard focus off the space, and `focus` reports whether it is inside. A `redo` shortcut id beside `undo`.

## 3. New, additive

- `spaceEngine.layout.fallbackPlaneSize(configuration, view)`, `spaceEngine.tree.logic.carryRootRuntime(previous, next, configured?)`, `spaceEngine.tree.fields.linkIndexOf(tree)` (every spawned plane by parent and link id, once per tree reference; `findPlaneByLinkID` reads it), exported from `@plurid/plurid-engine`. Every link shares one `ResizeObserver`.
- `cameraEngine.bestYaw(planes)`, `framePlanes(camera, planes, view, { yaw })`, `framePair(camera, parent, child, view)`, `worldPoints(planes)`: the camera's half of the 90.1 decision, exported from `@plurid/plurid-engine`.
- `spaceEngine.location.resolveSpawnAnchor(parentWidth, link, { anchor, ordinal, childWidth })` and `anchoredCoordinates(parent, child)`: where a spawned child hangs; `TreePlane.bridgeAnchor` and `TreePlane.bridgeKind` (`strip` | `leash`) are stored with the spawn geometry, so a relayout never needs the configuration.
- `space.frame`-family camera commands `{ kind: 'pair', planeID }` and `{ kind: 'planes', planeIDs?, yaw }` in `@plurid/plurid-react`'s `cameraCommand`; on the bus, `space.frame { planeIDs, yaw?: number | 'best' }` frames a set of planes from a yaw (`best` by default: a fan of fins behind a parent reads from the yaw between them), and `space.frame { selection: true, yaw }` the selection from one (without `yaw` it keeps the camera's, as before).
- `space.spawnPlane` grows: `link` (a CSS selector inside the parent, measured as a `PluridLink` measures itself, used when `linkCoordinates` is absent), `bridgeLength`, `bridgeKind` (`strip` | `leash`), `framing` (`pair` | `plane` | `none`). Without coordinates the bridge leaves the parent's MIDDLE height, no longer its `{0, 0}` corner. A spawn of a route already open OPENS it (navigates, never puts it away): a product's spawn means "this branch, here". A fresh spawn frames from its best-known geometry and again from its first measurement.
- The correlation `token` is answered EXACTLY: `/thread/1` no longer answers for `/other/thread/1` (the path must be the same; a query or a fragment on the route asked for is ignored), and a plane that was put away and is shown again answers its token too (until now only a NEW plane did). `hiddenPlaneIDsOf` beside `planeIDsOf`.
- `toggleLinkPlane` takes `mode: 'toggle' | 'open'`, `framing`, `bridgeLength`, `bridgeKind`; `navigatePlane` takes `pair`.
- `view.removePlane { planeID }` takes a SPAWNED plane too: a plane a link or `space.spawnPlane` made is not in the view (the view holds the roots), so matching the view alone left it in the tree, shown, bridged and empty once its host had forgotten what it rendered. By its runtime id, or by its route (every plane at that path), the node goes with its subtree; the selection and the active plane forget it. A root still goes by its route, as before.
- `space.navigation.framing { fill, maxScale }`: how close a framing comes. A frame, a pair, a set and a fit all land at the largest zoom where the content still fits a margin of the view (`fill`, `0.85` by default), under a ceiling on the zoom (`maxScale`). On a wide screen those two constants leave a 460px reading card adrift in the middle, which is what the knob is for: a product that wants a plane to come closer raises them (dechat: `framing: { fill: 0.94, maxScale: 2.4 }`). Behaviour is unchanged for a space that says nothing, and a `maxScale` nobody set stays UNSET rather than becoming `1`: each framing keeps the ceiling it always had (a plane, a pair and a set are never magnified past their own size; a fit may magnify a small space up to the camera's `zoomMax`). A product that sets `maxScale` sets it for the fit too.
- `PluridLink` takes `mode: 'toggle' | 'open'`: what a click does when the plane it opened is already open. `toggle` (the default, unchanged) puts it away; `open` goes to it, framed with its parent as `navigation.childFraming` says. Both bring a put-away plane back. A product's way back to a branch it spawned is an `open` link; the space's own links keep toggling. And `framing: 'pair' | 'plane'`: how the plane is framed when the link goes to it, with its parent from the yaw between them or alone, face-on (unset: `navigation.childFraming`).
- `measureLinkCoordinates(linkElement, planeElement)` and `resolveLinkID(...)` are exported from `@plurid/plurid-react`: where a product's own element sits on a plane, in the plane's px, the way the engine measures it.
- A later sibling of a fan (`bridgeKind: 'leash'`) draws a leash from the parent's edge rather than a strip across its elders; the leash geometry is computed when the tree changes, not per render.
- The render-test harness: `?bus=1` (the route-driven shape: an empty view, `view.setPlanes`, `space.spawnPlane`, no plane bar), `?bridge=reading|objects`, `?backface=visible|hidden`; fixture steps `setPlanes`, `spawn`, `publish`; expectations `visible: [{ route, minWidth, unoccluded }]` and `changed: [kind]`; the six `bus-*` fixtures. The visual baselines of `nested-chain-3`, `detail-spawned` and `columns-read` change with the defaults above, and the six new fixtures need baselines: regenerate per platform (`visual.spec.ts` says how).

---

# Migrating to the 2026-09-13 release

Everything that changed for a host since the **2026-09-05** release, in one place. Nothing here is
optional-to-read if you are upgrading: the release removes every compatibility alias that was marked
"kept for one release", and three new behaviours default ON.

Nothing is auto-upgraded — a `0.0.0-N` bump is deliberate — so work through this file when you choose
to move, not before.

**Contents**
0. [What is NEW and additive (nothing to migrate)](#0-what-is-new-and-additive)
1. [Behaviours that now default ON](#1-behaviours-that-now-default-on)
2. [Renamed payload fields](#2-renamed-payload-fields)
3. [Removed topics](#3-removed-topics)
4. [Removed configuration knobs](#4-removed-configuration-knobs)
5. [Removed state, types and exports](#5-removed-state-types-and-exports)
6. [Removed server options](#6-removed-server-options)
7. [Semantic changes](#7-semantic-changes)
8. [Persistence](#8-persistence)

---

## 0. What is NEW and additive

Nothing here breaks anything. Both close a seam that made every product write the same workaround, so
if you carry either workaround, this is where it goes.

### `PluridApplicationProvider` — the route-driven path can finally be configured

`<PluridApplication>` takes eighteen props for customization, persistence and observation. The
route-driven path — `routes` → `PluridRouterBrowser`, which `@plurid/plurid-kit` generates and
`GETTING_STARTED` teaches — forwarded **five**. The other seventeen (`renderEmpty`,
`renderPlaneControls`, `renderPalette`, `useLocalStorage`, `storageAdapter`, `onPersistContent`,
`onViewpointChange`, …) could not be reached from the way we tell people to build.

```tsx
<PluridApplicationProvider renderEmpty={() => <MyEmptyState />} useLocalStorage>
    <PluridRouterBrowser routes={routes} shell={Shell} />
</PluridApplicationProvider>
```

In a kit app, declare it once in `plurid.config.ts` and both the server render and the hydration take
it:

```ts
export default { …, application: { renderEmpty: () => <MyEmptyState /> } };
```

An application's own prop always wins, so this is a DEFAULT and never an override; a direct
`<PluridApplication>` inside a provider takes it too. Nested providers merge per field.

**If you hid an engine overlay from your stylesheet, delete that rule and pass the slot instead.**

### A correlation `token` — plane identity without the DOM

`view.addPlane` and `space.spawnPlane` take an optional `token`; the engine answers on
`space.changed` kind `plane` with `{ token, planeID, route, parameters, parentPlaneID }` once the
plane is in the tree.

```diff
- pubsub.publish({ topic: 'view.addPlane', data: { planeID: route } });
- setTimeout(() => {
-     const element = document.querySelector(`[data-plurid-plane*="${route}"]`);
-     …
- }, 450);
+ pubsub.publish({ topic: 'view.addPlane', data: { planeID: route, token } });
+ // answered on space.changed kind 'plane' — no delay to guess, no DOM to query
```

`querySelector` returns the FIRST match, so opening a route that was already open addressed the plane
that was already there. The token does not: the answer is the plane that was not in the tree before.

`parameters` is the route's own, parsed (`/thread/:threadID` → `{ threadID }`). For a plane you
already have an id for, the exported `planeParameters(tree, planeID)` gives the same from any `tree`
observation — so the regex that parses an engine plane id back into your own vocabulary can go.

A command without a token behaves exactly as before and publishes nothing.

---

## 1. Behaviours that now default ON

These take input the host may already be handling. Each is one knob away.

| Behaviour | What it takes | Turn it off |
|---|---|---|
| **The clipboard** | ⌘/Ctrl + C, X, V over the space copy / cut / paste PLANES, on the browser's own clipboard events | `space: { clipboard: false }` |
| **The command palette** | ⌘/Ctrl + K opens it | `elements: { palette: { show: false } }` (the command stays reachable by name) |
| **The address bar** | in the page presentation the docked page's path is written to `location`, one history entry per page | `space: { docking: { url: false } }` |

`docs/GETTING_STARTED.md` used to say "The engine never touches the URL — you own that". That is no
longer true in the page presentation unless you set `docking.url: false`.

## 2. Renamed payload fields

Every plane-addressing pubsub message takes **`planeID`**. The `id` and `plane` aliases are gone, and
`space.setViewpoint` takes **`animate`**, not `animated`.

```diff
- pubsub.publish({ topic: 'space.closePlane',      data: { id: planeID } });
+ pubsub.publish({ topic: 'space.closePlane',      data: { planeID } });

- pubsub.publish({ topic: 'view.removePlane',      data: { plane: '/detail' } });
+ pubsub.publish({ topic: 'view.removePlane',      data: { planeID: '/detail' } });

- pubsub.publish({ topic: 'space.navigateToPlane', data: { id: planeID } });
+ pubsub.publish({ topic: 'space.navigateToPlane', data: { planeID } });

- pubsub.publish({ topic: 'space.setViewpoint',    data: { viewpoint, animated: false } });
+ pubsub.publish({ topic: 'space.setViewpoint',    data: { viewpoint, animate: false } });
```

Affected topics: `space.closePlane`, `space.openPlane`, `space.isolatePlane`, `space.refreshPlane`,
`space.navigateToPlane`, `view.addPlane`, `view.removePlane`, and every other message carrying a plane
identity. TypeScript will point at each one; at runtime an unrecognised payload is ignored, so an
unmigrated publish silently does nothing.

## 3. Topics: one removed, eleven repaired, twelve new

**Removed: `plane.setPath`** — declared with a typed payload and no subscriber; publishing it has
always done nothing, and nothing replaced it because nothing ever used it. Change a plane's route
through `space.setTree`.

**Repaired (no action needed):** `space.rotateUp` / `rotateDown` / `rotateLeft` / `rotateRight`,
`space.translateUp` / `translateDown` / `translateLeft` / `translateRight`, `space.scaleUp` /
`scaleDown` / `scaleWith` were in the same inert state — typed, documented, and wired to nothing.
They now **work**. They are the ergonomic layer over `space.cameraDelta` (which is the primitive and
wants a vector): one step of what the matching key press gives a reader, with `value` overriding the
step.

```ts
pubsub.publish({ topic: 'space.rotateLeft' });                  // one step, as the key does
pubsub.publish({ topic: 'space.rotateUp', data: { value: 30 } }); // 30°, in that direction
pubsub.publish({ topic: 'space.cameraDelta', data: { yaw: 15, animate: true } }); // the primitive
```

**New — total control (additive, nothing to migrate).** The bus now reaches everything the chrome,
the keyboard and the imperative handle reach:

| Topic | Does |
|---|---|
| `space.command` | runs ANY entry of `PLURID_SHORTCUTS` **by name** (`{ id }`) — the command palette's whole vocabulary, and every command the engine grows later |
| `space.spawnPlane` | opens a plane as a child of another, the way following a link does |
| `space.setPlaneShow` | shows / hides one plane |
| `space.movePlanes` | moves the named planes (or the selection) by a world delta |
| `space.resizePlane` | resizes one plane |
| `space.snap` | snaps the selection now |
| `space.selectInRect` | the marquee, programmatically (`set` / `add` / `subtract`) |
| `space.navigateDirection` | moves to the nearest plane in a screen direction and frames it |
| `space.grab` | arms / disarms grab mode (`on` omitted toggles) |
| `space.palette`, `space.shortcutsOverlay` | show / hide (`on` omitted toggles) |
| `space.focus` | moves keyboard focus to the space |

A test now asserts that **every command topic has a subscriber**, so a typed-but-inert topic cannot
ship again.

## 4. Removed configuration knobs

`space.cullingDistance` (the flat alias) → **`space.culling.distance`**.

Already removed on 2026-09-06, listed here because that release was never published: `global.micro`
and the flat `micro`, `global.render`, `elements.switch`, `PluridRoutePlaneOptions.linkView`,
`PluridApplication.centerView`, `space.transformMultimode`, `space.transformTouch`, the nested
`space.cullingDistance`, and the `space.animatedTransform` topic and state.

The `russian` internationalization was removed; `ukrainian`, `arabic` and `norwegian` were added.

## 5. Removed state, types and exports

- **The six legacy camera scalars are no longer on the state.** `state.space.rotationX` / `rotationY` /
  `translationX` / `translationY` / `translationZ` / `scale` were a mirror of `state.space.camera`.
  Read the camera (`camera.pitch`, `camera.yaw`, `camera.offset`, `camera.scale`), or derive the six
  with `interaction.camera.toLegacy(camera, viewSize)` from `@plurid/plurid-engine`.
  The legacy INPUT paths are unchanged: `space.setSpaceLocation` and `setTransform` still accept the
  six scalars, and a host that hands the application a state carrying only scalars still boots.
- `pluridStateModules.space.actions.updateSpaceLinkCoordinates` → **`updateLinkCoordinates`**.
- The `PLURID_ENTITY_*` re-exports from component modules are gone — import them from
  `@plurid/plurid-data`, which is where they have always been defined.
- `@plurid/plurid-kit`: `PluridHeadMeta` → **`PluridDocumentMeta`**, `PluridHeadLink` →
  **`PluridDocumentLink`**.
- `@plurid/plurid-themes`: `generateTheme(type, baseColor)` → **`themeFromLook(deriveLook(base))`**, or
  give the application `look: { scheme, space, surface, ink, accent }`.
- `@plurid/plurid-ui-components-react`: `<Head Helmet={…}>` → **`<Head Document={PluridDocument}>`**.

## 6. Removed server options

`PluridServerConfiguration.helmet` and `.customPlane`, and the options `assetsDirectory` and
`gatewayEndpoint`. All four were accepted and read by nothing (`helmet` logged a warning). The head is
the document model: `template.head`, a route's or plane's `head`, `<PluridDocument>`, a preserve's
`document`, or the server `document` hook.

## 7. Semantic changes

- **A link's identity now includes its query.** `<PluridLink route="/detail?mode=wire">` and
  `<PluridLink route="/detail">` open TWO planes; they used to collapse onto one.
- **Collaborative undo rebases.** A peer's applied change no longer clears the local history; each
  local snapshot is replayed over the peer's arrangement.
- **The camera gained `roll`**, and the viewpoint codec gained `v3`. `v3` is written only for a tilted
  camera, so every existing `?v=` link keeps its shape and meaning.
- **Commands are accepted from `onReady` on.** A host that deferred its first publish by a tick to work
  around the old readiness timing can stop.
- `setPlaneSize` → `setPlaneSizes`, one batched dispatch per relayout. Action shapes are off-contract
  (`docs/ARCHITECTURE.md` § the stability contract), but `pluridStateModules` is an advertised seam.

## 8. Persistence

`PERSISTED_STATE_VERSION` is **3**. A v2 snapshot is upgraded on read. **A v1 snapshot is dropped** —
the reader gets a fresh space rather than a wrong one. If you persist spaces for users and care about
v1 data, migrate it before upgrading.
