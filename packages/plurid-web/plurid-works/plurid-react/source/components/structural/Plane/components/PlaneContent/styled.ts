// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledPluridPlaneContent = styled.div<{ $fixedHeight?: boolean }>`
    position: relative;
    /* Inside a plane with a declared or hand-set height the content scrolls (the wheel over a
       scroller stays the content's: services/logic/input/guard.ts). */
    ${({ $fixedHeight }) => ($fixedHeight ? 'min-height: 0; overflow: auto; outline: none;' : '')}
    /* Planes are pages: a finger on the content scrolls it natively; a pinch (two fingers)
       still reaches the engine because pinch-zoom is not granted to the browser. */
    touch-action: pan-x pan-y;
`;
// #endregion module
