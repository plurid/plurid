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
