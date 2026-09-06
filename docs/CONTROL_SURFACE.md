# Plurid Developer-Control Surface

Verified: **2026-09-02** against the current public types and source (camera core: `navigation`, `viewpointURLVersion`, `space.cameraDelta`, `space.frame`). Engine delivery does not imply product adoption; see [`ENGINE_FEATURE_ROADMAP.md`](./ENGINE_FEATURE_ROADMAP.md) for the consumer status.

Plurid is **transparent infrastructure**: it facilitates 3D spatial navigation and arrangement, and otherwise stays out of your way — _you_ decide what the app is for. So every imposed behavior has an opt-out, every engine action a programmatic trigger, every state change an observation seam, and there is one master escape hatch for the things we didn't anticipate.

Powerful, yet minimal: the common 90% is a handful of consistent seams; almost no one needs the escape hatch.

> Everything below is verified by automated tests (`*/__tests__/`) and the render-test harness (`fixtures/render-test`, which exposes each feature behind a default-OFF query param). The harness `App.tsx` is a working reference for every snippet here.
>
> The machinery behind each tier (the store, the bus, the config merge, the render pipeline) is documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

- [Tier 0 — the escape hatch (`onReady`)](#tier-0--the-escape-hatch)
- [Tier 1 — declarative control & observe (pubsub)](#tier-1--declarative-control--observe)
- [Tier 2 — opt out the always-on](#tier-2--opt-out-the-always-on)
- [Tier 3 — granular knobs, UI, exports](#tier-3--granular-knobs-ui-exports)
- [Quick reference](#quick-reference)

---

## Tier 0 — the escape hatch

`onReady(api)` fires once after mount with a `PluridApi`. With it you can do **anything** the engine can: read any state, dispatch any action, observe every change.

```tsx
import { PluridApplication, PluridApi } from '@plurid/plurid-react';

let plurid: PluridApi;

<PluridApplication
    view={view}
    planes={planes}
    onReady={(api) => {
        plurid = api;

        // Read synchronously, any time:
        api.getSnapshot(); // the full engine state
        api.getViewpoint(); // the camera as the encoded `v` string

        // The raw Redux store — the deliberate power seam (action creators are exported as
        // `pluridStateModules`; the internal action/state SHAPES are not a stable API):
        api.store.subscribe(() => {
            /* observe every change */
        });
        api.store.dispatch({ type: 'space/setSelection', payload: ['/notes/intro'] });
    }}
/>;
```

`PluridApi = { store, pubsub, getSnapshot(): PluridState, getViewpoint(): string }`. Prefer the stable pubsub topics + getters below; reach for `store` only when a seam doesn't expose what you need.

---

## Tier 0.5 — the imperative handle (`ref`)

`PluridApplication` takes a `ref`: a `PluridApplicationHandle` — the `onReady` api plus TYPED commands, for the host's own code (a command palette, a sidebar) without threading the api around.

```tsx
const plurid = useRef<PluridApplicationHandle>(null);
<PluridApplication ref={plurid} … />

plurid.current?.camera.frame({ planeID });               // tween; { animate: false } jumps
plurid.current?.camera.moveBy({ yaw: 15 });              // one delta
plurid.current?.camera.bookmark('desk', 'save');         // 'go' | 'save' | 'remove'
plurid.current?.selection.set([a, b]); .align('left'); .distribute('x'); .duplicate();
plurid.current?.history.undo(); .get().canRedo;
plurid.current?.tree.spawn('/detail', parentPlaneID);    // a child plane with a bridge
plurid.current?.tree.setView(['/a', '/b']);              // relayout (animated), children kept
plurid.current?.tree.close(planeID); .open(planeID); .remove(planeID);
plurid.current?.focus();                                 // keyboard shortcuts apply
```

## Hooks — for anything rendered under the application

Plane content, a render-slot, a custom overlay: the hooks read the ENCLOSING application's engine (never the host's own Redux) and are typed end to end.

```tsx
import { useCamera, useSelection, usePluridHistory, usePluridPubSub, usePluridApi, usePluridPlane } from '@plurid/plurid-react';

const camera = useCamera();          // camera (per frame!), motion, viewpoint, bookmarks, moveBy/moveTo/frame/fit/reset/home/preset/bookmark
const selection = useSelection();    // selected, activePlaneID, isSelected, select/toggle/add/clear/selectAll/invert/align/distribute/duplicate
const history = usePluridHistory();  // canUndo/canRedo/depths, undo/redo, begin/end (one entry for a batch)
usePluridPubSub('space.changed', ({ kind, value }) => …); // one typed topic, the latest callback always called
const api = usePluridApi();          // the `onReady` api, stable
const plane = usePluridPlane();      // inside plane content — see below
```

`usePluridPlane()` is the primary plane API (the `plurid` prop stays as the registrar-level contract). Its lens
holds the plane's identity — `planeID`, `route` (the REGISTERED pattern, `/imagene/:id`), `parameters`
(`{ id: '42' }`), `query`, `fragments`, `parentPlaneID` — the application's `pubsub`, the live state
(`active`, `selected`, `isolation`, `shown`, `culled`, `frozen`, `scale`, `viewSize`, `location`) and three
commands: `close(options?)` (hide this plane; when it is the one in view the camera returns to its parent),
`navigateToParent()`, `frame()`. A plane closes itself with `plane.close()` — no publish pair needed.

`useCamera().camera` changes on every orbit frame — a component using it re-renders per frame (fine for a HUD; use `onViewpointChange` for anything debounced).

## Tier 1 — declarative control & observe

The instance **pubsub** bus (the same one `onReady` hands back) is the stable, decoupled control + observe surface.

### Control — tell the engine to do something

```tsx
import { PLURID_PUBSUB_TOPIC } from '@plurid/plurid-react';

plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.FIT_TO_VIEW }); // frame all planes
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.RESET_TRANSFORM }); // camera → identity
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.UNDO }); // spatial undo
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.REDO });
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SET_TREE, data: { tree } });
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SET_VIEWPOINT, data: { viewpoint: 'v…', animated: true } }); // v1 or v2
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_FRAME, data: { planeID } });   // or { selection: true }, or {} for everything
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA, data: {          // one camera mutation
    yaw: 15, pan: { x: 40, y: 0 }, zoom: { factor: 1.2, anchor: { x: 300, y: 200 } },
    animate: true,                                                                     // tween to the result
} });
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_HOME });                       // the home viewpoint
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_SET_HOME });                   // make the current camera home ({ viewpoint } to set one)
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_PRESET, data: { name: 'overview' } });
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, data: { name: 'desk', action: 'save' } }); // then { name: 'desk' } to go, 'remove' to drop
// Every one of these is an interruptible tween (`navigation.motion`); pass `animate: false` to jump.
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_ALIGN, data: { edge: 'left' } });        // …'right' | 'top' | 'bottom' | 'centerX' | 'centerY'
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_DISTRIBUTE, data: { axis: 'x' } });    // equal gaps (3+ selected)
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_DUPLICATE, data: { offset: 40 } });   // copies of the selected roots
plurid.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_SELECT_ALL });                        // and SPACE_INVERT_SELECTION
// plus the prior link / selection / collaboration topics.
```

Every topic is TYPED: `publish({ topic: 'space.frame', data: … })` and `subscribe({ topic: 'space.changed', callback: ({ kind, value }) => … })` narrow `data` per topic through `PluridPubSubPayloads` (derived from the message union, so it cannot drift); a wrong payload is a compile error.

### Observe — react to engine state changes

One channel, `space.changed`, fires `{ kind, value }` whenever a watched slice changes — subscribe once instead of diffing snapshots. Camera/viewpoint is intentionally **not** here (it changes per orbit frame; use the debounced `onViewpointChange` callback for that).

```tsx
plurid.pubsub.subscribe({
    topic: PLURID_PUBSUB_TOPIC.CHANGED, // 'space.changed'
    callback: ({ kind, value }) => {
        // kind: 'selection' | 'tree' | 'links' | 'activePlane' | 'isolate' | 'layoutResolved' | 'loading'
        //     | 'history' | 'motion' ('idle' | 'gesture' | 'fling' | 'tween') | 'bookmarks'
        if (kind === 'selection') highlightInSidebar(value);
    },
});

// Camera, debounced — for share links / your own storage, without the engine ever touching the URL:
<PluridApplication … onViewpointChange={(v) => saveShareLink(v)} />
```

---

### Development warnings

In development the engine warns ONCE per page about the mistakes it can see: a `planes` array rebuilt on every render (memoize it), a `view` route with no registered plane, a container with a width but no height, a `space.perspective` outside 500–5000. `{ extend: { development: { warnings: false } } }` mutes them; production never prints.

## Tier 2 — opt out the always-on

### Undo

History is on by default. Drop the middleware entirely (no per-action cost, no snapshot memory) when you own undo or never mutate the arrangement — `space.undo` / `space.redo` then become no-ops.

```tsx
definePluridConfiguration({ undo: false });
```

### Storage adapter

Redirect **all** persistence (the versioned space snapshot _and_ your `onPersistContent` blob) to any key→string backend — sessionStorage, in-memory, a namespaced/encrypted wrapper, a memory-mirrored IndexedDB. The engine keeps owning serialization/versioning; the adapter just owns where bytes land. Orthogonal to `useLocalStorage` (which still gates _whether_ persistence runs).

```tsx
import { PluridStorageAdapter } from '@plurid/plurid-react';

const sessionAdapter: PluridStorageAdapter = {
    getItem: (k) => sessionStorage.getItem(k),
    setItem: (k, v) => sessionStorage.setItem(k, v),  // may return a Promise; writes are fire-and-forget
    removeItem: (k) => sessionStorage.removeItem(k),
};

<PluridApplication … useLocalStorage storageAdapter={sessionAdapter} />
```

> `getItem` is read **synchronously** to seed the first render, so a purely-async backend (raw IndexedDB) can't hydrate camera/tree on first paint — mirror it to memory, or restore asynchronously via the `onReady` store.

### Timings

```tsx
definePluridConfiguration({
    timings: {
        persistDebounce: 300, // ms before a settled state is persisted
        viewpointChangeDebounce: 250, // ms before onViewpointChange fires
    },
});
```

### Camera navigation (`space.navigation`) and the viewpoint encoding

```tsx
definePluridConfiguration({
    center: true,                   // on a fresh space, pan once so the first root sits at the view center
    perspective: 1600,              // the CSS lens (px); the camera reads it
    navigation: {
        pitchLimit: 89,             // the orbit never flips past vertical
        zoomMin: 0.1, zoomMax: 4,   // scale range
        dollyLimitFraction: 0.6,    // the pivot stops this fraction of `perspective` from the eye
        orbitPivot: 'cursor',       // 'cursor' | 'selection' | 'view' — what an orbit rotates about
        onClose: 'parent',          // 'parent' | 'stay' — where the camera goes when the plane IN VIEW closes
        motion: { duration: 380, easing: 'out-cubic', reducedMotion: 'respect' },
        home: 'v2|…',               // the Home viewpoint (default: the initial camera)
        presets: { overview: '0,0,0,0,0,0.5' },
    },
    viewpointURLVersion: 2,         // write full-camera (pivot + pan) viewpoints; v1 stays the default
});

api.getViewpoint();                 // v1 `rX,rY,tX,tY,tZ,s` (unless configured otherwise)
api.getViewpoint({ version: 2 });   // `v2|yaw|pitch|scale|pivot…|offset…|perspective`
```

The camera itself is `api.getSnapshot().space.camera` (`CameraState`: `yaw`, `pitch`, `scale`, `pivot`, `offset`, `perspective`); the legacy `rotationX/Y`, `translationX/Y/Z`, `scale` fields remain as read-only mirrors. `encodeCameraViewpoint` / `decodeCameraViewpoint` are exported next to the v1 `encodeViewpoint` / `decodeViewpoint`.

---

## Tier 3 — granular knobs, UI, exports

### Gestures (`space.gestures`) — read live, retune any time

The default mapping (planes are pages: content interaction always wins over a plane unless grab mode is on):

| Input | On empty space | Over a plane |
| --- | --- | --- |
| Left drag | orbit (about the point under the cursor) | the page's (text selection, drag-scroll); orbit in grab mode (G arms ONE grab, the release ends it; hold Space to grab repeatedly) — and never a selection: a press the engine takes, on empty space or on content, is the space's |
| Right drag | pan (the context menu is suppressed for the press) | the page's context menu; pan in grab mode |
| Middle drag / Shift + left drag | pan | pan |
| Alt + left drag | dolly | dolly (grab mode) |
| Wheel | zoom at the cursor | zoom, unless the content under the cursor can scroll (then it scrolls); Ctrl/Cmd + wheel always zooms |
| Two-finger trackpad scroll | pan (`trackpadScroll`) | the page scrolls |
| Pinch (trackpad or touch) | zoom at the fingers | zoom at the fingers |
| One finger (touch) | orbit (`touchOne`) | the page scrolls |
| Two fingers (touch) | pinch zoom + pan | pinch zoom + pan |
| Double click / tap | frame everything | frame that plane |

Every input of a frame is coalesced into one camera commit; a release with velocity flings (orbit and pan) with a time-based, frame-rate-independent decay; any input stops a fling or a tween.

```tsx
definePluridConfiguration({
    gestures: {
        rotateSensitivity: 0.22, // deg/px   (translate/scale/pinch/flyLook sensitivities too)
        dragThreshold: 4, // px before a press becomes a drag (vs a click)
        momentumDecay: 0.92, // per 60 Hz frame; applied per real frame duration
        momentum: { orbit: true, pan: true, zoom: false },
        disableMomentum: false, // true = release stops dead
        wheel: 'scroll-first', // 'zoom' | 'scroll-first' | 'disabled'
        wheelZoomStep: 1.1, // zoom factor per mouse notch
        trackpadPinchSensitivity: 0.006, // zoom exponent per px of a trackpad pinch (≈ ×3 over a whole pinch)
        wheelSmoothing: 0.6, // fraction of the remaining wheel motion released per 60 Hz frame (≈ 90 % in 40 ms); 1 = raw
        trackpadScroll: 'pan', // 'pan' | 'zoom' | 'orbit' | 'disabled'
        touchOne: 'orbit', // 'orbit' | 'pan' | 'disabled' — one finger on empty space
        touchTwist: false, // two-finger twist rotates the yaw
        doubleClickFrame: true, // empty space frames everything, a plane's controls bar frames it; plane content is the page's
        flySpeed: 9, // fly-mode speed, px per 60 Hz frame (time-based)
        flySprintMultiplier: 2.5, // Shift while flying

        // (⌘/Ctrl is the SELECTION modifier: ⌘-click toggles a plane, ⌘-drag on empty space is the
        // marquee — Shift adds, Alt subtracts; a plain drag on a selected plane moves the selection.)

        // Gamepad (opt-in): sticks pan / orbit (fly / look in first person), triggers zoom (dolly),
        // A fits, Y goes home, B undoes. Frame-rate independent.
        gamepad: { enabled: true, deadZone: 0.15, curve: 2, panSpeed: 14, orbitSpeed: 2.4, zoomSpeed: 1.02 },

        // Remap what each pointer input does in the default mode. Only consulted when set.
        buttonMap: {
            left: 'orbit', // 'orbit' | 'pan' | 'zoom' | 'dolly' | 'disabled' — orbit everywhere, no grab mode needed
            middle: 'pan',
            right: 'menu', // … | 'menu' — give the right button back to the page entirely
            wheel: 'disabled', // 'zoom' | 'disabled' — leave the wheel to the page
            touchOne: 'pan',
        },
    },
});
```

### Shortcuts (`space.shortcuts`) — disable / remap / extend

```tsx
definePluridConfiguration({
    shortcuts: {
        disabled: ['modeRotation'], // drop one — or `true` to release the WHOLE keyboard
        keymap: { modeScale: 'KeyP' }, // remap a shortcut's event.code (single-key shortcuts)
        onUnhandledKey: (e) => myPalette(e), // every keydown the engine didn't consume → yours
    },
});
```

`PluridShortcutID` = `undo · clearSelection · fitToView · frameSelection · home · navigateLeft · navigateRight · navigateUp · navigateDown · frameActive · selectAll · invertSelection · duplicateSelection · grabMode · grabHold · exitGrabMode · help · toggleFirstPerson · flyForward · flyBack · flyLeft · flyRight · flyUp · flyDown · flySprint · modeRotation · modeTranslation · modeScale · transformNudge · focusPlane · focusParent · refreshPlane · isolatePlane · openClosedPlane · closePlane · focusPreviousRoot · focusNextRoot · cycleRoot · focusRootIndex`.

The full table, generated from the data: [`SHORTCUTS.md`](./SHORTCUTS.md). The bindings are ONE data table (`PLURID_SHORTCUTS` in plurid-data): the keyboard dispatcher, the `?` help overlay and the toolbar's shortcuts drawer are all generated from it with your `keymap`/`disabled` applied, so they cannot drift. Hold-keys (Space = grab, the fly keys) are part of the same system. Typing into any field, editor or ARIA textbox never triggers a shortcut or a gesture.

### Snapping and resizing (`space.snap`, `elements.plane.resizable`)

```tsx
definePluridConfiguration({
    snap: { enabled: true, threshold: 12, grid: 50 }, // drag-release snapping: edges/centers, else the grid; the guides preview it
    planeResizable: true,                             // right / bottom / corner handles on selected planes (hand-sized planes keep their size)
});
```

### Plane sizes (`planes[].width` / `height`)

```tsx
const planes: PluridReactPlane[] = [
    { route: '/imagene/:id', component: ImagenePlane, width: 480, height: 300 }, // its own box in px: renders as-is, the layouts space by it
    ['/notes', NotesPlane, { width: 360 }],                                       // a width alone keeps the content-driven height
    { route: '/log', component: LogPlane },                                       // the configured `elements.plane.width`, the content's height
];
```

Content taller than a declared height scrolls inside the plane (the wheel over it stays the content's). A hand resize (`planeResizable`) overrides a declaration; a declared size never enters undo or collaboration (it is not an arrangement change). From content, `usePluridPlane().width / height / sizeMode` (`measured` | `manual` | `declared`).

For EVERY undeclared plane: `planeWidth` (`elements.plane.width`, default 1 = the view width) and `planeHeight` (`elements.plane.height`; ≤ 1 a fraction of the view height, > 1 px, unset = content-driven). The layouts pitch their columns and rows by these; a declared size wins for its plane.

### The page presentation (`presentation: 'page'`)

A site first, the space one move away. `presentation: 'page'` makes every undeclared plane the size of the view and docks the camera on the first page: face-on, at scale 1, the page filling the view to the pixel. It scrolls like a page (the wheel, the keys, one finger), the engine's chrome is hidden, and the only control is the RAIL at the bottom-right corner: fit (the globe), a back chevron on a spawned page, and the small cube that opens the space at the far right.

```tsx
const configuration = definePluridConfiguration({ presentation: 'page' });
// one knob; three defaults layer UNDER your fields: space.fadeInTime 0, space.opaque false, elements.plane.height 1
```

POSE IS THE STATE. There is no mode flag: "page mode" is the camera docked on a page, and anything that moves the camera off that pose reveals the space; framing a page docks again. The doors:

| Reveals the space | Docks a page |
| --- | --- |
| a `PluridLink` — the child opens behind its parent and the camera swings to it, a page again (nothing else appears during the swing) | a link's landing; the rail's back chevron (the parent page) |
| the rail's cube (`dock-toggle`) | the rail's cube while revealed (the page nearest the view center) |
| `G` (one grab: the next drag orbits anywhere, then the page is a page again), Ctrl / ⌘ + wheel, a drag-zoom, two fingers on touch | `Escape`: from the revealed space the nearest page (grab mode ends too); docked on a spawned page, its parent; on a root, nothing |
| `0` (fit) and the viewcube faces — a legitimate undock | `Home` from outside plane content (the first page); `onClose: 'parent'`; `space.frame` |
| `space.reveal` `{ animate? }` · `useCamera().reveal()` · `handle.camera.reveal()` · the lens `reveal()` | `space.dock` `{ planeID?, animate? }` (that page, else the docked one, else the nearest) · `useCamera().dock(planeID?)` · `handle.camera.dock()` · the lens `dock()` |

Observe it: `useCamera().docked` / `handle.camera.docked()` (the page's id, `''` off every page), `usePluridPlane().docked` / `.aside` / `.presentation` from inside a page, `pluridSelectors.space.getDockedPlaneID(state)`, `space.changed` kind `docked` (a navigation, for a host that syncs a title or an analytics page view), and ONE DOM attribute, `data-plurid-docked="<planeID>"` on the `PluridView` element — style your own chrome under the view with `[data-plurid-docked] .mine { opacity: 0 }`; chrome OUTSIDE the space toggles on the kind or the hook (`:has([data-plurid-docked])` works in CSS too).

- The wheel over a docked page is the page's: it scrolls the content, or is consumed when there is nothing to scroll — it never reaches the host document. Pinch, Ctrl / ⌘, Shift, Alt and grab still move the camera.
- The keys inside a page are the page's: PageDown, Space, the arrows, Home and End scroll the docked page (its scroller takes the focus when the page docks — `docking.focus: false` turns the grab off); Space never grabs, Home never goes to the home viewpoint, from inside a DOCKED page's content; once the space is revealed, Space held inside the page grabs it (the scroller keeps the focus across the reveal).
- Touch: one finger scrolls the docked page; two fingers pinch it open (the second finger joins the first even though the first was the page's).
- Only the page's LINEAGE is shown while docked: the page, its ancestors (the trail back to the root) and its own children stay; every other plane (a sibling opened from the same header, a cousin, another root) is set ASIDE — faded out over `docking.fade`, `inert`, `data-plurid-aside` on its element — and fades back when the space is revealed. Two links in one header spawn two parallel pages a few dozen pixels apart; without this the one opened last would cover the one you clicked. `docking.aside: 'none'` keeps everything.
- A link is a link while the camera is ON a page: docked, a plurid link always takes you to its page, open or not — it never toggles the page closed (the page's close control, the back chevron and `space.closePlane` do that). With the space revealed the presentation is a space again: an open link closes its page, as in the space presentation, and a closed one opens it and docks.
- The docked page is FOLLOWED: a resize, a re-measured link, a restore — whatever moves the page's geometry under the camera — re-docks it (a jump, or the running swing retargeted); a persisted space restores docked on the same page.
- The bridge: one strip centred on the linked words, flush with the child page's top (the top of its bar). A scrolled link: the child page stays where it is; the bridge becomes a leash to the link's current point and rests at the fold once the link is beyond it.

`docking` (`space.docking`, flat `docking`) — how a move LANDS on a page and what the page keeps:

| Field | Default | Meaning |
| --- | --- | --- |
| `motion` | `'swing'` | `'swing'` tweens the camera to the page; `'instant'` jumps — a link, a child's back, `onClose: 'parent'`, Escape and `space.dock` switch at once, like a router rendering the new page. The reveal keeps its motion either way |
| `chrome` | `'hidden'` | `'hidden'` keeps every piece of chrome hidden while a transition docks (the destination page counts as docked for the whole swing: the pages swing, nothing else appears); `'shown'` lets the space show during the swing |
| `reveal` | `{ scale: 0.75, pitch: -24, yaw: 0 }` | the reveal pose: the docked page pulled back and looked down on (a negative `pitch` brings its top toward you; positive looks up at it; `yaw` turns it) |
| `fade` | `240` | ms: the chrome's fade-in on the reveal, the aside fade, the rail — one number, `--plurid-dock-fade` on the view |
| `aside` | `'lineage'` | `'lineage'` sets every plane outside the docked page's lineage aside; `'none'` keeps them |
| `focus` | `true` | the docked page's scroller takes the focus (the keys scroll it); `false` leaves the focus where it was |
| `epsilon` | `0.5` | px: how far the page's center may sit from the view center and still count as docked |

```tsx
definePluridConfiguration({ presentation: 'page', docking: { motion: 'instant' } })   // a site with plurid links that simply switch pages
definePluridConfiguration({ presentation: 'page', docking: { reveal: { scale: 0.6, pitch: -32, yaw: -8 }, fade: 400 } })   // steeper, a little turned
```

- The rail: `elements.dockRail.show: false` (flat `dockRail: { show: false }`) removes it; `renderDockRail` replaces it — render your own `data-plurid-control="dock-toggle"` / `"dock-back"` that publish `space.reveal` / `space.dock` / `space.frame`. `renderViewcube` no longer touches it. Every plane-addressing message takes `planeID` (`id` / `plane` still work, deprecated); `space.setViewpoint` takes `animate` (alias of `animated`).
- Several roots: with `pages` side by side (`layout` lays the roots out as ever) the camera boots docked on the first; `space.dock { planeID }` swings to another root and sets the others aside; `0` fits them all; the reveal shows the neighbours' edges.
- Focus and accessibility: the chrome hidden while docked is `visibility: hidden` (out of the tab order and the accessibility tree); an aside page is `inert`; the rail's pills and the `?` trigger are one persistent pill (32 px, a light rim, a dark halo, a two-tone focus ring that reads on any page); the controls bar hangs above the sheet and is the page's top: it moves with the sheet, clipped with it when that top leaves the view.
- Mobile: size the application's container yourself (`height: 100dvh`; safe-area padding on your own chrome — the engine's rail keeps a 16 px margin); the viewcube already collapses under 800 px; one finger scrolls, two pinch.
- SSR renders the identity camera, so the HTML is the docked page with the chrome hidden by the stylesheet it ships — a site to a crawler and to the first paint; the client hydrates into the same pose.
- Not yet: the address bar. A site is URLs — the docked page's route written to the location, restored on load, the back button walking the dock history — planned as its own step (`space.docking.url`, next to `PluridRouterBrowser` and the viewpoint URL binding).

Migrating a site-like consumer (hypod, `generate-plurid-app`'s `/planes` width hack): the configuration becomes `presentation: 'page'`; the `planeWidth: 1`, `controls.show: false` and fade-in overrides go, and the pages finally scroll.

### Culling, depth cues, backfaces (`space.culling`, `elements.plane.depthFade`, `elements.plane.backface`)

```tsx
definePluridConfiguration({
    culling: { enabled: true, distance: 6000, freezeDistance: 3500, frustumMargin: 0.25, hysteresis: 0.15 }, // far / off-screen planes stop painting (state kept)
    planeDepthFade: { enabled: true, start: 800, end: 2500, minOpacity: 0.35, blur: 0 },              // planes fade with distance
    planeBackface: 'hidden',                                                                              // planes seen from behind stop painting
});
// inside a plane: const { culled, frozen } = usePluridPlane(); — pause video / polling while unseen
```

### UI — replace overlays or hide elements

Render-slots **substitute** an engine overlay with your own (rendered at the same spot); the `elements.*.show` flags / `global.micro` **hide** the defaults.

```tsx
<PluridApplication
    …
    renderToolbar={() => <MyToolbar />}    // also renderViewcube / renderMinimap / renderShortcuts
    // the built-in minimap is a FIXED FRONT VIEW (world X across, Y down): dots at plane centers, farther = smaller
    // and dimmer, children joined to their parent, the ring on the VIEWER (the eye, moving with every orbit / pan /
    // zoom) with a tick toward the pivot, and a small mark on the pivot itself
    renderEmpty={() => <MyEmptyState />}   // shown in place of the space when it holds no planes
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

### Stable DOM contract (`data-plurid-*`) and chrome isolation

The engine's DOM is addressable through `data-plurid-*` attributes, which are a documented contract: tests,
host CSS and tooling may rely on them, and their VALUES never change. `data-plurid-entity` names every engine
surface: `PluridView`, `PluridSpace`, `PluridRoots`, `PluridRoot`, `PluridPlane`, `PluridPlaneControls`,
`PluridPlaneContent`, `PluridPlaneBridge`, `PluridPlaneLinks`, `PluridPlaneResizeHandle`, `PluridAlignmentGuides`,
`PluridLink`, `PluridToolbar`, `PluridViewcube`, `PluridMinimap`, `PluridUniverseExplorer`, `PluridTransformOrigin`,
`PluridMultispace`, `PluridApplicationConfigurator`, `PluridPlaneConfigurator`, `PluridPlaneDebugger`,
`PluridSpaceDebugger`, `PluridMarquee`, `PluridEmpty`, `PluridLiveRegion` and the shortcuts dialog's historical
`shortcuts-overlay` (all exported as `PLURID_ENTITY_*` from `@plurid/plurid-data`). Alongside:
`data-plurid-plane="<planeID>"` on every plane, `data-plurid-link` / `-link-route` / `-link-open` on links,
`data-plurid-control="<name>"` on every engine control (`plane-back|plane-focus|plane-close|plane-resize-*|
toolbar-button|toolbar-menu|viewcube|viewcube-fit|minimap|minimap-plane|shortcuts|shortcuts-overlay|dock-toggle|dock-back`),
`data-plurid-docked="<planeID>"` on the view while the camera is docked on a page (the page presentation; the chrome fades by it), `data-plurid-page="docked"` on that page's element, `data-plurid-aside` on every plane outside the docked page's lineage (faded, inert), `data-plurid-presentation="page"` on the view in the page presentation, `data-plurid-motion="gesture|fling|tween"` on the view while the camera moves, `data-plurid-navigating="grab|fly|transform"` on the view while a navigation mode is on (a page's text is not selectable then), `data-plurid-rail` / `-rail-button` and `data-plurid-docked-state="docked|revealed"` on the page presentation's rail, `data-plurid-bridge-side="start|end"` on a bridge, `data-plurid-document="<key>"` on the head elements the document layer manages, `data-plurid-control="selection-<action>"` on the Transform drawer's selection buttons,
`data-plurid-overlay`, `data-plurid-culled`, `data-plurid-minimap` / `-minimap-eye` (the viewer: the camera eye; + `-minimap-clamped` when it is off the map) / `-minimap-plane="<planeID>"` / `-minimap-depth` / `-minimap-child` on every dot / `-minimap-link` (a child's join) / `-minimap-heading` (the ring's tick), `data-plurid-hover`,
`data-plurid-guide` / `-guide-edge`, `data-plurid-iframe-overlay`. The attribute names the engine reads back are exported too (`PLURID_ATTRIBUTE_ENTITY` / `_PLANE` / `_CONTROL` / `_DOCKED` / `_ASIDE`). CSS custom properties the engine writes, for a host's own stylesheet: `--plurid-dock-fade` on the view (`docking.fade`), `--plurid-bridge-reach` / `--plurid-bridge-angle` on a spawned page's element (the leash), `--plurid-plane-depth` / `-fade` / `-blur` on every plane under `elements.plane.depthFade`.

The chrome (toolbar, viewcube, minimap, plane controls, shortcuts, handles, overlays) does NOT inherit the
host's global resets: every chrome root and every chrome button / input / select starts from the engine's own
reset (`services/styled/chrome.ts`), so a host `button { min-height: 42px }` or `body { text-transform: uppercase }`
leaves it untouched (`fixtures/render-test?hostileCss=1` is the proof). Plane CONTENT is yours and is never reset.

### Document head (`<PluridDocument>`, `usePluridDocument`, `planes[].head`, `routes[].head`)

The head is data. Declare a layer from any plane, overlay or route, and the engine renders ONE `<title>` plus
deduplicated meta / links / JSON-LD (React 19 hoists them; on the server the same document is serialized into the
template and claimed at hydration — never two titles):

```tsx
import { PluridDocument, usePluridDocument } from '@plurid/plurid-react';

// as a component: props and / or Helmet-style children (a one-line migration from <Helmet>)
<PluridDocument title="Imagene 42" titleTemplate="%s · hypod" description="…" canonical="https://…" lang="en"
    jsonLd={[{ '@type': 'Thing', name: 'imagene 42' }]}>
    <meta property="og:image" content="/og.png" />
</PluridDocument>

// as a hook
usePluridDocument({ title: plane.parameters.id, meta: [{ name: 'robots', content: 'noindex' }] });

// as data on a plane / route (static, or a resolver of the route context — async on the server only)
planes: [{ route: '/imagene/:id', component: ImagenePlane, head: ({ parameters }) => ({ title: 'Imagene ' + parameters.id }) }]
```

Precedence, lowest → highest: the kit's / template `head` → `routes[].head` → the shown `planes[].head` (tree
order) → in-render declarations (render order: deeper wins) → a server preserve's `document` → the server
`document` hook. Keys: one title; meta by `name` / `property` / `http-equiv` / `charset` (+ `media`); links by
`rel` (+ `sizes` / `hreflang`); scripts and styles by `id` / `src` / content; JSON-LD by `@id`. `lang`, `dir`,
`htmlAttributes`, `bodyAttributes` apply to the live `<html>` / `<body>` and are restored on unmount. Outside an
application / provider a declaration is ignored with a development warning. `createDocumentRegistry` +
`PluridDocumentScope` are the primitives (a custom SSR pipeline collects into a server registry).

### Using pieces outside an application

`PluridLink` renders as a plain `<a href>` to its route when there is no application above it (a host's unit
test of a component that happens to contain a link, a static render): no engine store is needed and no mock.
Inside an application it is the engine's link.

### Escape-hatch primitives (exports)

```tsx
import {
    pluridSelectors, // read derived state off the onReady store
    arrangementSignature, // the structural hash undo + collaboration agree on
    encodeViewpoint,
    decodeViewpoint,
} from '@plurid/plurid-react';

// Lower-level geometry lives on the engine package:
import { space, interaction } from '@plurid/plurid-engine'; // space.tree, space.location, …
```

### Flat-preset completeness

`definePluridConfiguration` maps every common knob flat (no nested object needed) — including `opaque`, `camera`, `transformOrigin`, `transformMode`, `transformMultimode`, `transformTouch`, `cullingDistance`, `fadeInTime`. Anything not covered is reachable via `extend` (a normal nested partial, merged last so it wins).

---

## Testing your integration — `@plurid/plurid-react/testing`

Render an application in jsdom (vitest / jest + jsdom), drive it with synthetic input, step a deterministic frame clock, assert on the camera:

```tsx
import { renderPlurid, gestures, flushFrames, installFrameClock, expectCamera } from '@plurid/plurid-react/testing';

const clock = installFrameClock();                       // before the input it should drive
const app = await renderPlurid({ planes, view, configuration });
app.handle.camera.moveBy({ yaw: 30 });
expectCamera(app.api.getSnapshot().space.camera).toBeNear({ yaw: 30 });
await gestures.key(app.view, 'KeyG');                    // grab mode
await gestures.drag(app.view, { x: 100, y: 500 }, { x: 260, y: 500 }); // orbits
await gestures.wheel(app.view, { deltaY: -100, ctrlKey: true });        // zooms
await gestures.pinch(app.view, { x: 500, y: 300 }, 100, 200);
await flushFrames(3);                                    // tweens / flings / batchers advance
await app.unmount(); clock.restore();
```

`renderPlurid` polyfills `PointerEvent`, pointer capture and `matchMedia` for jsdom; `app.rerender(props)` re-renders with new props (a layout switch, a new view).

Below the DOM, the same entry ships the engine's own fixtures — the data the store holds, built the way the application builds it — and a HEADLESS store for thunk-level tests:

```ts
import { treePlane, viewSizedSheet, pageConfiguration, configurationWith, makeSpaceStore, motionSpy, TEST_VIEW } from '@plurid/plurid-react/testing';

const store = makeSpaceStore(pageConfiguration({ space: { docking: { motion: 'instant' } } }), [viewSizedSheet('p1'), viewSizedSheet('p2', { location: { translateY: 650 } })]);
const tweens = motionSpy(store);                         // a View's motion controller, as a spy
store.dispatch(cameraCommand({ kind: 'frame', planeID: 'p2' }));
expect(tweens).toHaveLength(0);                          // instant: a jump
expect(store.cameraCommits()).toHaveLength(1);
expect(store.getState().space.camera.scale).toBe(1);     // typed: PluridStoreState, no cast
```

`treePlane(id, overrides)` is a measured, shown node (a root, or with `parentPlaneID` a spawned child); `viewSizedSheet` a page; `pageConfiguration(partial)` the page presentation with its three defaults applied through the engine's own `merge`; `makeSpaceStore(configuration, tree)` runs the application's ROOT reducer with a thunk-aware `dispatch`, keeping every plain action (`dispatched`, `cameraCommits()`).

## Quick reference

| Want to… | Use |
| --- | --- |
| Do something the seams don't expose | `onReady` → `api.store.dispatch(...)` |
| Read state synchronously | `api.getSnapshot()` / `api.getViewpoint()` / `pluridSelectors` |
| Trigger fit / reset / undo / redo / setTree | `pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.* })` |
| Move the camera by one delta / frame a plane | `SPACE_CAMERA_DELTA` / `SPACE_FRAME` topics |
| Give one plane its own size / every plane a size | `planes[].width` / `height` (px): declared sizes render as-is and the layouts space by them; `usePluridPlane().width / height / sizeMode` · `planeWidth` / `planeHeight` for every undeclared plane |
| Present the space as a site (a page first, the space one move away) | `{ presentation: 'page', docking: { motion, chrome, reveal, fade, aside, focus, epsilon } }` · `space.dock` / `space.reveal` · `useCamera().dock / reveal / docked` · `space.changed` kind `docked` · `[data-plurid-docked]` on the view · `renderDockRail` / `dockRail: { show }` · Escape docks (a spawned page: its parent), G / the rail / a pinch reveal |
| Home / named presets / runtime bookmarks | `SPACE_HOME` · `SPACE_SET_HOME` · `SPACE_PRESET` · `SPACE_BOOKMARK` (+ `navigation.home` / `presets`) |
| Switch the layout on a live space (animated relayout) | change `layout` in the `configuration` prop — children stay attached, planes glide |
| Steer with a gamepad | `{ gestures: { gamepad: { enabled: true } } }` |
| Show something when the space is empty | `renderEmpty` slot |
| Align / distribute / duplicate / select all | `SPACE_ALIGN` · `SPACE_DISTRIBUTE` · `SPACE_DUPLICATE` · `SPACE_SELECT_ALL` · `SPACE_INVERT_SELECTION`; the Transform drawer buttons |
| Tune snapping, let users resize planes | `{ snap: { threshold, grid } }` · `{ planeResizable: true }` |
| Read undo/redo availability | `pluridSelectors.getHistory` · `space.changed` kind `history` |
| Stop painting far / off-screen planes, fade with depth | `{ culling: { enabled: true } }` · `{ planeDepthFade: { enabled: true } }` · `usePluridPlane().culled` |
| Drive the engine from the host's own code | `ref` → `PluridApplicationHandle` (`camera` / `selection` / `history` / `tree` / `focus`) |
| Read or drive the engine from a component under it | `useCamera` · `useSelection` · `usePluridHistory` · `usePluridPubSub` · `usePluridApi` |
| Test the integration in jsdom | `@plurid/plurid-react/testing` (`renderPlurid`, `gestures`, `flushFrames`, `expectCamera`) |
| Mute the development warnings | `extend.development.warnings: false` |
| See fps / dispatches / culled counts | `extend.development.spaceDebugger` (+ `planeDebugger`) |
| Tune orbit limits, pivot policy, motion, home | `{ navigation: { … } }` |
| React to selection / tree / links changes | `pubsub.subscribe({ topic: …CHANGED })` |
| React to camera moves | `onViewpointChange` (debounced) |
| Turn off undo | `{ undo: false }` |
| Persist somewhere other than localStorage | `storageAdapter` prop |
| Tune persist / viewpoint debounce | `{ timings: { … } }` |
| Tune nav feel / remap buttons | `{ gestures: { …, buttonMap: { … } } }` |
| Disable / remap / extend keyboard | `{ shortcuts: { … } }` |
| Replace the toolbar / viewcube / minimap | `renderToolbar` / `renderViewcube` / `renderMinimap` |
| Hide link beams / alignment guides | `extend.elements.{planeLinks,alignmentGuides}.show: false` |
| Give a link a stable identity (same-route links, collaboration) | `<PluridLink linkID="…">`; the spawned plane records it as `spawnedByLinkID` |
| The same 90° turn every generation (default), or alternate it; grow toward the viewer or behind the parent | `extend.space.bridge.fan: 'fixed' \| 'alternate'`, `extend.space.bridge.direction: 'backward' \| 'forward'`, `extend.space.bridge.keepBehind: true` (mirror the generations that would hang on the side their parent faces) (+ `bridgeLength` / `planeAngle`) |
| A link scrolls inside its plane | Nothing to configure: the child stays where it is, the bridge follows the link (a leash) and rests at the fold once the link is beyond it; a re-measure (resize) anchors a hidden link at the edge, never off the sheet. `--plurid-bridge-reach` / `--plurid-bridge-angle` on the child plane element carry it |
| Find a link's plane in the DOM / the tree | `[data-plurid-link][data-plurid-link-route][data-plurid-link-open]`; `tree` nodes' `spawnedByLinkID` |

See [`ENGINE_FEATURE_ROADMAP.md`](./ENGINE_FEATURE_ROADMAP.md) for the design rationale and the engine⟷product boundary, and [`ARCHITECTURE.md`](./ARCHITECTURE.md) for how the machinery under this surface actually works.
