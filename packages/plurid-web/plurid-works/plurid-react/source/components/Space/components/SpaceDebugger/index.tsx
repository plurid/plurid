// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridSpaceDebugger,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridSpaceDebuggerOwnProperties {
}

export interface PluridSpaceDebuggerStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface PluridSpaceDebuggerDispatchProperties {
}

export type PluridSpaceDebuggerProperties = PluridSpaceDebuggerOwnProperties
    & PluridSpaceDebuggerStateProperties
    & PluridSpaceDebuggerDispatchProperties;

const PluridSpaceDebugger: React.FC<PluridSpaceDebuggerProperties> = (
    properties,
) => {
    // #region properties
    // const {
        // /** state */
        // stateGeneralTheme,
        // stateInteractionTheme,
    // } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledPluridSpaceDebugger>
            PluridSpaceDebugger
        </StyledPluridSpaceDebugger>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridSpaceDebuggerStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridSpaceDebuggerDispatchProperties => ({
});


const ConnectedPluridSpaceDebugger = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridSpaceDebugger);
// #endregion module



// #region exports
export default ConnectedPluridSpaceDebugger;
// #endregion exports
