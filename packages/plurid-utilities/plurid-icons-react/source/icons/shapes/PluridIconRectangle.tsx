import React from 'react';

import PluridIcon from '../../PluridIcon';

import {
    PluridIconProperties,
} from '../../interfaces';



export interface PluridIconRectangleProperties extends PluridIconProperties {
    fill: boolean;
}

const PluridIconRectangle: React.FC<PluridIconRectangleProperties> = (
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
                    <rect x="266" y="70" width="468" height="860" />
                ) : (
                    <path d="M654,150V850H346V150H654m80-80H266V930H734V70Z" />
                )}
            </svg>
        </PluridIcon>
    );
}


export default PluridIconRectangle;
