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
    /** G / Space held: a transparent overlay takes the pointer so a drag over the iframe orbits. */
    stateGrabMode: boolean;
}

export interface IframePlaneDispatchProperties {
}

export type IframePlaneProperties =
    & IframePlaneOwnProperties
    & IframePlaneStateProperties
    & IframePlaneDispatchProperties;

const IframePlane: PluridReactFunctionalComponent<
    IframePlaneProperties
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

        // #region state
        stateGrabMode,
        // #endregion state
    } = properties;

    // Registered as a plane, the component receives the plane's property; as a route's exterior, the
    // route's. It read the route's shape only, so as a plane the iframe had no `src` (2026-10-20).
    const route = 'plane' in plurid ? plurid.plane.value : plurid.value;
    // #endregion properties


    // #region render
    return (
        <StyledIframePlane>
            <iframe
                src={route}
                title={route}
            />
            {/* An iframe swallows pointer events; in grab mode the overlay hands the drag to the space. */}
            {stateGrabMode && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                    }}
                    data-plurid-iframe-overlay={true}
                />
            )}
        </StyledIframePlane>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): IframePlaneStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateGrabMode: state.ui.grabMode || state.ui.grabHold,
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
