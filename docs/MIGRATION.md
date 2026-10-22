# Migrating to the release prepared 2026-10-22

`@plurid/plurid-data` `0.0.0-28`, `plurid-pubsub` `0.0.0-14`, `plurid-engine` `0.0.0-25`,
`plurid-react` `0.0.0-42`, `plurid-react-server` `0.0.0-21`, `plurid-kit` `0.0.0-8` and
`generate-plurid-app` `0.0.0-18`; the other six packages keep their October 18 versions.

- **A pointer drag is a gesture.** `state.space.motion` — and with it the `space.changed` kind
  `motion` and the view's `data-plurid-motion` — reads `gesture` from a navigation drag's or a pinch's
  first move to its release. Nothing set it before (only tweens and flings did), so
  `[data-plurid-motion='gesture']` styles never applied, a plane's first measurement could re-frame
  the camera mid-drag, and an agent's settle took a drag for rest. A host that waits for
  `motion === 'idle'` now waits for the drag too; a release that flings goes straight to `fling`. A
  `CameraMotionController` a host implements itself needs the new `gesture(active)` method.
- **`elements.plane.depthFade` fades.** A shown plane's opacity follows `--plurid-plane-fade`; the
  plane rule's own `opacity` used to override it, so only the blur reached the screen.
- **A bus selector is never handed out twice.** A subscribe after the newest subscriber left used to
  receive that subscriber's selector, so a cleanup unsubscribing twice removed someone else's
  callback. `unsubscribe` now returns `true` only when it removed a subscription.
- **The engine's development warnings stay out of production browser builds.** Its development check
  reads `process.env.NODE_ENV` exactly as a bundler replaces it, as the bus already did; behind a
  `typeof process` guard every browser build read as development.
- **A command run by name says when it had nothing to act on.** `space.command`, the palette and
  `runShortcut` run a binding without its key, and with it without the key's own check: a command
  that needs a plane in focus, a selection, a step to undo or a closed plane to reopen reported
  `ran: true` having done nothing. It now answers `{ ran: false, reason: 'declined' }` (and
  `runShortcut` returns `false`), as the agent's `plurid_command` already expected. Keys are
  unchanged.
- **Previous / next root from a deep plane.** Alt+A, Alt+D and Alt+Tab from a plane two or more
  levels below its root stepped from the wrong root (the position of the plane's parent among its
  siblings).
- **`view.removePlane { planeID: '' }` removes nothing.** Every plane answers to an empty route, so
  it removed the whole space; it warns now, as for a missing `planeID`.
- **A plane set aside fades back in.** Revealing the space brought it back at once: a background
  transition further down the plane rule overrode the fade's. The fade now runs both ways, and the
  rule's opacity transition applies as written: isolating a plane and the depth cue also ease over
  `docking.fade` instead of snapping (none under reduced motion).
- **`elements.plane.opacity` below 1 is translucent.** Any fraction made the plane's background fully
  transparent (the colour is the `--plurid-plane` variable, which the old decomposition could not
  read); it is the plane colour mixed with transparency by that fraction.
- **`PluridIframePlane` and `PluridExternalPlane` work as planes.** Registered as planes, as the
  fixtures and the docs register them, they read the route exterior's `plurid.value`: the iframe had
  no `src` and the external plane never asked for its element. They read the plane's route now, and
  a route exterior's still. An external plane's host is the whole `host[:port]` (one dot only was
  read, so `pttp://a.example.com/x` asked `a.example`), and the request goes over the page's own
  transport, http to a loopback host; it was http always, which an https page cannot fetch.
- **A leash is a bridge.** `elements.planeBridge.show: false` hides a moved child's leash with the
  bands, as documented, and `elements.planeLinks.show: false` (the link beams) no longer hides it. A
  leash fades with its child when the child is set aside, and is not painted while the child is
  culled; it stayed drawn over the docked page.
- **An application's explicit `undefined` keeps the provider's value.** `renderEmpty={undefined}` (a
  host forwarding its own optional props) erased the `PluridApplicationProvider` default; it reads
  as "not set here", as it does between nested providers.
- **A navigation's focus stays in its application.** The plane to focus was looked up in the whole
  document, so with two applications holding the same routes (the same plane ids), one's navigation
  focused the other's plane. It is looked up in the application's own view, by an escaped id.
- **A root takes the custom planes a child takes.** A `customPlane` that is a `memo` or `forwardRef`
  object rendered nothing at a root, the root's subtree with it; one that is not renderable leaves a
  root its own plane, as it does a child.
