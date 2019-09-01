import React from 'react';
import './index.css';
import {
    StyledPluridApp,
} from './styled';

import { Provider as ReduxProvider } from 'react-redux';

import handleView from './view';

import {
    PluridAppProperties,
} from '../modules/data/interfaces';

import store from '../modules/services/state/store';



const initialState = {};
const initializedStore = store(initialState);

const PluridApp: React.FC<PluridAppProperties> = (properties) => {
    const {
        configuration,
        pages,
        documents,
    } = properties;

    console.log(configuration);

    const view = handleView(pages, documents);

    return (
        <StyledPluridApp>
            <ReduxProvider
                store={initializedStore}
            >
                {view}
            </ReduxProvider>
        </StyledPluridApp>
    );
}


export default PluridApp;
