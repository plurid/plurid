import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconIndexSignature: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M811.48,353.08q11.35,6.57,1.18,12.48Q796.4,375,784,373.23a31.11,31.11,0,0,1-10.83-3.7l-37-21.35-622,216.9,30.76,17.76q14.13,8.16,4,14.07-15.71,9.14-28.41,7.85a32.15,32.15,0,0,1-11.07-3.85l-56.8-32.79Q38.42,560,48.6,554q2.74-1.59,32.07-11.44L724.83,318.05a43.43,43.43,0,0,1,14.76-3A26.43,26.43,0,0,1,752.46,319Z"/>
                <path d="M947,431.32q14.68,8.48,4.5,14.4a49.34,49.34,0,0,1-7.72,3.2L299.31,673.19q-32.67,11.8-38.94,11.72a27.11,27.11,0,0,1-12.17-3.84l-59-34.08q-11.91-6.87-1.73-12.8,3.31-1.92,13.09-5t16.15-2.31a23.52,23.52,0,0,1,10.24,3.36l37.4,21.59L886.83,435.18,855.3,417q-13.68-7.91-3.48-13.82,15.13-8.79,28.12-8a31.28,31.28,0,0,1,10.8,3.68Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconIndexSignature;
