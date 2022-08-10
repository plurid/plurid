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

    import {
        PluridRouteComponentProperty,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactFunctionalComponent,
    } from '~data/interfaces';

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

export type IframePlaneProperties =
    & IframePlaneOwnProperties
    & IframePlaneStateProperties
    & IframePlaneDispatchProperties;

const IframePlane: PluridReactFunctionalComponent<
    IframePlaneProperties,
    PluridRouteComponentProperty
> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            plurid,
            // #endregion values
        // #endregion required

        // // #region state
        // stateGeneralTheme,
        // stateInteractionTheme,
        // // #endregion state
    } = properties;

    const route = plurid.value;
    // #endregion properties


    // #region render
    return (
        <StyledIframePlane>
            <iframe src={route} />
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
