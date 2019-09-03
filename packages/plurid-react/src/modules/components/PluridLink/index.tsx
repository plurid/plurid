import React from 'react';

import {
    StyledPluridLink,
} from './styled';

import {
    PluridLinkProperties,
} from '../../data/interfaces';



const PluridLink: React.FC<PluridLinkProperties> = (properties) => {
    const {
        page,
        children,
    } = properties;


    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        console.log(page);

        // add the page as branch to the current root
    }

    return (
        <StyledPluridLink
            onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleClick(event)}
        >
            {children}
        </StyledPluridLink>
    );
}


export default PluridLink;
