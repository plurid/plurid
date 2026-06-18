import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconPlay: React.FC<PluridIconProperties> = (properties) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M933.64,537.59,107.15,986.36A42.75,42.75,0,0,1,44,948.77V51.22a42.75,42.75,0,0,1,63.15-37.59L933.64,462.41a42.79,42.79,0,0,1,0,75.18Zm-790.08,346L820.78,516a18.15,18.15,0,0,0,0-31.91L143.56,116.33a18.13,18.13,0,0,0-26.82,16V867.57a18.14,18.14,0,0,0,26.82,16.09Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconPlay;
