// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DEVIEW,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const deview: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DEVIEW,

    baseColor: 'hsl(91, 81%, 24%)',
    baseColorInverted: 'hsl(91, 81%, 76%)',

    backgroundColorDark: 'hsl(91, 81%, 10%)',
    backgroundColorBright: 'hsl(91, 81%, 90%)',

    backgroundColorPrimary: 'hsl(91, 81%, 24%)',
    backgroundColorPrimaryAlpha: 'hsla(91, 81%, 24%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(91, 81%, 76%)',

    backgroundColorSecondary: 'hsl(91, 81%, 29%)',
    backgroundColorSecondaryAlpha: 'hsla(91, 81%, 29%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(91, 81%, 71%)',

    backgroundColorTertiary: 'hsl(91, 81%, 39%)',
    backgroundColorTertiaryAlpha: 'hsla(91, 81%, 39%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(91, 81%, 61%)',

    backgroundColorQuaternary: 'hsl(91, 81%, 47%)',
    backgroundColorQuaternaryAlpha: 'hsla(91, 81%, 47%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(91, 81%, 53%)',

    colorPrimary: 'hsl(91, 7%, 97%)',
    colorPrimaryInverted: 'hsl(91, 7%, 3%)',

    colorSecondary: 'hsl(91, 7%, 77%)',
    colorSecondaryInverted: 'hsl(91, 7%, 23%)',

    colorTertiary: 'hsl(91, 7%, 67%)',
    colorTertiaryInverted: 'hsl(91, 7%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(91, 81%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(91, 81%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(91, 81%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(91, 81%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(91, 81%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(91, 81%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(91, 81%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(91, 81%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(91, 81%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default deview;
// #endregion exports
