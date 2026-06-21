# Control-Surface Example

`App.tsx` is a runnable reference that exercises **every tier** of the Plurid developer-control surface
in one small "spatial notes" component:

- **Tier 0** — `onReady(api)`: the store + pubsub + synchronous reads.
- **Tier 1** — pubsub: a *Fit all* / *Undo* button (control) + reacting to selection changes (observe).
- **Tier 2** — a `sessionStorage` `storageAdapter` + tuned `timings` (undo left ON).
- **Tier 3** — `gestures.buttonMap` (left-drag orbits, wheel left to the page), `shortcuts.onUnhandledKey`
  (the app owns ⌘K), and a custom `renderToolbar` slot.

It is type-correct against the public `@plurid/plurid-react` API. Drop it into any React app that renders
a `<PluridApplication />` (e.g. copy it over a `fixtures/render-test`-style host).

Full reference with a snippet per feature: [`../../docs/CONTROL_SURFACE.md`](../../docs/CONTROL_SURFACE.md).
