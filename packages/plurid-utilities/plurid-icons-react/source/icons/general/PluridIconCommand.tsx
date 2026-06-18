import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconCommand: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M460.87,443.26,45.35,618.86,7.66,501.93,311.09,383.56,7.66,265.21,45.35,148.26,460.87,323.78Z"/>
                <path d="M509.18,731.92H992.34V851.74H509.18Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconCommand;
