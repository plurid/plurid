import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/utilities.themes';

import {
    StyledPlaneBridge,
} from './styled';

import { AppState } from '../../../../services/state/store';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PlaneBridgeOwnProperties {
}

interface PlaneBridgeStateProperties {
    generalTheme: Theme;
    planeControls: boolean;
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
    } = properties;

    return (
        <StyledPlaneBridge
            theme={generalTheme}
            planeControls={planeControls}
        />
    );
}


const mapStateToProps = (state: AppState): PlaneBridgeStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
    planeControls: selectors.configuration.getConfiguration(state).planeControls,
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PlaneBridgeDispatchProperties => ({
});


export default connect(mapStateToProps, mapDispatchToProps)(PlaneBridge);
