// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
/** Lives in the camera frame (`StyledPluridRoots`) like the edges layer, so guides track the space. */
export const StyledAlignmentGuides = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0 0;
    transform-style: preserve-3d;
    pointer-events: none;
`;


export interface IStyledAlignmentGuide {
    theme: Theme;
}

/** A thin guide line; its length + position/orientation come from the inline `transform` + size. */
export const StyledAlignmentGuide = styled.div<IStyledAlignmentGuide>`
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    background-color: ${({ theme }) => theme.colorPrimary};
    opacity: 0.6;
`;
// #endregion module
