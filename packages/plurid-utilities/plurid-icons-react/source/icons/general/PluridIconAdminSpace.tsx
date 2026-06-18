import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconAdminSpace: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <g>
                    <polygon points="519 19 519 217 802 500 519 783 519 981 1000 500 519 19"/>
                    <polygon points="481 19 481 217 198 500 481 783 481 981 0.01 500 481 19"/>
                </g>
                <g>
                    <polygon points="19 19 19 217 302 500 19 783 19 981 500 500 19 19"/>
                    <polygon points="981 19 981 217 698 500 981 783 981 981 500 500 981 19"/>
                </g>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconAdminSpace;
