# The engine / product seam

Status: **audit and proposal, 2026-09-14.** Every defect below was found by building one product
(dechat) against the published engine in a single pass. None was found by the engine's own tests.
That is the finding.

## The thesis

There are two ways to mount a plurid application.

**Direct** — `<PluridApplication …/>` — takes eighteen props for customization, persistence and
observation: `renderToolbar`, `renderPalette`, `renderPlaneControls`, `renderEmpty`,
`renderMinimap`, `renderShortcuts`, `renderDockRail`, `renderPlaneBridge`, `renderOrigin`,
`renderDebugger`, `useLocalStorage`, `storageAdapter`, `onPersistContent`, `onRestoreContent`,
`precomputedState`, `onViewpointChange`, `onReady`, and a `ref` handle.

**Route-driven** — `routes` → `PluridRouterBrowser` → the engine constructs the applications. It
forwards five: `id`, `planes`, `view`, `configuration`, `hostname`.

`@plurid/plurid-kit` generates the route-driven shape. `GETTING_STARTED.md` teaches it. All 28
products use it. So **seventeen of the eighteen documented customization props cannot be reached from
the way we tell people to build**, and `CONTROL_SURFACE.md` — the canonical guide — describes an API
that the kit's own output cannot call.

That is the fusion defect. Everything below is a symptom, a consequence, or the reason we did not
notice.

## Why we did not notice

