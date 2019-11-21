import React from 'react';
import {
    PluridApp as PluridAppProperties,
} from '@plurid/plurid-data';

import Root from './Root';

import store from '../modules/services/state/store';



const initialState = {};
const initializedStore = store(initialState);

const PluridApp: React.FC<PluridAppProperties> = (properties) => {
    return (
        <Root
            store={initializedStore}
            appProperties={properties}
        />
    );
}


export default PluridApp;
