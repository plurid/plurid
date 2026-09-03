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
export interface ComputeOptions {
    /** The `configuration` argument changed since the last compute: it overrides the current state's. */
    configurationAuthoritative?: boolean;
}


const compute = <C>(
    view: PluridApplicationView,
    configuration: RecursivePartial<PluridConfiguration> | undefined,
    planesRegistrar: IPluridPlanesRegistrar<C> | undefined,
    currentState: PluridState | undefined,
    localState: PluridState | undefined,
    precomputedState: Partial<PluridState> | undefined,
    contextState: PluridMetastateState | undefined,
    hostname = 'origin',
    options: ComputeOptions = {},
) => {
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

    // A CHANGED `configuration` prop is the host's authority: it lands on top of the current
    // state's configuration (which otherwise wins, so runtime changes made through the pubsub
    // survive unrelated store recomputes). Without this a host could never change the
    // configuration at runtime — a layout switch, a theme change — except by remounting.
    if (options.configurationAuthoritative && configuration) {
        stateConfiguration = generalEngine.configuration.merge(configuration, stateConfiguration);
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
            grabMode: false,
            grabHold: false,
            shortcutsOverlayVisible: false,
            marquee: null,
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
