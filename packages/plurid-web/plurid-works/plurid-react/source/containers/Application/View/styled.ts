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
    /* Anchor the engine's typography to its own root so the host page's body/reset font
       can't cascade into the toolbar and the rest of the engine UI. The global html rule
       only sets a default; a consumer styling the body font would otherwise win since body
       is a closer ancestor. Setting it here (the closest engine ancestor) keeps the UI
       consistent regardless of the host's styles. */
    font-family: ${(props: any) =>
        props.theme?.fontFamilySansSerif
        || "system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, sans-serif"};

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

    /* The space is always a navigation surface (orbit/pan/zoom work in any mode, including
       the default ALL), so suppress text-selection / native drag / tap highlight and show a
       grab cursor — like a CAD viewport. Explicit transform modes get a hint cursor. */
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
        return 'grab';
    }};
    user-select: none;
    touch-action: none;
    -webkit-user-drag: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
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
