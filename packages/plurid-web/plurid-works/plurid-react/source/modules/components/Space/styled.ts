// #region imports
    // #region libraries
    import styled, {
        css,
        keyframes,
    } from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
const fadeIn = keyframes`
    from {
        opacity: 0%;
    }

    to {
        opacity: 100%;
    }
`;


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

    opacity: ${({
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
            return css`${fadeIn} ${fadeInTime}ms linear 100ms forwards`;
        }

        return '';
    }};
`;
// #endregion module
