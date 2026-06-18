// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_FUROR,
        THEME_TYPE_BRIGHT,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const furor: Theme = {
    type: THEME_TYPE_BRIGHT,
    name: THEME_NAME_FUROR,

    baseColor: 'hsl(360, 90%, 30%)',
    baseColorInverted: 'hsl(360, 90%, 70%)',

    backgroundColorDark: 'hsl(360, 90%, 10%)',
    backgroundColorBright: 'hsl(360, 90%, 90%)',

    backgroundColorPrimary: 'hsl(360, 90%, 30%)',
    backgroundColorPrimaryAlpha: 'hsla(360, 90%, 30%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(360, 90%, 70%)',

    backgroundColorSecondary: 'hsl(360, 90%, 25%)',
    backgroundColorSecondaryAlpha: 'hsla(360, 90%, 25%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(360, 90%, 75%)',

    backgroundColorTertiary: 'hsl(360, 90%, 20%)',
    backgroundColorTertiaryAlpha: 'hsla(360, 90%, 20%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(360, 90%, 80%)',

    backgroundColorQuaternary: 'hsl(360, 90%, 15%)',
    backgroundColorQuaternaryAlpha: 'hsla(360, 90%, 15%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(360, 90%, 85%)',

    colorPrimary: 'hsl(360, 90%, 97%)',
    colorPrimaryInverted: 'hsl(360, 90%, 3%)',

    colorSecondary: 'hsl(360, 90%, 80%)',
    colorSecondaryInverted: 'hsl(360, 90%, 20%)',

    colorTertiary: 'hsl(360, 90%, 60%)',
    colorTertiaryInverted: 'hsl(360, 90%, 40%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(360, 90%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(360, 90%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(360, 90%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(360, 90%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(360, 90%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(360, 90%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(360, 90%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(360, 90%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(360, 90%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default furor;
// #endregion exports
