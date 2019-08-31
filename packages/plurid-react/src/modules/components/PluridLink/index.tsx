import React from 'react';

import {
    PluridLinkProperties,
} from '../../data/interfaces';



const PluridLink: React.FC<PluridLinkProperties> = (properties) => {
    const {
        children,
    } = properties;

    return (
        <a>
            {children}
        </a>
    );
}


export default PluridLink;
