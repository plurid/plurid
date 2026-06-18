// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DETUNE,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const detune: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DETUNE,

    baseColor: 'hsl(29, 89%, 25%)',
    baseColorInverted: 'hsl(29, 89%, 75%)',

    backgroundColorDark: 'hsl(29, 89%, 10%)',
    backgroundColorBright: 'hsl(29, 89%, 90%)',

    backgroundColorPrimary: 'hsl(29, 89%, 25%)',
    backgroundColorPrimaryAlpha: 'hsla(29, 89%, 25%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(29, 89%, 75%)',

    backgroundColorSecondary: 'hsl(29, 89%, 35%)',
    backgroundColorSecondaryAlpha: 'hsla(29, 89%, 35%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(29, 89%, 65%)',

    backgroundColorTertiary: 'hsl(29, 89%, 45%)',
    backgroundColorTertiaryAlpha: 'hsla(29, 89%, 45%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(29, 89%, 55%)',

    backgroundColorQuaternary: 'hsl(29, 89%, 55%)',
    backgroundColorQuaternaryAlpha: 'hsla(29, 89%, 55%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(29, 89%, 45%)',

    colorPrimary: 'hsl(29, 89%, 97%)',
    colorPrimaryInverted: 'hsl(29, 89%, 3%)',

    colorSecondary: 'hsl(29, 89%, 77%)',
    colorSecondaryInverted: 'hsl(29, 89%, 23%)',

    colorTertiary: 'hsl(29, 89%, 67%)',
    colorTertiaryInverted: 'hsl(29, 89%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(29, 89%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(29, 89%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(29, 89%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(29, 89%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(29, 89%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(29, 89%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(29, 89%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(29, 89%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(29, 89%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default detune;
// #endregion exports