- **A link's suffix is drawn.** The `'` after a link is the link's own `::after`; written bare, it was
  a descendant selector, so a text link drew none and a link holding elements drew one after each.
  The toolbar menus' separators and hidden scrollbars had the same rule.
- **Every flat configuration key passed nested is named as one.** Eight were missing from the
  development check's list (`planeBridge`, `palette`, `marquee` …), which said they were not keys at
  all; the compiler now holds the list to `FlatPluridConfiguration`.
- **A view route an arrangement nests is not "unregistered".** The development warning about view
  routes with no registered plane looked among the roots only, so restoring an arrangement that hangs
  a view item from another plane warned about a plane that was there.
- **`plurid build` empties only a build.** It removed whatever `buildDir` named: `'.'`, `'source'`,
  the public directory or a folder of something else went, with everything in it. It refuses a
  `buildDir` that holds the application, its `source` or its public directory, or one that is not a
  previous build (no `asset-manifest.json`, and no `index.js` beside `client/`); move that directory
  aside or choose another.
- **`plurid start` runs a production build only.** `plurid dev` writes the same directory, and
  `start` ran its development build. `asset-manifest.json` records the build's `mode`, and `start`
  refuses a development build ("run `plurid build` first"); a build from before this release has no
  mode and counts as production. `plurid dev` records its mode only once it will build: refused on a
  busy port, it leaves the build it found as it was.
- **A service's `client` reaches its provider.** `PluridServiceConfig.client` was never read, so the
  documented Apollo shape rendered a provider with no client. In the browser the kit calls `client()`
  for the provider's `client` property, unless `properties` sets one.
- **`plurid info` reads the config.** It reports the config file, the public and build directories
  the config names, and the build's mode; it checked the conventional paths whatever the config said.
- **PTTP answers where it can, and only to the origins it allows.** The kit turns `usePTTP` on only
  for a config with an `elementqlEndpoint`: PTTP resolves ElementQL planes, and every function plane
  answered 404. `usePTTP: true` still turns it on. `POST /pttp` reflected any `Origin`, with
  credentials allowed; another site is answered now only from an origin in `pttpOrigins` (on the
  server's configuration and the kit's), whose `OPTIONS` preflight is answered too, and every answer
  carries `Vary: Origin`. A cross-origin `PluridExternalPlane` never worked against a stock server
  (Express's own preflight answer carried no CORS headers): list its page's origin in `pttpOrigins`.
  A host whose own handler answered the preflight, relying on the server to reflect the origin, lists
  its origins there too. An origin is compared whole: the kit refuses a `pttpOrigins` that is not a list
  of strings, and the server reads a single string as one origin (as a string it was a substring test,
  so a look-alike origin was allowed, credentials and all).
- **A `pttpHandler` gets the request and the response.** `PTTPHandler` is
  `(path, request, response) => Promise<boolean>`: it answers on `response` and resolves `true`.
  Handed the path only, one that resolved `true` left the request open; one that has not started its
  answer after `options.pttpAnswerTimeout` (10 s) gets a 500 and a warning now, so an answer that
  starts later (a `sendFile`, a stream) is kept. A handler that ignores the new arguments compiles
  unchanged.
- **Stills.** `PluridStillsGenerator` writes into the server's own `stillsDirectory` (it wrote
  `stills/` whatever the server read), refuses a kit application's entry (`build/index.js`, its
  default for a kit application), which starts a server when it is loaded, before loading it, and
  forwards the forked server's error output, whose last lines are the reason when the server stops
  before answering, and writes under the server's own `buildDirectory` unless given `build` (it wrote
  `./build/` whatever the server read). The server finds its stills under an absolute `buildDirectory`
  (it looked under the working directory), and serves a route's still for a query of tracking
  parameters only (`utm_*`, `gclid`, `fbclid` and their like: `/?utm_source=x` rendered live); any
  other query renders live, since a page may read it.
- **`NODE_ENV=production` is production for the server too.** The server's default `debug` was
  `info` unless `ENV_MODE=production`; the kit and `plurid start` already read either.
- **An ignored path is logged as passed on.** `options.ignore` logged `(204 No Content)` for a
  request the next handler answered, usually with a 404.
- **The kit warns about a production server without a `hostname`.** Without one, every page renders
  on its request's `Host` header, which is only as trustworthy as the proxy in front of the server.
- **`handle.tree.set` and `space.setTree` set the tree exactly, one path.** A saved arrangement now
  moves or unpins a plane the live space had pinned, and takes its sizes (a dimension it leaves at 0
  keeps the measurement); unchanged nodes keep their references. The handle also checks the tree (a
  malformed one leaves the tree as it was, with a development warning; it threw inside a render) and
  brings the view along with the roots, as the topic did. Both set it through the new `space` action
  `replaceTree`.
- **Undo moves the view with the roots.** An undone `view.addPlane` came back at the next relayout;
  the restore now takes the roots it removes out of the view and puts back the ones it brings.
  `view.removePlane` given a ROOT's id takes it out of the view too (it left the tree only).
- **A configured length with a decimal above 4 is px.** `elements.plane.width: 460.5` was 460.5 views
  wide; a fraction is `1` or a number with a decimal up to 4 (`0.6`, `1.5`), anything else px — gaps
  and sheaves' depth by the same rule, as a share of the plane width. A length given as a string (read
  from JSON) is its number.
- **A spawned child takes the first free slot.** After a close or a removal the next sibling stood
  exactly on a shown one; the slot is the first no shown sibling stands on.
- **The `pubsub` and `planesRegistrar` props follow their changes**, and `api.pubsub` / `handle.pubsub`
  are the bus in use. An application inside a plane of a routed one keeps its own bus and `onReady`
  (it took the router's: `onReady` fired twice), and still leaves the pathname to the router: its
  address bar rides the query (`PluridRouterContextValue.onReady` and `pubsub` are optional now). `PluridRouterBrowser` follows `routes`, `planes` and
  `hostname` (a route added later is matched; a new array of the same routes remounts nothing).
- **`usePluridPlane()` reads the requested route** — its `query`, `fragments` and `parameters` are the
  `plurid` prop's (`/doc/1?tab=x` read `{}` from the hook).
- **Camera.** A tween started in the tick of a jump starts where the jump landed; a page pitched past
  the orbit's limit docks face-on (the commit clamped it at 89°), under reduced motion and a zero
  duration too (the controller's jump commits with the new `TweenOptions.docking`, which a host's own
  motion controller may honour), and stays docked through a pan; a
  viewcube face levels the horizon; the restore after a hydration is no longer an undo step;
  `easing: 'spring'` asked per call is out-quint, as configured (it was out-cubic).
- **Configuration.** A switch from the page presentation back to the space gives the four page fields
  still at their page defaults the space defaults again; a Theme object in `global.theme` is taken as
  given (the name `plurid`, the default, still leaves the theme to the look: pass `themes.plurid` to ask
  for it); a Theme object that gives only some colours takes the rest from the look's theme;
  `space.presentation: null` is the default presentation (it kept the page's defaults);
  `docking.fade` at its default no longer overrides a look's own `fade` token, and the view no
  longer pins `--plurid-dock-fade` inline; a configuration without `space.bridge` spawns with the
  default (reading) bridge.
- **The drawers.** An unknown name in `toolbar.drawers` is skipped with a warning (opening More threw);
  the layout picker keeps the layout's parameters; a drawer closed under `toggledDrawers: ['ALL']`
  closes; picking a general theme keeps a named interaction theme; the culling slider reaches the
  default 6000 and follows the configuration; an open menu no longer makes the toolbar's whole band
  swallow clicks; the transform arrows and selection buttons are chrome controls (a host's `button`
  rules stay out); the Shortcuts drawer's rows follow the presentation (they kept the first one's).
- **The help sheet.** Escape's rows are listed in the order the keys run them (`dock` first, then
  the mode exits), and two pointer rows say what they do: ⌘/Ctrl + wheel is the browser's zoom (a
  trackpad pinch zooms the space), and a double click frames everything (on a plane's controls bar,
  that plane). The table feeds the palette and `docs/SHORTCUTS.md` too.
- **Planes.** A `renderPlaneBridge` slot is not drawn over the engine's leash; an unregistered child's
  children do not render; keyboard focus leaving a plane puts its controls' hover out; a resize ended
  by an unmount closes its undo step; `usePluridDocument` survives StrictMode's remount; the minimap's
  dot hover brightens and `minimap.transparent: false` is a solid panel; `chrome: 'none'` shows no mode
  badge and no engine debugger HUD (a `renderDebugger` slot still renders); the dock toggle is no longer
  `aria-pressed`. `internals.PluridPlaneDebugger` / `PluridSpaceDebugger` load their debugger on first
  render. A cut whose close throws still closes its undo step. The engine's
  `getPluridPlaneIDByData(element)` answers for a plane's own element too (the search started at its
  parent). The face-to-face layout places each row by the configured plane width, as columns and
  rows do (a measured width of the previous view placed it).
- **The bus.** A subscriber another one removes during a publish is not called; a host's `onDrop` is no
  longer told about the topics the engine emits (`space.changed`).
- **The browser router no longer calls a route's `resolver`** (it called it with no globals and threw
  the result away). The server metastate no longer carries the six legacy camera scalars.
- **`@plurid/plurid-react/testing`.** `cancelAnimationFrame` cancels the one frame (it emptied the
  queue), and a frame cancelled by an earlier one of the same batch does not run; the container is
  given no size (the view is the window's, 1024 × 768 in jsdom); `motionStub()` records each
  `gesture(on)` call in `gestures`.
- **A fragment's empty occurrence `[]` is the first.** A text or element directive
  (`#:~:text=start,end,[]`) read it as `NaN`, which matched no occurrence; it is the first, as a
  missing one is.
