import styled, { createGlobalStyle } from 'styled-components';

import {
    TRANSFORM_MODES,
} from '@plurid/plurid-data';


export const GlobalStyle = createGlobalStyle`
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
        background-color: black;
        color: white;
        font-family: Ubuntu, -apple-system, BlinkMacSystemFont, Roboto,
            'Open Sans', 'Helvetica Neue', 'Lucida Sans', sans-serif;
    }

    html {
        overflow: hidden;

        /*
         * HACK
         * Prevents Chrome from going backward/forward in page history on wheel event.
         *
         * TODO
         * Apply it dinamically.
         */
        overscroll-behavior-x: contain;
    }
`;


export const StyledView: any = styled.div`
    height: 100%;
    width: 100%;
    position: relative;

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
        if (props.transformMode) {
            return 'none';
        }
        return 'initial';
    }};
    touch-action: ${(props: any) => {
        if (props.transformMode) {
            return 'none !important';
        }
        return 'initial !important';
    }};
    -webkit-user-drag: ${(props: any) => {
        if (props.transformMode) {
            return 'none';
        }
        return 'initial';
    }};
    -webkit-tap-highlight-color: ${(props: any) => {
        if (props.transformMode) {
            return 'rgba(0, 0, 0, 0)';
        }
        return 'initial';
    }};
`;
