import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledViewcube,
} from './styled';

import ViewcubeModel from './components/ViewcubeModel';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';



interface ViewcubeOwnProperties {
}

interface ViewcubeStateProperties {
}

interface ViewcubeDispatchProperties {
}

type ViewcubeProperties = ViewcubeOwnProperties
    & ViewcubeStateProperties
    & ViewcubeDispatchProperties;

const Viewcube: React.FC<ViewcubeProperties> = () => {
    return (
        <StyledViewcube>
            <ViewcubeModel />
        </StyledViewcube>
    );
}


const mapStateToProperties = (
    state: AppState,
): ViewcubeStateProperties => ({
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewcubeDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(Viewcube);
