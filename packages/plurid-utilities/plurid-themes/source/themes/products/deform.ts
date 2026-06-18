// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DEFORM,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const deform: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DEFORM,

    baseColor: 'hsl(141, 83%, 24%)',
    baseColorInverted: 'hsl(141, 83%, 76%)',

    backgroundColorDark: 'hsl(141, 83%, 10%)',
    backgroundColorBright: 'hsl(141, 83%, 90%)',

    backgroundColorPrimary: 'hsl(141, 83%, 24%)',
    backgroundColorPrimaryAlpha: 'hsla(141, 83%, 24%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(141, 83%, 76%)',

    backgroundColorSecondary: 'hsl(141, 83%, 34%)',
    backgroundColorSecondaryAlpha: 'hsla(141, 83%, 34%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(141, 83%, 66%)',

    backgroundColorTertiary: 'hsl(141, 83%, 44%)',
    backgroundColorTertiaryAlpha: 'hsla(141, 83%, 44%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(141, 83%, 56%)',

    backgroundColorQuaternary: 'hsl(141, 83%, 55%)',
    backgroundColorQuaternaryAlpha: 'hsla(141, 83%, 55%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(141, 83%, 45%)',

    colorPrimary: 'hsl(141, 83%, 97%)',
    colorPrimaryInverted: 'hsl(141, 83%, 3%)',

    colorSecondary: 'hsl(141, 83%, 77%)',
    colorSecondaryInverted: 'hsl(141, 83%, 23%)',

    colorTertiary: 'hsl(141, 83%, 67%)',
    colorTertiaryInverted: 'hsl(141, 83%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(141, 83%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(141, 83%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(141, 83%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(141, 83%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(141, 83%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(141, 83%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(141, 83%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(141, 83%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(141, 83%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default deform;
// #endregion exports
