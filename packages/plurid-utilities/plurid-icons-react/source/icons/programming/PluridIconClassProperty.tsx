import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconClassProperty: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="797.69 141.13 696.55 639.28 640.47 671.66 258.31 892.67 202.31 924.63 303.44 426.48 374.42 385.51 291.98 791.55 644.28 588.15 726.72 182.11 797.69 141.13"/>
                <polygon points="447.24 151.73 763.48 75.37 726.74 175.4 451.66 241.52 378.94 359.99 336.31 332.45 447.24 151.73"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassProperty;
