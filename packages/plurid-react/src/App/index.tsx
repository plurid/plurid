import React from 'react';
import './index.css';
import {
    StyledPluridApp,
} from './styled';

import handleView from './view';

import {
    PluridAppProperties,
} from '../modules/data/interfaces';



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
            {view}
        </StyledPluridApp>
    );
}


export default PluridApp;
