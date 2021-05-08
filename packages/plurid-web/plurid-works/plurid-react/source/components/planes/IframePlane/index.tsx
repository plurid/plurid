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
        StyledIframePlane,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface IframePlaneOwnProperties {
}

export interface IframePlaneStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface IframePlaneDispatchProperties {
}

export type IframePlaneProperties = IframePlaneOwnProperties
    & IframePlaneStateProperties
    & IframePlaneDispatchProperties;

const IframePlane: React.FC<IframePlaneProperties> = (
    properties,
) => {
    // #region properties
    // const {
        // // #region state
        // stateGeneralTheme,
        // stateInteractionTheme,
        // // #endregion state
    // } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledIframePlane>
            IframePlane
        </StyledIframePlane>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): IframePlaneStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): IframePlaneDispatchProperties => ({
});


const ConnectedIframePlane = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(IframePlane);
// #endregion module



// #region exports
export default ConnectedIframePlane;
// #endregion exports
