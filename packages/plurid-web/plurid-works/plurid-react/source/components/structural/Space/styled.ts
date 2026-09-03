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
export const StyledPluridSpace = styled.div<IStyledPluridSpace>`
    position: relative;
    height: 100%;
    overflow: hidden;
    perspective: ${({ perspective }) => perspective}px;
    perspective-origin: 50% 50%;
    outline: none;
    transition: opacity ${({fadeInTime}) => fadeInTime}ms linear;

    background: ${({
        opaque,
        theme,
    }) => {
        if (opaque) {
            const foregroundGradient = theme.type === 'dark'
                ? theme.backgroundColorTertiary
                : theme.backgroundColorPrimary;
            const backgroundGradient = theme.type === 'dark'
                ? theme.backgroundColorPrimary
                : theme.backgroundColorTertiary;

            return `radial-gradient(
                ellipse at center,
                ${foregroundGradient} 0%,
                ${backgroundGradient} 100%)
            `;
        }

        return 'transparent';
    }};
`;
// #endregion module
