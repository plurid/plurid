import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconScale: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M535.31,536l-70.9-71.42,352.21-352-2.18-4H595.65V10.73H985.27v390.2H889.12V182.22Q711.88,359.46,535.31,536Z"/>
                <path d="M464.69,464l70.9,71.42-352.21,352,2.18,4H404.35v97.94H14.73V599.07h96.15V817.78Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconScale;
