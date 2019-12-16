import React, {
    useRef,
    useEffect,
} from 'react';

import {
    StyledPlaneContent,
} from './styled';



interface PlaneContentProperties {
}

const PlaneContent: React.FC<PlaneContentProperties> = (properties) => {
    const planeContentElement = useRef<HTMLDivElement>(null);

    const {
        children,
    } = properties;

    useEffect(() => {
        if (planeContentElement.current) {
            // TODO
            // Implement a resize observer
            const {
                offsetWidth,
                offsetHeight,
            } = planeContentElement.current;

            console.log(offsetWidth, offsetHeight);
        }
    }, [
        planeContentElement.current,
    ]);

    return (
        <StyledPlaneContent
            ref={planeContentElement}
        >
            {children}
        </StyledPlaneContent>
    );
}


export default PlaneContent;
