import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    PluridApplication as PluridApplicationProperties,
} from '@plurid/plurid-data';

import View from '../View';

import { AppState } from '../../modules/services/state/store';
import StateContext from '../../modules/services/state/context';



interface RootOwnProperties {
    appProperties: PluridApplicationProperties;
}

interface RootStateProperties {
}

interface RootDispatchProperties {
}

type RootProperties = RootOwnProperties
    & RootStateProperties
    & RootDispatchProperties;

const Root: React.FC<RootProperties> = (
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
): RootStateProperties => ({
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): RootDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(Root);
