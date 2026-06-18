import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconBold: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M607.14,472.26c157.64-28.75,204.2-99.49,204.2-181.52,0-106-76.29-186.06-280.23-186.06H142v64.64l90.73,9.37c1.89,101.36,1.89,203.19,1.89,304.24v35c0,102.57,0,203.81-1.86,303.37L142,830.68v64.64H484.75c299.49,0,373.25-121.13,373.25-222C858,565.64,786.22,492.93,607.14,472.26ZM478,173.93c94.43,0,138.24,42.85,138.24,131.86,0,95.07-47.28,144.59-149.31,144.59h-33.7c0-93.22.21-185.68,2-276.47Zm-3,652.14H435.18c-1.94-102.1-2-205.06-2-311.63H474c119.85,0,176.76,47.87,176.76,157.18C650.78,773.17,586.26,826.07,475,826.07Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconBold;
