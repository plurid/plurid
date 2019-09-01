import React from 'react';
import { StyledPluridApp } from './styled';
import { PluridAppProperties } from '../modules/data/interfaces';

import Root from './Root';

import store from '../modules/services/state/store';



const initialState = {};
const initializedStore = store(initialState);

const PluridApp: React.FC<PluridAppProperties> = (properties) => {
    return (
        <StyledPluridApp>
            <Root
                store={initializedStore}
                appProperties={properties}
            />
        </StyledPluridApp>
    );
}


export default PluridApp;