`fixtures/render-test` is thorough — 157 chromium scenarios, 42 visual baselines, a perf project —
and it exercises the **direct** embed. The route-driven fixture is `src/RouterDemo.tsx`: sixty-three
lines asserting exactly one thing, the readiness contract (`e2e/navigation.spec.ts`, "the route-driven
mode is ready at the router's onReady").

So the engine is well tested along the path no product takes, and barely tested along the path every
product takes. A capability can be delivered, documented, visually baselined and still be unreachable
by every consumer — which is precisely what happened.

## The evidence

| What a product hit | Why | Status |
| --- | --- | --- |
| **`view.addPlane` did not add.** The one topic a route-driven product must use to open anything appended to the `stateSpaceView` captured at mount. For a route declaring `view: []` — the kit's shape — that is the empty array forever, so every add REPLACED the space with one plane. Silent: no throw, no warning, and the topic's name says the opposite of what it did. | The handler read its closure instead of `latest.current`; its sibling `VIEW_REMOVE_PLANE` had always been right. | **Fixed** 2026-09-13, regression test proven to bite. Unpublished. `denote` holds the same latent call. |
| **Every route-driven plane is named by its route.** A plane's accessible name and its bar read `plurid://host/thread/<128 hex>`. The documented fix is `renderPlaneControls`. | Render slot — unreachable. | Worked around: dechat puts the name in the plane's own content. |
| **Arrangement persistence had to be rebuilt, and was rebuilt wrong.** `TreePlane.route` is absolute — protocol, host, port — so a persisted tree cannot rebuild on another origin. A moved dev-server port restored an *empty space* that looked like lost data. | `useLocalStorage` / `storageAdapter` / `onPersistContent` — unreachable. The engine's own path-addressed answer (`logic/arrangement/fragment`) exists but is exposed only for the clipboard. | Worked around: dechat persists root paths and applies geometry only on a matching origin. |
| **Plane identity comes from the DOM.** Products publish a route, guess when the plane exists (`setTimeout(450)`), then find it with `querySelector('[data-plurid-plane*=…]')` — which returns the FIRST match, so one thread open twice addresses the wrong plane. | No creation signal, no returned identity. | Worked around in dechat AND denote. **A shared workaround is a missing API.** |
| **Domain identity must be re-derived by regex.** `space.changed` reports selection and tree in engine plane ids; a product parses the route back into its own id. | Observations carry no `parameters`. | Every product will write the same regex. dechat now has `threadIDOfPlane`. |
| **A connector is a wall, not a line.** A child moved by hand loses its bridge band and gains a real-3D beam — drawn at `BRIDGE_STRIP_HEIGHT` (30) while the crosslink beam beside it is 3. Any product that arranges its planes apart gets opaque slabs lying across the space. | The leash inherited the flat band's thickness; neither number was configurable. | **Fixed** 2026-09-14 (`LEASH_THICKNESS`), plus both baked `CHROME_OPACITY_AMBIENT` literals wired to the live token. Unpublished; dechat overrides the entity attribute meanwhile. |
| **The bridge band is flat by design** — an axis-aligned box faked with angled gradients, because a rotated box's corners are 3D-sorted away by Chrome. In a 3D engine it reads as the one thing without depth. | A real workaround for a real browser bug, but its cost is now visible. | Open: drawing the band as real geometry needs a different answer to the sorting problem. |
| **An empty space speaks in engine voice** ("no planes in this space") inside a product. | `renderEmpty` — unreachable. | Open. |
| **`bridge.planeAngle` defaults to 90°** — a spawned child stands perpendicular to its parent. Correct for a space of objects; for a space of prose it means three answers compared side by side are three *lines*. | A reading product must discover and override it. | Overridden in dechat. |
| **`fitToView` is a fill.** With one plane it magnifies a 460px reading card to the window width. | No "frame at natural scale". | Avoided in dechat. |

## The principle

> **A capability is not delivered until it is reachable from the way the documentation tells you to
> build.**

`ENGINE_FEATURE_ROADMAP.md` already says "'Delivered' means present in the engine and exercised in its
harness/tests. It does not mean a flagship product has fully adopted or protected the capability." That
distinction is honest but too weak: it permits a capability that *no consumer can call* to be marked
delivered. Adoption is a product's choice; **reachability is the engine's obligation.**

## The proposal

### 1. One configuration surface, both paths

Not seventeen new fields on `PluridRoute`. A provider:

```tsx
<PluridApplicationProvider
    renderPlaneControls={…}
    renderEmpty={…}
    useLocalStorage
    storageAdapter={…}
>
    <PluridRouterBrowser routes={routes} shell={Shell} />
</PluridApplicationProvider>
```

Every application the router constructs reads it. A host configures once instead of per route, which
also settles multi-space routes (where per-route props would have to be duplicated per space).
`routes[].application` stays available for a genuine per-route override. The kit's `defineConfig`
grows one field and its generated app gets the whole surface.

### 2. Identity without the DOM

`space.spawnPlane` and `view.addPlane` take an optional correlation token; `space.changed` kind
`plane` reports `{ token, planeID, route, parameters }` when the plane is created and measured. Then a
product never guesses a delay, never queries the DOM, and two planes of one route are distinguishable.
This is the prerequisite for anything that arranges planes programmatically — including a product that
lets a model open and place them.

### 3. Domain identity in observations

`space.changed` kinds `selection`, `tree` and `activePlane` carry each plane's parsed `parameters`
beside its id. The engine already parsed them to build the plane; dropping them forces every consumer
to re-derive them from a string.

### 4. Portable arrangement as the supported persistence format

`fragmentOf` / `materializeFragment` are path-addressed and host-independent, and they already exist.
Make them the documented way to persist and restore an arrangement — not just to copy one. Then
`TreePlane.route` being absolute stops being a footgun for every host that stores a tree.

### 5. Reading defaults, stated

`planeAngle: 90` and `fitToView`-as-fill are object-space choices. Either ship a `reading` bridge
preset or say so where a newcomer reads it. A text product should not have to discover geometry
defaults by finding its own output illegible.

### 6. The gate that would have caught all of it

Grow `RouterDemo` into a **peer** of the direct fixture and run the scenario catalog through both.
Anything that works in one mount path and not the other is a seam bug, by definition. Start with the
cases that failed here: open a second root plane; a render slot takes effect; an arrangement persists
and restores; a spawned plane is addressable without the DOM.

## What this means for the products

The product-side symptom looks different and has the same cause. dechat's bar grew to ten controls
because each new capability was answered with another button — the Photoshop failure. The correct
answer is a command palette, which **the engine already ships**, and which a route-driven product
cannot customise, because `renderPalette` is a render slot.

Until §1 lands, a product can take ⌘K for itself — disable the engine's `palette` shortcut, catch the
key through `space.shortcuts.onUnhandledKey`, render its own overlay, and merge the engine's own rows
via `internals.paletteRows` / `filterRows` / `runShortcut`. That works today because it is the
product's own React rather than a slot. It should not have to be.

Two product features wanted now sit directly on this seam:

- **A deterministic re-arrange** (a key and a control by the viewcube) that lays the space out by the
  conversation's own structure. Pure function, existing `space.movePlanes` — needs nothing new.
- **A model that can act in the space** — open, place, group, frame. Needs exactly one engine thing:
  §2. Everything else is product vocabulary, validated against a whitelist before execution.

## Sequence

1. §6 first — the route-driven fixture. Without it, every fix below is unprotected, and we are
   guessing again. It is also the cheapest.
2. §1 — the configuration surface. Unblocks plane names, the palette, `renderEmpty`, persistence, and
   deletes the workarounds now carried in dechat.
3. §2 — identity. Unblocks programmatic arrangement and removes a workaround shared by two products.
4. §3, §4, §5 — in whatever order a product needs them.

Publishing the `view.addPlane` fix is independent and should not wait for any of this.
