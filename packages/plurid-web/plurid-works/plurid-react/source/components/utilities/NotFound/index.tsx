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
        StyledPluridNotFound,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridNotFoundOwnProperties {
}

export interface PluridNotFoundStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface PluridNotFoundDispatchProperties {
}

export type PluridNotFoundProperties = PluridNotFoundOwnProperties
    & PluridNotFoundStateProperties
    & PluridNotFoundDispatchProperties;


const PluridNotFound: React.FC<PluridNotFoundProperties> = (
    properties,
) => {
    // #region properties
    // const {
    //     // #region state
    //     stateGeneralTheme,
    //     stateInteractionTheme,
    //     // #endregion state
    // } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledPluridNotFound>
            Plurid' Plane Not Found
        </StyledPluridNotFound>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridNotFoundStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridNotFoundDispatchProperties => ({
});


const ConnectedPluridNotFound = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridNotFound);
// #endregion module



// #region exports
export default ConnectedPluridNotFound;
// #endregion exports
