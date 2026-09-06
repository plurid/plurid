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
    import { SetPlaneSizePayload } from '~services/state/modules/space/types';

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
    /** Called once the camera has landed (at once for a jump; never for an interrupted tween). */
    onSettle?: () => void;
}


/**
 * The size a plane renders at before it has been measured: the configured plane width (a fraction
 * of the view, or absolute px) and a proportional height. Used as the fallback for framing.
 */
export const resolvePlaneFallbackSize = (
    configuration: PluridConfiguration,
    viewSize: ViewSize,
): { width: number; height: number } => {
    // the configured width and, when there is one, the configured height (`elements.plane.height`:
    // every plane view-sized in the page presentation); else a proportional height
    const configured = spaceEngine.layout.configuredPlaneSize(configuration, viewSize);
    return {
        width: configured.width,
        height: configured.height || Math.max(200, Math.round(configured.width * 0.7)),
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
/**
 * The camera that frames one plane face-on, from the current space state. In the PAGE presentation
 * framing is DOCKING: scale 1, the plane's box exactly on the view (`cameraEngine.dockPose`) — the
 * one place the presentation enters the camera logic, so every framing path (the frame control, a
 * link spawn, the back control, `onClose: 'parent'`, the arrows, the minimap, `space.frame`) docks.
 */
export const frameTargetForPlane = (
    spaceState: PluridStateSpace,
    configuration: PluridConfiguration,
    plane: TreePlane,
): CameraState => {
    if (configuration.space.presentation === 'page') {
        return cameraEngine.dockPose(spaceState.camera, dockGeometry(plane, configuration, spaceState.viewSize), spaceState.viewSize, spaceState.cameraLimits);
    }
    return cameraEngine.framePlane(
        spaceState.camera,
        planeGeometry(plane, resolvePlaneFallbackSize(configuration, spaceState.viewSize)),
        spaceState.viewSize,
        {
            limits: spaceState.cameraLimits,
        },
    );
};

/** The box a plane docks by: its location and the size the dock is computed with. */
export interface DockGeometry {
    location: TreePlane['location'];
    width: number;
    height: number;
}

/** The box a plane docks by: the configured size over a measured one (`cameraEngine.dockGeometry`). */
export const dockGeometry = (
    plane: TreePlane,
    configuration: PluridConfiguration,
    viewSize: ViewSize,
): DockGeometry => cameraEngine.dockGeometry(plane as any, spaceEngine.layout.configuredPlaneSize(configuration, viewSize));

/** The plane to dock on when none is named: the docked one, else the one nearest the view center. */
const dockTargetPlane = (
    spaceState: PluridStateSpace,
    configuration: PluridConfiguration,
    planeID?: string,
): TreePlane | undefined => {
    const configured = spaceEngine.layout.configuredPlaneSize(configuration, spaceState.viewSize);
    // this plane, else the docked one, else the SELECTED plane (the deliberate choice), else the plane
    // under the pointer (`activePlaneID` is hover-driven), else the nearest
    const shown = (id: string) => {
        const plane = id ? spaceEngine.tree.logic.getTreePlaneByID(spaceState.tree, id) : undefined;
        return plane && plane.show !== false ? plane.planeID : '';
    };
    const id = planeID
        || cameraEngine.findDockedPlane(spaceState.camera, spaceState.tree, spaceState.viewSize, configured, configuration.space.docking?.epsilon, spaceState.cameraLimits)
        || shown(spaceState.selectedPlaneIDs[0] || '')
        || shown(spaceState.activePlaneID || '')
        || cameraEngine.dockCandidate(spaceState.camera, spaceState.tree, spaceState.viewSize, configured);
    return id ? spaceEngine.tree.logic.getTreePlaneByID(spaceState.tree, id) : undefined;
};


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
 * The plane a camera target LANDS DOCKED on, `''` when it lands elsewhere (both presentations).
 */
export const landingDockPlaneID = (
    state: AppState,
    target: CameraState,
): string => {
    const configured = spaceEngine.layout.configuredPlaneSize(state.configuration, state.space.viewSize);
    return cameraEngine.findDockedPlane(target, state.space.tree, state.space.viewSize, configured, state.configuration.space.docking?.epsilon, state.space.cameraLimits);
};

/**
 * Commit a camera target: an interruptible tween through the View's motion controller when
 * animated and a View is mounted, else one jump. The ONE exit of every programmatic camera move —
 * and so the one place the DOCKING controls apply: a move that lands docked jumps under
 * `docking.motion: 'instant'` whatever the caller asked, and a docking tween records its
 * destination (`dockingPlaneID`) so the chrome can stay hidden for the swing.
 */
export const commitCameraTarget = (
    dispatch: Dispatch,
    extra: PluridThunkExtra | undefined,
    target: CameraState,
    options: CameraMotionOptions,
    state: AppState,
) => {
    const {
        animate = true,
        duration,
        easing,
        onSettle,
    } = options;

    const landing = landingDockPlaneID(state, target);
    const instant = !!landing && state.configuration.space.docking?.motion === 'instant';
    const controller = extra?.motion;
    if (animate && controller && !instant) {
        const started = controller.tweenTo(target, {
            duration,
            easing,
            onSettle,
        });
        // after `tweenTo` (it stops a running tween first, which resets the motion and the field),
        // and only for a tween: a jump is docked, or not, by its camera alone
        if (started) {
            dispatch(actions.space.setDockingPlaneID(landing));
        }
        return;
    }

    // a jump: whatever was driving the camera stops, or its next frame would overwrite the jump
    controller?.cancel();
    dispatch(actions.space.setCamera(target));
    onSettle?.();
};


export type CameraCommand =
    | { kind: 'frame'; planeID?: string; selection?: boolean }
    | { kind: 'fit'; faceOn?: boolean }
    | { kind: 'reset' }
    | { kind: 'home' }
    | { kind: 'preset'; name: string }
    | { kind: 'bookmark'; name: string; action?: PluridBookmarkAction }
    | { kind: 'viewpoint'; viewpoint: string }
    | { kind: 'delta'; delta: CameraDelta }
    /** Dock on a page (the page presentation): this plane, else the docked one, else the nearest. */
    | { kind: 'dock'; planeID?: string }
    /** Reveal the space from a docked page: pull back and tilt (the page presentation). */
    | { kind: 'reveal' };


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
        case 'dock': {
            const plane = dockTargetPlane(spaceState, configuration, command.planeID);
            return plane
                ? cameraEngine.dockPose(
                    spaceState.camera,
                    dockGeometry(plane, configuration, spaceState.viewSize),
                    spaceState.viewSize,
                    spaceState.cameraLimits,
                )
                : undefined;
        }
        case 'reveal': {
            const plane = dockTargetPlane(spaceState, configuration);
            return plane
                ? cameraEngine.revealPose(
                    cameraEngine.dockPose(
                        spaceState.camera,
                        dockGeometry(plane, configuration, spaceState.viewSize),
                        spaceState.viewSize,
                        spaceState.cameraLimits,
                    ),
                    spaceState.cameraLimits,
                    configuration.space.docking?.reveal,
                )
                : undefined;
        }
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

    commitCameraTarget(dispatch, extra, target, options, state);
};


/** Whether the view center looks at the plane: the ray through the view center hits inside it. */
export const planeCoversViewCenter = (
    spaceState: PluridStateSpace,
    configuration: PluridConfiguration,
    plane: TreePlane,
): boolean => {
    const viewSize = spaceState.viewSize;
    const pick = cameraEngine.pickPlanePoint(
        spaceState.camera,
        viewSize,
        planeGeometry(plane, resolvePlaneFallbackSize(configuration, viewSize)),
        {
            x: viewSize.width / 2,
            y: viewSize.height / 2,
        },
    );

    return !!pick && pick.inside;
};


// #region wrappers
export interface FramePlaneNodeOptions {
    /** Called once the camera has landed on the plane (at once for a jump). */
    onSettle?: () => void;
    /**
     * Frame again when the plane's first measurement lands (`reportPlaneSize`): for a plane that
     * (re)opens with a stale or unknown size the first frame targets the best-known geometry and
     * the measured one retargets the tween. Ignored for manually sized planes (their size is
     * authoritative).
     */
    awaitMeasure?: boolean;
}


/** Frame a plane node (already resolved). */
export const framePlaneNode = (
    plane: TreePlane,
    animate = true,
    options: FramePlaneNodeOptions = {},
): CameraThunk => (dispatch, getState, extra) => {
    const state = getState();
    commitCameraTarget(
        dispatch,
        extra,
        frameTargetForPlane(state.space, state.configuration, plane),
        {
            animate,
            onSettle: options.onSettle,
        },
        state,
    );

    if (!extra) {
        return;
    }
    // A hand-set size, or a declaration of BOTH dimensions, is already the plane's box: nothing
    // to wait for. A declared width alone still needs its content-driven height measured.
    const authoritative = plane.sizeMode === 'manual'
        || (plane.sizeMode === 'declared' && plane.width > 0 && plane.height > 0);
    if (options.awaitMeasure && !authoritative) {
        extra.pendingFrame = {
            planeID: plane.planeID,
            animate,
        };
    } else if (extra.pendingFrame && extra.pendingFrame.planeID !== plane.planeID) {
        // Any other framing supersedes a pending re-frame.
        extra.pendingFrame = undefined;
    }
};


/**
 * A plane's measurement (the plane's ResizeObserver): write it, then settle a pending re-frame for
 * that plane. Never while the user drives the camera — a gesture or a fling is not hijacked.
 */
export const reportPlaneSize = (
    payload: SetPlaneSizePayload,
): CameraThunk => (dispatch, getState, extra) => {
    dispatch(actions.space.setPlaneSize(payload));

    const pending = extra?.pendingFrame;
    if (!extra || !pending || pending.planeID !== payload.planeID) {
        return;
    }
    extra.pendingFrame = undefined;

    const motion = getState().space.motion;
    if (motion === 'gesture' || motion === 'fling') {
        return;
    }

    dispatch(framePlaneByID(payload.planeID, pending.animate) as any);
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

/** Dock the camera on a page (`space.dock`). */
export const dockCommand = (
    planeID?: string,
    animate = true,
): CameraThunk => cameraCommand({ kind: 'dock', planeID }, { animate });

/** Reveal the space from a docked page (`space.reveal`). */
export const revealCommand = (
    animate = true,
): CameraThunk => cameraCommand({ kind: 'reveal' }, { animate });


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
