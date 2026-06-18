import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconNotViewable: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M500,249C234.07,249,18.5,500,18.5,500S234.07,751,500,751,981.5,500,981.5,500,765.92,249,500,249ZM817.09,593.09c-48,34.6-96.75,62.09-144.8,81.72C613.41,698.87,555.44,711.07,500,711.07c-55.13,0-112.76-12.06-171.29-35.84-47.85-19.45-96.38-46.7-144.25-81A904.59,904.59,0,0,1,73.54,500a906.7,906.7,0,0,1,110.92-94.18c47.87-34.31,96.4-61.56,144.25-81C387.24,301.06,444.87,289,500,289s112.75,12.06,171.28,35.84c47.85,19.45,96.39,46.7,144.25,81a906.42,906.42,0,0,1,111,94.22A904.4,904.4,0,0,1,817.09,593.09Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconNotViewable;
