import React from 'react';
import {
    PluridApplication as PluridApplicationProperties,
} from '@plurid/plurid-data';

import Root from './Root';

import store from '../modules/services/state/store';



const initialState = {};
const initializedStore = store(initialState);

const PluridApplication: React.FC<PluridApplicationProperties> = (
    properties,
) => {
    return (
        <Root
            store={initializedStore}
            appProperties={properties}
        />
    );
}


export default PluridApplication;
