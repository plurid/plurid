// #region module
/**
 * The engine's stacking ladder, INSIDE the view (every overlay is `position: absolute` in the
 * `position: relative` view, so an embedded space keeps its overlays inside its container). One
 * place to own the order; no component picks its own number.
 */
export const Z_INDEX = {
    /** Plane chrome that must sit above plane content (resize handles). */
    PLANE_CHROME: 5,
    /** The rubber-band selection rectangle. */
    MARQUEE: 10,
    /** Plane hover previews. */
    PREVIEW: 20,
    /** The transform-origin indicator. */
    ORIGIN: 30,
    VIEWCUBE: 40,
    MINIMAP: 41,
    TOOLBAR: 50,
    /** The shortcuts `?` trigger. */
    SHORTCUTS_TRIGGER: 60,
    /** The shortcuts dialog and its backdrop. */
    SHORTCUTS_DIALOG: 70,
    /** The performance HUD. */
    DEBUGGER: 80,
} as const;
// #endregion module
