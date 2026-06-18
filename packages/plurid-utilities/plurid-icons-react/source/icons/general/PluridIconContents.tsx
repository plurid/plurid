import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconContents: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M85,125H684.68a55,55,0,0,1,55,55h0a55,55,0,0,1-55,55H85a55,55,0,0,1-55-55h0A55,55,0,0,1,85,125Z"/>
                <rect x="860" y="125" width="110" height="110" rx="55"/>
                <path d="M85,445H684.68a55,55,0,0,1,55,55h0a55,55,0,0,1-55,55H85a55,55,0,0,1-55-55h0A55,55,0,0,1,85,445Z"/>
                <rect x="860" y="445" width="110" height="110" rx="55"/>
                <path d="M85,765H684.68a55,55,0,0,1,55,55h0a55,55,0,0,1-55,55H85a55,55,0,0,1-55-55h0A55,55,0,0,1,85,765Z"/>
                <rect x="860" y="765" width="110" height="110" rx="55"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconContents;
