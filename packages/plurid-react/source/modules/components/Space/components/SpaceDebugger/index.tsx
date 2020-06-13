import React from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledPluridSpaceDebugger,
} from './styled';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../.../../services/state/actions';



interface PluridSpaceDebuggerOwnProperties {
}

interface PluridSpaceDebuggerStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

interface PluridSpaceDebuggerDispatchProperties {
}

type PluridSpaceDebuggerProperties = PluridSpaceDebuggerOwnProperties
    & PluridSpaceDebuggerStateProperties
    & PluridSpaceDebuggerDispatchProperties;

const PluridSpaceDebugger: React.FC<PluridSpaceDebuggerProperties> = (
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
        <StyledPluridSpaceDebugger>
            PluridSpaceDebugger
        </StyledPluridSpaceDebugger>
    );
}


const mapStateToProperties = (
    state: AppState,
): PluridSpaceDebuggerStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridSpaceDebuggerDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridSpaceDebugger);
