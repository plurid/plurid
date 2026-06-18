import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconLayout: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <rect x="527" width="473" height="301" rx="50"/>
                <rect x="527" y="375" width="473" height="625" rx="50"/>
                <rect width="461" height="994" rx="50"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconLayout;
