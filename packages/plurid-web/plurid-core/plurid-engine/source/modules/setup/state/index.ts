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
    import * as generalEngine from '../general';
    // #endregion external


    // #region internal
    import {
        resolveSpace,
    } from './space';

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
    const specifiedConfiguration = generalEngine.configuration.merge(configuration);
    const stateConfiguration: PluridConfiguration = {
        ...specifiedConfiguration,
        ...precomputedState?.configuration,
        ...contextState?.configuration,
    };

    const stateSpace = resolveSpace(
        view,
        stateConfiguration,
        planesRegistrar,
        precomputedState,
        contextState,
    );

    const stateThemes = resolveThemes(
        stateConfiguration,
        precomputedState,
    );


    const state: PluridState = {
        configuration: {
            ...stateConfiguration,
        },
        shortcuts: {
            global: true,
            ...precomputedState?.shortcuts,
        },
        space: {
            ...stateSpace,
        },
        themes: {
            ...stateThemes,
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
