import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconEmail: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M501.16,561.49h.19a35.49,35.49,0,0,0,19.39-5.69l1.51-1c.32-.21.67-.41,1-.64l17.57-14.53L960,193.72a4.92,4.92,0,0,0-3.92-2H43.87a4.79,4.79,0,0,0-3,1.09L479.44,554.3C485,558.88,492.86,561.49,501.16,561.49ZM39,240.72V753.5L353.19,499.7Zm608.14,260.7L961,753.64V242.43Zm-99.79,82.32c-12.51,10.27-28.88,15.93-46.06,15.93s-33.6-5.63-46.08-15.85l-72-59.35L39,802.52v.89a5,5,0,0,0,4.94,4.88H956.13a5,5,0,0,0,4.87-4.9v-.82l-344-276.36Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconEmail;
