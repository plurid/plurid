// #region imports
    // #region libraries
    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        mathematics,
    } from '@plurid/plurid-functions';

    import {
        PluridConfiguration,
        PluridStateSpace,
        PluridPubSubMessageFrame,
        PluridBookmarkAction,
        TreePlane,
        CameraDelta,
        CameraState,
        ViewSize,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';
    import { PluridThunkExtra } from '~services/state/extra';

    import {
        interaction,
        space as spaceEngine,
    } from '~services/engine';

    import {
        decodeCameraViewpoint,
        encodeCameraViewpoint,
    } from '~services/logic/viewpoint';

    import {
        EasingName,
    } from '~services/logic/motion';
    // #endregion external
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

type Dispatch = ThunkDispatch<{}, {}, AnyAction>;
type GetState = () => AppState;
export type CameraThunk = (
    dispatch: Dispatch,
    getState: GetState,
    extra?: PluridThunkExtra,
) => void;


export interface CameraMotionOptions {
    /** Tween through the motion controller (default `true`); `false` jumps. */
    animate?: boolean;
    /** ms; default `navigation.motion.duration`. */
    duration?: number;
    easing?: EasingName;
}


/**
 * The size a plane renders at before it has been measured: the configured plane width (a fraction
 * of the view, or absolute px) and a proportional height. Used as the fallback for framing.
 */
export const resolvePlaneFallbackSize = (
    configuration: PluridConfiguration,
    viewSize: ViewSize,
): { width: number; height: number } => {
    const planeWidth = configuration.elements.plane.width;
    const width = mathematics.numbers.checkIntegerNonUnit(planeWidth)
        ? planeWidth
        : planeWidth * viewSize.width;

    return {
        width,
        height: Math.max(200, Math.round(width * 0.7)),
    };
};


const planeGeometry = (
    plane: TreePlane,
    fallback: { width: number; height: number },
) => ({
    location: plane.location,
    width: plane.width || fallback.width,
    height: plane.height || fallback.height,
});


// #region targets
/** The camera that frames one plane face-on, from the current space state. */
export const frameTargetForPlane = (
    spaceState: PluridStateSpace,
    configuration: PluridConfiguration,
    plane: TreePlane,
): CameraState => cameraEngine.framePlane(
    spaceState.camera,
    planeGeometry(plane, resolvePlaneFallbackSize(configuration, spaceState.viewSize)),
    spaceState.viewSize,
    {
        limits: spaceState.cameraLimits,
    },
);


/** The camera that frames every visible plane (children included), front-on by default. */
export const fitTarget = (
    spaceState: PluridStateSpace,
    configuration: PluridConfiguration,
    faceOn = true,
): CameraState | undefined => {
    if (!spaceState.tree || spaceState.tree.length === 0) {
        return undefined;
    }

    const fallback = resolvePlaneFallbackSize(configuration, spaceState.viewSize);

    return cameraEngine.fitAll(
        spaceState.camera,
        spaceState.tree,
        spaceState.viewSize,
        {
            faceOn,
            fallbackWidth: fallback.width,
            fallbackHeight: fallback.height,
            limits: spaceState.cameraLimits,
        },
    );
};


/** The camera that frames the current selection (its world bounds), keeping the orientation. */
export const selectionTarget = (
    spaceState: PluridStateSpace,
    configuration: PluridConfiguration,
): CameraState | undefined => {
    const {
        selectedPlaneIDs,
        tree,
        viewSize,
        camera,
        cameraLimits,
    } = spaceState;
    if (selectedPlaneIDs.length === 0) {
        return undefined;
    }

    const selected = new Set(selectedPlaneIDs);
    const fallback = resolvePlaneFallbackSize(configuration, viewSize);
    const planes: TreePlane[] = [];
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            if (selected.has(node.planeID)) {
                planes.push(node);
            }
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(tree);

    const box = cameraEngine.worldBounds(
        planes.map(plane => ({ ...plane, children: undefined })),
        {
            fallbackWidth: fallback.width,
            fallbackHeight: fallback.height,
        },
    );
    if (!box) {
        return undefined;
    }

    return cameraEngine.frameBounds(camera, box, viewSize, {
        limits: cameraLimits,
    });
};


const decodeTarget = (
    spaceState: PluridStateSpace,
    encoded: string | undefined,
): CameraState | undefined => (encoded
    ? (decodeCameraViewpoint(encoded, spaceState.viewSize, spaceState.camera.perspective, spaceState.cameraLimits) || undefined)
    : undefined);


/** Home: the runtime home (`space.setHome`), else `navigation.home`, else the identity camera. */
export const homeTarget = (
    spaceState: PluridStateSpace,
    configuration: PluridConfiguration,
): CameraState => (
    decodeTarget(spaceState, spaceState.home)
    || decodeTarget(spaceState, configuration.space.navigation?.home)
    || cameraEngine.identityCamera(spaceState.viewSize, spaceState.camera.perspective)
);


export const presetTarget = (
    spaceState: PluridStateSpace,
    configuration: PluridConfiguration,
    name: string,
): CameraState | undefined => decodeTarget(spaceState, configuration.space.navigation?.presets?.[name]);


export const bookmarkTarget = (
    spaceState: PluridStateSpace,
    name: string,
): CameraState | undefined => decodeTarget(spaceState, spaceState.bookmarks?.[name]);
// #endregion targets


/**
 * Commit a camera target: an interruptible tween through the View's motion controller when
 * animated and a View is mounted, else one jump. The ONE exit of every programmatic camera move.
 */
export const commitCameraTarget = (
    dispatch: Dispatch,
    extra: PluridThunkExtra | undefined,
    target: CameraState,
    options: CameraMotionOptions = {},
) => {
    const {
        animate = true,
        duration,
        easing,
    } = options;

    const controller = extra?.motion;
    if (animate && controller) {
        controller.tweenTo(target, {
            duration,
            easing,
        });
        return;
    }

    dispatch(actions.space.setCamera(target));
};


export type CameraCommand =
    | { kind: 'frame'; planeID?: string; selection?: boolean }
    | { kind: 'fit'; faceOn?: boolean }
    | { kind: 'reset' }
    | { kind: 'home' }
    | { kind: 'preset'; name: string }
    | { kind: 'bookmark'; name: string; action?: PluridBookmarkAction }
    | { kind: 'viewpoint'; viewpoint: string }
    | { kind: 'delta'; delta: CameraDelta };


/** The camera a command resolves to (pure), or `undefined` when there is nothing to go to. */
export const resolveCameraTarget = (
    command: CameraCommand,
    state: AppState,
): CameraState | undefined => {
    const spaceState = state.space;
    const configuration = state.configuration;

    switch (command.kind) {
        case 'frame': {
            if (command.planeID) {
                const plane = spaceEngine.tree.logic.getTreePlaneByID(spaceState.tree, command.planeID);
                return plane
                    ? frameTargetForPlane(spaceState, configuration, plane)
                    : undefined;
            }
            if (command.selection) {
                return selectionTarget(spaceState, configuration);
            }
            return fitTarget(spaceState, configuration);
        }
        case 'fit':
            return fitTarget(spaceState, configuration, command.faceOn ?? true);
        case 'reset':
            return cameraEngine.identityCamera(spaceState.viewSize, spaceState.camera.perspective);
        case 'home':
            return homeTarget(spaceState, configuration);
        case 'preset':
            return presetTarget(spaceState, configuration, command.name);
        case 'bookmark':
            return (command.action ?? 'go') === 'go'
                ? bookmarkTarget(spaceState, command.name)
                : undefined;
        case 'viewpoint':
            return decodeTarget(spaceState, command.viewpoint);
        case 'delta':
            return cameraEngine.applyCameraDelta(
                spaceState.camera,
                command.delta,
                spaceState.viewSize,
                spaceState.cameraLimits,
            );
        default:
            return undefined;
    }
};


/**
 * Every non-gesture camera move: resolve the target from the live state, then tween (or jump).
 * `bookmark` with `save` / `remove` edits the bookmarks instead of moving.
 */
export const cameraCommand = (
    command: CameraCommand,
    options: CameraMotionOptions = {},
): CameraThunk => (dispatch, getState, extra) => {
    const state = getState();

    if (command.kind === 'bookmark') {
        const action = command.action ?? 'go';
        if (action === 'save') {
            dispatch(actions.space.setBookmark({
                name: command.name,
                viewpoint: encodeCameraViewpoint(state.space.camera, state.space.viewSize, 2),
            }));
            return;
        }
        if (action === 'remove') {
            dispatch(actions.space.removeBookmark(command.name));
            return;
        }
    }

    const target = resolveCameraTarget(command, state);
    if (!target) {
        return;
    }

    commitCameraTarget(dispatch, extra, target, options);
};


// #region wrappers
/** Frame a plane node (already resolved). */
export const framePlaneNode = (
    plane: TreePlane,
    animate = true,
): CameraThunk => (dispatch, getState, extra) => {
    const state = getState();
    commitCameraTarget(
        dispatch,
        extra,
        frameTargetForPlane(state.space, state.configuration, plane),
        {
            animate,
        },
    );
};


/** Frame a plane by id (root or child). */
export const framePlaneByID = (
    planeID: string,
    animate = true,
): CameraThunk => cameraCommand({ kind: 'frame', planeID }, { animate });


/** Frame the current selection (its world bounds), keeping the current orientation. */
export const frameSelection = (
    animate = true,
): CameraThunk => cameraCommand({ kind: 'frame', selection: true }, { animate });


/** Frame every visible plane, front-on by default. Tweens by default. */
export const fitToView = (
    options: { animate?: boolean; faceOn?: boolean } = {},
): CameraThunk => cameraCommand(
    { kind: 'fit', faceOn: options.faceOn },
    { animate: options.animate ?? true },
);


/** Back to the identity view. */
export const resetCamera = (
    animate = true,
): CameraThunk => cameraCommand({ kind: 'reset' }, { animate });


export const goHome = (
    animate = true,
): CameraThunk => cameraCommand({ kind: 'home' }, { animate });


export const goPreset = (
    name: string,
    animate = true,
): CameraThunk => cameraCommand({ kind: 'preset', name }, { animate });


export const bookmarkCommand = (
    {
        name,
        action = 'go',
        animate = true,
    }: { name: string; action?: PluridBookmarkAction; animate?: boolean },
): CameraThunk => cameraCommand({ kind: 'bookmark', name, action }, { animate });


/** Make `viewpoint` (encoded) the home viewpoint, or the current camera when omitted. */
export const setHome = (
    viewpoint?: string,
): CameraThunk => (dispatch, getState) => {
    const {
        camera,
        viewSize,
    } = getState().space;

    dispatch(actions.space.setHome(
        viewpoint ?? encodeCameraViewpoint(camera, viewSize, 2),
    ));
};


/** The `space.frame` topic: a plane, the selection, or everything. */
export const frameCommand = (
    message: PluridPubSubMessageFrame | undefined,
): CameraThunk => {
    const animate = message?.animate ?? true;

    if (message?.planeID) {
        return cameraCommand({ kind: 'frame', planeID: message.planeID }, { animate });
    }
    if (message?.selection) {
        return cameraCommand({ kind: 'frame', selection: true }, { animate });
    }
    return cameraCommand({ kind: 'fit' }, { animate });
};


/** Move the camera to an encoded viewpoint (v1 or v2). Malformed strings are ignored. */
export const setViewpoint = (
    encoded: string,
    animate = false,
): CameraThunk => cameraCommand({ kind: 'viewpoint', viewpoint: encoded }, { animate });


/** The `space.cameraDelta` topic: applied at once, or tweened to its result. */
export const applyCameraDeltaCommand = (
    delta: CameraDelta,
    animate = false,
): CameraThunk => (animate
    ? cameraCommand({ kind: 'delta', delta }, { animate: true })
    : (dispatch) => {
        dispatch(actions.space.applyCameraDelta(delta));
    });
// #endregion wrappers
// #endregion module