- **The kit builds in the project's directory.** esbuild keeps the working directory the process had
  when it loaded, so after a `chdir` (a script driving several projects, a test runner) `plurid dev` and
  `plurid build` resolved and wrote against the old one; the kit passes the project's
  (`absWorkingDir`).
- **`@plurid/plurid-kit/server` and `/client` have types under `moduleResolution: "node"`.** That
  resolution reads no `exports`, so an application on it (most plurid applications) had no types for
  the two subpaths; `typesVersions` names them.
- **An application inside a route is on the router's host.** Only the route's own application was
  handed the router's `hostname`; one a product renders in the route's exterior or shell, or inside a
  route's plane, had none, so on the server its planes were `plurid://origin/…` while the browser put
  them on `location.host`, and the page did not hydrate. It now takes the router's (`PluridRouterContextValue.hostname`)
  unless it names its own.
- **New, additive: `elements.viewcube.hideBelow`.** Below that viewport width, in px, the viewcube and
  the rail's fit button are not shown, through a media query: the markup is the same at every width.
  Applications kept the cube off phones with `show: window.innerWidth >= 800`, which the server cannot
  read: it rendered the cube, the phone's first render did not, and the page did not hydrate.
- **The kit runs one copy of React, whoever imports it.** A package linked from another checkout
  resolved `react`, styled-components and react-redux from that checkout, and the application ran
  two of each (hooks threw, the server rendered with one React and the browser hydrated with the
  other). `bundle.dedupe` (default `DEFAULT_DEDUPE`: React, react-dom, scheduler,
  styled-components, the Redux stack, react-helmet-async, Apollo, graphql and `@plurid/*`) resolves
  from the application's root: in the client bundle through a resolve plugin, and in the server
  through the bundle's first lines, which have Node resolve them from the application for every
  `require` and `import`. A listed package the application does not have resolves from its
  importer. A published package that brought its own copy of a listed one (an older `@plurid`
  package) now gets the application's; `bundle.dedupe: []` turns it off. `plurid dev`, `build` and
  `info` name the linked packages, and `plurid dev --watch` restarts the server when one of them is
  rebuilt.
- **A rebuilt `configuration` or `view` prop changes only what it changed.** A new configuration
  object was laid whole over the live configuration, so a host that rebuilt it (on a resize, say)
  undid every runtime change: a layout or toolbar picked through the bus, the drawers' picks. Now
  only the values that differ from the previous prop are applied (`global.look`, `global.theme` and
  `space.bridge` each as a whole); a value the new prop leaves out stays as it is, as before. A
  rebuilt callback is taken into the store without a recompute. The `view` prop goes back over the
  live view only when its content changed: an equal view, or a new `planes` array, no longer drops
  the planes a reader added. A host that relied on re-passing an equal configuration to reset the
  runtime changes sets those values on the bus instead. An edit made in place, then passed under a new
  object, is a change (what was applied is a copy). A change of `space.presentation` lays the whole
  prop, as before: it moves the defaults under the page fields. The engine's `state.compute` takes the
  changed part as `configurationChanges`; `configurationAuthoritative` still lays all of it.
- **A reopened child takes a free slot.** Reopening a closed child (its link, `openPlane`,
  `openLastClosed`, `handle.tree.open`, `space.setPlaneShow`) showed it where it closed, on the
  sibling spawned meanwhile in its place. It takes the first free slot now, a longer bridge drawn
  as a leash, and its subtree follows, and so do the children the reopen shows again; a plane that
  was already shown, a child placed by hand, and a spawn that names its `bridgeLength` or
  `bridgeKind` keep their place. The
  engine's `space.tree.logic.reslotShownChild` does it; the `setPlaneShow` action itself still only
  shows or hides.
- **`global.theme` defaults to `look`, and the name `plurid` is the plurid theme.** The default was
  `{ general: 'plurid', interaction: 'plurid' }`, and the name `plurid` followed the look, so the
  plurid theme could be asked for only by its object. `look` (the new default, a name or either
  part) follows the look; every theme name sets its theme, `plurid` too. A configuration that a host
  saved with the old default and passes back now sets the plurid theme for plane content and the
  drawers' inputs (development says so once): pass `look`, or leave `global.theme` out. Nothing the
  engine persists holds a theme. The server metastate's themes are resolved as the browser's are
  (they were the plurid theme always).
- **The Global drawer picks the look.** More → Global starts with the look (`global.look`, for the
  session, through the new `setConfigurationLook` action); its two theme pickers are the content
  themes, relabelled in every language, with `look` as their first choice, and a pick resolves the
  themes as the store does. A new `toolbarDrawerGlobalLook` field is in every language.
