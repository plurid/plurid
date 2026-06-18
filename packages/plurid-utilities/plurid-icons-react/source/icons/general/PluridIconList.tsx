import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconList: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <rect x="251" y="451.32" width="700" height="97.35"/>
                <rect x="54" y="451.32" width="105" height="97.35"/>
                <rect x="251" y="167.32" width="700" height="97.35"/>
                <rect x="54" y="167.32" width="105" height="97.35"/>
                <rect x="251" y="735.32" width="700" height="97.35"/>
                <rect x="54" y="735.32" width="105" height="97.35"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconList;
