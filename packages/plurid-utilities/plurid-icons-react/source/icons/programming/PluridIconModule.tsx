import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconModule: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M516.67,430.78l401.75,232L412.9,832.11l-401.76-232ZM419.3,803.16l433.94-145.4-343-198L76.31,605.13l343,198"/>
                <path d="M548,313.94l401.75,232L444.2,715.27,42.45,483.32ZM450.62,686.31,884.56,540.92l-343-198L107.62,488.28l343,198"/>
                <path d="M587.11,167.89l401.75,232L483.34,569.22l-401.75-232ZM489.75,540.26,923.69,394.87l-343-198L146.76,342.23l343,198"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconModule;
