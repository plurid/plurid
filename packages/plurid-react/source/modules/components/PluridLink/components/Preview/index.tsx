import React from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledPreview,
} from './styled';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PreviewOwnProperties {
}

interface PreviewStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

interface PreviewDispatchProperties {
}

type PreviewProperties = PreviewOwnProperties
    & PreviewStateProperties
    & PreviewDispatchProperties;

const Preview: React.FC<PreviewProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateGeneralTheme,
        // stateInteractionTheme,
    } = properties;


    /** render */
    return (
        <StyledPreview
            theme={stateGeneralTheme}
        >
            Preview
        </StyledPreview>
    );
}


const mapStateToProperties = (
    state: AppState,
): PreviewStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PreviewDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(Preview);
