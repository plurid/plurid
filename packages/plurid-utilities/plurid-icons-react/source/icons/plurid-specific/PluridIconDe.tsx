import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconDe: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M301.05,121.28C338.21,96.11,414.91,56.56,518,56.56c166.59,0,284,125.84,284,348.76,0,246.89-124.65,538.12-381.12,538.12C273.49,943.44,198,838,198,710.93c0-176.17,129.44-318.79,300.82-318.79,83.9,0,140.22,50.33,159.4,88.68h1.2c4.79-24,7.19-58.72,7.19-88.68-1.2-143.82-75.51-219.32-173.78-219.32-73.11,0-134.23,25.16-163,44.34Zm327.19,477c-13.19-44.35-59.93-97.08-123.45-97.08-97.07,0-165.39,99.47-165.39,207.34,0,77.9,40.75,124.64,100.68,124.64C536,833.18,603.07,721.72,628.24,598.28Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconDe;
