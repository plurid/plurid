import React, {
    useRef,
    useEffect,
} from 'react';

import {
    StyledPlaneContent,
} from './styled';



interface PlaneContentOwnProperties {
    updatePlaneSize: any;
}

const PlaneContent: React.FC<PlaneContentOwnProperties> = (properties) => {
    const {
        updatePlaneSize,
    } = properties;

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

            const size = {
                width: offsetWidth,
                height: offsetHeight
            }
            updatePlaneSize(size)
            // console.log(offsetWidth, offsetHeight);
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
