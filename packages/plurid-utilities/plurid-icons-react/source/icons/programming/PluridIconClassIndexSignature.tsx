import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassIndexSignature: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M674.35,52.27q15.6-9,15.64,3.51a53.69,53.69,0,0,1-1.15,8.8l-136,712.14q-6.47,36.33-9.89,42a28.81,28.81,0,0,1-10,9.17l-62.72,36.21q-12.65,7.3-12.69-5.21c0-2.71.77-7.62,2.31-14.73s3.7-12.46,6.45-16.08a24.88,24.88,0,0,1,8.53-7.64l39.75-23L646,109.67,612.45,129q-14.55,8.4-14.57-4.13-.06-18.6,7.58-30.13a32.81,32.81,0,0,1,9.12-8Z"/>
                <path d="M530.38,135.39q12.06-7,12.1,5.55.06,20-8.2,30.49a33.21,33.21,0,0,1-9.15,8l-39.3,22.69L355,889.68l32.69-18.87q15-8.67,15,3.84.06,19.29-7.88,30.31a33.83,33.83,0,0,1-9.41,8.14L325.06,948q-15,8.67-15.05-3.84,0-3.37,6.51-35.58l135.58-712q1.75-9.48,5.12-15.15a28.12,28.12,0,0,1,10.44-9.76Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassIndexSignature;
