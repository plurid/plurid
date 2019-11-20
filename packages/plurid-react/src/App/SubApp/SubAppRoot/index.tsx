import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    PluridApp as PluridAppProperties,
} from '@plurid/plurid-data';

import View from '../../View';

import { AppState } from '../../../modules/services/state/store';
import StateContext from '../../../modules/services/state/context';



interface SubAppRootOwnProperties {
    appProperties: PluridAppProperties;
}

interface SubAppRootStateProperties {
}

interface SubAppRootDispatchProperties {
}

type SubAppRootProperties = SubAppRootOwnProperties
    & SubAppRootStateProperties
    & SubAppRootDispatchProperties;

const SubAppRoot: React.FC<SubAppRootProperties> = (properties) => {
    const {
        appProperties,
    } = properties;

    return (
        <View
            appProperties={appProperties}
        />
    );
}


const mapStateToProps = (
    state: AppState,
): SubAppRootStateProperties => ({
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): SubAppRootDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(SubAppRoot);
