import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconEnumeration: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M369,372.49c25.61,14.78,20.17,35.54-12.12,46.36S277.6,426.46,252,411.68s-20.18-35.54,12.12-46.36S343.34,357.71,369,372.49Z"/>
                <path d="M574.32,303.9c25.61,14.78,20.18,35.54-12.12,46.36s-79.23,7.61-104.83-7.17-20.18-35.54,12.11-46.36S548.72,289.12,574.32,303.9Z"/>
                <polygon points="969.06 535.67 859.98 572.22 547.71 391.93 656.79 355.38 969.06 535.67"/>
                <polygon points="763.69 604.26 654.61 640.81 342.34 460.53 451.42 423.98 763.69 604.26"/>
                <path d="M164.06,441.36c25.6,14.78,20.17,35.54-12.12,46.36s-79.25,7.61-104.85-7.17S26.91,445,59.22,434.19,138.45,426.58,164.06,441.36Z"/>
                <polygon points="558.79 673.13 449.71 709.68 137.44 529.4 246.53 492.85 558.79 673.13"/>
            </svg>
        </PluridIcon>
    );
}


export default PluridIconEnumeration;
