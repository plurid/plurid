// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DETURN,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const deturn: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DETURN,

    baseColor: 'hsl(260, 65%, 28%)',
    baseColorInverted: 'hsl(260, 65%, 72%)',

    backgroundColorDark: 'hsl(260, 65%, 10%)',
    backgroundColorBright: 'hsl(260, 65%, 90%)',

    backgroundColorPrimary: 'hsl(260, 65%, 28%)',
    backgroundColorPrimaryAlpha: 'hsla(260, 65%, 28%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(260, 65%, 72%)',

    backgroundColorSecondary: 'hsl(260, 65%, 38%)',
    backgroundColorSecondaryAlpha: 'hsla(260, 65%, 38%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(260, 65%, 62%)',

    backgroundColorTertiary: 'hsl(260, 65%, 48%)',
    backgroundColorTertiaryAlpha: 'hsla(260, 65%, 48%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(260, 65%, 52%)',

    backgroundColorQuaternary: 'hsl(260, 65%, 58%)',
    backgroundColorQuaternaryAlpha: 'hsla(260, 65%, 58%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(260, 65%, 42%)',

    colorPrimary: 'hsl(260, 65%, 97%)',
    colorPrimaryInverted: 'hsl(260, 65%, 3%)',

    colorSecondary: 'hsl(260, 65%, 65%)',
    colorSecondaryInverted: 'hsl(260, 65%, 23%)',

    colorTertiary: 'hsl(260, 65%, 67%)',
    colorTertiaryInverted: 'hsl(260, 65%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(260, 65%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(260, 65%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(260, 65%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(260, 65%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(260, 65%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(260, 65%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(260, 65%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(260, 65%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(260, 65%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default deturn;
// #endregion exports
