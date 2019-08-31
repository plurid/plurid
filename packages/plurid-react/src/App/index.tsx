import React from 'react';

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
    console.log(pages);
    console.log(documents);

    // determine if the application is pages or documents-based
    // then render appropriately

    return (
        <div>
            plurid app
        </div>
    );
}


export default PluridApp;
