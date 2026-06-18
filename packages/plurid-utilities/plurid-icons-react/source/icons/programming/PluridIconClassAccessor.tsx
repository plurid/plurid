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
                <polygon points="383.6 636.26 403.84 631.3 650.86 570.68 658.68 568.76 652.84 579.22 453.27 936.81 388.73 658.37 383.6 636.26"/>
                <polygon points="636.18 63.19 775.97 666.22 678.55 690.13 652.84 579.22 658.68 568.76 650.86 570.68 588.3 300.78 403.84 631.3 383.6 636.26 388.73 658.37 322.2 777.59 224.03 801.68 636.18 63.19"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconClassMethod;
