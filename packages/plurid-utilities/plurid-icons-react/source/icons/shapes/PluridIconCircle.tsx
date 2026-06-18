import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



export interface PluridIconCircleProperties extends PluridIconProperties {
    fill: boolean;
}

const PluridIconCircle: React.FC<PluridIconCircleProperties> = (
    properties,
) => {
    const {
        fill,
    } = properties;

    return (
        <PluridIcon
            {...properties}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                {fill
                ? (
                    <rect x="70" y="70" width="860" height="860" rx="430" />
                ) : (
                    <path d="M500,150a348.66,348.66,0,1,1-136.21,27.47A347.7,347.7,0,0,1,500,150h0m0-80h0C262.52,70,70,262.52,70,500h0c0,237.48,192.52,430,430,430h0c237.48,0,430-192.52,430-430h0C930,262.52,737.48,70,500,70Z" />
                )}
            </svg>
        </PluridIcon>
    );
}


export default PluridIconCircle;
