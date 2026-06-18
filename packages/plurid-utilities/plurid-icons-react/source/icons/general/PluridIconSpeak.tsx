import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconSpeak: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <rect x="110" y="317" width="120" height="366" rx="60"/>
                <rect x="330" y="24" width="120" height="952" rx="60"/>
                <rect x="550" y="235" width="120" height="536" rx="60"/>
                <rect x="770" y="294" width="120" height="418" rx="60"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconSpeak;
