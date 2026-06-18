// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DETIME,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const detime: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DETIME,

    baseColor: 'hsl(199, 87%, 25%)',
    baseColorInverted: 'hsl(199, 87%, 75%)',

    backgroundColorDark: 'hsl(199, 87%, 10%)',
    backgroundColorBright: 'hsl(199, 87%, 90%)',

    backgroundColorPrimary: 'hsl(199, 87%, 25%)',
    backgroundColorPrimaryAlpha: 'hsla(199, 87%, 25%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(199, 87%, 75%)',

    backgroundColorSecondary: 'hsl(199, 87%, 35%)',
    backgroundColorSecondaryAlpha: 'hsla(199, 87%, 35%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(199, 87%, 65%)',

    backgroundColorTertiary: 'hsl(199, 87%, 45%)',
    backgroundColorTertiaryAlpha: 'hsla(199, 87%, 45%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(199, 87%, 55%)',

    backgroundColorQuaternary: 'hsl(199, 87%, 55%)',
    backgroundColorQuaternaryAlpha: 'hsla(199, 87%, 55%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(199, 87%, 45%)',

    colorPrimary: 'hsl(199, 87%, 97%)',
    colorPrimaryInverted: 'hsl(199, 87%, 3%)',

    colorSecondary: 'hsl(199, 87%, 77%)',
    colorSecondaryInverted: 'hsl(199, 87%, 23%)',

    colorTertiary: 'hsl(199, 87%, 67%)',
    colorTertiaryInverted: 'hsl(199, 87%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(199, 87%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(199, 87%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(199, 87%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(199, 87%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(199, 87%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(199, 87%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(199, 87%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(199, 87%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(199, 87%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default detime;
// #endregion exports
