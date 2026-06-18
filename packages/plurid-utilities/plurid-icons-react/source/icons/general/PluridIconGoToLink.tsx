import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconGoToLink: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M574.07,492.67l-76.61-76.62L770.92,142.59l-.75-1.57H580V35.49H953.52V409.06H848.4V218.31Z" />
                <path d="M574.07,492.67l-76.61-76.62L770.92,142.59l-.75-1.57H580V35.49H953.52V409.06H848.4V218.31Z" />
                <polygon points="717.91 472.53 717.91 866.84 144.14 866.84 144.14 293.07 540.9 293.07 540.9 195.41 46.48 195.41 46.48 964.5 815.58 964.5 815.58 472.53 717.91 472.53" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconGoToLink;
