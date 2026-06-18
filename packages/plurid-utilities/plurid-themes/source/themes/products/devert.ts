// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DEVERT,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const devert: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DEVERT,

    baseColor: 'hsl(292, 76%, 24%)',
    baseColorInverted: 'hsl(292, 76%, 76%)',

    backgroundColorDark: 'hsl(292, 76%, 10%)',
    backgroundColorBright: 'hsl(292, 76%, 90%)',

    backgroundColorPrimary: 'hsl(292, 76%, 24%)',
    backgroundColorPrimaryAlpha: 'hsla(292, 76%, 24%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(292, 76%, 76%)',

    backgroundColorSecondary: 'hsl(292, 76%, 39%)',
    backgroundColorSecondaryAlpha: 'hsla(292, 76%, 39%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(292, 76%, 61%)',

    backgroundColorTertiary: 'hsl(292, 76%, 29%)',
    backgroundColorTertiaryAlpha: 'hsla(292, 76%, 29%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(292, 76%, 71%)',

    backgroundColorQuaternary: 'hsl(292, 76%, 19%)',
    backgroundColorQuaternaryAlpha: 'hsla(292, 76%, 19%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(292, 76%, 76%)',

    colorPrimary: 'hsl(292, 7%, 97%)',
    colorPrimaryInverted: 'hsl(292, 7%, 3%)',

    colorSecondary: 'hsl(292, 7%, 77%)',
    colorSecondaryInverted: 'hsl(292, 7%, 23%)',

    colorTertiary: 'hsl(292, 7%, 67%)',
    colorTertiaryInverted: 'hsl(292, 7%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(292, 76%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(292, 76%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(292, 76%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(292, 76%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(292, 76%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(292, 76%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(292, 76%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(292, 76%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(292, 76%, 10%, 0.9)',

    ...fontFamily,
};
// #endregion module



// #region exports
export default devert;
// #endregion exports
