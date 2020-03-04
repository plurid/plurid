import { createGlobalStyle } from 'styled-components';

import {
    Theme,
} from '@plurid/plurid-themes';



interface IGlobalStyle {
    theme: Theme;
}

export const GlobalStyle = createGlobalStyle`
    *, *::after, *::before {
        box-sizing: border-box;
    }

    html {
        height: 100%;
    }

    body {
        height: 100%;
        overflow: hidden;
        margin: 0;
        padding: 0;
        font-family: 'Ubuntu', 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
            'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: white;
        background: ${(props: IGlobalStyle) => {
            return props.theme.backgroundColorPrimary;
        }};
    }

    #root {
        height: 100%;
        overflow: hidden;
        display: grid;
        align-items: center;
    }
`;
