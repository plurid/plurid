import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconContact: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M966.4,70.9a9.38,9.38,0,0,0-10.2-1l-921,471a9.49,9.49,0,0,0,1.45,17.5l308.3,98a9.48,9.48,0,0,0,9.24-2L780.67,270.1,440.13,673.19a9.5,9.5,0,0,0,4.48,15.21L786.72,792.6a9.1,9.1,0,0,0,2.74.41,9.69,9.69,0,0,0,4.71-1.24,9.52,9.52,0,0,0,4.52-6l171-705.17a9.5,9.5,0,0,0-3.33-9.69ZM544.71,763.24l-94.55-29.09a9.31,9.31,0,0,0-8.42,1.43,9.51,9.51,0,0,0-3.86,7.64V921.67a9.49,9.49,0,0,0,6.86,9.12,9.84,9.84,0,0,0,2.64.37,9.46,9.46,0,0,0,8-4.41l94.54-149.37a9.46,9.46,0,0,0-5.22-14.14Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconContact;
