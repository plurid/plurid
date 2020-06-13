import React from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledPluridNotFound,
} from './styled';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



export interface PluridNotFoundOwnProperties {
}

export interface PluridNotFoundStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface PluridNotFoundDispatchProperties {
}

export type PluridNotFoundProperties = PluridNotFoundOwnProperties
    & PluridNotFoundStateProperties
    & PluridNotFoundDispatchProperties;


const PluridNotFound: React.FC<PluridNotFoundProperties> = (
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
        <StyledPluridNotFound>
            Plurid' Plane Not Found
        </StyledPluridNotFound>
    );
}


const mapStateToProperties = (
    state: AppState,
): PluridNotFoundStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridNotFoundDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridNotFound);
