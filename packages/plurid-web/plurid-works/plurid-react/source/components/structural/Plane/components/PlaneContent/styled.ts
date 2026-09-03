// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledPluridPlaneContent = styled.div`
    position: relative;
    /* Planes are pages: a finger on the content scrolls it natively; a pinch (two fingers)
       still reaches the engine because pinch-zoom is not granted to the browser. */
    touch-action: pan-x pan-y;
`;
// #endregion module
