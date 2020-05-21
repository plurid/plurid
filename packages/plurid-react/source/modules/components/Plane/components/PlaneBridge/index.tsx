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
    StyledPlaneBridge,
} from './styled';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



export interface PlaneBridgeOwnProperties {
}

export interface PlaneBridgeStateProperties {
    generalTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PlaneBridgeDispatchProperties {
}

export type PlaneBridgeProperties = PlaneBridgeOwnProperties
    & PlaneBridgeStateProperties
    & PlaneBridgeDispatchProperties;


const PlaneBridge: React.FC<PlaneBridgeProperties> = (
    properties,
) => {
    /** properties */
    const {
        generalTheme,
        configuration,
    } = properties;

    const {
        controls,
        opacity,
    } = configuration.elements.plane;


    /** render */
    return (
        <StyledPlaneBridge
            theme={generalTheme}
            planeControls={controls.show}
            planeOpacity={opacity}
            data-plurid-entity={PLURID_ENTITY_PLANE_BRIDGE}
        />
    );
}


const mapStateToProps = (
    state: AppState,
): PlaneBridgeStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PlaneBridgeDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PlaneBridge);
