import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconDeauthored: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <rect x="-44.74" y="498.11" width="1091.94" height="98" transform="translate(-219.15 369.32) rotate(-33.64)"/>
                <g>
                    <path d="M427.08,437.06c31.33-93.8,59.75-184.31,80.31-268.71h2.68c13.39,58.78,29.68,118.8,48.16,181.43l97.75-65L578.55,47.5H449.65L273.91,539Z"/>
                    <polygon points="188.16 778.79 126.05 952.5 250.92 952.5 346.45 673.46 188.16 778.79"/>
                    <path d="M605.05,501.37q.84,2.67,1.7,5.34l141,445.79H874L705,434.86Z"/>
                </g>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconDeauthored;
