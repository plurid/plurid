import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassInheritedMethod: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="426.49 489.22 507.2 837.41 188.52 915.62 426.49 489.22"/>
                <polygon points="517.75 68.2 663.65 697.61 561.98 722.57 467.78 316.18 190.04 813.85 87.58 838.98 517.75 68.2"/>
                <polygon points="751.85 643.11 806.49 878.85 590.73 931.8 751.85 643.11"/>
                <polygon points="813.63 358.05 912.42 784.2 843.58 801.09 779.8 525.95 591.75 862.89 522.38 879.91 813.63 358.05"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassInheritedMethod;
