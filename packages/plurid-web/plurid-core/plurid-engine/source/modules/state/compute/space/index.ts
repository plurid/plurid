// #region imports
    // #region libraries
    import {
        PluridApplicationView,
        PluridConfiguration,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
        PluridState,
        PluridMetastateState,
        PluridStateSpace,
        TreePlane,
        CameraState,
        CameraLimits,
        SpaceTransform,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import * as space from '~modules/space';

    import {
        getRegisteredPlanes,
    } from '~modules/planes';

    import {
        camera as cameraEngine,
    } from '~modules/interaction';

    import {
        planeAddressPath,
    } from '~modules/routing/logic/general';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE ADDRESS BAR IS THE PAGE, at store time: the camera that boots docked on the ROOT whose path
 * (`planeAddressPath` of its route) is `dockPath` — its dock pose for this view, the same pose the
 * View's follow effect carries through the first measurement — or `undefined` when no root answers
 * (a sub-page is spawned through its parent's link by the View after mount). One rule for the client
 * store and the server's render, so a deep link never paints a frame of another page.
 */
export const dockedBootCamera = (
    camera: CameraState,
    tree: TreePlane[],
    configuration: PluridConfiguration,
    viewSize: { width: number; height: number },
    limits: CameraLimits,
    dockPath: string | null | undefined,
): CameraState | undefined => {
    if (!dockPath) {
        return undefined;
    }
    const root = tree.find((node) => node.show !== false && planeAddressPath(node.route) === dockPath);
    if (!root) {
        return undefined;
    }
    const configured = space.layout.configuredPlaneSize(configuration, viewSize);
    return cameraEngine.dockPose(
        camera,
        cameraEngine.dockGeometry(root, configured),
        viewSize,
        limits,
    );
};


const resolveSpace = <C>(
    view: PluridApplicationView,
    configuration: PluridConfiguration,
    planesRegistrar: IPluridPlanesRegistrar<C> | undefined,
    currentState: PluridState | undefined,
    localState: PluridState | undefined,
    precomputedState: Partial<PluridState> | undefined,
    contextState: PluridMetastateState | undefined,
    hostname = 'origin',
    dockPath?: string | null,
) => {
    const registeredPlanes = getRegisteredPlanes(planesRegistrar);
    // console.log('resolveSpace > registeredPlanes', registeredPlanes);

    const initialViewSize = {
        width: 771,
        height: 764,
    };
    // A deep link docks at store time on a LAID-OUT tree: the layout-less boot tree stacks every root
    // at the origin, where every root's dock pose is the first root's. The fresh tree is laid out for
    // the view the state layers know (a persisted tree was laid out for its persisted view; else the
    // boot fallback); the View's first measurement relays the roots for the real view and the follow
    // effect carries the docked page along.
    const dockAtBoot = !!dockPath && !currentState;
    const bootViewSize = currentState?.space.viewSize
        ?? localState?.space.viewSize
        ?? contextState?.space?.viewSize
        ?? precomputedState?.space?.viewSize
        ?? initialViewSize;

    const spaceTree = new space.tree.Tree(
        {
            planes: registeredPlanes,
            configuration,
            view,
            ...(dockAtBoot ? { layout: true, viewSize: bootViewSize } : {}),
        },
        hostname,
    );
    // console.log('resolveSpace > spaceTree', spaceTree);

    const computedTree = spaceTree.compute();
    // console.log('resolveSpace > computedTree', computedTree);


    const perspective = configuration.space.perspective || cameraEngine.DEFAULT_PERSPECTIVE;
    const cameraLimits = cameraEngine.resolveCameraLimits(configuration.space.navigation);

    const stateSpace: PluridStateSpace = {
        loading: true,
        resolvedLayout: false,
        transformTime: 450,
        camera: cameraEngine.identityCamera(initialViewSize, perspective),
        cameraLimits,
        motion: 'idle',
        dockingPlaneID: '',
        transform: 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)',
        activeUniverseID: '',
        viewSize: initialViewSize,
        spaceSize: {
            width: 771,
            height: 764,
            depth: 0,
            topCorner: {
                x: 0,
                y: 0,
                z: 0,
            },
        },
        culledView: [],
        activePlaneID: '',
        isolatePlane: '',
        lastClosedPlane: '',
        selectedPlaneIDs: [],
        draggingSelection: false,
        history: {
            canUndo: false,
            canRedo: false,
            undoDepth: 0,
            redoDepth: 0,
            past: [],
            future: [],
        },

        tree: computedTree,
        links: [],
        bookmarks: {},
        layoutTransition: 0,

        ...precomputedState?.space,
        ...contextState?.space,
        ...localState?.space,
        ...currentState?.space,

        view,
        // the culling pass's result is never durable: a running store keeps its own, anything
        // else (a snapshot, a precomputed state) starts clean
        culled: currentState
            ? currentState.space.culled
            : { hidden: [], frozen: [], detached: [] },
    };
    // console.log({
    //     stateSpace,
    //     precomputedState: precomputedState?.space,
    //     contextState: contextState?.space,
    //     localState: localState?.space,
    //     currentState: currentState?.space,
    // });

    /**
     * A legacy caller — or a snapshot older than the camera — may carry only the six scalars instead
     * of a `camera`. They are no longer part of the state (2026-09-13: the deprecated mirrors are
     * gone, the camera is the one source of truth), so they are read off the INCOMING object and
     * used for nothing but deriving a camera when there is none.
     */
    const incomingLegacy = (
        currentState ? currentState.space : localState?.space
    ) as Partial<SpaceTransform> | undefined;

    // The camera is the source of truth; the scalars and the matrix are derived from it. A snapshot
    // (or a legacy caller) may carry only the scalars — derive the camera from them in that case.
    // Always re-commit so `transform` matches THIS view size.
    const restoredCamera = (currentState?.space.camera && cameraEngine.isCameraState(currentState.space.camera))
        ? currentState.space.camera
        : (localState?.space.camera && cameraEngine.isCameraState(localState.space.camera))
            ? localState.space.camera
            : undefined;

    let resolvedCamera = cameraEngine.clampCamera(
        restoredCamera
            ? {
                ...restoredCamera,
                perspective,
            }
            : cameraEngine.fromLegacy(
                {
                    rotationX: incomingLegacy?.rotationX ?? 0,
                    rotationY: incomingLegacy?.rotationY ?? 0,
                    translationX: incomingLegacy?.translationX ?? 0,
                    translationY: incomingLegacy?.translationY ?? 0,
                    translationZ: incomingLegacy?.translationZ ?? 0,
                    scale: incomingLegacy?.scale ?? 1,
                },
                stateSpace.viewSize,
                perspective,
                cameraLimits,
            ),
        cameraLimits,
    );

    // a deep link to a root page wins over a persisted camera (docked on the tree the state layers
    // settled on, for the view it was laid out for); a running store keeps its camera
    if (dockAtBoot) {
        resolvedCamera = dockedBootCamera(resolvedCamera, stateSpace.tree, configuration, stateSpace.viewSize, cameraLimits, dockPath)
            ?? resolvedCamera;
    }

    stateSpace.camera = resolvedCamera;
    stateSpace.cameraLimits = cameraLimits;
    stateSpace.motion = 'idle';
    stateSpace.transform = cameraEngine.cameraMatrix3d(resolvedCamera, stateSpace.viewSize);

    return stateSpace;
}

// #endregion module



// #region exports
export {
    resolveSpace,
};
// #endregion exports
