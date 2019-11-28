import styled, { createGlobalStyle } from 'styled-components';



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
    }
`;


export const StyledView: any = styled.div`
    height: 100%;
    width: 100%;
    position: relative;

    user-select: ${(props: any) => {
        if (props.lockMode) {
            return 'none';
        }
        return 'initial';
    }};
    -webkit-user-drag: ${(props: any) => {
        if (props.lockMode) {
            return 'none';
        }
        return 'initial';
    }};
    -webkit-tap-highlight-color: ${(props: any) => {
        if (props.lockMode) {
            return 'rgba(0, 0, 0, 0)';
        }
        return 'initial';
    }};
`;
