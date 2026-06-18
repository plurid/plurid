import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconPersonalSpace: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="19 19 19 217 302 500 19 783 19 981 500 500 19 19"/>
                <polygon points="981 19 981 217 698 500 981 783 981 981 500 500 981 19"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconPersonalSpace;