- **A kit service's `store` is each request's.** The kit called `store(undefined)` once, at
  startup, and every request rendered into that one store: what one request put in it was in the
  next reader's page. The server calls the factory for every request now (`PluridServerService`
  takes a `store` factory), and when exactly one service has a store, the state the render left in
  it is the page's `window.__PRELOADED_REDUX_STATE__`, which the kit's client already built its
  store from. A preserve's `providers[name].store`, or its own `__PRELOADED_REDUX_STATE__` global,
  still wins, and the preserve's `globals` object is left as it is. A static `properties.store` is
  still one store for every request, and is not written. A state `JSON.stringify` cannot write
  fails the request, naming the service. Each service has its own store, two of one name included.
  This kit needs this react-server: `@plurid/plurid-kit`
  0.0.0-8 takes `@plurid/plurid-react-server` 0.0.0-21 or later.

# Migrating to the October 18 release

## Click-to-scroll and package entry points

The coordinated release is data `0.0.0-27`, engine `0.0.0-24`, React `0.0.0-41`, server
`0.0.0-20`, kit `0.0.0-7` and generator `0.0.0-17`, together with the utility versions in
[the release table](./RELEASING.md). It is published on npm's `latest` tag.

Opt in with `space.gestures.wheel: 'click-to-scroll'`. Hovered planes keep camera navigation;
a primary click on content or its header enables scrolling for that plane without swallowing the
click's normal action. Background clicks and Escape release it. Docking activates content immediately.
Pinch, navigation modifiers and explicit navigation modes retain their navigation behavior. A wheel
stream retains its initial owner across planes and its momentum tail; content cannot spill into the
camera at its boundary. See [wheel ownership](./CONTROL_SURFACE.md#click-to-scroll-a-plane) for the details.

Use `usePluridPlane().scrollSelected`, `PluridPlaneChromeContext.scrollSelected` or the
`data-plurid-scroll-selected` attribute to style the active plane. This is transient UI state,
independent of spatial selection, and is not saved or added to history. A host overlay mounted outside
the Plurid View, such as Space/Quick Preview, keeps its own input. Set `wheel: 'plane'` for hover-owned
scrolling or `wheel: 'scroll-first'` for the unchanged default policy; the choice can change live.

The library exports now supply `.d.mts` for `import` and `.d.ts` for `require` under separate type
conditions. Keep both declarations and the split runtime chunks when repackaging. All public packages
require Node 22 or newer; the packed smoke checks both NodeNext module forms and generated applications
under TypeScript 5 and 6. The following fixes since September 29 ship in the same release.

A server-rendered page now hydrates. Every kit application failed to: React threw the server's markup
away and rendered again in the browser (`#418` in production; in development the attribute and text
mismatches named below). Three causes, three changes a host can see.

- **A kit application's planes are on `config.hostname` in the browser, as on the server.** The kit's
  client handed the router no `hostname` (nor `planes`, nor `exterior`), so in the browser every
  plane's route took `location.host` (`plurid://localhost:33721/…` under `plurid dev`) where the server had
  rendered `plurid://<hostname>/…`. The client now hands `PluridRouterBrowser` what the server's
  `PluridRouterStatic` renders it with (`routerProperties` spread last, as there). Routes, plane ids and
  the plane bar read the configured host; an arrangement a product persisted with absolute routes under
  the old `location.host` names a host its planes are no longer on (the arrangement fragment,
  path-addressed, never did).
- **A `PluridLink` is addressed on its application's host**, the one its planes are registered under.
  It took no host, so the server wrote `plurid://origin/…` and the browser `plurid://<location.host>/…`,
  and in an application whose `hostname` is not the document's host a click looked for a plane under a
  host nothing was registered under and opened nothing. An application without a `hostname` is
  unchanged.
- **New, additive: `@plurid/plurid-react/agent`**, a third entry point. It lets an AI agent operate an
  application through fourteen tools: observe, follow a link, open, go to, close, remove, scroll, the
  camera, the selection, arrange, history, bookmarks, commands and configure. Each tool has a JSON
  Schema and validates its input; the tools can be registered with WebMCP or put on `window`.
  Nothing changes for an application that does not import it (`docs/AGENT_CONTROL.md`). The harness
  gains `?agent=1`.
- **`@plurid/plurid-react`'s CommonJS build is split into the same chunks as its ESM build.**
  styled-components numbers its component ids in creation order, and the unsplit build created the same
  components in another order than the split one a browser bundles, so a server that `require`s the
  package and a browser that `import`s it disagreed on every class from the first moved component on.
  `require('@plurid/plurid-react')` now loads the `chunk-*.js` files beside `index.js` (they are in the
  package), and shares them with `@plurid/plurid-react/testing`, which under CommonJS carried a second
  copy of the engine (634 KB) and so a second set of contexts.

`pnpm check.modules` renders `@plurid/plurid-react` through both builds and compares, and `pnpm
smoke.pack` loads the generated application in Chromium (`plurid start` and `plurid dev`): a
hydration error fails either.

A server-rendered page now PAINTS before its script runs. It painted black until hydration, three times
over:

- **The server's default page sizes the space.** Its style gave only `body` a height, so `html` and the
  root were auto and the view (`height: 100%` of its mount point) resolved to 0 px; in the browser the
  engine then measured an empty view, warned (`the space's container has a width but no height`) and
  fell back to the window. `html`, `body` and the root are full height now. A host that sets its own
  `template.defaultStyle` keeps it, and should give them a height too.
- **A server-rendered page shows its space from the first render.** The space waited at opacity 0 for
  the browser's first layout (`resolvedLayout`), which a server never does. Under a server's metastate
  (`PluridProvider metastate`, which the kit's client hydrates under too) the page presentation shows at
  once; the space presentation keeps its fade-in.
- **The router puts no cover over a server-rendered page.** Its `fadeIn` cover (black, over everything,
  until 10 ms after mount) was the server's whole page until the script ran. A client-only application
  keeps it.

And **the server's page is the window's**. A server has no view to measure, and laid its page out for
the boot fallback (771 × 764): the first paint was a 771 × 764 box, its text cut off on a phone and a
third of a wide screen, until the script ran and the page grew to the window. Docked before the view is
measured, a page is now stated in the view's own terms: its configured size as fractions of the view,
and the camera as a CSS transform about the view's centre. A view-sized page (the page presentation's
default) and any fraction of the view paint exactly as the measured page, at any window size, and
nothing moves at hydration; a page sized in px keeps the scale the fallback gave it until the view is
measured. Every other plane waits unseen until then (under the default `docking.aside: 'lineage'` they
are set aside anyway). A space booted docked by its address now docks at `docking.scale`: a `natural`
space booted at the fill scale, a pose its own docked test did not recognise, so its page was not read
as docked. New in the engine: `space.layout.configuredPlaneExtent(value)`, a configured plane
dimension as `{ fraction }`, `{ px }` or `undefined` (left to the content).

And **a server without a `hostname` renders on the request's host**, as the engine defaults to in the
browser (`location.host`). It rendered the literal `origin`, a host no browser has, so its pages failed
to hydrate. A production site configures `hostname` (the kit requires it): a host taken from the request
is only as trustworthy as its `Host` header, and a cache that does not key on it could keep a page
rendered for another.

**The server's metastate is a marker.** `window.__PRELOADED_PLURID_METASTATE__` is `{ "states": {} }`: its
presence tells the space and the router that the page was server-rendered, and nothing ever read its
contents (each application computes its own state, in the browser as on the server). The full engine
state it carried was computed on every request and written into every page (8 KB of a two-page site's
HTML, 13 %; 2 KB gzipped). A `document` hook still receives the computed state as `metastate`, computed
only when there is a hook; `serverComputeMetastate` is still exported.

**The kit.** A `plurid.config.ts` that cannot bundle is named with its cause and place
(`plurid.config.ts:1:20: Could not resolve "./routes"`), where the warning said only
`Build failed with 1 error:`. And `plurid dev` no longer leaves a timer behind each restart that
signalled a process already gone.

`pnpm smoke.pack` also loads the page with its script off, and fails when it paints blank (a 0 px view,
hidden content, anything covering it), when its docked page is not the window's box (at 1280 × 800 and
at a 390 × 844 phone), when the page moves while it loads and hydrates (every frame from the first paint
is recorded), or when the generated application logs any `[plurid]` warning.

