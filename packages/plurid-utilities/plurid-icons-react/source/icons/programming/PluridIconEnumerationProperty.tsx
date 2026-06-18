import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconEnumerationProperty: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="760.84 291.36 966.96 508 870.45 524.72 691.39 336.14 563.68 332.71 566 286.12 760.84 291.36"/>
                <polygon points="930.33 565.45 487.32 713.88 435.77 684.13 84.22 481.48 33.04 451.61 476.05 303.17 541.28 340.83 180.19 461.82 504 648.78 865.1 527.79 930.33 565.45"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconEnumerationProperty;
