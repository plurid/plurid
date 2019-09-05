import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/apps.utilities.themes';

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
}

interface PlaneBridgeDispatchProperties {
}

type PlaneBridgeProperties = PlaneBridgeOwnProperties
    & PlaneBridgeStateProperties
    & PlaneBridgeDispatchProperties;

const PlaneBridge: React.FC<PlaneBridgeProperties> = (properties) => {
    const {
        generalTheme,
    } = properties;

    return (
        <StyledPlaneBridge
            theme={generalTheme}
        />
    );
}


const mapStateToProps = (state: AppState): PlaneBridgeStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PlaneBridgeDispatchProperties => ({
});


export default connect(mapStateToProps, mapDispatchToProps)(PlaneBridge);
