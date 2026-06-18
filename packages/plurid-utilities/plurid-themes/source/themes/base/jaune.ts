// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_JAUNE,
        THEME_TYPE_BRIGHT,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const jaune: Theme = {
    type: THEME_TYPE_BRIGHT,
    name: THEME_NAME_JAUNE,

    baseColor: 'hsl(35, 90%, 45%)',
    baseColorInverted: 'hsl(35, 90%, 55%)',

    backgroundColorDark: 'hsl(35, 90%, 10%)',
    backgroundColorBright: 'hsl(35, 90%, 90%)',

    backgroundColorPrimary: 'hsl(35, 90%, 45%)',
    backgroundColorPrimaryAlpha: 'hsla(35, 90%, 45%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(35, 90%, 55%)',

    backgroundColorSecondary: 'hsl(35, 90%, 35%)',
    backgroundColorSecondaryAlpha: 'hsla(35, 90%, 35%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(35, 90%, 65%)',

    backgroundColorTertiary: 'hsl(35, 90%, 30%)',
    backgroundColorTertiaryAlpha: 'hsla(35, 90%, 30%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(35, 90%, 70%)',

    backgroundColorQuaternary: 'hsl(35, 90%, 25%)',
    backgroundColorQuaternaryAlpha: 'hsla(35, 90%, 25%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(35, 90%, 75%)',

    colorPrimary: 'hsl(35, 90%, 97%)',
    colorPrimaryInverted: 'hsl(35, 90%, 3%)',

    colorSecondary: 'hsl(35, 90%, 80%)',
    colorSecondaryInverted: 'hsl(35, 90%, 20%)',

    colorTertiary: 'hsl(35, 90%, 60%)',
    colorTertiaryInverted: 'hsl(35, 90%, 40%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(35, 90%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(35, 90%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(35, 90%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(35, 90%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(35, 90%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(35, 90%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(35, 90%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(35, 90%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(35, 90%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default jaune;
// #endregion exports
