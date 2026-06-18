import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



const PluridIconItalic: React.FC<PluridIconProperties> = (
    properties,
) => {
    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                <path d="M819.89,93H476.38l-18.05,49.6,107.49,12.86c-36,104.77-74.38,210.1-112.38,314.59L431.63,530C393,636.11,354.65,741.45,315,844.54L198.16,857.41l-18,49.59H523.62l18-49.59L434.12,844.56c36-104.78,74.36-210.08,112.41-314.65l21.78-59.86c38.7-106.15,77-211.5,116.61-314.6L801.84,142.6Z" />
            </svg>
        </PluridIcon>
    );
}


export default PluridIconItalic;
