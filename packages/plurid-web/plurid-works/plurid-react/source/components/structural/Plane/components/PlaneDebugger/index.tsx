// #region imports
    // #region libraries
    import React from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';

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
        StyledPluridPlaneDebugger,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridPlaneDebuggerOwnProperties {
}

export interface PluridPlaneDebuggerStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface PluridPlaneDebuggerDispatchProperties {
}

type PluridPlaneDebuggerProperties =
    & PluridPlaneDebuggerOwnProperties
    & PluridPlaneDebuggerStateProperties
    & PluridPlaneDebuggerDispatchProperties;


const PluridPlaneDebugger: React.FC<PluridPlaneDebuggerProperties> = (
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
        <StyledPluridPlaneDebugger>
            PluridPlaneDebugger
        </StyledPluridPlaneDebugger>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridPlaneDebuggerStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneDebuggerDispatchProperties => ({
});


const ConnectedPluridPlaneDebugger = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneDebugger);
// #endregion module



// #region exports
export default ConnectedPluridPlaneDebugger;
// #endregion exports
