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
                <path d="M257.63,929H742.37C845,929,929,845,929,742.37V637.25H834.37V742.37a92.57,92.57,0,0,1-92,92H257.63a92.57,92.57,0,0,1-92-92V257.63a92.57,92.57,0,0,1,92-92H742.37a92.57,92.57,0,0,1,92,92V361.7H929V257.63C929,155,845,71,742.37,71H257.63C155,71,71,155,71,257.63V742.37C71,845,155,929,257.63,929Z" />
                <polygon points="823 398.31 646 296.12 646 455 231.01 455 231.01 545 646 545 646 704.88 823 602.69 1000 500.5 823 398.31" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconEnter;
