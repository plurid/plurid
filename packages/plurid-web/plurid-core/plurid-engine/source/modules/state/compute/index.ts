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
    import * as generalEngine from '../../general';
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
const compute = <C>(
    view: PluridApplicationView,
    configuration: RecursivePartial<PluridConfiguration> | undefined,
    planesRegistrar: IPluridPlanesRegistrar<C> | undefined,
    currentState: PluridState | undefined,
    localState: PluridState | undefined,
    precomputedState: Partial<PluridState> | undefined,
    contextState: PluridMetastateState | undefined,
    hostname = 'origin',
) => {
    // TODO
    // the compute call also needs to make clear the nature of the change
    // i.e. if any of the states overwrite the current state
    // or if the current state takes precedence.

    let stateConfiguration = generalEngine.configuration.merge(configuration);

    // Each subsequent state layer is merged ON TOP of the accumulated configuration
    // (passed as the `target` base), so every layer's fields are preserved and later
    // layers win conflicts — precedence low→high: userConfig < precomputed < context
    // < local < current. The previous version REASSIGNED `stateConfiguration` to a
    // fresh `merge(layer)` each iteration, discarding all prior layers so only the last
    // truthy one survived (layered on defaults alone).
    const configurations = [
        precomputedState?.configuration,
        contextState?.configuration,
        localState?.configuration,
        currentState?.configuration,
    ];

    for (const layer of configurations) {
        if (layer) {
            stateConfiguration = generalEngine.configuration.merge(layer, stateConfiguration);
        }
    }

    const stateSpace = resolveSpace(
        view,
        stateConfiguration,
        planesRegistrar,
        currentState,
        localState,
        precomputedState,
        contextState,
        hostname,
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
export default compute;
// #endregion exports
