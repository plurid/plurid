import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledDocumentsView,
} from './styled';

import PluridSpace from '../../components/PluridSpace';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface DocumentsViewOwnProperties {
}

interface DocumentsViewStateProperties {
}

interface DocumentsViewDispatchProperties {
}

type DocumentsViewProperties = DocumentsViewOwnProperties
    & DocumentsViewStateProperties
    & DocumentsViewDispatchProperties;

const DocumentsView: React.FC<DocumentsViewProperties> = () => {
    return (
        <StyledDocumentsView>
            <PluridSpace />
        </StyledDocumentsView>
    );
}


const mapStateToProps = (
    state: AppState,
): DocumentsViewStateProperties => ({
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): DocumentsViewDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(DocumentsView);
