import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconExplore: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M700,0C534.31,0,400,134.31,400,300a298.61,298.61,0,0,0,56.61,175.39L0,932l68,68L524.61,543.39A298.61,298.61,0,0,0,700,600c165.69,0,300-134.31,300-300S865.69,0,700,0ZM855.56,455.56A220,220,0,1,1,920,300,218.53,218.53,0,0,1,855.56,455.56Z"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconExplore;
