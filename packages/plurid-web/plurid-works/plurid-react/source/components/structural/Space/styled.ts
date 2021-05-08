// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        fadeInAnimation,
    } from '~services/styled';
    // #endregion external
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

    /* TOFIX */
    /* opacity: ${({
        fadeInTime,
    }) => {
        if (fadeInTime) {
            return '0';
        }

        return '1';
    }};
    animation: ${({
        isMounted,
        fadeInTime,
    }) => {
        if (
            isMounted
            && fadeInTime
        ) {
            return fadeInAnimation(fadeInTime);
        }

        return '';
    }}; */
`;
// #endregion module
