// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DENOTE,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const denote: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DENOTE,

    baseColor: 'hsl(259, 59%, 15%)',
    baseColorInverted: 'hsl(259, 59%, 85%)',

    backgroundColorDark: 'hsl(259, 59%, 10%)',
    backgroundColorBright: 'hsl(259, 59%, 90%)',

    backgroundColorPrimary: 'hsl(259, 59%, 15%)',
    backgroundColorPrimaryAlpha: 'hsla(259, 59%, 15%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(259, 59%, 85%)',

    backgroundColorSecondary: 'hsl(259, 59%, 25%)',
    backgroundColorSecondaryAlpha: 'hsla(259, 59%, 25%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(259, 59%, 75%)',

    backgroundColorTertiary: 'hsl(259, 59%, 35%)',
    backgroundColorTertiaryAlpha: 'hsla(259, 59%, 35%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(259, 59%, 75%)',

    backgroundColorQuaternary: 'hsl(259, 59%, 45%)',
    backgroundColorQuaternaryAlpha: 'hsla(259, 59%, 45%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(259, 59%, 55%)',

    colorPrimary: 'hsl(259, 59%, 97%)',
    colorPrimaryInverted: 'hsl(259, 59%, 3%)',

    colorSecondary: 'hsl(259, 59%, 77%)',
    colorSecondaryInverted: 'hsl(259, 59%, 23%)',

    colorTertiary: 'hsl(259, 59%, 67%)',
    colorTertiaryInverted: 'hsl(259, 59%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(259, 59%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(259, 59%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(259, 59%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(259, 59%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(259, 59%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(259, 59%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(259, 59%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(259, 59%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(259, 59%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default denote;
// #endregion exports
