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
}

export const StyledPluridSpace = styled.div<IStyledPluridSpace>`
    position: relative;
    height: 100%;
    overflow: hidden;
    perspective: 2000px;
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
