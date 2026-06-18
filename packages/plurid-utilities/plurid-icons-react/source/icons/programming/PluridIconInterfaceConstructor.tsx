import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconInterfaceConstructor: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M601.69,215.62C823.51,343.68,954.56,626.31,894.4,846.88L91,383.64C151.29,162.54,379.87,87.55,601.69,215.62ZM652.64,477C668.39,419.22,634.07,345.23,576,311.7s-117.93-13.9-133.68,43.85S460.88,487.3,519,520.83,636.88,534.73,652.64,477"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconInterfaceConstructor;
