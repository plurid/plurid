import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconSettings: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <rect x="15.68" y="138.44" width="969.82" height="52.61" rx="15"/>
                <rect x="15.68" y="469.9" width="969.82" height="52.61" rx="15"/>
                <rect x="15.68" y="808.37" width="969.82" height="52.61" rx="15"/>
                <g>
                    <circle cx="772.42" cy="165.62" r="134.95" transform="translate(109.12 594.69) rotate(-45)"/>
                    <path d="M772.42,45.68a120,120,0,1,1-84.81,35.13,119.12,119.12,0,0,1,84.81-35.13m0-30A149.95,149.95,0,1,0,922.36,165.62,149.95,149.95,0,0,0,772.42,15.68Z"/>
                </g>
                <g>
                    <circle cx="274.35" cy="493.57" r="134.95"/>
                    <path d="M274.35,373.63a119.94,119.94,0,1,1-84.81,35.13,119.16,119.16,0,0,1,84.81-35.13m0-30a149.95,149.95,0,1,0,150,149.94A149.94,149.94,0,0,0,274.35,343.63Z"/>
                </g>
                <g>
                    <circle cx="621.6" cy="835.55" r="134.95" transform="translate(-408.76 684.26) rotate(-45)"/>
                    <path d="M621.6,715.61a119.94,119.94,0,1,1-84.82,35.13,119.16,119.16,0,0,1,84.82-35.13m0-30A149.95,149.95,0,1,0,771.54,835.55,149.94,149.94,0,0,0,621.6,685.61Z"/>
                </g>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconSettings;
