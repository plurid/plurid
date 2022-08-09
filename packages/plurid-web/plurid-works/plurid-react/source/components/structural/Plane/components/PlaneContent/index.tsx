// #region imports
    // #region libraries
    import React, {
        useRef,
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
    // #region properties
    const {
        // updatePlaneSize,

        children,
    } = properties;
    // #endregion properties


    // #region references
    const planeContentElement = useRef<HTMLDivElement>(null);
    // #endregion references


    // #region effects
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
    // #endregion effects


    // console.log('render content');

    // #region render
    return (
        <StyledPluridPlaneContent
            ref={planeContentElement}
            data-plurid-entity={PLURID_ENTITY_PLANE_CONTENT}
        >
            {children}
        </StyledPluridPlaneContent>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridPlaneContent;
// #endregion exports
