import React from 'react';

import {
    StyledPluridPlane,
} from './styled';



interface PluridPlaneProperties {
    [key: string]: any;
}

const PluridPlane: React.FC<PluridPlaneProperties> = (properties) => {
    const {
    } = properties;

    return (
        <StyledPluridPlane>
            plurid plane
        </StyledPluridPlane>
    );
}


export default PluridPlane;
