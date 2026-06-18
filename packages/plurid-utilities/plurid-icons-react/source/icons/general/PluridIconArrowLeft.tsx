import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconArrowLeft: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="740.5 981 740.5 783 457.5 500 740.5 217 740.5 19 259.5 500 740.5 981"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconArrowLeft;
