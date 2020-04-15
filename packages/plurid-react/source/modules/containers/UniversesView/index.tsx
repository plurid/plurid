import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import PluridSpace from '../../components/PluridSpace';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
// import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface UniversesViewOwnProperties {
}

interface UniversesViewStateProperties {
}

interface UniversesViewDispatchProperties {
}

type UniversesViewProperties = UniversesViewOwnProperties
    & UniversesViewStateProperties
    & UniversesViewDispatchProperties;

const UniversesView: React.FC<UniversesViewProperties> = () => {
    return (
        <>
            <PluridSpace />
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): UniversesViewStateProperties => ({
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): UniversesViewDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(UniversesView);
