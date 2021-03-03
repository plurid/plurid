// #region imports
    // #region libraries
    import themes from '@plurid/plurid-themes';

    import {
        PluridApplicationView,
        PluridPlane,
        PluridConfiguration,

        RecursivePartial,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import * as generalEngine from './general';
    // #endregion internal
// #endregion imports



// #region module
const computeState = (
    view: PluridApplicationView,
    planes: PluridPlane[] | undefined,
    configuration: RecursivePartial<PluridConfiguration> | undefined,
    precomputedState: any,
    contextState: any,
) => {
    const activeConfiguration = generalEngine.configuration.merge(configuration);

    return {
        configuration: {
            ...activeConfiguration,
        },
        shortcuts: {
            global: true,
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
            initialTree: [],
            tree: [],
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
        },
        themes: {
            general: {
                ...themes.plurid,
            },
            interaction: {
                ...themes.plurid,
            },
        },
        ui: {
            toolbarScrollPosition: 0,
        },
    };
}
// #endregion module



// #region exports
export {
    computeState,
};
// #endregion exports
