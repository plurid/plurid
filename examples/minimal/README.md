# Minimal Example

`App.tsx` is the smallest useful plurid' app: **three planes in a navigable 3D space, zero configuration**.

- **Drag** to orbit · **scroll / pinch** to zoom · hold **G** to grab-pan · **?** for the shortcuts overlay.

A plane is a `route` + a `component`; the `view` is which routes to show first. That's the whole API surface
used here — everything else is opt-in.

Drop it into any React 19 app that can render a `<PluridApplication />` (e.g. copy it over
`fixtures/render-test/src/App.tsx` and run `pnpm --filter plurid-render-test dev`).

Next steps:

- The walkthrough — [`../../GETTING_STARTED.md`](../../GETTING_STARTED.md)
- Every control seam in one component — [`../control-surface`](../control-surface)
