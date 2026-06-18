import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconExpandMinus: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <rect x="0.5" y="422.5" width="1000" height="155" rx="77.5"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconExpandMinus;
