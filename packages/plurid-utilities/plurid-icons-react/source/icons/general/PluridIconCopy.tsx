import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconCopy: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M763,107H596c0-.17,0-.33,0-.5a100.5,100.5,0,0,0-201,0c0,.17,0,.33,0,.5H238a80,80,0,0,0-80,80V921a80,80,0,0,0,80,80H763a80,80,0,0,0,80-80V187A80,80,0,0,0,763,107ZM495.5,35A71.5,71.5,0,1,1,424,106.5,71.5,71.5,0,0,1,495.5,35ZM763,921H238V187h94.48a79.84,79.84,0,0,0,77.32,60H589.2a79.84,79.84,0,0,0,77.32-60H763Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconCopy;
