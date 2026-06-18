import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconArrowDown: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="981 259.5 783 259.5 500 542.5 217 259.5 19 259.5 500 740.5 981 259.5"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconArrowDown;