## Production readiness (2026-09-29)

Four audits (the engine, the React adapter and its accessibility, the server and the kit, the
developer experience) and an inventory of the control surface; every finding was reproduced, fixed,
and given a regression test. What a host can see:

**Defaults that change**

- **A plane that throws is contained.** `planeRenderError` was documented as on by default and was off:
  one plane's render error unmounted the whole application. Now the plane shows its error card with a
  retry, the rest of the space goes on, and `space.changed` kind `planeError` `{ planeID, route, message }`
  reports it. A component passed as `planeRenderError` renders (it gets `{ error, retry }`; it never
  rendered before). `planeRenderError: false` lets the error through to your own boundary. A
  route-driven application sets it on `PluridApplicationProvider`.
- **A route-driven application has an id of its own**: the route's `id`, else `route:<value>` (a space
  of a multispace route: `route:<value>#<space>`). They were all `default`, so with `useLocalStorage`
  every route saved over the others and booted with their state, and they shared one look scope.
  State a route-driven application saved under `pluridState-default` is not read any more; a site with
  one route that wants it back sets `id: 'default'` on the route.
- **`planeAddressPath` leaves a route whole.** It cut a trailing `@…` from every address, so
  `/package/react@18` read as `/package/react` in the address bar and at a deep link. It now takes
  routes only; a plane ID's path is `planeIDPath(planeID)` (new, `@plurid/plurid-engine`'s `routing`).
- **A configuration publish relays the roots only when where they go changes** (the layout, the
  centring, the dimensions, the presentation, the plane sizes), compared by value. A look change
  used to relay them and undo the reader's arrangement.

**The bus**

- **Commands read the store, not the last render**: two in one tick act in order (two `view.addPlane`
  both land; a command after a selection sees it).
- **A camera command that is not a tween stops a running tween** (`space.cameraDelta` without
  `animate`, the nudges, the legacy `…With` / `…To`, `space.transform`); the tween used to write over it.
- **Every token is answered**: kind `plane` at once for a route already open (it went unanswered), and
  the new kind `refused` `{ token, route, reason: 'unregistered' | 'noParent' }` when no plane will come.
- **Every `space.changed` carries `application`**, the sender's id.
- **`view.setPlanes` takes the typed entries**, routes and `{ plane: route }`; `{ route }` (which passed
  and then threw in the layout) is refused with a warning.
- **A removed plane is forgotten** by the selection, the active plane and the isolation (a removed
  isolated plane left every other plane transparent).
- **`space.spawnPlane { link }` naming a `PluridLink` opens that link's plane**: the link shows it
  open, and a click on it finds it rather than opening a second.
- **`loading` turns `false`** once the first layout is resolved (it never did on the client).
- A payload without its fields does nothing and warns in development (several topics threw inside
  the bus, silently); a renamed field (`id`, `plane`, `animated`) is named in a warning.

**The handle**

- `tree.spawn(route, parentPlaneID, linkCoordinates?)` opens as `space.spawnPlane` does (it toggled, so
  a second call put the plane away), hangs the bridge at the parent's middle (not its corner), and
  returns the plane's id.
- `camera.moveBy(delta, options)` takes `animate`, `duration`, `easing` and `onSettle` like every
  other camera command.
- `tree.remove(planeID)` clears the plane from the selection, the active plane and the isolation.
- New: `persist.flush()` writes a pending save synchronously, so a host saving its own document no
  longer dispatches a synthetic `pagehide`. `tree.set(tree)` replaces the whole tree as the
  `space.setTree` topic does, and `history.transaction(work)` makes one undo step of several changes,
  instead of dispatching `setTree`, `historyBegin` and `historyEnd` on the store.

**Keyboard, focus, accessibility**

- **The chrome's keys are the chrome's.** Enter and Space on a button (the toolbar, the rail, a plane's
  bar) press it; they framed the plane the pointer had last crossed, or armed the grab. Inside a dialog
  or a menu every key is the dialog's (R no longer switched modes behind the shortcuts sheet). Enter
  frames a plane from its focus anchor, or the active one from the view itself.
- A plane's refresh and isolate controls are buttons (`data-plurid-control="plane-refresh"` /
  `"plane-isolate"`, `aria-pressed` while isolated); the toolbar's transform arrows are buttons
  (`data-plurid-control="transform-arrow"`, `data-plurid-direction`) that the keyboard steps.
- The More menu is a disclosure (`aria-expanded`, `aria-controls`): Escape closes it and gives the
  focus back to its button, and it no longer closes under a keyboard focused inside it.
