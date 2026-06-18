import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconInterfaceProperty: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="837.32 507.62 720.39 936.35 657.11 899.81 225.87 651.25 162.68 614.35 279.61 185.63 359.7 231.87 264.38 581.31 661.93 810.84 757.24 461.38 837.32 507.62"/>
                <polygon points="443.09 63.65 799.27 389.15 757.31 453.87 447.49 170.39 364.95 209.04 317.18 122.62 443.09 63.65"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconInterfaceProperty;
