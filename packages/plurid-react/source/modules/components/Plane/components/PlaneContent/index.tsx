import React, {
    useRef,
    useEffect,
} from 'react';

import {
    /** constants */
    PLURID_ENTITY_PLANE_CONTENT,
} from '@plurid/plurid-data';

import {
    StyledPlaneContent,
} from './styled';



export interface PlaneContentOwnProperties {
    updatePlaneSize: any;
}


const PlaneContent: React.FC<PlaneContentOwnProperties> = (
    properties,
) => {
    /** properties */
    const {
        updatePlaneSize,

        children,
    } = properties;


    /** references */
    const planeContentElement = useRef<HTMLDivElement>(null);


    /** effects */
    // useEffect(() => {
    //     if (planeContentElement.current) {
    //         // TODO
    //         // Implement a resize observer

    //         const {
    //             offsetWidth,
    //             offsetHeight,
    //         } = planeContentElement.current;

    //         const size = {
    //             width: offsetWidth,
    //             height: offsetHeight
    //         }
    //         updatePlaneSize(size)
    //         // console.log(offsetWidth, offsetHeight);
    //     }
    // }, [
    //     planeContentElement.current,
    // ]);


    /** render */
    return (
        <StyledPlaneContent
            ref={planeContentElement}
            data-plurid-entity={PLURID_ENTITY_PLANE_CONTENT}
        >
            {children}
        </StyledPlaneContent>
    );
}


export default PlaneContent;
