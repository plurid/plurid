import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/utilities.themes';

import {
    StyledPlaneBridge,
} from './styled';

import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PlaneBridgeOwnProperties {
}

interface PlaneBridgeStateProperties {
    generalTheme: Theme;
    planeControls: boolean;
    configuration: PluridConfiguration;
}

interface PlaneBridgeDispatchProperties {
}

type PlaneBridgeProperties = PlaneBridgeOwnProperties
    & PlaneBridgeStateProperties
    & PlaneBridgeDispatchProperties;

const PlaneBridge: React.FC<PlaneBridgeProperties> = (properties) => {
    const {
        generalTheme,
        planeControls,
        configuration,
    } = properties;

    const {
        planeOpacity,
    } = configuration;

    return (
        <StyledPlaneBridge
            theme={generalTheme}
            planeControls={planeControls}
            planeOpacity={planeOpacity}
        />
    );
}


const mapStateToProps = (state: AppState): PlaneBridgeStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
    planeControls: selectors.configuration.getConfiguration(state).planeControls,
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PlaneBridgeDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PlaneBridge);
