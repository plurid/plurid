// #region imports
    // #region libraries
    import React, {
        useRef,
        useEffect,
        useLayoutEffect,
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
    children: React.ReactNode;
    /** The plane has a declared or hand-set height: the content scrolls inside it. */
    fixedHeight?: boolean;
    /** The scroller's position, kept by the plane across a detach (`culling.detach`). */
    scrollMemory?: React.MutableRefObject<{ top: number; left: number }>;
    /** The content is detached: on re-attach the remembered scroll position is restored. */
    detached?: boolean;
}


const PluridPlaneContent: React.FC<PluridPlaneContentOwnProperties> = (
    properties,
) => {
    // #region properties
    const {
        // updatePlaneSize,
        children,
        fixedHeight,
        scrollMemory,
        detached,
    } = properties;
    // #endregion properties


    // #region references
    const planeContentElement = useRef<HTMLDivElement>(null);

    // remember where the content is scrolled (a hidden or unmounted scroller resets to 0)
    useEffect(() => {
        const element = planeContentElement.current;
        if (!element || !scrollMemory) {
            return;
        }
        const onScroll = () => {
            scrollMemory.current = { top: element.scrollTop, left: element.scrollLeft };
        };
        element.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            element.removeEventListener('scroll', onScroll);
        };
    }, [scrollMemory]);

    // re-attached (or mounted again): the remembered position, before paint
    useLayoutEffect(() => {
        const element = planeContentElement.current;
        if (!element || !scrollMemory || detached) {
            return;
        }
        const { top, left } = scrollMemory.current;
        if ((top || left) && (element.scrollTop !== top || element.scrollLeft !== left)) {
            element.scrollTop = top;
            element.scrollLeft = left;
        }
    }, [scrollMemory, detached]);
    // #endregion references


    // console.log('render content');

    // #region render
    return (
        <StyledPluridPlaneContent
            ref={planeContentElement}
            $fixedHeight={fixedHeight}
            tabIndex={fixedHeight ? -1 : undefined}
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
