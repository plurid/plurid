import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconEnter: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M742.37,71H257.63C155,71,71,155,71,257.63V362.75h94.63V257.63a92.57,92.57,0,0,1,92-92H742.37a92.57,92.57,0,0,1,92,92V742.37a92.57,92.57,0,0,1-92,92H257.63a92.57,92.57,0,0,1-92-92V638.3H71V742.37C71,845,155,929,257.63,929H742.37C845,929,929,845,929,742.37V257.63C929,155,845,71,742.37,71Z" />
                <polygon points="591.5 398.31 414.5 296.12 414.5 455 -0.49 455 -0.49 545 414.5 545 414.5 704.88 591.5 602.69 768.5 500.5 591.5 398.31" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconEnter;
