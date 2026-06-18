// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DESITE,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const desite: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DESITE,

    baseColor: 'hsl(218, 30%, 22%)',
    baseColorInverted: 'hsl(218, 30%, 88%)',

    backgroundColorDark: 'hsl(218, 30%, 10%)',
    backgroundColorBright: 'hsl(218, 30%, 90%)',

    backgroundColorPrimary: 'hsl(218, 30%, 22%)',
    backgroundColorPrimaryAlpha: 'hsla(218, 30%, 22%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(218, 30%, 88%)',

    backgroundColorSecondary: 'hsl(218, 30%, 32%)',
    backgroundColorSecondaryAlpha: 'hsla(218, 30%, 32%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(218, 30%, 68%)',

    backgroundColorTertiary: 'hsl(218, 30%, 42%)',
    backgroundColorTertiaryAlpha: 'hsla(218, 30%, 42%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(218, 30%, 58%)',

    backgroundColorQuaternary: 'hsl(218, 30%, 52%)',
    backgroundColorQuaternaryAlpha: 'hsla(218, 30%, 52%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(218, 30%, 48%)',

    colorPrimary: 'hsl(218, 30%, 97%)',
    colorPrimaryInverted: 'hsl(218, 30%, 3%)',

    colorSecondary: 'hsl(218, 30%, 77%)',
    colorSecondaryInverted: 'hsl(218, 30%, 23%)',

    colorTertiary: 'hsl(218, 30%, 67%)',
    colorTertiaryInverted: 'hsl(218, 30%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(218, 30%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(218, 30%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(218, 30%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(218, 30%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(218, 30%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(218, 30%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(218, 30%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(218, 30%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(218, 30%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default desite;
// #endregion exports
