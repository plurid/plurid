// #region imports
    // #region libraries
    import {
        useMemo,
    } from 'react';

    import {
        CameraState,
        CameraDelta,
        CameraMotion,
        PluridBookmarkAction,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        cameraCommand,
        applyCameraDeltaCommand,
        setHome,
        CameraMotionOptions,
    } from '~services/logic/camera';

    import {
        encodeCameraViewpoint,
    } from '~services/logic/viewpoint';
    // #endregion external


    // #region internal
    import {
        useEngineSelector,
        useEngineDispatch,
    } from '../engine';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridCameraHandle {
    /** The live camera. NOTE: changes on every orbit frame — a component using it re-renders per frame. */
    camera: CameraState;
    /** `idle | gesture | fling | tween`. */
    motion: CameraMotion;
    /** The current viewpoint, encoded (v1 by default, v2 with `space.viewpointURLVersion: 2`). */
    viewpoint: string;
    /** The runtime bookmarks (name → encoded viewpoint). */
    bookmarks: Record<string, string>;
    /** Apply one camera delta (orbit / pan / dolly / zoom / absolute), jumping by default. */
    moveBy: (delta: CameraDelta, options?: CameraMotionOptions) => void;
    /** Move to an encoded viewpoint (v1 or v2), tweening by default. */
    moveTo: (viewpoint: string, options?: CameraMotionOptions) => void;
    /** Frame a plane, the selection, or everything. */
    frame: (target?: { planeID?: string; selection?: boolean }, options?: CameraMotionOptions) => void;
    fit: (options?: CameraMotionOptions) => void;
    reset: (options?: CameraMotionOptions) => void;
    home: (options?: CameraMotionOptions) => void;
    /** Make `viewpoint` (or the current camera) the home viewpoint. */
    setHome: (viewpoint?: string) => void;
    preset: (name: string, options?: CameraMotionOptions) => void;
    bookmark: (name: string, action?: PluridBookmarkAction, options?: CameraMotionOptions) => void;
}


/**
 * The camera, as a hook: read it (per frame) and drive every programmatic move — each one an
 * interruptible tween through the engine's motion controller (or a jump with `animate: false`).
 * Works anywhere under a `PluridApplication`.
 */
export const useCamera = (): PluridCameraHandle => {
    const dispatch = useEngineDispatch();
    const camera = useEngineSelector((state) => state.space.camera);
    const motion = useEngineSelector((state) => state.space.motion);
    const bookmarks = useEngineSelector((state) => state.space.bookmarks);
    const viewSize = useEngineSelector((state) => state.space.viewSize);
    const version = useEngineSelector((state) => state.configuration.space.viewpointURLVersion ?? 1);

    const viewpoint = useMemo(
        () => encodeCameraViewpoint(camera, viewSize, version as 1 | 2),
        [camera, viewSize, version],
    );

    const commands = useMemo(() => ({
        moveBy: (delta: CameraDelta, options: CameraMotionOptions = {}) => {
            dispatch(applyCameraDeltaCommand(delta, options.animate ?? false) as any);
        },
        moveTo: (encoded: string, options: CameraMotionOptions = {}) => {
            dispatch(cameraCommand({ kind: 'viewpoint', viewpoint: encoded }, { animate: true, ...options }) as any);
        },
        frame: (target: { planeID?: string; selection?: boolean } = {}, options: CameraMotionOptions = {}) => {
            dispatch(cameraCommand({ kind: 'frame', planeID: target.planeID, selection: target.selection }, { animate: true, ...options }) as any);
        },
        fit: (options: CameraMotionOptions = {}) => {
            dispatch(cameraCommand({ kind: 'fit' }, { animate: true, ...options }) as any);
        },
        reset: (options: CameraMotionOptions = {}) => {
            dispatch(cameraCommand({ kind: 'reset' }, { animate: true, ...options }) as any);
        },
        home: (options: CameraMotionOptions = {}) => {
            dispatch(cameraCommand({ kind: 'home' }, { animate: true, ...options }) as any);
        },
        setHome: (encoded?: string) => {
            dispatch(setHome(encoded) as any);
        },
        preset: (name: string, options: CameraMotionOptions = {}) => {
            dispatch(cameraCommand({ kind: 'preset', name }, { animate: true, ...options }) as any);
        },
        bookmark: (name: string, action: PluridBookmarkAction = 'go', options: CameraMotionOptions = {}) => {
            dispatch(cameraCommand({ kind: 'bookmark', name, action }, { animate: true, ...options }) as any);
        },
    }), [dispatch]);

    return {
        camera,
        motion,
        viewpoint,
        bookmarks: bookmarks || {},
        ...commands,
    };
};
// #endregion module
