# Plurid Engine — Feature Roadmap

> **Status (2026-06-21):** in progress. The A–F hardening pass is complete and green on all gates
> (`pnpm build` / `pnpm test` / `pnpm check`); see [`ENGINE_AUDIT_AND_ROADMAP.md`](./ENGINE_AUDIT_AND_ROADMAP.md)
> for what landed. This doc plans what the **engine** should add to unlock the Spatial-Notes product.
> All cited seams (file paths + symbols) are real, verified against the current source.
>
> **Delivered so far (2026-06-21), all harness-verified:**
> - **#1 Serializable viewpoint (core)** — camera↔URL deep-link/share. `?v=rX,rY,tX,tY,tZ,s` restores
>   the exact camera on load; orbiting reflects back via `replaceState` (no history spam). New
>   `services/logic/viewpoint` codec + `View/hooks/useViewpointURL`. (Saved-views + tours deferred —
>   best built with their product UI to avoid an unused persisted field + version bump now.)
> - **#5 Both seams** — (a) **content persistence:** opt-in `onPersistContent`/`onRestoreContent` on the
>   Application ride the engine's debounce + `pagehide` flush (`state.local.saveContent`/`loadContent`,
>   opaque blob under `pluridContent-<id>`); round-trip verified. (b) **editor coexistence:** the pointer
>   gesture guard now also skips `isContentEditable` targets (the shortcut handler already guarded
>   INPUT/TEXTAREA/contentEditable via `verifyPathInputElement`), so a host editor doesn't get hijacked
>   by orbit-drag; verified (drag-in-editor → no orbit, drag-on-view → orbit).
>
> **Next:** #7 minimap (a config-gated UI component — its own focused increment), then #2 undo/redo.

## Governing principle — engine primitive vs product work

Plurid is a **content-agnostic library**: a plane is `{ route, component }`, and the host app passes
whatever React it wants — including an editor. So the *editor itself*, note CRUD, a search UI, AI, and a
cloud backend are **product** work. The **engine's** job is the reusable **spatial primitives** and the
**seams** that let a product ride the engine instead of fighting it.

