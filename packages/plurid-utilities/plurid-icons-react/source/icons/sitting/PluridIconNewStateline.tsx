import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconNewStateline: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="1000 500 797.35 617 594.7 734 594.7 500 594.7 266 797.35 383 1000 500"/>
                <path d="M599.74,449.74H375.26V225.26A50.26,50.26,0,0,0,325,175h0a50.26,50.26,0,0,0-50.26,50.26V449.74H50.26A50.26,50.26,0,0,0,0,500H0a50.26,50.26,0,0,0,50.26,50.26H274.74V774.74A50.26,50.26,0,0,0,325,825h0a50.26,50.26,0,0,0,50.26-50.26V550.26H599.74A50.26,50.26,0,0,0,650,500h0A50.26,50.26,0,0,0,599.74,449.74Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconNewStateline;
