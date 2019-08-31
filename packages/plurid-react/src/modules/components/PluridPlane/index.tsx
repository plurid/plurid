import React from 'react';

import {
    StyledPluridPlane,
} from './styled';

import {
    PluridPage,
} from '../../data/interfaces';



interface PluridPlaneProperties {
    page: PluridPage,
    [key: string]: any;
}

const PluridPlane: React.FC<PluridPlaneProperties> = (properties) => {
    const {
        page,
        children,
    } = properties;

    return (
        <StyledPluridPlane>
            {page.path}
            <br />
            {children}
            <br />
        </StyledPluridPlane>
    );
}


export default PluridPlane;
