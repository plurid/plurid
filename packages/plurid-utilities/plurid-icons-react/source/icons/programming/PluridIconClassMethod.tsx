import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassMethod: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="550.87 497.32 631.59 845.5 312.91 923.71 550.87 497.32"/>
                <polygon points="642.14 76.29 788.04 705.7 686.37 730.65 592.17 324.27 314.43 821.93 211.96 847.08 642.14 76.29"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassMethod;
