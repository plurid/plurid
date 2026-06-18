import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconDuplicate: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M895.26,297.57V895.11H457.92V297.57H895.26M981.85,211H371.33V981.72H981.85V211Z" />
                <polygon points="304.25 702.43 104.75 702.43 104.75 104.89 542.08 104.89 542.08 142.59 628.68 142.59 628.68 18.29 18.14 18.29 18.14 789.03 304.25 789.03 304.25 702.43" />
                <rect x="520.43" y="567.92" width="313.11" height="56.84" />
                <rect x="648.57" y="439.79" width="56.84" height="313.11" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconDuplicate;
