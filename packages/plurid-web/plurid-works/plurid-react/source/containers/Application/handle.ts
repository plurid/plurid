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
        PluridStateHistory,
        LinkCoordinates,
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
        moveBy: (delta: CameraDelta, options?: CameraMotionOptions) => void;
        moveTo: (viewpoint: string, options?: CameraMotionOptions) => void;
        frame: (target?: { planeID?: string; selection?: boolean }, options?: CameraMotionOptions) => void;
        fit: (options?: CameraMotionOptions) => void;
        reset: (options?: CameraMotionOptions) => void;
        home: (options?: CameraMotionOptions) => void;
        setHome: (viewpoint?: string) => void;
        preset: (name: string, options?: CameraMotionOptions) => void;
        bookmark: (name: string, action?: PluridBookmarkAction, options?: CameraMotionOptions) => void;
    };
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
    };
    history: {
        get: () => PluridStateHistory;
        undo: () => void;
        redo: () => void;
    };
    tree: {
        get: () => TreePlane[];
        /** Replace the roots (relayout with the planes gliding). */
        setView: (view: PluridApplicationView) => void;
        /** Spawn a registered route as a child of `parentPlaneID`, joined by a bridge at `linkCoordinates`. */
        spawn: (route: string, parentPlaneID: string, linkCoordinates?: LinkCoordinates) => void;
        /** Hide a plane; the one in view hands the camera to its parent (`space.navigation.onClose`). */
        close: (planeID: string, options?: ClosePlaneOptions) => void;
        open: (planeID: string) => void;
        remove: (planeID: string) => void;
    };
    /** Move keyboard focus to the space (so the shortcuts apply). */
    focus: () => void;
}
// #endregion module
