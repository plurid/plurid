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
        /** constants */
        PLURID_ENTITY_PLANE_BRIDGE,

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
        StyledPluridPlaneBridge,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridPlaneBridgeOwnProperties {
    mouseOver: boolean;
    /** The plane's own bridge length (from the tree); falls back to the configured length. */
    bridgeLength?: number;
    /** The edge the bridge leaves from (from the tree); the left edge by default. */
    bridgeSide?: 'start' | 'end';
}

export interface PluridPlaneBridgeStateProperties {
    stateGeneralTheme: Theme;
    stateConfiguration: PluridConfiguration;
}

export interface PluridPlaneBridgeDispatchProperties {
}

export type PluridPlaneBridgeProperties =
    & PluridPlaneBridgeOwnProperties
    & PluridPlaneBridgeStateProperties
    & PluridPlaneBridgeDispatchProperties;


const PluridPlaneBridge: React.FC<PluridPlaneBridgeProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        mouseOver,
        bridgeLength: bridgeLengthProperty,
        bridgeSide = 'start',
        // #endregion own

        // #region state
        stateGeneralTheme,
        stateConfiguration,
        // #endregion state
    } = properties;

    const {
        controls,
        opacity,
    } = stateConfiguration.elements.plane;

    const {
        transparentUI,
    } = stateConfiguration.global;

    // The bridge is drawn at the length the plane was SPAWNED with (stored on the tree node), so a
    // later configuration change never detaches existing bridges from their link points.
    const bridgeLength = bridgeLengthProperty ?? stateConfiguration.space.bridge?.length ?? 100;
    // #endregion properties


    // #region render
    return (
        <StyledPluridPlaneBridge
            theme={stateGeneralTheme}
            planeControls={controls.show}
            planeOpacity={opacity}
            transparentUI={transparentUI}
            mouseOver={mouseOver}
            bridgeLength={bridgeLength}
            bridgeSide={bridgeSide}
            data-plurid-entity={PLURID_ENTITY_PLANE_BRIDGE}
            data-plurid-bridge-side={bridgeSide}
        />
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridPlaneBridgeStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneBridgeDispatchProperties => ({
});


const ConnectedPluridPlaneBridge = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneBridge);
// #endregion module



// #region exports
export default ConnectedPluridPlaneBridge;
// #endregion exports
