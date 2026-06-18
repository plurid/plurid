import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconInterfaceMethod: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="556.62 409.77 641.59 886.29 297.18 572.91 556.62 409.77"/>
                <polygon points="657.69 69.29 811.29 930.71 701.41 830.72 602.24 274.55 299.44 464.96 188.71 364.2 657.69 69.29"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconInterfaceMethod;
