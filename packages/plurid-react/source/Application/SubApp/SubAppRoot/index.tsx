import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    PluridApplication as PluridApplicationProperties,
} from '@plurid/plurid-data';

import View from '../../View';

import { AppState } from '../../../modules/services/state/store';
import StateContext from '../../../modules/services/state/context';



interface SubAppRootOwnProperties {
    appProperties: PluridApplicationProperties;
}

interface SubAppRootStateProperties {
}

interface SubAppRootDispatchProperties {
}

type SubAppRootProperties = SubAppRootOwnProperties
    & SubAppRootStateProperties
    & SubAppRootDispatchProperties;

const SubAppRoot: React.FC<SubAppRootProperties> = (
    properties,
) => {
    /** properties */
    const {
        appProperties,
    } = properties;


    /** render */
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
