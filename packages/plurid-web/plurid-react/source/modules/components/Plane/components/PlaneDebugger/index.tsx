import React from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledPluridPlaneDebugger,
} from './styled';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../.../../services/state/actions';



interface PluridPlaneDebuggerOwnProperties {
}

interface PluridPlaneDebuggerStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

interface PluridPlaneDebuggerDispatchProperties {
}

type PluridPlaneDebuggerProperties = PluridPlaneDebuggerOwnProperties
    & PluridPlaneDebuggerStateProperties
    & PluridPlaneDebuggerDispatchProperties;

const PluridPlaneDebugger: React.FC<PluridPlaneDebuggerProperties> = (
    properties,
) => {
    /** properties */
    // const {
        // /** state */
        // stateGeneralTheme,
        // stateInteractionTheme,
    // } = properties;


    /** render */
    return (
        <StyledPluridPlaneDebugger>
            PluridPlaneDebugger
        </StyledPluridPlaneDebugger>
    );
}


const mapStateToProperties = (
    state: AppState,
): PluridPlaneDebuggerStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneDebuggerDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneDebugger);
