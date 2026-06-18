import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassInheritedProperty: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="327.62 120.43 643.87 44.07 607.13 144.1 332.04 210.22 259.33 328.68 216.7 301.15 327.62 120.43"/>
                <polygon points="678.08 109.83 576.94 607.98 520.86 640.36 138.69 861.37 82.7 893.33 183.83 395.18 254.8 354.21 172.36 760.25 524.67 556.84 607.1 150.81 678.08 109.83"/>
                <polygon points="974.09 364.34 897.73 740.48 855.38 764.92 566.83 931.79 524.54 955.93 600.91 579.8 654.5 548.86 592.25 855.44 858.26 701.86 920.51 395.28 974.09 364.34"/>
                <polygon points="709.48 372.34 948.26 314.68 920.52 390.21 712.81 440.14 657.91 529.59 625.73 508.8 709.48 372.34"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassInheritedProperty;
