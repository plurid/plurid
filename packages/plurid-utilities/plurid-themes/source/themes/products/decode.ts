// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DECODE,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const decode: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DECODE,

    baseColor: 'hsl(206, 85%, 15%)',
    baseColorInverted: 'hsl(206, 85%, 85%)',

    backgroundColorDark: 'hsl(206, 85%, 10%)',
    backgroundColorBright: 'hsl(206, 85%, 90%)',

    backgroundColorPrimary: 'hsl(206, 85%, 15%)',
    backgroundColorPrimaryAlpha: 'hsla(206, 85%, 15%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(206, 85%, 85%)',

    backgroundColorSecondary: 'hsl(206, 85%, 25%)',
    backgroundColorSecondaryAlpha: 'hsla(206, 85%, 25%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(206, 85%, 75%)',

    backgroundColorTertiary: 'hsl(206, 85%, 35%)',
    backgroundColorTertiaryAlpha: 'hsla(206, 85%, 35%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(206, 85%, 75%)',

    backgroundColorQuaternary: 'hsl(206, 85%, 45%)',
    backgroundColorQuaternaryAlpha: 'hsla(206, 85%, 45%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(206, 85%, 55%)',

    colorPrimary: 'hsl(206, 85%, 97%)',
    colorPrimaryInverted: 'hsl(206, 85%, 3%)',

    colorSecondary: 'hsl(206, 85%, 77%)',
    colorSecondaryInverted: 'hsl(206, 85%, 23%)',

    colorTertiary: 'hsl(206, 85%, 67%)',
    colorTertiaryInverted: 'hsl(206, 85%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(206, 85%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(206, 85%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(206, 85%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(206, 85%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(206, 85%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(206, 85%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(206, 85%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(206, 85%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(206, 85%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default decode;
// #endregion exports
