import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconBold: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M696.85,156.33h174l26.4,156.86H975L967,93H285.67l-8.26,220.21h77.95l26.41-156.91H555.53c2.11,105,2.12,210.61,2.12,315.39v56.55c0,105.41,0,210-2,312.4L435.67,853.32V907H817V853.32l-120.11-12.6C694.79,736.65,694.79,632,694.79,528v-56.3C694.73,365.3,694.74,259.72,696.85,156.33Z" />
                <path d="M253.84,497.5h94.9L363.18,583h42.38L401.19,462.9H29.55L25,583.07H67.57L82,497.56h94.77c1.11,57.28,1.17,114.87,1.17,172v30.85c0,57.5,0,114.54-1.11,170.4l-65.4,6.89V907H319.35V877.65l-65.52-6.86c-1.11-56.77-1.11-113.85-1.11-170.58v-30.7C252.65,611.45,252.65,553.89,253.84,497.5Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconBold;
