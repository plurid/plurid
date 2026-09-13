// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        CHROME_OPACITY_AMBIENT,
    } from '~services/styled/chrome';
    // #endregion external
// #endregion imports



// #region module
/**
 * The edges layer. Lives inside `StyledPluridRoots` (the camera frame) as a sibling of the roots, so
 * it inherits the camera matrix via `preserve-3d` and the beams orbit with the planes. `top/left: 0`
 * pins it to the shared plane origin; `pointer-events: none` keeps it from intercepting plane clicks.
 */
export const StyledPluridPlaneLinks = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0 0;
    transform-style: preserve-3d;
    pointer-events: none;
`;


export interface IStyledPluridPlaneLink {
    theme: Theme;
    length: number;
    thickness: number;
}

/**
 * A single beam. Anchored at its left edge (`transform-origin: 0 0`), sized to the edge length, and
 * positioned/rotated by the inline `transform` from `computeEdgeTransform`.
 */
export const StyledPluridPlaneLink = styled.div<IStyledPluridPlaneLink>`
    position: absolute;
    top: 0;
    left: 0;
    height: ${({ thickness }) => thickness}px;
    width: ${({ length }) => length}px;
    transform-origin: 0 0;
    background-color: var(--plurid-ink);
    border-radius: ${({ thickness }) => thickness}px;
    opacity: var(--plurid-opacity-ambient);
`;


/**
 * A leash: the bridge's strip drawn as a beam — from the link's point on the parent's face to the
 * moved child's edge — with the band's own colours (the chrome's solid surface under a light film),
 * in the roots' frame like every beam, so it rides the camera and follows a drag per commit.
 */
export const StyledPluridPlaneLeash = styled.div<Pick<IStyledPluridPlaneLink, 'theme' | 'thickness'>>`
    position: absolute;
    top: 0;
    left: 0;
    height: ${({ thickness }) => thickness}px;
    transform-origin: 0 0;
    background-color: var(--plurid-surface-solid);
    background-image: linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16));
    opacity: ${CHROME_OPACITY_AMBIENT};
    pointer-events: none;
`;
// #endregion module
