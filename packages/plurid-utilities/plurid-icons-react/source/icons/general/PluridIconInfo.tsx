import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconInfo: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M500,88A412.13,412.13,0,0,1,660.34,879.66,412.13,412.13,0,0,1,339.66,120.34,409.37,409.37,0,0,1,500,88m0-80C228.28,8,8,228.28,8,500S228.28,992,500,992,992,771.72,992,500,771.72,8,500,8Z"/>
                <path d="M539.5,376h-80V783.11a40,40,0,1,0,80,0V376Z"/>
                <path d="M499.5,186a43,43,0,1,0,43,43,43,43,0,0,0-43-43Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconInfo;
