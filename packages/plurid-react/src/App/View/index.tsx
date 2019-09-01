import React, {
    // useState,
    // useEffect,
    // useCallback,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledView,
    GlobalStyle,
} from './styled';

import handleView from './logic';

import {
    PluridAppProperties,
} from '../../modules/data/interfaces';


import { AppState } from '../../modules/services/state/store';
// import selectors from '../../modules/services/state/selectors';
import actions from '../../modules/services/state/actions';

// import themes from '@plurid/apps.utilities.themes';



export interface ViewOwnProperties {
    appProperties: PluridAppProperties;
}

interface ViewStateProperties {
}

interface ViewDispatchProperties {
    setConfiguration: typeof actions.configuration.setConfiguration;
}

type ViewProperties = ViewStateProperties & ViewDispatchProperties & ViewOwnProperties;

const View: React.FC<ViewProperties> = (properties) => {
    const {
        appProperties,
    } = properties;

    const {
        pages,
        documents
    } = appProperties

    const viewContainer = handleView(pages, documents);

    return (
        <StyledView>
            <GlobalStyle />
            {viewContainer}
        </StyledView>
    );
}


const mapStateToProps = (state: AppState): ViewStateProperties => ({
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ViewDispatchProperties => ({
    setConfiguration: (configuration: any) => dispatch(actions.configuration.setConfiguration(configuration)),
});


export default connect(mapStateToProps, mapDispatchToProps)(View);
