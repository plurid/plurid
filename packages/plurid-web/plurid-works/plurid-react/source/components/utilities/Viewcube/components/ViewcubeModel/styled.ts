// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const StyledPluridViewcubeModel = styled.div`
    grid-area: PVModel;
    margin-left: -7px;
    margin-top: 5px;
`;


export const StyledPluridViewcubeModelContainer = styled.div`
    perspective: 2000px;
    perspective-origin: 50% 50%;
`;


export const StyledPluridViewcubeModelCube = styled.div`
    transform-style: preserve-3d;
    width: 50px;
    height: 50px;

    /* the hover reveal eases in an inline transition; a reader who asked for no motion gets the
       turn at once, as the camera's own moves already do */
    @media (prefers-reduced-motion: reduce) {
        transition: none !important;
    }
`;
// #endregion module
