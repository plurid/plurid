// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridRoots {}

export const StyledPluridRoots = styled.div<IStyledPluridRoots>`
    transform-style: preserve-3d;
    /* A transform wrapper, never a hit target: its own box lies in the wall plane (z = 0) and
       Chrome's single hit-test (what clicks use) returned it wherever a click's ray crossed that
       invisible box before reaching a plane BEHIND the wall — a spawned plane's links were dead
       from most viewpoints (2026-09-05). Planes opt back in below. */
    pointer-events: none;
    transform-origin: 0 0 0;
`;
// #endregion module
