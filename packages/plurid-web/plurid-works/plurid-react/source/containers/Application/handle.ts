// #region imports
    // #region libraries
    import {
        PluridApi,
        PluridApplicationView,
        TreePlane,
        CameraState,
        CameraDelta,
        CameraMotion,
        PluridBookmarkAction,
        PluridNamedViewpoint,
        PluridStateHistory,
        LinkCoordinates,
        PluridPlaneAnchor,
        PluridAnchorResolution,
        PluridTourControls,
        PluridPinnedRect,
        PluridPinnedPlane,
        PluridPlaceOptions,
        PluridPlaceResult,
        PluridStack,
        PluridStackOptions,
        PluridOccluded,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        CameraMotionOptions,
    } from '~services/logic/camera';
    // #endregion external
    import type {
        ClosePlaneOptions,
    } from '~services/state/thunks/planes';
    import type {
        PluridRestOptions,
    } from '~services/logic/rest';
// #endregion imports



// #region module
/**
 * The imperative handle of a `PluridApplication` (`ref`): the `onReady` api plus typed camera,
 * selection, history and tree commands — the same thunks the gestures, shortcuts and topics use.
 */
export interface PluridApplicationHandle extends PluridApi {
    camera: {
        get: () => CameraState;
        motion: () => CameraMotion;
        /** Move by a delta: a jump by default; `animate` tweens (with `duration`, `easing`); `onSettle` either way. */
        moveBy: (delta: CameraDelta, options?: CameraMotionOptions) => void;
        moveTo: (viewpoint: string, options?: CameraMotionOptions) => void;
        frame: (target?: { planeID?: string; selection?: boolean }, options?: CameraMotionOptions) => void;
        fit: (options?: CameraMotionOptions) => void;
        reset: (options?: CameraMotionOptions) => void;
        home: (options?: CameraMotionOptions) => void;
        setHome: (viewpoint?: string) => void;
        preset: (name: string, options?: CameraMotionOptions) => void;
        bookmark: (name: string, action?: PluridBookmarkAction, options?: CameraMotionOptions) => void;
        /** The page presentation: the docked page's id (`''` when the camera is off every page). */
        docked: () => string;
        /** Dock on a page: the named one, else the docked one, else the page nearest the view center. */
        dock: (planeID?: string, options?: CameraMotionOptions) => void;
        /** Reveal the space from the docked page. */
        reveal: (options?: CameraMotionOptions) => void;
        /**
         * Go to a camera named by a plane (2026-10-30): its path, which plane at that path, and the
         * pose in its frame, resolved against the space as it is now. The answer says where it went
         * (the plane, the camera), or why it did not move (`absent`, `hidden`).
         */
        anchor: (anchor: PluridPlaneAnchor, options?: CameraMotionOptions) => PluridAnchorResolution;
        /** Stop whatever moves the camera (a tween, a fling) where it is. An exclusive tween is told (`onInterrupt`). */
        cancel: () => void;
        /** Whether camera moves jump: the reader prefers reduced motion and `navigation.motion.reducedMotion` respects it. */
        reducedMotion: () => boolean;
    };
    /**
     * TOURS (2026-10-30): play a sequence of anchored stops, pause, resume, step, seek, stop, observe
     * every event, and record a tour from where the reader comes to rest.
     */
    tour: PluridTourControls;
    /**
     * Resolve `true` once the camera is still and no relayout glides, for `frames` frames in a row
     * (3), or `false` after `timeout` ms (4000): the moment a host draws over what the camera came to.
     */
    whenAtRest: (options?: PluridRestOptions) => Promise<boolean>;
    selection: {
        get: () => string[];
        set: (planeIDs: string[]) => void;
        toggle: (planeID: string) => void;
        clear: () => void;
        all: () => void;
        invert: () => void;
        align: (edge: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY') => void;
        distribute: (axis: 'x' | 'y') => void;
        duplicate: (offset?: number) => void;
        /** The selection as an arrangement fragment, on the clipboard (`cut` closes it afterwards). */
        copy: (options?: { cut?: boolean }) => void;
        cut: () => void;
        /** Paste a fragment: the given text, else what this document last copied. */
        paste: (text?: string) => void;
    };
    /**
     * THE NAMED VIEWPOINTS: the reader's bookmarks, the host's presets and home — one shape for the
     * three (`PluridNamedViewpoint`), each with the camera it decodes to.
     */
    bookmarks: {
        get: () => PluridNamedViewpoint[];
        /** Save the current camera under `name` (an existing name is overwritten). */
        save: (name: string) => void;
        /** Travel to one: a bookmark by default, a preset or home by `source`. */
        go: (entry: string | Pick<PluridNamedViewpoint, 'source' | 'name'>, options?: CameraMotionOptions) => void;
        remove: (name: string) => void;
        /** Rename a bookmark, keeping its place in the list. */
        rename: (from: string, to: string) => void;
    };
    history: {
        get: () => PluridStateHistory;
        undo: () => void;
        redo: () => void;
        /**
         * Run `work` as ONE undo step: every arrangement change it makes (spawns, closes, a whole
         * `tree.set`) undoes and redoes together. Nested transactions join the outer one.
         */
        transaction: (work: () => void) => void;
        /** Jump `index` steps as one restore: negative undoes, positive redoes (`history.get().past / .future` list them). */
        goTo: (index: number) => void;
    };
    tree: {
        get: () => TreePlane[];
        /** The culling pass's counts: hidden, frozen, detached (`culling.detach`) planes. */
        culling: () => { hidden: number; frozen: number; detached: number };
        /** Replace the roots (relayout with the planes gliding). */
        setView: (view: PluridApplicationView) => void;
        /**
         * Replace the whole tree, children and placements included, as the `space.setTree` topic
         * does: a product that arranges its own space restores a saved arrangement with it. The tree
         * is set exactly (its locations, pins and sizes over the live ones), the view follows its
         * roots, and a malformed tree leaves the tree as it was, with a development warning.
         */
        set: (tree: TreePlane[]) => void;
        /**
         * Open a registered route as a child of `parentPlaneID`, as `space.spawnPlane` does: a route
         * already open there is gone to, never put away; the bridge leaves at `linkCoordinates`, else
         * the parent's middle height. Returns the plane's id, `undefined` when nothing could open
         * (an unregistered route, a parent that is not there).
         */
        spawn: (route: string, parentPlaneID: string, linkCoordinates?: LinkCoordinates) => string | undefined;
        /** Hide a plane; the one in view hands the camera to its parent (`space.navigation.onClose`). */
        close: (planeID: string, options?: ClosePlaneOptions) => void;
        open: (planeID: string) => void;
        /** Remove a plane and its subtree; the selection, the active plane and the isolation forget them. */
        remove: (planeID: string) => void;
    };
    /**
     * PINNED AND STACKED PLANES (2026-10-31). A pinned plane is a plane of the space lifted onto the
     * screen at a fixed rect, above the space, unmoved by the camera: the same route, id and
     * content, which neither a pin nor a place remounts. A stack sets 2 to 12 planes one behind
     * another, facing the camera.
     */
    planes: {
        /**
         * Open a registered route as a NEW pinned plane (a root), at `rect`, else at a free slot on
         * the right edge; no other root moves. Its id, `undefined` for an unregistered or pin-ineligible route.
         */
        open: (route: string, options?: { rect?: PluridPinnedRect; collapsed?: boolean }) => string | undefined;
        /**
         * Pin a plane of the space to the screen, at `rect`, else at a free slot on the right edge;
         * a pinned plane takes the new rect and comes to the front. `false` for a plane not in the
         * shown tree, or one whose registration/predicate refuses pinning.
         */
        pin: (planeID: string, rect?: PluridPinnedRect) => boolean;
        /**
         * Put a pinned plane into the space where its frame is, face-on, at the frame's size: it
         * becomes a regular plane, a root (free: no other root moves) or a child of the plane it
         * hangs from, or of `parentPlaneID`. A camera turned both ways is levelled first, a tween
         * through the motion controller; `interrupted` when an input takes the camera first.
         */
        place: (planeID: string, options?: PluridPlaceOptions) => Promise<PluridPlaceResult>;
        /** Collapse a pinned plane to its title bar, or expand it (`false`); toggles without `collapsed`. */
        collapse: (planeID: string, collapsed?: boolean) => boolean;
        /** Bring a pinned plane to the front of the pinned planes. */
        raise: (planeID: string) => boolean;
        /** The pinned planes, back first, each with its frame in view px. */
        pinned: () => PluridPinnedPlane[];
        /** Whether a shown plane may be pinned according to its registration/predicate. */
        pinnable: (planeID: string) => boolean;
        /**
         * Stack 2 to 12 planes, the first in front: each a step down-right of and nearer than the
         * one behind it, facing the camera, the stack's middle on the view's centre. The stack's id,
         * `undefined` when the planes cannot stack (too few or many, absent, closed, pinned).
         */
        stack: (planeIDs: string[], options?: PluridStackOptions) => string | undefined;
        /** Put each plane of a stack (its id), or the planes named, back exactly where it was. */
        unstack: (reference: string | string[], options?: { animate?: boolean }) => boolean;
        stacks: () => PluridStack[];
        /**
         * The planes faded in front of the plane the camera rests on (`space.occlusion`): the target
         * and the faded planes, the most covering first; empty while the camera moves.
         */
        occluded: () => PluridOccluded;
    };
    /** The persisted state (`useLocalStorage`, a `storageAdapter`). */
    persist: {
        /**
         * Write a pending save now, synchronously, as hiding the page does. A host that saves its
         * own document alongside the space calls it first, instead of dispatching `pagehide`.
         * With nothing pending, nothing is written.
         */
        flush: () => void;
    };
    /** Move keyboard focus to the space (so the shortcuts apply). */
    focus: () => void;
}
// #endregion module
