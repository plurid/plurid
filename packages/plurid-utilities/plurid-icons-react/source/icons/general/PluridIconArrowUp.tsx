import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconArrowUp: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="19 740.5 217 740.5 500 457.5 783 740.5 981 740.5 500 259.5 19 740.5"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconArrowUp;
