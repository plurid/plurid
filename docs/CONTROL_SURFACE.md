# Plurid Developer-Control Surface

Plurid is **transparent infrastructure**: it facilitates 3D spatial navigation and arrangement, and
otherwise stays out of your way — *you* decide what the app is for. So every imposed behavior has an
opt-out, every engine action a programmatic trigger, every state change an observation seam, and there
is one master escape hatch for the things we didn't anticipate.

Powerful, yet minimal: the common 90% is a handful of consistent seams; almost no one needs the escape
hatch.

> Everything below is verified by automated tests (`*/__tests__/`) and the render-test harness
> (`fixtures/render-test`, which exposes each feature behind a default-OFF query param). The
> harness `App.tsx` is a working reference for every snippet here.
>
> The machinery behind each tier (the store, the bus, the config merge, the render pipeline) is
> documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

- [Tier 0 — the escape hatch (`onReady`)](#tier-0--the-escape-hatch)
- [Tier 1 — declarative control & observe (pubsub)](#tier-1--declarative-control--observe)
- [Tier 2 — opt out the always-on](#tier-2--opt-out-the-always-on)
- [Tier 3 — granular knobs, UI, exports](#tier-3--granular-knobs-ui-exports)
- [Quick reference](#quick-reference)

---

## Tier 0 — the escape hatch

`onReady(api)` fires once after mount with a `PluridApi`. With it you can do **anything** the engine
can: read any state, dispatch any action, observe every change.

```tsx
import { PluridApplication, PluridApi } from '@plurid/plurid-react';

let plurid: PluridApi;

<PluridApplication
    view={view}
    planes={planes}
    onReady={(api) => {
        plurid = api;

        // Read synchronously, any time:
        api.getSnapshot();      // the full engine state
        api.getViewpoint();     // the camera as the encoded `v` string

        // The raw Redux store — the deliberate power seam (action creators are exported as
        // `pluridStateModules`; the internal action/state SHAPES are not a stable API):
        api.store.subscribe(() => { /* observe every change */ });
        api.store.dispatch({ type: 'space/setSelection', payload: ['/notes/intro'] });
    }}
/>
```

`PluridApi = { store, pubsub, getSnapshot(): PluridState, getViewpoint(): string }`. Prefer the stable
pubsub topics + getters below; reach for `store` only when a seam doesn't expose what you need.

---

## Tier 1 — declarative control & observe

The instance **pubsub** bus (the same one `onReady` hands back) is the stable, decoupled control +
observe surface.

### Control — tell the engine to do something

```tsx
import { PLURID_PUBSUB_TOPIC } from '@plurid/plurid-react';

plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.FIT_TO_VIEW });        // frame all planes
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.RESET_TRANSFORM });    // camera → identity
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.UNDO });               // spatial undo
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.REDO });
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SET_TREE, data: { tree } });
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SET_VIEWPOINT, data: { viewpoint: 'v…' } });
// plus the prior link / selection / collaboration topics.
```

### Observe — react to engine state changes

One channel, `space.changed`, fires `{ kind, value }` whenever a watched slice changes — subscribe
once instead of diffing snapshots. Camera/viewpoint is intentionally **not** here (it changes per
orbit frame; use the debounced `onViewpointChange` callback for that).

```tsx
plurid.pubsub.subscribe({
    topic: PLURID_PUBSUB_TOPIC.CHANGED, // 'space.changed'
    callback: ({ kind, value }) => {
        // kind: 'selection' | 'tree' | 'links' | 'activePlane' | 'isolate' | 'layoutResolved' | 'loading'
        if (kind === 'selection') highlightInSidebar(value);
    },
});

// Camera, debounced — for share links / your own storage, without the engine ever touching the URL:
<PluridApplication … onViewpointChange={(v) => saveShareLink(v)} />
```

---

## Tier 2 — opt out the always-on

### Undo

History is on by default. Drop the middleware entirely (no per-action cost, no snapshot memory) when
you own undo or never mutate the arrangement — `space.undo` / `space.redo` then become no-ops.

```tsx
definePluridConfiguration({ undo: false });
```

### Storage adapter

Redirect **all** persistence (the versioned space snapshot *and* your `onPersistContent` blob) to any
key→string backend — sessionStorage, in-memory, a namespaced/encrypted wrapper, a memory-mirrored
IndexedDB. The engine keeps owning serialization/versioning; the adapter just owns where bytes land.
Orthogonal to `useLocalStorage` (which still gates *whether* persistence runs).

```tsx
import { PluridStorageAdapter } from '@plurid/plurid-react';

const sessionAdapter: PluridStorageAdapter = {
    getItem: (k) => sessionStorage.getItem(k),
    setItem: (k, v) => sessionStorage.setItem(k, v),  // may return a Promise; writes are fire-and-forget
    removeItem: (k) => sessionStorage.removeItem(k),
};

<PluridApplication … useLocalStorage storageAdapter={sessionAdapter} />
```

> `getItem` is read **synchronously** to seed the first render, so a purely-async backend (raw
> IndexedDB) can't hydrate camera/tree on first paint — mirror it to memory, or restore asynchronously
> via the `onReady` store.

### Timings

```tsx
definePluridConfiguration({
    timings: {
        persistDebounce: 300,         // ms before a settled state is persisted
        viewpointChangeDebounce: 250, // ms before onViewpointChange fires
    },
});
```

---

## Tier 3 — granular knobs, UI, exports

### Gestures (`space.gestures`) — read live, retune any time

```tsx
definePluridConfiguration({
    gestures: {
        rotateSensitivity: 0.22,     // deg/px   (translate/scale/pinch/flyLook sensitivities too)
        dragThreshold: 4,            // px before a press becomes an orbit (vs a click)
        momentumDecay: 0.92,
        disableMomentum: false,      // true = release stops dead
        flySpeed: 9,                 // fly-mode planar speed (px/frame)

        // Remap what each pointer input does in the default mode. Only consulted when set —
        // omit to keep the CAD defaults (left orbits ONLY in grab mode, middle/shift pans).
        buttonMap: {
            left: 'orbit',           // 'orbit' | 'pan' | 'zoom' | 'disabled' — left-drag orbits directly
            middle: 'pan',
            wheel: 'disabled',       // 'zoom' | 'disabled' — leave scrolling to the page
        },
    },
});
```

### Shortcuts (`space.shortcuts`) — disable / remap / extend

```tsx
definePluridConfiguration({
    shortcuts: {
        disabled: ['modeRotation'],          // drop one — or `true` to release the WHOLE keyboard
        keymap: { modeScale: 'KeyP' },       // remap a shortcut's event.code (single-key shortcuts)
        onUnhandledKey: (e) => myPalette(e),  // every keydown the engine didn't consume → yours
    },
});
```

`PluridShortcutID` = `undo · clearSelection · fitToView · toggleFirstPerson · modeRotation ·
modeTranslation · modeScale · transformNudge · focusPlane · focusParent · refreshPlane · isolatePlane
· openClosedPlane · closePlane · focusPreviousRoot · focusNextRoot · cycleRoot · focusRootIndex`.

### UI — replace overlays or hide elements

Render-slots **substitute** an engine overlay with your own (rendered at the same spot); the
`elements.*.show` flags / `global.micro` **hide** the defaults.

```tsx
<PluridApplication
    …
    renderToolbar={() => <MyToolbar />}    // also renderViewcube / renderMinimap / renderShortcuts
/>

definePluridConfiguration({
    extend: {
        elements: {
            planeLinks: { show: false },        // hide the 3D link beams
            alignmentGuides: { show: false },   // hide the drag alignment guides
        },
    },
});
```

### Escape-hatch primitives (exports)

```tsx
import {
    pluridSelectors,        // read derived state off the onReady store
    arrangementSignature,   // the structural hash undo + collaboration agree on
    encodeViewpoint, decodeViewpoint,
} from '@plurid/plurid-react';

// Lower-level geometry lives on the engine package:
import { space, interaction } from '@plurid/plurid-engine'; // space.tree, space.location, …
```

### Flat-preset completeness

`definePluridConfiguration` maps every common knob flat (no nested object needed) — including
`opaque`, `camera`, `transformOrigin`, `transformMode`, `transformMultimode`, `transformTouch`,
`cullingDistance`, `fadeInTime`. Anything not covered is reachable via `extend` (a normal nested
partial, merged last so it wins).

---

## Quick reference

| Want to… | Use |
|---|---|
| Do something the seams don't expose | `onReady` → `api.store.dispatch(...)` |
| Read state synchronously | `api.getSnapshot()` / `api.getViewpoint()` / `pluridSelectors` |
| Trigger fit / reset / undo / redo / setTree | `pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.* })` |
| React to selection / tree / links changes | `pubsub.subscribe({ topic: …CHANGED })` |
| React to camera moves | `onViewpointChange` (debounced) |
| Turn off undo | `{ undo: false }` |
| Persist somewhere other than localStorage | `storageAdapter` prop |
| Tune persist / viewpoint debounce | `{ timings: { … } }` |
| Tune nav feel / remap buttons | `{ gestures: { …, buttonMap: { … } } }` |
| Disable / remap / extend keyboard | `{ shortcuts: { … } }` |
| Replace the toolbar / viewcube / minimap | `renderToolbar` / `renderViewcube` / `renderMinimap` |
| Hide link beams / alignment guides | `extend.elements.{planeLinks,alignmentGuides}.show: false` |
| Go fully headless | `{ micro: true }` |

See [`ENGINE_FEATURE_ROADMAP.md`](./ENGINE_FEATURE_ROADMAP.md) for the design rationale and the
engine⟷product boundary, and [`ARCHITECTURE.md`](./ARCHITECTURE.md) for how the machinery under
this surface actually works.
