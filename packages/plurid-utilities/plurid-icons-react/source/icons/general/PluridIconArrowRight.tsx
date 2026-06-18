import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconArrowRight: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="259.5 19 259.5 217 542.5 500 259.5 783 259.5 981 740.5 500 259.5 19"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconArrowRight;
