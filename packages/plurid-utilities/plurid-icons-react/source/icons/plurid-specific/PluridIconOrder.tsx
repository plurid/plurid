import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconOrder: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <rect x="388.25" y="388.25" width="223.5" height="1000" rx="100" transform="translate(1388.25 388.25) rotate(90)"/>
                <rect x="288.63" y="99.62" width="223.5" height="800.77" rx="100" transform="translate(900.38 99.62) rotate(90)"/>
                <rect x="208.86" y="-208.86" width="223.5" height="641.23" rx="100" transform="translate(432.36 -208.86) rotate(90)"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconOrder;
