// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DELOOK,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const delook: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DELOOK,

    baseColor: 'hsl(266, 66%, 28%)',
    baseColorInverted: 'hsl(266, 66%, 72%)',

    backgroundColorDark: 'hsl(266, 66%, 10%)',
    backgroundColorBright: 'hsl(266, 66%, 90%)',

    backgroundColorPrimary: 'hsl(266, 66%, 28%)',
    backgroundColorPrimaryAlpha: 'hsla(266, 66%, 28%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(266, 66%, 72%)',

    backgroundColorSecondary: 'hsl(266, 66%, 34%)',
    backgroundColorSecondaryAlpha: 'hsla(266, 66%, 34%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(266, 66%, 66%)',

    backgroundColorTertiary: 'hsl(266, 66%, 44%)',
    backgroundColorTertiaryAlpha: 'hsla(266, 66%, 44%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(266, 66%, 56%)',

    backgroundColorQuaternary: 'hsl(266, 66%, 55%)',
    backgroundColorQuaternaryAlpha: 'hsla(266, 66%, 55%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(266, 66%, 45%)',

    colorPrimary: 'hsl(266, 66%, 97%)',
    colorPrimaryInverted: 'hsl(266, 66%, 3%)',

    colorSecondary: 'hsl(266, 66%, 77%)',
    colorSecondaryInverted: 'hsl(266, 66%, 23%)',

    colorTertiary: 'hsl(266, 66%, 67%)',
    colorTertiaryInverted: 'hsl(266, 66%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(266, 66%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(266, 66%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(266, 66%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(266, 66%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(266, 66%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(266, 66%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(266, 66%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(266, 66%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(266, 66%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default delook;
// #endregion exports
