// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DEVEIL,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const deveil: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DEVEIL,

    baseColor: 'hsl(240, 73%, 20%)',
    baseColorInverted: 'hsl(240, 73%, 80%)',

    backgroundColorDark: 'hsl(240, 73%, 10%)',
    backgroundColorBright: 'hsl(240, 73%, 90%)',

    backgroundColorPrimary: 'hsl(240, 73%, 20%)',
    backgroundColorPrimaryAlpha: 'hsla(240, 73%, 32%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(240, 73%, 80%)',

    backgroundColorSecondary: 'hsl(240, 73%, 32%)',
    backgroundColorSecondaryAlpha: 'hsla(240, 73%, 32%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(240, 73%, 68%)',

    backgroundColorTertiary: 'hsl(240, 73%, 44%)',
    backgroundColorTertiaryAlpha: 'hsla(240, 73%, 44%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(240, 73%, 56%)',

    backgroundColorQuaternary: 'hsl(240, 73%, 55%)',
    backgroundColorQuaternaryAlpha: 'hsla(240, 73%, 55%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(240, 73%, 45%)',

    colorPrimary: 'hsl(240, 73%, 97%)',
    colorPrimaryInverted: 'hsl(240, 73%, 3%)',

    colorSecondary: 'hsl(240, 73%, 77%)',
    colorSecondaryInverted: 'hsl(240, 73%, 23%)',

    colorTertiary: 'hsl(240, 73%, 67%)',
    colorTertiaryInverted: 'hsl(240, 73%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(240, 73%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(240, 73%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(240, 73%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(240, 73%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(240, 73%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(240, 73%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(240, 73%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(240, 73%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(240, 73%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default deveil;
// #endregion exports
