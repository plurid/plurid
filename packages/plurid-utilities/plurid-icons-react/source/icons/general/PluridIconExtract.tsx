import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconExtract: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <polygon points="687.91 770.94 687.91 849.6 150.4 849.6 150.4 150.4 687.91 150.4 687.91 229.06 775.31 229.06 775.31 63 63 63 63 937 775.31 937 775.31 770.94 687.91 770.94" />
                <path d="M937,498.46,648.75,723.74v-10.6c-.11-46.17-.47-92.34-.13-138.52.07-8.81-2.93-10.41-10.93-10.38q-136.87.39-273.74.21H350.42V438.35h9c92.91,0,185.81-.15,278.71.21,8.81,0,10.44-2.7,10.38-10.74-.36-47-.21-94-.22-141V277Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconExtract;
