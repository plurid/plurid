import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassStaticMethod: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="642.13 114.61 788.04 744.02 686.37 768.96 592.16 362.59 314.43 860.24 211.96 885.39 642.13 114.61"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassStaticMethod;
