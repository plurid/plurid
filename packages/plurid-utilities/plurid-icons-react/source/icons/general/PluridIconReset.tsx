import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconReset: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M767,700,966,448H826.63C801.15,252.76,634.18,102,432,102,212.19,102,34,280.19,34,500S212.19,898,432,898a396.4,396.4,0,0,0,256.11-93.34l-75.3-89.58A279.85,279.85,0,0,1,432,781c-155.19,0-281-125.81-281-281S276.81,219,432,219c137.42,0,251.79,98.65,276.18,229H568Z" />
                <path d="M767,700,966,448H826.63C801.15,252.76,634.18,102,432,102,212.19,102,34,280.19,34,500S212.19,898,432,898a396.4,396.4,0,0,0,256.11-93.34l-75.3-89.58A279.85,279.85,0,0,1,432,781c-155.19,0-281-125.81-281-281S276.81,219,432,219c137.42,0,251.79,98.65,276.18,229H568Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconReset;