- The view shows a focus ring for the keyboard (`--plurid-focus`), and the viewcube's turn, the
  dialogs' rise and the toolbar's slide respect `prefers-reduced-motion`.
- In fly mode a click on the chrome no longer captures the pointer, and a lock granted after fly mode
  ended is released.

**Correctness**

- A server-rendered application with `useLocalStorage` hydrates the server's markup, then applies the
  saved state once every plane has hydrated. The saved state in the first render made React discard
  the server's HTML.
- `PluridRouterBrowser` no longer remounts the routed application when the host re-renders it (a theme
  toggle cost the camera, the planes and the history, and fired `onReady` again); at boot an unmatched
  path is the `notFoundPath` route at once.
- Hovering a `PluridLink` with `preview` no longer throws (`#preview-plurid://…` is no selector); the
  preview renders in the link's own plane.
- A spawned child plane reads the host's current `planeContextValue` (it kept the one of its spawn).
- A `PluridApplicationConfigurator`'s bus is bridged once and leaves with it (after a plane refresh,
  every command on it ran twice).
- Two applications on one page: the dialogs' ids are their own, the link leash stays in its own view,
  and a gamepad drives the application with the keyboard (else the page's first), polling only while a
  pad is connected.
- The palette names a plane by its declared title.
- A plane whose component is not a React component (an ElementQL name, `{ name, url }`) shows its
  error card and reports `planeError`; a root rendered the name as a stray element (`<home>`), and a
  spawned plane rendered nothing.

**The engine**

- **A layout type the engine does not lay out no longer empties the space.** `META` (typed, never
  implemented) and an unknown type are laid out as `COLUMNS`, with a development warning, and the
  merged configuration reports the type in force; a name that reads as a member by its letters
  (`'columns'`, `'face to face'`, `'zigzag'`) is that member. `layoutNames` no longer lists `META`; name
  a type with `layoutName(type)` (`@plurid/plurid-data`).
- **Layout numbers are safe.** A face-to-face `middle` of −2 or less, or NaN, hung the tab; it is one
  plane per row (a boolean keeps the count it always meant: `middle: true` is one middle plane). `columnLength` / `rowLength` are whole numbers from 1 to the number of roots (1.5 threw
  a `RangeError`), and a `columns` / `rows` that is not finite is 1.
- **No NaN reaches the camera.** A `space.cameraDelta` part that is missing or not finite moves nothing
  (a missing zoom `anchor` part is the view centre's), and an `absolute` field is written only when
  finite (`perspective` only above 0). A field that is still not finite keeps the camera's previous
  value. Camera limits are validated: `zoomMin` above 0, an inverted range held at `zoomMin`, a negative
  `pitchLimit` / `dollyLimitFraction` the default, a negative `rollLimit` dropped. A string or negative
  `space.perspective` is 2000.
- **Root plane ids stay unique.** A root keeps its id across relayouts and a new root never takes one in
  use (`route@n-2`); `view.setTree` refuses a tree with a duplicate `planeID`. A malformed view item
  (`{ route }`, `null`, a number) is skipped (it threw).
- **A partial `configuration` is partial.** It keeps the theme in force when it names none (`theme:
  null` resets it); a bridge preset applies only when the partial names one; a scalar replaces an
  object, so `docking.url: false` and `culling.detach: 'unmount'` switch off at runtime; and host
  callbacks (`shortcuts.onUnhandledKey`, `pathbar.onChange`) survive the merge (they became no-ops).
- **The merged configuration is normalised.** `null` is the default; a setting with a numeric default
  holds a finite number (`'0.5'` is read; `'2000px'`, NaN and ±Infinity keep the value in force, else
  the default, so **`culling.distance: Infinity` becomes 6000: write a large finite number**); a scalar
  where an object is expected is ignored. Each correction is a development warning
  (`development.warnings: false` silences them). A `null` or NaN culling threshold is the default
  (`culling.distance: null` hid every plane).
- **A plane dropped from `planes` stops resolving.** The application's own registrar holds exactly its
  `planes` prop (it only ever added: an admin plane stayed routable after a logout); a host's
  `planesRegistrar` is only added to. Registrars have `replace(planes)` and `unregister(route)`.
- **Routing.** A query starts at the first `?` (`?q=why?`), and a `#hash` is no part of a route.
  Parameters and fragment text are decoded (`john%20doe` is `john doe`), and plane addresses are
  canonical, so `/p/Jos%C3%A9` and `/p/José` are one plane with one id. **A saved tree whose root routes
  were percent-encoded re-pairs once: those roots lose their carried state on the first load.**
  `RouteParser.extract().route` re-encodes its query (a space is `+`).
- **A plane whose query, fragment, parameters, bridge kind or anchor changed re-renders**: the reconcile
  compares every field of a node (it kept the stale one).
- **Snapping ignores what moves with the selection**: a parent crept toward its own spawned child on
  every release.
- **Big spaces compute in milliseconds.** The registered planes are indexed once per compute: 1000
  roots take about 5 ms (317 ms before; 22 ms for parametric routes, from 872 ms).

**The server (`@plurid/plurid-react-server`)**

- **A preserve's `globals` cannot close the page's script.** Each value is JavaScript source written
  as `window.<name> = <value>;`, and a user's string in it (`JSON.stringify(state)` with a search term
  carrying `</script><script>…`) ran as script. Values are now escaped as the metastate always was
  (`<` as `\u003c`, which reads back the same inside a string literal), so a value must be JSON or
  otherwise keep `<` inside strings: an expression like `a < b` no longer parses. A name that is not a
  JavaScript identifier fails the request with the error page.
- **`<html lang>` is escaped** like every other document field (`?lang=en"><script>…` closed the tag).
- **The built-in 404 and 500 pages are HTML.** They were Promises that Express sent as the JSON `{}`,
  so every unknown URL of an application without a not-found route answered `404 application/json {}`.
  `template.notFoundHtml` replaces the 404 page.
- **A request never takes the process down.** A failing `afterServe` on the 404, redirect and still
  paths was an unhandled rejection that exited the server; a preserve that responds without
  `responded: true` keeps its response instead of crashing on a second send. An error reaching
  Express is answered with its status and a generic body, never a stack or a path, whatever
  `NODE_ENV` says.
- **The host's routes answer.** `handlers(server)` (a new option) runs during construction, before
  the page's catch-all `GET`, and `handle().get(path, …)` registers ahead of it at any time; a
  `GET /status` added through `instance()` after construction sat behind the catch-all and answered 404.
- **`start()` and `stop()` are Promises.** `start()` resolves once the port is bound (it logged
  "Started" first), is idempotent, and rejects on a busy port instead of an unhandled `'error'`. `stop()`
  lets the requests in flight finish and resolves when the server has closed, cutting what is still
  open after `stopTimeout` (new, default 5000 ms); `SIGINT` / `SIGTERM` do the same before exiting 0,
  so a rolling deploy no longer resets the requests being served. Code that called `start()` and went
  on should `await` it.
- **Stills.** `PluridStillsGenerator` works from ESM, forks the server with the parent's environment
  (it passed only `PORT`, dropping `PATH`, `NODE_ENV` and secrets), says so when the built file exports
  no server (a self-starting kit entry), and checks for puppeteer before forking. The Stiller skips a
  page the server answered with an error status (it was stilled and then served with 200), and tells an
  installed puppeteer that fails to load from a missing one.

**The kit (`@plurid/plurid-kit`)**

- **Production pages hydrate under any `buildDir`.** The client script's URL is `/index.js` for any
  build directory; with `buildDir: 'dist'` the manifest said `/dist/client/index.js`, which 404s.
- **`.env` precedence is the documented one:** `.env.<mode>.local` > `.env.<mode>` > `.env.local` >
  `.env`, and a variable already in the environment wins over every file. `.env` used to beat
  `.env.production` (a localhost URL could be inlined into a production client).
- **`plurid build` and `plurid start` fail on a `plurid.config.ts` that does not load** (exit 1, named
  with its cause); `plurid dev` and `plurid info` keep the loud warning and go on by convention. The
  config is bundled in memory: `plurid start` writes nothing (it created `node_modules/.plurid-kit` on
  every start, which failed on a read-only root filesystem or under a non-root `USER`).
- **`plurid start` supervises the server.** It passes `SIGTERM`, `SIGINT` and `SIGHUP` on, waits for
  the server, and exits as it did: `128 + n` when the server was killed by a signal, so
  `restart: on-failure` restarts an OOM-killed server (it exited 0). `plurid dev` releases its pidfile
  on every exit path, and never signals a live process that is not a `plurid dev` (a reused pid).
- **The config is validated** when the server is created: no `routes`, or `routes` that are not an
  array, and the other shape errors are listed at once with what was expected.
- **A function-valued setting is a value; a thunk is marked.** `document` and `handlers` take
  functions, and a thunk was told from the hook by its number of parameters, so a context-free hook
  (`document: () => ({ meta })`) was called at startup and every request failed. A lazy import is now
  `serverOnly(() => import('./document'))` (new export). An unmarked lazy import still works, with a
  one-time suggestion to mark it.
- **`notFound`, `errorPage` and `styles` do what they say.** `notFound` (a component) is the not-found
  route on both targets, or a file under `public/` sent as it is; `errorPage` is a file, or a component
  rendered once to static HTML at startup; each `styles` href is a `<link rel="stylesheet">` (it was
  written into the page as text). All three were ignored.
- **The Dockerfile template runs `node …/plurid-kit/distribution/cli/index.js start`**, one process
  between PID 1 and the server, instead of `pnpm exec plurid start` (two). Regenerate or copy it.

**The generator (`@plurid/generate-plurid-app`)**

- `generate-plurid-app my-site` writes `./my-site` (the directory argument was dropped for
  `./plurid-app`); two different directories, or an argument more, are refused.
- It runs without Node's `require(esm)` (Node 22.0 – 22.11 failed with `ERR_REQUIRE_ESM`), a failed
  step stops its spinner (the terminal hung after the error), and the package managers start on
  Windows (their `.cmd` shims need a shell).
- The generated application type-checks under TypeScript 6 (no `baseUrl`), types its routes as
  `PluridReactRoute[]`, and its preserves example JSON-encodes its global.

**Packaging**

- **Each `exports` condition carries its own declarations**: `import` → `.d.mts`, `require` → `.d.ts`.
  One `types` for both handed an ESM project (`module: NodeNext`) the CommonJS declarations, and the
  README's `new PluridServer(…)` did not compile (TS2351). Every map also exposes `./package.json`.
- **`@plurid/plurid-react` is a client boundary**: every file it emits begins with `'use client'`, so
  Next's App Router imports it from a server component without a wrapper of your own.
- `engines` is `node >=22` everywhere (the READMEs already said so; Node 20 is out of support), the
  homepages point at the packages' real directories, `repository.directory` is set, and plurid-data's
  `jsnext:main` (a file that did not exist) is gone.

**Development**

- Warnings for a flat key in the nested `configuration` (`{ chrome: 'none' }` was silently ignored), an
  unknown key, a look, chrome mode or presentation that is not one, a `view` that is not an array (read
  as one, where it threw), persistence callbacks without `useLocalStorage`, a link to an unregistered
  route, two mounted applications with one `id`, and the deprecated `planeNotFound` (it never did
  anything; it will be removed).
- A hook of the engine outside an application throws an error that says so.
- A bus subscriber that throws is reported (`console.error`, with its topic) in development; the other
  subscribers still run.
- Development is read from `process.env.NODE_ENV` as the host's bundler replaces it: a Vite
  application saw no development warnings (the check needed a `process` global), and the drop
  warnings printed in production.

**New exports**

- By name from `@plurid/plurid-react`: `fragmentOf`, `serializeFragment`, `parseFragment`,
  `materializeFragment`, `FRAGMENT_MARKER`, `FRAGMENT_VERSION`, `domID` (they were on the default export
  alone), `PLURID_SHORTCUTS`, `PLURID_PUBSUB_EMITTED_TOPICS`, `PLURID_CHANGE_KINDS`; the types
  `PluridApplicationProperties`, `PluridApplicationView`, `PluridPubSubPayloads`, `PluridPlaneObservation`,
  `PluridRefusedObservation`, `PluridPlaneErrorObservation`, `PluridPlaneErrorProperties`,
  `PluridShortcutDefinition`.
- `PluridRoute.id` and `PluridRouteSpace.id`; `api.getViewpoint({ version: 3 })` in the type (it
  worked); the published types no longer need the global `JSX` namespace (React 19's types).
- `space.changed` is typed by kind: `PluridChange<K>`, `PluridChangeValues` and `PluridCullingCounts`
  (`@plurid/plurid-data`) narrow `value` on `kind` (`change.kind === 'tree'` makes it a `TreePlane[]`).
  `PluridPubSubMessageChanged` is now a type alias (a union discriminated by `kind`, permissive by
  default), so an interface that `extends` it no longer compiles: use `PluridChange`.
  `getRegisteredPlanes` returns `Map<string, RegisteredPluridPlane<C>>`.
- `@plurid/plurid-functions`: `objects.merge` lets a defined non-object replace an object, and
  `objects.clone` keeps functions by reference (it turned every function into an empty one).
- **Render slots return a React node** in `@plurid/plurid-react`'s props (`PluridApplicationProperties`,
  `PluridApplicationProvider`'s, `renderPlurid`'s): `PluridReactRenderSlot<Context>`, the context kept.
  A slot returning an object compiled and then crashed the whole application. A slot annotated with
  the data package's `PluridRenderSlot` (whose result is `unknown`) no longer type-checks against them:
  annotate it `PluridReactRenderSlot`, or let the prop infer it.
- The published props of `PluridVirtualList`, `PluridExternalPlane`, `PluridIframePlane` and both
  configurators no longer list react-redux's `store` and `context`.

---

# Migrating to the 2026-09-17 and 2026-09-22 releases

`@plurid/plurid-react` 0.0.0-39 and 0.0.0-40, `@plurid/plurid-data` 0.0.0-25 and 0.0.0-26 (tags
`release/2026-09-17` and `release/2026-09-22`). Everything below shipped by 0.0.0-40; four entries are
0.0.0-40's alone: the shortcuts sheet's closing paragraph, `space.bridge.lean`, the bridge as a line and
`space.navigation.framing`.

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

- `space.layout.fallbackPlaneSize(configuration, view)`, `space.tree.logic.carryRootRuntime(previous, next, configured?)`, `space.tree.fields.linkIndexOf(tree)` (every spawned plane by parent and link id, once per tree reference; `findPlaneByLinkID` reads it), exported from `@plurid/plurid-engine` (`import { space } from '@plurid/plurid-engine'`). Every link shares one `ResizeObserver`.
- `interaction.camera.bestYaw(planes)`, `framePlanes(camera, planes, view, { yaw })`, `framePair(camera, parent, child, view)`, `worldPoints(planes)`: the camera's half of the 90.1 decision, exported from `@plurid/plurid-engine` (`import { interaction } from '@plurid/plurid-engine'`).
- `resolveSpawnAnchor(parentWidth, link, { anchor, ordinal, childWidth })` and `anchoredCoordinates(parent, child)` (internal to the engine's `space/location`, not exported): where a spawned child hangs; `TreePlane.bridgeAnchor` and `TreePlane.bridgeKind` (`strip` | `leash`) are stored with the spawn geometry, so a relayout never needs the configuration.
- `space.frame`-family camera commands `{ kind: 'pair', planeID }` and `{ kind: 'planes', planeIDs?, yaw }` in `@plurid/plurid-react`'s `cameraCommand`; on the bus, `space.frame { planeIDs, yaw?: number | 'best' }` frames a set of planes from a yaw (`best` by default: a fan of fins behind a parent reads from the yaw between them), and `space.frame { selection: true, yaw }` the selection from one (without `yaw` it keeps the camera's, as before).
- `space.spawnPlane` grows: `link` (a CSS selector inside the parent, measured as a `PluridLink` measures itself, used when `linkCoordinates` is absent), `bridgeLength`, `bridgeKind` (`strip` | `leash`), `framing` (`pair` | `plane` | `none`). Without coordinates the bridge leaves the parent's MIDDLE height, no longer its `{0, 0}` corner. A spawn of a route already open OPENS it (navigates, never puts it away): a product's spawn means "this branch, here". A fresh spawn frames from its best-known geometry and again from its first measurement.
- The correlation `token` is answered EXACTLY: `/thread/1` no longer answers for `/other/thread/1` (the path must be the same; a query or a fragment on the route asked for is ignored), and a plane that was put away and is shown again answers its token too (until now only a NEW plane did). `hiddenPlaneIDsOf` beside `planeIDsOf`.
- `toggleLinkPlane` takes `mode: 'toggle' | 'open'`, `framing`, `bridgeLength`, `bridgeKind`; `navigatePlane` takes `pair`.
- `view.removePlane { planeID }` takes a SPAWNED plane too: a plane a link or `space.spawnPlane` made is not in the view (the view holds the roots), so matching the view alone left it in the tree, shown, bridged and empty once its host had forgotten what it rendered. By its runtime id, or by its route (every plane at that path), the node goes with its subtree; the selection and the active plane forget it. A root still goes by its route, as before.
- The shortcuts sheet (`?`) ends with what plurid IS: one paragraph and two links (`plurid.com`, `github.com/plurid/plurid`), under a hairline after the keys. A reader meeting a plurid application had nowhere in the chrome to learn what the space around them was. The text and the addresses are `PLURID_ABOUT`, `PLURID_SITE` and `PLURID_REPOSITORY` in plurid-data, so a product rendering its own help can name the same places; `chrome: 'none'` still draws no sheet at all.
- `space.bridge.lean { knee, limit }`: how far a bridge follows a scrolled link. Exactly at the link up to `knee` degrees (default 12), easing toward `limit` (default 22) after that and never reaching it, with the far end always landing on the parent's face - where it used to stretch to the link's own point, turning a 100px bridge into a 500px diagonal at 78 degrees. Every scroll still moves it, by less and less. A `limit` at or under the `knee` pins it there.
- **A bridge is a LINE.** It was a 30px band of the plane's own surface at any length, which on a wide screen is a plate across the space. It is a hairline now: `space.bridge.thickness` (default 3, the crosslink beam's own width), drawn in `--plurid-ink` like every other connector the engine draws, so a bridge and a leash are one object (they share `thickness` and `quiet`); a crosslink beam stays 3 px, rounded, at the ambient tone. `space.bridge.quiet` (default `true`) rests it at 0.14 and brings it to 0.45 while the camera moves or its own plane is active; `false` holds one tone. A product that wants a connector with body raises `thickness`. Where a bridge ATTACHES is unchanged (`TreePlane.bridgeOffset` still hangs the plane half a strip above the link's line), so nothing moves.
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
