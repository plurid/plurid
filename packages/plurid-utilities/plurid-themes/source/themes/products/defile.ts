// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DEFILE,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const defile: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DEFILE,

    baseColor: 'hsl(280, 73%, 23%)',
    baseColorInverted: 'hsl(280, 73%, 77%)',

    backgroundColorDark: 'hsl(280, 73%, 10%)',
    backgroundColorBright: 'hsl(280, 73%, 90%)',

    backgroundColorPrimary: 'hsl(280, 73%, 23%)',
    backgroundColorPrimaryAlpha: 'hsla(280, 73%, 23%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(280, 73%, 77%)',

    backgroundColorSecondary: 'hsl(280, 73%, 34%)',
    backgroundColorSecondaryAlpha: 'hsla(280, 73%, 34%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(280, 73%, 66%)',

    backgroundColorTertiary: 'hsl(280, 73%, 44%)',
    backgroundColorTertiaryAlpha: 'hsla(280, 73%, 44%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(280, 73%, 56%)',

    backgroundColorQuaternary: 'hsl(280, 73%, 55%)',
    backgroundColorQuaternaryAlpha: 'hsla(280, 73%, 55%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(280, 73%, 45%)',

    colorPrimary: 'hsl(280, 73%, 97%)',
    colorPrimaryInverted: 'hsl(280, 73%, 3%)',

    colorSecondary: 'hsl(280, 73%, 77%)',
    colorSecondaryInverted: 'hsl(280, 73%, 23%)',

    colorTertiary: 'hsl(280, 73%, 67%)',
    colorTertiaryInverted: 'hsl(280, 73%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(280, 73%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(280, 73%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(280, 73%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(280, 73%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(280, 73%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(280, 73%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(280, 73%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(280, 73%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(280, 73%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default defile;
// #endregion exports
