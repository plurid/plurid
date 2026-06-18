// #region imports
    // #region libraries
    import {
        createGlobalStyle,
    } from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IGlobalStyles {
    theme: Theme;
}

const GlobalStyles = createGlobalStyle<IGlobalStyles>`
    *, *::after, *::before {
        box-sizing: border-box;
    }

    html {
        height: 100%;
        min-height: 100vh;
    }

    body {
        font-family: ${
            ({
                theme,
            }: IGlobalStyles) => theme.fontFamilySansSerif
        };

        height: 100%;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;

        color: ${
            ({
                theme,
            }: IGlobalStyles) => {
                if (theme.type === 'dark') {
                    return theme.backgroundColorBright;
                }

                return theme.colorPrimary;
            }
        };
        background: ${
            ({
                theme,
            }: IGlobalStyles) => {
                if (theme.type === 'dark') {
                    return theme.backgroundColorDark;
                }

                return theme.backgroundColorPrimary;
            }
        };
    }
`;
// #endregion module



// #region exports
export default GlobalStyles;
// #endregion exports
