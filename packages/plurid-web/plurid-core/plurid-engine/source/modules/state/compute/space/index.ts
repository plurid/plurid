// #region imports
    // #region libraries
    import {
        PluridApplicationView,
        PluridConfiguration,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
        PluridState,
        PluridMetastateState,
        PluridStateSpace,
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
    // #endregion external
// #endregion imports



// #region module
const resolveSpace = <C>(
    view: PluridApplicationView,
    configuration: PluridConfiguration,
    planesRegistrar: IPluridPlanesRegistrar<C> | undefined,
    currentState: PluridState | undefined,
    localState: PluridState | undefined,
    precomputedState: Partial<PluridState> | undefined,
    contextState: PluridMetastateState | undefined,
    hostname = 'origin',
) => {
    const registeredPlanes = getRegisteredPlanes(planesRegistrar);
    // console.log('resolveSpace > registeredPlanes', registeredPlanes);

    const spaceTree = new space.tree.Tree(
        {
            planes: registeredPlanes,
            configuration,
            view,
        },
        hostname,
    );
    // console.log('resolveSpace > spaceTree', spaceTree);

    const computedTree = spaceTree.compute();
    // console.log('resolveSpace > computedTree', computedTree);


    const perspective = configuration.space.perspective || cameraEngine.DEFAULT_PERSPECTIVE;
    const cameraLimits = cameraEngine.resolveCameraLimits(configuration.space.navigation);
    const initialViewSize = {
        width: 771,
        height: 764,
    };

    const stateSpace: PluridStateSpace = {
        loading: true,
        resolvedLayout: false,
        animatedTransform: false,
        transformTime: 450,
        camera: cameraEngine.identityCamera(initialViewSize, perspective),
        cameraLimits,
        motion: 'idle',
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        translationX: 0,
        translationY: 0,
        translationZ: 0,
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
        },

        tree: computedTree,
        links: [],
        bookmarks: {},
        layoutTransition: 0,
        culled: {
            hidden: [],
            frozen: [],
        },

        ...precomputedState?.space,
        ...contextState?.space,
        ...localState?.space,
        ...currentState?.space,

        view,
    };
    // console.log({
    //     stateSpace,
    //     precomputedState: precomputedState?.space,
    //     contextState: contextState?.space,
    //     localState: localState?.space,
    //     currentState: currentState?.space,
    // });

    if (currentState) {
        stateSpace.translationX = currentState.space.translationX;
        stateSpace.translationY = currentState.space.translationY;
        stateSpace.translationZ = currentState.space.translationZ;
        stateSpace.rotationX = currentState.space.rotationX;
        stateSpace.rotationY = currentState.space.rotationY;
        stateSpace.scale = currentState.space.scale;
    }

    if (localState && !currentState) {
        stateSpace.translationX = localState.space.translationX;
        stateSpace.translationY = localState.space.translationY;
        stateSpace.translationZ = localState.space.translationZ;
        stateSpace.rotationX = localState.space.rotationX;
        stateSpace.rotationY = localState.space.rotationY;
        stateSpace.scale = localState.space.scale;
    }

    // The camera is the source of truth; the scalars and the matrix are derived from it. A snapshot
    // (or a legacy caller) may carry only the scalars — derive the camera from them in that case.
    // Always re-commit so `transform` matches THIS view size and the mirrors are consistent.
    const restoredCamera = (currentState?.space.camera && cameraEngine.isCameraState(currentState.space.camera))
        ? currentState.space.camera
        : (localState?.space.camera && cameraEngine.isCameraState(localState.space.camera))
            ? localState.space.camera
            : undefined;

    const resolvedCamera = cameraEngine.clampCamera(
        restoredCamera
            ? {
                ...restoredCamera,
                perspective,
            }
            : cameraEngine.fromLegacy(
                {
                    rotationX: stateSpace.rotationX,
                    rotationY: stateSpace.rotationY,
                    translationX: stateSpace.translationX,
                    translationY: stateSpace.translationY,
                    translationZ: stateSpace.translationZ,
                    scale: stateSpace.scale,
                },
                stateSpace.viewSize,
                perspective,
                cameraLimits,
            ),
        cameraLimits,
    );

    const legacy = cameraEngine.toLegacy(resolvedCamera, stateSpace.viewSize);

    stateSpace.camera = resolvedCamera;
    stateSpace.cameraLimits = cameraLimits;
    stateSpace.motion = 'idle';
    stateSpace.rotationX = legacy.rotationX;
    stateSpace.rotationY = legacy.rotationY;
    stateSpace.translationX = legacy.translationX;
    stateSpace.translationY = legacy.translationY;
    stateSpace.translationZ = legacy.translationZ;
    stateSpace.scale = legacy.scale;
    stateSpace.transform = cameraEngine.cameraMatrix3d(resolvedCamera, stateSpace.viewSize);

    return stateSpace;
}

// #endregion module



// #region exports
export {
    resolveSpace,
};
// #endregion exports
