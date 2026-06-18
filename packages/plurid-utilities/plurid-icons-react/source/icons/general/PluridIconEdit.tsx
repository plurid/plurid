import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconEdit: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <rect x="148.81" y="393.22" width="668.05" height="247.69" transform="translate(-224.2 492.86) rotate(-45)"/>
                <path d="M765.58,9h79.09A123.85,123.85,0,0,1,968.52,132.85v0A123.85,123.85,0,0,1,844.67,256.7H765.58a0,0,0,0,1,0,0V9A0,0,0,0,1,765.58,9Z" transform="translate(160.01 652.01) rotate(-45)"/>
                <polygon points="167.7 832.4 255.17 919.87 136.91 950.67 18.64 981.46 49.44 863.2 80.23 744.94 167.7 832.4"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconEdit;
