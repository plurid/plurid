import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassStaticProperty: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="726.72 149.22 797.68 108.25 696.55 606.4 640.48 638.78 258.31 859.79 202.32 891.75 303.45 393.6 374.41 352.63 291.98 758.66 644.29 555.26 726.72 149.22"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassStaticProperty;
