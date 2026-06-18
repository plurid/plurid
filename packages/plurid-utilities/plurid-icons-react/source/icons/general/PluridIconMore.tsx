import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconMore: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <rect x="380" width="240" height="240" rx="50"/>
                <rect x="380" y="380" width="240" height="240" rx="50"/>
                <rect x="380" y="760" width="240" height="240" rx="50"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconMore;
