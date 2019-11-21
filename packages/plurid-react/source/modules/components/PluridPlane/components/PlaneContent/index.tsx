import React from 'react';

import {
    StyledPlaneContent,
} from './styled';



interface PlaneContentProperties {
}

const PlaneContent: React.FC<PlaneContentProperties> = (properties) => {
    const {
        children,
    } = properties;

    return (
        <StyledPlaneContent>
            {children}
        </StyledPlaneContent>
    );
}


export default PlaneContent;
