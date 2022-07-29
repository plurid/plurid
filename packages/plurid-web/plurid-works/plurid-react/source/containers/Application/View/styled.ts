// #region imports
    // #region libraries
    import styled, {
        createGlobalStyle,
    } from 'styled-components';

    import {
        TRANSFORM_MODES,
    } from '@plurid/plurid-data';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IGlobalStyle {
    theme: Theme;
    preventOverscroll: boolean;
}

export const GlobalStyle = createGlobalStyle<IGlobalStyle>`
    *,
    *:after,
    *:before {
        box-sizing: border-box;
        font-kerning: auto;
        text-rendering: optimizeLegibility;
    }

    html, body {
        margin: 0;
        height: 100%;
        width: 100%;
        overscroll-behavior-x: ${
            ({
                preventOverscroll,
            }) => {
                if (preventOverscroll) {
                    return 'none';
                }

                return 'auto';
            }
        };
    }

    html {
        overflow: hidden;
        background: black;
        color: white;
        font-family: ${
            ({
                theme,
            }) => theme.fontFamilySansSerif
        }
    }
`;


export const StyledView: any = styled.div`
    height: 100%;
    min-height: ${(props: any) => {
        if (
            props.fullHeight
        ) {
            return '100vh';
        }

        return '100%';
    }};
    min-height: ${(props: any) => {
        if (
            props.fullHeight
        ) {
            return '-webkit-fill-available';
        }

        return '100%';
    }};

    width: 100%;
    position: relative;
    scroll-snap-align: start;
    outline: none;
    overflow: hidden;

    cursor: ${(props: any) => {
        if (
            props.transformMode === TRANSFORM_MODES.TRANSLATION
            || props.transformMode === TRANSFORM_MODES.ROTATION
        ) {
            return 'all-scroll';
        }
        if (
            props.transformMode === TRANSFORM_MODES.SCALE
        ) {
            return 'ns-resize';
        }
        return 'initial';
    }};
    user-select: ${(props: any) => {
        if (props.transformMode !== 'ALL') {
            return 'none';
        }
        return 'initial !important';
    }};
    touch-action: ${(props: any) => {
        if (props.transformMode !== 'ALL') {
            return 'none !important';
        }
        return 'initial !important';
    }};
    -webkit-user-drag: ${(props: any) => {
        if (props.transformMode !== 'ALL') {
            return 'none';
        }
        return 'initial !important';
    }};
    -webkit-tap-highlight-color: ${(props: any) => {
        if (props.transformMode !== 'ALL') {
            return 'rgba(0, 0, 0, 0)';
        }
        return 'initial !important';
    }};
`;


export const StyledEmpty: any = styled.div`
    outline: none;
    background: ${(props: any) => {
        if (props.opaque) {
            const foregroundGradient = props.theme.type === 'dark'
                ? props.theme.backgroundColorTertiary
                : props.theme.backgroundColorPrimary;
            const backgroundGradient = props.theme.type === 'dark'
                ? props.theme.backgroundColorPrimary
                : props.theme.backgroundColorTertiary;

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
