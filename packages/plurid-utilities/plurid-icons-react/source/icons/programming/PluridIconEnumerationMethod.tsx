import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconEnumerationMethod: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="538.71 411.61 279.46 653.8 54.07 418.67 538.71 411.61"/>
                <polygon points="945.93 281.1 477.28 718.9 405.38 643.88 707.96 361.22 142.31 369.46 69.85 293.86 945.93 281.1"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconEnumerationMethod;