Every item below is scoped to the engine side of that line. The product-owned counterparts are listed in
[Engine ⟷ product boundary](#engine--product-boundary) so the split is explicit.

The engine renders with **CSS 3D transforms** (`perspective` + `preserve-3d` + per-plane `matrix3d`), state
lives in a **Redux-Toolkit** store isolated behind a custom `StateContext`, and the View was just decomposed
into hooks under `containers/Application/View/hooks/`. That base is why most of these are additive, not rewrites.

## Recommended sequence

Front-load the cheap, purely-additive wins; defer the two big lifts and the rewrite.

| Order | Feature | Effort | Why here |
|------:|---------|--------|----------|
| 1 | [Serializable viewpoint](#1-serializable-viewpoint) | Small→Med | Cheap, additive; unblocks sharing + presentation |
| 2 | [Content-persistence + editor-focus seams](#5-two-enabling-seams-content-persistence--editor-focus) | Small | Unblocks product authoring without the engine owning content |
| 3 | [Spatial undo/redo](#2-spatial-undoredo) | Med | Table-stakes once users author the space |
| 4 | [Minimap / overview](#7-minimap--overview) | Small→Med | Cheap delight; orientation in big spaces |
| 5 | [Inter-plane link graph + 3D edges](#3-inter-plane-link-graph--3d-edges) | Large | The differentiator |
| 6 | [Spatial selection: multi-select / group / snap](#4-spatial-selection-multi-select--group--snapping) | Med→Large | Authoring of arrangement |
| 7 | [Collaboration seam](#6-collaboration-seam) | Med→Large | Makes multiplayer pluggable |
| 8 | [WebXR renderer](#8-webxr-renderer) | Large | Frontier / R&D; near-rewrite of rendering |

Each feature block lists its **Goal · Seams · Approach · Effort · Risks · Verify**, and calls out any
**Decision** (an open fork to settle at implementation time, not silently pre-chosen).

---

## 1. Serializable viewpoint
*(camera-in-URL · saved views · guided tours) — Effort: Small → Medium · do first*

**Goal.** Make the current 3D viewpoint a first-class, encodable, restorable thing. One primitive unlocks
four features: deep-links, "share from *here*", saved views/bookmarks, and guided tours (animate between
saved viewpoints). Today the viewpoint is ephemeral — the URL encodes *which plane*, never *from where*.

**Seams.**
- `SpaceTransform` — the 6-tuple `{ rotationX, rotationY, translationX, translationY, translationZ, scale }`
  at `plurid-core/plurid-data/source/interfaces/external/pubsub/message.ts` (`:233`).
- Space transform selectors at `plurid-works/plurid-react/source/services/state/modules/space/selectors.ts`
  (`getTransformMatrix`, `getTransformTime`, …) and the actions `setTransform` / `setAnimatedTransform` /
  `setTransformTime` in `.../state/modules/space/index.ts`.
- The restore-with-animation pattern already used by `navigateToPluridPlane` / `useAnimatedTransform` in
  `plurid-works/plurid-react/source/services/logic/animation/index.ts` (set `animatedTransform: true` →
  `setTransform(target)` → clear after `PLURID_DEFAULT_ANIMATED_TRANSFORM_TIMEOUT`).
- URL write `window.history.pushState(null, '', matchedPath)` in
  `plurid-works/plurid-react/source/containers/RouterBrowser/index.tsx` (`:238`); URL read via `handleLocation`
  (same file) + `extractQuery` in `plurid-core/plurid-engine/source/modules/routing/Parser/logic.ts`.
- Persistence: `PERSISTED_SPACE_FIELDS` + `PERSISTED_STATE_VERSION` + `save`/`load` in
  `plurid-core/plurid-engine/source/modules/state/local/index.ts` (storage key `pluridState-<id>`).

**Approach.**
1. New `encodeViewpoint(SpaceTransform): string` / `decodeViewpoint(string): SpaceTransform` codec — a compact
   rounded tuple (`v=rX,rY,tX,tY,tZ,s`) in a small `modules/space/viewpoint` module.
2. Reflect transform into the URL with **`replaceState` + a heavy debounce** for transform-only changes (orbit
   mutates the transform per frame — `pushState` would flood history); keep `pushState` for *route* changes.
3. On load / `popstate`, parse `?v=` → `decodeViewpoint` → `setTransform` (instant on load, animated on an
   explicit "jump to view").
4. Saved views: add `savedViewpoints: Record<string, SpaceTransform>` to the space state + actions
   `setSavedViewpoint` / `removeSavedViewpoint`, and add it to `PERSISTED_SPACE_FIELDS` (**bump
   `PERSISTED_STATE_VERSION`** so old snapshots fall back cleanly).
5. Tours: an ordered list of saved viewpoints played via the `setAnimatedTransform` + `setTransform` step
   pattern with per-step delays.

**Decision.** URL encoding form — rounded comma tuple (readable, short) vs base64-JSON (opaque, future-proof).
Recommend the rounded tuple.

**Risks.** History spam (mitigated by `replaceState` + debounce); URL length; SSR (`window` guards — the
engine already runs server-side).

**Verify (harness).** Orbit, copy the URL, open it in a fresh tab → identical viewpoint. Save a view, orbit
away, "jump back" → it animates. A tour plays through its views.

---

## 2. Spatial undo/redo
*Effort: Medium*

**Goal.** Undo/redo of *arrangement* (spawn / close / move / relink). Becomes table-stakes the moment users
author the space. (Content undo belongs to whatever editor the product supplies — out of scope here.)

**Seams.**
- The store is RTK `configureStore` with **no custom middleware today**
  (`plurid-works/plurid-react/source/services/state/store/{production,development}/index.ts`) → a clean,
  single insertion point.
- Undoable space actions: `setTree`, `updateSpaceTreePlane`, `updateSpaceLinkCoordinates`, `removePlane`.
- `setTree` already reconciles via `reconcileTree` (`plurid-core/plurid-engine/source/modules/space/tree/logic.ts:1286`)
  off Immer's `original()` → **structural sharing makes tree snapshots cheap** (a history stack is mostly
  shared structure).
- Transient, **not** undoable: per-frame `rotate*` / `translate*` / `scale*` / `flyMove`, and hover
  `activePlaneID`.

**Approach.** A thin history middleware that captures `state.space.tree` (+ a label) on the undoable action
set, onto a bounded stack; `undo()` / `redo()` dispatch `setTree(snapshot)`. Coalesce rapid same-type ops (one
drag = one entry). Wire `Cmd/Ctrl+Z` and `Cmd/Ctrl+Shift+Z` in `services/logic/shortcuts`. **Do not** persist
the history stack.

**Decision.** Middleware vs an explicit `history` slice — recommend middleware (one choke-point, no reducer
churn). Camera-undo (a separate, coalesced transform history) is optional and can come later.

**Risks.** Choosing the exact undoable set; coalescing heuristics; the interaction with persistence (exclude
history) and with collab (an undo is itself a mutation — see #6).

**Verify.** Unit tests for the history reducer; harness — spawn → undo (gone) → redo (back); close a plane →
undo reopens it.

---

## 3. Inter-plane link graph + 3D edges
*Effort: Large — the differentiator*

**Goal.** Model **arbitrary** plane↔plane relationships (not just parent→child), render them as 3D edges in
the space, and surface **backlinks**. "Spatial + linked" is the genuinely novel combination (Obsidian's graph,
but you live inside it). Today only the parent→child hierarchy is modeled, and only the parent→child connector
is drawn.

**Seams.**
- `TreePlane` (`parentPlaneID`, `children`, `linkCoordinates`, `bridgeLength`, `planeAngle`) at
  `plurid-core/plurid-data/source/interfaces/internal/tree/index.ts`.
- The existing parent→child connector `PlaneBridge` — a CSS `position:absolute` bar (`left:-bridgeLength`,
  `width:bridgeLength`, fixed height) at
  `plurid-works/plurid-react/source/components/structural/Plane/components/PlaneBridge/styled.ts`. It is *co-located*
  with the child (parent→child only), so it is **not** a true point-to-point line — that's the thing to generalize.
- Rotation-aware placement `computePluridPlaneLocation` at
  `plurid-core/plurid-engine/source/modules/space/location/logic.ts:70` (the 2D rotate-aware math for where a
  child sits relative to a parent — reusable for edge endpoints).
- `reconcileTree` for cheap state updates.

**Approach.**
1. Add a **separate adjacency list** `links: PlaneLink[]` to the space state —
   `{ id, sourcePlaneID, targetPlaneID, kind?, sourceAnchor?, targetAnchor? }`. Keep it off `TreePlane`
   (links cross the tree; a node-local field can't express A→C).
2. Actions `addPlaneLink` / `removePlaneLink` / `updatePlaneLink`; persist `links` (version bump).
3. Backlinks = a memoized selector `getBacklinks(planeID)` grouping the list by `targetPlaneID`.
4. **Edge rendering — the key fork.** Two options:
   - **(i) screen-space SVG overlay** — project each plane's anchor (world → screen via the global matrix)
     each frame and draw lines. Simpler, but re-projects every frame (perf) and loses true 3D occlusion.
   - **(ii) a CSS-3D "beam" element per edge** — positioned/rotated *in* the space via a generalized
     `computeEdgeTransform(a, b)` that reuses the bridge styling + the `computePluridPlaneLocation` math. True
     3D, integrates with the existing matrix, no per-frame JS.
   - **Recommend (ii)** for consistency with the CSS-3D renderer.

**Risks.** The 3D line-between-two-arbitrary-anchors geometry (rotation-aware); perf with many edges; the
"create a link" gesture (drag from A to B) is partly product UX.

**Verify.** Add a link A→B programmatically → a 3D connector appears and stays attached under orbit;
`getBacklinks(B)` returns A; survives reload.

---

## 4. Spatial selection: multi-select · group · snapping
*Effort: Medium → Large*

**Goal.** Select multiple planes, move/group them, with snapping and alignment guides — i.e. let users
*author* the arrangement, not just navigate a host-defined one.

**Seams.**
- Today there is only a single, hover-driven `activePlaneID` (set by a `mouseOver` effect →
  `setSpaceField` in `components/structural/Plane/index.tsx`) plus `isolatePlane`. No selection *set*, no
  drag-to-move.
- A plane's position lives in `TreePlane.location` (relative to its parent); the global camera is
  `state.space.transform`. Placement math: `computePluridPlaneLocation`.

**Approach.**
1. Add `selectedPlaneIDs: string[]` to the space state + `setSelection` / `toggleSelection` /
   `clearSelection` + a memoized `getSelectedPlanes` (distinct from the hover `activePlaneID`).
2. `transformSelectedPlanes({ dTranslate, dRotate })` updating each selected plane's `location`
   (parent-relative — needs care for children).
3. A drag-to-move gesture in/beside `usePointerGestures`, **gated by the edit/selection arbitration from #5b**
   so a drag on a selected plane moves it instead of orbiting.
4. Snapping to a grid / other planes' anchors + an alignment-guide overlay.

**Decision (the hard part).** Free-move conflicts with the **auto-layout** model — today locations are
computed by the layout algorithms (column/row/sheaves/…). Free placement needs a **"manual-position override"**
concept (a plane pinned manually vs layout-driven), and a defined behavior when the layout is switched. Settle
this model decision before building the gesture.

**Risks.** The layout-vs-manual tension above; group-transform math with parent-relative coords; gesture
arbitration with orbit/pan.

**Verify.** Shift-click several planes, drag → they move together; snapping to grid/guides works; layout-switch
behavior is defined and demonstrated.

---

## 5. Two enabling seams: content-persistence + editor-focus
*Effort: Small · do early*

**Goal.** The *only* engine-side parts of "editable notes": (a) let a product's content ride the engine's
persistence machinery, and (b) let a host editor coexist with the gesture/shortcut layer. (The editor and the
content schema stay product-owned.)

**Seams.**
- `state.local.save` / `load` + `PERSISTED_SPACE_FIELDS` + the debounce (300 ms) and `pagehide` /
  `visibilitychange` flush wired in `containers/Application/index.tsx`.
- The form-field guard already in `services/logic/shortcuts` (typing in an input doesn't trigger shortcuts) and
  the drag-threshold in `usePointerGestures` — the two places that already "stand down" for some input.

**Approach.**
1. **Content-persistence seam.** Optional `onPersistPlaneContent(planeID)` / `onRestorePlaneContent(planeID,
   data)` callbacks (or a small registry) the `Application` invokes during `save` / `load`, storing an **opaque**
   `planeContent: Record<planeID, unknown>` blob via the *same* debounce + `pagehide` + versioning machinery.
   The engine never inspects the blob → it stays content-agnostic, and any product's note bodies persist for
   free.
2. **Editor-focus / input-arbitration.** An `editingPlaneID` flag (focus mode) set via a new pubsub topic
   `PLANE_EDIT_FOCUS` (or a context callback). While set, `usePointerGestures` / `useGrabMode` / the shortcut
   handler **stand down** for events originating inside that plane — no orbit on drag-to-select-text, no
   `R`/`T`/`S`/`G` hijack while typing. This generalizes the existing form-field skip into an explicit mode any
   plane content can request.

**Decision.** Callback-registry vs pubsub for both seams (consistency with the existing pubsub API argues for
pubsub on the edit-focus signal at least).

**Risks.** Keeping the engine content-agnostic (no product schema leaks into engine types); arbitration edge
cases (nested editors, focus loss).

**Verify (harness).** A plane containing a `<textarea>` / `contentEditable`: typing doesn't switch transform
modes, dragging selects text instead of orbiting, and the content survives a reload through the seam.

---

## 6. Collaboration seam
*(transport-agnostic mutation stream) — Effort: Medium → Large*

**Goal.** Make multiplayer a **pluggable product/infra layer**, not an engine rewrite. The engine ships the
*seam* (an authoritative mutation stream + an apply-remote entry point), not a server.

**Seams.**
- The RTK store + the same undoable action set as #2.
- The existing pubsub external API and its `internal: true` echo-guard flag (already used in `usePluridPubSub`
  to keep the View's own re-publish from feeding back).
- `reconcileTree` (incoming remote trees reconcile cheaply against the local one).

**Approach.** A middleware that emits an authoritative **mutation stream** — `{ action, payload, planeID?, ts }`
— for the collaborative subset to a pluggable sink (callback or pubsub topic), plus an
`applyRemoteMutation(m)` entry that dispatches incoming remote mutations guarded against echo (reuse the
`internal` flag pattern). The engine stays transport-agnostic — the product wires the sink/source to its
transport (y-websocket, etc.). **Presence** (others' cursors/cameras) is a separate pubsub channel the product
renders.

**Decision.** Op-based (emit actions) vs state-based (emit full trees) sync — recommend op-based for the
arrangement actions, with a full-tree state-based **resync fallback**. Last-writer-wins composes with
`reconcileTree`; true CRDT is the product's choice on top.

**Risks.** Echo loops (the `internal` flag); op ordering; the seam must not couple the engine to any transport.

**Verify.** Two harness instances sharing an in-memory channel — spawn/move/close in one reflects in the other,
with no echo storms.

---

## 7. Minimap / overview
*Effort: Small → Medium*

**Goal.** Orientation in large spaces — see the whole layout + where the camera is, at a glance.

**Seams.** `state.space.tree` (plane positions) + the transform selectors (camera) + the bounding-box math
already inside `spaceFitToView` (`state/modules/space/index.ts`).

**Approach.** A fixed-corner component that projects each plane's `location` to a 2D top-down (or iso) minimap,
draws plane rects + a camera marker/frustum, and on click calls `navigateToPluridPlane` to fly there. Pure
selectors + a click-to-fly; throttle redraws.

**Decision.** Projection (top-down vs isometric).

**Risks.** Projection choice; perf with many planes (throttle).

**Verify.** Minimap shows all planes + a camera marker; clicking a plane flies the camera to it.

---

## 8. WebXR renderer
*Effort: Large (near-rewrite) — frontier / exploratory*

**Goal.** View the space in VR/AR — the boldest expression of "spatial."

**Seams (and the catch).** Rendering is **CSS 3D transforms** (`Space` / `Roots` / `Plane` `styled.ts`,
`perspective` + `preserve-3d` + `matrix3d`). The state/tree/transform model is **renderer-agnostic** (good — it
could feed a WebGL scene), but the *rendering and interaction* layers assume DOM/pointer.

**Approach (R&D, not near-term).** Prerequisite: cleanly separate the tree/transform model from the CSS-3D
rendering layer (a renderer abstraction). Then a parallel WebGL renderer (Three / R3F) consumes the same tree +
per-plane location, with plane content as textured quads — *DOM-content-in-WebGL is the hard part*
(`CSS3DRenderer`, or html-as-texture) — plus a WebXR session. Scope is honestly large: the entire pointer
interaction layer would need an XR-input counterpart.

**Verify.** N/A near-term — a spike behind the renderer abstraction.

---

## Engine ⟷ product boundary

**The engine owns** the eight primitives above (spatial state, viewpoints, undo/redo, the link graph + edges,
selection/group, the persistence + edit-focus + collab *seams*, minimap, and — eventually — the renderer).

**The product owns** (and the engine just stays out of the way):

| Product capability | Engine's only obligation |
|---|---|
| The editor component (TipTap/Lexical/CodeMirror/…) | Don't fight its input (#5b edit-focus) |
| Note CRUD + content schema | Persist an opaque content blob (#5a) |
| Search **index + command-palette UI** | Provide the fly-to animation (exists: `navigateToPluridPlane`) |
| AI / semantic (embeddings, auto-link, generate) | — (operates on product-owned content) |
| Cloud backend + accounts + permissions + sharing infra | Provide the collab mutation seam (#6) + viewpoint URLs (#1) |
| Publish / export pipeline (image/PDF/embed) | The server pkg's headless-render `Stiller` is the one engine-adjacent piece (currently unwired) |

---

## Notes

- Nothing here is started; this is the plan. The cheap front of the queue (#1, #5, #7) is purely additive and
  low-risk on the current green base; #3 and #6 are the substantial efforts; #8 is a deliberate rewrite to be
  taken only behind a renderer abstraction.
- Each feature's **Decision** line is an open fork to settle when that feature is picked up — they are flagged,
  not silently pre-chosen.
- Cross-reference: [`ENGINE_AUDIT_AND_ROADMAP.md`](./ENGINE_AUDIT_AND_ROADMAP.md) (the completed hardening pass
  A–F) and the harness at `fixtures/render-test` (the CAD verification scene used in every **Verify** above).
