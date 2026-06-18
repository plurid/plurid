import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconGet: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M505.34,745c-86-110-171.31-219.18-258.07-330.19h12.14c52.9-.13,105.79-.55,158.69-.16,10.08.08,11.95-3.36,11.89-12.53q-.45-156.78-.25-313.57V73H574.2V83.37c0,106.43.18,212.85-.24,319.28,0,10.09,3.09,12,12.31,11.89,53.85-.42,107.69-.24,161.54-.26H759Z" />
                <rect x="117" y="829.63" width="766" height="97.35" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconGet;
