// #region imports
    // #region libraries
    import React, {
        useRef,
        // useEffect,
    } from 'react';

    import {
        /** constants */
        PLURID_ENTITY_PLANE_CONTENT,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import {
        StyledPluridPlaneContent,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridPlaneContentOwnProperties {
    // updatePlaneSize: any;
    children: any;
}

const PluridPlaneContent: React.FC<PluridPlaneContentOwnProperties> = (
    properties,
) => {
    /** properties */
    const {
        // updatePlaneSize,

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


    // console.log('render content');

    /** render */
    return (
        <StyledPluridPlaneContent
            ref={planeContentElement}
            data-plurid-entity={PLURID_ENTITY_PLANE_CONTENT}
        >
            {children}
        </StyledPluridPlaneContent>
    );
}
// #endregion module



// #region exports
export default PluridPlaneContent;
// #endregion exports
