// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        /** constants */
        PLURID_ENTITY_UNIVERSE_EXPLORER,

        /** interfaces */
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledUniverseExplorer,
        StyledUniverseExplorerClustersWindow,
    } from './styled';
    // #endregion internal
// #endregion imports




// #region module
export interface PluridUniverseExplorerOwnProperties {
}

export interface PluridUniverseExplorerStateProperties {
    stateConfiguration: PluridConfiguration;
    stateInteractionTheme: Theme;
}

export interface PluridUniverseExplorerDispatchProperties {
}

export type PluridUniverseExplorerProperties = PluridUniverseExplorerOwnProperties
    & PluridUniverseExplorerStateProperties
    & PluridUniverseExplorerDispatchProperties;


const PluridUniverseExplorer: React.FC<PluridUniverseExplorerProperties> = (
    properties,
) => {
    const {
        /** state */
        stateConfiguration,
        stateInteractionTheme,

        /** dispatch */
    } = properties;


    return (
        <StyledUniverseExplorer
            data-plurid-entity={PLURID_ENTITY_UNIVERSE_EXPLORER}
        >
            <StyledUniverseExplorerClustersWindow>
                <div>
                    view zone
                </div>

                clusters window
            </StyledUniverseExplorerClustersWindow>

            <div>
                reset
            </div>

            <div>
                fit
            </div>
        </StyledUniverseExplorer>
    );
}


const mapStateToProperties = (
    state: AppState,
): PluridUniverseExplorerStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridUniverseExplorerDispatchProperties => ({
});


const ConnectedPluridUniverseExplorer = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridUniverseExplorer);
// #endregion module



// #region exports
export default ConnectedPluridUniverseExplorer;
// #endregion exports
