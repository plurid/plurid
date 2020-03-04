import React from 'react';

import {
    StyledNotFound,
} from './styled';

import faces from './faces';



interface NotFoundProperties {
}

const NotFound: React.FC<NotFoundProperties> = () => {
    const faceIndex = Math.floor(Math.random() * faces.length);
    const face = faces[faceIndex];

    return (
        <StyledNotFound>
            <h1>{face}</h1>

            <p>
                you searched and it's not here
            </p>
        </StyledNotFound>
    );
}


export default NotFound;
