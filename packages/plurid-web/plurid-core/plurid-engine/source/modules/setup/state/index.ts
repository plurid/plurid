// #region imports
    // #region libraries
    import {
        PluridApplicationView,
        PluridConfiguration,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
        PluridState,
        PluridMetastateState,

        RecursivePartial,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import * as space from '../space';

    import * as generalEngine from '../general';

    import {
        getRegisteredPlanes,
    } from '../PlanesRegistrar';
    // #endregion external


    // #region internal
    import {
        resolveThemes,
    } from './themes';
    // #endregion internal
// #endregion imports



// #region module
const compute = (
    view: PluridApplicationView,
    configuration: RecursivePartial<PluridConfiguration> | undefined,
    planesRegistrar: IPluridPlanesRegistrar | undefined,
    precomputedState: Partial<PluridState> | undefined,
    contextState: PluridMetastateState | undefined,
) => {
    const activeConfiguration = generalEngine.configuration.merge(configuration);

    const registeredPlanes = getRegisteredPlanes(planesRegistrar);

    const spaceTree = new space.tree.Tree({
        planes: registeredPlanes,
        configuration: activeConfiguration,
        view,
    });

    const computedTree = spaceTree.compute();


    const stateConfiguration: PluridConfiguration = {
        ...activeConfiguration,
        ...precomputedState?.configuration,
        ...contextState?.configuration,
    };

    const stateThemes = resolveThemes(stateConfiguration);

    const state: PluridState = {
        configuration: {
            ...stateConfiguration,
        },
        shortcuts: {
            global: true,
            ...precomputedState?.shortcuts,
        },
        space: {
            loading: true,
            animatedTransform: false,
            transformTime: 450,
            scale: 1,
            rotationX: 0,
            rotationY: 0,
            translationX: 0,
            translationY: 0,
            translationZ: 0,
            initialTree: computedTree,
            tree: computedTree,
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
            view,
            culledView: [],
            ...precomputedState?.space,
            ...contextState?.space,
        },
        themes: {
            ...stateThemes,
            ...precomputedState?.themes,
        },
        ui: {
            toolbarScrollPosition: 0,
            ...precomputedState?.ui,
            ...contextState?.ui,
        },
    };

    return state;
}
// #endregion module



// #region exports
export {
    compute,
};
// #endregion exports
