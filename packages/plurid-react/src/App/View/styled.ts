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



export const StyledView = styled.div`
    height: 100%;
    width: 100%;
`;
