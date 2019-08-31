import React from 'react';

import {
    StyledPluridLink,
} from './styled';

import {
    PluridLinkProperties,
} from '../../data/interfaces';



const PluridLink: React.FC<PluridLinkProperties> = (properties) => {
    const {
        children,
    } = properties;

    return (
        <StyledPluridLink>
            {children}
        </StyledPluridLink>
    );
}


export default PluridLink;
