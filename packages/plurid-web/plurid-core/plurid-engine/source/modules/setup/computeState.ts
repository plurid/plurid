// #region imports
    // #region libraries
    import themes, {
        Theme,
        THEME_NAMES,
    } from '@plurid/plurid-themes';

    import {
        PluridApplicationView,
        PluridConfiguration,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
        PluridState,
        PluridMetastateState,

        RecursivePartial,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import * as space from './space';

    import * as generalEngine from './general';

    import {
        getRegisteredPlanes,
    } from './PlanesRegistrar';
    // #endregion internal
// #endregion imports



// #region module
const resolveThemes = (
    configuration: PluridConfiguration,
) => {
    let generalTheme: Theme | undefined;
    let interactionTheme: Theme | undefined;

    if (typeof configuration.global.theme === 'object') {
        const {
            general,
            interaction,
        } = configuration.global.theme;

        if (typeof general === 'string') {
            if (Object.keys(THEME_NAMES).includes(general)) {
                generalTheme = (themes as any)[general];
            }
        }

        if (typeof interaction === 'string') {
            if (Object.keys(THEME_NAMES).includes(interaction)) {
                interactionTheme = (themes as any)[interaction];
            }
        }
    } else {
        if (Object.keys(THEME_NAMES).includes(configuration.global.theme)) {
            generalTheme = (themes as any)[configuration.global.theme];
            interactionTheme = (themes as any)[configuration.global.theme];
        }
    }

    return {
        general: generalTheme || themes.plurid,
        interaction: interactionTheme || themes.plurid,
    };
}


const computeState = (
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
        data: {
            planeSources: {},
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
    computeState,
};
// #endregion exports
