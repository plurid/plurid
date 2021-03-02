// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import { Theme } from '@plurid/plurid-themes';

    import {
        /** constants */
        PLURID_ENTITY_PLANE_BRIDGE,

        /** interfaces */
        PluridConfiguration,
    } from '@plurid/plurid-data';

    import {
        StyledPluridPlaneBridge,
    } from './styled';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion libraries
// #endregion imports



// #region module
export interface PluridPlaneBridgeOwnProperties {
}

export interface PluridPlaneBridgeStateProperties {
    stateGeneralTheme: Theme;
    stateConfiguration: PluridConfiguration;
}

export interface PluridPlaneBridgeDispatchProperties {
}

export type PluridPlaneBridgeProperties = PluridPlaneBridgeOwnProperties
    & PluridPlaneBridgeStateProperties
    & PluridPlaneBridgeDispatchProperties;

const PluridPlaneBridge: React.FC<PluridPlaneBridgeProperties> = (
    properties,
) => {
    /** properties */
    const {
        stateGeneralTheme,
        stateConfiguration,
    } = properties;

    const {
        controls,
        opacity,
    } = stateConfiguration.elements.plane;


    /** render */
    return (
        <StyledPluridPlaneBridge
            theme={stateGeneralTheme}
            planeControls={controls.show}
            planeOpacity={opacity}
            data-plurid-entity={PLURID_ENTITY_PLANE_BRIDGE}
        />
    );
}


const mapStateToProps = (
    state: AppState,
): PluridPlaneBridgeStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneBridgeDispatchProperties => ({
});


const ConnectedPluridPlaneBridge = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneBridge);
// #endregion module



// #region exports
export default ConnectedPluridPlaneBridge;
// #endregion exports
