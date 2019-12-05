import React, {
    // useState,
    // useEffect,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledMoreMenu,
    // StyledMoreMenuItem,
    StyledMoreMenuScroll,
} from './styled';

import { AppState } from '../../../../../services/state/store';
import StateContext from '../../../../../services/state/context';
import selectors from '../../../../../services/state/selectors';
// import actions from '../../../../../services/state/actions';



interface MoreMenuOwnProperties {
}

interface MoreMenuStateProperties {
    interactionTheme: Theme;
}

interface MoreMenuDispatchProperties {
}

type MoreMenuProperties = MoreMenuOwnProperties
    & MoreMenuStateProperties
    & MoreMenuDispatchProperties;

const MoreMenu: React.FC<MoreMenuProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,

        /** dispatch */
    } = properties;

    return (
        <StyledMoreMenu
            theme={interactionTheme}
        >
            <StyledMoreMenuScroll>
                documents
            </StyledMoreMenuScroll>
        </StyledMoreMenu>
    );
}


const mapStateToProps = (
    state: AppState,
): MoreMenuStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MoreMenuDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(MoreMenu);
