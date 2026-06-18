import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconEnumerationMember: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M350.15,354.09c29.34,16.94,23.12,40.71-13.88,53.11s-90.77,8.72-120.1-8.21-23.11-40.71,13.89-53.11S320.83,337.16,350.15,354.09Z"/>
                <polygon points="802.33 619.59 677.37 661.46 319.67 454.94 444.63 413.07 802.33 619.59"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconEnumerationMember;
