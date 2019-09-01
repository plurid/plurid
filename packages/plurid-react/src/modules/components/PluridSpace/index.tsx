import React from 'react';

import {
    StyledPluridSpace,
} from './styled';

import PluridRoots from '../PluridRoots';



interface PluridSpaceProperties {
}

const PluridSpace: React.FC<PluridSpaceProperties> = (properties) => {
    return (
        <StyledPluridSpace>
            <PluridRoots />
        </StyledPluridSpace>
    );
}


export default PluridSpace;
