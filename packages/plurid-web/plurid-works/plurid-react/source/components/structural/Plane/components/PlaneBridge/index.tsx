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
    // #endregion properties


    // #region render
    return (
        <StyledPluridPlaneBridge
            theme={stateGeneralTheme}
            planeControls={controls.show}
            planeOpacity={opacity}
            transparentUI={transparentUI}
            mouseOver={mouseOver}
            data-plurid-entity={PLURID_ENTITY_PLANE_BRIDGE}
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
