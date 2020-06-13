import React from 'react';

import { Store, AnyAction } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';

import {
    PluridApplication as PluridApplicationProperties,
} from '@plurid/plurid-data';

import PluridView from '../../View';

import {
    AppState,
} from '../../../modules/services/state/store';
import StateContext from '../../../modules/services/state/context';



export interface PluridRootProperties {
    store: Store<AppState, AnyAction>;
    pluridApplication: PluridApplicationProperties;
}

const PluridRoot: React.FC<PluridRootProperties> = (
    properties,
) => {
    /** properties */
    const {
        store,
        pluridApplication,
    } = properties;


    /** render */
    return (
        <ReduxProvider
            store={store}
            context={StateContext}
        >
            <PluridView
                pluridApplication={pluridApplication}
            />
        </ReduxProvider>
    );
}


export default PluridRoot;
