import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconInterfaceIndexSignature: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M537.54,113.44q14.1,8.13,14.07,22.86-.06,23.46-9.72,24.64-4.83.41-10.68-3l-45.77-26.43-158,628.91,38.42,22.18q17.65,10.2,17.61,24.9-.06,22.63-9.45,24.79c-3.24.25-7-.82-11.1-3.22L291.78,788q-17.7-10.21-17.65-24.92,0-4,8.06-32.8l163.72-651Q448,70.54,452,68.43t12.24,2.67Z"/>
                <path d="M707.53,211.58q18.38,10.6,18.34,25.34a36.79,36.79,0,0,1-1.48,8.71L560.17,896.25q-8.25,33.6-12.5,35.54c-2.76,1.06-6.68.13-11.73-2.78l-73.47-42.42q-14.84-8.57-14.79-23.27c0-3.19,1-7.87,2.82-14.09s4.43-9.58,7.69-10.09q3.46-1.2,10.07,2.62l46.89,27.07L673.81,240.29,634.34,217.5q-17.12-9.88-17.07-24.59.08-21.85,9.1-25c3.24-.24,6.83.75,10.76,3Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconInterfaceIndexSignature;
