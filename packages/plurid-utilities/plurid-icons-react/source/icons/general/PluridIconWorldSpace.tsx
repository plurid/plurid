import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconWorldSpace: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="519 19 519 217 802 500 519 783 519 981 1000 500 519 19"/>
                <polygon points="481 19 481 217 198 500 481 783 481 981 0.01 500 481 19"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconWorldSpace;
