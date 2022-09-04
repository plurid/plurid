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


    const stateSpace: PluridStateSpace = {
        loading: true,
        resolvedLayout: false,
        animatedTransform: false,
        transformTime: 450,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        translationX: 0,
        translationY: 0,
        translationZ: 0,
        transform: 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)',
        activeUniverseID: '',
        camera: {
            x: 0,
            y: 0,
            z: 0,
        },
        viewSize: {
            width: 771,
            height: 764,
        },
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

        tree: computedTree,

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

    return stateSpace;
}
// #endregion module



// #region exports
export {
    resolveSpace,
};
// #endregion exports
