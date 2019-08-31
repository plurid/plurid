import React from 'react';

import {
    StyledPluridSpace,
} from './styled';



interface PluridSpaceProperties {
    [key: string]: any;
}

const PluridSpace: React.FC<PluridSpaceProperties> = (properties) => {
    const {
    } = properties;

    return (
        <StyledPluridSpace>
            plurid space
        </StyledPluridSpace>
    );
}


export default PluridSpace;
