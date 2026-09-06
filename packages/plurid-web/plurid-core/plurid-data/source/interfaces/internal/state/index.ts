// #region imports
    // #region libraries
    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PluridApplicationView,
    } from '../../external/application';

    import {
        PluridConfiguration,
    } from '../../external/configuration';

    import {
        TreePlane,
        PlaneLink,
    } from '../tree';

    import {
        ViewSize,
        SpaceSize,
    } from '../utilities';

    import {
        CameraState,
        CameraLimits,
        CameraMotion,
    } from '../camera';
    // #endregion external
// #endregion imports



// #region module
export interface PluridState {
    configuration: PluridConfiguration;
    shortcuts: PluridStateShortcuts;
    space: PluridStateSpace;
    themes: PluridStateThemes;
    ui: PluridStateUI;
}



export interface PluridStateShortcuts {
    global: boolean;
}


export interface PluridStateSpace {
    loading: boolean;
    resolvedLayout: boolean;
    transformTime: number;
    /**
     * The camera proper — the single source of truth for where the viewer is. Every camera
     * mutation commits through it; the six scalars below are mirrors derived from it.
     */
    camera: CameraState;
    /** Pitch / zoom / dolly limits the camera is clamped to (from `space.navigation`). */
    cameraLimits: CameraLimits;
    /** What is currently driving the camera: a gesture, a fling, a tween, or nothing. */
    motion: CameraMotion;
    /**
     * The page a running tween is DOCKING on — its destination, written when a docking tween starts
     * and cleared when the motion leaves `tween`; `''` otherwise. Not the docked state (that stays
     * derived from the camera): the one fact about a tween the camera cannot tell yet.
     */
    dockingPlaneID: string;
    /** @deprecated mirror of `camera` (legacy parameterization); read-only for consumers. */
    scale: number;
    /** @deprecated mirror of `camera.pitch`. */
    rotationX: number;
    /** @deprecated mirror of `camera.yaw`. */
    rotationY: number;
    /** @deprecated mirror of `camera` (legacy parameterization). */
    translationX: number;
    /** @deprecated mirror of `camera` (legacy parameterization). */
    translationY: number;
    /** @deprecated mirror of `camera` (legacy parameterization). */
    translationZ: number;
    /** The rendered `matrix3d(...)`, derived from `camera` + `viewSize`. */
    transform: string;
    tree: TreePlane[];
    /** Arbitrary plane↔plane relationships, independent of the parent→child `tree`. */
    links: PlaneLink[];
    activeUniverseID: string;
    viewSize: ViewSize;
    spaceSize: SpaceSize;
    view: PluridApplicationView;
    culledView: PluridApplicationView;
    activePlaneID: string;
    isolatePlane: string;
    lastClosedPlane: string;
    /** Multi-selection working set — the planes the user has selected to act on as a group. */
    selectedPlaneIDs: string[];
    /** True while the selection is being drag-moved — drives the live alignment-guide overlay. */
    draggingSelection: boolean;
    /** Spatial undo/redo availability, maintained by the history middleware. */
    history: PluridStateHistory;
    /** Runtime bookmarks: name → encoded viewpoint (persisted with the space). */
    bookmarks: Record<string, string>;
    /**
     * The runtime home viewpoint (encoded), set through `space.setHome`; falls back to
     * `navigation.home`, then to the identity camera.
     */
    home?: string;
    /**
     * While > 0 (ms), plane placements transition to their new locations (an animated relayout);
     * the View clears it once the transition has run.
     */
    layoutTransition: number;
    /** The culling pass's result: planes that stop painting, planes that are contained (both kept mounted). */
    culled: {
        hidden: string[];
        frozen: string[];
    };
}


export interface PluridStateHistory {
    canUndo: boolean;
    canRedo: boolean;
    undoDepth: number;
    redoDepth: number;
}


export interface PluridStateThemes {
    general: Theme;
    interaction: Theme;
}


export interface PluridStateUI {
    toolbarScrollPosition: number;
    /** Grab / navigate mode toggled with G. */
    grabMode: boolean;
    /** Grab mode held down with Space. */
    grabHold: boolean;
    /** The keyboard-shortcuts help overlay. */
    shortcutsOverlayVisible: boolean;
    /** The rubber-band selection rectangle (view px) while a marquee drag is in progress. */
    marquee: { left: number; top: number; right: number; bottom: number } | null;
}
// #endregion module
