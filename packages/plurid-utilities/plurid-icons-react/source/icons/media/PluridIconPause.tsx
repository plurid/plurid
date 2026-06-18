import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconPause: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <rect x="165.5" y="41.5" width="150" height="917"/>
                <rect x="684.5" y="41.5" width="150" height="917"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconPause;
