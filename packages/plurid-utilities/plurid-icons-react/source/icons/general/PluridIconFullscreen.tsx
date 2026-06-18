import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconFullscreen: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M50,634.74h88.7V795.58l231-231,63.58,64.61c-75.76,78.39-152.75,154.12-229.68,231.5H365v89.07H50Z" />
                <path d="M50,634.74h88.7V795.58l231-231,63.58,64.61c-75.76,78.39-152.75,154.12-229.68,231.5H365v89.07H50Z" />
                <path d="M630.51,434.61l-64.45-64.46Q681.17,255.06,796.13,140.08l-.63-1.33h-160V50H949.71V364.27H861.3V203.79C784,281.07,707.38,357.72,630.51,434.61Z" />
                <path d="M630.51,434.61l-64.45-64.46Q681.17,255.06,796.13,140.08l-.63-1.33h-160V50H949.71V364.27H861.3V203.79C784,281.07,707.38,357.72,630.51,434.61Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconFullscreen;
