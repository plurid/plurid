// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridSpace {
    theme: Theme;
    opaque: boolean;
    isMounted: boolean;
    fadeInTime: number;
    perspective: number;
}

/**
 * The perspective distance is the camera's `perspective` (config `space.perspective`), and the
 * vanishing point stays at the CENTER of the space — which is also the camera's pivot frame — so
 * an orbit pivots instead of shearing.
 */
/** The space's ground: the look's colour, its vignette, and its grid — two repeating gradients, the minor pitch under the major. */
const ground = `
    background-color: var(--plurid-space);
    background-image:
        var(--plurid-space-vignette),
        linear-gradient(var(--plurid-space-grid) 1px, transparent 1px),
        linear-gradient(90deg, var(--plurid-space-grid) 1px, transparent 1px),
        linear-gradient(var(--plurid-space-grid-minor) 1px, transparent 1px),
        linear-gradient(90deg, var(--plurid-space-grid-minor) 1px, transparent 1px);
    background-size:
        100% 100%,
        var(--plurid-space-grid-size) var(--plurid-space-grid-size),
        var(--plurid-space-grid-size) var(--plurid-space-grid-size),
        var(--plurid-space-grid-minor-size) var(--plurid-space-grid-minor-size),
        var(--plurid-space-grid-minor-size) var(--plurid-space-grid-minor-size);
`;

export const StyledPluridSpace = styled.div<IStyledPluridSpace>`
    position: relative;
    height: 100%;
    overflow: hidden;
    perspective: ${({ perspective }) => perspective}px;
    perspective-origin: 50% 50%;
    outline: none;
    transition: opacity ${({ fadeInTime }) => fadeInTime}ms linear;
    /* the ground is the look's; space.opaque false leaves the host's page to show through */
    ${({ opaque }) => (opaque ? ground : 'background: transparent;')}
`;

export const spaceGround = ground;
// #endregion module
