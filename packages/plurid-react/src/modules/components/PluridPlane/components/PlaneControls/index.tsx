import React from 'react';

import {
    StyledPlaneControls,
} from './styled';



interface PlaneControlsProperties {
    page: any;
    [key: string]: any;
}

const PlaneControls: React.FC<PlaneControlsProperties> = (properties) => {
    const {
        page,
    } = properties;

    return (
        <StyledPlaneControls>
            {page.path}
        </StyledPlaneControls>
    );
}


export default PlaneControls;
