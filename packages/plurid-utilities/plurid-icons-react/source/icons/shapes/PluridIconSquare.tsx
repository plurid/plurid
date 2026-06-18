import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



export interface PluridIconSquareProperties extends PluridIconProperties {
    fill: boolean;
}

const PluridIconSquare: React.FC<PluridIconSquareProperties> = (
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
                    <rect x="70" y="70" width="860" height="860" />
                ) : (
                    <path d="M850,150V850H150V150H850m80-80H70V930H930V70Z" />
                )}
            </svg>
        </PluridIcon>
    );
}


export default PluridIconSquare;
