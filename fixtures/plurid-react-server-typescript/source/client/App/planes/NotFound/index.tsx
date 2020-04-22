import React, {
    useRef,
} from 'react';

import {
    StyledNotFound,
} from './styled';

import faces from './faces';



interface NotFoundProperties {
}

const NotFound: React.FC<NotFoundProperties> = () => {
    /** properties */
    const faceIndex = useRef(Math.floor(Math.random() * faces.length));
    const face = useRef(faces[faceIndex.current]);

    return (
        <StyledNotFound>
            <h1>
                {face.current}
            </h1>

            <p>
                you searched and it's not here
            </p>
        </StyledNotFound>
    );
}


export default NotFound;
