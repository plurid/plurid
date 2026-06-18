// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DEPACK,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const depack: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DEPACK,

    baseColor: 'hsl(170, 73%, 15%)',
    baseColorInverted: 'hsl(170, 73%, 85%)',

    backgroundColorDark: 'hsl(170, 73%, 10%)',
    backgroundColorBright: 'hsl(170, 73%, 90%)',

    backgroundColorPrimary: 'hsl(170, 73%, 15%)',
    backgroundColorPrimaryAlpha: 'hsla(170, 73%, 15%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(170, 73%, 85%)',

    backgroundColorSecondary: 'hsl(170, 73%, 25%)',
    backgroundColorSecondaryAlpha: 'hsla(170, 73%, 25%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(170, 73%, 75%)',

    backgroundColorTertiary: 'hsl(170, 73%, 35%)',
    backgroundColorTertiaryAlpha: 'hsla(170, 73%, 35%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(170, 73%, 75%)',

    backgroundColorQuaternary: 'hsl(170, 73%, 45%)',
    backgroundColorQuaternaryAlpha: 'hsla(170, 73%, 45%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(170, 73%, 55%)',

    colorPrimary: 'hsl(170, 73%, 97%)',
    colorPrimaryInverted: 'hsl(170, 73%, 3%)',

    colorSecondary: 'hsl(170, 73%, 77%)',
    colorSecondaryInverted: 'hsl(170, 73%, 23%)',

    colorTertiary: 'hsl(170, 73%, 67%)',
    colorTertiaryInverted: 'hsl(170, 73%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(170, 73%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(170, 73%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(170, 73%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(170, 73%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(170, 73%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(170, 73%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(170, 73%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(170, 73%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(170, 73%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default depack;
// #endregion exports
