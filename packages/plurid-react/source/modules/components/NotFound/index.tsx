import React from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledNotFound,
} from './styled';

import { AppState } from '../../services/state/store';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface NotFoundOwnProperties {
}

interface NotFoundStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

interface NotFoundDispatchProperties {
}

type NotFoundProperties = NotFoundOwnProperties
    & NotFoundStateProperties
    & NotFoundDispatchProperties;

const NotFound: React.FC<NotFoundProperties> = (
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
        <StyledNotFound>
            Plurid' Page Not Found
        </StyledNotFound>
    );
}


const mapStateToProperties = (
    state: AppState,
): NotFoundStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): NotFoundDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(NotFound);
