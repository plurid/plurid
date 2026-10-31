// #region imports
    // #region external
    import type {
        TreePlaneLocation,
    } from '~interfaces/internal/tree';

    import type {
        PluridMotionEasing,
    } from '~interfaces/external/configuration';
    // #endregion external
// #endregion imports



// #region module
// #region pinned
/** The current instance a registered plane's pin policy decides for. */
export interface PluridPlanePinContext {
    planeID: string;
    route: string;
    parameters: Readonly<Record<string, string>>;
}

/** A synchronous host policy; absent permits pinning, a false answer or an exception refuses it. */
export type PluridPlanePinnable = boolean | ((context: PluridPlanePinContext) => boolean);

/** The corner a pinned rect is measured from. */
export type PluridPinnedAnchor =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';

/**
 * WHERE A PINNED PLANE STANDS ON THE SCREEN (2026-10-31): a rect in the view, its `x` / `y` measured
 * from the `anchor` corner inward (`top-right`: `x` from the right edge to the rect's right edge).
 * In px, or with `unit: 'fraction'` in fractions of the view's width (`x`, `width`) and height (`y`,
 * `height`), so it keeps its place and size through a resize.
 */
export interface PluridPinnedRect {
    x: number;
    y: number;
    width: number;
    height: number;
    /** Default `px`. */
    unit?: 'px' | 'fraction';
    /** Default `top-left`. */
    anchor?: PluridPinnedAnchor;
}

/**
 * A PINNED PLANE (2026-10-31): a plane lifted out of the space onto a screen-space layer above it,
 * at a fixed rect the camera does not move; the same plane (route, id, content), held on its tree
 * node, so it persists, and goes back into the space with `place`. The layout gives a pinned root no
 * slot.
 */
export interface PluridPinnedState {
    rect: PluridPinnedRect;
    /** Only the title bar shows; collapsed planes stack along an edge without overlapping. */
    collapsed?: boolean;
    /** The stacking order among the pinned planes: the highest is in front. */
    order: number;
}

/** A rect in view px: what a pinned rect resolves to against the view. */
export interface PluridScreenRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

/** What a `space.changed` of kind `pinned` lists, per pinned plane, front last. */
export interface PluridPinnedPlane {
    planeID: string;
    route: string;
    rect: PluridPinnedRect;
    collapsed: boolean;
    order: number;
    /** Where the frame stands now, in view px (a collapsed plane's bar, in its slot along the edge). */
    frame: PluridScreenRect;
}

/** How `place` moves a pinned plane into the space. */
export interface PluridPlaceOptions {
    /**
     * The plane it hangs from once placed. Default: where it is in the tree (a root stays a root, a
     * child its parent's). A child can be given another parent; a root's place in the tree is kept.
     */
    parentPlaneID?: string;
    /** Tween the camera when it must be levelled for the plane to land where its frame is. Default `true`. */
    animate?: boolean;
    duration?: number;
    easing?: PluridMotionEasing;
}

/**
 * How a `place` ended: `placed` in the space; `interrupted` (an input or another move took the camera
 * while it levelled, and the plane stays pinned); `refused` (no such plane, or not pinned).
 */
export type PluridPlaceResult =
    | 'placed'
    | 'interrupted'
    | 'refused';
// #endregion pinned


// #region stack
/**
 * The offset from each plane of a stack to the one IN FRONT of it, in px: `x` right, `y` down, `z`
 * toward the camera. Every plane sits down-right of the one behind it, so each title stays in view
 * above and left of the plane that covers the rest of it.
 */
export interface PluridStackStep {
    x: number;
    y: number;
    z: number;
}

/** How stacked planes are turned: toward the `camera` (default), to the world's `front`, or as each `keep`s itself. */
export type PluridStackFacing =
    | 'camera'
    | 'front'
    | 'keep';

export interface PluridStackOptions {
    /** Default: relative to the front plane's size (`x` 5 % of its width, `y` a title bar and 3 % of its height, `z` 15 % of its width). */
    step?: Partial<PluridStackStep>;
    facing?: PluridStackFacing;
    /** Glide into the stack (the relayout's glide, instant under reduced motion). Default `true`. */
    animate?: boolean;
}

/** A plane's placement before it was stacked: what `unstack` puts back, exactly. */
export interface PluridStackPlacement {
    location: TreePlaneLocation;
    manuallyPositioned?: boolean;
}

/** STACKED PLANES (2026-10-31): planes set one behind another in depth, and where each one was. */
/**
 * THE PLANES FADED IN FRONT OF A PLANE (2026-10-31): `target` is the plane the camera came to rest on
 * (framed, docked, anchored, a tour's stop, focused), `planeIDs` the planes that stood between the
 * camera and it and are faded and click-through, the most covering first. Empty while the camera
 * moves, and with no target.
 */
export interface PluridOccluded {
    target: string;
    planeIDs: string[];
}

/** `space.occlusion`: fade the planes in front of the plane the camera rests on, or leave them. */
export type PluridOcclusionMode = 'fade' | 'none';

export interface PluridStack {
    stackID: string;
    /** Front first. */
    planeIDs: string[];
    previous: Record<string, PluridStackPlacement>;
}
// #endregion stack
// #endregion module
